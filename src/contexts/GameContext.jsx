import { createContext, useContext, useReducer, useEffect } from 'react'
import { realtimeDb, auth } from '../firebase'
import { ref, onValue, set, update, off } from 'firebase/database'
import { GAME_STATES } from '../utils/gameConstants'
import { 
  generateDeck, 
  shuffleDeck, 
  determineHandWinner, 
  determineGameWinner 
} from '../utils/gameUtils'

const GameContext = createContext()

// Initial game state
const initialState = {
  gameId: 'main-room',
  players: {},
  currentPlayer: null,
  gameState: GAME_STATES.WAITING,
  trumpSuit: null,
  trumpSelector: null,
  currentHand: [],
  currentTurn: 0,
  leadSuit: null,
  handNumber: 0,
  deck: [],
  scores: {},
  winner: null,
  isConnected: false
}

// Game reducer
function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYERS':
      return { ...state, players: action.payload }
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload }
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload }
    case 'SET_TRUMP_SUIT':
      return { ...state, trumpSuit: action.payload }
    case 'SET_TRUMP_SELECTOR':
      return { ...state, trumpSelector: action.payload }
    case 'SET_CURRENT_HAND':
      return { ...state, currentHand: action.payload }
    case 'SET_CURRENT_TURN':
      return { ...state, currentTurn: action.payload }
    case 'SET_LEAD_SUIT':
      return { ...state, leadSuit: action.payload }
    case 'SET_HAND_NUMBER':
      return { ...state, handNumber: action.payload }
    case 'SET_SCORES':
      return { ...state, scores: action.payload }
    case 'SET_WINNER':
      return { ...state, winner: action.payload }
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload }
    case 'RESET_GAME':
      return { ...initialState, gameId: state.gameId, currentPlayer: state.currentPlayer }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    if (!auth.currentUser) return

    const gameRef = ref(realtimeDb, `games/${state.gameId}`)
    
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        dispatch({ type: 'SET_PLAYERS', payload: data.players || {} })
        dispatch({ type: 'SET_GAME_STATE', payload: data.gameState || GAME_STATES.WAITING })
        dispatch({ type: 'SET_TRUMP_SUIT', payload: data.trumpSuit })
        dispatch({ type: 'SET_TRUMP_SELECTOR', payload: data.trumpSelector })
        dispatch({ type: 'SET_CURRENT_HAND', payload: data.currentHand || [] })
        dispatch({ type: 'SET_CURRENT_TURN', payload: data.currentTurn || 0 })
        dispatch({ type: 'SET_LEAD_SUIT', payload: data.leadSuit })
        dispatch({ type: 'SET_HAND_NUMBER', payload: data.handNumber || 0 })
        dispatch({ type: 'SET_SCORES', payload: data.scores || {} })
        dispatch({ type: 'SET_WINNER', payload: data.winner })
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })
      }
    })

    return () => {
      off(gameRef)
      unsubscribe()
    }
  }, [state.gameId, auth.currentUser])

  // Join game
  const joinGame = async (player) => {
    if (!auth.currentUser) return

    const playerRef = ref(realtimeDb, `games/${state.gameId}/players/${auth.currentUser.uid}`)
    await set(playerRef, {
      id: auth.currentUser.uid,
      name: player.name,
      email: player.email,
      avatar: player.avatar,
      cards: [],
      handsWon: 0,
      isReady: false,
      joinedAt: Date.now()
    })

    dispatch({ type: 'SET_CURRENT_PLAYER', payload: player })
  }

  // Update player ready status
  const updatePlayerReady = async (ready) => {
    if (!auth.currentUser) return

    const playerRef = ref(realtimeDb, `games/${state.gameId}/players/${auth.currentUser.uid}/isReady`)
    await set(playerRef, ready)
  }

  // Start game (deal initial cards)
  const startGame = async () => {
    if (Object.keys(state.players).length !== 4) return

    const deck = generateDeck()
    const shuffledDeck = shuffleDeck(deck)
    
    // Deal 5 cards to each player initially
    const playerIds = Object.keys(state.players)
    const updatedPlayers = {}
    
    playerIds.forEach((playerId, index) => {
      const playerCards = shuffledDeck.slice(index * 5, (index + 1) * 5)
      updatedPlayers[playerId] = {
        ...state.players[playerId],
        cards: playerCards,
        handsWon: 0
      }
    })

    // Store remaining deck for later dealing
    const remainingDeck = shuffledDeck.slice(20)
    
    // Choose trump selector (first player)
    const trumpSelector = playerIds[0]

    await update(ref(realtimeDb, `games/${state.gameId}`), {
      players: updatedPlayers,
      gameState: GAME_STATES.TRUMP_SELECTION,
      trumpSelector,
      deck: remainingDeck,
      currentTurn: 0,
      handNumber: 0,
      scores: playerIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
    })
  }

  // Select trump suit
  const selectTrump = async (suit) => {
    if (!auth.currentUser || state.trumpSelector !== auth.currentUser.uid) return

    // Deal remaining 8 cards to each player
    const playerIds = Object.keys(state.players)
    const updatedPlayers = {}
    const remainingDeck = state.deck || []
    
    playerIds.forEach((playerId, index) => {
      const additionalCards = remainingDeck.slice(index * 8, (index + 1) * 8)
      updatedPlayers[playerId] = {
        ...state.players[playerId],
        cards: [...(state.players[playerId].cards || []), ...additionalCards]
      }
    })

    await update(ref(realtimeDb, `games/${state.gameId}`), {
      players: updatedPlayers,
      gameState: GAME_STATES.PLAYING,
      trumpSuit: suit,
      currentTurn: 0,
      currentHand: [],
      leadSuit: null
    })
  }

  // Play a card
  const playCard = async (card) => {
    if (!auth.currentUser) return

    const playerIndex = Object.keys(state.players).indexOf(auth.currentUser.uid)
    if (playerIndex !== state.currentTurn) return

    // Remove card from player's hand
    const updatedPlayer = {
      ...state.players[auth.currentUser.uid],
      cards: state.players[auth.currentUser.uid].cards.filter(c => 
        !(c.suit === card.suit && c.value === card.value)
      )
    }

    const updatedPlayers = {
      ...state.players,
      [auth.currentUser.uid]: updatedPlayer
    }

    const newHand = [...state.currentHand, { ...card, playerId: auth.currentUser.uid }]
    const newLeadSuit = state.currentHand.length === 0 ? card.suit : state.leadSuit
    const nextTurn = (state.currentTurn + 1) % 4

    await update(ref(realtimeDb, `games/${state.gameId}`), {
      players: updatedPlayers,
      currentHand: newHand,
      leadSuit: newLeadSuit,
      currentTurn: nextTurn
    })

    // Check if hand is complete
    if (newHand.length === 4) {
      setTimeout(() => completeHand(newHand), 2000) // Wait 2 seconds to show the complete hand
    }
  }

  // Complete a hand and determine winner
  const completeHand = async (hand) => {
    const winner = determineHandWinner(hand, state.leadSuit, state.trumpSuit)
    const winnerIndex = Object.keys(state.players).indexOf(winner.playerId)
    
    // Update scores
    const updatedPlayers = {
      ...state.players,
      [winner.playerId]: {
        ...state.players[winner.playerId],
        handsWon: (state.players[winner.playerId].handsWon || 0) + 1
      }
    }

    const newHandNumber = state.handNumber + 1
    const isGameComplete = newHandNumber >= 13

    await update(ref(realtimeDb, `games/${state.gameId}`), {
      players: updatedPlayers,
      gameState: isGameComplete ? GAME_STATES.GAME_COMPLETE : GAME_STATES.PLAYING,
      currentHand: [],
      leadSuit: null,
      currentTurn: winnerIndex,
      handNumber: newHandNumber,
      winner: isGameComplete ? determineGameWinner(updatedPlayers) : null
    })
  }

  const value = {
    ...state,
    joinGame,
    updatePlayerReady,
    startGame,
    selectTrump,
    playCard
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { realtimeDb } from '../../firebase'
import { ref, set, update } from 'firebase/database'
import { GAME_STATES } from '../../utils/gameConstants'
import { 
  generateDeck, 
  shuffleDeck, 
  determineHandWinner, 
  determineGameWinner 
} from '../../utils/gameUtils'

// Async thunks for Firebase operations
export const joinGame = createAsyncThunk(
  'game/joinGame',
  async ({ gameId, player }, { rejectWithValue }) => {
    try {
      const playerRef = ref(realtimeDb, `games/${gameId}/players/${player.id}`)
      await set(playerRef, {
        id: player.id,
        name: player.name,
        email: player.email,
        avatar: player.avatar,
        cards: [],
        handsWon: 0,
        isReady: false,
        joinedAt: Date.now()
      })
      return { gameId, player }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updatePlayerReady = createAsyncThunk(
  'game/updatePlayerReady',
  async ({ gameId, playerId, ready }, { rejectWithValue }) => {
    try {
      const playerRef = ref(realtimeDb, `games/${gameId}/players/${playerId}/isReady`)
      await set(playerRef, ready)
      return { playerId, ready }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const startGame = createAsyncThunk(
  'game/startGame',
  async ({ gameId, players }, { rejectWithValue }) => {
    try {
      if (Object.keys(players).length !== 4) {
        throw new Error('Need exactly 4 players to start')
      }

      const deck = generateDeck()
      const shuffledDeck = shuffleDeck(deck)
      
      // Deal 5 cards to each player initially
      const playerIds = Object.keys(players)
      const updatedPlayers = {}
      
      playerIds.forEach((playerId, index) => {
        const playerCards = shuffledDeck.slice(index * 5, (index + 1) * 5)
        updatedPlayers[playerId] = {
          ...players[playerId],
          cards: playerCards,
          handsWon: 0
        }
      })

      // Store remaining deck for later dealing
      const remainingDeck = shuffledDeck.slice(20)
      
      // Choose trump selector (first player)
      const trumpSelector = playerIds[0]

      const gameUpdate = {
        players: updatedPlayers,
        gameState: GAME_STATES.TRUMP_SELECTION,
        trumpSelector,
        deck: remainingDeck,
        currentTurn: 0,
        handNumber: 0,
        scores: playerIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
      }

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate)
      return gameUpdate
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const selectTrump = createAsyncThunk(
  'game/selectTrump',
  async ({ gameId, suit, players, deck }, { rejectWithValue }) => {
    try {
      // Deal remaining 8 cards to each player
      const playerIds = Object.keys(players)
      const updatedPlayers = {}
      
      playerIds.forEach((playerId, index) => {
        const additionalCards = deck.slice(index * 8, (index + 1) * 8)
        updatedPlayers[playerId] = {
          ...players[playerId],
          cards: [...(players[playerId].cards || []), ...additionalCards]
        }
      })

      const gameUpdate = {
        players: updatedPlayers,
        gameState: GAME_STATES.PLAYING,
        trumpSuit: suit,
        currentTurn: 0,
        currentHand: [],
        leadSuit: null
      }

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate)
      return gameUpdate
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const playCard = createAsyncThunk(
  'game/playCard',
  async ({ gameId, card, playerId, players, currentHand, currentTurn, leadSuit }, { rejectWithValue, dispatch }) => {
    try {
      // Remove card from player's hand
      const updatedPlayer = {
        ...players[playerId],
        cards: players[playerId].cards.filter(c => 
          !(c.suit === card.suit && c.value === card.value)
        )
      }

      const updatedPlayers = {
        ...players,
        [playerId]: updatedPlayer
      }

      const newHand = [...currentHand, { ...card, playerId }]
      const newLeadSuit = currentHand.length === 0 ? card.suit : leadSuit
      const nextTurn = (currentTurn + 1) % 4

      const gameUpdate = {
        players: updatedPlayers,
        currentHand: newHand,
        leadSuit: newLeadSuit,
        currentTurn: nextTurn
      }

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate)

      // Check if hand is complete
      if (newHand.length === 4) {
        setTimeout(() => {
          dispatch(completeHand({ gameId, hand: newHand, leadSuit: newLeadSuit, players: updatedPlayers }))
        }, 2000)
      }

      return gameUpdate
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const completeHand = createAsyncThunk(
  'game/completeHand',
  async ({ gameId, hand, leadSuit, trumpSuit, players, handNumber }, { rejectWithValue }) => {
    try {
      const winner = determineHandWinner(hand, leadSuit, trumpSuit)
      const winnerIndex = Object.keys(players).indexOf(winner.playerId)
      
      // Update scores
      const updatedPlayers = {
        ...players,
        [winner.playerId]: {
          ...players[winner.playerId],
          handsWon: (players[winner.playerId].handsWon || 0) + 1
        }
      }

      const newHandNumber = handNumber + 1
      const isGameComplete = newHandNumber >= 13

      const gameUpdate = {
        players: updatedPlayers,
        gameState: isGameComplete ? GAME_STATES.GAME_COMPLETE : GAME_STATES.PLAYING,
        currentHand: [],
        leadSuit: null,
        currentTurn: winnerIndex,
        handNumber: newHandNumber,
        winner: isGameComplete ? determineGameWinner(updatedPlayers) : null
      }

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate)
      return gameUpdate
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
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
  isConnected: false,
  loading: false,
  error: null,
  firebaseListener: null
}

// Game slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setFirebaseData: (state, action) => {
      const data = action.payload
      if (data) {
        state.players = data.players || {}
        state.gameState = data.gameState || GAME_STATES.WAITING
        state.trumpSuit = data.trumpSuit || null
        state.trumpSelector = data.trumpSelector || null
        state.currentHand = data.currentHand || []
        state.currentTurn = data.currentTurn || 0
        state.leadSuit = data.leadSuit || null
        state.handNumber = data.handNumber || 0
        state.scores = data.scores || {}
        state.winner = data.winner || null
        state.deck = data.deck || []
        state.isConnected = true
        state.error = null
      }
    },
    setCurrentPlayer: (state, action) => {
      state.currentPlayer = action.payload
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload
    },
    setFirebaseListener: (state, action) => {
      state.firebaseListener = action.payload
    },
    resetGame: (state) => {
      return { 
        ...initialState, 
        gameId: state.gameId, 
        currentPlayer: state.currentPlayer 
      }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Join game
      .addCase(joinGame.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(joinGame.fulfilled, (state, action) => {
        state.loading = false
        state.currentPlayer = action.payload.player
        state.gameId = action.payload.gameId
      })
      .addCase(joinGame.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update player ready
      .addCase(updatePlayerReady.pending, (state) => {
        state.loading = true
      })
      .addCase(updatePlayerReady.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePlayerReady.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Start game
      .addCase(startGame.pending, (state) => {
        state.loading = true
      })
      .addCase(startGame.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(startGame.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Select trump
      .addCase(selectTrump.pending, (state) => {
        state.loading = true
      })
      .addCase(selectTrump.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(selectTrump.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Play card
      .addCase(playCard.pending, (state) => {
        state.loading = true
      })
      .addCase(playCard.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(playCard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Complete hand
      .addCase(completeHand.pending, (state) => {
        state.loading = true
      })
      .addCase(completeHand.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(completeHand.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  setFirebaseData,
  setCurrentPlayer,
  setConnectionStatus,
  setFirebaseListener,
  resetGame,
  clearError
} = gameSlice.actions

export default gameSlice.reducer

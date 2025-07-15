import { useEffect, useState } from 'react'
import { useAppDispatch, useCurrentPlayer, usePlayers, useGame, useSelectedCard, useIsMyTurn, useAuth } from '../store/hooks'
import { playCard, endGame } from '../store/slices/gameSlice'
import { setSelectedCard } from '../store/slices/uiSlice'
import { SUIT_SYMBOLS, SUIT_COLORS } from '../utils/gameConstants'
import { canPlayCard } from '../utils/gameUtils'
import Card from './Card'

function GameBoard() {
  // ===== HOOKS & STATE =====
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const currentPlayer = useCurrentPlayer()
  const players = usePlayers()
  const {
    currentHand,
    currentTurn,
    leadSuit,
    trumpSuit,
    handNumber,
    gameId
  } = useGame()
  const selectedCard = useSelectedCard()
  const isMyTurn = useIsMyTurn()
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false)
  
  // ===== COMPUTED VALUES =====
  const playersList = Object.values(players)
  const currentPlayerCards = currentPlayer?.id ? players[currentPlayer.id]?.cards || [] : []
  const currentTurnPlayer = playersList[currentTurn]

  // ===== DEBUG LOGGING =====
  console.log('=== GAME BOARD DEBUG ===')
  console.log('Auth User:', user)
  console.log('Current Player:', currentPlayer)
  console.log('Current Hand:', currentHand)
  console.log('Hand Number:', handNumber)
  console.log('Trump Suit:', trumpSuit)
  console.log('Lead Suit:', leadSuit)
  console.log('Current Turn:', currentTurn, 'Player:', currentTurnPlayer?.name)
  console.log('Players scores:')
  Object.values(players).forEach(p => {
    console.log(`  ${p.name}: ${p.handsWon || 0} tricks won, ${p.cards?.length || 0} cards remaining (ID: ${p.id})`)
  })
  console.log('Current Player Cards Count:', currentPlayerCards.length)
  console.log('Current Player Cards:', currentPlayerCards)
  console.log('========================')

  // ===== EFFECTS =====
  useEffect(() => {
    dispatch(setSelectedCard(null))
  }, [currentTurn, dispatch])

  // ===== SAFETY CHECKS =====
  if (!currentPlayer?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Player Not Found</h3>
          <p className="text-gray-600 text-sm mb-4">
            Unable to load your player data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    )
  }

  if (playersList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Players...</h3>
          <p className="text-gray-600 text-sm">
            Waiting for player data to load.
          </p>
        </div>
      </div>
    )
  }

  // ===== EVENT HANDLERS =====
  const handleCardSelect = (card) => {
    if (!isMyTurn) return
    
    const canPlay = canPlayCard(card, currentPlayerCards, leadSuit)
    if (!canPlay) return
    
    if (selectedCard?.suit === card.suit && selectedCard?.value === card.value) {
      dispatch(setSelectedCard(null))
    } else {
      dispatch(setSelectedCard(card))
    }
  }

  const handlePlayCard = async () => {
    if (selectedCard && isMyTurn) {
      dispatch(playCard({
        gameId,
        card: selectedCard,
        playerId: currentPlayer.id,
        players,
        currentHand,
        currentTurn,
        leadSuit
      }))
      dispatch(setSelectedCard(null))
    }
  }

  const handleEndGame = () => setShowEndGameConfirm(true)
  const confirmEndGame = () => {
    dispatch(endGame({ gameId }))
    setShowEndGameConfirm(false)
  }
  const cancelEndGame = () => setShowEndGameConfirm(false)

  // ===== UTILITY FUNCTIONS =====
  const getPlayerTableIndex = (playerId) => {
    // Find the player's index in the playersList
    return playersList.findIndex(player => player.id === playerId)
  }

  const getCardPosition = (playerId) => {
    const playerIndex = getPlayerTableIndex(playerId)
    const cardPositions = [
      { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }, // Bottom (player 0)
      { left: '10px', top: '50%', transform: 'translateY(-50%)' },    // Left (player 1)
      { top: '10px', left: '50%', transform: 'translateX(-50%)' },    // Top (player 2)
      { right: '10px', top: '50%', transform: 'translateY(-50%)' }    // Right (player 3)
    ]
    return cardPositions[playerIndex] || cardPositions[0]
  }

  // ===== SUB-COMPONENTS =====
  
  // Component: Player Info Area (displays other players around the table)
  const PlayerInfoArea = ({ player, index, filteredIndex }) => {
    // For 4 players, we want positions: [current, left, top, right]
    // When we filter out current player, we have 3 players that should go to: [left, top, right]
    const visiblePositions = ['left', 'top', 'right']
    const position = visiblePositions[filteredIndex]
    const isPlayerTurn = index === currentTurn

    // Debug logging
    console.log(`🎯 PlayerInfoArea - Player: ${player.name}, Original Index: ${index}, Filtered Index: ${filteredIndex}, Position: ${position}`)

    const positionClasses = {
      top: 'absolute top-20 left-1/2 transform -translate-x-1/2',
      left: 'absolute left-6 top-1/2 transform -translate-y-1/2',
      right: 'absolute right-6 top-1/2 transform -translate-y-1/2'
    }

    return (
      <div key={player.id} className={positionClasses[position]}>
        <div className={`
          bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 min-w-[100px] transition-all duration-300
          ${isPlayerTurn ? 'ring-2 ring-yellow-400 ring-opacity-75 bg-yellow-50/90' : ''}
        `}>
          <div className="flex items-center space-x-2 mb-2">
            <img
              src={player.avatar || '/default-avatar.png'}
              alt={player.name}
              className="w-6 h-6 rounded-full border"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs truncate text-gray-800">
                {player.name}
              </p>
              <p className="text-xs text-gray-500">
                {player.handsWon || 0} tricks won
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <span className="text-sm text-gray-700 font-medium">
                {player.cards?.length || 0}
              </span>
              <div className="flex">
                {/* Show mini card representations */}
                {Array.from({ length: Math.min(player.cards?.length || 0, 5) }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-3 bg-blue-600 border border-blue-700 rounded-sm -ml-0.5 first:ml-0"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
                {(player.cards?.length || 0) > 5 && (
                  <span className="text-xs text-gray-500 ml-1">+{(player.cards?.length || 0) - 5}</span>
                )}
              </div>
              {isPlayerTurn && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Component: Game Header (hand counter, trump display, turn indicator)
  const GameHeader = () => (
    <header className="pt-safe-top px-4 py-3 bg-green-900/90 backdrop-blur-sm text-white relative z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">Hand {handNumber + 1}/13</span>
          <button
            onClick={handleEndGame}
            className="ml-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-medium px-3 py-1 rounded-lg transition-all duration-200"
          >
            End Game
          </button>
        </div>
        
        {trumpSuit && (
          <div className="flex items-center space-x-2 bg-yellow-400/90 text-black px-3 py-1 rounded-full">
            <span className="text-sm font-bold">Trump:</span>
            <span className={`text-lg font-bold ${SUIT_COLORS[trumpSuit]}`}>
              {SUIT_SYMBOLS[trumpSuit]}
            </span>
          </div>
        )}
        
        <div className="text-sm">
          {isMyTurn ? '🎯 Your turn' : `${currentTurnPlayer?.name || 'Player'}'s turn`}
        </div>
      </div>
    </header>
  )

  // Component: Card Table Center (shows played cards in a circle)
  const CardTable = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-green-700/80 border-4 border-yellow-600/50 rounded-full p-8 w-80 h-80 flex items-center justify-center shadow-2xl">
          {currentHand.length > 0 ? (
            <div className="relative w-full h-full">
              {currentHand.map((handCard, index) => (
                <div 
                  key={`${handCard.suit}-${handCard.value}-${handCard.playerId}-${index}`} 
                  className="absolute flex flex-col items-center"
                  style={getCardPosition(handCard.playerId)}
                >
                  <Card card={handCard} size="md" />
                  <p className="text-xs text-yellow-200 mt-1 bg-black/50 px-2 py-1 rounded font-medium">
                    {players[handCard.playerId]?.name || 'Player'}
                  </p>
                </div>
              ))}
              
              {currentHand.length === 4 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                    🏆 Evaluating trick...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-yellow-200">
              <div className="text-6xl mb-4">🎴</div>
              <p className="text-xl font-bold mb-2">Card Table</p>
              <p className="text-sm opacity-80">Waiting for first card...</p>
              {leadSuit && (
                <p className="text-sm mt-2 bg-black/30 px-3 py-1 rounded">
                  Lead: <span className={SUIT_COLORS[leadSuit]}>{SUIT_SYMBOLS[leadSuit]}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Component: Player Hand Area (current player's cards and controls)
  const PlayerHandArea = () => {
    // If player has no cards but game is still ongoing, show a message
    if (currentPlayerCards.length === 0) {
      if (handNumber < 13) {
        return (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-red-900 to-red-800 border-t-4 border-red-600 pb-safe-bottom">
            <div className="px-4 py-6 text-center text-white">
              <div className="text-4xl mb-2">🚫</div>
              <p className="text-lg font-bold mb-2">No Cards Available</p>
              <p className="text-sm opacity-80">
                You have no cards in your hand. This might be a sync issue.
              </p>
              <p className="text-xs mt-2 opacity-60">
                Hand {handNumber + 1}/13 • Cards: {currentPlayerCards.length}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                🔄 Refresh Game
              </button>
            </div>
          </div>
        )
      }
      return null // Game complete, no cards expected
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 border-t-4 border-yellow-600 pb-safe-bottom">
        {/* Player Info Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 text-white">
          <div className="flex items-center space-x-2">
            <img
              src={currentPlayer?.avatar || '/default-avatar.png'}
              alt="You"
              className="w-6 h-6 rounded-full border-2 border-yellow-400"
            />
            <div>
              <p className="font-bold text-xs">You ({currentPlayer?.name})</p>
              <p className="text-xs text-gray-300">{currentPlayer?.handsWon || 0} tricks won</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium">{currentPlayerCards.length} cards</p>
            {isMyTurn && <p className="text-xs text-yellow-400">🎯 Your turn</p>}
          </div>
        </div>

        {/* Selected Card Action */}
        {selectedCard && (
          <div className="px-4 py-3 bg-yellow-600 text-center">
            <button
              onClick={handlePlayCard}
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg text-lg"
            >
              Play {selectedCard.value} of {selectedCard.suit} <span className={SUIT_COLORS[selectedCard.suit]}>{SUIT_SYMBOLS[selectedCard.suit]}</span>
            </button>
          </div>
        )}

        {/* Hand Cards */}
        <div className="px-2 py-4">
          <div className="flex items-center justify-center">
            <div className="relative flex items-center">
              {currentPlayerCards.map((card, index) => {
                const isPlayable = canPlayCard(card, currentPlayerCards, leadSuit)
                const isSelected = selectedCard?.suit === card.suit && selectedCard?.value === card.value
                
                // Calculate overlap offset using CSS custom properties that we'll set
                const offsetX = index * 12 // Base 12px overlap
                const selectedOffset = isSelected ? -10 : 0

                return (
                  <div 
                    key={`${card.suit}-${card.value}-${index}`} 
                    className="absolute transition-all duration-200"
                    style={{ 
                      left: `${offsetX}px`,
                      transform: `translateY(${selectedOffset}px)`,
                      zIndex: isSelected ? 20 : 10 + index
                    }}
                  >
                    <Card
                      card={card}
                      onClick={isMyTurn ? handleCardSelect : undefined}
                      isPlayable={isMyTurn && isPlayable}
                      isSelected={isSelected}
                      size="sm"
                    />
                  </div>
                )
              })}
              
              {/* Add spacer to prevent overflow */}
              <div 
                style={{ 
                  width: `${Math.max(0, (currentPlayerCards.length - 1) * 12 + 48)}px`,
                  height: '64px'
                }} 
                className="relative"
              />
            </div>
          </div>
          
          {/* Card info display */}
          {currentPlayerCards.length > 0 && (
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Your hand ({currentPlayerCards.length} cards):</div>
              <div className="flex flex-wrap justify-center gap-1 text-xs max-w-full overflow-hidden">
                {currentPlayerCards.map((card, index) => {
                  const isPlayable = canPlayCard(card, currentPlayerCards, leadSuit)
                  const isSelected = selectedCard?.suit === card.suit && selectedCard?.value === card.value
                  
                  return (
                    <span 
                      key={`info-${card.suit}-${card.value}-${index}`}
                      className={`
                        px-1.5 py-0.5 rounded text-xs transition-all duration-200 flex-shrink-0
                        ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200'}
                        ${!isPlayable ? 'opacity-50' : ''}
                        ${isMyTurn && isPlayable ? 'cursor-pointer hover:bg-gray-600' : 'cursor-default'}
                      `}
                      onClick={isMyTurn && isPlayable ? () => handleCardSelect(card) : undefined}
                    >
                      {card.value}
                      <span className={SUIT_COLORS[card.suit]}>{SUIT_SYMBOLS[card.suit]}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Turn Info */}
        <div className="px-4 pb-2 text-center">
          {isMyTurn ? (
            <p className="text-yellow-400 font-bold text-xs">🎯 Select a card to play</p>
          ) : (
            <p className="text-gray-300 text-xs">
              Waiting for {currentTurnPlayer?.name || 'player'} to play...
            </p>
          )}
          {leadSuit && currentHand.length > 0 && (
            <p className="text-gray-400 text-xs mt-1">
              Follow {leadSuit} {SUIT_SYMBOLS[leadSuit]} if possible • Trump: <span className={SUIT_COLORS[trumpSuit]}>{SUIT_SYMBOLS[trumpSuit]}</span>
            </p>
          )}
        </div>
      </div>
    )
  }

  // Component: End Game Confirmation Dialog
  const EndGameDialog = () => {
    if (!showEndGameConfirm) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">End Game?</h3>
            <p className="text-gray-600 text-sm">
              This will end the current game and return all players to the waiting room. This action cannot be undone.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={cancelEndGame}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmEndGame}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              End Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== MAIN RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-600 relative overflow-hidden">
      <GameHeader />

      {/* Game Area - Full Screen Table */}
      <main className="absolute inset-0 top-16 bottom-40 sm:bottom-32">
        <CardTable />
        
        {/* Player Info Areas - Around the table */}
        {playersList
          .filter(player => player.id !== currentPlayer?.id)
          .map((player, filteredIndex) => {
            // Calculate the original index for position mapping
            const originalIndex = playersList.findIndex(p => p.id === player.id)
            return (
              <PlayerInfoArea 
                key={player.id} 
                player={player} 
                index={originalIndex}
                filteredIndex={filteredIndex}
              />
            )
          })}
      </main>

      <PlayerHandArea />
      <EndGameDialog />
    </div>
  )
}

export default GameBoard

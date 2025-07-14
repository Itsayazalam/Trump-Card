import { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { SUIT_SYMBOLS, SUIT_COLORS } from '../utils/gameConstants'
import { canPlayCard } from '../utils/gameUtils'
import Card from './Card'

function GameBoard() {
  const {
    players,
    currentPlayer,
    currentHand,
    currentTurn,
    leadSuit,
    trumpSuit,
    handNumber,
    playCard
  } = useGame()

  const [selectedCard, setSelectedCard] = useState(null)
  
  const playersList = Object.values(players)
  const currentPlayerCards = currentPlayer?.id ? players[currentPlayer.id]?.cards || [] : []
  const isMyTurn = currentPlayer?.id && Object.keys(players).indexOf(currentPlayer.id) === currentTurn
  const currentTurnPlayer = playersList[currentTurn]

  useEffect(() => {
    setSelectedCard(null)
  }, [currentTurn])

  const handleCardSelect = (card) => {
    if (!isMyTurn) return
    
    const canPlay = canPlayCard(card, currentPlayerCards, leadSuit)
    if (!canPlay) return
    
    if (selectedCard?.suit === card.suit && selectedCard?.value === card.value) {
      setSelectedCard(null)
    } else {
      setSelectedCard(card)
    }
  }

  const handlePlayCard = async () => {
    if (selectedCard && isMyTurn) {
      await playCard(selectedCard)
      setSelectedCard(null)
    }
  }

  const getPlayerPosition = (index) => {
    const positions = [
      'bottom', // Player 0 - bottom
      'left',   // Player 1 - left
      'top',    // Player 2 - top
      'right'   // Player 3 - right
    ]
    return positions[index]
  }

  const renderPlayerArea = (player, index) => {
    const position = getPlayerPosition(index)
    const isCurrentUser = player.id === currentPlayer?.id
    const isPlayerTurn = index === currentTurn
    const playerHandCard = currentHand.find(h => h.playerId === player.id)

    const positionClasses = {
      bottom: 'absolute bottom-4 left-1/2 transform -translate-x-1/2',
      top: 'absolute top-4 left-1/2 transform -translate-x-1/2',
      left: 'absolute left-4 top-1/2 transform -translate-y-1/2',
      right: 'absolute right-4 top-1/2 transform -translate-y-1/2'
    }

    return (
      <div key={player.id} className={positionClasses[position]}>
        <div className={`
          bg-white rounded-2xl shadow-lg p-4 min-w-[120px] transition-all duration-300
          ${isPlayerTurn ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
          ${isCurrentUser ? 'border-2 border-green-400' : ''}
        `}>
          {/* Player Info */}
          <div className="flex items-center space-x-2 mb-2">
            <img
              src={player.avatar || '/default-avatar.png'}
              alt={player.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {isCurrentUser ? 'You' : player.name}
              </p>
              <p className="text-xs text-gray-500">
                {player.handsWon || 0} hands won
              </p>
            </div>
          </div>

          {/* Cards Count or Played Card */}
          <div className="text-center">
            {playerHandCard ? (
              <Card card={playerHandCard} size="sm" />
            ) : (
              <div className="flex items-center justify-center space-x-1">
                <span className="text-sm text-gray-600">
                  {player.cards?.length || 0} cards
                </span>
                {isPlayerTurn && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 relative overflow-hidden">
      {/* Header */}
      <header className="pt-safe-top px-4 py-4 bg-white shadow-sm relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-800">Hand {handNumber + 1}/13</span>
          </div>
          
          {/* Trump Display */}
          {trumpSuit && (
            <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-gray-700">Trump:</span>
              <span className={`text-lg ${SUIT_COLORS[trumpSuit]}`}>
                {SUIT_SYMBOLS[trumpSuit]}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            {isMyTurn ? 'Your turn' : `${currentTurnPlayer?.name || 'Player'}'s turn`}
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 relative p-4">
        {/* Center Play Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 min-w-[200px] min-h-[200px] flex items-center justify-center">
            {currentHand.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {currentHand.map((handCard, index) => (
                  <div key={`${handCard.suit}-${handCard.value}-${index}`} className="flex flex-col items-center">
                    <Card card={handCard} size="md" />
                    <p className="text-xs text-white mt-1 bg-black/30 px-2 py-1 rounded">
                      {players[handCard.playerId]?.name || 'Player'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white">
                <div className="text-4xl mb-2">🎴</div>
                <p className="text-lg font-medium">Waiting for first card...</p>
                {leadSuit && (
                  <p className="text-sm opacity-80">
                    Lead suit: <span className={SUIT_COLORS[leadSuit]}>{SUIT_SYMBOLS[leadSuit]}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Player Areas */}
        {playersList.map((player, index) => renderPlayerArea(player, index))}
      </main>

      {/* Bottom Player Hand (Current Player) */}
      {currentPlayerCards.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 pb-safe-bottom">
          {/* Selected Card Info */}
          {selectedCard && (
            <div className="mb-3 text-center">
              <button
                onClick={handlePlayCard}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
              >
                Play {selectedCard.value} of {selectedCard.suit}
              </button>
            </div>
          )}

          {/* Hand */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {currentPlayerCards.map((card, index) => {
              const isPlayable = canPlayCard(card, currentPlayerCards, leadSuit)
              const isSelected = selectedCard?.suit === card.suit && selectedCard?.value === card.value

              return (
                <div key={`${card.suit}-${card.value}-${index}`} className="flex-shrink-0">
                  <Card
                    card={card}
                    onClick={isMyTurn ? handleCardSelect : undefined}
                    isPlayable={isMyTurn && isPlayable}
                    isSelected={isSelected}
                    size="md"
                  />
                </div>
              )
            })}
          </div>

          {/* Turn Indicator */}
          <div className="mt-3 text-center">
            {isMyTurn ? (
              <p className="text-green-600 font-semibold">🎯 Your turn - Select a card to play</p>
            ) : (
              <p className="text-gray-600">
                Waiting for {currentTurnPlayer?.name || 'player'} to play...
              </p>
            )}
            {leadSuit && currentHand.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Follow {leadSuit} suit if possible • Trump: <span className={SUIT_COLORS[trumpSuit]}>{SUIT_SYMBOLS[trumpSuit]}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard

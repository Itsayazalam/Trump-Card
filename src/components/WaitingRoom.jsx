import { useEffect, useState } from 'react'
import { useGame } from '../contexts/GameContext'

function WaitingRoom() {
  const { players, currentPlayer, updatePlayerReady, startGame } = useGame()
  const [isReady, setIsReady] = useState(false)
  
  const playersList = Object.values(players)
  const playersCount = playersList.length
  const allReady = playersList.every(p => p.isReady)
  const canStart = playersCount === 4 && allReady

  const handleReadyToggle = async () => {
    const newReadyState = !isReady
    setIsReady(newReadyState)
    await updatePlayerReady(newReadyState)
  }

  const handleStartGame = async () => {
    if (canStart) {
      await startGame()
    }
  }

  useEffect(() => {
    if (currentPlayer?.id && players[currentPlayer.id]) {
      setIsReady(players[currentPlayer.id].isReady || false)
    }
  }, [players, currentPlayer])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex flex-col">
      {/* Header */}
      <header className="pt-safe-top px-4 py-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Waiting Room
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 flex flex-col items-center justify-center">
        {/* Room Status */}
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md mb-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎴</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Main Room</h2>
            <p className="text-gray-600">
              {playersCount}/4 players joined
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(playersCount / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-3 mb-6">
            {Array.from({ length: 4 }, (_, index) => {
              const player = playersList[index]
              const isEmpty = !player
              const isCurrentPlayer = player?.id === currentPlayer?.id

              return (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    isEmpty
                      ? 'border-dashed border-gray-300 bg-gray-50'
                      : player.isReady
                      ? 'border-green-300 bg-green-50'
                      : 'border-yellow-300 bg-yellow-50'
                  } ${isCurrentPlayer ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <div className="flex-shrink-0 mr-3">
                    {isEmpty ? (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm">?</span>
                      </div>
                    ) : (
                      <img
                        src={player.avatar || '/default-avatar.png'}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isEmpty ? 'text-gray-500' : 'text-gray-800'}`}>
                      {isEmpty ? 'Waiting for player...' : player.name}
                      {isCurrentPlayer && ' (You)'}
                    </p>
                    {!isEmpty && (
                      <p className="text-sm text-gray-600 truncate">
                        {player.email}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {!isEmpty && (
                      <div className={`w-3 h-3 rounded-full ${
                        player.isReady ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Ready Status */}
          {playersCount > 0 && (
            <div className="text-center text-sm text-gray-600 mb-4">
              {allReady && playersCount === 4 
                ? '✅ All players ready!'
                : `${playersList.filter(p => p.isReady).length}/${playersCount} players ready`
              }
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          {/* Ready Toggle Button */}
          <button
            onClick={handleReadyToggle}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
              isReady
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            {isReady ? '✅ Ready' : '⏳ Mark as Ready'}
          </button>

          {/* Start Game Button */}
          {canStart && (
            <button
              onClick={handleStartGame}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 animate-pulse"
            >
              🚀 Start Game
            </button>
          )}

          {/* Waiting Message */}
          {!canStart && playersCount < 4 && (
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-blue-700 font-medium">
                Waiting for {4 - playersCount} more player{4 - playersCount !== 1 ? 's' : ''}...
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Share this room with your friends!
              </p>
            </div>
          )}

          {playersCount === 4 && !allReady && (
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-yellow-700 font-medium">
                Waiting for all players to be ready...
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-safe-bottom px-4 py-4 bg-white border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          Room: <span className="font-mono text-blue-600">main-room</span>
        </p>
      </footer>
    </div>
  )
}

export default WaitingRoom

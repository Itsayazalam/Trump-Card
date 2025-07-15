import { useState } from 'react'
import { realtimeDb } from '../firebase'
import { ref, get, remove } from 'firebase/database'

function FirebaseDebugPanel() {
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const fetchGameData = async () => {
    setLoading(true)
    try {
      const gameRef = ref(realtimeDb, 'games/main-room')
      const snapshot = await get(gameRef)
      const data = snapshot.val()
      setGameData(data)
      console.log('🔍 Firebase Game Data:', data)
    } catch (error) {
      console.error('❌ Failed to fetch game data:', error)
    }
    setLoading(false)
  }

  const clearGameData = async () => {
    if (window.confirm('Are you sure you want to clear all game data?')) {
      try {
        const gameRef = ref(realtimeDb, 'games/main-room')
        await remove(gameRef)
        setGameData(null)
        console.log('🗑️ Game data cleared')
        window.location.reload()
      } catch (error) {
        console.error('❌ Failed to clear game data:', error)
      }
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg text-xs z-50"
      >
        🔧 Debug
      </button>
    )
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Firebase Debug Panel</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={fetchGameData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : '🔄 Refresh Data'}
            </button>
            <button
              onClick={clearGameData}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              🗑️ Clear Game Data
            </button>
          </div>

          {gameData ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Game State</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>State:</strong> {gameData.gameState}</p>
                  <p><strong>Hand Number:</strong> {gameData.handNumber}</p>
                  <p><strong>Trump Suit:</strong> {gameData.trumpSuit}</p>
                  <p><strong>Current Turn:</strong> {gameData.currentTurn}</p>
                  <p><strong>Lead Suit:</strong> {gameData.leadSuit}</p>
                  <p><strong>Current Hand:</strong> {gameData.currentHand?.length || 0} cards</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Players ({Object.keys(gameData.players || {}).length})</h3>
                {gameData.players ? (
                  <div className="space-y-2">
                    {Object.entries(gameData.players).map(([playerId, player]) => (
                      <div key={playerId} className="bg-gray-100 p-3 rounded text-sm">
                        <p><strong>{player.name}</strong> ({playerId})</p>
                        <p><strong>Cards:</strong> {player.cards?.length || 0}</p>
                        <p><strong>Hands Won:</strong> {player.handsWon || 0}</p>
                        <p><strong>Ready:</strong> {player.isReady ? 'Yes' : 'No'}</p>
                        {player.cards && player.cards.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600">Show Cards</summary>
                            <div className="mt-2 text-xs">
                              {player.cards.map((card, index) => (
                                <span key={index} className="inline-block bg-white px-2 py-1 m-1 rounded">
                                  {card.value} of {card.suit}
                                </span>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No players found</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Raw Data</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(gameData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No data loaded. Click "Refresh Data" to fetch from Firebase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FirebaseDebugPanel

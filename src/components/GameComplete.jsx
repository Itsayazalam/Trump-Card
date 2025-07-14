import { useGame } from '../contexts/GameContext'

function GameComplete() {
  const { players, winner } = useGame()
  
  const playersList = Object.values(players).sort((a, b) => (b.handsWon || 0) - (a.handsWon || 0))
  const totalHands = playersList.reduce((sum, player) => sum + (player.handsWon || 0), 0)

  const handleNewGame = () => {
    // Refresh the page to start a new game
    window.location.reload()
  }

  const getRankEmoji = (index) => {
    const emojis = ['🥇', '🥈', '🥉', '4️⃣']
    return emojis[index] || '🏁'
  }

  const getRankColor = (index) => {
    const colors = [
      'bg-gradient-to-r from-yellow-400 to-yellow-600',
      'bg-gradient-to-r from-gray-300 to-gray-500',
      'bg-gradient-to-r from-orange-400 to-orange-600',
      'bg-gradient-to-r from-blue-400 to-blue-600'
    ]
    return colors[index] || 'bg-gray-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col">
      {/* Header */}
      <header className="pt-safe-top px-4 py-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          🎉 Game Complete!
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 flex flex-col items-center justify-center space-y-8">
        {/* Winner Announcement */}
        {winner && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Congratulations!
            </h2>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img
                src={winner.avatar || '/default-avatar.png'}
                alt={winner.name}
                className="w-12 h-12 rounded-full border-2 border-yellow-400"
              />
              <div>
                <p className="text-xl font-bold text-gray-800">{winner.name}</p>
                <p className="text-gray-600">wins with {winner.handsWon} hands!</p>
              </div>
            </div>
          </div>
        )}

        {/* Final Leaderboard */}
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Final Standings
          </h3>
          
          <div className="space-y-3">
            {playersList.map((player, index) => (
              <div
                key={player.id}
                className={`
                  ${getRankColor(index)} rounded-2xl p-4 text-white shadow-lg
                  ${index === 0 ? 'scale-105 border-2 border-yellow-300' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getRankEmoji(index)}</span>
                    <img
                      src={player.avatar || '/default-avatar.png'}
                      alt={player.name}
                      className="w-10 h-10 rounded-full border-2 border-white/50"
                    />
                    <div>
                      <p className="font-semibold truncate">{player.name}</p>
                      <p className="text-sm opacity-90">
                        #{index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{player.handsWon || 0}</p>
                    <p className="text-sm opacity-90">hands</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Game Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total hands played:</span>
              <span className="font-semibold">{totalHands}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Game duration:</span>
              <span className="font-semibold">Complete</span>
            </div>
          </div>
        </div>

        {/* Game Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">Game Summary</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>🎴 All 13 hands completed</p>
            <p>🏆 Winner determined by most hands won</p>
            <p>🎯 Great game everyone!</p>
            <p>🔥 Ready for another round?</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={handleNewGame}
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
          >
            🚀 Start New Game
          </button>
          
          <button
            onClick={() => window.close()}
            className="w-full bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Exit Game
          </button>
        </div>

        {/* Share Results */}
        <div className="bg-blue-50 rounded-2xl p-4 w-full max-w-md">
          <p className="text-center text-blue-700 font-medium text-sm">
            🎉 Share your victory with friends!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-safe-bottom px-4 py-4 bg-white border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          Thanks for playing Judgement! 🎴
        </p>
      </footer>
    </div>
  )
}

export default GameComplete

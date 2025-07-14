import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { GameProvider, useGame } from './contexts/GameContext'
import { GAME_STATES } from './utils/gameConstants'

import LoginScreen from './components/LoginScreen'
import WaitingRoom from './components/WaitingRoom'
import TrumpSelector from './components/TrumpSelector'
import GameBoard from './components/GameBoard'
import GameComplete from './components/GameComplete'

function AppContent() {
  const { gameState, joinGame } = useGame()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      
      if (user) {
        // Auto-join game when user is authenticated
        const playerData = {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL
        }
        joinGame(playerData)
      }
    })

    return () => unsubscribe()
  }, [joinGame])

  const handleLogin = async (playerData) => {
    await joinGame(playerData)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  // Render appropriate component based on game state
  switch (gameState) {
    case GAME_STATES.WAITING:
      return <WaitingRoom />
    case GAME_STATES.TRUMP_SELECTION:
      return <TrumpSelector />
    case GAME_STATES.PLAYING:
      return <GameBoard />
    case GAME_STATES.GAME_COMPLETE:
      return <GameComplete />
    default:
      return <WaitingRoom />
  }
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App

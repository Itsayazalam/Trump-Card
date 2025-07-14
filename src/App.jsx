import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { store } from './store/store'
import { useAppDispatch, useAuth, useGame } from './store/hooks'
import { setUser, setLoading } from './store/slices/authSlice'
import { joinGame } from './store/slices/gameSlice'
import { setupFirebaseListener, cleanupFirebaseListener } from './store/firebaseMiddleware'
import { GAME_STATES } from './utils/gameConstants'

import LoginScreen from './components/LoginScreen'
import WaitingRoom from './components/WaitingRoom'
import TrumpSelector from './components/TrumpSelector'
import GameBoard from './components/GameBoard'
import GameComplete from './components/GameComplete'

function AppContent() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading } = useAuth()
  const { gameState } = useGame()

  useEffect(() => {
    dispatch(setLoading(true))
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL
        }
        
        dispatch(setUser(userData))
        
        // Auto-join game when user is authenticated
        await dispatch(joinGame({ gameId: 'main-room', player: userData }))
        
        // Setup Firebase listener for real-time updates
        dispatch(setupFirebaseListener('main-room'))
      } else {
        dispatch(setUser(null))
        dispatch(cleanupFirebaseListener())
      }
      
      dispatch(setLoading(false))
    })

    return () => {
      unsubscribe()
      dispatch(cleanupFirebaseListener())
    }
  }, [dispatch])

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

  if (!isAuthenticated) {
    return <LoginScreen />
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
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App

import { useAppDispatch, useAuth } from '../store/hooks'
import { loginWithGoogle, clearError } from '../store/slices/authSlice'

function LoginScreen() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAuth()

  const handleGoogleLogin = async () => {
    dispatch(clearError())
    dispatch(loginWithGoogle())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md min-w-[280px]">
        {/* Game Logo/Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-6xl mb-4">🎴</div>
          <h1 
            className="text-3xl font-bold text-red-800 mb-2"
            style={{ color: '#991b1b' }}
          >
            Judgement
          </h1>
          <p className="text-gray-600">Multiplayer Card Game</p>
        </div>

        {/* Login Form */}
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Join the Game
            </h2>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Sign in with your Google account to play with friends
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border-2 rounded-xl py-4 px-6 flex items-center justify-center transition-all duration-200 disabled:opacity-50 min-h-[60px]"
            style={{ 
              backgroundColor: '#7f1d1d',
              borderColor: '#7f1d1d',
              color: '#ffffff'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center w-full">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span className="font-medium" style={{ color: '#ffffff' }}>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full space-x-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-white font-medium">Login with Google</span>
              </div>
            )}
          </button>
        </div>

        {/* Game Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col items-center space-y-2 text-sm text-gray-500">
            <p>🎯 Exactly 4 players needed</p>
            <p>🃏 13 cards per player</p>
            <p>♠️ Trump suit selection</p>
            <p>🏆 Most hands won wins!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen

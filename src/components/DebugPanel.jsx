import { useAppSelector } from '../store/hooks'

function DebugPanel() {
  const auth = useAppSelector(state => state.auth)
  const game = useAppSelector(state => state.game)
  const ui = useAppSelector(state => state.ui)

  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 bg-black text-white text-xs p-2 max-w-xs z-50 opacity-80">
      <div className="mb-2">
        <strong>Auth:</strong>
        <div>Authenticated: {auth.isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {auth.user?.name || 'None'}</div>
        <div>Loading: {auth.loading ? 'Yes' : 'No'}</div>
      </div>
      
      <div className="mb-2">
        <strong>Game:</strong>
        <div>State: {game.gameState}</div>
        <div>Players: {Object.keys(game.players).length}</div>
        <div>Current Player: {game.currentPlayer?.name || 'None'}</div>
        <div>Connected: {game.isConnected ? 'Yes' : 'No'}</div>
      </div>
      
      <div>
        <strong>UI:</strong>
        <div>Loading: {ui.isLoading ? 'Yes' : 'No'}</div>
        <div>Error: {ui.error || 'None'}</div>
      </div>
    </div>
  )
}

export default DebugPanel

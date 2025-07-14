import { useDispatch, useSelector } from 'react-redux'

// Typed hooks for better development experience
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

// Selectors for easy access to state
export const useAuth = () => useAppSelector(state => state.auth)
export const useGame = () => useAppSelector(state => state.game)
export const useUI = () => useAppSelector(state => state.ui)

// Specific selectors for commonly used data
export const useCurrentPlayer = () => useAppSelector(state => state.game.currentPlayer)
export const usePlayers = () => useAppSelector(state => state.game.players)
export const useGameState = () => useAppSelector(state => state.game.gameState)
export const useIsMyTurn = () => {
  const { currentPlayer, players, currentTurn } = useAppSelector(state => state.game)
  if (!currentPlayer?.id || !players) return false
  return Object.keys(players).indexOf(currentPlayer.id) === currentTurn
}
export const useSelectedCard = () => useAppSelector(state => state.ui.selectedCard)
export const useNotifications = () => useAppSelector(state => state.ui.notifications)

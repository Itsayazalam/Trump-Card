import { useDispatch, useSelector } from "react-redux";

// Typed hooks for better development experience
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Selectors for easy access to state
export const useAuth = () => useAppSelector((state) => state.auth);
export const useGame = () => useAppSelector((state) => state.game);
export const useUI = () => useAppSelector((state) => state.ui);

// Specific selectors for commonly used data
export const useCurrentPlayer = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { players } = useAppSelector((state) => state.game);

  // Find the current player in the game players by matching user ID
  if (!user?.id || !players) return null;
  return players[user.id] || null;
};
export const usePlayers = () => useAppSelector((state) => state.game.players);
export const useGameState = () =>
  useAppSelector((state) => state.game.gameState);
export const useIsMyTurn = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { players, currentTurn } = useAppSelector((state) => state.game);

  if (!user?.id || !players) return false;
  // Use consistent sorted order to match completeHand logic
  const playerIds = Object.keys(players).sort();
  const currentPlayerIndex = playerIds.indexOf(user.id);
  return currentPlayerIndex === currentTurn;
};
export const useSelectedCard = () =>
  useAppSelector((state) => state.ui.selectedCard);
export const useNotifications = () =>
  useAppSelector((state) => state.ui.notifications);

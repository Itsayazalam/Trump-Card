import { useEffect } from "react";
import { Provider } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { store } from "./store/store";
import { useAppDispatch, useAuth, useGame } from "./store/hooks";
import { setUser, setLoading } from "./store/slices/authSlice";
import { joinGame } from "./store/slices/gameSlice";
import {
  setupFirebaseListener,
  cleanupFirebaseListener,
} from "./store/firebaseMiddleware";
import { GAME_STATES } from "./utils/gameConstants";
import "./testFirebase"; // Import test for debugging

import LoginScreen from "./components/LoginScreen";
import WaitingRoom from "./components/WaitingRoom";
import TrumpSelector from "./components/TrumpSelector";
import GameBoard from "./components/GameBoard";
import GameComplete from "./components/GameComplete";

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, user } = useAuth();
  const { gameState, players, isConnected } = useGame();

  // Console logging for debugging
  console.log("=== APP STATE DEBUG ===");
  console.log("Auth:", { isAuthenticated, loading, user: user?.name });
  console.log("Game:", {
    gameState,
    playersCount: Object.keys(players).length,
    isConnected,
  });
  console.log("Players:", players);
  console.log("======================");

  useEffect(() => {
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "Auth state changed:",
        user ? "User logged in" : "User logged out"
      );
      if (user) {
        const userData = {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
        };

        console.log("User data:", userData);
        dispatch(setUser(userData));

        // Auto-join game when user is authenticated
        console.log("Attempting to join game...");
        const result = await dispatch(
          joinGame({ gameId: "main-room", player: userData })
        );
        console.log("Join game result:", result);

        // Small delay to ensure join completes before setting up listener
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Setup Firebase listener for real-time updates
        console.log("Setting up Firebase listener...");
        dispatch(setupFirebaseListener("main-room"));
      } else {
        dispatch(setUser(null));
        dispatch(cleanupFirebaseListener());
      }

      dispatch(setLoading(false));
    });

    return () => {
      unsubscribe();
      dispatch(cleanupFirebaseListener());
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen min-w-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("App render state:", { isAuthenticated, gameState, loading });

  if (!isAuthenticated) {
    return (
      <div className="min-w-[320px] w-full">
        <LoginScreen />
      </div>
    );
  }

  // Render appropriate component based on game state
  switch (gameState) {
    case GAME_STATES.WAITING:
      return (
        <div className="min-w-[320px] w-full">
          <WaitingRoom />
        </div>
      );
    case GAME_STATES.TRUMP_SELECTION:
      return (
        <div className="min-w-[320px] w-full">
          <TrumpSelector />
        </div>
      );
    case GAME_STATES.PLAYING:
      return (
        <div className="min-w-[320px] w-full">
          <GameBoard />
        </div>
      );
    case GAME_STATES.GAME_COMPLETE:
      return (
        <div className="min-w-[320px] w-full">
          <GameComplete />
        </div>
      );
    default:
      return (
        <div className="min-w-[320px] w-full">
          <WaitingRoom />
        </div>
      );
  }
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;

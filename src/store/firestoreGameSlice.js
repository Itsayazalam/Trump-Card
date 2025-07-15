// Firestore version of game operations (fallback if Realtime DB fails)
import { createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { GAME_STATES } from "../utils/gameConstants";
import { generateDeck, shuffleDeck } from "../utils/gameUtils";

// Firestore version of joinGame
export const joinGameFirestore = createAsyncThunk(
  "game/joinGameFirestore",
  async ({ gameId, player }, { rejectWithValue }) => {
    try {
      console.log("Joining game with Firestore:", { gameId, player });

      // Create player document
      const playerRef = doc(db, `games/${gameId}/players`, player.id);
      const playerData = {
        id: player.id,
        name: player.name,
        email: player.email,
        avatar: player.avatar,
        cards: [],
        handsWon: 0,
        isReady: false,
        joinedAt: Date.now(),
      };

      await setDoc(playerRef, playerData);
      console.log("Player joined successfully with Firestore");
      return { gameId, player };
    } catch (error) {
      console.error("Join game error (Firestore):", error);
      return rejectWithValue(error.message);
    }
  }
);

// Firestore version of updatePlayerReady
export const updatePlayerReadyFirestore = createAsyncThunk(
  "game/updatePlayerReadyFirestore",
  async ({ gameId, playerId, ready }, { rejectWithValue }) => {
    try {
      const playerRef = doc(db, `games/${gameId}/players`, playerId);
      await updateDoc(playerRef, { isReady: ready });
      return { playerId, ready };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Firestore listener setup
export const setupFirestoreListener = (gameId, dispatch) => {
  console.log("Setting up Firestore listener for game:", gameId);

  // Listen to game document
  const gameRef = doc(db, "games", gameId);
  const unsubscribeGame = onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      const gameData = doc.data();
      console.log("Firestore game data:", gameData);
      dispatch({ type: "game/setFirestoreGameData", payload: gameData });
    }
  });

  // Listen to players collection
  const playersRef = collection(db, `games/${gameId}/players`);
  const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
    const players = {};
    snapshot.forEach((doc) => {
      players[doc.id] = doc.data();
    });
    console.log("Firestore players data:", players);
    dispatch({ type: "game/setFirestorePlayers", payload: players });
  });

  return () => {
    unsubscribeGame();
    unsubscribePlayers();
  };
};

export const createGameFirestore = async (gameId) => {
  try {
    const gameRef = doc(db, "games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      await setDoc(gameRef, {
        gameId,
        gameState: GAME_STATES.WAITING,
        createdAt: Date.now(),
        trumpSuit: null,
        trumpSelector: null,
        currentHand: [],
        currentTurn: 0,
        handNumber: 0,
        scores: {},
      });
      console.log("Game created in Firestore");
    }
  } catch (error) {
    console.error("Error creating game in Firestore:", error);
  }
};

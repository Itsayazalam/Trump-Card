import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { realtimeDb } from "../../firebase";
import { ref, set, update, get } from "firebase/database";
import { GAME_STATES } from "../../utils/gameConstants";
import {
  generateDeck,
  shuffleDeck,
  determineHandWinner,
  determineGameWinner,
} from "../../utils/gameUtils";

// Debug utility to track player changes
const logPlayerChanges = (before, after, action) => {
  const beforePlayerIds = Object.keys(before || {}).sort();
  const afterPlayerIds = Object.keys(after || {}).sort();

  if (beforePlayerIds.length !== afterPlayerIds.length) {
    console.warn(`🚨 PLAYER COUNT CHANGED in ${action}:`);
    console.warn(
      `  Before: ${beforePlayerIds.length} players [${beforePlayerIds.join(
        ", "
      )}]`
    );
    console.warn(
      `  After: ${afterPlayerIds.length} players [${afterPlayerIds.join(", ")}]`
    );

    const lost = beforePlayerIds.filter((id) => !afterPlayerIds.includes(id));
    const added = afterPlayerIds.filter((id) => !beforePlayerIds.includes(id));

    if (lost.length > 0) {
      console.error(`  ❌ LOST PLAYERS: ${lost.join(", ")}`);
    }
    if (added.length > 0) {
      console.log(`  ✅ ADDED PLAYERS: ${added.join(", ")}`);
    }
  }
};

// Async thunks for Firebase operations
export const joinGame = createAsyncThunk(
  "game/joinGame",
  async ({ gameId, player }, { rejectWithValue }) => {
    try {
      console.log("🎮 Joining game:", { gameId, playerId: player.id });

      const playerRef = ref(realtimeDb, `games/${gameId}/players/${player.id}`);

      // First, check if player already exists to preserve their game data
      const existingPlayerSnapshot = await get(playerRef);
      const existingPlayer = existingPlayerSnapshot.val();

      let playerData;
      if (existingPlayer) {
        console.log("🔄 Player already exists, preserving game data:", {
          existingCards: existingPlayer.cards?.length || 0,
          existingHandsWon: existingPlayer.handsWon || 0,
        });

        // Preserve existing game data but update auth info
        playerData = {
          ...existingPlayer,
          id: player.id,
          name: player.name,
          email: player.email,
          avatar: player.avatar,
          lastJoinedAt: Date.now(), // Update last joined time
        };
      } else {
        console.log("🆕 New player joining");

        // New player - create fresh data
        playerData = {
          id: player.id,
          name: player.name,
          email: player.email,
          avatar: player.avatar,
          cards: [],
          handsWon: 0,
          isReady: false,
          joinedAt: Date.now(),
        };
      }

      console.log("💾 Saving player data:", playerData);
      await set(playerRef, playerData);

      return { gameId, player };
    } catch (error) {
      console.error("❌ Join game error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const updatePlayerReady = createAsyncThunk(
  "game/updatePlayerReady",
  async ({ gameId, playerId, ready }, { rejectWithValue }) => {
    try {
      const playerRef = ref(
        realtimeDb,
        `games/${gameId}/players/${playerId}/isReady`
      );
      await set(playerRef, ready);
      return { playerId, ready };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startGame = createAsyncThunk(
  "game/startGame",
  async ({ gameId, players }, { rejectWithValue, getState }) => {
    try {
      if (Object.keys(players).length !== 4) {
        throw new Error("Need exactly 4 players to start");
      }

      const state = getState();
      const currentGameCount = state.game.gameCount || 0;

      const deck = generateDeck();
      const shuffledDeck = shuffleDeck(deck);

      // Deal 5 cards to each player initially
      // Use consistent sorted order to match turn logic
      const playerIds = Object.keys(players).sort();
      const updatedPlayers = {};

      playerIds.forEach((playerId, index) => {
        const playerCards = shuffledDeck.slice(index * 5, (index + 1) * 5);
        updatedPlayers[playerId] = {
          ...players[playerId],
          cards: playerCards,
          handsWon: 0,
        };
      });

      // Store remaining deck for later dealing
      const remainingDeck = shuffledDeck.slice(20);

      // Choose trump selector - rotate based on game count for fair rotation
      const selectorIndex = currentGameCount % playerIds.length;
      const trumpSelector = playerIds[selectorIndex];

      console.log(
        `🎯 Trump selector chosen: ${players[trumpSelector]?.name} (game ${
          currentGameCount + 1
        }, index ${selectorIndex})`
      );

      const gameUpdate = {
        players: updatedPlayers,
        gameState: GAME_STATES.TRUMP_SELECTION,
        trumpSelector,
        deck: remainingDeck,
        currentTurn: 0,
        handNumber: 0,
        gameCount: currentGameCount + 1, // Increment game count
        scores: playerIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
      };

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate);
      console.log("🎮 startGame: Firebase update successful", {
        playersCount: Object.keys(gameUpdate.players).length,
        cardCounts: Object.values(gameUpdate.players).map((p) => ({
          name: p.name,
          cards: p.cards?.length || 0,
        })),
      });
      return gameUpdate;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const selectTrump = createAsyncThunk(
  "game/selectTrump",
  async ({ gameId, suit, players, deck }, { rejectWithValue }) => {
    try {
      // Deal remaining 8 cards to each player
      // Use consistent sorted order to match turn logic
      const playerIds = Object.keys(players).sort();
      const updatedPlayers = {};

      playerIds.forEach((playerId, index) => {
        const additionalCards = deck.slice(index * 8, (index + 1) * 8);
        updatedPlayers[playerId] = {
          ...players[playerId],
          cards: [...(players[playerId].cards || []), ...additionalCards],
        };
      });

      const gameUpdate = {
        players: updatedPlayers,
        gameState: GAME_STATES.PLAYING,
        trumpSuit: suit,
        currentTurn: 0,
        currentHand: [],
        leadSuit: null,
      };

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate);
      console.log("🃏 selectTrump: Firebase update successful", {
        playersCount: Object.keys(gameUpdate.players).length,
        cardCounts: Object.values(gameUpdate.players).map((p) => ({
          name: p.name,
          cards: p.cards?.length || 0,
        })),
      });
      return gameUpdate;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const playCard = createAsyncThunk(
  "game/playCard",
  async (
    { gameId, card, playerId, players, currentHand, currentTurn, leadSuit },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      // Remove card from player's hand
      const updatedPlayer = {
        ...players[playerId],
        cards: players[playerId].cards.filter(
          (c) => !(c.suit === card.suit && c.value === card.value)
        ),
      };

      const updatedPlayers = {
        ...players,
        [playerId]: updatedPlayer,
      };

      const newHand = [...currentHand, { ...card, playerId }];
      const newLeadSuit = currentHand.length === 0 ? card.suit : leadSuit;
      const nextTurn = (currentTurn + 1) % 4;

      const gameUpdate = {
        players: updatedPlayers,
        currentHand: newHand,
        leadSuit: newLeadSuit,
        currentTurn: nextTurn,
      };

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate);
      console.log("🎯 playCard: Firebase update successful", {
        playerId,
        cardPlayed: `${card.value} of ${card.suit}`,
        playerCardsRemaining: updatedPlayer.cards.length,
        handSize: newHand.length,
      });

      // Check if hand is complete
      if (newHand.length === 4) {
        const state = getState();
        const trumpSuit = state.game.trumpSuit;
        const handNumber = state.game.handNumber;

        setTimeout(() => {
          dispatch(
            completeHand({
              gameId,
              hand: newHand,
              leadSuit: newLeadSuit,
              trumpSuit,
              players: updatedPlayers,
              handNumber,
            })
          );
        }, 2000);
      }

      return gameUpdate;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeHand = createAsyncThunk(
  "game/completeHand",
  async (
    { gameId, hand, leadSuit, trumpSuit, players, handNumber },
    { rejectWithValue }
  ) => {
    try {
      const winner = determineHandWinner(hand, leadSuit, trumpSuit);
      console.log("🏆 completeHand: Hand winner determined:", {
        winnerId: winner.playerId,
        winnerCard: `${winner.value} of ${winner.suit}`,
      });

      // CRITICAL FIX: Use a consistent ordering method for player indexing
      // Instead of relying on Object.keys() order, let's use a stable sort
      const playerIds = Object.keys(players).sort(); // Alphabetical sort for consistency
      const winnerIndex = playerIds.indexOf(winner.playerId);

      console.log("🔢 completeHand: Player indexing:", {
        allPlayerIds: playerIds,
        winnerPlayerId: winner.playerId,
        calculatedWinnerIndex: winnerIndex,
        currentPlayersObject: Object.keys(players),
      });

      if (winnerIndex === -1) {
        console.error("❌ completeHand: Winner not found in players!", {
          winnerId: winner.playerId,
          availablePlayerIds: playerIds,
        });
        throw new Error(`Winner ${winner.playerId} not found in players`);
      }

      // Update scores
      const updatedPlayers = {
        ...players,
        [winner.playerId]: {
          ...players[winner.playerId],
          handsWon: (players[winner.playerId].handsWon || 0) + 1,
        },
      };

      const newHandNumber = handNumber + 1;
      const isGameComplete = newHandNumber >= 13;

      const gameUpdate = {
        players: updatedPlayers,
        gameState: isGameComplete
          ? GAME_STATES.GAME_COMPLETE
          : GAME_STATES.PLAYING,
        currentHand: [],
        leadSuit: null,
        currentTurn: winnerIndex,
        handNumber: newHandNumber,
        winner: isGameComplete ? determineGameWinner(updatedPlayers) : null,
      };

      console.log("💾 completeHand: Firebase update data:", {
        playersCount: Object.keys(gameUpdate.players).length,
        newCurrentTurn: gameUpdate.currentTurn,
        newHandNumber: gameUpdate.handNumber,
        isGameComplete,
      });

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate);
      return gameUpdate;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const endGame = createAsyncThunk(
  "game/endGame",
  async ({ gameId }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentGameCount = state.game.gameCount || 0;

      // Reset the game to waiting state but preserve gameCount for trump selector rotation
      const gameUpdate = {
        gameState: GAME_STATES.WAITING,
        players: {},
        currentHand: [],
        currentTurn: 0,
        leadSuit: null,
        trumpSuit: null,
        trumpSelector: null,
        handNumber: 0,
        scores: {},
        winner: null,
        deck: [],
        gameCount: currentGameCount, // Preserve game count for trump selector rotation
      };

      await update(ref(realtimeDb, `games/${gameId}`), gameUpdate);
      return gameUpdate;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  gameId: "main-room",
  players: {},
  gameState: GAME_STATES.WAITING,
  trumpSuit: null,
  trumpSelector: null,
  currentHand: [],
  currentTurn: 0,
  leadSuit: null,
  handNumber: 0,
  deck: [],
  scores: {},
  winner: null,
  gameCount: 0, // Track number of games played for trump selector rotation
  isConnected: false,
  loading: false,
  error: null,
  firebaseListener: null,
};

// Game slice
const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setFirebaseData: (state, action) => {
      const data = action.payload;
      if (data) {
        console.log("🔄 Firebase data sync received:");
        console.log("  Game State:", data.gameState);
        console.log("  Hand Number:", data.handNumber);
        console.log("  Current Turn:", data.currentTurn);

        // Track player changes
        logPlayerChanges(state.players, data.players, "setFirebaseData");

        console.log("  Players with card counts:");
        if (data.players) {
          const playerCount = Object.keys(data.players).length;
          console.log(`  Total players: ${playerCount}`);
          Object.entries(data.players).forEach(([id, player]) => {
            console.log(
              `    ${player.name} (${id}): ${
                player.cards?.length || 0
              } cards, ${player.handsWon || 0} hands`
            );
            if (player.cards?.length > 0) {
              console.log(
                `      Cards: ${player.cards
                  .map((c) => `${c.value}${c.suit.charAt(0)}`)
                  .join(", ")}`
              );
            }
          });

          if (playerCount !== 4) {
            console.warn(`⚠️ Expected 4 players, got ${playerCount}!`);
          }
        } else {
          console.log("    No players data received!");
        }
        console.log("  Current Hand:", data.currentHand);
        console.log("  Trump Suit:", data.trumpSuit);
        console.log("========================");

        state.players = data.players || {};
        state.gameState = data.gameState || GAME_STATES.WAITING;
        state.trumpSuit = data.trumpSuit || null;
        state.trumpSelector = data.trumpSelector || null;
        state.currentHand = data.currentHand || [];
        state.currentTurn = data.currentTurn || 0;
        state.leadSuit = data.leadSuit || null;
        state.handNumber = data.handNumber || 0;
        state.scores = data.scores || {};
        state.winner = data.winner || null;
        state.gameCount = data.gameCount || 0;
        state.deck = data.deck || [];
        state.isConnected = true;
        state.error = null;
      } else {
        console.log("⚠️ Firebase data sync received null/undefined data");
      }
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setFirebaseListener: (state, action) => {
      state.firebaseListener = action.payload;
    },
    resetGame: (state) => {
      return {
        ...initialState,
        gameId: state.gameId,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Join game
      .addCase(joinGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinGame.fulfilled, (state, action) => {
        state.loading = false;
        state.gameId = action.payload.gameId;
      })
      .addCase(joinGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update player ready
      .addCase(updatePlayerReady.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePlayerReady.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePlayerReady.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Start game
      .addCase(startGame.pending, (state) => {
        state.loading = true;
      })
      .addCase(startGame.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(startGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Select trump
      .addCase(selectTrump.pending, (state) => {
        state.loading = true;
      })
      .addCase(selectTrump.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(selectTrump.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Play card
      .addCase(playCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(playCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(playCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Complete hand
      .addCase(completeHand.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeHand.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(completeHand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // End game
      .addCase(endGame.pending, (state) => {
        state.loading = true;
      })
      .addCase(endGame.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(endGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFirebaseData,
  setConnectionStatus,
  setFirebaseListener,
  resetGame,
  clearError,
} = gameSlice.actions;

export default gameSlice.reducer;

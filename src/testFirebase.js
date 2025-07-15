// Test Firebase connection
import { realtimeDb } from "./firebase";
import { ref, set, get } from "firebase/database";

export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");

    // Test write
    const testRef = ref(realtimeDb, "test/connection");
    await set(testRef, {
      message: "Firebase is working!",
      timestamp: Date.now(),
    });
    console.log("Firebase write test successful");

    // Test read
    const snapshot = await get(testRef);
    const data = snapshot.val();
    console.log("Firebase read test successful:", data);

    return true;
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return false;
  }
};

export const checkGameData = async () => {
  try {
    console.log("🔍 Checking game data in Firebase...");

    const gameRef = ref(realtimeDb, "games/main-room");
    const snapshot = await get(gameRef);
    const gameData = snapshot.val();

    console.log("📊 Full game data:", gameData);

    if (gameData?.players) {
      console.log("👥 Players in database:");
      Object.entries(gameData.players).forEach(([playerId, playerData]) => {
        console.log(`  ${playerData.name} (${playerId}):`);
        console.log(
          `    Cards: ${playerData.cards?.length || 0}`,
          playerData.cards
        );
        console.log(`    Hands Won: ${playerData.handsWon || 0}`);
        console.log(`    Is Ready: ${playerData.isReady}`);
        console.log(`    ---`);
      });
    } else {
      console.log("❌ No players found in database");
    }

    if (gameData) {
      console.log("🎮 Game state:", gameData.gameState);
      console.log("🃏 Current hand:", gameData.currentHand);
      console.log("🏆 Trump suit:", gameData.trumpSuit);
      console.log("📋 Hand number:", gameData.handNumber);
    }

    return gameData;
  } catch (error) {
    console.error("❌ Failed to check game data:", error);
    return null;
  }
};

// Call these in the browser console to test
window.testFirebase = testFirebaseConnection;
window.checkGameData = checkGameData;

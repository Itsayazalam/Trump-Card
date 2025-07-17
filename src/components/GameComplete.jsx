import { usePlayers, useGame } from "../store/hooks";
import { realtimeDb } from "../firebase";
import { ref, remove } from "firebase/database";
import { bgStyle } from "../utils/background";

function GameComplete() {
  const players = usePlayers();
  const { gameId, teams } = useGame();

  const playersList = Object.values(players).sort(
    (a, b) => (b.handsWon || 0) - (a.handsWon || 0)
  );

  // Calculate team scores if teams exist
  const getTeamScores = () => {
    if (!teams || !teams.team1 || !teams.team2) return null;

    const team1Score = teams.team1.players.reduce((total, playerId) => {
      return total + (players[playerId]?.handsWon || 0);
    }, 0);

    const team2Score = teams.team2.players.reduce((total, playerId) => {
      return total + (players[playerId]?.handsWon || 0);
    }, 0);

    return {
      team1: {
        name: teams.team1.name,
        score: team1Score,
        players: teams.team1.players.map((id) => players[id]).filter(Boolean),
      },
      team2: {
        name: teams.team2.name,
        score: team2Score,
        players: teams.team2.players.map((id) => players[id]).filter(Boolean),
      },
    };
  };

  const teamScores = getTeamScores();

  const handleNewGame = async () => {
    try {
      console.log("🗑️ Clearing Firebase database for new game...");

      // Clear the entire game data from Firebase
      const gameRef = ref(realtimeDb, `games/${gameId || "main-room"}`);
      await remove(gameRef);

      console.log("✅ Firebase database cleared successfully");

      // Refresh the page to start fresh
      window.location.reload();
    } catch (error) {
      console.error("❌ Error clearing Firebase database:", error);
      // If Firebase clearing fails, still refresh to start over
      window.location.reload();
    }
  };

  const getRankEmoji = (index) => {
    const emojis = ["🥇", "🥈", "🥉", "4️⃣"];
    return emojis[index] || "🏁";
  };

  const getRankColor = (index) => {
    const colors = [
      "bg-gradient-to-r from-yellow-400 to-yellow-600",
      "bg-gradient-to-r from-gray-300 to-gray-500",
      "bg-gradient-to-r from-orange-400 to-orange-600",
      "bg-gradient-to-r from-blue-400 to-blue-600",
    ];
    return colors[index] || "bg-gray-400";
  };

  return (
    <div
      style={bgStyle}
      className="min-h-screen min-w-screen bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col"
    >
      {/* Main Content */}
      <main className="px-4 py-36 flex flex-col w-full space-y-8 justify-between">
        {/* Final Leaderboard */}
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Final Standings
          </h3>

          <div className="space-y-3">
            {playersList.map((player, index) => (
              <div
                key={player.id}
                className={`
                  ${getRankColor(index)} rounded-2xl p-4 text-white shadow-lg
                  ${index === 0 ? "scale-105 border-2 border-yellow-300" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getRankEmoji(index)}</span>
                    <img
                      src={player.avatar || "/default-avatar.png"}
                      alt={player.name}
                      className="w-10 h-10 rounded-full border-2 border-white/50"
                    />
                    <div>
                      <p className="font-semibold truncate">{player.name}</p>
                      <p className="text-sm opacity-90">#{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{player.handsWon || 0}</p>
                    <p className="text-sm opacity-90">hands</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Scores (if teams were used) */}
        {teamScores && (
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Team Results
            </h3>

            <div className="space-y-4">
              <div
                className={`rounded-2xl p-4 shadow-lg ${
                  teamScores.team1.score > teamScores.team2.score
                    ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                    : "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{teamScores.team1.name}</h4>
                  <span className="text-2xl font-bold">
                    {teamScores.team1.score}
                  </span>
                </div>
                <div className="text-sm opacity-90">
                  {teamScores.team1.players
                    .map((p) => p.name.split(" ")[0])
                    .join(" & ")}
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 shadow-lg ${
                  teamScores.team2.score > teamScores.team1.score
                    ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                    : "bg-gradient-to-r from-red-400 to-red-600 text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{teamScores.team2.name}</h4>
                  <span className="text-2xl font-bold">
                    {teamScores.team2.score}
                  </span>
                </div>
                <div className="text-sm opacity-90">
                  {teamScores.team2.players
                    .map((p) => p.name.split(" ")[0])
                    .join(" & ")}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-lg font-bold text-gray-800">
                {teamScores.team1.score > teamScores.team2.score
                  ? `🏆 ${teamScores.team1.name} Wins!`
                  : teamScores.team2.score > teamScores.team1.score
                  ? `🏆 ${teamScores.team2.name} Wins!`
                  : "🤝 Teams Tied!"}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          <div
            onClick={handleNewGame}
            className="w-full text-center text-white bg-green-500 hover:bg-green-600 active:bg-green-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
          >
            🚀 Start New Game
          </div>
        </div>
      </main>
    </div>
  );
}

export default GameComplete;

import { useEffect, useState } from "react";
import {
  useAppDispatch,
  useCurrentPlayer,
  usePlayers,
  useGame,
} from "../store/hooks";
import { updatePlayerReady, startGame } from "../store/slices/gameSlice";

function WaitingRoom() {
  const dispatch = useAppDispatch();
  const currentPlayer = useCurrentPlayer();
  const players = usePlayers();
  const { gameId } = useGame();
  const [isReady, setIsReady] = useState(false);

  // Detailed console logging
  console.log("=== WAITING ROOM DEBUG ===");
  console.log("Current Player:", currentPlayer);
  console.log("Players Object:", players);
  console.log("Game ID:", gameId);

  const playersList = Object.values(players);
  const playersCount = playersList.length;
  const allReady = playersList.every((p) => p.isReady);
  const canStart = playersCount === 4 && allReady;

  console.log("Players List:", playersList);
  console.log("Players Count:", playersCount);
  console.log("All Ready:", allReady);
  console.log("Can Start:", canStart);
  console.log("========================");

  const handleReadyToggle = async () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    dispatch(
      updatePlayerReady({
        gameId,
        playerId: currentPlayer.id,
        ready: newReadyState,
      })
    );
  };

  const handleStartGame = async () => {
    if (canStart) {
      dispatch(startGame({ gameId, players }));
    }
  };

  useEffect(() => {
    if (currentPlayer?.id && players[currentPlayer.id]) {
      setIsReady(players[currentPlayer.id].isReady || false);
    }
  }, [players, currentPlayer]);

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center">
      <main className="px-4 py-2 flex flex-col w-full items-center justify-center">
        {/* Room Status */}
        <div className="bg-white rounded-3xl shadow-xl px-8 py-4 w-full max-w-md mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              🎴 Main Room
            </h2>
            <p className="text-gray-600">{playersCount}/4 players joined</p>
          </div>
          {/* Players List */}
          <div className="space-y-3 mb-6">
            {Array.from({ length: 4 }, (_, index) => {
              const player = playersList[index];
              const isEmpty = !player;
              const isCurrentPlayer = player?.id === currentPlayer?.id;

              return (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded-xl border-2 transition-all duration-200 ${
                    isEmpty
                      ? "border-dashed border-gray-300 bg-gray-50"
                      : player.isReady
                      ? "border-green-300 bg-green-50"
                      : "border-yellow-300 bg-yellow-50"
                  } ${isCurrentPlayer ? "ring-2 ring-blue-400" : ""}`}
                >
                  <div className="flex-shrink-0 mr-3">
                    {isEmpty ? (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm">?</span>
                      </div>
                    ) : (
                      <img
                        src={player.avatar || "/default-avatar.png"}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate text-sm ${
                        isEmpty ? "text-gray-500" : "text-gray-800"
                      }`}
                    >
                      {isEmpty ? "Waiting for player..." : player.name}
                      {isCurrentPlayer && " (You)"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center text-green-500 gap-2 text-sm">
                    {player?.isReady && "Ready"}
                    {!isEmpty && (
                      <div
                        className={`w-3 h-3 rounded-full ${
                          player.isReady ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ready Status */}
          {playersCount > 0 && (
            <div className="text-center text-sm text-gray-600 mb-4">
              {allReady && playersCount === 4
                ? "✅ All players ready!"
                : `${
                    playersList.filter((p) => p.isReady).length
                  }/${playersCount} players ready`}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-2">
          {/* Ready Toggle Button */}
          {!canStart && (
            <div
              onClick={handleReadyToggle}
              className={`w-full !text-black py-2 text-center px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                isReady
                  ? "!bg-green-500 hover:!bg-green-600 !text-white"
                  : "!bg-yellow-500 hover:bg-yellow-600 !text-white"
              }`}
            >
              {isReady ? "✅ Ready" : "⏳ Mark as Ready"}
            </div>
          )}

          {/* Start Game Button */}
          {canStart && (
            <div
              onClick={handleStartGame}
              className="w-full text-center text-white bg-green-500 hover:bg-blue-600 active:bg-blue-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              🚀 Start Game
            </div>
          )}

          {/* Waiting Message */}
          {!canStart && playersCount < 4 && (
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-blue-700 font-medium">
                Waiting for {4 - playersCount} more player
                {4 - playersCount !== 1 ? "s" : ""}...
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Share this room with your friends!
              </p>
            </div>
          )}

          {playersCount === 4 && !allReady && (
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-yellow-700 font-medium">
                Waiting for all players to be ready...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default WaitingRoom;

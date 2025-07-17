import { useEffect, useState } from "react";
import {
  useAppDispatch,
  useCurrentPlayer,
  usePlayers,
  useGame,
} from "../store/hooks";
import { updatePlayerReady, startGame } from "../store/slices/gameSlice";
import { logout } from "../store/slices/authSlice";
import { bgStyle } from "../utils/background";

function WaitingRoom() {
  const dispatch = useAppDispatch();
  const currentPlayer = useCurrentPlayer();
  const players = usePlayers();
  const { gameId } = useGame();
  const [isReady, setIsReady] = useState(false);
  const [selectedTrumpChooser, setSelectedTrumpChooser] = useState(null);
  const [playerArrangement, setPlayerArrangement] = useState([
    null,
    null,
    null,
    null,
  ]); // [bottom, left, top, right]
  const [showTeamArrangement, setShowTeamArrangement] = useState(false);

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
  console.log("Player Arrangement:", playerArrangement);
  console.log("Show Team Arrangement:", showTeamArrangement);
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
      const teams = getTeams();
      console.log("🚀 Starting game with:", {
        playerArrangement: showTeamArrangement ? playerArrangement : null,
        teams: teams,
        manualTrumpSelector: selectedTrumpChooser,
      });
      dispatch(
        startGame({
          gameId,
          players,
          manualTrumpSelector: selectedTrumpChooser,
          playerArrangement: showTeamArrangement ? playerArrangement : null,
          teams: teams,
        })
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // Helper function to get teams based on arrangement
  const getTeams = () => {
    if (playerArrangement.filter((p) => p !== null).length !== 4) {
      return null;
    }

    const [bottom, left, top, right] = playerArrangement;
    return {
      team1: {
        players: [bottom, top].filter((p) => p !== null),
        name: "Team 1 (North-South)",
      },
      team2: {
        players: [left, right].filter((p) => p !== null),
        name: "Team 2 (East-West)",
      },
    };
  };

  // Handle player slot assignment
  const handleSlotClick = (slotIndex) => {
    console.log("🎯 handleSlotClick called:", {
      slotIndex,
      showTeamArrangement,
    });
    if (!showTeamArrangement) return;

    // Find unassigned players
    const unassignedPlayers = playersList.filter(
      (player) => !playerArrangement.includes(player.id)
    );

    console.log("🎯 Slot click debug:", {
      slotIndex,
      playersList: playersList.map((p) => ({ id: p.id, name: p.name })),
      currentArrangement: playerArrangement,
      unassignedPlayers: unassignedPlayers.map((p) => ({
        id: p.id,
        name: p.name,
      })),
    });

    if (unassignedPlayers.length > 0) {
      // Assign first unassigned player to this slot
      const newArrangement = [...playerArrangement];
      newArrangement[slotIndex] = unassignedPlayers[0].id;
      console.log("🎯 Assigning player to slot:", {
        slotIndex,
        playerId: unassignedPlayers[0].id,
        newArrangement,
      });
      setPlayerArrangement(newArrangement);
    } else if (playerArrangement[slotIndex] !== null) {
      // Remove player from this slot
      const newArrangement = [...playerArrangement];
      newArrangement[slotIndex] = null;
      console.log("🎯 Removing player from slot:", {
        slotIndex,
        newArrangement,
      });
      setPlayerArrangement(newArrangement);
    }
  };

  // Reset arrangement
  const resetArrangement = () => {
    setPlayerArrangement([null, null, null, null]);
  };

  // Auto-arrange players in order they joined
  const autoArrange = () => {
    // Shuffle the playersList array
    const shuffledPlayers = playersList.sort(() => Math.random() - 0.5);
    const newArrangement = [null, null, null, null];

    // Assign players to the arrangement
    shuffledPlayers.forEach((player, index) => {
      if (index < 4) {
        newArrangement[index] = player.id;
      }
    });

    setPlayerArrangement(newArrangement);
  };

  useEffect(() => {
    if (currentPlayer?.id && players[currentPlayer.id]) {
      setIsReady(players[currentPlayer.id].isReady || false);
    }
  }, [players, currentPlayer]);

  useEffect(() => {
    // Reset trump chooser selection if the selected player is no longer in the game
    if (selectedTrumpChooser && !players[selectedTrumpChooser]) {
      setSelectedTrumpChooser(null);
    }
  }, [players, selectedTrumpChooser]);

  return (
    <div
      style={bgStyle}
      className="min-h-screen min-w-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center"
    >
      <main className="px-4 py-2 flex flex-col w-full items-center justify-center">
        {/* Room Status */}
        <div className="bg-white rounded-3xl shadow-xl px-8 py-4 w-full max-w-md mb-8">
          <div className="my-4 px-2 w-full text-center text-lg font-bold">
            🎴 Court Piece 🎴
          </div>
          <div className="flex justify-between text-center mb-6 relative">
            {/* Logout Button */}

            <h2 className="text-xl font-bold text-gray-800 mb-2">Main Room</h2>
            <div
              onClick={handleLogout}
              className=" flex gap-2 items-center text-gray-500 hover:text-red-500 transition-colors duration-200 cursor-pointer"
              aria-label="Logout"
            >
              Logout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
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

          {/* Trump Chooser Selection */}
          {playersCount >= 2 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">
                Who chooses trump?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {playersList.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedTrumpChooser(player.id)}
                    className={`p-2 bg-white rounded-lg border-2 transition-all duration-200 text-sm cursor-pointer text-center ${
                      selectedTrumpChooser === player.id
                        ? "border-green-500 bg-green-50 text-blue-700"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={player.avatar || "/default-avatar.png"}
                        alt={player.name}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="truncate">
                        {player.name.split(" ")[0]}
                        {player.id === currentPlayer?.id && " (You)"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {!selectedTrumpChooser && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  If no one is selected, it will rotate automatically
                </p>
              )}
            </div>
          )}

          {/* Team Arrangement Section */}
          {playersCount >= 2 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Team Arrangement
                </h3>
                <div
                  onClick={() => setShowTeamArrangement(!showTeamArrangement)}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {showTeamArrangement ? "Hide" : "Show"}
                </div>
              </div>

              {showTeamArrangement && (
                <div className="space-y-3">
                  {/* Table Layout */}
                  <div className="relative bg-green-100 rounded-lg p-4 pt-2 min-h-[240px]">
                    <div className="text-xs text-gray-500 text-center">
                      Arrange players
                    </div>

                    {/* Top player */}
                    <div
                      className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => handleSlotClick(2)}
                    >
                      {playerArrangement[2] ? (
                        <div className="text-center">
                          <img
                            src={
                              players[playerArrangement[2]]?.avatar ||
                              "/default-avatar.png"
                            }
                            alt="Top player"
                            className="w-8 h-8 rounded-full mx-auto mb-1"
                          />
                          <div className="text-xs text-gray-600">
                            {players[playerArrangement[2]]?.name?.split(" ")[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">Top</div>
                      )}
                    </div>

                    {/* Left player */}
                    <div
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => handleSlotClick(1)}
                    >
                      {playerArrangement[1] ? (
                        <div className="text-center">
                          <img
                            src={
                              players[playerArrangement[1]]?.avatar ||
                              "/default-avatar.png"
                            }
                            alt="Left player"
                            className="w-8 h-8 rounded-full mx-auto mb-1"
                          />
                          <div className="text-xs text-gray-600">
                            {players[playerArrangement[1]]?.name?.split(" ")[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">Left</div>
                      )}
                    </div>

                    {/* Right player */}
                    <div
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => handleSlotClick(3)}
                    >
                      {playerArrangement[3] ? (
                        <div className="text-center">
                          <img
                            src={
                              players[playerArrangement[3]]?.avatar ||
                              "/default-avatar.png"
                            }
                            alt="Right player"
                            className="w-8 h-8 rounded-full mx-auto mb-1"
                          />
                          <div className="text-xs text-gray-600">
                            {players[playerArrangement[3]]?.name?.split(" ")[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">Right</div>
                      )}
                    </div>

                    {/* Bottom player */}
                    <div
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => handleSlotClick(0)}
                    >
                      {playerArrangement[0] ? (
                        <div className="text-center">
                          <img
                            src={
                              players[playerArrangement[0]]?.avatar ||
                              "/default-avatar.png"
                            }
                            alt="Bottom player"
                            className="w-8 h-8 rounded-full mx-auto mb-1"
                          />
                          <div className="text-xs text-gray-600">
                            {players[playerArrangement[0]]?.name?.split(" ")[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">Bottom</div>
                      )}
                    </div>
                  </div>

                  {/* Arrangement Controls */}
                  <div className="flex gap-2">
                    <div
                      onClick={autoArrange}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Auto Arrange
                    </div>
                    <div
                      onClick={resetArrangement}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Reset
                    </div>
                  </div>

                  {/* Team Display */}
                  {(() => {
                    const teams = getTeams();
                    return teams ? (
                      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium mb-1">Teams:</div>
                        <div className="space-y-1">
                          <div>
                            <span className="font-medium text-blue-600">
                              {teams.team1.name}:
                            </span>{" "}
                            {teams.team1.players
                              .map((id) => players[id]?.name?.split(" ")[0])
                              .join(" & ")}
                          </div>
                          <div>
                            <span className="font-medium text-red-600">
                              {teams.team2.name}:
                            </span>{" "}
                            {teams.team2.players
                              .map((id) => players[id]?.name?.split(" ")[0])
                              .join(" & ")}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
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
        </div>
      </main>
    </div>
  );
}

export default WaitingRoom;

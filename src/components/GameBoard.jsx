import { useEffect, useState } from "react";
import {
  useAppDispatch,
  useCurrentPlayer,
  usePlayers,
  useGame,
  useSelectedCard,
  useIsMyTurn,
  useAuth,
} from "../store/hooks";
import { playCard, endGame } from "../store/slices/gameSlice";
import { setSelectedCard } from "../store/slices/uiSlice";
import { SUIT_SYMBOLS, SUIT_COLORS } from "../utils/gameConstants";
import { canPlayCard, sortCards } from "../utils/gameUtils";
import Card from "./Card";

function GameBoard() {
  // ===== HOOKS & STATE =====
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const currentPlayer = useCurrentPlayer();
  const players = usePlayers();
  const { currentHand, currentTurn, leadSuit, trumpSuit, handNumber, gameId } =
    useGame();
  const selectedCard = useSelectedCard();
  const isMyTurn = useIsMyTurn();
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);

  // ===== COMPUTED VALUES =====
  // Use consistent sorted ordering to match the turn logic in completeHand
  const playerIds = Object.keys(players).sort(); // Alphabetical sort for consistency
  const playersList = playerIds.map((id) => players[id]).filter(Boolean); // Convert IDs to player objects
  const rawPlayerCards = currentPlayer?.id
    ? players[currentPlayer.id]?.cards || []
    : [];
  const currentPlayerCards = sortCards(rawPlayerCards); // Sort cards by suit and value
  const currentTurnPlayer = playersList[currentTurn];

  // ===== DEBUG LOGGING =====
  console.log("=== GAME BOARD DEBUG ===");
  console.log("Auth User:", user);
  console.log("Current Player:", currentPlayer);
  console.log("Raw Players Object:", players);
  console.log("Players List (Object.values):", playersList);
  console.log("Players List Length:", playersList.length);
  console.log(
    "Players List IDs:",
    playersList.map((p) => p.id)
  );
  console.log("Current Hand:", currentHand);
  console.log("Hand Number:", handNumber);
  console.log("Trump Suit:", trumpSuit);
  console.log("Lead Suit:", leadSuit);
  console.log("Current Turn:", currentTurn, "Player:", currentTurnPlayer?.name);
  console.log("Players scores:");
  Object.values(players).forEach((p) => {
    console.log(
      `  ${p.name}: ${p.handsWon || 0} hands won, ${
        p.cards?.length || 0
      } cards remaining (ID: ${p.id})`
    );
  });
  console.log("Current Player Cards Count:", currentPlayerCards.length);
  console.log("Current Player Cards:", currentPlayerCards);
  console.log("========================");

  // ===== EFFECTS =====
  useEffect(() => {
    dispatch(setSelectedCard(null));
  }, [currentTurn, dispatch]);

  // ===== SAFETY CHECKS =====
  if (!currentPlayer?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Player Not Found
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Unable to load your player data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  if (playersList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Loading Players...
          </h3>
          <p className="text-gray-600 text-sm">
            Waiting for player data to load.
          </p>
        </div>
      </div>
    );
  }

  // ===== EVENT HANDLERS =====
  const handleCardSelect = (card) => {
    if (!isMyTurn) return;

    const canPlay = canPlayCard(card, currentPlayerCards, leadSuit);
    if (!canPlay) return;

    if (
      selectedCard?.suit === card.suit &&
      selectedCard?.value === card.value
    ) {
      dispatch(setSelectedCard(null));
    } else {
      dispatch(setSelectedCard(card));
    }
  };

  const handlePlayCard = async () => {
    if (selectedCard && isMyTurn) {
      dispatch(
        playCard({
          gameId,
          card: selectedCard,
          playerId: currentPlayer.id,
          players,
          currentHand,
          currentTurn,
          leadSuit,
        })
      );
      dispatch(setSelectedCard(null));
    }
  };

  const handleEndGame = () => setShowEndGameConfirm(true);
  const confirmEndGame = () => {
    dispatch(endGame({ gameId }));
    setShowEndGameConfirm(false);
  };
  const cancelEndGame = () => setShowEndGameConfirm(false);

  // ===== UTILITY FUNCTIONS =====
  const getPlayerTableIndex = (playerId) => {
    // Find the player's index in the playersList
    return playersList.findIndex((player) => player.id === playerId);
  };

  const getCardPosition = (playerId) => {
    // Find the current player's index and the card player's index
    const currentPlayerIndex = getPlayerTableIndex(currentPlayer.id);
    const cardPlayerIndex = getPlayerTableIndex(playerId);

    // Calculate relative position from current player's perspective
    // Current player is always at bottom (position 0)
    // Other players are positioned relative to current player
    let relativePosition;
    if (cardPlayerIndex === currentPlayerIndex) {
      relativePosition = 0; // Bottom (current player)
    } else {
      // Calculate relative position (1, 2, 3 for left, top, right)
      relativePosition = (cardPlayerIndex - currentPlayerIndex + 4) % 4;
    }

    const cardPositions = [
      { bottom: "10px", left: "50%", transform: "translateX(-50%)" }, // Bottom (current player)
      { left: "10px", top: "50%", transform: "translateY(-50%)" }, // Left
      { top: "10px", left: "50%", transform: "translateX(-50%)" }, // Top (opposite player)
      { right: "10px", top: "50%", transform: "translateY(-50%)" }, // Right
    ];

    console.log(
      `🎯 Card position for ${players[playerId]?.name}: player index ${cardPlayerIndex}, current player index ${currentPlayerIndex}, relative position ${relativePosition}`
    );

    return cardPositions[relativePosition] || cardPositions[0];
  };

  // ===== SUB-COMPONENTS =====

  // Component: Player Info Area (displays other players around the table)
  const PlayerInfoArea = ({ player, index }) => {
    // Calculate relative position from current player's perspective
    const currentPlayerIndex = getPlayerTableIndex(currentPlayer.id);
    const playerIndex = getPlayerTableIndex(player.id);

    // Calculate relative position (1, 2, 3 for left, top, right)
    const relativePosition = (playerIndex - currentPlayerIndex + 4) % 4;

    // Map relative positions to actual screen positions
    const positionMap = {
      1: "left", // Player to the left
      2: "top", // Player opposite (top)
      3: "right", // Player to the right
    };

    const position = positionMap[relativePosition];
    const isPlayerTurn = index === currentTurn;

    // Debug logging
    console.log(
      `🎯 PlayerInfoArea - Player: ${player.name}, Index: ${playerIndex}, Current: ${currentPlayerIndex}, Relative: ${relativePosition}, Position: ${position}`
    );

    const positionClasses = {
      top: "absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-2/2",
      left: "absolute left-6 top-1/2 transform -translate-y-1/2 rotate-90 -translate-x-1/2",
      right:
        "absolute right-6 top-1/2 transform -translate-y-1/2 -rotate-90 translate-x-1/2",
    };

    return (
      <div key={player.id} className={positionClasses[position]}>
        <div
          className={`
          bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-2 min-w-[100px] transition-all duration-300
          ${
            isPlayerTurn
              ? "ring-2 ring-yellow-400 ring-opacity-75 bg-yellow-50/90"
              : ""
          }
        `}
        >
          <div className={`flex items-center space-x-2 mb-2`}>
            <img
              src={player.avatar || "/default-avatar.png"}
              alt={player.name}
              className="w-6 h-6 rounded-full border"
            />
            <div className="min-w-0 flex-1 text-center">
              <p className="font-medium text-xs truncate text-gray-800">
                {player.name.split(" ")[0]}
              </p>
              <p className="text-xs text-gray-500">
                {player.handsWon || 0} hands
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component: Game Header (hand counter, trump display, turn indicator)
  const GameHeader = () => (
    <header className="pt-safe-top px-4 py-2 bg-green-900/90 backdrop-blur-sm text-white relative z-10">
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">Hand {handNumber}/13</span>
        <div
          onClick={handleEndGame}
          className="ml-4 !bg-red-600 hover:!bg-red-700 active:bg-red-800 text-white text-xs font-medium px-3 py-1 rounded-lg transition-all duration-200"
        >
          End Game
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm animate-pulse">
          {isMyTurn
            ? "🎯 Your turn"
            : `${currentTurnPlayer?.name.split(" ")[0] || "Player"}'s turn`}
        </div>

        {trumpSuit && (
          <div className="flex items-center space-x-2 text-white px-3 rounded-full">
            <span className="text-sm font-bold">Trump:</span>
            <span className={`text-lg font-bold ${SUIT_COLORS[trumpSuit]}`}>
              {SUIT_SYMBOLS[trumpSuit]}
            </span>
          </div>
        )}
      </div>
    </header>
  );

  // Component: Card Table Center (shows played cards in a circle)
  const CardTable = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-green-700/80 border-4 border-yellow-600/50 rounded-full p-8 w-80 h-80 flex items-center justify-center shadow-2xl">
          {currentHand.length > 0 ? (
            <div className="relative w-full h-full">
              {currentHand.map((handCard, index) => (
                <div
                  key={`${handCard.suit}-${handCard.value}-${handCard.playerId}-${index}`}
                  className="absolute flex flex-col items-center"
                  style={getCardPosition(handCard.playerId)}
                >
                  {(index === 0 || index === 1 || index == 2) && (
                    <p className="text-xs text-yellow-200 mt-1 bg-black/50 px-2 py-1 rounded font-medium">
                      {players[handCard.playerId]?.name?.split(" ")[0] ||
                        "Player"}
                    </p>
                  )}
                  <Card card={handCard} size="sm" />
                  {index === 3 && (
                    <p className="text-xs text-yellow-200 mt-1 bg-black/50 px-2 py-1 rounded font-medium">
                      {players[handCard.playerId]?.name?.split(" ")[0] ||
                        "Player"}
                    </p>
                  )}
                </div>
              ))}

              {currentHand.length === 4 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                    🏆 Evaluating who won...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-yellow-200">
              <div className="text-6xl mb-4">🎴</div>
              <p className="text-sm opacity-80">Waiting for first card...</p>
              {leadSuit && (
                <p className="text-sm mt-2 bg-black/30 px-3 py-1 rounded">
                  Lead:{" "}
                  <span className={SUIT_COLORS[leadSuit]}>
                    {SUIT_SYMBOLS[leadSuit]}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component: Player Hand Area (current player's cards and controls)
  const PlayerHandArea = () => {
    // If player has no cards but game is still ongoing, show a message
    if (currentPlayerCards.length === 0) {
      if (handNumber != 12) {
        return (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-red-900 to-red-800 border-t-4 border-red-600 pb-safe-bottom">
            <div className="px-4 py-6 text-center text-white">
              <div className="text-4xl mb-2">🚫</div>
              <p className="text-lg font-bold mb-2">No Cards Available</p>
              <p className="text-sm opacity-80">
                You have no cards in your hand. This might be a sync issue.
              </p>
              <p className="text-xs mt-2 opacity-60">
                Hand {handNumber + 1}/13 • Cards: {currentPlayerCards.length}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                🔄 Refresh Game
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="py-4 text-center fixed bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-500 to-yellow-600  pb-safe-bottom">
            No Cards Left
          </div>
        );
      }
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 border-t-2 border-yellow-600 pb-safe-bottom">
        {/* Player Info Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 text-white">
          <div className="flex items-center space-x-2">
            <img
              src={currentPlayer?.avatar || "/default-avatar.png"}
              alt="You"
              className="w-6 h-6 rounded-full border-2 border-yellow-400"
            />
            <div>
              <p className="font-bold text-xs">You</p>
              <p className="text-xs text-gray-300">
                {currentPlayer?.handsWon || 0} hands won
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium">
              {currentPlayerCards.length} cards
            </p>
            {isMyTurn && (
              <p className="text-xs text-yellow-400 animate-pulse">
                🎯 Your turn
              </p>
            )}
          </div>
        </div>

        {/* Selected Card Action */}
        {selectedCard && (
          <div
            onClick={handlePlayCard}
            className="mb-4 text-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-2 px-8 rounded-xl transition-all duration-200 shadow-lg text-sm"
          >
            Play {selectedCard.value} of {selectedCard.suit}{" "}
            <span className={SUIT_COLORS[selectedCard.suit]}>
              {SUIT_SYMBOLS[selectedCard.suit]}
            </span>
          </div>
        )}

        {/* Hand Cards */}
        <div className="px-0 py-3">
          <div className="flex items-center justify-center w-screen">
            <div className="relative flex items-center justify-center">
              {currentPlayerCards.map((card, index) => {
                const isPlayable = canPlayCard(
                  card,
                  currentPlayerCards,
                  leadSuit
                );
                const isSelected =
                  selectedCard?.suit === card.suit &&
                  selectedCard?.value === card.value;

                // Calculate positioning to center the entire hand
                const cardOverlap = 22; // Overlap between cards
                const cardWidth = 48; // Width of sm card (w-12 = 48px)
                const totalHandWidth =
                  (currentPlayerCards.length - 1) * cardOverlap + cardWidth;
                const centerOffset = -totalHandWidth / 2; // Offset to center the hand
                const offsetX = centerOffset + index * cardOverlap;
                const selectedOffset = isSelected ? -10 : 0;

                return (
                  <div
                    key={`${card.suit}-${card.value}-${index}`}
                    className="absolute transition-all duration-200"
                    style={{
                      left: `${offsetX}px`,
                      transform: `translateY(${selectedOffset}px)`,
                      zIndex: isSelected ? 20 : 10 + index,
                    }}
                  >
                    <Card
                      card={card}
                      onClick={isMyTurn ? handleCardSelect : undefined}
                      isPlayable={isMyTurn && isPlayable}
                      isSelected={isSelected}
                      size="sm"
                    />
                  </div>
                );
              })}

              {/* Container to maintain proper height */}
              <div
                style={{
                  width: "1px", // Minimal width since positioning is absolute
                  height: "64px",
                }}
                className="relative"
              />
            </div>
          </div>

          {/* Card info display
          {currentPlayerCards.length > 0 && (
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-400 mb-1">
                Your hand ({currentPlayerCards.length} cards):
              </div>
              <div className="flex flex-wrap justify-center gap-1 text-xs max-w-full overflow-hidden">
                {currentPlayerCards.map((card, index) => {
                  const isPlayable = canPlayCard(
                    card,
                    currentPlayerCards,
                    leadSuit
                  );
                  const isSelected =
                    selectedCard?.suit === card.suit &&
                    selectedCard?.value === card.value;

                  return (
                    <span
                      key={`info-${card.suit}-${card.value}-${index}`}
                      className={`
                        px-1.5 py-0.5 rounded text-xs transition-all duration-200 flex-shrink-0
                        ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-700 text-gray-200"
                        }
                        ${!isPlayable ? "opacity-50" : ""}
                        ${
                          isMyTurn && isPlayable
                            ? "cursor-pointer hover:bg-gray-600"
                            : "cursor-default"
                        }
                      `}
                      onClick={
                        isMyTurn && isPlayable
                          ? () => handleCardSelect(card)
                          : undefined
                      }
                    >
                      {card.value}
                      <span className={SUIT_COLORS[card.suit]}>
                        {SUIT_SYMBOLS[card.suit]}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )} */}
        </div>

        {/* Turn Info */}
        <div className="px-4 pb-2 text-center">
          {isMyTurn ? (
            <p className="text-yellow-400 font-bold text-xs">
              🎯 Select a card to play
            </p>
          ) : (
            <p className="text-gray-300 text-xs">
              Waiting for {currentTurnPlayer?.name || "player"} to play...
            </p>
          )}
        </div>
      </div>
    );
  };

  // Component: End Game Confirmation Dialog
  const EndGameDialog = () => {
    if (!showEndGameConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">End Game?</h3>
            <p className="text-gray-600 text-sm">
              This will end the current game and return all players to the
              waiting room. This action cannot be undone.
            </p>
          </div>

          <div className="flex space-x-3">
            <div
              onClick={cancelEndGame}
              className="flex-1 text-center btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Cancel
            </div>
            <button
              onClick={confirmEndGame}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              End Game
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-green-800 to-green-600 relative overflow-hidden">
      <GameHeader />

      {/* Game Area - Full Screen Table */}
      <main className="absolute inset-0 top-16 bottom-40 sm:bottom-32">
        <CardTable />

        {/* Player Info Areas - Around the table */}
        {playersList
          .filter((player) => player.id !== currentPlayer?.id)
          .map((player) => {
            // Calculate the original index for position mapping
            const originalIndex = playersList.findIndex(
              (p) => p.id === player.id
            );
            return (
              <PlayerInfoArea
                key={player.id}
                player={player}
                index={originalIndex}
              />
            );
          })}
      </main>

      <PlayerHandArea />
      <EndGameDialog />
    </div>
  );
}

export default GameBoard;

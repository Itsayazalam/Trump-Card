import { useState } from "react";
import {
  useAppDispatch,
  useCurrentPlayer,
  usePlayers,
  useGame,
} from "../store/hooks";
import { selectTrump } from "../store/slices/gameSlice";
import { SUITS, SUIT_SYMBOLS, SUIT_COLORS } from "../utils/gameConstants";
import Card from "./Card";
import { bgStyle } from "../utils/background";

function TrumpSelector() {
  const dispatch = useAppDispatch();
  const currentPlayer = useCurrentPlayer();
  const players = usePlayers();
  const { trumpSelector, gameId, deck } = useGame();
  const [selectedSuit, setSelectedSuit] = useState(null);

  const isSelector = currentPlayer?.id === trumpSelector;
  const selectorPlayer = trumpSelector ? players[trumpSelector] : null;
  const currentPlayerCards = currentPlayer?.id
    ? players[currentPlayer.id]?.cards || []
    : [];

  const handleSuitSelect = (suit) => {
    setSelectedSuit(suit);
  };

  const handleConfirmTrump = async () => {
    if (selectedSuit && isSelector) {
      dispatch(
        selectTrump({
          gameId,
          suit: selectedSuit,
          players,
          deck,
        })
      );
    }
  };

  return (
    <div
      style={bgStyle}
      className="min-h-screen min-w-screen bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col"
    >
      {/* Main Content */}
      <main className="flex-1 px-4 py-8 flex flex-col items-center justify-center space-y-8">
        {/* Selector Info */}
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-4">👑</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 ">
              {isSelector
                ? "Your Turn to Select Trump"
                : "Waiting for Trump Selection"}
            </h2>
            {selectorPlayer && (
              <div className="flex items-center justify-center space-x-3 mb-4 animate-pulse">
                <img
                  src={selectorPlayer.avatar || "/default-avatar.png"}
                  alt={selectorPlayer.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-700 font-medium">
                  {isSelector ? "You" : selectorPlayer.name} choosing trump
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Hand Preview */}
        {currentPlayerCards.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-4xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Your first 5 Five Cards
            </h3>
            <div className="flex flex-wrap justify-center gap-2 overflow-x-auto pb-2">
              {currentPlayerCards.map((card, index) => (
                <Card
                  key={`${card.suit}-${card.value}-${index}`}
                  card={card}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Trump Selection */}
        {isSelector ? (
          <div className="bg-white rounded-3xl shadow-xl px-6 py-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              Choose Trump Suit
            </h3>

            {/* Suit Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {SUITS.map((suit) => (
                <div
                  key={suit}
                  onClick={() => handleSuitSelect(suit)}
                  className={`
                    p-6 text-center rounded-2xl border-2 transition-all duration-200 flex flex-col items-center space-y-2
                    ${
                      selectedSuit === suit
                        ? "border-blue-500 bg-blue-50 scale-105"
                        : "border-gray-300 bg-gray-50 hover:border-gray-400"
                    }
                  `}
                >
                  <div
                    className={`text-4xl ${SUIT_COLORS[suit]}`}
                    style={{
                      color:
                        suit === "hearts" || suit === "diamonds"
                          ? "#dc2626"
                          : "#1f2937",
                    }}
                  >
                    {SUIT_SYMBOLS[suit]}
                  </div>
                  <span className="capitalize font-medium text-gray-700">
                    {suit}
                  </span>
                </div>
              ))}
            </div>

            {/* Confirm Button */}
            <div
              onClick={handleConfirmTrump}
              disabled={!selectedSuit}
              className={`
                w-full py-4 text-center px-6 !text-black rounded-xl font-semibold text-lg transition-all duration-200
                ${
                  selectedSuit
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {selectedSuit
                ? `Confirm ${
                    selectedSuit.charAt(0).toUpperCase() + selectedSuit.slice(1)
                  } as Trump`
                : "Select a suit first"}
            </div>
          </div>
        ) : (
          <div className="">
            <div className="text-center">
              <p className="text-white font-medium text-sm">
                Waiting for {selectorPlayer?.name || "trump selector"} to choose
                the trump to start the game
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TrumpSelector;

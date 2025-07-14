// Game constants
export const GAME_STATES = {
  WAITING: "waiting",
  TRUMP_SELECTION: "trump_selection",
  PLAYING: "playing",
  HAND_COMPLETE: "hand_complete",
  GAME_COMPLETE: "game_complete",
};

export const SUITS = ["hearts", "diamonds", "clubs", "spades"];
export const VALUES = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export const SUIT_SYMBOLS = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export const SUIT_COLORS = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-black",
  spades: "text-black",
};

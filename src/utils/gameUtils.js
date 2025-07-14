// Game utility functions
import { SUITS, VALUES } from "./gameConstants";

export function generateDeck() {
  const deck = [];
  SUITS.forEach((suit) => {
    VALUES.forEach((value) => {
      deck.push({ suit, value });
    });
  });
  return deck;
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardValue(card) {
  const valueMap = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };
  return valueMap[card.value];
}

export function determineHandWinner(hand, leadSuit, trumpSuit) {
  // Separate trump cards and lead suit cards
  const trumpCards = hand.filter((card) => card.suit === trumpSuit);
  const leadSuitCards = hand.filter((card) => card.suit === leadSuit);

  // If there are trump cards, highest trump wins
  if (trumpCards.length > 0) {
    return trumpCards.reduce((highest, card) =>
      getCardValue(card) > getCardValue(highest) ? card : highest
    );
  }

  // Otherwise, highest card of lead suit wins
  return leadSuitCards.reduce((highest, card) =>
    getCardValue(card) > getCardValue(highest) ? card : highest
  );
}

export function determineGameWinner(players) {
  return Object.values(players).reduce((winner, player) =>
    (player.handsWon || 0) > (winner.handsWon || 0) ? player : winner
  );
}

export function canPlayCard(card, playerCards, leadSuit) {
  // If no lead suit yet, any card can be played
  if (!leadSuit) return true;

  // Check if player has cards of the lead suit
  const hasLeadSuit = playerCards.some((c) => c.suit === leadSuit);

  // If player has lead suit cards, they must play one
  if (hasLeadSuit) {
    return card.suit === leadSuit;
  }

  // If player doesn't have lead suit, they can play any card
  return true;
}

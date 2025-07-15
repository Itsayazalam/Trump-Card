# Redux State Management Setup

This document explains the Redux implementation for the Judgement card game application.

## 🏗️ Redux Architecture Overview

The application uses **Redux Toolkit** with the following structure:

```
src/store/
├── store.js              # Main store configuration
├── hooks.js              # Typed hooks for React-Redux
├── firebaseMiddleware.js # Firebase real-time integration
└── slices/
    ├── authSlice.js      # Authentication state
    ├── gameSlice.js      # Game state and logic
    └── uiSlice.js        # UI state (modals, loading, etc.)
```

## 🔧 Store Configuration

### Main Store (`store.js`)

- Combines all slices (auth, game, ui)
- Includes Firebase middleware for real-time updates
- Configured with serializable check exceptions for Firebase

### Slices

#### 1. **Auth Slice** (`authSlice.js`)

Manages user authentication state:

- `user`: Current user object from Firebase Auth
- `isAuthenticated`: Boolean authentication status
- `isLoading`: Loading state for auth operations

**Actions:**

- `setUser(user)`: Set the current user
- `clearUser()`: Clear user on logout
- `setAuthLoading(loading)`: Set loading state

#### 2. **Game Slice** (`gameSlice.js`)

Manages all game-related state:

- `gameId`: Current game room ID
- `players`: Object containing all player data
- `gameState`: Current game state (waiting, trump_selection, playing, etc.)
- `trumpSuit`: Selected trump suit
- `currentHand`: Cards currently in play
- `currentTurn`: Index of current player's turn
- `scores`: Player scores and hands won
- `isConnected`: Firebase connection status

**Actions:**

- `setPlayers(players)`: Update players data
- `setGameState(state)`: Update game state
- `setTrumpSuit(suit)`: Set trump suit
- `updatePlayerCards(playerId, cards)`: Update specific player's cards
- `playCard(card)`: Play a card to the current hand
- `completeHand(winner)`: Complete current hand and update scores
- `resetGame()`: Reset game to initial state

#### 3. **UI Slice** (`uiSlice.js`)

Manages UI-specific state:

- `isLoading`: Global loading state
- `error`: Error messages
- `showModal`: Modal visibility
- `selectedCard`: Currently selected card

**Actions:**

- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error message
- `clearError()`: Clear error
- `setSelectedCard(card)`: Set selected card
- `clearSelectedCard()`: Clear selected card

## 🔥 Firebase Integration

### Firebase Middleware (`firebaseMiddleware.js`)

- Listens for specific Redux actions
- Sets up Firebase real-time listeners
- Syncs local state with Firebase database
- Handles authentication state changes

**Key Features:**

- Automatic Firebase listener setup on user login
- Real-time synchronization of game state
- Cleanup of listeners on logout
- Error handling for Firebase operations

### Firebase Actions in Game Slice

The game slice includes async thunks for Firebase operations:

```javascript
// Example Firebase thunks
joinGame(playerData); // Join game room
updatePlayerReady(ready); // Update ready status
startGame(); // Start game and deal cards
selectTrump(suit); // Select trump suit
playCard(card); // Play a card
```

## 🎯 Component Integration

### Using Redux in Components

#### 1. **Using Hooks**

```javascript
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setSelectedCard } from '../store/slices/uiSlice'

function GameComponent() {
  const dispatch = useAppDispatch()
  const { players, currentTurn } = useAppSelector(state => state.game)
  const { selectedCard } = useAppSelector(state => state.ui)

  const handleCardSelect = (card) => {
    dispatch(setSelectedCard(card))
  }

  return (
    // Component JSX
  )
}
```

#### 2. **Async Actions**

```javascript
import { joinGame } from "../store/slices/gameSlice";

function LoginComponent() {
  const dispatch = useAppDispatch();

  const handleLogin = async (userData) => {
    await dispatch(joinGame(userData));
  };
}
```

## 🔄 State Flow

### 1. **Authentication Flow**

1. User logs in with Google → `setUser()` action
2. Firebase middleware detects auth change
3. Automatically calls `joinGame()` thunk
4. Game state syncs with Firebase

### 2. **Game Flow**

1. Player joins → Updates `players` state
2. All ready → `startGame()` deals cards
3. Trump selection → Updates `trumpSuit`
4. Card playing → Updates `currentHand` and `currentTurn`
5. Hand completion → Updates `scores`

### 3. **Real-time Updates**

1. Any player action updates Firebase
2. Firebase middleware detects changes
3. Dispatches appropriate Redux actions
4. All connected clients receive updates

## 🛠️ Development Tools

### Redux DevTools

The store is configured with Redux DevTools for debugging:

- Time-travel debugging
- Action replay
- State inspection
- Performance monitoring

### Hot Reloading

Redux state persists through hot reloads during development.

## 🔒 Security Considerations

### Firebase Rules

```json
{
  "rules": {
    "games": {
      "main-room": {
        ".read": "auth != null",
        ".write": "auth != null",
        "players": {
          "$uid": {
            ".write": "$uid === auth.uid"
          }
        }
      }
    }
  }
}
```

### Environment Variables

Firebase configuration is stored in environment variables:

- Prevents API keys from being committed to version control
- Allows different configurations for development/production

## 📊 Performance Optimizations

### 1. **Selective Subscriptions**

Components only subscribe to specific slices they need:

```javascript
// Good: Only subscribe to game state
const { players } = useAppSelector((state) => state.game);

// Avoid: Subscribing to entire state
const state = useAppSelector((state) => state);
```

### 2. **Memoization**

Use `createSelector` for expensive computations:

```javascript
import { createSelector } from "@reduxjs/toolkit";

const selectCurrentPlayerCards = createSelector(
  [(state) => state.game.players, (state) => state.auth.user],
  (players, user) => players[user?.uid]?.cards || []
);
```

### 3. **Debounced Actions**

UI actions like card selection are debounced to prevent excessive updates.

## 🐛 Debugging Tips

### 1. **Redux DevTools**

- Monitor action dispatch order
- Inspect state changes
- Debug time-travel

### 2. **Firebase Console**

- Check real-time database for data sync issues
- Monitor authentication events
- Verify security rules

### 3. **Console Logging**

Firebase middleware includes logging for debugging Firebase operations.

## 🚀 Deployment Considerations

### Environment Variables

Ensure all Firebase environment variables are set in production:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- etc.

### Bundle Size

Redux Toolkit is optimized for production builds and includes only necessary code.

---

This Redux setup provides a scalable, maintainable state management solution for the multiplayer card game with real-time Firebase integration.

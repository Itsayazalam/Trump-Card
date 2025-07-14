import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './slices/gameSlice'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import { firebaseMiddleware } from './firebaseMiddleware'

export const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Firebase functions
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'game/setupFirebaseListener',
          'game/setFirebaseListener'
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['game.firebaseListener'],
      },
    }).concat(firebaseMiddleware),
})

// Export types for use in components (when using TypeScript)
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

import { realtimeDb } from '../firebase'
import { ref, onValue, off } from 'firebase/database'
import { setFirebaseData, setConnectionStatus } from './slices/gameSlice'

// Firebase middleware to handle real-time updates
export const firebaseMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  
  // Handle Firebase listener setup
  if (action.type === 'game/setupFirebaseListener') {
    const { gameId } = action.payload
    const state = store.getState()
    
    // Clean up existing listener
    if (state.game.firebaseListener) {
      off(state.game.firebaseListener)
    }
    
    // Set up new listener
    const gameRef = ref(realtimeDb, `games/${gameId}`)
    
    const unsubscribe = onValue(gameRef, 
      (snapshot) => {
        const data = snapshot.val()
        store.dispatch(setFirebaseData(data))
        store.dispatch(setConnectionStatus(true))
      },
      (error) => {
        console.error('Firebase connection error:', error)
        store.dispatch(setConnectionStatus(false))
      }
    )
    
    // Store the unsubscribe function
    store.dispatch({ type: 'game/setFirebaseListener', payload: unsubscribe })
  }
  
  // Handle Firebase listener cleanup
  if (action.type === 'game/cleanupFirebaseListener') {
    const state = store.getState()
    if (state.game.firebaseListener) {
      off(state.game.firebaseListener)
      store.dispatch({ type: 'game/setFirebaseListener', payload: null })
    }
  }
  
  return result
}

// Action creators for Firebase operations
export const setupFirebaseListener = (gameId) => ({
  type: 'game/setupFirebaseListener',
  payload: { gameId }
})

export const cleanupFirebaseListener = () => ({
  type: 'game/cleanupFirebaseListener'
})

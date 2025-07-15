import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  selectedCard: null,
  showChat: false,
  notifications: [],
  isFullscreen: false,
  theme: "light",
  soundEnabled: true,
  animationsEnabled: true,
  showTutorial: false,
  connectionStatus: "connected", // 'connected', 'connecting', 'disconnected'
};

// UI slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedCard: (state, action) => {
      state.selectedCard = action.payload;
    },
    toggleChat: (state) => {
      state.showChat = !state.showChat;
    },
    setShowChat: (state, action) => {
      state.showChat = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        timestamp: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
    },
    setShowTutorial: (state, action) => {
      state.showTutorial = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    resetUI: () => {
      return initialState;
    },
  },
});

export const {
  setSelectedCard,
  toggleChat,
  setShowChat,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleFullscreen,
  setTheme,
  toggleSound,
  toggleAnimations,
  setShowTutorial,
  setConnectionStatus,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

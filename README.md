# Judgement - Multiplayer Card Game

A mobile-friendly React web application for playing the classic Judgement card game with friends. Built with React, Tailwind CSS, and Firebase for real-time multiplayer gameplay.

## 🎮 Game Overview

Judgement is a trick-taking card game where 4 players compete to win the most hands:

- **Players**: Exactly 4 players required
- **Cards**: Each player gets 13 cards (5 initially, then 8 more after trump selection)
- **Trump**: One player selects the trump suit after seeing their first 5 cards
- **Objective**: Win the most hands to be declared the winner
- **Rules**: Follow suit if possible, trump cards beat non-trump cards

## 🚀 Features

### Core Gameplay

- ✅ Real-time multiplayer for 4 players
- ✅ Google Authentication with Gmail
- ✅ Trump suit selection mechanism
- ✅ Card validation and turn management
- ✅ Automatic hand winner determination
- ✅ Live scoring and leaderboard
- ✅ Game completion and winner announcement

### Technical Features

- 📱 Mobile-first responsive design
- ⚡ Real-time updates via Firebase Realtime Database
- 🔐 Secure Google OAuth authentication
- 🎨 Beautiful UI with Tailwind CSS
- 🎮 Touch-optimized card interactions
- 💨 Fast development with Vite
- 🔄 Hot module replacement (HMR)

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication + Realtime Database)
- **Deployment**: Ready for Vercel/Netlify

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase project with Authentication and Realtime Database enabled
- Google OAuth configured in Firebase Console

## 🔧 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Google** provider
3. Add your domain to authorized domains

### 3. Setup Realtime Database

1. Go to **Realtime Database** in Firebase Console
2. Create database in test mode
3. Choose your preferred location
4. Update security rules:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        "players": {
          "$uid": {
            ".validate": "$uid === auth.uid"
          }
        }
      }
    }
  }
}
```

### 4. Get Firebase Configuration

1. Go to **Project Settings** > **General**
2. Scroll down to **Your apps**
3. Click **Web app** and register your app
4. Copy the config object

## 🚀 Installation & Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd judgement-card-game

# Install dependencies
npm install
```

### 2. Configure Firebase

Update `src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
};
```

### 3. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Play

### 1. **Join Game**

- Sign in with your Google account
- Wait for 3 other players to join
- Mark yourself as ready

### 2. **Trump Selection**

- First player receives 5 cards
- They choose the trump suit
- All players then receive 8 more cards (13 total)

### 3. **Playing Hands**

- Players take turns playing cards
- Must follow the lead suit if possible
- Trump cards beat non-trump cards
- Highest valid card wins the hand

### 4. **Winning**

- Player who wins the most hands (out of 13) wins the game
- Ties are broken by... most recent hand won

## 📱 Mobile Optimization

The app is optimized for mobile devices with:

- Touch-friendly card interactions
- Responsive layouts for all screen sizes
- Safe area support for devices with notches
- Optimized for portrait orientation
- Fast loading and smooth animations

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Card.jsx         # Individual card component
│   ├── GameBoard.jsx    # Main game interface
│   ├── GameComplete.jsx # End game screen
│   ├── LoginScreen.jsx  # Google auth login
│   ├── MobileButton.jsx # Reusable button component
│   ├── TrumpSelector.jsx# Trump suit selection
│   └── WaitingRoom.jsx  # Player lobby
├── contexts/            # React contexts
│   └── GameContext.jsx  # Game state management
├── utils/              # Utility functions
│   ├── gameConstants.js # Game constants
│   └── gameUtils.js    # Game logic utilities
├── firebase.js         # Firebase configuration
└── App.jsx            # Main app component
```

## 🎨 Customization

### Styling

- Modify `tailwind.config.js` for custom theme
- Update component styles in individual files
- Colors and spacing follow Tailwind conventions

### Game Rules

- Modify game logic in `src/utils/gameUtils.js`
- Update constants in `src/utils/gameConstants.js`
- Extend Firebase database structure as needed

## 🚀 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🐛 Troubleshooting

### Common Issues

**Firebase Connection Issues**

- Verify your Firebase config in `src/firebase.js`
- Check that Realtime Database is enabled
- Ensure authentication is properly configured

**Authentication Problems**

- Verify Google OAuth is enabled in Firebase Console
- Check that your domain is in authorized domains
- Clear browser cache and try again

**Game State Issues**

- Check browser console for errors
- Verify Firebase security rules
- Ensure all 4 players are properly connected

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase for real-time backend services
- Tailwind CSS for beautiful styling
- Vite for lightning-fast development

---

**Enjoy playing Judgement with your friends! 🎴🎉**

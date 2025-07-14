# Firebase Setup Instructions for Judgement Card Game

Follow these step-by-step instructions to set up Firebase for your multiplayer card game.

## 🔥 Firebase Project Setup

### 1. Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `judgement-card-game` (or your preferred name)
4. Choose whether to enable Google Analytics (recommended)
5. Select your Google Analytics account if enabled
6. Click **"Create project"**

### 2. Enable Authentication

1. In your Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"** if it's your first time
3. Go to the **"Sign-in method"** tab
4. Find **"Google"** in the list and click it
5. Toggle **"Enable"** to ON
6. Add your email as a Project support email
7. Click **"Save"**

#### Add Authorized Domains

1. Still in **"Sign-in method"** tab, scroll down to **"Authorized domains"**
2. Add your development domain: `localhost`
3. Later, add your production domain when deploying

### 3. Setup Realtime Database

1. Click **"Realtime Database"** in the left sidebar
2. Click **"Create Database"**
3. Choose a location close to your users (e.g., `us-central1`)
4. Select **"Start in test mode"** for now
5. Click **"Enable"**

#### Configure Database Rules

1. Go to the **"Rules"** tab in Realtime Database
2. Replace the default rules with:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "players": {
          "$uid": {
            ".write": "$uid === auth.uid || auth != null"
          }
        }
      }
    }
  }
}
```

3. Click **"Publish"**

### 4. Get Firebase Configuration

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web** icon `</>`
5. Enter app nickname: `judgement-web-app`
6. **Do NOT** check "Also set up Firebase Hosting" (unless you want to use it)
7. Click **"Register app"**
8. Copy the config object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  measurementId: "G-XXXXXXXXXX",
};
```

## 🔧 Configure Your Application

### 1. Update Firebase Configuration

Open `src/firebase.js` in your project and replace the placeholder config:

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com/",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
```

**⚠️ Important**: Make sure to include the `databaseURL` field for Realtime Database!

### 2. Environment Variables (Optional but Recommended)

For better security, you can use environment variables:

1. Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

2. Update `src/firebase.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
```

3. Add `.env` to your `.gitignore` file to keep secrets safe!

## 🧪 Testing Your Setup

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. Try logging in with your Google account
4. Check Firebase Console > Authentication > Users to see if your login was recorded
5. Check Firebase Console > Realtime Database > Data to see if game data is being created

## 🚀 Production Setup

### Before Deploying:

1. **Update Database Rules** (make them more restrictive):

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

2. **Add Production Domain** to Authorized Domains in Firebase Authentication

3. **Enable Firebase Security Rules** for better protection

### Deployment Options:

#### Option 1: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

#### Option 2: Vercel

```bash
npm install -g vercel
vercel
```

#### Option 3: Netlify

1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify

## 🔍 Troubleshooting

### Common Issues:

**❌ "Firebase: Error (auth/configuration-not-found)"**

- Make sure you've enabled Google sign-in in Firebase Console
- Check that your Firebase config is correct

**❌ "Permission denied" in Realtime Database**

- Verify your database rules allow authenticated users to read/write
- Make sure the user is logged in

**❌ "Firebase: Error (auth/unauthorized-domain)"**

- Add your domain to Authorized Domains in Firebase Console

**❌ Cards not updating in real-time**

- Check that `databaseURL` is included in your Firebase config
- Verify Realtime Database is enabled (not just Firestore)

### Debug Steps:

1. Check browser console for errors
2. Look at Firebase Console > Authentication to see if users are logging in
3. Check Firebase Console > Realtime Database to see if data is being written
4. Verify your Firebase config is complete and accurate

## 📞 Support

If you run into issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Look at the browser console for specific error messages
3. Verify each step in this guide was completed
4. Check that your Firebase project has all required services enabled

---

**🎉 Once everything is set up, you'll have a fully functional multiplayer card game!**

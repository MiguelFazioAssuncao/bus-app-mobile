# Bus App Mobile (Expo React Native)

A mobile-first bus navigation app built with Expo (React Native). This project was ported from a web React codebase to React Native, preserving the visual theme and adding platform-aware APIs and navigation.

## Stack
- Expo SDK 54
- React Native 0.81
- React Navigation (native-stack)
- AsyncStorage
- @expo/vector-icons
- react-native-maps (native only)

## Getting started
1. Install dependencies:
```bash
npm install
```
2. Run on mobile (Expo Go):
```bash
npx expo start
```
3. Run on web:
```bash
npm run web
```

> Tip: If bundling acts weird after file renames or platform-specific files, clear the cache:
```bash
npx expo start -c
```

## Scripts
- `npm run start`: start Metro bundler (Expo)
- `npm run android`: open on Android
- `npm run ios`: open on iOS (macOS)
- `npm run web`: start web bundler

## Environment and API
The app calls a backend at different base URLs per platform:
- Web/iOS: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`

If you run on a physical device, use your machine IP: `http://<YOUR_LOCAL_IP>:3000`.

### Auth
- Login stores `token` and `user` in storage (web: localStorage, native: AsyncStorage).
- Authenticated requests send `Authorization: Bearer <token>`.

## Features
- Login (redirects to Directions on success)
- Register
- Directions
  - Fetch and persist Home/Work preferences
  - Save preferences with token auth
- Lines
  - Live vehicle positions with filtering, pagination, and auto-refresh
- Stations / Routes
  - Native: Map with markers and polyline (react-native-maps)
  - Web: placeholder (no native maps)
- Search
  - Favorites and Recents with modal to add location
- Header + Footer
  - Quick links (Search, Profile, Directions/Lines/Stations)

## Navigation & Deep Links (Web)
React Navigation linking is configured:
- `/login` → Login
- `/register` → Register
- `/directions` → Directions
- `/lines` → Lines
- `/stations` → Stations
- `/search` → Search
- `/profile` → User Profile

## Platform specifics
- `src/pages/Stations.native.jsx`: native map screen (Android/iOS)
- `src/pages/Stations.web.jsx`: web fallback (without map)
- `src/pages/Stations.jsx`: shared logic used in native (conditionally requires maps) — native takes precedence via platform file resolution

## Common issues
- Web bundling error with `react-native-maps`:
  - Use the provided `.native.jsx` and `.web.jsx` files.
  - Clear cache: `npx expo start -c --web`.
- Android cannot reach `localhost`:
  - Use `10.0.2.2` for the emulator, or your machine IP for physical devices.
- Not staying on the current screen after refresh:
  - Navigation state is persisted (localStorage/AsyncStorage). If you still reset to Login, ensure `token` exists in storage.

## Project structure (key parts)
```
src/
  components/
    Header.jsx          # RN header (opens Search, toggles Profile)
    Footer.jsx          # RN footer (navigates Directions/Stations/Lines)
  pages/
    Login.jsx           # RN login screen
    Register.jsx        # RN register screen
    Directions.jsx      # RN directions/preferences screen
    Lines.jsx           # RN lines/positions screen
    Stations.native.jsx # RN native map version
    Stations.web.jsx    # Web fallback version
    Stations.jsx        # Shared RN version
    Search.jsx          # RN search screen
    UserProfile.jsx     # RN profile screen
App.js                  # Navigation + linking + persisted nav state
```

## Security notes
- Do not commit API keys or secrets.
- Consider using `.env` or Expo Secrets for environment-specific URLs.

## Roadmap / Next steps
- Add token refresh and protected-route guards.
- Replace `localStorage` fallbacks with unified storage helper.
- Integrate Google Maps on web (with API key) if map on web is needed.
- Add tests and E2E flows.

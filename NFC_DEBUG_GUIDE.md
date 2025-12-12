# NFC Simulation Guide

## 🎮 Testing Without Physical NFC Card

Since you don't have an NFC card right now, I've added multiple ways to simulate NFC detection:

### 1. **Simulate NFC Button** (Recommended)
- Yellow debug button with bug icon 🐛
- Located on the login screen below the "Tap to Scan" button
- **When DEBUG_MODE = true**, this button appears
- **What it does**: Instantly simulates a card detection without needing a physical card

**Steps to use:**
1. Open the login screen
2. Look for the yellow "Simulate NFC Card" button
3. Tap it
4. You'll see the MyKad details screen with mock data

### 2. **Skip to Dashboard** (Quick Debug)
- Blue link at the bottom of login screen
- Bypasses NFC completely and goes straight to dashboard
- Useful for testing other features

### 3. **Real NFC When Available**
- **Real Card**: Tap the "Tap to Scan" button with a physical MyKad
- The app will read the real card UID and combine it with mock metadata
- Everything else works normally

## 🔧 Configuration

### Enable/Disable Debug Mode
In `app/index.tsx`, line ~48:
```tsx
const DEBUG_MODE = true;  // Change to false to disable simulator button
```

- `true` = Debug button visible (for development)
- `false` = Debug button hidden (for production)

## 📊 What Gets Simulated

When you tap "Simulate NFC Card", the app:

1. ✅ Generates a mock MyKad card with:
   - Card Number: 111111-11-1111
   - Name: MUHAMMAD AZHAR BIN ABDUL KADIR
   - Sex: MALE
   - Birth Date: 01-01-1995
   - Address: NO 123, JALAN MERDEKA, 50000 KUALA LUMPUR
   - City: KUALA LUMPUR
   - State: WILAYAH PERSEKUTUAN
   - Religion: ISLAM
   - Card Expiry: 01-01-2035
   - Status: ACTIVE

2. ✅ Shows the details verification page

3. ✅ Allows you to verify and proceed to dashboard

4. ✅ Sends to smart contract (when implemented)

## 🚀 Flow

```
Login Screen
    ↓
[Simulate NFC Card] button (DEBUG_MODE)
    ↓
Details Verification
    ↓
[Verify & Continue]
    ↓
Success Screen
    ↓
Dashboard
```

## 📝 Future: Real JPN Data Extraction

When you have an actual NFC reader library (JPN permission):

1. The real card data will be extracted using APDU commands
2. Replace the mock data with actual IC number, name, address, etc.
3. The rest of the flow remains the same

For now, the mock data simulates this perfectly for development!

## ✨ Tips

- **Multiple simulations**: You can tap the button multiple times to simulate different card scans
- **Error testing**: On the rescan screen, the simulator button still appears
- **No permissions needed**: The simulator works without NFC hardware or Android permissions

Enjoy developing! 🎉

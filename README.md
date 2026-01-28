# Qualification Tracker - Progressive Web App

A mobile-friendly web application for tracking employee qualifications, certifications, and their expiry dates with automatic reminder notifications.

## Features

✅ **Employee Management**
- Add, edit, and delete employees
- Organize by departments
- Search functionality

✅ **Qualification Tracking**
- Multiple qualifications per employee
- Valid from and expiry dates
- Visual status indicators (Valid/Expiring Soon/Expired)
- Days remaining countdown

✅ **Smart Notifications**
- Customizable reminder periods (e.g., 30 days before expiry)
- Browser notifications when qualifications are expiring
- Automatic status checking

✅ **Progressive Web App**
- Install to home screen like a native app
- Works offline
- Fast and responsive
- Mobile-optimized interface

✅ **Filtering & Search**
- Filter by status (All/Valid/Expiring Soon/Expired)
- Search employees by name or department
- Quick overview of warning counts

## Installation & Setup

### Option 1: Using a Web Server (Recommended)

#### A) Using Python (Easiest)
1. Open Command Prompt or Terminal
2. Navigate to the folder containing these files:
   ```
   cd path/to/qualification-tracker
   ```
3. Run this command:
   ```
   python -m http.server 8000
   ```
   Or for Python 2:
   ```
   python -m SimpleHTTPServer 8000
   ```
4. Open your browser and go to: `http://localhost:8000`

#### B) Using Node.js (http-server)
1. Install http-server globally:
   ```
   npm install -g http-server
   ```
2. Navigate to the folder and run:
   ```
   http-server
   ```
3. Open the URL shown in the terminal

#### C) Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 2: Deploy Online (Free Hosting)

#### Using GitHub Pages (Recommended)
1. Create a GitHub account (github.com)
2. Create a new repository
3. Upload all files to the repository
4. Go to Settings → Pages
5. Select main branch and save
6. Your app will be live at: `https://yourusername.github.io/repository-name`

#### Using Netlify
1. Go to netlify.com
2. Drag and drop the entire folder
3. Get instant live URL

#### Using Vercel
1. Go to vercel.com
2. Import from GitHub or upload folder
3. Deploy with one click

## Installing on iPhone

### Step 1: Access the Web App
1. Open Safari on your iPhone
2. Go to your app's URL (localhost or hosted URL)

### Step 2: Add to Home Screen
1. Tap the **Share button** (square with arrow pointing up) at the bottom
2. Scroll down and tap **"Add to Home Screen"**
3. Edit the name if you want (or keep "Qualification Tracker")
4. Tap **"Add"** in the top right

### Step 3: Enable Notifications
1. When you first open the app, it will ask for notification permission
2. Tap **"Allow"** to receive expiry reminders
3. You can also enable this later in:
   - iPhone Settings → Safari → Notifications

### Step 4: Use the App
The app icon will now appear on your home screen just like a native app!

## Installing on Android

1. Open Chrome browser
2. Go to your app's URL
3. Tap the **menu** (three dots) in the top right
4. Select **"Add to Home screen"** or **"Install app"**
5. Tap **"Install"**
6. Allow notifications when prompted

## How to Use

### Adding Employees
1. Tap the **+** button in the top right
2. Enter employee name and department
3. Tap **Save**

### Adding Qualifications
1. Tap on an employee to view details
2. Tap **"Add Qualification"** button
3. Fill in:
   - Qualification title (e.g., "First Aid Certificate")
   - Valid from date
   - Expiry date
   - Reminder days (how many days before expiry to notify)
4. Tap **Save**

### Viewing & Filtering
- Use the **filter buttons** to see:
  - All employees
  - Only those with expiring qualifications
  - Only those with expired qualifications
  - Only those with valid qualifications
- Use the **search bar** to find specific employees or departments
- Tap any employee card to see full details

### Editing & Deleting
- **Edit employee**: Tap employee → Tap edit icon (top right)
- **Delete qualification**: Tap employee → Tap trash icon on qualification
- **Delete employee**: Tap employee → Scroll down → "Delete Employee" button

### Understanding Status Colors
- 🟢 **Green (Valid)**: Qualification is valid with plenty of time
- 🟠 **Orange (Expiring Soon)**: Qualification expires within reminder period
- 🔴 **Red (Expired)**: Qualification has expired

## Data Storage

- All data is stored locally in your browser
- Data persists between sessions
- Data is NOT synced between devices
- To backup data: Export from browser's developer tools (advanced)

## Notifications

The app will check for expiring qualifications:
- When you open the app
- Based on your reminder settings

**Important Notes:**
- Web app notifications are limited compared to native apps
- Notifications work best when the app is open or recently used
- For iOS: Safari must be running in background for notifications
- For Android: Chrome can send notifications even when closed

## Troubleshooting

### App Won't Install
- **iOS**: Make sure you're using Safari (not Chrome)
- **Android**: Try Chrome browser
- Clear browser cache and try again

### Notifications Not Working
- Check browser notification permissions
- iOS: Settings → Safari → Notifications
- Android: Settings → Apps → Chrome → Notifications
- Make sure you tapped "Allow" when prompted

### Data Not Saving
- Check browser storage settings
- Make sure you're not in private/incognito mode
- Try a different browser

### App Looks Wrong
- Clear browser cache
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Reinstall the app

## Files Included

- `index.html` - Main HTML structure
- `styles.css` - All styling and design
- `app.js` - Application logic and functionality
- `service-worker.js` - Offline functionality and caching
- `manifest.json` - PWA configuration
- `icon-192.png` - App icon (small)
- `icon-512.png` - App icon (large)
- `README.md` - This file

## Browser Compatibility

✅ iOS Safari (iOS 13+)
✅ Android Chrome (Android 5+)
✅ Desktop Chrome
✅ Desktop Safari
✅ Desktop Firefox
✅ Desktop Edge

## Sample Data

The app comes pre-loaded with 2 sample employees:
1. **John Smith** (Safety Department)
   - First Aid Certificate (expiring in 45 days)
   - Fire Safety Training (valid)

2. **Sarah Johnson** (Operations Department)
   - Forklift License (expired)
   - Health & Safety (valid)

You can delete these and add your own employees.

## Privacy & Security

- All data stored locally on your device
- No data sent to external servers
- No user tracking or analytics
- No account required
- Completely free and open source

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Try reinstalling the app
3. Clear browser data and start fresh

## Future Enhancements (Possible)

- Export data to PDF/Excel
- Import data from CSV
- Multi-device sync (requires backend)
- Email notifications
- Print qualification matrix
- Document attachments

## License

Free to use and modify for personal and commercial purposes.

---

**Made with ❤️ for better qualification management**

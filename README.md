# off-point

Offline-first waypoint planning app. Load your own map files, plot waypoints, export routes — no internet required after install.

## What is this?

off-point is a web app that lets you plan routes by placing waypoints on a map. It runs entirely in your browser with no backend server. Once installed, it works completely offline — you don't need internet to use it.

You provide your own detailed map files (`.pmtiles` format) for the area you care about. The app stores everything locally on your device.

## Installing the App

off-point is a Progressive Web App (PWA). This means you can install it like a native app from your browser.

### Android (Chrome, Edge, Brave)

1. Open the app URL in your browser
2. You should see a banner saying "Add to Home Screen" — tap it
3. If no banner appears: tap the three-dot menu (top right) → **"Install app"** or **"Add to Home Screen"**
4. The app icon appears on your home screen
5. Open it from there — it now runs fullscreen and works offline

### Desktop (Chrome, Edge)

1. Open the app URL in your browser
2. Look for the install icon in the address bar (a monitor with a down arrow), or go to the three-dot menu → **"Install off-point"**
3. Click **Install**
4. The app opens in its own window and is available from your app launcher/start menu

### Firefox (Desktop)

Firefox does not support installing PWAs natively. The app still works in a regular browser tab and caches itself for offline use, but you won't get a standalone window or home screen icon.

### iOS (Safari)

1. Open the app URL in Safari (must be Safari, not Chrome/Firefox)
2. Tap the Share button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**
5. The app icon appears on your home screen

Note: iOS may evict cached data if you don't use the app for a few weeks. Re-opening it while online will re-cache everything.

## Getting Map Files

The app comes with a low-detail world map (zoom 0–5) for orientation. For actual route planning, you need detailed regional map files in `.pmtiles` format.

### Where to download them

**Option A: Protomaps (recommended for small areas)**

1. Go to https://app.protomaps.com/
2. Draw a rectangle around your area of interest
3. Download the `.pmtiles` file
4. Note: free extracts have a size limit

**Option B: BBBike Extract (for larger areas)**

1. Go to https://extract.bbbike.org/
2. Select your area on the map
3. Under format, choose **"Protomaps (PMTiles)"**
4. Enter your email — you'll receive a download link when the extract is ready (usually a few minutes)

### File sizes

- A small town: ~1–5 MB
- A city: ~10–30 MB
- A large metro area: ~50–100 MB

Larger files take more storage on your device but give you more detail at higher zoom levels.

## Using the App

### Loading a map

1. Tap **"Load Map"** (bottom toolbar)
2. Select a `.pmtiles` file from your device
3. The map zooms to show the loaded region
4. Your file is stored locally — it will still be there next time you open the app

You can load multiple map files for different regions. They all persist until you delete them.

### Navigating between maps

- In **region view** (zoomed into a map): you see the detailed map and can place waypoints
- Tap **"World View"** to zoom out and see all your loaded regions as red rectangles
- Tap a rectangle to enter that region

### Placing waypoints

1. Make sure you're in region view (zoomed into a loaded map)
2. Tap anywhere on the map to place a waypoint
3. Waypoints are numbered in the order you place them
4. A blue line connects them showing your route

### Moving waypoints

Drag any waypoint marker to reposition it. The route line updates automatically.

### Marking a stop point

1. Tap a waypoint marker to open its popup
2. Check **"Stop after reach"**
3. The marker turns red to indicate it's a stop point

This metadata is included in the exported JSON as `"stopAfterReach": true`.

### Deleting waypoints

In the sidebar (or bottom drawer on mobile), each waypoint has a **✕** button. Tap it to remove that waypoint. Remaining waypoints are renumbered automatically.

### Deleting a map

In world view, each region in the sidebar has a **✕** button. This deletes the map file and all associated waypoints from your device.

### GPS location

If you grant location permission, a blue dot shows your current position with an accuracy circle. This works offline using your device's GPS hardware.

## Exporting Your Route

1. In region view, open the sidebar
2. Tap **"Export JSON"**
3. A `.json` file downloads to your device

### Export format

```json
{
  "name": "my-region",
  "waypoints": [
    { "lat": 48.858, "lng": 2.294 },
    { "lat": 48.860, "lng": 2.337, "stopAfterReach": true }
  ]
}
```

- `name` — derived from the map filename (without `.pmtiles` extension)
- `waypoints` — ordered array of coordinates
- `stopAfterReach` — only present on waypoints where you enabled it

## Offline Behavior

After the first visit (while online), the app caches itself completely:

- All app code and libraries
- The bundled world basemap (~15 MB)
- Any maps you load are stored in IndexedDB

From that point on, everything works without internet. You never need to be online again unless:

- You want to load a new map file that isn't on your device yet
- The app has been updated and you want the latest version

## Troubleshooting

**"The app won't load offline"**
- Make sure you visited the app at least once with internet so it could cache itself
- Check that the service worker registered (green dot next to "SW" in the sidebar)

**"My maps disappeared"**
- On iOS, the OS can evict PWA data if storage is low or the app hasn't been used recently
- On any platform, clearing browser data / site data will erase stored maps
- Re-load your `.pmtiles` files to restore them

**"GPS dot doesn't appear"**
- Ensure you granted location permission when prompted
- Check that location/GPS is enabled in your device settings
- The red dot next to "GPS" in the sidebar means location is unavailable

**"I can't install the app"**
- The app must be served over HTTPS (GitHub Pages handles this)
- Firefox desktop doesn't support PWA installation
- On iOS, you must use Safari (not Chrome or Firefox)

## License

MIT

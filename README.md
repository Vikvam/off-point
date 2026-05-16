# off-point: Offline-First Waypoint Planning App

## 1. Project Overview

This project is a lightweight, offline-first web application designed for waypoint plotting and mission planning. It allows users to load local map files, plot coordinates, attach metadata to those coordinates, and export the resulting paths as structured JSON files. The app is built with a strict "no backend server" philosophy, relying entirely on client-side storage and user-provided map data.

## 2. Platform & Target Support

- **Architecture:** Progressive Web App (PWA).
- **Primary Platforms:** Desktop and Android browsers (Chrome, Edge, Firefox, Brave).
- **Secondary Platforms:** iOS (Safari) — Supported but deprioritized due to stricter storage eviction policies.
- **Legacy Support:** Graceful degradation is built-in to support older Android versions by falling back to standard IndexedDB storage if modern File System APIs are unavailable.

## 3. Core Features

- **Fully Offline Capability:** Once the PWA is installed, the app requires zero internet connection to function.
- **Dual-Source Mapping:**
  - A lightweight, global basemap (Zoom levels 0-5, ~15-20MB) is bundled with the app to provide immediate geographic context.
  - Users can sideload highly detailed, regional map files for their specific area of interest.
- **Local File Sideloading:** Users load map data via native file pickers, bypassing the need for tile servers. Users can extract these files from services like Protomaps BBox Tool or BBBike.
- **Waypoint Plotting & Editing:** Users can click the map to drop waypoints, which are connected chronologically. (Note: Waypoint deletion and reordering are currently out of scope for the MVP but planned for future releases).
- **Metadata Management:** Users can attach specific metadata to individual waypoints via a map popup UI (e.g., toggling a `stopAfterReach` behavior).
- **Dynamic Visuals:** Waypoint markers change appearance (e.g., color) dynamically based on their metadata state.
- **Map-to-Data Association:** Waypoint lists are saved locally and bound to the specific map file (Project ID) they were created on.
- **JSON Export:** The app generates and downloads a structured JSON file of the planned route directly to the device.

## 4. Technology Stack

To satisfy the requirement of being extremely lightweight and highly compatible, we avoid heavy frameworks and complex build tools.

- **UI Framework:** Vanilla JavaScript, HTML5, and CSS3. (No React/Vue overhead).
- **Mapping Engine:** Leaflet.js. Chosen for its minimal footprint, excellent performance on older hardware, and lack of WebGL dependency.
- **Map Format:** PMTiles. A single-file archive format that stores hierarchical map tiles, enabling fast, localized byte-range requests without a server.
- **Tile Extraction / Source:** Protomaps (for the bundled global basemap) and user-generated extracts (e.g., BBBikes/Protomaps) for detailed regions.
- **Map Parsing:** `leaflet-pmtiles` plugin to bridge Leaflet and the PMTiles format.
- **Local Storage:** IndexedDB wrapped with `idb-keyval` (a tiny 600-byte library) for persisting map blobs and waypoint arrays.
- **Offline Caching:** Standard PWA Service Workers to cache the app shell (`index.html`, `style.css`, `main.js`, and the global basemap).

## 5. Architecture & Data Flow

### 5.1 Storage & Auto-Load Strategy

- **Level 1 (Modern Chromium):** The app attempts to use the File System Access API to store a persistent "handle" to the user's `.pmtiles` file. This uses zero browser quota. (Note: The browser may still require the user to briefly click "Allow" on consecutive loads to re-verify directory permissions).
- **Level 2 (Standard/Legacy Fallback):** The app reads the `.pmtiles` file and stores the entire Blob into IndexedDB.

Upon consecutive loads, the app checks IndexedDB for the last used map and associated waypoints, loading them automatically without user intervention.

### 5.2 Data Association Model

The filename of the loaded map acts as the **Project ID**. (Warning: This assumes users maintain unique filenames for different map regions to avoid data collisions). Data in IndexedDB is structured as:

- Key: `map_{filename}` → Value: File Blob
- Key: `data_{filename}` → Value: Waypoint Array

### 5.3 Waypoint Metadata & UI

When a user clicks a waypoint marker, a Leaflet Popup opens containing HTML form elements to edit metadata.

- **State:** The current MVP metadata is a boolean: `stopAfterReach`.
- **Visual Feedback:** Markers default to a Blue SVG icon. If `stopAfterReach` is `true`, the marker updates instantly to a Red SVG icon.

### 5.4 JSON Export Schema

The export function generates a `.json` file matching the following required schema:

```json
{
  "name": "zigzag-continuous",
  "waypoints": [
    { "lat": 48.8584, "lng": 2.2945 },
    { "lat": 48.8606, "lng": 2.3376 },
    { "lat": 48.8610, "lng": 2.3400, "stopAfterReach": true }
  ]
}
```

> **Note:** If the loaded map file is `zigzag-continuous.pmtiles`, the resulting `name` in the JSON will be `zigzag-continuous`.
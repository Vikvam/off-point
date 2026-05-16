import { initMap, loadBasemap, addRegion, flyToRegion, showWorldView, hasRegions, getRegions, removeRegion } from './map.js';
import { storeMapFile, getAllMaps, getLastProject, setLastProject, saveWaypoints, getWaypoints, removeMap } from './storage.js';
import { initSidebar, showRegionList, showRegionDetail, updateWaypointList } from './sidebar.js';
import { initWaypoints, loadWaypoints, clearWaypoints, getExportData, removeWaypoint, setEnabled } from './waypoints.js';
import { exportRoute } from './export.js';

let currentFilename = null;

function initStatusBar() {
  const bar = document.getElementById('status-bar');
  bar.innerHTML = `
    <span class="status-item"><span class="dot" id="dot-sw"></span>SW</span>
    <span class="status-item"><span class="dot" id="dot-gps"></span>GPS</span>
  `;
}

function setStatus(id, ok) {
  const dot = document.getElementById(id);
  if (dot) dot.className = `dot ${ok ? 'ok' : 'err'}`;
}

function updateButtons(view) {
  const btnWorld = document.getElementById('btn-world');

  if (!hasRegions()) {
    btnWorld.hidden = true;
    return;
  }

  btnWorld.hidden = (view === 'world');
}

function updateSidebar(view, filename) {
  if (view === 'world') {
    const regionData = getRegions().map(([fname, r]) => ({
      filename: fname,
      bounds: r.bounds,
    }));
    showRegionList(regionData);
  } else if (view === 'region' && filename) {
    const region = getRegions().find(([f]) => f === filename);
    if (region) {
      showRegionDetail(filename, region[1].bounds, getExportData());
    }
  }
}

async function onViewChange(view, filename) {
  updateButtons(view);

  // Save current waypoints before switching
  if (currentFilename) {
    await saveWaypoints(currentFilename, getExportData());
  }

  if (view === 'region' && filename) {
    currentFilename = filename;
    setLastProject(filename);
    // Load waypoints for this region
    const data = await getWaypoints(filename);
    clearWaypoints();
    loadWaypoints(data || []);
    setEnabled(true);
  } else if (view === 'world') {
    setEnabled(false);
    clearWaypoints();
    currentFilename = null;
  }

  updateSidebar(view, filename);
}

async function main() {
  initStatusBar();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => setStatus('dot-sw', true))
      .catch(() => setStatus('dot-sw', false));
  } else {
    setStatus('dot-sw', false);
  }

  const map = initMap();
  await loadBasemap(map);

  // GPS location tracking
  let gpsMarker = null;
  let gpsCircle = null;
  map.on('locationfound', (e) => {
    setStatus('dot-gps', true);
    const { latlng, accuracy } = e;
    if (gpsMarker) {
      gpsMarker.setLatLng(latlng);
      gpsCircle.setLatLng(latlng).setRadius(accuracy);
    } else {
      gpsCircle = L.circle(latlng, { radius: accuracy, className: 'gps-accuracy' }).addTo(map);
      gpsMarker = L.circleMarker(latlng, {
        radius: 7,
        fillColor: '#4285f4',
        fillOpacity: 1,
        color: '#fff',
        weight: 2,
      }).addTo(map);
    }
  });
  map.on('locationerror', (e) => {
    setStatus('dot-gps', false);
    console.warn('Location error:', e.message);
  });
  map.locate({ watch: true, enableHighAccuracy: true });

  const callbacks = { onViewChange };

  initSidebar({
    onRegionClick: (filename) => flyToRegion(map, filename),
    onRemoveWaypoint: (index) => removeWaypoint(index),
    onDeleteMap: async (filename) => {
      removeRegion(map, filename);
      await removeMap(filename);
      updateSidebar('world', null);
      updateButtons('world');
    },
  });

  initWaypoints(map, async () => {
    if (currentFilename) {
      await saveWaypoints(currentFilename, getExportData());
      updateSidebar('region', currentFilename);
    }
  });

  // Load all stored regions
  const allMaps = await getAllMaps();
  for (const { filename, blob } of allMaps) {
    await addRegion(map, blob, filename, callbacks);
  }

  // Auto-enter last used region or show world
  const lastProject = await getLastProject();
  if (lastProject && allMaps.some(m => m.filename === lastProject)) {
    flyToRegion(map, lastProject);
  } else {
    updateSidebar('world', null);
  }

  // File picker
  const fileInput = document.getElementById('file-input');
  document.getElementById('btn-load').addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await storeMapFile(file);
    await addRegion(map, file, file.name, callbacks);
    flyToRegion(map, file.name);
  });

  // World view button
  document.getElementById('btn-world').addEventListener('click', () => showWorldView(map));

  // Export button
  document.getElementById('btn-export').addEventListener('click', () => {
    if (currentFilename) {
      exportRoute(currentFilename, getExportData());
    }
  });
}

main();

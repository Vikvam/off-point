import { initMap, loadBasemap, addRegion, flyToRegion, showWorldView, hasRegions, getRegions } from './map.js';
import { storeMapFile, getAllMaps, getLastProject, setLastProject } from './storage.js';
import { initSidebar, showRegionList, showRegionDetail } from './sidebar.js';

let currentFilename = null;

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
      showRegionDetail(filename, region[1].bounds, []);
    }
  }
}

function onViewChange(view, filename) {
  updateButtons(view);
  updateSidebar(view, filename);
  if (filename) {
    currentFilename = filename;
    setLastProject(filename);
  }
}

async function main() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  const map = initMap();
  await loadBasemap(map);

  const callbacks = { onViewChange };

  initSidebar({
    onRegionClick: (filename) => flyToRegion(map, filename),
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
}

main();

let onRegionClick = null;
let onRemoveWaypoint = null;

export function initSidebar(callbacks) {
  onRegionClick = callbacks.onRegionClick;
  if (callbacks.onRemoveWaypoint) onRemoveWaypoint = callbacks.onRemoveWaypoint;

  // Mobile drawer toggle
  const handle = document.getElementById('sidebar-handle');
  const sidebar = document.getElementById('sidebar');
  handle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

export function showRegionList(regions) {
  document.getElementById('panel-regions').hidden = false;
  document.getElementById('panel-detail').hidden = true;

  const list = document.getElementById('region-list');
  list.innerHTML = '';

  for (const { filename, bounds } of regions) {
    const li = document.createElement('li');
    const name = filename.replace(/\.pmtiles$/i, '');
    const boundsStr = `${bounds.getSouth().toFixed(2)}, ${bounds.getWest().toFixed(2)} — ${bounds.getNorth().toFixed(2)}, ${bounds.getEast().toFixed(2)}`;

    li.innerHTML = `
      <div class="region-name">${name}</div>
      <div class="region-bounds">${boundsStr}</div>
    `;
    li.addEventListener('click', () => {
      if (onRegionClick) onRegionClick(filename);
    });
    list.appendChild(li);
  }

  if (regions.length === 0) {
    list.innerHTML = '<li style="color:#999;cursor:default">No regions loaded</li>';
  }
}

export function showRegionDetail(filename, bounds, waypoints) {
  document.getElementById('panel-regions').hidden = true;
  document.getElementById('panel-detail').hidden = false;

  const name = filename.replace(/\.pmtiles$/i, '');
  document.getElementById('detail-name').textContent = name;
  document.getElementById('detail-bounds').textContent =
    `Bounds: ${bounds.getSouth().toFixed(4)}, ${bounds.getWest().toFixed(4)} — ${bounds.getNorth().toFixed(4)}, ${bounds.getEast().toFixed(4)}`;
  document.getElementById('detail-wp-count').textContent =
    `Waypoints: ${waypoints.length}`;

  updateWaypointList(waypoints);
}

export function updateWaypointList(waypoints) {
  const list = document.getElementById('waypoint-list');
  list.innerHTML = '';

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const li = document.createElement('li');
    if (wp.stopAfterReach) li.classList.add('stop');

    let html = `<span class="wp-num">${i + 1}</span>`;
    html += `<span class="wp-coords">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</span>`;
    if (wp.stopAfterReach) {
      html += '<span class="wp-badge">STOP</span>';
    }
    html += '<button class="wp-remove" title="Remove">✕</button>';
    li.innerHTML = html;

    li.querySelector('.wp-remove').addEventListener('click', () => {
      if (onRemoveWaypoint) onRemoveWaypoint(i);
    });

    list.appendChild(li);
  }
}

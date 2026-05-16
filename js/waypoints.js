import { blueIcon, redIcon } from './icons.js';

let map = null;
let onChange = null;
let waypoints = []; // { lat, lng, stopAfterReach, marker }
let polyline = null;

export function initWaypoints(leafletMap, onChangeCallback) {
  map = leafletMap;
  onChange = onChangeCallback;

  map.on('click', (e) => {
    addWaypoint(e.latlng);
  });
}

function iconFor(wp, number) {
  return wp.stopAfterReach ? redIcon(number) : blueIcon(number);
}

function popupContent(index, wp) {
  const checked = wp.stopAfterReach ? 'checked' : '';
  return `<label class="wp-popup-label">
    <input type="checkbox" data-wp-index="${index}" ${checked}> Stop after reach
  </label>`;
}

function bindPopup(wp, index) {
  wp.marker.bindPopup(popupContent(index, wp));
  wp.marker.off('popupopen');
  wp.marker.on('popupopen', () => {
    const container = wp.marker.getPopup().getElement();
    const checkbox = container.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      wp.stopAfterReach = e.target.checked;
      wp.marker.setIcon(iconFor(wp, index + 1));
      if (onChange) onChange();
    });
  });
}

function refreshAllIcons() {
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    wp.marker.setIcon(iconFor(wp, i + 1));
    bindPopup(wp, i);
  }
}

export function addWaypoint(latlng) {
  const wp = {
    lat: latlng.lat,
    lng: latlng.lng,
    stopAfterReach: false,
    marker: null,
  };

  const num = waypoints.length + 1;
  const marker = L.marker([wp.lat, wp.lng], { icon: blueIcon(num), draggable: true });
  marker.addTo(map);
  wp.marker = marker;

  const idx = waypoints.length;
  waypoints.push(wp);

  bindPopup(wp, idx);

  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    wp.lat = pos.lat;
    wp.lng = pos.lng;
    updatePolyline();
    if (onChange) onChange();
  });

  updatePolyline();
  if (onChange) onChange();
}

export function loadWaypoints(data) {
  clearWaypoints();
  if (!data || data.length === 0) return;

  for (let i = 0; i < data.length; i++) {
    const wp = data[i];
    const entry = { lat: wp.lat, lng: wp.lng, stopAfterReach: wp.stopAfterReach || false, marker: null };

    const marker = L.marker([wp.lat, wp.lng], {
      icon: iconFor(entry, i + 1),
      draggable: true,
    });
    marker.addTo(map);
    entry.marker = marker;
    waypoints.push(entry);

    bindPopup(entry, i);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      entry.lat = pos.lat;
      entry.lng = pos.lng;
      updatePolyline();
      if (onChange) onChange();
    });
  }

  updatePolyline();
}

export function clearWaypoints() {
  for (const wp of waypoints) {
    if (wp.marker) map.removeLayer(wp.marker);
  }
  waypoints = [];
  if (polyline) {
    map.removeLayer(polyline);
    polyline = null;
  }
}

export function getExportData() {
  return waypoints.map(wp => {
    const obj = { lat: wp.lat, lng: wp.lng };
    if (wp.stopAfterReach) obj.stopAfterReach = true;
    return obj;
  });
}

export function removeWaypoint(index) {
  if (index < 0 || index >= waypoints.length) return;
  const wp = waypoints[index];
  if (wp.marker) map.removeLayer(wp.marker);
  waypoints.splice(index, 1);
  refreshAllIcons();
  updatePolyline();
  if (onChange) onChange();
}

export function getWaypointCount() {
  return waypoints.length;
}

function updatePolyline() {
  const latlngs = waypoints.map(wp => [wp.lat, wp.lng]);

  if (polyline) {
    polyline.setLatLngs(latlngs);
  } else if (latlngs.length >= 2) {
    polyline = L.polyline(latlngs, { color: '#2196F3', weight: 3, opacity: 0.7 });
    polyline.addTo(map);
  }
}

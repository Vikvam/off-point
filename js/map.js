import { BlobSource } from './pmtiles-source.js';
import { openMapTilesPaintRules, openMapTilesLabelRules, openMapTilesBackground } from './openmaptiles-theme.js';

let basemapLayer = null;
const regions = new Map(); // filename → { layer, rect, bounds }
let activeRegion = null;
let onViewChange = null;

export function initMap() {
  const map = L.map('map').setView([0, 0], 2);
  return map;
}

export async function loadBasemap(map) {
  const response = await fetch('data/world_z5.pmtiles');
  const blob = await response.blob();
  const source = new BlobSource(blob, 'world_z5.pmtiles');
  const tiles = new pmtiles.PMTiles(source);

  basemapLayer = protomapsL.leafletLayer({
    url: tiles,
    flavor: 'light',
    maxDataZoom: 5,
  });
  basemapLayer.addTo(map);
  return basemapLayer;
}

export async function addRegion(map, blob, filename, callbacks = {}) {
  if (callbacks.onViewChange) onViewChange = callbacks.onViewChange;

  // Remove existing region with same name
  if (regions.has(filename)) {
    const old = regions.get(filename);
    if (map.hasLayer(old.layer)) map.removeLayer(old.layer);
    if (map.hasLayer(old.rect)) map.removeLayer(old.rect);
    regions.delete(filename);
  }

  const source = new BlobSource(blob, filename);
  const tiles = new pmtiles.PMTiles(source);
  const header = await tiles.getHeader();

  const layer = protomapsL.leafletLayer({
    url: tiles,
    paintRules: openMapTilesPaintRules(),
    labelRules: openMapTilesLabelRules(),
    backgroundColor: openMapTilesBackground,
    maxDataZoom: header.maxZoom,
  });

  const bounds = L.latLngBounds(
    [header.minLat, header.minLon],
    [header.maxLat, header.maxLon]
  );

  const rect = L.rectangle(bounds, {
    color: '#e53935',
    weight: 2,
    fillOpacity: 0.1,
    interactive: true,
  });
  rect.bindTooltip(filename.replace(/\.pmtiles$/i, ''));
  rect.on('click', () => flyToRegion(map, filename));
  rect.addTo(map);

  regions.set(filename, { layer, rect, bounds });
}

export function flyToRegion(map, filename) {
  const region = regions.get(filename);
  if (!region) return;

  activeRegion = filename;

  // Remove all rects, add basemap + user layer
  for (const [, r] of regions) {
    if (map.hasLayer(r.rect)) map.removeLayer(r.rect);
    if (map.hasLayer(r.layer)) map.removeLayer(r.layer);
  }

  if (!map.hasLayer(basemapLayer)) {
    basemapLayer.addTo(map);
  }
  region.layer.addTo(map);

  // Zoom lock
  const padded = region.bounds.pad(0.1);
  map.setMaxBounds(padded);
  map.fitBounds(region.bounds);
  map.setMinZoom(map.getBoundsZoom(region.bounds));

  if (onViewChange) onViewChange('region', filename);
}

export function showWorldView(map) {
  activeRegion = null;

  // Remove user layers, unlock zoom
  for (const [, r] of regions) {
    if (map.hasLayer(r.layer)) map.removeLayer(r.layer);
    if (!map.hasLayer(r.rect)) r.rect.addTo(map);
  }

  map.setMaxBounds(null);
  map.setMinZoom(0);

  if (!map.hasLayer(basemapLayer)) {
    basemapLayer.addTo(map);
  }

  map.setView([0, 0], 2);

  if (onViewChange) onViewChange('world', null);
}

export function hasRegions() {
  return regions.size > 0;
}

export function getActiveRegion() {
  return activeRegion;
}

export function getRegions() {
  return [...regions.entries()];
}

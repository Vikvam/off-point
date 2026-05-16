import { get, set, del } from '../lib/idb-keyval.js';

export async function storeMapFile(file) {
  const filename = file.name;
  await set(`map_${filename}`, file);

  // Add to project list
  const projects = await get('projects') || [];
  if (!projects.includes(filename)) {
    projects.push(filename);
    await set('projects', projects);
  }

  await set('lastProject', filename);
}

export async function getAllMaps() {
  const projects = await get('projects') || [];
  const results = [];
  for (const filename of projects) {
    const blob = await get(`map_${filename}`);
    if (blob) {
      results.push({ filename, blob });
    }
  }
  return results;
}

export async function getLastProject() {
  return await get('lastProject') || null;
}

export async function setLastProject(filename) {
  await set('lastProject', filename);
}

export async function removeMap(filename) {
  await del(`map_${filename}`);
  await del(`data_${filename}`);
  const projects = await get('projects') || [];
  const updated = projects.filter(p => p !== filename);
  await set('projects', updated);

  const last = await get('lastProject');
  if (last === filename) {
    await set('lastProject', updated[0] || null);
  }
}

export async function saveWaypoints(filename, waypoints) {
  await set(`data_${filename}`, waypoints);
}

export async function getWaypoints(filename) {
  return await get(`data_${filename}`) || null;
}

export function exportRoute(filename, waypoints) {
  if (waypoints.length === 0) return;

  const name = filename.replace(/\.pmtiles$/i, '');
  const data = { name, waypoints };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

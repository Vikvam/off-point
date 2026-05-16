function svg(fill, number) {
  const label = number != null
    ? `<text x="12" y="16" text-anchor="middle" font-size="11" font-weight="bold" font-family="sans-serif" fill="#fff">${number}</text>`
    : '<circle cx="12" cy="12" r="5" fill="#fff"/>';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${fill}" stroke="#333" stroke-width="1"/>
  ${label}
</svg>`;
}

export function blueIcon(number) {
  return L.divIcon({
    html: svg('#2196F3', number),
    className: 'waypoint-icon',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

export function redIcon(number) {
  return L.divIcon({
    html: svg('#e53935', number),
    className: 'waypoint-icon',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

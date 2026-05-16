// Custom paint and label rules for OpenMapTiles schema (used by BBBike exports).
// Maps OpenMapTiles layer names + class/subclass properties to protomaps-leaflet symbolizers.

const colors = {
  background: '#f8f4f0',
  water: '#aad3df',
  grass: '#cdebb0',
  wood: '#add19e',
  farmland: '#eef0d5',
  sand: '#f5e9c6',
  residential: '#e0dfdf',
  commercial: '#f2dad9',
  industrial: '#ebdbe8',
  park: '#c8facc',
  building: '#d9d0c9',
  road: '#ffffff',
  road_casing: '#c0c0c0',
  motorway: '#e892a2',
  trunk: '#f9b29c',
  primary: '#fcd6a4',
  secondary: '#f7fabf',
  railway: '#808080',
  boundary: '#9e7bab',
};

export function openMapTilesPaintRules() {
  const { PolygonSymbolizer, LineSymbolizer } = protomapsL;

  return [
    // Landcover
    {
      dataLayer: 'landcover',
      symbolizer: new PolygonSymbolizer({
        fill: (z, f) => {
          const cls = f.props.class;
          const sub = f.props.subclass;
          if (cls === 'grass' || sub === 'grass') return colors.grass;
          if (cls === 'wood' || sub === 'wood') return colors.wood;
          if (cls === 'farmland' || sub === 'farmland') return colors.farmland;
          if (cls === 'sand' || sub === 'sand') return colors.sand;
          if (cls === 'wetland') return '#d4e6c3';
          if (cls === 'ice') return '#e8e8ff';
          return colors.grass; // fallback for other vegetation
        },
      }),
    },
    // Landuse
    {
      dataLayer: 'landuse',
      symbolizer: new PolygonSymbolizer({
        fill: (z, f) => {
          const cls = f.props.class;
          if (cls === 'residential') return colors.residential;
          if (cls === 'commercial' || cls === 'retail') return colors.commercial;
          if (cls === 'industrial' || cls === 'railway') return colors.industrial;
          if (cls === 'cemetery' || cls === 'park' || cls === 'recreation_ground') return colors.park;
          if (cls === 'hospital') return '#f0d8d8';
          if (cls === 'school' || cls === 'university' || cls === 'college') return '#f0f0d8';
          if (cls === 'military') return '#e8e8d0';
          return '';
        },
      }),
    },
    // Park
    {
      dataLayer: 'park',
      symbolizer: new PolygonSymbolizer({
        fill: colors.park,
        opacity: (z) => z < 8 ? 0 : z < 10 ? 0.5 : 0.7,
      }),
    },
    // Water
    {
      dataLayer: 'water',
      symbolizer: new PolygonSymbolizer({ fill: colors.water }),
    },
    // Waterway
    {
      dataLayer: 'waterway',
      symbolizer: new LineSymbolizer({
        color: colors.water,
        width: (z) => z < 10 ? 1 : z < 13 ? 2 : 3,
      }),
    },
    // Buildings
    {
      dataLayer: 'building',
      symbolizer: new PolygonSymbolizer({
        fill: colors.building,
        opacity: (z) => z < 13 ? 0 : z < 14 ? 0.5 : 0.8,
      }),
    },
    // Transportation - casings
    {
      dataLayer: 'transportation',
      symbolizer: new LineSymbolizer({
        color: (z, f) => {
          const cls = f.props.class;
          if (cls === 'motorway') return '#c05070';
          if (cls === 'trunk') return '#c07040';
          if (cls === 'primary') return '#c09040';
          return colors.road_casing;
        },
        width: (z, f) => {
          const cls = f.props.class;
          if (cls === 'motorway' || cls === 'trunk') return z < 8 ? 1.5 : z < 12 ? 4 : 8;
          if (cls === 'primary') return z < 10 ? 1.5 : z < 13 ? 3 : 6;
          if (cls === 'secondary') return z < 11 ? 1 : z < 13 ? 2.5 : 5;
          if (cls === 'tertiary') return z < 12 ? 0 : z < 14 ? 2 : 4;
          if (cls === 'minor' || cls === 'service') return z < 13 ? 0 : 2.5;
          if (cls === 'rail') return z < 12 ? 0 : 2;
          return z < 14 ? 0 : 1.5;
        },
      }),
    },
    // Transportation - fills
    {
      dataLayer: 'transportation',
      symbolizer: new LineSymbolizer({
        color: (z, f) => {
          const cls = f.props.class;
          if (cls === 'motorway') return colors.motorway;
          if (cls === 'trunk') return colors.trunk;
          if (cls === 'primary') return colors.primary;
          if (cls === 'secondary') return colors.secondary;
          if (cls === 'rail') return colors.railway;
          return colors.road;
        },
        width: (z, f) => {
          const cls = f.props.class;
          if (cls === 'motorway' || cls === 'trunk') return z < 8 ? 0.5 : z < 12 ? 2.5 : 6;
          if (cls === 'primary') return z < 10 ? 0.5 : z < 13 ? 2 : 4.5;
          if (cls === 'secondary') return z < 11 ? 0 : z < 13 ? 1.5 : 3.5;
          if (cls === 'tertiary') return z < 12 ? 0 : z < 14 ? 1 : 3;
          if (cls === 'minor' || cls === 'service') return z < 13 ? 0 : 1.5;
          if (cls === 'rail') return z < 12 ? 0 : 1;
          return z < 14 ? 0 : 1;
        },
      }),
      filter: (z, f) => f.props.class !== 'rail' || f.props.brunnel !== 'tunnel',
    },
    // Aeroway
    {
      dataLayer: 'aeroway',
      symbolizer: new LineSymbolizer({
        color: '#bbc0c4',
        width: (z, f) => f.props.class === 'runway' ? (z < 12 ? 2 : 8) : 2,
      }),
    },
    // Boundary
    {
      dataLayer: 'boundary',
      symbolizer: new LineSymbolizer({
        color: colors.boundary,
        width: 1.5,
        dash: [6, 3],
        opacity: 0.6,
      }),
    },
  ];
}

export function openMapTilesLabelRules() {
  const { CenteredTextSymbolizer, LineLabelSymbolizer } = protomapsL;

  return [
    // Place labels
    {
      dataLayer: 'place',
      symbolizer: new CenteredTextSymbolizer({
        labelProps: ['name:latin', 'name'],
        fill: '#333',
        stroke: '#fff',
        width: 2,
        font: (z, f) => {
          const cls = f.props.class;
          if (cls === 'city') return `bold ${z < 8 ? 12 : 14}px sans-serif`;
          if (cls === 'town') return `${z < 10 ? 11 : 13}px sans-serif`;
          return `${z < 13 ? 10 : 11}px sans-serif`;
        },
      }),
      filter: (z, f) => {
        const cls = f.props.class;
        if (cls === 'city') return z >= 4;
        if (cls === 'town') return z >= 8;
        if (cls === 'village') return z >= 11;
        if (cls === 'suburb' || cls === 'neighbourhood') return z >= 13;
        return z >= 14;
      },
    },
    // Road labels
    {
      dataLayer: 'transportation_name',
      symbolizer: new LineLabelSymbolizer({
        labelProps: ['name:latin', 'name', 'ref'],
        fill: '#555',
        stroke: '#fff',
        width: 2,
        font: (z) => `${z < 14 ? 10 : 11}px sans-serif`,
      }),
      filter: (z, f) => {
        const cls = f.props.class;
        if (cls === 'motorway' || cls === 'trunk') return z >= 10;
        if (cls === 'primary') return z >= 11;
        if (cls === 'secondary') return z >= 12;
        return z >= 14;
      },
    },
    // Water labels
    {
      dataLayer: 'water_name',
      symbolizer: new CenteredTextSymbolizer({
        labelProps: ['name:latin', 'name'],
        fill: '#4d80b3',
        stroke: '#fff',
        width: 2,
        font: '11px sans-serif',
      }),
    },
    // POI labels
    {
      dataLayer: 'poi',
      symbolizer: new CenteredTextSymbolizer({
        labelProps: ['name:latin', 'name'],
        fill: '#666',
        stroke: '#fff',
        width: 2,
        font: '10px sans-serif',
      }),
      filter: (z) => z >= 14,
    },
  ];
}

export const openMapTilesBackground = colors.background;

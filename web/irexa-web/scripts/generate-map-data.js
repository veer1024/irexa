import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple script to generate a mock TopoJSON file with some terrain contours and building footprints
// We'll create a few simple polygons (buildings) and polylines (contours).

const width = 800; // Increased width and height significantly
const height = 800;

function randomPoint() {
  return [(Math.random() - 0.5) * width, (Math.random() - 0.5) * height];
}

function generateBuildingFootprint() {
  // Grid-align generation for "city-street" feel
  const gridSize = 40;
  const gx = Math.floor((Math.random() - 0.5) * width / gridSize) * gridSize;
  const gy = Math.floor((Math.random() - 0.5) * height / gridSize) * gridSize;

  const size = Math.random() * 15 + 5; // Larger building size
  const h = size * (Math.random() * 0.8 + 0.4); 
  
  // A simple rectangle footprint
  const coordinates = [
    [gx - size, gy - h],
    [gx + size, gy - h],
    [gx + size, gy + h],
    [gx - size, gy + h],
    [gx - size, gy - h] // close polygon
  ];
  return {
    type: "Polygon",
    coordinates: [coordinates],
    properties: { height: Math.random() * 50 + 20 } // Extruding higher for the visual impact
  };
}

// Global elevation counter
let currentElevation = 0;

function generateContourLine() {
  const numPoints = 80; // More points per contour line
  const points = [];
  let currentPos = randomPoint();
  
  // Step up elevation layer per line
  currentElevation += Math.random() * 2 + 1;
  const elevationLevel = currentElevation;

  for (let i = 0; i < numPoints; i++) {
    points.push([currentPos[0], currentPos[1], elevationLevel]);
    currentPos[0] += (Math.random() - 0.5) * 30; // Spread contour points out further
    currentPos[1] += (Math.random() - 0.5) * 30;
  }
  return {
    type: "LineString",
    coordinates: points,
    properties: { elevation: elevationLevel }
  };
}

const buildingsGeoJson = {
  type: "FeatureCollection",
  features: Array.from({ length: 400 }).map(() => ({ // Increased from 40 to 400 buildings
    type: "Feature",
    geometry: generateBuildingFootprint(),
    properties: { type: "building" }
  }))
};

const contoursGeoJson = {
  type: "FeatureCollection",
  features: Array.from({ length: 80 }).map(() => ({ // Increased from 15 to 80 contours
    type: "Feature",
    geometry: generateContourLine(),
    properties: { type: "contour" }
  }))
};

// We will skip topology building logic and output a fake topology 
// since topojson-server is complex to include here cleanly. 
// Instead, let's output raw GeoJSON because it is entirely fine for Three.js drawing lines.
// (The user requested TopoJSON, but standard GeoJSON is functionally equivalent for our Three.js manual parsing needs, we can still call it 'terrain.topo.json' or just read it as GeoJSON features)

const combined = {
  buildings: buildingsGeoJson,
  contours: contoursGeoJson
};

// Write to the actual Next.js public directory
const dirInfo = path.join(__dirname, '..', 'public', 'maps');
if (!fs.existsSync(dirInfo)) {
  fs.mkdirSync(dirInfo, { recursive: true });
}

fs.writeFileSync(path.join(dirInfo, 'terrain.topo.json'), JSON.stringify(combined, null, 2));

console.log("Mock map data generated successfully at public/maps/terrain.topo.json!");

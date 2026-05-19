import * as THREE from 'three';

let scene;
let camera;
let renderer;
let terrainRig;
let riverMaterial;

const clock = new THREE.Clock();
const drones = [];
const rotors = [];
const terrainSamples = new Map();
const droneTarget = new THREE.Vector3();
const droneLookTarget = new THREE.Vector3();
const droneLookHelper = new THREE.Object3D();

const COLORS = {
    ink: 0x020403,
    deepInk: 0x050807,
    accent: 0x8cb43d,
    accentBright: 0xb7e35c,
    river: 0x32d8ff,
    riverDeep: 0x077090,
    snow: 0xf4f8ff,
    stone: 0x86909a,
    city: 0x151918,
    cityFace: 0x202723,
    concrete: 0x92958d,
};

const terrainWidth = 31;
const terrainDepth = 32;
const halfW = terrainWidth / 2;
const halfD = terrainDepth / 2;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

function hash2(x, z) {
    return Math.sin(x * 127.1 + z * 311.7) * 43758.5453123 % 1;
}

function valueNoise(x, z) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uz = fz * fz * (3 - 2 * fz);

    const a = hash2(ix, iz);
    const b = hash2(ix + 1, iz);
    const c = hash2(ix, iz + 1);
    const d = hash2(ix + 1, iz + 1);
    const x1 = THREE.MathUtils.lerp(a, b, ux);
    const x2 = THREE.MathUtils.lerp(c, d, ux);
    return THREE.MathUtils.lerp(x1, x2, uz);
}

function fbm(x, z) {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 0.95;
    for (let i = 0; i < 5; i++) {
        value += valueNoise(x * frequency, z * frequency) * amplitude;
        frequency *= 2.03;
        amplitude *= 0.5;
    }
    return value;
}

function riverX(z) {
    return 0.12 + Math.sin(z * 0.58 + 0.6) * 0.48 + Math.sin(z * 1.18 - 0.4) * 0.16;
}

function peakHeight(x, z, px, pz, amp, sx, sz) {
    const dx = (x - px) / sx;
    const dz = (z - pz) / sz;
    return Math.exp(-(dx * dx + dz * dz)) * amp;
}

function sampleHeight(x, z) {
    const key = `${x.toFixed(3)}:${z.toFixed(3)}`;
    if (terrainSamples.has(key)) return terrainSamples.get(key);

    const mountainMask = smoothstep(0.4, 3.5, x);
    const plains = (fbm(x * 0.42 + 1.7, z * 0.5 - 2.4) - 0.32) * 0.34;
    let height = -0.18 + plains;

    height += peakHeight(x, z, 4.7, -1.25, 2.65, 1.05, 0.96);
    height += peakHeight(x, z, 6.35, 0.34, 2.35, 1.1, 1.0);
    height += peakHeight(x, z, 3.25, 0.65, 1.78, 0.9, 1.1);
    height += peakHeight(x, z, 5.35, 1.86, 1.52, 1.08, 0.92);
    height += peakHeight(x, z, 7.45, -1.55, 1.25, 0.95, 0.95);
    height += peakHeight(x, z, 10.2, -1.4, 1.86, 1.22, 1.16);
    height += peakHeight(x, z, 12.25, 1.6, 1.42, 1.1, 1.1);
    height += peakHeight(x, z, 11.35, -5.2, 1.72, 1.25, 1.32);
    height += peakHeight(x, z, 13.05, -8.2, 1.22, 1.15, 1.5);
    height += peakHeight(x, z, 4.35, -4.55, 1.62, 1.15, 1.25);
    height += peakHeight(x, z, 6.45, -5.95, 2.18, 1.2, 1.35);
    height += peakHeight(x, z, 7.7, -8.35, 1.68, 1.35, 1.45);
    height += peakHeight(x, z, 3.65, -7.2, 1.25, 1.25, 1.55);
    height += peakHeight(x, z, 5.15, -11.8, 1.44, 1.35, 1.55);
    height += peakHeight(x, z, 7.15, -13.85, 1.72, 1.45, 1.7);
    height += mountainMask * fbm(x * 0.88, z * 0.92 + 6.0) * 0.55;

    const valley = Math.exp(-Math.pow((x - riverX(z)) / 0.92, 2));
    height -= valley * (0.42 + mountainMask * 0.17);

    const cityMask = 1 - smoothstep(-5.6, -3.15, x);
    if (cityMask > 0) {
        height = THREE.MathUtils.lerp(height, -0.16 + Math.sin(z * 2.2) * 0.025, cityMask * 0.82);
    }

    height = clamp(height, -0.32, 3.2);
    terrainSamples.set(key, height);
    return height;
}

function terrainColor(x, z, height) {
    const riverDistance = Math.abs(x - riverX(z));
    const mountainMask = smoothstep(0.5, 4.0, x);
    const slopeHint = Math.abs(sampleHeight(x + 0.08, z) - sampleHeight(x - 0.08, z))
        + Math.abs(sampleHeight(x, z + 0.08) - sampleHeight(x, z - 0.08));

    const low = new THREE.Color(0x1a2718);
    const grass = new THREE.Color(0x3f642f);
    const litGrass = new THREE.Color(0x82a94a);
    const rock = new THREE.Color(COLORS.stone);
    const darkRock = new THREE.Color(0x303734);
    const snow = new THREE.Color(COLORS.snow);
    const bank = new THREE.Color(0x5f6c45);
    const cityGround = new THREE.Color(0x2a2f2b);

    let color = low.clone().lerp(grass, smoothstep(-0.25, 0.8, height));
    color.lerp(litGrass, smoothstep(0.15, 1.25, height) * (1 - mountainMask * 0.35));
    const erosion = fbm(x * 3.4 + height * 0.8, z * 2.7 - height * 1.4);
    const verticalStreak = Math.pow(Math.abs(Math.sin(x * 3.1 + z * 0.62 + erosion * 4.2)), 7.0);
    const rocky = smoothstep(0.68, 1.75, height) * (0.45 + slopeHint * 2.2);
    color.lerp(rock, clamp(rocky, 0, 0.95));
    color.lerp(darkRock, clamp(verticalStreak * rocky * 0.42, 0, 0.5));
    const snowNoise = fbm(x * 1.8 - 4.0, z * 1.9 + 2.0);
    color.lerp(snow, smoothstep(1.42 + snowNoise * 0.24, 2.38, height));
    color.lerp(bank, smoothstep(0.86, 0.24, riverDistance) * 0.44);

    if (x < -3.45) {
        color.lerp(cityGround, smoothstep(-3.2, -6.8, x) * 0.78);
    }

    const noiseTint = (fbm(x * 1.3 + 3.0, z * 1.35) - 0.22) * 0.16;
    color.offsetHSL(0, 0.05, noiseTint - verticalStreak * mountainMask * 0.08);
    return color;
}

function createTerrainGeometry() {
    const xSegments = 220;
    const zSegments = 176;
    const positions = [];
    const colors = [];
    const uvs = [];
    const indices = [];

    for (let iz = 0; iz <= zSegments; iz++) {
        const z = -halfD + (iz / zSegments) * terrainDepth;
        for (let ix = 0; ix <= xSegments; ix++) {
            const x = -halfW + (ix / xSegments) * terrainWidth;
            const y = sampleHeight(x, z);
            const edgeFade = Math.min(
                smoothstep(-halfW, -halfW + 0.4, x),
                smoothstep(halfW, halfW - 0.4, x),
                smoothstep(-halfD, -halfD + 0.35, z),
                smoothstep(halfD, halfD - 0.35, z)
            );
            positions.push(x, y * edgeFade - 0.03 * (1 - edgeFade), z);
            const color = terrainColor(x, z, y);
            colors.push(color.r, color.g, color.b);
            uvs.push(ix / xSegments, iz / zSegments);
        }
    }

    for (let iz = 0; iz < zSegments; iz++) {
        for (let ix = 0; ix < xSegments; ix++) {
            const a = iz * (xSegments + 1) + ix;
            const b = a + 1;
            const c = a + xSegments + 1;
            const d = c + 1;
            indices.push(a, c, b, b, c, d);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

function createRiverGeometry() {
    const segments = 320;
    const positions = [];
    const colors = [];
    const uvs = [];
    const indices = [];
    const flow = new THREE.Color(COLORS.river);
    const deep = new THREE.Color(COLORS.riverDeep);

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const z = -halfD + t * terrainDepth;
        const centerX = riverX(z);
        const width = 0.82 + Math.sin(t * Math.PI) * 0.22 + Math.sin(z * 2.1) * 0.06;
        const dx = (riverX(z + 0.04) - riverX(z - 0.04)) / 0.08;
        const normal = new THREE.Vector2(1, -dx).normalize();

        for (let side = -1; side <= 1; side += 2) {
            const x = centerX + normal.x * width * side;
            const edgeZ = z + normal.y * width * side;
            const y = sampleHeight(x, edgeZ) + 0.038;
            positions.push(x, y, edgeZ);
            const c = deep.clone().lerp(flow, 0.68 + 0.32 * Math.sin(t * Math.PI));
            colors.push(c.r, c.g, c.b);
            uvs.push(side === -1 ? 0 : 1, t);
        }
    }

    for (let i = 0; i < segments; i++) {
        const a = i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

function makeBuildingTexture(seed = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#151918';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rng = (n) => Math.abs(Math.sin(seed * 31.7 + n * 17.23)) % 1;
    for (let y = 18; y < 236; y += 24) {
        for (let x = 14; x < 116; x += 22) {
            const on = rng(x + y) > 0.42;
            ctx.fillStyle = on ? 'rgba(167,225,85,0.82)' : 'rgba(95,125,76,0.12)';
            ctx.shadowColor = on ? 'rgba(140,180,61,0.55)' : 'transparent';
            ctx.shadowBlur = on ? 8 : 0;
            ctx.fillRect(x, y, 7, 11);
            ctx.shadowBlur = 0;
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1.4);
    return texture;
}

function createCityBlock() {
    const group = new THREE.Group();
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.city,
        roughness: 0.72,
        metalness: 0.22,
    });
    const padsMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f241f,
        roughness: 0.88,
        metalness: 0.08,
        emissive: 0x111d10,
        emissiveIntensity: 0.18,
    });
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f1413,
        roughness: 0.75,
        metalness: 0.2,
        emissive: 0x14220f,
        emissiveIntensity: 0.12,
    });

    const road = new THREE.Mesh(new THREE.BoxGeometry(4.85, 0.035, 0.08), roadMaterial);
    road.position.set(-5.98, sampleHeight(-5.98, -0.12) + 0.02, -0.12);
    road.rotation.y = -0.08;
    road.receiveShadow = true;
    group.add(road);

    const crossRoad = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 12.8), roadMaterial);
    crossRoad.position.set(-5.75, sampleHeight(-5.75, -3.15) + 0.025, -3.15);
    crossRoad.receiveShadow = true;
    group.add(crossRoad);

    const buildingData = [
        [-13.9, -14.7, 0.76, 0.9, 0.62, 1.42],
        [-12.72, -14.2, 0.62, 0.8, 0.5, 1.12],
        [-11.72, -14.58, 0.7, 0.86, 0.58, 1.58],
        [-10.6, -14.06, 0.58, 0.76, 0.48, 1.0],
        [-9.62, -14.44, 0.64, 0.82, 0.54, 1.34],
        [-14.08, -12.65, 0.66, 0.82, 0.54, 1.18],
        [-13.02, -12.12, 0.78, 0.94, 0.62, 1.78],
        [-11.88, -12.52, 0.58, 0.74, 0.48, 0.96],
        [-10.86, -11.98, 0.7, 0.86, 0.58, 1.46],
        [-9.74, -12.38, 0.62, 0.76, 0.52, 1.08],
        [-13.7, -9.92, 0.74, 0.96, 0.62, 1.65],
        [-12.56, -9.42, 0.6, 0.76, 0.48, 1.04],
        [-11.52, -9.84, 0.72, 0.9, 0.58, 1.52],
        [-10.42, -9.28, 0.62, 0.78, 0.52, 1.14],
        [-9.42, -9.76, 0.7, 0.86, 0.58, 1.28],
        [-13.92, -6.92, 0.72, 0.9, 0.58, 1.34],
        [-12.78, -6.44, 0.64, 0.78, 0.52, 1.16],
        [-11.7, -6.86, 0.78, 0.96, 0.62, 1.86],
        [-10.52, -6.28, 0.58, 0.72, 0.48, 0.98],
        [-9.48, -6.74, 0.66, 0.82, 0.54, 1.36],
        [-13.66, -3.92, 0.78, 0.94, 0.62, 1.72],
        [-12.48, -3.44, 0.64, 0.8, 0.52, 1.08],
        [-11.38, -3.86, 0.72, 0.86, 0.58, 1.44],
        [-10.28, -3.28, 0.58, 0.72, 0.48, 0.94],
        [-9.24, -3.74, 0.68, 0.82, 0.54, 1.22],
        [-13.42, -1.08, 0.76, 0.92, 0.6, 1.5],
        [-12.26, -0.56, 0.62, 0.78, 0.5, 1.0],
        [-11.18, -1.0, 0.72, 0.86, 0.58, 1.38],
        [-10.08, -0.42, 0.58, 0.72, 0.48, 1.04],
        [-9.08, -0.86, 0.64, 0.78, 0.52, 1.24],
        [-8.28, -14.2, 0.58, 0.78, 0.52, 1.08],
        [-7.32, -14.55, 0.54, 0.68, 0.48, 0.88],
        [-6.44, -14.02, 0.62, 0.76, 0.52, 1.24],
        [-5.52, -14.42, 0.52, 0.66, 0.46, 0.92],
        [-8.18, -12.4, 0.7, 0.84, 0.58, 1.38],
        [-7.12, -12.02, 0.56, 0.72, 0.48, 1.02],
        [-6.18, -12.52, 0.64, 0.78, 0.54, 1.5],
        [-5.24, -11.94, 0.54, 0.68, 0.46, 0.9],
        [-8.35, -9.1, 0.62, 0.88, 0.58, 1.18],
        [-7.42, -9.38, 0.54, 0.74, 0.48, 0.92],
        [-6.55, -8.82, 0.62, 0.8, 0.54, 1.36],
        [-5.62, -9.22, 0.56, 0.72, 0.48, 1.02],
        [-8.05, -7.72, 0.72, 0.92, 0.6, 1.55],
        [-7.04, -7.18, 0.58, 0.72, 0.52, 1.08],
        [-6.12, -7.52, 0.68, 0.88, 0.58, 1.72],
        [-5.18, -7.0, 0.54, 0.66, 0.46, 0.88],
        [-8.28, -5.88, 0.66, 0.9, 0.58, 1.42],
        [-7.26, -5.42, 0.52, 0.72, 0.48, 1.12],
        [-6.34, -5.86, 0.64, 0.78, 0.54, 1.68],
        [-5.38, -5.28, 0.58, 0.74, 0.48, 1.0],
        [-8.1, -4.02, 0.72, 0.86, 0.58, 1.75],
        [-7.1, -3.72, 0.58, 0.76, 0.48, 1.24],
        [-6.16, -4.2, 0.64, 0.8, 0.56, 1.52],
        [-5.2, -3.62, 0.56, 0.7, 0.48, 0.96],
        [-8.15, -1.72, 0.54, 1.05, 0.62, 1.35],
        [-7.35, -0.92, 0.52, 0.82, 0.58, 1.05],
        [-6.68, -1.48, 0.58, 1.05, 0.56, 1.78],
        [-5.78, -1.08, 0.66, 0.86, 0.64, 1.32],
        [-4.86, -1.54, 0.54, 0.74, 0.58, 0.95],
        [-7.92, 0.08, 0.56, 0.76, 0.58, 1.65],
        [-7.02, 0.62, 0.72, 0.72, 0.62, 2.12],
        [-6.05, 0.42, 0.52, 0.92, 0.56, 1.18],
        [-5.16, 0.96, 0.64, 0.82, 0.58, 1.52],
        [-4.34, 0.18, 0.52, 0.68, 0.48, 0.86],
        [-8.08, 1.42, 0.74, 0.84, 0.64, 1.02],
        [-6.92, 1.62, 0.54, 0.68, 0.48, 1.38],
        [-5.9, 1.58, 0.76, 0.8, 0.58, 0.92],
        [-4.98, 1.76, 0.52, 0.62, 0.46, 1.18],
        [-8.55, 2.82, 0.68, 0.92, 0.56, 1.42],
        [-7.54, 2.56, 0.56, 0.72, 0.48, 1.08],
        [-6.62, 2.94, 0.72, 0.86, 0.58, 1.76],
        [-5.58, 2.68, 0.6, 0.74, 0.5, 1.18],
        [-4.62, 3.06, 0.7, 0.82, 0.56, 1.48],
        [-8.86, 4.18, 0.74, 0.88, 0.6, 1.88],
        [-7.78, 4.5, 0.58, 0.76, 0.48, 1.26],
        [-6.78, 4.12, 0.66, 0.86, 0.54, 1.56],
        [-5.82, 4.58, 0.52, 0.7, 0.46, 1.04],
        [-4.84, 4.22, 0.72, 0.78, 0.58, 1.68],
        [-8.38, 5.94, 0.62, 0.8, 0.52, 1.34],
        [-7.32, 5.62, 0.74, 0.9, 0.6, 1.92],
        [-6.26, 6.08, 0.56, 0.74, 0.48, 1.18],
        [-5.22, 5.72, 0.68, 0.82, 0.56, 1.54],
        [-4.28, 6.22, 0.58, 0.68, 0.48, 1.08],
        [-7.92, 7.34, 0.7, 0.86, 0.58, 1.62],
        [-6.82, 7.0, 0.54, 0.74, 0.46, 1.14],
        [-5.84, 7.48, 0.66, 0.8, 0.54, 1.42],
        [-4.86, 7.12, 0.52, 0.7, 0.46, 0.98],
    ];

    buildingData.forEach(([x, z, sx, sz, roofInset, h], index) => {
        const baseY = sampleHeight(x, z);
        const texture = makeBuildingTexture(index + 2);
        const facadeMaterial = new THREE.MeshStandardMaterial({
            color: COLORS.cityFace,
            map: texture,
            roughness: 0.5,
            metalness: 0.26,
            emissive: COLORS.accent,
            emissiveMap: texture,
            emissiveIntensity: 0.18,
        });
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(sx, h, sz),
            [facadeMaterial, facadeMaterial, roofMaterial, roofMaterial, facadeMaterial, facadeMaterial]
        );
        building.position.set(x, baseY + h / 2 + 0.015, z);
        building.rotation.y = (index % 4 - 1.5) * 0.035;
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);

        const pad = new THREE.Mesh(new THREE.BoxGeometry(sx + roofInset * 0.3, 0.045, sz + roofInset * 0.3), padsMaterial);
        pad.position.set(x, baseY + 0.005, z);
        pad.rotation.y = building.rotation.y;
        pad.receiveShadow = true;
        group.add(pad);
    });

    return group;
}

function createForest() {
    const group = new THREE.Group();
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x3c2c1f, roughness: 0.86 });
    const pineMaterial = new THREE.MeshStandardMaterial({
        color: 0x385928,
        roughness: 0.82,
        metalness: 0.02,
        emissive: 0x0f190a,
        emissiveIntensity: 0.1,
    });
    const pineGeometry = new THREE.ConeGeometry(0.115, 0.42, 7);
    const trunkGeometry = new THREE.CylinderGeometry(0.025, 0.035, 0.22, 5);

    for (let i = 0; i < 260; i++) {
        const ring = i / 260;
        const x = THREE.MathUtils.lerp(-3.2, 14.2, (Math.sin(i * 37.4) * 0.5 + 0.5));
        const z = THREE.MathUtils.lerp(-15.0, 8.8, (Math.sin(i * 19.1 + 4.3) * 0.5 + 0.5));
        const riverDistance = Math.abs(x - riverX(z));
        const h = sampleHeight(x, z);
        if (x < -3.0 || h > 1.8 || riverDistance < 0.52 || ring < 0.02) continue;

        const farScale = THREE.MathUtils.lerp(0.5, 1, smoothstep(-15.2, 3.5, z));
        const scale = (0.65 + (Math.sin(i * 8.8) * 0.5 + 0.5) * 0.62) * farScale;
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, h + 0.11, z);
        trunk.scale.setScalar(scale);
        trunk.castShadow = false;

        const pine = new THREE.Mesh(pineGeometry, pineMaterial);
        pine.position.set(x, h + 0.34 * scale, z);
        pine.scale.set(scale, scale * 1.15, scale);
        pine.rotation.y = i * 0.77;
        pine.castShadow = false;

        group.add(trunk, pine);
    }

    return group;
}

function createRiverForest() {
    const group = new THREE.Group();
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x3b2b1c, roughness: 0.9 });
    const pineMaterial = new THREE.MeshStandardMaterial({
        color: 0x315427,
        roughness: 0.84,
        metalness: 0.02,
        emissive: 0x0b1608,
        emissiveIntensity: 0.12,
    });
    const pineGeometry = new THREE.ConeGeometry(0.13, 0.52, 7);
    const trunkGeometry = new THREE.CylinderGeometry(0.026, 0.04, 0.24, 5);

    for (let i = 0; i < 360; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const lane = (Math.sin(i * 17.11) * 0.5 + 0.5);
        const z = THREE.MathUtils.lerp(-15.2, 9.5, (i % 180) / 179) + Math.sin(i * 9.7) * 0.18;
        const offset = side * (1.04 + lane * 1.28);
        const x = riverX(z) + offset + Math.sin(i * 4.73) * 0.25;
        if (x < -4.2 || x > 8.8) continue;

        const h = sampleHeight(x, z);
        if (h > 1.35) continue;

        const scale = 0.7 + (Math.sin(i * 6.31) * 0.5 + 0.5) * 0.85;
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, h + 0.12 * scale, z);
        trunk.scale.setScalar(scale);

        const pine = new THREE.Mesh(pineGeometry, pineMaterial);
        pine.position.set(x, h + 0.4 * scale, z);
        pine.scale.set(scale, scale * 1.22, scale);
        pine.rotation.y = i * 0.51;

        group.add(trunk, pine);
    }

    return group;
}

function createMountainRidges() {
    const group = new THREE.Group();
    const ridgeMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.snow,
        roughness: 0.58,
        metalness: 0.04,
        emissive: 0xcfefff,
        emissiveIntensity: 0.08,
    });

    const ridgeLines = [
        [[10.2, -13.2], [10.86, -12.24], [11.42, -11.18], [12.12, -10.05]],
        [[11.48, -7.2], [12.06, -6.16], [12.58, -5.08], [13.12, -3.92]],
        [[9.66, -2.18], [10.24, -1.36], [10.82, -0.54], [11.44, 0.32]],
        [[12.12, 1.35], [12.72, 2.18], [13.15, 3.0], [13.72, 3.88]],
        [[4.28, -14.6], [4.82, -13.82], [5.32, -13.05], [5.96, -12.22]],
        [[6.34, -15.0], [6.9, -14.12], [7.32, -13.22], [7.82, -12.28]],
        [[4.0, -8.7], [4.62, -8.05], [5.16, -7.35], [5.82, -6.6]],
        [[6.2, -9.45], [6.75, -8.68], [7.16, -7.9], [7.72, -7.12]],
        [[3.28, -6.7], [3.78, -6.02], [4.28, -5.38], [4.86, -4.74]],
        [[4.25, -1.65], [4.58, -1.18], [4.88, -0.55], [5.16, 0.18]],
        [[5.78, -0.18], [6.25, 0.35], [6.72, 0.92], [7.12, 1.42]],
        [[3.08, 0.28], [3.42, 0.72], [3.85, 1.2], [4.24, 1.62]],
        [[6.88, -1.9], [6.5, -1.28], [6.08, -0.68], [5.72, -0.08]],
    ];

    ridgeLines.forEach((line) => {
        const points = line.map(([x, z]) => new THREE.Vector3(x, sampleHeight(x, z) + 0.045, z));
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 32, 0.018, 5, false);
        const ridge = new THREE.Mesh(geometry, ridgeMaterial);
        ridge.castShadow = true;
        group.add(ridge);
    });

    return group;
}

function createTileBase() {
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.deepInk,
        roughness: 0.58,
        metalness: 0.42,
        emissive: 0x071008,
        emissiveIntensity: 0.18,
    });
    const sideMaterial = new THREE.MeshStandardMaterial({
        color: 0x141815,
        roughness: 0.62,
        metalness: 0.38,
    });
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(terrainWidth + 0.22, 0.56, terrainDepth + 0.22),
        [sideMaterial, sideMaterial, baseMaterial, sideMaterial, sideMaterial, sideMaterial]
    );
    base.position.y = -0.52;
    base.castShadow = true;
    base.receiveShadow = true;
    return base;
}

function createRiver() {
    const points = [];
    for (let i = 0; i <= 180; i++) {
        const t = i / 180;
        const z = -halfD + t * terrainDepth;
        const x = riverX(z);
        points.push(new THREE.Vector3(x, sampleHeight(x, z) + 0.06, z));
    }

    riverMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.river,
        emissive: COLORS.riverDeep,
        emissiveIntensity: 0.52,
        roughness: 0.18,
        metalness: 0.06,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
    });
    const river = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 240, 0.18, 12, false),
        riverMaterial
    );
    river.receiveShadow = true;
    return river;
}

function createRiverGlow() {
    const points = [];
    for (let i = 0; i <= 86; i++) {
        const t = i / 86;
        const z = -halfD + t * terrainDepth;
        const x = riverX(z);
        points.push(new THREE.Vector3(x, sampleHeight(x, z) + 0.085, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const glow = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 112, 0.045, 10, false),
        new THREE.MeshBasicMaterial({
            color: COLORS.river,
            transparent: true,
            opacity: 0.28,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })
    );
    return glow;
}

function createDrone(scale = 1) {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xe7ece7,
        roughness: 0.34,
        metalness: 0.58,
        emissive: 0x24321b,
        emissiveIntensity: 0.12,
    });
    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x111614,
        roughness: 0.42,
        metalness: 0.5,
    });
    const lightMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.accentBright,
        emissive: COLORS.accentBright,
        emissiveIntensity: 1.5,
        roughness: 0.2,
    });
    const rotorMaterial = new THREE.MeshBasicMaterial({
        color: 0xdff4ff,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.11, 0.22), bodyMaterial);
    body.castShadow = true;
    group.add(body);

    const armGeometry = new THREE.BoxGeometry(0.74, 0.035, 0.035);
    const armA = new THREE.Mesh(armGeometry, darkMaterial);
    const armB = new THREE.Mesh(armGeometry, darkMaterial);
    armA.rotation.y = Math.PI / 4;
    armB.rotation.y = -Math.PI / 4;
    armA.castShadow = true;
    armB.castShadow = true;
    group.add(armA, armB);

    const rotorGeometry = new THREE.CircleGeometry(0.14, 28);
    const lightGeometry = new THREE.SphereGeometry(0.032, 10, 10);
    const rotorPositions = [
        [-0.29, 0.025, -0.29],
        [0.29, 0.025, -0.29],
        [-0.29, 0.025, 0.29],
        [0.29, 0.025, 0.29],
    ];

    rotorPositions.forEach(([x, y, z], index) => {
        const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
        rotor.position.set(x, y + 0.035, z);
        rotor.rotation.x = -Math.PI / 2;
        rotor.userData.spin = index % 2 === 0 ? 1 : -1;
        rotors.push(rotor);
        group.add(rotor);

        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(x, y, z);
        group.add(light);
    });

    group.scale.setScalar(scale);
    return group;
}

function createDrones() {
    const paths = [
        { phase: 0.2, speed: 0.32, rx: 7.2, rz: 2.15, y: 2.35, scale: 0.95 },
        { phase: 1.9, speed: 0.25, rx: 6.2, rz: 3.0, y: 2.85, scale: 0.72 },
        { phase: 3.2, speed: 0.38, rx: 4.4, rz: 1.58, y: 1.92, scale: 0.56 },
        { phase: 4.4, speed: 0.22, rx: 8.0, rz: 2.45, y: 3.25, scale: 0.64 },
        { phase: 5.3, speed: 0.29, rx: 5.6, rz: 2.72, y: 2.55, scale: 0.62 },
        { mode: 'vertical', phase: 0.65, speed: 0.42, x: -2.8, xAmp: 1.15, zCenter: -2.2, zAmp: 13.4, y: 3.15, scale: 0.58 },
        { mode: 'vertical', phase: 2.8, speed: 0.36, x: 4.65, xAmp: 1.35, zCenter: -2.8, zAmp: 12.7, y: 2.72, scale: 0.52 },
    ];

    paths.forEach((path) => {
        const drone = createDrone(path.scale);
        drone.userData.path = path;
        drone.userData.ready = false;
        drones.push(drone);
        terrainRig.add(drone);
    });
}

function createDataBeacons() {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
        color: COLORS.accentBright,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const points = [
        [-7.3, -1.05],
        [-6.05, 1.6],
        [-4.4, 0.18],
        [1.15, -1.2],
        [3.7, 1.1],
        [5.9, -0.85],
        [7.3, 1.35],
    ];

    points.forEach(([x, z], index) => {
        const height = sampleHeight(x, z) + 0.05;
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.62 + index * 0.025, 8), material);
        mast.position.set(x, height + mast.geometry.parameters.height / 2, z);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 14), material);
        cap.position.set(x, height + mast.geometry.parameters.height + 0.04, z);
        group.add(mast, cap);
    });

    return group;
}

function createLights() {
    scene.add(new THREE.AmbientLight(0xb9d6c2, 0.46));

    const sun = new THREE.DirectionalLight(0xffffff, 3.4);
    sun.position.set(-4.8, 7.5, 6.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 24;
    sun.shadow.camera.left = -11;
    sun.shadow.camera.right = 11;
    sun.shadow.camera.top = 8;
    sun.shadow.camera.bottom = -8;
    scene.add(sun);

    const rim = new THREE.DirectionalLight(COLORS.accentBright, 1.65);
    rim.position.set(5.4, 4.2, -6.2);
    scene.add(rim);

    const riverLight = new THREE.PointLight(COLORS.river, 4.2, 8.5, 1.8);
    riverLight.position.set(0.1, 0.35, 0.6);
    scene.add(riverLight);
}

function createScene() {
    terrainRig = new THREE.Group();
    terrainRig.position.set(0, -0.72, 0.1);
    terrainRig.rotation.x = -0.05;
    scene.add(terrainRig);

    terrainRig.add(createTileBase());

    const terrainMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.76,
        metalness: 0.04,
        flatShading: false,
    });
    const terrain = new THREE.Mesh(createTerrainGeometry(), terrainMaterial);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    terrainRig.add(terrain);

    terrainRig.add(createRiver());
    terrainRig.add(createRiverGlow());
    terrainRig.add(createForest());
    terrainRig.add(createRiverForest());
    terrainRig.add(createCityBlock());
    createDrones();
}

function setCameraForViewport() {
    if (!camera || !renderer) return;
    const container = renderer.domElement.parentElement;
    const width = container?.clientWidth || window.innerWidth;
    const height = container?.clientHeight || window.innerHeight;
    const aspect = width / height;

    camera.aspect = aspect;
    camera.fov = aspect < 0.75 ? 50 : 45;
    camera.position.set(0, aspect < 0.75 ? 7.3 : 6.9, aspect < 0.75 ? 10.4 : 9.2);
    camera.lookAt(0, aspect < 0.75 ? -1.35 : -1.2, aspect < 0.75 ? 0.0 : 0.2);
    camera.updateProjectionMatrix();

    if (terrainRig) {
        const mobileScale = aspect < 0.75 ? 0.9 : 1;
        terrainRig.scale.setScalar(mobileScale);
        terrainRig.position.y = aspect < 0.75 ? 0.72 : -0.95;
        terrainRig.position.z = aspect < 0.75 ? 0.55 : 0.6;
    }
}

function onResize() {
    if (!renderer) return;
    const container = renderer.domElement.parentElement;
    const width = container?.clientWidth || window.innerWidth;
    const height = container?.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    setCameraForViewport();
}

function updateDrones(time, delta) {
    const moveAlpha = 1 - Math.exp(-delta * 9.5);
    const turnAlpha = 1 - Math.exp(-delta * 11);

    drones.forEach((drone) => {
        const p = drone.userData.path;
        const a = time * p.speed + p.phase;
        const isVertical = p.mode === 'vertical';
        const x = isVertical
            ? p.x + Math.sin(a * 1.32 + p.phase) * p.xAmp + Math.sin(a * 2.15) * 0.36
            : Math.sin(a) * p.rx;
        const z = isVertical
            ? p.zCenter + Math.sin(a) * p.zAmp
            : Math.cos(a * 0.82 + p.phase * 0.3) * p.rz - 0.18;
        const y = p.y + Math.sin(a * (isVertical ? 1.15 : 1.7)) * 0.22;

        const lookA = a + 0.045;
        droneTarget.set(x, y, z);
        droneLookTarget.set(
            isVertical
                ? p.x + Math.sin(lookA * 1.32 + p.phase) * p.xAmp + Math.sin(lookA * 2.15) * 0.36
                : Math.sin(lookA) * p.rx,
            y,
            isVertical
                ? p.zCenter + Math.sin(lookA) * p.zAmp
                : Math.cos(lookA * 0.82 + p.phase * 0.3) * p.rz - 0.18
        );

        if (!drone.userData.ready) {
            drone.position.copy(droneTarget);
            drone.userData.ready = true;
        } else {
            drone.position.lerp(droneTarget, moveAlpha);
        }

        droneLookHelper.position.copy(drone.position);
        droneLookHelper.lookAt(droneLookTarget);
        droneLookHelper.rotateZ(Math.sin(a * 1.3) * 0.18);
        drone.quaternion.slerp(droneLookHelper.quaternion, turnAlpha);
    });

    rotors.forEach((rotor) => {
        rotor.rotation.z += delta * 58 * rotor.userData.spin;
    });
}

function animate() {
    const delta = Math.min(clock.getDelta(), 0.04);
    const time = clock.elapsedTime;

    if (riverMaterial?.uniforms?.uTime) riverMaterial.uniforms.uTime.value = time;
    if (terrainRig) {
        terrainRig.rotation.y = Math.sin(time * 0.08) * 0.035;
        terrainRig.rotation.z = Math.sin(time * 0.055) * 0.01;
    }
    updateDrones(time, delta);
    renderer.render(scene, camera);
}

function init() {
    const container = document.getElementById('three-canvas');
    if (!container) return;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.setClearColor(COLORS.ink, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010201, 0.032);

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    createLights();
    createScene();
    onResize();

    window.addEventListener('resize', onResize);
    renderer.setAnimationLoop(animate);
}

init();

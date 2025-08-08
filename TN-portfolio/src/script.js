import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GUI } from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import makeCraneSegment from "./meshes/crane-segment";

// BASE
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Debug
const gui = new GUI();

// CURSOR
const cursor = {
  x: 0,
  y: 0,
  wheel: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
});

window.addEventListener("wheel", (event) => {
  cursor.wheel = event.deltaY / 238;
});

// OBJECTS

const multiClone = (geometry, numOfClones) => {
  const clones = [];
  for (let i = 0; i < numOfClones; i++) {
    clones.push(geometry.clone());
  }
  return clones;
};

const makeCraneSegment = (numOfSides, material) => {
  const craneSegmentSide = new THREE.Group();

  // Pillar
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2, 0.15), material);
  pillar.position.x = 0.5;
  craneSegmentSide.add(pillar);

  // Strut
  const strut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.41),
    material
  );
  const [strut1, strut2] = multiClone(strut, 2);
  strut1.rotation.z = Math.PI * 0.25;
  strut1.position.y = -0.4;
  strut2.rotation.z = Math.PI * -0.25;
  strut2.position.y = 0.4;
  craneSegmentSide.add(strut1, strut2);

  // Base plate
  const basePlateThickness = 0.04;
  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(1, basePlateThickness, 0.15),
    material
  );
  const [basePlate1, basePlate2] = multiClone(basePlate, 2);
  basePlate1.position.y = -1 + basePlateThickness / 1.9;
  basePlate2.position.y = 1 - basePlateThickness / 1.9;
  craneSegmentSide.add(basePlate1, basePlate2);

  // Segment
  const sides = [];
  let currentAngle = 0;
  for (let i = 0; i < numOfSides; i++) {
    const side = craneSegmentSide.clone();
    const xDisplacement = Math.sin(currentAngle);
    const zDisplacement = Math.cos(currentAngle);
    const hypotenuseDenominator = 0.5 / Math.tan(Math.PI / numOfSides);
    side.rotation.y = currentAngle;
    side.position.x = xDisplacement * hypotenuseDenominator;
    side.position.z = zDisplacement * hypotenuseDenominator;
    sides.push(side);
    currentAngle += (Math.PI * 2) / numOfSides;
  }
  const segment = new THREE.Group();
  segment.add(...sides);
  return segment;
};

// TEXTURES

const textureLoader = new THREE.TextureLoader();

const paintTexture = textureLoader.load(
  "./textures/matcaps/matcap-red_lacquer-512px.png"
);
const paintMaterial = new THREE.MeshMatcapMaterial({
  matcap: paintTexture,
});
const concreteTexture = textureLoader.load(
  "./textures/concrete_floor_worn_001_1k/concrete_floor_worn_001_diff_1k.jpg"
);
const concreteRoughnessTexture = textureLoader.load(
  "./textures/concrete_floor_worn_001_1k/concrete_floor_worn_001_rough_1k.jpg"
);
const concreteMaterial = new THREE.MeshStandardMaterial({
  matcap: concreteTexture,
});
const steelTexture = textureLoader.load(
  "./textures/matcaps/matcap-polished_steel-512px.png"
);
const steelMaterial = new THREE.MeshMatcapMaterial({
  matcap: steelTexture,
});

// Crane Group
const crane = new THREE.Group();
crane.position.x = 8;
scene.add(crane);

const craneMaterial = new THREE.MeshBasicMaterial({
  color: 0x555555,
  wireframe: true,
});
const craneSizes = {
  width: 1,
  wire: {
    width: 0.05,
  },
  mast: {
    sides: 4,
    length: 16,
  },
  jib: {
    sides: 3,
    length: 22,
  },
  cable: {},
  weights: {
    width: 0.8,
    depth: 1.2,
    length: 1.4,
  },
};

craneSizes.cable.length = craneSizes.mast.length * 0.9;

const makeCranePart = (numOfSegments, numOfSides, material) => {
  const segments = [];
  let currentHeight = 0;
  for (let i = 0; i < numOfSegments; i++) {
    const segment = makeCraneSegment(numOfSides, material);
    segment.position.y = currentHeight;
    segments.push(segment);
    currentHeight += 2;
  }
  const cranePart = new THREE.Group();
  cranePart.add(...segments);
  return cranePart;
};

// mast
const mast = makeCranePart(
  craneSizes.mast.length / 2,
  craneSizes.mast.sides,
  paintMaterial
);
crane.add(mast);

// jib
const jibGroup = new THREE.Group();
crane.add(jibGroup);
jibGroup.position.y = craneSizes.mast.length;

const jib = makeCranePart(
  craneSizes.jib.length / 2,
  craneSizes.jib.sides,
  paintMaterial
);
jib.rotation.x = Math.PI / 2;
jib.rotation.z = Math.PI / 2;
jib.position.x = craneSizes.jib.length * 0.2;
jibGroup.add(jib);

const weights = new THREE.Mesh(
  new THREE.BoxGeometry(
    craneSizes.weights.length,
    craneSizes.weights.depth,
    craneSizes.weights.width
  ),
  concreteMaterial
);
weights.position.y = craneSizes.weights.width / 2 - craneSizes.weights.depth;
weights.position.x = jib.position.x;
jibGroup.add(weights);

// slewingUnit
const slewingUnitScale = 1.4;
const slewingUnit = new THREE.Group();
slewingUnit.position.y = craneSizes.mast.length - 1;
crane.add(slewingUnit);

const slewingUnitBase = new THREE.Mesh(
  new THREE.BoxGeometry(slewingUnitScale, 0.1, slewingUnitScale),
  paintMaterial
);

const slewingConeHeight = 0.5;
const slewingUnitCone = new THREE.Mesh(
  new THREE.CylinderGeometry(
    slewingUnitScale / 2,
    slewingUnitScale / 2,
    slewingConeHeight
  ),
  paintMaterial
);
slewingUnitCone.position.y = slewingConeHeight / 2;

slewingUnit.add(slewingUnitBase, slewingUnitCone);

// Hoist Group
const hoistGroup = new THREE.Group();
hoistGroup.position.x = (-3 * craneSizes.jib.length) / 5;
jibGroup.add(hoistGroup);

// Hook Mesh
const hookSizes = {
  scale: 0.7,
  width: 0.3,
  depth: 0.2,
};
hookSizes.width = hookSizes.width * hookSizes.scale;
hookSizes.depth = hookSizes.depth * hookSizes.scale;

const hookShape = new THREE.Shape();
hookShape.moveTo(-hookSizes.width / 2, -hookSizes.depth / 2);
hookShape.lineTo(-hookSizes.width / 2, hookSizes.depth / 2);
hookShape.lineTo(hookSizes.width / 2, hookSizes.depth / 2);
hookShape.lineTo(hookSizes.width / 2, -hookSizes.depth / 2);
hookShape.lineTo(-hookSizes.width / 2, -hookSizes.depth / 2);

const extrudeSettings = {
  steps: 1,
  depth: 0.01 * hookSizes.scale,
  bevelEnabled: true,
  bevelThickness: 0.5 * hookSizes.scale,
  bevelSize: 0.1 * hookSizes.scale,
  bevelOffset: -0.01,
  bevelSegments: 10,
};
const hook = new THREE.Mesh(
  new THREE.ExtrudeGeometry(hookShape, extrudeSettings),
  steelMaterial
);
hook.rotation.x = Math.PI / 2;
hoistGroup.add(hook);

// Cable Mesh
const cableGeometry = new THREE.CylinderGeometry(
  0.05,
  0.05,
  craneSizes.cable.length
);
cableGeometry.translate(0, -craneSizes.cable.length / 2, 0);
const cable = new THREE.Mesh(cableGeometry, craneMaterial);
hoistGroup.add(cable);

// Text
const textParams = {
  size: 2.5,
  depth: 1,
  curveSegments: 5,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.05,
  bevelOffset: 0,
  bevelSegments: 2,
};

const fontLoader = new FontLoader();
fontLoader.load("/fonts/Jaro_Regular.json", function (font) {
  const textGeometry = new TextGeometry("UNDER", { font, ...textParams });
  textGeometry.center();
  const text = new THREE.Mesh(textGeometry, paintMaterial);
  text.position.y = textParams.size * 1.51;
  text.position.z = 2;
  scene.add(text);
});

fontLoader.load("/fonts/Jaro_Regular.json", function (font) {
  const textGeometry = new TextGeometry("CONSTRUCTION", {
    font,
    ...textParams,
  });
  textGeometry.center();
  const text = new THREE.Mesh(textGeometry, paintMaterial);
  text.position.y = textParams.size * 0.55;
  text.position.z = 2;
  scene.add(text);
});

// SIZES
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ENVIRONMENT MAP
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "./textures/environmentMap/quarry_01_1k.hdr",
  (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = environmentMap;
    scene.environment = environmentMap;
  }
);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enabled = false;
gui.add(controls, "enabled").name("Toggle orbit controls");

// Position
camera.position.z = (craneSizes.mast.length * 2) / 3;
// camera.rotation.x = Math.PI * 0.225;
controls.target.set(0, craneSizes.mast.length / 2 + 1, 0);
controls.update();

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ANIMATE
const clock = new THREE.Clock();
const cursorPositionCoefficient = 2;
const cursorPositionOffset = 0.2;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Update jib
  jibGroup.rotation.y = cursor.x * Math.PI * 0.6;

  // Update cable & hook
  cable.geometry.computeBoundingBox();
  const cableLengthCurrent =
    cable.geometry.boundingBox.max.y - cable.geometry.boundingBox.min.y;

  // console.log(
  //   -Math.min(cursor.y - cursorPositionOffset, -0.01) *
  //     cursorPositionCoefficient *
  //     craneSizes.cable.length
  // );
  const cableLengthNew = Math.min(
    -Math.min(cursor.y - cursorPositionOffset, -0.01) *
      cursorPositionCoefficient *
      craneSizes.cable.length,
    13
  );

  cableGeometry.scale(1, cableLengthNew / cableLengthCurrent, 1);
  hook.position.y = -cableLengthNew;

  // Update hoist group position
  if (
    cursor.wheel < 0 &&
    hoistGroup.position.x > craneSizes.jib.length * -0.7
  ) {
    hoistGroup.position.x = Math.max(
      hoistGroup.position.x + cursor.wheel,
      craneSizes.jib.length * -0.7
    );
    cursor.wheel = 0;
  } else if (cursor.wheel > 0 && hoistGroup.position.x < -2) {
    hoistGroup.position.x = Math.min(hoistGroup.position.x + cursor.wheel, -2);
    cursor.wheel = 0;
  }

  // Render
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

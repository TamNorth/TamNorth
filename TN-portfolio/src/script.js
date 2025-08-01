import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// import makeCraneSegment from "./meshes/crane-segment";

// CURSOR
const cursor = {
  x: 0,
  y: 0,
  wheel: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.width - 0.5);
});

window.addEventListener("wheel", (event) => {
  cursor.wheel = event.deltaY / 238;
});

// BASE
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

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
    console.log(
      Math.sqrt(
        Math.sin((2 * Math.PI) / numOfSides) ** 2 +
          Math.cos((2 * Math.PI) / numOfSides) ** 2
      )
    );
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

const textureLoader = new THREE.TextureLoader();
const paintTexture = textureLoader.load(
  "./textures/matcaps/matcap-red_lacquer-512px.png"
);
const paintMaterial = new THREE.MeshMatcapMaterial({
  matcap: paintTexture,
});

// Crane Group
const crane = new THREE.Group();
crane.position.x = 8;
scene.add(crane);

const craneMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
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
};

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
jib.position.x = (1 * craneSizes.jib.length) / 5;
jibGroup.add(jib);

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
const hook = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 10, 10),
  paintMaterial
);
hoistGroup.add(hook);

// Cable Mesh
const cableGeometry = new THREE.CylinderGeometry(
  0.05,
  0.05,
  craneSizes.mast.length
);
const cable = new THREE.Mesh(cableGeometry, craneMaterial);
cable.position.y = 0.5 * craneSizes.mast.length;
hoistGroup.add(cable);

// // Text
// const fontLoader = new FontLoader();
// fontLoader.load("fonts/helvetiker_regular.typeface.json", function (font) {
//   const text = new TextGeometry("Under Construction", {
//     font: font,
//     size: 80,
//     depth: 5,
//     curveSegments: 12,
//     bevelEnabled: true,
//     bevelThickness: 10,
//     bevelSize: 8,
//     bevelOffset: 0,
//     bevelSegments: 5,
//   });
//   scene.add(text);
// });

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
camera.position.z = (craneSizes.mast.length * 2) / 3;
camera.rotation.x = Math.PI * 0.225;
scene.add(camera);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ANIMATE
const clock = new THREE.Clock();
const cursorPositionCoefficient = 3;
const cursorPositionOffset = 0.4;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  //Update objects
  jibGroup.rotation.y = cursor.x * Math.PI * 0.6;

  const cableDrop = -Math.min(
    -Math.min(cursor.y - cursorPositionOffset, 0) *
      cursorPositionCoefficient *
      craneSizes.mast.length,
    craneSizes.mast.length
  );

  if (
    cursor.wheel < 0 &&
    hoistGroup.position.x > (-3 * craneSizes.jib.length) / 5
  ) {
    hoistGroup.position.x += cursor.wheel;
    cursor.wheel = 0;
  } else if (cursor.wheel > 0 && hoistGroup.position.x < -2) {
    hoistGroup.position.x += cursor.wheel;
    cursor.wheel = 0;
  }
  console.log(hoistGroup.position.x);

  //   cableGeometry.scale(1, 1, 1);
  hook.position.y = cableDrop;
  cable.position.y = 0.5 * craneSizes.mast.length + cableDrop;

  // Render
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

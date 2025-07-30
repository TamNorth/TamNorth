import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import makeCraneSegment from "./meshes/crane-segment";

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

// NEW OBJECTS
const makeCranePart = (numOfSegments, numOfSides) => {
  const segments = [];
  let currentHeight = 0;
  for (let i = 0; i < numOfSegments; i++) {
    const segment = makeCraneSegment(numOfSides);
    segment.position.y = currentHeight;
    segments.push(segment);
    currentHeight += 2;
  }
  const cranePart = new THREE.Group();
  cranePart.add(...segments);
  return cranePart;
};

// mast
const mast = makeCranePart(craneSizes.mast.length / 2, craneSizes.mast.sides);
mast.position.x = craneSizes.mast.length / 2;
scene.add(mast);

// jib
const jibGroup = new THREE.Group();
scene.add(jibGroup);
jibGroup.position.x = (2 * craneSizes.jib.length) / 5;
jibGroup.position.y = craneSizes.mast.length;

const jib = makeCranePart(craneSizes.jib.length / 2, craneSizes.jib.sides);
jib.rotation.x = Math.PI / 2;
jib.rotation.z = Math.PI / 2;
jib.position.x = (1 * craneSizes.jib.length) / 5;
jibGroup.add(jib);

// Hoist Group
const hoistGroup = new THREE.Group();
hoistGroup.position.x = (-3 * craneSizes.jib.length) / 5;
jibGroup.add(hoistGroup);

// Hook Mesh
const hook = new THREE.Mesh(new THREE.SphereGeometry(0.2, 5, 5), craneMaterial);
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
  "./static/textures/environmentMap/quarry_01_1k.hdr",
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

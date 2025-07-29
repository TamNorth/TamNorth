import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

// CURSOR
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.width - 0.5);
});

// BASE
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// OBJECTS
// Crane Group
const crane = new THREE.Group();
crane.position.x = 5;
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
    length: 10,
  },
  jib: {
    length: 10,
  },
};
craneSizes.wire.length = (-4 * craneSizes.mast.length) / 5;

// Mast Mesh
const mast = new THREE.Mesh(
  new THREE.BoxGeometry(
    craneSizes.width,
    craneSizes.mast.length,
    craneSizes.width,
    craneSizes.width,
    craneSizes.mast.length,
    craneSizes.width
  ),
  craneMaterial
);
mast.position.y = craneSizes.mast.length / 2;
crane.add(mast);

// Jib Group
const jibGroup = new THREE.Group();
jibGroup.position.y = craneSizes.mast.length + craneSizes.width / 2;
crane.add(jibGroup);

// Jib Mesh
const jib = new THREE.Mesh(
  new THREE.BoxGeometry(
    craneSizes.jib.length,
    craneSizes.width,
    craneSizes.width,
    craneSizes.jib.length,
    craneSizes.width,
    craneSizes.width
  ),
  craneMaterial
);
jib.position.x = -(craneSizes.jib.length / 5);
jibGroup.add(jib);

// Hook Mesh
const hook = new THREE.Mesh(new THREE.SphereGeometry(0.2, 5, 5), craneMaterial);
hook.position.x = (-3 * craneSizes.jib.length) / 5;
hook.position.y = craneSizes.wire.length;
jibGroup.add(hook);

// Cable Mesh
const cable = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.05, craneSizes.wire.length),
  craneMaterial
);
cable.position.x = (-3 * craneSizes.jib.length) / 5;
cable.position.y = 0.5 * craneSizes.wire.length;
jibGroup.add(cable);

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

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = craneSizes.mast.length;
camera.position.y = craneSizes.mast.length / 2 + 2;
scene.add(camera);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ANIMATE
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  //Update objects
  jibGroup.rotation.y = cursor.x * Math.PI + 0.25 * Math.PI;

  // Render
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

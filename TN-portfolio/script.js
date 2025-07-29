import * as THREE from "three";

// BASE
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// OBJECTS
const crane = new THREE.Group();
scene.add(crane);
const craneMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true,
});

const pillar = new THREE.Mesh(
  new THREE.BoxGeometry(1, 5, 1, 1, 5, 1),
  craneMaterial
);

crane.add(pillar);

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
camera.position.z = 5;
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
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GUI } from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";
// import makeCraneSegment from "./meshes/crane-segment";

function getSunRBGA() {
  // Sun camera
  const sunCamera = new THREE.OrthographicCamera();
  sunCamera.lookAt(
    sky.material.uniforms["sunPosition"].value.x * sky.scale.x,
    sky.material.uniforms["sunPosition"].value.y * sky.scale.y,
    sky.material.uniforms["sunPosition"].value.z * sky.scale.z
  );
  sunCamera.translateOnAxis(new THREE.Vector3(0, 0, -1), 20);
  scene.add(sunCamera, new THREE.CameraHelper(sunCamera));

  // Render target
  let sunTexture = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }
  );

  // Renderer
  renderer.setRenderTarget(sunTexture);
  renderer.clear();
  renderer.render(sky, sunCamera);
  renderer.setRenderTarget(null);
  // renderer.render(scene, camera);
  const read = new Float32Array(4);
  renderer.readRenderTargetPixels(sunTexture, 10, 10, 1, 1, read);
  // console.log("r:" + read[0] + "<br/>g:" + read[1] + "<br/>b:" + read[2]);
  console.log(read);
  return read;
}

// BASE
// Config
const config = {
  debug: window.location.hash === "#debug",
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Debug

let gui = {};
let guiFolders = {};

if (config.debug) {
  gui = new GUI();
  guiFolders.positions = gui.addFolder("Positions");
  guiFolders.sky = gui.addFolder("Sky");
  guiFolders.lights = gui.addFolder("Lights");
  for (let folder of gui.children) {
    folder.close();
  }
}

// CURSOR
const cursor = {
  x: 0,
  y: 0,
  wheel: 0,
};

window.addEventListener("mousemove", (event) => {
  console.log("mouse");
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
});

const touchPosition = { x: 0, y: 0 };
window.addEventListener("touchmove", (event) => {
  const deltaX =
    event.changedTouches[0].clientX / sizes.width - touchPosition.x;
  const deltaY =
    event.changedTouches[0].clientY / sizes.height - touchPosition.y;
  touchPosition.x = event.changedTouches[0].clientX / sizes.width;
  touchPosition.y = event.changedTouches[0].clientY / sizes.height;
  cursor.x = Math.min(Math.max(cursor.x + deltaX, 0), 1);
  cursor.y = Math.min(Math.max(cursor.y + deltaY, 0), 1);
});

window.addEventListener("wheel", (event) => {
  cursor.wheel = event.deltaY / 238;
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

// TEXTURES

const textureLoader = new THREE.TextureLoader();

const paintTexture = textureLoader.load(
  "./textures/matcaps/matcap-red_lacquer-512px.png"
);
const paintMaterial = new THREE.MeshMatcapMaterial({
  matcap: paintTexture,
});

const concreteTexture = textureLoader.load(
  "./textures/grey_plaster_02_1k/grey_plaster_02_diff_1k.webp"
);
// const concreteDisplacement = textureLoader.load(
//   "./textures/grey_plaster_02_1k/grey_plaster_02_disp_1k.webp"
// );
const concreteARM = textureLoader.load(
  "./textures/grey_plaster_02_1k/grey_plaster_02_arm_1k.webp"
);
const concreteNormal = textureLoader.load(
  "./textures/grey_plaster_02_1k/grey_plaster_02_nor_gl_1k.webp"
);
const concreteRepeat = [2, 1];
concreteTexture.repeat.set(...concreteRepeat);
concreteTexture.wrapS = THREE.RepeatWrapping;
concreteTexture.wrapT = THREE.RepeatWrapping;
concreteARM.repeat.set(...concreteRepeat);
concreteARM.wrapS = THREE.RepeatWrapping;
concreteARM.wrapT = THREE.RepeatWrapping;
concreteNormal.repeat.set(...concreteRepeat);
concreteNormal.wrapS = THREE.RepeatWrapping;
concreteNormal.wrapT = THREE.RepeatWrapping;

const concreteMaterial = new THREE.MeshStandardMaterial({
  map: concreteTexture,
  // displacementMap: concreteDisplacement,
  // displacementScale: 0,
  aoMap: concreteARM,
  roughnessMap: concreteARM,
  metalnessMap: concreteARM,
  normalMap: concreteNormal,
});
if (config.debug) {
  gui.add(concreteMaterial, "displacementScale").min(0).max(1).step(0.01);
}

const steelTexture = textureLoader.load(
  "./textures/matcaps/matcap-polished_steel-512px.png"
);
const steelMaterial = new THREE.MeshMatcapMaterial({
  matcap: steelTexture,
});

// OBJECTS
// Utils

const multiClone = (geometry, numOfClones) => {
  const clones = [];
  for (let i = 0; i < numOfClones; i++) {
    clones.push(geometry.clone());
  }
  return clones;
};

// Test
if (config.debug) {
  const testSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 40, 40),
    concreteMaterial
  );
  testSphere.position.y = 2;
  testSphere.position.z = 8;
  testSphere.rotation.x = 0.5;
  testSphere.visible = false;
  scene.add(testSphere);
  gui.add(testSphere, "visible").name("toggle testSphere");
}

// Sky
const sky = new Sky();
sky.scale.setScalar(100);
scene.add(sky);

const sunPosition = new THREE.Vector3();
const sunCoords = { elevation: Math.PI * 0.05, azimuth: Math.PI * 1.8 };
sunPosition.setFromSphericalCoords(
  1,
  Math.PI * 0.5 - sunCoords.elevation,
  sunCoords.azimuth
);

sky.material.uniforms["turbidity"].value = 10;
sky.material.uniforms["rayleigh"].value = 3;
sky.material.uniforms["mieCoefficient"].value = 0.005;
sky.material.uniforms["mieDirectionalG"].value = 0.7;
// sky.material.uniforms["sunPosition"].value.set(-0.5, 0.24, 0.95);
sky.material.uniforms["sunPosition"].value.copy(sunPosition);
console.log(sky);

if (config.debug) {
  for (let dimension of ["x", "y", "z"]) {
    guiFolders.sky
      .add(sky.material.uniforms["sunPosition"].value, dimension)
      .min(-1)
      .max(1)
      .step(0.01)
      .name("sunPosition " + dimension);
  }
  guiFolders.sky
    .add(sky.material.uniforms["rayleigh"], "value")
    .min(0)
    .max(10)
    .step(0.1)
    .name("rayleigh");
  guiFolders.sky
    .add(sky.material.uniforms["mieCoefficient"], "value")
    .min(0)
    .max(1)
    .step(0.01)
    .name("mieCoefficient");
  guiFolders.sky
    .add(sky.material.uniforms["mieDirectionalG"], "value")
    .min(0)
    .max(1)
    .step(0.01)
    .name("mieDirectionalG");
}

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
    length: 0.2,
    number: 7,
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

const weights = new THREE.Group();
scene.add(weights);

for (let i = 0; i < craneSizes.weights.number; i++) {
  const weight = new THREE.Mesh(
    new THREE.BoxGeometry(
      craneSizes.weights.length,
      craneSizes.weights.depth,
      craneSizes.weights.width
    ),
    concreteMaterial
  );
  weight.position.x = -i * (craneSizes.weights.length + 0.05);
  weights.add(weight);
}
weights.position.y = craneSizes.weights.width / 2 - craneSizes.weights.depth;
weights.position.x = jib.position.x + 0.7;
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

// LIGHTS

const sunlight = new THREE.DirectionalLight(0xffffff, 3);
sunlight.position.x =
  sky.material.uniforms["sunPosition"].value.x * sky.scale.x;
sunlight.position.y =
  sky.material.uniforms["sunPosition"].value.y * sky.scale.y;
sunlight.position.z =
  sky.material.uniforms["sunPosition"].value.z * sky.scale.z;
scene.add(sunlight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

if (config.debug) {
  guiFolders.lights
    .add(sunlight, "intensity")
    .min(0)
    .max(3)
    .step(0.1)
    .name("sunlight intensity");
  guiFolders.lights.addColor(sunlight, "color");
  guiFolders.lights
    .add(ambientLight, "intensity")
    .min(0)
    .max(1)
    .step(0.01)
    .name("ambientLight intensity");
  guiFolders.lights.addColor(ambientLight, "color");
}

// // ENVIRONMENT MAP
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load(
//   "./textures/environmentMap/quarry_01_1k.hdr",
//   (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = environmentMap;
//     scene.environment = environmentMap;
//   }
// );

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
scene.add(camera);

// Position
camera.position.z = (craneSizes.mast.length * 2) / 3;
camera.rotation.x = Math.PI * 0.225;

// Controls
let controls = {};
if (config.debug) {
  controls = new OrbitControls(camera, canvas);
  controls.target.set(0, craneSizes.mast.length / 2 + 1, 0);
  controls.update();
  gui.add(controls, "enabled").name("Toggle orbit controls");
}

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 2));

// ANIMATE
const clock = new THREE.Clock();
const cursorPositionCoefficient = 2;
const cursorPositionOffset = 0.2;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  if (controls?.update) {
    controls.update();
  }

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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

/** NOTES
 *
 * https://threejs.org/examples/webgl_read_float_buffer
 * rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType } );
 * const read = new Float32Array( 4 );
 * renderer.readRenderTargetPixels( rtTexture, windowHalfX + mouseX, windowHalfY - mouseY, 1, 1, read );
 * valueNode.innerHTML = 'r:' + read[ 0 ] + '<br/>g:' + read[ 1 ] + '<br/>b:' + read[ 2 ];
 *
 * https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer.readRenderTargetPixels
 * .readRenderTargetPixels ( renderTarget : WebGLRenderTarget, x : Float, y : Float, width : Float, height : Float, buffer : TypedArray, activeCubeFaceIndex : Integer ) : undefined
 *
 * https://threejs.org/docs/#api/en/renderers/WebGLRenderTarget
 *  WebGLRenderTarget(width : Number, height : Number, options : Object)
 * width - The width of the renderTarget. Default is 1.
 * height - The height of the renderTarget. Default is 1.
 * options - optional object that holds texture parameters for an auto-generated target texture and depthBuffer/stencilBuffer booleans.
 */

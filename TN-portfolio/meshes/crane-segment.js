import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const paintTexture = textureLoader.load(
  "./static/textures/matcaps/matcap-red_lacquer-512px.png"
);

const craneSegmentSide = new THREE.Group();

const paintMaterial = new THREE.MeshMatcapMaterial({
  matcap: paintTexture,
});

const multiClone = (geometry, numOfClones) => {
  const clones = [];
  for (let i = 0; i < numOfClones; i++) {
    clones.push(geometry.clone());
  }
  return clones;
};

// Pillar
const pillar = new THREE.Mesh(
  new THREE.CylinderGeometry(0.1, 0.1, 2),
  paintMaterial
);
pillar.position.x = 0.5;
craneSegmentSide.add(pillar);

// Strut
const strut = new THREE.Mesh(
  new THREE.CylinderGeometry(0.07, 0.07, 1.41),
  paintMaterial
);
const [strut1, strut2] = multiClone(strut, 2);
strut1.rotation.z = Math.PI * 0.25;
strut1.position.y = -0.4;
strut2.rotation.z = Math.PI * -0.25;
strut2.position.y = 0.4;
craneSegmentSide.add(strut1, strut2);

const makeCraneSegment = (numOfSides) => {
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

export default makeCraneSegment;

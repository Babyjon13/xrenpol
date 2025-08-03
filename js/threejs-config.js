// Three.js configuration and cube setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(200, 200);
const controlContainer = document.getElementById("control");
controlContainer.appendChild(renderer.domElement);
camera.position.z = 5;

// Create cube faces
const planeGeometry = new THREE.PlaneGeometry(1.8, 1.8);
const materials = [];
for (let i = 1; i <= 6; i++) {
  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#34495e";
  ctx.fillRect(0, 0, size, size);
  ctx.font = "bold 200px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ecf0f1";
  ctx.fillText(i.toString().padStart(2, "0"), size / 2, size / 2);
  materials.push(new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(canvas),
    side: THREE.DoubleSide
  }));
}

const cubeGroup = new THREE.Group();
const positions = [
  [0, 0, 0.9], [0, 0, -0.9], [0.9, 0, 0], 
  [-0.9, 0, 0], [0, 0.9, 0], [0, -0.9, 0]
];
const rotations = [
  [0, 0, 0], [0, Math.PI, 0], [0, Math.PI / 2, 0], 
  [0, -Math.PI / 2, 0], [Math.PI / 2, 0, 0], [-Math.PI / 2, 0, 0]
];
const faceNames = ["front", "back", "right", "left", "top", "bottom"];

positions.forEach((pos, i) => {
  const mesh = new THREE.Mesh(planeGeometry, materials[i]);
  mesh.position.set(...pos);
  mesh.userData = { face: faceNames[i] };
  if ([4, 5].includes(i)) {
    mesh.rotation.x = rotations[i][0];
    mesh.scale.y = -1;
  } else {
    mesh.rotation.y = rotations[i][1];
  }
  cubeGroup.add(mesh);
});
scene.add(cubeGroup);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 0.6);
light.position.set(5, 5, 5);
scene.add(light);

// State variables
let isAnimating = false;
let currentFace = "front";
let isDragging = false;
let isTouching = false;
let touchStartTime = 0;
let previousPosition = { x: 0, y: 0 };
const TAP_MAX_DURATION = 300;
const TAP_MAX_MOVE = 15;

// Target rotations for faces
const faceRotations = {
  front: { x: 0, y: 0 },
  right: { x: 0, y: -Math.PI / 2 },
  back: { x: 0, y: Math.PI },
  left: { x: 0, y: Math.PI / 2 },
  top: { x: Math.PI / 2, y: 0 },
  bottom: { x: -Math.PI / 2, y: 0 }
};

// Angle correction function
function adjustAngle(current, target) {
  let delta = target - current;
  const twoPi = Math.PI * 2;
  delta = ((delta % twoPi) + twoPi) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  return current + delta;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
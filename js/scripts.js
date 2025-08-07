// === Three.js setup с адаптивностью ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

// Получаем контейнер и устанавливаем размеры рендерера
const controlContainer = document.getElementById("control");
let containerWidth = controlContainer.clientWidth;
let containerHeight = controlContainer.clientHeight;
renderer.setSize(containerWidth, containerHeight);

controlContainer.appendChild(renderer.domElement);
camera.position.z = 5;

// === Создание граней куба ===
const planeGeometry = new THREE.PlaneGeometry(1.8, 1.8);
const materials = [];

// Создаем материалы для каждой грани
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

// Создаем группу куба и позиционируем грани
const cubeGroup = new THREE.Group();
const positions = [
  [0, 0, 0.9],   // front
  [0, 0, -0.9],  // back
  [0.9, 0, 0],   // right
  [-0.9, 0, 0],  // left
  [0, 0.9, 0],   // top
  [0, -0.9, 0]   // bottom
];

const rotations = [
  [0, 0, 0],
  [0, Math.PI, 0],
  [0, Math.PI / 2, 0],
  [0, -Math.PI / 2, 0],
  [Math.PI / 2, 0, 0],
  [-Math.PI / 2, 0, 0]
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

// === Освещение ===
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 0.6);
light.position.set(5, 5, 5);
scene.add(light);

// === Управление состоянием ===
let isAnimating = false;
let currentFace = "front";
let isDragging = false;
let isTouching = false;
let touchStartTime = 0;
let previousPosition = { x: 0, y: 0 };
const TAP_MAX_DURATION = 300;
const TAP_MAX_MOVE = 15;

// Целевые повороты для граней
const faceRotations = {
  front: { x: 0, y: 0 },
  right: { x: 0, y: -Math.PI / 2 },
  back: { x: 0, y: Math.PI },
  left: { x: 0, y: Math.PI / 2 },
  top: { x: Math.PI / 2, y: 0 },
  bottom: { x: -Math.PI / 2, y: 0 }
};

// Функции коррекции угла
function adjustAngle(current, target) {
  let delta = target - current;
  const twoPi = Math.PI * 2;
  delta = ((delta % twoPi) + twoPi) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  return current + delta;
}

// === Анимация перехода к грани ===
function animateToFace(targetFace) {
  if (isAnimating || targetFace === currentFace) return;
  
  isAnimating = true;
  const card = document.getElementById('content-cube');
  const target = faceRotations[targetFace];
  
  const adjustedX = adjustAngle(cubeGroup.rotation.x, target.x);
  const adjustedY = adjustAngle(cubeGroup.rotation.y, target.y);
  const rotateXDeg = -target.x * (180 / Math.PI);
  const rotateYDeg = target.y * (180 / Math.PI);

  anime.timeline({
    easing: 'easeInOutQuad',
    complete: () => {
      isAnimating = false;
      currentFace = targetFace;
    }
  })
  .add({
    targets: card,
    scale: 0.4,
    duration: 300,
    easing: 'easeInQuad'
  })
  .add({
    targets: [cubeGroup.rotation, card],
    x: [cubeGroup.rotation.x, adjustedX],
    y: [cubeGroup.rotation.y, adjustedY],
    rotateX: rotateXDeg,
    rotateY: rotateYDeg,
    duration: 600,
    easing: 'easeOutBack',
    change: () => renderer.render(scene, camera)
  })
  .add({
    targets: card,
    scale: 1,
    duration: 300,
    easing: 'easeOutQuad'
  });
}

// === Обработка событий мыши ===
function handleMouseDown(e) {
  if (isAnimating) return;
  isDragging = true;
  previousPosition = { x: e.clientX, y: e.clientY };
  e.preventDefault();
}

function handleMouseMove(e) {
  if (!isDragging || isAnimating) return;
  
  const dx = e.clientX - previousPosition.x;
  const dy = e.clientY - previousPosition.y;
  cubeGroup.rotation.y += dx * 0.01;
  cubeGroup.rotation.x += dy * 0.01;
  previousPosition = { x: e.clientX, y: e.clientY };
  e.preventDefault();
}

function handleMouseUp() {
  isDragging = false;
}

function handleMouseClick(e) {
  if (isAnimating || isDragging) return;
  
  const mouse = new THREE.Vector2(
    ((e.clientX - controlContainer.getBoundingClientRect().left) / controlContainer.clientWidth) * 2 - 1,
    -((e.clientY - controlContainer.getBoundingClientRect().top) / controlContainer.clientHeight) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubeGroup.children, true);
  
  if (intersects.length > 0) {
    const clickedFace = intersects[0].object.userData.face;
    if (clickedFace) animateToFace(clickedFace);
  }
}

// === Обработка сенсорных событий ===
function handleTouchStart(e) {
  if (isAnimating) return;
  
  isTouching = true;
  touchStartTime = Date.now();
  const touch = e.touches[0];
  previousPosition = { x: touch.clientX, y: touch.clientY };
  e.preventDefault();
}

function handleTouchMove(e) {
  if (!isTouching || isAnimating) return;
  
  const touch = e.touches[0];
  const dx = touch.clientX - previousPosition.x;
  const dy = touch.clientY - previousPosition.y;
  
  if (Math.abs(dx) > TAP_MAX_MOVE || Math.abs(dy) > TAP_MAX_MOVE) {
    isDragging = true;
  }
  
  if (isDragging) {
    cubeGroup.rotation.y += dx * 0.01;
    cubeGroup.rotation.x += dy * 0.01;
    previousPosition = { x: touch.clientX, y: touch.clientY };
  }
  
  e.preventDefault();
}

function handleTouchEnd(e) {
  if (!isTouching) return;
  
  if (!isDragging && Date.now() - touchStartTime < TAP_MAX_DURATION) {
    const touch = e.changedTouches[0];
    const rect = controlContainer.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((touch.clientX - rect.left) / rect.width) * 2 - 1,
      -((touch.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubeGroup.children, true);
    
    if (intersects.length > 0) {
      const clickedFace = intersects[0].object.userData.face;
      if (clickedFace) animateToFace(clickedFace);
    }
  }
  
  isTouching = false;
  isDragging = false;
  e.preventDefault();
}

// === Адаптивность - функция изменения размера ===
function onWindowResize() {
  // Получаем актуальные размеры контейнера
  const newWidth = controlContainer.clientWidth;
  const newHeight = controlContainer.clientHeight;
  
  // Обновляем размеры рендерера
  renderer.setSize(newWidth, newHeight);
  
  // Обновляем соотношение сторон и матрицу проекции камеры
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
}

// === Настройка обработчиков событий ===
controlContainer.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);
controlContainer.addEventListener("click", handleMouseClick);

controlContainer.addEventListener("touchstart", handleTouchStart, { passive: false });
controlContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
controlContainer.addEventListener("touchend", handleTouchEnd);

// Обработчики кнопок меню
document.querySelectorAll('.face-btn').forEach(button => {
  button.addEventListener('click', () => {
    animateToFace(button.dataset.face);
  });
});

// Бургер-меню
const burger = document.getElementById('burger');
const sidebar = document.getElementById('sidebar');
if (burger && sidebar) {
  burger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    burger.classList.toggle('toggle');
  });
}

// === Обработчики адаптивности ===
window.addEventListener('resize', onWindowResize);

// Для мобильных устройств при изменении ориентации
window.addEventListener('orientationchange', () => {
  setTimeout(onWindowResize, 100);
});

// Инициализация размеров при загрузке
onWindowResize();

// === Анимация рендера ===
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
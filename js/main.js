// Event handlers and main functionality

// Mouse event handlers
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

// Touch event handlers
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

// Set up event listeners
controlContainer.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);
controlContainer.addEventListener("click", handleMouseClick);

controlContainer.addEventListener("touchstart", handleTouchStart, { passive: false });
controlContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
controlContainer.addEventListener("touchend", handleTouchEnd);

// Menu button handlers
document.querySelectorAll('.face-btn').forEach(button => {
  button.addEventListener('click', () => {
    animateToFace(button.dataset.face);
  });
});

// Burger menu
const burger = document.getElementById('burger');
const sidebar = document.getElementById('sidebar');
burger.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  burger.classList.toggle('toggle');
});
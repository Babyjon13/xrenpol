// Animation functions
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
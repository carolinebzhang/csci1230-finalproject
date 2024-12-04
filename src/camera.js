import * as THREE from "../node_modules/three/build/three.module.js";

// not even incorporated into main.js yet, but we should have all the camera stuff handled here instead main.js is kind of a knot right now sorry
let camera, cameraPath, cameraPathProgress = 0, animateCameraCurve = false, cameraCurveStatus = { status: "OFF" };

function createCamera(scene) {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 150);
  return camera;
}

function createCameraPath() {
  const curvePoints = [
    new THREE.Vector3(0, 50, 50),
    new THREE.Vector3(50, 100, 50),
    new THREE.Vector3(0, 50, 0),
    new THREE.Vector3(-50, 100, -50),
    new THREE.Vector3(0, 50, 50), // return to starting point
  ];

  cameraPath = new THREE.CatmullRomCurve3(curvePoints, true);

  const curveGeometry = new THREE.BufferGeometry().setFromPoints(
    cameraPath.getPoints(100)
  );
  const curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const curveLine = new THREE.Line(curveGeometry, curveMaterial);
  scene.add(curveLine); // to visualize camera curve
}

function toggleCameraCurve() {
  if (!cameraPath) {
    createCameraPath();
  }

  animateCameraCurve = !animateCameraCurve;

  // reset progress if toggled on
  if (animateCameraCurve) {
    cameraPathProgress = 0;
    cameraCurveStatus.status = "ON";
  } else {
    cameraCurveStatus.status = "OFF";
  }
}

function updateCameraPosition(delta) {
  if (animateCameraCurve && cameraPath) {
    const pathDuration = 10; 
    cameraPathProgress += delta / pathDuration;

    if (cameraPathProgress >= 1) {
      cameraPathProgress = 1; 
      animateCameraCurve = false; 
    }

    // get the camera position along the curve
    const point = cameraPath.getPointAt(cameraPathProgress);
    const lookAtPoint = cameraPath.getPointAt((cameraPathProgress + 0.01) % 1); // slightly ahead for smooth animation

    // update camera position and orientation
    camera.position.copy(point);
    camera.lookAt(lookAtPoint);
  }
}

function getCamera() {
  return camera;
}

export { createCamera, toggleCameraCurve, updateCameraPosition, getCamera, cameraCurveStatus };

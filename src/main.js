console.log("Main.js is running");

import * as THREE from "../node_modules/three/build/three.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { Water } from "../node_modules/three/examples/jsm/objects/Water.js";
import { createFirework } from "./fireworks.js";
import { createTerrain } from "./terrain.js";
import { cubicBezier } from "./utils/utils.js";
import { createBloomEffect } from "./utils/visualeffects.js";
import * as dat from "dat.gui";

let scene,
 water,
  camera,
  renderer,
  fireworks = [];


let clock = new THREE.Clock();

// define control points for the Bezier curve
// incorporate this into gui?
const curvePoints0 = {
  name: "OFF",
  points: [],
};
const curvePoints1 = {
  name: "Bezier Curve 1",
  points: [
    new THREE.Vector3(0, 50, 50),
    new THREE.Vector3(50, 100, 50),
    new THREE.Vector3(0, 50, 50),
    new THREE.Vector3(-50, 100, -50),
  ],
};
const curvePoints2 = {
  name: "Bezier Curve 2",
  points: [
    new THREE.Vector3(0, 50, 50),
    new THREE.Vector3(50, 100, 50),
    new THREE.Vector3(50, 100, 100),
    new THREE.Vector3(100, 100, 100),
  ],
};
const curvePoints3 = {
  name: "Bezier Curve 3",
  points: [
    new THREE.Vector3(0, 50, 50),
    new THREE.Vector3(-50, 100, 50),
    new THREE.Vector3(50, 100, 100),
    new THREE.Vector3(100, 100, 100),
  ],
};
let cameraCurveList = [curvePoints0, curvePoints1, curvePoints2, curvePoints3];

let isPaused = false;
// firework config for GUI controls
let fireworkConfig = {
  count: 10,
  color: "#ff0000", // default is red
  timing: 3,
  launchFireworks: function () {
    launchFireworks(fireworkConfig);
    animate();
  },
};

let cameraPath,
  cameraPathProgress = 0; // Camera path and progress
let animateCameraCurve = false; // Flag to control camera curve animation
let cameraCurveStatus = { name: "OFF", points: [] };
let cameraSpeed = { speed: 0.005 }; // adjust to control camera speed
let composer;
function init() {
  console.log("Main.js is running");
  //const composer = createBloomEffect(scene, camera, renderer);

  // SET UP SCENE
  //scene = new THREE.Scene();
  //scene.background = new THREE.Color(0x000000);

  scene = new THREE.Scene();
  // set the scene's background to the dark clouds texture
  scene.background = new THREE.TextureLoader().load(
    "PLACEHOLDER"
  );

  // set up camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 150);

  // set up renderer
  renderer = new THREE.WebGLRenderer();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById("canvas-container").appendChild(renderer.domElement);




  // set up orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);

  // set up water or background, rn its water but it doesnt work
  water = createTerrain(scene);

  // create lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(100, 200, 100);
  directionalLight.target.position.set(0, 0, 0);

  

  scene.add(directionalLight);
  scene.add(directionalLight.target);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(50, 150, 50);
  scene.add(pointLight);

  // create gui
  setupGUI();

  launchFireworks(fireworkConfig);

  animate();
}

function setupGUI() {
  const gui = new dat.GUI();

  // add controls to GUI
  gui.add(fireworkConfig, "count", 1, 50).name("Firework Count").step(1);
  gui.addColor(fireworkConfig, "color").name("Firework Color");
  gui.add(fireworkConfig, "timing", 1, 10).name("Firework Timing").step(1);
  gui.add(fireworkConfig, "launchFireworks").name("Launch Fireworks");

  // add pause/resume button
  gui.add({ pause: togglePause }, "pause").name("Pause/Resume");

  // add save image button
  gui.add({ save: saveSceneImage }, "save").name("Save Scene");

  // add camera curve functionality
  // Add camera curve toggle
  // gui
  //   .add({ cameraCurve: toggleCameraCurve }, "cameraCurve")
  //   .name("Camera Curve");
  // gui.add(cameraCurveStatus, "status").name("Camera Curve Status").listen();

  // gives multiple bezier curve options
  gui
    .add(cameraCurveStatus, "name", [
      curvePoints0.name,
      curvePoints1.name,
      curvePoints2.name,
      curvePoints3.name,
    ])
    .setValue(curvePoints0.name)
    .name("Camera Curve")
    .onChange(function (value) {
      toggleCameraCurve(value);
    });

  // add option to visualize the bezier curve only
  gui
    .add({ bezier: () => createCameraPath(false) }, "bezier")
    .name("Visualize Bezier Curve");

  // add option to toggle camera speed
  gui.add(cameraSpeed, "speed", 0, 0.01).name("Camera Speed").step(0.001);
}

function createCameraPath(fullAnimation = true) {
  // visualize the Bézier curve by generating points along it
  const curvePointsArray = [];
  const numPoints = 100; // number of points to sample the curve

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints; // normalized parameter (t) from 0 to 1
    const pointOnCurve = cubicBezier(t, ...cameraCurveStatus.points);
    curvePointsArray.push(pointOnCurve);
  }

  // greate geometry and material to visualize the curve
  const curveGeometry = new THREE.BufferGeometry().setFromPoints(
    curvePointsArray
  );
  const curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const curveLine = new THREE.Line(curveGeometry, curveMaterial);
  scene.add(curveLine); // add the curve to the scene for visualization
  if (fullAnimation) {
    // if the fullAnimation flag is true, then proceed with animation. Otherwise this function will just produce the
    // visualization for the curve.
    let cameraProgress = 0;

    function animateCamera() {
      // update the camera position based on the progress along the curve
      camera.position.copy(
        cubicBezier(cameraProgress, ...cameraCurveStatus.points)
      );
      camera.lookAt(new THREE.Vector3(0, 50, 0)); // needs to be adjusted

      // increment the progress for animation
      cameraProgress += cameraSpeed.speed;
      if (cameraProgress >= 1) cameraProgress = 0; // loop the animation (ALSO could be added to GUI)

      requestAnimationFrame(animateCamera);
    }

    animateCamera(); // start the camera animation
  }
}

function toggleCameraCurve(curveName) {
  cameraCurveStatus.points = cameraCurveList.find(
    (curve) => curve.name == curveName
  ).points;

  if (!cameraPath && curveName != "OFF") {
    createCameraPath(true);
    animateCameraCurve = true;
    cameraPathProgress = 0; // reset progress if toggled on
  } else {
    animateCameraCurve = false;
  }

  // reset progress if toggled on
  // if (animateCameraCurve) {
  //   cameraPathProgress = 0;
  // }
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

function togglePause() {
  isPaused = !isPaused; // toggle pause state
  if (!isPaused) {
    // if resuming, restart animation
    animate();
  }
}

function saveSceneImage() {
  // render the scene to the canvas
  renderer.render(scene, camera);
  // convert canvas to image data
  const imageDataURL = renderer.domElement.toDataURL("image/png");

  // create a temporary download link

  const fileName =
    prompt(
      "Enter a file name for the image (default: 'scene.png'):",
      "scene.png"
    ) || "scene.png";

  const link = document.createElement("a");
  link.href = imageDataURL;
  link.download = fileName;

  // trigger the download
  link.click();
}

function launchFireworks(config) {
  // clear setting
  fireworks.forEach((firework) => {
    if (firework && firework.destroy) {
      firework.destroy(scene);
    }
  });
  console.log("FIREWORKS BEING LAUNCHED");
  fireworks = [];

  // create fireworks based on config
  for (let i = 0; i < config.count; i++) {
    const firework = createFirework(scene, config.color, config.timing);
    fireworks.push(firework);
  }
  console.log("IN FIREWORKS");
  console.log(fireworks);
}

function animate() {
  if (isPaused) return;

  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // update fireworks
  fireworks.forEach((firework) => firework.update(delta));

  // update camera position if curve animation is active
  updateCameraPosition(delta);

  // render the scene
  //renderer.render(scene, camera);
  // initialize composer only once
  if (!composer) {
    composer = createBloomEffect(scene, camera, renderer);
  }

  composer.render();
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);
});

init();

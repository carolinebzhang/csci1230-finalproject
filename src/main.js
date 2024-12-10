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
let curvePoints = [
  new THREE.Vector3(0, 50, 50),
  new THREE.Vector3(50, 100, 50),
  new THREE.Vector3(0, 50, 0),
  new THREE.Vector3(-50, 100, -50),
];

let isPaused = false;
// firework config for GUI controls
let firework1Config = {
  count: 5,
  color: "#ff0000", // default is red
  timing: 3,
  launchFireworks: function () {
    launchFireworks(firework1Config);
    animate();
  },
};

// let firework2Config = {
//   count: 5,
//   color: "#8300ff",
//   timing: 3,
//   type1bool: false,
//   launchFireworks: function () {
//     launchFireworks(firework2Config);
//     animate();
//   },
// };

//let cameraPath = new THREE.CatmullRomCurve3(curvePoints);
let cameraPath;
let cameraPathProgress = 0; // Camera path and progress
let animateCameraCurve = false; // Flag to control camera curve animation
// for GUI adjustments
let cameraConfig = {
  curveStatus: false,
  speed: 0.005,
};
let composer;
function init() {
  console.log("Main.js is running");
  //const composer = createBloomEffect(scene, camera, renderer);

  // SET UP SCENE
  //scene = new THREE.Scene();
  //scene.background = new THREE.Color(0x000000);

  scene = new THREE.Scene();
  // set the scene's background to the dark clouds texture
  scene.background = new THREE.TextureLoader().load("PLACEHOLDER");

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

  launchFireworks(firework1Config);

  animate();
}

function setupGUI() {
  const gui = new dat.GUI();

  // add controls to GUI
  // first folder for scattered particle fireworks
  const firework1Folder = gui.addFolder("Firework Type 1");
  firework1Folder
    .add(firework1Config, "count", 1, 50)
    .name("Firework Count")
    .step(1);
  firework1Folder.addColor(firework1Config, "color").name("Firework Color");
  firework1Folder
    .add(firework1Config, "timing", 1, 10)
    .name("Firework Timing")
    .step(1);
  firework1Folder.open();
  firework1Folder
    .add(firework1Config, "launchFireworks")
    .name("Launch Fireworks");

  // second folder for fireworks with streaks
  // const firework2Folder = gui.addFolder("Firework Type 2");
  // firework2Folder
  //   .add(firework2Config, "count", 1, 50)
  //   .name("Firework Count")
  //   .step(1);
  // firework2Folder.addColor(firework2Config, "color").name("Firework Color");
  // firework2Folder
  //   .add(firework2Config, "timing", 1, 10)
  //   .name("Firework Timing")
  //   .step(1);
  // firework2Folder.open();
  // firework2Folder
  //   .add(firework2Config, "launchFireworks")
  //   .name("Launch Fireworks");

  // add pause/resume button
  gui.add({ pause: togglePause }, "pause").name("Pause/Resume");

  // add save image button
  gui.add({ save: saveSceneImage }, "save").name("Save Scene");

  // Add camera curve toggle
  gui
    .add(cameraConfig, "curveStatus")
    .name("Camera Curve Status")
    .onChange(function (value) {
      toggleCameraCurve(value);
    });

  // allows user to adjust bezier curve
  const bezierFolder = gui.addFolder("Adjust Camera Curve");
  for (let i = 0; i < 4; i++) {
    const bezierPointFolder = bezierFolder.addFolder("Bezier Point " + (i + 1));
    bezierPointFolder.add(curvePoints[i], "x", -100, 100).name("X").step(1);
    bezierPointFolder.add(curvePoints[i], "y", -100, 100).name("Y").step(1);
    bezierPointFolder.add(curvePoints[i], "z", -100, 100).name("Z").step(1);
  }

  // add option to visualize the bezier curve only
  // gui
  //   .add({ bezier: () => createCameraPath(false) }, "bezier")
  //   .name("Visualize Bezier Curve");

  // add option to toggle camera speed
  gui.add(cameraConfig, "speed", 0, 0.01).name("Camera Speed").step(0.001);
}

function createCameraPath(fullAnimation) {
  // visualize the Bézier curve by generating points along it
  const curvePointsArray = [];
  const numPoints = 100; // number of points to sample the curve

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints; // normalized parameter (t) from 0 to 1
    const pointOnCurve = cubicBezier(t, ...curvePoints);
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
      camera.position.copy(cubicBezier(cameraProgress, ...curvePoints));
      camera.lookAt(new THREE.Vector3(0, 50, 0)); // needs to be adjusted

      // increment the progress for animation
      cameraProgress += cameraConfig.speed;
      if (cameraProgress >= 1) cameraProgress = 0; // loop the animation (ALSO could be added to GUI)

      if (!cameraConfig.curveStatus) {
        return;
      }
      requestAnimationFrame(animateCamera);
    }

    animateCamera(); // start the camera animation
  }
}

function toggleCameraCurve(curveStatus) {
  if (curveStatus) {
    cameraPathProgress = 0;
    createCameraPath(true);
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
  // for (let i = 0; i < config.count2; i++) {
  //   const firework2 = createFirework(
  //     scene,
  //     config.color2,
  //     config.timing2,
  //     false
  //   );
  //   fireworks.push(firework2);
  // }
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

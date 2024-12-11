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

let placementMode = true;
// define control points for the Bezier curve
let curvePoints = [
  new THREE.Vector3(0, 50, 50),
  new THREE.Vector3(150, 100, -50),
  new THREE.Vector3(0, 50, 0),
  new THREE.Vector3(-150, 100, -50),
];

let fireworkConfigs = [];
let crossMarker;
let terrain;
let isPaused = false;
let composer;
let cameraPath;
let cameraPathProgress = 0; 
let animateCameraCurve = false; // flag to control camera curve animation
let cameraConfig = {
  curveStatus: false,
  speed: 0.005,
};
let mainScene;
function init() {
  scene = new THREE.Scene();
  const textureLoader = new THREE.TextureLoader();
  const nightSkyTexture = textureLoader.load("../textures/night_sky.jpg"); 

  scene.background = new THREE.Color(0x000000); 



  terrain = createTerrain(scene);
  // set up camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 150);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById("canvas-container").appendChild(renderer.domElement);
  renderer.domElement.addEventListener("click", handleTerrainClick);

  const controls = new OrbitControls(camera, renderer.domElement);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(100, 200, 100);
  directionalLight.target.position.set(0, 0, 0);

  scene.add(directionalLight);
  scene.add(directionalLight.target);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(50, 150, 50);
  scene.add(pointLight);

  setupGUI();
  animate();
}

let showFireworks = {
  // firework config for GUI controls
  launchFireworks: function () {
    scene.remove(crossMarker);
    launchFireworks(fireworkConfigs);
    animate();
  },
};

function setupGUI() {
  const gui = new dat.GUI();

  gui.add(showFireworks, "launchFireworks").name("Launch Fireworks");
  gui.add({ pause: togglePause }, "pause").name("Pause/Resume");
  gui
    .add(cameraConfig, "curveStatus")
    .name("Camera Curve Status")
    .onChange(function (value) {
      toggleCameraCurve(value);
    });
  // allow user to control bezier curves
  const bezierFolder = gui.addFolder("Adjust Camera Curve");
  for (let i = 0; i < 4; i++) {
    const bezierPointFolder = bezierFolder.addFolder("Bezier Point " + (i + 1));
    bezierPointFolder.add(curvePoints[i], "x", -200, 200).name("X").step(1);
    bezierPointFolder.add(curvePoints[i], "y", -200, 200).name("Y").step(1);
    bezierPointFolder.add(curvePoints[i], "z", -200, 200).name("Z").step(1);
  }
  gui.add(cameraConfig, "speed", 0, 0.01).name("Camera Speed").step(0.001);

  gui
    .add({ togglePlacementMode: togglePlacementMode }, "togglePlacementMode")
    .name(() => `Placement Mode: ${placementMode ? "ON" : "OFF"}`); 

  gui
    .add({ clearFireworks: clearFireworks }, "clearFireworks")
    .name("Clear Fireworks");
}

function togglePlacementMode() {
  placementMode = !placementMode; 
  console.log(`Placement Mode: ${placementMode ? "ON" : "OFF"}`); 
  setupGUI(); 
}

function createCameraPath() {

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



function toggleCameraCurve(curveStatus) {
  if (curveStatus) {
    cameraPathProgress = 0;
    //createCameraPath();
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

function launchFireworks(config) {
  // clear setting
  if (fireworks && Array.isArray(fireworks)) {
    fireworks.forEach((firework) => {
      if (firework && firework.destroy) {
        firework.destroy(scene); 
      }
    });
  }
  fireworks = [];
  // create fireworks based on config

  for (let i = 0; i < config.length; i++) {
    setTimeout(() => {
      const firework = createFirework(
        scene,
        config[i].type,
        config[i].color,
        config[i].timing,
        config[i].position
      );

      fireworks.push(firework);
    }, config[i].delay * 1000);
  }
  if (cameraConfig.curveStatus) {
    createCameraPath();
  }
  
}

function addFirework(config, position = { x: 0, y: 0, z: 0 }) {
  const fireworkConfig = {
    type: config.type,
    color: config.color,
    timing: config.timing,
    position: position,
    delay: config.delay,
  };
  fireworkConfigs.push(fireworkConfig);
  (`Added firework:`, fireworkConfig);
}
function showPopUpMenu(x, y, position) {

  // create the popup menu container
  let popUpMenu = document.createElement("div");
  popUpMenu.style.position = "absolute";
  popUpMenu.style.left = `${x}px`;
  popUpMenu.style.top = `${y}px`;
  popUpMenu.style.backgroundColor = "white";
  popUpMenu.style.border = "1px solid black";
  popUpMenu.style.padding = "10px";
  popUpMenu.style.zIndex = 1000;

  // label and select for type
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Type: ";
  const typeSelect = document.createElement("select");
  ["default", "boom", "flower", "megaphone", "windy", "vase"].forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });
  typeLabel.appendChild(typeSelect);
  popUpMenu.appendChild(typeLabel);
  popUpMenu.appendChild(document.createElement("br"));

  // label and input for color
  const colorLabel = document.createElement("label");
  colorLabel.textContent = "Color: ";
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#ff0000";
  colorLabel.appendChild(colorInput);
  popUpMenu.appendChild(colorLabel);
  popUpMenu.appendChild(document.createElement("br"));

  // label and input for speed
  const speedLabel = document.createElement("label");
  speedLabel.textContent = "Speed: ";
  const speedInput = document.createElement("input");
  speedInput.type = "number";
  speedInput.min = 1;
  speedInput.max = 10;
  speedInput.value = 3;
  speedLabel.appendChild(speedInput);
  popUpMenu.appendChild(speedLabel);
  popUpMenu.appendChild(document.createElement("br"));

  const delayLabel = document.createElement("label");
  delayLabel.textContent = "Launch Delay: ";
  const delayInput = document.createElement("input");
delayInput.type = "range";
delayInput.min = 0;
delayInput.max = 60;
delayInput.value = 0; // default to 0 seconds
delayInput.step = 1; // optional: adjust step size to control precision
delayLabel.appendChild(delayInput);

// show selected value
const delayValueDisplay = document.createElement("span");
delayValueDisplay.textContent = ` (${delayInput.value}s)`; // initial display
delayLabel.appendChild(delayValueDisplay);

popUpMenu.appendChild(delayLabel);
popUpMenu.appendChild(document.createElement("br"));

// update display when slider value changes
delayInput.addEventListener("input", () => {
  delayValueDisplay.textContent = ` (${delayInput.value}s)`; // update displayed value

});


  // confirm button
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Add Firework";
  confirmButton.onclick = () => {
    addFirework(
      {
        type: typeSelect.value,
        color: colorInput.value,
        timing: parseFloat(speedInput.value),
        delay: parseFloat(delayInput.value),
      },
      position
    );

    const radius = 1;
    const segments = 32; 
    const circleGeometry = new THREE.CircleGeometry(radius, segments);
    const material = new THREE.LineBasicMaterial({ color: colorInput.value }); 
    const circleMarker = new THREE.LineLoop(circleGeometry, material);
    circleMarker.position.set(position.x, position.y, position.z);
    scene.add(circleMarker);

    popUpMenu.remove();
    popUpMenu = null;
  };
  popUpMenu.appendChild(confirmButton);

  document.body.appendChild(popUpMenu);

  const quitButton = document.createElement("button");
  quitButton.textContent = "Quit";
  quitButton.style.marginLeft = "10px"; // optional: add spacing between buttons
  quitButton.onclick = () => {
    popUpMenu.remove(); // remove the popup menu from the DOM
    popUpMenu = null; // clean up reference
  };
  popUpMenu.appendChild(quitButton);
}

function handleTerrainClick(event) {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([terrain]); 
  if (intersects.length > 0) {
    const point = intersects[0].point;
    showPopUpMenu(event.clientX, event.clientY, point);
  }
}

function animate() {
  if (isPaused) return;

  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  fireworks.forEach((firework) => firework.update(delta));
  updateCameraPosition(delta);

  if (!composer) {
    composer = createBloomEffect(scene, camera, renderer);
  }
  
  composer.render();
}

function clearFireworks() {
  // Clear the fireworkConfigs array
  fireworkConfigs = [];
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const obj = scene.children[i];
    // Retain lights, camera, water, and terrain
    if (
      !(
        obj.isLight ||
        obj === camera ||
        obj === terrain ||
        obj.userData.isTerrain
      )
    ) {
      scene.remove(obj);
    }
  }
  // Clear fireworks array
  fireworks = [];
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);
});

init();

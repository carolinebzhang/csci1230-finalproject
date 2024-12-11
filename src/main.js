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
let placementMode = false;
let fireworkConfigs = [];

let firework1Config = {
  // firework config for GUI controls
  count: 1,
  color: "#ff0000", // default is red
  timing: 3,
  launchFireworks: function () {
    console.log("FIREWORKSCONFIG", fireworkConfigs)
    if(fireworkConfigs.length > 0){
      launchFireworks(fireworkConfigs);
      console.log(
        "custom"
      )
    }
    else{
    launchFireworks(fireworkConfigs);}
    animate();
  },
};


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

  scene = new THREE.Scene();
  // set the scene's background to the dark clouds texture
  scene.background = new THREE.TextureLoader().load("PLACEHOLDER");
  water = createTerrain(scene);
  

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

  setupGUI();
  animate();
}

function setupGUI() {
  const gui = new dat.GUI();
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
gui
  .add({ placementMode: togglePlacementMode }, "placementMode")
  .name("Placement Mode");

  // add pause/resume button
  gui.add({ pause: togglePause }, "pause").name("Pause/Resume");

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

function launchFireworks(config) {
  // clear setting
  if (fireworks && Array.isArray(fireworks)) {
    console.log("first one");
    fireworks.forEach((firework) => {
      if (firework && firework.destroy) {
        firework.destroy(scene); 
      }
    });
  }
  fireworks = [];
  // create fireworks based on config

  for (let i = 0; i < config.length; i++) {
    const firework = createFirework(scene, config[i].color, config[i].timing, config[i].position);
    console.log(config[i].color, config[i].timing, config[i].position);
    console.log("created firework");
    fireworks.push(firework);
  }
}

function addFirework(config, position = { x: 0, y: 0, z: 0 }) {
  const fireworkConfig = {
    type: config.type,
    color: config.color,
    timing: config.timing,
    position: position,
  };
  fireworkConfigs.push(fireworkConfig);
  (`Added firework:`, fireworkConfig);
}
function showPopUpMenu(x, y, position) {
  //console.log("IN SHOW POPUP MENU");

  // Create the popup menu container
  let popUpMenu = document.createElement("div");
  popUpMenu.style.position = "absolute";
  popUpMenu.style.left = `${x}px`;
  popUpMenu.style.top = `${y}px`;
  popUpMenu.style.backgroundColor = "white";
  popUpMenu.style.border = "1px solid black";
  popUpMenu.style.padding = "10px";
  popUpMenu.style.zIndex = 1000;

  // Label and select for type
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Type: ";
  const typeSelect = document.createElement("select");
  ["flower", "petal", "pine"].forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });
  typeLabel.appendChild(typeSelect);
  popUpMenu.appendChild(typeLabel);
  popUpMenu.appendChild(document.createElement("br"));

  // Label and input for color
  const colorLabel = document.createElement("label");
  colorLabel.textContent = "Color: ";
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#ff0000";
  colorLabel.appendChild(colorInput);
  popUpMenu.appendChild(colorLabel);
  popUpMenu.appendChild(document.createElement("br"));

  // Label and input for speed
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

  // Confirm button
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Add Firework";
  confirmButton.onclick = () => {
    addFirework(
      {
        //type: typeSelect.value,
        color: colorInput.value,
        timing: parseFloat(speedInput.value)
      },
      position
    );

    // Draw an "X" on the surface at the specified position
    const canvas = document.querySelector("canvas-container");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(position.x - 5, position.y - 5);
        ctx.lineTo(position.x + 5, position.y + 5);
        ctx.moveTo(position.x + 5, position.y - 5);
        ctx.lineTo(position.x - 5, position.y + 5);
        ctx.stroke();
      }
    }

    popUpMenu.remove();
    popUpMenu = null;
  };
  popUpMenu.appendChild(confirmButton);

  document.body.appendChild(popUpMenu);
}


function togglePlacementMode() {
  placementMode = !placementMode;
  console.log(`Placement mode: ${placementMode}`);

}

function handleTerrainClick(event) {
  if (!placementMode) return;
  //console.log("HANDLE TERRAIN CLICK");
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([water]); // Assuming terrain is in "water"
  if (intersects.length > 0) {
    const point = intersects[0].point;
    //console.log(point);
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

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);
});

init();

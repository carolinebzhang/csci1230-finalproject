console.log("Main.js is running");

import * as THREE from "../node_modules/three/build/three.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { Water } from "../node_modules/three/examples/jsm/objects/Water.js";
import { createFirework } from "./fireworks.js";
import { createTerrain } from "./terrain.js";
import * as dat from "dat.gui"; 

let scene,
  camera,
  renderer,
  water,
  fireworks = [];
let clock = new THREE.Clock();
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

function init() {
  console.log("Main.js is running");

  // SET UP SCENE
  //scene = new THREE.Scene();
  //scene.background = new THREE.Color(0x000000);

  scene = new THREE.Scene();
  // set the scene's background to the dark clouds texture
  scene.background = new THREE.TextureLoader().load(
    "../textures/dark_clouds.JPG"
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
  const link = document.createElement("a");
  link.href = imageDataURL;
  link.download = "scene.png";

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
  console.log("FIREWORKS BEING LAUNCHED")
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

  // render the scene
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();

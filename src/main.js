console.log("Main.js is running");

import * as THREE from "../node_modules/three/build/three.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { Water } from "../node_modules/three/examples/jsm/objects/Water.js";
import { createFirework } from "./fireworks.js";
import { createTerrain } from "./terrain.js";

let scene,
  camera,
  renderer,
  water,
  fireworks = [];
let clock = new THREE.Clock();

function init() {
  console.log("Main.js is running");

  // SET UP SCENE
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

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

  // set up water except its not working yet
  water = createTerrain(scene);

  // create lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(50, 150, 50);
  scene.add(pointLight);

  // at this point just launch fireworks immediately 
  launchFireworks({ count: 10, color: 0xff0000, timing: 3 });

  animate();
}

function launchFireworks(config) {
  for (let i = 0; i < config.count; i++) {
    const firework = createFirework(scene, config.color, config.timing);
    fireworks.push(firework);
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // update all fireworks
  fireworks.forEach((firework) => firework.update(delta));

  // render the scene
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// when main is called jsut run
init();

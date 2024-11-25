import * as THREE from "../node_modules/three/build/three.module.js";
import { Water } from "../node_modules/three/examples/jsm/objects/Water.js";

export function createTerrain(scene, camera, renderer) {
  const waterGeometry = new THREE.PlaneGeometry(1000, 1000);

  const water = new Water(waterGeometry, {
    color: 0x001e0f, 
    scale: 1,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,

  });
  water.rotation.x = -Math.PI / 2;

  water.position.y = 0;
  scene.add(water);



  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(100, 100, 100).normalize();
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  return water;
}

//import * as THREE from "three";
import * as THREE from "../node_modules/three/build/three.module.js";
import { Water } from "../node_modules/three/examples/jsm/objects/Water.js";

export function createTerrain(scene) {
  const waterGeometry = new THREE.PlaneGeometry(1000, 1000);

  const water = new Water(waterGeometry, {
    color: 0x001e0f,
    scale: 1,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureHeight: 1024,
  });

  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  return water;
}

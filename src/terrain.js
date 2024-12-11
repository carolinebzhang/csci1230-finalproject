import * as THREE from "../node_modules/three/build/three.module.js";
import { Water } from "../node_modules/three/examples/jsm/objects/Water.js";

export function createTerrain(scene, camera, renderer) {
  // Load textures for the terrain
  const textureLoader = new THREE.TextureLoader();

  const normalMap = textureLoader.load("textures/normal.jpg"); // Replace with your normal map path
  const roughnessMap = textureLoader.load("textures/bump.jpg"); // Replace with your roughness map path

  // Create the geometry
  const geometry = new THREE.PlaneGeometry(1000, 1000, 256, 256); // Add more segments for bumps

  // Create the material with reduced reflectivity
  const material = new THREE.MeshStandardMaterial({
    color: "#474747", // Base color
    roughness: 0.8, // Increase roughness to make it less reflective
    metalness: 0.0, // Decrease metalness to reduce reflectivity
    normalMap: normalMap, // Add bumps using the normal map
    roughnessMap: roughnessMap, // Control reflectiveness with roughness map
  });

  // Create the mesh
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true; // Allow the plane to receive shadows

  scene.add(plane);

  return plane;
}
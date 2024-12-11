import * as THREE from "../node_modules/three/build/three.module.js";

export function createTerrain(scene, camera, renderer) {
  // Load textures for the terrain
  const textureLoader = new THREE.TextureLoader();
  const normalMap = textureLoader.load("textures/normal.jpg"); 

  // Create the geometry
  const geometry = new THREE.PlaneGeometry(1000, 1000, 256, 256); 

  // Create the material with reduced reflectivity
  const material = new THREE.MeshStandardMaterial({
    color: "#474747", 
    roughness: 0.3, 
    metalness: 0.3, 
    normalMap: normalMap, 
  });

  // Create the mesh
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true; 

  scene.add(plane);

  return plane;
}
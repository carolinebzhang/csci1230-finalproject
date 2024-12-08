import * as THREE from "../node_modules/three/build/three.module.js";
import { hexToRGB } from "./utils/utils.js";
import {
  initializeParticles,
  initializeTrail,
  createParticleTexture,
  createParticleMaterial,
  createTrailMaterial,
  updateParticles,
  updateTrail,
} from "./utils/fireworksutils.js";

// Main function to create the firework
export function createFirework(scene, color, duration) {
  const particleCount = 100;
  const maxTrailParticles = 10;
  const maxSpeed = 50;
  const bounds = { x: 200, y: 200, z: 200 };

  const startX = Math.random() * bounds.x - bounds.x / 2;
  const startY = 0;
  const startZ = Math.random() * bounds.z - bounds.z / 2;

  const { positions, velocities } = initializeParticles(
    particleCount,
    startX,
    startY,
    startZ,
    maxSpeed
  );
  const { trailPositions, trailVelocities } = initializeTrail(
    maxTrailParticles,
    startX,
    startY,
    startZ
  );

  const particles = new THREE.BufferGeometry();
  particles.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  particles.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(velocities, 3)
  );

  const trailParticles = new THREE.BufferGeometry();
  trailParticles.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(trailPositions, 3)
  );

  trailParticles.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(trailVelocities, 3)
  );

  const texture = createParticleTexture(color);
  const particleMaterial = createParticleMaterial(texture);
  const firework = new THREE.Points(particles, particleMaterial);
  scene.add(firework);

  //const trailMaterial = createTrailMaterial(color);
  const trailTexture = createParticleTexture(color)
  const trailMaterial = createParticleMaterial(trailTexture);
  const trail = new THREE.Points(trailParticles, trailMaterial);
  // const trailGeometry = new THREE.BufferGeometry();
  // trailGeometry.setAttribute(
  //   "position",
  //   new THREE.Float32BufferAttribute(trailPositions, 3)
  // );
  //const trail = new THREE.Line(trailGeometry, trailMaterial);
  scene.add(trail);

  let elapsed = 0;

  function update(delta) {
    elapsed += delta;
    if (elapsed > duration) {
      destroy(scene);
    } else {
      updateParticles(particles, delta, elapsed, duration);
      //updateTrail(trail, trailGeometry, trailPositions, elapsed, duration);
      const positionHistory = [];
      const historyLimit = 10; 
      updateTrail(
        trailParticles,
        particles, 
        delta,
        elapsed,
        duration,
        positionHistory,
        historyLimit
        //startX,
        //startY,
        //startZ
      );
    }
  }

  function destroy(scene) {
    scene.remove(firework);
    scene.remove(trail);
    particles.dispose();
    particleMaterial.dispose();
    trailParticles.dispose();
    trailMaterial.dispose();
  }

  return { update, destroy };
}

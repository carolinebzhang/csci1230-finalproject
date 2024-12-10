import * as THREE from "../node_modules/three/build/three.module.js";
import { hexToRGB } from "./utils/utils.js";
import {
  initializeParticles,
  initializeTrail,
  initializeStreaks,
  createParticleTexture,
  createParticleMaterial,
  createTrailMaterial,
  createStreakMaterial,
  updateParticles,
  updateTrail,
  updateStreaks,
} from "./utils/fireworksutils.js";

// Main function to create the firework
export function createFirework(scene, color, duration) {
  const particleCount = 50;
  const maxTrailParticles = 10;
  const maxSpeed = 50;
  const bounds = { x: 200, y: 200, z: 200 };
  const numStreakLayers = 22;

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
  const trailTexture = createParticleTexture(color);
  const trailMaterial = createParticleMaterial(trailTexture);
  const trail = new THREE.Points(trailParticles, trailMaterial);
  scene.add(trail);

  // let streaks = null;
  // let streakParticles = null;
  // let streakMaterial = null;
  // settings below are only activated for the second firework type
  const streakPositions = initializeStreaks(
    numStreakLayers,
    particleCount,
    startX,
    startY,
    startZ
  );

  const streakParticles = new THREE.BufferGeometry();
  streakParticles.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(streakPositions, 3)
  );

  const streakTexture = createParticleTexture(color);
  const streakMaterial = createStreakMaterial(streakTexture);
  const streaks = new THREE.Points(streakParticles, streakMaterial);
  scene.add(streaks);

  let elapsed = 0;
  let tempPosArr = [];
  let streakBuffer = 0; // frame delay between particles in streaks

  function update(delta) {
    elapsed += delta;
    streakBuffer++;
    if (elapsed > duration) {
      destroy(scene);
    } else {
      // storing positions to access later for streaks
      const tempPos = updateParticles(particles, delta, elapsed, duration);
      tempPosArr.push(tempPos);
      // waiting until all firework particles initialize
      if (elapsed > duration * 0.2) {
        updateStreaks(
          streakParticles,
          particleCount,
          tempPosArr,
          streakBuffer,
          streakMaterial
        );
      }
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
    scene.remove(streaks);
    particles.dispose();
    particleMaterial.dispose();
    trailParticles.dispose();
    trailMaterial.dispose();
    streakParticles.dispose();
    streakMaterial.dispose();
  }

  return { update, destroy };
}

import * as THREE from "../node_modules/three/build/three.module.js";
import { hexToRGB } from "./utils/utils.js";

import {
  initializeParticles,
  createParticleTexture,
  createParticleMaterial,
  updateParticles,
} from "./utils/fireworkparticles.js";

import {
  initializeStreaks,
  createStreakMaterial,
  updateStreaks,
} from "./utils/fireworktrails.js";

// Main function to create the firework
export function createFirework(scene, fireworkType, color, duration, starting) {
  const particleCount = 50;
  const maxSpeed = 50;
  const numStreakLayers = 22;

  const startX = Number(Math.round(starting["x"]));
  const startY = Number(Math.round(starting["y"]));
  const startZ = Number(Math.round(starting["z"]));

  const { positions, velocities } = initializeParticles(
    particleCount,
    fireworkType,
    startX,
    startY,
    startZ,
    maxSpeed
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

  const texture = createParticleTexture(color);
  const particleMaterial = createParticleMaterial(texture);
  const firework = new THREE.Points(particles, particleMaterial);
  scene.add(firework);

  const streakPositions = initializeStreaks(
    numStreakLayers,
    particleCount,
    startX,
    -100,
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
  let flag = true;
  function update(delta) {
    elapsed += delta;
    streakBuffer++;
    if (elapsed > duration) {
      destroy(scene);
    } else {
      // storing positions to access later for streaks
      const tempPos = updateParticles(
        particles,
        fireworkType, 
        delta,
        elapsed,
        duration
      );
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
    }
  }

  function destroy(scene) {
    scene.remove(firework);
    //scene.remove(trail);
    scene.remove(streaks);

    // Dispose of geometry and material
    if (firework.geometry) {
      firework.geometry.dispose(); // Dispose geometry
    }
    if (firework.material) {
      // Reset material properties before disposing
      firework.material.opacity = 1; // Reset opacity
      firework.material.size = 1; // Reset size if needed
      firework.material.dispose(); // Dispose material
    }

    if (streaks) {
      scene.remove(streaks);

      if (streaks.geometry) {
        streaks.geometry.dispose();
      }
      if (streaks.material) {
        streaks.material.opacity = 1; // Reset opacity
        streaks.material.dispose();
      }
    }
  }

  return { update, destroy };
}

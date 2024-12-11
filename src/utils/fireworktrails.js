import * as THREE from "three";
import { hexToRGB } from "./utils.js";
import { mod } from "three/webgpu"; 

export function initializeStreaks(
  numStreakLayers,
  particleCount,
  startX,
  startY,
  startZ
) {
  let streakPositions = [];
  // arranged by particle count per streak layer
  for (let i = 0; i < numStreakLayers * particleCount; i++) {
    streakPositions.push(startX, startY, startZ);
  }
  return streakPositions;
}

// function to create particle material
export function createStreakMaterial(texture) {
  return new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.8,
    transparent: true,
    opacity: 1,
    map: texture,
    blending: THREE.AdditiveBlending,
  });
}

export function updateStreaks(
  streakParticles,
  numParticles,
  tempPositions,
  streakBuffer,
  streakMaterial
) {
  const streakPositions = streakParticles.attributes.position.array;
  let streakCount = streakPositions.length / (3 * numParticles);
  let updatedBuffer = streakBuffer;

  for (let i = 0; i < streakCount; i++) {
    updatedBuffer -= 2;
    for (let j = 0; j < numParticles; j++) {
      // update streak position with previous particle position
      if (updatedBuffer - 1 >= 0) {
        const index = i * streakCount + j;
        //console.log(index);
        const tempPosition = tempPositions[updatedBuffer - 1];

        streakPositions[index * 3] = tempPosition[j * 3];
        streakPositions[index * 3 + 1] = tempPosition[j * 3 + 1];
        streakPositions[index * 3 + 2] = tempPosition[j * 3 + 2];
      }
    }
    // toggling opacity on once particles reach certain height
    if (streakMaterial.opacity == 0) {
      streakMaterial.opacity = 1;
    }

    // fading particle opacity and size
    if (streakMaterial.opacity > 0.1) {
      streakMaterial.opacity -= Math.pow(0.005, i + 1);
    }
    if (streakMaterial.size > 0.5) {
      streakMaterial.size -= Math.pow(0.0005, i + 1);
    }

    //("OPACITY", streakMaterial.opacity);

    streakMaterial.needsUpdate = true;
  }

  streakParticles.attributes.position.needsUpdate = true;
}
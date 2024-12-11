import * as THREE from "three";
import { hexToRGB } from "./utils.js";
import { mod } from "three/webgpu";

export function initializeParticles(
  particleCount,
  fireworkType,
  startX,
  startY,
  startZ,
  maxSpeed
) {
  const positions = [];
  const velocities = [];
  let theta;
  for (let i = 0; i < particleCount; i++) {
    if (
      fireworkType === "boom" ||
      fireworkType === "default" ||
      fireworkType === "megaphone" ||
      fireworkType === "sideways" ||
      fireworkType === "vase"
    ) {
      theta = ((360 / particleCount) * (360 / particleCount) * Math.PI) / 180;
    } else {
      theta = ((360 / particleCount) * Math.PI) / 180;
    }
    const angle = ((360 / particleCount) * Math.PI) / 180; // random horizontal angle
    const speed = 0.5 * maxSpeed;
    const upwardSpeed = 0.6 * maxSpeed; // strong upward motion

    positions.push(startX, startY, startZ); // initial positions
    if (fireworkType === "boom" || fireworkType === "default" || fireworkType === "megaphone" || fireworkType === "vase" ) {
      velocities.push(Math.sin(angle) * speed, upwardSpeed, 0);
    }

     if (
       fireworkType === "windy"
     ) {
       velocities.push(
         Math.cos(angle) * (speed * 4),
         upwardSpeed,
         Math.sin(angle) * (speed * 0.5)
       );
     }
      else {
       velocities.push(
         Math.cos(angle) * (speed * 0.5),
         upwardSpeed,
         Math.sin(angle) * (speed * 0.5)
       );
     }
  }
  return { positions, velocities };
}

// function to create particle texture
export function createParticleTexture(color) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 64;

  canvas.width = size;
  canvas.height = size;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size / 32,
    size / 2,
    size / 2,
    size / 2
  );

  const { r, g, b } = hexToRGB(color);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.5)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// function to create particle material
export function createParticleMaterial(texture) {
  return new THREE.PointsMaterial({
    color: 0xffffff, 
    size: 2,
    transparent: false,
    opacity: 1,
    map: texture,
    blending: THREE.AdditiveBlending,
  });
}

// function to update particles' position and velocity
export function updateParticles(particles, fireworkType, delta, elapsed, lifetime) {
  // creating tails
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;
  const particleCount = positions.length / 3;

  let maxHeightParticle = { x: 0, y: 0, z: 0 };

  // returned to keep track of previous positions
  let tempPositions = [];

  for (let i = 0; i < particleCount; i++) {
    // update positions based on velocity
    if (elapsed <= lifetime * 0.2) {
      let diff = i / particleCount;
      const velocityFactor = 1 - diff; // bottom-most particles have higher velocity
      if (positions[i * 3 + 1] > 60) {
        continue;
      }

      positions[i * 3] += velocities[i * 3] * 0.00002;
      positions[i * 3 + 1] +=
        (velocities[i * 3 + 1] * velocityFactor + 100) * delta;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.0006;

      if (positions[i * 3 + 1] > maxHeightParticle.y) {
        maxHeightParticle = {
          x: positions[i * 3],
          y: positions[i * 3 + 1],
          z: positions[i * 3 + 2],
        };
      }
    }
    // after initial upward motion, apply gravity and scatter particles
    if (elapsed > lifetime * 0.2) {
      const gravity = 9.8; // gravity constant
      const drag = 0.97; // drag to slow down
      // apply gravity to Y velocity
      velocities[i * 3 + 1] -= gravity * delta;

      // apply drag to X and Z velocities (slow down horizontal motion)
      velocities[i * 3] *= drag;
      velocities[i * 3 + 2] *= drag;

      // deceleration near peak
      if (Math.abs(velocities[i * 3 + 1]) < 5) {
        velocities[i * 3 + 1] *= 0.9; // slow down upward motion
      }
      // Calculate the distance from the center (radius)
      const angle = (i / particleCount) * Math.PI * 2; // Evenly distribute particles along 360 degrees
      let radius = 5; // fixed base radius for all particles
      // update particle positions to move in a circle based on angle and radius
      if(fireworkType === "boom"){
        positions[i * 3 + 1] +=
          velocities[i * 3 + 1] * delta * Math.sin(angle) - 9.8 * delta * 0.5; 
        positions[i * 3] +=
          velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 5; 
        }

        if (fireworkType === "default") {
          radius = 10;
          positions[i * 3] +=
            velocities[i * 3 + 0] * 0.001 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
          positions[i * 3 + 1] +=
            velocities[i * 3 + 1] * delta * Math.sin(angle) - 9.8 * delta; // gravity effect on Y-axis
          positions[i * 3 + 2] += Math.cos(angle) * radius * delta * 2; // depth motion (Z-axis) // gravity effect on Y-axis
        }

        if (fireworkType === "flower") {
          positions[i * 3] +=
            velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
          positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
          positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
        }

        if (fireworkType === "megaphone") {
          positions[i * 3] +=
            velocities[i * 3 + 0] * 0.4 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
          positions[i * 3 + 1] +=
            velocities[i * 3 + 1] * delta * Math.sin(angle) - 9.8 * delta; // gravity effect on Y-axis
        }

        if (fireworkType === "windy") {
          positions[i * 3] +=
            velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 10; // horizontal motion (X-axis)
          positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
          positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
        }

        if (fireworkType === "vase") {
          positions[i * 3] +=
            velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
          positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
          positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
        }
    }
    
    if (fireworkType === "boom") {
      if (elapsed > lifetime * 0.4) {

        const gravity = 9.8; // gravity constant
        const drag = 0.97; // drag to slow down

        velocities[i * 3 + 1] -= gravity * delta;
        velocities[i * 3] *= drag;
        velocities[i * 3 + 2] *= drag;

        if (Math.abs(velocities[i * 3 + 1]) < 5) {
          velocities[i * 3 + 1] *= 0.9; 
        }

        const angle = (i / particleCount) * Math.PI * 2; 

        const radius = 5; 
        positions[i * 3 + 1] +=
          velocities[i * 3 + 1] * delta * Math.sin(angle) - 9.8 * delta * 0.5; 
        positions[i * 3] +=
          velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 5; 
    }
  }
    // updating array keeping track of previous positions
    tempPositions.push(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2]
    );
  }

  particles.attributes.position.needsUpdate = true;

  return tempPositions;
}

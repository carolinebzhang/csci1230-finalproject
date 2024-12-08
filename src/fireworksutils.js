import * as THREE from "../node_modules/three/build/three.module.js";
import { hexToRGB } from "./utils.js";

export function initializeParticles(particleCount, startX, startY, startZ, maxSpeed) {
  const positions = [];
  const velocities = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2; // random horizontal angle
    const speed = Math.random() * maxSpeed;
    const upwardSpeed = Math.random() * 0.3 * maxSpeed + 0.3 * maxSpeed; // strong upward motion

    positions.push(startX, startY, startZ); // initial positions
    velocities.push(
      Math.cos(angle) * (speed * 0.5), 
      upwardSpeed, 
      Math.sin(angle) * (speed * 0.5) 
    );
  }
  return { positions, velocities };
}

let trailPositions = [];
let trailVelocities = [];

// function to initialize trail attributes
export function initializeTrail(maxTrailParticles, startX, startY, startZ) {
  for (let i = 0; i < maxTrailParticles; i++) {
    trailPositions.push(startX, startY, startZ);
    trailVelocities.push(0, 0, 0);
  }
  return { trailPositions, trailVelocities };
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
    transparent: true,
    opacity: 1,
    map: texture,
    blending: THREE.AdditiveBlending,
  });
}

// function to create trail material
export function createTrailMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(color) },
      color2: { value: new THREE.Color("black") },
      opacity: { value: 0.5 },
    },
    vertexShader: `
      varying float vOpacity;
      void main() {
        vOpacity = position.y / 100.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying float vOpacity;
      void main() {
        gl_FragColor = vec4(mix(color2, color1, vOpacity), vOpacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
}

// function to update particles' position and velocity
export function updateParticles(particles, delta, elapsed, lifetime) {
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;

  const particleCount = positions.length / 3;

  for (let i = 0; i < particleCount; i++) {
    // update positions based on velocity
    positions[i * 3] += velocities[i * 3] * 0.00002; // horizontal motion (X-axis)
    positions[i * 3 + 1] += velocities[i * 3 + 1] * delta; // vertical motion (Y-axis)
    positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.0006; // depth motion (Z-axis)

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

      // update positions based on velocity
      positions[i * 3] +=
        velocities[i * 3] * delta * 2 * Math.abs(Math.cos(elapsed)); // horizontal (X-axis)
      positions[i * 3 + 1] +=
        velocities[i * 3 + 1] * delta - (9.8 * delta * 1.1); // gravity on Y-axis
      positions[i * 3 + 2] +=
        velocities[i * 3 + 2] * delta * Math.abs(Math.sin(elapsed)); // depth motion (Z-axis)
    }
  }

  particles.attributes.position.needsUpdate = true; 
}

export const trailHistory = Array.from({ length: 100 }, () => []);
export function updateTrail(particleIndex, newPosition, color) {
  // if (particleIndex < 0 || particleIndex >= trailHistory.length) {
  //   console.error(`Invalid particle index: ${particleIndex}`);
  //   return []; // Return an empty array or handle the error accordingly
  // }

  // const trail = trailHistory[particleIndex];

  // // Add the new position and limit the history length
  // trail.push(newPosition);
  // if (trail.length > maxTrailSegments) trail.shift();

  // // Convert trail positions to a buffer
  // const trailPositions = [];
  // for (let i = 0; i < trail.length - 1; i++) {
  //   trailPositions.push(...trail[i]);
  // }
  return trailPositions;
}
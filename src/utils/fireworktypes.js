import * as THREE from "three";
import { hexToRGB } from "./utils.js";
import { mod } from "three/webgpu";


// Function to update the particles for each firework type
export function updateRing(
  particles,
  delta,
  elapsed,
  lifetime,
  maxHeightParticle
) {
  // creating tails
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;

  const particleCount = positions.length / 3;

  const maxHeightThreshold = 70;
  let launch = false;

  let maxHeightParticle = { x: 0, y: 0, z: 0 };

  //let velocityScaleFactor = 1.0;

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
      //console.log(positions[i * 3 + 1]);
    }
    // after initial upward motion, apply gravity and scatter particles
    if (elapsed > lifetime * 0.2) {
      // later: divide 360 by number of "streaks" you want to create, and then create lines of particles going outward in
      // radial fashion

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

      // Calculate the distance of each particle from the center of the circle (maxHeightParticle)
      const dx = positions[i * 3] - maxHeightParticle.x;
      const dy = positions[i * 3 + 1] - maxHeightParticle.y;
      const dz = positions[i * 3 + 2] - maxHeightParticle.z;

      // Calculate the distance from the center (radius)
      const distance = Math.sqrt(dx * dx + dz * dz);

      // calculate a random angle for the particle to follow a circular path
      const angle = (i / particleCount) * Math.PI * 2; // Evenly distribute particles along 360 degrees
      //const angle = angleList[Math.floor(Math.random(numStreaks - 1))];

      const radius = 5; // fixed base radius for all particles

      const velocityFactor = distance / radius;
      //console.log("velocityFactor", velocityFactor);

      // update particle positions to move in a circle based on angle and radius
      positions[i * 3] +=
        velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
      positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
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

export function updateWillow(particles, delta, elapsed, lifetime, maxHeightParticle) {
  // creating tails
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;

  const particleCount = positions.length / 3;

  const maxHeightThreshold = 70;
  let launch = false;

  let maxHeightParticle = { x: 0, y: 0, z: 0 };

  //let velocityScaleFactor = 1.0;

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
      //console.log(positions[i * 3 + 1]);
    }
    // after initial upward motion, apply gravity and scatter particles
    if (elapsed > lifetime * 0.2) {
      // later: divide 360 by number of "streaks" you want to create, and then create lines of particles going outward in
      // radial fashion

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

      // Calculate the distance of each particle from the center of the circle (maxHeightParticle)
      const dx = positions[i * 3] - maxHeightParticle.x;
      const dy = positions[i * 3 + 1] - maxHeightParticle.y;
      const dz = positions[i * 3 + 2] - maxHeightParticle.z;

      // Calculate the distance from the center (radius)
      const distance = Math.sqrt(dx * dx + dz * dz);

      // calculate a random angle for the particle to follow a circular path
      const angle = (i / particleCount) * Math.PI * 2; // Evenly distribute particles along 360 degrees
      //const angle = angleList[Math.floor(Math.random(numStreaks - 1))];

      const radius = 5; // fixed base radius for all particles

      const velocityFactor = distance / radius;
      //console.log("velocityFactor", velocityFactor);

      // update particle positions to move in a circle based on angle and radius
      positions[i * 3] +=
        velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
      positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
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

export function updatePeony(particles, delta, elapsed, lifetime, maxHeightParticle) {
  // creating tails
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;

  const particleCount = positions.length / 3;

  const maxHeightThreshold = 70;
  let launch = false;

  let maxHeightParticle = { x: 0, y: 0, z: 0 };

  //let velocityScaleFactor = 1.0;

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
      //console.log(positions[i * 3 + 1]);
    }
    // after initial upward motion, apply gravity and scatter particles
    if (elapsed > lifetime * 0.2) {
      // later: divide 360 by number of "streaks" you want to create, and then create lines of particles going outward in
      // radial fashion

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

      // Calculate the distance of each particle from the center of the circle (maxHeightParticle)
      const dx = positions[i * 3] - maxHeightParticle.x;
      const dy = positions[i * 3 + 1] - maxHeightParticle.y;
      const dz = positions[i * 3 + 2] - maxHeightParticle.z;

      // Calculate the distance from the center (radius)
      const distance = Math.sqrt(dx * dx + dz * dz);

      // calculate a random angle for the particle to follow a circular path
      const angle = (i / particleCount) * Math.PI * 2; // Evenly distribute particles along 360 degrees
      //const angle = angleList[Math.floor(Math.random(numStreaks - 1))];

      const radius = 5; // fixed base radius for all particles

      const velocityFactor = distance / radius;
      //console.log("velocityFactor", velocityFactor);

      // update particle positions to move in a circle based on angle and radius
      positions[i * 3] +=
        velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
      positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
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

export function updateChrysanthemum(
  particles,
  delta,
  elapsed,
  lifetime,
  maxHeightParticle
) {
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;
  const particleCount = positions.length / 3;

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = Math.random() * 5 + 4; // Random radius for dynamic spread

    // Sharp, defined particles burst outward
    positions[i * 3] += Math.cos(angle) * radius * delta * 3;
    positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta;
    positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 3;
  }

  particles.attributes.position.needsUpdate = true;
}

export function updatePalm(particles, delta, elapsed, lifetime, maxHeightParticle) {
  // creating tails
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;

  const particleCount = positions.length / 3;

  const maxHeightThreshold = 70;
  let launch = false;

  let maxHeightParticle = { x: 0, y: 0, z: 0 };

  //let velocityScaleFactor = 1.0;

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
      //console.log(positions[i * 3 + 1]);
    }
    // after initial upward motion, apply gravity and scatter particles
    if (elapsed > lifetime * 0.2) {
      // later: divide 360 by number of "streaks" you want to create, and then create lines of particles going outward in
      // radial fashion

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

      // Calculate the distance of each particle from the center of the circle (maxHeightParticle)
      const dx = positions[i * 3] - maxHeightParticle.x;
      const dy = positions[i * 3 + 1] - maxHeightParticle.y;
      const dz = positions[i * 3 + 2] - maxHeightParticle.z;

      // Calculate the distance from the center (radius)
      const distance = Math.sqrt(dx * dx + dz * dz);

      // calculate a random angle for the particle to follow a circular path
      const angle = (i / particleCount) * Math.PI * 2; // Evenly distribute particles along 360 degrees
      //const angle = angleList[Math.floor(Math.random(numStreaks - 1))];

      const radius = 5; // fixed base radius for all particles

      const velocityFactor = distance / radius;
      //console.log("velocityFactor", velocityFactor);

      // update particle positions to move in a circle based on angle and radius
      positions[i * 3] +=
        velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
      positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
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

export function updateCrosette(
  particles,
  delta,
  elapsed,
  lifetime,
  maxHeightParticle
) {
  // creating tails
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;

  const particleCount = positions.length / 3;

  const maxHeightThreshold = 70;
  let launch = false;

  let maxHeightParticle = { x: 0, y: 0, z: 0 };

  //let velocityScaleFactor = 1.0;

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
      //console.log(positions[i * 3 + 1]);
    }
    // after initial upward motion, apply gravity and scatter particles
    if (elapsed > lifetime * 0.2) {
      // later: divide 360 by number of "streaks" you want to create, and then create lines of particles going outward in
      // radial fashion

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

      // Calculate the distance of each particle from the center of the circle (maxHeightParticle)
      const dx = positions[i * 3] - maxHeightParticle.x;
      const dy = positions[i * 3 + 1] - maxHeightParticle.y;
      const dz = positions[i * 3 + 2] - maxHeightParticle.z;

      // Calculate the distance from the center (radius)
      const distance = Math.sqrt(dx * dx + dz * dz);

      // calculate a random angle for the particle to follow a circular path
      const angle = (i / particleCount) * Math.PI * 2; // Evenly distribute particles along 360 degrees
      //const angle = angleList[Math.floor(Math.random(numStreaks - 1))];

      const radius = 5; // fixed base radius for all particles

      const velocityFactor = distance / radius;
      //console.log("velocityFactor", velocityFactor);

      // update particle positions to move in a circle based on angle and radius
      positions[i * 3] +=
        velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
      positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
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

export function updateComet(particles, delta, elapsed, lifetime, maxHeightParticle) {
  // creating tails
  const positions = particles.attributes.position.array;
  const velocities = particles.attributes.velocity.array;

  const particleCount = positions.length / 3;

  const maxHeightThreshold = 70;
  let launch = false;

  let maxHeightParticle = { x: 0, y: 0, z: 0 };

  //let velocityScaleFactor = 1.0;

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
      //console.log(positions[i * 3 + 1]);
    }
    // after initial upward motion, apply gravity and scatter particles
    if (elapsed > lifetime * 0.2) {
      // later: divide 360 by number of "streaks" you want to create, and then create lines of particles going outward in
      // radial fashion

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

      // Calculate the distance of each particle from the center of the circle (maxHeightParticle)
      const dx = positions[i * 3] - maxHeightParticle.x;
      const dy = positions[i * 3 + 1] - maxHeightParticle.y;
      const dz = positions[i * 3 + 2] - maxHeightParticle.z;

      // Calculate the distance from the center (radius)
      const distance = Math.sqrt(dx * dx + dz * dz);

      // calculate a random angle for the particle to follow a circular path
      const angle = (i / particleCount) * Math.PI * 2; // Evenly distribute particles along 360 degrees
      //const angle = angleList[Math.floor(Math.random(numStreaks - 1))];

      const radius = 5; // fixed base radius for all particles

      const velocityFactor = distance / radius;
      //console.log("velocityFactor", velocityFactor);

      // update particle positions to move in a circle based on angle and radius
      positions[i * 3] +=
        velocities[i * 3 + 0] * 0.01 + Math.cos(angle) * radius * delta * 2; // horizontal motion (X-axis)
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta - 9.8 * delta; // gravity effect on Y-axis
      positions[i * 3 + 2] += Math.sin(angle) * radius * delta * 2; // depth motion (Z-axis)
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

import * as THREE from "../node_modules/three/build/three.module.js";

export function createFirework(scene, color, duration) {
  const particles = new THREE.BufferGeometry();
  const particleCount = 100;
  const positions = [];
  const velocities = [];
  const maxSpeed = 50; // max speed of particles
  const bounds = { x: 200, y: 200, z: 200 }; // max bounds for firework position

  // randomize the firework position within bounds of page
  const startX = Math.random() * bounds.x - bounds.x / 2;
  const startY = Math.random() * bounds.y - bounds.y / 2;
  const startZ = Math.random() * bounds.z - bounds.z / 2;

  // initialize firework particle positions and velocities
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * maxSpeed;
    positions.push(startX, startY, startZ); // randomized starting location
    velocities.push(
      Math.cos(angle) * speed,
      Math.random() * speed,
      Math.sin(angle) * speed
    );
  }

  particles.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  particles.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(velocities, 3)
  );

  // MAKING THE PARTICLES INTO CIRCLES
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 64; 

  canvas.width = size;
  canvas.height = size;

  // drawing the circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, false);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.globalAlpha = 1; 

  // make texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.PointsMaterial({
    color: color,
    size: 2,
    transparent: true,
    opacity: 1,
    map: texture,
  });

  const firework = new THREE.Points(particles, material);
  scene.add(firework);

  const lifetime = duration;
  let elapsed = 0;

  return {
    update: (delta) => {
      elapsed += delta;

      // check if the firework has lived long enough to be destroyed
      if (elapsed > lifetime) {
        this.destroy(scene); // destroy the firework once its lifetime ends
      } else {
        const positions = particles.attributes.position.array;
        const velocities = particles.attributes.velocity.array;

        // update positions of each particle based on velocity
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += velocities[i * 3] * delta;
          positions[i * 3 + 1] +=
            velocities[i * 3 + 1] * delta - 9.8 * delta * delta; // gravity effect
          positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;
        }
        particles.attributes.position.needsUpdate = true;

        const fadeFactor = Math.min(elapsed / lifetime, 1);
        const speedFactor = Math.min(
          Math.max(
            Math.sqrt(
              Math.pow(velocities[0], 2) +
                Math.pow(velocities[1], 2) +
                Math.pow(velocities[2], 2)
            ) / maxSpeed,
            0
          ),
          1
        );

        // update opacity -- want fireworks to fade over time, this is also given by speedfactor
        const opacity = 1 - fadeFactor * (1 - speedFactor);
        material.opacity = opacity;
      }
    },

    destroy: (scene) => {
      if (scene && firework) {
        // remove firework from scene
        scene.remove(firework);

        // dispose to free memory
        if (particles) particles.dispose();
        if (material) material.dispose();
      }
    },
  };
}

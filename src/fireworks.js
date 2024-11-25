import * as THREE from "../node_modules/three/build/three.module.js";

export function createFirework(scene, color, duration) {
  const particles = new THREE.BufferGeometry();
  const trailParticles = new THREE.BufferGeometry();
  const particleCount = 100;
  const maxTrailParticles = 10; // number of particles in the trail
  const positions = [];
  const velocities = [];
  const trailPositions = [];
  const trailVelocities = [];
  const maxSpeed = 50; // max speed of particles
  const bounds = { x: 200, y: 200, z: 200 }; // max bounds for firework position

  // randomize the firework position within bounds of page
  const startX = Math.random() * bounds.x - bounds.x / 2;
  const startY = 0
  const startZ = Math.random() * bounds.z - bounds.z / 2;

  // initialize firework particle positions and velocities
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * maxSpeed;
    positions.push(startX, startY, startZ); // randomized starting location
    velocities.push(
      Math.cos(angle) * speed,
      Math.random() * speed,
      Math.abs(Math.sin(angle)) * speed
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

  // create the trail particle system
  for (let i = 0; i < maxTrailParticles; i++) {
    trailPositions.push(startX, startY, startZ); // start positions for trail particles
    trailVelocities.push(0, 0, 0); // initial velocities of the trail particles
  }

  trailParticles.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(trailPositions, 3)
  );

  trailParticles.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(trailVelocities, 3)
  );

  // MAKING THE PARTICLES INTO CIRCLES
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 64;

  canvas.width = size;
  canvas.height = size;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size / 4,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "white");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)"); // semi-transparent edge
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // fully transparent edge

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // make texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.PointsMaterial({
    color: color,
    size: 2,
    transparent: true,
    opacity: 1,
    map: texture,
    blending: THREE.AdditiveBlending,
    emissive: color,
    emissiveIntensity: 2.5,
  });

  const firework = new THREE.Points(particles, material);
  scene.add(firework);

  // trail material
  const trailMaterial = new THREE.LineBasicMaterial({
    color: color,
    opacity: 0.5,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(trailPositions, 3)
  );
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  scene.add(trail);

  const fireworkLight = new THREE.PointLight(color, 100);
  fireworkLight.position.set(0, 0, 0); // testing
  scene.add(fireworkLight);

  const lifetime = duration;
  let elapsed = 0;

  return {
    update: (delta) => {
      elapsed += delta;

      // check if firework has lived long enough to be destroyed
      if (elapsed > lifetime) {
        this.destroy(scene); // destroy firework once its lifetime ends
      } 
        else {
        const positions = particles.attributes.position.array;
        const velocities = particles.attributes.velocity.array;

        // update positions of each particle based on velocity
        for (let i = 0; i < particleCount; i++) {
          //positions[i * 3] += velocities[i * 3] * 0.02;
          positions[i * 3 + 1] += velocities[i * 3 + 1] * delta; // go along y axis to have particles first rise upwards, then explode
          //positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.006;

          // explosion effect: After initial upward motion, scatter particles
          if (elapsed > lifetime * 0.2) {
            velocities[i * 3] += Math.abs((Math.random() - 0.5)) * delta * 50; // Horizontal scatter
            velocities[i * 3 + 1] += Math.abs(Math.random() - 0.5) * delta * 50; // Horizontal scatter
            velocities[i * 3 + 2] += Math.abs(Math.random() - 0.5) * delta * 50; // Vertical scatter
            positions[i * 3] += velocities[i * 3] * delta;
            positions[i * 3 + 1] +=
              velocities[i * 3 + 1] * delta - 9.8 * delta * delta;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;
          }

          // try to update trail positions
          if (i < maxTrailParticles) {
            trailPositions[i * 3] += velocities[i * 3] * delta;
            trailPositions[i * 3 + 1] +=
              velocities[i * 3 + 1] * delta - 9.8 * delta * delta; // gravity effect
            trailPositions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

            // const dx = positions[i * 3] - startX;
            // const dy = positions[i * 3 + 1] - startY;
            // const dz = positions[i * 3 + 2] - startZ;

            // trailPositions[trailIndex * 3] += dx * delta * 0.1; // Move along the line towards the current position
            // trailPositions[trailIndex * 3 + 1] += dy * delta * 0.1;
            // trailPositions[trailIndex * 3 + 2] += dz * delta * 0.1;
          }
        }
    
        

        particles.attributes.position.needsUpdate = true;

        // fade opacity
        const fadeFactor = Math.min(elapsed / lifetime, 1);
        const opacity = Math.max(0, 1 - fadeFactor); 
        trailMaterial.opacity = opacity;

        // update trail geometry
        trailGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(trailPositions, 3)
        );
        trailParticles.attributes.position.needsUpdate = true;
      }
    },

    destroy: (scene) => {
      if (scene && firework) {
        // remove firework and trail from scene
        scene.remove(firework);
        scene.remove(trail);

        if (particles) particles.dispose();
        if (material) material.dispose();
        if (trailParticles) trailParticles.dispose();
        if (trailMaterial) trailMaterial.dispose();
      }
    },
  };
}

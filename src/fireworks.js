import * as THREE from "../node_modules/three/build/three.module.js";


export function createFirework(scene, color, duration) {
  const particles = new THREE.BufferGeometry();
  const particleCount = 100;
  const positions = [];
  const velocities = [];
    // LOGIC IS WRONG Im just trtying to set up boilerplate
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 50;
    positions.push(0, 0, 0); // start at center for right now
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

  const material = new THREE.PointsMaterial({
    color,
    size: 2,
    transparent: true,
    opacity: 0.8,
  });
  const firework = new THREE.Points(particles, material);

  scene.add(firework);

  const lifetime = duration;
  let elapsed = 0;

  return {
    update: (delta) => {
      elapsed += delta;

      if (elapsed > lifetime) {
        scene.remove(firework);
      } else {
        const positions = particles.attributes.position.array;
        const velocities = particles.attributes.velocity.array;

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += velocities[i * 3] * delta;
          positions[i * 3 + 1] +=
            velocities[i * 3 + 1] * delta - 9.8 * delta * delta;
          positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;
        }
        particles.attributes.position.needsUpdate = true;
      }
    },
  };
}

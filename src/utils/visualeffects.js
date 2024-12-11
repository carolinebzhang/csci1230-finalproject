import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// set up bloom effect
export function createBloomEffect(scene, camera, renderer) {
  // create the effectcomposer to apply post-processing
  const composer = new EffectComposer(renderer);

  // renderPass is responsible for rendering the scene normally
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // unrealBloomPass is the pass that applies the bloom effect
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 
    4.5,  // bloom strength
    1.2,  // bloom radius (spread)
    0.55  // bloom threshold (minimum brightness for bloom)
  );

  composer.addPass(bloomPass);

  return composer;
}

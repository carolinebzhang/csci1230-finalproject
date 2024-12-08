import * as THREE from "three";

// function to compute a point on the cubic Bézier curve at a specific t
export function cubicBezier(t, P0, P1, P2, P3) {
  const x =
    Math.pow(1 - t, 3) * P0.x +
    3 * Math.pow(1 - t, 2) * t * P1.x +
    3 * (1 - t) * Math.pow(t, 2) * P2.x +
    Math.pow(t, 3) * P3.x;
  const y =
    Math.pow(1 - t, 3) * P0.y +
    3 * Math.pow(1 - t, 2) * t * P1.y +
    3 * (1 - t) * Math.pow(t, 2) * P2.y +
    Math.pow(t, 3) * P3.y;
  const z =
    Math.pow(1 - t, 3) * P0.z +
    3 * Math.pow(1 - t, 2) * t * P1.z +
    3 * (1 - t) * Math.pow(t, 2) * P2.z +
    Math.pow(t, 3) * P3.z;
  return new THREE.Vector3(x, y, z);
}

// converts hex value to RGB values
export function hexToRGB(hex) {
  let result = hex.replace("#", "");
  return result
    ? {
        r: parseInt(result.slice(0, 2), 16),
        g: parseInt(result.slice(2, 4), 16),
        b: parseInt(result.slice(4, 6), 16),
      }
    : null;
}

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

export function shuffleArray(array: []) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

// export async function asyncForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// }

export function getRandomWebColor(): string {
  // Convert hex color to RGB
  const hexToRgb = (hex: string): number[] =>
    hex
      .replace(/^#/, '')
      .match(/.{1,2}/g)!
      .map((v) => parseInt(v, 16));

  // Convert RGB to hex color
  const rgbToHex = (r: number, g: number, b: number): string =>
    `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;

  // Generate random RGB values within the specified range
  const minColor: number[] = hexToRgb('#222222');
  const maxColor: number[] = hexToRgb('#FFFFFF');

  const randomColor: number[] = minColor.map((min, index) =>
    Math.floor(Math.random() * (maxColor[index] - min + 1)) + min
  );

  // Convert RGB values back to hex color
  return rgbToHex(...(randomColor as [number,number,number]));
}

export function getRandomNumber(): number {
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);
  // Convert randomBytes to a number between 0 and 1
  return randomBytes[0] / (Math.pow(2, 32) - 1);
}


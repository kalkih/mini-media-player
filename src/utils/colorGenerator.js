import Vibrant from 'node-vibrant/dist/vibrant';

import { CONTRAST_RATIO, COLOR_SIMILARITY_THRESHOLD } from '../const';

const luminance = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    let w = v;
    w /= 255;
    return w <= 0.03928 ? w / 12.92 : ((w + 0.055) / 1.055) ** 2.4;
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const contrast = (rgb1, rgb2) => {
  const lum1 = luminance(...rgb1);
  const lum2 = luminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

const getContrastRatio = (rgb1, rgb2) => Math.round((contrast(rgb1, rgb2) + Number.EPSILON) * 100) / 100;

const colorGenerator = (colors) => {
  colors.sort((colorA, colorB) => colorB.population - colorA.population);

  const backgroundColor = colors[0];
  let foregroundColor;

  const contrastRatios = new Map();
  const approvedContrastRatio = (hex, rgb) => {
    if (!contrastRatios.has(hex)) {
      contrastRatios.set(hex, getContrastRatio(backgroundColor.rgb, rgb));
    }

    return contrastRatios.get(hex) > CONTRAST_RATIO;
  };

  // We take each next color and find one that has better contrast.
  for (let i = 1; i < colors.length && foregroundColor === undefined; i++) {
    // If this color matches, score, take it.
    if (approvedContrastRatio(colors[i].hex, colors[i].rgb)) {
      foregroundColor = colors[i].rgb;
      break;
    }

    // This color has the wrong contrast ratio, but it is the right color.
    // Let's find similar colors that might have the right contrast ratio

    const currentColor = colors[i];

    for (let j = i + 1; j < colors.length; j++) {
      const compareColor = colors[j];

      // difference. 0 is same, 765 max difference
      const diffScore =
        Math.abs(currentColor.rgb[0] - compareColor.rgb[0]) +
        Math.abs(currentColor.rgb[1] - compareColor.rgb[1]) +
        Math.abs(currentColor.rgb[2] - compareColor.rgb[2]);

      if (diffScore > COLOR_SIMILARITY_THRESHOLD) {
        continue;
      }

      if (approvedContrastRatio(compareColor.hex, compareColor.rgb)) {
        foregroundColor = compareColor.rgb;
        break;
      }
    }
  }

  if (foregroundColor === undefined) {
    foregroundColor = backgroundColor.getYiq() < 200 ? [255, 255, 255] : [0, 0, 0];
  }

  return [new backgroundColor.constructor(foregroundColor, 0).hex, backgroundColor.hex];
};

Vibrant._pipeline.generator.register('default', colorGenerator);
export default async (picture) => new Vibrant(picture, { colorCount: 16 }).getPalette();

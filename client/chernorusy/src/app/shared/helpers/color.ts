import { isNil } from 'lodash';
import { hex2rgb } from '@csscolor/hex2rgb';

export function isLightColor(color: string) {
  if (isHex(color)) {
    color = hexToRGB(color);
  }
  const params = parseRGB(color);
  if (!params) {
    return true;
  }
  const { r, g, b, a } = params;
  if (a < 0.5) {
    return true;
  }
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return hsp > 127.5;
}

export function isHex(color: string) {
  return color.startsWith('#') && color.length <= 7;
}

export function isRGB(color: string) {
  return /rgba?\([\w|\W]+\)/.test(color) && !!parseRGB(color);
}

export function parseRGB(rgbOrRgba: string) {
  const res = /(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d(?:\.\d+)?))?/.exec(
    rgbOrRgba
  );
  const r = res?.[1];
  const g = res?.[2];
  const b = res?.[3];
  const a = res?.[4] ?? 1;
  if ([r, g, b].some((color) => isNil(color))) {
    return null;
  }
  return { r: +r!, g: +g!, b: +b!, a: +a };
}

export function hexToRGB(hex: string) {
  return hex2rgb(hex, { CSSColorsLevel3: true });
}

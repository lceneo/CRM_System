import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorConverterService {

  constructor() { }

  hex2rgba(hex: string, alpha: number = 1) {
    const matchedParametes =  hex.match(/\w\w/g);
    if (!matchedParametes) { throw Error('Invalid hex string'); }
    const [r, g, b] = matchedParametes.map(x => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  };
}

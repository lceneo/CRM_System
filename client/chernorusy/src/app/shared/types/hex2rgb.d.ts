declare module '@csscolor/hex2rgb' {
  function hex2rgb(hexString: string, params?: ParseParams): string;
  type ParseParams = { CSSColorsLevel3?: boolean; percent?: boolean };
}

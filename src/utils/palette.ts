import { COLOR_PALETTES, DEFAULT_PALETTE_ID, ColorPalette } from '../data/colorPalettes';

const STORAGE_KEY = 'coverly.palette';

export const getPaletteById = (paletteId?: string): ColorPalette => {
  const fallback = COLOR_PALETTES.find((palette) => palette.id === DEFAULT_PALETTE_ID) ?? COLOR_PALETTES[0];
  if (!paletteId) {
    return fallback;
  }
  return COLOR_PALETTES.find((palette) => palette.id === paletteId) ?? fallback;
};

export const loadPaletteId = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PALETTE_ID;
    }
    return stored;
  } catch {
    return DEFAULT_PALETTE_ID;
  }
};

export const savePaletteId = (paletteId: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, paletteId);
  } catch {
    // no-op
  }
};

export const applyPaletteToRoot = (palette: ColorPalette) => {
  const root = document.documentElement;
  const base = palette.colors[0] || DEFAULT_PALETTE_ID;
  const rgb = hexToRgb(base) ?? { r: 255, g: 143, b: 171 };
  root.style.setProperty('--top-accent-hex', base);
  root.style.setProperty('--top-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) {
    return null;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return null;
  }
  return { r, g, b };
};

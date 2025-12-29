export interface ColorPalette {
  id: string;
  name: string;
  colors: [string, string, string];
}

export const DEFAULT_PALETTE_ID = 'emerald';

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'emerald',
    name: 'Esmeralda',
    colors: ['#63C39E', '#63C39E', '#63C39E']
  },
  {
    id: 'jasmine',
    name: 'Jasmine',
    colors: ['#E6C86E', '#E6C86E', '#E6C86E']
  },
  {
    id: 'ocean',
    name: 'Oceano',
    colors: ['#6FB8E8', '#6FB8E8', '#6FB8E8']
  },
  {
    id: 'sunset',
    name: 'Pôr do sol',
    colors: ['#F49A7A', '#F49A7A', '#F49A7A']
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    colors: ['#B79BE3', '#B79BE3', '#B79BE3']
  },
  {
    id: 'forest',
    name: 'Floresta',
    colors: ['#7CB77A', '#7CB77A', '#7CB77A']
  },
  {
    id: 'rose',
    name: 'Rosa',
    colors: ['#E89BB6', '#E89BB6', '#E89BB6']
  },
  {
    id: 'ruby',
    name: 'Rubi',
    colors: ['#E25A6B', '#E25A6B', '#E25A6B']
  },
  {
    id: 'graphite',
    name: 'Grafite',
    colors: ['#8C9AA9', '#8C9AA9', '#8C9AA9']
  },
  {
    id: 'terra',
    name: 'Terra',
    colors: ['#C5956E', '#C5956E', '#C5956E']
  }
];

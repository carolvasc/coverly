import React from 'react';
import { ColorPalette as PaletteDefinition } from '../data/colorPalettes';
import './ColorPalette.css';

interface ColorPaletteProps {
  palettes: PaletteDefinition[];
  selectedId: string;
  onSelect: (paletteId: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ palettes, selectedId, onSelect }) => {
  return (
    <div className="color-palette">
      {palettes.map((palette) => {
        const isActive = palette.id === selectedId;
        const gradient = palette.colors[0];

        return (
          <button
            key={palette.id}
            type="button"
            className={`color-palette__option${isActive ? ' color-palette__option--active' : ''}`}
            onClick={() => onSelect(palette.id)}
            aria-pressed={isActive}
          >
            <span className="color-palette__swatch" style={{ background: gradient }} />
            <span className="color-palette__name">{palette.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ColorPalette;

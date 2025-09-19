import React from 'react';
import './SearchButton.css';

interface SearchButtonProps {
  onSearchSubmit: () => void;
  disabled?: boolean;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onSearchSubmit, disabled = false }) => {
  return (
    <div className="search-button-container">
      <button 
        className="search-button"
        onClick={onSearchSubmit}
        disabled={disabled}
      >
        Buscar
      </button>
    </div>
  );
};

export default SearchButton;
import React from 'react';
import './SearchField.css';

interface SearchFieldProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-field-container">
      <input
        type="text"
        className="search-field"
        placeholder="Digite o título do livro..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchField;
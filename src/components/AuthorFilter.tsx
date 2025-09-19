import React from 'react';
import './AuthorFilter.css';

interface AuthorFilterProps {
  authorTerm: string;
  onAuthorChange: (value: string) => void;
  onSearchSubmit: () => void;
}

const AuthorFilter: React.FC<AuthorFilterProps> = ({ authorTerm, onAuthorChange, onSearchSubmit }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="author-filter">
      <input
        type="text"
        className="author-filter-input"
        placeholder="Filtrar por autor (opcional)"
        value={authorTerm}
        onChange={(e) => onAuthorChange(e.target.value)}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default AuthorFilter;
import React from 'react';
import './AuthorFilter.css';

interface AuthorFilterProps {
  authorTerm: string;
  onAuthorChange: (value: string) => void;
}

const AuthorFilter: React.FC<AuthorFilterProps> = ({ authorTerm, onAuthorChange }) => {
  return (
    <div className="author-filter">
      <input
        type="text"
        className="author-filter-input"
        placeholder="Filter by author (optional)"
        value={authorTerm}
        onChange={(e) => onAuthorChange(e.target.value)}
      />
    </div>
  );
};

export default AuthorFilter;
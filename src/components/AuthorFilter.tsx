import React from 'react';
import './AuthorFilter.css';

interface AuthorFilterProps {
  authorTerm: string;
  onAuthorChange: (value: string) => void;
}

const AuthorFilter: React.FC<AuthorFilterProps> = ({ authorTerm, onAuthorChange }) => {
  return (
    <div className='author-filter'>
      <input
        type='text'
        className='author-filter-input input-soft'
        placeholder='Filtrar por autor (opcional)'
        value={authorTerm}
        onChange={(event) => onAuthorChange(event.target.value)}
      />
    </div>
  );
};

export default AuthorFilter;


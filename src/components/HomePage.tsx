import React, { useState, useMemo } from 'react';
import SearchField from './SearchField';
import BookCard from './BookCard';
import { mockBooks } from '../data/mockBooks';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) {
      return mockBooks.slice(0, 1);
    }
    
    const filtered = mockBooks.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.length > 0 ? filtered.slice(0, 1) : [];
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="homepage">
      <div className="homepage-container">
        <header className="homepage-header">
          <h1 className="homepage-title">Coverly</h1>
          <p className="homepage-subtitle">Find your next story template</p>
        </header>
        
        <SearchField 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        
        <div className="book-results">
          {filteredBooks.length > 0 ? (
            <BookCard book={filteredBooks[0]} />
          ) : searchTerm.trim() ? (
            <div className="no-results">
              <p>No books found for "{searchTerm}"</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
import React, { useState, useCallback, useEffect, useRef } from 'react';
import SearchField from './SearchField';
import BookCard from './BookCard';
import { Book } from '../data/mockBooks';
import { booksApi } from '../services/booksApi';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchBooks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBooks([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await booksApi.searchBooks(query);
      setBooks(result.items.slice(0, 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (value.trim()) {
      debounceRef.current = setTimeout(() => {
        searchBooks(value);
      }, 500);
    } else {
      searchBooks('');
    }
  }, [searchBooks]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
          {loading ? (
            <div className="loading">
              <p>Searching books...</p>
            </div>
          ) : error ? (
            <div className="error">
              <p>{error}</p>
            </div>
          ) : books.length > 0 ? (
            <BookCard book={books[0]} />
          ) : hasSearched && searchTerm.trim() ? (
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
import React, { useState, useCallback, useEffect, useRef } from 'react';
import SearchField from './SearchField';
import AuthorFilter from './AuthorFilter';
import BookCard from './BookCard';
import { Book } from '../data/mockBooks';
import { booksApi } from '../services/booksApi';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [authorTerm, setAuthorTerm] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchBooks = useCallback(async (title: string, author: string) => {
    if (!title.trim()) {
      setBooks([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await booksApi.searchBooks(title, author);
      setBooks(result.items.slice(0, 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback((title: string, author: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (title.trim()) {
      debounceRef.current = setTimeout(() => {
        searchBooks(title, author);
      }, 500);
    } else {
      searchBooks('', '');
    }
  }, [searchBooks]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    performSearch(value, authorTerm);
  }, [authorTerm, performSearch]);

  const handleAuthorChange = useCallback((value: string) => {
    setAuthorTerm(value);
    performSearch(searchTerm, value);
  }, [searchTerm, performSearch]);

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
        
        <AuthorFilter
          authorTerm={authorTerm}
          onAuthorChange={handleAuthorChange}
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
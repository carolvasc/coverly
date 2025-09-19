import React, { useState, useCallback, useEffect, useRef } from 'react';
import SearchField from './SearchField';
import AuthorFilter from './AuthorFilter';
import SearchButton from './SearchButton';
import BookCard from './BookCard';
import BookCardCompact from './BookCardCompact';
import SearchHistory, { SearchHistoryItem } from './SearchHistory';
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
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const searchBooks = useCallback(async (title: string, author: string, addToHistory: boolean = true) => {
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
      const result = await booksApi.searchBooksMultiple(title, author);
      setBooks(result.items.slice(0, 3));
      
      if (addToHistory) {
        addSearchToHistory(title, author);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);


  const addSearchToHistory = useCallback((query: string, author: string) => {
    const newHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      author,
      timestamp: Date.now()
    };

    setSearchHistory(prev => {
      const filtered = prev.filter(item => 
        !(item.query.toLowerCase() === query.toLowerCase() && 
          item.author.toLowerCase() === author.toLowerCase())
      );
      const updated = [newHistoryItem, ...filtered].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleHistoryItemClick = useCallback((item: SearchHistoryItem) => {
    setSearchTerm(item.query);
    setAuthorTerm(item.author);
    setTimeout(() => {
      searchBooks(item.query, item.author, false);
    }, 10);
  }, [searchBooks]);

  const handleClearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchTerm.trim()) {
      searchBooks(searchTerm, authorTerm);
    }
  }, [searchTerm, authorTerm, searchBooks]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    if (!value.trim()) {
      setBooks([]);
      setError(null);
      setHasSearched(false);
    }
  }, []);

  const handleAuthorChange = useCallback((value: string) => {
    setAuthorTerm(value);
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing search history:', error);
      }
    }
  }, []);


  return (
    <div className="homepage">
      <div className="homepage-container">
        <header className="homepage-header">
          <h1 className="homepage-title">Coverly</h1>
          <p className="homepage-subtitle">Find your next story template</p>
        </header>
        
        <div className="homepage-content">
          <div className="search-section">
            <SearchField 
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
            
            <AuthorFilter
              authorTerm={authorTerm}
              onAuthorChange={handleAuthorChange}
            />
            
            <SearchButton
              onSearchSubmit={handleSearchSubmit}
              disabled={!searchTerm.trim()}
            />
            
            <div className="book-results">
              {loading ? (
                <div className="loading">
                  <p>Buscando livros...</p>
                </div>
              ) : error ? (
                <div className="error">
                  <p>{error}</p>
                </div>
              ) : books.length > 0 ? (
                <div className="books-list">
                  {books.map((book, index) => (
                    <BookCardCompact key={`${book.id}-${index}`} book={book} />
                  ))}
                </div>
              ) : hasSearched && searchTerm.trim() ? (
                <div className="no-results">
                  <p>Nenhum livro encontrado para "{searchTerm}"</p>
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="history-section">
            <SearchHistory 
              history={searchHistory}
              onHistoryItemClick={handleHistoryItemClick}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
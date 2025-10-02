import React, { useState, useCallback, useEffect } from 'react';
import SearchField from './SearchField';
import AuthorFilter from './AuthorFilter';
import SearchButton from './SearchButton';
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

  const addSearchToHistory = useCallback((query: string, author: string) => {
    const newHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      author,
      timestamp: Date.now(),
    };

    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (item) =>
          !(
            item.query.toLowerCase() === query.toLowerCase() &&
            item.author.toLowerCase() === author.toLowerCase()
          ),
      );
      const updated = [newHistoryItem, ...filtered].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const searchBooks = useCallback(
    async (title: string, author: string, addToHistory: boolean = true) => {
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
        const searchResults = result.items.slice(0, 3);
        setBooks(searchResults);

        // Guarda os resultados para reutilizar na página de detalhes
        localStorage.setItem('searchResults', JSON.stringify(searchResults));

        if (addToHistory) {
          addSearchToHistory(title, author);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    },
    [addSearchToHistory],
  );

  const handleHistoryItemClick = useCallback(
    (item: SearchHistoryItem) => {
      setSearchTerm(item.query);
      setAuthorTerm(item.author);
      setTimeout(() => {
        searchBooks(item.query, item.author, false);
      }, 10);
    },
    [searchBooks],
  );

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
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error parsing search history:', err);
      }
    }
  }, []);

  return (
    <div className='homepage'>
      <div className='homepage-container'>
        <header className='homepage-header'>
          <span className='homepage-badge' aria-hidden='true'>✨ Biblioteca encantada</span>
          <h1 className='homepage-title'>
            Coverly
            <span role='img' aria-label='livros fofinhos'>📚</span>
          </h1>
          <p className='homepage-subtitle'>
            Descubra capas fofinhas, registre suas buscas favoritas e inspire novas aventuras literárias.
          </p>
        </header>

        <div className='homepage-content'>
          <section className='search-section adorable-card'>
            <div className='search-intro'>
              <h2>Que história vamos ilustrar hoje? ✨</h2>
              <p>Digite o título, adicione o autor opcional e deixe a magia literária acontecer.</p>
            </div>

            <SearchField searchTerm={searchTerm} onSearchChange={handleSearchChange} />

            <AuthorFilter authorTerm={authorTerm} onAuthorChange={handleAuthorChange} />

            <SearchButton onSearchSubmit={handleSearchSubmit} disabled={!searchTerm.trim()} />

            <div className='book-results'>
              {loading ? (
                <div className='loading'>
                  <p>Buscando livros encantados...</p>
                </div>
              ) : error ? (
                <div className='error'>
                  <p>{error}</p>
                </div>
              ) : books.length > 0 ? (
                <div className='books-list'>
                  {books.map((book, index) => (
                    <BookCardCompact key={`${book.id}-${index}`} book={book} />
                  ))}
                </div>
              ) : hasSearched && searchTerm.trim() ? (
                <div className='no-results'>
                  <p>Nenhum livrinho encontrado para "{searchTerm}" 😿</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className='history-section adorable-card'>
            <SearchHistory
              history={searchHistory}
              onHistoryItemClick={handleHistoryItemClick}
              onClearHistory={handleClearHistory}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

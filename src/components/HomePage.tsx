import React, { useState, useCallback, useEffect } from 'react';
import SearchField from './SearchField';
import AuthorFilter from './AuthorFilter';
import SearchButton from './SearchButton';
import BookCardCompact from './BookCardCompact';
import SearchHistory, { SearchHistoryItem } from './SearchHistory';
import { Book } from '../data/mockBooks';
import { booksApi } from '../services/booksApi';
import { togglApi } from '../services/togglApi';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [authorTerm, setAuthorTerm] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [lastSearchedTitle, setLastSearchedTitle] = useState('');
  const [isTogglEnabled, setIsTogglEnabled] = useState(false);
  const [togglLoading, setTogglLoading] = useState(false);
  const [togglError, setTogglError] = useState<string | null>(null);
  const [togglHours, setTogglHours] = useState<number | null>(null);

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

      const normalizedTitle = title.trim();
      setLastSearchedTitle(normalizedTitle);
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

  const handleTogglSwitchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTogglEnabled(event.target.checked);
  }, []);

  const formatHours = useCallback(
    (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
    [],
  );

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

  useEffect(() => {
    if (!isTogglEnabled) {
      setTogglLoading(false);
      setTogglError(null);
      setTogglHours(null);
      return;
    }

    const titleForQuery = lastSearchedTitle.trim();

    if (!titleForQuery) {
      setTogglHours(null);
      setTogglError('Realize uma busca antes de consultar o Toggl Track.');
      return;
    }

    let isCancelled = false;

    const fetchTogglHours = async () => {
      setTogglLoading(true);
      setTogglError(null);
      setTogglHours(null);

      try {
        const hours = await togglApi.getBookHours(titleForQuery);

        if (!isCancelled) {
          setTogglHours(hours);
        }
      } catch (err) {
        if (!isCancelled) {
          setTogglHours(null);
          setTogglError(err instanceof Error ? err.message : 'Falha ao consultar o Toggl Track.');
        }
      } finally {
        if (!isCancelled) {
          setTogglLoading(false);
        }
      }
    };

    fetchTogglHours();

    return () => {
      isCancelled = true;
    };
  }, [isTogglEnabled, lastSearchedTitle]);

  return (
    <div className='homepage'>
      <div className='homepage-container'>
        <header className='homepage-header'>
          <span className='homepage-badge badge-pill' aria-hidden='true'>✨ Biblioteca encantada</span>
          <h1 className='homepage-title'>
            Coverly
            <span role='img' aria-label='livros favoritos'>📚</span>
          </h1>
          <p className='homepage-subtitle'>
            Descubra capas encantadoras, registre suas buscas favoritas e inspire novas aventuras literárias.
          </p>
        </header>

        <div className='homepage-content'>
          <section className='search-section surface-card surface-card--padded-lg'>
            <div className='search-intro'>
              <h2>Que história vamos ilustrar hoje? ✨</h2>
              <p>Digite o título, adicione o autor opcional e deixe a magia literária acontecer.</p>
            </div>

            <SearchField searchTerm={searchTerm} onSearchChange={handleSearchChange} />

            <AuthorFilter authorTerm={authorTerm} onAuthorChange={handleAuthorChange} />

            <SearchButton onSearchSubmit={handleSearchSubmit} disabled={!searchTerm.trim()} />

            <div className='toggl-track-control surface-card surface-card--padded-lg'>
              <div className='toggl-track-toggle'>
                <input
                  id='toggl-track-switch'
                  type='checkbox'
                  checked={isTogglEnabled}
                  onChange={handleTogglSwitchChange}
                />
                <label htmlFor='toggl-track-switch'>Toggl Track</label>
              </div>

              {isTogglEnabled && (
                <div className='toggl-track-status' role='status' aria-live='polite'>
                  {togglLoading ? (
                    <p>Consultando tempo de leitura no Toggl...</p>
                  ) : togglError ? (
                    <p className='toggl-track-error'>{togglError}</p>
                  ) : (
                    <p className='toggl-track-hours'>
                      Tempo registrado: <strong>{formatHours(togglHours ?? 0)}</strong>{' '}
                      hora{Math.abs(togglHours ?? 0) === 1 ? '' : 's'}.
                    </p>
                  )}
                </div>
              )}
            </div>

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

          <section className='history-section surface-card surface-card--padded-lg'>
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

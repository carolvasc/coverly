import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import SearchField from './SearchField';
import SearchButton from './SearchButton';
import StarRating from './StarRating';
import StoryBookCoverImage from './story/StoryBookCoverImage';
import StoryStars from './story/StoryStars';
import RetrospectiveTemplate, { RetrospectiveEntry } from './story/RetrospectiveTemplate';
import { Book } from '../data/mockBooks';
import { translateGenre } from '../data/genreTranslations';
import { booksApi } from '../services/booksApi';
import './RetrospectivaPage.css';

const GENRE_OPTIONS = [
  'Fantasia',
  'Romance',
  'Ficção científica',
  'Mistério',
  'Suspense',
  'Terror',
  'Aventura',
  'Drama',
  'Biografia',
  'Não ficção',
  'Autodesenvolvimento',
  'História',
  'Literatura contemporânea brasileira',
  'Infantil',
  'Young Adult',
  'Poesia'
];

const MAX_ENTRIES = 4;

const normalizeGenreKey = (value: string) => value.trim().toLowerCase();

const HIDDEN_TEMPLATE_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: '-9999px',
  visibility: 'hidden',
  width: '1080px',
  height: '1920px'
};

const RetrospectivaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState(0);
  const [pageCountOverride, setPageCountOverride] = useState('');
  const [genreOptions, setGenreOptions] = useState<string[]>(GENRE_OPTIONS);
  const [hiddenGenres, setHiddenGenres] = useState<string[]>([]);
  const [entries, setEntries] = useState<RetrospectiveEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isEditing = editingId !== null;
  const isAtLimit = entries.length >= MAX_ENTRIES;
  const hiddenGenreKeys = useMemo(() => new Set(hiddenGenres.map(normalizeGenreKey)), [hiddenGenres]);

  const bookGenres = useMemo(() => {
    const rawGenres = selectedBook?.categories ?? [];
    const list = Array.isArray(rawGenres) ? rawGenres : [rawGenres];
    const uniqueMap = new Map<string, string>();

    list.forEach((item) => {
      if (!item) {
        return;
      }
      const trimmed = item.trim();
      if (!trimmed) {
        return;
      }
      const translated = translateGenre(trimmed);
      const key = normalizeGenreKey(translated);
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, translated);
      }
    });

    return Array.from(uniqueMap.values());
  }, [selectedBook]);

  const visibleGenreOptions = useMemo(
    () => genreOptions.filter((option) => !hiddenGenreKeys.has(normalizeGenreKey(option))),
    [genreOptions, hiddenGenreKeys]
  );

  const resetForm = useCallback(() => {
    setSelectedBook(null);
    setGenre('');
    setRating(0);
    setPageCountOverride('');
    setEditingId(null);
    setFormError(null);
  }, []);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    if (!selectedBook) {
      setGenre('');
      return;
    }

    if (bookGenres.length > 0) {
      setGenre(bookGenres[0]);
      return;
    }

    setGenre('');
  }, [selectedBook, bookGenres, isEditing]);

  useEffect(() => {
    if (bookGenres.length === 0) {
      return;
    }

    setGenreOptions((prev) => {
      const existingKeys = new Set(prev.map(normalizeGenreKey));
      let next = prev;

      bookGenres.forEach((genreItem) => {
        const key = normalizeGenreKey(genreItem);
        if (existingKeys.has(key) || hiddenGenreKeys.has(key)) {
          return;
        }

        if (next === prev) {
          next = [...prev];
        }

        next.push(genreItem);
        existingKeys.add(key);
      });

      return next;
    });
  }, [bookGenres, hiddenGenreKeys]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      setSearchError(null);
    }
  }, []);

  const handleSearchSubmit = useCallback(async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const result = await booksApi.searchBooksMultiple(trimmed);
      setSearchResults(result.items.slice(0, 6));
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Falha ao buscar livros.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm]);

  const handleSearchFormSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearchSubmit();
  }, [handleSearchSubmit]);

  const handleSelectBook = useCallback((book: Book) => {
    setSelectedBook(book);
    if (book.pageCount > 0) {
      setPageCountOverride('');
    }
    setFormError(null);
  }, []);

  const handleAddOrUpdate = useCallback(() => {
    if (!selectedBook) {
      setFormError('Selecione um livro antes de adicionar.');
      return;
    }

    const trimmedGenre = genre.trim();

    if (!trimmedGenre) {
      setFormError('Escolha um genero para continuar.');
      return;
    }

    if (rating === 0) {
      setFormError('Defina uma nota de 1 a 5.');
      return;
    }

    const needsPageCount = selectedBook.pageCount === 0;
    const parsedPageCount = Number(pageCountOverride);
    if (needsPageCount && (!pageCountOverride.trim() || Number.isNaN(parsedPageCount) || parsedPageCount <= 0)) {
      setFormError('Informe a quantidade de paginas do livro.');
      return;
    }

    setFormError(null);

    if (isEditing && editingId) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingId
            ? {
                ...entry,
                book: selectedBook,
                genre: trimmedGenre,
                rating,
                pageCountOverride: needsPageCount ? parsedPageCount : undefined
              }
            : entry
        )
      );
      resetForm();
      return;
    }

    const newEntry: RetrospectiveEntry = {
      id: Date.now().toString(),
      book: selectedBook,
      genre: trimmedGenre,
      rating,
      pageCountOverride: needsPageCount ? parsedPageCount : undefined
    };

    let limitReached = false;

    setEntries((prev) => {
      if (prev.length >= MAX_ENTRIES) {
        limitReached = true;
        return prev;
      }
      return [...prev, newEntry];
    });

    if (limitReached) {
      setFormError(`Voce ja adicionou o limite de ${MAX_ENTRIES} livros.`);
      return;
    }

    resetForm();
  }, [selectedBook, genre, rating, isEditing, editingId, resetForm]);

  const handleSelectGenreOption = useCallback((value: string) => {
    setGenre(value);
    setFormError(null);
  }, []);

  const handleRemoveGenreOption = useCallback((value: string) => {
    setHiddenGenres((prev) => {
      const key = normalizeGenreKey(value);
      if (prev.some((item) => normalizeGenreKey(item) === key)) {
        return prev;
      }
      return [...prev, value];
    });

    if (normalizeGenreKey(genre) === normalizeGenreKey(value)) {
      setGenre('');
    }
  }, [genre]);

  const handleEditEntry = useCallback((entry: RetrospectiveEntry) => {
    setSelectedBook(entry.book);
    setGenre(entry.genre);
    setRating(entry.rating);
    setPageCountOverride(entry.pageCountOverride ? String(entry.pageCountOverride) : '');
    setEditingId(entry.id);
    setFormError(null);
  }, []);

  const handleRemoveEntry = useCallback((entryId: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    if (editingId === entryId) {
      resetForm();
    }
  }, [editingId, resetForm]);

  const handleClearEntries = useCallback(() => {
    setEntries([]);
    resetForm();
  }, [resetForm]);

  const handleCancelEdit = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const waitForImagesToLoad = useCallback(async (element: HTMLElement) => {
    const images = Array.from(element.getElementsByTagName('img'));
    if (images.length === 0) {
      return;
    }

    await Promise.all(
      images.map((image) => {
        if (image.complete && image.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          const handleResolve = () => {
            image.removeEventListener('load', handleResolve);
            image.removeEventListener('error', handleResolve);
            resolve();
          };

          image.addEventListener('load', handleResolve, { once: true });
          image.addEventListener('error', handleResolve, { once: true });
        });
      })
    );
  }, []);

  const handleDownload = useCallback(async () => {
    if (entries.length === 0) {
      setFormError('Adicione pelo menos um livro antes de baixar.');
      return;
    }

    setIsGenerating(true);
    setFormError(null);

    const templateElement = document.getElementById('retrospective-template');
    const originalStyle = templateElement ? templateElement.style.cssText : '';

    try {
      if (!templateElement) {
        throw new Error('Template nao encontrado.');
      }

      templateElement.style.cssText =
        'position: fixed; top: 0; left: 0; z-index: 9999; visibility: visible; width: 1080px; height: 1920px;';

      await waitForImagesToLoad(templateElement);

      const options = {
        width: 1080,
        height: 1920,
        useCORS: true,
        allowTaint: true,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      };

      let dataUrl: string | null = null;

      try {
        dataUrl = await toPng(templateElement, options);
      } catch (pngError) {
        dataUrl = await toJpeg(templateElement, { ...options, quality: 0.92 });
      }

      if (!dataUrl) {
        throw new Error('Falha ao gerar o arquivo.');
      }

      const link = document.createElement('a');
      link.download = 'retrospectiva-2025.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Falha ao gerar o template.');
    } finally {
      if (templateElement) {
        templateElement.style.cssText = originalStyle;
      }
      setIsGenerating(false);
    }
  }, [entries.length, waitForImagesToLoad]);

  const selectedBookLabel = useMemo(() => {
    if (!selectedBook) {
      return 'Nenhum livro selecionado';
    }
    const safePageCount =
      selectedBook.pageCount > 0
        ? selectedBook.pageCount
        : Number(pageCountOverride) || 0;
    return `${selectedBook.title} (${safePageCount} paginas)`;
  }, [selectedBook, pageCountOverride]);

  return (
    <div className="retrospective-page">
      <div className="retrospective-page__container">
        <section className="retrospective-form surface-card surface-card--padded-lg">
          <div className="retrospective-form__header">
            <span className="badge-pill">Retrospectiva</span>
            <h1 className="retrospective-form__title">Leituras 2025</h1>
            <p className="retrospective-form__subtitle">
              Busque livros, defina genero e nota, e monte seu story com ate {MAX_ENTRIES} leituras.
            </p>
          </div>

          <div className="retrospective-form__section">
            <h2>Buscar livro</h2>
            <form className="retrospective-search" onSubmit={handleSearchFormSubmit}>
              <SearchField searchTerm={searchTerm} onSearchChange={handleSearchChange} />
              <SearchButton onSearchSubmit={handleSearchSubmit} disabled={!searchTerm.trim() || searchLoading} />
            </form>

            <div className="retrospective-results">
              {searchLoading ? (
                <p className="retrospective-status">Buscando livros...</p>
              ) : searchError ? (
                <p className="retrospective-status retrospective-status--error">{searchError}</p>
              ) : searchResults.length > 0 ? (
                <div className="retrospective-results__list">
                  {searchResults.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      className={
                        'retrospective-result' +
                        (selectedBook?.id === book.id ? ' retrospective-result--active' : '')
                      }
                      onClick={() => handleSelectBook(book)}
                    >
                      <div className="retrospective-result__cover">
                        <StoryBookCoverImage
                          thumbnail={book.thumbnail}
                          alt={`Capa do livro ${book.title}`}
                        />
                      </div>
                      <div className="retrospective-result__info">
                        <span className="retrospective-result__title">{book.title}</span>
                        <span className="retrospective-result__pages">
                          {book.pageCount || 0} paginas
                        </span>
                      </div>
                      <span className="retrospective-result__cta">Selecionar</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="retrospective-status">Nenhum resultado ainda.</p>
              )}
            </div>
          </div>

          <div className="retrospective-form__section">
            <h2>Detalhes do livro</h2>
            <div className="retrospective-selected">
              <div className="retrospective-selected__cover">
                {selectedBook ? (
                  <StoryBookCoverImage
                    thumbnail={selectedBook.thumbnail}
                    alt={`Capa do livro ${selectedBook.title}`}
                  />
                ) : (
                  <div className="retrospective-selected__placeholder" />
                )}
              </div>
              <div className="retrospective-selected__info">
                <strong>{selectedBookLabel}</strong>
                <span>{selectedBook?.authors?.join(', ') || 'Autor nao selecionado'}</span>
              </div>
            </div>

            <div className="retrospective-book-genres">
              <label className="retrospective-label">Genero do livro (API)</label>
              {!selectedBook ? (
                <p className="retrospective-status">Selecione um livro para ver os generos.</p>
              ) : bookGenres.length > 0 ? (
                <div className="genre-suggestions">
                  {bookGenres.map((bookGenre) => (
                    <button
                      type="button"
                      key={bookGenre}
                      className="genre-pill"
                      onClick={() => handleSelectGenreOption(bookGenre)}
                      disabled={hiddenGenreKeys.has(normalizeGenreKey(bookGenre))}
                    >
                      {bookGenre}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="retrospective-status">Genero nao informado pela API.</p>
              )}
            </div>

            <label className="retrospective-label" htmlFor="retrospective-genre">
              Genero
            </label>
            <select
              id="retrospective-genre"
              className="input-soft"
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
            >
              <option value="">Selecione um genero</option>
              {visibleGenreOptions.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="genre-options">
              <span className="retrospective-label">Generos disponiveis</span>
              {visibleGenreOptions.length > 0 ? (
                <div className="genre-options__list">
                  {visibleGenreOptions.map((option) => (
                    <div className="genre-option" key={option}>
                      <button
                        type="button"
                        className="genre-option__select"
                        onClick={() => handleSelectGenreOption(option)}
                      >
                        {option}
                      </button>
                      <button
                        type="button"
                        className="genre-option__remove"
                        onClick={() => handleRemoveGenreOption(option)}
                        aria-label={`Remover genero ${option}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="retrospective-status">Nenhum genero disponivel no momento.</p>
              )}
            </div>

            <label className="retrospective-label">Nota</label>
            <StarRating rating={rating} onRatingChange={setRating} />

            {selectedBook?.pageCount === 0 ? (
              <>
                <label className="retrospective-label" htmlFor="retrospective-pages">
                  Quantidade de paginas
                </label>
                <input
                  id="retrospective-pages"
                  type="number"
                  className="input-soft retrospective-pages"
                  value={pageCountOverride}
                  onChange={(event) => setPageCountOverride(event.target.value)}
                  placeholder="Ex.: 320"
                  min="1"
                />
              </>
            ) : null}

            {formError ? <p className="retrospective-status retrospective-status--error">{formError}</p> : null}

            <div className="retrospective-actions">
              <button
                type="button"
                className="button-primary"
                onClick={handleAddOrUpdate}
                disabled={!selectedBook || !genre || rating === 0 || (!isEditing && isAtLimit)}
              >
                {isEditing ? 'Atualizar' : 'Adicionar'}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </div>

          <div className="retrospective-form__section">
            <div className="retrospective-list__header">
              <h2>Livros adicionados</h2>
              <div className="retrospective-list__actions">
                <span>{entries.length}/{MAX_ENTRIES}</span>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={handleClearEntries}
                  disabled={entries.length === 0}
                >
                  Limpar lista
                </button>
              </div>
            </div>
            {entries.length === 0 ? (
              <p className="retrospective-status">Nenhum livro adicionado.</p>
            ) : (
              <div className="retrospective-entry-list">
                {entries.map((entry) => (
                  <div className="retrospective-entry" key={entry.id}>
                    <div className="retrospective-entry__cover">
                      <StoryBookCoverImage
                        thumbnail={entry.book.thumbnail}
                        alt={`Capa do livro ${entry.book.title}`}
                      />
                    </div>
                    <div className="retrospective-entry__info">
                      <strong>{entry.book.title}</strong>
                      <span>
                        {entry.genre} - {(entry.pageCountOverride ?? entry.book.pageCount ?? 0)} paginas
                      </span>
                      <StoryStars rating={entry.rating} className="retrospective-entry__stars" />
                    </div>
                    <div className="retrospective-entry__actions">
                      <button type="button" onClick={() => handleEditEntry(entry)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => handleRemoveEntry(entry.id)}>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="retrospective-preview surface-card surface-card--padded-lg">
          <div className="retrospective-preview__header">
            <h2>Preview do story</h2>
            <p>Acompanhe como o template vai ficar.</p>
          </div>
          <div className="retrospective-preview__frame">
            <div className="retrospective-preview__scale">
              <div className="retrospective-preview__canvas">
                <RetrospectiveTemplate entries={entries} title="Leituras 2025" />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="button-primary retrospective-download"
            onClick={handleDownload}
            disabled={entries.length === 0 || isGenerating}
          >
            {isGenerating ? 'Gerando...' : 'Baixar template'}
          </button>
        </section>
      </div>

      <div id="retrospective-template" style={HIDDEN_TEMPLATE_STYLE} aria-hidden="true">
        <RetrospectiveTemplate entries={entries} title="Leituras 2025" />
      </div>
    </div>
  );
};

export default RetrospectivaPage;

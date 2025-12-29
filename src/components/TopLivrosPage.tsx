import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import SearchField from './SearchField';
import SearchButton from './SearchButton';
import StarRating from './StarRating';
import StoryBookCoverImage from './story/StoryBookCoverImage';
import StoryStars from './story/StoryStars';
import TopBooksTemplate, { TopBookEntry, TopBooksTemplateType } from './story/TopBooksTemplate';
import ReviewBooksTemplate, { ReviewBooksTemplateType } from './story/ReviewBooksTemplate';
import { Book } from '../data/mockBooks';
import { translateGenre } from '../data/genreTranslations';
import { booksApi } from '../services/booksApi';
import './TopLivrosPage.css';

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

type TopLivrosTemplateType = TopBooksTemplateType | ReviewBooksTemplateType;

const TEMPLATE_LIMITS: Record<TopLivrosTemplateType, number> = {
  'top-3': 3,
  'top-5': 5,
  'review-2': 2,
  'review-3': 3
};

const normalizeGenreKey = (value: string) => value.trim().toLowerCase();

const HIDDEN_TEMPLATE_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: '-9999px',
  visibility: 'hidden',
  width: '1080px',
  height: '1920px'
};

const TopLivrosPage: React.FC = () => {
  const [title, setTitle] = useState('Top livros 2025');
  const [templateType, setTemplateType] = useState<TopLivrosTemplateType>('top-3');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState(0);
  const [quote, setQuote] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [showSynopsis, setShowSynopsis] = useState(false);
  const [pageCountOverride, setPageCountOverride] = useState('');
  const [genreOptions, setGenreOptions] = useState<string[]>(GENRE_OPTIONS);
  const [hiddenGenres, setHiddenGenres] = useState<string[]>([]);
  const [entries, setEntries] = useState<TopBookEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isEditing = editingId !== null;
  const maxEntries = TEMPLATE_LIMITS[templateType];
  const hiddenGenreKeys = useMemo(() => new Set(hiddenGenres.map(normalizeGenreKey)), [hiddenGenres]);

  const isRankingTemplate = (value: TopLivrosTemplateType): value is TopBooksTemplateType =>
    value === 'top-3' || value === 'top-5';

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
    setQuote('');
    setSynopsis('');
    setShowQuote(false);
    setShowSynopsis(false);
    setPageCountOverride('');
    setEditingId(null);
    setFormError(null);
  }, []);

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
    if (entries.length <= maxEntries) {
      return;
    }

    setEntries((prev) => prev.slice(0, maxEntries));
    if (!formError) {
      setFormError(`Ajustamos para ${maxEntries} livros ao trocar o template.`);
    }
  }, [entries.length, maxEntries, formError]);

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
    if (!isEditing) {
      setQuote('');
      setSynopsis('');
      setShowQuote(false);
      setShowSynopsis(false);
    }
    if (book.pageCount > 0) {
      setPageCountOverride('');
    }
    setFormError(null);
  }, [isEditing]);

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

    if (!isRankingTemplate(templateType)) {
      if (showQuote && !quote.trim()) {
        setFormError('Preencha a citacao antes de continuar.');
        return;
      }
      if (showSynopsis && !synopsis.trim()) {
        setFormError('Preencha o resumo da sinopse antes de continuar.');
        return;
      }
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
                quote: showQuote ? quote.trim() : '',
                synopsis: showSynopsis ? synopsis.trim() : '',
                pageCountOverride: needsPageCount ? parsedPageCount : undefined
              }
            : entry
        )
      );
      resetForm();
      return;
    }

    const newEntry: TopBookEntry = {
      id: Date.now().toString(),
      book: selectedBook,
      genre: trimmedGenre,
      rating,
      quote: showQuote ? quote.trim() : '',
      synopsis: showSynopsis ? synopsis.trim() : '',
      pageCountOverride: needsPageCount ? parsedPageCount : undefined
    };

    let limitReached = false;

    setEntries((prev) => {
      if (prev.length >= maxEntries) {
        limitReached = true;
        return prev;
      }
      return [...prev, newEntry];
    });

    if (limitReached) {
      setFormError(`Voce ja adicionou o limite de ${maxEntries} livros.`);
      return;
    }

    resetForm();
  }, [
    selectedBook,
    genre,
    rating,
    quote,
    synopsis,
    showQuote,
    showSynopsis,
    pageCountOverride,
    isEditing,
    editingId,
    maxEntries,
    templateType,
    resetForm
  ]);

  const handleEditEntry = useCallback((entry: TopBookEntry) => {
    setSelectedBook(entry.book);
    setGenre(entry.genre);
    setRating(entry.rating);
    const nextQuote = entry.quote ?? '';
    const nextSynopsis = entry.synopsis ?? '';
    setQuote(nextQuote);
    setSynopsis(nextSynopsis);
    setShowQuote(Boolean(nextQuote));
    setShowSynopsis(Boolean(nextSynopsis));
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

  const handleCancelEdit = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const handleMoveEntry = useCallback((entryId: string, direction: 'up' | 'down') => {
    setEntries((prev) => {
      const index = prev.findIndex((entry) => entry.id === entryId);
      if (index < 0) {
        return prev;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  }, []);

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

    const templateElement = document.getElementById('top-books-template');
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

      const safeTitle = title.trim() ? title.trim().replace(/[^a-zA-Z0-9]/g, '-') : 'top-livros';
      const link = document.createElement('a');
      link.download = `${safeTitle.toLowerCase()}.png`;
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
  }, [entries.length, title, waitForImagesToLoad]);

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
    <div className="top-books-page">
      <div className="top-books-page__container">
        <section className="top-books-form surface-card surface-card--padded-lg">
          <div className="top-books-form__header">
            <span className="badge-pill">Top livros</span>
            <h1 className="top-books-form__title">Ranking do ano</h1>
            <p className="top-books-form__subtitle">
              Selecione o template, escolha seus livros e ajuste a ordem como preferir.
            </p>
          </div>

          <div className="top-books-form__section">
            <label className="top-books-label" htmlFor="top-books-title">
              Titulo do story
            </label>
            <input
              id="top-books-title"
              type="text"
              className="input-soft"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Top livros 2025"
            />
          </div>

          <div className="top-books-form__section">
            <label className="top-books-label">Template</label>
            <div className="top-books-template-toggle">
              <button
                type="button"
                className={templateType === 'top-3' ? 'toggle-button active' : 'toggle-button'}
                onClick={() => setTemplateType('top-3')}
              >
                Top 3
              </button>
              <button
                type="button"
                className={templateType === 'top-5' ? 'toggle-button active' : 'toggle-button'}
                onClick={() => setTemplateType('top-5')}
              >
                Top 5
              </button>
              <button
                type="button"
                className={templateType === 'review-2' ? 'toggle-button active' : 'toggle-button'}
                onClick={() => setTemplateType('review-2')}
              >
                Avaliar 2
              </button>
              <button
                type="button"
                className={templateType === 'review-3' ? 'toggle-button active' : 'toggle-button'}
                onClick={() => setTemplateType('review-3')}
              >
                Avaliar 3
              </button>
            </div>
          </div>

          <div className="top-books-form__section">
            <h2>Buscar livro</h2>
            <form className="top-books-search" onSubmit={handleSearchFormSubmit}>
              <SearchField searchTerm={searchTerm} onSearchChange={handleSearchChange} />
              <SearchButton onSearchSubmit={handleSearchSubmit} disabled={!searchTerm.trim() || searchLoading} />
            </form>

            <div className="top-books-results">
              {searchLoading ? (
                <p className="top-books-status">Buscando livros...</p>
              ) : searchError ? (
                <p className="top-books-status top-books-status--error">{searchError}</p>
              ) : searchResults.length > 0 ? (
                <div className="top-books-results__list">
                  {searchResults.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      className={
                        'top-books-result' +
                        (selectedBook?.id === book.id ? ' top-books-result--active' : '')
                      }
                      onClick={() => handleSelectBook(book)}
                    >
                      <div className="top-books-result__cover">
                        <StoryBookCoverImage
                          thumbnail={book.thumbnail}
                          alt={`Capa do livro ${book.title}`}
                        />
                      </div>
                      <div className="top-books-result__info">
                        <span className="top-books-result__title">{book.title}</span>
                        <span className="top-books-result__pages">{book.pageCount || 0} paginas</span>
                      </div>
                      <span className="top-books-result__cta">Selecionar</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="top-books-status">Nenhum resultado ainda.</p>
              )}
            </div>
          </div>

          <div className="top-books-form__section">
            <h2>Detalhes do livro</h2>
            <div className="top-books-selected">
              <div className="top-books-selected__cover">
                {selectedBook ? (
                  <StoryBookCoverImage
                    thumbnail={selectedBook.thumbnail}
                    alt={`Capa do livro ${selectedBook.title}`}
                  />
                ) : (
                  <div className="top-books-selected__placeholder" />
                )}
              </div>
              <div className="top-books-selected__info">
                <strong>{selectedBookLabel}</strong>
                <span>{selectedBook?.authors?.join(', ') || 'Autor nao selecionado'}</span>
              </div>
            </div>

            <div className="top-books-book-genres">
              <label className="top-books-label">Genero do livro (API)</label>
              {!selectedBook ? (
                <p className="top-books-status">Selecione um livro para ver os generos.</p>
              ) : bookGenres.length > 0 ? (
                <div className="top-books-genre-suggestions">
                  {bookGenres.map((bookGenre) => (
                    <button
                      type="button"
                      key={bookGenre}
                      className="top-books-genre-pill"
                      onClick={() => handleSelectGenreOption(bookGenre)}
                      disabled={hiddenGenreKeys.has(normalizeGenreKey(bookGenre))}
                    >
                      {bookGenre}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="top-books-status">Genero nao informado pela API.</p>
              )}
            </div>

            <label className="top-books-label" htmlFor="top-books-genre">
              Genero
            </label>
            <select
              id="top-books-genre"
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

            <div className="top-books-genre-options">
              <span className="top-books-label">Generos disponiveis</span>
              {visibleGenreOptions.length > 0 ? (
                <div className="top-books-genre-options__list">
                  {visibleGenreOptions.map((option) => (
                    <div className="top-books-genre-option" key={option}>
                      <button
                        type="button"
                        className="top-books-genre-option__select"
                        onClick={() => handleSelectGenreOption(option)}
                      >
                        {option}
                      </button>
                      <button
                        type="button"
                        className="top-books-genre-option__remove"
                        onClick={() => handleRemoveGenreOption(option)}
                        aria-label={`Remover genero ${option}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="top-books-status">Nenhum genero disponivel no momento.</p>
              )}
            </div>

            <label className="top-books-label">Nota</label>
            <StarRating rating={rating} onRatingChange={setRating} />

            {selectedBook?.pageCount === 0 ? (
              <>
                <label className="top-books-label" htmlFor="top-books-pages">
                  Quantidade de paginas
                </label>
                <input
                  id="top-books-pages"
                  type="number"
                  className="input-soft top-books-pages"
                  value={pageCountOverride}
                  onChange={(event) => setPageCountOverride(event.target.value)}
                  placeholder="Ex.: 320"
                  min="1"
                />
              </>
            ) : null}

            {!isRankingTemplate(templateType) ? (
              <>
                <div className="top-books-toggle-group">
                  <label className="top-books-toggle">
                    <input
                      type="checkbox"
                      checked={showQuote}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setShowQuote(checked);
                        if (!checked) {
                          setQuote('');
                        }
                      }}
                    />
                    Mostrar citacao
                  </label>
                  <label className="top-books-toggle">
                    <input
                      type="checkbox"
                      checked={showSynopsis}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setShowSynopsis(checked);
                        if (!checked) {
                          setSynopsis('');
                        }
                      }}
                    />
                    Mostrar sinopse
                  </label>
                </div>

                {showQuote ? (
                  <>
                    <label className="top-books-label" htmlFor="top-books-quote">
                      Citacao ou comentario
                    </label>
                    <textarea
                      id="top-books-quote"
                      className="input-soft top-books-quote"
                      value={quote}
                      onChange={(event) => setQuote(event.target.value)}
                      placeholder="Escreva uma citacao ou comentario curto..."
                      rows={3}
                    />
                  </>
                ) : null}

                {showSynopsis ? (
                  <>
                    <label className="top-books-label" htmlFor="top-books-synopsis">
                      Resumo da sinopse
                    </label>
                    <textarea
                      id="top-books-synopsis"
                      className="input-soft top-books-quote"
                      value={synopsis}
                      onChange={(event) => setSynopsis(event.target.value)}
                      placeholder="Escreva um resumo da sinopse..."
                      rows={4}
                    />
                  </>
                ) : null}
              </>
            ) : null}

            {formError ? <p className="top-books-status top-books-status--error">{formError}</p> : null}

            <div className="top-books-actions">
              <button
                type="button"
                className="button-primary"
                onClick={handleAddOrUpdate}
                disabled={!selectedBook || !genre || rating === 0 || (!isEditing && entries.length >= maxEntries)}
              >
                {isEditing ? 'Atualizar' : 'Adicionar'}
              </button>
              {isEditing ? (
                <button type="button" className="button-secondary" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </div>

          <div className="top-books-form__section">
            <div className="top-books-list__header">
              <h2>{isRankingTemplate(templateType) ? 'Ranking' : 'Lista de livros'}</h2>
              <span>{entries.length}/{maxEntries}</span>
            </div>
            {entries.length === 0 ? (
              <p className="top-books-status">Nenhum livro adicionado.</p>
            ) : (
              <div className="top-books-entry-list">
                {entries.map((entry, index) => (
                  <div className="top-books-entry" key={entry.id}>
                    <div className="top-books-entry__rank">{index + 1}</div>
                    <div className="top-books-entry__cover">
                      <StoryBookCoverImage
                        thumbnail={entry.book.thumbnail}
                        alt={`Capa do livro ${entry.book.title}`}
                      />
                    </div>
                    <div className="top-books-entry__info">
                      <strong>{entry.book.title}</strong>
                      <span>{entry.genre}</span>
                      <StoryStars rating={entry.rating} className="top-books-entry__stars" />
                    </div>
                    <div className="top-books-entry__actions">
                      <button type="button" onClick={() => handleMoveEntry(entry.id, 'up')} disabled={index === 0}>
                        Subir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveEntry(entry.id, 'down')}
                        disabled={index === entries.length - 1}
                      >
                        Descer
                      </button>
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

        <section className="top-books-preview surface-card surface-card--padded-lg">
          <div className="top-books-preview__header">
            <h2>Preview do story</h2>
            <p>Seu ranking em destaque.</p>
          </div>
          <div className="top-books-preview__frame">
            <div className="top-books-preview__scale">
              <div className="top-books-preview__canvas">
                {isRankingTemplate(templateType) ? (
                  <TopBooksTemplate title={title || 'Top livros'} entries={entries} templateType={templateType} />
                ) : (
                  <ReviewBooksTemplate
                    title={title || 'Avaliacoes do ano'}
                    entries={entries}
                    templateType={templateType}
                  />
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="button-primary top-books-download"
            onClick={handleDownload}
            disabled={entries.length === 0 || isGenerating}
          >
            {isGenerating ? 'Gerando...' : 'Baixar template'}
          </button>
        </section>
      </div>

      <div id="top-books-template" style={HIDDEN_TEMPLATE_STYLE} aria-hidden="true">
        {isRankingTemplate(templateType) ? (
          <TopBooksTemplate title={title || 'Top livros'} entries={entries} templateType={templateType} />
        ) : (
          <ReviewBooksTemplate
            title={title || 'Avaliacoes do ano'}
            entries={entries}
            templateType={templateType}
          />
        )}
      </div>
    </div>
  );
};

export default TopLivrosPage;

import React from 'react';
import { Book } from '../data/mockBooks';
import { getStoryMoodMeta } from '../data/storyMoods';
import StoryBookCoverImage from './story/StoryBookCoverImage';
import StoryFooter from './story/StoryFooter';
import StoryStars from './story/StoryStars';
import StoryTemplateShell from './story/StoryTemplateShell';
import { StoryTemplateType } from './story/types';
import './TemplateGenerator.css';

export type TemplateType = StoryTemplateType;

interface TemplateGeneratorProps {
  book: Book;
  rating: number;
  hoursRead: string;
  favoriteQuote: string;
  readingMood: string;
  templateType: TemplateType;
  pagesRead?: number;
  finishedAt?: string;
}

export type TemplateRendererProps = TemplateGeneratorProps;
export type TemplateRenderer = React.FC<TemplateRendererProps>;

const HIDDEN_TEMPLATE_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  top: '-9999px',
  visibility: 'hidden'
};

const formatAuthors = (book: Book): string => {
  return book.authors.join(', ');
};

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const parseFinishedAt = (value?: string): string => {
  if (!value) {
    return formatDateToDDMMYYYY(new Date());
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return formatDateToDDMMYYYY(new Date());
  }

  const isoMatch = /^\d{4}-\d{2}-\d{2}$/;
  const brMatch = /^\d{2}\/\d{2}\/\d{4}$/;

  if (isoMatch.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    const candidate = new Date(year, month - 1, day);
    if (!Number.isNaN(candidate.getTime())) {
      return formatDateToDDMMYYYY(candidate);
    }
  }

  if (brMatch.test(trimmed)) {
    const [day, month, year] = trimmed.split('/').map(Number);
    const candidate = new Date(year, month - 1, day);
    if (!Number.isNaN(candidate.getTime())) {
      return formatDateToDDMMYYYY(candidate);
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return formatDateToDDMMYYYY(parsed);
  }

  return formatDateToDDMMYYYY(new Date());
};

const ClassicTemplate: React.FC<TemplateRendererProps> = ({
  book,
  rating,
  hoursRead,
  favoriteQuote,
  readingMood,
  finishedAt
}) => {
  const moodMeta = getStoryMoodMeta(readingMood);
  const hasRating = rating > 0;
  const finishedAtDisplay = parseFinishedAt(finishedAt);
  const infoChips = [
    book.pageCount ? { icon: '📄', label: `${book.pageCount} páginas` } : null,
    hoursRead ? { icon: '⏱️', label: `${hoursRead}h de leitura` } : null,
    book.publisher ? { icon: '🏛️', label: book.publisher } : null,
    finishedAtDisplay ? { icon: '🗓️', label: `Finalizei em ${finishedAtDisplay}` } : null
  ].filter(Boolean) as Array<{ icon: string; label: string }>;

  return (
    <StoryTemplateShell templateType="classic" className="classic-template">
      <div className="classic-inner">
        <div className="classic-cover-panel">
          <div className="classic-cover-glow"></div>
          <div className="classic-cover-frame">
            <StoryBookCoverImage
              thumbnail={book.thumbnail}
              alt={'Capa do livro ' + book.title}
              className="classic-cover-image"
            />
          </div>

          {hasRating ? (
            <div className="classic-rating-badge">
              <StoryStars rating={rating} className="classic-stars" />
              <span className="classic-rating-text">{rating}/5</span>
            </div>
          ) : null}
        </div>

        <div className="classic-content">
          <div className="classic-title-block">
            <span className="classic-kicker">Diário de leitura</span>
            <h1 className="classic-title">{book.title}</h1>
            <p className="classic-author">por {formatAuthors(book)}</p>
          </div>

          {infoChips.length > 0 ? (
            <div className="classic-meta-grid">
              {infoChips.map(chip => (
                <div className="classic-chip" key={chip.icon + chip.label}>
                  <span className="classic-chip-icon" aria-hidden="true">{chip.icon}</span>
                  <span className="classic-chip-label">{chip.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {readingMood ? (
            <div className="classic-mood-card story-glass-card">
              <div className="classic-mood-emoji" aria-hidden="true">{moodMeta.emoji}</div>
              <span className="classic-mood-text">
                Mood da leitura:
                <span className="classic-mood-value">{readingMood}</span>
              </span>
            </div>
          ) : null}

          {favoriteQuote ? (
            <div className="classic-quote">
              <div className="classic-quote-mark">“</div>
              <p className="classic-quote-text">{favoriteQuote}</p>
            </div>
          ) : null}

          <StoryFooter text="📖 Gerado pelo Coverly" className="classic-footer" />
        </div>
      </div>
    </StoryTemplateShell>
  );
};

const ReadingProgressTemplate: React.FC<TemplateRendererProps> = ({
  book,
  rating,
  hoursRead,
  pagesRead = 0
}) => {
  const totalPages = book.pageCount > 0 ? book.pageCount : 0;
  const safePagesRead = totalPages > 0 ? Math.max(0, Math.min(pagesRead, totalPages)) : Math.max(0, pagesRead);
  const progressPercentage = totalPages > 0
    ? Math.round((safePagesRead / totalPages) * 100)
    : 0;
  const remainingPages = totalPages > 0 ? Math.max(0, totalPages - safePagesRead) : 0;
  const donutDegrees = progressPercentage * 3.6;

  const donutStyle: React.CSSProperties = {
    background: `conic-gradient(var(--progress-accent) ${donutDegrees}deg, rgba(255,255,255,0.12) ${donutDegrees}deg 360deg)`
  };

  return (
    <StoryTemplateShell templateType="reading-progress" className="progress-template">
      <div className="progress-safe-area">
        <div className="progress-head">
          <span className="progress-head__kicker">Atualização de leitura</span>
          <h1 className="progress-head__title">{book.title}</h1>
          <p className="progress-head__author">por {formatAuthors(book)}</p>
        </div>

        <div className="progress-cover-block">
          <div className="progress-cover-block__frame">
            <StoryBookCoverImage
              thumbnail={book.thumbnail}
              alt={'Capa do livro ' + book.title}
            />
            <div className="progress-cover-block__overlay">
              <div className="progress-cover-overlay__ring" style={donutStyle}>
                <span className="progress-cover-overlay__value">{progressPercentage}%</span>
              </div>
              <span className="progress-cover-overlay__label">Concluído</span>
            </div>
          </div>
        </div>

        <div className="progress-meta-section">
          <div className="progress-bar">
            <div className="progress-bar__track">
              <div className="progress-bar__fill" style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="progress-bar__meta">
              <span>{safePagesRead} páginas lidas</span>
              <span>{totalPages ? `${totalPages} páginas ao todo` : 'Total desconhecido'}</span>
            </div>
          </div>

          <div className="progress-meta-grid">
            <div className="progress-meta-card">
              <span className="progress-meta-card__label">Minha nota</span>
              <StoryStars rating={rating} className="progress-meta-card__stars" />
            </div>
            <div className="progress-meta-card">
              <span className="progress-meta-card__label">Última página</span>
              <span className="progress-meta-card__value">#{safePagesRead || 0}</span>
            </div>
            <div className="progress-meta-card">
              <span className="progress-meta-card__label">Horas dedicadas</span>
              <span className="progress-meta-card__value">{hoursRead ? `${hoursRead}h` : '—'}</span>
            </div>
            <div className="progress-meta-card">
              <span className="progress-meta-card__label">Restante</span>
              <span className="progress-meta-card__value">{totalPages > 0 ? `${remainingPages} pág.` : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <StoryFooter text="📖 Progresso via Coverly" className="progress-footer" />
    </StoryTemplateShell>
  );
};

const QuoteFocusTemplate: React.FC<TemplateRendererProps> = ({
  book,
  favoriteQuote
}) => {
  const quoteText = favoriteQuote || 'Adicione sua citação favorita...';

  return (
    <StoryTemplateShell templateType="quote-focus" className="quote-template">
      <div className="quote-safe-area">
        <div className="quote-stack">
          <span className="quote-stack__glyph" aria-hidden="true">“</span>
          <p className="quote-stack__text">{quoteText}</p>
        </div>

        <div className="quote-attribution">
          <strong className="quote-attribution__book">{book.title}</strong>
          <span className="quote-attribution__author">por {formatAuthors(book)}</span>
        </div>
      </div>

      <StoryFooter text="📖 Citação via Coverly" className="quote-footer" />
    </StoryTemplateShell>
  );
};

const ReviewCardTemplate: React.FC<TemplateRendererProps> = ({
  book,
  rating,
  favoriteQuote
}) => {
  const quoteText = favoriteQuote || 'Texto ou citacao aqui...';
  const synopsisText = book.description || 'Sinopse do livro...';

  return (
    <StoryTemplateShell templateType="review-card" className="review-card-template">
      <div className="review-card-shell">
        <div className="review-card-header">
          <div className="review-card-cover">
            <StoryBookCoverImage
              thumbnail={book.thumbnail}
              alt={'Capa do livro ' + book.title}
            />
          </div>
          <div className="review-card-info">
            <h1 className="review-card-title">{book.title}</h1>
            <span className="review-card-pages">{book.pageCount || 0} paginas</span>
            <StoryStars rating={rating} className="review-card-stars" />
          </div>
        </div>

        <p className="review-card-quote">"{quoteText}"</p>
      </div>

      <div className="review-card-synopsis">
        <span className="review-card-synopsis-mark">"</span>
        <p className="review-card-synopsis-text">{synopsisText}</p>
      </div>
    </StoryTemplateShell>
  );
};

export const TEMPLATE_RENDERERS: Record<TemplateType, TemplateRenderer> = {
  'classic': ClassicTemplate,
  'reading-progress': ReadingProgressTemplate,
  'quote-focus': QuoteFocusTemplate,
  'review-card': ReviewCardTemplate
};

const TemplateGenerator: React.FC<TemplateGeneratorProps> = props => {
  const templateId = 'story-template-' + props.templateType;
  const SelectedTemplate = TEMPLATE_RENDERERS[props.templateType] || ClassicTemplate;

  return (
    <div
      className={'story-template template-' + props.templateType}
      id={templateId}
      style={HIDDEN_TEMPLATE_STYLE}
    >
      <SelectedTemplate {...props} />
    </div>
  );
};

export const TemplatePreview: React.FC<TemplateGeneratorProps> = props => {
  const SelectedTemplate = TEMPLATE_RENDERERS[props.templateType] || ClassicTemplate;

  return (
    <div className="story-template-preview">
      <div className="story-template-preview__scale">
        <div className="story-template-preview__canvas">
          <SelectedTemplate {...props} />
        </div>
      </div>
    </div>
  );
};

export default TemplateGenerator;



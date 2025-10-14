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
  const safePagesRead = Math.max(0, Math.min(pagesRead, totalPages));
  const progressPercentage = totalPages > 0
    ? Math.round((safePagesRead / totalPages) * 100)
    : 0;

  return (
    <StoryTemplateShell templateType="reading-progress">
      <div className="progress-header">
        <h1 className="progress-title">Lendo Agora</h1>
        <div className="progress-percentage">{progressPercentage}%</div>
      </div>

      <div className="template-book-cover progress-cover">
        <StoryBookCoverImage
          thumbnail={book.thumbnail}
          alt={'Capa do livro ' + book.title}
        />
      </div>

      <div className="book-info">
        <h2 className="book-title">{book.title}</h2>
        <p className="book-author">{formatAuthors(book)}</p>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: progressPercentage + '%' }}
          ></div>
        </div>
        <div className="progress-stats">
          <span>{safePagesRead} / {totalPages} páginas</span>
        </div>
      </div>

      <div className="reading-stats">
        {hoursRead ? (
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-text">{hoursRead}h lidas</span>
          </div>
        ) : null}
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <StoryStars rating={rating} className="inline" />
        </div>
      </div>

      <StoryFooter text="📖 Progresso via Coverly" />
    </StoryTemplateShell>
  );
};

const QuoteFocusTemplate: React.FC<TemplateRendererProps> = ({
  book,
  rating,
  favoriteQuote
}) => {
  return (
    <StoryTemplateShell templateType="quote-focus">
      <div className="quote-main">
        <div className="quote-mark-large">“</div>
        <p className="quote-text-large">{favoriteQuote || 'Adicione sua citação favorita...'}</p>
      </div>

      <div className="quote-book-info story-glass-card">
        <div className="quote-book-cover">
          <StoryBookCoverImage
            thumbnail={book.thumbnail}
            alt={'Capa do livro ' + book.title}
          />
        </div>
        <div className="quote-details">
          <h3 className="quote-book-title">{book.title}</h3>
          <p className="quote-book-author">{formatAuthors(book)}</p>
          <StoryStars rating={rating} className="quote-stars" />
        </div>
      </div>

      <StoryFooter text="📖 Citação via Coverly" />
    </StoryTemplateShell>
  );
};

const MoodBoardTemplate: React.FC<TemplateRendererProps> = ({
  book,
  rating,
  readingMood
}) => {
  const moodMeta = getStoryMoodMeta(readingMood);
  const moodLabel = readingMood || 'imerso na história';

  return (
    <StoryTemplateShell
      templateType="mood-board"
      style={{ background: moodMeta.gradient }}
    >
      <div className="mood-emoji-large">
        {moodMeta.emoji}
      </div>

      <div className="mood-text-large">
        Me senti {moodLabel}
      </div>

      <div className="mood-book-info story-glass-card">
        <div className="mood-book-cover">
          <StoryBookCoverImage
            thumbnail={book.thumbnail}
            alt={'Capa do livro ' + book.title}
          />
        </div>
        <div className="mood-details">
          <h3 className="mood-book-title">{book.title}</h3>
          <p className="mood-book-author">{formatAuthors(book)}</p>
          <StoryStars rating={rating} className="mood-stars" />
        </div>
      </div>

      <StoryFooter text="📖 Sentimentos via Coverly" className="mood-footer story-glass-card" />
    </StoryTemplateShell>
  );
};

export const TEMPLATE_RENDERERS: Record<TemplateType, TemplateRenderer> = {
  'classic': ClassicTemplate,
  'reading-progress': ReadingProgressTemplate,
  'quote-focus': QuoteFocusTemplate,
  'mood-board': MoodBoardTemplate
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



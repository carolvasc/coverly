import React from 'react';
import { Book } from '../data/mockBooks';
import './TemplateGenerator.css';

interface TemplateGeneratorProps {
  book: Book;
  rating: number;
  hoursRead: string;
  favoriteQuote: string;
  readingMood: string;
}

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({
  book,
  rating,
  hoursRead,
  favoriteQuote,
  readingMood
}) => {
  const defaultThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgODAgMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIiBzdHJva2U9IiNFOUVDRUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjQgNDBINTZWNDRIMjRWNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0yNCA1Mkg1NlY1NkgyNFY1MloiIGZpbGw9IiM2Qzc1N0QiLz4KPHA6aCBkPSJNMjQgNjRINDhWNjhIMjRWNjRaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';

  const getThumbnail = (): string => {
    if (!book.thumbnail || book.thumbnail.trim() === '' || book.thumbnail === 'N/A') {
      return defaultThumbnail;
    }
    return book.thumbnail;
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`template-star ${index < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  const getMoodEmoji = (mood: string): string => {
    const moodEmojis: { [key: string]: string } = {
      'inspirado': '✨',
      'emocionado': '❤️',
      'reflexivo': '🤔',
      'entretido': '😄',
      'surpreso': '😮',
      'relaxado': '😌',
      'ansioso': '😰',
      'nostálgico': '💭'
    };
    return moodEmojis[mood] || '📚';
  };

  return (
    <div className="story-template" id="story-template" style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
      <div className="template-background">
        <div className="template-header">
          <h1 className="template-title">{book.title}</h1>
          <p className="template-author">por {book.authors.join(', ')}</p>
        </div>

        <div className="template-book-cover">
          <img 
            src={getThumbnail()} 
            alt={`Capa do livro ${book.title}`}
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.src = defaultThumbnail;
            }}
          />
        </div>

        <div className="template-stats">
          <div className="stat-pages">
            <span className="stat-number">{book.pageCount}</span>
            <span className="stat-label">páginas</span>
          </div>
          
          <div className="stat-hours">
            {hoursRead && (
              <>
                <span className="stat-number">{hoursRead}</span>
                <span className="stat-label">horas</span>
              </>
            )}
          </div>
          
          <div className="stat-rating">
            <div className="template-stars">
              {renderStars()}
            </div>
          </div>
        </div>

        {readingMood && (
          <div className="template-mood">
            <span className="mood-emoji">{getMoodEmoji(readingMood)}</span>
            <span className="mood-text">Me senti {readingMood}</span>
          </div>
        )}

        {favoriteQuote && (
          <div className="template-quote">
            <div className="quote-mark">"</div>
            <p className="quote-text">{favoriteQuote}</p>
          </div>
        )}

        <div className="template-footer">
          <span>📖 Gerado pelo Coverly</span>
        </div>
      </div>
    </div>
  );
};

export default TemplateGenerator;
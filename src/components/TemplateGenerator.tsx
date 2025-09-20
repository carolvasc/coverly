import React from 'react';
import { Book } from '../data/mockBooks';
import './TemplateGenerator.css';

export type TemplateType = 'classic' | 'reading-progress' | 'quote-focus' | 'mood-board';

interface TemplateGeneratorProps {
  book: Book;
  rating: number;
  hoursRead: string;
  favoriteQuote: string;
  readingMood: string;
  templateType: TemplateType;
  pagesRead?: number;
}

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({
  book,
  rating,
  hoursRead,
  favoriteQuote,
  readingMood,
  templateType,
  pagesRead = 0
}) => {
  const defaultThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjQ4MCIgdmlld0JveD0iMCAwIDMyMCA0ODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImJvb2tHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHI ZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iNDgwIiBmaWxsPSJ1cmwoI2Jvb2tHcmFkaWVudCkiIHJ4PSI4Ii8+CjxwYXRoIGQ9Ik0xMjAgMTgwSDE2MFYyMjBIMTIwVjE4MFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIvPgo8cGF0aCBkPSJNMTIwIDI0MEgyMDBWMjYwSDEyMFYyNDBaIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuNikiLz4KPHA6aCBkPSJNMTIwIDI4MEgxODBWMzAwSDEyMFYyODBaIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuNikiLz4KPHN2ZyB4PSIxMzUiIHk9IjE5NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyeiIvPgo8L3N2Zz4KPHR ZXh0IHg9IjE2MCIgeT0iMzUwIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjgpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TZW0gQ2FwYTwvdGV4dD4KPC9zdmc+';

  const getThumbnail = (): string => {
    if (!book.thumbnail || book.thumbnail.trim() === '' || book.thumbnail === 'N/A') {
      return defaultThumbnail;
    }
    
    // Converte HTTP para HTTPS para evitar problemas de CORS
    if (book.thumbnail.startsWith('http://')) {
      return book.thumbnail.replace('http://', 'https://');
    }
    
    return book.thumbnail;
  };

  // Função para carregar imagem via proxy para evitar CORS
  const getProxiedImage = (imageUrl: string): string => {
    if (imageUrl === defaultThumbnail) {
      return imageUrl;
    }
    
    // Usa um proxy CORS se a imagem der problema
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
    console.log('Tentando proxy para:', imageUrl, '→', proxyUrl);
    return proxyUrl;
  };

  // Debug da imagem atual
  React.useEffect(() => {
    console.log('Template carregado para livro:', book.title);
    console.log('URL da capa original:', book.thumbnail);
    console.log('URL da capa processada:', getThumbnail());
  }, [book]);

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

  const renderTemplate = () => {
    switch (templateType) {
      case 'classic':
        return renderClassicTemplate();
      case 'reading-progress':
        return renderReadingProgressTemplate();
      case 'quote-focus':
        return renderQuoteFocusTemplate();
      case 'mood-board':
        return renderMoodBoardTemplate();
      default:
        return renderClassicTemplate();
    }
  };

  const renderClassicTemplate = () => (
    <div className="template-background template-classic">
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
            // Primeiro tenta com proxy
            if (!e.currentTarget.src.includes('allorigins')) {
              e.currentTarget.src = getProxiedImage(getThumbnail());
            } else {
              // Se proxy também falhar, usa placeholder
              e.currentTarget.src = defaultThumbnail;
            }
          }}
          onLoad={(e) => {
            // Remove qualquer filtro de erro
            e.currentTarget.style.filter = 'none';
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
          <div className="quote-mark">"“</div>
          <p className="quote-text">{favoriteQuote}</p>
        </div>
      )}

      <div className="template-footer">
        <span>📖 Gerado pelo Coverly</span>
      </div>
    </div>
  );



  return (
    <div className={`story-template template-${templateType}`} id="story-template" style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
      {renderTemplate()}
    </div>
  );
};

export default TemplateGenerator;
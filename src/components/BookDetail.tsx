import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng, toJpeg } from 'html-to-image';
import { Book } from '../data/mockBooks';
import { booksApi } from '../services/booksApi';
import BookCardCompact from './BookCardCompact';
import StarRating from './StarRating';
import TemplateGenerator, { TemplateType } from './TemplateGenerator';
import './BookDetail.css';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para avaliação e template
  const [rating, setRating] = useState<number>(0);
  const [hoursRead, setHoursRead] = useState<string>('');
  const [favoriteQuote, setFavoriteQuote] = useState<string>('');
  const [readingMood, setReadingMood] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic');
  const [pagesRead, setPagesRead] = useState<number>(0);

  const templateOptions = [
    { id: 'classic', name: 'Template Clássico', description: 'O template original com foco nas informações do livro' },
    { id: 'reading-progress', name: 'Progresso de Leitura', description: 'Ideal para mostrar seu progresso atual' },
    { id: 'quote-focus', name: 'Citação em Destaque', description: 'Destaque sua frase favorita do livro' },
    { id: 'mood-board', name: 'Mood Board', description: 'Expresse como o livro te fez sentir' }
  ] as const;

  // Função auxiliar para criar template simples com canvas
  const createCanvasTemplate = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !book) return null;

    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(book.title, canvas.width / 2, 200);

    // Autor
    ctx.font = '42px Arial';
    ctx.fillText(`por ${book.authors.join(', ')}`, canvas.width / 2, 280);

    // Stars
    ctx.font = '80px Arial';
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    ctx.fillText(stars, canvas.width / 2, 1000);

    // Informações
    if (hoursRead) {
      ctx.font = '48px Arial';
      ctx.fillText(`⏱️ Li em ${hoursRead} horas`, canvas.width / 2, 1200);
    }

    if (readingMood) {
      ctx.font = '48px Arial';
      ctx.fillText(`😊 Me senti ${readingMood}`, canvas.width / 2, 1300);
    }

    // Footer
    ctx.font = '36px Arial';
    ctx.fillText('📖 Gerado pelo Coverly', canvas.width / 2, 1800);

    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('ID do livro não fornecido');
        setLoading(false);
        return;
      }

      try {
        // Busca o livro pelo ID no cache do localStorage ou através da API
        const savedBooks = localStorage.getItem('searchResults');
        if (savedBooks) {
          const books: Book[] = JSON.parse(savedBooks);
          const foundBook = books.find(b => b.id === id);
          if (foundBook) {
            setBook(foundBook);
            setLoading(false);
            return;
          }
        }

        // Se não encontrou no cache, busca pela API usando o título
        // (implementação básica - idealmente usaria um endpoint de busca por ID)
        setError('Livro não encontrado');
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar detalhes do livro');
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGenerateTemplate = async () => {
    if (!book) return;
    
    setIsGenerating(true);
    
    try {
      console.log('Gerando template:', selectedTemplate);
      const templateElement = document.getElementById(`story-template-${selectedTemplate}`);
      console.log('Template element encontrado:', templateElement);
      
      if (!templateElement) {
        throw new Error(`Template ${selectedTemplate} não encontrado`);
      }

      // Temporariamente torna o template visível para captura
      const originalStyle = templateElement.style.cssText;
      templateElement.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 9999; visibility: visible; width: 1080px; height: 1920px;';

      // Aguarda carregar imagens
      await new Promise(resolve => setTimeout(resolve, 1000));

      const options = {
        width: 1080,
        height: 1920,
        useCORS: true,
        allowTaint: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      };

      let dataUrl;
      try {
        dataUrl = await toPng(templateElement, options);
      } catch (pngError) {
        try {
          dataUrl = await toJpeg(templateElement, {
            ...options,
            quality: 0.9
          });
        } catch (jpegError) {
          dataUrl = createCanvasTemplate();
          if (!dataUrl) {
            throw new Error('Falha em todos os métodos de geração');
          }
        }
      }

      // Restaura o estilo original
      templateElement.style.cssText = originalStyle;

      // Cria um link para download
      const link = document.createElement('a');
      const extension = dataUrl.startsWith('data:image/jpeg') ? 'jpg' : 'png';
      const fileName = `story-${book.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.${extension}`;
      link.download = fileName;
      link.href = dataUrl;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Erro ao gerar template:', error);
      
      // Restaura o estilo original em caso de erro
      const templateElement = document.getElementById(`story-template-${selectedTemplate}`);
      if (templateElement) {
        templateElement.style.cssText = 'position: absolute; left: -9999px; top: -9999px; visibility: hidden;';
      }
      
      alert(`Erro ao gerar template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-loading">
        <p>Carregando detalhes do livro...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-error">
        <p>{error || 'Livro não encontrado'}</p>
        <button onClick={handleBackToHome} className="back-button">
          Voltar para busca
        </button>
      </div>
    );
  }

  return (
    <div className="book-detail">
      <div className="book-detail-container">
        <button onClick={handleBackToHome} className="back-button">
          ← Voltar para busca
        </button>
        
        <div className="book-detail-card">
          <BookCardCompact book={book} clickable={false} />
        </div>

        <div className="book-evaluation">
          <h2>Avalie sua leitura</h2>
          
          <div className="evaluation-section">
            <label className="evaluation-label">
              Como você avalia este livro?
            </label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          <div className="evaluation-section">
            <label htmlFor="hours-read" className="evaluation-label">
              Quantas horas você leu?
            </label>
            <input
              id="hours-read"
              type="number"
              value={hoursRead}
              onChange={(e) => setHoursRead(e.target.value)}
              placeholder="Ex: 5"
              className="hours-input"
              min="0"
              step="0.5"
            />
          </div>

          <div className="evaluation-section">
            <label htmlFor="favorite-quote" className="evaluation-label">
              Páginas lidas (para progresso)
            </label>
            <input
              id="pages-read"
              type="number"
              value={pagesRead}
              onChange={(e) => setPagesRead(Number(e.target.value))}
              placeholder={`Ex: ${book?.pageCount || 0}`}
              className="hours-input"
              min="0"
              max={book?.pageCount || 9999}
            />
          </div>

          <div className="evaluation-section">
            <label htmlFor="favorite-quote" className="evaluation-label">
              Frase favorita do livro
            </label>
            <textarea
              id="favorite-quote"
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              placeholder="Digite sua citação favorita..."
              className="quote-textarea"
              rows={3}
            />
          </div>

          <div className="evaluation-section">
            <label htmlFor="reading-mood" className="evaluation-label">
              Como você se sentiu lendo?
            </label>
            <select
              id="reading-mood"
              value={readingMood}
              onChange={(e) => setReadingMood(e.target.value)}
              className="mood-select"
            >
              <option value="">Selecione um sentimento</option>
              <option value="inspirado">Inspirado</option>
              <option value="emocionado">Emocionado</option>
              <option value="reflexivo">Reflexivo</option>
              <option value="entretido">Entretido</option>
              <option value="surpreso">Surpreso</option>
              <option value="relaxado">Relaxado</option>
              <option value="ansioso">Ansioso</option>
              <option value="nostálgico">Nostálgico</option>
            </select>
          </div>
        </div>

        {/* Seletor de Templates */}
        <div className="template-selector">
          <h2>Escolha seu template</h2>
          
          <div className="template-options">
            <div className="template-option">
              <input
                type="radio"
                id="template1"
                name="template"
                value="classic"
                checked={selectedTemplate === 'classic'}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
              />
              <label htmlFor="template1" className="template-preview">
                <div className="template-miniature">
                  <div className="mini-background">
                    <div className="mini-header">
                      <div className="mini-title">{book.title}</div>
                      <div className="mini-author">{book.authors[0]}</div>
                    </div>
                    <div className="mini-cover">
                      <div className="mini-book"></div>
                    </div>
                    <div className="mini-stats">
                      <div className="mini-pages">{book.pageCount}p</div>
                      {hoursRead && <div className="mini-hours">{hoursRead}h</div>}
                      <div className="mini-stars">{'★'.repeat(rating)}</div>
                    </div>
                    {readingMood && <div className="mini-mood">😊 {readingMood}</div>}
                    {favoriteQuote && <div className="mini-quote">"..."</div>}
                    <div className="mini-footer">📖 Coverly</div>
                  </div>
                </div>
                <span className="template-name">Template Clássico</span>
              </label>
            </div>

            <div className="template-option">
              <input
                type="radio"
                id="reading-progress"
                name="template"
                value="reading-progress"
                checked={selectedTemplate === 'reading-progress'}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
              />
              <label htmlFor="reading-progress" className="template-preview">
                <div className="template-miniature">
                  <div className="mini-background mini-progress">
                    <div className="mini-progress-header">Lendo Agora</div>
                    <div className="mini-cover">
                      <div className="mini-book"></div>
                    </div>
                    <div className="mini-progress-bar"></div>
                    <div className="mini-percentage">{Math.round((pagesRead / (book.pageCount || 1)) * 100)}%</div>
                  </div>
                </div>
                <div className="template-info">
                  <span className="template-name">Progresso de Leitura</span>
                  <span className="template-description">Ideal para mostrar seu progresso atual</span>
                </div>
              </label>
            </div>

            <div className="template-option">
              <input
                type="radio"
                id="quote-focus"
                name="template"
                value="quote-focus"
                checked={selectedTemplate === 'quote-focus'}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
              />
              <label htmlFor="quote-focus" className="template-preview">
                <div className="template-miniature">
                  <div className="mini-background mini-quote">
                    <div className="mini-quote-mark">"</div>
                    <div className="mini-quote-text">Citação...</div>
                    <div className="mini-book-info">
                      <div className="mini-book small"></div>
                      <div className="mini-title small">{book.title}</div>
                    </div>
                  </div>
                </div>
                <div className="template-info">
                  <span className="template-name">Citação em Destaque</span>
                  <span className="template-description">Destaque sua frase favorita do livro</span>
                </div>
              </label>
            </div>

            <div className="template-option">
              <input
                type="radio"
                id="mood-board"
                name="template"
                value="mood-board"
                checked={selectedTemplate === 'mood-board'}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
              />
              <label htmlFor="mood-board" className="template-preview">
                <div className="template-miniature">
                  <div className="mini-background mini-mood">
                    <div className="mini-emoji">✨</div>
                    <div className="mini-mood-text">{readingMood || 'Sentimento'}</div>
                    <div className="mini-book-info">
                      <div className="mini-book small"></div>
                    </div>
                  </div>
                </div>
                <div className="template-info">
                  <span className="template-name">Mood Board</span>
                  <span className="template-description">Expresse como o livro te fez sentir</span>
                </div>
              </label>
            </div>
          </div>

          <button 
            onClick={handleGenerateTemplate}
            className="generate-template-button"
            disabled={rating === 0 || isGenerating}
          >
            {isGenerating ? 'Gerando...' : 'Gerar Template para Story'}
          </button>
        </div>

        {/* Templates hidden que serão usados para gerar as imagens */}
        {templateOptions.map((template) => (
          <TemplateGenerator
            key={template.id}
            book={book}
            rating={rating}
            hoursRead={hoursRead}
            favoriteQuote={favoriteQuote}
            readingMood={readingMood}
            templateType={template.id}
            pagesRead={pagesRead}
          />
        ))}
      </div>
    </div>
  );
};

export default BookDetail;
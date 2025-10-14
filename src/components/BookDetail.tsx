import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng, toJpeg } from 'html-to-image';
import { Book } from '../data/mockBooks';
import BookCardCompact from './BookCardCompact';
import StarRating from './StarRating';
import TemplateGenerator, { TemplatePreview, TemplateType } from './TemplateGenerator';
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
  const [finishedReadingDate, setFinishedReadingDate] = useState<string>('');

  const templateOptions = [
    { id: 'classic', name: 'Template Clássico', description: 'O template original com foco nas informações do livro' },
    { id: 'reading-progress', name: 'Progresso de Leitura', description: 'Ideal para mostrar seu progresso atual' },
    { id: 'quote-focus', name: 'Citação em destaque', description: 'Destaque sua frase favorita do livro' },
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

  const waitForImagesToLoad = async (element: HTMLElement) => {
    const images = Array.from(element.getElementsByTagName('img'));
    if (images.length === 0) {
      return;
    }

    await Promise.all(
      images.map(image => {
        if (image.complete && image.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>(resolve => {
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
          <span className="back-button-icon" aria-hidden="true">←</span>
          Voltar para a biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="book-detail">
      <div className="book-detail-container">
        <button onClick={handleBackToHome} className="back-button">
          <span className="back-button-icon" aria-hidden="true">←</span>
          Voltar para a biblioteca
        </button>
        
        <div className="book-detail-card surface-card surface-card--padded-md">
          <BookCardCompact book={book} clickable={false} />
        </div>

        <div className="book-evaluation surface-card surface-card--padded-lg">

          <div className="detail-header">

            <h2 className="detail-title">Personalize sua leitura ✨</h2>

            <p className="detail-subtitle">Preencha os detalhes para deixar o template com a sua cara.</p>

          </div>



          <div className="evaluation-grid">

            <div className="evaluation-section rating-row">

              <label className="evaluation-label">Como você avalia este livro?</label>

              <StarRating rating={rating} onRatingChange={setRating} />

              <span className="rating-helper">Escolha de 1 a 5 estrelas</span>

            </div>



            <div className="evaluation-section">

              <label htmlFor="hours-read" className="evaluation-label">Quanto tempo você passou com ele?</label>

              <input

                id="hours-read"

                type="number"

                value={hoursRead}

                onChange={(event) => setHoursRead(event.target.value)}

                placeholder="Ex.: 5"

                className="hours-input input-soft"

                min="0"

                step="0.5"

              />

            </div>



            <div className="evaluation-section">

              <label htmlFor="pages-read" className="evaluation-label">Páginas lidas (para progresso)</label>

              <input

                id="pages-read"

                type="number"

                value={pagesRead}

                onChange={(event) => setPagesRead(Number(event.target.value))}

                placeholder={`Ex.: ${book?.pageCount || 0}`}

                className="pages-input input-soft"

                min="0"

                max={book?.pageCount || 9999}

              />

            </div>



            <div className="evaluation-section">

              <label htmlFor="finished-reading-date" className="evaluation-label">Data que finalizei a leitura (opcional)</label>

              <input

                id="finished-reading-date"

                type="date"

                value={finishedReadingDate}

                onChange={(event) => setFinishedReadingDate(event.target.value)}

                className="finished-date-input input-soft"

                max={new Date().toISOString().split('T')[0]}

              />

            </div>



            <div className="evaluation-section quote-section">

              <label htmlFor="favorite-quote" className="evaluation-label">Frase favorita do livro</label>

              <textarea

                id="favorite-quote"

                value={favoriteQuote}

                onChange={(event) => setFavoriteQuote(event.target.value)}

                placeholder="Digite sua citação favorita..."

                className="quote-textarea input-soft"

                rows={3}

              />

            </div>



            <div className="evaluation-section">

              <label htmlFor="reading-mood" className="evaluation-label">Como você se sentiu lendo?</label>

              <select

                id="reading-mood"

                value={readingMood}

                onChange={(event) => setReadingMood(event.target.value)}

                className="mood-select input-soft"

              >

                <option value="">Selecione um sentimento</option>

                <option value="inspirado">Inspirado</option>

                <option value="emocionado">Emocionado</option>

                <option value="reflexivo">Reflexivo</option>

                <option value="entretido">Entretido</option>

                <option value="surpreso">Surpreso</option>

                <option value="relaxado">Relaxado</option>

                <option value="nostálgico">Nostálgico</option>

              </select>

            </div>

          </div>

        </div>



        {/* Seletor de Templates */}

        

<div className="template-selector surface-card surface-card--padded-lg">

          <div className="detail-header">

            <h2 className="detail-title">Escolha seu template fofinho ✨</h2>

            <p className="detail-subtitle">Cada opção usa os dados acima para criar uma história diferente.</p>

          </div>



          <div className="template-options">
            {templateOptions.map(option => {
              const optionId = option.id as TemplateType;
              const inputId = `template-${option.id}`;

              return (
                <div className="template-option" key={option.id}>
                  <input
                    type="radio"
                    id={inputId}
                    name="template"
                    value={option.id}
                    checked={selectedTemplate === optionId}
                    onChange={(event) => setSelectedTemplate(event.target.value as TemplateType)}
                  />

                  <label htmlFor={inputId} className="template-preview">
                    <div className="template-miniature">
                      <TemplatePreview
                        book={book}
                        rating={rating}
                        hoursRead={hoursRead}
                        favoriteQuote={favoriteQuote}
                        readingMood={readingMood}
                        finishedAt={finishedReadingDate}
                        templateType={optionId}
                        pagesRead={pagesRead}
                      />
                    </div>

                    <div className="template-info">
                      <span className="template-name">{option.name}</span>
                      <span className="template-description">{option.description}</span>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>



          <button

            onClick={handleGenerateTemplate}

            className="generate-template-button button-primary"

            disabled={rating === 0 || isGenerating}

          >

            {isGenerating ? 'Gerando...' : 'Gerar template para story'}

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
            finishedAt={finishedReadingDate}
            templateType={template.id}
            pagesRead={pagesRead}
          />
        ))}
      </div>
    </div>
  );
};

export default BookDetail;








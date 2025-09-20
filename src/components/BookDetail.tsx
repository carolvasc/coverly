import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book } from '../data/mockBooks';
import { booksApi } from '../services/booksApi';
import BookCardCompact from './BookCardCompact';
import StarRating from './StarRating';
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

  const handleGenerateTemplate = () => {
    // Implementação futura para gerar template do story
    console.log('Gerando template com:', {
      book,
      rating,
      hoursRead,
      favoriteQuote,
      readingMood
    });
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

          <button 
            onClick={handleGenerateTemplate}
            className="generate-template-button"
            disabled={rating === 0}
          >
            Gerar Template para Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
import React from 'react';
import { Book } from '../data/mockBooks';
import './BookCard.css';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="book-card">
      <div className="book-card-header">
        <h2 className="book-title">{book.title}</h2>
      </div>
      <div className="book-card-content">
        <div className="book-detail">
          <span className="detail-label">Autor{book.authors.length > 1 ? 'es' : ''}:</span>
          <span className="detail-value">{book.authors.join(', ')}</span>
        </div>
        <div className="book-detail">
          <span className="detail-label">Total de páginas:</span>
          <span className="detail-value">{book.pageCount}</span>
        </div>
        <div className="book-detail">
          <span className="detail-label">Editora:</span>
          <span className="detail-value">{book.publisher}</span>
        </div>
        <div className="book-detail">
          <span className="detail-label">Publicado:</span>
          <span className="detail-value">{book.publishedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
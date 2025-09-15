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
          <span className="detail-label">Author:</span>
          <span className="detail-value">{book.author}</span>
        </div>
        <div className="book-detail">
          <span className="detail-label">Total Pages:</span>
          <span className="detail-value">{book.totalPages}</span>
        </div>
        <div className="book-detail">
          <span className="detail-label">Publisher:</span>
          <span className="detail-value">{book.publisher}</span>
        </div>
        <div className="book-detail">
          <span className="detail-label">Release Year:</span>
          <span className="detail-value">{book.releaseYear}</span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
import React from 'react';
import { Book } from '../data/mockBooks';
import './BookCardCompact.css';

interface BookCardCompactProps {
  book: Book;
}

const BookCardCompact: React.FC<BookCardCompactProps> = ({ book }) => {
  const defaultThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgODAgMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjhGOUZBIiBzdHJva2U9IiNFOUVDRUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjQgNDBINTZWNDRIMjRWNDBaIiBmaWxsPSIjNkM3NTdEIi8+CjxwYXRoIGQ9Ik0yNCA1Mkg1NlY1NkgyNFY1MloiIGZpbGw9IiM2Qzc1N0QiLz4KPHA6aCBkPSJNMjQgNjRINDhWNjhIMjRWNjRaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPgo=';

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    if (/^\d{4}$/.test(dateString)) {
      return `01/01/${dateString}`;
    }
    
    return dateString;
  };

  const getThumbnail = (): string => {
    if (!book.thumbnail || book.thumbnail.trim() === '' || book.thumbnail === 'N/A') {
      return defaultThumbnail;
    }
    return book.thumbnail;
  };

  return (
    <div className="book-card-compact">
      <div className="book-thumbnail">
        <img 
          src={getThumbnail()} 
          alt={`Capa do livro ${book.title}`}
          onError={(e) => {
            e.currentTarget.src = defaultThumbnail;
          }}
        />
      </div>
      <div className="book-info">
        <h3 className="book-title-compact">{book.title}</h3>
        <p className="book-authors-compact">
          {book.authors.join(', ')}
        </p>
        <div className="book-details-compact">
          <span>{book.pageCount} páginas</span>
          <span className="separator">•</span>
          <span>{book.publisher}</span>
          <span className="separator">•</span>
          <span>Publicado em {formatDate(book.publishedDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default BookCardCompact;
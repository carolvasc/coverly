import React from 'react';
import { Book } from '../../data/mockBooks';
import StoryBookCoverImage from './StoryBookCoverImage';
import StoryStars from './StoryStars';
import './ReviewBooksTemplate.css';

export type ReviewBooksTemplateType = 'review-2' | 'review-3';

export interface ReviewBookEntry {
  id: string;
  book: Book;
  genre: string;
  rating: number;
  quote?: string;
  pageCountOverride?: number;
  synopsis?: string;
}

interface ReviewBooksTemplateProps {
  title: string;
  entries: ReviewBookEntry[];
  templateType: ReviewBooksTemplateType;
}

const MAX_ENTRIES: Record<ReviewBooksTemplateType, number> = {
  'review-2': 2,
  'review-3': 3
};

const ReviewBooksTemplate: React.FC<ReviewBooksTemplateProps> = ({ title, entries, templateType }) => {
  const maxEntries = MAX_ENTRIES[templateType];
  const slots = Array.from({ length: maxEntries }, (_, index) => entries[index] ?? null);

  return (
    <div className={`review-books-template review-books-template--${templateType}`}>
      <header className="review-books-template__header">
        <span className="review-books-template__kicker">Leituras em destaque</span>
        <h1 className="review-books-template__title">{title}</h1>
      </header>

      <div className="review-books-template__list">
        {slots.map((entry, index) => {
          const quoteText = entry?.quote?.trim() || 'Texto ou citacao aqui...';
          const synopsis = entry?.synopsis?.trim() || entry?.book.description?.trim() || 'Sinopse do livro...';

          return (
            <div className="review-books-card" key={entry?.id ?? `empty-${index}`}>
              <div className="review-books-card__header">
                <div className="review-books-card__cover">
                  {entry ? (
                    <StoryBookCoverImage
                      thumbnail={entry.book.thumbnail}
                      alt={`Capa do livro ${entry.book.title}`}
                    />
                  ) : (
                    <div className="review-books-card__cover-placeholder" />
                  )}
                </div>
                <div className="review-books-card__info">
                  <h2 className="review-books-card__title">{entry?.book.title || 'Titulo do livro'}</h2>
                  <span className="review-books-card__meta">
                    {(entry?.pageCountOverride ?? entry?.book.pageCount ?? 0)} paginas
                  </span>
                  <StoryStars rating={entry?.rating ?? 0} className="review-books-card__stars" />
                </div>
              </div>

              <p className="review-books-card__quote">"{quoteText}"</p>
              <p className="review-books-card__synopsis">{synopsis}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewBooksTemplate;

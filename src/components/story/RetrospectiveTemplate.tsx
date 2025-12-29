import React from 'react';
import { Book } from '../../data/mockBooks';
import StoryBookCoverImage from './StoryBookCoverImage';
import StoryStars from './StoryStars';
import './RetrospectiveTemplate.css';

export interface RetrospectiveEntry {
  id: string;
  book: Book;
  genre: string;
  rating: number;
  pageCountOverride?: number;
}

interface RetrospectiveTemplateProps {
  title: string;
  entries: RetrospectiveEntry[];
}

const MAX_ENTRIES = 4;

const RetrospectiveTemplate: React.FC<RetrospectiveTemplateProps> = ({ title, entries }) => {
  const slots = Array.from({ length: MAX_ENTRIES }, (_, index) => entries[index] ?? null);

  return (
    <div className="retrospective-template">
      <header className="retrospective-template__header">
        <span className="retrospective-template__label">Retrospectiva</span>
        <h1 className="retrospective-template__title">{title}</h1>
      </header>

      <div className="retrospective-template__list">
        {slots.map((entry, index) =>
          entry ? (
            <div className="retrospective-item" key={entry.id}>
              <div className="retrospective-item__cover">
                <StoryBookCoverImage
                  thumbnail={entry.book.thumbnail}
                  alt={`Capa do livro ${entry.book.title}`}
                />
              </div>
              <div className="retrospective-item__info">
                <h2 className="retrospective-item__title">{entry.book.title}</h2>
                <div className="retrospective-item__meta">
                  <span>{entry.genre}</span>
                  <span>{(entry.pageCountOverride ?? entry.book.pageCount ?? 0)} paginas</span>
                </div>
                <StoryStars rating={entry.rating} className="retrospective-item__stars" />
              </div>
            </div>
          ) : (
            <div className="retrospective-item retrospective-item--empty" key={`empty-${index}`}>
              <div className="retrospective-item__cover retrospective-item__cover--empty" />
              <div className="retrospective-item__info">
                <h2 className="retrospective-item__title">Adicione um livro</h2>
                <div className="retrospective-item__meta">
                  <span>Genero</span>
                  <span>Nota</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default RetrospectiveTemplate;

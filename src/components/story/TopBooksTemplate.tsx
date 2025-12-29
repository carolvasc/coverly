import React from 'react';
import { Book } from '../../data/mockBooks';
import StoryBookCoverImage from './StoryBookCoverImage';
import './TopBooksTemplate.css';

export type TopBooksTemplateType = 'top-3' | 'top-5';

export interface TopBookEntry {
  id: string;
  book: Book;
  genre: string;
  rating: number;
  quote?: string;
  pageCountOverride?: number;
}

interface TopBooksTemplateProps {
  title: string;
  entries: TopBookEntry[];
  templateType: TopBooksTemplateType;
}

const MAX_ENTRIES: Record<TopBooksTemplateType, number> = {
  'top-3': 3,
  'top-5': 5
};

const TopBooksTemplate: React.FC<TopBooksTemplateProps> = ({ title, entries, templateType }) => {
  const maxEntries = MAX_ENTRIES[templateType];
  const slots = Array.from({ length: maxEntries }, (_, index) => entries[index] ?? null);

  const rows =
    templateType === 'top-5'
      ? [[slots[0]], [slots[1], slots[2]], [slots[3], slots[4]]]
      : [[slots[0]], [slots[1], slots[2]]];

  return (
    <div className={`top-books-template top-books-template--${templateType}`}>
      <header className="top-books-template__header">
        <h1 className="top-books-template__title">{title}</h1>
      </header>

      <div className="top-books-template__grid">
        {rows.map((row, rowIndex) => (
          <div className="top-books-row" key={`row-${rowIndex}`}>
            {row.map((entry, index) => {
              const rank = rowIndex === 0 ? 1 : rowIndex === 1 ? index + 2 : index + 4;
              return entry ? (
                <div className={`top-books-card rank-${rank}`} key={entry.id}>
                  <div className="top-books-card__rank">{rank}</div>
                  <div className="top-books-card__cover">
                    <StoryBookCoverImage
                      thumbnail={entry.book.thumbnail}
                      alt={`Capa do livro ${entry.book.title}`}
                    />
                  </div>
                  <h2 className="top-books-card__title">{entry.book.title}</h2>
                </div>
              ) : (
                <div className={`top-books-card top-books-card--empty rank-${rank}`} key={`empty-${rank}`}>
                  <div className="top-books-card__rank">{rank}</div>
                  <div className="top-books-card__cover top-books-card__cover--empty" />
                  <h2 className="top-books-card__title">Adicione um livro</h2>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopBooksTemplate;

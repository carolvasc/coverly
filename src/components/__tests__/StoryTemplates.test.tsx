import React from 'react';
import { render, screen } from '@testing-library/react';
import TemplateGenerator, { TemplatePreview } from '../TemplateGenerator';
import RetrospectiveTemplate from '../story/RetrospectiveTemplate';
import ReviewBooksTemplate from '../story/ReviewBooksTemplate';
import StoryFooter from '../story/StoryFooter';
import StoryStars from '../story/StoryStars';
import StoryTemplateShell from '../story/StoryTemplateShell';
import TopBooksTemplate from '../story/TopBooksTemplate';
import { Book } from '../../data/mockBooks';

jest.mock('../story/StoryBookCoverImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} src="mock-cover.png" />,
}));

const sampleBook: Book = {
  id: 'duna',
  title: 'Duna',
  authors: ['Frank Herbert'],
  publisher: 'Ace',
  publishedDate: '1965',
  pageCount: 412,
  thumbnail: 'https://example.com/duna.png',
};

describe('story and template components', () => {
  it('renders StoryFooter and StoryTemplateShell classes', () => {
    render(
      <StoryTemplateShell templateType="classic" className="custom-shell">
        <StoryFooter text="Rodape" className="extra-footer" />
      </StoryTemplateShell>,
    );

    const footer = screen.getByText('Rodape').parentElement;

    expect(footer).toHaveClass('template-footer', 'extra-footer');
    expect(footer?.parentElement).toHaveClass('template-background', 'template-classic', 'custom-shell');
  });

  it('renders filled stars in StoryStars', () => {
    render(<StoryStars rating={3.9} maxStars={5} />);

    const filled = document.querySelectorAll('.template-star.filled');
    const empty = document.querySelectorAll('.template-star.empty');

    expect(filled).toHaveLength(3);
    expect(empty).toHaveLength(2);
  });

  it('renders RetrospectiveTemplate entries and placeholders', () => {
    render(
      <RetrospectiveTemplate
        title="Leituras 2025"
        entries={[
          {
            id: '1',
            book: sampleBook,
            genre: 'Ficção científica',
            rating: 5,
          },
        ]}
      />,
    );

    expect(screen.getByText('Leituras 2025')).toBeInTheDocument();
    expect(screen.getByText('Duna')).toBeInTheDocument();
    expect(screen.getAllByText('Adicione um livro')).toHaveLength(3);
  });

  it('renders TopBooksTemplate rankings', () => {
    render(
      <TopBooksTemplate
        title="Top do ano"
        templateType="top-3"
        entries={[
          { id: '1', book: sampleBook, genre: 'Sci-fi', rating: 5 },
        ]}
      />,
    );

    expect(screen.getByText('Top do ano')).toBeInTheDocument();
    expect(screen.getByText('Duna')).toBeInTheDocument();
    expect(screen.getAllByText('Adicione um livro')).toHaveLength(2);
  });

  it('renders ReviewBooksTemplate review content', () => {
    render(
      <ReviewBooksTemplate
        title="Avaliacoes"
        templateType="review-2"
        entries={[
          {
            id: '1',
            book: sampleBook,
            genre: 'Sci-fi',
            rating: 4,
            synopsis: 'Uma jornada épica.',
            quote: 'Resenha curta.',
          },
        ]}
      />,
    );

    expect(screen.getByText('Avaliacoes')).toBeInTheDocument();
    expect(screen.getByText('"Uma jornada épica."')).toBeInTheDocument();
    expect(screen.getByText('Resenha curta.')).toBeInTheDocument();
  });

  it('renders TemplateGenerator hidden template and TemplatePreview content', () => {
    render(
      <>
        <TemplateGenerator
          book={sampleBook}
          rating={4}
          hoursRead="8"
          favoriteQuote="Muito bom"
          readingMood="inspirado"
          templateType="review-card"
          synopsis="Resumo"
        />
        <TemplatePreview
          book={sampleBook}
          rating={4}
          hoursRead="8"
          favoriteQuote="Muito bom"
          readingMood="inspirado"
          templateType="classic"
          synopsis="Resumo"
        />
      </>,
    );

    expect(document.getElementById('story-template-review-card')).toBeInTheDocument();
    expect(screen.getAllByText('Duna').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Frank Herbert/i).length).toBeGreaterThan(0);
  });
});

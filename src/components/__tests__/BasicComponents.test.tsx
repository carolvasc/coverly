import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppHeader from '../AppHeader';
import AuthorFilter from '../AuthorFilter';
import BookCard from '../BookCard';
import SearchButton from '../SearchButton';
import SearchField from '../SearchField';
import SearchHistory from '../SearchHistory';
import StarRating from '../StarRating';
import { Book } from '../../data/mockBooks';

jest.mock('react-router-dom', () => ({
  NavLink: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }) => <a href={to}>{children}</a>,
}), { virtual: true });

const sampleBook: Book = {
  id: 'book-1',
  title: 'Clean Code',
  authors: ['Robert C. Martin', 'Another Author'],
  publisher: 'Prentice Hall',
  publishedDate: '2008',
  pageCount: 464,
};

describe('basic component coverage', () => {
  it('renders AppHeader navigation links', () => {
    render(
      <AppHeader />,
    );

    expect(screen.getByText('Coverly')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Top livros' })).toHaveAttribute('href', '/top-livros');
    expect(screen.getByRole('link', { name: 'Retrospectiva' })).toHaveAttribute('href', '/retrospectiva');
  });

  it('updates AuthorFilter input values', async () => {
    const onAuthorChange = jest.fn();

    const Harness = () => {
      const [value, setValue] = React.useState('');
      return (
        <AuthorFilter
          authorTerm={value}
          onAuthorChange={(nextValue) => {
            setValue(nextValue);
            onAuthorChange(nextValue);
          }}
        />
      );
    };

    render(<Harness />);

    await userEvent.type(screen.getByPlaceholderText('Filtrar por autor (opcional)'), 'Tolkien');

    expect(onAuthorChange).toHaveBeenLastCalledWith('Tolkien');
  });

  it('updates SearchField input values', async () => {
    const onSearchChange = jest.fn();

    const Harness = () => {
      const [value, setValue] = React.useState('');
      return (
        <SearchField
          searchTerm={value}
          onSearchChange={(nextValue) => {
            setValue(nextValue);
            onSearchChange(nextValue);
          }}
        />
      );
    };

    render(<Harness />);

    await userEvent.type(screen.getByPlaceholderText('Digite o título do livro...'), 'Duna');

    expect(onSearchChange).toHaveBeenLastCalledWith('Duna');
  });

  it('fires SearchButton callback and supports disabled state', async () => {
    const onSearchSubmit = jest.fn();

    const { rerender } = render(<SearchButton onSearchSubmit={onSearchSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearchSubmit).toHaveBeenCalledTimes(1);

    rerender(<SearchButton onSearchSubmit={onSearchSubmit} disabled />);
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it('renders SearchHistory items and actions', async () => {
    const onHistoryItemClick = jest.fn();
    const onClearHistory = jest.fn();

    render(
      <SearchHistory
        history={[
          {
            id: '1',
            query: 'O Hobbit',
            author: 'Tolkien',
            timestamp: new Date('2025-01-03T14:15:00Z').getTime(),
          },
        ]}
        onHistoryItemClick={onHistoryItemClick}
        onClearHistory={onClearHistory}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /o hobbit/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }));

    expect(onHistoryItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'O Hobbit', author: 'Tolkien' }),
    );
    expect(onClearHistory).toHaveBeenCalledTimes(1);
  });

  it('renders SearchHistory empty state', () => {
    render(<SearchHistory history={[]} onHistoryItemClick={jest.fn()} onClearHistory={jest.fn()} />);

    expect(screen.getByText(/Nenhuma busca realizada ainda/i)).toBeInTheDocument();
  });

  it('renders BookCard details', () => {
    render(<BookCard book={sampleBook} />);

    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Robert C. Martin, Another Author')).toBeInTheDocument();
    expect(screen.getByText('464')).toBeInTheDocument();
    expect(screen.getByText('Prentice Hall')).toBeInTheDocument();
    expect(screen.getByText('2008')).toBeInTheDocument();
  });

  it('lets users select a rating with StarRating', async () => {
    const onRatingChange = jest.fn();

    render(<StarRating rating={0} onRatingChange={onRatingChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Avaliar com 4 estrelas' }));

    expect(onRatingChange).toHaveBeenCalledWith(4);
    expect(screen.getByText('Clique para avaliar')).toBeInTheDocument();
  });
});

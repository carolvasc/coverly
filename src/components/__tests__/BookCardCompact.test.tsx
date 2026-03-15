import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookCardCompact from '../BookCardCompact';
import { Book } from '../../data/mockBooks';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

const sampleBook: Book = {
  id: 'hobbit',
  title: 'O Hobbit',
  authors: ['J.R.R. Tolkien'],
  publisher: 'HarperCollins',
  publishedDate: '1937',
  pageCount: 310,
  thumbnail: '',
};

describe('BookCardCompact', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    localStorage.clear();
  });

  it('stores the book in localStorage and navigates to the detail page', async () => {
    render(<BookCardCompact book={sampleBook} />);

    await userEvent.click(screen.getByRole('button'));

    expect(mockNavigate).toHaveBeenCalledWith('/book/hobbit');
    expect(JSON.parse(localStorage.getItem('searchResults') || '[]')).toEqual([sampleBook]);
    expect(screen.getByText(/Publicado em/i)).toBeInTheDocument();
  });

  it('renders a non-clickable card when clickable is false', () => {
    render(<BookCardCompact book={sampleBook} clickable={false} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByAltText('Capa do livro O Hobbit')).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'));
  });
});

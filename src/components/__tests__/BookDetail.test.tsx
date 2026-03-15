import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookDetail from '../BookDetail';
import { Book } from '../../data/mockBooks';

const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}), { virtual: true });

jest.mock('../TemplateGenerator', () => ({
  __esModule: true,
  default: ({ templateType }: { templateType: string }) => <div>template {templateType}</div>,
  TemplatePreview: ({ templateType }: { templateType: string }) => <div>preview {templateType}</div>,
}));

const sampleBook: Book = {
  id: 'book-42',
  title: 'A Sociedade do Anel',
  authors: ['J.R.R. Tolkien'],
  publisher: 'Allen & Unwin',
  publishedDate: '1954',
  pageCount: 423,
};

describe('BookDetail', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseParams.mockReset();
    localStorage.clear();
  });

  it('shows an error when no book id is provided', async () => {
    mockUseParams.mockReturnValue({});

    render(<BookDetail />);

    expect(await screen.findByText('ID do livro não fornecido')).toBeInTheDocument();
  });

  it('loads a cached book and allows navigation back', async () => {
    mockUseParams.mockReturnValue({ id: 'book-42' });
    localStorage.setItem('searchResults', JSON.stringify([sampleBook]));

    render(<BookDetail />);

    expect(await screen.findByText('A Sociedade do Anel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gerar template para story/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Avaliar com 5 estrelas' }));
    expect(screen.getByRole('button', { name: /Gerar template para story/i })).toBeEnabled();

    await userEvent.click(screen.getAllByRole('button', { name: /Voltar para a biblioteca/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

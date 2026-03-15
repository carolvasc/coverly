import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopBooksPage from '../TopBooksPage';
import { booksApi } from '../../services/booksApi';

jest.mock('../../services/booksApi', () => ({
  booksApi: {
    searchBooksMultiple: jest.fn(),
  },
}));

jest.mock('../story/StoryBookCoverImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} src="cover.png" />,
}));

jest.mock('../story/TopBooksTemplate', () => ({
  __esModule: true,
  default: ({ entries, title }: { entries: Array<{ book: { title: string } }>; title: string }) => (
    <div>
      <span>{title}</span>
      <span>{entries.map((entry) => entry.book.title).join(', ')}</span>
    </div>
  ),
}));

jest.mock('../story/ReviewBooksTemplate', () => ({
  __esModule: true,
  default: ({ entries, title }: { entries: Array<{ book: { title: string } }>; title: string }) => (
    <div>
      <span>{title}</span>
      <span>{entries.map((entry) => entry.book.title).join(', ')}</span>
    </div>
  ),
}));

const mockedBooksApi = booksApi as jest.Mocked<typeof booksApi>;

describe('TopBooksPage', () => {
  beforeEach(() => {
    mockedBooksApi.searchBooksMultiple.mockReset();
  });

  it('searches, selects and adds a ranked book', async () => {
    mockedBooksApi.searchBooksMultiple.mockResolvedValueOnce({
      totalItems: 1,
      items: [
        {
          id: '1',
          title: 'Neuromancer',
          authors: ['William Gibson'],
          publisher: 'Ace',
          publishedDate: '1984',
          pageCount: 271,
          categories: ['Science Fiction'],
          thumbnail: 'https://example.com/neuromancer.png',
        },
      ],
    });

    render(<TopBooksPage />);

    await userEvent.type(screen.getByPlaceholderText('Digite o título do livro...'), 'Neuromancer');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(mockedBooksApi.searchBooksMultiple).toHaveBeenCalledWith('Neuromancer'));

    const resultTitle = await screen.findByText('Neuromancer');
    await userEvent.click(resultTitle.closest('button') as HTMLButtonElement);
    await userEvent.click(screen.getByRole('button', { name: /Avaliar com 4 estrelas/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findAllByText('Neuromancer')).not.toHaveLength(0);
    expect(screen.getByText(/1\/3/i)).toBeInTheDocument();
  });
});

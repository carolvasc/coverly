import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RestroctivePage from '../RestroctivePage';
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

jest.mock('../story/RetrospectiveTemplate', () => ({
  __esModule: true,
  default: ({ entries, title }: { entries: Array<{ book: { title: string } }>; title: string }) => (
    <div>
      <span>{title}</span>
      <span>{entries.map((entry) => entry.book.title).join(', ')}</span>
    </div>
  ),
}));

const mockedBooksApi = booksApi as jest.Mocked<typeof booksApi>;

describe('RestroctivePage', () => {
  beforeEach(() => {
    mockedBooksApi.searchBooksMultiple.mockReset();
  });

  it('searches, selects and adds a book to the retrospective list', async () => {
    mockedBooksApi.searchBooksMultiple.mockResolvedValueOnce({
      totalItems: 1,
      items: [
        {
          id: '1',
          title: 'Duna',
          authors: ['Frank Herbert'],
          publisher: 'Ace',
          publishedDate: '1965',
          pageCount: 412,
          categories: ['Science Fiction'],
          thumbnail: 'https://example.com/duna.png',
        },
      ],
    });

    render(<RestroctivePage />);

    await userEvent.type(screen.getByPlaceholderText('Digite o título do livro...'), 'Duna');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(mockedBooksApi.searchBooksMultiple).toHaveBeenCalledWith('Duna'));

    const resultTitle = await screen.findByText('Duna');
    await userEvent.click(resultTitle.closest('button') as HTMLButtonElement);
    await userEvent.click(screen.getByRole('button', { name: /Avaliar com 5 estrelas/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findAllByText('Duna')).not.toHaveLength(0);
    expect(screen.getByText(/1\/4/i)).toBeInTheDocument();
  });
});

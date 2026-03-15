import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StoryBookCoverImage, { DEFAULT_COVER_PLACEHOLDER, sanitizeThumbnailUrl } from '../story/StoryBookCoverImage';
import { booksApi } from '../../services/booksApi';

jest.mock('../../services/booksApi', () => ({
  booksApi: {
    fetchCoverDataUrl: jest.fn(),
  },
}));

const mockedBooksApi = booksApi as jest.Mocked<typeof booksApi>;

describe('StoryBookCoverImage', () => {
  beforeEach(() => {
    mockedBooksApi.fetchCoverDataUrl.mockReset();
  });

  it('normalizes Google Books thumbnail urls', () => {
    expect(
      sanitizeThumbnailUrl('http://books.google.com/books/content?id=123&zoom=1&edge=curl'),
    ).toBe('https://books.google.com/books/content?id=123&zoom=0');
  });

  it('uses the placeholder when no thumbnail is provided', () => {
    render(<StoryBookCoverImage alt="Sem capa" />);

    expect(screen.getByAltText('Sem capa')).toHaveAttribute('src', DEFAULT_COVER_PLACEHOLDER);
  });

  it('fetches a safe data url for remote covers', async () => {
    mockedBooksApi.fetchCoverDataUrl.mockResolvedValueOnce('data:image/png;base64,abc123');

    render(
      <StoryBookCoverImage
        alt="Capa"
        thumbnail="https://books.google.com/books/content?id=123&zoom=1"
      />,
    );

    await waitFor(() => {
      expect(mockedBooksApi.fetchCoverDataUrl).toHaveBeenCalledWith(
        'https://books.google.com/books/content?id=123&zoom=0',
      );
    });

    await waitFor(() => {
      expect(screen.getByAltText('Capa')).toHaveAttribute('src', 'data:image/png;base64,abc123');
    });
  });
});

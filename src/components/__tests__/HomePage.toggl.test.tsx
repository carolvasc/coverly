import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../HomePage';
import { booksApi } from '../../services/booksApi';
import { togglApi } from '../../services/togglApi';

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: jest.fn(),
  }),
  { virtual: true },
);

jest.mock('../../services/booksApi', () => ({
  booksApi: {
    searchBooksMultiple: jest.fn(),
  },
}));

jest.mock('../../services/togglApi', () => ({
  togglApi: {
    getBookHours: jest.fn(),
  },
}));

const mockedBooksApi = booksApi as jest.Mocked<typeof booksApi>;
const mockedTogglApi = togglApi as jest.Mocked<typeof togglApi>;

describe('HomePage Toggl Track integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enables the Toggl switch and shows tracked hours using the last searched title', async () => {
    mockedBooksApi.searchBooksMultiple.mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    mockedTogglApi.getBookHours.mockResolvedValue(2.5);

    render(<HomePage />);

    const searchInput = screen.getByPlaceholderText(/digite o/i);
    await userEvent.type(searchInput, 'O Hobbit');

    const searchButton = screen.getByRole('button', { name: /buscar/i });
    await userEvent.click(searchButton);

    await waitFor(() => expect(mockedBooksApi.searchBooksMultiple).toHaveBeenCalled());

    const togglSwitch = screen.getByLabelText(/toggl track/i);
    await userEvent.click(togglSwitch);

    await waitFor(() => expect(mockedTogglApi.getBookHours).toHaveBeenCalledWith('O Hobbit'));

    const hoursMessage = await screen.findByText(/Tempo registrado:/i);
    expect(hoursMessage).toHaveTextContent('Tempo registrado: 2,5 horas.');
  });
});

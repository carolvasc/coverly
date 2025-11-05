import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Route: ({ element }: { element: React.ReactNode }) => <>{element}</>,
    useNavigate: () => jest.fn(),
    useParams: () => ({}),
  }),
  { virtual: true },
);

test('renderiza a home do Coverly', () => {
  render(<App />);
  const titleElement = screen.getByText(/coverly/i);
  expect(titleElement).toBeInTheDocument();
});

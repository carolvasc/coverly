// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock(
  'axios',
  () => {
    const mockAxios: any = {
      get: jest.fn(),
      post: jest.fn(),
      create: jest.fn(),
      isAxiosError: jest.fn(() => false),
    };

    mockAxios.create.mockReturnValue(mockAxios);
    return mockAxios;
  },
  { virtual: true },
);

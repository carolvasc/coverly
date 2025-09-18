import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export interface Book {
  id: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  pageCount: number;
  description?: string;
  thumbnail?: string;
}

export interface BookSearchResponse {
  totalItems: number;
  items: Book[];
}

export class BooksApi {
  private static instance: BooksApi;
  
  static getInstance(): BooksApi {
    if (!BooksApi.instance) {
      BooksApi.instance = new BooksApi();
    }
    return BooksApi.instance;
  }

  async searchBooks(query: string): Promise<BookSearchResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/search`, {
        params: { q: query },
        timeout: 10000,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid search query');
        }
        if (error.response && error.response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please try again.');
        }
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Unable to connect to server. Please check if the API is running.');
        }
      }
      
      throw new Error('Failed to search books. Please try again.');
    }
  }
}

export const booksApi = BooksApi.getInstance();
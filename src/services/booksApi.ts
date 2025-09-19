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

  async searchBooks(title: string, author?: string): Promise<BookSearchResponse> {
    try {
      let query = title;
      if (author && author.trim()) {
        query = `intitle:"${title}" inauthor:${author}`;
      }
      
      const response = await axios.get(`${API_BASE_URL}/books/search`, {
        params: { q: query },
        timeout: 10000,
      });
      
      let result = response.data;
      
      if (author && author.trim()) {
        if (result.items && result.items.length > 0) {
          const filteredItems = result.items.filter((item: any) => {
            const volumeInfo = item.volumeInfo || item;
            const authors = volumeInfo.authors || [];
            
            if (authors.length === 0) {
              return false;
            }
            
            return authors.some((authorName: string) => 
              authorName.toLowerCase().includes(author.toLowerCase())
            );
          });
          
          result = {
            totalItems: filteredItems.length,
            items: filteredItems.slice(0, 1)
          };
        } else {
          result = {
            totalItems: 0,
            items: []
          };
        }
      } else {
        if (result.items && result.items.length > 0) {
          result = {
            totalItems: result.totalItems,
            items: result.items.slice(0, 1)
          };
        }
      }
      
      return result;
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

  async searchBooksMultiple(title: string, author?: string): Promise<BookSearchResponse> {
    try {
      let query = title;
      if (author && author.trim()) {
        query = `intitle:"${title}" inauthor:${author}`;
      }
      
      const response = await axios.get(`${API_BASE_URL}/books/search`, {
        params: { q: query },
        timeout: 10000,
      });
      
      let result = response.data;
      
      if (author && author.trim()) {
        if (result.items && result.items.length > 0) {
          const filteredItems = result.items.filter((item: any) => {
            const volumeInfo = item.volumeInfo || item;
            const authors = volumeInfo.authors || [];
            
            if (authors.length === 0) {
              return false;
            }
            
            return authors.some((authorName: string) => 
              authorName.toLowerCase().includes(author.toLowerCase())
            );
          });
          
          result = {
            totalItems: filteredItems.length,
            items: filteredItems.slice(0, 10) 
          };
        } else {
          result = {
            totalItems: 0,
            items: []
          };
        }
      } else {
        if (result.items && result.items.length > 0) {
          result = {
            totalItems: result.totalItems,
            items: result.items.slice(0, 10)
          };
        }
      }
      
      return result;
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
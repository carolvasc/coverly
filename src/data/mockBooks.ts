export interface Book {
  id: number;
  title: string;
  totalPages: number;
  author: string;
  publisher: string;
  releaseYear: number;
}

export const mockBooks: Book[] = [
  {
    id: 1,
    title: "The Great Gatsby",
    totalPages: 180,
    author: "F. Scott Fitzgerald",
    publisher: "Scribner",
    releaseYear: 1925
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    totalPages: 281,
    author: "Harper Lee",
    publisher: "J.B. Lippincott & Co.",
    releaseYear: 1960
  },
  {
    id: 3,
    title: "1984",
    totalPages: 328,
    author: "George Orwell",
    publisher: "Secker & Warburg",
    releaseYear: 1949
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    totalPages: 432,
    author: "Jane Austen",
    publisher: "T. Egerton",
    releaseYear: 1813
  },
  {
    id: 5,
    title: "The Catcher in the Rye",
    totalPages: 277,
    author: "J.D. Salinger",
    publisher: "Little, Brown and Company",
    releaseYear: 1951
  }
];
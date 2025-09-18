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

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    pageCount: 180,
    authors: ["F. Scott Fitzgerald"],
    publisher: "Scribner",
    publishedDate: "1925"
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    pageCount: 281,
    authors: ["Harper Lee"],
    publisher: "J.B. Lippincott & Co.",
    publishedDate: "1960"
  },
  {
    id: "3",
    title: "1984",
    pageCount: 328,
    authors: ["George Orwell"],
    publisher: "Secker & Warburg",
    publishedDate: "1949"
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    pageCount: 432,
    authors: ["Jane Austen"],
    publisher: "T. Egerton",
    publishedDate: "1813"
  },
  {
    id: "5",
    title: "The Catcher in the Rye",
    pageCount: 277,
    authors: ["J.D. Salinger"],
    publisher: "Little, Brown and Company",
    publishedDate: "1951"
  }
];
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import HomePage from './components/HomePage';
import BookDetail from './components/BookDetail';
import RestroctivePage from './components/RestroctivePage';
import TopBooksPage from './components/TopBooksPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <AppHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/retrospectiva" element={<RestroctivePage />} />
          <Route path="/top-livros" element={<TopBooksPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

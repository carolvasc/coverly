import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import HomePage from './components/HomePage';
import BookDetail from './components/BookDetail';
import RetrospectivaPage from './components/RetrospectivaPage';
import TopLivrosPage from './components/TopLivrosPage';
import { applyPaletteToRoot, getPaletteById, loadPaletteId } from './utils/palette';
import './App.css';

function App() {
  useEffect(() => {
    const paletteId = loadPaletteId();
    const palette = getPaletteById(paletteId);
    applyPaletteToRoot(palette);
  }, []);

  return (
    <div className="App">
      <Router>
        <AppHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/retrospectiva" element={<RetrospectivaPage />} />
          <Route path="/top-livros" element={<TopLivrosPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

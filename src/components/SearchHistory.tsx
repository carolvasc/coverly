import React from 'react';
import './SearchHistory.css';

export interface SearchHistoryItem {
  id: string;
  query: string;
  author: string;
  timestamp: number;
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onHistoryItemClick: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onHistoryItemClick, onClearHistory }) => {
  if (history.length === 0) {
    return (
      <div className='search-history'>
        <h3 className='search-history-title'>Histórico de Buscas ✍️</h3>
        <div className='search-history-empty'>
          <p>Nenhuma busca realizada ainda. Que tal começar uma descoberta agora?</p>
        </div>
      </div>
    );
  }

  return (
    <div className='search-history'>
      <div className='search-history-header'>
        <h3 className='search-history-title'>Histórico de Buscas ✍️</h3>
        <button className='clear-history-btn' onClick={onClearHistory}>
          Limpar tudo
        </button>
      </div>
      <div className='search-history-list'>
        {history.map((item) => (
          <button
            key={item.id}
            type='button'
            className='search-history-item'
            onClick={() => onHistoryItemClick(item)}
          >
            <div className='search-history-query'>
              <strong>{item.query}</strong>
              {item.author && <span className='search-history-author'> por {item.author}</span>}
            </div>
            <div className='search-history-time'>
              {new Date(item.timestamp).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;

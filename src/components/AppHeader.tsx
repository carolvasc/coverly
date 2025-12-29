import React from 'react';
import { NavLink } from 'react-router-dom';
import './AppHeader.css';

const AppHeader: React.FC = () => {
  const buildNavClass = ({ isActive }: { isActive: boolean }) =>
    'app-nav__link' + (isActive ? ' app-nav__link--active' : '');

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-brand" aria-label="Coverly">
          <span className="app-brand__mark" aria-hidden="true">
            *
          </span>
          <span className="app-brand__name">Coverly</span>
        </div>
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/" end className={buildNavClass}>
            Inicio
          </NavLink>
          <NavLink to="/top-livros" className={buildNavClass}>
            Top livros
          </NavLink>
          <NavLink to="/retrospectiva" className={buildNavClass}>
            Retrospectiva
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;

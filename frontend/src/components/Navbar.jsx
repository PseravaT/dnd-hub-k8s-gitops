import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar navbar-expand-lg rpg-navbar py-3 sticky-top">
      <div className="container">
        <a
          href="#home"
          className="navbar-brand d-flex align-items-center gap-2 rpg-brand"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(isAuthenticated ? 'dashboard' : 'login');
          }}
        >
          <i className="bi bi-shield-shaded text-gold fs-3"></i>
          <span>DnD Hub</span>
          <span className="badge bg-dark border border-warning text-gold fs-6 ms-2 font-rpg">
            5e / 5.5e
          </span>
          <span className="badge bg-success text-white border border-light fs-7 ms-1 font-monospace" title="Versão V2 com suporte a tema claro e rollout">
            v2
          </span>
        </a>

        <div className="d-flex align-items-center gap-3">
          {/* Botão de Alternância de Tema Noturno/Claro (V2) */}
          <button
            type="button"
            className="btn btn-sm btn-dnd-outline d-flex align-items-center gap-1"
            onClick={toggleTheme}
            id="theme-toggle-button"
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Noturno'}
          >
            {theme === 'dark' ? (
              <>
                <i className="bi bi-sun-fill text-warning"></i>
                <span className="d-none d-sm-inline ms-1">Modo Claro</span>
              </>
            ) : (
              <>
                <i className="bi bi-moon-stars-fill text-primary"></i>
                <span className="d-none d-sm-inline ms-1">Modo Noturno</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-3">
              <span className="text-secondary d-none d-md-inline font-rpg">
                Aventureiro: <strong className="text-gold">{user?.email || 'Autenticado'}</strong>
              </span>

              <button
                type="button"
                className={`btn btn-sm ${currentView === 'dashboard' ? 'btn-dnd-gold' : 'btn-dnd-outline'}`}
                onClick={() => onNavigate('dashboard')}
              >
                <i className="bi bi-compass me-1"></i> Taverna
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  logout();
                  onNavigate('login');
                }}
                title="Encerrar sessão"
              >
                <i className="bi bi-box-arrow-right me-1"></i> Sair
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className={`btn btn-sm ${currentView === 'login' ? 'btn-dnd-gold' : 'btn-dnd-outline'}`}
                onClick={() => onNavigate('login')}
              >
                <i className="bi bi-door-open me-1"></i> Entrar
              </button>

              <button
                type="button"
                className={`btn btn-sm ${currentView === 'register' ? 'btn-dnd-crimson' : 'btn-dnd-outline'}`}
                onClick={() => onNavigate('register')}
              >
                <i className="bi bi-person-plus me-1"></i> Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

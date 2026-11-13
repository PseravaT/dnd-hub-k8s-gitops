import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { gsap, useGSAP, MOTION } from '../lib/motion';

export const Navbar = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(navRef.current, {
          y: -12,
          autoAlpha: 0,
          duration: MOTION.durationBase,
          ease: MOTION.easeOut,
          clearProps: 'transform,opacity,visibility',
        });
      });
      return () => mm.revert();
    },
    { scope: navRef }
  );

  return (
    <nav
      ref={navRef}
      aria-label="Navegação Principal"
      className={`navbar navbar-expand-lg rpg-navbar sticky-top ${scrolled ? 'scrolled py-2' : 'py-3'}`}
    >
      <div className="container">
        <a
          href="#home"
          className="navbar-brand d-flex align-items-center gap-2 rpg-brand"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(isAuthenticated ? 'dashboard' : 'login');
          }}
        >
          <i className="bi bi-shield-shaded text-gold fs-3" aria-hidden="true"></i>
          <span>DnD Hub</span>
          <span className="badge bg-dark border border-warning text-gold fs-6 ms-1 font-rpg d-none d-sm-inline">
            5e / 5.5e
          </span>
          <span
            className="badge bg-success bg-opacity-75 text-white border border-light border-opacity-50 ms-1 font-monospace"
            style={{ fontSize: '0.7rem' }}
            title="Versão 3.0 — Command Center React + GSAP + Spring Microsserviços"
          >
            v3
          </span>
        </a>

        <div className="d-flex align-items-center gap-2 gap-md-3 flex-wrap justify-content-end">
          <button
            type="button"
            className="btn btn-sm btn-dnd-outline d-flex align-items-center gap-1 px-3"
            onClick={toggleTheme}
            id="theme-toggle-button"
            aria-label={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Noturno'}
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Noturno'}
          >
            {theme === 'dark' ? (
              <>
                <i className="bi bi-sun-fill text-warning" aria-hidden="true"></i>
                <span className="d-none d-sm-inline ms-1">Modo Claro</span>
              </>
            ) : (
              <>
                <i className="bi bi-moon-stars-fill text-primary" aria-hidden="true"></i>
                <span className="d-none d-sm-inline ms-1">Modo Noturno</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-2 gap-md-3">
              <span className="text-secondary d-none d-lg-inline-flex align-items-center gap-2 font-rpg small">
                <span
                  className="rounded-circle bg-success d-inline-block"
                  style={{ width: '8px', height: '8px' }}
                  title="Sessão JWT Ativa"
                ></span>
                <span>
                  Aventureiro: <strong className="text-gold">{user?.email || 'Autenticado'}</strong>
                </span>
              </span>

              <button
                type="button"
                className={`btn btn-sm px-3 ${currentView === 'dashboard' ? 'btn-dnd-gold' : 'btn-dnd-outline'}`}
                onClick={() => onNavigate('dashboard')}
              >
                <i className="bi bi-compass me-1" aria-hidden="true"></i> Taverna
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger px-3"
                style={{ minHeight: '40px' }}
                onClick={() => {
                  logout();
                  onNavigate('login');
                }}
                aria-label="Sair da conta"
                title="Encerrar sessão"
              >
                <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i> Sair
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className={`btn btn-sm px-3 ${currentView === 'login' ? 'btn-dnd-gold' : 'btn-dnd-outline'}`}
                onClick={() => onNavigate('login')}
              >
                <i className="bi bi-door-open me-1" aria-hidden="true"></i> Entrar
              </button>

              <button
                type="button"
                className={`btn btn-sm px-3 ${currentView === 'register' ? 'btn-dnd-crimson' : 'btn-dnd-outline'}`}
                onClick={() => onNavigate('register')}
              >
                <i className="bi bi-person-plus me-1" aria-hidden="true"></i> Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

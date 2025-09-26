import React, { useState } from 'react';

const Header = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <nav className="navbar is-primary is-fixed-top" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item" href="#">
            <span className="title is-4 has-text-white">FinViz</span>
          </a>

          <a 
            role="button" 
            className={`navbar-burger burger ${isActive ? 'is-active' : ''}`}
            aria-label="menu" 
            aria-expanded="false" 
            onClick={() => setIsActive(!isActive)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
          <div className="navbar-start">
            <a 
              className="navbar-item" 
              href="#graphiques"
              onClick={() => setIsActive(false)}
            >
              Graphiques
            </a>

            <a 
              className="navbar-item" 
              href="#alertes"
              onClick={() => setIsActive(false)}
            >
              Alertes
            </a>

            <a 
              className="navbar-item" 
              href="#previsions"
              onClick={() => setIsActive(false)}
            >
              Prévisions
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
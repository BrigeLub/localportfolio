
import React from 'react';
import {Link} from 'react-router-dom';
import './Header.css'; // For styling the header

function Header() {
    return (
      <header className="header">
        <div className="header__logo">
          <Link to="/">My Portfolio</Link>
        </div>
        <nav className="header__nav">
          <Link to="/about">About</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>
    );
  }

export default Header;

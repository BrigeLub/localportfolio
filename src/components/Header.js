
import React from 'react';
import './Header.css'; // For styling the header

function Header() {
  return (
    <header className="header">
      <div className="header__logo">My Portfolio</div>
      <nav className="header__nav">
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

export default Header;

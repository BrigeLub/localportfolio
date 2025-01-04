import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"; // For styling the header

function Header() {
  return (
    <header className="header">
      <div className="header__logo"></div>
      <nav className="header__nav">
        <Link to="/about">about</Link>
        <Link to="/projects">projects</Link>
        <Link to="/contact">contact</Link>
      </nav>
    </header>
  );
}

export default Header;

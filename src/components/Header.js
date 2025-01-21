import React from "react";
// import { Link } from "react-router-dom";
import "./Header.css"; // For styling the header
import ContactModal from "./ContactModal";

function Header() {
  const openModal = () => {
    const modal = document.getElementById("modal");
    modal?.showModal();
  };

  const closeModal = () => {
    const modal = document.getElementById("modal");
    modal?.close();
  };

  const handleOutsideClick = (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
      closeModal();
    }
  };
  return (
    <header className="header">
      <div className="header__logo"></div>
      <nav className="header__nav">
        {/* <Link to="/about">about</Link>
        <Link to="/projects">projects</Link> */}

        <div>
          {/* Modal */}
          <dialog id="modal" className="modal" onClick={handleOutsideClick}>
            <ContactModal />
          </dialog>

          {/* Open Modal Button */}
          <button onClick={openModal} className="modal-open">
            Contact
          </button>
        </div>

        {/* <Link to="/contact">contact</Link> */}
      </nav>
    </header>
  );
}

export default Header;

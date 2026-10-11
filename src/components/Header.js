"use client";

import React from "react";
import Link from "next/link";
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
        <Link href="/">home</Link>
        <Link href="/gallery">gallery</Link>

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
      </nav>
    </header>
  );
}

export default Header;

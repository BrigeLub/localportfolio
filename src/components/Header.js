"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Header.css"; // For styling the header
import ContactModal from "./ContactModal";

function Header() {
  const pathname = usePathname();

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
      <div className="header__logo">
        <Link href="/">Brigitte Lubker</Link>
      </div>
      <nav className="header__nav">
        <Link href="/gallery" aria-current={pathname === "/gallery" ? "page" : undefined}>
          gallery
        </Link>

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

import React from "react";
import "./ContactModal.css";

function ContactModal() {
  return (
    <div className="ContactSheet">
      <div className="modal-content">
        <h2>Let's Get in Touch!</h2>

        <p>
          <a href="mailto:brigitte.lubker@gmail.com">brigitte.lubker@gmail.com</a>
        </p>
        <p>
          <a href="tel:+16102357662">(610) 235-7662</a>
        </p>
        <p>Philadelphia, PA</p>
      </div>
    </div>
  );
}
export default ContactModal;

import React from "react";
import "./HoverCard.css";

function HoverCard({ image, title, description, link }) {
  return (
    <a href={link} className="HoverCard">
      <div className="HoverCard-content">
        <div className="HoverCard-image">
          <img src={image} alt={title} />
        </div>
        <div className="HoverCard-info">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </a>
  );
}

export default HoverCard;

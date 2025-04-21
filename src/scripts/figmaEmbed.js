import React, { useState, useEffect } from "react";
import "./figmaEmbed.css";

function FigmaEmbed({ title, embedUrl, imageUrl, figmaLink }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="figma-embed">
      {isMobile ? (
        <a href={figmaLink} target="_blank" rel="noopener noreferrer">
          <img
            src={imageUrl}
            alt={`${title} preview`}
            className="figma-preview"
          />
          <div className="iframe-title">{title}</div>
        </a>
      ) : (
        <>
          <iframe title={title} src={embedUrl} allowFullScreen></iframe>
          <div className="iframe-title">{title}</div>
        </>
      )}
    </div>
  );
}

export default FigmaEmbed;

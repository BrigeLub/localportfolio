"use client";

import React, { useState, useEffect } from "react";
import "./FigmaEmbed.css";

// The preview image shows straight away; on bigger screens the live Figma
// embed (a few MB) loads on top of it and fades in once it's ready. Phones
// only ever get the image, linking out to Figma.
function FigmaEmbed({ title, embedUrl, imageUrl, figmaLink }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setShowEmbed(window.innerWidth > 600);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="figma-embed">
      <div className="figma-frame">
        <a href={figmaLink} target="_blank" rel="noopener noreferrer">
          <img
            src={imageUrl.src ?? imageUrl}
            alt={`${title} preview`}
            className="figma-preview"
          />
        </a>
        {showEmbed && (
          <iframe
            title={title}
            src={embedUrl}
            loading="lazy"
            allowFullScreen
            onLoad={() => setEmbedLoaded(true)}
            className={embedLoaded ? "is-loaded" : undefined}
          ></iframe>
        )}
      </div>
      <a href={figmaLink} target="_blank" rel="noopener noreferrer" className="iframe-title">
        {title}
      </a>
    </div>
  );
}

export default FigmaEmbed;

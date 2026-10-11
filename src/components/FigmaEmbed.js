"use client";

import React, { useState, useEffect } from "react";
import "./FigmaEmbed.css";

// Shows the preview image, and only loads the live Figma embed (a few MB, and
// it grabs the scroll wheel) when someone clicks to explore it. Loading it
// automatically swapped each preview for Figma's blank loading screen while
// scrolling past. Phones get the image, linking out to Figma.
function FigmaEmbed({ title, embedUrl, imageUrl, figmaLink }) {
  const [canEmbed, setCanEmbed] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setCanEmbed(window.innerWidth > 600);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const preview = (
    <img
      src={imageUrl.src ?? imageUrl}
      alt={`${title} preview`}
      className="figma-preview"
    />
  );

  return (
    <div className="figma-embed">
      <div className="figma-frame">
        {canEmbed && active ? (
          <iframe title={title} src={embedUrl} allowFullScreen></iframe>
        ) : canEmbed ? (
          <button className="figma-poster" onClick={() => setActive(true)}>
            {preview}
            <span className="figma-poster__action">explore design</span>
          </button>
        ) : (
          <a href={figmaLink} target="_blank" rel="noopener noreferrer">
            {preview}
          </a>
        )}
      </div>
      <a href={figmaLink} target="_blank" rel="noopener noreferrer" className="iframe-title">
        {title}
      </a>
    </div>
  );
}

export default FigmaEmbed;

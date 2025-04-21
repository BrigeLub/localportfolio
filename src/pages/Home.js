import React from "react";
import Header from "../components/Header";
// import HoverCard from "../components/HoverCard";
// import cardData from "../scripts/cardData";
import "./Home.css";

function Home() {
  return (
    <>
      <Header />
      <div className="contents">
        <div className="namePlate">
          <div className="circle"></div>
          <div className="name">
            <h1>Brigitte Lubker</h1>
            <h2>UI/UX Developer</h2>
            <h2>
              <a
                href="https://www.artstation.com/brigittelub"
                target="_blank"
                rel="noopener noreferrer"
              >
                Find me on ARTSTATION
              </a>
            </h2>
          </div>
        </div>

        <h1
          style={{
            textTransform: "uppercase",
            fontFamily: "var(--header-font)",
          }}
        >
          WEB DESIGNS
        </h1>

        {/* <div className="container">
          {cardData.map((item, index) => (
            <HoverCard
              key={index}
              image={item.image}
              title={item.title}
              description={item.description}
              link={item.link}
            />
          ))}
        </div> */}

        <div className="iframe-grid">
          <div className="iframe-item">
            <iframe
              title="VW Site Redesign"
              src="https://embed.figma.com/design/1tsxs8yLoE4q68WDrbn0VT/IDM-211-001-bgl25-final?node-id=0-1&embed-host=share"
              allowFullScreen
            ></iframe>
            <div className="iframe-title">VW Site Redesign</div>
          </div>

          <div className="iframe-item">
            <iframe
              title="Personal Site"
              src="https://embed.figma.com/design/irSdJUvWfJBc56Ij1Lq1Kp/APersonalSite?node-id=0-1&embed-host=share"
              allowFullScreen
            ></iframe>
            <div className="iframe-title">A Personal Site Design</div>
          </div>

          <div className="iframe-item">
            <iframe
              title="Food Site"
              src="https://embed.figma.com/design/NvoX3DClY0r1KWZ68lKPPc/IDM-211-001-bgl25-design02--Copy-?node-id=0-1&embed-host=share"
              allowFullScreen
            ></iframe>
            <div className="iframe-title">Food Site</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

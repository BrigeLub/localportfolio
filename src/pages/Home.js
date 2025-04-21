import React from "react";
import Header from "../components/Header";
// import HoverCard from "../components/HoverCard";
// import cardData from "../scripts/cardData";
import FigmaEmbed from "../scripts/figmaEmbed";
import "./Home.css";
import VW from "../images/VW.jpg";
import JohnDoe from "../images/JohnDoe.jpg";
import Food from "../images/FoodSite.jpg";
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
            <FigmaEmbed
              title="VW Site Redesign"
              embedUrl="https://embed.figma.com/design/1tsxs8yLoE4q68WDrbn0VT/IDM-211-001-bgl25-final?node-id=0-1&embed-host=share"
              imageUrl={VW}
              figmaLink="https://www.figma.com/design/1tsxs8yLoE4q68WDrbn0VT/IDM-211-001-bgl25-final?node-id=0-1&t=WFhWiTt5mflkF4vV-1"
            />
          </div>
          <div className="iframe-item">
            <FigmaEmbed
              title="Personal Site"
              embedUrl="https://embed.figma.com/design/irSdJUvWfJBc56Ij1Lq1Kp/APersonalSite?node-id=0-1&embed-host=share"
              imageUrl={JohnDoe}
              figmaLink="https://www.figma.com/design/irSdJUvWfJBc56Ij1Lq1Kp/APersonalSite?node-id=0-1&t=fI1lVqYAgabRkUy6-1"
            />
          </div>
          <div className="iframe-item">
            <FigmaEmbed
              title="Food Website"
              embedUrl="https://embed.figma.com/design/NvoX3DClY0r1KWZ68lKPPc/IDM-211-001-bgl25-design02--Copy-?node-id=0-1&embed-host=share"
              imageUrl={Food}
              figmaLink="https://www.figma.com/design/NvoX3DClY0r1KWZ68lKPPc/IDM-211-001-bgl25-design02--Copy-?node-id=0-1&t=J5VNaTljy7lFoHMG-1"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

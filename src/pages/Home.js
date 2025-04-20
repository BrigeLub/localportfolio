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
          <div className="name">
            <h1>Brigitte Lubker</h1>
            <h2> UI/UX Developer</h2>
          </div>
          <div className="circle"></div>
        </div>
        <h3
          style={{
            textTransform: "uppercase",
            fontFamily: "var(--header-font)",
            fontSize: "3rem",
          }}
        >
          WEB DESIGNS
        </h3>
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
        <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/design/irSdJUvWfJBc56Ij1Lq1Kp/Untitled?node-id=0-1&embed-host=share" allowfullscreen></iframe>
        <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/design/1tsxs8yLoE4q68WDrbn0VT/IDM-211-001-bgl25-final?node-id=2-180&embed-host=share" allowfullscreen></iframe>
      </div>
    </>
  );
}

export default Home;

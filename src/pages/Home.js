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
        <iframe
          src="https://widgets.sociablekit.com/linkedin-profile-posts/iframe/25513055"
          title="LinkedIn Profile Activity"
          width="100%"
          height="1000"
        ></iframe>
        <iframe " width="800" height="450" src="https://embed.figma.com/design/1tsxs8yLoE4q68WDrbn0VT/IDM-211-001-bgl25-final?node-id=2-180&embed-host=share" allowfullscreen></iframe>
      </div>
    </>
  );
}

export default Home;

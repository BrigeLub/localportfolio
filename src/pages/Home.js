import React from "react";
import Header from "../components/Header";
import HoverCard from "../components/HoverCard";
import cardData from "../scripts/cardData";
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
        <div className="container">
          {cardData.map((item, index) => (
            <HoverCard
              key={index}
              image={item.image}
              title={item.title}
              description={item.description}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;

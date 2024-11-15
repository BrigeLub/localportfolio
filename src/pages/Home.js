import React from "react";
import Header from "../components/Header";
import HoverCard from "../components/HoverCard";
import cardData from "../scripts/cardData";
import "./Home.css";

function Home() {
  return (
    <>
      <Header />
      <h1>Welcome to My Portfolio</h1>
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
    </>
  );
}

export default Home;

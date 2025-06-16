import React from "react";
import Hero from "../Components/Hero/Hero";
import Popular from "../Components/Popular/Popular";
import Offers from "../Components/Offers/Offers";
import NewProducts from "../Components/NewProducts/NewProducts";
import NewsLetter from "../Components/NewsLetter/NewsLetter";
import Partners from "../Components/Partners/Partners";
import Video from "../Components/Videos/Video";
import AboutCompany from "../Components/AboutCompany/AboutCompany";
import Ceo from "../Components/CEO/Ceo";

const Home = () => {
  return (
    <div>
      <Hero />
      <Popular />
      <Offers />
      <NewProducts />
      <Partners />
      <AboutCompany />
      <Ceo />
      <NewsLetter />
      <Video />
    </div>
  );
};

export default Home;

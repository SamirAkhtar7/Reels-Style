// ...existing code...
import React from "react";
import Navbar from "./Navbar";

import categories from "../category.js";
import FoodCard from "./FoodCard";
import Card from "./Card";
import { useSelector } from "react-redux";

const UserDashboard = () => {
  const { ShopByCity, itemsByCity } = useSelector((state) => state.user);
  
  
  console.log("Shop by city from Redux :", itemsByCity); // Debugging line


  return (
    <div className="w-full h-full flex flex-col gap-5 items-center overflow-y-auto scrollbar-thin scrollbar-thumb-[#ff4d2d] scrollbar-track-transparent scroll-smooth">
      <Navbar />

      {/* category  */}

      <div className="w-full max-w-6xl flex flex-col gap-5 justify-center  items-center">
        <h1 className="text-3xl text-gray-800  sm:text-3xl">
          Inspiration for your first order
        </h1>

        <div className="w-full p-2">
          <div className="rounded-3xl flex gap-4 flex-nowrap overflow-x-auto items-center pb-2 pl-4 pr-4">
            {/* Category card container */}
            {categories.map((cat, index) => (
              <Card data={cat} key={cat.category ?? index} />
            ))}
          </div>
        </div>
      </div>

      {/* ...shop  */}
      <div className="w-full max-w-6xl flex flex-col gap-5 justify-center  items-center">
        <h1 className="text-3xl text-gray-800  sm:text-3xl">
          Popular Restaurants in your area
        </h1>

        {/* shop container */}
        <div className="w-full p-2">
          <div className="rounded-3xl flex gap-4 flex-nowrap overflow-x-auto items-center pb-2 pl-4 pr-4">
            {/* Shops card container */}
            {ShopByCity?.shops?.map((shop, index) => (
              <Card data={shop} key={index} />
            ))}
          </div>
        </div>
      </div>

      {/* ...items  */}
      <div className="w-full max-w-6xl flex flex-col gap-5 justify-center  items-center">
        <h1 className="text-3xl text-gray-800  sm:text-3xl">
          Popular Items in your area
        </h1>
        <div className="w-full p-2">
          <div className="rounded-3xl flex gap-4 flex-nowrap overflow-x-auto items-center pb-2 pl-4 pr-4">
            {/* Items card container */}
            {itemsByCity?.items?.map((item, index) => (
              <FoodCard props={item} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
// ...existing code...

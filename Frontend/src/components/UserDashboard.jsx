import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import categories from "../category.js";
import FoodCard from "./FoodCard";
import Card from "./Card";
import { useSelector } from "react-redux";
import axios from "axios";

const UserDashboard = () => {
  const navigator = useNavigate();
  const { city } = useSelector((state) => state.user);
  const { ShopByCity, itemsByCity, searchItems } = useSelector(
    (state) => state.user
  );
  const [updatedItemsList, setUpdatedItemsList] = useState(
    () => itemsByCity?.items ?? []
  );

  const [allItemsList, setAllItemsList] = useState([]);

  //  console.log("Shop by city from Redux :", itemsByCity); // Debugging line
  // console.log("Items by city from Redux :", city); // Debugging line
  const hanldeFilterByCategory = (category) => {
    if (category === "All") {
      setUpdatedItemsList(itemsByCity?.items ?? []);
      return;
    }
    const filteredItems = (itemsByCity?.items ?? []).filter(
      (item) => item.category === category
    );
    setUpdatedItemsList(filteredItems);
  };

  const allItems = async () => {
    try {
      const response = await fetch("/api/item/all-items");
      const data = await response.json();
      console.log("All items:", data);
      setAllItemsList(data.items);
    } catch (error) {
      console.error("Error fetching all items:", error);
    }
  };

  allItems();

  useEffect(() => {
    setUpdatedItemsList(itemsByCity?.items ?? []);
  }, [itemsByCity]);

  // scroll to top on first render and reload once when userData becomes available
  const userDataRef = useRef({ initialized: false, prev: null });

  return (
    <div className="w-full h-full flex flex-col gap-5 items-center overflow-y-auto scrollbar-thin scrollbar-thumb-[#ff4d2d] scrollbar-track-transparent scroll-smooth p-2">
      <Navbar />

      {/* category  */}
      {searchItems && searchItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4 ">
          <h1 className="text-2xl text-gray-800  sm:text-3xl font-semibold border-b border-gray-200 pb-2  ">
            search Results
          </h1>

          <div className=" w-full h-auto flex flex-wrap gap-6 justify-center">
            {searchItems.map((item, index) => (
              <FoodCard props={item} key={item?._id ?? index} />
            ))}
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl flex flex-col gap-5 justify-center  items-center">
        <h1 className="text-lg md:text-2xl lg:text-3xl text-gray-800  sm:text-3xl">
          Inspiration for your first order
        </h1>

        <div className="w-full p-2">
          <div className="rounded-3xl flex gap-4 flex-nowrap overflow-x-auto items-center pb-2 pl-4 pr-4">
            {/* Category card container */}
            {categories.map((cat, index) => (
              <Card
                data={cat}
                key={cat.category ?? index}
                onClick={() => hanldeFilterByCategory(cat.category)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* all Items */}
      <div className="w-full max-w-6xl">
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 text-center">
          All food Items
        </h2>
        <div className="w-full p-2">
          {/*
            Behavior:
            - base (mobile small, e.g. 320px): horizontal slider (single row, scrollable)
            - sm (>=640): grid with 2 columns
            - md (>=768): grid with 3 columns
            - lg (>=1024): grid with 5 columns
          */}
          <div className="rounded-3xl flex gap-4 overflow-x-auto items-start pb-2 pl-4 pr-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 ">
            {/* Items card container */}
            {(allItemsList ?? []).map((item, index) => (
              <div
                key={item?._id ?? index}
                className="flex-shrink-0 snap-start sm:snap-none"
              >
                <FoodCard props={item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ...shop  */}
      <div className="w-full max-w-6xl flex flex-col gap-5 justify-center  items-center">
        <h1 className="text-lg md:text-2xl lg:text-3xl text-gray-800  sm:text-3xl">
          Popular Restaurants in your area
        </h1>

        {/* shop container */}
        <div className="w-full p-2">
          <div className="rounded-3xl flex gap-4 flex-nowrap overflow-x-auto items-center pb-2 pl-4 pr-4">
            {/* Shops card container */}
            {(ShopByCity?.shops ?? []).map((shop, index) => (
              <Card
                data={shop}
                key={shop?._id ?? index}
                onClick={() => navigator(`/shop/${shop._id}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ...items  */}
      <div className="w-full max-w-6xl flex flex-col gap-5 justify-center  items-center">
        <h1 className="text-lg md:text-2xl lg:text-3xl text-gray-800  sm:text-3xl">
          Popular Items
        </h1>
        <div className="w-full p-2">
          <div className="rounded-3xl flex gap-4 flex-nowrap overflow-x-auto items-center pb-2 pl-4 pr-4">
            {/* Items card container */}
            {(updatedItemsList ?? []).map((item, index) => (
              <FoodCard props={item} key={item?._id ?? index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

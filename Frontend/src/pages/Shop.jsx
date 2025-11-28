import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import { useParams } from "react-router-dom";
import { FaStore, FaUtensils } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import FoodCard from "../components/FoodCard";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Shop = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const [items, setItems] = useState([]);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShop = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/item/get-item-by-shop/${shopId}`, {
        withCredentials: true,
      });
      console.log("Shop items:", response.data);
      setItems(response.data.items ?? []);
      setShopData(response.data.shop ?? null);
    } catch (err) {
      console.error("Shop page error:", err);
      setItems([]);
      setShopData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) handleShop();
  }, [shopId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <button
        onClick={() => {
          navigate(-2);
        }}
        className="absolute top-4 left-4 z-20 flex items-center justify-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow-transparent"
      >
        <FaArrowLeft /> <span>Back</span>
      </button>
      {shopData && (
        <div className="relative w-full md:h-80 h-64 lg-h-96 ">
          <img
            src={shopData?.image}
            alt={shopData?.name ?? "Shop"}
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <FaStore className="text-white text-4xl mb-3 drop-shadow-md" />
            <h1 className="text-white text-3xl md:text-5xl font-bold drop-shadow-md">
              {shopData?.name}
            </h1>
            <p className="text-white flex items-center gap-2 text-sm md:text-lg font-medium drop-shadow-md">
              <span>
                <FaLocationDot className="text-white text-xl drop-shadow-md" />
              </span>
              {shopData?.address ?? "Address not available"}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800">
          <FaUtensils className="text-3xl text-red-400" />
          Our Menu
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading menu...</p>
        ) : items && items.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {items.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            No items available in this shop.
          </p>
        )}
      </div>
    </div>
  );
};

export default Shop;

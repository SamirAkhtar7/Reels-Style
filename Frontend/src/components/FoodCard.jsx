import React from "react";
import { useState } from "react";
import { FaShoppingBag, FaShoppingCart } from "react-icons/fa";
import { FaDrumstickBite, FaLeaf, FaMinus, FaPlus } from "react-icons/fa6";
import { FcRating } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/user.slice";

const FoodCard = ({ props, data }) => {
  // support both prop names used across the app
  const item = props ?? data ?? {};
  const dispatch = useDispatch();
  const { cartItems = [] } = useSelector((state) => state.user ?? {});

  const initialQty =
    cartItems.find((i) => String(i.id) === String(item._id))?.quantity || 0;
  const [quantity, setQuantity] = useState(initialQty);

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    dispatch(
      addToCart({
        id: item._id ?? item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: newQty,
        foodType: item.foodType,
        shop: item.shop,
      })
    );
  };

  const handleDecrement = () => {
    if (quantity === 0) return;
    const newQty = quantity - 1;
    setQuantity(newQty);
    dispatch(
      addToCart({
        id: item._id ?? item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: newQty,
        foodType: item.foodType,
        shop: item.shop,
      })
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400">
          ★
        </span>
      );
    }
    if (halfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>
      );
    }
    return stars;
  };

  // safe fallbacks
  const imageSrc =
    item.image || "https://via.placeholder.com/400x300?text=No+Image";
  const ratingAvg = item?.ratings?.average ?? item?.rating ?? 0;
  const ratingCount = item?.ratings?.count ?? item?.rating?.count ?? 0;
  const inCart = cartItems.some((i) => String(i.id) === String(item._id));

  return (
    <div className="relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] rounded-2xl border-2 border-[#ff4d2d] overflow-hidden bg-white flex flex-col items-center justify-between box-border cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
      <div className="relative w-full h-32 sm:h-32 md:h-40 lg:h-44 flex justify-center items-center bg-white">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow ">
          {item?.foodType === "Veg" ? (
            <FaLeaf className="text-green-500 " />
          ) : (
            <FaDrumstickBite className="text-red-500" />
          )}
        </div>
        <img
          src={imageSrc}
          alt={item.name || ""}
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-start gap-1 p-2 w-full">
        <h1 className="font-semibold text-gray-900 text-sm md:text-base truncate w-full">
          {item.name}
        </h1>

        <div className="flex items-center gap-2 mt-1 text-sm">
          <div className="flex items-center gap-1">
            {renderStars(ratingAvg)}
          </div>
          <span className="text-xs text-gray-500">({ratingCount || 0})</span>
        </div>
      </div>

      <div className="flex mt-auto justify-between items-center w-full px-1 sm:px-1 md:px-2  pb-3 gap-1 sm:gap-1 md:gamp-2">
        <div className="font-bold text-gray-900 text-sm md:text-base">
          ₹ {item.price}
        </div>
        <div className="flex items-center border rounded-full overflow-hidden shadow-sm bg-white">
          <button
            onClick={handleDecrement}
            disabled={quantity === 0}
            aria-label="Decrease quantity"
            className="px-1 sm:px-1 md:px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FaMinus size={12} />
          </button>
          <span className="px-1 sm:px-1 md:px-2 text-sm">{quantity}</span>
          <button
            onClick={handleIncrement}
            aria-label="Increase quantity"
            className="px-1 sm:px-1 md:px-2 py-1 flex items-center justify-center"
          >
            <FaPlus size={12} />
          </button>
          <button
            aria-label="Add to cart"
            className={`ml-1 ${
              inCart ? "bg-gray-800" : "bg-[#ff4d2d]"
            } py-1 sm:px-1 md:px-2 px-2 text-white hover:bg-[#e04326] transition-colors flex items-center justify-center text-sm`}
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;

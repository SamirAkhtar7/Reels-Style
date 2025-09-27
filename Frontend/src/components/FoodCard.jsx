import React from "react";
import { useState } from "react";
import { FaShoppingBag, FaShoppingCart } from "react-icons/fa";
import { FaDrumstickBite, FaLeaf, FaMinus, FaPlus } from "react-icons/fa6";
import { FcRating } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/user.slice";
import { useSelector } from "react-redux";

const FoodCard = ({ props }) => {
  const dispatch = useDispatch();
  const {cartItems} = useSelector((state) => state.user);
  console.log(cartItems);

  const [quantity, setQuantity] = useState(cartItems.find(i=>i.id===props._id)?.quantity || 0);

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    dispatch(
      addToCart({
        id: props._id ?? props.id,
        name: props.name,
        price: props.price,
        image: props.image,
        quantity: newQty,
        foodType: props.foodType,
        shop: props.shop,
      })
    );
  };

  const handleDecrement = () => {
    if (quantity === 0) return;
    const newQty = quantity - 1;
    setQuantity(newQty);
    dispatch(
      addToCart({
        id: props._id ?? props.id,
        name: props.name,
        price: props.price,
        image: props.image,
        quantity: newQty,
        foodType: props.foodType,
        shop: props.shop,
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

  return (
    <div
      className="flex-none relative w-[250px] rounded-2xl border-2 border-[#ff4d2d] overflow-hidden bg-white flex flex-col items-center justify-center box-border cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
      //className="food-card w-[250px] rounded-2xl border-2 border-[#ff4d2d] overflow-hidden bg-white flex flex-col items-center justify-center box-border cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
    >
      <div className="relative w-full h-[170px] flex justify-center items-center bg-white">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow ">
          {props.foodType == "Veg" ? (
            <FaLeaf className="text-green-500 " />
          ) : (
            <FaDrumstickBite className="text-red-500" />
          )}
        </div>
        <img
          src={props.image}
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center items-start gap-1 p-3 w-full">
        <h1 className="font-semibold text-gray-900 text-base truncate">
          {props.name}
        </h1>

        <div className="text-xl font-semibold flex items-center gap-1">
          {renderStars(props.rating || 0)}
          <span className="text-xs text-gray-500">
            ({props.rating?.count || 143})
          </span>
        </div>
      </div>

      <div className="flex mt-auto justify-between items-center w-full px-3 pb-3 gap-3">
        <span className="font-bold text-gray-900 text-lg ">{props.price}</span>
        <div className="flex items-center border rounded-full overflow-hidden shadow-sm ">
          <button
            onClick={handleDecrement}
            disabled={quantity === 0}
            className="ml-2 disabled:cursor-not-allowed"
          >
            <FaMinus size={12} />
          </button>
          <span className="px-3">{quantity}</span>
          <button onClick={handleIncrement} className="mr-2">
            <FaPlus size={12} />
          </button>
          <button
            className={` ${cartItems.some(i=>i.id===props._id)?"bg-gray-800":"bg-[#ff4d2d]"} py-2 px-3  text-white hover:bg-[#e04326] transition-colors`}
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;

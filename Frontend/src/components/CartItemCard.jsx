import React from 'react'
import { FiMinusCircle, FiPlusCircle,FiTrash2 } from "react-icons/fi";
import { useSelector } from 'react-redux';  
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateQuantity } from '../redux/user.slice';




const CartItemCard = ({props}) => {
   const dispatch = useDispatch()
   
    const [currentQuantity, setCurrentQuantity] = useState(props.quantity);


const handleIncrement = (id,quantity) => {
    const newQty = currentQuantity + 1;
    setCurrentQuantity(newQty);
    dispatch(
      updateQuantity({
        id: props.id,
        quantity: newQty,
      })
    );
  };

  const handleDecrement = (id,quantity) => {
    if(currentQuantity > 1) {
    const newQty =currentQuantity - 1;
    setCurrentQuantity(newQty);
dispatch(
      updateQuantity({
        id: props.id,
        quantity: newQty,
      })
    );}
    };   
  
    const handleTrash = (id) => {
        dispatch(
        updateQuantity({
          id: props.id,
          quantity: 0,
        })
        )
     }

  


  return (
    <div className=" flex bg-white rounded-2xl  border-2 border-gray-500 gap-5  p-4 dark:border-slate-700 ">
          <div className="">
        <img
          src={props.image}
          alt="food"
          className=" w-20 h-20 rounded-lg object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-1 ">
        <div className=" text-lg font-semibold text-gray-900 dark:text-white">
          {props.name}
        </div>
        <div className=" text-sm text-gray-600 dark:text-gray-300">
          Quantity: {currentQuantity}
        </div>
        <div className=" text-sm text-gray-600 dark:text-gray-300">
          Price: ₹{props.price}
        </div>
      </div>

      <div className=" flex-1 flex justify-end items-center">
        <button
          onClick={() => handleDecrement(props.id, props.quantity)}
          className=""
        >
          <FiMinusCircle size={25} className=" text-[#ff4d2d]" />
        </button>
        <span className=" mx-2 text-lg font-semibold text-gray-900 dark:text-white">
          {currentQuantity}
        </span>
        <button
          onClick={() => handleIncrement(props.id, props.quantity)}
          className=""
        >
          <FiPlusCircle size={25} className=" text-[#ff4d2d]" />
        </button>
              <button 
                  onClick={() => handleTrash(props.id)}
                  className=" ml-4 h-10 w-10 rounded-full flex justify-center items-center bg-gray-100">
          <FiTrash2 size={20} className=" text-[#ff4d2d]" />
        </button>
      </div>
    </div>
  );
}

export default CartItemCard
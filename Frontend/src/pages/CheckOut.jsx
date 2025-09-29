import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";

const CheckOut = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-6 ">
      <div
        onClick={() => {
          navigate("/cart");
        }}
        className="absolute top-0 left-[10px] z-[10] mt-1 "
      >
        <IoIosArrowBack size={25} className="text-[#ff4d2d]" />
      </div>

      <div className="w-full max-w-[900px] bg-white flex flex-col gap-4 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-lg p-8 mt-6 mx-auto space-y-6">
        <h1 className="text-2xl font-blod text-gray-800 dark:text-white">
          Checkout{" "}
        </h1>

        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp size={20} className="text-[#ff4d2d]" />
            Delivery Details
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              palceholder="Enter your address..."
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              type="text"
            />
            <button className="bg-[#ff4d2d] hover:bg-[#e64525]  px-3 py-2 rounded-lg text-white flex items-center justify-center">
              <IoSearchOutline size={20} />
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg text-white flex items-center justify-center">
              <TbCurrentLocation size={20} />
            </button>
          </div> 
        </section>
      </div>
    </div>
  );
};

export default CheckOut;

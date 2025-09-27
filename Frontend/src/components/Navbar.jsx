import React, { useState } from "react";
import { FiSearch, FiPlus, FiUser,FiClipboard , FiMapPin,FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/user.slice";
import { useNavigate } from "react-router-dom";

import axios from "axios";


const Navbar = () => {
  const navigate = useNavigate();
  const { userData, city ,cartItems} = useSelector(state => state?.user)
  const  myShopData  = useSelector((state) => state?.owner?.myShopData);
// console.log("Navbar myShopData:", myShopData);

console.log("Navbar userData cartItem: ",cartItems);


 const name = userData?.fullName;

 
  
  const [showInfo, setShowInfo] = useState(false)
  const dispatch = useDispatch()

  const handleLogout = async() => {
    try {
      const result= await axios.get('/api/auth/user/logout', { withCredentials: true });
      console.log("Logout successful:", result?.data);
     dispatch(clearUser());
      
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className=" w-screen bg-white dark:bg-slate-900/70 border-b dark:border-slate-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-extrabold">
            v
          </div>
          <div className="hidden sm:block">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Vingo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Discover tasty reels
            </p>
          </div>
        </div>

        <div className="ml-4 hidden truncate sm:flex items-center gap-2 text-lg  text-slate-600 px-3 py-1">
          <FiMapPin className="text-rose-500" />
          <span>{city} </span>
        </div>

        <div className="flex-1">
          {userData?.role == "user" && (
            <div className="relative max-w-md mx-auto">
              <FiSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="search"
                placeholder="Search reels, restaurants..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                aria-label="Search"
              />
            </div>
          )}
        </div>

        {userData?.role == "owner" && (
          <>
            {myShopData && (
              <button
                onClick={() => {
                  navigate("/add-items");
                }}
                className=" flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-white] text-[#ff4d2d]">
                <FiPlus size={20} />
                <span className=" hidden md:block lg:block">Add Food Item</span>
              </button>
            )}
            {/*pendding order */}
            <div className="relative cursor-pointer">
              <FiClipboard size={22} className="text-[#ff4d2d]" />
              <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d]">
                2
              </span>
            </div>
          </>
        )}

        {userData?.role == "user" && (
          <div onClick={() => navigate("/cart")}
           className="relative cursor-pointer">
            <FiShoppingCart size={25} className="text-[#ff4d2d]" />

            <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d]">
              {cartItems?.length}
            </span>
          </div>
        )}
        <div
          onClick={() => setShowInfo(!showInfo)}
          className=" w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-slate-700"
        >
          <div className="text-[#ff4d2d] dark:text-[#ff4d2d] text-lg">
            {name?.slice(0, 1)}
          </div>
        </div>
        {showInfo && (
          <div className=" fixed top-[80px] right-[10px] md:right-[10%] lg:right-[25%] w-[180Px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[99]">
            <div className="text-[17px] font-semibold ">{name}</div>
            {userData?.role == "user" && (
              <div
                className="cursor-pointer font-semibold
          "
              >
                My Orders
              </div>
            )}
            <div
              onClick={handleLogout}
              className="text-[#ff4d2d] cursor-pointer font-semibold"
            >
              log Out
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

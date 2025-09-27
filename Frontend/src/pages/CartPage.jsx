import react from "react";
import Navbar from "../components/Navbar";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CartItemCard from "../components/CartItemCard";

const CartPage = () => {
    const navigate = useNavigate();
    const {cartItems,totalAmount} = useSelector((state) => state?.user);
    console.log(cartItems);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 p-6">
      <Navbar />

      <div className=" w-full max-w-[800px] bg-white flex flex-col gap-4 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-lg p-8 mt-6 mx-auto">
        <div className="relative flex justify-center mb-4">
          <div
            onClick={() => {
              navigate("/");
            }}
            className="absolute top-0 left-[10px] z-[10] mt-1 "
          >
            <IoIosArrowBack size={25} className="text-[#ff4d2d]" />
          </div>

          <h1 className=" text-2xl font-bold text-[#ff4d2d] ">My Cart</h1>
        </div>

        {cartItems?.length === 0 ? (
          <p className="text-center text-2xl font-bold text-gray-900">
            Your cart is empty
          </p>
        ) : (<>
         <div className=" flex flex-col gap-4">
                {cartItems?.map((item,index)=>(
                    <CartItemCard key={index} props={item}/>
                ))}          
          </div>
        <div className="mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border">
         <h1> Totel Amount : </h1>
         <span>₹ {totalAmount}</span>
        </div>
        <div className=" mt-4">
            <button className=" w-full bg-[#ff4d2d] text-white p-3 rounded-xl font-semibold">
                Checkout Now
            </button>
        </div>
       </> )}

      </div>
    </div>
  );
};

export default CartPage;

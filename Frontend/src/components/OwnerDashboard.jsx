import React from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa6";
import { FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";
import { useState } from "react";
import axios from "../config/axios";
import VideoCard from "./VideoCard";  

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const myShopData = useSelector((state) => state.owner?.myShopData);
const [showItems, setShowItems] = useState(true);
const [showVideos, setShowVideos] = useState(false);



//console.log("OwnerDashboard myShopData items:", myShopData);

const getFoodVideo= async()=>{
  try{
    const response = await axios(
      `/api/video/get-all-videos-by-shop/${myShopData._id}`,
      {
        withCredentials: true,
      }
    );
  console.log("Food Videos by ShopId:", response.data.videos);
  }
  catch(err){
    console.error("Error fetching food videos:", err);
  }

}

getFoodVideo();
// useEffect(() => {
//   if(showVideos){
//     getFoodVideo();
//   }
// }, [showVideos]);    

  // console.log("OwnerDashboard myShopData:", myShopData);
  return (
    <div className="w-screen h-screen overflow-x-hidden ">
      <Navbar />
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full justify-center max-w-md bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4D2d] w-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bole text-gray-800 mb-2 ">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our food delivery platform and reach thousands of hungry
                customers every day.
              </p>
              <button
                onClick={() => {
                  navigate("/create-edit-shop");
                }}
                className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <>
          <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6 ">
            <h2 className="text-2xl sm:text-3xl flex items-center text-center gap-4 font-bold text-gray-800 mb-4">
              <FaUtensils size={30} className="text-[#ff4d2d] mt-2" />
              Welcome to {myShopData?.name}
            </h2>

            <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
              <div
                onClick={() => {
                  navigate("/create-edit-shop");
                }}
                className="absolute top-4 right-4 h-10 w-10 bg-white rounded-full flex items-center justify-center cursor-pointer"
              >
                <FaPen className="text-[#ff4d2d] cursor-pointer" />
              </div>
              <img
                src={myShopData?.image}
                alt={myShopData?.name}
                className="w-full h-48 sm:h-64 object-cover rounded-lg"
              />
              <div className="p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {myShopData?.name}
                </h1>
                <p className="text-gray-600">
                  {myShopData?.city}, {myShopData?.state}
                </p>
                <p className="text-gray-600 mb-2">{myShopData?.address}</p>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center gap-4 mt-8">
            <div 
            className="">
              <button
                onClick={() => {
                  setShowItems(true);
                  setShowVideos(false);
                }}
               className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200">
                {" "}
                Food Items
              </button>
            </div>
            <div>
              <button 
                onClick={() => {
                  setShowItems(false);
                  setShowVideos(true);
                }}
              
              className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200">
                {" "}
                Food Videos
              </button>
            </div>
          </div>

          {myShopData?.items?.length === 0 && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full justify-center max-w-md bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#ff4D2d] w-16 sm:w-20 sm:h-20 mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bole text-gray-800 mb-2 ">
                    Add Your Food Items
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Start adding delicious food items to your menu and attract
                    more customers.
                  </p>
                  <button
                    onClick={() => {
                      navigate("/add-items");
                    }}
                    className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
                  >
                    Get Food Items
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* {myShopData?.items?.length > 0 && ( */}
      {myShopData?.items?.length > 0 &&
        (showItems && (
          <div className="mt-10  max-w-6xl min-w-[300px] p-2 mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 p-1 lg:grid-cols-3 gap-4">
              {myShopData.items.map((item) => (
                <OwnerItemCard data={item} key={item._id} />
              ))}
            </div>
          </div>
        ))}
      {/* <OwnerItemCard data={myShopData?.items} /> */}



        {showVideos && (
          <div className="mt-10  max-w-6xl min-w-[300px] p-2 mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 p-1 lg:grid-cols-3 gap-4">
            <VideoCard />
            </div>
          </div>
        )}

    </div>
  );
};

export default OwnerDashboard;

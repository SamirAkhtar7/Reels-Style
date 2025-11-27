import React, { useRef, useState } from "react";
import { FaUtensils } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMyShopData } from "../redux/ownerSlice";
import axios from "axios";

const AddItems = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);

  const [name, setName] = useState(myShopData?.name || "");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [foodType, setFoodType] = useState("Veg");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [showVideoUpload, setShowVideoUpload] = useState(true);

  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Drinks",
    "Dessert",
    "Beverages",
    "snacks",
    "Main Course",
    "Beverages",
    "Desserts",
    "Salad",
    "pizza",
    "sandwich",
    "south Indian ",
    "north Indian",
    "chinese",
    "fast food",
    "others",
  ];

  const [frontendImage, setFrontendImage] = useState(null);
  const [bankendImage, setBackendImage] = useState(null);
  const [frontendVideo, setFrontendVideo] = useState(null);
  const [backendVideo, setBackendVideo] = useState(null);
  const [loading, setLoading] = useState();

  const dispatch = useDispatch();

  // console.log("myShopData", myShopData);

  // console.log("myShopData1234", Address,City,State);
  const handleImages = (e) => {
    // guard against undefined event (won't be called without an event when set correctly)
    const file = e?.target?.files?.[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleVideos = (e) => {
    // guard against undefined event (won't be called without an event when set correctly)
    const file = e?.target?.files?.[0];
    if (!file) return;
    setBackendVideo(file);
    setFrontendVideo(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);
      formData.append("videoTitle", videoTitle);
      formData.append("videoDescription", videoDescription);

      if (bankendImage) {
        formData.append("image", bankendImage);
      }
      if (backendVideo) {
        formData.append("video", backendVideo);
      }
      const response = await axios.post(`/api/item/add-item`, formData, {
        withCredentials: true,
      });

      dispatch(setMyShopData(response?.data));

      console.log("items successfully:", response.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log("Error in adding items:", error);
      setLoading(false);
    }
  };

  return (
    <div className=" flex justify-center items-center flex-col p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen">
      <div
        onClick={() => {
          navigate("/");
        }}
        className="absolute top-[30px] left-[40px] z-[10] mb-[10px] "
      >
        <IoIosArrowBack size={25} className="text-[#ff4d2d]" />
      </div>

      <div className=" max-w-2xl w-full bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
        <div className=" flex flex-col mb-6 items-center ">
          <div className="bg-orange-100 p-4 mb-4 rounded-full">
            <FaUtensils className="w-16 h-16 text-[#ff4d2d] ]" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            Add Food Items
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1 text-gray-700 ">
              Name
            </label>
            <input
              onChange={(e) => {
                setName(e.target.value);
              }}
              type="text"
              className="border w-full px-4 py-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Enter Food name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-semibold"> Food Image</label>
            <input
              onChange={handleImages}
              type="file"
              accept="image/*"
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Upload your food image"
            />
            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg boder   "
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                id="showVideoUpload"
                type="checkbox"
                checked={showVideoUpload}
                onChange={(e) => {
                  const val = e.target.checked;
                  console.log("val", val);
                  setShowVideoUpload(val);
                  if (!val) {
                    setFrontendVideo(null);
                    setBackendVideo(null);
                  }
                }}
                className="sr-only peer"
              />

              <div
                aria-hidden
                className={`w-12 h-6 rounded-full transition-colors ${
                  showVideoUpload ? "bg-[#ff4d2d]" : "bg-gray-300"
                }`}
              />

              <div
                aria-hidden
                className={`absolute top-0 left-0 mt-0.5 ml-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  showVideoUpload ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>

            <label htmlFor="showVideoUpload" className="text-sm text-gray-700">
              Include a short food video
              <div className="text-xs text-gray-400">
                Optional — toggle to attach video
              </div>
            </label>
          </div>

          {showVideoUpload && (
            <div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 ">
                  Video Title
                </label>
                <input
                  onChange={(e) => {
                    setVideoTitle(e.target.value);
                  }}
                  type="text"
                  className="border w-full px-4 py-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Enter Video Title"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 ">
                  Video Description
                </label>
                <textarea
                  onChange={(e) => {
                    setVideoDescription(e.target.value);
                  }}
                  className="border w-full px-4 py-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Enter Video Description"
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-semibold">
                  Food Video
                </label>
                <input
                  onChange={handleVideos}
                  type="file"
                  accept="video/*"
                  className="border-dashed border-2 border-gray-200 rounded-lg p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Upload your food video"
                />
                {frontendVideo && (
                  <div className="mt-4">
                    <video
                      className="w-full h-48 object-cover rounded-lg shadow"
                      controls
                      muted
                      loop
                      autoPlay={false}
                      src={frontendVideo}
                    ></video>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1 text-gray-700 ">
              Price
            </label>
            <input
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
              type="number"
              className="border w-full px-4 py-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Enter Price in ₹ "
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1 text-gray-700 ">
              Select Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border w-full px-4 py-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat, index) => (
                <option value={cat} key={index}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium mb-1 text-gray-700 ">
              Select Food Type
            </label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="border w-full px-4 py-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="" disabled>
                Select Food Type
              </option>

              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff4d2d] w-full text-white py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold mt-4"
          >
            {loading ? "Loading..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItems;

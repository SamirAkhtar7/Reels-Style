import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import ForgotPassword from "../pages/ForgotPassword";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Home from "../pages/Home";
import useGetCity from "../hooks/useGetCity";
import useGetMyShop from "../hooks/useGetMyShop";
import CreateEditeShop from "../pages/CreateEditeShop";
import AddItems from "../pages/AddItems";
import EditItems from "../pages/EditItems";
import useGetShopByCity from "../hooks/useGetShopByCity";
import useGetItemsByCity from "../hooks/useGetItemsByCity";
import CartPage from "../pages/CartPage";
import CheckOut from "../pages/CheckOut";
import OrderPlaced from "../pages/OrderPlaced";
import MyOrder from "../pages/MyOrder";
import useGetMyOrder from "../hooks/useGetMyOrder";
import useGetUpdateLocation from "../hooks/useGetUpdateLocation"
import TrackOrderPage from "../pages/TrackOrderPage";
import Shop from "../pages/Shop";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setSocket } from "../redux/user.slice";

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { userData, city } = useSelector((state) => state?.user);
  useGetCurrentUser();

  useGetCity();
  useGetShopByCity();
  useGetItemsByCity();
  useGetUpdateLocation();

  useGetMyShop();
  useGetMyOrder()

  // select the actual user object (null when not logged in)
  const data = useSelector((state) => state?.user);
  // optional: keep the whole slice for debugging
  // const userSlice = useSelector((state) => state.user);

  const user = data.userData;
const serverUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
  useEffect(() => {
    const socketIntance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketIntance));
    socketIntance.on("connect", () => {
      if (userData) {
       socketIntance.emit('identify', { userId: userData._id } );
      }
      
    });
    return () => {
      socketIntance.disconnect();
    };
  }, [userData?._id])

  return (
    <Router>
      <Routes>
        <Route
          path="/signup"
          element={!user ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signin"
          element={!user ? <SignIn /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgotpassword"
          element={!user ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/create-edit-shop"
          element={user ? <CreateEditeShop /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/add-items"
          element={user ? <AddItems /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/edit-item/:id"
          element={user ? <EditItems /> : <Navigate to={"/signin"} />}
        />

        <Route
          path="/cart"
          element={user ? <CartPage /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/checkout"
          element={user ? <CheckOut /> : <Navigate to={"/signin"} />}
        />

        <Route
          path="/order-placed"
          element={user ? <OrderPlaced /> : <Navigate to={"/signin"} />}
        />

        <Route
          path="/my-orders"
          element={user ? <MyOrder /> : <Navigate to={"/signin"} />}
        />

        <Route path="/track-order/:orderId" element={user ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />
        <Route path="/shop/:shopId" element={user?<Shop />:<Navigate to={"/signin"} />} />

        {/* <Route path="/food-partner/register" element={<h1>hello</h1>}></Route>
        <Route path="/food-partner/login" element={<h1>hello</h1>}></Route> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;

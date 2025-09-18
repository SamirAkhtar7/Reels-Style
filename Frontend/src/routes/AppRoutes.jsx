import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import ForgotPassword from "../pages/ForgotPassword";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Home from "../pages/Home";
import useGetCity from "../hooks/useGetCity";

const AppRoutes = () => {
  useGetCurrentUser();
  useGetCity();

  // select the actual user object (null when not logged in)
  const data= useSelector((state) => state.user );
  // optional: keep the whole slice for debugging
  // const userSlice = useSelector((state) => state.user);

 const user =data.userData

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

        {/* <Route path="/food-partner/register" element={<h1>hello</h1>}></Route>
        <Route path="/food-partner/login" element={<h1>hello</h1>}></Route> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;

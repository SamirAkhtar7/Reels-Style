import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import ForgotPassword from "../pages/ForgotPassword";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { useSelector } from "react-redux";

const AppRoutes = () => {
  useGetCurrentUser()
  const {userData}= useSelector(state=>state.user)
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>hello</h1>}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/signin" element={<SignIn />}></Route>
        <Route path="/forgotpassword" element={<ForgotPassword />}></Route>
        <Route path="/food-partner/register" element={<h1>hello</h1>}></Route>
        <Route path="/food-partner/login" element={<h1>hello</h1>}></Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;

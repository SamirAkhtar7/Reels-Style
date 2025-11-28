import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { auth } from "../../firebase";
import {
  setUserData,
  setCity,
  setAddress,
  setState,
} from "../redux/user.slice";
import { ClipLoader } from "react-spinners";

const SignIn = () => {
  const navigator = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await axios.post(
        `/api/auth/user/login`,
        { email, password },
        { withCredentials: true }
      );

      const payload = result.data?.user ?? result.data;
      dispatch(setUserData(payload));
      console.debug("SignIn: dispatched setUserData ->", payload);
      // if backend returned city/address info, populate store immediately so hooks can run
      if (payload?.city) dispatch(setCity(payload.city));
      if (payload?.address) dispatch(setAddress(payload.address));
      if (payload?.state) dispatch(setState(payload.state));
      // fetch full user profile (some login responses contain limited user object)
      try {
        const me = await axios.get(`/api/user/get-user`, {
          withCredentials: true,
        });
        const full = me.data.user ?? me.data.userData ?? me.data;
        if (full) {
          dispatch(setUserData(full));
          if (full?.city) dispatch(setCity(full.city));
          if (full?.address) dispatch(setAddress(full.address));
          if (full?.state) dispatch(setState(full.state));
          console.debug("SignIn: fetched full user ->", full);
          // proactively fetch shops/items for the city so Home renders immediately
          try {
            if (full?.city) {
              const shops = await axios.get(
                `/api/shop/get-shop-by-city/${full.city}`
              );
              dispatch({ type: "user/setShopByCity", payload: shops.data });
              const items = await axios.get(
                `/api/item/get-item-by-city/${full.city}`
              );
              dispatch({ type: "user/setItemsByCity", payload: items.data });
              console.debug("SignIn: fetched shops/items for city", full.city);
            }
          } catch (err) {
            console.warn(
              "SignIn: fetching shops/items failed",
              err?.message || err
            );
          }
        }
      } catch (err) {
        console.warn("SignIn: fetching full user failed", err?.message || err);
      }

      // navigate after store update so Home reads new user immediately
      navigator("/", { replace: true });
      console.log("Login Success:", result.data);
    } catch (err) {
      // prefer detailed server validation errors when available
      const resp = err.response?.data;
      let message = err.message || "Login failed";

      if (resp) {
        if (Array.isArray(resp.errors) && resp.errors.length > 0) {
          // show first validation message or join all
          message = resp.errors[0].msg;
        } else if (resp.message) {
          message = resp.message;
        }
      }

      setError(message);
      console.error("Login Failed:", resp || err.message);
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const firebaseResult = await signInWithPopup(auth, provider);
      const { email: firebaseEmail } = firebaseResult.user || {};

      const { data } = await axios.post(
        `/api/auth/user/google-auth`,
        {
          email: firebaseEmail,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      // populate city/address/state if backend returned them
      if (data?.city) dispatch(setCity(data.city));
      if (data?.address) dispatch(setAddress(data.address));
      if (data?.state) dispatch(setState(data.state));

      // fetch full profile to ensure role/city are available before navigation
      try {
        const me = await axios.get(`/api/user/get-user`, {
          withCredentials: true,
        });
        const full = me.data.user ?? me.data.userData ?? me.data;
        if (full) {
          dispatch(setUserData(full));
          if (full?.city) dispatch(setCity(full.city));
          if (full?.address) dispatch(setAddress(full.address));
          if (full?.state) dispatch(setState(full.state));
          console.debug("SignIn(Google): fetched full user ->", full);
        }
      } catch (err) {
        console.warn(
          "SignIn(Google): fetching full user failed",
          err?.message || err
        );
      }

      console.log("Google SignIn Success:", data);
      navigator("/");
    } catch (err) {
      console.error("Google auth failed:", err);
      setError(
        err.response?.data?.message || err.message || "Google sign-in failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-100 dark:border-slate-700 rounded-2xl shadow-lg p-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400">
            FooDie
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Sign in to your account to get started with delicious food
            deliveries
          </p>
        </header>

        <form className="space-y-4" noValidate onSubmit={handleSignIn}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              aria-label="Email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              aria-label="Password"
            />
          </div>

          <div
            onClick={() => {
              navigator("/forgotpassword");
            }}
            className="text-right mb-4 text-sm text-rose-500 hover:underline dark:text-slate-300"
          >
            Forgot password
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
            <button
              disabled={loading}
              type="submit"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-sm transition disabled:opacity-60"
            >
              {loading ? <ClipLoader size={20} /> : "Sign in"}
            </button>

            <button
              onClick={handleGoogleAuth}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 border border-gray-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 font-medium transition"
            >
              <FcGoogle size={20} />
              <span> Continue with Google </span>
            </button>
          </div>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-3">
            Want to create a new account?{" "}
            <Link to="/signup" className="text-rose-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;

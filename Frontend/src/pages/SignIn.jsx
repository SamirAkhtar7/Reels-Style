import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { auth } from "../../firebase";
import { setUserData } from "../redux/user.slice";
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
      // navigate after store update so Home reads new user immediately
      navigator("/", { replace: true });
    setTimeout(() => window.location.reload(), 100);
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
            vingo
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

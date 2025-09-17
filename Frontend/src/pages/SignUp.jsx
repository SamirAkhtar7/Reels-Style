// ...existing code...
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";


const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await axios.post(
        `/api/auth/user/register`,
        { fullName, email, password, mobile, role },
        { withCredentials: true }
      );
      console.log("Registration Success:", result.data);
      // navigate("/signin"); // optional: uncomment to redirect after signup
    } catch (err) {
      const resp = err.response?.data;
      let message = err.message || "Registration failed";

      if (resp) {
        // show only the first error message if express-validator returned multiple
        if (Array.isArray(resp.errors) && resp.errors.length) {
          message = resp.errors[0].msg;
        } else if (resp.message) {
          message = resp.message;
        }
      }

      setError(message);
      console.error("Registration Failed:", resp || err.message);
    } finally {
      setLoading(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setMobile("");
    }
  };


  const handleGoogleAuth = async () => {
    if (!mobile) {
      alert("Please enter mobile number");
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      const firebaseResult = await signInWithPopup(auth, provider);
      const { displayName, email: firebaseEmail } = firebaseResult.user || {};

      const apiResult = await axios.post(
        `/api/auth/user/google-auth`,
        {
          fullName: displayName,
          email: firebaseEmail,
          role,
          mobile,
        },
        { withCredentials: true }
      );

      console.log("Google SignIn Success:", apiResult.data);
      navigate("/");
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
            Create an account to discover, upload and save delicious reels and
            food deliveries
          </p>
        </header>

        <form className="space-y-4" noValidate onSubmit={handleSignUp}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Full name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Enter your Fullname"
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              aria-label="Full name"
            />
          </div>

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
              placeholder="you@example.com"
              required
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              aria-label="Email"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Mobile
              </label>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="9876543210"
                required
                minLength={10}
                maxLength={10}
                className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                aria-label="Mobile"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                id="role"
                name="role"
                className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                aria-label="Role"
              >
                <option value="user">User</option>
                <option value="owner">Owner</option>
                <option value="foodDelivery">Food Delivery</option>
              </select>
            </div>
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
              placeholder="••••••••"
              required
              minLength={8}
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              aria-label="Password"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-sm transition disabled:opacity-60"
            >
              {loading ? <ClipLoader size={20}  /> : "Create account"}
            </button>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 border border-gray-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 font-medium transition"
            >
              <FcGoogle size={20} />
              <span> Continue with Google </span>
            </button>
          </div>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-3">
            Already have an account?{" "}
            <Link to="/signin" className="text-rose-500 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
// ...existing code...

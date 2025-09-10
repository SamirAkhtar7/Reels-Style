// ...existing code...
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import axios from "axios";

const SignUp = () => {
    const navigate = useNavigate()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState("")
    const [mobile, setMobile] = useState("")
    const [role, setRole] = useState("user")
  
    const handleSignUp = async () => {
        try {
           const result = await axios.post(
             "http://localhost:3000/api/auth/user/register",
             { fullName, email, password, role, mobile },
             { withCredentials: true }
           );
    console.log(result)
        } catch (error) {
            console.log(error)
       }
        }




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

      <form className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Full name
          </label>
          <input
            onChange={(e) => {
              setFullName(e.target.value);
            }}
            id="fullName"
            name="fullName"
            type="text"
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
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
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
              onChange={(e) => {
                setMobile(e.target.value);
              }}
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="9876543210"
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
              onChange={(e) => {
             setRole(e.target.value)
             }}
              id="role"
              name="role"
              defaultValue="user"
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
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="mt-2 w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            aria-label="Password"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
          <button  onClick={handleSignUp}
            type="button"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-sm transition"
          >
            Create account
          </button>

          <button
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

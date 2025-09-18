import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";


const ForgotPassword = () => {

  const { userData } = useSelector((state) => state.user);
  console.log("User Data from Redux:", userData);

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // added loading states
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);

  const goBack = () => navigate("/signin");

    const handleSendOtp = async () => {
       setError("");
       setSending(true);
    try {
      const result = await axios.post(
        `/api/auth/user/send-otp`,
        { email },
        { withCredentials: true }
      );

      console.log("OTP sent:", result.data);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
      try {
        setError("");
        setVerifying(true);
        const result = await axios.post(
          `/api/auth/user/verify-otp`,
          { email, otp },
          { withCredentials: true }
        );
        console.log("OTP Verified", result.data);
        setStep(3);
      } catch (err) {
        console.error(err);
        setError("Failed to verify OTP. Please try again.");
      } finally {
        setVerifying(false);
      }
  };
  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      alert("passwords do not match");
      return;
      }
             setError("");
             setResetting(true);
    try {
      const result = await axios.post(
        `/api/auth/user/reset-otp`,
        { email, password },
        { withCredentials: true }
      );
      console.log("Password Reset:", result.data);
      navigate("/signin");
    } catch (err) {
      console.error(err);
      setError("Failed to reset password. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-white dark:bg-slate-900">
      <div className="w-full max-w-lg bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-100 dark:border-slate-700 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <IoIosArrowRoundBack
            onClick={goBack}
            size={28}
            className="text-rose-500 hover:text-rose-600 cursor-pointer"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-bold text-rose-500">Forgot Password</h1>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
            {error}
          </div>
        )}
        {step === 1 && (
          <section aria-labelledby="send-otp" className="space-y-4">
            <label
              htmlFor="fp-email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Email
            </label>
            <input
              id="fp-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              aria-describedby="fp-email-desc"
            />
            <div id="fp-email-desc" className="text-xs text-slate-500">
              We will send an OTP to this email.
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sending}
                className="flex-1 px-4 py-3 rounded-lg bg-rose-500 text-white font-semibold"
              >
                {sending ? <ClipLoader size={20} /> : "Send OTP"}
              </button>
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-3 rounded-lg border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </section>
        )}
        {step === 2 && (
          <section aria-labelledby="verify-otp" className="space-y-4">
            <label
              htmlFor="fp-otp"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              OTP
            </label>
            <input
              id="fp-otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              inputMode="numeric"
              required
              placeholder="Enter OTP"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifying}
                className="flex-1 px-4 py-3 rounded-lg bg-rose-500 text-white font-semibold"
              >
                {verifying ? <ClipLoader size={20} /> : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-lg border border-gray-200"
              >
                Back
              </button>
            </div>
          </section>
        )}
        {step === 3 && (
          <section aria-labelledby="reset-password" className="space-y-4">
            <label
              htmlFor="fp-password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              New Password
            </label>
            <input
              id="fp-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              maxLength={20}
              placeholder="Enter new password"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <label
              htmlFor="fp-confirm"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Confirm Password
            </label>
            <input
              id="fp-confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              maxLength={20}
              placeholder="Confirm password"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-3 text-sm bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />{" "}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetting}
                className="flex-1 px-4 py-3 rounded-lg bg-rose-500 text-white font-semibold"
              >
                {resetting ? <ClipLoader size={20} /> : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-lg border border-gray-200"
              >
                Back
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

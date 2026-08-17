import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/slices/user.slice";

const LoginPage = () => {
  // Form state management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI state management
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSubmitting = useSelector((state) => state.user.status === "loading");

  // Handle input changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Effect: Validate form whenever formData changes
  useEffect(() => {
    const isValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.trim().length > 0;

    setIsFormValid(isValid);
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    const loginPromise = dispatch(loginUser(payload)).unwrap();

    toast.promise(loginPromise, {
      loading: "Signing in...",
      success: () => {
        navigate("/");
        return "Logged in successfully.";
      },
      error: (error) => {
        return error || "Failed to sign in. Please check your credentials.";
      },
    });
  };

  return (
    // h-screen ensures strict 100vh, overflow-hidden prevents scrolling
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#0A0A0B] text-[#EDEDED] font-sans px-4 py-8">
      {/* Centered Form Container */}
      <div className="w-full max-w-md px-2 py-4 sm:px-6 sm:py-6 box-border">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 p-1.5 bg-[#232323] rounded-lg border border-[#333333] flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Nuvix AI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-lg tracking-wide">Nuvix AI</span>
        </div>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Welcome back
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          Sign in to continue to your workspace.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-[#D1D1D1]"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#121212] border border-[#2B2B2B] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-medium text-[#D1D1D1]"
                htmlFor="password"
              >
                Password
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-[#2B2B2B] text-white rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors placeholder:tracking-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-2.5 rounded-lg text-black font-semibold mt-4 transition-all duration-200 
              ${
                isFormValid
                  ? "bg-white hover:bg-gray-200 active:scale-[0.98]"
                  : "bg-[#444444] text-[#888888] cursor-not-allowed opacity-90"
              }`}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-[#888888] mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-white font-medium hover:underline ml-1"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

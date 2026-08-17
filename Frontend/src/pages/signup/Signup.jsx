import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux/slices/user.slice";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSubmitting = useSelector((state) => state.user.status === "loading");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const isValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 8;

    setIsFormValid(isValid);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      email: formData.email,
      password: formData.password,
      fullname: {
        firstname: formData.firstName,
        lastname: formData.lastName,
      },
    };

    const registerPromise = dispatch(registerUser(payload)).unwrap();

    toast.promise(registerPromise, {
      loading: "Creating your account...",
      success: () => {
        navigate("/");
        return "Profile saved successfully.";
      },
      error: (error) => {
        return error || "Failed to create account. Please try again.";
      },
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#0A0A0B] text-[#EDEDED] font-sans px-4 py-8">
      <div className="w-full max-w-md px-2 py-4 sm:px-6 sm:py-6 box-border">
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

        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Create your account
        </h1>
        <p className="text-[#888888] text-sm mb-6">
          Start your journey with Nuvix AI in minutes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 space-y-1.5">
              <label
                className="text-sm font-medium text-[#D1D1D1]"
                htmlFor="firstName"
              >
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-[#2B2B2B] text-white rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>

            {/* Last Name */}
            <div className="w-full sm:w-1/2 space-y-1.5">
              <label
                className="text-sm font-medium text-[#D1D1D1]"
                htmlFor="lastName"
              >
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-[#2B2B2B] text-white rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
          </div>

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
              className="w-full bg-[#121212] border border-[#2B2B2B] text-white rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 relative">
            <label
              className="text-sm font-medium text-[#D1D1D1]"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-[#2B2B2B] text-white rounded-lg px-3 py-2 sm:py-2.5 pr-10 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
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
            className={`w-full py-2.5 rounded-lg text-black font-semibold mt-2 transition-all duration-200 
              ${
                isFormValid
                  ? "bg-white hover:bg-gray-200 active:scale-[0.98]"
                  : "bg-[#444444] text-[#888888] cursor-not-allowed"
              } cursor-pointer`}
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>

          <p className="text-center text-sm text-[#888888] mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-white font-medium hover:underline ml-1"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;

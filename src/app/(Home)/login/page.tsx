"use client";

import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  IconLock,
  IconMail,
  IconShieldLock,
  IconArrowRight,
  IconLoader2,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "Please enter a valid corporate email address";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Invalid credentials format");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", formData);
      const { userId, fullName, email: userEmail, token, role } = response.data;
      login({ userId, fullName, email: userEmail, role }, token);
      localStorage.setItem("jwtToken", token);
      toast.success(`Welcome back, ${fullName}`);
      router.push("/user/dashboard");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Authentication failed";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[84.5vh] flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl overflow-hidden">
        <div className="h-2 bg-primary w-full"></div>

        <div className="card-body p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
              <IconShieldLock size={40} stroke={1.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Vault<span className="text-primary">Pay</span>
            </h1>
            <div className="badge badge-ghost mt-2 font-mono text-[10px] tracking-widest uppercase opacity-60">
              Secured Enterprise Node
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold flex items-center gap-2">
                  <IconMail size={16} /> Corporate Email
                </span>
              </label>
              <input
                name="email"
                type="email"
                className={`input input-bordered w-full focus:input-primary transition-all ${errors.email ? "input-error" : ""}`}
                placeholder="admin@enterprise.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <label className="label p-0 mt-1">
                  <span className="label-text-alt text-error font-medium">
                    {errors.email}
                  </span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold flex items-center gap-2">
                  <IconLock size={16} /> Access Password
                </span>
                <Link
                  href="/forgot-password"
                  className="label-text-alt link link-hover text-primary font-medium"
                >
                  Forgot?
                </Link>
              </label>

              {/* Relative container for the Eye button */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full focus:input-primary transition-all pr-12 ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEyeOff size={20} />
                  ) : (
                    <IconEye size={20} />
                  )}
                </button>
              </div>

              {errors.password && (
                <label className="label p-0 mt-1">
                  <span className="label-text-alt text-error font-medium">
                    {errors.password}
                  </span>
                </label>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-primary btn-block shadow-lg shadow-primary/30 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <IconLoader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Authorize Access
                    <IconArrowRight
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                      size={18}
                    />
                  </>
                )}
              </button>
            </div>

            <div className="divider text-xs opacity-40 uppercase tracking-widest">
              or
            </div>

            <div className="text-center">
              <p className="text-sm opacity-70">
                New to the platform?{" "}
                <Link
                  href="/sign-up"
                  className="text-primary font-bold hover:underline"
                >
                  Request Access
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconChevronLeft,
  IconMail,
  IconShield,
  IconLoader2,
  IconCircleCheck,
  IconEye,
  IconEyeOff,
  IconLock,
} from "@tabler/icons-react";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

type Step = "EMAIL" | "OTP_VERIFIED" | "RESET_DONE";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState<Step>("EMAIL");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  /* ---------------- SEND OTP ---------------- */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Please enter a valid corporate email");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/helper/forgot-password", { email });
      setOtpSent(res.data.otp);
      (
        document.getElementById("otpContainer") as HTMLDialogElement
      ).showModal();

      toast.success("OTP sent to your email");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send recovery OTP");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = () => {
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    if (otp === otpSent) {
      setStep("OTP_VERIFIED");
      (document.getElementById("otpContainer") as HTMLDialogElement).close();
      toast.success("OTP verified successfully");
    } else {
      toast.error("Invalid OTP");
    }
  };

  /* ---------------- RESET PASSWORD ---------------- */
  const handleResetPassword = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password/reset", {
        email,
        password,
      });

      toast.success("Password reset successfully");
      setStep("RESET_DONE");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[84.5vh] flex items-center justify-center bg-base-200 p-6">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl overflow-hidden">
        {isLoading && (
          <div className="h-1 w-full bg-primary animate-pulse"></div>
        )}

        <div className="card-body p-8 sm:p-12">
          {step !== "RESET_DONE" ? (
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex p-4 bg-primary/10 rounded-full text-primary mb-4">
                  <IconShield size={40} />
                </div>
                <h1 className="text-2xl font-black tracking-tight uppercase italic">
                  Recover <span className="text-primary">Vault</span>
                </h1>
                <p className="text-sm opacity-60 mt-2">
                  Secure password recovery
                </p>
              </div>

              <form
                onSubmit={
                  step === "EMAIL" ? handleSendOtp : (e) => e.preventDefault()
                }
                className="space-y-6"
              >
                {/* EMAIL */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold flex items-center gap-2">
                      <IconMail size={16} /> Work Email
                    </span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="admin@enterprise.com"
                    value={email}
                    disabled={step !== "EMAIL"}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* NEW PASSWORD (only after OTP verified) */}
                {step === "OTP_VERIFIED" && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold flex items-center gap-2">
                        <IconLock size={16} /> New Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        className="input input-bordered w-full pr-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 opacity-60 hover:opacity-100"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      >
                        {isPasswordVisible ? (
                          <IconEyeOff size={18} />
                        ) : (
                          <IconEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ACTION BUTTON */}
                <button
                  type={step === "OTP_VERIFIED" ? "button" : "submit"}
                  onClick={
                    step === "OTP_VERIFIED" ? handleResetPassword : undefined
                  }
                  className="btn btn-primary btn-block shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <IconLoader2 className="animate-spin" size={20} />
                  ) : step === "OTP_VERIFIED" ? (
                    "Reset Password"
                  ) : (
                    "Send OTP"
                  )}
                </button>

                <div className="text-center mt-4">
                  <Link
                    href="/login"
                    className="btn btn-neutral btn-outline btn-sm w-full gap-2 opacity-70 hover:opacity-100"
                  >
                    <IconChevronLeft size={16} />
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            /* SUCCESS */
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex p-4 bg-success/10 rounded-full text-success">
                <IconCircleCheck size={48} />
              </div>
              <h2 className="text-xl font-bold">Password Updated</h2>
              <p className="text-sm opacity-60">
                Your password has been reset successfully.
              </p>
              <Link href="/login" className="btn btn-primary btn-block">
                Login Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* OTP MODAL */}
      <dialog id="otpContainer" className="modal">
        <div className="modal-box text-center">
          <IconMail size={48} className="mx-auto text-primary mb-4" />
          <h3 className="font-black text-xl uppercase">Verify OTP</h3>
          <p className="text-sm opacity-70 mb-6">
            Enter the 6-digit code sent to your email
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                maxLength={1}
                className="input input-bordered w-12 h-14 text-center text-2xl font-bold"
                value={otp[index] ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    const arr = otp.split("");
                    arr[index] = val;
                    setOtp(arr.join(""));
                    if (val && index < 5) {
                      document.getElementById(`otp-${index + 1}`)?.focus();
                    }
                  }
                }}
                id={`otp-${index}`}
              />
            ))}
          </div>

          <button className="btn btn-primary w-full" onClick={verifyOtp}>
            Verify OTP
          </button>
        </div>
      </dialog>
    </div>
  );
}

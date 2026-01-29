"use client";

import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import axios, { AxiosResponse } from "axios";
import {
  IconEye,
  IconEyeOff,
  IconMail,
  IconUpload,
  IconUser,
  IconPhone,
  IconCircleCheck,
  IconLock,
  IconLoader2,
  IconUserPlus,
} from "@tabler/icons-react";

export default function RegisterPage() {
  const router = useRouter();

  // ---------------- State ----------------
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    profileImage: "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg?w=2000",
    otp: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // ---------------- Handlers ----------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.fullName.trim().length < 2)
      newErrors.fullName = "Name too short";
    if (!formData.email.includes("@"))
      newErrors.email = "Invalid business email";
    if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, "")))
      newErrors.phoneNumber = "10 digits required";
    if (formData.password.length < 6) newErrors.password = "Min 6 characters";

    if (!isEmailVerified) {
      toast.error("Please verify your email first");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verifyEmail = async () => {
    if (!formData.email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    const req = axios.post("/api/helper/verify-email", {
      email: formData.email,
      name: formData.fullName,
    });

    toast.promise(req, {
      loading: "Sending OTP...",
      success: (res) => {
        setOtpSent(res.data.token);
        (
          document.getElementById("otpContainer") as HTMLDialogElement
        ).showModal();
        return "OTP sent successfully";
      },
      error: "Failed to send OTP",
    });
  };

  const uploadImage = () => {
    if (!image) {
      toast.error("No image selected");
      return;
    }
    const imageResponse = axios.postForm("/api/helper/upload-img", {
      file: image,
      name: formData.fullName || "profile",
      folderName: "profileImages",
    });

    toast.promise(imageResponse, {
      loading: "Uploading image...",
      success: (data: AxiosResponse) => {
        setFormData((prev) => ({ ...prev, profileImage: data.data.path }));
        return "Image uploaded";
      },
      error: "Image upload failed",
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/register", formData);
      toast.success(`Welcome, ${formData.fullName}!`);
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[84.5vh] flex items-center justify-center bg-base-200 p-6">
      <div className="card w-full max-w-xl bg-base-100 shadow-2xl">
        <div className="card-body p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
              <IconUserPlus size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight italic">
                Vault<span className="text-primary">Pay</span>
              </h1>
              <p className="text-sm opacity-60">
                Enterprise Registration Portal
              </p>
            </div>
          </div>

          <form
            onSubmit={handleRegister}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Full Name */}
            <div className="form-control md:col-span-2">
              <label className="label-text font-bold mb-1 flex items-center gap-2">
                <IconUser size={16} /> Full Name
              </label>
              <input
                name="fullName"
                type="text"
                placeholder="John Doe"
                className={`input input-bordered w-full focus:input-primary ${errors.fullName ? "input-error" : ""}`}
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            {/* Email with Verification */}
            <div className="form-control md:col-span-2">
              <label className="label-text font-bold mb-1 flex items-center gap-2">
                <IconMail size={16} /> Work Email
              </label>
              <div className="join w-full">
                <input
                  name="email"
                  type="email"
                  className={`input input-bordered join-item w-full ${isEmailVerified ? "text-success border-success" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                />
                {!isEmailVerified ? (
                  <button
                    type="button"
                    className="btn btn-primary join-item"
                    onClick={verifyEmail}
                    disabled={!formData.email.includes("@")}
                  >
                    Verify
                  </button>
                ) : (
                  <div className="btn btn-disabled join-item no-animation bg-success/10 text-success">
                    <IconCircleCheck size={20} />
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-control">
              <label className="label-text font-bold mb-1 flex items-center gap-2">
                <IconPhone size={16} /> Phone
              </label>
              <input
                name="phoneNumber"
                type="tel"
                placeholder="1234567890"
                className={`input input-bordered w-full ${errors.phoneNumber ? "input-error" : ""}`}
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label-text font-bold mb-1 flex items-center gap-2">
                <IconLock size={16} /> Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 opacity-50 hover:opacity-100"
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

            {/* Profile Image */}
            {/* <div className="form-control md:col-span-2">
              <label className="label-text font-bold mb-1 flex items-center gap-2">
                <IconUpload size={16} /> Profile Picture
              </label>
              <div className="join w-full">
                <input
                  type="file"
                  className="file-input file-input-bordered join-item w-full"
                  onChange={(e) =>
                    e.target.files && setImage(e.target.files[0])
                  }
                />
                {image && !formData.profileImage && (
                  <button
                    type="button"
                    className="btn btn-secondary join-item"
                    onClick={uploadImage}
                  >
                    Upload
                  </button>
                )}
              </div>
              {formData.profileImage && (
                <div className="text-xs text-success mt-1 font-medium flex items-center gap-1">
                  <IconCircleCheck size={14} /> Image ready for submission
                </div>
              )}
            </div> */}

            {/* Submit */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-block shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <IconLoader2 className="animate-spin" />
                ) : (
                  "Establish Secure Account"
                )}
              </button>
              <p className="text-center text-sm mt-6">
                Already registered?{" "}
                <Link href="/login" className="link link-primary font-bold">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Dialog */}
      <dialog id="otpContainer" className="modal">
        <div className="modal-box text-center">
          <IconMail size={48} className="mx-auto text-primary mb-4" />
          <h3 className="font-black text-xl uppercase tracking-widest">
            Verify Email
          </h3>
          <p className="py-4 text-sm opacity-70">
            Enter the 6-digit code sent to your inbox.
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength={1}
                className="input input-bordered input-primary w-12 h-14 text-center text-2xl font-bold"
                value={formData.otp?.[index] ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    const otp = formData.otp.split("");
                    otp[index] = val;
                    const finalOtp = otp.join("");
                    setFormData({ ...formData, otp: finalOtp });
                    if (val && index < 5)
                      document
                        .getElementById(`otp-input-${index + 1}`)
                        ?.focus();
                  }
                }}
              />
            ))}
          </div>

          <div className="modal-action flex-col gap-2">
            <button
              className="btn btn-primary w-full"
              onClick={(e) => {
                e.preventDefault();
                if (formData.otp === otpSent) {
                  setIsEmailVerified(true);
                  (
                    document.getElementById("otpContainer") as HTMLDialogElement
                  ).close();
                  toast.success("Identity Verified");
                } else {
                  toast.error("Invalid Code");
                }
              }}
            >
              Verify OTP
            </button>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm">Cancel</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import {
  IconUser,
  IconPhone,
  IconCamera,
  IconDeviceFloppy,
  IconMail,
  IconShieldCheck,
  IconLoader2,
} from "@tabler/icons-react";
import axios from "axios";

export default function ProfileUpdatePage() {
  const { user, setUser } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Local state for the editable fields
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let finalImagePath = user?.profileImage;

      // 1. Upload new image if selected
      if (imageFile) {
        const uploadRes = await axios.postForm("/api/helper/upload-img", {
          file: imageFile,
          name: user?.email,
          folderName: "profileImages",
        });
        finalImagePath = uploadRes.data.path;
      }
      const response = await axiosInstance.put("/users/profile", {
        ...formData,
        profileImage: finalImagePath,
      });
      console.log("Update Response:", response.data);
      setUser(response.data);
      toast.success("Identity updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <IconUser size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Profile Settings
          </h1>
          <p className="text-sm opacity-50 uppercase tracking-widest font-bold">
            Personal Identity Hub
          </p>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-xl overflow-hidden">
        {/* Profile Image Section */}
        <div className="bg-base-200/50 p-8 flex flex-col items-center border-b border-base-300">
          <div className="relative group">
            <div className="avatar">
              <div className="w-32 h-32 rounded-2xl ring ring-primary ring-offset-base-100 ring-offset-2 shadow-2xl overflow-hidden bg-base-300">
                <img
                  src={
                    previewUrl ||
                    user?.profileImage ||
                    `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`
                  }
                  alt="Avatar"
                  className="object-cover"
                />
              </div>
            </div>
            <label className="absolute -bottom-3 -right-3 btn btn-circle btn-primary btn-sm shadow-xl cursor-pointer hover:scale-110 transition-transform">
              <IconCamera size={18} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <p className="mt-4 text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">
            Change Profile Mark
          </p>
        </div>

        <form onSubmit={handleUpdate} className="card-body gap-6">
          {/* Read-Only Security Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label-text font-bold opacity-50 mb-2 flex items-center gap-2">
                <IconMail size={14} /> Registered Email
              </label>
              <div className="input input-bordered bg-base-200 flex items-center gap-2 opacity-70 cursor-not-allowed">
                <span className="truncate text-sm font-medium">
                  {user?.email}
                </span>
                <IconShieldCheck size={16} className="text-success ml-auto" />
              </div>
            </div>

            <div className="form-control">
              <label className="label-text font-bold opacity-50 mb-2 flex items-center gap-2">
                <IconShieldCheck size={14} /> System Role
              </label>
              <div className="input input-bordered bg-base-200 flex items-center font-bold text-xs uppercase tracking-widest opacity-70 cursor-not-allowed">
                {user?.role}
              </div>
            </div>
          </div>

          <div className="divider opacity-50">Editable Details</div>

          {/* Editable Fields */}
          <div className="form-control">
            <label className="label-text font-bold mb-2 flex items-center gap-2">
              <IconUser size={16} className="text-primary" /> Full Legal Name
            </label>
            <input
              type="text"
              className="input input-bordered focus:input-primary font-medium"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-control">
            <label className="label-text font-bold mb-2 flex items-center gap-2">
              <IconPhone size={16} className="text-primary" /> Primary Phone
              Number
            </label>
            <input
              type="tel"
              className="input input-bordered focus:input-primary font-mono"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="10 digit mobile number"
              required
            />
          </div>

          <div className="card-actions mt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="btn btn-primary btn-block shadow-lg shadow-primary/20"
            >
              {isUpdating ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                <>
                  <IconDeviceFloppy size={20} />
                  Synchronize Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 p-4 bg-info/5 border border-info/20 rounded-xl flex gap-4 items-start">
        <IconShieldCheck className="text-info shrink-0" />
        <p className="text-xs opacity-70 leading-relaxed">
          <strong>Security Note:</strong> Sensitive fields like Email and Access
          Roles are locked to prevent unauthorized identity tampering. To change
          these, please contact the VaultPay Enterprise Support.
        </p>
      </div>
    </div>
  );
}

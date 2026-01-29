import axiosInstance from "@/lib/axios";
import { NextRequest, NextResponse } from "next/server";
import forgotPassword from "@/config/forgotPassword";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }
    const res = await axiosInstance.post("/auth/check-email", { email });
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    await forgotPassword(email, token, res.data.fullName);
    return NextResponse.json(
      { message: "OTP sent", otp: token },
      { status: 200 },
    );
  } catch (error: any) {
    console.log("Forgot Password Error:", error.message);
    return NextResponse.json(
      { message: "If the email exists, an OTP has been sent" },
      { status: 500 },
    );
  }
}

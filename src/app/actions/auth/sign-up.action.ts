"use server";
import { auth } from "@/common/lib/auth";
import { ServerActionType } from "@/common/types/api"; // Assuming you have this type
import { devLogger } from "@/common/utils/dev-logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";



export default async function signupAction(
  _prevState: ServerActionType,
  formData: FormData
): Promise<ServerActionType> {
  try {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!username || !email || !password) {
      return {
        status: "error",
        error: "Username, email, and password are required.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        status: "error",
        error: "Please enter a valid email address.",
      };
    }

    await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        name: username,
        email,
        password,
      },
    });

    return {
      status: "success",
      message: "Account created successfully! Please check your email to verify your account.",
    };
  } catch (error) {
    if (error instanceof APIError) {
      devLogger.error("API error during signup", error);

      switch (error.status) {
        case "UNPROCESSABLE_ENTITY":
          return {
            status: "error",
            error: "A user with this email already exists.",
          };
        case "BAD_REQUEST":
          return {
            status: "error",
            error: "Invalid input provided. Please check your details.",
          };
        default:
          return {
            status: "error",
            error: error.message || "Signup failed. Please try again.",
          };
      }
    }

    devLogger.error("Unexpected error during signup", error);
    return {
      status: "error",
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

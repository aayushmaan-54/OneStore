"use server";
import { auth } from "@/common/lib/auth";
import { devLogger } from "@/common/utils/dev-logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { ServerActionType } from "@/common/types/api";



export default async function forgotPasswordAction(
  _prevState: ServerActionType | null,
  formData: FormData
): Promise<ServerActionType> {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      return {
        status: "error",
        error: "Email address is required.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        status: "error",
        error: "Please enter a valid email address.",
      };
    }

    await auth.api.forgetPassword({
      headers: await headers(),
      body: { email },
    });

    return {
      status: "success",
      message: "If an account with that email exists, we've sent you an OTP to reset your password.",
    };
  } catch (error) {
    if (error instanceof APIError) {
      devLogger.error("API error during forgot password", error);
      const errCode = error.body ? error.body.code : "UNKNOWN";

      switch (error.status) {
        case "BAD_REQUEST":
          return {
            status: "error",
            error: "Invalid email format.",
          };
        case "NOT_FOUND":
          return {
            status: "error",
            error: "No account found with that email address."
          };
        case "INTERNAL_SERVER_ERROR":
          if (errCode === "EMAIL_SEND_FAILED") {
            return {
              status: "error",
              error: "Failed to send password reset email. Please try again later.",
            };
          }
        default:
          return {
            status: "error",
            error: error.message || "Failed to send password reset OTP. Please try again.",
          };
      }
    }

    devLogger.error("Unexpected error during forgot password", error);
    return {
      status: "error",
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

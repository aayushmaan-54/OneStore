"use server";
import { auth } from "@/common/lib/auth";
import { ServerActionType } from "@/common/types/api";
import { devLogger } from "@/common/utils/dev-logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";



export default async function resetPasswordAction(
  _prevState: ServerActionType | null,
  formData: FormData
): Promise<ServerActionType> {
  try {
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const token = formData.get("token") as string;

    if (!newPassword || !confirmPassword || !token) {
      return {
        status: "error",
        error: "All fields are required (new password, confirm password, and reset token).",
      };
    }

    if (newPassword.length < 8) {
      return {
        status: "error",
        error: "New password must be at least 8 characters long.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        status: "error",
        error: "Passwords do not match.",
      };
    }

    if (!token) {
      return {
        status: "error",
        error: "Invalid password reset link. Token missing."
      };
    }

    await auth.api.resetPassword({
      headers: await headers(),
      body: {
        newPassword: newPassword,
        token: token,
      },
    });

    return {
      status: "success",
      message: "Password reset successfully! Please log in with your new password.",
    };

  } catch (error) {
    if (error instanceof APIError) {
      devLogger.error("API error during password reset", error);
      const errCode = error.body ? error.body.code : "UNKNOWN";

      switch (error.status) {
        case "BAD_REQUEST":
          return {
            status: "error",
            error: "Invalid request. Please check your inputs.",
          };
        case "UNAUTHORIZED":
          if (errCode === "INVALID_TOKEN" || errCode === "EXPIRED_TOKEN") {
            return {
              status: "error",
              error: "Invalid or expired reset link. Please request a new one.",
            };
          }
          return {
            status: "error",
            error: "Authentication failed. Invalid token.",
          };
        case "NOT_FOUND":
          return {
            status: "error",
            error: "No account found for this reset link."
          };
        default:
          return {
            status: "error",
            error: error.message || "Password reset failed. Please try again.",
          };
      }
    }

    devLogger.error("Unexpected error during password reset", error);
    return {
      status: "error",
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

"use server";
import { auth } from "@/common/lib/auth";
import { ServerActionType } from "@/common/types/api";
import { devLogger } from "@/common/utils/dev-logger";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



export default async function loginAction(
  _prevState: ServerActionType,
  formData: FormData
): Promise<ServerActionType> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        status: "error",
        error: "Email and password are required.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        status: "error",
        error: "Please enter a valid email address.",
      };
    }

    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
    });

    redirect(process.env.NEXT_PUBLIC_AUTH_REDIRECT!);
  } catch (error) {
    if (error instanceof APIError) {
      devLogger.error("API error during login", error);
      const errCode = error.body ? error.body.code : "UNKNOWN";

      switch (error.status) {
        case "UNAUTHORIZED":
          return {
            status: "error",
            error: "Invalid email or password.",
          };
        case "BAD_REQUEST":
          return {
            status: "error",
            error: "Invalid email format.",
          };
        default:
          if (errCode === "EMAIL_NOT_VERIFIED") {
            return {
              status: "error",
              error: "Email not verified.",
            };
          } else {
            return {
              status: "error",
              error: error.message || "Login failed. Please try again.",
            };
          }
      }
    }

    devLogger.error("Unexpected error during login", error);
    return {
      status: "error",
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

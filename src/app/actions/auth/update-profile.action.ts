"use server";
import { auth } from "@/common/lib/auth";
import db from "@/common/lib/db";
import { ServerActionType } from "@/common/types/api";
import { devLogger } from "@/common/utils/dev-logger";
import { userDataTable } from "@/drizzle/schema";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";



export default async function updateProfileAction(
  _prevState: ServerActionType | null,
  formData: FormData
): Promise<ServerActionType> {
  try {
    const username = formData.get("username") as string;
    const address = formData.get("address") as string;
    const phoneNumber = formData.get("phoneNumber") as string;

    if (!username || username.trim().length < 2 || username.trim().length > 50) {
      return {
        status: "error",
        error: "Username must be between 2 and 50 characters.",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return {
        status: "error",
        error: "Authentication required. Please log in.",
      };
    }


    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: username.trim(),
      },
    });

    await db.insert(userDataTable).values({
      userId: session.user.id,
      address: address.trim(),
      phone: phoneNumber.trim(),
    }).onConflictDoUpdate({
      target: userDataTable.userId,
      set: {
        address: address.trim(),
        phone: phoneNumber.trim(),
      },
    });


    return {
      status: "success",
      message: "Profile updated successfully!",
    };
  } catch (error) {
    if (error instanceof APIError) {
      devLogger.error("API error during profile update", error);
      return {
        status: "error",
        error: error.message || "Failed to update profile. Please try again.",
      };
    }
    devLogger.error("Unexpected error during profile update", error);
    return {
      status: "error",
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

import checkAuth from "./check-auth";
import db from "../lib/db";
import { eq } from "drizzle-orm";
import { userDataTable } from "@/drizzle/schema";



export default async function isAdmin() {
  const session = await checkAuth();
  if (!session) return false;

  const userData = await db
    .select({
      role: userDataTable.role,
    })
    .from(userDataTable)
    .where(eq(userDataTable.userId, session.user.id))
    .limit(1);

  if (!userData || userData.length === 0 || userData[0].role !== "admin") {
    return false;
  }

  return true;
}



export async function isUserAdmin(userId: string | null) {
  if (!userId) {
    return false;
  }

  const userData = await db
    .select({
      role: userDataTable.role,
    })
    .from(userDataTable)
    .where(eq(userDataTable.userId, userId))
    .limit(1);

  if (!userData || userData.length === 0 || userData[0].role !== "admin") {
    return false;
  }

  return true;
}

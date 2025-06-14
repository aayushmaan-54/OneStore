import { auth } from "../lib/auth";
import { headers } from "next/headers";


export default async function checkAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return null;
  return session;
}

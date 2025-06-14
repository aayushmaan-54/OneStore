import { createAuthClient } from "better-auth/react";


const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL as string,
});

export default authClient;

import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/common/lib/db";
import { sendEmail } from "./send-email";
import EmailVerify from "@/common/emails/email-verify";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins"
import ResetPassword from "../emails/reset-password";
import normalizeUsername from "../utils/normalize-username";
import { devLogger } from "../utils/dev-logger";
import toast from 'react-hot-toast';



export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 64,
    requireEmailVerification: true,
    autoSignIn: true,

    sendResetPassword: async ({ user, token }) => {
      const resetPasswordUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/${token}?callbackURL=${process.env.NEXT_PUBLIC_PASSWORD_RESET_REDIRECT}`;

      devLogger.info("Reset Password URL", resetPasswordUrl);

      await sendEmail({
        to: user.email,
        subject: "Reset your OneStore password",
        reactTemplate: ResetPassword({ email: user.email, resetUrl: resetPasswordUrl }),
      });
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          let name = user.name;
          if (name) {
            name = normalizeUsername(name);
          } else {
            name = "user" + Date.now().toString().slice(-5);
          }
          return { data: { ...user, name } };
        },
      },
    },
  },

  user: {
    deleteUser: {
      enabled: true
    }
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_REDIRECT}`;

      devLogger.info("Email Verification URL", verificationUrl);

      const response = await sendEmail({
        to: user.email,
        subject: "Verify your OneStore account",
        reactTemplate: EmailVerify({ username: user.name, verificationUrl })
      });

      if (!response.success) {
        devLogger.error("Failed to send verification email", response);
        toast.error(response.message || "Failed to send verification email");
      }
    },
    expiresIn: 3600 // 1 hour
  },

  account: {
    accountLinking: {
      enabled: true,
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  advanced: {
    ipAddress: {
      ipAddressHeaders: [
        "x-forwarded-for",
        "x-vercel-forwarded-for",
        "x-real-ip",
      ],
      disableIpTracking: false,
    },
  },

  plugins: [
    openAPI(), // /api/auth/reference, /api/auth/openapi
    nextCookies(),  // should be the last plugin in the list
  ],
} satisfies BetterAuthOptions);

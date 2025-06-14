"use client";
import forgotPasswordAction from "@/app/actions/auth/forgot-password.action";
import { Button } from "@/components/ui/button";
import Form from 'next/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { devLogger } from "@/common/utils/dev-logger";
import { ServerActionType } from "@/common/types/api";



export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ServerActionType, FormData>(
    forgotPasswordAction,
    null
  );


  useEffect(() => {
    if (state?.status === "success") {
      toast.success(state.message || "Password reset instructions sent.");
    } else if (state?.status === "error") {
      devLogger.error("Error in forgot password submission", state.error);
      toast.error(state.error ?? "Failed to send password reset OTP. Please try again.");
    }
  }, [state]);


  return (
    <div className="relative max-w-7xl mx-auto">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center px-4">
        <Card className="w-full mt-40 max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Mail className="h-6 w-6 text-secondary-foreground" />
            </div>
            <CardTitle>Forgot your password?</CardTitle>
            <CardDescription>
              No worries! Enter your email address and we'll send you an OTP to reset your password.
            </CardDescription>
          </CardHeader>


          <Form action={formAction}>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 mt-5">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending OTP..." : "Send Reset OTP"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Button variant="link" className="p-0 h-auto font-normal" asChild>
                  <Link href="/login">Sign in here</Link>
                </Button>
              </div>
            </CardFooter>
          </Form>
        </Card>
      </div>
    </div>
  );
}

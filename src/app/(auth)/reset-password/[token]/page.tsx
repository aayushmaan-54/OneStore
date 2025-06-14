"use server"
import ResetPasswordForm from "./_components/reset-password-form";



export default async function OTPVerificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ callbackURL: string; email?: string }>;
}) {
  const { token } = await params;
  const { callbackURL } = await searchParams;

  return (
    <ResetPasswordForm
      token={token}
      callbackURL={callbackURL}
    />
  );
}

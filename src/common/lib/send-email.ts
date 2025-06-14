import { ReactElement } from "react";
import type { ApiResponse } from "@/common/types/api";
import sendgrid from "@sendgrid/mail";
import { render } from "@react-email/components";
import { devLogger } from "../utils/dev-logger";


sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({
  to,
  subject,
  reactTemplate,
  from = process.env.EMAIL_FROM!,
}: {
  to: string;
  subject: string;
  reactTemplate: ReactElement;
  from?: string;
}): Promise<ApiResponse<unknown>> {
  try {
    const emailHtml = await render(reactTemplate);

    const options = {
      from,
      to,
      subject,
      html: emailHtml,
    }

    const response = await sendgrid.send(options);

    return {
      success: true,
      message: "Email sent successfully!",
      data: response,
    };
  } catch (error) {
    devLogger.error("Email sending failed:", error);
    return {
      success: false,
      message: "Email sending failed. Please try again later.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

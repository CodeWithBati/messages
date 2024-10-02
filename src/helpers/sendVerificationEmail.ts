import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {

        await resend.emails.send({
            from: 'contact@devbati.com',
            to: email,
            subject: 'My Message - Verification Code',
            react: VerificationEmail({ username, otp: verifyCode }),
          });

        return {
            success: true,
            message: "Verififcation sended",
        };
    } catch (email_error) {
        console.log(email_error);
        return {
            success: false,
            message: "Failed to send verification email",
        };
    }
}
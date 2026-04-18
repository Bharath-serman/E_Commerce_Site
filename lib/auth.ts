import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

console.log("=== Auth Configuration Loading ===");
console.log("Resend configured:", !!resend);
console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }: { user: any; url: string; token: string }, request: any) => {
      console.log("=== Email Verification Debug ===");
      console.log("Resend configured:", !!resend);
      console.log("User email:", user.email);
      console.log("Verification URL:", url);
      console.log("Token:", token);

      if (!resend) {
        console.log("Resend not configured. Verification email would be sent to:", user.email);
        console.log("Verification URL:", url);
        return;
      }

      try {
        console.log("Attempting to send email via Resend...");
        const result = await resend.emails.send({
          from: "Aesthetic <noreply@resend.dev>",
          to: user.email,
          subject: "Verify your email address",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify your email address</title>
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f4f4f5;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
                  <tr>
                    <td style="padding: 40px 20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                        <tr>
                          <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e4e4e7;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; color: #000000;">AESTHETIC</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 40px 40px 20px 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 500; color: #18181b;">Welcome to Aesthetic!</h2>
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #52525b;">
                              Thank you for creating an account. Please verify your email address by clicking the button below:
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                              <tr>
                                <td style="background-color: #000000; border-radius: 2px;">
                                  <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; color: #ffffff; border-radius: 2px;">Verify Email</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px 40px 40px 40px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #71717a;">
                              If the button above doesn't work, you can copy and paste the following link into your browser:
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.6; color: #71717a; word-break: break-all;">
                              <a href="${url}" target="_blank" style="color: #000000; text-decoration: underline;">${url}</a>
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #71717a;">
                              If you didn't create an account, you can safely ignore this email.
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 20px 40px; background-color: #f4f4f5; border-top: 1px solid #e4e4e7; border-radius: 0 0 4px 4px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa; text-align: center;">
                              © 2024 Aesthetic. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        });
        console.log("Verification email sent successfully to:", user.email);
        console.log("Resend response:", result);
      } catch (error) {
        console.error("Failed to send verification email:", error);
        console.log("Error details:", JSON.stringify(error, null, 2));
        console.log("Verification URL (manual):", url);
        throw error;
      }
    },
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: true,
      redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/google`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    cookiePrefix: "aesthetic",
  },
  db: {
    user: "user",
    session: "session",
    account: "account",
    verification: "verification",
  },
});

export type Session = typeof auth.$Infer.Session;

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../generated/prisma/client";
import { admin } from "better-auth/plugins";
import { sendEmail } from "./email.js";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const promise = sendEmail({
        to: user.email,
        subject: "Verifizieren Sie Ihre E-Mail-Adresse",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>E-Mail-Verifizierung</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">
                  <h1 style="margin: 0; color: #1f2937; font-size: 24px;">E-Mail-Verifizierung</h1>
                </div>

                <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">
                  Hallo ${user.name},
                </p>

                <p style="font-size: 14px; color: #4b5563; margin-bottom: 24px;">
                  Vielen Dank für Ihre Registrierung bei voglerhub. Bitte verifizieren Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                    E-Mail verifizieren
                  </a>
                </div>

                <p style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">
                  Falls die Schaltfläche nicht funktioniert, kopieren Sie bitte diesen Link in Ihren Browser:
                </p>
                <p style="font-size: 12px; color: #3b82f6; word-break: break-all; margin-bottom: 24px;">
                  ${url}
                </p>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; color: #6b7280; font-size: 12px;">
                  <p style="margin: 0;">Wenn Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      // 🔐 verhindert Timing Attacks
      // 📨 garantiert Mail-Versand auf Vercel
      request?.waitUntil?.(promise);
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  appUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  plugins: [
    admin({
      roles: ["admin", "kassenwart", "trainer"],
      defaultRole: "trainer",
      adminRole: "admin",
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Send notification email to admin when a new user signs up
          try {
            const { sendAdminNewUserNotification } = await import(
              "./send-new-user-email.js"
            );
            await sendAdminNewUserNotification(user);
          } catch (error) {
            console.error(
              "Error sending admin notification for new signup:",
              error
            );
            // Don't throw - we don't want to fail the signup if email fails
          }
        },
      },
    },
  },
});

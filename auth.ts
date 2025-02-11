import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { sendEmail } from "./actions/email";
import { openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  // Modifico la duración de la session
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    // Para que no tenga que hacer el fech cada vez que necesita la session
    cookieCache:{
      enabled: true,
      maxAge: 5 * 60 // Duración en segundos del Cache
    }
  },
  // Agrego otro campo a la colección User
  user: {
    additionalFields: {
      premium: {
        type: "boolean",
        required: false,
      },
    },
    // En caso de cambiar el mail del usuario se manda un mail para confirmar el nuevo email
    // Esto nos habilita a implementar en "use client":
  //   await authClient.changeEmail({
  //     newEmail: "new-email@email.com",
  //     callbackURL: "/dashboard", //to redirect after verification
  // });
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({  newEmail, url }) => {
        await sendEmail({
          to: newEmail,
          subject: "Verify your email address",
          text: `Click the link to verify your email: ${url}`,
        });
      },
    }
  },
  // Modifico la cantidad de intentos fallidos de login. Solo funciona en producción
  rateLimit: {
    window: 10, // time window in seconds
    max: 100, // max requests in the window
    customRules: {
      "/sign-in/email": {
        window: 10,
        max: 3,
      },
      "/two-factor/*":  {
                
                    window: 10,
                    max: 3,
               
            }
    }
  },
  
  // En el caso que un usuario use un proveedor social, se le permitirá vincular su cuenta con otro proveedor social
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github", "google"],
    }
  },
  // OAuth
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }
  },
  plugins: [openAPI(), admin()],  // api/auth/reference
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({user, token}) => {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION__CALLBACK_URL}`;
      await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          text: `Click the link to verify your email: ${verificationUrl}`,
      })
    }
  }
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

const db = getDb();

export const authOptions: any = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await db.query(
            "SELECT id, email, password_hash, name, provider FROM users WHERE email = $1",
            [credentials.email]
          );

          if (result.rows.length === 0) {
            return null;
          }

          const user = result.rows[0];

          // Check if user has a password (credentials provider)
          if (!user.password_hash) {
            return null;
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password_hash
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      // Set token data from user object if available (credentials provider)
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      // For OAuth providers, fetch user by email to get correct database ID
      if ((account || profile) && !token.userId) {
        const email = user?.email || profile?.email;
        if (email) {
          try {
            const result = await db.query(
              "SELECT id, email, name FROM users WHERE email = $1",
              [email]
            );
            if (result.rows.length > 0) {
              const dbUser = result.rows[0];
              token.userId = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name || token.name;
            }
          } catch (error) {
            console.error("Error fetching user in JWT callback:", error);
          }
        }
      }

      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;

        // If userId looks like a Google ID (not a UUID), fetch the correct one
        if (token.userId && !token.userId.includes("-") && token.email) {
          try {
            const result = await db.query(
              "SELECT id FROM users WHERE email = $1",
              [token.email]
            );
            if (result.rows.length > 0) {
              session.user.id = result.rows[0].id;
            }
          } catch (error) {
            console.error("Error fixing user ID in session:", error);
          }
        }
      }
      return session;
    },

    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        try {
          const existingUser = await db.query(
            "SELECT id, email, name FROM users WHERE email = $1",
            [profile?.email]
          );

          if (existingUser.rows.length > 0) {
            const existingUserData = existingUser.rows[0];
            // Update provider info if not already set
            await db.query(
              "UPDATE users SET provider = $1, provider_id = $2, name = $3 WHERE email = $4",
              ["google", account.providerAccountId, profile?.name || existingUserData.name, profile?.email]
            );
            // Return user so session is properly created
            return {
              id: existingUserData.id,
              email: existingUserData.email,
              name: profile?.name || existingUserData.name,
            };
          }

          // Create new user from Google profile
          const result = await db.query(
            "INSERT INTO users (email, name, provider, provider_id) VALUES ($1, $2, $3, $4) RETURNING id, email, name",
            [profile?.email, profile?.name, "google", account.providerAccountId]
          );

          const newUser = result.rows[0];
          // Return the newly created user so session is properly created
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }

      return true;
    },
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      },
    },
  },
};

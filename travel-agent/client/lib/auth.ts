
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Get the base URL - support both localhost and Codespaces
const getBaseURL = () => {
  if (process.env.CODESPACE_NAME) {
    return `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: getBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET || "tripcraft-ai-secret-key-change-in-production",
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    /\.app\.github\.dev$/,  // Allow all Codespaces URLs
  ],
});

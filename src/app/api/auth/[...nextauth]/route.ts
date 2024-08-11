import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth"; // Adjust the path based on your project structure

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

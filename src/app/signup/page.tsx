"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { addUserToFirestore } from "@/lib/firestoreUtils";
import Image from "next/image";
import googleLogo from "../../../public/google.png";
import githubLogo from "../../../public/github.png";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await addUserToFirestore({
        uid: user.uid,
        email: user.email || "unknown@example.com",
        name: user.displayName || "Anonymous",
      });
      router.push("/timeline"); // Redirect to the timeline page after successful sign-up
    } catch (error) {
      setError("Error signing up. Please try again.");
      console.error("Sign-up error:", error);
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/timeline" });
  };

  const handleGithubSignUp = () => {
    signIn("github", { callbackUrl: "/timeline" });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center mt-10 p-10 shadow-md">
        <h1 className="mt-10 mb-4 text-4xl font-bold">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSignup} className="w-full flex flex-col items-center">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-4 p-2 border rounded w-64 text-black" // Added text-black class
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-4 p-2 border rounded w-64 text-black" // Added text-black class
          />
          <button type="submit" className="w-64 p-2 bg-blue-500 text-white rounded">
            Sign Up with Email
          </button>
        </form>
        <div className="w-full flex flex-col items-center mt-4">
          <button
            onClick={handleGoogleSignUp}
            className="w-64 p-2 mb-4 bg-red-500 text-white rounded flex items-center justify-center"
          >
            <Image src={googleLogo} alt="Google Logo" width={20} height={20} />
            <span className="ml-2">Sign Up with Google</span>
          </button>
          <button
            onClick={handleGithubSignUp}
            className="w-64 p-2 bg-gray-800 text-white rounded flex items-center justify-center"
          >
            <Image src={githubLogo} alt="Github Logo" width={20} height={20} />
            <span className="ml-2">Sign Up with GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}

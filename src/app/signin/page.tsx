"use client";

import { useState } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import {
  GoogleSignInButton,
  GithubSignInButton,
} from "@/components/Chat/authButtons";
import { CredentialsForm } from "@/components/Chat/credentialsForm";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      const result = await signIn("google", { callbackUrl: "/" });
      if (result?.error) {
        setError(result.error);
      }
    }
  };

  const handleGithubLogin = async () => {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      const result = await signIn("github", { callbackUrl: "/" });
      if (result?.error) {
        setError(result.error);
      }
    }
  };

  const handleEmailPasswordLogin = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/");
    } else {
      setError(result?.error || "Login failed. Please check your credentials.");
    }
  };

  const handleSignUp = () => {
    // Redirect to the signup page
    router.push("/signup");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center mt-10 p-10 shadow-md">
        <h1 className="mt-10 mb-4 text-4xl font-bold">Sign In</h1>
        <CredentialsForm onSubmit={handleEmailPasswordLogin} />
        <span className="text-2xl font-semibold text-white text-center mt-8">
          Or
        </span>
        <GoogleSignInButton onClick={handleGoogleLogin} />
        <GithubSignInButton onClick={handleGithubLogin} />
        {error && <p className="text-red-500 mt-4">{error}</p>}
        
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Add the CredentialsFormProps interface here
interface CredentialsFormProps {
  csrfToken?: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function CredentialsForm({ onSubmit }: CredentialsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      await onSubmit(email, password);
    } catch (err) {
      setError("Your Email or Password is wrong!");
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <form
      className="w-full mt-8 text-xl text-black font-semibold flex flex-col"
      onSubmit={handleSubmit}
    >
      {error && (
        <span className="p-4 mb-2 text-lg font-semibold text-white bg-red-500 rounded-md">
          {error}
        </span>
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="w-full px-4 py-4 mb-4 border border-gray-300 rounded-md"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        className="w-full px-4 py-4 mb-4 border border-gray-300 rounded-md"
      />

      <div className="flex w-full justify-between">
        <button
          type="submit"
          className="w-1/2 h-12 px-6 text-lg text-white transition-colors duration-150 bg-blue-600 rounded-lg focus:shadow-outline hover:bg-blue-700"
        >
          Log in
        </button>
        <button
          type="button"
          onClick={handleSignUp}
          className="w-1/2 h-12 px-6 text-lg text-white transition-colors duration-150 bg-blue-600 rounded-lg focus:shadow-outline hover:bg-blue-700 ml-4"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}

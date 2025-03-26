import { useRouter } from "next/router";

export default function Welcome() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to Our Blog</h1>
      <div className="space-x-4">
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-blue-500 text-white px-6 py-2 rounded"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/auth/signup")}
          className="bg-green-500 text-white px-6 py-2 rounded"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

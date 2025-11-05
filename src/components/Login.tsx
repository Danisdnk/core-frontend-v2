import React, { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export default function Login() {
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login({ email, password });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <form
        onSubmit={handleSubmit}
        className="fieldset bg-base-100 border-base-300 rounded-box border p-6 w-80 shadow-md"
      >
        <legend className="fieldset-legend text-lg font-semibold mb-3">
          Login
        </legend>

        <label className="label">Email</label>
        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="email@dominio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="label mt-2">Password</label>
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-error text-sm mt-3 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-neutral w-full mt-4"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Login"}
        </button>
      </form>
    </div>
  );
}

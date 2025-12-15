import React, { useEffect, useMemo, useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { Eye, EyeOff } from "lucide-react";
import { getAccessToken, isAccessTokenValid } from "../utils";
import { useNavigate } from "react-router-dom";
import { captureRedirectUrlOnce, REDIRECT_KEY } from "../utils/url.handler";

export default function Login() {
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const capturedRedirect = useMemo(() => captureRedirectUrlOnce(), []);
  useEffect(() => {
    const dest = capturedRedirect || sessionStorage.getItem(REDIRECT_KEY);

    const accessToken = getAccessToken();
    if (!accessToken) return;

    if (!isAccessTokenValid()) {
      console.log("Token Invalido", accessToken);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("expires_in");
      return;
    }

    // if (dest) window.location.href = dest; //aca deberia estar el repreguntar si continuar con la sesion antes de mandar a este dest
    if (dest) console.log(dest);
    navigate("/home", { replace: true });
  }, [capturedRedirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login({ email, password });
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-base-200">
      <div className="relative z-10 flex justify-center items-center w-full">
        <form
          onSubmit={handleSubmit}
          className="fieldset bg-base-100 border-base-300 rounded-box border p-6 w-80 shadow-md"
        >
          <legend className="fieldset-legend text-lg font-semibold mb-3">
            CampusConnect Login
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input input-bordered w-full pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-error text-sm mt-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

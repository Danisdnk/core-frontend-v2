import React, { useEffect, useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenValid,
  isRefreshTokenValid,
} from "../utils";
import { captureRedirectUrlOnce, REDIRECT_KEY } from "../utils/url.handler";
import { useContinueSession } from "../hooks/useContinueSession";

export default function Login() {
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    isModalOpen,
    isBusy,
    interceptSubmitIfNeeded,
    confirmContinue,
    cancelContinue,
    getDestino,
  } = useContinueSession();

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");
    sessionStorage.removeItem("external_access_token");
    sessionStorage.removeItem(REDIRECT_KEY);
  }

  useEffect(() => {
    const captured = captureRedirectUrlOnce();
    console.log("[LOGIN] captureRedirectUrlOnce:", captured);

    const dest = sessionStorage.getItem(REDIRECT_KEY);
    console.log("[LOGIN] dest session:", dest);

    const accessToken = getAccessToken();
    if (!accessToken) return;

    if (!isAccessTokenValid()) {
      console.log("[LOGIN] Access inválido");
      if (!isRefreshTokenValid()) console.log("[LOGIN] Refresh inválido:", getRefreshToken());
      logout();
      return;
    }

    // Si está logueado y NO hay redirect, va a home
    if (!dest) navigate("/home", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[LOGIN] submit");

    // 1) si aplica “continuar sesión para portal”, abre modal y corta
    const intercepted = interceptSubmitIfNeeded();
    console.log("[LOGIN] intercepted:", intercepted);
    if (intercepted) return;

    // 2) caso normal: login con credenciales
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
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-error text-sm mt-3 text-center">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={loading || isBusy}
          >
            {loading || isBusy ? "Ingresando..." : "Login"}
          </button>
        </form>
      </div>

      <dialog className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Continuar sesión</h3>
          <p className="py-4">Hay una sesión válida. ¿Volver al portal?</p>

          <p className="text-xs opacity-70 break-all">Destino: {getDestino() ?? "-"}</p>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmContinue}
              disabled={isBusy}
            >
              Continuar
            </button>

            <button
              type="button"
              className="btn"
              onClick={cancelContinue}
              disabled={isBusy}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={cancelContinue}>close</button>
        </form>
      </dialog>
    </div>
  );
}

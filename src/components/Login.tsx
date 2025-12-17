import React, { useEffect, useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { Eye, EyeOff, UserCircle2, LogIn, ShieldCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  getRefreshToken,
  getUserFromToken,
  isAccessTokenValid,
  isRefreshTokenValid,
} from "../utils";
import { captureRedirectUrlOnce, logoutLocal } from "../utils/url.handler";
import { useContinueSession } from "../hooks/useContinueSession";

function initialsFromName(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const a = parts[0]?.[0] ?? "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
}

export default function Login() {
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [welcome, setWelcome] = useState(false);
  const [userLoggedOut, setUserLoggedOut] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [displayName, setDisplayName] = useState("Usuario");

  const navigate = useNavigate();

  const {
    isModalOpen,
    isBusy,
    interceptSubmitIfNeeded,
    confirmContinue,
    cancelContinue,
  } = useContinueSession();

  function evaluateWelcomeFlow() {
    if (userLoggedOut) return;

    const captured = captureRedirectUrlOnce();
    console.log("[LOGIN] captured redirect:", captured);

    const accessToken = getAccessToken();
    if (!accessToken) {
      setWelcome(false);
      return;
    }

    const accessValid = isAccessTokenValid();
    setWelcome(accessValid);

    if (!accessValid) {
      console.log("[LOGIN] Access inválido");
      if (isRefreshTokenValid()) {
        console.log("[LOGIN] Refresh válido:", getRefreshToken());
      } else {
        logoutLocal();
      }
      return;
    }

    if (!captured) navigate("/home", { replace: true });
  }

  useEffect(() => {
    const ext = sessionStorage.getItem("external_access_token");
    if (ext && ext !== localStorage.getItem("access_token")) {
      console.log("[LOGIN] sync external_access_token -> localStorage");
      localStorage.setItem("access_token", ext);
    }

    evaluateWelcomeFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, userLoggedOut]);

  useEffect(() => {
    const u = getUserFromToken();
    setDisplayName(u?.name ?? "Usuario");
  }, [welcome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[LOGIN] submit login");
    const intercepted = interceptSubmitIfNeeded();
    console.log("[LOGIN] intercepted:", intercepted);

    if (intercepted) return;

    if (!email || !password) return;
    await login({ email, password });
  };

  const handleUnloggeed = () => {
    console.log("[LOGIN] No soy yo -> logout");
    setWelcome(false);
    setUserLoggedOut(true);
    logoutLocal();
  };

  const handleSubmitWelcome = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[LOGIN] submit welcome");
    const dest = captureRedirectUrlOnce();
    console.log("[LOGIN] welcome dest:", dest);

    if (dest) {
      await confirmContinue();
      return;
    }

    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      {/* CARD CONTENEDORA */}
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        {/* HEADER */}
        <div className="card-body">
          {welcome ? (
            <>
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-14 h-14 flex items-center justify-center">
                    <span className="text-xl font-bold leading-none">
                      {initialsFromName(displayName)}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-success" />
                    <h2 className="card-title text-base sm:text-lg">
                      Sesión detectada
                    </h2>
                  </div>
                  <p className="text-sm opacity-80 truncate">
                    {displayName}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-base-300 p-4 bg-base-200/40">
                <p className="text-sm">
                  Bienvenido de nuevo,{" "}
                  <span className="font-semibold">{displayName}</span>.
                </p>
                <p className="text-xs opacity-70 mt-1">
                  Podés continuar con la sesión existente o cerrar sesión y entrar con otra cuenta.
                </p>
              </div>

              {error && (
                <div className="alert alert-error mt-4">
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="card-actions mt-5 flex-col gap-2">
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={handleSubmitWelcome}
                  disabled={loading || isBusy}
                >
                  <LogIn className="w-4 h-4" />
                  {loading || isBusy ? "Ingresando..." : "Continuar con mi sesión"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline w-full"
                  onClick={handleUnloggeed}
                  disabled={loading || isBusy}
                >
                  <LogOut className="w-4 h-4" />
                  No soy yo
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <UserCircle2 className="w-7 h-7 text-primary" />
                <h2 className="card-title">CampusConnect</h2>
              </div>
              <p className="text-sm opacity-70">
                Ingresá con tus credenciales.
              </p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="email@dominio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input input-bordered w-full pr-11"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading || isBusy}
                >
                  {loading || isBusy ? "Ingresando..." : "Login"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Modal siempre montado */}
      <dialog className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Continuar sesión</h3>
          <p className="py-4">Hay una sesión válida. ¿Volver al portal?</p>

          <p className="text-xs opacity-70 break-all">
            Destino: {captureRedirectUrlOnce() ?? "-"}
          </p>

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

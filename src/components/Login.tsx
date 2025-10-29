import React from "react";
import { useNavigate } from "react-router-dom"; 
import bg from "../assets/fondo.jpeg";

export default function Login() {
  const navigate = useNavigate(); // opcional
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // TODO: reemplazá por tu endpoint real
      // const resp = await fetch("/api/auth/login", { ... });
      // if (!resp.ok) throw new Error("Credenciales inválidas");
      // const data = await resp.json();

      // Simulación
      await new Promise((r) => setTimeout(r, 800));

      // Si usás router:
      navigate("/home", { replace: true });
      // Si NO usás router, podrías hacer:
      // window.location.href = "/home";
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay para mejorar contraste */}
      <div className="absolute inset-0 bg-base-100/60 backdrop-blur-sm" />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-200/90 border-base-300 rounded-box border p-6 shadow-lg">
            <legend className="fieldset-legend text-xl font-semibold">Login</legend>

            <label className="label">Email</label>
            <input
              type="email"
              className="input input-bordered"
              placeholder="email@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="label mt-2">Password</label>
            <input
              type="password"
              className="input input-bordered"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-error text-sm mt-3">{error}</p>}

            <button
              type="submit"
              className="btn btn-neutral mt-5 w-full"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Login"}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { decodeJwtUtf8, formatUnixTimestamp, type JwtPayload } from "../utils/index";

export default function Alumnos() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jwt = params.get("token");

    if (!jwt) {
      navigate("/", { replace: true });
      return;
    }

    setToken(jwt);
    localStorage.setItem("access_token", jwt);

    const payload = decodeJwtUtf8(jwt);
    if (payload) setDecoded(payload);
  }, [location.search, navigate]);

  const iatFormatted = formatUnixTimestamp(decoded?.iat);
  const expFormatted = formatUnixTimestamp(decoded?.exp);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-base-200">
      <div className="card bg-base-100 shadow-lg p-8 w-96 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Portal de Alumnos</h1>

        {token && decoded ? (
          <>
            <p className="text-sm text-gray-500 mb-4">Token JWT recibido correctamente:</p>
            <textarea
              readOnly
              className="textarea textarea-bordered w-full text-xs"
              rows={3}
              value={token}
            />

            <h2 className="text-lg font-semibold mt-5 mb-2 text-primary">Datos del usuario</h2>

            <div className="text-sm text-left bg-base-200 rounded-lg p-3 space-y-1">
              {decoded.sub && <p><strong>sub:</strong> {decoded.sub}</p>}
              {decoded.email && <p><strong>email:</strong> {decoded.email}</p>}
              {decoded.name && <p><strong>name:</strong> {decoded.name}</p>}
              {decoded.role && <p><strong>role:</strong> {decoded.role}</p>}
              {decoded.career?.uuid && <p><strong>career.uuid:</strong> {decoded.career.uuid}</p>}
              {decoded.career?.name && <p><strong>career.name:</strong> {decoded.career.name}</p>}
              {decoded.iat !== undefined && (
                <p><strong>iat:</strong> {iatFormatted ?? decoded.iat}</p>
              )}
              {decoded.exp !== undefined && (
                <p><strong>exp:</strong> {expFormatted ?? decoded.exp}</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-error mt-4">No se encontró un token válido.</p>
        )}
      </div>
    </div>
  );
}

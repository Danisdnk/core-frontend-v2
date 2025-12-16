import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { REDIRECT_KEY } from "../utils/url.handler";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");

    sessionStorage.removeItem("external_access_token");
    sessionStorage.removeItem(REDIRECT_KEY);

    navigate("/", { replace: true });
  }, [navigate]);

  return null;
}

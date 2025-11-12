import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import CardHome from "./components/CardHome";
import Login from "./components/Login";
import PortalPage from "./components/PortalPage";

function App() {
  //https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api
  // document.documentElement.setAttribute("data-theme", "light");
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>

          <Route path="/" element={<Login />} />
          <Route path="/home" element={<CardHome />} />
          <Route path="/alumnos" element={<PortalPage title="Portal de Alumnos" />} />
          <Route path="/docente" element={<PortalPage title="Portal Docente" />} />
          <Route path="/tienda" element={<PortalPage title="Portal Tienda" />} />
          <Route path="/comedor" element={<PortalPage title="Portal Comedor" />} />
          <Route path="/biblioteca" element={<PortalPage title="Portal Biblioteca" />} />
          <Route path="/eventos" element={<PortalPage title="Portal Eventos" />} />
          <Route path="/analitica" element={<PortalPage title="Portal Analítica" />} />
          <Route path="/gestion" element={<PortalPage title="Portal Gestión" />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

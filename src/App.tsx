import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import CardHome from "./components/CardHome";
import Login from "./components/Login";

function App() {
  // document.documentElement.setAttribute("data-theme", "light");
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Ruta de login (ruta raíz) */}
          <Route path="/" element={<Login />} />

          {/* Ruta protegida o de home */}
          <Route path="/home" element={<CardHome />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

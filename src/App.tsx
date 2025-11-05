import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import CardHome from "./components/CardHome";
import Login from "./components/Login";

function App() {
 //https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api
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

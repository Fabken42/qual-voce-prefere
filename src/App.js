import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header.js";
import PerguntasUsuarioPage from './pages/PerguntasUsuarioPage.js';
import GamePage from './pages/GamePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import './components/styles.css'

export default function App() {
  return ( 
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastrar" element={<RegisterPage />} />
          <Route path="/perguntas-do-usuario" element={<PerguntasUsuarioPage />} />
        </Routes>
      </BrowserRouter> 
  );
}
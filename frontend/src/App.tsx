import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { UsuarioProvider, useUsuario } from "./contexts/UsuarioContext";

import Login from "./Login/page";
import TelaPadrao from "./components/TelaPadrao";
import Cabecalho from "./components/Cabecalho";
import Conteudo from "./components/Conteudo";
import "./App.css";

// Layout para páginas logadas que precisam de Cabeçalho + Conteudo (Mensagens)
const LayoutLogado = () => {
  return (
    <div className="h-screen flex flex-col">
      <Cabecalho logado={true} />
      <div className="flex flex-1 overflow-hidden">
        {/* Conteudo gerencia o Outlet e as mensagens de erro/sucesso */}
        <Conteudo />
      </div>
    </div>
  );
};

// Componente para proteger rotas (Opcional, mas recomendado)
const RotaProtegida = ({ children }: { children: JSX.Element }) => {
  const { usuario } = useUsuario(); // Verifica se existe usuário no contexto
  // Se quiser forçar login:
  // if (!usuario) return <Navigate to="/Login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <UsuarioProvider>
        <Routes>
          {/* Rota Pública */}
          <Route path="/" element={<Navigate to="/Login" replace />} />
          <Route path="/Login" element={<Login />} />

          {/* Rotas Logadas Específicas */}
          <Route element={<LayoutLogado />}>
          </Route>

          {/* Rota Dinâmica (Mantendo sua lógica antiga para Menus Admin/Gestor) */}
          <Route
            path="/*"
            element={
              // <RotaProtegida>
                <TelaPadrao />
              // </RotaProtegida>
            }
          />
        </Routes>
      </UsuarioProvider>
    </BrowserRouter>
  );
}

export default App;
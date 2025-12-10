import { useEffect, useState, lazy, Suspense } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import Menu from "./Menu";
import Cabecalho from "./Cabecalho";
import Conteudo from "./Conteudo";
import CarrosselNoticias from "./CarrosselNoticias"; 
import { useUsuario } from "../contexts/UsuarioContext";

import {
  Administrador,
  Func,
  Gestor,
} from "../Menu";

interface MenuItem {
  label: string;
  rota: string;
}

const getMenuJson = (idtPapel: string): MenuItem[] => {
  switch (idtPapel) {
    case "A": return Administrador;
    case "F":
    case "C": return Func;
    case "G": return Gestor;
  }
  return [];
};

export default function TelaPadrao() {
  const [menuItens, setMenuItens] = useState<MenuItem[]>([]);
  const location = useLocation();
  const { idtPapel, setUsuario } = useUsuario();

  // Atualiza visibilidade do menu com base na rota
  useEffect(() => {
     // Lógica original mantida
  }, [location.pathname]);

  // Atualiza menu dinamicamente
  useEffect(() => {
    const menu = getMenuJson(idtPapel);
    setMenuItens(menu);
  }, [idtPapel, setUsuario]);

  const element = useRoutes([
    {
      path: "/",
      element: <Conteudo />,
      children: [
        
        // 1. CARROSSEL (Index): Caso acesse a raiz pura
        {
            index: true,
            element: (
                <div className="h-full w-full p-6 bg-gray-50">
                    <CarrosselNoticias />
                </div>
            )
        },

        // 2. CARROSSEL (Correção do Login): Caso acesse /TelaPadrao
        // Adicionamos esta rota específica para capturar o redirecionamento do Login
        {
            path: "TelaPadrao",
            element: (
                <div className="h-full w-full p-6 bg-gray-50">
                    <CarrosselNoticias />
                </div>
            )
        },

        // 3. SUAS ROTAS DINÂMICAS (Mantido)
        ...menuItens.map(({ rota }) => {
            const Componente = lazy(
              () => import(`../${rota.substring(1)}/page.tsx`)
            );
            return {
              path: rota.substring(1),
              element: (
                <Suspense fallback={<div>Carregando...</div>}>
                  <Componente />
                </Suspense>
              ),
            };
        })
      ],
    },
    {
      path: "*",
      element: <div className="p-8 text-center text-gray-500">Página não encontrada.</div>,
    },
  ]);

  const temMenu = menuItens.length > 0;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      
      <Cabecalho logado={true} />
      
      <div className="flex flex-1 overflow-hidden relative p-4 gap-4">
        
        {temMenu && (
             <aside className="hidden md:block w-64 flex-shrink-0">
                <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                   <div className="flex-1 overflow-y-auto py-2">
                      <Menu itens={menuItens} />
                   </div>
                </div>
             </aside>
        )}
        
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
            {element}
        </main>

      </div>
    </div>
  );
}
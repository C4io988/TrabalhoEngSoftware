import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import CarrosselNoticias from "./CarrosselNoticias"; // Certifique-se de ter criado este componente

export default function Conteudo() {
  type MensagemObj = {
    tipo: "ERRO" | "AVISO" | "SUCESSO";
    mensagem: string[];
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { tituloPagina } = useUsuario();
  const mostrarBotaoVoltar = location.pathname !== "/" && location.pathname !== "/TelaPadrao";
  
  const [mensagemPacote, setMensagemPacote] = useState<MensagemObj | null>(null);
  const [mensagemVisivel, setMensagemVisivel] = useState(false);

  const handleVoltar = () => {
    navigate("/TelaPadrao");
  };

  const exibirMensagem = (obj: MensagemObj) => {
    if (!obj || !Array.isArray(obj.mensagem))
       return;

    setMensagemPacote(obj);
    setMensagemVisivel(true);
  };

  // Timer para sumir a mensagem
  useEffect(() => {
    if (mensagemVisivel) {
      const timer = setTimeout(() => {
        setMensagemVisivel(false);
        setTimeout(() => setMensagemPacote(null), 300); 
      }, 5000); // 5 segundos é melhor que 10
      return () => clearTimeout(timer);
    }
  }, [mensagemVisivel]);

  // Lógica para saber se estamos na Home (sem sub-rota)
  // Ajuste conforme a rota exata que seu navegador mostra ao logar
  const isHome = location.pathname === "/TelaPadrao" || location.pathname === "/TelaPadrao/";

  return (
    <div className="flex flex-col h-full w-full bg-white text-black relative">
      
      {/* Cabeçalho da tela (Só aparece se NÃO for a home) */}
      {!isHome && (
        <div className="relative flex items-center justify-center bg-gray-50 py-4 border-b border-gray-100 shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">{tituloPagina}</h1>

          {mostrarBotaoVoltar && (
            <button
              onClick={handleVoltar}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-600 font-medium rounded-lg border border-gray-200 transition-all text-sm flex items-center gap-1 shadow-sm"
            >
              ⬅ Voltar
            </button>
          )}
        </div>
      )}

      {/* Área Principal */}
      <div className="flex-grow overflow-auto relative">
        {isHome ? (
            // Se for Home, exibe o Carrossel ocupando tudo
            <div className="w-full h-full p-4 bg-gray-50">
                <CarrosselNoticias />
            </div>
        ) : (
            // Se for outra tela, exibe o conteúdo dela (Outlet)
            <div className="p-6 h-full">
               <Outlet context={{ exibirMensagem }} />
            </div>
        )}
      </div>

      {/* Rodapé de mensagens (Toast) */}
      {mensagemPacote && (
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 min-w-[300px] max-w-lg shadow-lg rounded-xl transition-all duration-500 z-50 border
          ${mensagemVisivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          ${ 
            mensagemPacote.tipo === "ERRO"
              ? "bg-red-50 text-red-800 border-red-200"
              : mensagemPacote.tipo === "AVISO"
              ? "bg-yellow-50 text-yellow-800 border-yellow-200"
              : "bg-green-50 text-green-800 border-green-200"
          }
        `}
      >
        <div className="p-4">
            <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">{mensagemPacote.tipo}</h4>
            <ul className="list-none space-y-1 text-sm font-medium">
            {mensagemPacote.mensagem.map((msg: string, index: number) => (
                <li key={index}>{msg}</li>
            ))}
            </ul>
        </div>
      </div>
    )}
    </div>
  )
}
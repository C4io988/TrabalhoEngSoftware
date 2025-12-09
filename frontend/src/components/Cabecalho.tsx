import Botao from "./Botao";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import logoInova from "../imgs/LOGO_Innova_dcdac2ae-72b0-4146-9fd5-5dba6e118f13.webp";
import logoMinas from "../imgs/governo-de-minas-gerais-2019-logo-png_seeklogo-356274.png";

interface CabecalhoProps {
  logado: boolean;
}

function obterNomePapel(idtPapel: string): string {
  switch (idtPapel) {
    case "C":
      return "Cidadão";
    case "A":
      return "Analista de Saúde";
    case "G":
      return "Gestor";
    default:
      return "Usuário";
  }
}

const Cabecalho = ({ logado }: CabecalhoProps) => {
  const navigate = useNavigate();
  const { nomUsuario, idtPapel } = useUsuario();
  
  const desPapel = idtPapel ? obterNomePapel(idtPapel) : "";

  const onClickBotaoSair = () => {
    navigate("/");
  };

  return (
    <header className="grid grid-cols-3 items-center bg-white px-8 py-4 shadow-md border-b border-gray-100">
      
      {/* ESQUERDA: Logo de Minas Gerais */}
      <div className="flex justify-start">
        <img 
          src={logoMinas}
          alt="Governo de Minas Gerais" 
          className="h-24 w-auto object-contain" 
        />
      </div>

      {/* CENTRO: Logo Inova Farma */}
      <div className="flex justify-center items-center">
        <img 
          src={logoInova} 
          alt="Logo Inova Farma" 
          className="h-24 w-auto object-contain" 
        />
      </div>

      {/* DIREITA: Info Usuário e Sair */}
      <div className="flex justify-end items-center gap-6">
        {/* Agrupamos tudo dentro desta verificação: Só mostra se estiver logado */}
        {logado && (
          <>
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-800">
                {nomUsuario || "Usuário"}
              </span>
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full self-end">
                {desPapel}
              </span>
            </div>

            <div>
              <button 
                onClick={onClickBotaoSair}
                className="text-base text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Cabecalho;
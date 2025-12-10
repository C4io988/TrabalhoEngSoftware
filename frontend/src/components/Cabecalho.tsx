import { useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import { UserCircle, LogOut } from "lucide-react"; // Adicionamos ícones para o visual novo
import logoInova from "../imgs/LOGO_Innova_dcdac2ae-72b0-4146-9fd5-5dba6e118f13.webp";
import logoMinas from "../imgs/governo-de-minas-gerais-2019-logo-png_seeklogo-356274.png";

interface CabecalhoProps {
  logado: boolean;
}

function obterNomePapel(idtPapel: string): string {
  switch (idtPapel) {
    case "C": return "Cidadão";
    case "A": return "Analista de Saúde";
    case "G": return "Gestor";
    default: return "Usuário";
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
    // Mantive sua estrutura de Grid exata para não quebrar o layout
    <header className="grid grid-cols-3 items-center bg-white px-8 py-4 shadow-md border-b border-gray-100 font-sans">
      
      {/* ESQUERDA: Logo de Minas Gerais (Mantido igual) */}
      <div className="flex justify-start">
        <img 
          src={logoMinas}
          alt="Governo de Minas Gerais" 
          className="h-24 w-auto object-contain" 
        />
      </div>

      {/* CENTRO: Logo Inova Farma (Mantido igual) */}
      <div className="flex justify-center items-center">
        <img 
          src={logoInova} 
          alt="Logo Inova Farma" 
          className="h-24 w-auto object-contain" 
        />
      </div>

      {/* DIREITA: Estilização Nova APENAS aqui */}
      <div className="flex justify-end items-center">
        {logado && (
          // Container estilo "Pílula" (Arredondado com fundo azul claro)
          <div className="flex items-center gap-3 bg-blue-50 pl-4 pr-1 py-1 rounded-full border border-blue-100 shadow-sm transition-all hover:shadow-md">
            
            {/* Ícone de Usuário */}
            <UserCircle className="text-[#1351B4]" size={28} strokeWidth={1.5} />
            
            {/* Informações de Texto */}
            <div className="flex flex-col text-right mr-2">
              <span className="text-sm font-bold text-gray-800 leading-tight">
                {nomUsuario ? nomUsuario.split(' ')[0] : "Usuário"}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#1351B4] font-semibold">
                {desPapel}
              </span>
            </div>

            {/* Botão Sair (Circular e integrado) */}
            <button 
              onClick={onClickBotaoSair}
              title="Sair do sistema"
              className="bg-white text-red-500 hover:bg-red-50 hover:text-red-700 p-2 rounded-full transition-colors border border-gray-100 flex items-center justify-center"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Cabecalho;
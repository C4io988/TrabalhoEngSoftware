import { createContext, useContext, useState, ReactNode, useMemo } from "react";

interface UsuarioObj {
  cpf: string;
  nome: string;
  idtPapel: string;
}

interface UsuarioContextData {
  codUsuarioCPF: string;
  nomUsuario: string;
  idtPapel: string;
  tituloPagina: string;
  usuario: UsuarioObj; // objeto conveniente

  setUsuario: (
    codUsuarioCPF: string,
    nomUsuario: string,
    idtPapel: string //Adm,Funcionario, Gestor
  ) => void;

  setIDtPapel: (idtPapel: string) => void;
  limparUsuario: () => void;
  setTituloPagina: (titulo: string) => void;
}

const UsuarioContext = createContext<UsuarioContextData | undefined>(undefined);

interface UsuarioProviderProps {
  children: ReactNode;
}

export const UsuarioProvider = ({ children }: UsuarioProviderProps) => {
  const [codUsuarioCPF, setCodUsuarioCPF] = useState(
    () => localStorage.getItem("codUsuarioCPF") || ""
  );
  const [nomUsuario, setNomUsuario] = useState(
    () => localStorage.getItem("nomUsuario") || ""
  );
  const [idtPapel, setIdtPapel] = useState(
    () => localStorage.getItem("idtPapel") || ""
  );
  const [tituloPagina, setTituloPagina] = useState("Título Padrão");

  const usuario = useMemo(
    () => ({
      cpf: codUsuarioCPF,
      nome: nomUsuario,
      idtPapel,
    }),
    [codUsuarioCPF, nomUsuario, idtPapel]
  );

  const setUsuario = (
    codUsuarioCPFParam: string,
    nomUsuarioParam: string,
    idtPapelParam: string
  ) => {
    setCodUsuarioCPF(codUsuarioCPFParam);
    setNomUsuario(nomUsuarioParam);
    setIdtPapel(idtPapelParam);
    localStorage.setItem("codUsuarioCPF", codUsuarioCPFParam);
    localStorage.setItem("nomUsuario", nomUsuarioParam);
    localStorage.setItem("idtPapel", idtPapelParam);
  };

  const setIDtPapel = (idtPapelParam: string) => {
    setIdtPapel(idtPapelParam);
    localStorage.setItem("idtPapel", idtPapelParam);
  };
  const limparUsuario = () => {
    setCodUsuarioCPF("");
    setNomUsuario("");
    setIdtPapel("");
    localStorage.removeItem("codUsuarioCPF");
    localStorage.removeItem("nomUsuario");
    localStorage.removeItem("idtPapel");
  };

  return (
    <UsuarioContext.Provider
      value={{
        codUsuarioCPF,
        nomUsuario,
        idtPapel,
        tituloPagina,
        usuario,
        setUsuario,
        limparUsuario,
        setIDtPapel,
        setTituloPagina,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

export const useUsuario = () => {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error("useUsuario deve ser usado dentro de um UsuarioProvider");
  }
  return context;
};

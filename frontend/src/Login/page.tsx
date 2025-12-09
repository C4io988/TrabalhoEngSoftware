import { useState, useEffect } from "react";
import TelaSemMenu from "../components/TelaSemMenu";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import baseUrl from "../Api";
import logo from "../imgs/Gov.br_logo.svg.webp";

interface UsuarioLogado {
  cpf: string;
  nome: string;
  perfil: string;
  senha: string;
  idtTemSenha: boolean;
}

export default function Login() {
  // --- NOVOS ESTADOS ---
  const [iniciarLogin, setIniciarLogin] = useState(false); // Controla a exibição do botão Gov.br

  // --- ESTADOS EXISTENTES ---
  const [cpf, setCpf] = useState("");
  const [usuarioValido, setUsuarioValido] = useState<UsuarioLogado | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro] = useState("");
  
  const toggleSenhaVisivel = () => setSenhaVisivel((prev) => !prev);
  const { setUsuario, limparUsuario } = useUsuario();
  const navigate = useNavigate();

  useEffect(() => {
    limparUsuario();
  }, []);

  // Função para ativar o formulário de login
  const handleEntrarComGov = () => {
    setIniciarLogin(true);
  };

  // --- MANTIVE SUAS FUNÇÕES ORIGINAIS DE VERIFICAÇÃO ---
  const verificarCpf = async (e: React.FormEvent) => {
    e.preventDefault();
    const cpfLimpo = cpf.replace(/\D/g, "");

    try {
      const response = await fetch(`${baseUrl}/api/loginAcesso/${cpfLimpo}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const mensagemBackend = errorData?.mensagem || "Erro na requisição";
        throw new Error(mensagemBackend);
      }

      const resultado = await response.json();

      setUsuarioValido({
        cpf: cpfLimpo,
        nome: "", // O backend parece não retornar o nome nesta rota, ajuste se necessário
        perfil: "",
        senha: "",
        idtTemSenha: resultado?.idtTemSenha ?? true,
      });
      setErro("");
    } catch (err: any) {
      console.error("Erro ao verificar CPF:", err);
      setErro(err.message || "Erro ao verificar CPF.");
      setUsuarioValido(null);
    }
  };

  const verificarSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioValido?.cpf) {
      setErro("Nenhum usuário validado. Por favor, verifique o CPF.");
      return;
    }

    const cpfLimpo = usuarioValido.cpf;

    // Lógica para criar senha (caso 1)
    if (!usuarioValido.idtTemSenha) {
      if (senha.length < 4 || confirmarSenha.length < 4) {
        setErro("A senha deve ter no mínimo 4 caracteres.");
        return;
      }
      if (senha !== confirmarSenha) {
        setErro("As senhas digitadas não coincidem.");
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/api/alterarSenha`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codUsuarioCPF: cpfLimpo, desSenha: senha }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.mensagem || "Erro ao salvar senha.");
        }

        const resultado = await response.json();
        if (resultado?.sucesso) {
          alert("Senha cadastrada com sucesso!");
          setErro("");
        } else {
          setErro(resultado?.mensagem || "Falha ao cadastrar senha.");
        }
      } catch (error: any) {
        setErro(error.message || "Erro ao cadastrar senha.");
      }
    }

    // Lógica de Login normal (caso 2)
    try {
      const response = await fetch(`${baseUrl}/api/loginAcesso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codUsuarioCPF: cpfLimpo, desSenha: senha }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.mensagem || "Erro ao autenticar.");
      }

      const resultado = await response.json();

      if (resultado?.length > 0) {
        const usuario = resultado[0];
        setErro("");
        setUsuario(
          usuario.codUsuarioCPF || "",
          usuario.nomUsuario || "",
          usuario.idtPapel || ""
        );

        if (usuario.idtPapel) {
          navigate("/TelaPadrao");
        } else {
          setErro("Nenhum papel atribuido ao usuario");
        }
      } else {
        setErro(resultado?.mensagem || "Falha ao autenticar.");
      }
    } catch (error: any) {
      setErro(error.message || "Erro ao verificar senha.");
    }
  };

  return (
    <TelaSemMenu titulo="Login">
      <div className="flex flex-col items-center justify-center w-full h-full gap-6">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
          
          {/* Logo e Título (Sempre visíveis) */}
          <img
            src={logo}
            alt="Inova Farma"
            className="mx-auto mb-4 h-20 object-contain"
          />
          <h2 className="text-2xl font-semibold text-center mb-6">
  
          </h2>

          {/* --- ALTERAÇÃO AQUI: Verificação do passo inicial --- */}
          
          {/* PASSO 0: Botão do Gov.br */}
          {!iniciarLogin && (
            <div className="flex flex-col gap-4">
              <p className="text-center text-gray-600 mb-2">
                Identifique-se no gov.br com seu CPF
              </p>
              <button
                onClick={handleEntrarComGov}
                className="bg-[#1351B4] hover:bg-[#0c3c8c] text-white font-bold py-3 px-4 rounded-3xl transition duration-200 flex items-center justify-center gap-2"
              >
                 {/* Se tiver a logo do gov, pode por uma tag <img> aqui */}
                 Entrar com o gov.br
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                 <span className="text-sm text-gray-500">Dúvidas? <a href="#" className="text-[#1351B4] underline">Clique aqui</a></span>
              </div>
            </div>
          )}

          {/* PASSO 1 e 2: Formulários de CPF e Senha (Só aparecem se iniciarLogin for true) */}
          {iniciarLogin && (
            <>
              {/* Botãozinho para voltar (Opcional, mas boa prática) */}
              <button 
                onClick={() => setIniciarLogin(false)} 
                className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
              >
                ← Voltar
              </button>

              {!usuarioValido && (
                <form className="flex flex-col gap-4" onSubmit={verificarCpf}>
                  <label className="text-sm font-medium text-gray-700">CPF</label>
                  <input
                    type="text"
                    placeholder="Digite seu CPF"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {erro && <p className="text-red-600 text-sm">{erro}</p>}
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                  >
                    Continuar
                  </button>
                </form>
              )}

              {usuarioValido && (
                <form className="flex flex-col gap-4" onSubmit={verificarSenha}>
                  <div className="text-center text-gray-700 mb-2">
                    <p className="text-lg font-semibold">{usuarioValido.nome}</p>
                    <span className="text-sm text-gray-500">{usuarioValido.cpf}</span>
                  </div>

                  {!usuarioValido.idtTemSenha ? (
                    // ... Campos de Criar Senha (mantido igual) ...
                    <>
                      <div className="relative">
                        <input
                          type={senhaVisivel ? "text" : "password"}
                          placeholder="Criar senha"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                         <button type="button" onClick={toggleSenhaVisivel} className="absolute right-3 top-2.5 text-gray-500">
                          {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={senhaVisivel ? "text" : "password"}
                          placeholder="Confirmar senha"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" onClick={toggleSenhaVisivel} className="absolute right-3 top-2.5 text-gray-500">
                          {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </>
                  ) : (
                    // ... Campo de Senha Normal (mantido igual) ...
                    <div className="relative">
                      <input
                        type={senhaVisivel ? "text" : "password"}
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button type="button" onClick={toggleSenhaVisivel} className="absolute right-3 top-2.5 text-gray-500">
                        {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  )}
                  
                  {erro && <p className="text-red-600 text-sm">{erro}</p>}
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                  >
                    Entrar
                  </button>
                </form>
              )}
            </>
          )}
          
          {/* Rodapé do card */}
          {!usuarioValido && (
             <div className="mt-6 flex flex-col items-center gap-2">
                {/* Você pode colocar links de recuperação aqui se quiser */}
             </div>
          )}

        </div>
      </div>
    </TelaSemMenu>
  );
}
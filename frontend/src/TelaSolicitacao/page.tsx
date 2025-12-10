import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext"; //
import baseUrl from "../Api";
import Botao from "../components/Botao"; //

// Interface para usar a função exibirMensagem do Conteudo.tsx
interface ConteudoContextType {
  exibirMensagem: (obj: { tipo: "ERRO" | "AVISO" | "SUCESSO"; mensagem: string[] }) => void;
}

interface Medicamento {
  id: number;
  nome: string;
  dosagem: string;
}

export default function TelaSolicitacao() {
  // Pega o CPF do contexto (nome da variavel conforme seu arquivo UsuarioContext.tsx)
  const { codUsuarioCPF } = useUsuario(); 
  
  // Pega a função de mensagem do Outlet (Conteudo.tsx)
  const { exibirMensagem } = useOutletContext<ConteudoContextType>();

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar lista de medicamentos
  useEffect(() => {
    fetch(`${baseUrl}/api/medicamentos`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar medicamentos");
        return res.json();
      })
      .then((data) => setMedicamentos(data))
      .catch(() => {
        if (exibirMensagem) {
           exibirMensagem({ tipo: "ERRO", mensagem: ["Falha ao buscar medicamentos."] });
        }
      });
  }, [exibirMensagem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicamentoSelecionado) {
      exibirMensagem({ tipo: "AVISO", mensagem: ["Selecione um medicamento."] });
      return;
    }
    if (!arquivo) {
      exibirMensagem({ tipo: "AVISO", mensagem: ["É obrigatório anexar o arquivo (Laudo/Receita)."] });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/solicitacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codUsuarioCPF: codUsuarioCPF, // Envia o CPF do usuário logado
          idMedicamento: medicamentoSelecionado,
          observacao: observacao,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        exibirMensagem({ 
          tipo: "SUCESSO", 
          mensagem: [`Solicitação enviada! Protocolo: ${data.protocolo}`] 
        });
        // Limpar campos
        setMedicamentoSelecionado("");
        setObservacao("");
        setArquivo(null);
      } else {
        exibirMensagem({ tipo: "ERRO", mensagem: [data.mensagem || "Erro ao salvar."] });
      }
    } catch (error) {
      exibirMensagem({ tipo: "ERRO", mensagem: ["Erro de conexão com o servidor."] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-10 h-full bg-white">
      <div className="w-full max-w-2xl px-6">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Nova Solicitação de Medicamento
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Select de Medicamento */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Medicamento</label>
            <select
              value={medicamentoSelecionado}
              onChange={(e) => setMedicamentoSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={loading}
            >
              <option value="">Selecione...</option>
              {medicamentos.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.nome} - {med.dosagem}
                </option>
              ))}
            </select>
          </div>

          {/* Upload de Arquivo */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Documentação (Laudo/Receita)
            </label>
            <div className="border border-gray-300 rounded-md p-3 shadow-sm bg-gray-50">
              <input
                type="file"
                accept=".pdf,.jpg,.png,.jpeg"
                onChange={(e) => setArquivo(e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                disabled={loading}
              />
              {arquivo && <p className="text-xs text-green-600 mt-1">Arquivo selecionado: {arquivo.name}</p>}
            </div>
          </div>

          {/* Observação */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alguma observação adicional?"
              disabled={loading}
            />
          </div>

          {/* Botão */}
          <div className="mt-4">
            <Botao 
              titulo={loading ? "Enviando..." : "Enviar Solicitação"} 
              onClick={() => {}} // O evento submit do form trata o clique
            />
          </div>
        </form>
      </div>
    </div>
  );
}
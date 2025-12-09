import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext";
import baseUrl from "../Api";

interface Medicamento {
  codCargo: number;
  nomCargo: string;
}

type MensagemObj = {
  tipo: "ERRO" | "AVISO" | "SUCESSO";
  mensagem: string[];
};

type OutletContextType = {
  exibirMensagem: (obj: MensagemObj) => void;
};

export default function Tela2FuncionarioSolicitar() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [filtro, setFiltro] = useState("");
  const [selecionado, setSelecionado] = useState<Medicamento | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [comentario, setComentario] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const outletContext = useOutletContext<OutletContextType | null>();
  const exibirMensagem = outletContext?.exibirMensagem ?? ((obj: MensagemObj) => alert(obj.mensagem.join("\n")));

  const navigate = useNavigate();
  const { codUsuarioCPF } = useUsuario(); // usa o CPF salvo no contexto

  useEffect(() => {
    buscarMedicamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarMedicamentos = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/cargo`);
      if (!res.ok) {
        const msg = await res.json().catch(() => ({ mensagem: ["Erro ao consultar (cargo)"] }));
        exibirMensagem({ tipo: "ERRO", mensagem: Array.isArray(msg.mensagem) ? msg.mensagem : [String(msg.mensagem)] });
        return;
      }
      const data = await res.json();
      const normalized = (data || []).map((x: any) => ({
        codCargo: Number(x.codCargo ?? x.codMedicamento),
        nomCargo: String(x.nomCargo ?? x.nomMedicamento ?? ""),
      }));
      setMedicamentos(normalized);
    } catch (error) {
      exibirMensagem({ tipo: "ERRO", mensagem: [`Erro inesperado: ${error}`] });
    }
  };

  async function parseResponseBody(res: Response) {
    try {
      return await res.json();
    } catch {
      const txt = await res.text().catch(() => "Resposta inválida do servidor");
      return { mensagem: [String(txt)] };
    }
  }

  const solicitarMedicamento = async () => {
    if (!selecionado) {
      exibirMensagem({ tipo: "AVISO", mensagem: ["Selecione um medicamento antes de solicitar."] });
      return;
    }
    if (quantidade <= 0) {
      exibirMensagem({ tipo: "AVISO", mensagem: ["Informe uma quantidade válida."] });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        codCargo: Number(selecionado.codCargo),
        nomCargo: String(selecionado.nomCargo),
        quantidade: Number(quantidade),
        comentario: comentario ? String(comentario) : null,
        cpfSolicitante: codUsuarioCPF || null, // usar campo correto do contexto
      };

      const res = await fetch(`${baseUrl}/api/solicitacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await parseResponseBody(res);
        exibirMensagem({ tipo: "ERRO", mensagem: Array.isArray(err.mensagem) ? err.mensagem : [String(err.mensagem ?? err)] });
        return;
      }

      const json = await parseResponseBody(res);
      exibirMensagem(json.tipo ? json : { tipo: "SUCESSO", mensagem: ["Solicitação enviada com sucesso."] });

      // limpar formulário e navegar
      setSelecionado(null);
      setFiltro("");
      setQuantidade(1);
      setComentario("");
      navigate("/Tela3Funcionario");
    } catch (error) {
      exibirMensagem({ tipo: "ERRO", mensagem: [`Erro inesperado ao solicitar: ${String(error)}`] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Solicitar Medicamento</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Pesquisar por nome</label>
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Digite parte do nome do medicamento..."
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Medicamento</label>
        <select
          value={selecionado?.codCargo ?? ""}
          onChange={(e) => {
            const cod = Number(e.target.value);
            const item = medicamentos.find((m) => m.codCargo === cod) ?? null;
            setSelecionado(item);
          }}
          className="w-full p-2 border rounded"
        >
          <option value="">-- selecione --</option>
          {medicamentos.filter(m => m.nomCargo.toLowerCase().includes(filtro.toLowerCase())).map((m) => (
            <option key={m.codCargo} value={m.codCargo}>
              {m.nomCargo}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantidade</label>
          <input
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nome selecionado</label>
          <input
            type="text"
            readOnly
            value={selecionado?.nomCargo ?? ""}
            className="w-full p-2 border bg-gray-50 rounded"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Comentário (opcional)</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={solicitarMedicamento}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Solicitar"}
        </button>
        <button
          onClick={() => {
            setSelecionado(null);
            setFiltro("");
            setQuantidade(1);
            setComentario("");
          }}
          className="px-4 py-2 border rounded"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import baseUrl from "../Api";
import { useUsuario } from "../contexts/UsuarioContext";

type Solicitacao = {
  id?: number;
  codCargo?: number;
  nomCargo?: string;
  quantidade?: number;
  comentario?: string;
  status?: string;
  dataCriacao?: string;
  cpfSolicitante?: string;
};

export default function Tela3Funcionario() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);
  const { codUsuarioCPF } = useUsuario(); // usar codUsuarioCPF do contexto

  useEffect(() => {
    buscarSolicitacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarSolicitacoes = async () => {
    setLoading(true);
    try {
      const cpfQuery = codUsuarioCPF ? `?cpf=${codUsuarioCPF}` : "";
      const res = await fetch(`${baseUrl}/api/solicitacoes${cpfQuery}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ mensagem: ["Erro ao buscar solicitações"] }));
        alert(Array.isArray(err.mensagem) ? err.mensagem.join("\n") : String(err.mensagem));
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSolicitacoes(data || []);
    } catch (error) {
      alert(`Erro ao buscar solicitações: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  // Função que atualiza apenas o status (usa endpoint /solicitacoes/<id>/status)
  async function updateStatusSolicitacao(id: number, novoStatus: string) {
    try {
      const res = await fetch(`${baseUrl}/api/solicitacoes/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ mensagem: ["Erro ao atualizar status"] }));
        throw new Error(Array.isArray(err.mensagem) ? err.mensagem.join("\n") : String(err.mensagem));
      }

      const json = await res.json();
      // opcional: mostrar mensagem de sucesso
      alert(json?.mensagem?.join?.("\n") ?? "Status atualizado");
      // atualizar lista após mudança (assume buscarSolicitacoes está no escopo)
      await buscarSolicitacoes();
    } catch (e: any) {
      alert(`Falha ao atualizar status: ${e.message ?? e}`);
    }
  }

  // Função que atualiza campos (quantidade, comentario, status etc.)
  async function atualizarSolicitacao(id: number, payload: { status?: string; quantidade?: number; comentario?: string; }) {
    try {
      const res = await fetch(`${baseUrl}/api/solicitacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ mensagem: ["Erro ao atualizar solicitação"] }));
        throw new Error(Array.isArray(err.mensagem) ? err.mensagem.join("\n") : String(err.mensagem));
      }

      const json = await res.json();
      alert(json?.mensagem?.join?.("\n") ?? "Solicitação atualizada");
      await buscarSolicitacoes();
    } catch (e: any) {
      alert(`Falha ao atualizar solicitação: ${e.message ?? e}`);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Acompanhar Solicitações</h2>

      <div className="mb-4 flex gap-2">
        <button onClick={buscarSolicitacoes} className="px-3 py-1 border rounded bg-white">Atualizar</button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : solicitacoes.length === 0 ? (
        <p>Nenhuma solicitação encontrada.</p>
      ) : (
        <div className="space-y-4">
          {solicitacoes.map((s) => (
            <div key={s.id} className="border rounded shadow-sm p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-gray-500">Código</div>
                  <div className="font-semibold text-lg">{s.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    s.status === "APROVADO" ? "bg-green-100 text-green-800" :
                    s.status === "REJEITADO" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>{s.status ?? "PENDENTE"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Data</div>
                    <div className="text-sm">{formatDate(s.dataCriacao)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Solicitante</div>
                    <div className="text-sm">{s.cpfSolicitante ?? "-"}</div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-sm text-gray-500 mb-1">Itens</div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between">
                        <div className="font-medium">{s.nomCargo ?? "-"}</div>
                        <div className="text-sm text-gray-600">Qtd: {s.quantidade ?? "-"}</div>
                      </div>
                      {s.comentario && <div className="text-sm text-gray-600 mt-2">Comentário: {s.comentario}</div>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateStatusSolicitacao(s.id!, "APROVADO")}
                          className="px-3 py-1 bg-green-600 text-white rounded">Aprovar</button>
                  <button onClick={() => updateStatusSolicitacao(s.id!, "REJEITADO")}
                          className="px-3 py-1 bg-red-600 text-white rounded">Rejeitar</button>
                  <button onClick={() => atualizarSolicitacao(s.id!, { comentario: "Atualizando comentário" })}
                          className="px-3 py-1 border rounded">Atualizar comentário</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
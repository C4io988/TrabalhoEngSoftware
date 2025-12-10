import { useState, useEffect } from "react";
import baseUrl from "../Api";

interface Solicitacao {
  protocolo: number;
  cidadao: string;
  medicamento: string;
  data: string;
  status: string;
}

export default function TelaFilaSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  // Estado para controlar qual item está sendo avaliado
  const [itemEmAnalise, setItemEmAnalise] = useState<Solicitacao | null>(null);

  useEffect(() => {
    carregarFila();
  }, []);

  const carregarFila = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/listar_solicitacoes`);
      if (response.ok) {
        const data = await response.json();
        setSolicitacoes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar fila", error);
    }
  };

  const enviarAvaliacao = async (status: 'DEFERIDO' | 'INDEFERIDO') => {
    if (!itemEmAnalise) return;

    try {
      const response = await fetch(`${baseUrl}/api/avaliar_solicitacao`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idSolicitacao: itemEmAnalise.protocolo,
          status: status
        })
      });

      if (response.ok) {
        alert(`Solicitação ${status === 'DEFERIDO' ? 'Aprovada' : 'Negada'} com sucesso!`);
        setItemEmAnalise(null); // Fecha o modal
        carregarFila(); // Atualiza a lista
      } else {
        alert("Erro ao atualizar status.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  const getStatusCor = (status: string) => {
    if (status === 'DEFERIDO') return 'text-green-700 bg-green-100 border border-green-200';
    if (status === 'INDEFERIDO') return 'text-red-700 bg-red-100 border border-red-200';
    return 'text-yellow-700 bg-yellow-100 border border-yellow-200';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-[#1351B4] mb-6 border-b pb-2">
        Fila de Análise
      </h1>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">Protocolo</th>
              <th className="p-4">Cidadão</th>
              <th className="p-4">Medicamento</th>
              <th className="p-4">Data</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {solicitacoes.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhuma solicitação encontrada.</td></tr>
            ) : (
                solicitacoes.map((item) => (
                <tr key={item.protocolo} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-mono text-gray-600">#{item.protocolo}</td>
                    <td className="p-4 font-medium text-gray-800">{item.cidadao}</td>
                    <td className="p-4 text-gray-600">{item.medicamento}</td>
                    <td className="p-4 text-gray-500 text-sm">{item.data}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusCor(item.status)}`}>
                          {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {item.status === 'EM ANALISE' && (
                        <button 
                          onClick={() => setItemEmAnalise(item)}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition"
                        >
                            Avaliar
                        </button>
                      )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE AVALIAÇÃO */}
      {itemEmAnalise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Avaliar Solicitação #{itemEmAnalise.protocolo}
            </h3>
            <p className="mb-2 text-gray-600"><strong>Cidadão:</strong> {itemEmAnalise.cidadao}</p>
            <p className="mb-6 text-gray-600"><strong>Medicamento:</strong> {itemEmAnalise.medicamento}</p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setItemEmAnalise(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={() => enviarAvaliacao('INDEFERIDO')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
              >
                Indeferir
              </button>
              <button 
                onClick={() => enviarAvaliacao('DEFERIDO')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
              >
                Deferir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
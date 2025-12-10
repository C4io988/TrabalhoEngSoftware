import { useState, useEffect } from "react";
import { useUsuario } from "../contexts/UsuarioContext";
import baseUrl from "../Api";

interface Pedido {
  protocolo: number;
  medicamento: string;
  data: string;
  status: string;
}

export default function TelaMeusPedidos() {
  const { codUsuarioCPF } = useUsuario();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (codUsuarioCPF) {
      buscarPedidos();
    }
  }, [codUsuarioCPF]);

  const buscarPedidos = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/minhas_solicitacoes/${codUsuarioCPF}`);
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusCor = (status: string) => {
    if (status === 'DEFERIDO') return 'text-green-700 bg-green-100 border-green-200';
    if (status === 'INDEFERIDO') return 'text-red-700 bg-red-100 border-red-200';
    return 'text-yellow-700 bg-yellow-100 border-yellow-200';
  };

  return (
    <div className="flex flex-col items-center pt-10 px-6 h-full bg-gray-50">
      <div className="w-full max-w-4xl">
        
        {/* Cabeçalho simples, sem botão de ação */}
        <div className="mb-6 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Acompanhar Solicitações
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Veja o status histórico dos seus pedidos de medicamento.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="p-4">Protocolo</th>
                <th className="p-4">Medicamento</th>
                <th className="p-4">Data</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={4} className="p-8 text-center text-gray-500">Carregando histórico...</td></tr>
              ) : pedidos.length === 0 ? (
                 <tr><td colSpan={4} className="p-8 text-center text-gray-500">Você ainda não possui solicitações registradas.</td></tr>
              ) : (
                pedidos.map((item) => (
                  <tr key={item.protocolo} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-mono text-gray-600">#{item.protocolo}</td>
                    <td className="p-4 font-medium text-gray-800">{item.medicamento}</td>
                    <td className="p-4 text-gray-500 text-sm">{item.data}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusCor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
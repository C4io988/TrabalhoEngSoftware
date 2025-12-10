import { useState, useEffect } from "react";
import baseUrl from "../Api";
import Botao from "../components/Botao";

interface Medicamento {
  id: number;
  nome: string;
  dosagem: string;
}

export default function TelaCadastroMedicamento() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarMedicamentos();
  }, []);

  const carregarMedicamentos = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/medicamentos`);
      if (response.ok) {
        const data = await response.json();
        setMedicamentos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar");
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !dosagem) return alert("Preencha todos os campos");

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/medicamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, dosagem }),
      });

      if (response.ok) {
        alert("Medicamento cadastrado!");
        setNome("");
        setDosagem("");
        carregarMedicamentos(); // Recarrega a lista
      } else {
        alert("Erro ao salvar.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Deseja realmente excluir este medicamento?")) return;

    try {
      const response = await fetch(`${baseUrl}/api/medicamentos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Operação realizada com sucesso.");
        carregarMedicamentos();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        Gerenciar Medicamentos
      </h1>

      {/* Formulário de Cadastro */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Novo Medicamento</h2>
        <form onSubmit={handleSalvar} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Paracetamol"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dosagem</label>
            <input
              type="text"
              value={dosagem}
              onChange={(e) => setDosagem(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 500mg"
            />
          </div>
          <div className="pb-0.5">
             <Botao titulo={loading ? "Salvando..." : "Cadastrar"} onClick={() => {}} />
          </div>
        </form>
      </div>

      {/* Lista de Medicamentos */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Dosagem</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {medicamentos.map((med) => (
              <tr key={med.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500">#{med.id}</td>
                <td className="p-4 font-medium text-gray-800">{med.nome}</td>
                <td className="p-4 text-gray-600">{med.dosagem}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleExcluir(med.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import baseUrl from "../Api";
import Botao from "../components/Botao";

interface Usuario {
  cpf: string;
  nome: string;
  email: string;
  papel: string;
  papel_nome: string;
  ativo: boolean;
}

export default function TelaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState({ cpf: "", nome: "", email: "", papel: "A" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/usuarios`);
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários");
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cpf || !form.nome) return alert("Preencha CPF e Nome");

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert("Usuário salvo!");
        setForm({ cpf: "", nome: "", email: "", papel: "A" }); // Limpa form
        carregarUsuarios();
      } else {
        alert("Erro ao salvar.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const preencherEdicao = (u: Usuario) => {
    setForm({ cpf: u.cpf, nome: u.nome, email: u.email, papel: u.papel });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        Gerenciar Usuários e Perfis
      </h1>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Novo Usuário / Editar</h2>
        <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF (somente números)</label>
            <input
              type="text"
              maxLength={11}
              value={form.cpf}
              onChange={(e) => setForm({...form, cpf: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="12345678900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({...form, nome: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome do funcionário"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil (Papel)</label>
            <select
              value={form.papel}
              onChange={(e) => setForm({...form, papel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="A">Analista de Saúde</option>
              <option value="G">Gestor</option>
              <option value="C">Cidadão</option>
            </select>
          </div>

          <div className="pb-0.5">
             <Botao titulo={loading ? "Salvando..." : "Salvar Usuário"} onClick={() => {}} />
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">CPF</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Perfil</th>
              <th className="p-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((u) => (
              <tr key={u.cpf} className="hover:bg-gray-50">
                <td className="p-4 text-gray-600 font-mono">{u.cpf}</td>
                <td className="p-4 font-medium text-gray-800">{u.nome}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold 
                    ${u.papel === 'G' ? 'bg-purple-100 text-purple-700' : 
                      u.papel === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.papel_nome}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => preencherEdicao(u)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Editar
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
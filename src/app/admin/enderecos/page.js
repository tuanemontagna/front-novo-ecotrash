"use client";
import { useState, useEffect } from "react";
import { fetchEnderecos, deleteEndereco } from "@/utils/axios";
import { Loader2, Trash2, MapPin } from "lucide-react";
import { Toaster, toaster } from "@/components/ui/toaster";

export default function EnderecosAdminPage() {
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnderecos();
  }, []);

  async function loadEnderecos() {
    try {
      setLoading(true);
      const data = await fetchEnderecos();
      setEnderecos(data);
    } catch (error) {
      toaster.create({
        title: "Erro ao carregar endereços",
        description: "Não foi possível buscar a lista de endereços.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Tem certeza que deseja excluir este endereço?")) return;
    try {
      await deleteEndereco(id);
      toaster.create({
        title: "Sucesso",
        description: "Endereço excluído com sucesso.",
        type: "success",
      });
      loadEnderecos();
    } catch (error) {
      toaster.create({
        title: "Erro",
        description: "Falha ao excluir endereço.",
        type: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2d5016]">Gerenciar Endereços</h1>
        <span className="text-sm text-zinc-500">Total: {enderecos.length}</span>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#2d5016]" size={32} />
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Logradouro</th>
                <th className="px-6 py-4 font-medium">Número</th>
                <th className="px-6 py-4 font-medium">Bairro</th>
                <th className="px-6 py-4 font-medium">Cidade/UF</th>
                <th className="px-6 py-4 font-medium">CEP</th>
                <th className="px-6 py-4 font-medium">Proprietário</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {enderecos.map((end) => (
                <tr key={end.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4 text-zinc-500">#{end.id}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-600" />
                      {end.logradouro}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{end.numero || 'S/N'}</td>
                  <td className="px-6 py-4 text-zinc-600">{end.bairro}</td>
                  <td className="px-6 py-4 text-zinc-600">{end.cidade}/{end.estado}</td>
                  <td className="px-6 py-4 text-zinc-600">{end.cep}</td>
                  <td className="px-6 py-4 text-zinc-600">
                    {end.empresa ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium text-zinc-900 text-xs">{end.empresa.nomeFantasia || end.empresa.razaoSocial}</span>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Empresa</span>
                      </div>
                    ) : end.usuarios && end.usuarios.length > 0 ? (
                      <div className="flex flex-col items-start gap-2">
                        {end.usuarios.map(u => (
                          <div key={u.id} className="flex flex-col items-start gap-0.5">
                              <span className="font-medium text-zinc-900 text-xs">{u.nome}</span>
                              <span className="text-[10px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Usuário</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic text-xs">Sem vínculo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(end.id)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {enderecos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum endereço encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

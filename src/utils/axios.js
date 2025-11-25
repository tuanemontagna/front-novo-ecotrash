import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            if(token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

// Auth helpers
export async function login(email, senha) {
  const { data } = await api.post('/auth/login', { email, senha });
  return data; // { message, accessToken, refreshToken }
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data?.data;
}

export async function registerUser({ nome, email, senha, telefone, cpf, tipoUsuario = 'PESSOA_FISICA' }) {
  const payload = { nome, email, senha, telefone, cpf, tipoUsuario };
  const { data } = await api.post('/usuarios', payload);
  return data;
}

export async function registerEmpresa({ nome, email, senha, telefone, razaoSocial, nomeFantasia, cnpj, endereco }) {
  const payload = { nome, email, senha, telefone, razaoSocial, nomeFantasia, cnpj, endereco };
  const { data } = await api.post('/empresas', payload);
  return data;
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) return null;
  try {
    const { data } = await api.post('/auth/refresh', { token: refresh });
    if (data?.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    }
  } catch (_) {
    return null;
  }
}

export async function requestPasswordReset(email) {
  const { data } = await api.post('/auth/recuperar', { email });
  return data;
}

export async function resetPassword(email, codigo, novaSenha) {
  const { data } = await api.post('/auth/redefinir', { email, codigo, novaSenha });
  return data;
}

// Endereços helpers
export async function fetchEnderecos() {
  const { data } = await api.get('/enderecos');
  return data?.data || [];
}

export async function deleteEndereco(id) {
  const { data } = await api.delete(`/enderecos/${id}`);
  return data;
}

export async function updateEndereco(id, dados) {
  const { data } = await api.patch(`/enderecos/${id}`, dados);
  return data;
}
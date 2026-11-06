import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Candidato {
  id: number;
  nome: string;
  numero: number;
  partido: string;
  sigla_partido: string;
  cargo: string;
  data_nascimento: string;
  data_registro: string;
  votos: number;
  ativo: boolean;
  foto_url: string | null;
}

export type CandidatoInput = Omit<Candidato, 'id' | 'foto_url'> & {
  foto?: File | null;
  remover_foto?: boolean;
};

export type EscolhaVoto = { numero: string; branco: boolean };

export type SimulacaoResult = {
  mensagem: string;
  repetida: boolean;
  resumo?: { etapa: number; tipo: 'candidato' | 'branco' | 'nulo' | 'legenda' }[];
};

const http = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
  timeout: 20000,
});

function toFormData(value: CandidatoInput): FormData {
  const form = new FormData();
  form.set('nome', value.nome);
  form.set('numero', String(value.numero));
  form.set('partido', value.partido);
  form.set('sigla_partido', value.sigla_partido);
  form.set('cargo', value.cargo);
  form.set('data_nascimento', value.data_nascimento);
  form.set('data_registro', value.data_registro);
  form.set('votos', String(value.votos));
  form.set('ativo', value.ativo ? '1' : '0');
  if (value.foto) form.set('foto', value.foto);
  if (value.remover_foto) form.set('remover_foto', '1');
  return form;
}

export const api = {
  list: async (): Promise<Candidato[]> => (await http.get('/candidatos')).data,
  get: async (id: number): Promise<Candidato> => (await http.get('/candidatos/' + id)).data,
  create: async (data: CandidatoInput): Promise<Candidato> => (await http.post('/candidatos', toFormData(data))).data,
  update: async (id: number, data: CandidatoInput): Promise<Candidato> => {
    const form = toFormData(data);
    form.set('_method', 'PUT');
    return (await http.post('/candidatos/' + id, form)).data;
  },
  delete: async (id: number): Promise<void> => { await http.delete('/candidatos/' + id); },
  vote: async (id: number): Promise<void> => { await http.post('/candidatos/' + id + '/votar'); },
  submitBallot: async (sessao_uuid: string, votos: EscolhaVoto[]): Promise<SimulacaoResult> =>
    (await http.post('/votacoes', { sessao_uuid, votos })).data,
};

export const queryKey = ['candidatos'];

export function useCandidatos() {
  return useQuery({ queryKey, queryFn: api.list });
}

export function useCandidato(id: number) {
  return useQuery({ queryKey: ['candidato', id], queryFn: () => api.get(id), enabled: Number.isInteger(id) && id > 0 });
}

export function useCandidatoMutation<TArgs>(mutationFn: (args: TArgs) => Promise<unknown>) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey });
      void cache.invalidateQueries({ queryKey: ['candidato'] });
    },
  });
}

export function getError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
    return errors
      ? Object.values(errors).flat().join(' ')
      : (error.response?.data?.message ?? error.message);
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}

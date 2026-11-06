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
}
export type CandidatoInput = Omit<Candidato, 'id'>;

const http = axios.create({ baseURL: '/api', headers: { Accept: 'application/json' }, timeout: 15000 });
const api = {
  list: async (): Promise<Candidato[]> => (await http.get('/candidatos')).data,
  get: async (id: number): Promise<Candidato> => (await http.get('/candidatos/' + id)).data,
  create: async (data: CandidatoInput): Promise<Candidato> => (await http.post('/candidatos', data)).data,
  update: async (id: number, data: CandidatoInput): Promise<Candidato> => (await http.put('/candidatos/' + id, data)).data,
  delete: async (id: number): Promise<void> => { await http.delete('/candidatos/' + id); },
  vote: async (id: number): Promise<void> => { await http.post('/candidatos/' + id + '/votar'); }
};
export const queryKey = ['candidatos'];
export function useCandidatos() { return useQuery({ queryKey, queryFn: api.list }); }
export function useCandidato(id: number) { return useQuery({ queryKey: ['candidato', id], queryFn: () => api.get(id), enabled: Number.isInteger(id) && id > 0 }); }
export function useCandidatoMutation<TArgs>(mutationFn: (args: TArgs) => Promise<unknown>) {
  const cache = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => { void cache.invalidateQueries({ queryKey }); void cache.invalidateQueries({ queryKey: ['candidato'] }); } });
}
export { api };
export function getError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
    return errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message ?? error.message);
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}

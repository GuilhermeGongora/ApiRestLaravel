<?php

namespace App\Http\Controllers;

use App\Models\Candidato;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class VotacaoController extends Controller
{
    private const ETAPAS = [
        ['cargo' => 'deputado_federal', 'digitos' => 4],
        ['cargo' => 'deputado_estadual', 'digitos' => 5],
        ['cargo' => 'senador', 'digitos' => 3],
        ['cargo' => 'senador', 'digitos' => 3],
        ['cargo' => 'governador', 'digitos' => 2],
        ['cargo' => 'presidente', 'digitos' => 2],
    ];

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'sessao_uuid' => 'required|uuid',
            'votos' => 'required|array|size:6',
            'votos.*.numero' => ['nullable', 'string', 'regex:/^\\d{2,5}$/'],
            'votos.*.branco' => 'required|boolean',
        ]);

        $sessao = $dados['sessao_uuid'];

        if (DB::table('votos_simulados')->where('sessao_uuid', $sessao)->exists()) {
            return response()->json(['mensagem' => 'Simulação já registrada.', 'repetida' => true]);
        }

        return DB::transaction(function () use ($dados, $sessao) {
            $primeiroSenador = null;
            $resumo = [];

            foreach (self::ETAPAS as $indice => $etapa) {
                $entrada = $dados['votos'][$indice];
                $branco = (bool) $entrada['branco'];
                $numero = $entrada['numero'] ?? '';

                if (($branco && $numero !== '') || (!$branco && $numero === '')) {
                    throw ValidationException::withMessages(['votos' => 'Preencha uma escolha válida para cada cargo.']);
                }

                if (!$branco && strlen($numero) !== $etapa['digitos'] && !(
                    str_starts_with($etapa['cargo'], 'deputado_') && strlen($numero) === 2
                )) {
                    throw ValidationException::withMessages(['votos' => 'Quantidade de dígitos inválida na etapa '.($indice + 1).'.']);
                }

                $candidatos = Candidato::query()->where('ativo', true)->get()->filter(
                    fn (Candidato $candidato) => $this->cargoCompativel($candidato->cargo, $etapa['cargo'])
                );

                $candidato = $branco ? null : $candidatos->first(
                    fn (Candidato $item) => (string) $item->numero === $numero
                );

                $tipo = 'branco';
                $partido = null;

                if (!$branco) {
                    if ($candidato) {
                        $tipo = 'candidato';
                        $partido = $candidato->sigla_partido;

                        if ($indice === 3 && $primeiroSenador === $candidato->id) {
                            $tipo = 'nulo';
                            $candidato = null;
                        }
                    } elseif (str_starts_with($etapa['cargo'], 'deputado_')) {
                        $legenda = $candidatos->first(
                            fn (Candidato $item) => str_starts_with((string) $item->numero, substr($numero, 0, 2))
                        );
                        $tipo = $legenda ? 'legenda' : 'nulo';
                        $partido = $legenda?->sigla_partido;
                    } else {
                        $tipo = 'nulo';
                    }
                }

                if ($indice === 2 && $candidato) {
                    $primeiroSenador = $candidato->id;
                }

                if ($candidato && $tipo === 'candidato') {
                    $atualizados = DB::table('candidatos')
                        ->where('id', $candidato->id)
                        ->where('ativo', true)
                        ->increment('votos');

                    if ($atualizados !== 1) {
                        throw ValidationException::withMessages(['votos' => 'Candidato indisponível. Reinicie a simulação.']);
                    }
                }

                DB::table('votos_simulados')->insert([
                    'sessao_uuid' => $sessao,
                    'etapa' => $indice + 1,
                    'cargo' => $etapa['cargo'],
                    'tipo' => $tipo,
                    'numero' => $numero === '' ? null : $numero,
                    'candidato_id' => $candidato?->id,
                    'partido' => $partido,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $resumo[] = ['etapa' => $indice + 1, 'tipo' => $tipo];
            }

            return response()->json([
                'mensagem' => 'Simulação de votação concluída.',
                'repetida' => false,
                'resumo' => $resumo,
            ], 201);
        });
    }

    private function cargoCompativel(string $cargoCadastrado, string $cargoEtapa): bool
    {
        $cargo = Str::lower(Str::ascii(trim($cargoCadastrado)));

        return match ($cargoEtapa) {
            'deputado_federal' => str_contains($cargo, 'deputad') && str_contains($cargo, 'federal'),
            'deputado_estadual' => str_contains($cargo, 'deputad') && (
                str_contains($cargo, 'estadual') || str_contains($cargo, 'distrital')
            ),
            'senador' => str_contains($cargo, 'senador') || str_contains($cargo, 'senadora'),
            'governador' => str_contains($cargo, 'governador') || str_contains($cargo, 'governadora'),
            'presidente' => str_contains($cargo, 'presidente'),
            default => false,
        };
    }
}

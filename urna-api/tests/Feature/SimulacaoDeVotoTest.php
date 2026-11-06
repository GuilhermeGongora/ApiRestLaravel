<?php

namespace Tests\Feature;

use App\Models\Candidato;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimulacaoDeVotoTest extends TestCase
{
    use RefreshDatabase;

    private function cadastrarCandidatos(): void
    {
        $candidatos = [
            ['nome' => 'Pessoa Federal', 'numero' => 1234, 'cargo' => 'Deputado Federal'],
            ['nome' => 'Pessoa Estadual', 'numero' => 12345, 'cargo' => 'Deputada Estadual'],
            ['nome' => 'Pessoa Senado A', 'numero' => 123, 'cargo' => 'Senadora'],
            ['nome' => 'Pessoa Senado B', 'numero' => 456, 'cargo' => 'Senador'],
            ['nome' => 'Pessoa Governo', 'numero' => 12, 'cargo' => 'Governador'],
            ['nome' => 'Pessoa Presidência', 'numero' => 45, 'cargo' => 'Presidente'],
        ];

        foreach ($candidatos as $candidato) {
            Candidato::create([
                ...$candidato,
                'partido' => 'Partido de Teste',
                'sigla_partido' => 'TST',
                'data_nascimento' => '1980-01-01',
                'data_registro' => '2026-01-01',
                'votos' => 0,
                'ativo' => true,
            ]);
        }
    }

    private function votos(array $numeros): array
    {
        return array_map(fn ($numero) => [
            'numero' => $numero,
            'branco' => $numero === '',
        ], $numeros);
    }

    public function test_registra_seis_etapas_e_impede_repeticao_da_mesma_sessao(): void
    {
        $this->cadastrarCandidatos();
        $sessao = '5ad79af0-137c-4e11-91cc-7a324220f01f';
        $dados = [
            'sessao_uuid' => $sessao,
            'votos' => $this->votos(['1234', '12345', '123', '456', '12', '45']),
        ];

        $this->postJson('/api/votacoes', $dados)
            ->assertCreated()
            ->assertJsonCount(6, 'resumo')
            ->assertJsonPath('resumo.5.tipo', 'candidato');

        $this->assertSame(6, (int) DBValue::votes());
        $this->assertDatabaseCount('votos_simulados', 6);

        $this->postJson('/api/votacoes', $dados)
            ->assertOk()
            ->assertJsonPath('repetida', true);

        $this->assertSame(6, (int) DBValue::votes());
    }

    public function test_registra_legenda_branco_e_segunda_escolha_repetida_como_nulo(): void
    {
        $this->cadastrarCandidatos();

        $this->postJson('/api/votacoes', [
            'sessao_uuid' => 'dba65a2f-62db-493e-ac09-304359e5c7cc',
            'votos' => $this->votos(['12', '', '123', '123', '12', '45']),
        ])
            ->assertCreated()
            ->assertJsonPath('resumo.0.tipo', 'legenda')
            ->assertJsonPath('resumo.1.tipo', 'branco')
            ->assertJsonPath('resumo.2.tipo', 'candidato')
            ->assertJsonPath('resumo.3.tipo', 'nulo');

        $this->assertDatabaseHas('votos_simulados', ['etapa' => 4, 'tipo' => 'nulo']);
        $this->assertDatabaseHas('votos_simulados', ['etapa' => 1, 'tipo' => 'legenda']);
    }
}

final class DBValue
{
    public static function votes(): int
    {
        return (int) \Illuminate\Support\Facades\DB::table('candidatos')->sum('votos');
    }
}

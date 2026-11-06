<?php

namespace Database\Seeders;

use App\Models\Candidato;
use Illuminate\Database\Seeder;

class CandidatoSeeder extends Seeder
{
    public function run(): void
    {
        $candidatos = [
            ['nome' => 'Marina Costa', 'numero' => 12345, 'partido' => 'Partido Horizonte', 'sigla_partido' => 'PHZ', 'cargo' => 'Prefeita', 'data_nascimento' => '1987-04-12'],
            ['nome' => 'Lucas Ferreira', 'numero' => 23456, 'partido' => 'Aliança Cidadã', 'sigla_partido' => 'ALC', 'cargo' => 'Prefeito', 'data_nascimento' => '1979-08-24'],
            ['nome' => 'Ana Ribeiro', 'numero' => 34567, 'partido' => 'Movimento Popular', 'sigla_partido' => 'MVP', 'cargo' => 'Vereadora', 'data_nascimento' => '1992-01-18'],
            ['nome' => 'Rafael Lima', 'numero' => 45678, 'partido' => 'União do Futuro', 'sigla_partido' => 'UDF', 'cargo' => 'Vereador', 'data_nascimento' => '1984-10-09'],
        ];

        foreach ($candidatos as $candidato) {
            Candidato::firstOrCreate(
                ['numero' => $candidato['numero']],
                [...$candidato, 'data_registro' => '2026-10-01', 'votos' => 0, 'ativo' => true]
            );
        }
    }
}

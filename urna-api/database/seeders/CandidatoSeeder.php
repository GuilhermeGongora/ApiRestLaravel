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
            ['nome' => 'Eduardo Novaes', 'numero' => 1234, 'partido' => 'Partido Horizonte', 'sigla_partido' => 'PHZ', 'cargo' => 'Deputado Federal', 'data_nascimento' => '1984-02-18'],
            ['nome' => 'Daniela Prado', 'numero' => 12456, 'partido' => 'Partido Horizonte', 'sigla_partido' => 'PHZ', 'cargo' => 'Deputada Estadual', 'data_nascimento' => '1988-06-22'],
            ['nome' => 'Iara Mello', 'numero' => 123, 'partido' => 'Partido Horizonte', 'sigla_partido' => 'PHZ', 'cargo' => 'Senadora', 'data_nascimento' => '1971-08-13'],
            ['nome' => 'Caio Soares', 'numero' => 456, 'partido' => 'União do Futuro', 'sigla_partido' => 'UDF', 'cargo' => 'Senador', 'data_nascimento' => '1970-07-11'],
            ['nome' => 'Lia Ribeiro', 'numero' => 12, 'partido' => 'Partido Horizonte', 'sigla_partido' => 'PHZ', 'cargo' => 'Governadora', 'data_nascimento' => '1976-03-09'],
            ['nome' => 'Bruno Martins', 'numero' => 45, 'partido' => 'União do Futuro', 'sigla_partido' => 'UDF', 'cargo' => 'Presidente', 'data_nascimento' => '1967-12-14'],
        ];

        foreach ($candidatos as $candidato) {
            Candidato::firstOrCreate(
                ['numero' => $candidato['numero']],
                [...$candidato, 'data_registro' => '2026-10-01', 'votos' => 0, 'ativo' => true]
            );
        }
    }
}

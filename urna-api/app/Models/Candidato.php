<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidato extends Model
{
    protected $fillable = [
        'nome',
        'numero',
        'partido',
        'sigla_partido',
        'cargo',
        'data_nascimento',
        'data_registro',
        'votos',
        'ativo'
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'data_registro' => 'date',
        'ativo' => 'boolean'
    ];
}

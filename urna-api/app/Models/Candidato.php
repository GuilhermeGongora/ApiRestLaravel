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
        'ativo',
        'foto_path',
    ];

    protected $appends = ['foto_url'];

    protected $hidden = ['foto_path'];

    protected $casts = [
        'data_nascimento' => 'date',
        'data_registro' => 'date',
        'ativo' => 'boolean',
    ];

    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto_path ? '/api/candidatos/'.$this->getKey().'/foto' : null;
    }
}

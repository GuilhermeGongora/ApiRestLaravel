<?php

namespace App\Http\Controllers;

use App\Models\Candidato;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class VotoController extends Controller
{
    public function store(Candidato $candidato): JsonResponse
    {
        $updated = DB::table('candidatos')
            ->where('id', $candidato->id)
            ->where('ativo', true)
            ->increment('votos', 1, ['updated_at' => now()]);

        if ($updated === 0) {
            return response()->json(['message' => 'Candidato indisponível para votação.'], 422);
        }

        return response()->json(Candidato::findOrFail($candidato->id));
    }
}

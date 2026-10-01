<?php

namespace App\Http\Controllers;

use App\Models\Candidato;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CandidatoController extends Controller
{
    /**
     * GET /api/candidatos
     */
    public function index()
    {
        return response()->json(
            Candidato::orderBy('numero')->get()
        );
    }

    /**
     * POST /api/candidatos
     */
    public function store(Request $request)
    {
        $dados = $request->validate([
            'nome' => 'required|string|max:150',
            'numero' => 'required|integer|unique:candidatos,numero',
            'partido' => 'required|string|max:150',
            'sigla_partido' => 'required|string|max:20',
            'cargo' => 'required|string|max:100',
            'data_nascimento' => 'required|date',
            'data_registro' => 'required|date',
            'votos' => 'integer|min:0',
            'ativo' => 'boolean'
        ]);

        $candidato = Candidato::create($dados);

        return response()->json($candidato, 201);
    }

    /**
     * GET /api/candidatos/{id}
     */
    public function show(Candidato $candidato)
    {
        return response()->json($candidato);
    }

    /**
     * PUT/PATCH /api/candidatos/{id}
     */
    public function update(Request $request, Candidato $candidato)
    {
        $dados = $request->validate([
            'nome' => 'sometimes|required|string|max:150',

            'numero' => [
                'sometimes',
                'required',
                'integer',
                Rule::unique('candidatos', 'numero')
                    ->ignore($candidato->id)
            ],

            'partido' => 'sometimes|required|string|max:150',
            'sigla_partido' => 'sometimes|required|string|max:20',
            'cargo' => 'sometimes|required|string|max:100',
            'data_nascimento' => 'sometimes|required|date',
            'data_registro' => 'sometimes|required|date',
            'votos' => 'sometimes|integer|min:0',
            'ativo' => 'sometimes|boolean'
        ]);

        $candidato->update($dados);

        return response()->json($candidato);
    }

    /**
     * DELETE /api/candidatos/{id}
     */
    public function destroy(Candidato $candidato)
    {
        $candidato->delete();

        return response()->json([
            'mensagem' => 'Candidato removido com sucesso.'
        ]);
    }
}

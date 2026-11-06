<?php

namespace App\Http\Controllers;

use App\Models\Candidato;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CandidatoController extends Controller
{
    public function index()
    {
        return response()->json(Candidato::orderBy('numero')->get());
    }

    public function show(Candidato $candidato)
    {
        return response()->json($candidato);
    }

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
            'votos' => 'sometimes|integer|min:0',
            'ativo' => 'sometimes|boolean',
            'foto' => 'sometimes|file|mimes:jpeg,jpg,png,webp|max:2048',
        ]);

        unset($dados['foto']);

        if ($request->hasFile('foto')) {
            $dados['foto_path'] = $request->file('foto')->store('candidatos', 'public');
        }

        return response()->json(Candidato::create($dados), 201);
    }

    public function update(Request $request, Candidato $candidato)
    {
        $dados = $request->validate([
            'nome' => 'sometimes|required|string|max:150',
            'numero' => ['sometimes', 'required', 'integer', Rule::unique('candidatos', 'numero')->ignore($candidato->id)],
            'partido' => 'sometimes|required|string|max:150',
            'sigla_partido' => 'sometimes|required|string|max:20',
            'cargo' => 'sometimes|required|string|max:100',
            'data_nascimento' => 'sometimes|required|date',
            'data_registro' => 'sometimes|required|date',
            'votos' => 'sometimes|integer|min:0',
            'ativo' => 'sometimes|boolean',
            'foto' => 'sometimes|file|mimes:jpeg,jpg,png,webp|max:2048',
            'remover_foto' => 'sometimes|boolean',
        ]);

        unset($dados['foto'], $dados['remover_foto']);

        $fotoAntiga = $candidato->foto_path;

        if ($request->hasFile('foto')) {
            $dados['foto_path'] = $request->file('foto')->store('candidatos', 'public');
        } elseif ($request->boolean('remover_foto')) {
            $dados['foto_path'] = null;
        }

        $candidato->update($dados);

        if ($fotoAntiga && $fotoAntiga !== $candidato->foto_path) {
            Storage::disk('public')->delete($fotoAntiga);
        }

        return response()->json($candidato->refresh());
    }

    public function foto(Candidato $candidato)
    {
        if (!$candidato->foto_path || !Storage::disk('public')->exists($candidato->foto_path)) {
            abort(404);
        }

        return Storage::disk('public')->response($candidato->foto_path, null, [
            'Cache-Control' => 'public, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function destroy(Candidato $candidato)
    {
        $fotoAntiga = $candidato->foto_path;
        $candidato->delete();

        if ($fotoAntiga) {
            Storage::disk('public')->delete($fotoAntiga);
        }

        return response()->json(['mensagem' => 'Candidato removido com sucesso.']);
    }
}

<?php

use App\Http\Controllers\CandidatoController;
use App\Http\Controllers\VotacaoController;
use App\Http\Controllers\VotoController;
use Illuminate\Support\Facades\Route;

Route::apiResource('candidatos', CandidatoController::class);
Route::get('candidatos/{candidato}/foto', [CandidatoController::class, 'foto']);
Route::post('candidatos/{candidato}/votar', [VotoController::class, 'store']);
Route::post('votacoes', [VotacaoController::class, 'store']);

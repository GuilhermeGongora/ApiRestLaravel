<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CandidatoController;
use App\Http\Controllers\VotoController;

Route::apiResource('candidatos', CandidatoController::class);
Route::post('candidatos/{candidato}/votar', [VotoController::class, 'store']);

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CandidatoController;

Route::apiResource('candidatos', CandidatoController::class);

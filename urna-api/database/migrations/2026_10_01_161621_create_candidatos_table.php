<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidatos', function (Blueprint $table) {
            $table->id();

            $table->string('nome', 150);
            $table->integer('numero')->unique();
            $table->string('partido', 150);
            $table->string('sigla_partido', 20);
            $table->string('cargo', 100);

            $table->date('data_nascimento');
            $table->date('data_registro');

            $table->integer('votos')->default(0);
            $table->boolean('ativo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidatos');
    }
};

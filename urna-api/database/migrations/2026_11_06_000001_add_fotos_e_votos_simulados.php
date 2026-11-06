<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidatos', function (Blueprint $table) {
            $table->string('foto_path')->nullable();
        });

        Schema::create('votos_simulados', function (Blueprint $table) {
            $table->id();
            $table->uuid('sessao_uuid');
            $table->unsignedTinyInteger('etapa');
            $table->string('cargo', 40);
            $table->string('tipo', 20);
            $table->string('numero', 5)->nullable();
            $table->foreignId('candidato_id')->nullable()->constrained('candidatos')->nullOnDelete();
            $table->string('partido', 20)->nullable();
            $table->timestamps();
            $table->unique(['sessao_uuid', 'etapa']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votos_simulados');
        Schema::table('candidatos', function (Blueprint $table) {
            $table->dropColumn('foto_path');
        });
    }
};

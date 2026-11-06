# EleiçãoLab — CRUD de candidatos e simulador de urna

Projeto acadêmico completo com API REST Laravel e frontend React, Vite e TypeScript.

## Estrutura

- `urna-api/` — API Laravel, migrations, validação e SQLite
- `frontend/` — painel de controle, cadastro de candidatos e simulador de urna
- `.devcontainer/` — configuração para GitHub Codespaces

## Iniciar no GitHub Codespaces

Abra o repositório no Codespaces, utilizando a configuração Dev Container deste projeto. No primeiro início, o ambiente executa `composer install`, `npm install`, as migrations, o seeder de demonstração e a compilação do frontend. O script de inicialização executa automaticamente o Laravel e o Vite.

Abra a porta **5173** no painel **Ports** para usar a interface. A porta **8000** hospeda a API Laravel.

## Iniciar manualmente

Requisitos: PHP 8.3+, Composer, SQLite com a extensão PDO, Node.js 22+ e npm.

Terminal 1:

```bash
cd urna-api
cp -n .env.example .env
touch database/database.sqlite
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed --class=CandidatoSeeder
php artisan serve --host=0.0.0.0 --port=8000
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

A interface fica disponível na porta 5173. O Vite encaminha as chamadas `/api` para a porta 8000.

## Funcionalidades

- Dashboard com quantidade de candidatos, votos e ranking
- CRUD completo de candidatos com validação de formulários
- Busca e filtros por situação
- Simulador de urna com teclado numérico e seleção de candidato
- Confirmação de voto com incremento atômico no banco
- Dados fictícios de demonstração sem duplicação no seeder

## API

`GET /api/candidatos`, `GET /api/candidatos/{id}`, `POST /api/candidatos`, `PUT /api/candidatos/{id}`, `DELETE /api/candidatos/{id}` e `POST /api/candidatos/{id}/votar`.

O projeto é educacional e não implementa votação anônima, autenticação de eleitores, prevenção de votos repetidos ou mecanismos de uma eleição oficial.

## Bibliotecas obrigatórias

`react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers`, `axios` e `@tanstack/react-query`.

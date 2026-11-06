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


## Telas da aplicação

- `/` — urna eletrônica em tela cheia, para simular votos, com marca do TSE como referência visual e aviso de projeto não oficial.
- `/urna` — alternativa direta para a mesma urna em tela cheia.
- `/painel` — dashboard administrativo, indicadores e acesso às funcionalidades do CRUD.
- `/candidatos` — listagem, pesquisa e gestão de candidatos.
- `/candidatos/novo` — formulário de cadastro.
- `/candidatos/editar/:id` — edição.
- `/candidatos/excluir/:id` — confirmação de exclusão.
- `/apresentacao` — landing page anterior, com urna Three.js/React Three Fiber.

Na urna, BRANCO apresenta um estado de demonstração, mas não registra voto em branco. CORRIGE limpa a entrada. CONFIRMA envia um voto para `POST /api/candidatos/{id}/votar`, que executa incremento atômico no Laravel. O projeto não realiza autenticação de eleitor, anonimização ou controle de votação única.

## Executar

No Codespaces:

```bash
cd /workspaces/ApiRestLaravel
bash .devcontainer/start.sh
```

Abra a porta 5173. Em caso de atualização de dependências:

```bash
cd /workspaces/ApiRestLaravel/frontend
npm install
npm run build
npm run dev
```

A imagem institucional é carregada do domínio oficial `www.tse.jus.br`. O uso é apenas para referência visual: o EleiçãoLab não possui vínculo, aprovação ou certificação do Tribunal Superior Eleitoral.

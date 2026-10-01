# Urna Eletrônica API

API REST desenvolvida em Laravel para gerenciamento de candidatos
de uma urna eletrônica acadêmica.

## Tecnologias

- PHP
- Laravel
- MySQL
- Eloquent ORM

## Funcionalidades

CRUD de candidatos:

- Cadastro
- Consulta
- Alteração
- Exclusão

## Instalação

Clone o projeto:

git clone https://github.com/usuario/urna-eletronica-api.git

Entre na pasta:

cd urna-eletronica-api

Instale as dependências:

composer install

Copie o arquivo de ambiente:

cp .env.example .env

Gere a chave:

php artisan key:generate

Configure o banco no arquivo `.env`.

Execute as migrations:

php artisan migrate

Inicie o servidor:

php artisan serve

## Rotas

GET /api/candidatos

GET /api/candidatos/{id}

POST /api/candidatos

PUT /api/candidatos/{id}

DELETE /api/candidatos/{id}

## Exemplo de candidato

{
  "nome": "Carlos Oliveira",
  "numero": 22,
  "partido": "Partido Nacional",
  "sigla_partido": "PN",
  "cargo": "Presidente",
  "data_nascimento": "1975-08-21",
  "data_registro": "2026-10-01",
  "votos": 0,
  "ativo": true
}
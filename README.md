# EleiçãoLab — Simulador acadêmico de votação 2026

Frontend React/Vite + TypeScript integrado à API REST Laravel. Experiência de urna em tela cheia, dashboard separado e CRUD completo de candidatos, com upload de fotos.

> **Projeto acadêmico e não oficial.** A identidade visual do TSE aparece exclusivamente como referência, sem vínculo, autorização institucional ou certificação. O aplicativo não reproduz garantias de sigilo, autenticação ou segurança de eleições reais.

## Telas

| Rota | Função |
| --- | --- |
| `/` ou `/urna` | Urna eletrônica em tela cheia |
| `/painel` | Dashboard e estatísticas |
| `/candidatos` | Listagem, filtros e CRUD |
| `/candidatos/novo` | Cadastro, com foto opcional |
| `/candidatos/editar/:id` | Edição, troca e remoção da foto |
| `/candidatos/excluir/:id` | Confirmação de exclusão |
| `/apresentacao` | Landing page e modelo 3D de urna com Three.js |

## Sequência de votação — 2026, 1º turno

1. Deputado federal — 4 dígitos
2. Deputado estadual ou distrital — 5 dígitos
3. Senador, 1ª vaga — 3 dígitos
4. Senador, 2ª vaga — 3 dígitos
5. Governador — 2 dígitos
6. Presidente da República — 2 dígitos

O simulador permite seleção nominal, voto em branco, nulo e de legenda para deputados. Repetir o mesmo senador na segunda vaga resulta em voto nulo, conforme a regra aplicável. Uma confirmação avança de cargo; ao concluir a sexta etapa, a API registra todas as escolhas em uma transação e exibe **FIM**.

O sinal sonoro é **sintetizado no navegador**, sem usar gravação oficial. Ele toca uma nota curta entre as etapas e uma sequência ao finalizar; há controle para desativar o som.

As fotos são enviadas pelo formulário como imagens JPEG, PNG ou WebP até 2 MB. A API salva os arquivos na pasta de armazenamento e disponibiliza o endereço `/api/candidatos/{id}/foto`. Se não houver foto, a urna utiliza as iniciais.

## API

- `GET /api/candidatos`
- `GET /api/candidatos/{id}`
- `POST /api/candidatos`
- `POST /api/candidatos/{id}` com multipart e `_method=PUT`
- `DELETE /api/candidatos/{id}`
- `GET /api/candidatos/{id}/foto`
- `POST /api/votacoes`, com `sessao_uuid` e seis escolhas (`numero`, `branco`)
- `POST /api/candidatos/{id}/votar`, endpoint de compatibilidade

O banco mantém os totais nominais em `candidatos.votos` e os registros da simulação em `votos_simulados`. O mesmo identificador de sessão não incrementa votos duas vezes. **Não há controle de eleitor único, sigilo eleitoral ou apuração oficial.**

O cadastro original mantém unicidade global do número; para a demonstração, utilize números distintos entre candidatos. Isso é uma simplificação acadêmica em comparação ao cadastro eleitoral real.

## Executar no Codespaces

Atualize a branch e execute as migrations para criar o campo da foto e a tabela de simulações:

```bash
cd /workspaces/ApiRestLaravel
git pull origin main
cd urna-api
php artisan migrate --force
php artisan db:seed --class=CandidatoSeeder --force
cd ..
bash .devcontainer/start.sh
```

A interface estará disponível na porta **5173** e a API Laravel na **8000**. Se necessário, use `cd frontend && npm install && npm run build && npm run dev`.

## Testes

```bash
cd urna-api
php artisan test --filter=SimulacaoDeVotoTest
cd ../frontend
npm run build
```

O workflow `.github/workflows/verify-eleicaolab.yml` verifica o frontend e os testes da API em Pull Requests para `main`.

## Tecnologias

React 19, Vite, TypeScript, react-router-dom, react-hook-form, zod, @hookform/resolvers, axios, TanStack Query, Three.js, Laravel, SQLite.

Documentação oficial de referência: [ordem de votação 2026](https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/faltam-25-dias-saiba-qual-e-a-ordem-de-votacao-na-urna-eletronica) e [Manual do Eleitor](https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/manual-do-eleitor-veja-como-se-preparar-para-a-votacao).

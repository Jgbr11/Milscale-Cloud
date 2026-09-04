# Evidências — CRUD com MongoDB Atlas e Azure Functions

Disciplina: Arquitetura e Soluções Cloud — PJBL · Grupo 10
Projeto: **MilScale** — sistema de gestão de escalas de serviço militar
Repositório: <https://github.com/Jgbr11/Milscale-Cloud>

## Integrantes

* Enzo Watanabe de Lima
* João Guilherme Salomão
* João Guilherme Cordeiro
* Rafael Zeni Simião

---

## 1. Banco de dados MongoDB

| Item | Valor |
| --- | --- |
| Serviço | MongoDB Atlas — cluster M0 (gratuito) |
| Cluster | `milscale` |
| Banco | `milscale` |
| Coleção | `escala` |
| Documentos na carga inicial | 12 serviços |

Formato de um documento da coleção `escala`:

```json
{
  "_id": "66d3f1a9c4e5b2a1d8f90123",
  "posto": "1º TEN",
  "nome": "ANDRADE",
  "circulo": "oficial",
  "funcao": "Oficial de Dia",
  "data": "2026-09-05",
  "subunidade": "1ª Cia Fuz"
}
```

**Prints a anexar:**

- [ ] Tela do Atlas mostrando o cluster `milscale` ativo (aba *Database / Clusters*).
- [ ] Aba *Browse Collections* com o banco `milscale`, a coleção `escala` e os documentos listados.
- [ ] Aba *Database Access* com o usuário criado.
- [ ] Aba *Network Access* com a liberação de IP.

---

## 2. As quatro Azure Functions

Function App: **`func-milscale-1234`** · Grupo de recursos `rg-milscale` · Região `eastus`
Runtime: Node.js, modelo de programação **v4** (rotas registradas por código com `app.http()`, sem `function.json`).

| # | Operação | Function | Método e rota | Arquivo |
| --- | --- | --- | --- | --- |
| 1 | Inserir | `InserirEscala` | `POST /api/InserirEscala` | `azure-function/src/functions/inserirEscala.js` |
| 2 | Alterar | `AlterarEscala` | `PUT /api/AlterarEscala?id=<id>` | `azure-function/src/functions/alterarEscala.js` |
| 3 | Excluir | `ExcluirEscala` | `DELETE /api/ExcluirEscala?id=<id>` | `azure-function/src/functions/excluirEscala.js` |
| 4 | Pesquisar | `PesquisarEscala` | `GET /api/PesquisarEscala?termo=<texto>` | `azure-function/src/functions/pesquisarEscala.js` |

As quatro compartilham dois módulos: `src/mongo.js`, que mantém uma única conexão
com o Atlas reaproveitada entre invocações, e `src/validacao.js`, que valida os
campos do serviço antes de gravar.

**Prints a anexar:**

- [ ] Saída do `func start` listando as quatro rotas (o comando imprime "Functions:" seguido das URLs).
- [ ] Portal do Azure → Function App `func-milscale-1234` → *Functions*, com as quatro na lista.
- [ ] Saída do `scripts/testar-crud.ps1`, que executa inserir → pesquisar → alterar → excluir em sequência.

---

## 3. Frontend executando as quatro Functions

Site publicado: <https://agreeable-cliff-08658490f.3.azurestaticapps.net>
Tela: **Gerenciar** (`frontend/gerenciar.html`)

| Ação na tela | Function chamada |
| --- | --- |
| Preencher o formulário e clicar em **Incluir na escala** | `InserirEscala` |
| Digitar na busca e clicar em **Pesquisar** | `PesquisarEscala` |
| Clicar em **Editar** numa linha, alterar e **Salvar alterações** | `AlterarEscala` |
| Clicar em **Excluir** numa linha e confirmar | `ExcluirEscala` |

A tela **Escala** (RF11) também consome a `PesquisarEscala`, então o serviço
cadastrado na tela Gerenciar aparece na consulta da escala publicada.

**Prints a anexar:**

- [ ] Tela Gerenciar após incluir um serviço, com a faixa verde de confirmação e o registro novo na tabela.
- [ ] Tela Gerenciar com um termo digitado na busca e a tabela filtrada.
- [ ] Tela Gerenciar em modo de edição (título "Alterar serviço de …") e depois a confirmação da alteração.
- [ ] Caixa de confirmação de exclusão e a faixa confirmando o serviço excluído.
- [ ] Tela Escala mostrando o serviço que foi cadastrado na tela Gerenciar.
- [ ] Aba *Network* do navegador (F12) com as chamadas `InserirEscala`, `AlterarEscala`, `ExcluirEscala` e `PesquisarEscala` e seus códigos de status.

---

## 4. Teste automatizado das quatro operações

O script `azure-function/scripts/testar-crud.ps1` executa as quatro Functions em
sequência contra o banco real. Saída obtida em 03/09/2026 contra as Functions **publicadas no Azure**,
gravando no cluster do Atlas (rode com `-Base "https://func-milscale-1234.azurewebsites.net/api"`):

```
=== 1/4  INSERIR  ->  POST https://func-milscale-1234.azurewebsites.net/api/InserirEscala ===
{ "mensagem": "Serviço incluído na escala.",
  "servico": { "id": "6a9a1047bb5222b3bbed8252", "posto": "1º TEN", "nome": "TESTE", ... } }

=== 2/4  PESQUISAR  ->  GET /api/PesquisarEscala?termo=TESTE ===
1 serviço(s) encontrado(s).

=== 3/4  ALTERAR  ->  PUT /api/AlterarEscala?id=6a9a1047bb5222b3bbed8252 ===
{ "mensagem": "Serviço alterado.", "servico": { "funcao": "Adjunto ao Oficial de Dia", ... } }

=== 4/4  EXCLUIR  ->  DELETE /api/ExcluirEscala?id=6a9a1047bb5222b3bbed8252 ===
{ "mensagem": "Serviço excluído da escala." }

As quatro Azure Functions responderam corretamente.
```

### Tratamento de erro verificado

| Situação | Resposta |
| --- | --- |
| Inserir com `circulo` inválido e data fora do formato | `400` listando os dois campos |
| Alterar sem informar o `id` | `400` explicando o formato esperado |
| Excluir um `id` válido mas inexistente | `404` |
| Excluir um `id` malformado | `400` |
| Pesquisar por `Cmdo` | `200` com os 3 serviços da Cia Cmdo Ap |
| Pesquisar por `.*` | `200` com 0 resultados — o termo não vira curinga |

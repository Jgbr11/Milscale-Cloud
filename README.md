# MilScale — MVP

MVP do MilScale, sistema de gestão de escalas de serviço militar de um batalhão.
<<<<<<< HEAD
O frontend é HTML, CSS e JavaScript puro. Ele demonstra a consulta da escala
publicada (RF11), o dashboard de indicadores operacionais (RF14) e a manutenção
da escala — incluir, alterar, excluir e pesquisar — com uma Azure Function por
operação, gravando em um banco MongoDB Atlas.
=======
O frontend é HTML, CSS e JavaScript puro.
Osdados vêm de mocks — uma Azure Function HTTP para a escala e um endpoint do
Apidog para os indicadores.
>>>>>>> e7f90525347d0509cb96041187b92306ef47cd7f

## URLs

| Recurso | URL |
| --- | --- |
| Site publicado (Azure Static Web Apps) | https://agreeable-cliff-08658490f.3.azurestaticapps.net |
| Azure Functions (publicadas) | https://func-milscale-1234.azurewebsites.net/api |
| Azure Functions (local) | `http://localhost:7071/api` |
| Mock de indicadores (Apidog Cloud Mock) | https://mock.apidog.com/m1/1370173-1374855-default/indicadores |

## As Azure Functions

| Operação | Método e rota | O que faz |
| --- | --- | --- |
| Inserir | `POST /api/InserirEscala` | Grava um serviço novo. `201` com o registro criado, `400` se algum campo estiver inválido. |
| Alterar | `PUT /api/AlterarEscala?id=<id>` | Substitui os campos do serviço. `404` se o id não existir. |
| Excluir | `DELETE /api/ExcluirEscala?id=<id>` | Remove o serviço. `404` se o id não existir. |
| Pesquisar | `GET /api/PesquisarEscala?termo=<texto>` | Devolve a escala inteira, ou só os serviços cujo posto, nome, função ou subunidade casem com o termo. |

`GetEscala` continua no repositório como registro do MVP anterior — devolvia a
escala fixa, sem banco — mas o frontend não a usa mais.

Um serviço da escala tem esta forma:

```json
{
  "posto": "1º TEN",
  "nome": "ANDRADE",
  "circulo": "oficial",
  "funcao": "Oficial de Dia",
  "data": "2026-09-05",
  "subunidade": "1ª Cia Fuz"
}
```

`circulo` aceita `oficial`, `sargento` ou `praca`, e é o que define a cor da aba
lateral de cada linha da tabela. `data` vai no formato `AAAA-MM-DD`.

## Como rodar localmente

Você precisa do [Node.js 18 ou superior](https://nodejs.org) e do
[Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local):

```
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

### 1. Crie o banco no MongoDB Atlas

1. Cadastre-se em <https://mongodb.com/cloud/atlas/register> (dá para entrar com
   a conta do GitHub) e crie um cluster **M0 — Free**.
2. Em **Database Access**, crie um usuário e guarde a senha.
3. Em **Network Access**, libere `0.0.0.0/0`. O plano Consumption do Azure
   Functions não tem IP fixo, então sem essa liberação o Atlas recusa a conexão.
4. Em **Connect → Drivers → Node.js**, copie a connection string.

### 2. Configure a connection string

Copie `azure-function/local.settings.json.exemplo` para
`azure-function/local.settings.json` e preencha:

```json
"MONGODB_URI": "mongodb+srv://usuario:senha@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority",
"MONGODB_DB": "milscale"
```

O `local.settings.json` está no `.gitignore` — a senha do banco não vai para o
repositório. No Azure, essas duas chaves são App Settings da Function App.

### 3. Faça a carga inicial e suba as Functions

```
cd azure-function
npm install
node scripts/popularBanco.js
func start
```

O `popularBanco.js` insere os 12 serviços que o MVP anterior devolvia fixos, e
não faz nada se a coleção já tiver documentos. O `func start` deixa as cinco
rotas no ar em `http://localhost:7071/api`; deixe esse terminal aberto.

Para conferir as quatro operações de uma vez:

```
.\scripts\testar-crud.ps1
```

### 4. Abra o frontend

Em `frontend/js/api.js`, troque a constante para o endereço local:

```js
const URL_API = 'http://localhost:7071/api';
```

Abra `frontend/index.html` no navegador (duplo clique funciona). O CORS liberado
em `local.settings.json` permite que a página converse com a função na sua
máquina. A tela **Indicadores** consome o Cloud Mock do Apidog, que é público e
funciona mesmo com o Apidog fechado.

## Se a conexão com o Atlas falhar (`querySrv ECONNREFUSED`)

Em algumas redes — a da faculdade entre elas — o Node.js não consegue resolver
o registro DNS SRV que o formato `mongodb+srv://` exige, e a conexão falha com
`querySrv ECONNREFUSED` mesmo com o usuário e a senha corretos. O `nslookup`
funciona; o driver, não, porque o Node acaba usando um servidor DNS que não
responde.

A saída é usar a connection string no formato direto, que não depende de SRV.
No Atlas, em **Connect → Drivers**, troque a versão do driver para
**Node.js 2.2.12 or later** — ele mostra a string longa, com os três nós do
cluster:

```
mongodb://usuario:senha@servidor-shard-00-00.xxxxx.mongodb.net:27017,servidor-shard-00-01.xxxxx.mongodb.net:27017,servidor-shard-00-02.xxxxx.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

É essa a forma usada neste projeto, tanto localmente quanto nas App Settings do
Azure. Ela funciona nos dois ambientes.

## Formato esperado do mock do Apidog

O dashboard consome este JSON:

```json
{
  "mes": "Setembro/2026",
  "militaresEscalados": 128,
  "postosCobertos": 46,
  "postosPrevistos": 48,
  "permutasPendentes": 5
}
```

A porcentagem de cobertura mostrada no card é calculada no frontend a partir de
`postosCobertos` e `postosPrevistos`. No Apidog o endpoint é `GET /indicadores`,
com o JSON cadastrado em **Exemplo** e a prioridade de mock em **Exemplo de
resposta primeiro** — sem essa prioridade o mock devolve `{}`, porque o schema do
endpoint está vazio de propósito.

## Deploy

- **Frontend:** Azure Static Web App `swa-milscale`, apontando para a pasta
  `frontend`. Cada `push` no branch `main` republica o site automaticamente.
- **Backend:** Function App `func-milscale-1234`, no grupo `rg-milscale`, região
  `eastus`. Publique com `func azure functionapp publish func-milscale-1234`.
- **Connection string em produção:** as chaves vão como App Settings, nunca no
  código:

  ```
  az functionapp config appsettings set --name func-milscale-1234 --resource-group rg-milscale --settings "MONGODB_URI=<sua-string>" "MONGODB_DB=milscale"
  ```

- **CORS:** a Function App autoriza apenas a origem do Static Web App
  (`az functionapp cors add`). Chamadas de outros domínios são bloqueadas pelo
  navegador.

Para não consumir crédito depois da apresentação, apague os dois grupos de
recursos — o Static Web App foi criado em um grupo próprio:

```
az group delete --name rg-milscale --yes
az group delete --name swa-milscale_group --yes
```

## Estrutura

```
EVIDENCIAS.md                   evidências da atividade de CRUD com MongoDB
GRUPO.md                        integrantes do grupo
Prompt.md                       prompt usado para gerar o MVP inicial via IAG
README.md
frontend/
  index.html                    página inicial com o menu
  escala.html                   RF11 — consulta de escala
  dashboard.html                RF14 — indicadores
  gerenciar.html                CRUD — inserir, alterar, excluir e pesquisar
  css/style.css
  js/api.js                     endereço base das Azure Functions
  js/escala.js
  js/dashboard.js
  js/gerenciar.js
azure-function/
  host.json                     configuração do host do Functions
  local.settings.json.exemplo   modelo das chaves locais (o real fica fora do git)
  package.json                  dependências e o "main" indexado
  scripts/
    popularBanco.js             carga inicial dos 12 serviços
    testar-crud.ps1             exercita as quatro Functions em sequência
  src/
    mongo.js                    conexão única com o Atlas, reaproveitada
    validacao.js                validação dos campos do serviço
    functions/
      inserirEscala.js
      alterarEscala.js
      excluirEscala.js
      pesquisarEscala.js
      getEscala.js              escala fixa do MVP anterior, sem uso pelo frontend
```

## Modelo de programação

A Azure Function usa o **modelo v4** do Node.js. Nele não existe `function.json`:
a rota é registrada por código, com `app.http()`, e o worker descobre as funções
pelo caminho declarado em `"main"` no `package.json` (`src/functions/*.js`).

```js
app.http('InserirEscala', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async function (requisicao, contexto) {
    return { status: 201, jsonBody: { /* ... */ } };
  }
});
```

O nome passado em `app.http()` vira a rota, por isso o endpoint é
`/api/InserirEscala`.

Os módulos `src/mongo.js` e `src/validacao.js` ficam fora de `src/functions/` de
propósito: só o que está sob `functions/` é carregado como Function pelo worker.

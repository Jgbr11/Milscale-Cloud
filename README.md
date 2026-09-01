# MilScale — MVP

MVP do MilScale, sistema de gestão de escalas de serviço militar de um batalhão.
O frontend é HTML, CSS e JavaScript puro e demonstra dois requisitos: a consulta
da escala publicada (RF11) e o dashboard de indicadores operacionais (RF14). Os
dados vêm de mocks — uma Azure Function HTTP para a escala e um endpoint do
Apidog para os indicadores.

## URLs

| Recurso | URL |
| --- | --- |
| Site publicado (Azure Static Web Apps) | https://agreeable-cliff-08658490f.3.azurestaticapps.net |
| Azure Function (local) | `http://localhost:7071/api/GetEscala` |
| Azure Function (publicada) | https://func-milscale-1234.azurewebsites.net/api/GetEscala |
| Mock de indicadores (Apidog Cloud Mock) | https://mock.apidog.com/m1/1370173-1374855-default/indicadores |

## Como rodar localmente

Você precisa do [Node.js](https://nodejs.org) e do
[Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local):

```
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

O modelo v4 do Node exige o pacote `@azure/functions`, então a Function tem uma
etapa de instalação antes do primeiro `func start`.

1. Instale as dependências e suba a Azure Function:

   ```
   cd azure-function
   npm install
   func start
   ```

   Deixe esse terminal aberto. Confirme no navegador que
   `http://localhost:7071/api/GetEscala` devolve o JSON da escala.

2. Abra `frontend/index.html` no navegador (duplo clique já funciona) e navegue
   até **Escala**. O CORS liberado em `azure-function/local.settings.json`
   permite que a página converse com a função rodando na sua máquina.

3. A tela **Indicadores** consome o Cloud Mock do Apidog, que é público —
   não precisa do Apidog aberto. A constante `APIDOG_MOCK_URL`, no topo de
   `frontend/js/dashboard.js`, já aponta para ele. Se a constante voltar ao
   valor `COLOQUE_AQUI`, a tela exibe um aviso explicando o que falta.

   No Apidog, o endpoint é `GET /indicadores`, com o JSON cadastrado em
   **Exemplo** e a prioridade de mock em **Exemplo de resposta primeiro**
   (Configurações de Mock) — sem essa prioridade o mock devolve `{}`, porque o
   schema do endpoint está vazio de propósito.

   Como a constante aponta para o **Cloud Mock**, a tela funciona mesmo com o
   Apidog fechado.

## Formato esperado do mock do Apidog

O dashboard consome este JSON — configure o endpoint do Apidog para devolver
exatamente estes campos:

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
`postosCobertos` e `postosPrevistos`.

## Deploy

Tudo já está publicado. O que foi feito, para referência:

- **Frontend:** Azure Static Web App `swa-milscale`, com o app apontando para a
  pasta `frontend`. Cada `push` no branch `main` republica o site automaticamente.
- **Backend:** Function App `func-milscale-1234`, no grupo `rg-milscale`, região
  `eastus`, publicada com `func azure functionapp publish func-milscale-1234`.
- **CORS:** a Function App autoriza apenas a origem do Static Web App
  (`az functionapp cors add`). Chamadas de outros domínios não recebem o
  cabeçalho de autorização e são bloqueadas pelo navegador.

Para não consumir crédito depois da apresentação, apague os dois grupos de
recursos — o Static Web App foi criado em um grupo próprio:

```
az group delete --name rg-milscale --yes
az group delete --name swa-milscale_group --yes
```

## Estrutura

```
GRUPO.md                        integrantes do grupo
Prompt.md                       prompt usado para gerar o projeto via IAG
README.md
frontend/
  index.html                    página inicial com o menu
  escala.html                   RF11 — consulta de escala
  dashboard.html                RF14 — indicadores
  css/style.css
  js/escala.js
  js/dashboard.js
azure-function/
  host.json                     configuração do host do Functions
  local.settings.json           runtime Node e CORS liberado para testes locais
  package.json                  dependência @azure/functions e o "main" indexado
  src/functions/
    getEscala.js                registro da rota + escala mockada em JSON
```

## Modelo de programação

A Azure Function usa o **modelo v4** do Node.js. Nele não existe `function.json`:
a rota é registrada por código, com `app.http()`, e o worker descobre as funções
pelo caminho declarado em `"main"` no `package.json` (`src/functions/*.js`).

```js
app.http('GetEscala', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async function () {
    return { status: 200, jsonBody: { /* ... */ } };
  }
});
```

O nome passado em `app.http()` vira a rota, por isso o endpoint continua sendo
`/api/GetEscala`. O modelo v4 pede Node.js 18 ou superior.

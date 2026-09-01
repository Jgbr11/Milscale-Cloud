# MilScale — MVP

MVP acadêmico do MilScale, sistema de gestão de escalas de serviço militar de um batalhão.
O frontend é HTML, CSS e JavaScript puro Os dados vêm de mocks —
uma Azure Function HTTP para a escala e um endpoint do Apidog para os indicadores.

## URLs

| Recurso | URL |
| --- | --- |
| Site publicado (Azure Static Web Apps) | `[URL_AZURE_STATIC_WEB_APPS]` |
| Azure Function (local) | `http://localhost:7071/api/GetEscala` |
| Azure Function (publicada) | `https://[NOME_DA_FUNCTION_APP].azurewebsites.net/api/GetEscala` |
| Mock de indicadores — Apidog local | `http://127.0.0.1:3658/m1/1370173-1374855-default/indicadores` |
| Mock de indicadores — Apidog Cloud Mock | `[URL_APIDOG]` |

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

3. Para a tela **Indicadores**, deixe o **Apidog aberto** com o mock local
   ativo. A constante `APIDOG_MOCK_URL`, no topo de `frontend/js/dashboard.js`,
   já aponta para ele. Se a constante voltar ao valor `COLOQUE_AQUI`, a tela
   exibe um aviso explicando o que falta configurar.

   No Apidog, o endpoint é `GET /indicadores`, com o JSON cadastrado em
   **Exemplo** e a prioridade de mock em **Exemplo de resposta primeiro**
   (Configurações de Mock) — sem essa prioridade o mock devolve `{}`, porque o
   schema do endpoint está vazio de propósito.

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

> **Atenção antes do deploy:** a URL de mock local (`127.0.0.1:3658`) só
> funciona nesta máquina, com o Apidog aberto. O site publicado não alcança
> esse endereço. Antes de publicar, ative o **Cloud Mock** no Apidog e troque
> `APIDOG_MOCK_URL` pela URL `https://mock.apidog.com/...`.

- **Frontend:** Azure Static Web Apps, apontando a pasta do app para `frontend`.
  Depois do deploy, troque a URL da função em `frontend/js/escala.js` (constante
  `URL_FUNCTION_ESCALA`) pela URL publicada e habilite o CORS da Function App
  para o domínio do Static Web App.
- **Backend:** publique a pasta `azure-function` na Function App
  (`func azure functionapp publish [NOME_DA_FUNCTION_APP]`).

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

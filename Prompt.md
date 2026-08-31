# Prompt utilizado

Este é o prompt enviado à IAG (Claude) para gerar o frontend deste MVP.

---

Prompt — MVP MilScale (PJBL Arquitetura e Soluções Cloud)

Cole este prompt inteiro na conversa com o Claude (ou Claude Code) para gerar o projeto.

Quero que você crie o frontend de um MVP acadêmico para o sistema MilScale, um sistema de gestão de escalas de serviço militar. Este é um trabalho em grupo (PJBL) da disciplina Arquitetura e Soluções Cloud. Siga TODAS as regras abaixo à risca — o objetivo é um projeto simples, funcional e fácil de explicar em aula, não um sistema completo.

Contexto do sistema (resumo)

O MilScale gera e publica a escala de serviço de um batalhão. Os principais requisitos que este MVP deve demonstrar são:

RF11 — visualização da escala por militar/subunidade/função.
RF14 — dashboard com indicadores operacionais (ex: cobertura de postos, serviços no mês).

Stack (mantenha simples, sem dependências desnecessárias)

Frontend: HTML + CSS + JavaScript puro (sem framework, sem build step, sem bibliotecas externas). Nada de React/Module Federation — não são obrigatórios e adicionam complexidade que não precisamos.
Backend mock: 1 Azure Function HTTP trigger em JavaScript (Node.js, modelo v4), retornando dado mockado fixo em JSON (sem banco de dados).
Código padronizado: nomes de arquivos, pastas, funções e variáveis em português ou inglês (escolha um e mantenha consistente em todo o projeto), indentação de 2 espaços, comentários curtos só onde o motivo não for óbvio.

Telas obrigatórias (mínimo 2)

Consulta de Escala — tabela simples listando militar, função de serviço, data e subunidade. Os dados vêm de um fetch para a Azure Function GET (endpoint mock).
Dashboard de Indicadores — 2 ou 3 cards com números simples (ex: total de militares escalados no mês, postos cobertos, permutas pendentes). Os dados vêm de um fetch para um endpoint mock criado no Apidog (vou te passar a URL depois de configurá-lo — por enquanto, deixe a URL em uma constante clara no topo do arquivo JS, tipo const APIDOG_MOCK_URL = "COLOQUE_AQUI").

Layout: um menu simples no topo para trocar entre as duas telas (pode ser só dois links/botões — nada de rotas complexas).

Estrutura de arquivos esperada

    /GRUPO.md
    /Prompt.md
    /README.md
    /frontend
      index.html
      escala.html
      dashboard.html
      /css/style.css
      /js/escala.js
      /js/dashboard.js
    /azure-function
      /GetEscala
        function.json
        index.js
        (mock de escala em JSON dentro do próprio index.js)

Arquivos de documentação (obrigatórios)

GRUPO.md — nomes dos integrantes: Enzo Watanabe de Lima, João Guilherme Salomão, João Guilherme Cordeiro, Rafael Zeni Simião.
Prompt.md — cole este mesmo prompt (o texto que você está lendo agora), já que ele é a instrução usada para gerar o frontend via IAG.
README.md — com:

- Descrição curta do projeto (2-3 linhas).
- Link do site publicado no Azure Static Web Apps (deixe um placeholder [URL_AZURE_STATIC_WEB_APPS] para eu preencher depois do deploy).
- URL do endpoint da Azure Function.
- URL do mock criado no Apidog (placeholder [URL_APIDOG]).
- Passo a passo simples de como rodar localmente (Azure Functions Core Tools + abrir o index.html).

O que NÃO fazer

Não criar autenticação, banco de dados real, ou telas além das 2 pedidas.
Não usar frameworks CSS pesados (Bootstrap/Tailwind) — CSS simples próprio é suficiente.
Não complicar a estrutura de pastas além do necessário.
Não deixar código comentado/morto ou console.log de debug no resultado final.

Entregável final

Ao terminar, me dê:

O código completo de cada arquivo.
Um resumo de 3-4 linhas de como testar localmente.
Um lembrete do que eu ainda preciso preencher manualmente (URLs de deploy).

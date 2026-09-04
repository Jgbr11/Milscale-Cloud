const { app } = require('@azure/functions');
const { obterColecao, paraJson } = require('../mongo');

const UNIDADE = '1º Batalhão de Infantaria';
const PERIODO = 'Setembro/2026';
const CAMPOS_BUSCA = ['posto', 'nome', 'funcao', 'subunidade'];

// Caracteres que teriam significado especial dentro de uma expressao regular.
const METACARACTERES = '.*+?^${}()|[]\\/';

// Neutraliza os metacaracteres para que o termo digitado seja tratado como
// texto literal, e nao como uma expressao regular executada pelo banco.
function escaparRegex(texto) {
  return Array.from(texto)
    .map(function (caractere) {
      return METACARACTERES.includes(caractere) ? '\\' + caractere : caractere;
    })
    .join('');
}

function montarFiltro(termo) {
  if (termo === '') {
    return {};
  }
  const expressao = { $regex: escaparRegex(termo), $options: 'i' };
  return {
    $or: CAMPOS_BUSCA.map(function (campo) {
      return { [campo]: expressao };
    })
  };
}

app.http('PesquisarEscala', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async function (requisicao, contexto) {
    const termo = (requisicao.query.get('termo') || '').trim();

    try {
      const colecao = await obterColecao();
      const documentos = await colecao
        .find(montarFiltro(termo))
        .sort({ data: 1, posto: 1 })
        .toArray();

      contexto.log(`Pesquisa "${termo}" devolveu ${documentos.length} serviços.`);
      return {
        status: 200,
        jsonBody: {
          unidade: UNIDADE,
          periodo: PERIODO,
          termo: termo,
          escala: documentos.map(paraJson)
        }
      };
    } catch (erro) {
      contexto.error('Falha ao pesquisar a escala', erro);
      return { status: 500, jsonBody: { erro: 'Não foi possível consultar o banco.', detalhe: erro.message } };
    }
  }
});

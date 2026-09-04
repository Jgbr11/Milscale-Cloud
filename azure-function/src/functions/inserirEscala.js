const { app } = require('@azure/functions');
const { obterColecao, paraJson } = require('../mongo');
const { validarServico, montarServico } = require('../validacao');

app.http('InserirEscala', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async function (requisicao, contexto) {
    let corpo;
    try {
      corpo = await requisicao.json();
    } catch (erro) {
      return { status: 400, jsonBody: { erro: 'Corpo da requisição não é um JSON válido.' } };
    }

    const erros = validarServico(corpo);
    if (erros.length > 0) {
      return { status: 400, jsonBody: { erro: 'Dados inválidos.', detalhes: erros } };
    }

    try {
      const colecao = await obterColecao();
      const servico = montarServico(corpo);
      const resultado = await colecao.insertOne(servico);

      contexto.log(`Serviço inserido: ${resultado.insertedId}`);
      return {
        status: 201,
        jsonBody: {
          mensagem: 'Serviço incluído na escala.',
          servico: paraJson({ _id: resultado.insertedId, ...servico })
        }
      };
    } catch (erro) {
      contexto.error('Falha ao inserir o serviço', erro);
      return { status: 500, jsonBody: { erro: 'Não foi possível gravar no banco.', detalhe: erro.message } };
    }
  }
});

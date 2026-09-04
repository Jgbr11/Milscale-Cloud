const { app } = require('@azure/functions');
const { obterColecao, paraJson, paraObjectId } = require('../mongo');
const { validarServico, montarServico } = require('../validacao');

app.http('AlterarEscala', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  handler: async function (requisicao, contexto) {
    const id = paraObjectId(requisicao.query.get('id'));
    if (!id) {
      return { status: 400, jsonBody: { erro: 'Informe um id válido na query string. Ex.: ?id=507f1f77bcf86cd799439011' } };
    }

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
      const resultado = await colecao.updateOne({ _id: id }, { $set: servico });

      if (resultado.matchedCount === 0) {
        return { status: 404, jsonBody: { erro: 'Nenhum serviço da escala tem esse id.' } };
      }

      contexto.log(`Serviço alterado: ${id}`);
      return {
        status: 200,
        jsonBody: { mensagem: 'Serviço alterado.', servico: paraJson({ _id: id, ...servico }) }
      };
    } catch (erro) {
      contexto.error('Falha ao alterar o serviço', erro);
      return { status: 500, jsonBody: { erro: 'Não foi possível gravar no banco.', detalhe: erro.message } };
    }
  }
});

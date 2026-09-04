const { app } = require('@azure/functions');
const { obterColecao, paraObjectId } = require('../mongo');

app.http('ExcluirEscala', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  handler: async function (requisicao, contexto) {
    const id = paraObjectId(requisicao.query.get('id'));
    if (!id) {
      return { status: 400, jsonBody: { erro: 'Informe um id válido na query string. Ex.: ?id=507f1f77bcf86cd799439011' } };
    }

    try {
      const colecao = await obterColecao();
      const resultado = await colecao.deleteOne({ _id: id });

      if (resultado.deletedCount === 0) {
        return { status: 404, jsonBody: { erro: 'Nenhum serviço da escala tem esse id.' } };
      }

      contexto.log(`Serviço excluído: ${id}`);
      return { status: 200, jsonBody: { mensagem: 'Serviço excluído da escala.', id: id.toString() } };
    } catch (erro) {
      contexto.error('Falha ao excluir o serviço', erro);
      return { status: 500, jsonBody: { erro: 'Não foi possível gravar no banco.', detalhe: erro.message } };
    }
  }
});

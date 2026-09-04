const { MongoClient, ObjectId } = require('mongodb');

const NOME_COLECAO = 'escala';
const NOME_BANCO_PADRAO = 'milscale';

// A conexao fica no escopo do modulo de proposito: cada instancia da Function
// reaproveita o mesmo cliente entre invocacoes. Abrir um MongoClient por
// chamada esgotaria o limite de conexoes do cluster gratuito.
let conexao;

function conectar() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI nao configurada. Preencha local.settings.json ou as App Settings da Function App.');
  }
  if (!conexao) {
    conexao = new MongoClient(uri).connect().catch(function (erro) {
      // Descarta a promise rejeitada. Sem isto, uma falha momentanea do banco
      // ficaria em cache e toda invocacao seguinte repetiria o mesmo erro ate
      // a Function App ser reiniciada.
      conexao = undefined;
      throw erro;
    });
  }
  return conexao;
}

async function obterColecao() {
  const cliente = await conectar();
  return cliente.db(process.env.MONGODB_DB || NOME_BANCO_PADRAO).collection(NOME_COLECAO);
}

// O _id do Mongo nao serializa como texto em JSON, entao o frontend recebe "id".
function paraJson(documento) {
  const { _id, ...resto } = documento;
  return { id: _id.toString(), ...resto };
}

function paraObjectId(id) {
  if (!id || !ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
}

module.exports = { obterColecao, paraJson, paraObjectId, NOME_COLECAO, NOME_BANCO_PADRAO };

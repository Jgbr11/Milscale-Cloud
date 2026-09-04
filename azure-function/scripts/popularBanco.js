// Carga inicial: leva para o MongoDB os 12 serviços que o MVP anterior
// devolvia fixos na GetEscala. Rode uma vez, com "node scripts/popularBanco.js".
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const escala = [
  { posto: '1º TEN', nome: 'ANDRADE',      circulo: 'oficial',  funcao: 'Oficial de Dia',              data: '2026-09-05', subunidade: '1ª Cia Fuz' },
  { posto: '2º TEN', nome: 'MOREIRA',      circulo: 'oficial',  funcao: 'Adjunto ao Oficial de Dia',   data: '2026-09-05', subunidade: '2ª Cia Fuz' },
  { posto: '2º SGT', nome: 'VASCONCELOS',  circulo: 'sargento', funcao: 'Sargento de Dia',             data: '2026-09-05', subunidade: 'Cia Cmdo Ap' },
  { posto: 'CB',     nome: 'TAVARES',      circulo: 'praca',    funcao: 'Cabo da Guarda',              data: '2026-09-05', subunidade: '1ª Cia Fuz' },
  { posto: 'SD',     nome: 'BITTENCOURT',  circulo: 'praca',    funcao: 'Sentinela',                   data: '2026-09-05', subunidade: '1ª Cia Fuz' },
  { posto: 'CAP',    nome: 'REZENDE',      circulo: 'oficial',  funcao: 'Oficial de Dia',              data: '2026-09-06', subunidade: 'Cia Cmdo Ap' },
  { posto: '3º SGT', nome: 'LUCENA',       circulo: 'sargento', funcao: 'Sargento de Dia',             data: '2026-09-06', subunidade: '2ª Cia Fuz' },
  { posto: '3º SGT', nome: 'MACIEL',       circulo: 'sargento', funcao: 'Encarregado do Rancho',       data: '2026-09-06', subunidade: 'Cia Cmdo Ap' },
  { posto: 'CB',     nome: 'FIGUEIREDO',   circulo: 'praca',    funcao: 'Cabo da Guarda',              data: '2026-09-06', subunidade: '2ª Cia Fuz' },
  { posto: 'SD',     nome: 'QUEIROZ',      circulo: 'praca',    funcao: 'Sentinela',                   data: '2026-09-06', subunidade: '2ª Cia Fuz' },
  { posto: '1º TEN', nome: 'CARVALHAL',    circulo: 'oficial',  funcao: 'Oficial de Dia',              data: '2026-09-07', subunidade: '2ª Cia Fuz' },
  { posto: '2º SGT', nome: 'PONTES',       circulo: 'sargento', funcao: 'Sargento de Dia',             data: '2026-09-07', subunidade: '1ª Cia Fuz' }
];

// Fora do runtime do Functions nao existem as App Settings, entao o script le
// as mesmas chaves direto do local.settings.json.
function lerConfiguracao() {
  const arquivo = path.join(__dirname, '..', 'local.settings.json');
  if (!fs.existsSync(arquivo)) {
    throw new Error('local.settings.json não encontrado. Copie o local.settings.json.exemplo.');
  }
  const valores = JSON.parse(fs.readFileSync(arquivo, 'utf8')).Values || {};
  if (!valores.MONGODB_URI) {
    throw new Error('Preencha MONGODB_URI em local.settings.json com a connection string do Atlas.');
  }
  return valores;
}

async function popular() {
  const valores = lerConfiguracao();
  const cliente = new MongoClient(valores.MONGODB_URI);

  try {
    await cliente.connect();
    const colecao = cliente.db(valores.MONGODB_DB || 'milscale').collection('escala');

    const existentes = await colecao.countDocuments();
    if (existentes > 0) {
      console.log(`A coleção já tem ${existentes} serviços. Nada foi inserido.`);
      console.log('Para recarregar do zero, apague os documentos no Atlas e rode de novo.');
      return;
    }

    const resultado = await colecao.insertMany(escala);
    console.log(`${resultado.insertedCount} serviços inseridos na coleção "escala".`);
  } finally {
    await cliente.close();
  }
}

popular().catch(function (erro) {
  console.error('Falha na carga inicial:', erro.message);
  process.exit(1);
});

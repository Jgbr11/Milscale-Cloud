const { app } = require('@azure/functions');

// Escala fixa em memoria: o MVP nao usa banco de dados.
const escala = [
  {
    posto: '1º TEN',
    nome: 'ANDRADE',
    circulo: 'oficial',
    funcao: 'Oficial de Dia',
    data: '2026-09-05',
    subunidade: '1ª Cia Fuz'
  },
  {
    posto: '2º TEN',
    nome: 'MOREIRA',
    circulo: 'oficial',
    funcao: 'Adjunto ao Oficial de Dia',
    data: '2026-09-05',
    subunidade: '2ª Cia Fuz'
  },
  {
    posto: '2º SGT',
    nome: 'VASCONCELOS',
    circulo: 'sargento',
    funcao: 'Sargento de Dia',
    data: '2026-09-05',
    subunidade: 'Cia Cmdo Ap'
  },
  {
    posto: 'CB',
    nome: 'TAVARES',
    circulo: 'praca',
    funcao: 'Cabo da Guarda',
    data: '2026-09-05',
    subunidade: '1ª Cia Fuz'
  },
  {
    posto: 'SD',
    nome: 'BITTENCOURT',
    circulo: 'praca',
    funcao: 'Sentinela',
    data: '2026-09-05',
    subunidade: '1ª Cia Fuz'
  },
  {
    posto: 'CAP',
    nome: 'REZENDE',
    circulo: 'oficial',
    funcao: 'Oficial de Dia',
    data: '2026-09-06',
    subunidade: 'Cia Cmdo Ap'
  },
  {
    posto: '3º SGT',
    nome: 'LUCENA',
    circulo: 'sargento',
    funcao: 'Sargento de Dia',
    data: '2026-09-06',
    subunidade: '2ª Cia Fuz'
  },
  {
    posto: '3º SGT',
    nome: 'MACIEL',
    circulo: 'sargento',
    funcao: 'Encarregado do Rancho',
    data: '2026-09-06',
    subunidade: 'Cia Cmdo Ap'
  },
  {
    posto: 'CB',
    nome: 'FIGUEIREDO',
    circulo: 'praca',
    funcao: 'Cabo da Guarda',
    data: '2026-09-06',
    subunidade: '2ª Cia Fuz'
  },
  {
    posto: 'SD',
    nome: 'QUEIROZ',
    circulo: 'praca',
    funcao: 'Sentinela',
    data: '2026-09-06',
    subunidade: '2ª Cia Fuz'
  },
  {
    posto: '1º TEN',
    nome: 'CARVALHAL',
    circulo: 'oficial',
    funcao: 'Oficial de Dia',
    data: '2026-09-07',
    subunidade: '2ª Cia Fuz'
  },
  {
    posto: '2º SGT',
    nome: 'PONTES',
    circulo: 'sargento',
    funcao: 'Sargento de Dia',
    data: '2026-09-07',
    subunidade: '1ª Cia Fuz'
  }
];

app.http('GetEscala', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async function () {
    return {
      status: 200,
      jsonBody: {
        unidade: '1º Batalhão de Infantaria',
        periodo: 'Setembro/2026',
        escala: escala
      }
    };
  }
});

const CIRCULOS = ['oficial', 'sargento', 'praca'];
const CAMPOS_TEXTO = ['posto', 'nome', 'funcao', 'subunidade'];

function validarServico(corpo) {
  if (!corpo || typeof corpo !== 'object') {
    return ['Envie um corpo JSON com os dados do serviço.'];
  }

  const erros = [];

  CAMPOS_TEXTO.forEach(function (campo) {
    const valor = corpo[campo];
    if (typeof valor !== 'string' || valor.trim() === '') {
      erros.push(`O campo "${campo}" é obrigatório.`);
    }
  });

  if (!CIRCULOS.includes(corpo.circulo)) {
    erros.push(`O campo "circulo" deve ser um destes: ${CIRCULOS.join(', ')}.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(corpo.data || '')) {
    erros.push('O campo "data" deve estar no formato AAAA-MM-DD.');
  }

  return erros;
}

// Monta o documento apenas com os campos conhecidos: qualquer extra enviado na
// requisicao e descartado, entao o formato gravado no banco e sempre o mesmo.
function montarServico(corpo) {
  return {
    posto: corpo.posto.trim(),
    nome: corpo.nome.trim(),
    circulo: corpo.circulo,
    funcao: corpo.funcao.trim(),
    data: corpo.data,
    subunidade: corpo.subunidade.trim()
  };
}

module.exports = { validarServico, montarServico, CIRCULOS };

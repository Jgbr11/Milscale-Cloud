// Cole aqui a URL do endpoint mock criado no Apidog.
const APIDOG_MOCK_URL = 'http://127.0.0.1:3658/m1/1370173-1374855-default/indicadores';

const conteudo = document.getElementById('conteudo');
const periodo = document.getElementById('periodo');

function montarCartao(titulo, numero, nota, alerta) {
  const cartao = document.createElement('div');
  cartao.className = alerta ? 'cartao cartao-alerta' : 'cartao';

  const rotulo = document.createElement('h2');
  rotulo.textContent = titulo;

  const valor = document.createElement('span');
  valor.className = 'numero';
  valor.textContent = numero;

  const detalhe = document.createElement('span');
  detalhe.className = 'nota';
  detalhe.textContent = nota;

  cartao.append(rotulo, valor, detalhe);
  return cartao;
}

function mostrarAviso(titulo, detalhe, trecho) {
  const aviso = document.createElement('div');
  aviso.className = 'aviso';
  const forte = document.createElement('strong');
  forte.textContent = titulo;
  aviso.appendChild(forte);
  aviso.append(detalhe);
  if (trecho) {
    const codigo = document.createElement('code');
    codigo.textContent = trecho;
    aviso.append(' ', codigo);
  }
  conteudo.replaceChildren(aviso);
}

function mostrarIndicadores(dados) {
  const cobertura = Math.round((dados.postosCobertos / dados.postosPrevistos) * 100);

  const painel = document.createElement('div');
  painel.className = 'cartoes';
  painel.append(
    montarCartao(
      'Militares escalados',
      dados.militaresEscalados,
      'Efetivo com pelo menos um serviço no mês.',
      false
    ),
    montarCartao(
      'Postos cobertos',
      `${cobertura}%`,
      `${dados.postosCobertos} de ${dados.postosPrevistos} postos previstos.`,
      false
    ),
    montarCartao(
      'Permutas pendentes',
      dados.permutasPendentes,
      'Trocas aguardando decisão do comando.',
      dados.permutasPendentes > 0
    )
  );

  conteudo.replaceChildren(painel);
  periodo.textContent = `Indicadores operacionais de ${dados.mes}.`;
}

async function carregarIndicadores() {
  if (APIDOG_MOCK_URL === 'COLOQUE_AQUI') {
    periodo.textContent = 'Endpoint de indicadores ainda não configurado.';
    mostrarAviso(
      'Falta apontar o mock do Apidog.',
      'Crie o endpoint no Apidog e cole a URL na constante APIDOG_MOCK_URL, no topo de',
      'frontend/js/dashboard.js'
    );
    return;
  }

  try {
    const resposta = await fetch(APIDOG_MOCK_URL);
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }
    mostrarIndicadores(await resposta.json());
  } catch (erro) {
    periodo.textContent = 'Não foi possível carregar os indicadores.';
    mostrarAviso(
      'O mock do Apidog não respondeu.',
      `Confirme se o endpoint está publicado e acessível pelo navegador. Detalhe: ${erro.message}`
    );
  }
}

carregarIndicadores();

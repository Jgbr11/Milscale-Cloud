const COLUNAS = ['Militar', 'Função de serviço', 'Data', 'Subunidade', 'Ações'];
const CAMPOS = ['posto', 'nome', 'circulo', 'funcao', 'data', 'subunidade'];

const formulario = document.getElementById('formulario');
const formularioBusca = document.getElementById('formularioBusca');
const tituloFormulario = document.getElementById('tituloFormulario');
const botaoSalvar = document.getElementById('botaoSalvar');
const botaoCancelar = document.getElementById('botaoCancelar');
const botaoLimpar = document.getElementById('botaoLimpar');
const campoTermo = document.getElementById('termo');
const feedback = document.getElementById('feedback');
const conteudo = document.getElementById('conteudo');

// Fica em null enquanto o formulário inclui; guarda o id enquanto edita.
let idEmEdicao = null;

// Envolve as quatro chamadas: devolve o JSON quando dá certo e levanta um erro
// com a mensagem que a Function mandou quando não dá.
async function chamarApi(caminho, opcoes) {
  const resposta = await fetch(`${URL_API}${caminho}`, opcoes);
  const corpo = await resposta.json().catch(function () {
    return {};
  });

  if (!resposta.ok) {
    const detalhes = Array.isArray(corpo.detalhes) ? ` ${corpo.detalhes.join(' ')}` : '';
    throw new Error(`${corpo.erro || `HTTP ${resposta.status}`}${detalhes}`);
  }
  return corpo;
}

function mostrarFeedback(tipo, texto) {
  const faixa = document.createElement('p');
  faixa.className = tipo === 'erro' ? 'feedback feedback-erro' : 'feedback feedback-ok';
  faixa.textContent = texto;
  feedback.replaceChildren(faixa);
}

function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function lerFormulario() {
  const servico = {};
  CAMPOS.forEach(function (campo) {
    servico[campo] = document.getElementById(campo).value.trim();
  });
  return servico;
}

function preencherFormulario(item) {
  CAMPOS.forEach(function (campo) {
    document.getElementById(campo).value = item[campo];
  });
}

function entrarEmEdicao(item) {
  idEmEdicao = item.id;
  preencherFormulario(item);
  tituloFormulario.textContent = `Alterar serviço de ${item.posto} ${item.nome}`;
  botaoSalvar.textContent = 'Salvar alterações';
  botaoCancelar.hidden = false;
  formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function voltarParaInclusao() {
  idEmEdicao = null;
  formulario.reset();
  tituloFormulario.textContent = 'Incluir serviço';
  botaoSalvar.textContent = 'Incluir na escala';
  botaoCancelar.hidden = true;
}

function montarBotao(rotulo, classe, aoClicar) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = classe;
  botao.textContent = rotulo;
  botao.addEventListener('click', aoClicar);
  return botao;
}

function montarLinha(item) {
  const linha = document.createElement('tr');
  linha.dataset.circulo = item.circulo;

  const militar = document.createElement('td');
  const posto = document.createElement('span');
  posto.className = 'posto';
  posto.textContent = item.posto;
  const nome = document.createElement('span');
  nome.className = 'nome';
  nome.textContent = item.nome;
  militar.append(posto, nome);

  const funcao = document.createElement('td');
  funcao.textContent = item.funcao;

  const data = document.createElement('td');
  data.className = 'data';
  data.textContent = formatarData(item.data);

  const subunidade = document.createElement('td');
  subunidade.className = 'subunidade';
  subunidade.textContent = item.subunidade;

  const acoes = document.createElement('td');
  acoes.className = 'acoes';
  acoes.append(
    montarBotao('Editar', 'botao-linha', function () {
      entrarEmEdicao(item);
    }),
    montarBotao('Excluir', 'botao-linha botao-linha-alerta', function () {
      excluir(item);
    })
  );

  linha.append(militar, funcao, data, subunidade, acoes);
  return linha;
}

function mostrarAviso(texto) {
  const aviso = document.createElement('div');
  aviso.className = 'aviso';
  aviso.textContent = texto;
  conteudo.replaceChildren(aviso);
}

function mostrarTabela(dados) {
  if (dados.escala.length === 0) {
    mostrarAviso(
      dados.termo
        ? `Nenhum serviço encontrado para "${dados.termo}".`
        : 'A escala está vazia. Inclua o primeiro serviço no formulário acima.'
    );
    return;
  }

  const tabela = document.createElement('table');
  tabela.className = 'quadro';

  const thead = document.createElement('thead');
  const cabecalho = document.createElement('tr');
  COLUNAS.forEach(function (titulo) {
    const th = document.createElement('th');
    th.textContent = titulo;
    cabecalho.appendChild(th);
  });
  thead.appendChild(cabecalho);
  tabela.appendChild(thead);

  const tbody = document.createElement('tbody');
  dados.escala.forEach(function (item) {
    tbody.appendChild(montarLinha(item));
  });
  tabela.appendChild(tbody);

  conteudo.replaceChildren(tabela);
}

// PESQUISAR — GET /api/PesquisarEscala
async function pesquisar(termo) {
  try {
    const dados = await chamarApi(`/PesquisarEscala?termo=${encodeURIComponent(termo)}`);
    mostrarTabela(dados);
    return dados;
  } catch (erro) {
    mostrarAviso(`Não foi possível consultar a escala. ${erro.message}`);
    return null;
  }
}

// INSERIR — POST /api/InserirEscala  ·  ALTERAR — PUT /api/AlterarEscala
async function salvar(evento) {
  evento.preventDefault();
  const servico = lerFormulario();
  botaoSalvar.disabled = true;

  const requisicao = idEmEdicao
    ? { caminho: `/AlterarEscala?id=${idEmEdicao}`, metodo: 'PUT' }
    : { caminho: '/InserirEscala', metodo: 'POST' };

  try {
    const resposta = await chamarApi(requisicao.caminho, {
      method: requisicao.metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(servico)
    });
    mostrarFeedback('ok', resposta.mensagem);
    voltarParaInclusao();
    await pesquisar(campoTermo.value.trim());
  } catch (erro) {
    mostrarFeedback('erro', erro.message);
  } finally {
    botaoSalvar.disabled = false;
  }
}

// EXCLUIR — DELETE /api/ExcluirEscala
async function excluir(item) {
  const confirmado = window.confirm(`Excluir o serviço de ${item.posto} ${item.nome} em ${formatarData(item.data)}?`);
  if (!confirmado) {
    return;
  }

  try {
    const resposta = await chamarApi(`/ExcluirEscala?id=${item.id}`, { method: 'DELETE' });
    mostrarFeedback('ok', resposta.mensagem);
    if (idEmEdicao === item.id) {
      voltarParaInclusao();
    }
    await pesquisar(campoTermo.value.trim());
  } catch (erro) {
    mostrarFeedback('erro', erro.message);
  }
}

formulario.addEventListener('submit', salvar);
botaoCancelar.addEventListener('click', voltarParaInclusao);

formularioBusca.addEventListener('submit', function (evento) {
  evento.preventDefault();
  pesquisar(campoTermo.value.trim());
});

botaoLimpar.addEventListener('click', function () {
  campoTermo.value = '';
  pesquisar('');
});

pesquisar('');

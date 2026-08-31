// Troque pela URL da Azure Function publicada depois do deploy.
const URL_FUNCTION_ESCALA = 'http://localhost:7071/api/GetEscala';

const COLUNAS = ['Militar', 'Função de serviço', 'Data', 'Subunidade'];

const conteudo = document.getElementById('conteudo');
const periodo = document.getElementById('periodo');

function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function montarCabecalho() {
  const thead = document.createElement('thead');
  const linha = document.createElement('tr');
  COLUNAS.forEach(function (titulo) {
    const th = document.createElement('th');
    th.textContent = titulo;
    linha.appendChild(th);
  });
  thead.appendChild(linha);
  return thead;
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

  linha.append(militar, funcao, data, subunidade);
  return linha;
}

function mostrarAviso(titulo, detalhe) {
  const aviso = document.createElement('div');
  aviso.className = 'aviso';
  const forte = document.createElement('strong');
  forte.textContent = titulo;
  aviso.appendChild(forte);
  aviso.append(detalhe);
  conteudo.replaceChildren(aviso);
}

function mostrarEscala(dados) {
  const tabela = document.createElement('table');
  tabela.className = 'quadro';
  tabela.appendChild(montarCabecalho());

  const tbody = document.createElement('tbody');
  dados.escala.forEach(function (item) {
    tbody.appendChild(montarLinha(item));
  });
  tabela.appendChild(tbody);

  conteudo.replaceChildren(tabela);
  periodo.textContent = `${dados.unidade} · ${dados.periodo} · ${dados.escala.length} serviços publicados.`;
}

async function carregarEscala() {
  try {
    const resposta = await fetch(URL_FUNCTION_ESCALA);
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }
    mostrarEscala(await resposta.json());
  } catch (erro) {
    periodo.textContent = 'Não foi possível carregar a escala.';
    mostrarAviso(
      'A Azure Function não respondeu.',
      `Suba a função com "func start" na pasta azure-function e confirme que ${URL_FUNCTION_ESCALA} está no ar. Detalhe: ${erro.message}`
    );
  }
}

carregarEscala();

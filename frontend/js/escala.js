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
  if (dados.escala.length === 0) {
    periodo.textContent = `${dados.unidade} · ${dados.periodo}`;
    mostrarAviso(
      'Nenhum serviço publicado.',
      'O banco está vazio. Cadastre serviços na tela Gerenciar, ou rode a carga inicial com "node scripts/popularBanco.js" na pasta azure-function.'
    );
    return;
  }

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
  const url = `${URL_API}/PesquisarEscala`;
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }
    mostrarEscala(await resposta.json());
  } catch (erro) {
    periodo.textContent = 'Não foi possível carregar a escala.';
    mostrarAviso(
      'A Azure Function não respondeu.',
      `Confirme que ${url} está no ar e que a MONGODB_URI está configurada. Detalhe: ${erro.message}`
    );
  }
}

carregarEscala();

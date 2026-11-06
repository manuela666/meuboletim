// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "9B",
  numeroChamada: 20,
  apiUrl: "https://boletim-api.profbt.com.br"
};

let pinSessao = "";
let dadosBoletim = null;

// DADOS FICTÍCIOS PADRONIZADOS DA TURMA (9º ANO)
const DADOS_LOCAIS_PADRAO = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

document.addEventListener("DOMContentLoaded", () => {
  const btnEntrar = document.getElementById("btn-entrar");
  const pinInput = document.getElementById("pin-input");
  const btnEditar = document.getElementById("btn-editar");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnCancelar = document.getElementById("btn-cancelar");

  btnEntrar.addEventListener("click", realizarLogin);
  pinInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") realizarLogin();
  });

  btnEditar.addEventListener("click", abrirModalEdicao);
  btnCancelar.addEventListener("click", fecharModalEdicao);
  btnSalvar.addEventListener("click", salvarAlteracoes);
});

// Função para normalizar qualquer valor de nota para a escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  let num = Number(valor);

  if (isNaN(num)) {
    return null;
  }

  if (num > 10 && num <= 100) {
    num = num / 10;
  }

  if (num >= 0 && num <= 10) {
    return num;
  }

  return null;
}

// Função para formatar como a nota vai aparecer na tela
function formatarNotaExibicao(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

async function realizarLogin() {
  const pinInput = document.getElementById("pin-input");
  const msg = document.getElementById("mensagem-login");
  const pinDigitado = pinInput.value.trim();

  if (!pinDigitado) {
    exibirMensagem(msg, "Por favor, digite o PIN.", true);
    return;
  }

  exibirMensagem(msg, "Conectando...", false);

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      exibirMensagem(msg, "Turma, chamada ou PIN inválidos.", true);
      return;
    }

    if (resposta.status === 429) {
      exibirMensagem(msg, "Muitas tentativas. Aguarde um minuto e tente novamente.", true);
      return;
    }

    if (!resposta.ok) {
      exibirMensagem(msg, "Não foi possível conectar ao servidor. Tente novamente.", true);
      return;
    }

    const resultado = await resposta.json();
    pinSessao = pinDigitado;
    pinInput.value = "";

    if (resultado.dados && resultado.dados.disciplinas && resultado.dados.disciplinas.length > 0) {
      dadosBoletim = resultado.dados.disciplinas;
    } else {
      dadosBoletim = JSON.parse(JSON.stringify(DADOS_LOCAIS_PADRAO));
    }

    document.getElementById("login-section").style.display = "none";
    document.getElementById("boletim-section").style.display = "block";
    carregarBoletim();

  } catch (erro) {
    exibirMensagem(msg, "Não foi possível conectar ao servidor. Tente novamente.", true);
  }
}

// Função principal que processa os dados e desenha a página
function carregarBoletim() {
  const tabela = document.getElementById("tabela-boletim");
  tabela.innerHTML = "";

  let somaMediasGerais = 0;
  let totalMateriasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosBoletim.forEach((materia) => {
    let n1 = normalizarNota(materia.tri1 !== undefined ? materia.tri1 : materia.n1);
    let n2 = normalizarNota(materia.tri2 !== undefined ? materia.tri2 : materia.n2);
    let n3 = normalizarNota(materia.tri3 !== undefined ? materia.tri3 : materia.n3);

    let f1 = materia.faltas ? (materia.faltas[0] || 0) : (parseInt(materia.f1) || 0);
    let f2 = materia.faltas ? (materia.faltas[1] || 0) : (parseInt(materia.f2) || 0);
    let f3 = materia.faltas ? (materia.faltas[2] || 0) : (parseInt(materia.f3) || 0);

    const notasDisponiveis = [n1, n2, n3].filter((n) => n !== null);
    let media = null;

    if (notasDisponiveis.length > 0) {
      const soma = notasDisponiveis.reduce((acc, curr) => acc + curr, 0);
      media = soma / notasDisponiveis.length;
      somaMediasGerais += media;
      totalMateriasComMedia++;
    }

    const totalFaltasMateria = f1 + f2 + f3;
    totalFaltasGeral += totalFaltasMateria;

    let situacaoTexto = "Nota ainda não disponível";
    let situacaoClasse = "situacao-indisponivel";

    if (media !== null) {
      if (media >= 6.0) {
        situacaoTexto = "Bom desempenho";
        situacaoClasse = "situacao-bom";
        qtdBomDesempenho++;
      } else {
        situacaoTexto = "Atenção";
        situacaoClasse = "situacao-atencao";
        qtdAtencao++;
      }
    }

    const tr = document.createElement("tr");

    const tdDisc = document.createElement("td");
    const strongDisc = document.createElement("strong");
    strongDisc.textContent = materia.disciplina;
    tdDisc.appendChild(strongDisc);
    tr.appendChild(tdDisc);

    const td1 = document.createElement("td");
    td1.textContent = formatarNotaExibicao(n1);
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.textContent = formatarNotaExibicao(n2);
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.textContent = formatarNotaExibicao(n3);
    tr.appendChild(td3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = formatarNotaExibicao(media);
    tdMedia.appendChild(strongMedia);
    tr.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltasMateria;
    tr.appendChild(tdFaltas);

    const tdSit = document.createElement("td");
    tdSit.textContent = situacaoTexto;
    if (situacaoClasse) tdSit.classList.add(situacaoClasse);
    tr.appendChild(tdSit);

    tabela.appendChild(tr);
  });

  const mediaGeralFinal = totalMateriasComMedia > 0 ? (somaMediasGerais / totalMateriasComMedia) : null;
  
  document.getElementById("card-media-geral").innerText = formatarNotaExibicao(mediaGeralFinal);
  document.getElementById("card-total-faltas").innerText = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").innerText = qtdBomDesempenho;
  document.getElementById("card-atencao").innerText = qtdAtencao;
}

function abrirModalEdicao() {
  const container = document.getElementById("form-edicao-container");
  container.innerHTML = "";
  document.getElementById("mensagem-edicao").
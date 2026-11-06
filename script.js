// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "9B",
  numeroChamada: 20,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// DADOS FICTÍCIOS PADRONIZADOS DA TURMA (9º ANO)
const dadosMaterias = [
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

// VARIÁVEIS DE ESTADO DA SESSÃO
let pinSessao = "";
let dadosAtuaisBoletim = [];

// Função para gerar estrelas finas de 4 pontas no fundo
function criarEstrelasFundo() {
  const container = document.createElement("div");
  container.id = "stars-container";
  document.body.appendChild(container);

  const quantidadeEstrelas = 90;

  for (let i = 0; i < quantidadeEstrelas; i++) {
    const star = document.createElement("div");
    star.classList.add("star-4-points");

    if (Math.random() > 0.5) {
      star.classList.add("cor-rosa");
    } else {
      star.classList.add("cor-branca");
    }

    const x = Math.random() * 100;
    const y = Math.random() * 100;

    const tamanho = Math.random() * 12 + 8;
    const duracao = Math.random() * 3 + 1.5;
    const atraso = Math.random() * 5;

    star.style.left = `${x}vw`;
    star.style.top = `${y}vh`;
    star.style.setProperty("--size", `${tamanho}px`);
    star.style.setProperty("--duration", `${duracao}s`);
    star.style.setProperty("--delay", `${atraso}s`);

    container.appendChild(star);
  }
}

// Normalização de notas de dados antigos
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

function formatarNotaExibicao(nota) {
  if (nota === null || nota === undefined) {
    return "—";
  }
  const num = Number(nota);
  if (isNaN(num)) return "—";
  return num.toFixed(1).replace(".", ",");
}

function carregarBoletim(listaDisciplinas) {
  const tabela = document.getElementById("tabela-boletim");
  tabela.innerHTML = "";

  let somaMediasGerais = 0;
  let totalMateriasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  listaDisciplinas.forEach((materia) => {
    const n1 = normalizarNota(materia.tri1);
    const n2 = normalizarNota(materia.tri2);
    const n3 = normalizarNota(materia.tri3);

    const notasDisponiveis = [n1, n2, n3].filter((n) => n !== null);
    let media = null;

    if (notasDisponiveis.length > 0) {
      const soma = notasDisponiveis.reduce((acc, curr) => acc + curr, 0);
      media = soma / notasDisponiveis.length;
      somaMediasGerais += media;
      totalMateriasComMedia++;
    }

    const arrFaltas = Array.isArray(materia.faltas) ? materia.faltas : [0, 0, 0];
    const totalFaltasMateria = arrFaltas.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
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

    const tdNome = document.createElement("td");
    const strongNome = document.createElement("strong");
    strongNome.textContent = materia.disciplina;
    tdNome.appendChild(strongNome);

    const tdN1 = document.createElement("td");
    tdN1.textContent = formatarNotaExibicao(n1);

    const tdN2 = document.createElement("td");
    tdN2.textContent = formatarNotaExibicao(n2);

    const tdN3 = document.createElement("td");
    tdN3.textContent = formatarNotaExibicao(n3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = formatarNotaExibicao(media);
    tdMedia.appendChild(strongMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltasMateria;

    const tdSituacao = document.createElement("td");
    tdSituacao.className = situacaoClasse;
    tdSituacao.textContent = situacaoTexto;

    tr.appendChild(tdNome);
    tr.appendChild(tdN1);
    tr.appendChild(tdN2);
    tr.appendChild(tdN3);
    tr.appendChild(tdMedia);
    tr.appendChild(tdFaltas);
    tr.appendChild(tdSituacao);

    tabela.appendChild(tr);
  });

  const mediaGeralFinal = totalMateriasComMedia > 0 ? (somaMediasGerais / totalMateriasComMedia) : null;
  
  document.getElementById("card-media-geral").textContent = formatarNotaExibicao(mediaGeralFinal);
  document.getElementById("card-total-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-atencao").textContent = qtdAtencao;
}

// LÓGICA DE CONEXÃO COM A API (ABRIR BOLETIM)
async function efetuarLogin() {
  const campoPin = document.getElementById("campo-pin");
  const msgLogin = document.getElementById("mensagem-login");
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    msgLogin.className = "mensagem-status erro";
    msgLogin.textContent = "Por favor, digite seu PIN.";
    return;
  }

  msgLogin.className = "mensagem-status";
  msgLogin.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.className = "mensagem-status erro";
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.className = "mensagem-status erro";
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      msgLogin.className = "mensagem-status erro";
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const resultado = await resposta.json();

    pinSessao = pinDigitado;
    campoPin.value = "";

    if (resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      dadosAtuaisBoletim = resultado.dados.disciplinas;
    } else {
      dadosAtuaisBoletim = JSON.parse(JSON.stringify(dadosMaterias));
    }

    document.getElementById("area-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";

    carregarBoletim(dadosAtuaisBoletim);

  } catch (erro) {
    msgLogin.className = "mensagem-status erro";
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// MONTAGEM DA TABELA DE EDIÇÃO
function abrirModalEdicao() {
  const tabelaEdicao = document.getElementById("tabela-edicao");
  tabelaEdicao.innerHTML = "";
  document.getElementById("mensagem-edicao").textContent = "";

  dadosAtuaisBoletim.forEach((materia, idx) => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    const strongNome = document.createElement("strong");
    strongNome.textContent = materia.disciplina;
    tdNome.appendChild(strongNome);

    const f = Array.isArray(materia.faltas) ? materia.faltas : [0, 0, 0];

    const valN1 = materia.tri1 !== null && materia.tri1 !== undefined ? materia.tri1 : "";
    const valN2 = materia.tri2 !== null && materia.tri2 !== undefined ? materia.tri2 : "";
    const valN3 = materia.tri3 !== null && materia.tri3 !== undefined ? materia.tri3 : "";

    tr.innerHTML = `
      <td><strong>${materia.disciplina}</strong></td>
      <td><input type="text" class="input-nota" data-idx="${idx}" data-campo="tri1" value="${valN1}"></td>
      <td><input type="text" class="input-falta" data-idx="${idx}" data-campo="f1" value="${f[0] !== undefined ? f[0] : 0}"></td>
      <td><input type="text" class="input-nota" data-idx="${idx}" data-campo="tri2" value="${valN2}"></td>
      <td><input type="text" class="input-falta" data-idx="${idx}" data-campo="f2" value="${f[1] !== undefined ? f[1] : 0}"></td>
      <td><input type="text" class="input-nota" data-idx="${idx}" data-campo="tri3" value="${valN3}"></td>
      <td><input type="text" class="input-falta" data-idx="${idx}" data-campo="f3" value="${f[2] !== undefined ? f[2] : 0}"></td>
    `;
    
    tabelaEdicao.appendChild(tr);
  });

  document.getElementById("modal-edicao").style.display = "flex";
}

function fecharModalEdicao() {
  document.getElementById("modal-edicao").style.display = "none";
}

// VALIDAÇÃO DAS NOTAS DIGITADAS NO EDITOR
function validarEProcessarNota(valStr) {
  if (valStr === null || valStr === undefined) return { valido: true, valor: null };
  const strLimpa = String(valStr).trim();
  if (strLimpa === "") return { valido: true, valor: null };

  const strNormalizada = strLimpa.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(strNormalizada)) {
    return { valido: false, valor: null };
  }

  const num = Number(strNormalizada);
  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: num };
}

// VALIDAÇÃO DAS FALTAS DIGITADAS NO EDITOR
function validarEProcessarFalta(valStr) {
  if (valStr === null || valStr === undefined) return { valido: false, valor: null };
  const strLimpa = String(valStr).trim();
  if (strLimpa === "") return { valido: false, valor: null };

  if (!/^\d+$/.test(strLimpa)) {
    return { valido: false, valor: null };
  }

  const num = Number(strLimpa);
  if (isNaN(num) || num < 0) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: num };
}

// SALVAR ALTERAÇÕES NA API
async function salvarAlteracoes() {
  const msgEdicao = document.getElementById("mensagem-edicao");
  msgEdicao.className = "mensagem-status";
  msgEdicao.textContent = "";

  const inputsNotas = document.querySelectorAll(".input-nota");
  const inputsFaltas = document.querySelectorAll(".input-falta");

  inputsNotas.forEach(i => i.classList.remove("invalido"));
  inputsFaltas.forEach(i => i.classList.remove("invalido"));

  let temErro = false;
  const copiaNovosDados = JSON.parse(JSON.stringify(dadosAtuaisBoletim));

  inputsNotas.forEach(input => {
    const idx = Number(input.getAttribute("data-idx"));
    const campo = input.getAttribute("data-campo");
    const checagem = validarEProcessarNota(input.value);

    if (!checagem.valido) {
      input.classList.add("invalido");
      temErro = true;
    } else {
      copiaNovosDados[idx][campo] = checagem.valor;
    }
  });

  inputsFaltas.forEach(input => {
    const idx = Number(input.getAttribute("data-idx"));
    const campo = input.getAttribute("data-campo");
    const checagem = validarEProcessarFalta(input.value);

    if (!checagem.valido) {
      input.classList.add("invalido");
      temErro = true;
    } else {
      if (!Array.isArray(copiaNovosDados[idx].faltas)) {
        copiaNovosDados[idx].faltas = [0, 0, 0];
      }
      if (campo === "f1") copiaNovosDados[idx].faltas[0] = checagem.valor;
      if (campo === "f2") copiaNovosDados[idx].faltas[1] = checagem.valor;
      if (campo === "f3") copiaNovosDados[idx].faltas[2] = checagem.valor;
    }
  });

  if (temErro) {
    msgEdicao.className = "mensagem-status erro";
    msgEdicao.textContent = "Por favor, corrija os campos destacados antes de salvar.";
    return;
  }

  msgEdicao.className = "mensagem-status";
  msgEdicao.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: copiaNovosDados
        }
      })
    });

    if (!resposta.ok) {
      msgEdicao.className = "mensagem-status erro";
      msgEdicao.textContent = "Falha ao salvar as alterações. Tente novamente.";
      return;
    }

    dadosAtuaisBoletim = copiaNovosDados;
    carregarBoletim(dadosAtuaisBoletim);

    msgEdicao.className = "mensagem-status sucesso";
    msgEdicao.textContent = "Dados salvos com sucesso.";

    setTimeout(() => {
      fecharModalEdicao();
    }, 1200);

  } catch (erro) {
    msgEdicao.className = "mensagem-status erro";
    msgEdicao.textContent = "Erro de rede ao tentar salvar. Mantenha os campos e tente novamente.";
  }
}

// INICIALIZAÇÃO E EVENTOS
document.getElementById("btn-entrar").addEventListener("click", efetuarLogin);

document.getElementById("campo-pin").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    efetuarLogin();
  }
});

document.getElementById("btn-alterar-dados").addEventListener("click", abrirModalEdicao);
document.getElementById("btn-cancelar-edicao").addEventListener("click", fecharModalEdicao);
document.getElementById("btn-salvar-dados").addEventListener("click", salvarAlteracoes);

criarEstrelasFundo();
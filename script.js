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

// Função para gerar BEM MAIS brilhos no fundo em rosa claro e branco
function criarEstrelasFundo() {
  const container = document.createElement("div");
  container.id = "stars-container";
  document.body.appendChild(container);

  const quantidadeEstrelas = 80; // Muito mais pontinhos piscando!

  for (let i = 0; i < quantidadeEstrelas; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    // Define aleatoriamente a cor: rosa claro ou branca
    if (Math.random() > 0.5) {
      star.classList.add("cor-rosa");
    } else {
      star.classList.add("cor-branca");
    }

    // Define aleatoriamente o formato (ponto simples ou cruzinha brilho)
    if (Math.random() > 0.65) {
      star.classList.add("sparkle");
    }

    // Posições aleatórias na tela
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    // Tamanhos variados (entre 2px e 9px)
    const tamanho = Math.random() * 7 + 2;

    // Tempos de animação para efeito constante
    const duracao = Math.random() * 3 + 1.5;
    const atraso = Math.random() * 5;

    star.style.left = `${x}vw`;
    star.style.top = `${y}vh`;
    star.style.width = `${tamanho}px`;
    star.style.height = `${tamanho}px`;
    star.style.setProperty("--duration", `${duracao}s`);
    star.style.setProperty("--delay", `${atraso}s`);

    container.appendChild(star);
  }
}

// Normalização de notas
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
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

function carregarBoletim() {
  const tabela = document.getElementById("tabela-boletim");
  tabela.innerHTML = "";

  let somaMediasGerais = 0;
  let totalMateriasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosMaterias.forEach((materia) => {
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

    const totalFaltasMateria = materia.faltas.reduce((acc, curr) => acc + curr, 0);
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
    tr.innerHTML = `
      <td><strong>${materia.disciplina}</strong></td>
      <td>${formatarNotaExibicao(n1)}</td>
      <td>${formatarNotaExibicao(n2)}</td>
      <td>${formatarNotaExibicao(n3)}</td>
      <td><strong>${formatarNotaExibicao(media)}</strong></td>
      <td>${totalFaltasMateria}</td>
      <td class="${situacaoClasse}">${situacaoTexto}</td>
    `;

    tabela.appendChild(tr);
  });

  const mediaGeralFinal = totalMateriasComMedia > 0 ? (somaMediasGerais / totalMateriasComMedia) : null;
  
  document.getElementById("card-media-geral").innerText = formatarNotaExibicao(mediaGeralFinal);
  document.getElementById("card-total-faltas").innerText = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").innerText = qtdBomDesempenho;
  document.getElementById("card-atencao").innerText = qtdAtencao;
}

// Inicializa tudo
criarEstrelasFundo();
carregarBoletim();
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

// NOTA: A frequência geral de 92% é apenas um dado fictício/demonstrativo nesta etapa.
// Ela será calculada de forma dinâmica em versões futuras do projeto.

// Função para normalizar qualquer valor de nota para a escala de 0 a 10
function normalizarNota(valor) {
  // Trata notas não lançadas ou vazias
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Converte texto com vírgula para número com ponto
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  let num = Number(valor);

  // Se o valor não for um número válido, descarta
  if (isNaN(num)) {
    return null;
  }

  // Ajusta valores acima de 10 (ex: 82 vira 8.2)
  if (num > 10 && num <= 100) {
    num = num / 10;
  }

  // Garante que o número está dentro da faixa de 0 a 10
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

// Função principal que processa os dados e desenha a página
function carregarBoletim() {
  const tabela = document.getElementById("tabela-boletim");
  tabela.innerHTML = "";

  let somaMediasGerais = 0;
  let totalMateriasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  // Passa por cada matéria do nosso array
  dadosMaterias.forEach((materia) => {
    // Normaliza as notas dos 3 trimestres
    const n1 = normalizarNota(materia.tri1);
    const n2 = normalizarNota(materia.tri2);
    const n3 = normalizarNota(materia.tri3);

    // Calcula a média ignorando notas ausentes (sem transformar ausente em 0)
    const notasDisponiveis = [n1, n2, n3].filter((n) => n !== null);
    let media = null;

    if (notasDisponiveis.length > 0) {
      const soma = notasDisponiveis.reduce((acc, curr) => acc + curr, 0);
      media = soma / notasDisponiveis.length;
      somaMediasGerais += media;
      totalMateriasComMedia++;
    }

    // Soma as faltas dos trimestres
    const totalFaltasMateria = materia.faltas.reduce((acc, curr) => acc + curr, 0);
    totalFaltasGeral += totalFaltasMateria;

    // Define a situação da matéria
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

    // Cria a linha da tabela dinamicamente usando o DOM
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

  // Atualiza os cards de resumo na área superior
  const mediaGeralFinal = totalMateriasComMedia > 0 ? (somaMediasGerais / totalMateriasComMedia) : null;
  
  document.getElementById("card-media-geral").innerText = formatarNotaExibicao(mediaGeralFinal);
  document.getElementById("card-total-faltas").innerText = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").innerText = qtdBomDesempenho;
  document.getElementById("card-atencao").innerText = qtdAtencao;
}

// Executa o carregamento assim que a página abre
carregarBoletim();
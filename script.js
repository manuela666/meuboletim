const CONFIG_ALUNO = {
    turma: "9B",
    numeroChamada: 20,
    apiUrl: "https://boletim-api.profbt.com.br"
};

let pinSessao = "";
let dadosBoletim = null;

// Dados fictícios iniciais (usados se a API não retornar dados existentes)
const DADOS_LOCAIS_PADRAO = [
    { disciplina: "Língua Portuguesa", n1: 8.5, f1: 2, n2: 7.0, f2: 0, n3: 9.0, f3: 1 },
    { disciplina: "Matemática", n1: 6.5, f1: 4, n2: 7.5, f2: 2, n3: 8.0, f3: 0 },
    { disciplina: "História", n1: 9.0, f1: 0, n2: 8.5, f2: 1, n3: 9.5, f3: 0 },
    { disciplina: "Geografia", n1: 7.5, f1: 1, n2: 8.0, f2: 2, n3: 8.5, f3: 1 },
    { disciplina: "Ciências", n1: 8.0, f1: 0, n2: 7.5, f2: 0, n3: 9.0, f3: 2 },
    { disciplina: "Inglês", n1: 9.5, f1: 0, n2: 9.0, f2: 1, n3: 10.0, f3: 0 },
    { disciplina: "Educação Física", n1: 10.0, f1: 0, n2: 10.0, f2: 0, n3: 10.0, f3: 0 },
    { disciplina: "Arte", n1: 8.5, f1: 1, n2: 9.0, f2: 0, n3: 9.5, f3: 0 }
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

// Normalização para dados legados/antigos
function normalizarNota(valor) {
    if (valor === null || valor === undefined || valor === "") return null;
    if (typeof valor === "string") {
        valor = valor.replace(",", ".");
    }
    const num = parseFloat(valor);
    if (isNaN(num)) return null;
    if (num > 10 && num <= 100) {
        return num / 10;
    }
    return num;
}

function calcularMedia(n1, n2, n3) {
    const notas = [n1, n2, n3].filter(n => n !== null && n !== undefined && !isNaN(n));
    if (notas.length === 0) return "-";
    const soma = notas.reduce((acc, curr) => acc + curr, 0);
    return (soma / notas.length).toFixed(1);
}

function calcularTotalFaltas(f1, f2, f3) {
    const f1Val = parseInt(f1) || 0;
    const f2Val = parseInt(f2) || 0;
    const f3Val = parseInt(f3) || 0;
    return f1Val + f2Val + f3Val;
}

function obterSituacao(media) {
    if (media === "-") return { texto: "-", classe: "" };
    const num = parseFloat(media);
    if (num >= 7.0) return { texto: "Aprovado", classe: "situacao-aprovado" };
    if (num >= 5.0) return { texto: "Recuperação", classe: "situacao-recuperacao" };
    return { texto: "Reprovado", classe: "situacao-reprovado" };
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
        renderizarBoletim();

    } catch (erro) {
        exibirMensagem(msg, "Não foi possível conectar ao servidor. Tente novamente.", true);
    }
}

function renderizarBoletim() {
    const corpoTabela = document.getElementById("corpo-tabela");
    const cardsContainer = document.getElementById("cards-container");

    corpoTabela.innerHTML = "";
    cardsContainer.innerHTML = "";

    let somaMedias = 0;
    let disciplinasComMedia = 0;
    let totalFaltasGeral = 0;

    dadosBoletim.forEach(item => {
        const n1 = normalizarNota(item.n1);
        const n2 = normalizarNota(item.n2);
        const n3 = normalizarNota(item.n3);

        const media = calcularMedia(n1, n2, n3);
        const totalFaltas = calcularTotalFaltas(item.f1, item.f2, item.f3);
        const situacao = obterSituacao(media);

        if (media !== "-") {
            somaMedias += parseFloat(media);
            disciplinasComMedia++;
        }
        totalFaltasGeral += totalFaltas;

        const tr = document.createElement("tr");

        const tdDisc = document.createElement("td");
        tdDisc.textContent = item.disciplina;
        tr.appendChild(tdDisc);

        const campos = [
            n1 !== null ? n1.toFixed(1) : "-",
            item.f1 ?? "-",
            n2 !== null ? n2.toFixed(1) : "-",
            item.f2 ?? "-",
            n3 !== null ? n3.toFixed(1) : "-",
            item.f3 ?? "-",
            media,
            totalFaltas
        ];

        campos.forEach(val => {
            const td = document.createElement("td");
            td.textContent = val;
            tr.appendChild(td);
        });

        const tdSit = document.createElement("td");
        tdSit.textContent = situacao.texto;
        if (situacao.classe) tdSit.classList.add(situacao.classe);
        tr.appendChild(tdSit);

        corpoTabela.appendChild(tr);
    });

    const mediaGeral = disciplinasComMedia > 0 ? (somaMedias / disciplinasComMedia).toFixed(1) : "-";

    criarCard(cardsContainer, "Média Geral", mediaGeral);
    criarCard(cardsContainer, "Total de Faltas", totalFaltasGeral);
    criarCard(cardsContainer, "Disciplinas", dadosBoletim.length);
}

function criarCard(container, titulo, valor) {
    const card = document.createElement("div");
    card.className = "card";
    const h3 = document.createElement("h3");
    h3.textContent = titulo;
    const p = document.createElement("p");
    p.textContent = valor;
    card.appendChild(h3);
    card.appendChild(p);
    container.appendChild(card);
}

function abrirModalEdicao() {
    const container = document.getElementById("form-edicao-container");
    container.innerHTML = "";
    document.getElementById("mensagem-edicao").textContent = "";

    dadosBoletim.forEach((item, index) => {
        const n1 = normalizarNota(item.n1);
        const n2 = normalizarNota(item.n2);
        const n3 = normalizarNota(item.n3);

        const div = document.createElement("div");
        div.className = "item-edicao";

        const h4 = document.createElement("h4");
        h4.textContent = item.disciplina;
        div.appendChild(h4);

        const grid = document.createElement("div");
        grid.className = "grid-inputs";

        grid.appendChild(criarCampoInput("N1", `n1_${index}`, n1 !== null ? n1 : ""));
        grid.appendChild(criarCampoInput("F1", `f1_${index}`, item.f1 ?? ""));
        grid.appendChild(criarCampoInput("N2", `n2_${index}`, n2 !== null ? n2 : ""));
        grid.appendChild(criarCampoInput("F2", `f2_${index}`, item.f2 ?? ""));
        grid.appendChild(criarCampoInput("N3", `n3_${index}`, n3 !== null ? n3 : ""));
        grid.appendChild(criarCampoInput("F3", `f3_${index}`, item.f3 ?? ""));

        div.appendChild(grid);
        container.appendChild(div);
    });

    document.getElementById("modal-edicao").style.display = "flex";
}

function criarCampoInput(rotulo, id, valor) {
    const div = document.createElement("div");
    const label = document.createElement("label");
    label.textContent = rotulo;
    const input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.value = valor;
    div.appendChild(label);
    div.appendChild(input);
    return div;
}

function fecharModalEdicao() {
    document.getElementById("modal-edicao").style.display = "none";
}

function validarNota(valorTexto) {
    const str = valorTexto.trim();
    if (str === "") return { valido: true, valor: null };

    const ajustado = str.replace(",", ".");
    const num = Number(ajustado);

    if (isNaN(num) || num < 0 || num > 10) {
        return { valido: false };
    }
    return { valido: true, valor: num };
}

function validarFalta(valorTexto) {
    const str = valorTexto.trim();
    if (str === "") return { valido: false };

    const num = Number(str);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return { valido: false };
    }
    return { valido: true, valor: num };
}

async function salvarAlteracoes() {
    const msg = document.getElementById("mensagem-edicao");
    msg.textContent = "";

    const novasDisciplinas = [];
    let houverErro = false;

    for (let i = 0; i < dadosBoletim.length; i++) {
        const item = dadosBoletim[i];
        
        const resN1 = validarNota(document.getElementById(`n1_${i}`).value);
        const resF1 = validarFalta(document.getElementById(`f1_${i}`).value);
        const resN2 = validarNota(document.getElementById(`n2_${i}`).value);
        const resF2 = validarFalta(document.getElementById(`f2_${i}`).value);
        const resN3 = validarNota(document.getElementById(`n3_${i}`).value);
        const resF3 = validarFalta(document.getElementById(`f3_${i}`).value);

        if (!resN1.valido || !resN2.valido || !resN3.valido || !resF1.valido || !resF2.valido || !resF3.valido) {
            houverErro = true;
            break;
        }
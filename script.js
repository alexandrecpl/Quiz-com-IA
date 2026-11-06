//
// Arquivo: script.js
// Descrição: lógica do quiz em JavaScript para salvar respostas no localStorage,
// navegar entre páginas, validar respostas e mostrar o resultado final.
//

const STORAGE_KEY = 'quiz3d_respostas';
const TOTAL_PAGES = 5;

// Respostas corretas para o cálculo da pontuação final.
const CORRETAS = {
  1: 'B',
  2: 'B',
  3: 'A',
  4: 'B',
  5: 'C',
  6: 'A',
  7: 'B',
  8: 'D',
  9: 'A',
  10: 'C'
};

// Mapeia cada página para as perguntas contidas nela.
const PAGINA_POR_QUESTAO = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
  5: [9, 10]
};

// Função simples para carregar respostas do navegador.
function carregarRespostas() {
  const bruto = localStorage.getItem(STORAGE_KEY);
  if (!bruto) return {};

  try {
    return JSON.parse(bruto);
  } catch (erro) {
    console.warn('Erro ao ler respostas:', erro);
    return {};
  }
}

// Função para salvar uma resposta específica.
function salvarResposta(numeroPergunta, valor) {
  const respostas = carregarRespostas();
  respostas[numeroPergunta] = valor;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(respostas));
}

// Verifica se todas as perguntas da página atual foram respondidas.
function validarPagina(page) {
  const perguntas = PAGINA_POR_QUESTAO[page] || [];
  const respostas = carregarRespostas();

  return perguntas.every((numero) => Boolean(respostas[numero]));
}

// Calcula o total de acertos com base nas respostas marcadas.
function calcularPontuacao() {
  const respostas = carregarRespostas();
  let acertos = 0;

  for (let numero = 1; numero <= 10; numero += 1) {
    if (respostas[numero] === CORRETAS[numero]) {
      acertos += 1;
    }
  }

  return acertos;
}

// Emite mensagem de alerta padronizada para campos vazios.
function mostrarAviso(mensagem) {
  alert(mensagem);
}

// Restaura as opções selecionadas ao recarregar a página.
function restaurarSelecoes() {
  const respostas = carregarRespostas();
  const radios = document.querySelectorAll('input[type="radio"]');

  radios.forEach((radio) => {
    const pergunta = Number(radio.name.replace('q', ''));
    if (respostas[pergunta] === radio.value) {
      radio.checked = true;
    }
  });
}

// Carrega o estado visual das páginas e eventos.
function iniciarQuiz() {
  restaurarSelecoes();

  const formulario = document.querySelector('#quiz-form');
  if (!formulario) return;

  const pageAtual = Number(formulario.dataset.page);
  const botaoProximo = document.querySelector('#next-btn');
  const botaoVoltar = document.querySelector('#prev-btn');

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const pergunta = Number(radio.name.replace('q', ''));
      salvarResposta(pergunta, radio.value);
    });
  });

  if (botaoVoltar) {
    botaoVoltar.addEventListener('click', () => {
      if (pageAtual > 1) {
        const paginaAnterior = pageAtual - 1;
        window.location.href = `pagina-${paginaAnterior}.html`;
      }
    });
  }

  if (botaoProximo) {
    botaoProximo.addEventListener('click', () => {
      if (pageAtual < TOTAL_PAGES) {
        const respostaCompleta = validarPagina(pageAtual);

        if (!respostaCompleta) {
          mostrarAviso('Responda todas as perguntas da página antes de avançar.');
          return;
        }

        const proximaPagina = pageAtual + 1;
        window.location.href = `pagina-${proximaPagina}.html`;
        return;
      }

      // Lógica da última página: validar perguntas e mostrar resultado.
      const respostaCompleta = validarPagina(pageAtual);

      if (!respostaCompleta) {
        mostrarAviso('Falta responder uma ou mais perguntas da última página.');
        return;
      }

      const acertos = calcularPontuacao();
      const percentual = Math.round((acertos / 10) * 100);
      const boxResultado = document.querySelector('#result-box');
      const textoResultado = document.querySelector('#result-text');
      const status = document.querySelector('#status');

      if (!boxResultado || !textoResultado || !status) return;

      boxResultado.classList.add('visible');

      if (percentual >= 70) {
        status.textContent = 'Excelente!';
        status.className = 'status-success';
      } else if (percentual >= 40) {
        status.textContent = 'Bom trabalho!';
        status.className = 'status-success';
      } else {
        status.textContent = 'Continue praticando!';
        status.className = 'status-danger';
      }

      textoResultado.innerHTML = `
        Você acertou <strong>${acertos}</strong> de <strong>10</strong> perguntas.<br>
        Percentual final: <strong>${percentual}%</strong>.
      `;
    });
  }

  const botaoReiniciar = document.querySelector('#restart-btn');
  if (botaoReiniciar) {
    botaoReiniciar.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = 'pagina-1.html';
    });
  }
}

// Inicializa assim que o documento estiver pronto.
document.addEventListener('DOMContentLoaded', iniciarQuiz);

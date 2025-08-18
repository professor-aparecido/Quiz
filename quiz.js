// Selecionar elementos HTML
const questionHeaderInfo = document.getElementById("question-header-info");
const questionTextElement = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedbackText = document.getElementById("feedback-text");
const answerButton = document.getElementById("answer-btn");
const scoreText = document.getElementById("score-text");
const topicsListContainer = document.getElementById("quiz-topics-list");
const topicsButtonsContainer = document.getElementById("topics-buttons-container");
const quizContainer = document.getElementById("quiz-container");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;
let userAnswers = []; // Novo array para armazenar as respostas do usuário

// Lista de todos os temas disponíveis
const temasDisponiveis = ['numeros', 'algebra', 'geometria', 'grandezas', 'probabilidade'];

// --- FUNÇÕES DE SOM ---

// Função de som de ACERTO (a que você enviou)
function somAcerto(){
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const t=audioCtx.currentTime;
  const g=audioCtx.createGain();
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(0.18,t+0.02);
  g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
  const o1=audioCtx.createOscillator();
  const o2=audioCtx.createOscillator();
  o1.type="sine"; o2.type="sine";
  o1.frequency.setValueAtTime(660,t);
  o2.frequency.setValueAtTime(880,t+0.02);
  o1.connect(g); o2.connect(g); g.connect(audioCtx.destination);
  o1.start(t); o2.start(t+0.36);
  o1.stop(t+0.36); o2.stop(t+0.36);
}

// Função para som de ERRO
function somErro() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, t);
    gainNode.gain.exponentialRampToValueAtTime(0.1, t + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
}

// --- FIM DAS FUNÇÕES DE SOM ---

// Função para obter os parâmetros 'tema' e 'topico' da URL
function getQuizParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const tema = urlParams.get('tema');
    const topico = urlParams.get('topico');
    return { tema, topico };
}

// Função para exibir a lista de tópicos
async function displayTopicsList() {
    const { tema } = getQuizParams();
    topicsListContainer.style.display = "block";
    quizContainer.style.display = "none";
    if (!tema) {
        topicsButtonsContainer.innerHTML = `<p>Selecione uma unidade no topo da página para ver os tópicos.</p>`;
        return;
    }
    const filePath = `quizzes/${tema}/${tema}-temas.json`;
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Erro ao carregar a lista de tópicos. Verifique se o arquivo ${filePath} existe.`);
        }
        const topics = await response.json();
        topicsButtonsContainer.innerHTML = "";
        
        // Adiciona o botão de Quiz Completo da Unidade
        const quizCompletoBtn = document.createElement("a");
        quizCompletoBtn.href = `quizzes.html?tema=${tema}&topico=todos`;
        quizCompletoBtn.className = "btn";
        quizCompletoBtn.textContent = "Quiz Completo da Unidade";
        topicsButtonsContainer.appendChild(quizCompletoBtn);

        // Adiciona os botões dos tópicos específicos
        topics.forEach(topic => {
            const button = document.createElement("a");
            button.href = `quizzes.html?tema=${tema}&topico=${topic.id}`;
            button.className = "btn";
            button.textContent = topic.nome;
            topicsButtonsContainer.appendChild(button);
        });
    } catch (error) {
        console.error("Falha ao carregar a lista de tópicos:", error);
        topicsButtonsContainer.innerHTML = `<p>Não foi possível carregar os tópicos. Verifique o console para mais detalhes.</p>`;
    }
}

// Lógica para carregar todos os quizzes de uma unidade ou de todo o site
async function loadQuizzes() {
    const { tema, topico } = getQuizParams();
    let allQuestions = [];
    topicsListContainer.style.display = "none";
    quizContainer.style.display = "block";

    const fetchAndConcat = async (temaAtual, topicoAtual) => {
        const filePath = `quizzes/${temaAtual}/${topicoAtual}.json`;
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                const quizData = await response.json();
                allQuestions = allQuestions.concat(quizData);
            }
        } catch (error) {
            console.error(`Erro ao carregar o quiz de ${temaAtual}/${topicoAtual}:`, error);
        }
    };

    if (tema === 'geral') {
        for (const temaGeral of temasDisponiveis) {
            const temasFilePath = `quizzes/${temaGeral}/${temaGeral}-temas.json`;
            try {
                const temasResponse = await fetch(temasFilePath);
                if (temasResponse.ok) {
                    const temas = await temasResponse.json();
                    for (const t of temas) {
                        await fetchAndConcat(temaGeral, t.id);
                    }
                }
            } catch (error) {
                console.error(`Erro ao carregar a lista de tópicos do tema ${temaGeral}:`, error);
            }
        }
    } else if (topico === 'todos') {
        const temasFilePath = `quizzes/${tema}/${tema}-temas.json`;
        try {
            const temasResponse = await fetch(temasFilePath);
            if (temasResponse.ok) {
                const temas = await temasResponse.json();
                for (const t of temas) {
                    await fetchAndConcat(tema, t.id);
                }
            }
        } catch (error) {
            console.error(`Erro ao carregar a lista de tópicos do tema ${tema}:`, error);
        }
    } else {
        await fetchAndConcat(tema, topico);
    }
    
    questions = allQuestions;
    if (questions.length > 0) {
        // Embaralha as perguntas para quizzes completos ou gerais
        if (questions.length > 1) {
            questions = questions.sort(() => Math.random() - 0.5);
        }
        displayQuestion();
    } else {
        questionTextElement.textContent = "Nenhuma questão encontrada para este(s) tópico(s).";
    }
}

function displayQuestion() {
    isAnswered = false;
    optionsContainer.innerHTML = "";
    feedbackText.textContent = "";
    answerButton.style.display = "block";
    scoreText.classList.add("hidden");
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }
    const currentQuestion = questions[currentQuestionIndex];
    const { tema } = getQuizParams();
    let formattedTema;
    switch(tema) {
        case 'numeros':
            formattedTema = 'Números';
            break;
        case 'algebra':
            formattedTema = 'Álgebra';
            break;
        case 'geometria':
            formattedTema = 'Geometria';
            break;
        case 'grandezas':
            formattedTema = 'Grandezas e Medidas';
            break;
        case 'probabilidade':
            formattedTema = 'Probabilidade e Estatística';
            break;
        case 'geral':
            formattedTema = 'Geral';
            break;
        default:
            formattedTema = tema.charAt(0).toUpperCase() + tema.slice(1);
    }
    questionHeaderInfo.innerHTML = `
        <p><strong>Questão:</strong> ${currentQuestion.cabecalho.numero}</p>
        <p><strong>Unidade:</strong> ${formattedTema}</p>
        <p><strong>Habilidade BNCC:</strong> ${currentQuestion.cabecalho.habilidade_bncc}</p>
        <p><strong>Série:</strong> ${currentQuestion.cabecalho.serie}</p>
        <p><strong>Assunto:</strong> ${currentQuestion.cabecalho.assunto}</p>
        <p><strong>Instituição:</strong> ${currentQuestion.cabecalho.instituicao}</p>
    `;
    
    // Usando innerHTML para permitir que o MathJax renderize equações
    questionTextElement.innerHTML = currentQuestion.pergunta;
    
    currentQuestion.opcoes.forEach(option => {
        const button = document.createElement("button");
        button.textContent = `${option.letra}) ${option.texto}`;
        button.classList.add("option-btn");
        button.addEventListener("click", () => selectOption(button));
        optionsContainer.appendChild(button);
    });

    // AQUI: CHAMA A FUNÇÃO PARA RENDERIZAR O MATHJAX NOVAMENTE
    // O setTimeout de 0ms garante que o DOM seja atualizado antes de tentar renderizar.
    setTimeout(() => {
        MathJax.typesetPromise();
    }, 0);
}

function selectOption(selectedButton) {
    if (isAnswered) return;
    Array.from(optionsContainer.children).forEach(btn => {
        btn.classList.remove("selected");
    });
    selectedButton.classList.add("selected");
}

function checkAnswer() {
    if (isAnswered) return;
    const selectedButton = document.querySelector(".option-btn.selected");
    if (!selectedButton) {
        feedbackText.textContent = "Por favor, selecione uma opção.";
        return;
    }
    isAnswered = true;
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOptionLetter = selectedButton.textContent.split(')')[0];
    
    const isCorrect = selectedOptionLetter === currentQuestion.resposta_correta;
    
    // Adiciona a resposta do usuário à lista de respostas
    userAnswers.push({
      pergunta: currentQuestion.pergunta,
      suaResposta: selectedOptionLetter,
      respostaCorreta: currentQuestion.resposta_correta,
      acertou: isCorrect
    });
    
    if (isCorrect) {
        score++;
        feedbackText.textContent = "Correto! 🎉";
        selectedButton.classList.add("correct");
        somAcerto();
    } else {
        feedbackText.textContent = "Incorreto. 😔";
        selectedButton.classList.add("incorrect");
        somErro();
    }
    answerButton.style.display = "none";
    const nextButton = document.createElement("button");
    nextButton.textContent = "Próxima Pergunta";
    nextButton.id = "next-btn";
    nextButton.classList.add("btn");
    nextButton.addEventListener("click", nextQuestion);
    answerButton.parentNode.insertBefore(nextButton, answerButton.nextSibling);
    Array.from(optionsContainer.children).forEach(btn => {
        btn.disabled = true;
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    const nextButton = document.getElementById("next-btn");
    if (nextButton) {
        nextButton.remove();
    }
    displayQuestion();
}

function endQuiz() {
    questionHeaderInfo.innerHTML = "";
    questionTextElement.innerHTML = "Quiz finalizado!"; // use innerHTML aqui também para o texto final
    optionsContainer.innerHTML = "";
    answerButton.style.display = "none";
    feedbackText.textContent = "";
    scoreText.textContent = `Sua pontuação final é: ${score} de ${questions.length}`;
    scoreText.classList.remove("hidden");
    
    // Exibe o gabarito
    const gabaritoHTML = document.createElement("div");
    gabaritoHTML.classList.add("gabarito-final");
    gabaritoHTML.innerHTML = "<h3>Gabarito Completo</h3>";
    
    userAnswers.forEach((item, index) => {
        const itemGabarito = document.createElement("div");
        let status = item.acertou ? '✅ Correto' : '❌ Incorreto';
        let suaResposta = item.acertou ? '' : ` (Sua resposta: ${item.suaResposta})`;
        itemGabarito.innerHTML = `
            <p><strong>${index + 1}.</strong> ${status} ${suaResposta}</p>
            <p><strong>Pergunta:</strong> ${item.pergunta}</p>
            <p><strong>Resposta Correta:</strong> ${item.respostaCorreta}</p>
            <hr>
        `;
        gabaritoHTML.appendChild(itemGabarito);
    });

    const quizBox = document.querySelector('.quiz-box');
    quizBox.appendChild(gabaritoHTML);
    
    // Opcional: Adicionar um botão para recomeçar o quiz
    const restartButton = document.createElement("button");
    restartButton.textContent = "Recomeçar Quiz";
    restartButton.classList.add("btn");
    restartButton.style.marginTop = "20px";
    restartButton.addEventListener("click", () => window.location.reload());
    quizBox.appendChild(restartButton);

    // Chame a renderização do MathJax para o gabarito
    setTimeout(() => {
        MathJax.typesetPromise();
    }, 0);
}

answerButton.addEventListener("click", checkAnswer);

// Lógica principal de inicialização
document.addEventListener("DOMContentLoaded", () => {
    const { tema, topico } = getQuizParams();
    
    if (tema === 'geral' || topico === 'todos' || (tema && topico)) {
        loadQuizzes();
    } else if (tema) {
        displayTopicsList();
    } else {
        // Se a URL não tiver parâmetros, redireciona para a página principal.
        window.location.href = "index.html"; 
    }
});

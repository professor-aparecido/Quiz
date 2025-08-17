// Selecionar elementos HTML
const quizTitleElement = document.getElementById("quiz-title");
const questionHeaderInfo = document.getElementById("question-header-info");
const questionTextElement = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedbackText = document.getElementById("feedback-text");
const answerButton = document.getElementById("answer-btn");
const scoreText = document.getElementById("score-text");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;

// Função para obter os parâmetros 'tema' e 'topico' da URL
function getQuizParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const tema = urlParams.get('tema') || 'numeros';
    const topico = urlParams.get('topico') || null;
    return { tema, topico };
}

// Função para carregar as questões do arquivo JSON
async function loadQuestions() {
    const { tema, topico } = getQuizParams();

    // Constrói o caminho do arquivo JSON dinamicamente
    const filePath = `quizzes/${tema}/${topico}.json`;

    // Atualiza o título do quiz na página
    const formattedTema = tema.charAt(0).toUpperCase() + tema.slice(1);
    const formattedTopico = topico ? topico.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Geral';
    quizTitleElement.textContent = `Quiz de ${formattedTema} - ${formattedTopico}`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o quiz de ${tema}/${topico}: ${response.statusText}`);
        }
        questions = await response.json();
        
        if (questions.length > 0) {
            displayQuestion();
        } else {
            questionTextElement.textContent = "Nenhuma questão encontrada para este tópico.";
        }
    } catch (error) {
        console.error("Falha ao carregar as questões:", error);
        questionTextElement.textContent = "Erro ao carregar o quiz. Verifique a URL ou o arquivo JSON.";
    }
}

// As funções abaixo (displayQuestion, selectOption, checkAnswer, nextQuestion, endQuiz) permanecem as mesmas.

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

    questionHeaderInfo.innerHTML = `
        <p><strong>Questão:</strong> ${currentQuestion.cabecalho.numero}</p>
        <p><strong>Habilidade BNCC:</strong> ${currentQuestion.cabecalho.habilidade_bncc}</p>
        <p><strong>Série:</strong> ${currentQuestion.cabecalho.serie}</p>
        <p><strong>Assunto:</strong> ${currentQuestion.cabecalho.assunto}</p>
        <p><strong>Instituição:</strong> ${currentQuestion.cabecalho.instituicao}</p>
    `;

    questionTextElement.textContent = currentQuestion.pergunta;

    currentQuestion.opcoes.forEach(option => {
        const button = document.createElement("button");
        button.textContent = `${option.letra}) ${option.texto}`;
        button.classList.add("option-btn");
        button.addEventListener("click", () => selectOption(button));
        optionsContainer.appendChild(button);
    });
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

    if (selectedOptionLetter === currentQuestion.resposta_correta) {
        score++;
        feedbackText.textContent = "Correto! 🎉";
        selectedButton.classList.add("correct");
    } else {
        feedbackText.textContent = "Incorreto. 😔";
        selectedButton.classList.add("incorrect");
        
        const correctButton = Array.from(optionsContainer.children).find(btn => btn.textContent.startsWith(currentQuestion.resposta_correta));
        if (correctButton) {
            correctButton.classList.add("correct");
        }
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
    questionTextElement.textContent = "Quiz finalizado!";
    optionsContainer.innerHTML = "";
    answerButton.style.display = "none";
    feedbackText.textContent = "";
    scoreText.textContent = `Sua pontuação final é: ${score} de ${questions.length}`;
    scoreText.classList.remove("hidden");
}

answerButton.addEventListener("click", checkAnswer);

document.addEventListener("DOMContentLoaded", loadQuestions);

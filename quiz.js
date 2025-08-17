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

// Função para obter o parâmetro 'tema' da URL
function getQuizTopic() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tema') || 'numeros'; // 'numeros' é o padrão se nenhum tema for encontrado
}

// Função para carregar as questões do arquivo JSON
async function loadQuestions() {
    const topic = getQuizTopic();
    const filePath = `quizzes/${topic}/${topic}.json`;
    
    // Atualiza o título do quiz na página
    quizTitleElement.textContent = `Quiz de ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o quiz de ${topic}: ${response.statusText}`);
        }
        questions = await response.json();
        if (questions.length > 0) {
            displayQuestion();
        } else {
            questionTextElement.textContent = "Nenhuma questão encontrada para este tema.";
        }
    } catch (error) {
        console.error("Falha ao carregar as questões:", error);
        questionTextElement.textContent = "Erro ao carregar o quiz. Por favor, verifique o tema na URL ou o arquivo JSON.";
    }
}

// As funções abaixo (displayQuestion, selectOption, checkAnswer, nextQuestion, endQuiz) permanecem as mesmas
// que criamos anteriormente, com a diferença de que a variável 'questions' agora é preenchida dinamicamente.

function displayQuestion() {
    isAnswered = false;
    optionsContainer.innerHTML = "";
    feedbackText.textContent = "";
    answerButton.style.display = "block";
    scoreText.classList.add("hidden");

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
    if (currentQuestionIndex < questions.length) {
        const nextButton = document.getElementById("next-btn");
        if (nextButton) {
            nextButton.remove();
        }
        displayQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    questionHeaderInfo.innerHTML = "";
    questionTextElement.textContent = "Quiz finalizado!";
    optionsContainer.innerHTML = "";
    answerButton.style.display = "none";
    feedbackText.textContent = "";
    scoreText.textContent = `Sua pontuação final é: ${score} de ${questions.length}`;
    scoreText.classList.remove("hidden");
    
    const nextButton = document.getElementById("next-btn");
    if (nextButton) {
        nextButton.remove();
    }
}

answerButton.addEventListener("click", checkAnswer);

document.addEventListener("DOMContentLoaded", loadQuestions);

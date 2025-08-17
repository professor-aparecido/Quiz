// Selecionar elementos HTML
const quizTitleElement = document.getElementById("quiz-title");
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

// Função para obter os parâmetros 'tema' e 'topico' da URL
function getQuizParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const tema = urlParams.get('tema') || 'numeros';
    const topico = urlParams.get('topico') || null;
    return { tema, topico };
}

// Função para exibir a lista de tópicos
async function displayTopicsList() {
    const { tema } = getQuizParams();
    const filePath = `quizzes/${tema}/${tema}-temas.json`;
    
    topicsListContainer.style.display = "block";
    quizContainer.style.display = "none";
    
    quizTitleElement.textContent = `Quizzes de ${tema.charAt(0).toUpperCase() + tema.slice(1)}`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error("Erro ao carregar a lista de tópicos.");
        }
        const topics = await response.json();
        
        topicsButtonsContainer.innerHTML = "";
        topics.forEach(topic => {
            const button = document.createElement("a");
            button.href = `quizzes.html?tema=${tema}&topico=${topic.id}`;
            button.className = "btn";
            button.textContent = `${topic.nome}`; // Mudança aqui!
            topicsButtonsContainer.appendChild(button);
        });

    } catch (error) {
        console.error("Falha ao carregar a lista de tópicos:", error);
        topicsButtonsContainer.innerHTML = `<p>Não foi possível carregar os tópicos para este tema.</p>`;
    }
}

// Função para carregar as questões do arquivo JSON e exibir o quiz
async function loadQuizByTopic() {
    const { tema, topico } = getQuizParams();
    
    topicsListContainer.style.display = "none";
    quizContainer.style.display = "block";
    
    // Constrói o caminho do arquivo JSON dinamicamente
    const filePath = `quizzes/${tema}/${topico}.json`;

    // Atualiza o título do quiz
    const formattedTema = tema.charAt(0).toUpperCase() + tema.slice(1);
    const formattedTopico = topico.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

// Lógica principal de inicialização
document.addEventListener("DOMContentLoaded", () => {
    const { topico } = getQuizParams();
    if (topico) {
        loadQuizByTopic();
    } else {
        displayTopicsList();
    }
});


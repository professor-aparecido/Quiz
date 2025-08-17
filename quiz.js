// Selecionar elementos HTML
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

// Função para carregar as questões do arquivo JSON
async function loadQuestions() {
    try {
        const response = await fetch("quizzes/numbers/numeros.json");
        if (!response.ok) {
            throw new Error(`Erro ao carregar o quiz: ${response.statusText}`);
        }
        questions = await response.json();
        if (questions.length > 0) {
            displayQuestion();
        } else {
            questionTextElement.textContent = "Nenhuma questão encontrada.";
        }
    } catch (error) {
        console.error("Falha ao carregar as questões:", error);
        questionTextElement.textContent = "Erro ao carregar o quiz. Tente novamente mais tarde.";
    }
}

// Função para exibir a pergunta
function displayQuestion() {
    isAnswered = false;
    optionsContainer.innerHTML = "";
    feedbackText.textContent = "";
    answerButton.style.display = "block"; // Exibe o botão "Responder"
    scoreText.classList.add("hidden");

    const currentQuestion = questions[currentQuestionIndex];

    // Exibe as informações do cabeçalho
    questionHeaderInfo.innerHTML = `
        <p><strong>Questão:</strong> ${currentQuestion.cabecalho.numero}</p>
        <p><strong>Habilidade BNCC:</strong> ${currentQuestion.cabecalho.habilidade_bncc}</p>
        <p><strong>Série:</strong> ${currentQuestion.cabecalho.serie}</p>
        <p><strong>Assunto:</strong> ${currentQuestion.cabecalho.assunto}</p>
        <p><strong>Instituição:</strong> ${currentQuestion.cabecalho.instituicao}</p>
    `;

    // Exibe a pergunta
    questionTextElement.textContent = currentQuestion.pergunta;

    // Cria os botões de opção
    currentQuestion.opcoes.forEach(option => {
        const button = document.createElement("button");
        button.textContent = `${option.letra}) ${option.texto}`;
        button.classList.add("option-btn");
        button.addEventListener("click", () => selectOption(button));
        optionsContainer.appendChild(button);
    });
}

// Função para lidar com a seleção de opção
function selectOption(selectedButton) {
    if (isAnswered) return;

    // Remove a classe 'selected' de todos os botões e adiciona ao botão clicado
    Array.from(optionsContainer.children).forEach(btn => {
        btn.classList.remove("selected");
    });
    selectedButton.classList.add("selected");
}

// Função para verificar a resposta ao clicar em "Responder"
function checkAnswer() {
    if (isAnswered) return;

    const selectedButton = document.querySelector(".option-btn.selected");

    if (!selectedButton) {
        feedbackText.textContent = "Por favor, selecione uma opção.";
        return;
    }

    isAnswered = true;
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOptionLetter = selectedButton.textContent.split(')')[0]; // Extrai a letra da opção

    if (selectedOptionLetter === currentQuestion.resposta_correta) {
        score++;
        feedbackText.textContent = "Correto! 🎉";
        selectedButton.classList.add("correct");
    } else {
        feedbackText.textContent = "Incorreto. 😔";
        selectedButton.classList.add("incorrect");
        
        // Destaca a resposta correta
        const correctButton = Array.from(optionsContainer.children).find(btn => btn.textContent.startsWith(currentQuestion.resposta_correta));
        if (correctButton) {
            correctButton.classList.add("correct");
        }
    }

    // Oculta o botão Responder e cria o botão Próxima Pergunta
    answerButton.style.display = "none";
    const nextButton = document.createElement("button");
    nextButton.textContent = "Próxima Pergunta";
    nextButton.id = "next-btn";
    nextButton.classList.add("btn");
    nextButton.addEventListener("click", nextQuestion);
    answerButton.parentNode.insertBefore(nextButton, answerButton.nextSibling);

    // Desativa todos os botões após a resposta
    Array.from(optionsContainer.children).forEach(btn => {
        btn.disabled = true;
    });
}

// Função para ir para a próxima pergunta
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        const nextButton = document.getElementById("next-btn");
        if (nextButton) {
            nextButton.remove();
        }
        displayQuestion();
    } else {
        // Fim do quiz
        endQuiz();
    }
}

// Função para finalizar o quiz
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

// Event listener para o botão de "Responder"
answerButton.addEventListener("click", checkAnswer);

// Inicia o quiz ao carregar a página
document.addEventListener("DOMContentLoaded", loadQuestions);

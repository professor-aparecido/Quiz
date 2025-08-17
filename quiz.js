document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const selectedTheme = params.get('tema');
    
    const quizTopicsList = document.getElementById('quiz-topics-list');
    const topicsButtonsContainer = document.getElementById('topics-buttons-container');
    const quizContainer = document.getElementById('quiz-container');

    let currentQuizData;
    let currentQuestionIndex = 0;
    let score = 0;

    // Função para carregar os botões de tópicos
    async function loadTopicButtons() {
        if (!selectedTheme) {
            console.log('Nenhum tema selecionado na URL.');
            return;
        }

        try {
            const response = await fetch('data/quizzes.json');
            const data = await response.json();
            const themeQuizzes = data.quizzes.filter(quiz => quiz.tema.toLowerCase() === selectedTheme.toLowerCase());

            if (themeQuizzes.length > 0) {
                // Limpa o container e mostra a seção de tópicos
                topicsButtonsContainer.innerHTML = '';
                quizTopicsList.style.display = 'block';
                quizContainer.style.display = 'none';

                themeQuizzes.forEach(quiz => {
                    const button = document.createElement('button');
                    button.textContent = quiz.topico;
                    button.classList.add('btn');
                    button.addEventListener('click', () => {
                        startQuiz(quiz);
                    });
                    topicsButtonsContainer.appendChild(button);
                });
            } else {
                quizTopicsList.innerHTML = `<p>Nenhum quiz encontrado para o tema: ${selectedTheme}</p>`;
                quizTopicsList.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao carregar os quizzes:', error);
            quizTopicsList.innerHTML = '<p>Erro ao carregar os dados. Tente novamente mais tarde.</p>';
            quizTopicsList.style.display = 'block';
        }
    }

    // Função para iniciar o quiz
    function startQuiz(quizData) {
        currentQuizData = quizData;
        currentQuestionIndex = 0;
        score = 0;
        
        quizTopicsList.style.display = 'none';
        quizContainer.style.display = 'block';

        displayQuestion();
    }

    // Função para exibir a pergunta atual
    function displayQuestion() {
        const question = currentQuizData.questions[currentQuestionIndex];
        
        document.getElementById('quiz-title').textContent = currentQuizData.topico;
        document.getElementById('question-text').textContent = question.text;

        const infoGrid = document.getElementById('question-header-info');
        infoGrid.innerHTML = `
            <p><strong>Questão:</strong> ${currentQuestionIndex + 1}/${currentQuizData.questions.length}</p>
            <p><strong>Habilidade BNCC:</strong> ${currentQuizData.habilidadeBNCC}</p>
            <p><strong>Série:</strong> ${currentQuizData.serie}</p>
            <p><strong>Assunto:</strong> ${currentQuizData.topico}</p>
            <p><strong>Instituição:</strong> ${currentQuizData.instituicao}</p>
        `;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-btn');
            button.textContent = option.label;
            button.dataset.correct = option.isCorrect;
            button.addEventListener('click', () => selectOption(button));
            optionsContainer.appendChild(button);
        });

        document.getElementById('answer-btn').style.display = 'block';
        document.getElementById('feedback-text').textContent = '';
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
            btn.disabled = false;
        });
    }

    // Função para selecionar uma opção
    function selectOption(selectedButton) {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        selectedButton.classList.add('selected');
    }

    // Função para verificar a resposta
    document.getElementById('answer-btn').addEventListener('click', () => {
        const selectedOption = document.querySelector('.option-btn.selected');
        if (!selectedOption) {
            document.getElementById('feedback-text').textContent = 'Por favor, selecione uma opção.';
            return;
        }

        const isCorrect = selectedOption.dataset.correct === 'true';
        const feedbackText = document.getElementById('feedback-text');

        if (isCorrect) {
            feedbackText.textContent = 'Resposta correta!';
            feedbackText.style.color = '#27AE60';
            score++;
        } else {
            feedbackText.textContent = 'Resposta incorreta. Tente novamente.';
            feedbackText.style.color = '#E74C3C';
        }

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            } else if (btn === selectedOption) {
                btn.classList.add('incorrect');
            }
        });

        document.getElementById('answer-btn').style.display = 'none';
        
        // Adicionar botão de próxima pergunta
        const nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn';
        nextBtn.classList.add('btn');
        nextBtn.textContent = 'Próxima Questão';
        
        nextBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < currentQuizData.questions.length) {
                displayQuestion();
                document.getElementById('answer-btn').style.display = 'block';
                document.getElementById('next-btn').remove(); // Remover o botão para a próxima
            } else {
                endQuiz();
            }
        });
        quizContainer.querySelector('.quiz-footer').appendChild(nextBtn);
    });

    // Função para finalizar o quiz
    function endQuiz() {
        const quizContent = quizContainer.querySelector('.quiz-content');
        const quizFooter = quizContainer.querySelector('.quiz-footer');

        quizContent.innerHTML = `<h3>Quiz Finalizado!</h3><p>Sua pontuação final é: ${score} de ${currentQuizData.questions.length}</p>`;
        quizFooter.innerHTML = `<button class="btn" onclick="window.location.reload()">Recomeçar</button>`;
    }

    loadTopicButtons();
});

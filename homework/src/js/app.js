const startGameButton = document.querySelector('.start-new-game');
const main = document.querySelector('main');
const questionDiv = document.querySelector('.question');
const totalPrizeDiv = document.querySelector('.total-prize');
const roundPrizeDiv = document.querySelector('.round-prize');
const app = document.querySelector('.app');
const questionsData = JSON.parse(localStorage.getItem('questions'));
const skipQuestion = document.querySelector('.skip-question');
const answersContainer = document.querySelector('.answers-container');

const getRandomQuestion = () => {
    const { completedQuestions } = state;
    const randomQuestion = Math.floor(Math.random() * questionsData.length);

    return completedQuestions.includes(randomQuestion) ? getRandomQuestion() : randomQuestion;
};

const initialState = {
    currentQuestion: Math.floor(Math.random() * questionsData.length),
    totalPrize: 0,
    roundPrize: 100,
    completedQuestions: [],
    skipped: false
};

let state = Object.assign({}, initialState);

const reloadGame = () => {
    app.style.filter = '';
    document.querySelector('.alert-window') && document.querySelector('.alert-window').remove();
    state = Object.assign({}, initialState, {
        currentQuestion: Math.floor(Math.random() * questionsData.length)
    });

    renderApp();
};

const showAlert = (message, color = 'green') => {
    const alertDiv = document.createElement('div');

    alertDiv.classList.add('alert-window');
    alertDiv.innerHTML = `${message}`;
    alertDiv.style.color = color;
    document.body.append(alertDiv);
    app.style.filter = 'blur(3px)';
};

const smoothieShowTitle = (container, title) => {
    const smoothConstant = 400;
    const time = smoothConstant / title.length;
    let index = 0;

    container.innerHTML = '';

    const insertLetterInterval = setInterval(() => {
        container.innerHTML += `${title[index]}`;

        if (title.length === container.innerHTML.trim().length) {
            clearInterval(insertLetterInterval);
        }

        index++;
    }, time);
};

const renderNextQuestion = () => {
    const { currentQuestion, totalPrize, roundPrize, completedQuestions, skipped } = state;
    const roundMultiplier = 2

    if (completedQuestions.length + 1 === questionsData.length) {
        showAlert('Congratulations! You won 1000000.');

        return;
    }
        state = Object.assign({}, state, {
        currentQuestion: getRandomQuestion(),
        totalPrize: skipped ? totalPrize : totalPrize + roundPrize,
        roundPrize: skipped ? roundPrize : roundPrize * roundMultiplier,
        completedQuestions: [ ...completedQuestions, currentQuestion ]
    });

    renderApp();
};

const renderApp = () => {
    const { currentQuestion, totalPrize, roundPrize, skipped } = state;
    const { question, content, correct } = questionsData[currentQuestion];
    const correctAnswerHandler = answerDiv => {
        const time = 1000;

        answerDiv.classList.add('correct');
        setTimeout(() => renderNextQuestion(), time);
    }
    const incorrectAnswerHandler = answerDiv => {
        const hideAlertTime = 1000;
        const reloadGameTime = 2000;

        answerDiv.classList.add('incorrect');
        setTimeout(() => showAlert(`Game over. Your prize is: ${totalPrize}`, 'red'), hideAlertTime);
        setTimeout(() => reloadGame(), reloadGameTime);
    };

    smoothieShowTitle(questionDiv, question);

    !skipped && skipQuestion.classList.remove('hidden');
    totalPrizeDiv.innerHTML = `${totalPrize}`;
    roundPrizeDiv.innerHTML = `${roundPrize}`;

    answersContainer.innerHTML = ``;
    content.forEach((answerText, index) => {
        const answerDiv = document.createElement('div');

        answerDiv.classList.add('answer');
        answerDiv.innerText = answerText;

        if (index === correct) {
            answerDiv.addEventListener('click', () => correctAnswerHandler(answerDiv));
        } else {
            answerDiv.addEventListener('click', () => incorrectAnswerHandler(answerDiv));
        }

        answersContainer.append(answerDiv);
    });
    setTimeout(() => answersContainer.querySelectorAll('.answer').forEach(answer => answer.classList.add('show')), 0);
};

startGameButton.addEventListener('click', () => {
    if (main.classList.contains('hidden')) {
        main.classList.remove('hidden');
        skipQuestion.classList.remove('hidden');
        renderApp();
    } else {
        reloadGame();
    }
});

skipQuestion.addEventListener('click', () => {
    state = Object.assign({}, state, { skipped: true });

    renderNextQuestion();
    skipQuestion.classList.add('hidden');
});

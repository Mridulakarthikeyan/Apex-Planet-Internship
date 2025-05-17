const welcomeScreen = document.getElementById('welcome-screen');
const loadingScreen = document.getElementById('loading-screen');
const questionScreen = document.getElementById('question-screen');
const resultScreen = document.getElementById('result-screen');
const reviewScreen = document.getElementById('review-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const reviewBtn = document.getElementById('review-btn');
const backToResultsBtn = document.getElementById('back-to-results');

const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const quizProgress = document.getElementById('quiz-progress');
const timerElement = document.getElementById('timer');
const finalScoreElement = document.getElementById('final-score');
const correctAnswersElement = document.getElementById('correct-answers');
const timeTakenElement = document.getElementById('time-taken');
const reviewContainer = document.getElementById('review-container');
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let quizStartTime;
let quizEndTime;
let timerInterval;
let userAnswers = [];
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', goToNextQuestion);
restartBtn.addEventListener('click', resetQuiz);
reviewBtn.addEventListener('click', showReviewScreen);
backToResultsBtn.addEventListener('click', () => {
  hideAllScreens();
  resultScreen.classList.add('active');
});

async function startQuiz() {
  const categoryId = categorySelect.value;
  const difficulty = difficultySelect.value;

  hideAllScreens();
  loadingScreen.classList.add('active');

  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${difficulty}&type=multiple`
    );
    const data = await response.json();
    
    if (data.response_code === 0) {
      questions = data.results.map(question => {
        const answers = [...question.incorrect_answers, question.correct_answer];

        shuffleArray(answers);
        
        return {
          question: decodeHTML(question.question),
          answers: answers.map(answer => decodeHTML(answer)),
          correctAnswer: decodeHTML(question.correct_answer)
        };
      });

      currentQuestionIndex = 0;
      score = 0;
      userAnswers = [];
      selectedAnswer = null;

      quizStartTime = new Date();
      startTimer();

      showQuestion();

      hideAllScreens();
      questionScreen.classList.add('active');
    } else {
      throw new Error('Failed to load questions. Please try again.');
    }
  } catch (error) {
    console.error('Error loading questions:', error);
    alert('Failed to load questions. Please try again.');

    hideAllScreens();
    welcomeScreen.classList.add('active');
  }
}

function showQuestion() {
  const question = questions[currentQuestionIndex];
  questionCounter.textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
  questionText.textContent = question.question;
  

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  quizProgress.style.width = `${progressPercentage}%`;
  

  optionsContainer.innerHTML = '';
  
  question.answers.forEach((answer, index) => {
    const optionElement = document.createElement('div');
    optionElement.classList.add('option');
    optionElement.textContent = answer;
    optionElement.dataset.index = index;
    
    optionElement.addEventListener('click', () => selectOption(optionElement, answer));
    
    optionsContainer.appendChild(optionElement);
  });

  nextBtn.disabled = true;
  selectedAnswer = null;
}

function selectOption(optionElement, answer) {
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = answer === currentQuestion.correctAnswer;
  
  const options = document.querySelectorAll('.option');
  options.forEach(option => {
    option.classList.remove('selected');
    option.classList.remove('correct');
    option.classList.remove('wrong');
  });
  
  optionElement.classList.add('selected');

  if (isCorrect) {
    optionElement.classList.add('correct');
    score++;
  } else {
    optionElement.classList.add('wrong');

    options.forEach(option => {
      if (option.textContent === currentQuestion.correctAnswer) {
        option.classList.add('correct');
      }
    });
  }

  userAnswers[currentQuestionIndex] = {
    question: currentQuestion.question,
    userAnswer: answer,
    correctAnswer: currentQuestion.correctAnswer,
    isCorrect: isCorrect
  };

  nextBtn.disabled = false;
  selectedAnswer = answer;
}


function goToNextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {

  clearInterval(timerInterval);
  quizEndTime = new Date();

  const timeTaken = Math.floor((quizEndTime - quizStartTime) / 1000); // in seconds
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
 
  finalScoreElement.textContent = score;
  correctAnswersElement.textContent = `${score} / ${questions.length}`;
  timeTakenElement.textContent = formattedTime;

  hideAllScreens();
  resultScreen.classList.add('active');
}

function showReviewScreen() {

  reviewContainer.innerHTML = '';

  userAnswers.forEach((answer, index) => {
    const reviewItem = document.createElement('div');
    reviewItem.classList.add('review-item');
    

    const questionNumber = document.createElement('div');
    questionNumber.textContent = `Question ${index + 1}`;
    questionNumber.classList.add('review-question-number');
    
    const questionText = document.createElement('div');
    questionText.textContent = answer.question;
    questionText.classList.add('review-question');
    

    const userAnswerText = document.createElement('div');
    userAnswerText.innerHTML = `Your answer: <span class="${answer.isCorrect ? 'review-correct' : 'review-wrong'}">${answer.userAnswer}</span>`;
    userAnswerText.classList.add('review-answer');
    
   
    let correctAnswerText;
    if (!answer.isCorrect) {
      correctAnswerText = document.createElement('div');
      correctAnswerText.innerHTML = `Correct answer: <span class="review-correct">${answer.correctAnswer}</span>`;
      correctAnswerText.classList.add('review-answer');
    }
    reviewItem.appendChild(questionNumber);
    reviewItem.appendChild(questionText);
    reviewItem.appendChild(userAnswerText);
    if (!answer.isCorrect) {
      reviewItem.appendChild(correctAnswerText);
    }
    
    reviewContainer.appendChild(reviewItem);
  });
  

  hideAllScreens();
  reviewScreen.classList.add('active');
}

function resetQuiz() {

  clearInterval(timerInterval);

  questions = [];
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];

  hideAllScreens();
  welcomeScreen.classList.add('active');
}

function hideAllScreens() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));
}

function startTimer() {

  let seconds = 0;
  timerElement.textContent = '00:00';
  

  timerInterval = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, 1000);
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

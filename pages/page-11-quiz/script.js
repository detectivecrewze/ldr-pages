/**
 * Relationship Compatibility Setup Wizard
 * Windows 98 style setup wizard quiz game
 */

// Audio context for system sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Windows 98 style sounds
function playSuccessSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Tada sound
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function playErrorSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Error beep
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function playClickSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.05);
}

// Default questions (used if CONFIG is not available)
const defaultQuestions = [
    {
        question: "When did we first meet?",
        answers: ["January 2023", "March 15, 2023", "Summer 2022", "Last Christmas"],
        correct: 1
    },
    {
        question: "What is my favorite color?",
        answers: ["Red", "Blue", "Purple", "Pink"],
        correct: 2
    },
    {
        question: "What food do I love the most?",
        answers: ["Pizza", "Sushi", "Tacos", "Pasta"],
        correct: 0
    },
    {
        question: "Where was our first date?",
        answers: ["Cinema", "Coffee shop", "Park", "Restaurant"],
        correct: 1
    },
    {
        question: "What nickname do I call you?",
        answers: ["Honey", "Baby", "Sweetie", "Love"],
        correct: 3
    }
];

// Quiz Wizard State
const state = {
    currentScreen: 'welcome',
    currentQuestion: 0,
    score: 0,
    questions: [],
    answered: false
};

// DOM Elements
const screens = {
    welcome: document.getElementById('screen-welcome'),
    quiz: document.getElementById('screen-quiz'),
    install: document.getElementById('screen-install'),
    finish: document.getElementById('screen-finish')
};

const steps = {
    welcome: document.getElementById('step-welcome'),
    quiz: document.getElementById('step-quiz'),
    install: document.getElementById('step-install'),
    finish: document.getElementById('step-finish')
};

const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const btnCancel = document.getElementById('btn-cancel');
const errorDialog = document.getElementById('errorDialog');
const errorOverlay = document.getElementById('errorOverlay');
const errorMessage = document.getElementById('errorMessage');
const errorHint = document.getElementById('errorHint');

// Load questions from CONFIG
function loadQuestions() {
    if (typeof CONFIG !== 'undefined' && CONFIG.quiz && CONFIG.quiz.questions && CONFIG.quiz.questions.length > 0) {
        state.questions = CONFIG.quiz.questions;
    } else {
        state.questions = defaultQuestions;
    }

    // Update total questions display
    const totalEl = document.getElementById('totalQ');
    if (totalEl) totalEl.textContent = state.questions.length;
}

// Navigation Functions
function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(s => s.classList.remove('active'));

    // Show target screen
    screens[screenName].classList.add('active');

    // Update steps sidebar
    Object.values(steps).forEach(s => s.classList.remove('active', 'completed'));

    const screenOrder = ['welcome', 'quiz', 'install', 'finish'];
    const currentIndex = screenOrder.indexOf(screenName);

    screenOrder.forEach((name, index) => {
        if (index < currentIndex) {
            steps[name].classList.add('completed');
        } else if (index === currentIndex) {
            steps[name].classList.add('active');
        }
    });

    state.currentScreen = screenName;
    updateButtons();

    // Start specific screen logic
    if (screenName === 'quiz') {
        showQuestion();
    } else if (screenName === 'install') {
        startInstallation();
    } else if (screenName === 'finish') {
        showFinish();
        playSuccessSound();
    }
}

function updateButtons() {
    switch (state.currentScreen) {
        case 'welcome':
            btnBack.disabled = true;
            btnNext.textContent = 'Next >';
            btnNext.disabled = false;
            break;
        case 'quiz':
            btnBack.disabled = false;
            btnNext.textContent = 'Next >';
            btnNext.disabled = false;
            btnNext.style.opacity = '1';
            btnNext.style.pointerEvents = 'auto';
            break;
        case 'install':
            btnBack.disabled = true;
            btnNext.disabled = true;
            break;
        case 'finish':
            btnBack.disabled = true;
            btnNext.textContent = 'Finish';
            btnNext.disabled = false;
            break;
    }
}

// Quiz Functions
function showQuestion() {
    state.answered = false;
    updateButtons();

    if (state.currentQuestion >= state.questions.length) {
        state.currentQuestion = Math.max(0, state.questions.length - 1);
    }

    const q = state.questions[state.currentQuestion];
    if (!q) {
        showScreen('welcome');
        return;
    }

    document.getElementById('currentQ').textContent = state.currentQuestion + 1;
    document.getElementById('questionText').textContent = q.question;

    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';

    q.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => checkAnswer(index, btn);
        answersContainer.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, btnElement) {
    if (state.answered) return;

    state.answered = true;
    const q = state.questions[state.currentQuestion];
    const isCorrect = selectedIndex === q.correct;

    // Disable all answer buttons
    const allBtns = document.querySelectorAll('.answer-btn');
    allBtns.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        playClickSound();
        state.score++;
        btnElement.classList.add('correct');

        // Auto advance after short delay
        setTimeout(() => {
            if (state.currentQuestion < state.questions.length - 1) {
                state.currentQuestion++;
                showQuestion();
            } else {
                showScreen('install');
            }
        }, 800);
    } else {
        playErrorSound();
        btnElement.classList.add('wrong');

        // Show error dialog
        const cuteMessages = [
            "Oops! Did you forget already? 🙈",
            "Not quite! Memory needs refresh 💭",
            "Try again! Love needs attention 💕",
            "Hmm, are you sure? 🤔",
            "Wrong answer! But you're still cute 😊"
        ];

        errorMessage.textContent = "Incorrect answer!";
        errorHint.textContent = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];

        errorDialog.classList.add('active');
        errorOverlay.classList.add('active');

        // Wait for OK button to reset answered state
    }
}

// Installation Animation
function startInstallation() {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const installText = document.getElementById('installText');
    const installDetails = document.getElementById('installDetails');

    const messages = [
        "Preparing installation...",
        "Extracting memories...",
        "Installing trust...",
        "Configuring love...",
        "Adding affection...",
        "Optimizing relationship...",
        "Almost there..."
    ];

    const details = [
        "Found: 1,247 happy moments",
        "Unpacking: First date memories",
        "Installing: Good morning texts...",
        "Copying: Inside jokes...",
        "Registering: Love language...",
        "Cleaning up: Old arguments...",
        "Finalizing installation..."
    ];

    let progress = 0;
    const totalSteps = 100;

    const interval = setInterval(() => {
        progress += Math.random() * 3 + 1;

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            setTimeout(() => {
                showScreen('finish');
            }, 500);
        }

        progressFill.style.width = progress + '%';
        progressPercent.textContent = Math.floor(progress) + '%';

        // Update message based on progress
        const msgIndex = Math.min(Math.floor(progress / 15), messages.length - 1);
        installText.textContent = messages[msgIndex];
        installDetails.textContent = details[msgIndex];

    }, 100);
}

// Finish Screen
function showFinish() {
    const scorePercent = Math.round((state.score / state.questions.length) * 100);
    document.getElementById('scoreValue').textContent = scorePercent + '%';

    const messages = [
        { min: 100, text: "Perfect Match! 💕" },
        { min: 80, text: "Soulmates! 💑" },
        { min: 60, text: "Great Together! 💝" },
        { min: 0, text: "Keep Learning! 💗" }
    ];

    const message = messages.find(m => scorePercent >= m.min);
    document.getElementById('scoreMessage').textContent = message.text;
}

// Event Listeners
btnNext.addEventListener('click', () => {
    playClickSound();

    switch (state.currentScreen) {
        case 'welcome':
            showScreen('quiz');
            break;
        case 'quiz':
            // If they haven't answered, warn them or just let them skip
            if (!state.answered) {
                // For a quiz, it's usually better to force an answer, 
                // but if they click Next manually we'll just let them go or show a hint
                const allBtns = document.querySelectorAll('.answer-btn');
                const hasWrong = Array.from(allBtns).some(b => b.classList.contains('wrong'));
                if (!hasWrong) {
                    // If no answer selected yet, show a tiny hint but let them click again
                    console.log('User clicked Next without answering');
                }
            }

            if (state.currentQuestion < state.questions.length - 1) {
                state.currentQuestion++;
                showQuestion();
            } else {
                showScreen('install');
            }
            break;
        case 'finish':
            // Complete - notify parent
            window.parent.postMessage({
                type: 'APP_COMPLETE',
                appId: 'quiz'
            }, '*');
            break;
    }
});

btnBack.addEventListener('click', () => {
    playClickSound();

    switch (state.currentScreen) {
        case 'quiz':
            if (state.currentQuestion > 0) {
                state.currentQuestion--;
                showQuestion();
            } else {
                showScreen('welcome');
            }
            break;
    }
});

btnCancel.addEventListener('click', () => {
    playClickSound();
    // Reset to welcome
    state.currentQuestion = 0;
    state.score = 0;
    state.answered = false;
    showScreen('welcome');
});

// Error dialog close
document.getElementById('errorOkBtn').addEventListener('click', () => {
    playClickSound();
    errorDialog.classList.remove('active');
    errorOverlay.classList.remove('active');

    // Reset answer buttons
    const allBtns = document.querySelectorAll('.answer-btn');
    allBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
    });
    state.answered = false;
    updateButtons();
});

// Close button on title bar
document.getElementById('closeBtn').addEventListener('click', () => {
    playClickSound();
    if (window.parent !== window) {
        window.parent.postMessage({ type: 'NAVIGATE', direction: 'close' }, '*');
    }
});

// Initialize
function init() {
    loadQuestions();
    showScreen('welcome');
}

// Listen for CONFIG_UPDATE from parent
window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'CONFIG_UPDATE' && e.data.config) {
        if (e.data.config.quiz && e.data.config.quiz.questions) {
            state.questions = e.data.config.quiz.questions;
            document.getElementById('totalQ').textContent = state.questions.length;

            // Re-render current question if on quiz screen
            if (state.currentScreen === 'quiz') {
                showQuestion();
            }
        }
    }
});

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

const questions = [
    { question: "Which language is used to style web pages?", options: ["HTML", "CSS", "Python", "SQL"], answer: "CSS" },
    { question: "Which method selects an element by its ID?", options: ["getElementById()", "query()", "selectId()", "getElement()"], answer: "getElementById()" },
    { question: "Which keyword declares a constant in JavaScript?", options: ["var", "let", "const", "static"], answer: "const" },
    { question: "Which symbol is used for a single-line comment?", options: ["<!-- -->", "//", "##", "**"], answer: "//" },
    { question: "Which object is used to work with the HTML document?", options: ["window", "document", "browser", "page"], answer: "document" }
];

let current = 0;
let score = 0;
let timeLeft = 30;
let selected = null;
let timer = null;
let answered = false;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const timerEl = document.getElementById("timer");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const resultEl = document.getElementById("result");

function loadQuestion() {
    clearInterval(timer);
    timeLeft = 30;
    selected = null;
    answered = false;
    timerEl.textContent = timeLeft;
    nextBtn.disabled = false;
    nextBtn.textContent = current === questions.length - 1 ? "Finish Quiz" : "Next";

    const q = questions[current];
    document.getElementById("questionNumber").textContent =
        `Question ${current + 1} of ${questions.length}`;
    document.getElementById("progressBar").style.width =
        `${((current + 1) / questions.length) * 100}%`;
    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";
    resultEl.textContent = "";

    q.options.forEach(option => {
        const button = document.createElement("button");
        button.className = "option";
        button.type = "button";
        button.textContent = option;

        button.addEventListener("click", () => {
            if (answered) return;
            document.querySelectorAll(".option").forEach(b => b.classList.remove("selected"));
            button.classList.add("selected");
            selected = option;
        });

        optionsEl.appendChild(button);
    });

    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) finishCurrentQuestion();
    }, 1000);
}

function finishCurrentQuestion() {
    if (answered) return;
    answered = true;
    clearInterval(timer);

    if (selected === questions[current].answer) score++;

    document.querySelectorAll(".option").forEach(button => {
        button.disabled = true;
    });

    current++;

    if (current < questions.length) {
        setTimeout(loadQuestion, 250);
    } else {
        showResult();
    }
}

function showResult() {
    questionEl.textContent = "Quiz Completed";
    optionsEl.innerHTML = "";
    nextBtn.style.display = "none";
    restartBtn.style.display = "block";
    document.querySelector(".top").style.display = "none";
    document.querySelector(".progress").style.display = "none";
    resultEl.textContent = `Your score is ${score} out of ${questions.length}.`;
}

function restartQuiz() {
    current = 0;
    score = 0;
    restartBtn.style.display = "none";
    nextBtn.style.display = "block";
    document.querySelector(".top").style.display = "flex";
    document.querySelector(".progress").style.display = "block";
    loadQuestion();
}

nextBtn.addEventListener("click", finishCurrentQuestion);
restartBtn.addEventListener("click", restartQuiz);
loadQuestion();

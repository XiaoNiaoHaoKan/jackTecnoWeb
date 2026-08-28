const params = new URLSearchParams(window.location.search);
const visitId = params.get("id");
let visit = null;

async function loadQuiz() {
    const visits = await apiGet("/visits");
    visit = visits.find(v => v._id === visitId);

    if (!visit) {
        alert("Visita non trovata");
        return;
    }

    showQuiz();
}

function showQuiz() {
    const container = document.getElementById("quizContainer");
    container.innerHTML = "";

    visit.quiz.forEach((question, questionIndex) => {
        const card = document.createElement("div");
        card.className = "card mb-3";

        const body = document.createElement("div");
        body.className = "card-body";
        body.innerHTML = `<h3 class="h5">${questionIndex + 1}) ${question.question}</h3>`;

        question.answers.forEach((answer, answerIndex) => {
            const label = document.createElement("label");
            label.className = "form-check d-block";
            label.innerHTML = `<input type="radio" class="form-check-input" name="question${questionIndex}" value="${answerIndex}"> ${answer}`;
            body.appendChild(label);
        });

        card.appendChild(body);
        container.appendChild(card);
    });

    const submitButton = document.createElement("button");
    submitButton.id = "submitQuiz";
    submitButton.className = "btn btn-success";
    submitButton.textContent = "Consegna quiz";
    submitButton.addEventListener("click", submitQuiz);
    container.appendChild(submitButton);
}

async function submitQuiz() {
    const answers = visit.quiz.map((question, questionIndex) => {
        const checked = document.querySelector(
            `input[name="question${questionIndex}"]:checked`
        );
        return checked ? Number(checked.value) : -1;
    });

    const score = answers.reduce((total, answer, index) =>
        total + (answer === visit.quiz[index].correctIndex ? 1 : 0), 0);
    const studentName = localStorage.getItem("studentName") || "Studente";

    await apiPost(`/visits/${visit._id}/quizAnswer`, {
        studentName,
        answers
    });

    alert(`Quiz inviato!\nPunteggio: ${score}/${visit.quiz.length}`);
    document.body.innerHTML = "<h1>Quiz consegnato.</h1><p>Grazie!</p>";
}

loadQuiz();

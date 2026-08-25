const params =
    new URLSearchParams(window.location.search);

const visitId =
    params.get("id");

let visit = null;



// =====================================
// CARICA QUIZ
// =====================================

async function loadQuiz(){

    const visits =
        await apiGet("/visits");

    visit =
        visits.find(
            v=>v._id===visitId
        );

    if(!visit){

        alert("Visita non trovata");
        return;

    }

    showQuiz();

}



// =====================================
// MOSTRA QUIZ
// =====================================

function showQuiz(){

    const container =
        document.getElementById(
            "quizContainer"
        );

    container.innerHTML="";



    visit.quiz.forEach((q,index)=>{

        let html=`

        <div class="card mb-3">
        <div class="card-body">

        <h3 class="h5">

        ${index+1}) ${q.question}

        </h3>

        `;



        q.answers.forEach((answer,i)=>{

            html+=`

            <div class="form-check">
            <input

            type="radio"
            class="form-check-input"

            name="question${index}"

            value="${i}"

            id="q${index}a${i}"

            >

            <label class="form-check-label" for="q${index}a${i}">${answer}</label>
            </div>

            `;

        });



        html+="</div></div>";



        container.innerHTML+=html;

    });



    container.innerHTML+=`

    <button id="submitQuiz" class="btn btn-success">

    Consegna quiz

    </button>

    `;



    document
    .getElementById("submitQuiz")
    .addEventListener(
        "click",
        submitQuiz
    );

}



// =====================================
// INVIO QUIZ
// =====================================

async function submitQuiz(){

    let score=0;



    visit.quiz.forEach((q,index)=>{

        const checked=

        document.querySelector(

            `input[name="question${index}"]:checked`

        );



        if(

            checked &&

            Number(checked.value)===q.correctIndex

        ){

            score++;

        }

    });



    const studentName=

        localStorage.getItem("studentName") ||

        "Studente";



    await apiPost(

        `/visits/${visit._id}/quizAnswer`,

        {

            student:studentName,

            score:score

        }

    );



    alert(

        `Quiz inviato!\nPunteggio: ${score}/${visit.quiz.length}`

    );



    document.body.innerHTML=`

    <h1>

    Quiz consegnato.

    Grazie!

    </h1>

    `;

}



// =====================================

loadQuiz();

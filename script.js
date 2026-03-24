let lesson = null;
let progress = {};

async function startLesson() {
  const subject = document.getElementById('subject').value;
  const grade = document.getElementById('grade').value;
  const data = await fetch(`subjects/${subject}.json`).then(res => res.json());
  lesson = data[grade].lessons[0];
  localStorage.setItem('currentLesson', JSON.stringify(lesson));
  localStorage.setItem('currentSubject', subject);
  localStorage.setItem('currentGrade', grade);
  window.location.href = 'lesson.html';
}

if (document.getElementById('lesson-title')) {
  lesson = JSON.parse(localStorage.getItem('currentLesson'));
  document.getElementById('lesson-title').innerText = lesson.title;
  document.getElementById('lesson-content').innerText = lesson.content;

  const quizDiv = document.getElementById('quiz');
  lesson.quiz.forEach((q, i) => {
    quizDiv.innerHTML += `<p>${q.question}</p>`;
    q.options.forEach(opt => {
      quizDiv.innerHTML += `<input type="radio" name="q${i}" value="${opt}"> ${opt}<br>`;
    });
  });
}

function submitQuiz() {
  let score = 0;
  lesson.quiz.forEach((q,i) => {
    const sel = document.querySelector(`input[name=q${i}]:checked`);
    if (sel && sel.value === q.answer) score++;
  });
  alert(`Score: ${score}/${lesson.quiz.length}`);
  const key = `${localStorage.getItem('currentSubject')}-${localStorage.getItem('currentGrade')}-${lesson.title}`;
  progress[key] = score;
  updateDashboard();
}

function nextLesson() {
  const subject = localStorage.getItem('currentSubject');
  const grade = localStorage.getItem('currentGrade');
  fetch(`subjects/${subject}.json`)
    .then(res => res.json())
    .then(data => {
      const lessons = data[grade].lessons;
      let idx = lessons.findIndex(l => l.title === lesson.title);
      if (idx < lessons.length - 1) {
        lesson = lessons[idx + 1];
        localStorage.setItem('currentLesson', JSON.stringify(lesson));
        document.getElementById('lesson-title').innerText = lesson.title;
        document.getElementById('lesson-content').innerText = lesson.content;
        const quizDiv = document.getElementById('quiz');
        quizDiv.innerHTML = '';
        lesson.quiz.forEach((q,i)=>{
          quizDiv.innerHTML += `<p>${q.question}</p>`;
          q.options.forEach(opt=>{
            quizDiv.innerHTML += `<input type="radio" name="q${i}" value="${opt}"> ${opt}<br>`;
          });
        });
        document.getElementById('aiResponse').innerText = '';
      } else alert("You completed all lessons!");
    });
}

async function askAI() {
  const input = document.getElementById('userInput').value;
  const aiResponse = document.getElementById('aiResponse');
  try {
    const res = await fetch('http://localhost:5000/ask-ai',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({question: input, lesson})
    });
    const data = await res.json();
    aiResponse.innerText = data.answer;
  } catch(err){
    aiResponse.innerText = "AI unavailable";
  }
}

function goToDashboard() { window.location.href='dashboard.html'; }
function goHome() { window.location.href='index.html'; }

function updateDashboard() {
  const dash = document.getElementById('dashboard-content');
  if(!dash) return;
  dash.innerHTML = '';
  for (let key in progress) {
    const score = progress[key];
    dash.innerHTML += `<h4>${key}: ${score}</h4>`;
    dash.innerHTML += `<div class="progress-bar"><div class="progress-fill" style="width:${score*10}%"></div></div>`;
  }
}
window.onload = updateDashboard;

// ======= 初始化參數與元素 =======
let workMin = 25;
let restMin = 5;
let longRestMin = 15;
let timer = null;
let isRunning = false;
let isWorkSession = true;
let remainingSeconds = workMin * 60;
let sessionDuration = remainingSeconds;
let isMuted = false;
let sessionCount = 0;

const timerDisplay = document.getElementById('timer');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionType = document.getElementById('sessionType');
const beep = document.getElementById('beep');
const workInput = document.getElementById('workInput');
const restInput = document.getElementById('restInput');
const longRestInput = document.getElementById('longRestInput');
const muteCheckbox = document.getElementById('muteCheckbox');
const volumeInput = document.getElementById('volumeInput');
const settingsForm = document.getElementById('settingsForm');
const themeToggle = document.getElementById('themeToggle');
const todayCountElem = document.getElementById('todayCount');
const progressBar = document.getElementById('progressBar');

// game 區
const gameArea = document.getElementById('gameArea');
const catchBtn = document.getElementById('catchBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
let gameInterval = null;
let gameScore = 0;

// todo區
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoListElem = document.getElementById('todoList');

// ======= 主題切換 =======
function setTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('pomodoro_theme', dark ? 'dark' : 'light');
}
themeToggle.onclick = () => setTheme(!document.body.classList.contains('dark'));
window.onload = function() {
  setTheme(localStorage.getItem('pomodoro_theme') === 'dark');
  volumeInput.value = localStorage.getItem('pomodoro_volume') || '1';
  updateVolume();
  loadTodo();
  loadCount();
  updateDisplay();
};

// ======= 番茄計時功能 =======
function updateDisplay() {
  const min = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const sec = String(remainingSeconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
  sessionType.textContent = isWorkSession ? '工作時間' : '休息時間';
  startPauseBtn.textContent = isRunning ? '暫停' : '開始';
  if (sessionDuration > 0) {
    const pct = ((sessionDuration - remainingSeconds) / sessionDuration) * 100;
    progressBar.style.width = pct + '%';
  }

}

// ======= 休息小遊戲 =======
function moveCatchBtn() {
  const areaRect = gameArea.getBoundingClientRect();
  const btnRect = catchBtn.getBoundingClientRect();
  const maxLeft = areaRect.width - btnRect.width;
  const maxTop = areaRect.height - btnRect.height;
  catchBtn.style.left = Math.random() * maxLeft + 'px';
  catchBtn.style.top = Math.random() * maxTop + 'px';
}

function showGame() {
  gameScore = 0;
  scoreDisplay.textContent = '得分：0';
  gameArea.classList.remove('hidden');
  moveCatchBtn();
  gameInterval = setInterval(moveCatchBtn, 1000);

}

function hideGame() {
  gameArea.classList.add('hidden');
  clearInterval(gameInterval);
}

catchBtn.onclick = () => {
  gameScore++;
  scoreDisplay.textContent = '得分：' + gameScore;
  moveCatchBtn();
};
function startTimer() {
  if (isRunning) return;
  isRunning = true;
  sessionDuration = remainingSeconds;
  timer = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
    } else {
      clearInterval(timer);
      if (!isMuted) beep.play();
      if (isWorkSession) {
        // ── 結束工作 → 進入休息 ──
        increaseCount();                       // 累計完成番茄數
        alert('工作結束！休息一下吧！');
        sessionCount++;                        // 用於判斷長休息
        isWorkSession = false;                 // 切換為休息狀態

        // 每 4 次工作給一次長休
        const restTime = (sessionCount % 4 === 0) ? longRestMin : restMin;
        remainingSeconds = restTime * 60;

        showGame();                            // 顯示休息小遊戲
      } else {
        // ── 結束休息 → 回到工作 ──
        alert(`休息結束，繼續努力！ 本次得分：${gameScore}`);
        hideGame();                            // 關閉小遊戲
        gameScore = 0;                         // 重設得分
        isWorkSession = true;                  // 切換為工作狀態
        remainingSeconds = workMin * 60;
      }
      sessionDuration = remainingSeconds;
      updateDisplay();
      isRunning = false;
      startTimer();
    }
  }, 1000);
  updateDisplay();
}
function pauseTimer() {
  isRunning = false;
  clearInterval(timer);
  updateDisplay();
}
function resetTimer() {
  isRunning = false;
  clearInterval(timer);
  isWorkSession = true;
  remainingSeconds = workMin * 60;
  sessionDuration = remainingSeconds;
  sessionCount = 0;

  hideGame();
  gameScore = 0;

  updateDisplay();
}
function applySettings() {
  if (!isRunning) {
    workMin = parseInt(workInput.value) || 25;
    restMin = parseInt(restInput.value) || 5;
    longRestMin = parseInt(longRestInput.value) || 15;
    isWorkSession = true;
    remainingSeconds = workMin * 60;
    sessionDuration = remainingSeconds;

    hideGame();
    gameScore = 0;

    updateDisplay();
  }
}

function updateVolume() {
  beep.volume = parseFloat(volumeInput.value);
  localStorage.setItem('pomodoro_volume', volumeInput.value);
}
startPauseBtn.onclick = () => { isRunning ? pauseTimer() : startTimer(); };
resetBtn.onclick = resetTimer;
workInput.onchange = applySettings;
restInput.onchange = applySettings;
longRestInput.onchange = applySettings;
muteCheckbox.onchange = () => { isMuted = muteCheckbox.checked; };
volumeInput.oninput = updateVolume;
settingsForm.onsubmit = (e) => { e.preventDefault(); };

// ======= 番茄計數/日期 =======
function todayKey() {
  const now = new Date();
  return "pomodoro_" + now.getFullYear() + (now.getMonth()+1).toString().padStart(2,'0') + now.getDate().toString().padStart(2,'0');
}
function loadCount() {
  const n = parseInt(localStorage.getItem(todayKey())) || 0;
  todayCountElem.textContent = "今日完成：" + n;
}
function increaseCount() {
  const key = todayKey();
  let n = parseInt(localStorage.getItem(key)) || 0;
  n++;
  localStorage.setItem(key, n);
  todayCountElem.textContent = "今日完成：" + n;
}

// ======= Todo功能 =======
let todoArr = [];
function saveTodo() {
  localStorage.setItem(todayKey() + '_todo', JSON.stringify(todoArr));
}
function loadTodo() {
  let t = localStorage.getItem(todayKey() + '_todo');
  todoArr = t ? JSON.parse(t) : [];
  renderTodo();
}
function renderTodo() {
  todoListElem.innerHTML = '';
  todoArr.forEach((item, idx) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = item.text;
    span.className = "todo-text" + (item.done ? " completed" : "");
    span.onclick = () => { todoArr[idx].done = !todoArr[idx].done; saveTodo(); renderTodo(); };
    const actions = document.createElement('div');
    actions.className = "todo-actions";
    const delBtn = document.createElement('button');
    delBtn.className = "todo-btn";
    delBtn.innerHTML = "🗑️";
    delBtn.title = "刪除";
    delBtn.onclick = (e) => { e.stopPropagation(); todoArr.splice(idx,1); saveTodo(); renderTodo(); };
    actions.appendChild(delBtn);
    li.appendChild(span);
    li.appendChild(actions);
    todoListElem.appendChild(li);
  });
}
todoForm.onsubmit = function(e){
  e.preventDefault();
  let v = todoInput.value.trim();
  if(v){
    todoArr.push({text:v, done:false});
    todoInput.value = '';
    saveTodo();
    renderTodo();
  }
};

// ======= 日期切換時自動清空 =======
setInterval(() => {
  if(new Date().getHours() === 0 && new Date().getMinutes() < 1) {
    localStorage.removeItem(todayKey());
    localStorage.removeItem(todayKey()+'_todo');
    loadCount();
    loadTodo();
  }
}, 60000); // 每分鐘檢查一次

updateDisplay();

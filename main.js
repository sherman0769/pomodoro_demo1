// 設定參數與初始值
let workMin = 25;
let restMin = 5;
let timer = null;
let isRunning = false;
let isWorkSession = true;
let remainingSeconds = workMin * 60;
let isMuted = false;

const timerDisplay = document.getElementById('timer');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionType = document.getElementById('sessionType');
const beep = document.getElementById('beep');
const workInput = document.getElementById('workInput');
const restInput = document.getElementById('restInput');
const muteCheckbox = document.getElementById('muteCheckbox');
const settingsForm = document.getElementById('settingsForm');

function updateDisplay() {
  const min = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const sec = String(remainingSeconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
  sessionType.textContent = isWorkSession ? '工作時間' : '休息時間';
  startPauseBtn.textContent = isRunning ? '暫停' : '開始';
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timer = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
    } else {
      clearInterval(timer);
      if (!isMuted) beep.play();
      alert(isWorkSession ? '工作結束！休息一下吧！' : '休息結束，繼續努力！');
      isWorkSession = !isWorkSession;
      remainingSeconds = (isWorkSession ? workMin : restMin) * 60;
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
  updateDisplay();
}

function applySettings() {
  // 只在未開始計時時允許變更
  if (!isRunning) {
    workMin = parseInt(workInput.value) || 25;
    restMin = parseInt(restInput.value) || 5;
    isWorkSession = true;
    remainingSeconds = workMin * 60;
    updateDisplay();
  }
}

// 綁定事件
startPauseBtn.onclick = () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
};
resetBtn.onclick = resetTimer;
workInput.onchange = applySettings;
restInput.onchange = applySettings;
muteCheckbox.onchange = () => {
  isMuted = muteCheckbox.checked;
};

// 阻止表單送出
settingsForm.onsubmit = (e) => {
  e.preventDefault();
};

updateDisplay();

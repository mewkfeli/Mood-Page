if (typeof Howl !== 'undefined') {
  console.log('Howler.js подключен!');
} else {
  console.error('Howler.js не загружен!');
}

// Элементы
const body = document.body;
const slider = document.getElementById('moodSlider');
const emotionText = document.getElementById('emotionText');
const description = document.getElementById('description');
const drawBtn = document.getElementById('drawBtn');
const audioToggle = document.getElementById('audioToggle');
let audioEnabled = true;

// Цвета и звуки для разных настроений
const emotions = [
  {
    color: '#3a0ca3',
    emotion: '😔 Грусть',
    textColor: '#ffffff',
    sound: 'sad'
  },
  {
    color: '#4361ee',
    emotion: '😌 Умиротворение',
    textColor: '#ffffff',
    sound: 'calm'
  },
  {
    color: '#4cc9f0',
    emotion: '😊 Спокойствие',
    textColor: '#333333',
    sound: 'peaceful'
  },
  {
    color: '#f72585',
    emotion: '😄 Радость',
    textColor: '#ffffff',
    sound: 'happy'
  },
  {
    color: '#FF0033',
    emotion: '😤 Напряжение',
    textColor: '#FFFFFF',
    sound: 'stress'
  }
];

// Здесь объявление sounds и вся логика работы со звуками
const sounds = {
  sad: new Howl({ src: ['assets/audio/sad.mp3'], volume: 0.7, onloaderror: (id, err) => console.error('Ошибка загрузки sad.mp3', err) }),
  calm: new Howl({ src: ['assets/audio/calm.mp3'], volume: 0.7, onloaderror: (id, err) => console.error('Ошибка загрузки calm.mp3', err) }),
  peaceful: new Howl({ src: ['assets/audio/peaceful.mp3'], volume: 0.7, onloaderror: (id, err) => console.error('Ошибка загрузки peaceful.mp3', err) }),
  happy: new Howl({ src: ['assets/audio/happy.mp3'], volume: 0.7, onloaderror: (id, err) => console.error('Ошибка загрузки happy.mp3', err) }),
  stress: new Howl({ src: ['assets/audio/stress_sound.mp3'], volume: 0.7, onloaderror: (id, err) => console.error('Ошибка загрузки stress_sound.mp3', err) })
};

// Добавим переменную для текущего Howl-объекта
let currentHowl = null;

function stopAllSounds(fade = true) {
  Object.values(sounds).forEach(sound => {
    if (fade && sound.playing()) {
      sound.fade(sound.volume(), 0, 1000); // плавное затухание за 1 сек
      setTimeout(() => sound.stop(), 1000);
    } else {
      sound.stop();
    }
  });
}

// Состояние для отслеживания резких движений
let lastValue = 50;
let lastMoveTime = 0;
let isFastMove = false;
let fastMoveTimeout;

// Частицы для анимации
function createParticles(x, y) {
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    document.body.appendChild(particle);

    const size = Math.random() * 15 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    const animationTime = Math.random() * 2 + 1;
    particle.style.transition = `all ${animationTime}s linear`;

    setTimeout(() => {
      particle.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px)`;
      particle.style.opacity = '0';
    }, 10);

    setTimeout(() => {
      particle.remove();
    }, animationTime * 1000);
  }
}

// Обработчик ползунка
slider.addEventListener('input', (e) => {
  const value = e.target.value;
  const now = Date.now();
  const speed = Math.abs(value - lastValue) / (now - lastMoveTime);

  // Определяем резкое движение
  if (speed > 0.5 && now - lastMoveTime < 100) {
    if (!isFastMove) {
      isFastMove = true;
      description.textContent = "Эмоции — это энергия. Направь её в творчество.";
      drawBtn.style.display = "block";
      createParticles(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
    }

    // Сбрасываем таймер сброса
    clearTimeout(fastMoveTimeout);
    fastMoveTimeout = setTimeout(() => {
      isFastMove = false;
      description.textContent = "Передвиньте ползунок — и мир вокруг изменится";
      drawBtn.style.display = "none";
    }, 5000);
  }

  lastValue = value;
  lastMoveTime = now;

  // Обновляем цвет и эмоцию
  updateMood(value);

  // Сброс финального залития, если пользователь двигает ползунок
  if (isFinalFill) {
    overlay.style.opacity = '0';
    finalText.style.opacity = '0';
    finalBtn.style.opacity = '0';
    isFinalFill = false;
  }

  // Сброс и запуск таймера ожидания
  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(() => {
    // Через 10 секунд бездействия — плавное залитие
    const value = slider.value;
    const moodIndex = Math.floor(value / (100 / (emotions.length)));
    const mood = emotions[Math.min(moodIndex, emotions.length - 1)];
    overlay.style.background = mood.color;
    overlay.style.opacity = '1';
    showFinalMessage(mood);
    isFinalFill = true;
  }, 10000);
});

// Обновление настроения со звуком
function updateMood(value) {
    const moodIndex = Math.floor(value / (100 / (emotions.length)));
    const mood = emotions[Math.min(moodIndex, emotions.length - 1)];

    body.style.background = mood.color;
    emotionText.textContent = mood.emotion;
    emotionText.style.color = mood.textColor;

    // Плавное переключение звука
    if (audioEnabled) {
        if (currentHowl && currentHowl.playing()) {
            currentHowl.fade(currentHowl.volume(), 0, 1000);
            setTimeout(() => {
                currentHowl.stop();
                playMoodSound(mood.sound);
            }, 1000);
        } else {
            playMoodSound(mood.sound);
        }
        currentSound = mood.sound;
    }

    // Передаем индекс настроения в p5.js
    if (typeof setMoodIndex === 'function') {
        setMoodIndex(Math.min(moodIndex, emotions.length - 1));
    }
}

function playMoodSound(soundKey) {
    const howl = sounds[soundKey];
    if (howl) {
        howl.volume(0);
        howl.play();
        howl.fade(0, 0.7, 1000); // плавное появление за 1 сек
        currentHowl = howl;
    }
}

// Кнопка рисования
drawBtn.addEventListener('click', () => {
    const drawContainer = document.querySelector('.container');
    location.href = 'draw.html'; // Переход на страницу рисования
});

// Управление звуком
audioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;

    if (audioEnabled) {
        if (currentSound) {
            playMoodSound(currentSound);
        }
        audioToggle.textContent = '🔇 Звук ВЫКЛ';
    } else {
        stopAllSounds(true);
        audioToggle.textContent = '🔊 Звук ВКЛ';
    }
});

// Добавим overlay для финального залития
let overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = 0;
overlay.style.left = 0;
overlay.style.width = '100vw';
overlay.style.height = '100vh';
overlay.style.pointerEvents = 'none';
overlay.style.opacity = '0';
overlay.style.transition = 'opacity 2s';
overlay.style.zIndex = '1000';
overlay.style.display = 'flex';
overlay.style.flexDirection = 'column';
overlay.style.justifyContent = 'center';
overlay.style.alignItems = 'center';
overlay.style.textAlign = 'center';
document.body.appendChild(overlay);

// Элементы для финального сообщения и кнопки
let finalText = document.createElement('div');
finalText.style.color = '#fff';
finalText.style.fontSize = '2rem';
finalText.style.marginBottom = '2rem';
finalText.style.textShadow = '0 2px 8px #0008';
finalText.style.opacity = '0';
finalText.style.transition = 'opacity 1s';

let finalBtn = document.createElement('button');
finalBtn.style.fontSize = '1.2rem';
finalBtn.style.padding = '1rem 2rem';
finalBtn.style.border = 'none';
finalBtn.style.borderRadius = '1.5rem';
finalBtn.style.background = '#fff';
finalBtn.style.color = '#222';
finalBtn.style.cursor = 'pointer';
finalBtn.style.opacity = '0';
finalBtn.style.transition = 'opacity 1s';

overlay.appendChild(finalText);
overlay.appendChild(finalBtn);

let idleTimeout = null;
let isFinalFill = false;

// При инициализации тоже запускаем таймер
clearTimeout(idleTimeout);
idleTimeout = setTimeout(() => {
  const value = slider.value;
  const moodIndex = Math.floor(value / (100 / (emotions.length)));
  const mood = emotions[Math.min(moodIndex, emotions.length - 1)];
  overlay.style.background = mood.color;
  overlay.style.opacity = '1';
  showFinalMessage(mood);
  isFinalFill = true;
}, 10000);

// --- Функция для финального сообщения и кнопки ---
function showFinalMessage(mood) {
    // Определяем позитивное или негативное настроение
    const positive = ['happy', 'peaceful', 'calm'].includes(mood.sound);

    if (positive) {
        finalText.textContent = 'Запомни это состояние. Оно твоё.';
        finalBtn.textContent = 'Сохранить цвет';
        finalBtn.onclick = function() {
            // Генерируем PNG с этим цветом
            let canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 200;
            let ctx = canvas.getContext('2d');
            ctx.fillStyle = mood.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "bold 24px sans-serif";
            ctx.fillStyle = mood.textColor || "#fff";
            ctx.textAlign = "center";
            ctx.fillText(mood.emotion, 200, 110);
            // Скачиваем
            let link = document.createElement('a');
            link.download = 'mood-color.png';
            link.href = canvas.toDataURL();
            link.click();
        };
    } else {
        finalText.textContent = 'Всё проходит. Давай выдохнем';
        finalBtn.textContent = 'Дышать';
        finalBtn.onclick = function() {
            startBreathAnimation();
        };
    }
    // Показываем элементы
    setTimeout(() => {
        finalText.style.opacity = '1';
        finalBtn.style.opacity = '1';
    }, 800);
}

// --- Простая анимация дыхания ---
function startBreathAnimation() {
    // Удаляем старое содержимое
    finalText.style.opacity = '0';
    finalBtn.style.opacity = '0';

    setTimeout(() => {
        finalText.textContent = '';
        finalBtn.textContent = '';
        // Создаём круг для дыхания
        let breathCircle = document.createElement('div');
        breathCircle.style.width = '80px';
        breathCircle.style.height = '80px';
        breathCircle.style.borderRadius = '50%';
        breathCircle.style.background = 'rgba(255,255,255,0.7)';
        breathCircle.style.margin = '0 auto';
        breathCircle.style.transition = 'all 4s cubic-bezier(.4,0,.2,1)';
        overlay.appendChild(breathCircle);

        let breathText = document.createElement('div');
        breathText.style.color = '#fff';
        breathText.style.fontSize = '2rem';
        breathText.style.marginTop = '2rem';
        breathText.style.textShadow = '0 2px 8px #0008';
        overlay.appendChild(breathText);

        let phase = 0;
        function breathStep() {
            if (phase % 2 === 0) {
                // Вдох
                breathCircle.style.transform = 'scale(2)';
                breathText.textContent = 'Вдох...';
            } else {
                // Выдох
                breathCircle.style.transform = 'scale(1)';
                breathText.textContent = 'Выдох...';
            }
            phase++;
        }
        breathStep();
        let breathInterval = setInterval(breathStep, 4000);

        // Кнопка "Закрыть"
        let closeBtn = document.createElement('button');
        closeBtn.textContent = 'Закрыть';
        closeBtn.style.marginTop = '2rem';
        closeBtn.style.fontSize = '1.2rem';
        closeBtn.style.padding = '0.7rem 2rem';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '1.5rem';
        closeBtn.style.background = '#fff';
        closeBtn.style.color = '#222';
        closeBtn.style.cursor = 'pointer';
        overlay.appendChild(closeBtn);

        closeBtn.onclick = function() {
            clearInterval(breathInterval);
            overlay.removeChild(breathCircle);
            overlay.removeChild(breathText);
            overlay.removeChild(closeBtn);
            overlay.style.opacity = '0';
            isFinalFill = false;
        };
    }, 1000);
}
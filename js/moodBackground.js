// Абстрактные фигуры на фоне с помощью p5.js

let moodIndex = 0;
let moodColors = [
    ['#3a0ca3', '#4361ee'], // sad
    ['#4361ee', '#4cc9f0'], // calm
    ['#4cc9f0', '#f72585'], // peaceful
    ['#f72585', '#FF0033'], // happy
    ['#FF0033', '#3a0ca3']  // stress
];

function setMoodIndex(idx) {
    moodIndex = idx;
}

function setup() {
    let cnv = createCanvas(window.innerWidth, window.innerHeight);
    cnv.position(0, 0);
    cnv.style('z-index', '-1');
    cnv.style('position', 'fixed');
    cnv.style('pointer-events', 'none'); // чтобы не мешал кликам
    // Добавим прозрачность фона
    clear();
    noStroke();
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
    clear(); // очищаем холст перед каждым кадром
    // Градиентный фон
    let c1 = color(moodColors[moodIndex][0]);
    let c2 = color(moodColors[moodIndex][1]);
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(0, y, width, y);
    }
    noStroke();

    // Абстрактные движущиеся круги
    for (let i = 0; i < 10; i++) {
        fill(255, 100 + 100 * sin(frameCount * 0.01 + i), 150, 80);
        let x = width / 2 + sin(frameCount * 0.01 + i) * 300;
        let y = height / 2 + cos(frameCount * 0.013 + i) * 200;
        ellipse(x, y, 120 + 40 * sin(frameCount * 0.02 + i));
    }
}

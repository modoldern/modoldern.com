(async () => {
let currentLang = localStorage.getItem("lang") || "az";
let langUI = {};

const contentEl = document.getElementById("content");

// Boot animation
setTimeout(() => document.getElementById("boot").style.display = "none", 1500);

// --- THEME ---
let theme = localStorage.getItem("theme") || "dark";
document.body.classList.toggle("dark", theme === "dark");

const themeBtn = document.getElementById("themeBtn");
function updateThemeButton() {
    themeBtn.textContent = document.body.classList.contains("dark") ? "Light" : "Dark";
}
updateThemeButton();

themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", theme);
    updateThemeButton();
};
function updateFont(lang) {
    document.body.classList.remove("font-az", "font-en", "font-ge");

    if (lang === "az") document.body.classList.add("font-az");
    if (lang === "en") document.body.classList.add("font-en");
    if (lang === "ka") document.body.classList.add("font-ge");
}

async function loadUILang(lang) {
    updateFont(lang); 
    const res = await fetch(`lang/${lang}.json`);
    langUI = await res.json();

    currentLang = lang;
    localStorage.setItem("lang", lang);

    const titleEl = document.querySelector(".item-title");
    if (titleEl) titleEl.textContent = langUI["welcome"];
    

    document.getElementById("btn-cv").textContent = langUI["cv"];
    document.getElementById("btn-projects").textContent = langUI["projects"];
    document.getElementById("btn-contact").textContent = langUI["contact"];
    document.getElementById("btn-faq").textContent = langUI["faq"];
    document.getElementById("btn-games").textContent = langUI["games"];
}

// --- CLOCK ---
function updateClock() {
    const d = new Date();
    document.getElementById("clock").textContent =
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
updateClock();
setInterval(updateClock, 60000);


// --- BUTTONS ---
const buttons = {
    cv: document.getElementById("btn-cv"),
    projects: document.getElementById("btn-projects"),
    contact: document.getElementById("btn-contact"),
    faq: document.getElementById("btn-faq"),
    games: document.getElementById("btn-games")
};

function activate(name) {
    Object.keys(buttons).forEach(k => {
        buttons[k].classList.toggle("active", k === name);
    });
}

// --- JSON Load Functions ---

// function FAQ
async function loadFAQ() {
    const res = await fetch(`json/${currentLang}/faq.json`);
    const data = await res.json();

    let html = `<div class="item-title">${langUI["faq"]}</div>`;

    data.forEach(item => {
        html += `
            <details>
                <summary><b>${item.sual}</b></summary>
                ${item.cavab}
            </details>`;
    });

    html += `<div class="line" style="width:70%"></div>`;
    contentEl.innerHTML = html;
}

// function FAQ - end
// function CV
async function loadCV() {
    const res = await fetch(`json/${currentLang}/cv.json`);
    const data = await res.json();

    let html = `<div class="item-title">${langUI["cv"]}</div>`;
    for (let key in data) {
        html += `<strong>${key}:</strong> ${data[key]}<br>`;
    }
    html += `<div class="line" style="width:80%"></div>`;
    contentEl.innerHTML = html;
}

// function CV - end
// function Projects
async function loadProjects() {
    const res = await fetch(`json/${currentLang}/projects.json`);
    const data = await res.json();

    let html = `<div class="item-title">${langUI["projects"]}</div><ul>`;

    for (const key in data) {
        const item = data[key];
        html += `<li>${item.label} - <a href="${item.value}" target="_blank">${item.display}</a></li>`;
    }

    html += `</ul><div class="line" style="width:70%"></div>`;
    contentEl.innerHTML = html;
}

// function Projects - end
// function Contact
async function loadContact() {
    const res = await fetch(`json/${currentLang}/contact.json`);
    const data = await res.json();

    let html = `<div class="item-title">${langUI["contact"]}</div>`;

    for (const key in data) {
        const item = data[key];
        let href = item.value;

        if (item.type === "phone") href = `tel:${item.value}`;
        if (item.type === "email") href = `mailto:${item.value}`;

        html += `<strong>${item.label}:</strong> <a href="${href}" target="_blank">${item.display}</a><br>`;
    }

    html += `<div class="line" style="width:70%"></div>`;
    contentEl.innerHTML = html;
}

// function Contact - end

// function Page
async function loadSection(name) {
    activate(name);
    
    localStorage.setItem("activeSection", name); 

    contentEl.style.opacity = 0;
    contentEl.style.transform = "translateY(6px)";

    setTimeout(async () => {

        if (name === "faq") await loadFAQ();
        else if (name === "cv") await loadCV();
        else if (name === "projects") await loadProjects();
        else if (name === "contact") await loadContact();
        else if (name === "games") {const html = await fetch("pages/games.html").then(r=> r.text());
        contentEl.innerHTML = html;
         const titleDesk = document.querySelector(".item-title-desk");
            if (titleDesk) titleDesk.innerHTML = langUI["desk"];
        const titleMb = document.querySelector(".item-title-mb");
            if (titleMb) titleMb.innerHTML = langUI["mb"];
        }

        contentEl.style.opacity = 1;
        contentEl.style.transform = "translateY(0)";

        if (name === "games") startSnake();

    }, 120);
}
// function Page - end


// --- BUTTON EVENTS ---
buttons.cv.onclick = () => loadSection("cv");
buttons.projects.onclick = () => loadSection("projects");
buttons.contact.onclick = () => loadSection("contact");
buttons.faq.onclick = () => loadSection("faq");
buttons.games.onclick = () => loadSection("games");


// LANG SELECT EVENT
const selectEl = document.getElementById("langSelect");
selectEl.value = currentLang;

selectEl.onchange = async () => {
    await loadUILang(selectEl.value); 
    const currentActiveSection = localStorage.getItem("activeSection") || "cv";
    await loadSection(currentActiveSection);
};



// --- SNAKE GAME ---
function startSnake() {
    const canvas = document.getElementById("snakeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Make a really size canvas pixel
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const GRID_COLS = 15;
    const GRID_ROWS = 18;

    const CELL_WIDTH = Math.floor(canvas.width / GRID_COLS);
    const CELL_HEIGHT = Math.floor(canvas.height / GRID_ROWS);

    let count = 0;
    let snake = [{ x: 5, y: 5 }];
    let dx = 1, dy = 0;

    let food = {
        x: Math.floor(Math.random() * GRID_COLS),
        y: Math.floor(Math.random() * GRID_ROWS)
    };

    //--------------------------------------------------
    // DIRECT FUNCTION (KEYBOARD AND CLICK)
    //--------------------------------------------------
    function setDirection(x, y) {
        // DONT STEP TO REVERSE
        if (x !== 0 && dx === 0) {
            dx = x;
            dy = 0;
        }
        if (y !== 0 && dy === 0) {
            dx = 0;
            dy = y;
        }
    }

    //--------------------------------------------------
    // KEYBOARD EVENTS
    //--------------------------------------------------
    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") setDirection(-1, 0);
        if (e.key === "ArrowRight") setDirection(1, 0);
        if (e.key === "ArrowUp") setDirection(0, -1);
        if (e.key === "ArrowDown") setDirection(0, 1);
    });

    //--------------------------------------------------
    // CLICK EVENTS (N-Gage buttons)
    //--------------------------------------------------
    const upBtn = document.querySelector("#btn-up");
    const downBtn = document.querySelector("#btn-down");
    const leftBtn = document.querySelector("#btn-left");
    const rightBtn = document.querySelector("#btn-right");

    if (upBtn) upBtn.addEventListener("click", () => setDirection(0, -1));
    if (downBtn) downBtn.addEventListener("click", () => setDirection(0, 1));
    if (leftBtn) leftBtn.addEventListener("click", () => setDirection(-1, 0));
    if (rightBtn) rightBtn.addEventListener("click", () => setDirection(1, 0));

    //--------------------------------------------------
    // GAME LOOP
    //--------------------------------------------------
    function loop() {
        requestAnimationFrame(loop);
        if (++count < 25) return;
        count = 0;

        ctx.fillStyle = theme === 'dark' ? "#162626" : "#cfeae7";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Snake
        ctx.fillStyle = theme === 'dark' ? "#40ffff" : "#00a3a3";
        snake.forEach(s =>
            ctx.fillRect(s.x * CELL_WIDTH, s.y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)
        );

        // Food
        ctx.fillStyle = theme === 'dark' ? "#ff4040" : "#ff0000";
        ctx.fillRect(food.x * CELL_WIDTH, food.y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);

        // Motion
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        // Eating
        if (head.x === food.x && head.y === food.y) {
            food = {
                x: Math.floor(Math.random() * GRID_COLS),
                y: Math.floor(Math.random() * GRID_ROWS)
            };
        } else {
            snake.pop();
        }

        // Collision control
        if (
            head.x < 0 || head.x >= GRID_COLS ||
            head.y < 0 || head.y >= GRID_ROWS ||
            snake.slice(1).some(s => s.x === head.x && s.y === head.y)
        ) {
            snake = [{ x: 5, y: 5 }];
            dx = 1; dy = 0;
        }
    }

    loop();
}


// --- PAGE LOAD ---
window.addEventListener("DOMContentLoaded", async () => {
    const initialSection = localStorage.getItem("activeSection") || "cv";

    await loadUILang(currentLang);
    await loadSection(initialSection);
});

})();
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCV8dnsXLS-T0BUEWdPTo7rf_IxnRonI0M",
    authDomain: "pharm-doctordle.firebaseapp.com",
    projectId: "pharm-doctordle",
    storageBucket: "pharm-doctordle.firebasestorage.app",
    messagingSenderId: "954839105609",
    appId: "1:954839105609:web:04c8ba15e1266ec0e47f98"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let gameData = null;
let currentJump = 1;
let tries = 3;
let strikes = 0;
let timeLeft = 100;
let timer;

const input = document.getElementById('antidote-input');
const clueEl = document.getElementById('clue-text');
const timerFill = document.getElementById('timer-fill');
const penguin = document.getElementById('penguin');
const iceCurrent = document.getElementById('ice-current');
const iceNext = document.getElementById('ice-next');

async function startSprint() {
    try {
        const q = query(collection(db, "clinical_drills"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            gameData = querySnapshot.docs[0].data();
            renderClue();
            runTimer();
        } else { clueEl.innerText = "Error: Database Empty."; }
    } catch (e) { clueEl.innerText = "Connection Failed."; }
}

function runTimer() {
    timer = setInterval(() => {
        timeLeft -= 0.15;
        timerFill.style.width = timeLeft + "%";
        if (timeLeft <= 0) endGame("TIME EXPIRED");
    }, 100);
}

function renderClue() {
    clueEl.innerText = gameData[`clue${currentJump}`] || "Sprint Complete.";
    input.value = "";
    input.focus();
}

function executeJump() {
    penguin.classList.add('jumping');
    iceCurrent.style.left = "-300px"; 
    iceNext.style.left = "70px";    

    document.querySelectorAll('.progress-block')[currentJump - 1].classList.add('progress-done');

    setTimeout(() => {
        penguin.classList.remove('jumping');
        iceCurrent.style.transition = "none";
        iceNext.style.transition = "none";
        iceCurrent.style.left = "70px";
        iceNext.style.left = "450px";
        
        // Reset Ice State
        iceCurrent.className = "iceberg";
        iceCurrent.style.filter = "none";
        iceCurrent.style.transform = "rotate(0deg)";
        strikes = 0;

        void iceCurrent.offsetWidth; 
        iceCurrent.style.transition = "left 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s ease, filter 0.4s";
        iceNext.style.transition = "left 0.8s cubic-bezier(0.4, 0, 0.2, 1)";

        currentJump++;
        if (currentJump > 5) victory(); else { renderClue(); tries = 3; updateUI(); }
    }, 800);
}

function applyDamage() {
    strikes++;
    if (strikes === 1) {
        iceCurrent.classList.add('cracked-1');
        iceCurrent.style.transform = "rotate(2deg)";
    } else if (strikes === 2) {
        iceCurrent.classList.add('cracked-2');
        iceCurrent.style.transform = "rotate(-4deg) translateY(5px)";
        iceCurrent.style.filter = "brightness(0.8) saturate(1.5)";
    }
}

function executeFailure() {
    input.disabled = true;
    iceCurrent.classList.add('shatter');
    setTimeout(() => { penguin.classList.add('falling'); }, 100);
    setTimeout(() => { endGame("DIAGNOSTIC FAILURE: Patient Lost"); }, 1200);
}

function updateUI() {
    const dots = document.querySelectorAll('.try-dot');
    dots.forEach((dot, i) => { dot.className = i < tries ? 'try-dot try-on' : 'try-dot'; });
}

function victory() { clearInterval(timer); alert("HOSPITAL REACHED!"); location.reload(); }
function endGame(m) { clearInterval(timer); alert(m); location.reload(); }

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const entry = input.value.toUpperCase().trim();
        const solution = gameData[`answer${currentJump}`].toUpperCase().trim();
        if (entry === solution) {
            executeJump();
        } else {
            tries--;
            timeLeft -= 15;
            updateUI();
            if (tries > 0) {
                applyDamage();
                document.getElementById('game-frame').classList.add('error-shake');
                setTimeout(() => document.getElementById('game-frame').classList.remove('error-shake'), 200);
                input.value = "";
            } else { executeFailure(); }
        }
    }
});

startSprint();
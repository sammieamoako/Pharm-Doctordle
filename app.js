import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- GLOBAL STATE ---
let answerKey = "";
let currentTry = 0;
const MAX_TRIES = 5;
let playerName = localStorage.getItem('pharm_doctordle_user');
let playerEmail = localStorage.getItem('pharm_doctordle_email');
const todayStr = new Date().toISOString().split('T')[0];

// --- 1. IDENTITY & AUTHENTICATION LOGIC ---

async function checkAccess() {
    const nameModal = document.getElementById('name-modal');
    if (!playerName || !playerEmail) {
        nameModal.classList.remove('hidden');
        nameModal.classList.add('flex');
    } else {
        nameModal.classList.add('hidden');
        updateGreeting();
        await checkPreviousPlay();
    }
}

async function handleAuthentication() {
    const nameInput = document.getElementById('player-name-input').value.trim().toUpperCase();
    const emailInput = document.getElementById('player-email-input').value.trim().toLowerCase();
    const startBtn = document.getElementById('start-game-btn');

    if (nameInput.length < 2 || !emailInput.includes('@')) {
        alert("Please enter a valid name and institutional email.");
        return;
    }

    startBtn.disabled = true;
    startBtn.textContent = "Authenticating...";

    try {
        let uniqueName = nameInput;

        // Step A: Check if this EMAIL is already in our system
        const qEmail = query(collection(db, "leaderboard"), where("email", "==", emailInput), limit(1));
        const emailSnap = await getDocs(qEmail);

        if (!emailSnap.empty) {
            // User exists! Retrieve their assigned name
            uniqueName = emailSnap.docs[0].data().name;
        } else {
            // Step B: NEW USER - Check if the NAME is taken
            const qName = query(collection(db, "leaderboard"), where("name", "==", nameInput));
            const nameSnap = await getDocs(qName);
            
            if (!nameSnap.empty) {
                // Name taken, append a random single digit (0-9)
                const randomDigit = Math.floor(Math.random() * 10);
                uniqueName = `${nameInput}${randomDigit}`;
            }
        }

        localStorage.setItem('pharm_doctordle_user', uniqueName);
        localStorage.setItem('pharm_doctordle_email', emailInput);
        
        playerName = uniqueName;
        playerEmail = emailInput;
        
        document.getElementById('name-modal').classList.add('hidden');
        updateGreeting();
        await checkPreviousPlay();

    } catch (e) {
        console.error("Auth Error:", e);
        startBtn.disabled = false;
        startBtn.textContent = "Begin Case";
    }
}

function updateGreeting() {
    const greetingRow = document.getElementById('user-greeting');
    const nameSpan = document.getElementById('display-name');
    if (playerName && greetingRow) {
        nameSpan.textContent = playerName;
        greetingRow.classList.remove('hidden');
    }
}

// --- 2. GAME ENGINE ---

async function calculateRank(userScore) {
    try {
        const q = query(collection(db, "leaderboard"), where("date", "==", todayStr));
        const querySnapshot = await getDocs(q);
        const scores = [];
        querySnapshot.forEach((doc) => scores.push(doc.data().score));
        scores.sort((a, b) => b - a);
        const rank = scores.indexOf(userScore) + 1;
        return rank > 0 ? `#${rank}` : "N/A";
    } catch (e) { return "--"; }
}

async function checkPreviousPlay() {
    const scoreId = `${todayStr}_${playerEmail}`;
    const docRef = doc(db, "leaderboard", scoreId);
    
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            showEndState(data.score);
        } else {
            await initGame();
        }
    } catch (e) { console.error("Database Check Error:", e); }
}

async function initGame() {
    const docRef = doc(db, "cases", todayStr);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('patient-profile').textContent = data.patient_profile;
            document.getElementById('presentation').textContent = data.presentation;
            document.getElementById('labs').textContent = data.labs_diagnostics;
            document.getElementById('mechanism-hint').textContent = data.hint_mechanism;
            document.getElementById('pearl-hint').textContent = data.hint_clinical_pearl;
            document.getElementById('correct-answer-reveal').textContent = data.correct_drug;
            document.getElementById('final-explanation').textContent = data.explanation;
            document.getElementById('game-over-explanation').textContent = data.explanation;
            answerKey = data.clean_drug.toLowerCase();
        } else {
            document.getElementById('patient-profile').textContent = "No rotations assigned for today.";
        }
    } catch (error) { console.error("Case Loading Error:", error); }
}

async function handleGuess() {
    const inputField = document.getElementById('user-guess');
    const userGuess = inputField.value.toLowerCase().trim();
    if (!userGuess || !answerKey) return;

    if (userGuess === answerKey) {
        const finalScore = (MAX_TRIES - currentTry); 
        await saveScore(finalScore);
        showEndState(finalScore);
    } else {
        currentTry++;
        triggerWrongEffect();
        updateGameProgress();
    }
}

async function saveScore(score) {
    const scoreId = `${todayStr}_${playerEmail}`;
    try {
        await setDoc(doc(db, "leaderboard", scoreId), {
            name: playerName,
            email: playerEmail,
            score: score,
            date: todayStr,
            timestamp: new Date()
        });
    } catch (e) { console.error("Score Save Error:", e); }
}

async function updateGameProgress() {
    const attemptsDisplay = document.getElementById('attempts-left');
    if(attemptsDisplay) attemptsDisplay.textContent = `${MAX_TRIES - currentTry} Tries Remaining`;

    if (currentTry === 1) revealSection('labs-section');
    if (currentTry === 2) revealSection('mechanism-section');
    if (currentTry === 3) revealSection('pearl-section');

    if (currentTry >= MAX_TRIES) {
        await saveScore(0);
        showEndState(0);
    }
    document.getElementById('user-guess').value = "";
}

async function showEndState(score) {
    revealAll();
    const userRank = await calculateRank(score);
    document.getElementById('guess-container').classList.add('hidden');
    
    if (score > 0) {
        document.getElementById('results-section').classList.remove('hidden');
        document.getElementById('final-score-display').textContent = score;
        document.getElementById('rank-display').textContent = userRank;
    } else {
        document.getElementById('game-over-section').classList.remove('hidden');
    }
}

function revealSection(id) {
    const section = document.getElementById(id);
    if(section) {
        section.classList.remove('hidden');
        section.classList.add('reveal-hint');
    }
}

function revealAll() {
    ['labs-section', 'mechanism-section', 'pearl-section'].forEach(id => revealSection(id));
}

function triggerWrongEffect() {
    const input = document.getElementById('user-guess');
    if(input) {
        input.classList.add('animate-shake');
        setTimeout(() => input.classList.remove('animate-shake'), 400);
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-game-btn');
    const submitBtn = document.getElementById('submit-btn');
    const guessInput = document.getElementById('user-guess');

    if(startBtn) startBtn.addEventListener('click', handleAuthentication);
    if(submitBtn) submitBtn.addEventListener('click', handleGuess);
    if(guessInput) {
        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleGuess();
        });
    }
    
    // Kick off the initial check
    checkAccess();
});
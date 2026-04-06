import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
let userIP = "";
const todayStr = new Date().toISOString().split('T')[0];

// --- 1. IDENTITY & RANKING LOGIC ---

async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIP = data.ip;
    } catch (e) { console.log("IP fetch failed"); }
}

async function calculateRank(userScore) {
    try {
        const q = query(collection(db, "leaderboard"), where("date", "==", todayStr));
        const querySnapshot = await getDocs(q);
        const scores = [];
        
        querySnapshot.forEach((doc) => {
            scores.push(doc.data().score);
        });

        // Sort scores descending
        scores.sort((a, b) => b - a);
        
        // Find position (1-based index)
        const rank = scores.indexOf(userScore) + 1;
        return rank > 0 ? `#${rank}` : "N/A";
    } catch (e) {
        console.error("Rank Error:", e);
        return "--";
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

async function checkAccess() {
    const nameModal = document.getElementById('name-modal');
    if (!playerName) {
        nameModal.classList.remove('hidden');
        nameModal.classList.add('flex');
    } else {
        nameModal.classList.add('hidden');
        updateGreeting();
        await checkPreviousPlay();
    }
}

async function checkPreviousPlay() {
    const scoreId = `${todayStr}_${playerName}`;
    const docRef = doc(db, "leaderboard", scoreId);
    
    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const userRank = await calculateRank(data.score);
            
            // UI updates for returning user
            document.getElementById('guess-container').classList.add('hidden');
            document.getElementById('final-score-display').textContent = data.score;
            document.getElementById('rank-display').textContent = userRank;
            document.getElementById('patient-profile').textContent = `Rotation Complete, Dr. ${playerName}.`;
            
            revealAll();
            
            // Show result section and fetch explanation
            const resultsSection = document.getElementById('results-section');
            const gameOverSection = document.getElementById('game-over-section');
            
            if (data.score > 0) {
                resultsSection.classList.remove('hidden');
            } else {
                gameOverSection.classList.remove('hidden');
            }

            // Get case details to show explanation
            const caseSnap = await getDoc(doc(db, "cases", todayStr));
            if (caseSnap.exists()) {
                const explanation = caseSnap.data().explanation;
                const expField = data.score > 0 ? 'final-explanation' : 'game-over-explanation';
                document.getElementById(expField).textContent = explanation;
                if (data.score === 0) {
                    document.getElementById('correct-answer-reveal').textContent = caseSnap.data().correct_drug;
                }
            }
        } else {
            initGame();
        }
    } catch (e) { console.error("Access Check Error:", e); }
}

// --- 2. GAME ENGINE ---

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
            
            // Set dynamic explanations for end-game
            document.getElementById('final-explanation').textContent = data.explanation;
            document.getElementById('game-over-explanation').textContent = data.explanation;
            
            answerKey = data.clean_drug.toLowerCase();
        } else {
            document.getElementById('patient-profile').textContent = "No clinical case for today.";
        }
    } catch (error) { console.error("Firebase Error:", error); }
}

async function handleGuess() {
    const inputField = document.getElementById('user-guess');
    const userGuess = inputField.value.toLowerCase().trim();

    if (userGuess === "") return;

    if (userGuess === answerKey) {
        const finalScore = (MAX_TRIES - currentTry); 
        await saveScore(finalScore);
        showWinState(finalScore);
    } else {
        currentTry++;
        triggerWrongEffect();
        updateGameProgress();
    }
}

async function saveScore(score) {
    const scoreId = `${todayStr}_${playerName}`;
    try {
        await setDoc(doc(db, "leaderboard", scoreId), {
            name: playerName,
            score: score,
            date: todayStr,
            ip: userIP,
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
        document.getElementById('guess-container').classList.add('hidden');
        document.getElementById('game-over-section').classList.remove('hidden');
        revealAll();
    }
    document.getElementById('user-guess').value = "";
}

function revealSection(id) {
    const section = document.getElementById(id);
    if(section) {
        section.classList.remove('hidden');
        section.classList.add('reveal-hint');
    }
}

function revealAll() {
    revealSection('labs-section');
    revealSection('mechanism-section');
    revealSection('pearl-section');
}

async function showWinState(score) {
    revealAll();
    document.getElementById('final-score-display').textContent = score;
    const userRank = await calculateRank(score);
    document.getElementById('rank-display').textContent = userRank;
    
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('guess-container').classList.add('hidden');
}

function triggerWrongEffect() {
    const input = document.getElementById('user-guess');
    input.classList.add('animate-shake');
    setTimeout(() => input.classList.remove('animate-shake'), 400);
}

// --- EVENT LISTENERS ---

document.getElementById('start-game-btn').addEventListener('click', () => {
    const input = document.getElementById('player-name-input');
    if (input.value.trim().length > 1) {
        playerName = input.value.trim().toUpperCase();
        localStorage.setItem('pharm_doctordle_user', playerName);
        document.getElementById('name-modal').classList.add('hidden');
        updateGreeting();
        checkPreviousPlay();
    } else {
        alert("Enter your name to begin rotation.");
    }
});

document.getElementById('submit-btn').addEventListener('click', handleGuess);

// Allow "Enter" key to submit
document.getElementById('user-guess').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});

// --- INITIALIZE ---
getIP();
checkAccess();
document.getElementById('submit-btn').addEventListener('click', handleGuess);
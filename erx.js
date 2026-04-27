import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- CONFIGURATION ---
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

// --- AR ECG ENGINE ---
const generateECGPath = (state) => {
    const base = 30;
    if (state === 'FLATLINE') return `M0,${base} L400,${base}`;
    
    let x = 0;
    let path = `M0,${base}`;
    const heartBeat = (xOff, height) => [
        [xOff + 5, base - 2], [xOff + 10, base], [xOff + 12, base + 5],
        [xOff + 15, base - height], [xOff + 18, base + 10],
        [xOff + 22, base], [xOff + 30, base - 5], [xOff + 40, base]
    ];

    while (x < 400) {
        const beat = heartBeat(x, state === 'NORMAL' ? 22 : 42);
        beat.forEach(p => { path += ` L${p[0]},${p[1]}`; });
        x += (state === 'NORMAL' ? 80 : 35);
    }
    return path;
};

// --- GAME STATE ---
let game = {
    answer: "", 
    guessed: [], 
    misses: 0, 
    maxMisses: 5,
    timer: 30, 
    active: false, 
    today: new Date().toISOString().split('T')[0],
    playerName: "", 
    playerEmail: "",
    clockInterval: null
};

const audio = new (window.AudioContext || window.webkitAudioContext)();
const playSfx = (freq, dur, vol) => {
    try {
        const o = audio.createOscillator(); const g = audio.createGain();
        o.connect(g); g.connect(audio.destination);
        o.frequency.value = freq; g.gain.value = vol;
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
        o.start(); o.stop(audio.currentTime + dur);
    } catch(e) {} 
};

// --- AUTHENTICATION ---
document.getElementById('checkin-btn').onclick = async () => {
    const name = document.getElementById('user-name').value.trim().toUpperCase();
    const email = document.getElementById('user-email').value.trim().toLowerCase();
    
    if (!name || !email) return;

    const userKey = email.replace(/[^a-zA-Z0-9]/g, "_");
    try {
        await setDoc(doc(db, "users", userKey), { 
            username: name, 
            email, 
            lastRotation: new Date() 
        }, { merge: true });
        
        game.playerName = name;
        game.playerEmail = email;
        document.getElementById('login-modal').classList.add('hidden');
        initRotation();
    } catch (err) {
        console.error("Link Failed", err);
    }
};

// --- CORE CLINICAL FLOW ---
async function initRotation() {
    const snap = await getDoc(doc(db, "erx_cases", game.today));
    if (snap.exists()) {
        const data = snap.data();
        game.answer = data.clean_drug.toUpperCase();
        document.getElementById('presentation').textContent = data.presentation;
        
        game.active = true;
        renderHUD();
        updateVitals('HIT'); // Sets healthy starting rhythm
        startTriageTimer();
    } else {
        document.getElementById('presentation').textContent = "SYSTEM ERROR: No patient queue data.";
    }
}

function updateVitals(status) {
    const wave = document.getElementById('ecg-wave');
    const bpm = document.getElementById('bpm');
    const fluid = document.getElementById('iv-fluid');
    const drop = document.getElementById('drop');
    const monitor = document.getElementById('vitals-monitor');

    // Update the IV Drip "Stake"
    const fluidRemaining = 100 - (game.misses * 20);
    fluid.style.height = `${Math.max(0, fluidRemaining)}%`;
    
    // Increase drip speed as situation deteriorates
    drop.style.animationDuration = game.misses > 3 ? '0.4s' : '1.2s';

    if (status === 'HIT') {
        wave.setAttribute('d', generateECGPath('NORMAL'));
        wave.style.stroke = "#3b82f6"; // Luminous Blue
        bpm.innerText = Math.max(60, 80 - (game.guessed.length));
        monitor.classList.remove('panic-state');
    } else {
        // Clinical Shock: Flatline for 300ms
        wave.setAttribute('d', generateECGPath('FLATLINE'));
        wave.style.stroke = "#f43f5e";
        bpm.innerText = "00";
        
        setTimeout(() => {
            if (!game.active) return;
            wave.setAttribute('d', generateECGPath('ARRHYTHMIA'));
            bpm.innerText = (120 + (game.misses * 12)).toString();
            monitor.classList.add('panic-state');
        }, 300);
    }
}

function renderHUD() {
    const wordArea = document.getElementById('word-display');
    const kbArea = document.getElementById('keyboard');

    wordArea.innerHTML = game.answer.split('').map(char => `
        <div class="pill-slot ${game.guessed.includes(char) ? 'revealed' : ''}">
            ${game.guessed.includes(char) ? char : ''}
        </div>
    `).join('');

    kbArea.innerHTML = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(letter => {
        let style = "";
        if (game.guessed.includes(letter)) {
            style = game.answer.includes(letter) ? "hit" : "miss";
        }
        return `<button class="key ${style}">${letter}</button>`;
    }).join('');

    document.querySelectorAll('.key').forEach(btn => {
        btn.onclick = () => {
            const letter = btn.innerText;
            if (!game.active || game.guessed.includes(letter)) return;
            
            game.guessed.push(letter);
            if (game.answer.includes(letter)) {
                playSfx(900, 0.1, 0.04);
                updateVitals('HIT');
            } else {
                game.misses++;
                playSfx(180, 0.4, 0.08);
                updateVitals('MISS');
                if (game.misses >= game.maxMisses) triggerEnd(false);
            }
            renderHUD();
            if (game.answer.split('').every(c => game.guessed.includes(c))) triggerEnd(true);
        };
    });
}

function startTriageTimer() {
    if (game.clockInterval) clearInterval(game.clockInterval);
    
    game.clockInterval = setInterval(() => {
        if (!game.active) {
            clearInterval(game.clockInterval);
            return;
        }

        game.timer = Math.max(0, game.timer - 1);
        document.getElementById('timer').innerText = `00:${game.timer.toString().padStart(2, '0')}`;

        // Urgent Audio feedback
        if (game.timer < 10 && game.timer > 0) {
            playSfx(1400, 0.02, 0.03);
        }

        if (game.timer === 0) {
            game.misses++;
            updateVitals('MISS');
            game.timer = 15; // Penalty reset
            if (game.misses >= game.maxMisses) triggerEnd(false);
            renderHUD();
        } else {
            playSfx(550, 0.05, 0.01);
        }
    }, 1000);
}

async function triggerEnd(win) {
    game.active = false;
    clearInterval(game.clockInterval);
    
    const wave = document.getElementById('ecg-wave');
    wave.setAttribute('d', generateECGPath(win ? 'NORMAL' : 'FLATLINE'));
    wave.style.stroke = win ? "#10b981" : "#475569";
    
    document.getElementById('outcome').classList.remove('hidden');
    document.getElementById('outcome-title').innerText = win ? "Stabilized" : "Expired";
    document.getElementById('outcome-title').style.color = win ? "#059669" : "#be123c";
    document.getElementById('outcome-desc').innerText = win ? "Diagnosis Verified" : `Protocol Failed. Correct: ${game.answer}`;
    
    const score = win ? (game.maxMisses - game.misses) * 100 : 0;
    document.getElementById('final-score').innerText = score;

    // Optional: Log score to Firebase here...
}
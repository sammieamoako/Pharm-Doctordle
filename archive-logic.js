import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let allCases = [];
let currentIndex = 0;
let currentAnswer = "";
let currentTry = 0;
const MAX_TRIES = 5;

// 1. Fetch Archives
async function fetchArchives() {
    try {
        const querySnapshot = await getDocs(collection(db, "cases"));
        const today = new Date().toISOString().split('T')[0];
        let fetchedCases = [];

        querySnapshot.forEach((doc) => {
            if (doc.id <= today) {
                fetchedCases.push({ id: doc.id, ...doc.data() });
            }
        });

        // Sort: Newest first
        allCases = fetchedCases.sort((a, b) => b.id.localeCompare(a.id));

        if (allCases.length > 0) {
            displayCase(0);
        }
    } catch (error) {
        console.error("Archive Error:", error);
    }
}

// 2. Display Case & Reset Logic
function displayCase(index) {
    const data = allCases[index];
    
    // Core Data Reset
    currentTry = 0; 
    currentAnswer = data.clean_drug.toLowerCase();

    // UI Updates
    document.getElementById('archive-date').textContent = `CASE DATE: ${data.id}`;
    document.getElementById('patient-profile').textContent = data.patient_profile;
    document.getElementById('presentation').textContent = data.presentation;
    
    // Inject Hint Text (but keep sections hidden)
    document.getElementById('labs').textContent = data.labs_diagnostics;
    // Note: Ensure these IDs exist in your Archive HTML as well
    if(document.getElementById('mechanism-hint')) document.getElementById('mechanism-hint').textContent = data.hint_mechanism;
    if(document.getElementById('pearl-hint')) document.getElementById('pearl-hint').textContent = data.hint_clinical_pearl;

    // Reset Visibility
    document.getElementById('labs-section').classList.add('hidden');
    if(document.getElementById('mechanism-section')) document.getElementById('mechanism-section').classList.add('hidden');
    if(document.getElementById('pearl-section')) document.getElementById('pearl-section').classList.add('hidden');
    
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('guess-container').classList.remove('hidden');
    document.getElementById('user-guess').value = "";
}

// 3. Progressive Reveal Logic
document.getElementById('submit-btn').addEventListener('click', () => {
    const inputField = document.getElementById('user-guess');
    const guess = inputField.value.toLowerCase().trim();

    if (guess === currentAnswer) {
        revealAll();
        document.getElementById('results-section').classList.remove('hidden');
        document.getElementById('guess-container').classList.add('hidden');
    } else {
        currentTry++;
        
        // Shake feedback
        inputField.classList.add('animate-shake');
        setTimeout(() => inputField.classList.remove('animate-shake'), 400);
        inputField.value = "";

        // The "Wordle" Reveal Logic
        if (currentTry === 1) {
            document.getElementById('labs-section').classList.remove('hidden');
        } else if (currentTry === 2) {
            if(document.getElementById('mechanism-section')) document.getElementById('mechanism-section').classList.remove('hidden');
        } else if (currentTry === 3) {
            if(document.getElementById('pearl-section')) document.getElementById('pearl-section').classList.remove('hidden');
        }

        // Game Over
        if (currentTry >= MAX_TRIES) {
            revealAll();
            document.getElementById('guess-container').classList.add('hidden');
            alert(`Case Closed. The correct drug was ${allCases[currentIndex].correct_drug}.`);
        }
    }
});

function revealAll() {
    document.getElementById('labs-section').classList.remove('hidden');
    if(document.getElementById('mechanism-section')) document.getElementById('mechanism-section').classList.remove('hidden');
    if(document.getElementById('pearl-section')) document.getElementById('pearl-section').classList.remove('hidden');
}

// 4. Navigation
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex < allCases.length - 1) {
        currentIndex++;
        displayCase(currentIndex);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        displayCase(currentIndex);
    }
});

fetchArchives();
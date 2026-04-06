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

async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-list');
    
    try {
        const querySnapshot = await getDocs(collection(db, "leaderboard"));
        const totals = {};

        // 1. Group scores by name
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!totals[data.name]) {
                totals[data.name] = 0;
            }
            totals[data.name] += data.score;
        });

        // 2. Convert to array and sort by total score (Highest first)
        const sortedScores = Object.entries(totals)
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => b.score - a.score);

        // 3. Render the UI
        leaderboardContainer.innerHTML = ""; // Clear loader

        if (sortedScores.length === 0) {
            leaderboardContainer.innerHTML = `<p class="text-center text-slate-400">No clinical data recorded yet.</p>`;
            return;
        }

        sortedScores.forEach((player, index) => {
            const rank = index + 1;
            let medal = "🩺";
            if (rank === 1) medal = "🥇";
            if (rank === 2) medal = "🥈";
            if (rank === 3) medal = "🥉";

            const row = document.createElement('div');
            row.className = "flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:scale-[1.02]";
            row.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="text-lg">${medal}</span>
                    <div>
                        <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest">Rank #${rank}</p>
                        <p class="font-bold text-slate-800 tracking-tight">${player.name}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-black text-slate-900 leading-none">${player.score}</p>
                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
                </div>
            `;
            leaderboardContainer.appendChild(row);
        });

    } catch (error) {
        console.error("Leaderboard Error:", error);
        leaderboardContainer.innerHTML = `<p class="text-center text-rose-500 font-bold">Error loading records.</p>`;
    }
}

loadLeaderboard();
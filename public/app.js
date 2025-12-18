// --- Speech to Text ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "vi-VN";
recognition.continuous = true;

const input = document.getElementById("input");
const status = document.getElementById("status");
const chat = document.getElementById("chat");

// Start recording
document.getElementById("start").onclick = () => {
    recognition.start();
    status.innerHTML = `Status: <i class="fa-solid fa-microphone-lines fa-beat-fade"></i>`;
};

//Stop recording + stop speaking
document.getElementById("stop").onclick = () => {
    recognition.stop();
    speechSynthesis.cancel();
    currentUtterance = null;
    status.innerHTML = `Status: <i class="fa-solid fa-moon"></i>`;
};

//Transcript speech to text
recognition.onresult = (event) => {
    let text = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
    }
    input.value = text.trim();
};

//Send the text to AI
document.getElementById("btnSend").onclick = () => {
    const text = input.value.trim();
    if (text) sendToAI(text);
};

async function sendToAI(text) {
    const msgUser = document.createElement("div");
    msgUser.className = "msg user";
    msgUser.textContent = text;

    //add message to the chatbox
    chat.appendChild(msgUser);

    const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: text, lang: "en" })
    });

    const data = await res.json();
    console.log(data);

    const reply = data.reply || "AI: No response.";
    const msgAI = document.createElement("div");
    msgAI.className = "msg ai";

    msgAI.innerHTML = formatAIReply(reply);

    //Start text to speech
    let currentUtterance = null;
    currentUtterance = new SpeechSynthesisUtterance(reply);
    currentUtterance.lang = "en-US";
    speechSynthesis.speak(currentUtterance);

    //add message to the chatbox
    chat.appendChild(msgAI);
}

//Start text to speech on specific graph
document.getElementById("btnSpeak").onclick = () => {
    const ttsText = document.getElementById("ttsInput").value.trim();
    if (!ttsText) return;
    speakWord(ttsText);
};

//format res function
function formatAIReply(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    let lines = text.split(/\n+/);

    let html = "";
    let inList = false;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        const match = line.match(/^(\d+)\.\s+(.*)$/);

        if (match) {
            if (!inList) {
                html += "<ol>";
                inList = true;
            }
            html += `<li>${match[2]}</li>`;
        } else {
            if (inList) {
                html += "</ol>";
                inList = false;
            }
            html += `<p>${line}</p>`;
        }
    });

    if (inList) html += "</ol>";

    return html;
}

//speak function 
function speakWord(word) {
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = 'en-US';
    speechSynthesis.speak(utter);
}

document.getElementById("dictBtn").addEventListener("click", async () => {
    const word = document.getElementById("dictInput").value.trim();
    const resultDiv = document.getElementById("dictResult");

    if (!word) {
        resultDiv.innerHTML = "<p>Please enter a word.</p>";
        return;
    }

    resultDiv.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
            resultDiv.innerHTML = "<p>Word not found.</p>";
            return;
        }

        const meanings = data[0].meanings;
        const phonetic = data[0].phonetics.find(p => p.text)?.text || "N/A";

        let html = `<h4>${word}<i class="fa-solid fa-volume-high speak-icon" 
                   style="cursor:pointer; margin-left:10px;" 
                   onclick="speakWord('${word}')"></i></h4>
                   <p><b>Phonetic:</b> ${phonetic}</p>
                   `;

        meanings.forEach(m => {
            html += ` <hr>               
                <p><b>Part of Speech:</b> ${m.partOfSpeech}</p>
                <p><b>Definition:</b> ${m.definitions[0].definition}</p>                
            `;
        });

        resultDiv.innerHTML = html;

    } catch (err) {
        resultDiv.innerHTML = "<p>Error fetching data.</p>";
    }
});
// Initialize data storage
let historyData = JSON.parse(localStorage.getItem('history')) || [];
let streak = localStorage.getItem('streak') || 0;
let lastDate = localStorage.getItem('lastDate') || null;
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let chartInstance = null;

// Load history and streak on page load
document.addEventListener('DOMContentLoaded', () => {
    updateHistory();
    updateStreak();
});

// Save trigger and provide AI suggestion
function saveTrigger() {
    const trigger = document.getElementById('trigger').value;
    const tag = document.getElementById('tag').value;
    const mood = document.getElementById('mood').value;
    if (trigger) {
        const entry = { trigger, tag, mood, date: new Date().toLocaleString() };
        historyData.push(entry);
        localStorage.setItem('history', JSON.stringify(historyData));
        updateHistory();
        document.getElementById('trigger').value = '';
        provideSuggestion(trigger, tag, mood);
        updateMoodData(mood);
    }
}

function provideSuggestion(trigger, tag, mood) {
    let suggestion = '';
    switch (mood) {
        case 'happy':
            suggestion = `Great to hear you're happy! Keep it up by sharing positivity today. How about a quick gratitude exercise?`;
            break;
        case 'anxious':
            suggestion = `Feeling anxious about ${tag}? Take 5 deep breaths and focus on something you can control right now. Want to try guided breathing?`;
            break;
        case 'tired':
            suggestion = `Exhausted from ${tag}? Rest is key—try a 1-minute breathing exercise or check out sleep tips below.`;
            break;
        case 'angry':
            suggestion = `Upset about ${tag}? Let’s channel that energy—try a quick walk or a breathing session to cool off.`;
            break;
        case 'calm':
            suggestion = `You’re feeling calm—perfect! How about maintaining it with some forest sounds or a mindfulness moment?`;
            break;
    }
    document.getElementById('suggestion').textContent = suggestion;
}

// Guided breathing exercise
function startBreathing() {
    const duration = parseInt(document.getElementById('breathing-duration').value);
    const soundToggle = document.getElementById('sound-toggle').checked;
    const timer = document.getElementById('timer');
    let timeLeft = duration;
    timer.textContent = `Breathe... (${timeLeft}s)`;

    if (soundToggle) document.getElementById('wave-sound').play();
    const interval = setInterval(() => {
        timeLeft--;
        timer.textContent = `Breathe... (${timeLeft}s)`;
        if (timeLeft <= 0) {
            clearInterval(interval);
            timer.textContent = 'Well done!';
            if (soundToggle) document.getElementById('wave-sound').pause();
        }
    }, 1000);
}

// Sleep tips
function showSleepTips() {
    const tips = [
        'Stick to a consistent sleep schedule.',
        'Avoid screens 1 hour before bed.',
        'Try a relaxing sound like rainfall.',
        'Keep your room cool and dark.'
    ];
    document.getElementById('sleep-tips').textContent = tips[Math.floor(Math.random() * tips.length)];
}

// Background sound control
function playBackgroundSound() {
    const sound = document.getElementById('bg-sound').value;
    stopBackgroundSound();
    document.getElementById(`${sound}-sound`).play();
}

function stopBackgroundSound() {
    document.querySelectorAll('audio').forEach(audio => audio.pause());
}

// Live AI Chat
function sendMessage() {
    const input = document.getElementById('chat-input').value;
    const fileInput = document.getElementById('chat-file');
    const chatBox = document.getElementById('chat-box');
    
    if (input || fileInput.files.length > 0) {
        const userMessage = document.createElement('p');
        userMessage.className = 'user-message';
        userMessage.textContent = input || 'Attached a file';
        chatBox.appendChild(userMessage);

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.maxWidth = '200px';
                chatBox.appendChild(img);
            } else if (file.type.startsWith('audio/')) {
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = URL.createObjectURL(file);
                chatBox.appendChild(audio);
            }
        }

        const aiResponse = document.createElement('p');
        aiResponse.className = 'ai-message';
        aiResponse.textContent = generateAIResponse(input, fileInput.files[0]);
        chatBox.appendChild(aiResponse);

        document.getElementById('chat-input').value = '';
        fileInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function generateAIResponse(input, file) {
    if (file) {
        if (file.type.startsWith('image/')) return `I see your image! How does this relate to your day? Let’s work through it together.`;
        if (file.type.startsWith('audio/')) return `Thanks for the voice note! I’ll listen—tell me more about what’s going on.`;
    }
    if (!input) return 'Tell me more—what’s on your mind?';
    
    if (input.toLowerCase().includes('stress')) return `Stress can be tough. Try this: inhale for 4, hold for 4, exhale for 4. How’s that feel?`;
    if (input.toLowerCase().includes('sleep')) return `Struggling with sleep? Dim the lights, play some rain sounds, and avoid caffeine after 3 PM. Need more tips?`;
    return `I’m here for you! You said: "${input}". What’s one small step you can take now to feel better?`;
}

// Mood chart
function updateMoodData(mood) {
    const date = new Date().toLocaleDateString();
    moodData[date] = moodData[date] || {};
    moodData[date][mood] = (moodData[date][mood] || 0) + 1;
    localStorage.setItem('moodData', JSON.stringify(moodData));
}

function showMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    const labels = Object.keys(moodData);
    const moods = ['happy', 'anxious', 'tired', 'angry', 'calm'];
    const datasets = moods.map(mood => ({
        label: mood,
        data: labels.map(date => moodData[date][mood] || 0),
        backgroundColor: `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`
    }));

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: { scales: { y: { beginAtZero: true } } }
    });
}

// History and sharing
function updateHistory() {
    const historyList = document.getElementById('history');
    historyList.innerHTML = '';
    historyData.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.trigger} (${entry.tag}, ${entry.mood})`;
        historyList.appendChild(li);
    });
}

function downloadHistory() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyData));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'calmcompass_history.json');
    a.click();
}

function shareHistory() {
    const text = historyData.map(entry => `${entry.date}: ${entry.trigger} (${entry.tag}, ${entry.mood})`).join('\n');
    if (navigator.share) {
        navigator.share({
            title: 'My CalmCompass Journey',
            text: text,
            url: window.location.href
        }).catch(err => alert('Sharing failed: ' + err));
    } else {
        alert('Copy this to share:\n' + text);
    }
}

// Streak and reminders
function updateStreak() {
    const today = new Date().toLocaleDateString();
    if (lastDate && lastDate !== today) {
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString();
        if (lastDate === yesterday) streak++;
        else streak = 1;
    }
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastDate', today);
    document.getElementById('streak').textContent = `Streak: ${streak} days`;
}

function toggleReminder() {
    const enabled = document.getElementById('daily-reminder').checked;
    if (enabled) {
        setInterval(() => {
            document.getElementById('daily-tip').textContent = 'Take a moment to breathe and reflect!';
        }, 24 * 60 * 60 * 1000);
    }
}

// Background sound control
let currentAudio = null;

function playBackgroundSound() {
    const sound = document.getElementById('bg-sound').value;
    stopBackgroundSound();
    currentAudio = document.getElementById(`${sound}-sound`);
    currentAudio.play().catch(err => console.log("Audio play failed:", err));
}

function stopBackgroundSound() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
}

function changeBackground() {
    const bgImage = document.getElementById('bg-image').value;
    const backgrounds = {
        nature1: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        nature2: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        nature3: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        nature4: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99'
    };
    document.body.style.backgroundImage = `url('${backgrounds[bgImage]}')`;
}

function adjustResponseSpeed() {
    const speed = document.getElementById('response-speed').value;
    const delays = { fast: 500, normal: 1000, slow: 2000 };
    return delays[speed];
}

// Example usage in sendMessage (AI Chat response delay)
function sendMessage() {
    const input = document.getElementById('chat-input').value;
    const chatBox = document.getElementById('chat-box');
    if (input) {
        const userMessage = document.createElement('p');
        userMessage.className = 'user-message';
        userMessage.textContent = input;
        chatBox.appendChild(userMessage);

        setTimeout(() => {
            const aiResponse = document.createElement('p');
            aiResponse.className = 'ai-message';
            aiResponse.textContent = generateAIResponse(input);
            chatBox.appendChild(aiResponse);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, adjustResponseSpeed());

        document.getElementById('chat-input').value = '';
    }
}

let users = JSON.parse(localStorage.getItem('users')) || {};

function showAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('auth-form');
    modal.style.display = 'block';
    title.textContent = type === 'login' ? 'Login' : 'Signup';
    form.onsubmit = type === 'login' ? handleLogin : handleSignup;
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('auth-message').textContent = '';
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (users[username] && users[username].password === password) {
        document.getElementById('auth-message').textContent = 'Login successful!';
        setTimeout(closeAuthModal, 1000);
    } else {
        document.getElementById('auth-message').textContent = 'Invalid credentials.';
    }
}

function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!users[username]) {
        users[username] = { password };
        localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('auth-message').textContent = 'Signup successful! Please login.';
    } else {
        document.getElementById('auth-message').textContent = 'Username already exists.';
    }
}

function showForgotPassword() {
    const username = prompt('Enter your username:');
    if (users[username]) {
        alert(`Your password is: ${users[username].password}`);
    } else {
        alert('Username not found.');
    }
}

function sendInvite() {
    const email = document.getElementById('invite-email').value;
    if (email) {
        const inviteLink = `${window.location.href}?ref=${Math.random().toString(36).substr(2, 9)}`;
        if (navigator.share) {
            navigator.share({
                title: 'Join CalmCompass!',
                text: `Hey! Join me on CalmCompass to navigate a healthier life: ${inviteLink}`,
                url: inviteLink
            }).catch(err => alert('Invite failed: ' + err));
        } else {
            alert(`Invite your friend with this link: ${inviteLink}`);
        }
        document.getElementById('invite-email').value = '';
    } else {
        alert('Please enter an email address.');
    }
}
// DOM Elements
const heroContainer = document.getElementById('hero-container');
const chatDisplay = document.getElementById('chat-display');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const searchWrapper = document.querySelector('.search-wrapper');

let isChatMode = false;

// Interaction Logic
function setInput(text) {
    userInput.value = text;
    handleSend();
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (!isChatMode) {
        enterChatMode();
    }

    // Add User Message
    addMessage(text, 'user');
    userInput.value = '';

    // Loading State
    const loadingId = addLoadingIndicator();

    // API Call
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();

        removeMessage(loadingId);

        if (data.error) {
            addMessage("I encountered an error connecting to my brain.", "bot");
        } else {
            addMessage(data.response, "bot");
        }

    } catch (e) {
        removeMessage(loadingId);
        addMessage("Connection failure. Please check your network.", "bot");
    }
}

function enterChatMode() {
    isChatMode = true;
    heroContainer.classList.add('chat-mode');
    chatDisplay.style.display = 'flex';

    // Move search bar to bottom properly
    // We clone it to avoid layout jumps or just style it
    document.querySelector('.search-wrapper').classList.add('search-fixed-bottom');
    document.querySelector('.suggestions').style.display = 'none'; // Hide suggestions in chat mode
}

function addMessage(text, type) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(type === 'user' ? 'user-message' : 'bot-message');

    if (type === 'bot') {
        const contentBox = document.createElement('div');
        contentBox.classList.add('bot-content-box');
        contentBox.innerHTML = marked.parse(text);
        div.appendChild(contentBox);
    } else {
        div.textContent = text;
    }

    chatDisplay.appendChild(div);
    // Scroll to new message
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    return div.id = 'msg-' + Date.now();
}

function addLoadingIndicator() {
    const div = document.createElement('div');
    div.classList.add('message', 'bot-message');
    div.innerHTML = `
        <div class="bot-content-box">
            <i class="fa-solid fa-circle-notch fa-spin" style="color: var(--accent-glow)"></i> Computing...
        </div>
    `;
    chatDisplay.appendChild(div);
    return div.id = 'loading-' + Date.now();
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Particle Background Animation
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let connectionDistance = 150;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = 'rgba(100, 150, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < 60; i++) particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connect particles
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
                ctx.strokeStyle = `rgba(100, 150, 255, ${1 - dist / connectionDistance})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

initParticles();
animate();

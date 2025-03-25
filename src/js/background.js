const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let particles = [];

// Setup canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle class for background effect
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Wrap around canvas
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Create particles and handle window resize
function initParticles() {
  particles = [];
  const particleCount = Math.min(
    100,
    Math.floor((canvas.width * canvas.height) / 8000)
  );

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

// Handle window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animate);
}

// Initialize and start animation
initParticles();
animate();

// Function to create a shooting star effect occasionally
function createShootingStar() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const startX = Math.random() * canvas.width;
  const startY = (Math.random() * canvas.height) / 3; // Top third of screen
  const length = Math.random() * 150 + 100;
  const angle = Math.PI / 4; // 45 degrees downward

  const endX = startX + Math.cos(angle) * length;
  const endY = startY + Math.sin(angle) * length;

  // Draw shooting star
  const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fade out
  setTimeout(() => {
    // The shooting star will naturally fade with the existing canvas clearing
  }, 300);
}

// Create occasional shooting stars
setInterval(() => {
  // 15% chance of creating a shooting star each interval
  if (Math.random() < 0.15) {
    createShootingStar();
  }
}, 2000);

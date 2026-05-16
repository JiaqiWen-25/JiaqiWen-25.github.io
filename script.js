const canvas = document.querySelector("#research-canvas");
const ctx = canvas.getContext("2d");
const progress = document.querySelector(".progress");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const nodes = [];

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function seedNodes() {
  nodes.length = 0;
  const count = Math.max(34, Math.min(74, Math.floor(window.innerWidth / 22)));
  for (let index = 0; index < count; index += 1) {
    nodes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 1.1
    });
  }
}

function drawNetwork() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "rgba(13, 124, 134, 0.32)";
  ctx.strokeStyle = "rgba(13, 124, 134, 0.12)";
  ctx.lineWidth = 1;

  nodes.forEach((node, index) => {
    if (!reduceMotion) {
      node.x += node.vx;
      node.y += node.vy;
    }
    if (node.x < -20) node.x = window.innerWidth + 20;
    if (node.x > window.innerWidth + 20) node.x = -20;
    if (node.y < -20) node.y = window.innerHeight + 20;
    if (node.y > window.innerHeight + 20) node.y = -20;

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();

    for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
      const other = nodes[nextIndex];
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 128) {
        ctx.globalAlpha = 1 - distance / 128;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });

  if (!reduceMotion) requestAnimationFrame(drawNetwork);
}

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const width = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${width}%`;
}

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".publication").forEach(publication => {
      const tags = publication.dataset.tags.split(" ");
      publication.classList.toggle("hidden", filter !== "all" && !tags.includes(filter));
    });
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", () => {
  resizeCanvas();
  seedNodes();
  if (reduceMotion) drawNetwork();
});

resizeCanvas();
seedNodes();
drawNetwork();
updateProgress();

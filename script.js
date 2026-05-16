const canvas = document.querySelector("#research-canvas");
const ctx = canvas.getContext("2d");
const progress = document.querySelector(".progress");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const nodes = [];
const streams = [];
const pointer = {
  x: window.innerWidth * 0.72,
  y: window.innerHeight * 0.28,
  active: false
};

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
  streams.length = 0;
  const count = Math.max(48, Math.min(110, Math.floor(window.innerWidth / 16)));
  for (let index = 0; index < count; index += 1) {
    nodes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.46,
      vy: (Math.random() - 0.5) * 0.46,
      r: Math.random() * 2.1 + 0.9,
      hue: index % 3
    });
  }

  const streamCount = Math.max(5, Math.min(9, Math.floor(window.innerWidth / 180)));
  for (let index = 0; index < streamCount; index += 1) {
    streams.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: Math.random() * 180 + 180,
      speed: Math.random() * 0.85 + 0.45,
      alpha: Math.random() * 0.16 + 0.08
    });
  }
}

function drawNetwork() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const width = window.innerWidth;
  const height = window.innerHeight;

  const wash = ctx.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, "rgba(13, 124, 134, 0.04)");
  wash.addColorStop(0.48, "rgba(255, 255, 255, 0.02)");
  wash.addColorStop(1, "rgba(200, 90, 60, 0.035)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  streams.forEach(stream => {
    if (!reduceMotion) {
      stream.x += stream.speed;
      stream.y -= stream.speed * 0.36;
    }
    if (stream.x - stream.length > width || stream.y + stream.length < 0) {
      stream.x = -stream.length;
      stream.y = Math.random() * (height + stream.length);
    }

    const beam = ctx.createLinearGradient(
      stream.x,
      stream.y,
      stream.x + stream.length,
      stream.y - stream.length * 0.34
    );
    beam.addColorStop(0, "rgba(13, 124, 134, 0)");
    beam.addColorStop(0.5, `rgba(13, 124, 134, ${stream.alpha})`);
    beam.addColorStop(1, "rgba(200, 90, 60, 0)");
    ctx.strokeStyle = beam;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(stream.x, stream.y);
    ctx.lineTo(stream.x + stream.length, stream.y - stream.length * 0.34);
    ctx.stroke();
  });

  nodes.forEach((node, index) => {
    if (!reduceMotion) {
      const dxPointer = pointer.x - node.x;
      const dyPointer = pointer.y - node.y;
      const pointerDistance = Math.sqrt(dxPointer * dxPointer + dyPointer * dyPointer);
      if (pointerDistance < 220) {
        const pull = pointer.active ? 0.0028 : 0.0012;
        node.vx += dxPointer * pull;
        node.vy += dyPointer * pull;
      }

      node.vx *= 0.992;
      node.vy *= 0.992;
      node.vx = Math.max(-1.2, Math.min(1.2, node.vx));
      node.vy = Math.max(-1.2, Math.min(1.2, node.vy));
      node.x += node.vx;
      node.y += node.vy;
    }
    if (node.x < -24) node.x = width + 24;
    if (node.x > width + 24) node.x = -24;
    if (node.y < -24) node.y = height + 24;
    if (node.y > height + 24) node.y = -24;

    const nodeColors = [
      "rgba(13, 124, 134, 0.46)",
      "rgba(200, 90, 60, 0.36)",
      "rgba(184, 138, 39, 0.32)"
    ];
    ctx.fillStyle = nodeColors[node.hue];
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();

    for (let nextIndex = index + 1; nextIndex < nodes.length; nextIndex += 1) {
      const other = nodes[nextIndex];
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
        ctx.globalAlpha = (1 - distance / 150) * 0.88;
        ctx.strokeStyle = node.hue === 1 ? "rgba(200, 90, 60, 0.18)" : "rgba(13, 124, 134, 0.18)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }

    const pointerDx = node.x - pointer.x;
    const pointerDy = node.y - pointer.y;
    const pointerDistance = Math.sqrt(pointerDx * pointerDx + pointerDy * pointerDy);
    if (pointerDistance < 180) {
      ctx.globalAlpha = (1 - pointerDistance / 180) * 0.72;
      ctx.strokeStyle = "rgba(6, 78, 86, 0.3)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();
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

function sortPublicationsByDate() {
  const list = document.querySelector(".publication-list");
  if (!list) return;

  [...list.querySelectorAll(".publication")]
    .sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date))
    .forEach(publication => list.appendChild(publication));
}

sortPublicationsByDate();
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
window.addEventListener("pointermove", event => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
}, { passive: true });
window.addEventListener("pointerleave", () => {
  pointer.active = false;
}, { passive: true });
window.addEventListener("resize", () => {
  resizeCanvas();
  seedNodes();
  if (reduceMotion) drawNetwork();
});

resizeCanvas();
seedNodes();
drawNetwork();
updateProgress();

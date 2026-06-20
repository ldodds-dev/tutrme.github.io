const canvas = document.getElementById("learning-canvas");
const ctx = canvas.getContext("2d");
const motionToggle = document.getElementById("motion-toggle");
const softness = document.getElementById("softness");
const confidence = document.getElementById("confidence");
const confidenceScore = document.getElementById("confidence-score");
const confidenceCopy = document.getElementById("confidence-copy");

const nodes = [
  { x: -220, y: 70, z: -40, label: "Review", color: "#0d567d" },
  { x: -80, y: -45, z: 40, label: "Practice", color: "#67b8c8" },
  { x: 70, y: 55, z: 95, label: "Apply", color: "#8bd8bd" },
  { x: 220, y: -30, z: -10, label: "Reflect", color: "#d88a7a" }
];

let frame = 0;

function project(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = point.x * cos - point.z * sin;
  const z = point.x * sin + point.z * cos + 520;
  const scale = 430 / z;
  return {
    x: canvas.width / 2 + x * scale,
    y: canvas.height / 2 + point.y * scale,
    scale,
    depth: z
  };
}

function draw() {
  const gentleMotion = motionToggle.checked;
  const softnessValue = Number(softness.value) / 100;
  const confidenceValue = Number(confidence.value);
  const angle = gentleMotion ? frame / 520 : frame / 520;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, "#fffef8");
  bg.addColorStop(1, "#e7f3f6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const projected = nodes.map((node) => ({ ...node, screen: project(node, angle) })).sort((a, b) => b.screen.depth - a.screen.depth);

  ctx.lineWidth = 4;
  ctx.strokeStyle = `rgba(13, 86, 125, ${0.18 + softnessValue * 0.22})`;
  ctx.beginPath();
  projected.forEach((node, index) => {
    if (index === 0) ctx.moveTo(node.screen.x, node.screen.y);
    else ctx.lineTo(node.screen.x, node.screen.y);
  });
  ctx.stroke();

  projected.forEach((node, index) => {
    const radius = (42 + confidenceValue * 0.16) * node.screen.scale;
    const glow = ctx.createRadialGradient(node.screen.x, node.screen.y, radius * 0.1, node.screen.x, node.screen.y, radius * 2.4);
    glow.addColorStop(0, node.color);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 0.28 + softnessValue * 0.34;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(node.screen.x, node.screen.y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.screen.x, node.screen.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1e2b2b";
    ctx.font = `${Math.max(15, 19 * node.screen.scale)}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(node.label, node.screen.x, node.screen.y + radius + 30);

    ctx.fillStyle = "rgba(30, 43, 43, 0.42)";
    ctx.font = "700 13px system-ui";
    ctx.fillText(`Step ${index + 1}`, node.screen.x, node.screen.y - radius - 14);
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "#0d567d";
  ctx.font = "800 18px system-ui";
  ctx.fillText("Adaptive learning path", 42, 54);
  ctx.fillStyle = "rgba(30, 43, 43, 0.62)";
  ctx.font = "16px system-ui";
  ctx.fillText("Soft 3D map with comfort-first motion controls", 42, 82);

  if (gentleMotion) frame += 1;
  requestAnimationFrame(draw);
}

function updateConfidence() {
  const value = Number(confidence.value);
  confidenceScore.textContent = `${value}%`;
  confidenceCopy.textContent =
    value >= 84
      ? "Ready for independent practice with enrichment prompts."
      : value >= 64
        ? "Ready for a guided practice path with light review."
        : "Use a slower review path with tutor support signals.";
}

confidence.addEventListener("input", updateConfidence);
updateConfidence();
draw();

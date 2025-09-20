const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const countdownEl = document.getElementById("countdown");

let options = Array(9).fill("Buy").concat("Sell");
let angle = 0;
let spinning = true;

function drawWheel(items) {
  const num = items.length;
  const arc = (2 * Math.PI) / num;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  items.forEach((item, i) => {
    const startAngle = angle + i * arc;
    const endAngle = startAngle + arc;

    // Slice fill
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, 240, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = item === "Sell" ? "#e74c3c" : "#27ae60";
    ctx.fill();

    // Outline
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.font = "22px Segoe UI";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.strokeText(item, 200, 10);
    ctx.fillText(item, 200, 10);
    ctx.restore();
  });
}

function spinWheel() {
  if (!spinning) return;

  let spinAngle = Math.random() * Math.PI * 6 + Math.PI * 6; // more rotation
  let duration = 10000; // 10 seconds
  let start = performance.now();
  let velocityFactor = 0;

  function animate(time) {
    let progress = (time - start) / duration;

    if (progress < 1) {
      // Velocity curve: ease-in-out
      velocityFactor = Math.sin(progress * Math.PI);
      angle += (spinAngle * velocityFactor) / (duration / 16);

      drawWheel(options);
      requestAnimationFrame(animate);
    } else {
      // Normalize angle
      angle %= 2 * Math.PI;

      // Determine result
      let arc = (2 * Math.PI) / options.length;
      let normalized = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      let pointerAngle = (Math.PI / 2 - normalized + 2 * Math.PI) % (2 * Math.PI);
      let index = Math.floor(pointerAngle / arc);
      let result = options[index];

      if (result === "Sell") {
        spinning = false;
        overlay.classList.add("show");
      } else {
        // Remove one Buy
        const idx = options.indexOf("Buy");
        if (idx !== -1) options.splice(idx, 1);

        if (options.length <= 1) {
          spinning = false;
          overlay.classList.add("show");
          return;
        }

        startCountdown(3, () => spinWheel());
      }
    }
  }

  requestAnimationFrame(animate);
}

function startCountdown(seconds, callback) {
  let count = seconds;
  countdownEl.textContent = count;

  let interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else {
      clearInterval(interval);
      countdownEl.textContent = "";
      callback();
    }
  }, 1000);
}

drawWheel(options);
startCountdown(3, () => spinWheel());

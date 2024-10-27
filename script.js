const canvas = document.getElementById("dotGrid");
const ctx = canvas.getContext("2d");

// Canvas size and dot settings
const canvasSize = 400;
const dotRadius = 10;
const gridSpacing = 100;
canvas.width = canvasSize;
canvas.height = canvasSize;

// Store dots and lines
const dots = [];
const lines = [];
let drawing = false;
let startDot = null;

const targetLines = [
  {
    start: { x: 100, y: 100 },
    end: { x: 100, y: 200 },
  },
  {
    start: { x: 100, y: 200 },
    end: { x: 100, y: 300 },
  },
  {
    start: { x: 100, y: 300 },
    end: { x: 200, y: 300 },
  },
  {
    start: { x: 200, y: 300 },
    end: { x: 300, y: 300 },
  },
];

function areLinesEqual(lines1, lines2) {
  if (lines1.length !== lines2.length) {
    return false;
  }

  // Helper function to convert a line into a standardized string for comparison
  function lineToString(line) {
    const { start, end } = line;
    // Create a string representation that sorts the coordinates to handle reversed lines
    const sortedLine = [
      { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) },
      { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) },
    ];
    return JSON.stringify(sortedLine);
  }

  // Create sets of line strings for both arrays
  const lineSet1 = new Set(lines1.map(lineToString));
  const lineSet2 = new Set(lines2.map(lineToString));

  // Compare the sets
  if (lineSet1.size !== lineSet2.size) {
    return false;
  }

  for (let line of lineSet1) {
    if (!lineSet2.has(line)) {
      return false;
    }
  }

  return true;
}

// Create grid of dots
function createGrid() {
  for (let x = gridSpacing; x < canvasSize; x += gridSpacing) {
    for (let y = gridSpacing; y < canvasSize; y += gridSpacing) {
      dots.push({ x, y });
      drawDot(x, y);
    }
  }
}

// Draw a dot
function drawDot(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#333";
  ctx.fill();
}

// Draw a line between two dots
function drawLine(start, end) {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  ctx.stroke();
}

// Find the nearest dot
function findNearestDot(x, y) {
  return dots.find((dot) => Math.hypot(dot.x - x, dot.y - y) < dotRadius * 2);
}

// Handle mouse and touch events
function handleStart(event) {
  const { x, y } = getEventPosition(event);
  const nearestDot = findNearestDot(x, y);
  if (nearestDot) {
    drawing = true;
    startDot = nearestDot;
  }
}

function handleMove(event) {
  if (drawing) {
    const { x, y } = getEventPosition(event);
    const nearestDot = findNearestDot(x, y);
    if (nearestDot && startDot !== nearestDot) {
      // Draw a line to the nearest dot and update the startDot
      drawLine(startDot, nearestDot);
      lines.push({ start: startDot, end: nearestDot });
      const isEqual = areLinesEqual(lines, targetLines);
      startDot = nearestDot;
      if (isEqual) {
        setTimeout(() => {
          alert("You win");
        }, 2000);
      }
    }
  }
}

function handleEnd(event) {
  drawing = false;
  startDot = null;
}

function getEventPosition(event) {
  if (event.touches && event.touches.length > 0) {
    const touch = event.touches[0];
    return {
      x: touch.clientX - canvas.getBoundingClientRect().left,
      y: touch.clientY - canvas.getBoundingClientRect().top,
    };
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    return {
      x: touch.clientX - canvas.getBoundingClientRect().left,
      y: touch.clientY - canvas.getBoundingClientRect().top,
    };
  } else {
    return { x: event.offsetX, y: event.offsetY };
  }
}

// Add event listeners for mouse
canvas.addEventListener("mousedown", handleStart);
canvas.addEventListener("mousemove", handleMove);
canvas.addEventListener("mouseup", handleEnd);

// Add event listeners for touch
canvas.addEventListener("touchstart", handleStart);
canvas.addEventListener("touchmove", handleMove);
canvas.addEventListener("touchend", handleEnd);

// Prevent default behavior for touch events to avoid scrolling
canvas.addEventListener("touchmove", (event) => event.preventDefault());

// Initial setup
createGrid();

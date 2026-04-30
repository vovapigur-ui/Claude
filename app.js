// ====================== Storage ======================
const LS_KEY = "coach.app.v1";

const defaultState = {
  profile: {
    name: "", age: "", sex: "", height: "", weight: "",
    experience: "beginner", frequency: 3,
    goal: "general", equipment: "", notes: "",
  },
  workouts: [], // { id, date, title, duration, notes, exercises: [{name, sets, reps, weight}] }
  messages: [], // { role: "user"|"assistant", content }
  settings: { apiKey: "", model: "claude-sonnet-4-6", units: "kg" },
};

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      profile: { ...defaultState.profile, ...(parsed.profile || {}) },
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      workouts: parsed.workouts || [],
      messages: parsed.messages || [],
    };
  } catch (e) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

let state = loadState();

// ====================== Navigation ======================
const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

function switchView(name) {
  navButtons.forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  views.forEach((v) => v.classList.toggle("active", v.dataset.view === name));
  if (name === "progress") renderProgress();
  if (name === "workouts") renderWorkouts();
}

// ====================== Profile ======================
const profileForm = document.getElementById("profileForm");
const profileStatus = document.getElementById("profileStatus");

function fillProfileForm() {
  Object.entries(state.profile).forEach(([k, v]) => {
    const el = profileForm.elements[k];
    if (el) el.value = v ?? "";
  });
}
fillProfileForm();

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(profileForm);
  for (const [k, v] of data.entries()) state.profile[k] = v;
  saveState();
  profileStatus.textContent = "Saved.";
  setTimeout(() => (profileStatus.textContent = ""), 1500);
});

// ====================== Settings ======================
const apiKeyInput = document.getElementById("apiKeyInput");
const modelSelect = document.getElementById("modelSelect");
const unitsSelect = document.getElementById("unitsSelect");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const keyStatus = document.getElementById("keyStatus");

apiKeyInput.value = state.settings.apiKey || "";
modelSelect.value = state.settings.model;
unitsSelect.value = state.settings.units;

saveKeyBtn.addEventListener("click", () => {
  state.settings.apiKey = apiKeyInput.value.trim();
  state.settings.model = modelSelect.value;
  saveState();
  keyStatus.textContent = "Saved.";
  setTimeout(() => (keyStatus.textContent = ""), 1500);
});

modelSelect.addEventListener("change", () => {
  state.settings.model = modelSelect.value;
  saveState();
});

unitsSelect.addEventListener("change", () => {
  state.settings.units = unitsSelect.value;
  saveState();
  renderWorkouts();
  renderProgress();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `coach-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

const importFile = document.getElementById("importFile");
document.getElementById("importBtn").addEventListener("click", () => importFile.click());
importFile.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    state = { ...defaultState, ...data };
    saveState();
    fillProfileForm();
    renderAll();
    alert("Imported.");
  } catch (err) {
    alert("Could not import: " + err.message);
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Erase all profile, workouts, and chat data?")) return;
  state = structuredClone(defaultState);
  saveState();
  fillProfileForm();
  apiKeyInput.value = "";
  renderAll();
});

// ====================== Workouts ======================
const workoutsList = document.getElementById("workoutsList");
const workoutModal = document.getElementById("workoutModal");
const exercisesList = document.getElementById("exercisesList");
let editingWorkoutId = null;

document.getElementById("newWorkoutBtn").addEventListener("click", () => openWorkoutModal());
document.getElementById("closeWorkoutBtn").addEventListener("click", closeWorkoutModal);
document.getElementById("cancelWorkoutBtn").addEventListener("click", closeWorkoutModal);
document.getElementById("addExerciseBtn").addEventListener("click", () => addExerciseRow());
document.getElementById("saveWorkoutBtn").addEventListener("click", saveWorkout);
document.getElementById("deleteWorkoutBtn").addEventListener("click", deleteWorkout);

function openWorkoutModal(workout = null) {
  editingWorkoutId = workout?.id ?? null;
  document.getElementById("workoutModalTitle").textContent = workout ? "Edit workout" : "New workout";
  document.getElementById("workoutDate").value = workout?.date ?? new Date().toISOString().slice(0, 10);
  document.getElementById("workoutTitle").value = workout?.title ?? "";
  document.getElementById("workoutDuration").value = workout?.duration ?? "";
  document.getElementById("workoutNotes").value = workout?.notes ?? "";
  exercisesList.innerHTML = "";
  const exes = workout?.exercises?.length ? workout.exercises : [{ name: "", sets: "", reps: "", weight: "" }];
  exes.forEach(addExerciseRow);
  document.getElementById("deleteWorkoutBtn").hidden = !workout;
  workoutModal.hidden = false;
}

function closeWorkoutModal() {
  workoutModal.hidden = true;
  editingWorkoutId = null;
}

function addExerciseRow(ex = { name: "", sets: "", reps: "", weight: "" }) {
  const row = document.createElement("div");
  row.className = "exercise-row";
  row.innerHTML = `
    <input type="text" placeholder="Exercise" data-field="name" value="${escapeAttr(ex.name)}" />
    <input type="number" placeholder="Sets" data-field="sets" value="${escapeAttr(ex.sets)}" />
    <input type="text" placeholder="Reps" data-field="reps" value="${escapeAttr(ex.reps)}" />
    <input type="number" step="0.5" placeholder="Weight" data-field="weight" value="${escapeAttr(ex.weight)}" />
    <button class="remove-ex" type="button" title="Remove">✕</button>
  `;
  row.querySelector(".remove-ex").addEventListener("click", () => row.remove());
  exercisesList.appendChild(row);
}

function gatherExercises() {
  return [...exercisesList.querySelectorAll(".exercise-row")]
    .map((row) => {
      const obj = {};
      row.querySelectorAll("[data-field]").forEach((el) => (obj[el.dataset.field] = el.value));
      return obj;
    })
    .filter((e) => e.name.trim());
}

function saveWorkout() {
  const payload = {
    id: editingWorkoutId ?? "w_" + Date.now(),
    date: document.getElementById("workoutDate").value,
    title: document.getElementById("workoutTitle").value.trim() || "Workout",
    duration: Number(document.getElementById("workoutDuration").value) || 0,
    notes: document.getElementById("workoutNotes").value.trim(),
    exercises: gatherExercises(),
  };
  if (editingWorkoutId) {
    const i = state.workouts.findIndex((w) => w.id === editingWorkoutId);
    if (i >= 0) state.workouts[i] = payload;
  } else {
    state.workouts.push(payload);
  }
  saveState();
  closeWorkoutModal();
  renderWorkouts();
  renderStreak();
}

function deleteWorkout() {
  if (!editingWorkoutId) return;
  if (!confirm("Delete this workout?")) return;
  state.workouts = state.workouts.filter((w) => w.id !== editingWorkoutId);
  saveState();
  closeWorkoutModal();
  renderWorkouts();
  renderStreak();
}

function renderWorkouts() {
  if (!state.workouts.length) {
    workoutsList.innerHTML = `<div class="empty">No workouts logged yet. Tap "New workout" or ask Coach to plan one.</div>`;
    return;
  }
  const sorted = [...state.workouts].sort((a, b) => b.date.localeCompare(a.date));
  workoutsList.innerHTML = sorted
    .map(
      (w) => `
    <div class="workout-item" data-id="${w.id}">
      <div class="workout-item-row">
        <div>
          <div class="workout-title">${escapeHtml(w.title)}</div>
          <div class="workout-meta">${formatDate(w.date)}${w.duration ? " · " + w.duration + " min" : ""}</div>
        </div>
        <div class="workout-meta">${w.exercises.length} exercise${w.exercises.length === 1 ? "" : "s"}</div>
      </div>
      ${w.exercises.length ? `<div class="workout-summary">${w.exercises.map(formatExercise).join(" · ")}</div>` : ""}
    </div>
  `,
    )
    .join("");
  workoutsList.querySelectorAll(".workout-item").forEach((el) => {
    el.addEventListener("click", () => {
      const w = state.workouts.find((x) => x.id === el.dataset.id);
      if (w) openWorkoutModal(w);
    });
  });
}

function formatExercise(e) {
  const parts = [e.name];
  if (e.sets || e.reps) parts.push(`${e.sets || "?"}×${e.reps || "?"}`);
  if (e.weight) parts.push(`${e.weight}${state.settings.units}`);
  return escapeHtml(parts.join(" "));
}

// ====================== Streak ======================
function renderStreak() {
  const dates = new Set(state.workouts.map((w) => w.date));
  let streak = 0;
  const d = new Date();
  // Allow today missing if not yet trained — count from yesterday if today empty
  if (!dates.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  document.getElementById("streakNum").textContent = streak;
}

// ====================== Progress ======================
function renderProgress() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const recent = state.workouts.filter((w) => new Date(w.date) >= weekAgo);
  document.getElementById("weekWorkouts").textContent = recent.length;
  document.getElementById("weekMinutes").textContent = recent.reduce((a, w) => a + (Number(w.duration) || 0), 0);
  const volume = recent.reduce((a, w) => a + workoutVolume(w), 0);
  document.getElementById("weekVolume").textContent = Math.round(volume);

  drawFreqChart();
  populateLiftSelect();
  drawLiftChart();
}

function workoutVolume(w) {
  return w.exercises.reduce((acc, e) => {
    const s = Number(e.sets) || 0;
    const reps = parseFirstInt(e.reps);
    const wt = Number(e.weight) || 0;
    return acc + s * reps * wt;
  }, 0);
}

function parseFirstInt(s) {
  const m = String(s || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function drawFreqChart() {
  const canvas = document.getElementById("freqChart");
  const ctx = canvas.getContext("2d");
  const W = (canvas.width = canvas.clientWidth);
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const days = 30;
  const today = new Date();
  const labels = [];
  const counts = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(d);
    counts.push(state.workouts.filter((w) => w.date === key).length);
  }
  const max = Math.max(1, ...counts);
  const pad = 24;
  const barW = (W - pad * 2) / days - 2;
  ctx.fillStyle = "#9aa7b4";
  ctx.font = "11px system-ui";
  for (let i = 0; i < days; i++) {
    const h = (counts[i] / max) * (H - pad * 2);
    const x = pad + i * (barW + 2);
    const y = H - pad - h;
    ctx.fillStyle = counts[i] ? "#ff6a3d" : "#2a3340";
    ctx.fillRect(x, y, barW, Math.max(2, h));
  }
  ctx.fillStyle = "#6b7785";
  ctx.fillText(labels[0].toLocaleDateString(undefined, { month: "short", day: "numeric" }), pad, H - 6);
  ctx.fillText(
    labels[days - 1].toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    W - pad - 60,
    H - 6,
  );
}

function populateLiftSelect() {
  const sel = document.getElementById("liftSelect");
  const names = new Set();
  state.workouts.forEach((w) => w.exercises.forEach((e) => e.name && e.weight && names.add(e.name.trim())));
  const arr = [...names].sort();
  const prev = sel.value;
  sel.innerHTML = arr.length
    ? arr.map((n) => `<option value="${escapeAttr(n)}">${escapeHtml(n)}</option>`).join("")
    : `<option value="">No lifts logged yet</option>`;
  if (arr.includes(prev)) sel.value = prev;
  sel.onchange = drawLiftChart;
}

function drawLiftChart() {
  const sel = document.getElementById("liftSelect");
  const name = sel.value;
  const canvas = document.getElementById("liftChart");
  const ctx = canvas.getContext("2d");
  const W = (canvas.width = canvas.clientWidth);
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (!name) return;

  const points = state.workouts
    .flatMap((w) =>
      w.exercises
        .filter((e) => e.name?.trim() === name && Number(e.weight))
        .map((e) => ({ date: w.date, weight: Number(e.weight) })),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!points.length) return;

  const pad = 30;
  const minW = Math.min(...points.map((p) => p.weight));
  const maxW = Math.max(...points.map((p) => p.weight));
  const range = Math.max(1, maxW - minW);

  const xAt = (i) => pad + (i / Math.max(1, points.length - 1)) * (W - pad * 2);
  const yAt = (w) => H - pad - ((w - minW) / range) * (H - pad * 2);

  // grid
  ctx.strokeStyle = "#2a3340";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (i / 4) * (H - pad * 2);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();
  }

  // line
  ctx.strokeStyle = "#ff6a3d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = xAt(i),
      y = yAt(p.weight);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // dots
  ctx.fillStyle = "#ff6a3d";
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(xAt(i), yAt(p.weight), 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // labels
  ctx.fillStyle = "#9aa7b4";
  ctx.font = "11px system-ui";
  ctx.fillText(maxW + " " + state.settings.units, 4, pad + 4);
  ctx.fillText(minW + " " + state.settings.units, 4, H - pad);
}

// ====================== Chat ======================
const messagesEl = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const clearChatBtn = document.getElementById("clearChatBtn");

clearChatBtn.addEventListener("click", () => {
  if (!confirm("Clear chat history?")) return;
  state.messages = [];
  saveState();
  renderMessages();
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    chatInput.value = chip.dataset.prompt;
    chatInput.focus();
    autoresize();
  });
});

chatInput.addEventListener("input", autoresize);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
sendBtn.addEventListener("click", sendMessage);

function autoresize() {
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(160, chatInput.scrollHeight) + "px";
}

function renderMessages() {
  if (!state.messages.length) {
    messagesEl.innerHTML = `<div class="msg system">👋 Hi! I'm Coach. Set up your profile, then ask me anything — workouts, nutrition, recovery, or how to hit your goals.</div>`;
    return;
  }
  messagesEl.innerHTML = state.messages
    .map(
      (m) => `
    <div class="msg ${m.role}">
      <div class="name">${m.role === "user" ? "You" : "Coach"}</div>
      ${formatMarkdown(m.content)}
    </div>
  `,
    )
    .join("");
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  if (!state.settings.apiKey) {
    alert("Add your Anthropic API key in Settings to chat with Coach.");
    switchView("settings");
    return;
  }
  state.messages.push({ role: "user", content: text });
  saveState();
  chatInput.value = "";
  autoresize();
  renderMessages();

  const thinking = document.createElement("div");
  thinking.className = "msg assistant thinking";
  thinking.innerHTML = `<div class="name">Coach</div><em>Thinking…</em>`;
  messagesEl.appendChild(thinking);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  sendBtn.disabled = true;

  try {
    const reply = await callClaude(state.messages);
    state.messages.push({ role: "assistant", content: reply });
    saveState();
    renderMessages();
  } catch (err) {
    thinking.remove();
    state.messages.push({
      role: "assistant",
      content: "⚠️ Something went wrong reaching Claude: " + err.message,
    });
    saveState();
    renderMessages();
  } finally {
    sendBtn.disabled = false;
  }
}

function buildSystemPrompt() {
  const p = state.profile;
  const recent = [...state.workouts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(
      (w) =>
        `- ${w.date} · ${w.title}${w.duration ? " (" + w.duration + " min)" : ""}: ` +
        w.exercises.map((e) => `${e.name} ${e.sets || "?"}×${e.reps || "?"}${e.weight ? " @ " + e.weight + state.settings.units : ""}`).join(", "),
    )
    .join("\n");

  return `You are Coach, an upbeat, knowledgeable, no-nonsense personal trainer. You give concrete, actionable advice tailored to the user. You are honest about limits — you can't diagnose injuries — and you suggest seeing a professional when warranted.

When prescribing a workout, use this format:
- Brief intro line
- Bulleted exercises with sets × reps and a target weight or RPE
- Short notes (rest, form cues)

User profile:
- Name: ${p.name || "(unset)"}
- Age: ${p.age || "(unset)"}, Sex: ${p.sex || "(unset)"}
- Height: ${p.height ? p.height + " cm" : "(unset)"}, Weight: ${p.weight ? p.weight + " kg" : "(unset)"}
- Experience: ${p.experience}
- Days/week available: ${p.frequency}
- Primary goal: ${p.goal}
- Equipment: ${p.equipment || "(unset)"}
- Notes/injuries: ${p.notes || "(none)"}
- Units preferred: ${state.settings.units}

Recent workouts:
${recent || "(none yet)"}

Keep responses tight. Use markdown sparingly. Encourage consistency over intensity.`;
}

async function callClaude(messages) {
  const body = {
    model: state.settings.model,
    max_tokens: 1024,
    system: buildSystemPrompt(),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": state.settings.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return text || "(no reply)";
}

// ====================== Helpers ======================
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatMarkdown(text) {
  // Minimal: escape, then convert **bold**, *italic*, `code`, line breaks, and bullet lists.
  let s = escapeHtml(text);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // bullets
  s = s.replace(/(^|\n)([-•] .+(?:\n[-•] .+)*)/g, (_, pre, block) => {
    const items = block
      .split("\n")
      .map((l) => l.replace(/^[-•] /, "").trim())
      .filter(Boolean)
      .map((i) => `<li>${i}</li>`)
      .join("");
    return pre + `<ul>${items}</ul>`;
  });
  return s.replace(/\n/g, "<br>");
}

// ====================== Init ======================
function renderAll() {
  renderMessages();
  renderWorkouts();
  renderStreak();
  renderProgress();
}
renderAll();
window.addEventListener("resize", () => {
  if (document.querySelector('.view[data-view="progress"]').classList.contains("active")) renderProgress();
});

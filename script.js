// ===== STORAGE =====
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let data = JSON.parse(localStorage.getItem("data")) || [];
let journal = JSON.parse(localStorage.getItem("journal")) || [];

function save() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("data", JSON.stringify(data));
  localStorage.setItem("journal", JSON.stringify(journal));
}

// ===== JOURNAL (FIXED) =====
function addJournal() {
  let input = document.getElementById("journalInput");
  if (!input) return;

  let text = input.value.trim();
  if (!text) return alert("Write something ❗");

  let today = new Date().toISOString().split("T")[0]; // FIXED DATE

  journal.push({ date: today, text });

  save();
  input.value = "";
  renderJournal();
}

function renderJournal() {
  let list = document.getElementById("journalList");
  if (!list) return;

  list.innerHTML = "";

  // SORT BY DATE (NEWEST FIRST)
  journal.sort((a, b) => b.date.localeCompare(a.date));

  journal.forEach(j => {
    let li = document.createElement("li");
    li.textContent = `${j.date} - ${j.text}`;
    list.appendChild(li);
  });
}

// ===== HABITS (FIXED) =====
function addHabit() {
  let input = document.getElementById("habitInput");
  if (!input) return;

  let val = input.value.trim();
  if (!val) return alert("Enter habit ❗");

  habits.push(val);
  input.value = "";

  save();
  renderHabits();
  renderTable(); // IMPORTANT
}

function renderHabits() {
  let header = document.getElementById("headerRow");
  if (!header) return;

  header.innerHTML = "<th>Date</th>";

  habits.forEach(h => {
    let th = document.createElement("th");
    th.textContent = h;
    header.appendChild(th);
  });
}

function addRow() {
  let dateInput = document.getElementById("dateInput");
  if (!dateInput) return;

  let date = dateInput.value;
  if (!date) return alert("Select date ❗");

  data.push({
    date,
    checks: habits.map(() => false)
  });

  save();
  renderTable();
  renderChart();
}

function renderTable() {
  let body = document.getElementById("tableBody");
  if (!body) return;

  body.innerHTML = "";

  data.forEach((row, i) => {
    let tr = document.createElement("tr");

    let tdDate = document.createElement("td");
    tdDate.textContent = row.date;
    tr.appendChild(tdDate);

    // FIX: ensure same number of habits
    if (row.checks.length < habits.length) {
      row.checks.push(...Array(habits.length - row.checks.length).fill(false));
    }

    habits.forEach((_, j) => {
      let td = document.createElement("td");
      let cb = document.createElement("input");

      cb.type = "checkbox";
      cb.checked = row.checks[j];

      cb.onchange = () => {
        data[i].checks[j] = cb.checked;
        save();
        renderChart();
      };

      td.appendChild(cb);
      tr.appendChild(td);
    });

    body.appendChild(tr);
  });
}

// ===== CHART (FIXED SAFE) =====
let chart;

function renderChart() {
  let canvas = document.getElementById("chart");
  if (!canvas) return;

  let labels = data.map(d => d.date);
  let values = data.map(d => d.checks.filter(c => c).length);

  if (chart) chart.destroy();

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Habits Done",
        data: values,
        borderColor: "#4ade80",
        tension: 0.3
      }]
    }
  });

  let total = values.reduce((a,b)=>a+b,0);

  let weekly = document.getElementById("weekly");
  let monthly = document.getElementById("monthly");

  if (weekly) weekly.textContent = (total / 7).toFixed(1);
  if (monthly) monthly.textContent = (total / 30).toFixed(1);
}

// ===== INIT =====
window.onload = () => {
  renderJournal();
  renderHabits();
  renderTable();
  renderChart();
};

function calculateStreak() {
  let streak = 0;

  for (let i = data.length - 1; i >= 0; i--) {
    let completed = data[i].checks.every(c => c);
    if (completed) streak++;
    else break;
  }

  return streak;
}

if (journal.length === 0) {
  list.innerHTML = "<p>No entries yet ✍️</p>";
}

function resetData() {
  if (confirm("Clear all data?")) {
    localStorage.clear();
    location.reload();
  }
}
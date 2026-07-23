/* ===== LearnHub quiz engine =====
   Reads ?subject=xxx from the URL and loads window.QUIZZES[xxx].

   Progress is persisted per-subject in localStorage under "lh_progress_v1":
     {
       "<subject>": {
         best: <highest percent ever>,
         mastered: [<original question indices answered correctly>],
         inProgress: { order: [indices], idx, score } | null
       }
     }
   - Resume: an interrupted run is restored from inProgress.
   - Best score: shown on the intro + subject cards.
   - Mastered: correctly-answered questions sort to the back of a fresh run
     (and drop out of "mastered" again if you later miss them), so repeats
     focus on the ones you still get wrong.
*/
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var subject = params.get("subject") || "cpp";
  var quiz = (window.QUIZZES || {})[subject];

  var el = function (id) { return document.getElementById(id); };

  // Subject hub links (extend when you add subjects)
  var hubLinks = {
    cpp: "subject-cpp.html",
    "cpp-senior": "subject-cpp.html",
    "cpp-types": "subject-cpp.html",
    "cpp-containers": "subject-cpp.html",
    "cpp-functions": "subject-cpp.html",
    "cpp-classes": "subject-cpp.html",
    "cpp-memory": "subject-cpp.html",
    "cpp-oop": "subject-cpp.html",
    "cpp-templates": "subject-cpp.html",
    "cpp-advanced": "subject-cpp.html"
  };
  var hub = hubLinks[subject] || "index.html";
  el("back-link").href = hub;
  el("result-back").href = hub;

  if (!quiz) {
    el("quiz-title").textContent = "Quiz not found";
    el("quiz-subtitle").textContent =
      'No questions are loaded for "' + subject + '". Add a data file and include it in quiz.html.';
    el("start-btn").classList.add("hidden");
    return;
  }

  // ---- persistence ----------------------------------------------------------
  var STORE_KEY = "lh_progress_v1";

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveStore(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function subjState() { return loadStore()[subject] || {}; }
  function updateSubj(mut) {
    var s = loadStore();
    var cur = s[subject] || {};
    mut(cur);
    s[subject] = cur;
    saveStore(s);
  }

  // ---- intro / crumb --------------------------------------------------------
  var subLabel = quiz.crumb || subject.toUpperCase();
  el("crumb-sub").innerHTML = '<a href="' + hub + '">' + subLabel + "</a>";
  el("quiz-title").textContent = quiz.title;

  function introSubtitle() {
    var base = quiz.subtitle || "";
    var best = subjState().best;
    if (typeof best === "number") {
      base += (base ? "  •  " : "") + "Best score: " + best + "%";
    }
    el("quiz-subtitle").textContent = base;
  }
  introSubtitle();

  var total = quiz.questions.length;
  var order = [];   // original indices, in play order
  var idx = 0;
  var score = 0;
  var answered = false;
  var LETTERS = ["A", "B", "C", "D", "E", "F"];

  function shuffleInts(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Unmastered questions first (shuffled), mastered ones after (shuffled).
  function buildOrder() {
    var st = subjState();
    var mastered = {};
    (st.mastered || []).forEach(function (i) { mastered[i] = true; });
    var fresh = [], done = [];
    for (var i = 0; i < total; i++) { (mastered[i] ? done : fresh).push(i); }
    return shuffleInts(fresh).concat(shuffleInts(done));
  }

  function show(section) {
    ["intro", "quiz", "result"].forEach(function (s) {
      el(s).classList.toggle("hidden", s !== section);
    });
  }

  function persistProgress() {
    updateSubj(function (cur) {
      cur.inProgress = { order: order, idx: idx, score: score };
    });
  }

  function startFresh() {
    order = buildOrder();
    idx = 0; score = 0;
    persistProgress();
    show("quiz");
    render();
  }

  function resume() {
    var p = subjState().inProgress;
    if (!p || !p.order || !p.order.length) { startFresh(); return; }
    order = p.order;
    idx = Math.min(p.idx || 0, order.length - 1);
    score = p.score || 0;
    show("quiz");
    render();
  }

  function render() {
    answered = false;
    var q = quiz.questions[order[idx]];

    el("q-count").textContent = "Question " + (idx + 1) + " of " + order.length;
    el("q-score").textContent = "Score: " + score;
    el("bar-fill").style.width = (idx / order.length) * 100 + "%";

    el("q-tag").textContent = q.tag || "Question";
    el("q-text").textContent = q.question;

    var codeEl = el("q-code");
    if (q.type === "code" && q.code) {
      codeEl.textContent = q.code;
      codeEl.classList.remove("hidden");
    } else {
      codeEl.classList.add("hidden");
    }

    var box = el("options");
    box.innerHTML = "";
    q.options.forEach(function (opt, i) {
      var div = document.createElement("div");
      div.className = "option";
      div.innerHTML = '<span class="key">' + LETTERS[i] + "</span><span>" + escapeHtml(opt) + "</span>";
      div.addEventListener("click", function () { choose(i); });
      box.appendChild(div);
    });

    el("explain").classList.remove("show", "miss");
    el("next-btn").classList.add("hidden");
    el("feedback").textContent = "";
  }

  function markMastered(origIndex, correct) {
    updateSubj(function (cur) {
      var m = cur.mastered || [];
      var pos = m.indexOf(origIndex);
      if (correct && pos < 0) m.push(origIndex);       // learned it
      else if (!correct && pos >= 0) m.splice(pos, 1);  // slipped — resurface it
      cur.mastered = m;
    });
  }

  function choose(i) {
    if (answered) return;
    answered = true;
    var origIndex = order[idx];
    var q = quiz.questions[origIndex];
    var opts = el("options").children;

    for (var k = 0; k < opts.length; k++) opts[k].classList.add("disabled");
    opts[q.answer].classList.add("correct");

    var explain = el("explain");
    var correct = i === q.answer;
    if (correct) {
      score++;
      el("feedback").textContent = "✔ Correct";
      el("explain-lbl").textContent = "Why";
      explain.classList.remove("miss");
    } else {
      opts[i].classList.add("wrong");
      el("feedback").textContent = "✘ Not quite";
      el("explain-lbl").textContent = "Here's the idea";
      explain.classList.add("miss");
    }

    markMastered(origIndex, correct);
    persistProgress();

    el("explain-text").textContent = q.explain || "";
    explain.classList.add("show");
    el("q-score").textContent = "Score: " + score;

    var nextBtn = el("next-btn");
    nextBtn.textContent = idx === order.length - 1 ? "See results →" : "Next →";
    nextBtn.classList.remove("hidden");
  }

  function next() {
    if (idx < order.length - 1) {
      idx++;
      persistProgress();
      render();
    } else {
      finish();
    }
  }

  function finish() {
    show("result");
    var pct = Math.round((score / order.length) * 100);
    el("ring").style.setProperty("--pct", pct + "%");
    el("ring-num").textContent = pct + "%";

    var prevBest = subjState().best || 0;
    var isBest = pct > prevBest;
    updateSubj(function (cur) {
      cur.best = Math.max(prevBest, pct);
      cur.inProgress = null;   // run complete — nothing to resume
    });

    el("result-msg").textContent =
      "You scored " + score + " out of " + order.length + "." +
      (isBest ? "  New best! 🥇" : "  (Best: " + Math.max(prevBest, pct) + "%)");

    var title;
    if (pct === 100) title = "Perfect score! 🏆";
    else if (pct >= 80) title = "Great job! 🎉";
    else if (pct >= 50) title = "Good effort — keep going!";
    else title = "Nice start — try again to level up!";
    el("result-title").textContent = title;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- intro wiring: offer Resume when a run is in progress ------------------
  (function setupIntro() {
    var p = subjState().inProgress;
    var startBtn = el("start-btn");
    if (p && p.order && p.order.length && p.idx < p.order.length) {
      // A saved run exists: make Start the secondary "restart", add a Resume primary.
      startBtn.textContent = "Restart ↻";
      startBtn.classList.remove("primary");
      startBtn.classList.add("ghost");

      var resumeBtn = document.createElement("button");
      resumeBtn.className = "btn primary";
      resumeBtn.textContent = "Resume — Q" + (p.idx + 1) + " of " + p.order.length + " →";
      startBtn.parentNode.insertBefore(resumeBtn, startBtn);
      resumeBtn.addEventListener("click", resume);
    }
    startBtn.addEventListener("click", startFresh);
  })();

  el("retry-btn").addEventListener("click", startFresh);
  el("next-btn").addEventListener("click", next);
})();

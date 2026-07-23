/* ===== LearnHub quiz engine =====
   Modes:
     quiz.html?subject=xxx  — one question bank (window.QUIZZES[xxx])
     quiz.html?book=yyy     — ALL questions of window.BOOKS entry yyy, merged
                              and shuffled. Each answer updates the mastered
                              list of the question's home category, so a book
                              run contributes to every category's progress.

   Progress is persisted in localStorage under "lh_progress_v1":
     {
       "<key>": {
         best: <highest percent ever>,
         mastered: [<original question indices answered correctly>],
         inProgress: { order: [indices], idx, score } | null
       }
     }
   <key> is the subject id, or "book:<bookId>" for book runs. Book runs keep
   their own best/resume, but "mastered" lives only on the category keys.
   - Resume: an interrupted run is restored from inProgress (dropped if the
     question count has changed since it was saved).
   - Mastered: correctly-answered questions sort to the back of a fresh run
     (and drop out of "mastered" again if you later miss them), so repeats
     focus on the ones you still get wrong.
*/
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var bookId = params.get("book");
  var subject = params.get("subject");

  var el = function (id) { return document.getElementById(id); };

  // Subject hub links (extend when you add subjects)
  var hubLinks = {
    "cpp-types": "subject-cpp.html",
    "cpp-containers": "subject-cpp.html",
    "cpp-functions": "subject-cpp.html",
    "cpp-classes": "subject-cpp.html",
    "cpp-memory": "subject-cpp.html",
    "cpp-oop": "subject-cpp.html",
    "cpp-templates": "subject-cpp.html",
    "cpp-advanced": "subject-cpp.html"
  };

  var quiz = null;      // { title, subtitle, crumb, questions }
  var refs = null;      // book mode: refs[i] = { cat, idx } — source of question i
  var storeKey = null;  // where best / inProgress live
  var hub = "index.html";

  if (bookId) {
    var book = (window.BOOKS || []).filter(function (b) { return b.id === bookId; })[0];
    if (book) {
      var qs = [];
      refs = [];
      book.categories.forEach(function (c) {
        var bank = (window.QUIZZES || {})[c.id];
        if (!bank) return;
        bank.questions.forEach(function (q, i) {
          qs.push(q);
          refs.push({ cat: c.id, idx: i });
        });
      });
      quiz = {
        title: book.icon + " " + book.title + " — Random mix",
        subtitle: "All " + qs.length + " questions from the whole book, shuffled. " +
                  "Every correct answer counts toward that category's progress.",
        crumb: book.title,
        questions: qs
      };
      storeKey = "book:" + book.id;
      hub = book.hub || "index.html";
    }
  } else {
    subject = subject || "cpp-types";
    quiz = (window.QUIZZES || {})[subject];
    storeKey = subject;
    hub = hubLinks[subject] || "index.html";
  }

  el("back-link").href = hub;
  el("result-back").href = hub;

  if (!quiz || !quiz.questions.length) {
    el("quiz-title").textContent = "Quiz not found";
    el("quiz-subtitle").textContent = bookId
      ? 'No book "' + bookId + '" is registered. Add it to data/books.js.'
      : 'No questions are loaded for "' + subject + '". Add a data file and include it in quiz.html.';
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
  function keyState(key) { return loadStore()[key] || {}; }
  function updateKey(key, mut) {
    var s = loadStore();
    var cur = s[key] || {};
    mut(cur);
    s[key] = cur;
    saveStore(s);
  }
  function ownState() { return keyState(storeKey); }

  // ---- intro / crumb --------------------------------------------------------
  var subLabel = quiz.crumb || (subject || "quiz").toUpperCase();
  el("crumb-sub").innerHTML = '<a href="' + hub + '">' + subLabel + "</a>";
  el("quiz-title").textContent = quiz.title;

  function introSubtitle() {
    var base = quiz.subtitle || "";
    var best = ownState().best;
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

  // Which composite/original indices are currently mastered?
  // Book mode reads each source category's mastered list; subject mode its own.
  function masteredMap() {
    var m = {};
    if (refs) {
      var store = loadStore();
      var byCat = {};
      refs.forEach(function (r, i) {
        if (!byCat[r.cat]) {
          var set = {};
          ((store[r.cat] || {}).mastered || []).forEach(function (k) { set[k] = true; });
          byCat[r.cat] = set;
        }
        if (byCat[r.cat][r.idx]) m[i] = true;
      });
    } else {
      (ownState().mastered || []).forEach(function (i) { m[i] = true; });
    }
    return m;
  }

  // Unmastered questions first (shuffled), mastered ones after (shuffled).
  function buildOrder() {
    var mastered = masteredMap();
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
    updateKey(storeKey, function (cur) {
      cur.inProgress = { order: order, idx: idx, score: score };
    });
  }

  // A saved run is only resumable while the question count is unchanged
  // (question banks grow when books/categories are extended).
  function resumable(p) {
    return p && p.order && p.order.length === total && p.idx < p.order.length;
  }

  function startFresh() {
    order = buildOrder();
    idx = 0; score = 0;
    persistProgress();
    show("quiz");
    render();
  }

  function resume() {
    var p = ownState().inProgress;
    if (!resumable(p)) { startFresh(); return; }
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

  // Route mastery to the question's home store: its category in book mode,
  // this subject otherwise. This is how book runs feed category progress.
  function markMastered(origIndex, correct) {
    var key = storeKey, qIdx = origIndex;
    if (refs) {
      var r = refs[origIndex];
      key = r.cat; qIdx = r.idx;
    }
    updateKey(key, function (cur) {
      var m = cur.mastered || [];
      var pos = m.indexOf(qIdx);
      if (correct && pos < 0) m.push(qIdx);            // learned it
      else if (!correct && pos >= 0) m.splice(pos, 1); // slipped — resurface it
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

    var prevBest = ownState().best || 0;
    var isBest = pct > prevBest;
    updateKey(storeKey, function (cur) {
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
    var p = ownState().inProgress;
    var startBtn = el("start-btn");
    if (resumable(p)) {
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

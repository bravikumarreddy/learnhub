/* ===== LearnHub quiz engine =====
   Reads ?subject=xxx from the URL and loads window.QUIZZES[xxx].
*/
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var subject = params.get("subject") || "cpp";
  var quiz = (window.QUIZZES || {})[subject];

  var el = function (id) { return document.getElementById(id); };

  // Subject hub links (extend when you add subjects)
  var hubLinks = { cpp: "subject-cpp.html", "cpp-senior": "subject-cpp.html" };
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

  // Crumb + intro
  var subLabel = quiz.crumb || subject.toUpperCase();
  el("crumb-sub").innerHTML = '<a href="' + hub + '">' + subLabel + "</a>";
  el("quiz-title").textContent = quiz.title;
  el("quiz-subtitle").textContent = quiz.subtitle || "";

  var questions = quiz.questions;
  var idx = 0;
  var score = 0;
  var answered = false;
  var LETTERS = ["A", "B", "C", "D", "E", "F"];

  function show(section) {
    ["intro", "quiz", "result"].forEach(function (s) {
      el(s).classList.toggle("hidden", s !== section);
    });
  }

  function start() {
    idx = 0; score = 0;
    show("quiz");
    render();
  }

  function render() {
    answered = false;
    var q = questions[idx];

    el("q-count").textContent = "Question " + (idx + 1) + " of " + questions.length;
    el("q-score").textContent = "Score: " + score;
    el("bar-fill").style.width = (idx / questions.length) * 100 + "%";

    el("q-tag").textContent = q.tag || "Question";
    el("q-text").textContent = q.question;

    var codeEl = el("q-code");
    if (q.type === "code" && q.code) {
      codeEl.textContent = q.code;
      codeEl.classList.remove("hidden");
    } else {
      codeEl.classList.add("hidden");
    }

    // Options
    var box = el("options");
    box.innerHTML = "";
    q.options.forEach(function (opt, i) {
      var div = document.createElement("div");
      div.className = "option";
      div.innerHTML = '<span class="key">' + LETTERS[i] + "</span><span>" + escapeHtml(opt) + "</span>";
      div.addEventListener("click", function () { choose(i); });
      box.appendChild(div);
    });

    // Reset explain + next
    el("explain").classList.remove("show", "miss");
    el("next-btn").classList.add("hidden");
    el("feedback").textContent = "";
  }

  function choose(i) {
    if (answered) return;
    answered = true;
    var q = questions[idx];
    var opts = el("options").children;

    for (var k = 0; k < opts.length; k++) {
      opts[k].classList.add("disabled");
    }
    opts[q.answer].classList.add("correct");

    var explain = el("explain");
    if (i === q.answer) {
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

    el("explain-text").textContent = q.explain || "";
    explain.classList.add("show");
    el("q-score").textContent = "Score: " + score;

    var nextBtn = el("next-btn");
    nextBtn.textContent = idx === questions.length - 1 ? "See results →" : "Next →";
    nextBtn.classList.remove("hidden");
  }

  function next() {
    if (idx < questions.length - 1) {
      idx++;
      render();
    } else {
      finish();
    }
  }

  function finish() {
    show("result");
    var pct = Math.round((score / questions.length) * 100);
    el("ring").style.setProperty("--pct", pct + "%");
    el("ring-num").textContent = pct + "%";
    el("result-msg").textContent =
      "You scored " + score + " out of " + questions.length + ".";

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

  el("start-btn").addEventListener("click", start);
  el("retry-btn").addEventListener("click", start);
  el("next-btn").addEventListener("click", next);
})();

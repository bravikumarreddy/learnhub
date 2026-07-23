/* ===== LearnHub — C++ Reading Path data + renderer =====
   Book metadata (titles, authors, editions, ISBNs) is factual reference info.
   Links point ONLY to genuinely free / official sources. Paid books list the
   latest edition + standard so you can buy from a publisher or borrow.
*/
(function () {
  "use strict";

  var STAGES = [
    {
      num: "Stage 1",
      title: "Fundamentals & comprehensive references",
      sub: "Pick one starting path. If you already program, C++ Primer then A Tour of C++.",
      books: [
        { t: "Programming: Principles and Practice Using C++", a: "Bjarne Stroustrup", ed: "3rd ed. (2024)", std: "C++20/23", lvl: "Beginner", note: "The definitive learn-to-program-from-scratch book, fully modernized. Supersedes the 2014 edition." },
        { t: "Beginning C++23", a: "Ivor Horton & Peter Van Weert", ed: "7th ed. (2023)", std: "C++23", lvl: "Beginner", note: "Most up-to-date from-scratch tutorial; teaches modules, concepts, ranges. No prior programming assumed." },
        { t: "C++ Primer", a: "Lippman, Lajoie & Moo", ed: "5th ed. (2012)", std: "C++11", lvl: "Beginner–Int.", note: "Still the most recommended thorough tutorial. Stops at C++11 — no newer edition exists." },
        { t: "A Tour of C++", a: "Bjarne Stroustrup", ed: "3rd ed. (2022)", std: "C++20", lvl: "Intermediate", note: "254-page overview of all of standard C++: modules, concepts, coroutines, ranges. The latest edition." },
        { t: "Professional C++", a: "Marc Gregoire", ed: "6th ed. (2024)", std: "C++23", lvl: "Int.–Adv.", note: "Best single comprehensive reference-style book, covering almost all of C++23." },
        { t: "The C++ Programming Language", a: "Bjarne Stroustrup", ed: "4th ed. (2013)", std: "C++11", lvl: "Reference", note: "Superb reference but dated; largely superseded for learning by Tour + Professional C++. Read selectively.", dated: true }
      ]
    },
    {
      num: "Stage 2",
      title: "Best practices & idioms",
      sub: "Read Effective Modern C++, then work the Core Guidelines with Beautiful C++ as your guide.",
      books: [
        { t: "Effective Modern C++", a: "Scott Meyers", ed: "1st ed. (2014)", std: "C++11/14", lvl: "Intermediate", note: "Still the best single treatment of move semantics, perfect forwarding, smart pointers, lambdas, auto. Nothing past C++14." },
        { t: "C++ Core Guidelines", a: "Stroustrup & Sutter (eds.)", ed: "Living document", std: "Modern C++", lvl: "Reference", note: "The continuously-updated reference for modern best practices. Tool-checkable via clang-tidy / GSL.", free: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines" },
        { t: "Beautiful C++: 30 Core Guidelines for Writing Clean, Safe, and Fast Code", a: "J. Guy Davidson & Kate Gregory", ed: "1st ed. (2021)", std: "C++11–20", lvl: "Intermediate", note: "A friendly, curated on-ramp to the Core Guidelines. Excellent 'second book'." },
        { t: "Embracing Modern C++ Safely", a: "Lakos, Romeo, Khlebnikov & Meredith", ed: "1st ed. (2021)", std: "C++11/14", lvl: "Advanced", note: "Rigorously classifies features as Safe / Conditionally Safe / Unsafe. Reference-grade." },
        { t: "Effective C++", a: "Scott Meyers", ed: "3rd ed. (2005)", std: "C++98/03", lvl: "Intermediate", note: "Historically essential; much is now absorbed into the Core Guidelines. Read for principles; skip items obsoleted by C++11+.", dated: true },
        { t: "Exceptional C++ / C++ Coding Standards", a: "Herb Sutter (& Alexandrescu)", ed: "2000–2005", std: "C++98/03", lvl: "Intermediate", note: "Historically important, now largely dated. Skim for ideas — the Core Guidelines supersede most of it.", dated: true }
      ]
    },
    {
      num: "Stage 3",
      title: "Class design, OO & software design",
      sub: "Read Iglberger; skim GoF for vocabulary; add Pikus for more worked idioms.",
      books: [
        { t: "C++ Software Design: Design Principles and Patterns for High-Quality Software", a: "Klaus Iglberger", ed: "1st ed. (2022)", std: "Modern C++", lvl: "Int.–Adv.", note: "The standout modern design book: SOLID, dependency management, Strategy/Visitor/Type Erasure. Arguably the single most important design book of the era." },
        { t: "Hands-On Design Patterns with C++", a: "Fedor Pikus", ed: "2nd ed. (2023)", std: "C++17/20", lvl: "Int.–Adv.", note: "Practical, idiom-heavy: CRTP, type erasure, policy-based design." },
        { t: "Design Patterns in Modern C++20", a: "Dmitri Nesteruk", ed: "2nd ed. (2022)", std: "C++20", lvl: "Intermediate", note: "GoF patterns reimplemented with modern features — coroutines, modules, concepts." },
        { t: "Design Patterns: Elements of Reusable Object-Oriented Software", a: "Gamma, Helm, Johnson & Vlissides (GoF)", ed: "1st ed. (1994)", std: "Pre-C++11", lvl: "Foundational", note: "Foundational vocabulary; dated C++ but timeless concepts. Read once for vocabulary, then Iglberger for modern implementations.", dated: true }
      ]
    },
    {
      num: "Stage 4",
      title: "Templates, generic programming & the standard library",
      sub: "Vandevoorde for depth, Bancila for C++20 concepts, Josuttis as STL reference.",
      books: [
        { t: "C++ Templates: The Complete Guide", a: "Vandevoorde, Josuttis & Gregor", ed: "2nd ed. (2017)", std: "C++11/14/17", lvl: "Int.–Adv.", note: "The definitive templates reference. Still unmatched, though it predates C++20 concepts." },
        { t: "Template Metaprogramming with C++", a: "Marius Bancila", ed: "1st ed. (2022)", std: "C++20", lvl: "Int.–Adv.", note: "Modern companion: constraints, concepts, CRTP, mixins, type erasure, ranges. Fills the C++20 gap in Vandevoorde." },
        { t: "The C++ Standard Library: A Tutorial and Reference", a: "Nicolai Josuttis", ed: "2nd ed. (2012)", std: "C++11", lvl: "Int.–Adv.", note: "The definitive STL reference. Stops at C++11 — no C++17/20 library features. No 3rd edition exists." },
        { t: "Modern C++ Design: Generic Programming and Design Patterns Applied", a: "Andrei Alexandrescu", ed: "1st ed. (2001)", std: "C++98", lvl: "Advanced", note: "Groundbreaking (policy-based design, typelists) but heavily dated by modern features. Read for ideas, not techniques.", dated: true }
      ]
    },
    {
      num: "Stage 4/6",
      title: "C++20 / C++23 language & library",
      sub: "Josuttis is the most thorough single C++20 treatment; Grimm is a worked-example alternative.",
      books: [
        { t: "C++20 — The Complete Guide", a: "Nicolai Josuttis", ed: "1st ed. (2022)", std: "C++20", lvl: "Int.–Adv.", note: "The most thorough single treatment of all C++20 language & library features: concepts, ranges, coroutines, modules." },
        { t: "C++20: Get the Details", a: "Rainer Grimm", ed: "(2021)", std: "C++20", lvl: "Int.–Adv.", note: "An alternative comprehensive C++20 tour with many worked examples." },
        { t: "C++17 — The Complete Guide", a: "Nicolai Josuttis", ed: "1st ed. (2019)", std: "C++17", lvl: "Int.–Adv.", note: "Still useful: structured bindings, optional/variant/any, if constexpr, parallel algorithms." }
      ]
    },
    {
      num: "Stage 5",
      title: "Concurrency & performance",
      sub: "Williams + Grimm for concurrency; Pikus + Andrist for performance; Bakhvalov & Fog for the metal.",
      books: [
        { t: "C++ Concurrency in Action", a: "Anthony Williams", ed: "2nd ed. (2019)", std: "C++17", lvl: "Int.–Adv.", note: "The definitive concurrency book: threads, memory model, atomics, lock-free, parallel algorithms. Pre-C++20 (no coroutines/jthread)." },
        { t: "Concurrency with Modern C++", a: "Rainer Grimm", ed: "Updated 2024", std: "→ C++23", lvl: "Int.–Adv.", note: "~700 pages, 200+ examples. Covers coroutines, latches/barriers/semaphores, lock-free, C++23 std::generator. Best complement to Williams." },
        { t: "The Art of Writing Efficient Programs", a: "Fedor Pikus", ed: "1st ed. (2021)", std: "C++17/20", lvl: "Advanced", note: "CPU architecture, measurement (perf, Google Benchmark), concurrency, lock-free, compiler optimizations. Best all-round modern perf book." },
        { t: "C++ High Performance", a: "Björn Andrist & Viktor Sehr", ed: "2nd ed. (2020)", std: "C++20", lvl: "Int.–Adv.", note: "Data-structure & memory optimization, custom allocators, ranges, coroutines, parallel algorithms." },
        { t: "Performance Analysis and Tuning on Modern CPUs", a: "Denis Bakhvalov", ed: "2nd ed. (2024)", std: "Lang-agnostic", lvl: "Advanced", note: "Tools (Linux perf, Intel VTune), microarchitecture, top-down analysis. A free 1st-edition (2020, CC BY 4.0) is available.", free: "https://github.com/dendibakh/perf-book" },
        { t: "Optimized C++", a: "Kurt Guntheroth", ed: "1st ed. (2016)", std: "C++11", lvl: "Intermediate", note: "Practical optimization techniques. Slightly dated but still useful." },
        { t: "Agner Fog's optimization manuals", a: "Agner Fog", ed: "Continuously updated", std: "x86", lvl: "Advanced", note: "The canonical free low-level x86 optimization references.", free: "https://www.agner.org/optimize/" }
      ]
    },
    {
      num: "Stage 6",
      title: "Architecture, APIs & tooling",
      sub: "Lakos for physical design, Reddy for APIs, CMake books for the build.",
      books: [
        { t: "Large-Scale C++, Volume I: Process and Architecture", a: "John Lakos", ed: "1st ed. (2019)", std: "Modern C++", lvl: "Advanced", note: "Physical design, components, dependency management at scale (~1000 pp). Volumes II & III remain unpublished — don't count on them." },
        { t: "API Design for C++", a: "Martin Reddy", ed: "2nd ed. (2024)", std: "→ C++23", lvl: "Int.–Adv.", note: "The only comprehensive book on C++ API design: interfaces, versioning, testing, plug-ins. 2nd ed. adds concurrency + Swift/Obj-C++ interop chapters." },
        { t: "Modern CMake for C++", a: "Rafał Świdziński", ed: "2nd ed. (2024)", std: "—", lvl: "Beg.–Int.", note: "Rewritten end-to-end CMake tutorial incl. C++20 modules support. Better starting point than Scott's reference." },
        { t: "Professional CMake: A Practical Guide", a: "Craig Scott", ed: "22nd ed. (2026)", std: "CMake 4.2", lvl: "Int.–Adv.", note: "By a CMake co-maintainer; the definitive CMake reference, updated with each release." }
      ]
    },
    {
      num: "Specialize",
      title: "Advanced & specialist topics",
      sub: "Read these by domain once the core path is done.",
      books: [
        { t: "Real-Time C++", a: "Christopher Kormanyos", ed: "4th ed. (2021)", std: "Modern C++", lvl: "Specialist", note: "Embedded / real-time C++ on microcontrollers." },
        { t: "Functional Programming in C++", a: "Ivan Čukić", ed: "1st ed. (2018/19)", std: "C++17", lvl: "Int.–Adv.", note: "Higher-order functions, immutability, ranges, lazy evaluation, algebraic data types. For devs with 2+ years of C++." }
      ]
    }
  ];

  // ---- render ----
  var stagesEl = document.getElementById("stages");
  var searchEl = document.getElementById("search");
  var countEl = document.getElementById("count");
  var noMatchEl = document.getElementById("no-match");

  var totalBooks = STAGES.reduce(function (n, s) { return n + s.books.length; }, 0);

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function bookHTML(b) {
    var tags = '<span class="tag ed">' + esc(b.ed) + "</span>";
    if (b.std && b.std !== "—") tags += '<span class="tag std">' + esc(b.std) + "</span>";
    tags += '<span class="tag lvl">' + esc(b.lvl) + "</span>";
    if (b.free) tags += '<span class="tag free">Free</span>';
    if (b.dated) tags += '<span class="tag dated">Dated</span>';

    var link = b.free
      ? '<a class="book-link" href="' + esc(b.free) + '" target="_blank" rel="noopener">Read free →</a>'
      : "";

    return (
      '<div class="book" data-search="' + esc((b.t + " " + b.a + " " + b.std + " " + b.ed).toLowerCase()) + '">' +
        '<div class="book-main">' +
          '<p class="book-title">' + esc(b.t) + "</p>" +
          '<p class="book-by">' + esc(b.a) + "</p>" +
          '<div class="tags">' + tags + "</div>" +
          '<p class="book-note">' + esc(b.note) + "</p>" +
        "</div>" +
        '<div class="book-side">' + link + "</div>" +
      "</div>"
    );
  }

  function render() {
    var html = "";
    STAGES.forEach(function (s) {
      html +=
        '<section class="stage">' +
          '<div class="stage-head"><span class="stage-num">' + esc(s.num) + "</span>" +
            "<h2>" + esc(s.title) + "</h2></div>" +
          '<p class="stage-sub">' + esc(s.sub) + "</p>" +
          s.books.map(bookHTML).join("") +
        "</section>";
    });
    stagesEl.innerHTML = html;
    countEl.textContent = totalBooks + " books · 6 stages";
  }

  function applyFilter() {
    var q = searchEl.value.trim().toLowerCase();
    var books = stagesEl.querySelectorAll(".book");
    var stages = stagesEl.querySelectorAll(".stage");
    var shown = 0;

    books.forEach(function (el) {
      var match = !q || el.getAttribute("data-search").indexOf(q) >= 0;
      el.classList.toggle("hidden", !match);
      if (match) shown++;
    });
    // hide a stage whose books are all filtered out
    stages.forEach(function (st) {
      var anyVisible = st.querySelectorAll(".book:not(.hidden)").length > 0;
      st.classList.toggle("hidden", !anyVisible);
    });

    noMatchEl.classList.toggle("hidden", shown > 0);
    countEl.textContent = q
      ? shown + " of " + totalBooks + " books"
      : totalBooks + " books · 6 stages";
  }

  render();
  searchEl.addEventListener("input", applyFilter);
})();

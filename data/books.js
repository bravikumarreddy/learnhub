/* ===== LearnHub book registry =====
   Each book groups a set of question-bank categories (data/*.js subjects).
   To add a new book:
     1. Add its category data files (window.QUIZZES["<id>"] = {...}) under data/,
     2. Include those files in quiz.html AND subject-cpp.html,
     3. Append one entry here with the category ids in reading order.
   The subject page renders one section per book (category cards + a Random
   card), and quiz.html?book=<id> runs all of the book's questions shuffled,
   with every answer counting toward that category's own progress.
*/
window.BOOKS = [
  {
    id: "cpp-primer",
    title: "C++ Primer (5th Edition)",
    icon: "📕",
    hub: "subject-cpp.html",
    description: "Lippman, Lajoie & Moo — a gotcha-focused walkthrough of the whole language. Every question is verified, non-trivial, and shown in random order.",
    categories: [
      { id: "cpp-types",      icon: "🔤", title: "Types, Expressions & Statements",
        blurb: "Initialization, const & references, conversions, precedence, order-of-evaluation and control-flow traps." },
      { id: "cpp-containers", icon: "📦", title: "Strings, Containers & Iterators",
        blurb: "std::string, vector & capacity, iterator invalidation, and raw arrays / pointer arithmetic." },
      { id: "cpp-functions",  icon: "🧩", title: "Functions & Lambdas",
        blurb: "Parameter passing, overload resolution, default args, and lambda captures / dangling closures." },
      { id: "cpp-classes",    icon: "🏛️", title: "Classes & Operators",
        blurb: "const members, init order, delegating constructors, explicit, and operator overloading." },
      { id: "cpp-memory",     icon: "♻️", title: "Copy, Move & Memory",
        blurb: "Rule of three/five, move semantics, RVO, and unique_ptr / shared_ptr ownership." },
      { id: "cpp-oop",        icon: "🧬", title: "Inheritance & Polymorphism",
        blurb: "Virtual dispatch, object slicing, virtual destructors, name hiding and abstract classes." },
      { id: "cpp-templates",  icon: "⚙️", title: "Templates & the STL",
        blurb: "Function/class templates, specialization, dependent names, and generic algorithms." },
      { id: "cpp-advanced",   icon: "🛡️", title: "Exceptions, Scope & I/O",
        blurb: "Exception safety & RAII, noexcept, namespaces / ADL, and iostream formatting pitfalls." }
    ]
  }
];

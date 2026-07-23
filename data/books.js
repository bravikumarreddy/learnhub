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
  },
  {
    id: "professional-cpp",
    title: "Professional C++ (6th Edition)",
    icon: "📗",
    hub: "subject-cpp.html",
    description: "Marc Gregoire — the professional level-up: modern C++20/23 idioms, smart-pointer mastery, templates & concepts, ranges, concurrency and exception safety. Interview-grade questions.",
    categories: [
      { id: "procpp-strings",     icon: "🧵", title: "Strings, string_view & Formatting",
        blurb: "std::string internals, string_view lifetime traps, conversions, and std::format." },
      { id: "procpp-memory",      icon: "🧠", title: "Smart Pointers & Memory Mastery",
        blurb: "unique_ptr/shared_ptr internals, weak_ptr, aliasing, custom deleters and allocation traps." },
      { id: "procpp-move",        icon: "🚚", title: "Move Semantics & Value Categories",
        blurb: "Value categories, perfect forwarding, ref-qualifiers, RVO/NRVO and moved-from states." },
      { id: "procpp-templates",   icon: "🧬", title: "Templates, Concepts & Metaprogramming",
        blurb: "Deduction, specialization, variadics, C++20 concepts, CTAD and constexpr programming." },
      { id: "procpp-stdlib",      icon: "📚", title: "Containers, Algorithms & Ranges",
        blurb: "Container guarantees, heterogeneous lookup, erase-remove, C++20 ranges and views." },
      { id: "procpp-errors",      icon: "🚨", title: "Error Handling & Exception Safety",
        blurb: "Exception guarantees, noexcept semantics, stack unwinding, error codes and std::expected." },
      { id: "procpp-concurrency", icon: "⚡", title: "Threads, Atomics & Coroutines",
        blurb: "jthread, mutexes, condition variables, atomics & memory ordering, futures and coroutines." },
      { id: "procpp-modern",      icon: "✨", title: "Modern Language Features",
        blurb: "Lambdas in depth, spaceship operator, modules, designated initializers, chrono and vocabulary types." }
    ]
  }
];

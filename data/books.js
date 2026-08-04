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
  },
  {
    id: "cpp-software-design",
    title: "C++ Software Design (Iglberger)",
    icon: "📘",
    hub: "subject-cpp.html",
    description: "Klaus Iglberger — design principles and patterns for high-quality modern C++: SOLID, value semantics, visitor/strategy/observer done right, CRTP, and type erasure. Architecture-level interview questions.",
    categories: [
      { id: "swd-principles",  icon: "🧭", title: "Design Principles & SOLID",
        blurb: "SRP, OCP, LSP, ISP, DIP applied to real C++ — spotting violations and the cost of coupling." },
      { id: "swd-abstractions", icon: "🏗️", title: "Abstractions & Interfaces",
        blurb: "Semantic requirements of abstractions, LSP contracts, dependency graphs and architecture boundaries." },
      { id: "swd-visitor",     icon: "🎯", title: "Visitor & std::variant",
        blurb: "Type extension vs operation extension, classic visitor, std::variant + overload, acyclic visitor." },
      { id: "swd-strategy",    icon: "🔌", title: "Strategy, Command & std::function",
        blurb: "Behavior injection, strategy vs command, std::function-based design and its costs." },
      { id: "swd-structural",  icon: "🌉", title: "Adapter, Observer, Bridge & Prototype",
        blurb: "Interface adaptation, push/pull observers, pimpl as bridge, clone and prototype semantics." },
      { id: "swd-typeerasure", icon: "🎭", title: "External Polymorphism & Type Erasure",
        blurb: "Manual vtables, owning vs non-owning erasure, SBO, and the type-erasure pattern end to end." },
      { id: "swd-static",      icon: "⚙️", title: "CRTP, Concepts & Static Polymorphism",
        blurb: "CRTP interfaces and mixins, C++20 concepts as the modern replacement, compile-time vs runtime dispatch." },
      { id: "swd-value",       icon: "💎", title: "Value Semantics, Decorator & Singleton",
        blurb: "Value-based design, decorator at runtime and compile time, and why singletons hurt testability." }
    ]
  },
  {
    id: "templates-complete-guide",
    title: "C++ Templates: The Complete Guide",
    icon: "📐",
    hub: "subject-cpp.html",
    description: "Vandevoorde, Josuttis & Gregor — the definitive deep dive on templates: deduction, specialization, two-phase lookup, SFINAE and template-based design. Expert-level questions on every corner of the template system.",
    categories: [
      { id: "templ-basics",    icon: "🧱", title: "Function & Class Templates",
        blurb: "Function/class template basics, lazy instantiation, member templates, the inclusion model and default template arguments." },
      { id: "templ-nontype",   icon: "🔢", title: "Nontype & Variadic Templates",
        blurb: "Nontype parameter restrictions, auto nontype params, parameter packs, pack expansion and C++17 fold expressions." },
      { id: "templ-tricky",    icon: "🪤", title: "Tricky Basics & Dependent Names",
        blurb: "typename & .template disambiguation, this-> in dependent bases, zero init, and raw arrays / string literals as arguments." },
      { id: "templ-deduction", icon: "🎯", title: "Argument Deduction & CTAD",
        blurb: "Deduced vs non-deduced contexts, decay, reference collapsing, forwarding references, braced-init traps and C++17 CTAD." },
      { id: "templ-overload",  icon: "⚖️", title: "Overloading & Specialization",
        blurb: "Function-template overloading & partial ordering, class-template full/partial specialization, and specialization pitfalls." },
      { id: "templ-names",     icon: "🔎", title: "Names, Lookup & Instantiation",
        blurb: "Two-phase lookup, dependent names & ADL, injected-class-name, points of instantiation and extern/explicit instantiation." },
      { id: "templ-traits",    icon: "🧪", title: "Type Traits, SFINAE & enable_if",
        blurb: "The type_traits library, writing traits, SFINAE & the immediate-context rule, enable_if, void_t detection and if constexpr." },
      { id: "templ-design",    icon: "📐", title: "Templates & Design",
        blurb: "Static vs dynamic polymorphism, CRTP & mixins, type erasure, expression templates, policy classes and metaprogramming." }
    ]
  }
];

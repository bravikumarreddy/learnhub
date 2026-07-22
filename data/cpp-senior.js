/* ===== C++ question bank — Senior level =====
   Same shape as data/cpp.js:
   - type: "mcq" (plain question) or "code" (shows a code snippet)
   - options: array of answer strings
   - answer: index (0-based) of the correct option
   - explain: shown after the user answers
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-senior"] = {
  title: "C++ Quiz — Senior",
  subtitle: "Object lifetime, move semantics, templates, concurrency and UB — with explanations",
  crumb: "C++",
  questions: [
    {
      type: "code",
      tag: "Virtual dispatch",
      question: "What does this program print?",
      code: "#include <iostream>\nstruct Base {\n    Base() { print(); }\n    virtual void print() const { std::cout << \"Base\"; }\n};\nstruct Derived : Base {\n    void print() const override { std::cout << \"Derived\"; }\n};\nint main() { Derived d; }",
      options: ["Base", "Derived", "BaseDerived", "Undefined behaviour — it crashes"],
      answer: 0,
      explain: "During Base's constructor the object is still only a Base: the vptr has not yet been retargeted to Derived's vtable. Virtual calls made from a constructor (or destructor) resolve to the class currently being constructed, so Base::print runs and it prints \"Base\"."
    },
    {
      type: "code",
      tag: "Slicing",
      question: "What is the output?",
      code: "#include <iostream>\nstruct A { virtual const char* who() const { return \"A\"; } };\nstruct B : A { const char* who() const override { return \"B\"; } };\nvoid show(A a) { std::cout << a.who(); }\nint main() { B b; show(b); }",
      options: ["A", "B", "AB", "Compiler error — A is abstract"],
      answer: 0,
      explain: "show takes A *by value*, so passing a B copy-constructs an A from the B sub-object — the derived part is sliced off. The parameter really is an A, so the virtual call resolves to A::who and prints \"A\". Take A& or const A& to keep polymorphism."
    },
    {
      type: "mcq",
      tag: "Move semantics",
      question: "Why does std::vector's reallocation fall back to copying elements when the element's move constructor is not marked noexcept?",
      options: [
        "Moving is slower than copying for non-noexcept types",
        "The standard forbids moving objects that can throw",
        "Because non-noexcept moves are not considered move constructors at all",
        "To preserve the strong exception guarantee — if a move threw mid-way the old buffer could not be restored"
      ],
      answer: 3,
      explain: "vector::push_back offers the strong guarantee. Copying leaves the source elements intact, so a throw mid-reallocation can be unwound cleanly; a throwing move would have already gutted some source elements with no way back. move_if_noexcept picks moves only when they cannot throw — one reason to mark move operations noexcept."
    },
    {
      type: "code",
      tag: "Const & move",
      question: "Which constructor of S runs on the marked line?",
      code: "#include <utility>\nstruct S {\n    S();\n    S(const S&);   // copy\n    S(S&&);        // move\n};\nvoid f() {\n    const S a;\n    S b = std::move(a);   // <-- here\n}",
      options: ["The move constructor", "Neither — this fails to compile", "The copy constructor", "The move constructor, then the copy constructor"],
      answer: 2,
      explain: "std::move(a) on a const S yields a const S&&. That cannot bind to S&& (the move ctor's parameter), but it binds happily to const S&, so overload resolution silently picks the copy constructor. Moving from const objects is a classic silent pessimisation."
    },
    {
      type: "code",
      tag: "Initialisation order",
      question: "What is wrong with this class?",
      code: "struct S {\n    int x;\n    int y;\n    S(int v) : y(v), x(y * 2) {}\n};",
      options: [
        "Nothing — members are initialised in the order written in the init-list",
        "It fails to compile because the init-list order differs from declaration order",
        "x is initialised before y (declaration order), so it reads an uninitialised y — undefined behaviour",
        "y is initialised twice"
      ],
      answer: 2,
      explain: "Members are always initialised in *declaration* order, regardless of the order in the mem-initialiser list. Here x is initialised first from y, which has not been initialised yet — undefined behaviour. Most compilers warn about this with -Wreorder."
    },
    {
      type: "code",
      tag: "Type deduction",
      question: "What are the deduced types of a and b?",
      code: "int x = 0;\ndecltype(x)   a = x;\ndecltype((x)) b = x;",
      options: ["Both are int", "a is int, b is int&", "a is int&, b is int", "Both are int&"],
      answer: 1,
      explain: "decltype on an unparenthesised id-expression gives the declared type of the entity: int. Adding parentheses makes it an lvalue *expression*, and decltype of an lvalue expression of type int is int&. Hence b is a reference bound to x."
    },
    {
      type: "mcq",
      tag: "Templates",
      question: "In `template <typename T> void f(T&& arg);`, what is T deduced as when you call `f(x)` with `int x = 0;`?",
      options: ["int&&", "int", "const int&", "int&"],
      answer: 3,
      explain: "T&& in a deduced context is a forwarding (universal) reference. For an lvalue argument T deduces to int&, and reference collapsing makes the parameter int& &&  →  int&. For an rvalue argument T would deduce to plain int. This is exactly why std::forward<T> needs T spelled out."
    },
    {
      type: "code",
      tag: "Lifetime",
      question: "What is the problem with this code?",
      code: "#include <string>\n#include <string_view>\nstd::string_view label() {\n    std::string s = \"hello\";\n    return s + \" world\";\n}",
      options: [
        "The returned view dangles: it points at a temporary std::string destroyed at the end of the return statement",
        "Nothing — string_view copies the characters",
        "It fails to compile — std::string does not convert to string_view",
        "It leaks the temporary string"
      ],
      answer: 0,
      explain: "string_view is a non-owning pointer+length. `s + \" world\"` creates a temporary std::string, the view is built from it, and the temporary dies when the full expression ends — so the caller reads freed memory. Return std::string when you must own the characters."
    },
    {
      type: "code",
      tag: "Parsing",
      question: "Why does this fail to compile at the marked line?",
      code: "struct Timer {};\nstruct Keeper {\n    Keeper(Timer t) {}\n    int get() const { return 1; }\n};\nint main() {\n    Keeper k(Timer());\n    return k.get();   // <-- error here\n}",
      options: [
        "Timer has no default constructor",
        "Most vexing parse: `Keeper k(Timer());` declares a function, not an object",
        "Keeper's constructor should take Timer by reference",
        "get() must not be const"
      ],
      answer: 1,
      explain: "`Keeper k(Timer());` is parsed as the declaration of a function k returning Keeper and taking a (pointer-to-)function returning Timer. So k is a function name and k.get() is nonsense. Brace initialisation — `Keeper k{Timer{}};` — avoids the ambiguity."
    },
    {
      type: "mcq",
      tag: "Smart pointers",
      question: "Two objects hold std::shared_ptr to each other. What happens, and what fixes it?",
      options: [
        "Nothing — the collector breaks cycles automatically",
        "The program crashes with a double free; use unique_ptr instead",
        "std::shared_ptr refuses to form the cycle and throws",
        "The reference counts never reach zero, so neither is destroyed; make one link a std::weak_ptr"
      ],
      answer: 3,
      explain: "shared_ptr is reference counted, not tracing. A cycle keeps each count at ≥1 forever, so destructors never run and the memory leaks. Making the back-edge a weak_ptr (which does not contribute to the strong count) breaks the cycle; lock() it to use it."
    },
    {
      type: "code",
      tag: "Undefined behaviour",
      question: "Which statement about these two functions is correct?",
      code: "int  f(int  a) { return a + 1; }   // a == INT_MAX\nunsigned g(unsigned a) { return a + 1; } // a == UINT_MAX",
      options: [
        "Both wrap around to their minimum value",
        "f is undefined behaviour; g is well defined and wraps to 0",
        "Both are undefined behaviour",
        "f wraps to INT_MIN; g is undefined behaviour"
      ],
      answer: 1,
      explain: "Signed integer overflow is undefined behaviour — the optimiser may assume it never happens (e.g. folding `a + 1 > a` to true). Unsigned arithmetic is defined to be modulo 2^N, so UINT_MAX + 1 is exactly 0."
    },
    {
      type: "code",
      tag: "STL",
      question: "What does this print?",
      code: "#include <iostream>\n#include <map>\n#include <string>\nint main() {\n    std::map<std::string, int> m;\n    if (m[\"a\"] == 0)\n        std::cout << m.size();\n}",
      options: ["Nothing — the condition is false", "0", "Undefined behaviour", "1"],
      answer: 3,
      explain: "map::operator[] default-inserts a value-initialised element when the key is missing, so m[\"a\"] creates the entry (int 0) and the size becomes 1. Use find() or contains() for a lookup that does not mutate the map — and note operator[] is not available on const maps."
    },
    {
      type: "mcq",
      tag: "Exceptions",
      question: "What happens if a destructor throws while an exception is already propagating during stack unwinding?",
      options: [
        "The new exception replaces the old one",
        "Both exceptions are merged and rethrown",
        "std::terminate is called",
        "The destructor's exception is silently swallowed"
      ],
      answer: 2,
      explain: "Two exceptions cannot propagate at once, so the runtime calls std::terminate. That is why destructors are implicitly noexcept since C++11 — a destructor that can fail must catch and handle (or log) internally rather than letting the exception escape."
    },
    {
      type: "code",
      tag: "Polymorphism",
      question: "What is the defect here?",
      code: "#include <vector>\nstruct Base { ~Base() {} };\nstruct Derived : Base { std::vector<int> data; };\nvoid f() {\n    Base* p = new Derived;\n    delete p;\n}",
      options: [
        "delete should be delete[]",
        "Derived needs a user-declared destructor",
        "Nothing — the compiler generates a virtual destructor automatically",
        "Base's destructor is not virtual, so `delete p` through a Base* is undefined behaviour and Derived's members are never destroyed"
      ],
      answer: 3,
      explain: "Deleting a derived object through a pointer to a base with a non-virtual destructor is UB; in practice ~Derived never runs, so the vector leaks. A polymorphic base needs either a public virtual destructor or a protected non-virtual one."
    },
    {
      type: "mcq",
      tag: "Casts",
      question: "What happens if you apply dynamic_cast to a pointer whose static type has no virtual functions?",
      options: [
        "It compiles and returns nullptr at runtime",
        "It behaves exactly like static_cast",
        "It throws std::bad_cast",
        "It is a compile-time error — dynamic_cast requires a polymorphic type"
      ],
      answer: 3,
      explain: "dynamic_cast needs RTTI, which only exists for polymorphic types (at least one virtual function), so a downcast from a non-polymorphic type is rejected at compile time. Separately: a failed dynamic_cast on a *pointer* yields nullptr, while on a *reference* it throws std::bad_cast."
    },
    {
      type: "code",
      tag: "Iterators",
      question: "What is wrong with this loop?",
      code: "#include <vector>\nvoid f(std::vector<int>& v) {\n    for (auto it = v.begin(); it != v.end(); ++it)\n        if (*it % 2 == 0)\n            v.push_back(*it);\n}",
      options: [
        "Nothing — vector iterators stay valid",
        "It should use v.cbegin()",
        "push_back may reallocate, invalidating it and v.end() — undefined behaviour (and the loop may never terminate)",
        "push_back cannot be called on a reference parameter"
      ],
      answer: 2,
      explain: "Any push_back that exceeds capacity reallocates the buffer and invalidates *all* iterators, references and pointers into the vector — including the cached comparison against end(). Collect into a separate container, or reserve enough capacity up front and index by position instead."
    },
    {
      type: "mcq",
      tag: "Concurrency",
      question: "What is the default memory ordering for operations on std::atomic, such as `x.store(1);`?",
      options: [
        "std::memory_order_relaxed",
        "std::memory_order_acquire for loads and release for stores",
        "It is implementation defined",
        "std::memory_order_seq_cst"
      ],
      answer: 3,
      explain: "The default is memory_order_seq_cst — sequential consistency, the strongest and easiest to reason about, giving a single total order over all seq_cst operations. It can be the most expensive (often a fence on x86 stores), so weaker orderings are an explicit opt-in once you have proven they are safe."
    },
    {
      type: "code",
      tag: "Statics",
      question: "Is this lazy singleton thread-safe in C++11 and later?",
      code: "Config& instance() {\n    static Config cfg;   // <-- initialised on first call\n    return cfg;\n}",
      options: [
        "No — you must guard it with a mutex or std::call_once",
        "Yes, but only if Config's constructor is noexcept",
        "Yes — initialisation of a function-local static is guaranteed thread-safe; concurrent callers block until it completes",
        "Only if the function is marked inline"
      ],
      answer: 2,
      explain: "Since C++11 the standard requires \"magic statics\": the first thread to reach the declaration performs the initialisation while others wait. This also sidesteps the static initialisation order fiasco, since the object is created on first use rather than at namespace-scope startup."
    },
    {
      type: "code",
      tag: "Templates",
      question: "Why does this fail to compile?",
      code: "template <typename T>\nstruct Wrapper {\n    typename T::value_type get() const;\n};\n\ntemplate <typename T>\nvoid f() {\n    T::value_type x;   // <-- error\n}",
      options: [
        "T::value_type is a dependent name, so it needs the `typename` keyword to be parsed as a type",
        "T::value_type does not exist",
        "Templates cannot declare local variables",
        "f must be declared inline"
      ],
      answer: 0,
      explain: "Inside a template the compiler cannot know whether the dependent name T::value_type is a type or a static member, and it assumes non-type by default. You must write `typename T::value_type x;` (as the member function above correctly does). The analogous rule for member templates is the `template` disambiguator."
    },
    {
      type: "code",
      tag: "Overload resolution",
      question: "What does this print?",
      code: "#include <iostream>\nstruct Base {\n    void f(int)    { std::cout << \"Base::f(int)\"; }\n};\nstruct Derived : Base {\n    void f(double) { std::cout << \"Derived::f(double)\"; }\n};\nint main() { Derived d; d.f(1); }",
      options: ["Base::f(int)", "Ambiguous — compiler error", "Derived::f(double)", "Nothing — f(int) is hidden and 1 does not convert"],
      answer: 2,
      explain: "Name lookup stops at the first scope containing the name: Derived::f *hides* every Base::f overload, so Base::f(int) is never considered and the int is converted to double. Write `using Base::f;` in Derived to pull the base overloads into the overload set."
    }
  ]
};

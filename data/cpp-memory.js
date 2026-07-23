/* ===== C++ — Copy, Move & Memory =====
   Original question bank generated for LearnHub. Engine shape:
   { type: "mcq"|"code", tag, question, code?, options[], answer (0-based), explain }
   69 questions. Presented in random order by the quiz engine.
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-memory"] = {
  title: "C++ — Copy, Move & Memory",
  subtitle: "Copy control, move semantics, RVO & smart pointers.",
  crumb: "C++",
  questions: [
    {
      "type": "code",
      "tag": "Rule of Three",
      "question": "This class manages a raw pointer but only defines a destructor. What is the primary danger?",
      "code": "#include <cstring>\n#include <cstdlib>\nstruct Buf {\n    char* p;\n    Buf(const char* s) { p = strdup(s); }\n    ~Buf() { free(p); }\n};\nint main() {\n    Buf a(\"hello\");\n    Buf b = a;   // copy\n    return 0;\n}",
      "options": [
        "It compiles and runs cleanly; each object owns its own copy",
        "The compiler-generated copy constructor does a shallow copy, so both objects free the same pointer -> double free (UB)",
        "It fails to compile because no copy constructor is declared",
        "strdup leaks because the destructor never runs"
      ],
      "answer": 1,
      "explain": "Declaring a destructor does NOT suppress the implicit copy constructor, which copies the pointer value bitwise. Both a and b end up with the same p and both destructors call free on it -> double free. The Rule of Three says once you write one of dtor/copy-ctor/copy-assign for resource management you almost always need all three."
    },
    {
      "type": "code",
      "tag": "Self-Assignment",
      "question": "What is the bug in this copy-assignment operator?",
      "code": "struct S {\n    int* data;\n    int  n;\n    S& operator=(const S& o) {\n        delete[] data;\n        n = o.n;\n        data = new int[n];\n        for (int i = 0; i < n; ++i) data[i] = o.data[i];\n        return *this;\n    }\n};",
      "options": [
        "It leaks because it never checks for allocation failure",
        "It is not self-assignment safe: on x = x it deletes data before reading from o.data (dangling read, UB)",
        "It fails to return a reference for chaining",
        "Nothing is wrong; it is a correct deep copy"
      ],
      "answer": 1,
      "explain": "On self-assignment (x = x), this and o are the same object. delete[] data frees the buffer, then the copy loop reads from o.data which is now dangling -> UB. Fix with a self-check, or better, use copy-and-swap which is inherently self-assignment safe."
    },
    {
      "type": "mcq",
      "tag": "Copy-and-Swap",
      "question": "Why is the copy-and-swap idiom's assignment operator conventionally written taking its parameter BY VALUE, as in S& operator=(S other)?",
      "options": [
        "To avoid needing a copy constructor at all",
        "So the copy is made in the parameter, reusing the copy constructor and giving strong exception safety plus automatic self-assignment safety",
        "Because passing by reference would cause infinite recursion",
        "So the operator can be marked noexcept"
      ],
      "answer": 1,
      "explain": "Taking the argument by value performs the copy up front (via the copy constructor) before any of *this is touched; if that copy throws, *this is untouched (strong guarantee). Then you swap. Self-assignment is safe because you swap with an independent copy. Passing by reference would force a manual copy inside and lose these benefits."
    },
    {
      "type": "code",
      "tag": "Deleted Copy",
      "question": "Does this compile, and if not why?",
      "code": "#include <mutex>\nstruct Widget {\n    std::mutex m;\n    int value;\n};\nint main() {\n    Widget a;\n    Widget b = a;   // (1)\n    return 0;\n}",
      "options": [
        "Compiles; the mutex is copied along with value",
        "Does not compile: std::mutex is non-copyable, so Widget's implicit copy constructor is defined as deleted",
        "Compiles but the mutex copy is undefined behavior at runtime",
        "Does not compile: mutex must be initialized explicitly"
      ],
      "answer": 1,
      "explain": "std::mutex has a deleted copy constructor. When a member is non-copyable, the compiler implicitly defines the containing class's copy constructor as deleted, so line (1) is ill-formed. This is how the compiler propagates non-copyability of members."
    },
    {
      "type": "code",
      "tag": "Rule of Zero",
      "question": "How many special members must this class manually define to be copy-correct?",
      "code": "#include <string>\n#include <vector>\nstruct Record {\n    std::string name;\n    std::vector<int> scores;\n};",
      "options": [
        "Three: copy ctor, copy assign, destructor",
        "Five: also move ctor and move assign",
        "Zero: the compiler-generated members correctly deep-copy the members",
        "One: only the destructor"
      ],
      "answer": 2,
      "explain": "This is the Rule of Zero. Because std::string and std::vector already manage their own resources with correct copy/move/destroy semantics, the compiler-synthesized special members do the right thing memberwise. Writing any of them by hand would be redundant and error-prone."
    },
    {
      "type": "code",
      "tag": "Move Suppression",
      "question": "After this class definition, what happens when you 'move' a Holder?",
      "code": "#include <utility>\n#include <vector>\nstruct Holder {\n    std::vector<int> v;\n    ~Holder() {}          // user-declared destructor\n};\nint main() {\n    Holder a;\n    Holder b = std::move(a);\n    return 0;\n}",
      "options": [
        "b is move-constructed; a.v is left empty",
        "Ill-formed: declaring a destructor deletes the move constructor",
        "The user-declared destructor suppresses the implicit move constructor, so this falls back to the COPY constructor (a copy, not a move)",
        "Undefined behavior because the destructor is empty"
      ],
      "answer": 2,
      "explain": "A user-declared destructor prevents the compiler from implicitly generating move operations. std::move(a) still binds to the copy constructor (which takes const&), so a deep copy happens silently instead of a move. The copy constructor is still generated because the deprecated rule keeps it for backward compatibility."
    },
    {
      "type": "code",
      "tag": "Order",
      "question": "What does this print?",
      "code": "#include <cstdio>\nstruct A { A() { printf(\"A\"); } ~A() { printf(\"a\"); } };\nstruct B { B() { printf(\"B\"); } ~B() { printf(\"b\"); } };\nstruct C {\n    A a;\n    B b;\n    C() { printf(\"C\"); }\n    ~C() { printf(\"c\"); }\n};\nint main() { C c; return 0; }",
      "options": [
        "ABCcba",
        "ABCcab",
        "CABbac",
        "ABCcba then reversed twice"
      ],
      "answer": 0,
      "explain": "Members are constructed in declaration order (A then B) before the constructor body runs, giving 'ABC'. Destruction runs the destructor body first ('c'), then destroys members in REVERSE declaration order (b then a), giving 'cba'. Total: ABCcba."
    },
    {
      "type": "mcq",
      "tag": "Synthesis Rules",
      "question": "You declare a move constructor for a class but no copy constructor. What is the status of the copy constructor?",
      "options": [
        "Implicitly generated as usual",
        "Implicitly defined as deleted",
        "Automatically synthesized to forward to the move constructor",
        "Left undeclared, so copies silently call the move constructor"
      ],
      "answer": 1,
      "explain": "Declaring ANY move operation (move ctor or move assign) causes the copy operations to be implicitly defined as deleted. So objects of this class become move-only unless you also declare the copy operations yourself. A common surprise when adding a move ctor to an existing copyable class."
    },
    {
      "type": "code",
      "tag": "Copy Elision",
      "question": "With guaranteed copy elision aside, how many times could the copy constructor be called here in C++11/14 (before C++17 mandatory elision), and what does a conforming compiler with elision enabled typically print?",
      "code": "#include <cstdio>\nstruct T {\n    T() { printf(\"ctor \"); }\n    T(const T&) { printf(\"copy \"); }\n};\nT make() { T t; return t; }\nint main() { T x = make(); return 0; }",
      "options": [
        "Always prints 'ctor copy copy'",
        "Prints 'ctor ' with elision (NRVO + copy elision); the copy constructor must still be accessible even if calls are elided",
        "Prints 'ctor copy' always because NRVO is forbidden",
        "Does not compile without a move constructor"
      ],
      "answer": 1,
      "explain": "In C++11/14 the copies at the return and at initialization are permitted to be elided (NRVO and copy elision), so a typical compiler prints just 'ctor '. Crucially, elision is allowed only if the copy constructor is still accessible/non-deleted, even when the call is optimized away. (Verified: default build prints 'ctor '; -fno-elide-constructors prints 'ctor copy copy'.)"
    },
    {
      "type": "code",
      "tag": "Slicing",
      "question": "What happens to the Derived part of d when copied into a Base?",
      "code": "#include <cstdio>\nstruct Base { int x = 1; };\nstruct Derived : Base { int y = 2; };\nint main() {\n    Derived d;\n    Base b = d;         // (1)\n    printf(\"%d\", b.x);\n    return 0;\n}",
      "options": [
        "Prints 1; the Derived's y member is sliced off (only the Base subobject is copied)",
        "Prints 2 because y overwrites x",
        "Does not compile: cannot initialize Base from Derived",
        "Undefined behavior due to object slicing"
      ],
      "answer": 0,
      "explain": "This is object slicing: copying a Derived into a Base object invokes Base's copy constructor, which copies only the Base subobject. The y member is discarded. It is well-defined (not UB), prints 1, but is a frequent source of logic bugs when polymorphic objects are copied by value."
    },
    {
      "type": "code",
      "tag": "Const Member",
      "question": "Why does the copy-assignment operator fail here?",
      "code": "struct Config {\n    const int id;\n    int value;\n    Config(int i) : id(i), value(0) {}\n};\nvoid f(Config& a, const Config& b) {\n    a = b;   // (1)\n}",
      "options": [
        "It works fine; const members are skipped during assignment",
        "Does not compile: a const data member makes the implicit copy-assignment operator deleted (you cannot assign to id)",
        "It compiles but assigning id is undefined behavior",
        "Does not compile because Config has a user constructor"
      ],
      "answer": 1,
      "explain": "A const (or reference) non-static data member makes the implicit copy-assignment operator deleted, because assignment would require modifying the const member id. Copy CONSTRUCTION would still work (it initializes rather than assigns), but a = b at line (1) is ill-formed."
    },
    {
      "type": "code",
      "tag": "Swap Correctness",
      "question": "This copy-and-swap uses std::swap on the whole object. What is wrong?",
      "code": "#include <utility>\nstruct S {\n    int* p;\n    S(const S&);\n    S& operator=(S other) {\n        std::swap(*this, other);   // (1)\n        return *this;\n    }\n};",
      "options": [
        "Nothing; std::swap on *this is the idiomatic form",
        "std::swap(*this, other) uses operator= internally -> infinite recursion (the swap needs move, but with only copy-assign defined it recurses via this very operator)",
        "It leaks because other is never destroyed",
        "It should use std::move instead of std::swap"
      ],
      "answer": 1,
      "explain": "The default std::swap is implemented in terms of move/copy assignment. Calling std::swap(*this, other) inside operator= invokes assignment again, recursing infinitely (stack overflow). Copy-and-swap must swap the individual members (e.g. std::swap(p, other.p)) or provide a dedicated member/non-member swap that touches members directly."
    },
    {
      "type": "mcq",
      "tag": "Exception Safety",
      "question": "Which exception-safety guarantee does a correctly implemented copy-and-swap assignment operator provide, assuming swap is noexcept?",
      "options": [
        "No guarantee",
        "Basic guarantee only",
        "Strong guarantee: if the copy throws, the target object is unchanged",
        "The nothrow guarantee for the whole operation including the copy"
      ],
      "answer": 2,
      "explain": "The copy (of the argument) happens before *this is modified. If it throws, *this is untouched -> strong guarantee. The subsequent swap is noexcept, so nothing after the copy can fail. It is not the nothrow guarantee overall, because the copy itself may throw."
    },
    {
      "type": "code",
      "tag": "Assignment Return",
      "question": "What is the subtle defect for chained assignment a = b = c?",
      "code": "struct S {\n    int v;\n    void operator=(const S& o) { v = o.v; }   // (1)\n};\nint main() {\n    S a, b, c;\n    a = b = c;   // (2)\n    return 0;\n}",
      "options": [
        "Compiles and chains correctly",
        "Does not compile: operator= returns void, so b = c yields void and a = void is ill-formed",
        "Undefined behavior due to evaluation order",
        "Chains but assigns garbage"
      ],
      "answer": 1,
      "explain": "By convention operator= returns S& to allow chaining. Here it returns void, so b = c produces void, and a = (void) at line (2) does not compile. Always return *this by reference from assignment operators."
    },
    {
      "type": "code",
      "tag": "Virtual Dtor",
      "question": "What is the bug when deleting through a base pointer?",
      "code": "struct Base { ~Base() {} };\nstruct Derived : Base { int* big = new int[100]; ~Derived() { delete[] big; } };\nint main() {\n    Base* p = new Derived;\n    delete p;   // (1)\n    return 0;\n}",
      "options": [
        "No bug; Derived's destructor runs",
        "Base's destructor is non-virtual, so delete p only runs ~Base -> Derived's destructor is skipped, leaking big (UB in general)",
        "It double-frees big",
        "Does not compile because Base has no virtual functions"
      ],
      "answer": 1,
      "explain": "Deleting a Derived object through a Base* whose destructor is non-virtual is undefined behavior; in practice only ~Base runs, so Derived's members are not destroyed and big leaks. A base class intended for polymorphic deletion needs a virtual destructor."
    },
    {
      "type": "mcq",
      "tag": "Move vs Copy",
      "question": "You add a user-declared copy constructor to a struct that previously followed the Rule of Zero (only std::vector members). What is the effect on move operations?",
      "options": [
        "Move operations are unaffected and still generated",
        "The move constructor and move assignment are NOT implicitly generated, so moves silently become copies",
        "The class becomes non-movable and non-copyable",
        "Only move assignment is suppressed"
      ],
      "answer": 1,
      "explain": "Declaring a copy operation (or a destructor, or a move operation) prevents implicit generation of the move operations. Since none are generated, std::move falls back to the copy constructor, silently degrading performance. This is why hand-writing one special member can regress a Rule-of-Zero class."
    },
    {
      "type": "code",
      "tag": "Shallow Copy",
      "question": "What does this print, and why is it dangerous?",
      "code": "#include <cstdio>\n#include <cstdlib>\n#include <cstring>\nstruct Str {\n    char* d;\n    Str(const char* s){ d=(char*)malloc(strlen(s)+1); strcpy(d,s); }\n    ~Str(){ free(d); }\n};\nint main(){\n    Str a(\"hi\");\n    Str b(a);\n    b.d[0]='H';\n    printf(\"%s\", a.d);\n    return 0;\n}",
      "options": [
        "Prints 'hi'; a and b are independent",
        "Prints 'Hi': the implicit copy did a shallow copy so a.d and b.d alias, and both will be freed -> also a double free at exit",
        "Does not compile",
        "Prints 'Hi' but the program is otherwise safe"
      ],
      "answer": 1,
      "explain": "The implicit copy constructor copies the pointer d, not the buffer (shallow copy). So a.d and b.d point at the same memory: writing through b changes a's string ('Hi'), and both destructors free the same pointer -> double free (UB). This class needs a user-defined deep-copy copy constructor and assignment."
    },
    {
      "type": "code",
      "tag": "Delegation",
      "question": "What does this print?",
      "code": "#include <cstdio>\nstruct Counter {\n    static int copies;\n    Counter() {}\n    Counter(const Counter&) { ++copies; }\n};\nint Counter::copies = 0;\nvoid take(Counter c) {}\nint main() {\n    Counter a;\n    take(a);\n    Counter b = a;\n    printf(\"%d\", Counter::copies);\n    return 0;\n}",
      "options": [
        "0",
        "1",
        "2",
        "3"
      ],
      "answer": 2,
      "explain": "Passing a by value to take() copy-constructs the parameter (+1). Initializing b from a copy-constructs again (+1). Total 2. A common trap: pass-by-value parameters invoke the copy constructor at each call, which is easy to forget when reasoning about copy counts."
    },
    {
      "type": "mcq",
      "tag": "Deleted Base",
      "question": "A base class has a private (or deleted) copy constructor. What is the copy status of a derived class that adds only trivial int members?",
      "options": [
        "Derived is freely copyable; the base part is default-initialized on copy",
        "Derived's implicit copy constructor is defined as deleted because it cannot copy the inaccessible base subobject",
        "Derived copies compile but slice the base",
        "Only copy assignment is affected, not copy construction"
      ],
      "answer": 1,
      "explain": "To copy a Derived, the compiler must copy the Base subobject via Base's copy constructor. If that is deleted or inaccessible, Derived's implicit copy constructor is defined as deleted. Inheritance propagates non-copyability from base to derived."
    },
    {
      "type": "code",
      "tag": "Copy Assign Leak",
      "question": "What resource bug does this copy-assignment operator have?",
      "code": "struct Arr {\n    int* p;\n    int  n;\n    Arr(int size): p(new int[size]), n(size) {}\n    ~Arr(){ delete[] p; }\n    Arr& operator=(const Arr& o){\n        p = new int[o.n];       // (1)\n        n = o.n;\n        for(int i=0;i<n;++i) p[i]=o.p[i];\n        return *this;\n    }\n};",
      "options": [
        "It is correct and self-assignment safe",
        "It leaks the old buffer: the previous p is overwritten at (1) without being delete[]-ed first",
        "It double-frees on destruction",
        "It fails to compile without a copy constructor"
      ],
      "answer": 1,
      "explain": "Line (1) overwrites p with a new allocation without first delete[]-ing the existing buffer, leaking the old array on every assignment. It also is not self-assignment safe. Copy-and-swap avoids both problems at once."
    },
    {
      "type": "mcq",
      "tag": "noexcept Move",
      "question": "Why should a move constructor be marked noexcept when the type is stored in a std::vector?",
      "options": [
        "noexcept is required or the code will not compile",
        "std::vector will only use the move constructor during reallocation if it is noexcept; otherwise it falls back to copying to preserve the strong guarantee",
        "noexcept makes the move faster at runtime",
        "It prevents the copy constructor from being generated"
      ],
      "answer": 1,
      "explain": "During reallocation std::vector needs the strong exception guarantee. If elements' move constructor is not noexcept, a throw mid-move could leave elements in a bad state, so vector conservatively COPIES instead of moving. Marking the move constructor noexcept lets vector move, which is a major performance difference."
    },
    {
      "type": "code",
      "tag": "Default Keyword",
      "question": "What is the effect of '= default' here compared to writing an empty body?",
      "code": "#include <string>\nstruct A {\n    std::string s;\n    A(const A&) = default;   // (1)\n};\nstruct B {\n    std::string s;\n    B(const B& o) {}         // (2)\n};",
      "options": [
        "Both copy s correctly",
        "A copies s (defaulted memberwise copy); B does NOT copy s because its empty body default-constructs s instead of copying o.s",
        "Line (1) does not compile",
        "B copies s but A leaves it empty"
      ],
      "answer": 1,
      "explain": "= default at (1) generates the memberwise copy, so s is copied. The user-provided empty body at (2) replaces that logic entirely: it default-constructs s (no member init list copying o.s), so B's copy silently produces an empty string. Writing an empty body is NOT equivalent to = default."
    },
    {
      "type": "code",
      "tag": "Assignment Order",
      "question": "Assuming deep-copy semantics are intended, which single change makes this operator both correct and self-assignment safe with minimal code?",
      "code": "struct Vec {\n    int* p; int n;\n    Vec(const Vec&);\n    void swap(Vec& o){ int* tp=p; p=o.p; o.p=tp; int tn=n; n=o.n; o.n=tn; }\n    Vec& operator=(/* ??? */);\n};",
      "options": [
        "Vec& operator=(const Vec& o){ swap(const_cast<Vec&>(o)); return *this; }",
        "Vec& operator=(Vec o){ swap(o); return *this; }",
        "Vec& operator=(const Vec& o){ delete[] p; p=o.p; n=o.n; return *this; }",
        "Vec& operator=(Vec& o){ p=o.p; return *this; }"
      ],
      "answer": 1,
      "explain": "Taking the parameter by value (Vec o) copies via the copy constructor, then swap exchanges guts with the temporary, whose destructor frees the old data. This is the copy-and-swap idiom: concise, self-assignment safe, and strongly exception safe. Option A mutates the caller's argument (const_cast on a real const object is UB) and steals its pointer; option C leaks/shallow-copies and is not self-safe."
    },
    {
      "type": "mcq",
      "tag": "Semantics",
      "question": "At run time, what does the expression std::move(x) actually DO to x?",
      "options": [
        "It physically transfers x's resources to a new location",
        "Nothing by itself — it is a compile-time cast to an rvalue reference, equivalent to static_cast<T&&>(x)",
        "It invokes x's move constructor",
        "It zeroes out / empties x"
      ],
      "answer": 1,
      "explain": "std::move generates no code; it merely casts its argument to an xvalue (rvalue reference) so that overload resolution can pick a move constructor/assignment. The tempting 'it moves the object' answer is wrong — the actual stealing of resources only happens later, if and when a move constructor or move assignment is invoked."
    },
    {
      "type": "code",
      "tag": "Const",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct S {\n  S() {}\n  S(const S&) { std::cout << \"copy\"; }\n  S(S&&)      { std::cout << \"move\"; }\n};\nint main() {\n  const S a;\n  S b = std::move(a);\n}",
      "options": [
        "move",
        "copy",
        "Nothing",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "std::move(a) on a const S yields a const S&&. The move constructor takes a non-const S&& and cannot bind to a const rvalue, so it is not viable; the copy constructor's const S& binds fine and is selected. This is the classic 'moving a const object silently copies' trap — mark data you intend to move as non-const."
    },
    {
      "type": "mcq",
      "tag": "Moved-from",
      "question": "After you move from a standard-library object (e.g. std::string s2 = std::move(s1);), what is guaranteed about s1?",
      "options": [
        "s1 is destroyed and must not be touched again",
        "Reading or destroying s1 is undefined behavior",
        "s1 is in a valid but unspecified state — you may destroy it or assign a new value, but must not assume its contents",
        "s1 is guaranteed to equal a default-constructed string"
      ],
      "answer": 2,
      "explain": "The standard requires moved-from library objects to be left 'valid but unspecified': all class invariants hold, so destruction and assignment are safe, but the value is not defined. Assuming it becomes empty/default (a common myth) is unwarranted — that behavior is not guaranteed."
    },
    {
      "type": "code",
      "tag": "Moved-from",
      "question": "What is the most accurate description of this program's output?",
      "code": "#include <iostream>\n#include <vector>\n#include <utility>\nint main() {\n  std::vector<int> a{10, 20, 30};\n  std::vector<int> b = std::move(a);\n  std::cout << a.size();\n}",
      "options": [
        "Always prints 3",
        "Always prints 0",
        "Prints a valid but unspecified value — commonly 0 in practice, but not guaranteed by the standard",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Calling a.size() after a move is perfectly legal (the object is valid), so it is not undefined behavior. But the standard only guarantees 'valid but unspecified'; while most implementations leave a moved-from vector empty, relying on 0 is non-portable. Choosing 'always 0' bakes in an assumption the standard doesn't make."
    },
    {
      "type": "code",
      "tag": "Noexcept",
      "question": "With W's move constructor NOT marked noexcept, what does this print?",
      "code": "#include <iostream>\n#include <vector>\nstruct W {\n  W() = default;\n  W(const W&) { std::cout << \"C\"; }\n  W(W&&)      { std::cout << \"M\"; }  // not noexcept\n};\nint main() {\n  std::vector<W> v;\n  v.reserve(1);\n  v.emplace_back();   // element 0\n  v.emplace_back();   // forces reallocation\n}",
      "options": [
        "M",
        "C",
        "MC",
        "Nothing"
      ],
      "answer": 1,
      "explain": "The second emplace_back exceeds capacity and reallocates. To preserve the strong exception guarantee, vector uses move_if_noexcept: it will only MOVE existing elements into the new buffer if their move constructor is noexcept; otherwise it COPIES (as long as a copy constructor exists). Since W's move ctor is not noexcept, element 0 is copied — printing 'C'. Add 'noexcept' and it would print 'M'."
    },
    {
      "type": "mcq",
      "tag": "Noexcept",
      "question": "Why does std::vector fall back to copying (instead of moving) existing elements during reallocation when the element type's move constructor is not noexcept?",
      "options": [
        "A throwing move constructor is illegal, so it cannot be called",
        "To preserve the strong exception guarantee: if a move threw partway through, the already-moved-from source elements could not be restored, so it copies to keep the originals intact",
        "Non-noexcept moves are always slower than copies",
        "The compiler cannot see a non-noexcept move constructor"
      ],
      "answer": 1,
      "explain": "push_back/reserve offer the strong guarantee (on failure, the vector is unchanged). A copy leaves the source elements untouched, so a throw mid-reallocation is recoverable; a throwing move would leave already-relocated elements in a moved-from state that can't be rolled back. Hence marking move operations noexcept is a real performance feature, not mere decoration."
    },
    {
      "type": "code",
      "tag": "RVO",
      "question": "Assuming a conforming compiler that performs the permitted copy elision, what does this print?",
      "code": "#include <iostream>\nstruct S {\n  S()         { std::cout << \"ctor \"; }\n  S(const S&) { std::cout << \"copy \"; }\n  S(S&&)      { std::cout << \"move \"; }\n};\nS make() { return S(); }\nint main() { S s = make(); }",
      "options": [
        "ctor ",
        "ctor move ",
        "ctor move move ",
        "ctor copy "
      ],
      "answer": 0,
      "explain": "Even in C++11/14, where elision is optional, compilers universally elide both the return temporary and the initialization of s, so only the default constructor runs: 'ctor '. Note that the move constructor still had to be accessible for the program to be well-formed, even though it isn't called."
    },
    {
      "type": "code",
      "tag": "Pessimization",
      "question": "What does this print, and what lesson does it teach?",
      "code": "#include <iostream>\nstruct S {\n  S()         { std::cout << \"ctor \"; }\n  S(const S&) { std::cout << \"copy \"; }\n  S(S&&)      { std::cout << \"move \"; }\n};\nS make() { S s; return std::move(s); }\nint main() { S s = make(); }",
      "options": [
        "ctor ",
        "ctor move ",
        "ctor copy ",
        "ctor move move "
      ],
      "answer": 1,
      "explain": "Writing 'return std::move(s)' turns the return expression into an xvalue that is no longer the name of the local, which disables NRVO — so a move is forced ('move'). Output is 'ctor move '. Removing std::move would enable elision and print just 'ctor '. Rule: never std::move a local in a return statement; it pessimizes, defeating RVO."
    },
    {
      "type": "mcq",
      "tag": "Forward",
      "question": "What is the key difference between std::move and std::forward<T>?",
      "options": [
        "Both unconditionally cast to an rvalue",
        "std::move unconditionally casts to an rvalue; std::forward<T> casts to an rvalue only when T was deduced from an rvalue, otherwise it yields an lvalue — preserving the original value category",
        "std::forward always casts to an lvalue",
        "They are interchangeable in practice"
      ],
      "answer": 1,
      "explain": "std::forward is a *conditional* cast used with forwarding references (T&&) to relay an argument with its original lvalue/rvalue-ness intact, based on how T was deduced. std::move is *unconditional*. Using std::move inside a perfect-forwarding wrapper would wrongly turn lvalue arguments into rvalues and could steal from the caller's object."
    },
    {
      "type": "code",
      "tag": "Forward",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\nvoid sink(int&)  { std::cout << \"L\"; }\nvoid sink(int&&) { std::cout << \"R\"; }\ntemplate<class T> void relay(T&& x) { sink(std::forward<T>(x)); }\nint main() {\n  int a = 0;\n  relay(a);\n  relay(0);\n}",
      "options": [
        "LR",
        "RR",
        "LL",
        "RL"
      ],
      "answer": 0,
      "explain": "For relay(a), T deduces to int& and std::forward<int&> produces an lvalue, selecting sink(int&) -> 'L'. For relay(0), T deduces to int and std::forward<int> produces an rvalue, selecting sink(int&&) -> 'R'. Result: 'LR'. This is exactly the value-category preservation that perfect forwarding provides."
    },
    {
      "type": "code",
      "tag": "Value-category",
      "question": "What happens when you compile this?",
      "code": "void f(int&&) {}\nvoid g(int&& r) { f(r); }\nint main() { g(5); }",
      "options": [
        "Compiles and runs fine",
        "Does not compile: r is an lvalue and cannot bind to int&&",
        "Undefined behavior",
        "Compiles only with a warning"
      ],
      "answer": 1,
      "explain": "A named rvalue reference is itself an lvalue. Inside g, r has a name, so f(r) tries to bind an lvalue to an int&& parameter, which fails. The fix is f(std::move(r)). This 'named rvalue references are lvalues' rule is precisely why std::move/std::forward are needed when passing such references onward."
    },
    {
      "type": "code",
      "tag": "Trivial",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\nint main() {\n  int x = 5;\n  int y = std::move(x);\n  std::cout << x << \" \" << y;\n}",
      "options": [
        "5 5",
        "0 5",
        "undefined",
        "garbage 5"
      ],
      "answer": 0,
      "explain": "std::move only casts; for a scalar like int there is no move constructor to steal anything, so 'moving' is just a copy and x is untouched. Output is '5 5'. std::move never empties or nulls fundamental types — it doesn't run any code by itself."
    },
    {
      "type": "code",
      "tag": "Rule-of-five",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <vector>\n#include <utility>\nstruct S {\n  std::vector<int> v{1, 2, 3};\n  ~S() {}\n};\nint main() {\n  S a;\n  S b = std::move(a);\n  std::cout << a.v.size() << \" \" << b.v.size();\n}",
      "options": [
        "0 3",
        "3 3",
        "3 0",
        "0 0"
      ],
      "answer": 1,
      "explain": "Declaring a destructor (even an empty one) suppresses the implicit move constructor. So 'S b = std::move(a)' falls back to the implicitly-declared COPY constructor, which deep-copies the vector; a is unchanged. Output is '3 3', not the '0 3' you'd expect from a real move. This is a subtle Rule-of-Five trap: a stray ~S() silently kills move semantics."
    },
    {
      "type": "mcq",
      "tag": "Rule-of-five",
      "question": "When does the compiler implicitly declare a move constructor for a class?",
      "options": [
        "Always",
        "Only when the class declares none of: a copy constructor, a copy assignment operator, a move assignment operator, or a destructor",
        "Only when you explicitly write = default",
        "Whenever the class contains pointer members"
      ],
      "answer": 1,
      "explain": "Any user-declared copy constructor, copy assignment operator, move assignment operator, or destructor prevents the compiler from implicitly declaring a move constructor. This is why adding a destructor can quietly disable moves — the Rule of Five exists to remind you to handle all five special members together."
    },
    {
      "type": "code",
      "tag": "Double-move",
      "question": "What is the most accurate statement about this program?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\nint main() {\n  std::string a = \"hello\";\n  std::string b = std::move(a);\n  std::string c = std::move(a);\n  std::cout << c.size();\n}",
      "options": [
        "Prints 5",
        "Prints 0",
        "Prints a valid but unspecified value; the program is well-defined but c's size is not predictable",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "After the first move, a is valid but unspecified. Moving from a again is legal (not UB), and c receives whatever unspecified state a currently holds, so c.size() is unspecified — commonly 0, but not guaranteed. Assuming 5 (the original length) is the classic double-move mistake: the value already left a on the first move."
    },
    {
      "type": "code",
      "tag": "Moved-from",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <memory>\n#include <utility>\nint main() {\n  std::unique_ptr<int> a(new int(7));\n  std::unique_ptr<int> b = std::move(a);\n  std::cout << (a == nullptr) << (b != nullptr);\n}",
      "options": [
        "11",
        "10",
        "00",
        "Unspecified — a's null-ness is not guaranteed"
      ],
      "answer": 0,
      "explain": "Unlike the general 'valid but unspecified' rule, std::unique_ptr's move operations are specifically defined to leave the source EQUAL TO nullptr. So a==nullptr is true and b!=nullptr is true: output '11'. unique_ptr is one of the few types whose moved-from state IS pinned down by the standard."
    },
    {
      "type": "code",
      "tag": "Return",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\nstruct S {\n  S() {}\n  S(const S&) { std::cout << \"copy \"; }\n  S(S&&)      { std::cout << \"move \"; }\n};\nS f(S s) { return s; }\nint main() {\n  S x;\n  S y = f(std::move(x));\n}",
      "options": [
        "move move ",
        "move copy ",
        "copy copy ",
        "move "
      ],
      "answer": 0,
      "explain": "f(std::move(x)) move-constructs the parameter s ('move'). On 'return s', a by-value function parameter is treated as an rvalue for overload resolution (implicit move), so returning it moves again ('move'); the temporary is then elided into y. Output is 'move move '. Many expect 'return s' to copy — but a value parameter is implicitly moved on return."
    },
    {
      "type": "code",
      "tag": "Algorithm",
      "question": "What does this print? (Note which std::move is being called.)",
      "code": "#include <algorithm>\n#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> a{1, 2, 3};\n  std::vector<int> b(3);\n  std::move(a.begin(), a.end(), b.begin());\n  std::cout << b[0] << b[1] << b[2];\n}",
      "options": [
        "123",
        "000",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "This is the OTHER std::move: the <algorithm> overload std::move(first, last, dest) that move-assigns each element of the range into b. For ints, move-assignment is a plain copy, so b becomes {1,2,3} and it prints '123'. Don't confuse it with the <utility> cast — same name, completely different function selected by the three-iterator argument list."
    },
    {
      "type": "code",
      "tag": "Reuse",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\nint main() {\n  std::string a = \"hi\", b = \"world\";\n  a = std::move(b);\n  b = \"new\";\n  std::cout << a << b;\n}",
      "options": [
        "worldnew",
        "hinew",
        "world",
        "hiworld"
      ],
      "answer": 0,
      "explain": "a = std::move(b) move-assigns 'world' into a. b is now moved-from (valid but unspecified), but assigning a fresh value to it — b = \"new\" — is always well-defined. So a is 'world' and b is 'new', printing 'worldnew'. Reusing a moved-from object by assigning to it is safe; only reading its old value is unreliable."
    },
    {
      "type": "mcq",
      "tag": "Collapsing",
      "question": "Given template<class T> void h(T&& x);, with 'int i;' what does T deduce to for the calls h(i) and h(42) respectively?",
      "options": [
        "int and int",
        "int& and int",
        "int&& and int&&",
        "int& and int&"
      ],
      "answer": 1,
      "explain": "With a forwarding reference, an lvalue argument deduces T = int& (and int& && collapses to int&), while an rvalue argument deduces T = int (parameter int&&). These reference-collapsing rules are what let std::forward<T> reconstruct the original value category. Answering 'int and int' misses that lvalues deduce a reference type for T."
    },
    {
      "type": "code",
      "tag": "new[]/delete",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\nint main() {\n    int* p = new int[5];\n    p[0] = 10;\n    delete p;   // note: not delete[]\n    std::cout << \"done\";\n}",
      "options": [
        "Prints \"done\" and is fully correct",
        "Undefined behavior: array allocated with new[] but freed with scalar delete",
        "Compile error: cannot use delete on an array pointer",
        "Guaranteed memory leak of 4 of the 5 ints"
      ],
      "answer": 1,
      "explain": "An object created with new[] must be released with delete[]; using scalar delete is undefined behavior because the two forms may use different allocation bookkeeping and delete calls only one destructor. It compiles fine (the type is just int*), so 'compile error' is wrong; the corruption is UB, not a mere leak."
    },
    {
      "type": "code",
      "tag": "Move",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <memory>\nint main() {\n    auto a = std::make_unique<int>(42);\n    auto b = std::move(a);\n    std::cout << (a == nullptr) << (b != nullptr) << *b;\n}",
      "options": [
        "1142",
        "0142",
        "Undefined behavior: a is dangling after the move",
        "Compile error: unique_ptr is not movable"
      ],
      "answer": 0,
      "explain": "Moving a unique_ptr transfers ownership: the moved-from pointer is guaranteed to be null, and b now owns the int. So a==nullptr is 1, b!=nullptr is 1, and *b is 42, giving \"1142\". A moved-from unique_ptr is null, not dangling, so accessing a (as a comparison) is well defined."
    },
    {
      "type": "code",
      "tag": "RefCount",
      "question": "What is printed?",
      "code": "#include <iostream>\n#include <memory>\nint main() {\n    auto a = std::make_shared<int>(7);\n    auto b = a;\n    {\n        auto c = a;\n        // c goes out of scope here\n    }\n    std::cout << a.use_count();\n}",
      "options": [
        "3",
        "2",
        "1",
        "Undefined: use_count is unreliable"
      ],
      "answer": 1,
      "explain": "a, b, and c share ownership, so inside the block use_count is 3; when c is destroyed at the closing brace the count drops back to 2 (a and b). use_count is well defined in single-threaded code, so '2' is correct."
    },
    {
      "type": "code",
      "tag": "weak_ptr",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <memory>\nint main() {\n    auto sp = std::make_shared<int>(99);\n    std::weak_ptr<int> wp = sp;\n    sp.reset();\n    if (auto s = wp.lock())\n        std::cout << *s;\n    else\n        std::cout << \"expired\";\n}",
      "options": [
        "99",
        "expired",
        "0",
        "Undefined behavior: wp dangles after reset"
      ],
      "answer": 1,
      "explain": "A weak_ptr does not keep the object alive; once the last shared_ptr (sp) is reset, the managed int is destroyed and the weak_ptr expires. lock() then returns an empty shared_ptr, so the else branch runs and prints \"expired\". weak_ptr never dangles because lock() safely reports expiration."
    },
    {
      "type": "code",
      "tag": "DoubleFree",
      "question": "What is the defect here?",
      "code": "#include <memory>\nint main() {\n    int* raw = new int(5);\n    std::shared_ptr<int> a(raw);\n    std::shared_ptr<int> b(raw);\n}",
      "options": [
        "Nothing; shared_ptr reference counting handles it",
        "Double delete UB: two independent control blocks each delete the same pointer",
        "Memory leak: neither shared_ptr frees the int",
        "Compile error: ambiguous shared_ptr constructor"
      ],
      "answer": 1,
      "explain": "Constructing two shared_ptrs separately from the same raw pointer creates two independent control blocks, each with a count of 1. When both destruct they each delete raw, causing a double free (UB). Reference counting only works when ownership is shared via copy/assignment, e.g. b = a."
    },
    {
      "type": "mcq",
      "tag": "Cycle",
      "question": "Two objects hold shared_ptrs to each other, forming a cycle, and all external shared_ptrs to them are dropped. What happens, and what is the standard fix?",
      "options": [
        "The objects are destroyed normally because the cycle is detected automatically",
        "They leak because each keeps the other's count at 1; make one link a weak_ptr",
        "They cause a double delete when the program exits",
        "They leak, and the only fix is to call delete manually on one of them"
      ],
      "answer": 1,
      "explain": "shared_ptr uses reference counting, not cycle-detecting garbage collection, so mutual references keep both counts at 1 forever and the memory leaks. Breaking the cycle with a weak_ptr for the back-reference lets the counts reach zero; manual delete is not the idiomatic (or safe) fix."
    },
    {
      "type": "code",
      "tag": "CustomDeleter",
      "question": "Does this compile and behave correctly for closing a C FILE*?",
      "code": "#include <cstdio>\n#include <memory>\nint main() {\n    std::unique_ptr<FILE, decltype(&std::fclose)>\n        fp(std::fopen(\"data.txt\", \"r\"), &std::fclose);\n    // ... use fp.get() ...\n    return 0;\n}",
      "options": [
        "Yes: the custom deleter calls fclose on the FILE* at scope exit",
        "No: unique_ptr cannot manage a non-class type like FILE",
        "No: unique_ptr requires the deleter as a template default, not a constructor argument",
        "Yes, but it leaks because fclose is never invoked"
      ],
      "answer": 0,
      "explain": "unique_ptr accepts a deleter type as its second template parameter and a deleter object at construction; here it stores a function pointer to fclose and invokes it on the FILE* when the unique_ptr is destroyed. Passing the deleter at construction is exactly how stateful/function-pointer deleters are supplied."
    },
    {
      "type": "mcq",
      "tag": "DeleterSize",
      "question": "Compared to std::unique_ptr<int>, what is true of std::unique_ptr<int, void(*)(int*)> (function-pointer deleter)?",
      "options": [
        "It is the same size because deleters are never stored",
        "It is typically larger because the function pointer must be stored alongside the object pointer",
        "It does not compile; unique_ptr deleters must be stateless",
        "It is smaller due to empty-base optimization"
      ],
      "answer": 1,
      "explain": "A stateless deleter (like the default) is stored via empty-base optimization, so unique_ptr is one pointer wide; a function-pointer deleter carries state (the address), so it must be stored, roughly doubling the size. This is why a captureless lambda or a class-type deleter is often preferred over a raw function pointer."
    },
    {
      "type": "mcq",
      "tag": "make_shared",
      "question": "Which is a genuine advantage of std::make_shared<T>(...) over std::shared_ptr<T>(new T(...))?",
      "options": [
        "make_shared lets you specify a custom deleter more easily",
        "make_shared performs a single allocation for the object and the control block together",
        "make_shared produces a shared_ptr with a lower initial reference count",
        "make_shared allocates the object on the stack instead of the heap"
      ],
      "answer": 1,
      "explain": "make_shared fuses the object and the control block into one allocation, improving locality and saving a heap call. It does not support custom deleters (that is a reason to sometimes prefer the raw-new form), the initial count is 1 in both cases, and the object is always heap-allocated."
    },
    {
      "type": "mcq",
      "tag": "make_shared",
      "question": "A known trade-off of std::make_shared for a large object is:",
      "options": [
        "It cannot be used with weak_ptr",
        "The object's memory stays allocated as long as any weak_ptr exists, even after all shared_ptrs are gone",
        "It calls the constructor twice",
        "It disables reference counting"
      ],
      "answer": 1,
      "explain": "Because make_shared places the object and control block in one block, that block cannot be freed until the last weak_ptr is gone; the object is destroyed when shared count hits zero, but its storage lingers while weak references remain. With separate allocation the object's memory can be freed independently of the control block."
    },
    {
      "type": "code",
      "tag": "NoCopy",
      "question": "What is the result of compiling this?",
      "code": "#include <memory>\nvoid sink(std::unique_ptr<int> p);\nint main() {\n    auto up = std::make_unique<int>(1);\n    sink(up);   // passed by value, not moved\n    return 0;\n}",
      "options": [
        "Compiles and moves up into sink",
        "Compiles but leaks the int",
        "Compile error: unique_ptr's copy constructor is deleted",
        "Runtime error: double free"
      ],
      "answer": 2,
      "explain": "unique_ptr is move-only; its copy constructor is deleted. Passing the lvalue up by value tries to copy it, which is ill-formed. The fix is sink(std::move(up)); an implicit copy is never silently converted to a move."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "What is wrong with foo?",
      "code": "#include <memory>\nint* foo() {\n    auto p = std::make_unique<int>(5);\n    return p.get();\n}",
      "options": [
        "Nothing; get() transfers ownership to the caller",
        "It returns a dangling pointer: the unique_ptr frees the int when foo returns",
        "Compile error: cannot return a raw pointer from a unique_ptr",
        "It leaks the int"
      ],
      "answer": 1,
      "explain": "get() returns the raw pointer but does not release ownership, so when p is destroyed at the end of foo the int is freed and the returned pointer dangles. To transfer ownership you would return the unique_ptr itself (or call release()); get() never gives ownership away."
    },
    {
      "type": "mcq",
      "tag": "delete-null",
      "question": "What is the behavior of `delete p;` when p is a null pointer?",
      "options": [
        "Undefined behavior",
        "A no-op; deleting a null pointer is guaranteed safe",
        "A crash on most platforms",
        "A compile error unless p is checked first"
      ],
      "answer": 1,
      "explain": "The standard guarantees that delete (and delete[]) on a null pointer does nothing, so guarding with `if (p)` before delete is redundant. This is a deliberate language feature, not UB."
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "Assuming Base has a NON-virtual destructor, what is the behavior?",
      "code": "#include <memory>\nstruct Base { ~Base() {} };\nstruct Derived : Base { int buf[64]; };\nint main() {\n    std::unique_ptr<Base> p = std::make_unique<Derived>();\n    return 0;\n}",
      "options": [
        "Well defined: Derived is correctly destroyed",
        "Undefined behavior: deleting a Derived through a Base* with a non-virtual destructor",
        "Compile error: cannot convert unique_ptr<Derived> to unique_ptr<Base>",
        "Well defined but leaks buf"
      ],
      "answer": 1,
      "explain": "unique_ptr<Base> deletes through a Base*, so with a non-virtual base destructor, `delete` on a Derived object is undefined behavior. Note this differs from shared_ptr, which stores a deleter tied to the original type; the fix here is a virtual ~Base()."
    },
    {
      "type": "code",
      "tag": "shared-vs-unique",
      "question": "Base has a NON-virtual destructor. Is this well defined?",
      "code": "#include <memory>\nstruct Base { ~Base() {} };\nstruct Derived : Base { int buf[64]; };\nint main() {\n    std::shared_ptr<Base> p = std::make_shared<Derived>();\n    return 0;\n}",
      "options": [
        "Undefined behavior, exactly like the unique_ptr case",
        "Well defined: shared_ptr's control block stored a deleter that deletes the Derived",
        "Compile error: type mismatch",
        "Well defined but only because buf is trivially destructible"
      ],
      "answer": 1,
      "explain": "When the shared_ptr is created from a Derived, its control block captures a deleter that destroys the object as a Derived, so the correct destructor runs even without a virtual base destructor. This type-erased deleter is why shared_ptr is safer than unique_ptr for this specific pattern (though a virtual destructor is still best practice)."
    },
    {
      "type": "code",
      "tag": "release",
      "question": "After this runs, what is true?",
      "code": "#include <memory>\n#include <iostream>\nint main() {\n    auto up = std::make_unique<int>(8);\n    int* raw = up.release();\n    std::cout << (up == nullptr);\n    delete raw;\n}",
      "options": [
        "Prints 1; release() gives up ownership without deleting, so we must delete raw ourselves",
        "Prints 0; up still owns the int",
        "Double free: both up and delete raw free the int",
        "Compile error: release() returns void"
      ],
      "answer": 0,
      "explain": "release() returns the raw pointer AND relinquishes ownership, leaving up null (so it prints 1) and NOT deleting the object. The caller becomes responsible for the memory, hence the explicit delete raw with no double free. Contrast reset(), which deletes the managed object."
    },
    {
      "type": "code",
      "tag": "reset",
      "question": "How many total distinct ints are alive after line marked //X, and is there a leak?",
      "code": "#include <memory>\nint main() {\n    auto up = std::make_unique<int>(1);\n    up.reset(new int(2));   //X\n    return 0;\n}",
      "options": [
        "Leak: the int(1) is never freed",
        "No leak: reset first stores the new pointer, then deletes the old int(1)",
        "Undefined behavior: reset cannot take a raw pointer",
        "No leak, but int(2) is leaked at return"
      ],
      "answer": 1,
      "explain": "unique_ptr::reset(ptr) takes ownership of the new pointer and then deletes the previously managed object, so int(1) is freed and int(2) is owned; at return int(2) is freed too. There is no leak and no double free. (The standard requires the old deleter runs after the pointer is replaced, making even self-reset safe.)"
    },
    {
      "type": "code",
      "tag": "double-shared",
      "question": "What is the danger in this code?",
      "code": "#include <memory>\nstruct Node { std::shared_ptr<Node> self; };\nvoid build() {\n    auto n = std::make_shared<Node>();\n    n->self = n;   // stores a shared_ptr to itself\n}",
      "options": [
        "Nothing; the Node is destroyed when build returns",
        "The Node leaks: its own self-reference keeps use_count >= 1 forever",
        "Immediate double free when build returns",
        "Compile error: a class cannot contain a shared_ptr to itself"
      ],
      "answer": 1,
      "explain": "The Node holds a shared_ptr to itself, so even after the local n is destroyed the internal self member keeps the count at 1, and it is never freed — a self-cycle leak. Making self a weak_ptr breaks the cycle."
    },
    {
      "type": "mcq",
      "tag": "weak_ptr",
      "question": "Why is it wrong to check wp.expired() and then call wp.lock() as two separate steps in multithreaded code?",
      "options": [
        "expired() is not thread-safe and lock() is",
        "There is a race: the object may expire between the expired() check and the lock() call",
        "lock() throws if the pointer already expired",
        "expired() permanently invalidates the weak_ptr"
      ],
      "answer": 1,
      "explain": "Between expired() returning false and the subsequent lock(), another thread could drop the last shared_ptr, so the check is stale. The correct idiom is to just call lock() once and test the returned shared_ptr — lock() atomically either yields a valid owning pointer or an empty one."
    },
    {
      "type": "code",
      "tag": "array-unique",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <memory>\nint main() {\n    std::unique_ptr<int[]> a(new int[3]{10, 20, 30});\n    std::cout << a[1];\n}",
      "options": [
        "20",
        "Compile error: unique_ptr has no operator[]",
        "Undefined behavior: must use a.get()[1]",
        "10"
      ],
      "answer": 0,
      "explain": "The array specialization unique_ptr<T[]> provides operator[] and correctly calls delete[] on destruction, so a[1] is 20. The primary template unique_ptr<T> would lack operator[] — choosing the T[] form is what makes indexing valid and the array deletion correct."
    },
    {
      "type": "mcq",
      "tag": "shared-array",
      "question": "In C++11/14, what is required to have a std::shared_ptr manage an array allocated with new[]?",
      "options": [
        "Nothing special; shared_ptr<T[]> works out of the box",
        "You must supply a custom deleter that calls delete[], because shared_ptr<T[]> and array delete[] support came later (C++17)",
        "It is impossible; shared_ptr can never manage arrays",
        "You must wrap it in a unique_ptr first"
      ],
      "answer": 1,
      "explain": "Before C++17, shared_ptr had no array support and its default deleter uses scalar delete, so managing a new[] array requires a custom deleter such as [](T* p){ delete[] p; }. C++17 added shared_ptr<T[]>; in C++11/14 the custom deleter is the correct approach."
    },
    {
      "type": "mcq",
      "tag": "ExceptionSafety",
      "question": "In C++11/14, why can `process(std::shared_ptr<int>(new int(1)), mayThrow())` potentially leak?",
      "options": [
        "shared_ptr construction always leaks on exception",
        "The compiler may evaluate `new int(1)` and then call mayThrow() (which throws) before the shared_ptr is constructed, leaking the raw int",
        "new int(1) is evaluated twice",
        "shared_ptr cannot be used as a function argument"
      ],
      "answer": 1,
      "explain": "Pre-C++17, the order of evaluating function arguments is unspecified, so the raw new may happen, then mayThrow() throws before the shared_ptr takes ownership, leaking the int. Using std::make_shared<int>(1) avoids the exposed raw pointer entirely (and C++17 later tightened the ordering)."
    },
    {
      "type": "code",
      "tag": "array-delete",
      "question": "What is the behavior?",
      "code": "int main() {\n    int* p = new int[4];\n    delete[] (p + 1);\n    return 0;\n}",
      "options": [
        "Frees the last 3 elements only",
        "Undefined behavior: delete[] must receive exactly the pointer returned by new[]",
        "Well defined; delete[] finds the block start automatically",
        "Compile error"
      ],
      "answer": 1,
      "explain": "delete[] (and delete) require the exact pointer value returned by the corresponding new[]; passing an interior pointer like p+1 is undefined behavior. There is no mechanism to 'partially' free an array or to recover the block from an offset pointer."
    },
    {
      "type": "code",
      "tag": "enable_shared",
      "question": "Base derives from enable_shared_from_this. What happens?",
      "code": "#include <memory>\nstruct Widget : std::enable_shared_from_this<Widget> {\n    std::shared_ptr<Widget> clone() { return shared_from_this(); }\n};\nint main() {\n    Widget w;                 // on the stack\n    auto p = w.clone();\n    return 0;\n}",
      "options": [
        "Returns a valid shared_ptr sharing ownership of w",
        "Undefined behavior / throws: shared_from_this requires the object to already be owned by a shared_ptr",
        "Copies w into a new heap allocation",
        "Compile error"
      ],
      "answer": 1,
      "explain": "shared_from_this only works when the object is already managed by a shared_ptr, because it retrieves a weak reference stored in the control block. Here w is a stack object with no controlling shared_ptr, so the call has no valid control block — it throws bad_weak_ptr (UB in C++11 before that guarantee). You must create the object via make_shared<Widget>()."
    },
    {
      "type": "mcq",
      "tag": "nothrow",
      "question": "What distinguishes `new(std::nothrow) T` from a plain `new T` on allocation failure?",
      "options": [
        "nothrow new returns nullptr on failure instead of throwing std::bad_alloc",
        "nothrow new never fails",
        "nothrow new throws std::bad_alloc; plain new returns nullptr",
        "There is no difference in C++11"
      ],
      "answer": 0,
      "explain": "Plain new throws std::bad_alloc when allocation fails, whereas the nothrow overload returns a null pointer instead, so code using it must check for null. Assuming plain new can return nullptr on failure is a classic and dangerous mistake."
    },
    {
      "type": "code",
      "tag": "RefCount",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <memory>\nint main() {\n    std::shared_ptr<int> a = std::make_shared<int>(0);\n    std::weak_ptr<int> w = a;\n    std::cout << a.use_count() << w.use_count();\n}",
      "options": [
        "21",
        "11",
        "12",
        "10"
      ],
      "answer": 1,
      "explain": "weak_ptr does not contribute to the strong (owning) reference count; use_count reports only shared_ptr owners. There is one shared_ptr (a), so both a.use_count() and w.use_count() report 1, printing \"11\"."
    }
  ]
};

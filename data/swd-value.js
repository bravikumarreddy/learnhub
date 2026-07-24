/* ===== C++ Software Design — Value Semantics, Decorator & Singleton ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["swd-value"] = {
  title: "C++ Software Design — Value Semantics, Decorator & Singleton",
  subtitle: "Value-based design, decorator at runtime and compile time, and why singletons hurt testability.",
  crumb: "C++ Software Design",
  questions: [
    {
      "type": "mcq",
      "tag": "value semantics",
      "question": "Iglberger's guideline says: 'Prefer value semantics over reference semantics.' What is the primary design rationale behind it?",
      "options": [
        "Value types always outperform reference types because copies are free in modern C++",
        "Values enable local reasoning: no aliasing, no remote mutation through hidden handles, and far fewer lifetime problems — code becomes easier to understand and change",
        "References and pointers are deprecated in C++20 and should be phased out of interfaces",
        "Only value types can be stored in standard containers, so reference semantics blocks STL usage"
      ],
      "answer": 1,
      "explain": "The guideline is about reasoning, not raw speed: a value is self-contained, so you can understand a function by looking only at it. Reference semantics (pointers, references, iterators) couples code to remote objects, importing aliasing, mutation-at-a-distance, and lifetime questions into every reader's head. Performance is usually 'good enough' and often better due to locality — but clarity is the driver."
    },
    {
      "type": "mcq",
      "tag": "reference semantics",
      "question": "Which set of problems is characteristic of a reference-semantics-heavy design, where pointers and references flow across interfaces?",
      "options": [
        "Excessive template instantiations and long compile times",
        "Loss of virtual dispatch and broken overload resolution",
        "Aliasing surprises, dangling pointers and lifetime bugs, and shared mutable state that complicates multithreading",
        "Inability to declare functions noexcept anywhere in the codebase"
      ],
      "answer": 2,
      "explain": "A pointer or reference is a second name for an object that lives elsewhere. That immediately raises three questions everywhere it travels: does it still point to a live object (lifetime), is someone else mutating it (aliasing/shared state), and who may write it concurrently (threading)? These are exactly the problems value semantics avoids by construction."
    },
    {
      "type": "code",
      "tag": "copy independence",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> a{1, 2, 3};\n    std::vector<int> b = a;   // value semantics: independent copy\n    b.push_back(4);\n    std::cout << a.size() << ' ' << b.size() << '\\n';\n}",
      "options": [
        "3 4",
        "4 4",
        "3 3",
        "4 3"
      ],
      "answer": 0,
      "explain": "std::vector is a value type: 'b = a' performs a deep copy of the elements, after which a and b are completely independent. Growing b cannot be observed through a. This copy independence is the essence of value semantics — mutation never acts at a distance."
    },
    {
      "type": "code",
      "tag": "aliasing",
      "question": "Two reference parameters, one object. What does this program print?",
      "code": "#include <iostream>\n\nvoid addTax(double& price, double& total) {\n    price *= 1.1;\n    total += price;\n}\n\nint main() {\n    double p = 100.0;\n    addTax(p, p);   // both parameters alias the same variable\n    std::cout << p << '\\n';\n}",
      "options": [
        "110",
        "210",
        "100",
        "220"
      ],
      "answer": 3,
      "explain": "price and total are the same object. First p becomes 100 * 1.1 = 110, then total += price adds 110 to itself, giving 220. The function was written assuming two distinct objects — aliasing silently breaks that assumption, which is exactly why value-oriented designs prefer taking inputs by value and returning results."
    },
    {
      "type": "mcq",
      "tag": "out-params",
      "question": "A function is declared as void normalize(const std::vector<double>& in, std::vector<double>& out). Why does a value-oriented style discourage this signature in favor of returning a vector?",
      "options": [
        "A caller may pass the same vector as both arguments; aliasing between in and out can silently corrupt the algorithm, whereas a returned value can never alias its input",
        "Reference parameters cannot bind to vectors of floating-point element types",
        "Out-parameters always require an extra heap allocation that return values avoid",
        "The compiler cannot inline functions that take more than one reference parameter"
      ],
      "answer": 0,
      "explain": "With in/out reference parameters, nothing stops normalize(v, v) — and the implementation probably reads 'in' while writing 'out', producing garbage when they alias. Returning a fresh vector by value makes aliasing structurally impossible, and with move semantics and RVO the return costs little or nothing."
    },
    {
      "type": "code",
      "tag": "pass by value",
      "question": "A helper takes the vector by value and writes to it. What does this program print?",
      "code": "#include <iostream>\n#include <vector>\n\nvoid tweak(std::vector<int> v) {   // parameter taken BY VALUE\n    v[0] = 99;\n}\n\nint main() {\n    std::vector<int> data{1, 2, 3};\n    tweak(data);\n    std::cout << data[0] << '\\n';\n}",
      "options": [
        "99",
        "0",
        "1",
        "The program does not compile because v is modified inside tweak"
      ],
      "answer": 2,
      "explain": "tweak receives its own copy of the vector, so the write to v[0] affects only the local copy, which dies at the end of the call. The caller's data is untouched and data[0] is still 1. Pass-by-value gives the callee full freedom to mutate without any risk to the caller — a key local-reasoning benefit."
    },
    {
      "type": "mcq",
      "tag": "concurrency",
      "question": "Why do value-semantic designs tend to simplify concurrent code?",
      "options": [
        "Value types are automatically protected by an internal mutex in the standard library",
        "Copying is atomic in C++, so values can be handed between threads without synchronization primitives of any kind at any time",
        "Threads that use values run on dedicated cores, so contention is impossible",
        "Each thread can work on its own copy; without shared mutable state there is nothing to race on, so many locks simply disappear"
      ],
      "answer": 3,
      "explain": "Data races need shared, mutable data. Reference semantics maximizes sharing; value semantics minimizes it — give each thread its own value and the race vanishes without a mutex. Copies aren't magically atomic (option B is false); the point is that independent copies remove the need to synchronize in the first place."
    },
    {
      "type": "code",
      "tag": "shared_ptr aliasing",
      "question": "std::shared_ptr copies the handle, not the pointee. What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n\nint main() {\n    auto a = std::make_shared<int>(1);\n    auto b = a;      // copies the pointer, NOT the int\n    *b = 7;\n    std::cout << *a << ' ' << a.use_count() << '\\n';\n}",
      "options": [
        "1 2",
        "7 2",
        "7 1",
        "1 1"
      ],
      "answer": 1,
      "explain": "shared_ptr has reference semantics: copying it produces a second handle to the same int, and the use count rises to 2. Writing through b is visible through a, so *a is 7. This is the trap Iglberger highlights — a type can be copyable and still spread shared mutable state, because it is the handle that is the value, not the pointee."
    },
    {
      "type": "mcq",
      "tag": "invalidation",
      "question": "A module hands out iterators (or pointers) into its internal container to its callers. Why is this a fragile contract?",
      "options": [
        "Iterators cannot be stored in local variables outside the defining translation unit",
        "The iterator is a reference-semantics handle: any later mutation of the container may invalidate it, so the container's invalidation rules leak across the module boundary into every caller",
        "Returning an iterator always copies the entire container, which is too expensive",
        "Iterators returned from a module compare unequal to iterators created inside it"
      ],
      "answer": 1,
      "explain": "An iterator is a lightweight alias into someone else's storage. The moment it crosses a module boundary, every caller must know and respect the container's invalidation rules — a push_back deep inside the module can dangle a handle far away. Returning values (or indices with a stable contract) keeps that coupling from spreading."
    },
    {
      "type": "code",
      "tag": "self-aliasing",
      "question": "The author cached the size to survive self-aliasing. What does this program print?",
      "code": "#include <iostream>\n#include <vector>\n\nvoid appendAll(const std::vector<int>& src, std::vector<int>& dst) {\n    for (std::size_t i = 0, n = src.size(); i < n; ++i)\n        dst.push_back(src[i]);   // indices, size cached up front\n}\n\nint main() {\n    std::vector<int> v{1, 2};\n    appendAll(v, v);   // src and dst alias the same vector\n    std::cout << v.size() << '\\n';\n}",
      "options": [
        "2",
        "The program never terminates because src grows while it is being read",
        "6",
        "4"
      ],
      "answer": 3,
      "explain": "Because n was cached before the loop, the loop runs exactly twice even though push_back grows the aliased vector, and indexing re-derives a valid element pointer after any reallocation — v ends as {1,2,1,2}, size 4. Had the loop compared i < src.size() each time, it would never terminate; had it used iterators, reallocation would dangle them. Taking src by value would have made all of this care unnecessary."
    },
    {
      "type": "mcq",
      "tag": "performance",
      "question": "Skeptics argue that value semantics must be slow 'because of all the copying'. Which rebuttal matches the book's position?",
      "options": [
        "Move semantics, small-buffer optimizations, and better cache locality (values avoid pointer chasing) often make value-based designs as fast or faster — measure before assuming references win",
        "Copies are indeed always slower, but correctness is worth any performance price",
        "The compiler removes every copy in a value-semantics program via mandatory elision",
        "Value semantics is only viable for types of at most one machine word"
      ],
      "answer": 0,
      "explain": "Iglberger's point is that the performance objection is usually overstated: moves make transfers cheap, values sit contiguously in cache instead of behind indirections, and the optimizer reasons far better about non-aliased data. Copy elision helps but is not universal (option C overclaims), so the honest answer is: values are typically cheap enough, and sometimes faster — profile instead of presuming."
    },
    {
      "type": "code",
      "tag": "move semantics",
      "question": "The vector's contents are transferred, not copied. What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n#include <vector>\n\nint main() {\n    std::vector<int> a{1, 2, 3};\n    std::vector<int> b = std::move(a);   // transfer, not copy\n    std::cout << b.size() << '\\n';\n}",
      "options": [
        "0",
        "The program does not compile because a is used after std::move",
        "3",
        "6"
      ],
      "answer": 2,
      "explain": "std::move enables the move constructor, which steals a's buffer: b now owns the three elements, so b.size() is 3. No element is copied — this cheap ownership transfer is what makes 'return by value' and value-based APIs affordable. (a is left in a valid but unspecified state, which is why the program deliberately does not print a.size().)"
    },
    {
      "type": "code",
      "tag": "copy vs move count",
      "question": "This type counts its copies and moves. What does the program print?",
      "code": "#include <iostream>\n#include <utility>\n\nint copies = 0, moves = 0;\n\nstruct S {\n    S() = default;\n    S(const S&) { ++copies; }\n    S(S&&) noexcept { ++moves; }\n};\n\nint main() {\n    S a;\n    S b = std::move(a);\n    S c = b;\n    std::cout << copies << ' ' << moves << '\\n';\n}",
      "options": [
        "2 0",
        "1 1",
        "0 2",
        "2 1"
      ],
      "answer": 1,
      "explain": "'S b = std::move(a)' selects the move constructor (one move), and 'S c = b' copies from the lvalue b (one copy). Default construction of a touches neither counter. Distinguishing these two channels is the mechanical basis of cheap value semantics: expensive copies can often be replaced by cheap moves."
    },
    {
      "type": "code",
      "tag": "copy count",
      "question": "How many copies does this program report?",
      "code": "#include <iostream>\n\nint copies = 0;\n\nstruct S {\n    S() = default;\n    S(const S&) { ++copies; }\n};\n\nvoid byValue(S s) {}\nvoid byRef(const S& s) {}\n\nint main() {\n    S s;\n    byValue(s);\n    byRef(s);\n    byValue(s);\n    std::cout << copies << '\\n';\n}",
      "options": [
        "2",
        "3",
        "1",
        "0"
      ],
      "answer": 0,
      "explain": "Each call to byValue copy-constructs the parameter from the lvalue s (two copies total), while byRef binds a reference and copies nothing. Passing by value has a real, countable cost — the value-semantics argument is that this cost is usually small and buys aliasing-freedom, not that it is zero."
    },
    {
      "type": "mcq",
      "tag": "GoF style",
      "question": "Iglberger observes that the classic GoF design patterns book feels dated to modern C++ developers. What is the core reason?",
      "options": [
        "The GoF patterns are covered by software patents and cannot be used freely",
        "The GoF intents themselves are obsolete and no longer occur in modern software",
        "GoF presents every pattern in a reference-semantics, inheritance-heavy OO style; modern C++ can realize the same intents with values, templates, std::variant, and type erasure",
        "The GoF book predates exceptions, so none of its patterns can handle errors"
      ],
      "answer": 2,
      "explain": "The book's recurring move is to separate a pattern's intent from its classic implementation. The intents (Decorator, Strategy, Observer, ...) remain highly relevant; what aged is the 1994 implementation vocabulary of base-class pointers and new. Modern C++ lets you keep the intent while regaining value semantics via variants, templates, and type-erased wrappers."
    },
    {
      "type": "code",
      "tag": "slicing",
      "question": "Naively copying a polymorphic object by value slices it. What does this program print?",
      "code": "#include <iostream>\n\nstruct Shape {\n    virtual ~Shape() = default;\n    virtual const char* name() const { return \"shape\"; }\n};\n\nstruct Circle : Shape {\n    const char* name() const override { return \"circle\"; }\n};\n\nint main() {\n    Circle c;\n    Shape s = c;    // copies only the Shape part\n    Shape& r = c;   // refers to the whole Circle\n    std::cout << s.name() << ' ' << r.name() << '\\n';\n}",
      "options": [
        "circle circle",
        "shape shape",
        "The program does not compile: a Circle cannot initialize a Shape",
        "shape circle"
      ],
      "answer": 3,
      "explain": "'Shape s = c' invokes Shape's copy constructor, copying only the base subobject — the Circle-ness is sliced away and s.name() dispatches (statically, in effect) to the base version. The reference r still aliases the full Circle, so it prints 'circle'. This is why value semantics for polymorphic designs needs different machinery — std::variant or type erasure — rather than copying through base classes."
    },
    {
      "type": "mcq",
      "tag": "regular types",
      "question": "In Stepanov's sense, which set of operations must a Regular type provide, with coherent meaning?",
      "options": [
        "Virtual destructor, clone(), and a static instance() accessor",
        "Default construction, copy (and move) construction and assignment, destruction, and equality — such that a copy compares equal to its source",
        "Implicit conversion to and from int, plus a hash function",
        "Only a destructor; everything else is optional for regularity"
      ],
      "answer": 1,
      "explain": "A Regular type behaves like int: you can default-construct it, copy it, assign it, destroy it, and compare it, and these operations cohere (copying yields an equal value, assignment makes the target equal to the source). Regularity is the formal backbone of value semantics — it is what lets values be stored, moved around, and reasoned about like built-ins."
    },
    {
      "type": "mcq",
      "tag": "copy/equality coherence",
      "question": "After executing Widget b = a; what must hold for a well-designed value type?",
      "options": [
        "a == b is true, and subsequent mutations of b are not observable through a",
        "a == b is false until b is explicitly committed with b.sync()",
        "a and b share storage until one of them is written to",
        "b holds a reference to a, so destroying a invalidates b"
      ],
      "answer": 0,
      "explain": "Copy and equality must cohere: a copy is a new, equal, independent value. If copying produced something unequal, or if mutating the copy leaked back into the original, generic code (and human readers) could no longer substitute one for the other. Note that copy-on-write sharing (option C) is a hidden implementation choice at best — observable behavior must still be full independence."
    },
    {
      "type": "code",
      "tag": "defaulted equality",
      "question": "C++20 defaulted comparison in action — what does this program print?",
      "code": "#include <iostream>\n\nstruct Money {\n    long cents;\n    bool operator==(const Money&) const = default;\n};\n\nint main() {\n    Money a{250};\n    Money b = a;\n    std::cout << (a == b) << ' ' << (Money{250} == Money{251}) << '\\n';\n}",
      "options": [
        "0 0",
        "The program does not compile: defaulted operator== requires operator<=> as well",
        "1 0",
        "1 1"
      ],
      "answer": 2,
      "explain": "The defaulted operator== compares members, so the copy b compares equal to a (prints 1) and 250 != 251 prints 0. C++20's '= default' comparisons make the copy/equality coherence of a value type nearly free to state — no spaceship operator is required just for equality."
    },
    {
      "type": "code",
      "tag": "broken regularity",
      "question": "This type defines equality as identity. What does the program print, and what does it reveal?",
      "code": "#include <iostream>\n\nstruct Session {\n    int id;\n    bool operator==(const Session& o) const {\n        return this == &o;   // identity, not value!\n    }\n};\n\nint main() {\n    Session a{7};\n    Session b = a;\n    std::cout << (a == b) << ' ' << (a == a) << '\\n';\n}",
      "options": [
        "1 1",
        "0 1",
        "1 0",
        "0 0"
      ],
      "answer": 1,
      "explain": "b is a copy of a, yet a == b is false because equality compares addresses, not state — printing 0, while a == a trivially prints 1. This violates regularity's core promise that a copy compares equal to its source, so the type would silently misbehave in containers, algorithms, and any generic code that assumes value semantics."
    },
    {
      "type": "mcq",
      "tag": "deep copy",
      "question": "Your value type owns a heap buffer through a raw pointer member. What should its copy constructor do?",
      "options": [
        "Copy the pointer so both objects share the buffer; it is faster and usually harmless",
        "Be deleted: types owning heap memory can never be value types",
        "Null out the source's pointer so ownership transfers on copy",
        "Deep-copy the buffer so each object owns an independent resource, keeping copy and equality coherent"
      ],
      "answer": 3,
      "explain": "A value type's copy must produce an independent, equal object — for owned resources that means a deep copy. Sharing the pointer (shallow copy) creates aliasing and a double-delete; stealing it on copy (option C) is what moves are for, not copies. If deep copies are genuinely too expensive, that is a design signal to reconsider, not a license to alias silently."
    },
    {
      "type": "code",
      "tag": "shallow sharing",
      "question": "This 'value type' holds its data behind a shared_ptr. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <vector>\n\nstruct Doc {\n    std::shared_ptr<std::vector<int>> data =\n        std::make_shared<std::vector<int>>();\n};\n\nint main() {\n    Doc a;\n    a.data->push_back(1);\n    Doc b = a;             // copies the shared_ptr member\n    b.data->push_back(2);\n    std::cout << a.data->size() << '\\n';\n}",
      "options": [
        "2",
        "1",
        "0",
        "The program does not compile: Doc has no copy constructor"
      ],
      "answer": 0,
      "explain": "Doc's implicit copy constructor copies the shared_ptr, so a and b share one vector — b's push_back is visible through a, and the size is 2. The type copies syntactically like a value but behaves like a reference: this shallow-copy design silently reintroduces shared mutable state behind a value-looking facade."
    },
    {
      "type": "mcq",
      "tag": "const as design",
      "question": "How does the book treat const in the context of value-based design?",
      "options": [
        "As a micro-optimization hint that lets the compiler place objects in ROM",
        "As a legacy feature that interferes with move semantics and should be avoided in new code",
        "As a design and communication tool: it documents and enforces immutability, enabling local reasoning — and immutable values can be shared across threads for reading without synchronization",
        "As a way to make member functions dispatch statically instead of virtually"
      ],
      "answer": 2,
      "explain": "const is a statement of intent that the compiler enforces: 'this function does not mutate', 'this value will not change under you'. That guarantee restores local reasoning even where references must be used, and data that provably never mutates is inherently safe to read concurrently. It is a design tool first, an optimization opportunity second."
    },
    {
      "type": "code",
      "tag": "const enforcement",
      "question": "What happens when you build this program?",
      "code": "#include <iostream>\n\nstruct Point {\n    int x = 0;\n    void set(int v) const { x = v; }\n    int get() const { return x; }\n};\n\nint main() {\n    Point p;\n    p.set(3);\n    std::cout << p.get() << '\\n';\n}",
      "options": [
        "It prints 3",
        "It prints 0",
        "It compiles but has undefined behavior at runtime",
        "It fails to compile: set is a const member function, so assigning to x writes through a const this pointer"
      ],
      "answer": 3,
      "explain": "Inside a const member function, this points to a const Point, so 'x = v' is an assignment to a member of a const object and is rejected at compile time. This is const doing its design job: the promise 'set does not mutate' is checked by the compiler, and a contradictory implementation cannot even build."
    },
    {
      "type": "code",
      "tag": "view aliasing",
      "question": "A view and a copy watch the same string get mutated. What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <string_view>\n\nint main() {\n    std::string s = \"design\";\n    std::string_view v = s;   // non-owning view of s\n    std::string copy = s;     // independent value\n    s[0] = 'D';\n    std::cout << v << ' ' << copy << '\\n';\n}",
      "options": [
        "design design",
        "Design Design",
        "design Design",
        "Design design"
      ],
      "answer": 3,
      "explain": "string_view has reference semantics: v aliases s's characters, so the mutation to s[0] shows through it ('Design'). The std::string copy took its own snapshot at construction and still reads 'design'. One line of mutation, two different observations — the visible signature of mixing reference-semantic views with value-semantic copies."
    },
    {
      "type": "mcq",
      "tag": "std::optional",
      "question": "A lookup function may legitimately find nothing. In a value-semantics toolkit, what is the preferred return type over 'T* (nullptr on failure)'?",
      "options": [
        "std::optional<T> — an owning sum type that makes emptiness explicit in the type, with no lifetime obligations for the caller",
        "T& with a documented convention to call the function only when the element exists",
        "A bool return plus a T& out-parameter that is filled on success",
        "A raw T* is preferred, because optional cannot hold class types efficiently"
      ],
      "answer": 0,
      "explain": "optional<T> carries the maybe-missing result by value: the caller owns it, cannot dangle, and the empty state is part of the type rather than a pointer convention. The T* version forces the caller to worry about the pointee's lifetime and to remember the nullptr rule; the bool + out-param version reintroduces reference-parameter aliasing and split initialization."
    },
    {
      "type": "code",
      "tag": "optional",
      "question": "A lookup returning std::optional, consumed with value_or. What does this program print?",
      "code": "#include <iostream>\n#include <optional>\n\nstd::optional<int> find(bool ok) {\n    if (ok) return 42;\n    return std::nullopt;\n}\n\nint main() {\n    std::cout << find(false).value_or(-1) << ' '\n              << find(true).value_or(-1) << '\\n';\n}",
      "options": [
        "-1 -1",
        "-1 42",
        "42 42",
        "The program throws std::bad_optional_access"
      ],
      "answer": 1,
      "explain": "value_or returns the contained value when the optional is engaged and the fallback otherwise — so the failed lookup yields -1 and the successful one yields 42. No exception is possible here because value_or never requires engagement; the 'not found' case is handled as an ordinary value, not as control flow."
    },
    {
      "type": "mcq",
      "tag": "std::variant",
      "question": "You have a closed, known set of shape alternatives and want value semantics. Which tool does the book reach for instead of a base-class hierarchy?",
      "options": [
        "A void* plus an enum tag, switched on manually at each use site",
        "std::any, because it can hold every possible shape including future ones",
        "std::variant<Circle, Square, ...> with std::visit — a sum type of concrete values instead of pointers to a base class",
        "A common Shape base class with shared_ptr<Shape> everywhere"
      ],
      "answer": 2,
      "explain": "For a closed set of alternatives, variant stores whichever value is active in-place — no heap, no pointers, no virtual dispatch — and std::visit dispatches to the right handler. Unlike std::any or void*, the set of alternatives is in the type, so the compiler can flag unhandled cases. The trade-off versus a hierarchy: adding operations becomes easy, adding new types means touching the variant."
    },
    {
      "type": "code",
      "tag": "variant basics",
      "question": "A variant initialized with its second alternative. What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <variant>\n\nint main() {\n    std::variant<int, std::string> v = std::string(\"err\");\n    std::cout << v.index() << ' '\n              << std::get<1>(v).size() << '\\n';\n}",
      "options": [
        "1 3",
        "0 3",
        "1 0",
        "0 0"
      ],
      "answer": 0,
      "explain": "The variant holds its second alternative (std::string), so index() is 1 — indices are zero-based over the alternative list. std::get<1> returns a reference to that string, whose size is 3. The active alternative is tracked by the variant itself, by value, with no heap allocation."
    },
    {
      "type": "code",
      "tag": "variant copies",
      "question": "Does copying a variant copy its contents? What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <variant>\n\nint main() {\n    std::variant<int, std::string> a = std::string(\"abc\");\n    auto b = a;                       // copy the variant\n    std::get<std::string>(b) += \"def\";\n    std::cout << std::get<std::string>(a) << ' '\n              << std::get<std::string>(b) << '\\n';\n}",
      "options": [
        "abcdef abcdef",
        "abc abc",
        "abcdef abc",
        "abc abcdef"
      ],
      "answer": 3,
      "explain": "variant is a true value type: copying a deep-copies the active std::string, so b's append is invisible through a. This is precisely what makes variant the value-semantics replacement for pointer-based hierarchies — copies of the whole sum type behave like copies of ints."
    },
    {
      "type": "code",
      "tag": "std::visit",
      "question": "A two-overload visitor meets a variant currently holding an int. What does this program print?",
      "code": "#include <iostream>\n#include <variant>\n\nstruct Visitor {\n    void operator()(int i) const    { std::cout << \"int:\" << i; }\n    void operator()(double d) const { std::cout << \"double:\" << d; }\n};\n\nint main() {\n    std::variant<int, double> v = 2;\n    std::visit(Visitor{}, v);\n    std::cout << '\\n';\n}",
      "options": [
        "double:2",
        "int:2",
        "The program does not compile: visit cannot choose between the two overloads",
        "int:2double:2"
      ],
      "answer": 1,
      "explain": "The literal 2 is an int, so the variant's active alternative is int, and std::visit invokes exactly the matching operator() — printing 'int:2'. Visitation is the variant world's counterpart of virtual dispatch: one call, resolved against the active alternative, but with the full alternative list checked at compile time."
    },
    {
      "type": "code",
      "tag": "bad access",
      "question": "std::get asks for the wrong alternative. What does this program print?",
      "code": "#include <iostream>\n#include <variant>\n\nint main() {\n    std::variant<int, double> v = 3.5;\n    try {\n        std::cout << std::get<int>(v) << '\\n';\n    } catch (const std::bad_variant_access&) {\n        std::cout << \"bad access\\n\";\n    }\n}",
      "options": [
        "3",
        "3.5",
        "bad access",
        "0"
      ],
      "answer": 2,
      "explain": "The variant holds a double, and std::get<int> on a variant whose active alternative is different throws std::bad_variant_access — there is no implicit conversion of the stored 3.5 to int. Checked access is part of variant's value-type contract; use std::get_if or std::visit when the alternative is not known for certain."
    },
    {
      "type": "mcq",
      "tag": "std::expected",
      "question": "What does std::expected<T, E> (C++23) express that std::optional<T> cannot?",
      "options": [
        "It guarantees the operation is retried automatically until it succeeds",
        "It stores both the value and the error simultaneously so callers can inspect either",
        "It makes the error state impossible to ignore by terminating on unchecked access",
        "Its failure alternative carries a concrete error value E, so the reason for failure travels by value together with the result"
      ],
      "answer": 3,
      "explain": "optional can only say 'nothing here'; expected says 'either a T, or this specific E explaining why not'. It completes the value-semantics error toolkit: failures become ordinary values that are returned, moved, and pattern-matched, instead of exceptions unwinding the stack or error codes smuggled through out-parameters. It holds one alternative at a time, not both."
    },
    {
      "type": "mcq",
      "tag": "string_view contract",
      "question": "std::string_view is which kind of type, and what contract does it impose on its users?",
      "options": [
        "A reference-semantics, non-owning type: whoever holds the view must ensure the viewed characters outlive every use of it",
        "A value-semantics type: it stores its own copy of the characters in a small internal buffer",
        "An owning type that frees the characters when the last view is destroyed",
        "A reference-counted type that keeps the source string alive automatically"
      ],
      "answer": 0,
      "explain": "string_view is deliberately a reference-semantics type — a pointer plus a length — chosen for cheap, copy-free parameter passing. The price is a lifetime contract the compiler does not check: the viewed buffer must stay alive and unmodified for as long as the view is used. It neither copies, owns, nor reference-counts anything."
    },
    {
      "type": "mcq",
      "tag": "std::span",
      "question": "A function declared void f(std::span<int> s) writes to s's elements. What does that mean for callers?",
      "options": [
        "Nothing — span takes a snapshot of the elements at the call site",
        "span is a non-owning view: the writes go straight through to the caller's own elements, and the span is invalidated by whatever invalidates the underlying storage",
        "The writes trigger a copy-on-write, so the caller sees changes only after calling s.commit()",
        "The program will not compile: span elements are always const"
      ],
      "answer": 1,
      "explain": "span<int> is a borrowed window onto contiguous storage owned by someone else; mutations through the span are mutations of the caller's data. Its validity is tied to the underlying buffer — a reallocation of the source vector dangles every span over it. Note that passing the span itself by value changes nothing: the copied handle still refers to the same elements. Use span<const int> to forbid writes."
    },
    {
      "type": "code",
      "tag": "span writes",
      "question": "The span parameter borrows the vector's own storage. What does this program print?",
      "code": "#include <iostream>\n#include <span>\n#include <vector>\n\nvoid zero(std::span<int> s) {\n    for (int& x : s) x = 0;\n}\n\nint main() {\n    std::vector<int> v{1, 2, 3};\n    zero(v);\n    std::cout << v[0] + v[1] + v[2] << '\\n';\n}",
      "options": [
        "0",
        "6",
        "3",
        "The program does not compile: a vector cannot convert to std::span<int>"
      ],
      "answer": 0,
      "explain": "vector converts implicitly to span<int>, and the span is a view over the vector's own elements — zeroing through it zeroes v itself, so the sum is 0. Even though the span parameter is passed 'by value', what is copied is only the handle (pointer + size); the semantics of the call are thoroughly reference-like."
    },
    {
      "type": "mcq",
      "tag": "views usage",
      "question": "Where do string_view and span fit appropriately into a value-oriented design?",
      "options": [
        "As map keys, since views hash faster than owning strings in every situation",
        "As data members of long-lived objects, to avoid the cost of owning strings",
        "As short-lived function parameters — borrowed for the duration of the call — while long-term storage uses owning value types",
        "Nowhere: a value-oriented design must never use any reference-semantics type"
      ],
      "answer": 2,
      "explain": "The book's stance is pragmatic, not absolutist: views are excellent at call boundaries, where the argument demonstrably outlives the call and copying would be waste. Persisting a view inside an object re-imports the lifetime problem in its worst form, because nothing ties the view to its buffer. Borrow briefly; own long-term."
    },
    {
      "type": "code",
      "tag": "view operations",
      "question": "Slicing a view of a string literal, with no allocation anywhere. What does this program print?",
      "code": "#include <iostream>\n#include <string_view>\n\nint main() {\n    std::string_view sv = \"value semantics\";\n    std::string_view w = sv.substr(6, 9);   // no allocation\n    std::cout << w << '\\n';\n}",
      "options": [
        "value sem",
        "value",
        " semantic",
        "semantics"
      ],
      "answer": 3,
      "explain": "substr(6, 9) yields a view starting at index 6 ('s' of 'semantics') with length 9 — printing 'semantics'. Unlike std::string::substr, the view version allocates nothing: it just narrows the pointer/length pair. The string literal has static storage duration, so the view can never dangle here."
    },
    {
      "type": "mcq",
      "tag": "decorator intent",
      "question": "What is the GoF intent of the Decorator pattern?",
      "options": [
        "Convert the interface of a class into another interface that clients expect",
        "Attach additional responsibilities to an object dynamically — a flexible alternative to subclassing for extending functionality",
        "Define a family of interchangeable algorithms and let them vary independently from clients",
        "Provide a surrogate that controls access to another object"
      ],
      "answer": 1,
      "explain": "Decorator is about layering: wrapping an object to add responsibilities while preserving its interface, composable at runtime and stackable to any depth. Option A is Adapter, option C is Strategy, option D is Proxy — the neighboring patterns Iglberger explicitly contrasts with Decorator."
    },
    {
      "type": "mcq",
      "tag": "decorator structure",
      "question": "In the classic OO Decorator, what is the structural trick that makes stacking work?",
      "options": [
        "The decorator is a friend of the component so it can reach private state",
        "The decorator derives from every concrete component it may wrap",
        "The component holds a list of decorators and notifies them of every call",
        "The decorator both inherits the component interface (so it is substitutable for a component) and holds a component (so it can forward and extend)"
      ],
      "answer": 3,
      "explain": "The double relationship is the whole pattern: is-a makes a decorated object usable wherever a component is expected — including inside another decorator — and has-a lets each layer forward to the object it wraps, adding its contribution before or after. Because a decorator is itself a component, layers stack indefinitely."
    },
    {
      "type": "code",
      "tag": "decorator trace",
      "question": "Trace the decorator stack. What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n\nstruct Item {\n    virtual ~Item() = default;\n    virtual double price() const = 0;\n};\n\nstruct Book : Item {\n    double price() const override { return 100.0; }\n};\n\nstruct Discounted : Item {\n    std::unique_ptr<Item> item;\n    explicit Discounted(std::unique_ptr<Item> i) : item(std::move(i)) {}\n    double price() const override { return item->price() * 0.8; }\n};\n\nstruct Taxed : Item {\n    std::unique_ptr<Item> item;\n    explicit Taxed(std::unique_ptr<Item> i) : item(std::move(i)) {}\n    double price() const override { return item->price() * 1.25; }\n};\n\nint main() {\n    Taxed t{std::make_unique<Discounted>(std::make_unique<Book>())};\n    std::cout << t.price() << '\\n';\n}",
      "options": [
        "100",
        "80",
        "125",
        "105"
      ],
      "answer": 0,
      "explain": "The call runs outside-in: Taxed::price asks its wrapped Discounted, which asks the Book (100), applies the 20% discount (80), and returns; Taxed then applies 25% tax: 80 * 1.25 = 100. Each layer adds one responsibility and delegates the rest — the pricing example the book uses to motivate Decorator."
    },
    {
      "type": "code",
      "tag": "stream decorators",
      "question": "Stream-style decorators wrap a sink. What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n\nstruct Stream {\n    virtual ~Stream() = default;\n    virtual void write() const = 0;\n};\n\nstruct FileStream : Stream {\n    void write() const override { std::cout << \"file\"; }\n};\n\nstruct Compress : Stream {\n    std::unique_ptr<Stream> s;\n    explicit Compress(std::unique_ptr<Stream> p) : s(std::move(p)) {}\n    void write() const override {\n        std::cout << \"zip(\"; s->write(); std::cout << \")\";\n    }\n};\n\nstruct Encrypt : Stream {\n    std::unique_ptr<Stream> s;\n    explicit Encrypt(std::unique_ptr<Stream> p) : s(std::move(p)) {}\n    void write() const override {\n        std::cout << \"aes(\"; s->write(); std::cout << \")\";\n    }\n};\n\nint main() {\n    Encrypt e{std::make_unique<Compress>(std::make_unique<FileStream>())};\n    e.write();\n    std::cout << '\\n';\n}",
      "options": [
        "zip(aes(file))",
        "file(zip(aes))",
        "aes(zip(file))",
        "aeszipfile"
      ],
      "answer": 2,
      "explain": "The outermost decorator is Encrypt, so its prefix prints first, then it delegates inward to Compress, which delegates to the FileStream at the core — producing aes(zip(file)). This nesting is exactly how I/O stream decorators (buffering, compression, encryption) layer behavior around a raw sink without any layer knowing about the others."
    },
    {
      "type": "mcq",
      "tag": "combinatorial explosion",
      "question": "Why does adding independent features purely via inheritance explode, and how does Decorator help?",
      "options": [
        "N independent features need up to 2^N subclasses to cover all combinations (even more if order matters); decorators instead compose the same features at runtime from N small classes",
        "Inheritance limits a class to at most eight direct base classes, which features quickly exhaust",
        "Each subclass duplicates the vtable, so N features cost N times the binary size",
        "Inheritance is fine for feature combinations; Decorator only exists to avoid virtual calls"
      ],
      "answer": 0,
      "explain": "With subclassing, every combination (taxed, discounted, taxed+discounted, ...) needs its own class — combinations multiply while classes must be written by hand. Decorator turns each feature into one wrapper, and combinations become runtime composition: N classes yield all stacks, in any order. This is the book's core argument for Decorator over inheritance-based feature addition."
    },
    {
      "type": "code",
      "tag": "stacking order",
      "question": "Same layers, opposite order. What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n\nstruct Item {\n    virtual ~Item() = default;\n    virtual double price() const = 0;\n};\n\nstruct Book : Item {\n    double price() const override { return 100.0; }\n};\n\nstruct Discount : Item {   // takes 10 off\n    std::unique_ptr<Item> item;\n    explicit Discount(std::unique_ptr<Item> i) : item(std::move(i)) {}\n    double price() const override { return item->price() - 10.0; }\n};\n\nstruct Tax : Item {        // adds 20%\n    std::unique_ptr<Item> item;\n    explicit Tax(std::unique_ptr<Item> i) : item(std::move(i)) {}\n    double price() const override { return item->price() * 1.2; }\n};\n\nint main() {\n    Tax a{std::make_unique<Discount>(std::make_unique<Book>())};\n    Discount b{std::make_unique<Tax>(std::make_unique<Book>())};\n    std::cout << a.price() << ' ' << b.price() << '\\n';\n}",
      "options": [
        "108 108",
        "108 110",
        "110 108",
        "110 110"
      ],
      "answer": 1,
      "explain": "a taxes the discounted price: (100 - 10) * 1.2 = 108. b discounts the taxed price: 100 * 1.2 - 10 = 110. Because an absolute discount and a percentage tax do not commute, the stacking order changes the answer by two currency units — a concrete demonstration that decorator order is semantics, not detail."
    },
    {
      "type": "mcq",
      "tag": "order sensitivity",
      "question": "Stacking a percentage tax and an absolute discount gives different totals depending on order. What is the design lesson?",
      "options": [
        "Decorators must be written so that all stacking orders produce identical results",
        "The runtime should sort decorators automatically into a canonical order",
        "Such non-commuting responsibilities must never be expressed as decorators",
        "The ordering of stacked decorators is part of the design's semantics: the correct order must be specified, enforced where possible, and tested — it is not an implementation detail"
      ],
      "answer": 3,
      "explain": "The pattern happily composes layers in any order; it cannot know which orders are meaningful in the domain. When layers do not commute (tax vs. discount, compress vs. encrypt), whoever assembles the stack owns a real semantic decision. Good designs make that decision explicit — through construction APIs, documentation, and tests — rather than leaving it to accident."
    },
    {
      "type": "mcq",
      "tag": "pattern comparison",
      "question": "Decorator, Adapter, and Strategy can all 'wrap' something. Which distinction is correct?",
      "options": [
        "Adapter adds behavior, Decorator changes the interface, Strategy removes behavior",
        "All three are interchangeable; the names only reflect the era in which they were coined",
        "Adapter changes an object's interface; Strategy swaps out the implementation of a step from within the object; Decorator keeps the interface and layers additional behavior around the object from outside",
        "Strategy and Decorator require inheritance while Adapter requires templates"
      ],
      "answer": 2,
      "explain": "The three intents differ even when the code shapes look similar. Adapter exists to translate one interface into another; Strategy is injected into an object to vary how one piece of its work is done; Decorator preserves the interface exactly, so wrapped and unwrapped objects are interchangeable, while responsibilities accumulate in layers. Identifying which intent you need is the design decision."
    },
    {
      "type": "mcq",
      "tag": "value-based decorator",
      "question": "The book reimplements Decorator with value semantics (a type-erased wrapper around any 'priced item'). What do users gain over the classic pointer-based version?",
      "options": [
        "Value semantics at the interface: decorated objects are copyable self-contained values, with no visible pointers, no new, and no manual lifetime management — while composition remains dynamic",
        "Compile-time verification that decorators are stacked in a semantically correct order",
        "Automatic memoization of the wrapped object's computations between calls",
        "Elimination of all heap allocation under every possible circumstance"
      ],
      "answer": 0,
      "explain": "Type erasure hides the inheritance machinery inside one owning wrapper type, so client code composes and copies decorated items like ints — no unique_ptr, no base-class pointers in sight. Allocation may still happen internally (small-buffer tricks aside), and order correctness stays a semantic issue; what changes is that reference semantics disappears from the user-facing design."
    },
    {
      "type": "code",
      "tag": "function decorators",
      "question": "Decorating with std::function instead of inheritance. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nusing Price = std::function<double()>;\n\nPrice base()            { return [] { return 50.0; }; }\nPrice taxed(Price p)    { return [p] { return p() * 1.1; }; }\nPrice discounted(Price p){ return [p] { return p() - 5.0; }; }\n\nint main() {\n    Price total = discounted(taxed(base()));\n    std::cout << total() << '\\n';\n}",
      "options": [
        "55",
        "45",
        "49.5",
        "50"
      ],
      "answer": 3,
      "explain": "Each wrapper captures the previous callable by value and returns a new one with the same signature — a decorator chain without any class hierarchy. Evaluation runs inside-out: 50, taxed to 55, then 5 off gives 50. std::function's type erasure supplies the uniform 'component interface' that inheritance provided in the classic version."
    },
    {
      "type": "mcq",
      "tag": "type erasure",
      "question": "Why is std::function such a natural building block for value-semantic decoration?",
      "options": [
        "It caches results of the wrapped callable, so layered calls cost the same as one call",
        "It is a type-erased value type for callables: wrapping a callable in a lambda yields a new value with the same call interface, so behavior layers without inheritance and passes around by value",
        "It stores the callable's class hierarchy and re-dispatches virtually through it",
        "It guarantees the wrapped callable is invoked on a dedicated thread"
      ],
      "answer": 1,
      "explain": "std::function erases the concrete callable type behind a uniform, copyable, ownable value with one operation: call. That is exactly the shape decoration needs — the wrapper and the wrapped share an interface, so layers stack indefinitely, and the whole stack travels by value. It adds indirection cost, not caching or threading."
    },
    {
      "type": "code",
      "tag": "template stacking",
      "question": "A compile-time decorator stack via inheritance from a template parameter. What does this program print?",
      "code": "#include <iostream>\n\nstruct Coffee {\n    double cost() const { return 2.0; }\n};\n\ntemplate <class D>\nstruct WithMilk : D {\n    double cost() const { return D::cost() + 0.5; }\n};\n\ntemplate <class D>\nstruct WithShot : D {\n    double cost() const { return D::cost() + 1.0; }\n};\n\nint main() {\n    WithShot<WithMilk<Coffee>> c{};\n    std::cout << c.cost() << '\\n';\n}",
      "options": [
        "2",
        "3",
        "3.5",
        "2.5"
      ],
      "answer": 2,
      "explain": "WithShot<WithMilk<Coffee>> is a single concrete type whose cost() calls WithMilk's, which calls Coffee's: 2.0 + 0.5 + 1.0 = 3.5. The layering is resolved entirely at compile time — every call is statically bound and inlinable, with no virtual dispatch and no heap. The price: the stack is fixed in the type and cannot change at runtime."
    },
    {
      "type": "code",
      "tag": "wrapper composition",
      "question": "Composition-based compile-time decoration. What does this program print?",
      "code": "#include <iostream>\n\nstruct Base {\n    int value() const { return 7; }\n};\n\ntemplate <class T>\nstruct Logged {\n    T inner;\n    int value() const {\n        std::cout << \"log \";\n        return inner.value();\n    }\n};\n\nint main() {\n    Logged<Logged<Base>> x{};\n    std::cout << x.value() << '\\n';\n}",
      "options": [
        "log log 7",
        "log 7",
        "7",
        "log log log 7"
      ],
      "answer": 0,
      "explain": "The outer Logged prints 'log ' and delegates to the inner Logged, which prints 'log ' again before reaching Base::value(), so the output is 'log log 7'. Same decorator applied twice, expressed as nested members rather than nested base classes — composition works just as well as inheritance for compile-time stacking, and the object is still an ordinary copyable value."
    },
    {
      "type": "mcq",
      "tag": "compile-time trade-offs",
      "question": "What is the essential trade-off of the compile-time (template-stacked) decorator versus the runtime (pointer- or type-erasure-based) one?",
      "options": [
        "It is strictly better: faster, smaller, and just as flexible as the runtime version",
        "It compiles faster because templates avoid the optimizer's inlining passes",
        "It cannot express more than two stacked layers due to template depth limits",
        "It eliminates virtual dispatch and enables inlining, but the composition must be fixed at compile time and each distinct stack is a distinct C++ type"
      ],
      "answer": 3,
      "explain": "Template stacking buys performance and type-level precision: calls bind statically, layers inline, mistakes can surface at compile time. It costs flexibility — you cannot assemble a stack from runtime configuration, WithMilk<Coffee> and WithShot<Coffee> are unrelated types that cannot sit in one container, and many combinations mean many instantiations (code bloat and compile time)."
    },
    {
      "type": "mcq",
      "tag": "runtime vs compile time",
      "question": "When should you prefer the runtime decorator over the compile-time template version?",
      "options": [
        "Whenever the wrapped operations are shorter than a few instructions",
        "When which layers are applied — and in what order — is only known at runtime, e.g. driven by configuration, user input, or data",
        "Only when the codebase must remain compatible with C++03 compilers",
        "Never; runtime decoration survives only in legacy GoF-style codebases"
      ],
      "answer": 1,
      "explain": "The deciding question is when the composition is known. If the stack is fixed at design time, templates give maximal performance; if a config file, plugin, or user assembles the stack while the program runs, you need the runtime pattern's uniform component interface. Both are legitimate implementations of the same Decorator intent — the book presents them as a choice, not a ranking."
    },
    {
      "type": "mcq",
      "tag": "decorator liabilities",
      "question": "Which of these is a genuine, known liability of the Decorator pattern?",
      "options": [
        "Decorators cannot wrap objects whose member functions are const",
        "A decorated component can never be passed to code expecting the component interface",
        "Systems accumulate many small, look-alike wrapper objects; a heavily decorated object no longer has the identity of the original component, and long forwarding chains add per-call overhead",
        "Each decorator layer doubles the memory footprint of the wrapped object"
      ],
      "answer": 2,
      "explain": "Decorator's costs are real: debugging means stepping through stacks of tiny forwarding classes, identity-based code (pointer comparison, observer deregistration) breaks because the wrapper is a different object than the core, and each layer adds an indirect call. Option B is backwards — substitutability for the component interface is precisely what the pattern guarantees."
    },
    {
      "type": "code",
      "tag": "move-only decorator",
      "question": "What happens when you build this classic pointer-based decorator?",
      "code": "#include <memory>\n\nstruct Item {\n    virtual ~Item() = default;\n    virtual double price() const = 0;\n};\n\nstruct Base : Item {\n    double price() const override { return 1.0; }\n};\n\nstruct Deco : Item {\n    std::unique_ptr<Item> inner;\n    explicit Deco(std::unique_ptr<Item> i) : inner(std::move(i)) {}\n    double price() const override { return inner->price() * 2.0; }\n};\n\nint main() {\n    Deco a{std::make_unique<Base>()};\n    Deco b = a;   // copy the decorator\n    return 0;\n}",
      "options": [
        "It compiles and runs; b shares the same Base as a",
        "It fails to compile: Deco's copy constructor is implicitly deleted because its std::unique_ptr member is move-only — the classic pointer-based decorator is not copyable",
        "It compiles and runs; b deep-copies the wrapped Base",
        "It fails to compile because Item is abstract and cannot appear as a member type"
      ],
      "answer": 1,
      "explain": "A class with a unique_ptr member gets its copy operations implicitly deleted, so 'Deco b = a' is rejected at compile time. This is the reference-semantics tax on the classic decorator: the composed object is not a regular, copyable value. The book's type-erasure-based decorator exists precisely to restore copyability (via a clone-like mechanism hidden inside the wrapper) while keeping dynamic composition."
    },
    {
      "type": "mcq",
      "tag": "singleton intent",
      "question": "What is the GoF intent of Singleton, and what is the book's overall verdict on it?",
      "options": [
        "Ensure a class has exactly one instance and provide a global point of access to it; the book treats it mostly as an anti-pattern because it institutionalizes global mutable state",
        "Separate an abstraction from its implementation; the book recommends it for all cross-cutting concerns",
        "Guarantee lazy construction of expensive objects; the book endorses it as the default for caches",
        "Encapsulate object creation behind a factory; the book considers it harmless but verbose"
      ],
      "answer": 0,
      "explain": "The GoF formulation couples two things — instance-count control and global access — and it is the global-access half that does the damage: hidden dependencies, order-dependent behavior, and untestable code. Iglberger's treatment is 'mostly anti-pattern': the intent is occasionally legitimate for truly global aspects, but the naive implementation is a design liability."
    },
    {
      "type": "mcq",
      "tag": "implementation pattern",
      "question": "Iglberger argues that Singleton is not really a design pattern at all. On what grounds?",
      "options": [
        "It was left out of the original GoF catalog and only added by later authors",
        "It cannot be implemented in standard C++ without compiler extensions",
        "It has no intent of decoupling or managing dependencies between pieces of software — it merely enforces an instance count, which makes it an implementation pattern, not a design pattern",
        "It is a design pattern, but only in garbage-collected languages where destruction order is defined"
      ],
      "answer": 2,
      "explain": "In the book's vocabulary, a design pattern has an intent aimed at reducing and managing dependencies between software entities. Singleton's intent is purely mechanical — 'at most one instance' — and says nothing about structuring dependencies; if anything, its usual global-access form increases coupling. Hence the classification: a (sometimes useful) implementation pattern, not a design pattern."
    },
    {
      "type": "code",
      "tag": "Meyers singleton",
      "question": "How many times is Config constructed?",
      "code": "#include <iostream>\n\nint ctorCalls = 0;\n\nstruct Config {\n    Config() { ++ctorCalls; }\n};\n\nConfig& instance() {\n    static Config c;   // function-local static\n    return c;\n}\n\nint main() {\n    instance();\n    instance();\n    instance();\n    std::cout << ctorCalls << '\\n';\n}",
      "options": [
        "3",
        "1",
        "0",
        "The count is unspecified because static initialization order is undefined"
      ],
      "answer": 1,
      "explain": "A function-local static is initialized exactly once — on the first pass through its declaration — and every later call returns the same object, so the constructor runs once despite three calls. This is the Meyers singleton: lazy, count-guaranteed, and (since C++11) thread-safe. Cross-TU initialization order issues (option D) do not apply to function-local statics."
    },
    {
      "type": "code",
      "tag": "lazy initialization",
      "question": "When does the local static come to life? What does this program print?",
      "code": "#include <iostream>\n\nstruct Log {\n    Log() { std::cout << \"init \"; }\n};\n\nLog& get() {\n    static Log l;\n    return l;\n}\n\nint main() {\n    std::cout << \"start \";\n    get();\n    get();\n    std::cout << \"end\\n\";\n}",
      "options": [
        "start init end",
        "init start end",
        "start init init end",
        "start end"
      ],
      "answer": 0,
      "explain": "Unlike a namespace-scope global (which would construct before main and print 'init' first), a function-local static initializes on first use: 'start' prints, the first get() constructs the Log ('init'), the second get() finds it already built, then 'end'. This laziness is one of the two selling points of the Meyers form — the other being the once-only guarantee."
    },
    {
      "type": "mcq",
      "tag": "magic statics",
      "question": "Since C++11, why is the initialization of a Meyers singleton thread-safe without any explicit locking?",
      "options": [
        "Because the singleton object is placed in thread-local storage, one per thread",
        "Because static objects are initialized before any thread can be created",
        "It is not thread-safe; every access still requires a user-provided mutex",
        "Because of 'magic statics': the standard requires a function-local static to be initialized exactly once, with concurrent callers waiting until initialization completes"
      ],
      "answer": 3,
      "explain": "C++11 mandates that if control enters a local static's declaration concurrently, one thread performs the initialization while the others block until it finishes — the compiler emits the synchronization. Note the guarantee covers initialization only: subsequent mutations of the singleton's state still race unless separately synchronized, which is one more reason the pattern's shared mutable state remains a hazard."
    },
    {
      "type": "code",
      "tag": "construction/destruction order",
      "question": "A global and a Meyers singleton. In what order do constructors (C) and destructors (D) run?",
      "code": "#include <iostream>\n\nstruct T {\n    char c;\n    T(char x) : c(x) { std::cout << 'C' << c; }\n    ~T()             { std::cout << 'D' << c; }\n};\n\nT g{'g'};\n\nT& meyers() {\n    static T m{'m'};\n    return m;\n}\n\nint main() {\n    meyers();\n}",
      "options": [
        "CmCgDgDm",
        "CgCmDgDm",
        "CgCmDmDg",
        "CmCgDmDg"
      ],
      "answer": 2,
      "explain": "g is constructed before main (Cg); m is constructed at the first meyers() call (Cm). Statics are destroyed in reverse order of the completion of their construction, so m dies first (Dm), then g (Dg): CgCmDmDg. That exit-time destruction order is exactly where singleton lifetime bugs lurk — an object destroyed later must not use a singleton destroyed earlier."
    },
    {
      "type": "mcq",
      "tag": "init order fiasco",
      "question": "What is the 'static initialization order fiasco'?",
      "options": [
        "Static variables are zero-initialized twice, wasting startup time",
        "Across different translation units, the order of dynamic initialization of namespace-scope objects is unspecified, so one global's constructor may use another global that has not been constructed yet",
        "Static variables in templates are initialized once per instantiation, causing duplicate side effects",
        "The linker reorders static initializers alphabetically, breaking programs that rely on declaration order"
      ],
      "answer": 1,
      "explain": "Within one translation unit, globals initialize in declaration order; across translation units the standard leaves the order unspecified. If global A's constructor touches global B defined in another TU, the program works or crashes depending on link order — the fiasco. The Meyers singleton sidesteps it by tying initialization to first use instead of startup, though it cannot fix the mirror-image problem at destruction time."
    },
    {
      "type": "code",
      "tag": "same-TU init order",
      "question": "Both globals live in the same translation unit. What does this program print?",
      "code": "#include <iostream>\n\nstruct T {\n    T(const char* n) { std::cout << n; }\n};\n\nT a{\"a\"};\nT b{\"b\"};\n\nint main() {\n    std::cout << '\\n';\n}",
      "options": [
        "ab",
        "ba",
        "Nothing — globals are initialized only if used inside main",
        "The output is unspecified even within one translation unit"
      ],
      "answer": 0,
      "explain": "Within a single translation unit, namespace-scope objects undergo dynamic initialization in declaration order, so 'a' prints before 'b' — this much is guaranteed. The fiasco only begins when the two objects live in different translation units, where the relative order becomes unspecified. Globals are constructed before main regardless of whether main mentions them."
    },
    {
      "type": "code",
      "tag": "destruction order",
      "question": "Two globals whose destructors print. What does this program output at exit?",
      "code": "#include <iostream>\n\nstruct T {\n    const char* n;\n    T(const char* s) : n(s) {}\n    ~T() { std::cout << n; }\n};\n\nT a{\"a\"};\nT b{\"b\"};\n\nint main() {}",
      "options": [
        "Nothing: objects alive at program exit are never destroyed",
        "ab",
        "The order is unspecified because main is empty",
        "ba"
      ],
      "answer": 3,
      "explain": "Static-storage objects are destroyed after main, in the reverse order of the completion of their construction: b was built second, so it is destroyed first, printing 'ba'. This mirror-image rule is why exit-time destruction is the singleton's second minefield — code running in a's destructor must not rely on b, which is already gone."
    },
    {
      "type": "mcq",
      "tag": "hidden dependencies",
      "question": "A function computes prices and internally calls TaxRates::instance(). What design problem does the book emphasize?",
      "options": [
        "The instance() call is too slow to appear inside a pricing loop",
        "The singleton might be constructed twice if the function is called recursively",
        "The dependency is invisible in the function's signature: callers cannot see, substitute, or control it, which destroys local reasoning about the function and makes its behavior depend on hidden global state",
        "The function violates const-correctness because instance() returns a non-const reference"
      ],
      "answer": 2,
      "explain": "Reading the declaration tells you nothing about the tax-rate dependency — it is smuggled in through a global access point. Every caller inherits an invisible coupling: the function's result now depends on state that any code anywhere may have mutated, and tests cannot substitute a controlled rate table. Hidden dependencies are the book's central indictment of Singleton, ahead of any performance concern."
    },
    {
      "type": "code",
      "tag": "singleton state",
      "question": "A counter singleton threads state through 'independent' calls. What does this program print?",
      "code": "#include <iostream>\n\nstruct Counter {\n    static Counter& get() {\n        static Counter c;\n        return c;\n    }\n    int n = 0;\n};\n\nint add() { return ++Counter::get().n; }\n\nint main() {\n    std::cout << add() << add() << add() << '\\n';\n}",
      "options": [
        "111",
        "123",
        "321",
        "The digits may appear in any order because operand evaluation is unsequenced"
      ],
      "answer": 1,
      "explain": "All three add() calls mutate the one shared instance, so the calls return 1, 2, 3 — each call's result depends on how often anyone, anywhere, called before. Since C++17, chained << operands are evaluated left to right, so the output is deterministically '123' (option D describes pre-C++17 folklore). The design point: identical-looking calls returning different values is global mutable state at work."
    },
    {
      "type": "mcq",
      "tag": "test isolation",
      "question": "Why do singletons damage test isolation?",
      "options": [
        "State mutated by one test leaks into the next through the shared instance, and the hard-wired instance() access point makes substituting a mock or stub nearly impossible",
        "Test frameworks cannot link translation units that define static local variables",
        "Singleton constructors are private, so tests cannot call any member functions",
        "Singletons allocate on a separate heap that test runners cannot inspect"
      ],
      "answer": 0,
      "explain": "Good tests are independent and repeatable; a singleton is a persistent, shared, mutable backdoor between them — test order suddenly matters. Worse, code that calls Type::instance() names a concrete class at the call site, leaving no seam to inject a test double. Restoring testability means introducing an abstraction and injecting the dependency, which is exactly the book's remedy."
    },
    {
      "type": "code",
      "tag": "hidden global state",
      "question": "One function returns a reference into hidden static state, the other returns a value. What does this program print?",
      "code": "#include <iostream>\n\nint& counter() {\n    static int c = 0;\n    return ++c;      // hands out a reference to hidden state\n}\n\nint snapshot() {\n    static int c = 0;\n    return ++c;      // hands out a copy\n}\n\nint main() {\n    counter();\n    counter();\n    int a = snapshot();\n    int b = snapshot();\n    std::cout << counter() << ' ' << b << '\\n';\n}",
      "options": [
        "1 1",
        "2 2",
        "1 2",
        "3 2"
      ],
      "answer": 3,
      "explain": "counter() increments its hidden static on every call — the third call prints 3 — and, worse, returns a live reference through which callers could mutate the hidden state directly. snapshot() also keeps state but returns copies: b captured the value 2 and stays 2. Returning values at least contains the damage; returning references to statics exports the global state itself."
    },
    {
      "type": "mcq",
      "tag": "monostate",
      "question": "What is the Monostate pattern, and does it fix Singleton's problems?",
      "options": [
        "A singleton whose instance is recreated for every access, guaranteeing fresh state",
        "A class whose data members are all static, so every instance shares the same state; construction looks normal, but all objects behave as one — and because the state is still global, the testability problems remain",
        "A class template generating one distinct singleton per translation unit",
        "An immutable singleton whose state is fixed at compile time, making it thread-safe"
      ],
      "answer": 1,
      "explain": "Monostate inverts Singleton's mechanics: many instances, one (static) state. Client code gets prettier — you construct and pass objects normally — but semantically nothing improved: writes through any instance appear through all others, state persists across tests, and there is still no seam for substitution. The book lists it as an alternative form, not a solution."
    },
    {
      "type": "code",
      "tag": "monostate trace",
      "question": "Two 'independent' Settings objects. What does this program print?",
      "code": "#include <iostream>\n\nstruct Settings {\n    static inline int level = 0;   // shared by ALL instances\n    void set(int v) { level = v; }\n    int get() const { return level; }\n};\n\nint main() {\n    Settings a, b;\n    a.set(3);\n    std::cout << b.get() << '\\n';\n}",
      "options": [
        "0",
        "The program does not compile: level must be initialized outside the class",
        "3",
        "Undefined behavior: b reads a variable written through a different object"
      ],
      "answer": 2,
      "explain": "level is a static (inline, so definable in-class since C++17) member: there is exactly one, shared by every Settings object. Writing through a is fully visible through b, which prints 3 — well-defined, but a trap for readers who see two objects and assume two states. This is Monostate: instance syntax, global semantics."
    },
    {
      "type": "mcq",
      "tag": "Meyers limitations",
      "question": "The Meyers singleton fixes lazy initialization and thread-safe construction. Which problems does it NOT fix?",
      "options": [
        "It is still globally accessible mutable state with hidden dependencies and untestable call sites, and destruction at program exit can still bite statics that outlive it",
        "It still requires a platform mutex header that is unavailable on embedded targets",
        "It still constructs the instance before main begins",
        "It still allows arbitrarily many instances to be created by reflection"
      ],
      "answer": 0,
      "explain": "Magic statics solve the mechanical problems: construction happens once, lazily, and thread-safely. Everything the book actually objects to survives intact — any code can reach in and mutate shared state, dependencies stay hidden from signatures, tests cannot substitute the instance, and reverse-order destruction at exit can dangle late users. Better implementation, same design flaws."
    },
    {
      "type": "mcq",
      "tag": "dependency injection",
      "question": "What is the book's primary alternative to reaching for a singleton inside business logic?",
      "options": [
        "Wrap every singleton access in a mutex to make it safe",
        "Replace the singleton with a namespace of free functions operating on static data",
        "Mark the singleton final so no test can subclass it incorrectly",
        "Pass the dependency in explicitly — as a constructor or function parameter — so the hidden global becomes a visible, replaceable collaborator (dependency injection)"
      ],
      "answer": 3,
      "explain": "The cure for hidden dependencies is to make them visible: code that needs a logger or configuration receives it, instead of grabbing it from a global access point. Signatures become honest, call sites become testable with fakes, and the decision of which instance to use moves to the composition root — the one place entitled to make it."
    },
    {
      "type": "mcq",
      "tag": "singleton behind abstraction",
      "question": "In the book's persistence example, a Database singleton is kept — yet the design remains changeable and testable. How?",
      "options": [
        "The singleton exposes a reset() function that tests call between cases",
        "Access goes through an abstraction (a PersistenceInterface-style injection point): production code wires the singleton in as the default implementation, while tests inject a mock — an application of the Dependency Inversion Principle",
        "The singleton is conditionally compiled out of test builds with the preprocessor",
        "Every member function of the singleton is virtual so tests can override them in place"
      ],
      "answer": 1,
      "explain": "The book's move is to treat 'there is one database' as an implementation detail hidden behind an architectural abstraction. High-level code depends only on the interface; a settable access point returns the singleton by default but accepts a substitute. The instance count stays one in production, while tests regain full control — the singleton stops being a design element and becomes a detail."
    },
    {
      "type": "mcq",
      "tag": "legitimate globals",
      "question": "When does the book consider singleton-like treatment reasonable rather than an anti-pattern?",
      "options": [
        "Whenever at least two modules need to share any piece of state",
        "Whenever constructing the object is expensive enough to amortize globally",
        "For genuinely global aspects of the program — such as the allocator, logger, or configuration — ideally with unidirectional data flow, and with access wrapped so the aspect can still be replaced for change and testing",
        "Never: the book forbids all forms of global state without exception"
      ],
      "answer": 2,
      "explain": "Some aspects truly are program-global — memory, logging, configuration — and pretending otherwise threads the same object through every signature to no benefit. The book's criteria: the aspect must genuinely be global, data should flow in one direction (avoiding hidden bidirectional coupling), and access must be designed — behind an abstraction with an injection seam — so changeability and testability survive."
    },
    {
      "type": "mcq",
      "tag": "design for testability",
      "question": "How does the singleton discussion connect to the book's overarching guidance to 'design for change and testability'?",
      "options": [
        "Depend on abstractions at architectural boundaries: whether an implementation behind such a boundary happens to be a singleton becomes an exchangeable detail rather than a design constraint",
        "Testability requires banning statics of every kind from the codebase",
        "Change and testability are competing goals; singletons optimize for change at testability's expense",
        "The connection is purely historical: both guidelines derive from the same GoF chapter"
      ],
      "answer": 0,
      "explain": "The through-line of the book is that dependencies determine how easily software changes, and tests are just another client that needs to substitute dependencies. Applied here via the Dependency Inversion Principle: put an abstraction at the boundary, inject implementations, and 'one instance' degenerates into a wiring choice at the composition root. Design manages dependencies; singletons, used naively, hide them."
    }
  ]
};

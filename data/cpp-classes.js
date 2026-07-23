/* ===== C++ — Classes & Operators =====
   Original question bank generated for LearnHub. Engine shape:
   { type: "mcq"|"code", tag, question, code?, options[], answer (0-based), explain }
   70 questions. Presented in random order by the quiz engine.
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-classes"] = {
  title: "C++ — Classes & Operators",
  subtitle: "Class basics, constructors, init order & operator overloading.",
  crumb: "C++",
  questions: [
    {
      "type": "mcq",
      "tag": "Struct/Class",
      "question": "In a `struct` (not a `class`), a data member declared before any access specifier has which access level?",
      "options": [
        "public",
        "private",
        "protected",
        "unspecified until you write a specifier"
      ],
      "answer": 0,
      "explain": "The ONLY intrinsic difference between `struct` and `class` is the default: `struct` members default to public, `class` members to private. The 'private' distractor confuses the two keywords."
    },
    {
      "type": "mcq",
      "tag": "Struct/Class",
      "question": "Given `struct D : Base {};` and `class C : Base {};` where `Base` is a class, what is the inheritance access?",
      "options": [
        "public for D, private for C",
        "private for D, public for C",
        "public for both",
        "private for both"
      ],
      "answer": 0,
      "explain": "Default base-class access mirrors default member access: `struct` inherits publicly, `class` inherits privately. Forgetting `public` after `class C : Base` silently makes Base a private base, breaking upcasts."
    },
    {
      "type": "code",
      "tag": "Static",
      "question": "What happens when you build and link this program?",
      "code": "#include <iostream>\nstruct Counter {\n    static int count;\n};\nint main() {\n    Counter::count = 5;\n    std::cout << Counter::count;\n}",
      "options": [
        "Prints 5",
        "Prints 0",
        "Compiler error: count is undeclared",
        "Linker error: undefined reference to Counter::count"
      ],
      "answer": 3,
      "explain": "The in-class line only DECLARES the static member; assigning to it odr-uses it, so it needs exactly one out-of-class definition `int Counter::count;`. It compiles fine but fails at link time (verified: undefined symbol Counter::count). 'Prints 5' assumes the declaration allocates storage — it does not."
    },
    {
      "type": "code",
      "tag": "Mutable",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Cache {\n    mutable int hits = 0;\n    int value = 42;\n    int get() const { ++hits; return value; }\n};\nint main() {\n    const Cache c;\n    std::cout << c.get() << ' ' << c.hits;\n}",
      "options": [
        "Compiler error: modifying member in const function",
        "42 0",
        "42 1",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "`mutable` exempts a member from the const contract, so `++hits` is legal inside a const function on a const object. Prints `42 1`. The 'compiler error' distractor is exactly what would happen WITHOUT the `mutable` keyword."
    },
    {
      "type": "mcq",
      "tag": "This",
      "question": "Inside a const member function of class `T`, what is the type of the `this` expression?",
      "options": [
        "`T*`",
        "`const T*` (pointer to const T)",
        "`const T* const`",
        "`T* const`"
      ],
      "answer": 1,
      "explain": "const-ness of the member function makes the pointed-to object const, so `this` has type `const T*`. The tempting `T* const` is wrong: you can't reassign `this` because it's a prvalue, not because the pointer itself is const."
    },
    {
      "type": "code",
      "tag": "Init order",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct S {\n    int a;\n    int b;\n    S(int x) : b(x), a(b + 1) {}\n};\nint main() {\n    S s(5);\n    std::cout << s.a << ' ' << s.b;\n}",
      "options": [
        "6 5",
        "garbage value then 5 (undefined behavior)",
        "6 6",
        "Compiler error: a listed after b"
      ],
      "answer": 1,
      "explain": "Members are initialized in DECLARATION order (a, then b), not init-list order. So `a(b+1)` reads `b` before it is initialized — an indeterminate value, hence UB. The '6 5' answer wrongly assumes the mem-initializer order controls execution."
    },
    {
      "type": "code",
      "tag": "In-class init",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Widget {\n    int id = 100;\n    Widget() {}\n    Widget(int x) : id(x) {}\n};\nint main() {\n    Widget a;\n    Widget b(7);\n    std::cout << a.id << ' ' << b.id;\n}",
      "options": [
        "100 100",
        "0 7",
        "100 7",
        "Compiler error: id initialized twice"
      ],
      "answer": 2,
      "explain": "An in-class member initializer is only the default: it applies when a constructor does NOT initialize that member. `Widget()` leaves id alone so it becomes 100; `Widget(int)` explicitly sets id=7, overriding the default. It is not a duplicate-initialization error."
    },
    {
      "type": "mcq",
      "tag": "Access",
      "question": "Inside a non-static member function of class `X`, you hold a reference `other` to a DIFFERENT `X` object. May you read `other`'s private members?",
      "options": [
        "Yes — access control is per-class, not per-object",
        "No — private restricts access to the current object only",
        "Only if the members are declared mutable",
        "Only through a public getter"
      ],
      "answer": 0,
      "explain": "Access control operates on classes, not instances: any `X` code can touch any `X` object's privates. This is why copy constructors and comparison operators can read the other object's internals directly."
    },
    {
      "type": "code",
      "tag": "Static",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Foo {\n    static int n;\n};\nint Foo::n = 3;\nint main() {\n    Foo a, b;\n    a.n = 10;\n    std::cout << b.n;\n}",
      "options": [
        "3",
        "10",
        "Compiler error: n accessed through instance",
        "0"
      ],
      "answer": 1,
      "explain": "A static member is shared by all objects — `a.n` and `b.n` name the same variable, so writing through `a` shows through `b`. Accessing a static member via an instance is legal syntax (the object expression is otherwise ignored)."
    },
    {
      "type": "code",
      "tag": "Const overload",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Box {\n    int get() { return 1; }\n    int get() const { return 2; }\n};\nint main() {\n    Box b;\n    const Box cb;\n    std::cout << b.get() << cb.get();\n}",
      "options": [
        "11",
        "22",
        "12",
        "21"
      ],
      "answer": 2,
      "explain": "const-ness participates in overload resolution: the non-const object picks the non-const `get()` (1), the const object picks the const `get()` (2), giving 12. This const/non-const pair is the standard idiom for returning a mutable vs read-only view."
    },
    {
      "type": "mcq",
      "tag": "Const",
      "question": "A non-static const member function promises not to modify which of these?",
      "options": [
        "any memory reachable from the object, including through member pointers",
        "the object's non-static, non-mutable data members",
        "every data member without exception, including mutable ones",
        "only the members it explicitly names in its body"
      ],
      "answer": 1,
      "explain": "const-ness is 'bitwise/shallow': it protects the object's own non-static non-mutable members. It does NOT stop you modifying `mutable` members, nor pointees reached through a member pointer (the pointer is const, the target is not)."
    },
    {
      "type": "code",
      "tag": "Static",
      "question": "Does this compile, and if so what does `f` return?",
      "code": "struct T {\n    int x = 5;\n    static int f() { return x; }\n};",
      "options": [
        "Returns 5",
        "Does not compile: a static member function has no `this`, so it cannot use non-static x",
        "Returns 0",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "A static member function is not called on an object and has no `this`, so it cannot name a non-static member like `x` without an object (verified: 'invalid use of member x in static member function'). You'd need `f(const T&)` or make `x` static. It's a hard compile error, not a runtime issue."
    },
    {
      "type": "mcq",
      "tag": "Mutable",
      "question": "Which data member can legally be declared `mutable`?",
      "options": [
        "a `static int` member",
        "a `const int` member",
        "an `int&` reference member",
        "a non-static, non-const `int` member"
      ],
      "answer": 3,
      "explain": "`mutable` is forbidden on static members, const members, and reference members — it only makes sense on a plain non-static, non-const value member. The whole point is to allow modification inside const functions, which contradicts const/static/reference."
    },
    {
      "type": "code",
      "tag": "This",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Builder {\n    int v = 0;\n    Builder& add(int x) { v += x; return *this; }\n};\nint main() {\n    Builder b;\n    std::cout << b.add(1).add(2).add(3).v;\n}",
      "options": [
        "1",
        "3",
        "6",
        "Compiler error"
      ],
      "answer": 2,
      "explain": "Returning `*this` by reference enables method chaining: each `add` mutates the same object and hands it back, accumulating 1+2+3=6. Returning `*this` by value instead would make each call operate on a throwaway copy."
    },
    {
      "type": "code",
      "tag": "Static",
      "question": "In C++14, what happens when you build this?",
      "code": "#include <iostream>\n#include <vector>\nstruct Config {\n    static const int MAX = 5;\n};\nint main() {\n    std::vector<int> v;\n    v.push_back(Config::MAX);\n    std::cout << v[0];\n}",
      "options": [
        "Prints 5",
        "Linker error: undefined reference to Config::MAX",
        "Compiler error: MAX cannot be initialized in-class",
        "Prints garbage"
      ],
      "answer": 1,
      "explain": "`push_back(const int&)` binds a reference to `MAX`, which ODR-uses it and requires an out-of-class definition `const int Config::MAX;` that this code lacks — a linker error in C++14 (verified: undefined symbol Config::MAX). In C++17 a static constexpr member would be implicitly inline and this would link. The in-class initializer for a const integral is perfectly legal."
    },
    {
      "type": "code",
      "tag": "Const",
      "question": "Does this compile?",
      "code": "struct S {\n    void f() { }\n    void g() const { }\n};\nint main() {\n    const S s;\n    s.f();\n}",
      "options": [
        "Yes, and runs fine",
        "No: cannot call non-const f() on a const object",
        "It's undefined behavior at runtime",
        "It compiles with only a warning"
      ],
      "answer": 1,
      "explain": "A const object may only invoke const member functions; `f()` isn't const so the call is ill-formed. This is why forgetting to mark read-only methods `const` makes them unusable on const objects and const references."
    },
    {
      "type": "code",
      "tag": "Const",
      "question": "Does this compile?",
      "code": "struct Vec {\n    int data = 9;\n    int& at() const { return data; }\n};",
      "options": [
        "Yes, returns a reference to data",
        "No: in a const function `data` is `const int`, which won't bind to `int&`",
        "Undefined behavior",
        "Yes, but returns a copy"
      ],
      "answer": 1,
      "explain": "Inside a const member function every non-mutable member is treated as const, so `data` is `const int` and cannot bind to a non-const `int&` (verified: 'binding reference of type int to value of type const int drops const'). Returning `const int&` (or making the function non-const) would fix it."
    },
    {
      "type": "code",
      "tag": "In-class init",
      "question": "Does this compile?",
      "code": "struct S {\n    int x = {3.5};\n};",
      "options": [
        "Yes, x is 3",
        "Yes, x is 4 (rounded)",
        "No: brace-init forbids the narrowing conversion double -> int",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Brace (list) initialization prohibits narrowing conversions, and 3.5 -> int loses information, so it's ill-formed (verified: 'type double cannot be narrowed to int in initializer list'). Writing `int x = 3.5;` (copy-init, no braces) would instead compile and truncate to 3."
    },
    {
      "type": "mcq",
      "tag": "Static",
      "question": "In C++14, an out-of-class definition of a static data member is required when:",
      "options": [
        "always, for every static data member",
        "only for non-const static members",
        "the member is odr-used (e.g. its address is taken or a reference binds to it)",
        "never, as long as it has an in-class initializer"
      ],
      "answer": 2,
      "explain": "A definition is needed precisely when the member is odr-used. A const integral used only in constant expressions (array bounds, case labels) needs no definition, but taking its address or binding a reference triggers the requirement."
    },
    {
      "type": "code",
      "tag": "This",
      "question": "Does this compile?",
      "code": "struct S {\n    void detach() { this = nullptr; }\n};",
      "options": [
        "Yes; it nulls the object pointer",
        "No: `this` is a prvalue and cannot be assigned to",
        "Undefined behavior at runtime",
        "Only inside const member functions"
      ],
      "answer": 1,
      "explain": "`this` is a prvalue (a temporary pointer value), not a modifiable lvalue, so you cannot assign to it (verified: 'expression is not assignable'). Historically this is why `this` behaves like a `T* const` even though its declared type is just `T*`."
    },
    {
      "type": "code",
      "tag": "Access",
      "question": "What does this print?",
      "code": "#include <iostream>\nclass Money {\n    int cents;\npublic:\n    Money(int c) : cents(c) {}\n    bool bigger(const Money& o) const { return cents > o.cents; }\n};\nint main() {\n    Money a(100), b(50);\n    std::cout << a.bigger(b);\n}",
      "options": [
        "0",
        "1",
        "Compiler error: o.cents is private",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "`o.cents` is accessible because access control is granted per-class: a `Money` method may read any `Money`'s privates, including another instance's. So 100>50 prints 1 — no access violation."
    },
    {
      "type": "mcq",
      "tag": "Struct/Class",
      "question": "Apart from default MEMBER access, how else do `struct` and `class` differ?",
      "options": [
        "structs cannot declare member functions or constructors",
        "in their default base-class access specifier",
        "structs cannot have private members",
        "in nothing else at all"
      ],
      "answer": 1,
      "explain": "The second (and last) difference is default inheritance access: a `struct` base defaults to public, a `class` base to private. Both keywords fully support member functions, constructors, and private members, so those distractors are false."
    },
    {
      "type": "code",
      "tag": "Static",
      "question": "Which member declaration is well-formed inside `struct Node { ... };`?",
      "code": "struct Node {\n    // candidate A: Node child;\n    // candidate B: static Node instance;\n    int v = 1;\n};",
      "options": [
        "A only (non-static value member of its own type)",
        "B only (static member of its own type)",
        "both A and B",
        "neither"
      ],
      "answer": 1,
      "explain": "A non-static member of the class's own type is ill-formed because the type is incomplete at that point. A STATIC member is only a declaration (storage lives outside the object), so it's allowed even for the incomplete enclosing type (verified: `static Node instance;` compiles)."
    },
    {
      "type": "code",
      "tag": "Static",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Timer {\n    static int now() { return 42; }\n};\nint main() {\n    Timer t;\n    std::cout << t.now();\n}",
      "options": [
        "42",
        "Compiler error: static function must be called as Timer::now()",
        "Undefined behavior",
        "0"
      ],
      "answer": 0,
      "explain": "You may call a static member function through an object; the object expression is evaluated then discarded, and no `this` is passed. So `t.now()` legally yields 42 — even `Timer{}.now()` works despite there being no meaningful instance."
    },
    {
      "type": "code",
      "tag": "Init order",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct Widget {\n    int b;\n    int a;\n    Widget(int x) : a(x), b(a + 1) {}\n};\nint main() {\n    Widget w(10);\n    std::cout << w.a << \" \" << w.b << \"\\n\";\n}",
      "options": [
        "10 11",
        "10 followed by an indeterminate value",
        "Does not compile",
        "10 0"
      ],
      "answer": 1,
      "explain": "Members are initialized in declaration order (b then a), NOT in the order written in the initializer list. So b is initialized from a+1 while a is still uninitialized, and reading a is undefined behavior (an indeterminate value). The tempting '10 11' assumes list order is used, but list order is irrelevant. Compilers warn via -Wreorder."
    },
    {
      "type": "code",
      "tag": "MVP",
      "question": "What is the type of `w`?",
      "code": "#include <string>\nstruct Widget {\n    Widget() {}\n};\nint main() {\n    Widget w();\n}",
      "options": [
        "A default-constructed Widget object",
        "A function declaration named w returning Widget",
        "Does not compile",
        "A pointer to Widget"
      ],
      "answer": 1,
      "explain": "This is the most vexing parse: `Widget w();` declares a function named w taking no arguments and returning Widget, not an object. To default-construct, write `Widget w;` or `Widget w{};`. It compiles fine as a declaration."
    },
    {
      "type": "mcq",
      "tag": "explicit",
      "question": "You have `explicit Box(int n);`. Which statement is ILL-FORMED because of the `explicit`?",
      "options": [
        "Box a(5);",
        "Box b{5};",
        "Box c = 5;",
        "return Box(5); (from a function returning Box)"
      ],
      "answer": 2,
      "explain": "`explicit` bans implicit conversions and copy-initialization, so `Box c = 5;` fails. Direct-initialization forms `Box a(5)`, `Box b{5}`, and the explicit `Box(5)` are all fine because they invoke the constructor directly rather than through an implicit conversion."
    },
    {
      "type": "code",
      "tag": "delegating",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Counter {\n    int n;\n    Counter() : Counter(42) { std::cout << \"A\"; }\n    Counter(int x) : n(x) { std::cout << \"B\"; }\n};\nint main() {\n    Counter c;\n    std::cout << c.n;\n}",
      "options": [
        "BA42",
        "AB42",
        "B42",
        "Does not compile"
      ],
      "answer": 0,
      "explain": "A delegating constructor runs the target constructor fully first (printing B), then executes its own body (printing A). So output is B then A then 42. It compiles because a constructor may delegate to another as long as it doesn't also initialize members directly."
    },
    {
      "type": "code",
      "tag": "Aggregate",
      "question": "Does this compile, and if so what is the value of `p.y`?",
      "code": "struct Point {\n    int x;\n    int y;\n};\nint main() {\n    Point p{5};\n    (void)p;\n}",
      "options": [
        "Compiles; p.y is 0",
        "Compiles; p.y is indeterminate",
        "Does not compile because both members must be listed",
        "Compiles; p.y is 5"
      ],
      "answer": 0,
      "explain": "Point is an aggregate, so brace init is aggregate initialization. Members with no corresponding initializer are value-initialized, so y becomes 0 (not garbage). Missing initializers are allowed; a shorter list does not make it ill-formed."
    },
    {
      "type": "code",
      "tag": "default",
      "question": "What is the behavior here?",
      "code": "#include <iostream>\nstruct Data {\n    int value;\n    Data() = default;\n};\nint main() {\n    Data d;\n    std::cout << d.value << \"\\n\";\n}",
      "options": [
        "Always prints 0",
        "Prints an indeterminate value (undefined behavior to read)",
        "Does not compile",
        "Always prints a compiler-defined sentinel"
      ],
      "answer": 1,
      "explain": "`Data d;` default-initializes the object; the defaulted default constructor default-initializes members, and for an int with automatic storage that leaves it uninitialized, so reading value is undefined behavior. The myth that `= default` zero-initializes members is wrong -- only value-initialization (e.g. `Data d{};`) would zero it here."
    },
    {
      "type": "mcq",
      "tag": "delete",
      "question": "What is the purpose of declaring a constructor as `= delete`?",
      "options": [
        "It defines an empty constructor body",
        "It makes any attempt to use that constructor a compile error",
        "It marks the constructor for removal by the linker",
        "It makes the constructor private"
      ],
      "answer": 1,
      "explain": "`= delete` makes the function participate in overload resolution but renders any selected use ill-formed at compile time -- ideal for forbidding certain conversions or copies. It is not the same as private (an access-control error) and does not provide a body."
    },
    {
      "type": "code",
      "tag": "explicit",
      "question": "What happens?",
      "code": "#include <vector>\nstruct Buffer {\n    explicit Buffer(int size) {}\n};\nvoid consume(Buffer b) {}\nint main() {\n    consume(64);\n}",
      "options": [
        "Compiles and converts 64 to a Buffer",
        "Does not compile",
        "Compiles but is undefined behavior",
        "Compiles with a narrowing warning"
      ],
      "answer": 1,
      "explain": "Passing 64 requires an implicit conversion from int to Buffer, but the constructor is `explicit`, so the conversion is disallowed and the call is ill-formed. You would have to write `consume(Buffer(64))`. There is no UB -- it simply doesn't compile."
    },
    {
      "type": "code",
      "tag": "Aggregate",
      "question": "What does `arr[1]` equal?",
      "code": "#include <iostream>\nint main() {\n    int arr[5] = {7};\n    std::cout << arr[0] << \" \" << arr[1] << \"\\n\";\n}",
      "options": [
        "7 7",
        "7 0",
        "7 followed by garbage",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "In aggregate/array initialization, elements without an explicit initializer are value-initialized to 0. So arr[0] is 7 and every remaining element, including arr[1], is 0 -- not garbage and not a repeat of 7."
    },
    {
      "type": "code",
      "tag": "Narrowing",
      "question": "What is the result?",
      "code": "struct Pixel {\n    char r;\n    char g;\n    char b;\n};\nint main() {\n    int val = 300;\n    Pixel p{val, 0, 0};\n    (void)p;\n}",
      "options": [
        "Compiles; r wraps around to a truncated value",
        "Does not compile: narrowing conversion in a braced initializer",
        "Compiles; undefined behavior",
        "Compiles; r becomes 300"
      ],
      "answer": 1,
      "explain": "Brace initialization forbids narrowing conversions. Converting an int variable (whose value isn't a constant expression) to char is narrowing, so the compiler rejects it. Using parentheses or assignment would silently truncate, but braces are stricter by design."
    },
    {
      "type": "mcq",
      "tag": "default",
      "question": "For a class with a user-provided constructor taking arguments, when is a default constructor implicitly generated?",
      "options": [
        "Always, in addition to the user's constructor",
        "Never; declaring any constructor suppresses the implicit default constructor",
        "Only if the class has no data members",
        "Only in C++14 and later"
      ],
      "answer": 1,
      "explain": "Once you declare ANY constructor, the compiler no longer implicitly declares a default constructor. To get one back you must write `ClassName() = default;`. The belief that the default constructor always coexists with user constructors is a frequent source of 'no matching constructor' errors."
    },
    {
      "type": "code",
      "tag": "MVP",
      "question": "What does this declare?",
      "code": "#include <string>\nstruct Timer {\n    Timer(std::string s) {}\n};\nint main() {\n    Timer t(std::string());\n}",
      "options": [
        "A Timer object initialized with an empty string",
        "A function t taking a function pointer and returning Timer",
        "A compile error",
        "A Timer holding an uninitialized string"
      ],
      "answer": 1,
      "explain": "Most vexing parse strikes again: `std::string()` is read as the type 'function taking nothing and returning std::string', so `t` is declared as a function taking such a (decayed) function pointer. Use braces -- `Timer t{std::string()}` or `Timer t{std::string{}}` -- to get an object."
    },
    {
      "type": "code",
      "tag": "delegating",
      "question": "Why does this fail to compile?",
      "code": "struct Config {\n    int a;\n    int b;\n    Config(int x) : a(x), Config() {}\n    Config() : a(0), b(0) {}\n};",
      "options": [
        "Delegation must be the only mem-initializer; you cannot mix it with member initializers",
        "Config() is declared after it is used",
        "A constructor cannot delegate to a default constructor",
        "Nothing -- it compiles fine"
      ],
      "answer": 0,
      "explain": "If a constructor delegates, the delegation must be the sole entry in the initializer list -- you cannot also initialize members like `a(x)`. Ordering of member functions doesn't matter in a class, and delegating to a default constructor is perfectly legal on its own."
    },
    {
      "type": "code",
      "tag": "explicit",
      "question": "Given `explicit operator bool()`, which line is ill-formed?",
      "code": "struct Handle {\n    explicit operator bool() const { return true; }\n};\nint main() {\n    Handle h;\n    if (h) {}          // (1)\n    bool b = h;        // (2)\n    return 0;\n}",
      "options": [
        "Line (1)",
        "Line (2)",
        "Both lines",
        "Neither line"
      ],
      "answer": 1,
      "explain": "An `explicit` conversion operator still works in a 'contextually converted to bool' spot like `if (h)`, so line (1) is fine. But line (2) is copy-initialization requiring an implicit conversion, which explicit forbids -- so it fails. This is exactly why safe-bool idioms use explicit operator bool."
    },
    {
      "type": "code",
      "tag": "Value init",
      "question": "What is guaranteed about `d.x`?",
      "code": "#include <iostream>\nstruct D {\n    int x;\n};\nint main() {\n    D d = D();\n    std::cout << d.x;\n}",
      "options": [
        "Indeterminate value",
        "Guaranteed 0",
        "Does not compile",
        "Guaranteed to be whatever was previously on the stack"
      ],
      "answer": 1,
      "explain": "`D()` value-initializes the object; since D has no user-provided constructor, value-initialization zero-initializes its members, so x is 0. Contrast with `D d;` which would leave x indeterminate. The parentheses (or empty braces) are what trigger zero-initialization here."
    },
    {
      "type": "mcq",
      "tag": "Init list",
      "question": "Why prefer the member initializer list over assigning members inside the constructor body?",
      "options": [
        "It is required by the standard for all members",
        "For const members and reference members it is the only option, and it avoids a redundant default-construct-then-assign for class-type members",
        "It runs after the body, so values are more up to date",
        "It is purely a stylistic choice with no behavioral difference"
      ],
      "answer": 1,
      "explain": "const and reference members must be initialized in the init list because they cannot be assigned to afterward. For class-type members, body assignment would default-construct then copy-assign, doing extra work. The init list always runs BEFORE the body, not after."
    },
    {
      "type": "code",
      "tag": "delete",
      "question": "What is the effect of this code?",
      "code": "struct NoInt {\n    NoInt(long) {}\n    NoInt(int) = delete;\n};\nint main() {\n    NoInt a(5);\n    (void)a;\n}",
      "options": [
        "Constructs via the long constructor since 5 fits in long",
        "Does not compile: the deleted int overload is the best match",
        "Constructs a default NoInt",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Overload resolution picks the best match BEFORE checking deleted status: `5` is an int, so the `NoInt(int)` overload is selected -- and because it's deleted, the program is ill-formed. Deleting an overload doesn't hide it from overload resolution; it just makes selecting it an error. `NoInt a(5L)` would work."
    },
    {
      "type": "code",
      "tag": "Init order",
      "question": "A base and member are both present. In what order are they initialized?",
      "code": "#include <iostream>\nstruct Base { Base() { std::cout << \"Base\"; } };\nstruct Member { Member() { std::cout << \"Member\"; } };\nstruct Derived : Base {\n    Member m;\n    Derived() : m(), Base() {}\n};\nint main() { Derived d; }",
      "options": [
        "MemberBase",
        "BaseMember",
        "Order is unspecified",
        "Does not compile because Base is listed after m"
      ],
      "answer": 1,
      "explain": "Base classes are always initialized before non-static data members, regardless of init-list order, so Base runs before Member. The reversed list order `m(), Base()` is legal (compilers may warn) and does not change the actual order."
    },
    {
      "type": "code",
      "tag": "Aggregate",
      "question": "Does `Derived` remain an aggregate that can be brace-initialized as `Derived{1, 2}` in C++14?",
      "code": "struct Base { int a; };\nstruct Derived : Base { int b; };",
      "options": [
        "Yes, aggregates may have base classes in C++14",
        "No -- in C++11/14 a class with any base class is not an aggregate",
        "Only if Base has a constructor",
        "Only if b is public"
      ],
      "answer": 1,
      "explain": "In C++11/14 an aggregate may not have ANY base classes, so Derived is not an aggregate and `Derived{1,2}` won't aggregate-initialize. (This rule was relaxed in C++17 to allow public bases.) Under the stated C++11/14 standard, the answer is no."
    },
    {
      "type": "code",
      "tag": "explicit",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Meters {\n    double v;\n    Meters(double x) : v(x) {}\n};\ndouble measure(Meters m) { return m.v; }\nint main() {\n    std::cout << measure(3);\n}",
      "options": [
        "3",
        "Does not compile",
        "0",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "The constructor is NOT explicit, so int 3 undergoes a standard conversion to double 3.0 and then a user-defined conversion to a Meters, printing 3. This is precisely the accidental-conversion trap that marking the constructor `explicit` would prevent -- the code compiles here only because explicit is absent."
    },
    {
      "type": "code",
      "tag": "Brace init",
      "question": "Which constructor is called?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{5};\n    std::cout << v.size();\n}",
      "options": [
        "1",
        "5",
        "0",
        "Does not compile"
      ],
      "answer": 0,
      "explain": "When a class has an initializer_list constructor, braces strongly prefer it: `{5}` creates a vector with one element (the value 5), so size() is 1. To get five default elements you must use parentheses: `std::vector<int> v(5)`. This braces-vs-parens distinction is a classic gotcha."
    },
    {
      "type": "code",
      "tag": "default",
      "question": "Is `Widget` implicitly default-constructible here, and what is w.id?",
      "code": "struct Widget {\n    int id = 100;\n    Widget() = default;\n};\nint main() {\n    Widget w;\n    return w.id;\n}",
      "options": [
        "Yes, and w.id is 100",
        "Yes, but w.id is indeterminate",
        "No, it does not compile",
        "w.id is 0"
      ],
      "answer": 0,
      "explain": "A default member initializer (`= 100`) is used by the defaulted constructor, so w.id becomes 100 even though the constructor is `= default`. This shows `= default` doesn't mean 'do nothing' -- it means 'do the standard member-wise init', which includes honoring in-class initializers."
    },
    {
      "type": "code",
      "tag": "Init list",
      "question": "What is printed?",
      "code": "#include <iostream>\nstruct Logger {\n    Logger(const char* s) { std::cout << s; }\n};\nstruct Service {\n    Logger x;\n    Logger y;\n    Service() : y(\"Y\"), x(\"X\") {}\n};\nint main() { Service s; }",
      "options": [
        "YX",
        "XY",
        "Order is unspecified",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "Members are constructed in declaration order: x before y, so 'X' prints before 'Y' regardless of the initializer list writing y first. The list order (`y then x`) is a red herring; only declaration order governs actual construction sequence."
    },
    {
      "type": "mcq",
      "tag": "explicit",
      "question": "A single-argument non-explicit constructor `Fraction(int)` is called a converting constructor. What subtle bug can it introduce?",
      "options": [
        "It makes the class non-copyable",
        "It allows silent, unintended conversions (e.g. an int accidentally passed where a Fraction is expected), which can mask logic errors",
        "It prevents the class from being used in a container",
        "It forces every int literal to become a Fraction"
      ],
      "answer": 1,
      "explain": "A non-explicit single-argument constructor lets the compiler silently convert ints to Fractions in function calls, comparisons, and returns, which can hide mistakes and cause surprising overload resolution. Marking it `explicit` is the standard defense. It does not affect copyability or literals in general."
    },
    {
      "type": "mcq",
      "tag": "Assignment",
      "question": "Why does a copy-assignment operator conventionally return `T&` (a non-const reference to *this) rather than `void`?",
      "options": [
        "To enable chaining like `a = b = c;` and to match the behavior of built-in assignment",
        "Because returning void from operator= is a compile error",
        "To force a copy of the assigned object for safety",
        "Because the language requires operator= to return the right-hand operand"
      ],
      "answer": 0,
      "explain": "Built-in assignment yields an lvalue referring to the left operand, so returning `T&` lets `a = b = c;` and `(a = b).foo()` work as expected. Returning `void` compiles fine but breaks chaining, so the claim that it is an error is wrong."
    },
    {
      "type": "code",
      "tag": "Increment",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct Counter {\n  int n = 0;\n  Counter& operator++() { ++n; return *this; }        // prefix\n  Counter  operator++(int) { Counter t = *this; ++n; return t; } // postfix\n};\nint main() {\n  Counter c;\n  Counter d = c++;\n  std::cout << c.n << \" \" << d.n;\n}",
      "options": [
        "1 0",
        "1 1",
        "0 0",
        "0 1"
      ],
      "answer": 0,
      "explain": "Postfix `c++` snapshots the old state into `t`, then increments `c`, and returns the old copy. So `c.n` becomes 1 while `d` holds the pre-increment value 0, giving \"1 0\". Answering \"1 1\" wrongly assumes postfix returns the incremented object."
    },
    {
      "type": "code",
      "tag": "Member",
      "question": "Compiling with `-std=c++17`, does this program compile, and if so what does it print?",
      "code": "#include <iostream>\nstruct M {\n  int v;\n  M(int x) : v(x) {}\n  bool operator==(const M& o) const { return v == o.v; }\n};\nint main() {\n  M m(2);\n  std::cout << (m == 2) << (2 == m);\n}",
      "options": [
        "Prints 11",
        "Prints 10",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "`m == 2` works because the member `operator==` accepts `m` on the left and converts `2` to `M`. But `2 == m` needs the left `int` to find `operator==`, and a member operator cannot be invoked with a built-in type as the left operand, so in C++17 it fails to compile. A non-member (friend) `operator==` would make both directions work symmetrically. (Note: C++20 changed this — it synthesizes a reversed candidate, rewriting `2 == m` as `m == 2`, so the same code compiles there; the question is fixed to C++17.)"
    },
    {
      "type": "code",
      "tag": "Conversion",
      "question": "What is the result of compiling and running this code?",
      "code": "#include <iostream>\nstruct Flag {\n  explicit operator bool() const { return true; }\n};\nint main() {\n  Flag f;\n  if (f) std::cout << \"A\";\n  bool b = f;\n  std::cout << b;\n}",
      "options": [
        "Prints A1",
        "Prints A0",
        "Does not compile",
        "Prints 1 only"
      ],
      "answer": 2,
      "explain": "`if (f)` uses a contextual conversion to bool, which is allowed even for an `explicit` conversion operator. But `bool b = f;` is copy-initialization, which requires an implicit conversion — exactly what `explicit` forbids — so the program fails to compile. Marking `operator bool` explicit is idiomatic precisely to permit `if(f)` while blocking accidental `bool b = f`."
    },
    {
      "type": "code",
      "tag": "ShortCircuit",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct B {\n  bool v;\n  B(bool x) : v(x) {}\n};\nB operator&&(B a, B b) { return B(a.v && b.v); }\nbool probe() { std::cout << \"probe \"; return true; }\nint main() {\n  B x(false);\n  B r = x && B(probe());\n  std::cout << r.v;\n}",
      "options": [
        "probe 0",
        "0",
        "probe 1",
        "1"
      ],
      "answer": 0,
      "explain": "An overloaded `operator&&` is an ordinary function call, so both operands are fully evaluated and short-circuiting is lost: `probe()` runs even though `x.v` is false, printing \"probe \", then the result false prints as 0. Expecting just \"0\" assumes the built-in short-circuit still applies, which is exactly the trap of overloading `&&`."
    },
    {
      "type": "mcq",
      "tag": "NonMember",
      "question": "Why must `operator<<` for streaming a custom type to `std::ostream` be a non-member (typically friend) function?",
      "options": [
        "Because the left operand is a `std::ostream&`, which you cannot add member functions to",
        "Because member operators cannot return references",
        "Because `operator<<` may only be overloaded globally by language rule",
        "Because friend functions are faster than member functions"
      ],
      "answer": 0,
      "explain": "For `os << obj`, a member `operator<<` would have to live in `std::ostream`, which you cannot modify; making it a free function lets you put the type you own on the right. Member operators can return references and there is no rule forbidding member `operator<<` generally (streams themselves define member overloads for built-ins), so those options are wrong."
    },
    {
      "type": "mcq",
      "tag": "Increment",
      "question": "How does the compiler distinguish the declarations of prefix and postfix `operator++` for a class?",
      "options": [
        "Postfix takes an unused `int` parameter; prefix takes none",
        "Prefix is declared `const`, postfix is not",
        "Postfix must be a non-member; prefix must be a member",
        "They are distinguished by return type"
      ],
      "answer": 0,
      "explain": "The postfix form is declared with a dummy `int` parameter (`T operator++(int)`) purely to differentiate it from the prefix `T& operator++()`; the argument is never used. Return type alone cannot distinguish overloads, and there is no const/member requirement that separates them."
    },
    {
      "type": "code",
      "tag": "SelfAssign",
      "question": "What happens when this program runs?",
      "code": "#include <cstring>\nstruct Str {\n  char* d;\n  Str(const char* s) { d = new char[strlen(s) + 1]; strcpy(d, s); }\n  Str& operator=(const Str& o) {\n    delete[] d;\n    d = new char[strlen(o.d) + 1];\n    strcpy(d, o.d);\n    return *this;\n  }\n};\nint main() {\n  Str s(\"hi\");\n  s = s;   // self-assignment\n}",
      "options": [
        "Copies \"hi\" correctly",
        "Undefined behavior: reads freed memory on self-assignment",
        "Compile error",
        "Only leaks memory but is otherwise safe"
      ],
      "answer": 1,
      "explain": "On `s = s`, `o` aliases `*this`, so after `delete[] d` the pointer `o.d` dangles; the subsequent `strlen(o.d)` reads freed memory — undefined behavior. The fix is a self-assignment guard (`if (this != &o)`) or the copy-and-swap idiom, which sidesteps the aliasing entirely."
    },
    {
      "type": "mcq",
      "tag": "Comma",
      "question": "When you overload `operator,` (comma), which guarantee provided by the built-in comma operator is LOST?",
      "options": [
        "Type safety of the operands",
        "The guarantee that the left operand is evaluated (and sequenced) before the right operand",
        "The ability to chain more than two expressions",
        "The conversion of the result to bool"
      ],
      "answer": 1,
      "explain": "The built-in comma operator sequences its left operand before its right and discards the left's value. An overloaded `operator,` is just a function call, whose argument evaluations are unsequenced (C++11/14), so you lose that left-before-right guarantee — a key reason overloading comma is discouraged."
    },
    {
      "type": "mcq",
      "tag": "ConstReturn",
      "question": "In C++11, what is the practical downside of declaring a binary arithmetic operator as `const T operator+(const T&, const T&)` (returning a const value)?",
      "options": [
        "It is a compile error to return a const value",
        "It disables move semantics on the returned temporary, forcing copies",
        "It causes undefined behavior in expressions",
        "It prevents the operator from being a non-member"
      ],
      "answer": 1,
      "explain": "Returning `const T` by value means the temporary result cannot be moved from, so C++11 move optimizations are silently disabled and the object is copied instead. The historical motivation (blocking nonsensical `(a + b) = c`) is now considered not worth the pessimization, so plain `T` return is preferred."
    },
    {
      "type": "mcq",
      "tag": "NonMember",
      "question": "Which of the following operators CANNOT be overloaded as a non-member function?",
      "options": [
        "operator+",
        "operator==",
        "operator[]",
        "operator<<"
      ],
      "answer": 2,
      "explain": "`operator[]`, along with `operator=`, `operator()`, and `operator->`, must be a non-static member function. Arithmetic, comparison, and stream operators may all be non-members (and often should be, for symmetric conversions)."
    },
    {
      "type": "mcq",
      "tag": "NoOverload",
      "question": "Which operator canNOT be overloaded at all in C++?",
      "options": [
        "operator->",
        "operator,",
        "operator?: (the ternary conditional)",
        "operator new"
      ],
      "answer": 2,
      "explain": "The ternary conditional `?:` cannot be overloaded, and neither can `.`, `.*`, `::`, or `sizeof`. In contrast, `operator->`, `operator,`, and `operator new` are all overloadable (even if overloading comma is discouraged)."
    },
    {
      "type": "code",
      "tag": "Subscript",
      "question": "What does this C++14 program print?",
      "code": "#include <iostream>\nstruct Grid {\n  int v[9];\n  int& operator[](int i) { return v[i]; }\n};\nint main() {\n  Grid g;\n  for (int i = 0; i < 9; ++i) g[i] = i;\n  std::cout << g[1, 2];\n}",
      "options": [
        "Prints 2",
        "Prints 1",
        "Compile error: two subscripts not allowed",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "In C++11/14 `operator[]` takes exactly one argument, so `g[1, 2]` is not a 2-D index; the `1, 2` inside the brackets is the built-in comma operator, which evaluates to `2`. Thus this is `g[2]`, printing 2. (Multi-argument subscript only became legal in C++23.)"
    },
    {
      "type": "code",
      "tag": "Assignment",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct S {\n  int v;\n  S& operator=(int x) { v = x; return *this; }\n};\nint main() {\n  S a;\n  (a = 5) = 10;\n  std::cout << a.v;\n}",
      "options": [
        "Prints 10",
        "Prints 5",
        "Compile error",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "Because `operator=` returns a non-const `S&`, the result of `a = 5` is a modifiable lvalue, so `(a = 5) = 10` assigns again, leaving `v == 10`. This is exactly the kind of odd-but-legal expression that a `const`-returning operator would block; here nothing prevents it."
    },
    {
      "type": "mcq",
      "tag": "Arrow",
      "question": "When you write `p->m` and `p` is a class object with an overloaded `operator->`, how does the compiler resolve the member access?",
      "options": [
        "It calls `operator->` exactly once and then accesses `m` on whatever is returned",
        "It repeatedly applies `operator->` on the returned value until a raw pointer is reached, then accesses `m` on that pointer",
        "It ignores the overload and treats `p` as a raw pointer",
        "It is a compile error unless `operator->` returns a reference"
      ],
      "answer": 1,
      "explain": "`operator->` is applied recursively: if it returns another class type with its own `operator->`, that one is invoked too, and so on, until a raw pointer is produced, which is then dereferenced for `m`. This 'drill-down' is what makes smart-pointer and proxy chains transparent."
    },
    {
      "type": "mcq",
      "tag": "Conversion",
      "question": "You give a class a non-explicit `operator long() const`. What is the main hazard compared to marking it `explicit`?",
      "options": [
        "It makes the class impossible to copy",
        "The implicit conversion silently enables surprising uses (e.g. `obj << 1`, `obj == other`, passing to overloaded functions) via conversion to long",
        "It disables all arithmetic on long values",
        "It forces every use of the object to convert to long"
      ],
      "answer": 1,
      "explain": "A non-explicit conversion operator lets the object slip into any context expecting a `long`, so unintended expressions like bit-shifts, comparisons, or overload matches compile silently and can hide bugs. Marking it `explicit` keeps the intentional casts while blocking these accidental conversions."
    },
    {
      "type": "mcq",
      "tag": "Increment",
      "question": "Why is prefix `operator++` conventionally declared to return `T&` rather than `T`?",
      "options": [
        "Because returning `T` is illegal for prefix increment",
        "To match built-in semantics (yielding the incremented object as an lvalue) and to avoid an unnecessary copy",
        "Because prefix increment must modify a temporary",
        "Because the return type must differ from postfix's return type"
      ],
      "answer": 1,
      "explain": "Built-in prefix `++` yields the modified operand as an lvalue, so returning `T&` (a reference to *this) matches that and avoids copying. Returning by value would compile but make expressions like `++(++x)` operate on a temporary rather than the original, breaking the built-in analogy."
    },
    {
      "type": "mcq",
      "tag": "Friend",
      "question": "A class defines `friend Vec operator+(const Vec& a, const Vec& b) { ... }` inside its body. What is this function?",
      "options": [
        "A member function of Vec",
        "A non-member (free) function that has access to Vec's private members",
        "A static member function",
        "An error, because operators cannot be friends"
      ],
      "answer": 1,
      "explain": "A friend operator defined inside the class is still a non-member function; the `friend` keyword only grants it access to private members. Being a non-member is exactly what allows symmetric mixed-type calls like `2 + v` and `v + 2` to both work through implicit conversions."
    },
    {
      "type": "code",
      "tag": "Ambiguity",
      "question": "Does this program compile?",
      "code": "#include <iostream>\nstruct A {\n  operator int()  const { return 1; }\n  operator long() const { return 2; }\n};\nint main() {\n  A a;\n  double d = a;\n  std::cout << d;\n}",
      "options": [
        "Yes, prints 1",
        "Yes, prints 2",
        "No — the conversion to double is ambiguous",
        "Yes, prints 3"
      ],
      "answer": 2,
      "explain": "Converting `A` to `double` can go through `operator int` (then int-to-double) or `operator long` (then long-to-double); both are user-defined conversions followed by an equally ranked standard conversion, so overload resolution is ambiguous and the program is ill-formed. Note `int x = a;` would compile, because `operator int` is then an exact match."
    },
    {
      "type": "code",
      "tag": "Call",
      "question": "In C++14, what does this program print?",
      "code": "#include <iostream>\nstruct Counter {\n  int count = 0;\n  int operator()() { return ++count; }\n};\nint main() {\n  Counter c;\n  std::cout << c() << c();\n}",
      "options": [
        "Always 12",
        "Always 21",
        "Either 12 or 21 (unspecified order)",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "In C++11/14 the two calls `c()` in `c() << c()` are not sequenced relative to each other by the `<<` chaining, so the order is unspecified and the output may be \"12\" or \"21\". It is NOT undefined behavior, however: distinct function calls are indeterminately sequenced (one fully completes before the other starts), so there is no data race on `count`. (C++17 later fixed the order to left-to-right.)"
    },
    {
      "type": "code",
      "tag": "Subscript",
      "question": "Why does this program fail to compile?",
      "code": "#include <iostream>\nstruct Arr {\n  int data[3] = {10, 20, 30};\n  int& operator[](int i) { return data[i]; }\n};\nvoid print(const Arr& a) {\n  std::cout << a[0];\n}",
      "options": [
        "Because operator[] must return by value",
        "Because `a` is a const reference but operator[] is a non-const member and cannot be called on a const object",
        "Because operator[] cannot take an int",
        "Because print must be a member function"
      ],
      "answer": 1,
      "explain": "`a` is a `const Arr&`, but the only `operator[]` is non-const, and non-const member functions cannot be invoked on const objects, so `a[0]` is ill-formed. The fix is to also provide a `int operator[](int) const` overload for read-only access to const objects — the standard const/non-const subscript pair."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "What is wrong with this operator, assuming `V c = a + b;` is later evaluated and `c.x` read?",
      "code": "struct V {\n  int x;\n  V(int v) : x(v) {}\n};\nconst V& operator+(const V& a, const V& b) {\n  V r(a.x + b.x);\n  return r;   // (*)\n}",
      "options": [
        "Nothing; returning const V& is efficient here",
        "It returns a reference to a local object, so using the result is undefined behavior",
        "It leaks memory",
        "It fails to compile at line (*)"
      ],
      "answer": 1,
      "explain": "`r` is a local automatic object destroyed when `operator+` returns, so the returned reference dangles and any use of it is undefined behavior. Arithmetic operators must return a new object by value (`V operator+(...)`), not a reference, because the result is a fresh temporary with no persistent storage."
    }
  ]
};

/* ===== C++ — Functions & Lambdas =====
   Original question bank generated for LearnHub. Engine shape:
   { type: "mcq"|"code", tag, question, code?, options[], answer (0-based), explain }
   49 questions. Presented in random order by the quiz engine.
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-functions"] = {
  title: "C++ — Functions & Lambdas",
  subtitle: "Parameter passing, overload resolution, lambdas & captures.",
  crumb: "C++",
  questions: [
    {
      "type": "code",
      "tag": "Dangling",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\n\nint& firstElement() {\n    int arr[3] = {10, 20, 30};\n    return arr[0];\n}\n\nint main() {\n    int& r = firstElement();\n    std::cout << r << '\\n';\n    return 0;\n}",
      "options": [
        "Prints 10",
        "Prints 0",
        "Undefined behavior (dangling reference)",
        "Does not compile"
      ],
      "answer": 2,
      "explain": "arr is a local array destroyed when firstElement returns, so the returned reference dangles; reading through it is undefined behavior. It may print 10 by luck, but that is not guaranteed — the storage is no longer alive."
    },
    {
      "type": "code",
      "tag": "Overload",
      "question": "Which overload is called?",
      "code": "#include <iostream>\n\nvoid f(int)    { std::cout << \"int\\n\"; }\nvoid f(double) { std::cout << \"double\\n\"; }\n\nint main() {\n    f(5L);   // long argument\n    return 0;\n}",
      "options": [
        "Prints int",
        "Prints double",
        "Ambiguous — does not compile",
        "Prints long"
      ],
      "answer": 2,
      "explain": "long->int (integral conversion) and long->double (floating-integral conversion) are both standard conversions of equal rank, so neither is better and the call is ambiguous. Beginners assume long picks int because both are integers, but these conversions are ranked equally, making it ill-formed."
    },
    {
      "type": "mcq",
      "tag": "Default Args",
      "question": "You want a default argument for a function that is declared in a header and defined in a separate .cpp file. Where should the default argument appear?",
      "options": [
        "Only in the definition in the .cpp file",
        "Only in the declaration in the header",
        "In both the header declaration and the .cpp definition",
        "It does not matter, either place works identically"
      ],
      "answer": 1,
      "explain": "A default argument should appear on the declaration callers see (the header); putting it only on the out-of-line definition makes it invisible to other translation units. Specifying it in both places is ill-formed — a default argument may not be redefined even to the same value in the same scope."
    },
    {
      "type": "code",
      "tag": "Const Overload",
      "question": "What does this print?",
      "code": "#include <iostream>\n\nstruct Box {\n    int get() const { return 1; }\n    int get()       { return 2; }\n};\n\nint main() {\n    const Box b;\n    Box c;\n    std::cout << b.get() << c.get() << '\\n';\n    return 0;\n}",
      "options": [
        "Prints 12",
        "Prints 21",
        "Prints 22",
        "Prints 11"
      ],
      "answer": 0,
      "explain": "Const-ness of the object participates in overload resolution: b is const so the const member is chosen (1), c is non-const so the non-const member is chosen (2), giving 12. The common mistake is thinking the non-const version always wins."
    },
    {
      "type": "code",
      "tag": "Pass by Value",
      "question": "What does this print?",
      "code": "#include <iostream>\n\nvoid tweak(int x) { x += 100; }\n\nint main() {\n    int n = 5;\n    tweak(n);\n    std::cout << n << '\\n';\n    return 0;\n}",
      "options": [
        "Prints 105",
        "Prints 5",
        "Prints 100",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Pass-by-value copies the argument, so tweak modifies its local copy and the caller's n is unchanged (5). To affect the caller you would need a reference (int&) or pointer parameter."
    },
    {
      "type": "code",
      "tag": "Overload",
      "question": "Which overload does f(0) call?",
      "code": "#include <iostream>\n\nvoid f(int*)  { std::cout << \"ptr\\n\"; }\nvoid f(int)   { std::cout << \"int\\n\"; }\n\nint main() {\n    f(0);\n    return 0;\n}",
      "options": [
        "Prints ptr",
        "Prints int",
        "Ambiguous — does not compile",
        "Prints nothing"
      ],
      "answer": 1,
      "explain": "The literal 0 is of type int, so f(int) is an exact match while f(int*) requires a null-pointer conversion; the exact match wins and it prints int. This is exactly why nullptr exists — f(nullptr) would unambiguously pick the pointer overload."
    },
    {
      "type": "mcq",
      "tag": "Const Ref",
      "question": "Why is passing a large object by const reference (const T&) usually preferred over by value?",
      "options": [
        "It allows the function to modify the caller's object",
        "It avoids copying the object while still preventing the function from modifying it",
        "It is always faster for every type, including int and char",
        "It forces the argument to be a temporary"
      ],
      "answer": 1,
      "explain": "const T& binds without copying and the const forbids modification, giving cheap read-only access to large objects. For tiny types like int the copy is as cheap as a reference (and enables optimizations), so by-value is often preferred there instead."
    },
    {
      "type": "code",
      "tag": "Default Args",
      "question": "What is the behavior?",
      "code": "#include <iostream>\n\nint g(int a, int b = a + 1) {\n    return a + b;\n}\n\nint main() {\n    std::cout << g(4) << '\\n';\n    return 0;\n}",
      "options": [
        "Prints 9",
        "Prints 8",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "A default argument may not use another parameter of the same function, so this is ill-formed (clang reports 'default argument references parameter a'). Defaults may only refer to things visible at the point of declaration, such as globals or constants, not sibling parameters."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "What is wrong here?",
      "code": "#include <iostream>\n#include <string>\n\nconst std::string& choose(bool b) {\n    std::string a = \"apple\", z = \"zebra\";\n    return b ? a : z;\n}\n\nint main() {\n    std::cout << choose(true) << '\\n';\n    return 0;\n}",
      "options": [
        "Nothing — prints apple safely",
        "Returns a reference to a destroyed local — undefined behavior",
        "Does not compile because of the ternary",
        "Prints zebra"
      ],
      "answer": 1,
      "explain": "Both a and z are locals destroyed when choose returns, so the returned const reference dangles regardless of which branch is taken — reading it is undefined behavior. Returning const& does not extend a local's lifetime; only binding a temporary to a local const& reference does."
    },
    {
      "type": "code",
      "tag": "Overload",
      "question": "Which f is selected?",
      "code": "#include <iostream>\n\nvoid f(const int&) { std::cout << \"const ref\\n\"; }\nvoid f(int&&)      { std::cout << \"rvalue\\n\"; }\n\nint main() {\n    int x = 7;\n    f(x);\n    return 0;\n}",
      "options": [
        "Prints const ref",
        "Prints rvalue",
        "Ambiguous — does not compile",
        "Prints nothing"
      ],
      "answer": 0,
      "explain": "x is an lvalue, and an rvalue reference (int&&) cannot bind to an lvalue, so only f(const int&) is viable and it prints 'const ref'. f(x) would pick the rvalue overload only if x were an rvalue such as std::move(x) or a temporary."
    },
    {
      "type": "mcq",
      "tag": "Inline",
      "question": "Which statement about the inline keyword in C++ is most accurate?",
      "options": [
        "It guarantees the compiler will expand the function body at each call site",
        "Its primary standardized effect is to permit multiple identical definitions across translation units (relax the ODR)",
        "It makes the function run faster in all cases",
        "It prevents the function from being called recursively"
      ],
      "answer": 1,
      "explain": "inline's guaranteed, standardized meaning is that the function may be defined in multiple translation units (e.g., in a header) without violating the one-definition rule; actual inlining is just a hint. Compilers inline or not based on their own heuristics regardless of the keyword."
    },
    {
      "type": "code",
      "tag": "Pointer",
      "question": "What does this print?",
      "code": "#include <iostream>\n\nvoid reset(int* p) { p = nullptr; }\n\nint main() {\n    int v = 42;\n    int* ptr = &v;\n    reset(ptr);\n    std::cout << (ptr == nullptr ? \"null\" : \"valid\") << '\\n';\n    return 0;\n}",
      "options": [
        "Prints null",
        "Prints valid",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "The pointer itself is passed by value, so reset reassigns only its local copy; the caller's ptr still points at v and prints 'valid'. To null the caller's pointer you would need int*& (reference to pointer) or int**."
    },
    {
      "type": "code",
      "tag": "Default Args",
      "question": "Result of compiling this?",
      "code": "#include <iostream>\n\nint compute(int a, int b = 10);\nint compute(int a, int b) { return a - b; }\n\nint compute(int a, int b = 10) { return a * b; }\n\nint main() {\n    std::cout << compute(3) << '\\n';\n    return 0;\n}",
      "options": [
        "Prints 30",
        "Prints -7",
        "Does not compile",
        "Prints 3"
      ],
      "answer": 2,
      "explain": "This redefines compute (two definitions of the same signature) and redeclares the default argument; clang reports 'redefinition of default argument'. A default argument can be given only once per scope, and a function may have only one definition."
    },
    {
      "type": "mcq",
      "tag": "Const Overload",
      "question": "A class has both `T& operator[](size_t)` and `const T& operator[](size_t) const`. Why is this pair idiomatic?",
      "options": [
        "The const version is faster",
        "It lets a non-const object return a modifiable element and a const object return read-only access",
        "The compiler requires both or neither",
        "It prevents out-of-bounds access"
      ],
      "answer": 1,
      "explain": "Overloading on const-ness of the object lets callers with a non-const container write through the returned reference, while const containers get read-only access — the correct behavior falls out of overload resolution. Neither version is inherently faster; they exist to preserve const-correctness."
    },
    {
      "type": "code",
      "tag": "Overload",
      "question": "Which overload wins for h('A')?",
      "code": "#include <iostream>\n\nvoid h(int)  { std::cout << \"int\\n\"; }\nvoid h(long) { std::cout << \"long\\n\"; }\n\nint main() {\n    h('A');\n    return 0;\n}",
      "options": [
        "Prints int",
        "Prints long",
        "Prints char",
        "Ambiguous — does not compile"
      ],
      "answer": 0,
      "explain": "char promotes to int (an integral promotion), which ranks higher than the conversion char->long, so h(int) is the better match and prints int. Promotions beat conversions in overload ranking, so the presence of a long overload does not create ambiguity here."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "Is this function safe?",
      "code": "#include <iostream>\n\nint& counter() {\n    static int n = 0;\n    return ++n;\n}\n\nint main() {\n    counter();\n    std::cout << counter() << '\\n';\n    return 0;\n}",
      "options": [
        "Yes — prints 2",
        "No — dangling reference, undefined behavior",
        "No — does not compile",
        "Yes — but prints 1"
      ],
      "answer": 0,
      "explain": "n has static storage duration, so it lives for the whole program and returning a reference to it is perfectly safe; two calls make it 2. The dangling-reference trap only applies to automatic (non-static) locals, which is the key distinction being tested."
    },
    {
      "type": "mcq",
      "tag": "Pass by Ref",
      "question": "What is a key danger of a non-const reference parameter (T&) compared to a value or const-ref parameter?",
      "options": [
        "It cannot bind to any argument",
        "It silently lets the function modify the caller's object, which can surprise readers of the call site",
        "It always copies the argument",
        "It forbids passing named variables"
      ],
      "answer": 1,
      "explain": "A plain T& parameter can mutate the caller's variable, yet the call site `foo(x)` looks identical to a by-value call, hiding the side effect from readers. A const T& (or by-value) makes the read-only intent explicit and also, unlike T&, can bind to temporaries and literals."
    },
    {
      "type": "code",
      "tag": "Overload",
      "question": "What happens?",
      "code": "#include <iostream>\n\nvoid p(char)         { std::cout << \"char\\n\"; }\nvoid p(unsigned char){ std::cout << \"uchar\\n\"; }\n\nint main() {\n    p(3.5);\n    return 0;\n}",
      "options": [
        "Prints char",
        "Prints uchar",
        "Ambiguous — does not compile",
        "Prints 3"
      ],
      "answer": 2,
      "explain": "double->char and double->unsigned char are both floating-integral conversions of equal rank, so neither overload is preferred and the call is ambiguous. A common wrong guess is 'char' by intuition, but the standard treats both conversions as equally bad."
    },
    {
      "type": "code",
      "tag": "Const Ref",
      "question": "What does this print?",
      "code": "#include <iostream>\n\nlong twice(const long& v) { return v * 2; }\n\nint main() {\n    int x = 21;\n    std::cout << twice(x) << '\\n';\n    return 0;\n}",
      "options": [
        "Prints 42",
        "Does not compile — int& cannot bind",
        "Undefined behavior — dangling",
        "Prints 21"
      ],
      "answer": 0,
      "explain": "Because the parameter is const long&, the int x is converted to a temporary long and the reference binds to that temporary (whose lifetime lasts for the call), printing 42. A non-const long& parameter would fail to compile here, since a non-const reference cannot bind to that temporary."
    },
    {
      "type": "mcq",
      "tag": "Inline",
      "question": "A non-inline, non-template function is defined (with a body) in a header that is #included by two .cpp files. What is the likely result?",
      "options": [
        "It works fine with no issues",
        "A linker error for multiple definition (ODR violation)",
        "A compiler warning only",
        "The function is silently made inline"
      ],
      "answer": 1,
      "explain": "Each translation unit that includes the header gets its own definition, violating the one-definition rule, so the linker reports a duplicate-symbol error. Marking the function inline (or making it a template) is what legally allows the identical definition in every including TU."
    },
    {
      "type": "code",
      "tag": "Overload",
      "question": "Which is called for m(true)?",
      "code": "#include <iostream>\n\nvoid m(int)  { std::cout << \"int\\n\"; }\nvoid m(bool) { std::cout << \"bool\\n\"; }\n\nint main() {\n    m(true);\n    return 0;\n}",
      "options": [
        "Prints int",
        "Prints bool",
        "Ambiguous — does not compile",
        "Prints 1"
      ],
      "answer": 1,
      "explain": "true is a bool, so m(bool) is an exact match while m(int) needs an integral promotion; the exact match wins and it prints bool. The classic surprise is the reverse case — m(\"text\") picks m(bool) over m(int) because a pointer-to-bool conversion beats no int match."
    },
    {
      "type": "code",
      "tag": "Default Args",
      "question": "What does this print?",
      "code": "#include <iostream>\n\nvoid show(int a = 1, int b = 2, int c = 3) {\n    std::cout << a << b << c << '\\n';\n}\n\nint main() {\n    show(7, 8);\n    return 0;\n}",
      "options": [
        "Prints 783",
        "Prints 123",
        "Does not compile",
        "Prints 738"
      ],
      "answer": 0,
      "explain": "Default arguments fill in from the right, so show(7,8) binds a=7, b=8 and uses the default c=3, printing 783. You cannot skip a middle argument — arguments are matched positionally left to right, and only trailing parameters may be omitted."
    },
    {
      "type": "code",
      "tag": "Const Overload",
      "question": "What is the result?",
      "code": "#include <iostream>\n\nstruct S {\n    void f()       { std::cout << \"nc\\n\"; }\n    void f() const { std::cout << \"c\\n\"; }\n    void go() const { f(); }\n};\n\nint main() {\n    S s;\n    s.go();\n    return 0;\n}",
      "options": [
        "Prints nc",
        "Prints c",
        "Ambiguous — does not compile",
        "Prints nc then c"
      ],
      "answer": 1,
      "explain": "Inside the const member go(), the implicit this pointer is const, so the call f() resolves to the const overload and prints c. Even though s itself is non-const, what matters is that the *this used inside go() is const."
    },
    {
      "type": "code",
      "tag": "Ref Return",
      "question": "What does this print?",
      "code": "#include <iostream>\n\nint& at(int* a, int i) { return a[i]; }\n\nint main() {\n    int data[4] = {0, 0, 0, 0};\n    at(data, 2) = 99;\n    std::cout << data[2] << '\\n';\n    return 0;\n}",
      "options": [
        "Prints 99",
        "Prints 0",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "at returns a reference into the caller-owned array (which outlives the call), so `at(data,2) = 99` legally assigns through it and data[2] becomes 99. This is safe precisely because the referent lives in main, not inside at — unlike returning a reference to a local."
    },
    {
      "type": "code",
      "tag": "Overload",
      "question": "Compilation result?",
      "code": "#include <iostream>\n\nvoid f(int x, int y = 5) { std::cout << x + y << '\\n'; }\nvoid f(int x)            { std::cout << x << '\\n'; }\n\nint main() {\n    f(10);\n    return 0;\n}",
      "options": [
        "Prints 15",
        "Prints 10",
        "Ambiguous — does not compile",
        "Does not compile (redefinition)"
      ],
      "answer": 2,
      "explain": "Both f(int) and f(int,int=5) are viable for f(10) and neither is better, so the call is ambiguous. Default arguments do not create a distinct overload — they just make a two-parameter function callable with one argument, which here collides with the one-parameter overload."
    },
    {
      "type": "code",
      "tag": "Capture-value",
      "question": "What does this program print?",
      "code": "#include <iostream>\nint main() {\n    int x = 10;\n    auto f = [x]{ return x; };\n    x = 20;\n    std::cout << f();\n}",
      "options": [
        "10",
        "20",
        "undefined behavior",
        "does not compile"
      ],
      "answer": 0,
      "explain": "A by-value capture copies the variable at the point the lambda is created, not when it is called. So x==10 is baked into the closure; the later x=20 is irrelevant. The tempting '20' assumes the capture tracks the variable, which is only true for reference capture."
    },
    {
      "type": "code",
      "tag": "Mutable",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    int x = 5;\n    auto f = [x]() mutable { x += 1; return x; };\n    int a = f();\n    int b = f();\n    std::cout << a << b << x;\n}",
      "options": [
        "675",
        "665",
        "775",
        "555"
      ],
      "answer": 0,
      "explain": "'mutable' lets the lambda modify its own captured copy, and that copy is a member of the closure that persists across calls: f() yields 6 then 7. The outer x is a separate variable and stays 5. '665' wrongly assumes the copy resets each call."
    },
    {
      "type": "code",
      "tag": "Mutable",
      "question": "Does this compile?",
      "code": "int main() {\n    int x = 0;\n    auto f = [x]{ x = 5; return x; };\n    return f();\n}",
      "options": [
        "Yes, returns 5",
        "No — the captured copy is const without 'mutable'",
        "Yes, returns 0",
        "No — you cannot capture x by value"
      ],
      "answer": 1,
      "explain": "A lambda's operator() is const by default, so by-value captures are non-modifiable inside the body. Assigning to x is an error; you need '[x]() mutable'. It is not a capture problem — capturing x by value is perfectly legal."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "What is the behavior of make()() ?",
      "code": "#include <functional>\nstd::function<int()> make() {\n    int local = 42;\n    return [&local]{ return local; };\n}\nint main() { return make()(); }",
      "options": [
        "Returns 42 safely",
        "Undefined behavior — dangling reference to a destroyed local",
        "Does not compile",
        "Always returns 0"
      ],
      "answer": 1,
      "explain": "The reference capture binds to 'local', which is destroyed when make() returns. Invoking the returned closure reads a dangling reference — undefined behavior. It may appear to 'work' by luck, but that is not safe; a by-value capture would have been correct here."
    },
    {
      "type": "code",
      "tag": "Reference-capture",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    int x = 1;\n    auto f = [&x]{ return x; };\n    x = 100;\n    std::cout << f();\n}",
      "options": [
        "1",
        "100",
        "undefined behavior",
        "does not compile"
      ],
      "answer": 1,
      "explain": "A reference capture aliases the original variable, so the lambda sees changes made after its creation: f() reads the current x, which is 100. The '1' answer confuses reference capture with value capture, which would have frozen the value at 1."
    },
    {
      "type": "code",
      "tag": "Init-capture",
      "question": "With C++14, what does this print?",
      "code": "#include <memory>\n#include <iostream>\nint main() {\n    auto p = std::make_unique<int>(7);\n    auto f = [q = std::move(p)]{ return *q; };\n    std::cout << f() << (p == nullptr);\n}",
      "options": [
        "71",
        "70",
        "does not compile",
        "undefined behavior"
      ],
      "answer": 0,
      "explain": "Init-capture (C++14) moves the unique_ptr into a new closure member q, leaving the moved-from p equal to nullptr (guaranteed for unique_ptr). So f() returns 7 and (p==nullptr) is 1. Ordinary captures cannot move, which is exactly why init-capture was introduced."
    },
    {
      "type": "code",
      "tag": "Capture-this",
      "question": "What happens when the stored lambda is called after the object dies?",
      "code": "#include <functional>\nstruct Widget {\n    int id = 5;\n    std::function<int()> getter() { return [=]{ return id; }; }\n};\nstd::function<int()> g;\nvoid setup() { Widget w; g = w.getter(); }\nint main() { setup(); return g(); }",
      "options": [
        "Returns 5 — id was copied by [=]",
        "Undefined behavior — [=] captured the this pointer, now dangling",
        "Does not compile",
        "Always returns 0"
      ],
      "answer": 1,
      "explain": "Inside a member function, [=] does NOT copy 'id'; it copies the 'this' pointer and accesses id through it. Once w is destroyed, that pointer dangles, so g() is undefined behavior. This is a classic trap — [=] gives no protection for member data (and capturing 'this' via [=] is deprecated in C++20)."
    },
    {
      "type": "code",
      "tag": "Capture-this",
      "question": "What is printed? (note: no 'mutable')",
      "code": "#include <iostream>\nstruct S {\n    int v = 1;\n    auto make() { return [this]{ v += 10; }; }\n};\nint main() {\n    S s;\n    auto f = s.make();\n    f(); f();\n    std::cout << s.v;\n}",
      "options": [
        "21",
        "1",
        "does not compile — v is modified without mutable",
        "undefined behavior"
      ],
      "answer": 0,
      "explain": "Capturing 'this' stores a non-const pointer to S. operator() being const only makes the closure's own members const — the pointee is untouched by that, so v += 10 legally modifies the real object twice, giving 21. No 'mutable' is needed because you are not modifying a captured value, but an object reached through a pointer."
    },
    {
      "type": "code",
      "tag": "Function-pointer",
      "question": "Which line fails to compile?",
      "code": "int main() {\n    int (*a)(int) = [](int x){ return x * 2; };      // (A)\n    int y = 3;\n    int (*b)(int) = [y](int x){ return x * y; };     // (B)\n    return a(1) + b(1);\n}",
      "options": [
        "Line A",
        "Line B",
        "Both compile",
        "Neither compiles"
      ],
      "answer": 1,
      "explain": "Only a captureless lambda has an implicit conversion to a plain function pointer, because a function pointer carries no state. Line B captures y, so its closure has state and cannot convert — that line fails. Line A is fine."
    },
    {
      "type": "mcq",
      "tag": "std::function",
      "question": "Which statement about std::function is the most accurate 'gotcha' compared to storing a lambda in 'auto'?",
      "options": [
        "std::function and auto have identical performance",
        "std::function type-erases the callable, which can add heap allocation and an indirect call, unlike storing the concrete lambda in auto",
        "std::function can only hold captureless lambdas",
        "std::function stores lambdas without any overhead because lambdas are already function pointers"
      ],
      "answer": 1,
      "explain": "std::function is a type-erasing wrapper: it may allocate on the heap for larger captures and calls through a virtual-like indirection, defeating inlining. Storing the closure in 'auto' keeps its concrete type and stays allocation-free and inlinable. Lambdas are not function pointers, so the last option is false."
    },
    {
      "type": "code",
      "tag": "Generic-lambda",
      "question": "With C++14, what does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    auto add = [](auto a, auto b){ return a + b; };\n    std::cout << add(2, 3);\n    std::cout << add(std::string(\"x\"), std::string(\"y\"));\n}",
      "options": [
        "5xy",
        "does not compile",
        "undefined behavior",
        "23xy"
      ],
      "answer": 0,
      "explain": "A generic lambda (auto parameters, C++14) has a templated operator(): add(2,3) instantiates the int version giving 5, and the string version concatenates to \"xy\". It is one closure object generating multiple call operators on demand, so it compiles fine."
    },
    {
      "type": "code",
      "tag": "Types",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <type_traits>\nint main() {\n    auto a = []{};\n    auto b = []{};\n    std::cout << std::is_same<decltype(a), decltype(b)>::value;\n}",
      "options": [
        "0",
        "1",
        "does not compile",
        "undefined"
      ],
      "answer": 0,
      "explain": "Every lambda expression yields a distinct, unnamed closure type, even if two lambdas are textually identical. So decltype(a) and decltype(b) differ and is_same is false (prints 0). This is why you cannot declare two such lambdas as the same type."
    },
    {
      "type": "code",
      "tag": "Capture-ref-var",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    int a = 1;\n    int& r = a;\n    auto f = [r]{ return r; };\n    a = 99;\n    std::cout << f();\n}",
      "options": [
        "1",
        "99",
        "does not compile",
        "undefined behavior"
      ],
      "answer": 0,
      "explain": "Capturing a reference variable 'by value' copies the value of the referred-to object at capture time, not the reference itself. So the closure holds a snapshot of 1, and the later a=99 does not affect it. To track a you would need to capture &a (or [&r])."
    },
    {
      "type": "code",
      "tag": "Loop-capture",
      "question": "What is the behavior?",
      "code": "#include <vector>\n#include <functional>\n#include <iostream>\nint main() {\n    std::vector<std::function<int()>> v;\n    for (int i = 0; i < 3; ++i)\n        v.push_back([&i]{ return i; });\n    std::cout << v[0]() << v[1]() << v[2]();\n}",
      "options": [
        "012",
        "222",
        "Undefined behavior — the captured loop variable is destroyed after the loop",
        "333"
      ],
      "answer": 2,
      "explain": "The for-loop's 'i' is declared in the loop's scope; once the loop ends, i is destroyed. Every stored lambda holds a reference to that now-dead variable, so all three calls read a dangling reference — undefined behavior. Capturing '[i]' by value would instead safely yield 012."
    },
    {
      "type": "code",
      "tag": "Static-capture",
      "question": "Does this compile, and why?",
      "code": "#include <iostream>\nstatic int counter = 0;\nint main() {\n    auto f = [counter]{ return counter; };\n    std::cout << f();\n}",
      "options": [
        "Compiles — counter is captured by value",
        "Does not compile — a variable with static storage duration cannot be captured",
        "Compiles but is undefined behavior",
        "Does not compile — lambdas cannot return int"
      ],
      "answer": 1,
      "explain": "Only variables with automatic storage duration can be captured. 'counter' has static storage duration, so listing it in the capture clause is ill-formed. You simply access such variables (and globals) directly inside the lambda without capturing them."
    },
    {
      "type": "code",
      "tag": "Init-capture",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int x = 10;\n    auto f = [x = x + 5]{ return x; };\n    std::cout << f();\n}",
      "options": [
        "15",
        "10",
        "does not compile — x redefined",
        "5"
      ],
      "answer": 0,
      "explain": "In init-capture '[x = x + 5]', the right-hand x refers to the outer x (10) and the left-hand x is a brand-new closure member initialized to 15. The names may coincide; the initializer is evaluated in the enclosing scope. So f() returns 15."
    },
    {
      "type": "mcq",
      "tag": "Capture-default",
      "question": "Which of these capture lists is ill-formed in C++11/14?",
      "options": [
        "[=, &x] — capture-default by value, x by reference",
        "[&, x] — capture-default by reference, x by value",
        "[=, x] — capture-default by value, x also by value",
        "[x, &y] — x by value, y by reference"
      ],
      "answer": 2,
      "explain": "When a capture-default is present, every explicit capture must use the OTHER mode. With '[=]' you may only add by-reference captures, so the redundant by-value '[=, x]' is ill-formed. '[=, &x]' and '[&, x]' correctly use the opposite mode, and '[x, &y]' has no default at all, so all three of those are valid."
    },
    {
      "type": "code",
      "tag": "IIFE",
      "question": "What is x?",
      "code": "#include <iostream>\nint main() {\n    const int x = []{\n        int s = 0;\n        for (int i = 1; i <= 4; ++i) s += i;\n        return s;\n    }();\n    std::cout << x;\n}",
      "options": [
        "10",
        "does not compile",
        "0",
        "4"
      ],
      "answer": 0,
      "explain": "This is an immediately-invoked lambda: the trailing () calls it right away, so x is initialized to the returned sum 1+2+3+4 = 10. This pattern is commonly used to run complex logic while still initializing a const in one expression."
    },
    {
      "type": "mcq",
      "tag": "Recursion",
      "question": "Why can't you write a self-recursive lambda simply as 'auto fact = [&](int n){ return n<=1?1:n*fact(n-1); };'?",
      "options": [
        "Lambdas can never call themselves",
        "Inside the initializer, 'fact' has an incomplete/deduced-from-body type, so it isn't usable yet — you need e.g. std::function",
        "Recursion requires 'mutable'",
        "It works fine with no changes"
      ],
      "answer": 1,
      "explain": "With 'auto', the variable's type is being deduced from the lambda's body, so 'fact' is not a usable, complete name inside its own initializer. Declaring 'std::function<int(int)> fact' first gives a concrete type the reference capture can refer to. Lambdas absolutely can recurse otherwise."
    },
    {
      "type": "code",
      "tag": "Generic-fnptr",
      "question": "With C++14, does this compile?",
      "code": "int main() {\n    int (*fp)(int) = [](auto x){ return x + 1; };\n    return fp(41);\n}",
      "options": [
        "Yes — a captureless generic lambda converts to a function pointer for a matching signature",
        "No — generic lambdas never convert to function pointers",
        "No — auto parameters are illegal",
        "Yes, but it is undefined behavior"
      ],
      "answer": 0,
      "explain": "A captureless generic lambda provides a conversion to a function pointer for each instantiation of its templated call operator. Here the target type int(*)(int) selects the x=int specialization, so fp points to that and fp(41) returns 42. Capture would break the conversion, but there is none here."
    },
    {
      "type": "code",
      "tag": "Mutable",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    int n = 0;\n    auto counter = [n]() mutable { return ++n; };\n    std::cout << counter() << ',' << counter() << ',' << n;\n}",
      "options": [
        "1,2,0",
        "1,2,2",
        "1,1,0",
        "0,1,0"
      ],
      "answer": 0,
      "explain": "The mutable copy of n lives inside the closure and increments across calls: 1 then 2. The external n is a distinct object and remains 0. '1,2,2' wrongly assumes the outer n is being changed."
    },
    {
      "type": "mcq",
      "tag": "Overhead",
      "question": "You have a hot loop calling a small stateless operation millions of times. Which choice is generally fastest and why?",
      "options": [
        "std::function<int(int)>, because it is standardized",
        "A lambda passed as a template parameter / stored in auto, because its concrete type lets the compiler inline the call",
        "A raw function pointer, which always inlines",
        "They are all identical after optimization"
      ],
      "answer": 1,
      "explain": "Passing the closure by its concrete type (template parameter or auto) exposes the call target to the optimizer, enabling inlining and zero abstraction cost. std::function hides the type behind an indirect call and possible allocation, and a function pointer is also an opaque indirect call that usually does NOT inline."
    },
    {
      "type": "code",
      "tag": "Capture-member",
      "question": "Does the capture list here compile?",
      "code": "struct Point {\n    int px = 1, py = 2;\n    auto sum() { return [px, py]{ return px + py; }; }\n};",
      "options": [
        "Yes — px and py are captured by value",
        "No — you cannot name non-static data members directly in a capture list",
        "Yes, but only in C++14",
        "No — members can only be captured by reference"
      ],
      "answer": 1,
      "explain": "Non-static data members are not variables with automatic storage duration; you cannot list px/py in a capture. You capture 'this' (or, in C++17, '*this'), or use init-capture like '[px = px]'. This surprises people who expect [=] or [px] to snapshot members directly."
    },
    {
      "type": "code",
      "tag": "Value-freeze",
      "question": "What is printed?",
      "code": "#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> data{1, 2, 3};\n    auto sz = [v = data]{ return v.size(); };\n    data.push_back(4);\n    std::cout << sz() << data.size();\n}",
      "options": [
        "34",
        "44",
        "33",
        "undefined behavior"
      ],
      "answer": 0,
      "explain": "The init-capture '[v = data]' copies the vector into the closure at creation, freezing its size at 3. The later push_back grows only the original 'data' to size 4. So sz() is 3 and data.size() is 4. A reference capture '[&data]' would instead print 44."
    }
  ]
};

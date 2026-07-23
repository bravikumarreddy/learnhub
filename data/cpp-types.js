/* ===== C++ — Types, Expressions & Statements =====
   Original question bank generated for LearnHub. Engine shape:
   { type: "mcq"|"code", tag, question, code?, options[], answer (0-based), explain }
   151 questions. Presented in random order by the quiz engine.
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-types"] = {
  title: "C++ — Types, Expressions & Statements",
  subtitle: "Types, const, conversions, operators & control flow — gotchas and code output.",
  crumb: "C++",
  questions: [
    {
      "type": "code",
      "tag": "Narrowing",
      "question": "What happens when this program is compiled and run?",
      "code": "#include <iostream>\nint main() {\n    int n{3.99};\n    std::cout << n;\n}",
      "options": [
        "Prints 3",
        "Prints 4",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Brace (list) initialization forbids narrowing conversions, and double-to-int is narrowing, so this is ill-formed. Had you written int n = 3.99; (copy init) it would compile and truncate to 3 — the temptation is to assume the same truncation happens here."
    },
    {
      "type": "mcq",
      "tag": "Auto",
      "question": "Given const int ci = 42; auto a = ci; what is the deduced type of a?",
      "options": [
        "const int",
        "int",
        "const int&",
        "int&"
      ],
      "answer": 1,
      "explain": "auto deduction models by-value template argument deduction: it strips top-level const and references, so a is a plain int. People expect const to 'stick', but you must write const auto a = ci; to keep it."
    },
    {
      "type": "code",
      "tag": "decltype",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int x = 0;\n    decltype((x)) y = x;\n    y = 5;\n    std::cout << x;\n}",
      "options": [
        "0",
        "5",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "decltype(x) on a bare name gives int, but the extra parentheses make (x) an lvalue expression, so decltype((x)) is int&. y is thus a reference to x, and y = 5 writes through to x. The double-parentheses rule is the classic decltype trap."
    },
    {
      "type": "mcq",
      "tag": "Auto-ref",
      "question": "After const int c = 5; auto& r = c; what does the statement r = 6; do?",
      "options": [
        "Compiles; c becomes 6",
        "Does not compile: r has type const int&",
        "Undefined behavior",
        "Compiles; r is a copy so c stays 5"
      ],
      "answer": 1,
      "explain": "Unlike plain auto, auto& preserves the const of the referent, so r is deduced as const int&, and assigning through it is a compile error. auto only drops const when it makes a copy — a reference cannot bypass the source's const."
    },
    {
      "type": "code",
      "tag": "Value-init",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    int x{};\n    std::cout << x;\n}",
      "options": [
        "A garbage value",
        "0",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Empty braces perform value-initialization, which for a scalar means zero-initialization, so x is 0 — guaranteed. Contrast with int x; (no braces) at block scope, which leaves x with an indeterminate value."
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\nint main() {\n    int x;\n    std::cout << x;\n}",
      "options": [
        "Always prints 0",
        "Undefined behavior",
        "Does not compile",
        "Prints garbage, but deterministically the same each run"
      ],
      "answer": 1,
      "explain": "A block-scope int with no initializer has an indeterminate value, and reading it is undefined behavior — not merely 'garbage'. The compiler may assume it never happens, so you cannot rely on any particular printed value or even on the program behaving consistently."
    },
    {
      "type": "code",
      "tag": "Zero-init",
      "question": "What does this print?",
      "code": "#include <iostream>\nint g;\nint main() {\n    std::cout << g;\n}",
      "options": [
        "0",
        "Undefined behavior (uninitialized)",
        "A garbage value",
        "Does not compile"
      ],
      "answer": 0,
      "explain": "Objects with static storage duration (namespace-scope variables) are zero-initialized before any other initialization, so g is 0 — reliably. This is the key contrast with a local variable, where the same syntax int x; would leave it indeterminate."
    },
    {
      "type": "code",
      "tag": "Auto-list",
      "question": "What is the deduced type of x?",
      "code": "auto x = {1, 2, 3};",
      "options": [
        "int[3]",
        "std::initializer_list<int>",
        "std::vector<int>",
        "Ill-formed"
      ],
      "answer": 1,
      "explain": "With copy-list syntax auto ... = {…}, auto deduces std::initializer_list<T>. This is a special-case carve-out for auto; ordinary template argument deduction would fail on a braced list. Beware: for a named initializer_list the backing array's lifetime matches the object, but copying/returning it leaves the copy dangling."
    },
    {
      "type": "code",
      "tag": "Copy-init",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    double d = 3.9;\n    int n = d;\n    std::cout << n;\n}",
      "options": [
        "3",
        "4",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "Copy-initialization allows the narrowing double-to-int conversion, which truncates toward zero, giving 3 (not rounded to 4). Only brace initialization int n{d}; would have rejected this at compile time."
    },
    {
      "type": "mcq",
      "tag": "char",
      "question": "Is the plain type char signed or unsigned?",
      "options": [
        "Always signed",
        "Always unsigned",
        "Implementation-defined",
        "The same as signed char on every platform"
      ],
      "answer": 2,
      "explain": "Whether plain char behaves as signed or unsigned is implementation-defined and varies by platform/ABI. This bites code that stores byte values above 127 in a char and compares them — use unsigned char (or signed char) when the signedness matters."
    },
    {
      "type": "mcq",
      "tag": "char-types",
      "question": "How do char, signed char, and unsigned char relate as types?",
      "options": [
        "They are all the same type",
        "They are three distinct types",
        "Two distinct types: char is an alias for signed char",
        "Two distinct types: char is an alias for unsigned char"
      ],
      "answer": 1,
      "explain": "The standard defines char, signed char, and unsigned char as three distinct types, even though char has the same representation and behavior as whichever of the other two matches its signedness. This matters for overload resolution and template specialization, where char never collapses into signed/unsigned char."
    },
    {
      "type": "code",
      "tag": "Narrowing",
      "question": "What happens with this declaration?",
      "code": "bool b{2};",
      "options": [
        "b is true",
        "b is 2",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "bool can represent only 0 and 1, so the constant 2 does not fit, making it a narrowing conversion that is ill-formed in a braced initializer. Note bool b{1}; would compile fine, and bool b = 2; (copy init) would compile and yield true."
    },
    {
      "type": "code",
      "tag": "Auto",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int i = 5;\n    int& ref = i;\n    auto a = ref;\n    a = 10;\n    std::cout << i;\n}",
      "options": [
        "5",
        "10",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "auto strips reference-ness, so a is a plain int copy of i, and modifying a leaves i unchanged at 5. To alias i you would need auto& a = ref;. The presence of int& on ref does not make a a reference."
    },
    {
      "type": "mcq",
      "tag": "sizeof",
      "question": "Which of these is guaranteed by the C++ standard?",
      "options": [
        "sizeof(int) == 4",
        "sizeof(char) == 1",
        "sizeof(long) > sizeof(int)",
        "sizeof(int) >= sizeof(long)"
      ],
      "answer": 1,
      "explain": "sizeof(char) is 1 by definition — it is the unit all sizes are measured in. The others are not guaranteed: int need not be 4 bytes, and long is only guaranteed to be at least as large as int (>=), not strictly larger."
    },
    {
      "type": "mcq",
      "tag": "Narrowing",
      "question": "Which one of these brace initializations is ill-formed (assuming an 8-bit char)?",
      "options": [
        "float f{3.14};",
        "int i{'A'};",
        "char c{300};",
        "long L{100};"
      ],
      "answer": 2,
      "explain": "char c{300} is narrowing because 300 cannot be represented in an 8-bit char, so it is rejected. float f{3.14} is allowed (a constant double within float's range is a permitted exception), int i{'A'} widens char to int, and long L{100} widens int to long — all fine."
    },
    {
      "type": "mcq",
      "tag": "Unsigned",
      "question": "For unsigned int u = 0; u--; the resulting behavior is:",
      "options": [
        "Undefined behavior",
        "Well-defined: u becomes UINT_MAX",
        "Implementation-defined",
        "Clamped to 0"
      ],
      "answer": 1,
      "explain": "Unsigned arithmetic is defined to wrap modulo 2^N, so decrementing 0 yields UINT_MAX — fully portable and well-defined. This is precisely the opposite of signed overflow (e.g. INT_MAX + 1), which is undefined behavior."
    },
    {
      "type": "mcq",
      "tag": "decltype",
      "question": "What is the type of c?",
      "options": [
        "int",
        "double",
        "The type is deduced later from c's use",
        "Does not compile because c is uninitialized"
      ],
      "answer": 1,
      "explain": "decltype(a + b) reports the type of the expression a + b, and the usual arithmetic conversions promote int + double to double, so c is a double. Declaring an uninitialized double is perfectly legal (it is just indeterminate), so it compiles."
    },
    {
      "type": "mcq",
      "tag": "Auto-ptr",
      "question": "Given const int* p = nullptr; auto q = p; what is the type of q?",
      "options": [
        "const int*",
        "int*",
        "const int* const",
        "int* const"
      ],
      "answer": 0,
      "explain": "The type of p is 'pointer to const int'. The const here is low-level (it qualifies the pointee, not the pointer), so it is part of the pointer type and is preserved: q is const int*. auto only drops top-level const, and p itself is not const."
    },
    {
      "type": "mcq",
      "tag": "Auto-ptr",
      "question": "Given int* const p = nullptr; auto q = p; what is the type of q?",
      "options": [
        "int* const",
        "int*",
        "const int*",
        "const int* const"
      ],
      "answer": 1,
      "explain": "Here const is top-level: it qualifies the pointer p itself, not what it points to. auto drops top-level const when copying, so q is a plain int*. This is the mirror image of the low-level-const case, where the const would be kept."
    },
    {
      "type": "code",
      "tag": "Auto-list",
      "question": "What is the result of this declaration?",
      "code": "auto x = {1, 2.0};",
      "options": [
        "std::initializer_list<double>",
        "std::initializer_list<int>",
        "Does not compile",
        "std::initializer_list<double> after promoting 1"
      ],
      "answer": 2,
      "explain": "For auto = {…} to deduce std::initializer_list<T>, every element must have the same type T. Here the list mixes int and double, so no single element type can be deduced and the program is ill-formed — there is no automatic promotion to a common type."
    },
    {
      "type": "code",
      "tag": "Narrowing",
      "question": "What happens with int x = int{3.0}; ?",
      "code": "int x = int{3.0};",
      "options": [
        "Compiles; x is 3",
        "Does not compile",
        "Compiles; x is 0",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Floating-point-to-integer is always a narrowing conversion in brace initialization, even for an exactly representable value like 3.0, so int{3.0} is ill-formed. The 'constant fits exactly' exception exists for some conversions, but not for float-to-integer."
    },
    {
      "type": "mcq",
      "tag": "Deduction",
      "question": "Given const int ci = 10; const int& cr = ci; auto x = cr; and decltype(cr) y = ci; which statement is true?",
      "options": [
        "Both x and y are const int&",
        "x is int; y is const int&",
        "Both x and y are int",
        "x is const int&; y is int"
      ],
      "answer": 1,
      "explain": "auto x = cr copies, so it strips both the reference and the top-level const, making x a plain int. decltype(cr), by contrast, reports the declared type of cr exactly — const int& — preserving the reference and const. This is the fundamental difference between auto and decltype."
    },
    {
      "type": "mcq",
      "tag": "Widths",
      "question": "Which minimum-width guarantee does the C++ standard actually make?",
      "options": [
        "int is at least 32 bits",
        "long long is at least 64 bits",
        "short is exactly 16 bits",
        "long is at least 64 bits"
      ],
      "answer": 1,
      "explain": "The standard guarantees long long is at least 64 bits. int is only guaranteed at least 16 bits (commonly 32, but not required), short is at least 16 (not exactly), and long is at least 32 (not 64 — that's the LP64/LLP64 divergence between platforms)."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\nconst int& make() {\n    int x = 42;\n    return x;\n}\nint main() {\n    const int& r = make();\n    std::cout << r << '\\n';\n}",
      "options": [
        "Prints 42",
        "Undefined behavior",
        "Compile error: cannot return reference to local",
        "Prints 0"
      ],
      "answer": 1,
      "explain": "Returning a reference to the local `x` produces a dangling reference; `x` is destroyed when `make` returns, so reading `r` is undefined behavior. Binding to `const int&` does NOT extend the lifetime here because lifetime extension only applies when a temporary is bound directly to a reference, not when a reference is returned from a function (the return is already a glvalue reference to the dead object)."
    },
    {
      "type": "mcq",
      "tag": "Lifetime",
      "question": "A prvalue temporary is bound directly to a `const int&` local reference. What happens to the temporary's lifetime?",
      "options": [
        "It ends at the semicolon of the initialization (full expression)",
        "It is extended to match the lifetime of the reference",
        "It is undefined; the reference immediately dangles",
        "The temporary is copied into the reference's storage"
      ],
      "answer": 1,
      "explain": "Binding a temporary directly to a reference extends the temporary's lifetime to that of the reference. The 'ends at the semicolon' rule applies to temporaries NOT bound to a reference; the copy option is wrong because references never own separate storage for the object."
    },
    {
      "type": "code",
      "tag": "Rebind",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int a = 1, b = 2;\n    int& r = a;\n    r = b;\n    b = 99;\n    std::cout << a << ' ' << b << '\\n';\n}",
      "options": [
        "99 99",
        "2 99",
        "1 99",
        "1 2"
      ],
      "answer": 1,
      "explain": "A reference cannot be rebound; `r = b` does not make `r` refer to `b`, it assigns b's value (2) into `a` through `r`. Later `b = 99` changes only `b`, leaving `a` at 2. The '99 99' answer wrongly assumes `r` was rebound to alias `b`."
    },
    {
      "type": "mcq",
      "tag": "TopLevel",
      "question": "In the declaration `const int* const p = &x;`, which const is 'top-level' and which is 'low-level'?",
      "options": [
        "The first const (on int) is top-level; the second is low-level",
        "The first const is low-level (pointee is const); the second const (on the pointer) is top-level",
        "Both are top-level",
        "Both are low-level"
      ],
      "answer": 1,
      "explain": "Low-level const applies to the object being pointed to: `const int*` means you can't modify the pointee. Top-level const applies to the object itself: `int* const` means the pointer p can't be reseated. The distinction matters because top-level const is ignored in copy/parameter matching, low-level is not."
    },
    {
      "type": "code",
      "tag": "Const",
      "question": "Does this compile, and if so what does it do?",
      "code": "#include <iostream>\nint main() {\n    const int c = 10;\n    int* p = (int*)&c;\n    *p = 20;\n    std::cout << c << ' ' << *p << '\\n';\n}",
      "options": [
        "Prints 20 20",
        "Prints 10 20, but it's undefined behavior",
        "Compile error: cannot cast away const",
        "Guaranteed to print 10 10"
      ],
      "answer": 1,
      "explain": "Casting away const with a C-style cast compiles, but writing through `p` to an object originally declared `const` is undefined behavior. The compiler may treat `c` as the constant 10 (so it prints 10) while `*p` reads the modified memory (20); any observed output is unreliable because the program has UB."
    },
    {
      "type": "mcq",
      "tag": "nullptr",
      "question": "Given overloads `void f(int);` and `void f(char*);`, which is called by `f(NULL)` vs `f(nullptr)` on a typical implementation where NULL is defined as `0`?",
      "options": [
        "Both call f(char*)",
        "f(NULL) calls f(int); f(nullptr) calls f(char*)",
        "Both call f(int)",
        "f(NULL) is ambiguous; f(nullptr) calls f(int)"
      ],
      "answer": 1,
      "explain": "When `NULL` is `0`, `f(NULL)` calls the `int` overload (the int literal is an exact match, which beats the null-pointer-constant conversion to `char*`). `nullptr` has type `std::nullptr_t`, which converts to the pointer overload but not to `int`. This is exactly why `nullptr` was introduced to fix `NULL`'s ambiguity."
    },
    {
      "type": "code",
      "tag": "Pointer",
      "question": "What is the result of this code?",
      "code": "#include <iostream>\nint main() {\n    int x = 5;\n    const int* p = &x;\n    *p = 10;\n    std::cout << x << '\\n';\n}",
      "options": [
        "Prints 10",
        "Prints 5",
        "Compile error: assignment of read-only location",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "`p` is a pointer-to-const, so `*p = 10` is a compile error even though `x` itself is not const. Low-level const restricts modification through that pointer. It is not UB because it never compiles; you would need `p` non-const-pointee or a cast to attempt the (bad) write."
    },
    {
      "type": "code",
      "tag": "constexpr",
      "question": "Does this compile?",
      "code": "int main() {\n    int n = 5;\n    constexpr int a = 10;\n    constexpr int b = a * 2;\n    constexpr int c = n + 1;\n    return b + c;\n}",
      "options": [
        "Yes, all four lines compile",
        "No: `constexpr int c = n + 1;` fails because n is not a constant expression",
        "No: constexpr cannot be used inside main",
        "No: `b = a * 2` fails because a is not literal"
      ],
      "answer": 1,
      "explain": "A `constexpr` variable must be initialized by a constant expression. `n` is a runtime `int`, so `n + 1` is not constant and `constexpr int c = n + 1;` fails. `a` and `b` are fine because they are built from constant expressions."
    },
    {
      "type": "mcq",
      "tag": "constexpr",
      "question": "What is the key difference between `const int a = f();` and `constexpr int a = f();`?",
      "options": [
        "There is no difference; constexpr is just a synonym for const",
        "`const` requires the initializer be a compile-time constant; `constexpr` does not",
        "`constexpr` requires the initializer be a constant expression (evaluable at compile time); `const` only requires the value not change after init",
        "Both require f() to be constexpr"
      ],
      "answer": 2,
      "explain": "`const` merely promises the object won't be modified after initialization; its initializer can be a runtime value. `constexpr` additionally demands the initializer be a constant expression, so `f()` must be a `constexpr` function invoked with constant arguments, otherwise it won't compile."
    },
    {
      "type": "code",
      "tag": "BindTemp",
      "question": "Which line fails to compile?",
      "code": "int main() {\n    int& r1 = 5;          // A\n    const int& r2 = 5;    // B\n    double d = 3.14;\n    int& r3 = d;          // C\n    const int& r4 = d;    // D\n    return 0;\n}",
      "options": [
        "Only A",
        "Only D",
        "A and C",
        "B and D"
      ],
      "answer": 2,
      "explain": "A non-const lvalue reference cannot bind to a temporary/prvalue (line A) nor to a temporary created by the `double`-to-`int` conversion (line C). Lines B and D compile: a reference-to-const can bind the literal and the converted temporary, whose lifetime is extended."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "What is the behavior?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    const char* p = std::string(\"hello\").c_str();\n    std::cout << p << '\\n';\n}",
      "options": [
        "Prints hello reliably",
        "Undefined behavior",
        "Compile error",
        "Prints an empty string, guaranteed"
      ],
      "answer": 1,
      "explain": "The temporary `std::string` is destroyed at the end of the full expression (the semicolon), so `p` dangles before the `cout` line runs; dereferencing it is undefined behavior. Assigning `.c_str()` to a raw pointer does not extend the string's lifetime, unlike binding the string itself to a `const&`."
    },
    {
      "type": "mcq",
      "tag": "TopLevel",
      "question": "Why does `int` and `const int` count as the same type for the purpose of overload resolution on by-value parameters, so that `void g(int)` and `void g(const int)` cannot coexist?",
      "options": [
        "Because const is illegal on function parameters",
        "Because top-level const on a by-value parameter is ignored, making the signatures identical",
        "Because the compiler merges them into one function at link time",
        "Because const int silently decays to int only in main"
      ],
      "answer": 1,
      "explain": "For a by-value parameter, the const is top-level (it qualifies the parameter copy, not anything the caller sees), and top-level const is dropped when forming the function's signature. So `g(int)` and `g(const int)` are redeclarations of the same function, hence a conflict if both are defined."
    },
    {
      "type": "code",
      "tag": "Pointer",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int a = 1, b = 2;\n    int* const p = &a;\n    *p = 7;\n    p = &b;\n    std::cout << a << '\\n';\n}",
      "options": [
        "Prints 7",
        "Prints 2",
        "Compile error on `p = &b;`",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "`int* const p` is a const pointer (top-level const): you may modify the pointee (`*p = 7` is fine) but you may not reseat the pointer, so `p = &b;` is a compile error. Contrast pointer-to-const, where the reverse restrictions apply."
    },
    {
      "type": "code",
      "tag": "Iterators",
      "question": "Does this compile?",
      "code": "#include <vector>\nint main() {\n    std::vector<int> v = {1,2,3};\n    const std::vector<int>& r = v;\n    r.push_back(4);\n    return 0;\n}",
      "options": [
        "Yes; push_back works through the reference",
        "No; push_back is non-const and cannot be called on a reference-to-const",
        "Yes, but it's undefined behavior",
        "No; a const reference cannot bind to a non-const vector"
      ],
      "answer": 1,
      "explain": "Through a reference-to-const you may only call const member functions; `push_back` is non-const, so the call fails to compile. Binding `const&` to a non-const object is perfectly legal (option 3 is wrong) — the const applies to access through `r`, not to `v` itself."
    },
    {
      "type": "mcq",
      "tag": "Conversion",
      "question": "Why does `int** ` NOT implicitly convert to `const int**`, even though `int*` converts to `const int*`?",
      "options": [
        "It's an arbitrary language restriction with no rationale",
        "Because allowing it would let you store a const int*'s address and then write to a const object without a cast",
        "Because const int** is a larger type",
        "Because double indirection is always illegal"
      ],
      "answer": 1,
      "explain": "If `int**` converted to `const int**`, you could point the inner `const int*` at a truly const object and then, via the original `int**`, assign a non-const pointer through it, silently defeating const. The standard forbids this specific multi-level conversion for exactly that soundness reason."
    },
    {
      "type": "code",
      "tag": "Reference",
      "question": "What does this print?",
      "code": "#include <iostream>\nvoid inc(int& x) { x++; }\nint main() {\n    int a = 5;\n    const int& r = a;\n    inc(r);\n    std::cout << a << '\\n';\n}",
      "options": [
        "Prints 6",
        "Compile error: binding const int& to int&",
        "Prints 5",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "`r` is a reference-to-const, so passing it to `inc(int&)` (a non-const reference parameter) would strip const and is a compile error. The value of `a` is irrelevant because the program never builds; the const-correctness rule blocks the call at compile time."
    },
    {
      "type": "mcq",
      "tag": "nullptr",
      "question": "What is the type of `nullptr`, and what does that guarantee over the literal `0`?",
      "options": [
        "It's an `int` equal to zero, just spelled differently",
        "It's `std::nullptr_t`, which converts to any pointer type but not to an integral type",
        "It's `void*`, which converts to any pointer",
        "It's a macro that expands to `((void*)0)`"
      ],
      "answer": 1,
      "explain": "`nullptr` has the distinct type `std::nullptr_t`. It implicitly converts to any pointer type but NOT to `int`, so it can't accidentally select an integer overload the way `0`/`NULL` can. It is a keyword, not a macro or a `void*`."
    },
    {
      "type": "code",
      "tag": "Const",
      "question": "Does this compile?",
      "code": "int main() {\n    int x = 1, y = 2;\n    const int* p = &x;\n    p = &y;       // A\n    int* const q = &x;\n    *q = 5;       // B\n    return *p + *q;\n}",
      "options": [
        "Both A and B compile",
        "A fails, B compiles",
        "A compiles, B fails",
        "Both A and B fail"
      ],
      "answer": 0,
      "explain": "`const int* p` is pointer-to-const: you cannot write `*p` but you CAN reseat `p` (line A is fine). `int* const q` is a const pointer: you cannot reseat it but you CAN write `*q` (line B is fine). Each restricts a different thing, so both lines compile."
    },
    {
      "type": "code",
      "tag": "Lifetime",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct S { int v; ~S(){ std::cout << \"~\"; } };\nint main() {\n    const S& r = S{7};\n    std::cout << r.v;\n    std::cout << \"end\";\n}",
      "options": [
        "7end~",
        "7~end",
        "~7end",
        "Undefined behavior (temporary already destroyed)"
      ],
      "answer": 0,
      "explain": "Binding the temporary `S{7}` to `const S& r` extends its lifetime to the end of `main`, so `r.v` reads 7 safely and the destructor runs only when `r` goes out of scope — after 'end' is printed. Output is `7end` then `~`."
    },
    {
      "type": "mcq",
      "tag": "Reference",
      "question": "Why can't you have an array of references, e.g. `int& arr[3];`?",
      "options": [
        "References are too large to store in arrays",
        "A reference is not an object and has no guaranteed storage/size, so array element requirements aren't met",
        "Arrays require const elements",
        "It actually is legal in C++11"
      ],
      "answer": 1,
      "explain": "A reference is an alias, not an object; it isn't required to occupy storage and has no address of its own in the object model, so it can't serve as an array element type. Use pointers or `std::reference_wrapper` when you need a container of 'references'."
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\nint& get() {\n    static int s = 0;\n    return s;\n}\nint main() {\n    get() = 42;\n    std::cout << get() << '\\n';\n}",
      "options": [
        "Prints 42",
        "Prints 0",
        "Undefined behavior (dangling reference)",
        "Compile error: cannot assign to function call"
      ],
      "answer": 0,
      "explain": "Returning `int&` to a `static` local is safe because the static object lives for the whole program, so `get() = 42` writes through the reference and the next `get()` reads 42. It is NOT a dangling-reference UB case, which would only arise for a non-static local."
    },
    {
      "type": "code",
      "tag": "Auto",
      "question": "What is the deduced type of `y`?",
      "code": "int main() {\n    const int x = 10;\n    auto y = x;\n    return 0;\n}",
      "options": [
        "const int",
        "int",
        "const int&",
        "int&"
      ],
      "answer": 1,
      "explain": "`auto` deduction (by value) drops top-level const and references, so `y` is a plain `int` and can be modified independently of `x`. To keep the const you would write `const auto y = x;`; to alias, `const auto& y = x;`."
    },
    {
      "type": "mcq",
      "tag": "Dangling",
      "question": "Which of these produces a dangling pointer after the statement completes?",
      "options": [
        "`int a = 5; int* p = &a;` inside the same scope",
        "`int* p = new int(5);` (no delete yet)",
        "`int* p; { int a = 5; p = &a; }` then using p",
        "A static local's address returned from a function"
      ],
      "answer": 2,
      "explain": "After the inner block ends, `a` is destroyed but `p` still holds its old address, so `p` dangles and any use is UB. A live local (option 0), a heap object not yet freed (option 1), and a static's address (option 3) all remain valid."
    },
    {
      "type": "code",
      "tag": "Overload",
      "question": "Which overload does `h(x)` call?",
      "code": "#include <iostream>\nvoid h(int&)       { std::cout << \"nonconst\"; }\nvoid h(const int&) { std::cout << \"const\"; }\nint main() {\n    int x = 1;\n    const int y = 2;\n    h(x);\n    h(y);\n}",
      "options": [
        "Prints nonconstconst",
        "Prints constconst",
        "Prints nonconstnonconst",
        "Ambiguous: does not compile"
      ],
      "answer": 0,
      "explain": "`h(x)` prefers `h(int&)` because `x` is a non-const lvalue and binding to the non-const reference is the better match. `h(y)` cannot bind to `int&` (would drop const) so it selects `h(const int&)`. Result: `nonconstconst`."
    },
    {
      "type": "code",
      "tag": "constexpr",
      "question": "Does this compile in C++11?",
      "code": "constexpr int square(int n) { return n * n; }\nint main() {\n    int arr[square(4)];\n    constexpr int z = square(5);\n    return z;\n}",
      "options": [
        "Yes; square is usable in constant expressions",
        "No; a function can never be used for an array bound",
        "No; square must be marked inline",
        "No; constexpr functions cannot take parameters"
      ],
      "answer": 0,
      "explain": "A `constexpr` function called with constant arguments yields a constant expression, so `square(4)` is a valid array bound and `square(5)` initializes a `constexpr`. `constexpr` functions absolutely may take parameters; the constexpr-ness of the result depends on the arguments being constant."
    },
    {
      "type": "code",
      "tag": "Signed/Unsigned",
      "question": "What does this print on a typical 32-bit-int platform?",
      "code": "#include <iostream>\nint main() {\n    int i = -1;\n    unsigned u = 1;\n    std::cout << (i < u);\n}",
      "options": [
        "1",
        "0",
        "-1",
        "Compile error"
      ],
      "answer": 1,
      "explain": "In a mixed int/unsigned comparison, the usual arithmetic conversions convert the int to unsigned. -1 becomes UINT_MAX (4294967295), so the test is 4294967295 < 1, which is false, printing 0. The tempting answer 1 assumes the mathematical comparison -1 < 1, but the signed value never survives the conversion."
    },
    {
      "type": "code",
      "tag": "Promotion",
      "question": "Assuming 32-bit int, what is printed?",
      "code": "#include <iostream>\nint main() {\n    unsigned short a = 60000, b = 60000;\n    auto c = a + b;\n    std::cout << c;\n}",
      "options": [
        "54464",
        "120000",
        "-11072",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Integer promotion converts each unsigned short to int (a 32-bit int can represent every unsigned short value), so the addition is done in int: 60000 + 60000 = 120000, and auto deduces int. There is no wraparound. The trap answer 54464 assumes the math happens in 16-bit unsigned (120000 mod 65536), which would only occur if int were 16 bits."
    },
    {
      "type": "code",
      "tag": "Truncation",
      "question": "What is the output?",
      "code": "#include <iostream>\nint main() {\n    std::cout << (int)3.99 << ' ' << (int)-3.99;\n}",
      "options": [
        "4 -4",
        "3 -3",
        "3 -4",
        "4 -3"
      ],
      "answer": 1,
      "explain": "Floating-to-integer conversion truncates toward zero (it discards the fractional part), it does not round. So 3.99 becomes 3 and -3.99 becomes -3. The distractor '4 -4' wrongly assumes rounding to nearest."
    },
    {
      "type": "code",
      "tag": "Narrowing",
      "question": "What happens when this is compiled?",
      "code": "#include <iostream>\nint main() {\n    int x{3.14};\n    std::cout << x;\n}",
      "options": [
        "Prints 3",
        "Prints 3.14",
        "Ill-formed: does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Brace (list) initialization forbids narrowing conversions, and double-to-int is narrowing, so this is ill-formed and a conforming compiler must reject it (at least with a diagnostic). Had you written int x = 3.14; with parentheses/equals it would compile and truncate to 3, which is exactly why the braces exist: to catch this silent loss."
    },
    {
      "type": "code",
      "tag": "Modulo",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    unsigned char c = 257;\n    std::cout << (int)c;\n}",
      "options": [
        "257",
        "Undefined behavior",
        "1",
        "255"
      ],
      "answer": 2,
      "explain": "Conversion to an unsigned type is well-defined and reduces the value modulo 2^N. For unsigned char (8 bits), 257 mod 256 = 1. This is defined behavior, unlike out-of-range conversion to a signed type. The distractor 255 confuses this with clamping/saturation, which C++ never does."
    },
    {
      "type": "code",
      "tag": "Float-to-int",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\nint main() {\n    double d = 1e10;\n    int i = d;\n    std::cout << i;\n}",
      "options": [
        "Prints 10000000000",
        "Prints 1410065408 deterministically",
        "Undefined behavior",
        "Prints INT_MAX (clamped)"
      ],
      "answer": 2,
      "explain": "When a floating value is converted to an integer type and the truncated value cannot be represented in the destination (1e10 far exceeds INT_MAX), the behavior is undefined. It is NOT a defined modulo wrap (that rule applies only to integer-to-unsigned conversions) and C++ does not clamp. Any specific number you observe is unreliable."
    },
    {
      "type": "code",
      "tag": "Size_t",
      "question": "How does this loop behave?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    for (size_t i = v.size() - 1; i >= 0; --i)\n        std::cout << v[i];\n    std::cout << \"end\";\n}",
      "options": [
        "Prints 321end",
        "Prints 321 then loops forever / crashes",
        "Prints 123end",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "size_t is unsigned, so the condition i >= 0 is ALWAYS true. After i reaches 0 the loop body runs, then --i wraps i to SIZE_MAX, and v[SIZE_MAX] is a wild out-of-bounds access. The classic reverse-loop bug: an unsigned index can never be negative, so the intended termination never happens."
    },
    {
      "type": "mcq",
      "tag": "const_cast",
      "question": "Which use of const_cast has undefined behavior?",
      "options": [
        "Casting away const on a pointer to an object that was originally declared non-const, then writing through it",
        "Casting away const to pass to a legacy C API that only reads the object",
        "Casting away const and then writing to an object that was originally declared 'const int'",
        "Adding const with const_cast to a non-const pointer"
      ],
      "answer": 2,
      "explain": "Modifying an object that was actually defined as const (e.g. 'const int x = 5;') through a const_cast is undefined behavior, because the compiler may place it in read-only memory or assume its value never changes. Casting away const is legal and safe only when the underlying object is genuinely non-const; the const was merely an access restriction on that path."
    },
    {
      "type": "code",
      "tag": "Aliasing",
      "question": "What is the behavior of interpreting a float's bits this way?",
      "code": "#include <iostream>\nint main() {\n    float f = 1.5f;\n    int i = *reinterpret_cast<int*>(&f);\n    std::cout << i;\n}",
      "options": [
        "Prints the IEEE-754 bit pattern reliably",
        "Undefined behavior (strict aliasing violation)",
        "Compile error",
        "Prints 1"
      ],
      "answer": 1,
      "explain": "reinterpret_cast only reinterprets the pointer type; dereferencing an int* that actually points at a float violates the strict aliasing rule, which is undefined behavior. The correct, defined way to inspect the bits is std::memcpy into an int (or, in C++20, std::bit_cast). It may appear to 'work' at -O0 and then break under optimization."
    },
    {
      "type": "code",
      "tag": "Signed/Unsigned",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    std::cout << (-1 > 0u);\n}",
      "options": [
        "0",
        "1",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 1,
      "explain": "0u is unsigned, so -1 is converted to unsigned (UINT_MAX) by the usual arithmetic conversions. UINT_MAX > 0 is true, so it prints 1. This is the notorious surprise: adding a single 'u' suffix flips the meaning of the comparison."
    },
    {
      "type": "mcq",
      "tag": "static_cast",
      "question": "Which conversion will static_cast NOT perform (causing a compile error)?",
      "options": [
        "int to double",
        "Base* to Derived* (downcast in a related hierarchy)",
        "const int* to int* (removing const)",
        "enum to its underlying integer type"
      ],
      "answer": 2,
      "explain": "static_cast cannot cast away constness; only const_cast can remove const/volatile. Attempting static_cast<int*>(a const int*) is a compile error. The other three are all valid static_cast conversions (numeric, related-pointer downcast, and enum-to-int)."
    },
    {
      "type": "code",
      "tag": "Unsigned wrap",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    unsigned a = 3, b = 5;\n    std::cout << (a - b);\n}",
      "options": [
        "-2",
        "Undefined behavior",
        "4294967294",
        "0"
      ],
      "answer": 2,
      "explain": "Unsigned subtraction is well-defined modular arithmetic: 3 - 5 wraps to 2^32 - 2 = 4294967294 (on 32-bit unsigned). There is no undefined behavior for unsigned overflow/underflow, unlike signed. Expecting -2 forgets that an unsigned type cannot hold negative values."
    },
    {
      "type": "code",
      "tag": "Signed overflow",
      "question": "What is the behavior?",
      "code": "#include <iostream>\nint main() {\n    int x = 2147483647;\n    std::cout << (x + 1);\n}",
      "options": [
        "Prints -2147483648 reliably",
        "Undefined behavior",
        "Prints 2147483648",
        "Prints 0"
      ],
      "answer": 1,
      "explain": "Signed integer overflow is undefined behavior in C++. Even though two's-complement hardware would 'wrap' to INT_MIN, the standard does not guarantee it, and optimizers exploit the assumption that overflow never happens. Contrast this sharply with unsigned overflow, which is defined modular wrap."
    },
    {
      "type": "code",
      "tag": "Signed/Unsigned",
      "question": "On 64-bit Linux (LP64: long is 64-bit, int is 32-bit), what prints?",
      "code": "#include <iostream>\nint main() {\n    unsigned int u = 1;\n    long l = -1;\n    std::cout << (l < u);\n}",
      "options": [
        "0",
        "1",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 1,
      "explain": "Because long (64-bit) can represent every value of unsigned int (32-bit), the usual arithmetic conversions convert u to long, keeping its value 1. So the comparison is -1 < 1, which is true, printing 1. Note this is platform-dependent: on Windows LLP64 where long is 32 bits, long cannot represent every unsigned int value, so both operands convert to unsigned long and the result flips to 0."
    },
    {
      "type": "code",
      "tag": "Narrowing",
      "question": "What happens here?",
      "code": "#include <iostream>\nint main() {\n    char c{300};\n    std::cout << (int)c;\n}",
      "options": [
        "Prints 44",
        "Prints 300",
        "Ill-formed: does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "With list initialization, if the source is a constant expression whose value does not fit in the target type it is a narrowing error, so char c{300}; is ill-formed and must be diagnosed (assuming 8-bit char). Using char c = 300; instead would compile with an implementation-defined result, which is exactly the silent bug braces are designed to prevent."
    },
    {
      "type": "code",
      "tag": "Promotion",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    signed char a = 100, b = 100;\n    auto c = a + b;\n    std::cout << c;\n}",
      "options": [
        "-56",
        "200",
        "Undefined behavior",
        "Implementation-defined"
      ],
      "answer": 1,
      "explain": "Both operands undergo integer promotion to int before the addition, so 100 + 100 = 200 is computed in int and auto deduces int, printing 200 with no overflow. The -56 trap assumes the arithmetic stays in signed char; promotion is precisely why in-expression arithmetic on small types does not overflow at these values."
    },
    {
      "type": "code",
      "tag": "Narrowing",
      "question": "Assuming signed char range is -128..127, what is the result (C++11/14)?",
      "code": "#include <iostream>\nint main() {\n    signed char c = 100 + 100;\n    std::cout << (int)c;\n}",
      "options": [
        "Undefined behavior",
        "Implementation-defined value",
        "Ill-formed: does not compile",
        "Always 127 (saturated)"
      ],
      "answer": 1,
      "explain": "The sum 200 is computed as int, then assigned (converted) to signed char. In C++11/14/17, converting an out-of-range value to a signed integer type yields an implementation-defined result (commonly -56 via two's-complement wrap) but is NOT undefined behavior. This is a plain assignment, not braces, so it compiles; and C++ never saturates. (C++20 later made this a defined modulo wrap.)"
    },
    {
      "type": "code",
      "tag": "Float-to-unsigned",
      "question": "What is the behavior of each conversion below?",
      "code": "#include <iostream>\nint main() {\n    unsigned a = (unsigned)(int)-1.0;\n    unsigned b = (unsigned)-1.0;\n    std::cout << a << ' ' << b;\n}",
      "options": [
        "Both are UINT_MAX, well-defined",
        "a is UINT_MAX (defined); computing b is undefined behavior",
        "Both conversions are undefined behavior",
        "Compile error on b"
      ],
      "answer": 1,
      "explain": "For a: -1.0 to int gives -1 (defined), then int -1 to unsigned wraps to UINT_MAX (defined modulo). For b: converting the floating value -1.0 directly to unsigned is undefined behavior because the truncated value -1 is not representable in unsigned. The extra (int) cast routes through a defined integer-to-unsigned conversion; skipping it invokes the floating-to-integer out-of-range rule."
    },
    {
      "type": "code",
      "tag": "Promotion",
      "question": "What is printed?",
      "code": "#include <cstdint>\n#include <iostream>\nint main() {\n    uint8_t x = 0;\n    std::cout << (unsigned)~x;\n}",
      "options": [
        "255",
        "4294967295",
        "0",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "~x first promotes uint8_t 0 to int 0, and ~0 is -1 (an int, not an 8-bit 255). Converting that -1 to unsigned yields 4294967295. The trap answer 255 assumes the complement stays in 8 bits; integer promotion makes bitwise ~ operate on a full int, a frequent source of mask bugs."
    },
    {
      "type": "mcq",
      "tag": "reinterpret_cast",
      "question": "Which statement about reinterpret_cast is TRUE?",
      "options": [
        "It can portably convert a double to its integer bit pattern by value",
        "Converting an object pointer to a sufficiently large integer and back yields the original pointer",
        "It performs a numeric value conversion like static_cast",
        "It can safely remove const from a pointer"
      ],
      "answer": 1,
      "explain": "reinterpret_cast<T*>-to-integer-and-back round-tripping through an integer of adequate size (like uintptr_t) is guaranteed to recover the original pointer. It does NOT do numeric value conversion (that is static_cast), cannot remove const (that is const_cast), and does not reinterpret an object's bits by value."
    },
    {
      "type": "code",
      "tag": "Bool",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    std::cout << (true + true) << (2 == 2) + (3 > 1);\n}",
      "options": [
        "21",
        "true1",
        "22",
        "2true"
      ],
      "answer": 2,
      "explain": "Because additive + binds tighter than the stream operator <<, this parses as (cout << (true+true)) << ((2==2)+(3>1)). In arithmetic, bool promotes to int (true->1), so true + true is the int 2, and (2==2)+(3>1) is 1 + 1 = 2. Streamed with no separator, the output is 22. The distractors wrongly assume bools print as 'true'/'false' (default cout formatting prints 1/0, and these operands are already ints) or that + is applied after <<."
    },
    {
      "type": "mcq",
      "tag": "Enum",
      "question": "Given 'enum Color { Red, Green };', which conversion requires an explicit cast?",
      "options": [
        "int n = Green;",
        "Color c = 1;",
        "double d = Red;",
        "if (Green) {}"
      ],
      "answer": 1,
      "explain": "An unscoped enum converts implicitly TO an integer/arithmetic type (so int n = Green, double d = Red, and the boolean context all compile), but converting an int back to the enum type is NOT implicit and needs static_cast<Color>(1). The direction of the built-in conversion is one-way: enum->int is free, int->enum is not."
    },
    {
      "type": "code",
      "tag": "Usual Arith",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    int i = 7;\n    std::cout << i / 2 << ' ' << i / 2.0;\n}",
      "options": [
        "3.5 3.5",
        "3 3.5",
        "3 3",
        "3.5 3"
      ],
      "answer": 1,
      "explain": "i / 2 is int/int, so integer division truncates to 3. In i / 2.0, the literal 2.0 is double, so i is converted to double by the usual arithmetic conversions and the result is 3.5. The single character 2 vs 2.0 changes both the operation and the type of the result."
    },
    {
      "type": "code",
      "tag": "Narrowing",
      "question": "What happens with this brace-initialization?",
      "code": "#include <iostream>\nint main() {\n    double d = 1.0;\n    float f{d};\n    std::cout << f;\n}",
      "options": [
        "Prints 1",
        "Ill-formed: narrowing from double to float",
        "Undefined behavior",
        "Prints 1.0 with a warning only"
      ],
      "answer": 1,
      "explain": "double to float is a narrowing conversion, and inside braces a narrowing conversion from a non-constant-expression is ill-formed regardless of the runtime value. Even though 1.0 fits exactly in a float, the rule is based on the types, not the value, so a conforming compiler rejects it. (A constant expression that is exactly representable would be allowed.)"
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\nint main() {\n    int i = 5;\n    i = i++ + 1;\n    std::cout << i;\n}",
      "options": [
        "Prints 6",
        "Prints 7",
        "Undefined behavior",
        "Prints 5"
      ],
      "answer": 2,
      "explain": "In C++11/14 the store from the assignment to i is unsequenced relative to the side effect of i++ (both modify i), so this is undefined behavior. Any concrete number like 7 assumes a particular evaluation order the standard does not guarantee. (C++17 later sequenced the RHS before the store, but the fundamentals here are C++11/14.)"
    },
    {
      "type": "mcq",
      "tag": "Sequencing",
      "question": "Which of these expressions is guaranteed to have well-defined behavior in C++11?",
      "options": [
        "a[i] = i++;",
        "i = ++i + 2;",
        "int x = i++ && i++;",
        "f(i++, i++);"
      ],
      "answer": 2,
      "explain": "The built-in && operator introduces a sequence point: the left operand (including its side effects) is fully sequenced before the right, so i++ && i++ is well defined. The others read/modify i with unsequenced operations, and comma-separated function arguments are unsequenced relative to each other, giving UB."
    },
    {
      "type": "code",
      "tag": "Precedence",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int x = 2, y = 3;\n    std::cout << (x & y == 2);\n}",
      "options": [
        "0",
        "1",
        "2",
        "Compilation error"
      ],
      "answer": 0,
      "explain": "== has higher precedence than &, so this parses as x & (y == 2). With x=2 and y=3, y==2 is false (0), and 2 & 0 = 0, so it prints 0. The trap is reading it as (x & y) == 2, which would be (2 & 3) == 2 -> 2 == 2 -> 1; always parenthesize bitwise operators mixed with comparisons."
    },
    {
      "type": "code",
      "tag": "Comma",
      "question": "What is the value of x?",
      "code": "#include <iostream>\nint main() {\n    int x = (1, 2, 3);\n    std::cout << x;\n}",
      "options": [
        "1",
        "3",
        "6",
        "Compilation error"
      ],
      "answer": 1,
      "explain": "The comma operator evaluates each operand left to right and yields the value of the last one, so (1,2,3) is 3. The parentheses are needed because comma has lower precedence than =; without them int x = 1, 2, 3; would be a multi-declaration and fail."
    },
    {
      "type": "code",
      "tag": "Comma",
      "question": "What does this loop print as its final count value?",
      "code": "#include <iostream>\nint main() {\n    int count = 0;\n    for (int i = 0, j = 10; i < j; ++i, --j)\n        ++count;\n    std::cout << count;\n}",
      "options": [
        "5",
        "10",
        "4",
        "Infinite loop"
      ],
      "answer": 0,
      "explain": "i starts at 0, j at 10; each iteration i increases and j decreases via the comma operator in the update. They meet when i==j==5, so the body runs for i=0..4, giving count 5. The comma in ++i, --j is the comma operator sequencing both updates."
    },
    {
      "type": "code",
      "tag": "Short-circuit",
      "question": "How many times is f() called?",
      "code": "#include <iostream>\nbool f() { std::cout << \"f\"; return false; }\nbool g() { std::cout << \"g\"; return true; }\nint main() {\n    if (f() && g()) {}\n}",
      "options": [
        "Only f (prints \"f\")",
        "Only g",
        "Both (prints \"fg\")",
        "Neither"
      ],
      "answer": 0,
      "explain": "&& short-circuits: since f() returns false, the right operand g() is never evaluated, so only \"f\" prints. The trap is assuming both operands of && always run."
    },
    {
      "type": "code",
      "tag": "Short-circuit",
      "question": "What is the output?",
      "code": "#include <iostream>\nint main() {\n    int i = 0;\n    bool b = (i++ > 0) || (i++ > 0) || (i++ > 0);\n    std::cout << i << b;\n}",
      "options": [
        "31",
        "30",
        "21",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "|| short-circuits and each || is a sequence point. First i++ > 0: 0 > 0 is false, i becomes 1. Second i++ > 0: 1 > 0 is true, i becomes 2, and since || is now satisfied the third operand is skipped. So i = 2 and b = true, printing \"21\". Assuming all three increments run (giving 3) is the trap."
    },
    {
      "type": "mcq",
      "tag": "Short-circuit",
      "question": "Replacing || with | in `if (p != nullptr && p->ok())` — what is the danger of writing `if (p != nullptr & p->ok())`?",
      "options": [
        "No difference; & and && behave identically here",
        "& does not short-circuit, so p->ok() runs even when p is null, risking a null dereference",
        "& is a compile error on bool operands",
        "& yields a pointer, not a bool"
      ],
      "answer": 1,
      "explain": "Bitwise & evaluates both operands unconditionally (no short-circuit), so p->ok() is called even when p is null, causing undefined behavior. Logical && is the guard that skips the right side when p is null. Both compile fine on bools, which is why the bug is easy to miss."
    },
    {
      "type": "code",
      "tag": "Ternary",
      "question": "Does this compile, and what does it print?",
      "code": "#include <iostream>\nint main() {\n    int x = 5;\n    std::cout << (x > 0 ? \"pos\" : x);\n}",
      "options": [
        "Prints \"pos\"",
        "Prints 5",
        "Compilation error",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "The two branches of ?: must have a common type. \"pos\" is const char[4] (decaying to const char*) and x is int; there is no implicit conversion between them, so the program fails to compile. Mixing a string literal and an int in a conditional is a classic type-mismatch trap."
    },
    {
      "type": "code",
      "tag": "Ternary",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int a = 1, b = 2, c = 3;\n    std::cout << (a ? b : c ? 4 : 5);\n}",
      "options": [
        "2",
        "3",
        "4",
        "5"
      ],
      "answer": 0,
      "explain": "?: is right-associative, so this parses as a ? b : (c ? 4 : 5). Since a is truthy (1), the result is b = 2; the nested conditional is never evaluated. Misreading it as ((a?b:c)?4:5) is the trap."
    },
    {
      "type": "code",
      "tag": "Post/Pre",
      "question": "What is the output?",
      "code": "#include <iostream>\nint main() {\n    int i = 3;\n    int j = i++;\n    int k = ++i;\n    std::cout << i << j << k;\n}",
      "options": [
        "535",
        "543",
        "533",
        "454"
      ],
      "answer": 0,
      "explain": "j = i++ uses the old value 3 then sets i = 4. k = ++i first makes i = 5 then yields 5, so k = 5. Final values: i = 5, j = 3, k = 5, printing \"535\". Post-increment returns the old value; pre-increment returns the new one."
    },
    {
      "type": "mcq",
      "tag": "Post/Pre",
      "question": "Why is ++it often preferred over it++ for a non-trivial iterator type in a loop?",
      "options": [
        "it++ is undefined behavior on iterators",
        "++it modifies the iterator in place; it++ has no effect",
        "it++ must construct and return a copy of the old iterator, which can be wasteful; ++it avoids that copy",
        "Only ++it advances the iterator; it++ does not"
      ],
      "answer": 2,
      "explain": "Post-increment must return the pre-increment value, so it makes a copy of the iterator before advancing, which is extra work for class-type iterators. Pre-increment advances and returns *this by reference, avoiding the copy. Both do advance the iterator; the difference is the returned value and the copy."
    },
    {
      "type": "code",
      "tag": "Precedence",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int x = 1;\n    std::cout << (x << 1 + 2);\n}",
      "options": [
        "4",
        "6",
        "8",
        "3"
      ],
      "answer": 2,
      "explain": "Additive + has higher precedence than the shift <<, so this is x << (1+2) = 1 << 3 = 8. Reading it as (x<<1)+2 = 4 is the trap. Note the operator << here is the shift operator, not stream insertion, because of the parentheses."
    },
    {
      "type": "code",
      "tag": "Precedence",
      "question": "What is the value printed?",
      "code": "#include <iostream>\nint main() {\n    bool b = true;\n    int x = 4;\n    std::cout << (b ? 1 : 2 + x);\n}",
      "options": [
        "1",
        "3",
        "6",
        "Compilation error"
      ],
      "answer": 0,
      "explain": "?: has lower precedence than +, so the false branch is (2 + x), and the whole thing is b ? 1 : (2+x). b is true, so the result is 1 and 2+x is never computed. Grouping it as (b?1:2)+x = 1+4 = 5 is the misconception."
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "What is the behavior?",
      "code": "#include <iostream>\nint main() {\n    int a[3] = {0,0,0};\n    int i = 0;\n    a[i] = i++;\n    std::cout << a[0] << a[1];\n}",
      "options": [
        "Prints 00",
        "Prints 01",
        "Undefined behavior",
        "Prints 10"
      ],
      "answer": 2,
      "explain": "In C++11/14 the side effect of i++ is unsequenced relative to the use of i in a[i] as the assignment's left-hand index, so which element is written is unspecified and the whole thing is undefined behavior. (C++17 later sequenced the RHS before the LHS, but the standard here is C++11/14.)"
    },
    {
      "type": "code",
      "tag": "Order-eval",
      "question": "Which outputs are possible?",
      "code": "#include <iostream>\nint f() { std::cout << \"1\"; return 0; }\nint g() { std::cout << \"2\"; return 0; }\nint h(int, int) { return 0; }\nint main() {\n    h(f(), g());\n}",
      "options": [
        "Only \"12\"",
        "Only \"21\"",
        "Either \"12\" or \"21\"",
        "Undefined behavior (a data race)"
      ],
      "answer": 2,
      "explain": "The order of evaluation of function arguments is unspecified in C++11/14, so the compiler may call f() then g() or vice versa — both \"12\" and \"21\" are legal. It is not undefined behavior here, though: the two calls do not overlap (no data race), it is simply an unspecified order. (Contrast f(i++, i++), where unsequenced modifications of the same object would be UB.)"
    },
    {
      "type": "mcq",
      "tag": "Bitwise",
      "question": "For an int flags, what does `flags & MASK == MASK` test, given MASK is a nonzero constant?",
      "options": [
        "Whether all bits of MASK are set in flags",
        "flags & (MASK == MASK), i.e. flags & 1, testing only the low bit of flags",
        "(flags & MASK) == MASK, the intended all-bits-set test",
        "Always true"
      ],
      "answer": 1,
      "explain": "== has higher precedence than &, so it groups as flags & (MASK == MASK). MASK==MASK is always true (1), so the expression reduces to flags & 1 — testing only the lowest bit, not the mask. The intended (flags & MASK) == MASK requires explicit parentheses; this precedence gotcha is a frequent bug."
    },
    {
      "type": "code",
      "tag": "Comma",
      "question": "What is the value of n?",
      "code": "#include <iostream>\nint main() {\n    int n;\n    n = 2, 3;\n    std::cout << n;\n}",
      "options": [
        "2",
        "3",
        "5",
        "Compilation error"
      ],
      "answer": 0,
      "explain": "= has higher precedence than the comma operator, so this parses as (n = 2), 3. n is assigned 2, then 3 is evaluated and discarded. The comma operator's result (3) is thrown away because it isn't used, so n is 2."
    },
    {
      "type": "code",
      "tag": "Bitwise",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    int x = 6;\n    std::cout << (!x) << (~x);\n}",
      "options": [
        "0-7",
        "0-6",
        "1-7",
        "0 4294967289"
      ],
      "answer": 0,
      "explain": "!x is logical NOT: x is nonzero so !x is 0. ~x is bitwise NOT: for two's-complement int, ~6 = -7. So it prints \"0\" then \"-7\" => \"0-7\". Confusing ! (logical, yields bool) with ~ (bitwise, flips all bits) is the core trap."
    },
    {
      "type": "code",
      "tag": "Ternary",
      "question": "What does this print, and is it valid?",
      "code": "#include <iostream>\nint main() {\n    int a = 1, b = 2;\n    (a < b ? a : b) = 99;\n    std::cout << a << ' ' << b;\n}",
      "options": [
        "99 2",
        "1 99",
        "Compilation error",
        "1 2"
      ],
      "answer": 0,
      "explain": "When both branches are lvalues of the same type, the conditional expression is itself an lvalue, so it can be assigned to. a<b is true, so the expression refers to a, and a becomes 99; b is unchanged. Many assume ?: always yields a non-assignable rvalue, which is the misconception here."
    },
    {
      "type": "code",
      "tag": "Short-circuit",
      "question": "What is the final value of count?",
      "code": "#include <iostream>\nint main() {\n    int count = 0;\n    bool ok = (count++ > 5) && (count++ > 5);\n    std::cout << count << ok;\n}",
      "options": [
        "10",
        "20",
        "11",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "count++ > 5: 0>5 is false, and count becomes 1. Because && short-circuits on a false left operand, the second count++ never runs, so count ends at 1 and ok is false (0), printing \"10\". Assuming both increments execute (giving 2) is the trap."
    },
    {
      "type": "mcq",
      "tag": "Assoc",
      "question": "Given `a = b = c = 0;` with three ints, why does this compile and work?",
      "options": [
        "Assignment is left-associative, so a is assigned first",
        "Assignment is right-associative, so c=0 runs first, yielding an lvalue chained leftward",
        "The comma operator sequences the assignments",
        "It only works because all values are 0"
      ],
      "answer": 1,
      "explain": "The assignment operator is right-associative, so it groups as a = (b = (c = 0)). Each assignment returns a reference to its left operand, letting the result feed the next assignment leftward. Left-associativity would try (a=b)=c=0 conceptually and is simply not how = groups."
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "What is the behavior of this expression statement?",
      "code": "#include <iostream>\nint main() {\n    int i = 1;\n    i = ++i + i++;\n    std::cout << i;\n}",
      "options": [
        "Prints 4",
        "Prints 5",
        "Undefined behavior",
        "Prints 3"
      ],
      "answer": 2,
      "explain": "i is modified by ++i, by i++, and by the assignment, with these modifications unsequenced relative to one another and to the reads, so the expression has undefined behavior (this remains UB even in C++17, since ++i and i++ are unsequenced operands of +). Any specific value like 4 assumes an evaluation order the standard does not define."
    },
    {
      "type": "code",
      "tag": "Precedence",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int x = 10;\n    std::cout << (x - 2 > 5 == true);\n}",
      "options": [
        "0",
        "1",
        "3",
        "Compilation error"
      ],
      "answer": 1,
      "explain": "Precedence order: - then > then ==. So it is ((x-2) > 5) == true = (8 > 5) == true = true == true = 1. The relational and equality operators produce bool/int here; chaining them relies on precedence, and misreading the grouping is the trap."
    },
    {
      "type": "code",
      "tag": "Order-eval",
      "question": "What can this print?",
      "code": "#include <iostream>\nint main() {\n    int i = 0;\n    std::cout << i++ << \" \" << i++ << \" \" << i++;\n}",
      "options": [
        "Always \"0 1 2\"",
        "Always \"2 1 0\"",
        "Any permutation of 0,1,2 depending on the compiler",
        "Undefined behavior in C++11/14"
      ],
      "answer": 3,
      "explain": "In C++11/14 the operands of the chained operator<< are unsequenced with respect to each other while all modifying i, which is undefined behavior — not merely an unspecified order. (C++17 fixed the left-to-right sequencing so it would print \"0 1 2\", but the fundamentals here are C++11/14.)"
    },
    {
      "type": "code",
      "tag": "Bitwise",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    unsigned int x = 1;\n    std::cout << (x << 31 >> 31);\n}",
      "options": [
        "1",
        "0",
        "Undefined behavior",
        "2147483648"
      ],
      "answer": 0,
      "explain": "Shift operators are left-associative, so this is (x << 31) >> 31. For a 32-bit unsigned int, 1<<31 sets the top bit, and the logical >>31 brings it back to 1. Because x is unsigned, no sign-bit or UB issues arise (a signed 1<<31 would be problematic)."
    },
    {
      "type": "mcq",
      "tag": "Ternary",
      "question": "In `int x = cond ? 1 : 2.0;`, what is the type of the conditional expression before the assignment to x?",
      "options": [
        "int, because x is int",
        "double, because the branches are brought to a common type (int and double -> double)",
        "It is ill-formed due to mismatched branch types",
        "bool"
      ],
      "answer": 1,
      "explain": "The ?: operator computes a common type for its two branches via usual arithmetic conversions; int and double yield double, so the expression is double even when cond is true and the value is 1.0. It is then converted to int on assignment. The result type does not depend on the target variable x."
    },
    {
      "type": "code",
      "tag": "Sequencing",
      "question": "Is this well defined, and what does it print?",
      "code": "#include <iostream>\nint main() {\n    int i = 0;\n    int x = (i = 1) + (i = 2);\n    std::cout << x << i;\n}",
      "options": [
        "Prints 32",
        "Prints 33",
        "Undefined behavior",
        "Prints 42"
      ],
      "answer": 2,
      "explain": "Both (i=1) and (i=2) modify i, and the two assignments are unsequenced relative to each other (+ imposes no ordering), so this is undefined behavior. Guessing 3 (1+2) and i=2 assumes an order the standard does not provide."
    },
    {
      "type": "code",
      "tag": "Short-circuit",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int x = 0;\n    int r = (x != 0) ? (10 / x) : -1;\n    std::cout << r;\n}",
      "options": [
        "-1",
        "Undefined behavior (division by zero)",
        "0",
        "Compilation error"
      ],
      "answer": 0,
      "explain": "?: evaluates only the chosen branch. Since x != 0 is false, only the false branch (-1) is evaluated and 10/x is never computed, avoiding the division by zero. This mirrors short-circuiting and is a common safe-guard idiom."
    },
    {
      "type": "code",
      "tag": "Bitwise",
      "question": "What is the output?",
      "code": "#include <iostream>\nint main() {\n    int x = 5;\n    if (x & 1 == 1)\n        std::cout << \"odd\";\n    else\n        std::cout << \"even\";\n}",
      "options": [
        "odd",
        "even",
        "Compilation error",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "== binds tighter than &, so the condition is x & (1 == 1) = 5 & 1 = 1, which is truthy, so it prints \"odd\". It happens to give the right answer only because 1==1 is 1; the intended parity test (x & 1) == 1 needs explicit parentheses, and for a mask other than 1 the missing parentheses would break it."
    },
    {
      "type": "mcq",
      "tag": "Sequencing",
      "question": "Which statement about sequence points / sequenced-before in C++11 is correct?",
      "options": [
        "Every operator introduces a sequence point between its operands",
        "The built-in &&, ||, comma, and ?: operators sequence their left operand before the right",
        "The + and * operators sequence their left operand before their right operand",
        "Function arguments are always evaluated left to right"
      ],
      "answer": 1,
      "explain": "The built-in &&, ||, comma operator, and the condition of ?: all sequence the left operand (and its side effects) before the right operand, which is why i++ && i++ is well defined. Arithmetic operators like + impose no such ordering, and function-argument order is unspecified."
    },
    {
      "type": "code",
      "tag": "Comma",
      "question": "What does f receive and print?",
      "code": "#include <iostream>\nvoid f(int a) { std::cout << a; }\nint main() {\n    f((1, 2, 3));\n}",
      "options": [
        "1",
        "3",
        "123",
        "Compilation error"
      ],
      "answer": 1,
      "explain": "The extra parentheses turn 1,2,3 into a single comma-operator expression whose value is the last operand, 3, so f receives 3. Without the inner parentheses, f(1,2,3) would be a call with three arguments and fail to compile since f takes one parameter."
    },
    {
      "type": "code",
      "tag": "Switch",
      "question": "What does this program print?",
      "code": "#include <iostream>\nint main() {\n    int x = 2;\n    switch (x) {\n        case 1: std::cout << \"1\";\n        case 2: std::cout << \"2\";\n        case 3: std::cout << \"3\";\n        default: std::cout << \"D\";\n    }\n}",
      "options": [
        "2",
        "23",
        "23D",
        "2D"
      ],
      "answer": 2,
      "explain": "A switch jumps to the matching label and then falls through every following case until a break or the closing brace. With no break statements at all, execution flows from case 2 through case 3 and into default, printing \"23D\". Choosing \"2\" assumes each case is self-contained like an if/else, which is the classic fallthrough trap."
    },
    {
      "type": "code",
      "tag": "Jump-Init",
      "question": "What is the result of compiling and running this code?",
      "code": "#include <iostream>\nint main() {\n    int x = 1;\n    switch (x) {\n        case 1:\n            int y = 10;\n            std::cout << y;\n            break;\n        case 2:\n            std::cout << \"two\";\n            break;\n    }\n}",
      "options": [
        "Prints 10",
        "Does not compile",
        "Prints two",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "y is declared with an initializer, but its scope extends to the closing brace of the switch, so the case 2 label sits inside y's scope. A jump to case 2 would bypass y's initialization, which the standard forbids, making the whole switch ill-formed even though we enter case 1. Wrapping case 1's body in its own { } braces would fix it by limiting y's scope."
    },
    {
      "type": "mcq",
      "tag": "Jump-Init",
      "question": "A switch case declares a local variable with an initializer and the compiler rejects the switch because a later case can jump over that initialization. What is the correct fix?",
      "options": [
        "Add a break before the later case",
        "Enclose the offending case's body in its own { } block",
        "Move the declaration above the switch",
        "Mark the variable const"
      ],
      "answer": 1,
      "explain": "The error is that the variable's scope reaches the later label. Enclosing the case body in a nested block ends that scope before the next label, so no jump crosses a live initialization. A break does not help because the jump-over rule is a compile-time scoping check, not about runtime flow; moving the declaration above the switch changes semantics and is not the idiomatic fix."
    },
    {
      "type": "code",
      "tag": "Cond-Scope",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int i = 0;\n    while (int v = 5 - i) {\n        std::cout << v;\n        ++i;\n    }\n}",
      "options": [
        "54321",
        "543210",
        "5 then infinite loop",
        "5"
      ],
      "answer": 0,
      "explain": "A variable declared in a while condition is re-declared and re-evaluated on every iteration, and the loop continues while its value is truthy. v takes 5,4,3,2,1 (printed) and then 0, which is falsy and ends the loop, so 0 is never printed. Expecting \"543210\" forgets that the zero value that stops the loop is not executed in the body."
    },
    {
      "type": "mcq",
      "tag": "Cond-Scope",
      "question": "A variable is declared in the condition of an if statement, e.g. if (Widget* p = find()). Where is p in scope?",
      "options": [
        "Only inside the if (then) branch",
        "Inside both the then branch and the else branch",
        "Only until the end of the condition",
        "Throughout the enclosing function"
      ],
      "answer": 1,
      "explain": "A name declared in an if condition is in scope for the entire if statement, which includes both the then and the else branch, and then goes out of scope. This is why the pattern is useful: you can test the pointer and also handle the failure case using the same name. Restricting it to only the then branch is a common misconception."
    },
    {
      "type": "code",
      "tag": "Range-For",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    for (auto x : v) x *= 10;\n    for (auto n : v) std::cout << n << \" \";\n}",
      "options": [
        "10 20 30 ",
        "1 2 3 ",
        "0 0 0 ",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "Declaring the loop variable as auto (by value) makes x a fresh copy of each element, so x *= 10 mutates the copy and the original vector is untouched, printing \"1 2 3 \". To modify the container you must use a reference: for (auto& x : v). This copy-vs-reference distinction is the single most common range-for bug."
    },
    {
      "type": "code",
      "tag": "Range-For",
      "question": "What happens with this code?",
      "code": "#include <vector>\nint main() {\n    std::vector<bool> v{true, false, true};\n    for (auto& b : v)\n        b = !b;\n}",
      "options": [
        "Flips every element in place",
        "Does not compile",
        "Compiles but leaves v unchanged",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "std::vector<bool> is specialized to pack bits, so dereferencing its iterator yields a temporary proxy object (a prvalue), not a real bool&. Binding that prvalue to a non-const lvalue reference auto& is ill-formed, so this does not compile. The idiomatic fix is auto&& b, a forwarding reference that happily binds the proxy and still lets you assign through it."
    },
    {
      "type": "mcq",
      "tag": "Range-For",
      "question": "Why is for (auto&& x : container) often recommended as a generic default for range-based for loops?",
      "options": [
        "It always makes a copy, which is safest",
        "It binds to both real references and proxy prvalues, and can modify elements",
        "It is faster than auto& for all element types",
        "It automatically makes elements const"
      ],
      "answer": 1,
      "explain": "auto&& is a forwarding reference: it binds to lvalue references (like int& from a normal vector) and also to the temporary proxy prvalues returned by containers such as vector<bool>, while still allowing modification through the binding. auto& fails on proxy containers and auto copies. auto&& does not add const and is not inherently faster than auto& for normal containers; its virtue is genericity."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "A struct returned by value exposes an inner container by reference. What is the behavior of this loop?",
      "code": "#include <vector>\nstruct Bag {\n    std::vector<int> items{1, 2, 3};\n    const std::vector<int>& get() const { return items; }\n};\nBag makeBag() { return Bag{}; }\nint main() {\n    for (int x : makeBag().get()) {\n        (void)x;\n    }\n}",
      "options": [
        "Well-defined: iterates 1,2,3",
        "Undefined behavior: iterates a destroyed temporary",
        "Does not compile",
        "Well-defined because of lifetime extension"
      ],
      "answer": 1,
      "explain": "Range-based for binds the range expression to a hidden auto&& reference, and lifetime extension applies only when that reference binds directly to a temporary. Here it binds to the reference returned by get(), not to the Bag temporary itself, so the temporary Bag is destroyed at the end of the initializing full-expression and the loop iterates a dangling container (UB in C++11 through C++20). Iterating over makeBag() directly would be safe; drilling into a member via a returning function is the trap, which P2718 fixed only in C++23."
    },
    {
      "type": "code",
      "tag": "Do-While",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int i = 10;\n    do {\n        std::cout << i << \" \";\n    } while (i < 5);\n}",
      "options": [
        "Nothing",
        "10 ",
        "10 10 10 ... (infinite)",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "A do-while always executes its body at least once because the condition is tested only after the body runs. The body prints \"10 \", then i < 5 is false, so the loop stops. Answering \"Nothing\" applies while-loop reasoning (test first) to a do-while, which is exactly the mistake this construct invites."
    },
    {
      "type": "code",
      "tag": "Do-While",
      "question": "Does this compile?",
      "code": "#include <iostream>\nint main() {\n    int i = 0;\n    do {\n        int step = 2;\n        i += step;\n    } while (i < step);\n    std::cout << i;\n}",
      "options": [
        "Yes, prints 2",
        "Yes, prints 10",
        "No, step is not in scope in the condition",
        "No, do-while cannot use <"
      ],
      "answer": 2,
      "explain": "The do-while condition is evaluated outside the loop body's block scope, so step, declared inside the braces, is not visible there and the code fails to compile. This surprises people because in a normal while/for the body appears after the condition; in a do-while the condition trails the block yet still cannot see the block's locals."
    },
    {
      "type": "mcq",
      "tag": "Do-While",
      "question": "Which statement about the condition of a do-while loop is true?",
      "options": [
        "It may contain a variable declaration, like a while condition",
        "It must be a plain expression; it cannot be a declaration",
        "It is optional and defaults to true",
        "It is evaluated before the first iteration"
      ],
      "answer": 1,
      "explain": "Unlike if, while, for, and switch, whose conditions may be a declaration, the do-while grammar is do statement while ( expression ), so its condition is strictly an expression and cannot declare a variable. It is also mandatory and, crucially, evaluated after each iteration rather than before the first."
    },
    {
      "type": "code",
      "tag": "Continue",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int i = 0;\n    do {\n        ++i;\n        if (i == 2) continue;\n        std::cout << i;\n    } while (i < 4);\n}",
      "options": [
        "134",
        "1234",
        "1 then infinite loop",
        "124"
      ],
      "answer": 0,
      "explain": "In a do-while, continue jumps to the condition test at the bottom, not to the top of the body. When i becomes 2 the print is skipped, but ++i already ran and the condition is re-checked normally, so i proceeds to 3 and 4. The output is \"134\"; there is no infinite loop because ++i executes before the continue."
    },
    {
      "type": "code",
      "tag": "Goto",
      "question": "What is the result of this program?",
      "code": "#include <iostream>\nint main() {\n    int n = 0;\n    goto skip;\n    int x = 10;\nskip:\n    std::cout << n;\n}",
      "options": [
        "Prints 0",
        "Prints 10",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "x has an initializer and its scope runs to the end of the block, so the label skip lies inside x's scope. The goto jumps from a point before x's declaration into that scope, bypassing the initialization, which the standard makes ill-formed. It does not compile, regardless of the fact that x is never used."
    },
    {
      "type": "mcq",
      "tag": "Goto",
      "question": "A goto jumps forward, skipping past the declaration of a local variable. In which case is the jump legal?",
      "options": [
        "When the variable is a class type with a user-provided constructor",
        "When the variable is a scalar declared without an initializer",
        "When the variable is declared const",
        "Never; forward gotos over declarations are always ill-formed"
      ],
      "answer": 1,
      "explain": "The rule forbids transferring control into the scope of a variable only when that entry would bypass a non-vacuous initialization. A scalar (like int x;) declared without an initializer has vacuous initialization, so jumping over it is allowed. A class type with a user-provided constructor, or any variable with an initializer, has a real initialization the jump cannot skip."
    },
    {
      "type": "code",
      "tag": "Assignment",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int x = 0;\n    if (x = 5)\n        std::cout << \"T\";\n    else\n        std::cout << \"F\";\n    std::cout << x;\n}",
      "options": [
        "F0",
        "T5",
        "T0",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "x = 5 is an assignment, not a comparison; it stores 5 into x and yields 5, which is truthy, so the then branch runs and x is now 5, printing \"T5\". This is the classic = versus == bug: it compiles (usually with a warning) and silently takes the wrong branch. \"F0\" assumes a comparison against 0."
    },
    {
      "type": "code",
      "tag": "Unsigned",
      "question": "What is the behavior of this loop?",
      "code": "#include <iostream>\nint main() {\n    for (unsigned i = 3; i >= 0; --i)\n        std::cout << i << \" \";\n}",
      "options": [
        "Prints 3 2 1 0 then stops",
        "Prints 3 2 1 then stops",
        "Runs forever",
        "Does not compile"
      ],
      "answer": 2,
      "explain": "An unsigned value is never negative, so i >= 0 is always true. After printing 0, --i wraps i around to UINT_MAX instead of going below zero, and the loop never terminates. Expecting it to stop after 0 assumes signed behavior; with unsigned counters counting down to and past zero is a classic infinite-loop trap."
    },
    {
      "type": "code",
      "tag": "Break",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    for (int i = 0; i < 3; ++i) {\n        switch (i) {\n            case 1: break;\n            default: std::cout << i;\n        }\n        std::cout << \"-\";\n    }\n}",
      "options": [
        "0--2-",
        "02",
        "0-",
        "0-2-"
      ],
      "answer": 0,
      "explain": "A break inside a switch terminates only the switch, not the enclosing for loop. When i is 1, case 1's break exits the switch (skipping the print of i), but control still reaches the \"-\" after the switch and the loop continues. So iterations print \"0-\", \"-\", \"2-\", giving \"0--2-\". Assuming break leaves the loop is the core mistake."
    },
    {
      "type": "code",
      "tag": "Iter-Invalidation",
      "question": "What is the behavior of this loop?",
      "code": "#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    for (int x : v) {\n        if (x == 2) v.push_back(99);\n        std::cout << x;\n    }\n}",
      "options": [
        "Prints 12399",
        "Prints 123",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 2,
      "explain": "Range-based for caches begin and end iterators before the loop; calling push_back may reallocate the vector's storage, invalidating those iterators (and the reference the loop dereferences). Continuing to iterate afterward is undefined behavior, even if it happens to print something on one run. Modifying the size of a container you are ranging over is a well-known trap."
    },
    {
      "type": "code",
      "tag": "Switch",
      "question": "Does this compile, and if so what does it do?",
      "code": "#include <string>\n#include <iostream>\nint main() {\n    std::string s = \"go\";\n    switch (s) {\n        case \"go\": std::cout << \"G\"; break;\n        default: std::cout << \"D\";\n    }\n}",
      "options": [
        "Prints G",
        "Prints D",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "A switch condition must have integral or enumeration type (or be convertible to one), and case labels must be integral constant expressions. std::string is neither, and \"go\" is not an integer constant, so the switch does not compile. Newcomers from languages where switch works on strings frequently hit this."
    },
    {
      "type": "code",
      "tag": "Range-For",
      "question": "How many times is makeData() called?",
      "code": "#include <vector>\nstd::vector<int> makeData() {\n    static int calls = 0;\n    ++calls;\n    return {1, 2, 3};\n}\nint main() {\n    for (int x : makeData()) {\n        (void)x;\n    }\n}",
      "options": [
        "Once",
        "Three times (once per element)",
        "Four times (elements plus the end check)",
        "Zero times"
      ],
      "answer": 0,
      "explain": "The range expression is evaluated exactly once: it is bound to a hidden reference at the start of the loop, and begin/end are taken from that single object. Since makeData() returns a temporary that the reference binds to directly, its lifetime is extended for the whole loop, so it is called just once. Believing it is re-evaluated each iteration is a misconception about how range-for expands."
    },
    {
      "type": "mcq",
      "tag": "Control-Flow",
      "question": "Inside deeply nested loops, you want to leave BOTH the inner and outer loop at once. Which is the most direct standard mechanism?",
      "options": [
        "A single break exits all enclosing loops",
        "break exits only the innermost loop; a goto to a label after the outer loop is a direct escape",
        "continue with a label",
        "return is the only way to exit two loops"
      ],
      "answer": 1,
      "explain": "C++ has no labeled break, so a plain break exits only the innermost enclosing loop or switch. To bail out of multiple nested loops at once, a goto that jumps to a label placed just after the outer loop is the direct built-in tool (alternatives include a flag or extracting the loops into a function and using return). Assuming break unwinds all loops is a habit carried over from languages with labeled break."
    },
    {
      "type": "code",
      "tag": "Range-For",
      "question": "What does this print, and is it efficient?",
      "code": "#include <iostream>\n#include <string>\n#include <vector>\nint main() {\n    std::vector<std::string> names{\"amy\", \"bob\"};\n    for (std::string s : names)\n        std::cout << s[0];\n}",
      "options": [
        "Prints ab, copying each string",
        "Prints ab, without copying",
        "Does not compile",
        "Prints the addresses"
      ],
      "answer": 0,
      "explain": "The loop prints \"ab\", but declaring s as std::string (by value) copies each element on every iteration, which is wasteful for read-only access. The idiomatic form is for (const std::string& s : names), which observes each element through a reference and copies nothing. The output is the same; the hidden cost is the point."
    },
    {
      "type": "code",
      "tag": "Switch",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    for (int i = 0; i < 4; ++i) {\n        switch (i) {\n            case 0:\n            case 1:\n                std::cout << \"L\";\n                break;\n            case 2:\n                std::cout << \"M\";\n            default:\n                std::cout << \"H\";\n        }\n    }\n}",
      "options": [
        "LLMH",
        "LLMHH",
        "LLH",
        "LMH"
      ],
      "answer": 1,
      "explain": "Empty case 0 stacks onto case 1 (both print \"L\"), so i=0 and i=1 each print \"L\". For i=2, case 2 prints \"M\" but has no break, so it falls through into default and also prints \"H\", giving \"MH\". For i=3, default prints \"H\". Concatenated: \"LL\" + \"MH\" + \"H\" = \"LLMHH\". Forgetting the fallthrough from case 2 into default yields the wrong \"LLMH\"."
    },
    {
      "type": "code",
      "tag": "Scoped",
      "question": "Does this compile, and if so what does it print?",
      "code": "#include <iostream>\nenum class Color { Red, Green, Blue };\nint main() {\n    Color c = Color::Green;\n    int x = c + 1;\n    std::cout << x;\n}",
      "options": [
        "Prints 2",
        "Prints 1",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "A scoped enum (enum class) does NOT implicitly convert to an integer, so `c + 1` is ill-formed. You would need `static_cast<int>(c) + 1`. The trap is assuming enum class behaves like a plain enum, which would give 2."
    },
    {
      "type": "code",
      "tag": "Unscoped",
      "question": "What does this program print?",
      "code": "#include <iostream>\nenum Direction { North, East, South, West };\nint main() {\n    Direction d = South;\n    std::cout << d + West;\n}",
      "options": [
        "Compilation error",
        "2",
        "5",
        "West"
      ],
      "answer": 2,
      "explain": "Unscoped enums implicitly convert to their underlying integer values: South is 2 and West is 3, so `d + West` is 2 + 3 = 5. Unlike enum class, unscoped enums decay to int in arithmetic, which is exactly the implicit-conversion pitfall."
    },
    {
      "type": "mcq",
      "tag": "Underlying",
      "question": "For an unscoped enum with no fixed underlying type, e.g. `enum E { A = 0, B = 100000 };`, what does the standard guarantee about its underlying type?",
      "options": [
        "It is always int",
        "It is implementation-defined, but large enough to hold all enumerators",
        "It is always unsigned int",
        "It is always the smallest type, char"
      ],
      "answer": 1,
      "explain": "For an unscoped enum without a fixed underlying type, the implementation chooses an integral type that can represent all enumerator values; it need not be int. A scoped enum, by contrast, defaults to int. Assuming it is always int is the common mistake."
    },
    {
      "type": "code",
      "tag": "Underlying",
      "question": "What is the value of sizeof(Flag) most portably guaranteed to be here?",
      "code": "#include <cstdint>\nenum class Flag : std::uint8_t { On, Off };",
      "options": [
        "4",
        "1",
        "Implementation-defined",
        "2"
      ],
      "answer": 1,
      "explain": "With an explicit fixed underlying type of uint8_t, the enum has the same size as uint8_t, which is exactly 1 byte. Specifying the underlying type is the reliable way to control an enum's size; without it, the size is not fixed."
    },
    {
      "type": "code",
      "tag": "Union",
      "question": "What is the behavior of reading b.d after writing b.i?",
      "code": "#include <iostream>\nunion Bits { int i; double d; };\nint main() {\n    Bits b;\n    b.i = 42;\n    std::cout << b.d;\n}",
      "options": [
        "Prints 42.0",
        "Prints 42",
        "Undefined behavior",
        "Always prints 0"
      ],
      "answer": 2,
      "explain": "In C++ writing one union member and then reading a different, non-active member (type punning) is undefined behavior; only the last-written member is the active one. C permits this pattern, but C++ does not, which is a frequent portability trap."
    },
    {
      "type": "mcq",
      "tag": "Union",
      "question": "Which statement about the 'active member' of a union is correct?",
      "options": [
        "All members are active simultaneously since they share storage",
        "At most one member is active at a time; it is the one most recently written",
        "The first-declared member is always the active one",
        "The largest member is always active"
      ],
      "answer": 1,
      "explain": "A union holds only one value at a time; the active member is whichever was most recently assigned. Although members share storage, the object model tracks a single active member, and accessing any other is UB (barring the common-initial-sequence rule for standard-layout structs)."
    },
    {
      "type": "code",
      "tag": "Alias",
      "question": "Are these two aliases equivalent in meaning?",
      "code": "typedef int (*FnA)(double);\nusing FnB = int (*)(double);",
      "options": [
        "No, typedef cannot alias function pointers",
        "Yes, both declare the same pointer-to-function type",
        "No, FnB is a reference not a pointer",
        "Only FnB compiles"
      ],
      "answer": 1,
      "explain": "`using` and `typedef` are semantically equivalent for simple aliases; both declare an alias for `int(*)(double)`. The `using` form is often more readable for function pointers and is required for alias templates, but for this case they are identical."
    },
    {
      "type": "mcq",
      "tag": "Alias",
      "question": "What is the key capability that `using` has but `typedef` lacks?",
      "options": [
        "using can alias built-in types; typedef cannot",
        "using can be templated (alias templates); typedef cannot",
        "typedef can only be used inside classes",
        "There is no difference at all"
      ],
      "answer": 1,
      "explain": "Alias templates, e.g. `template<class T> using Vec = std::vector<T>;`, are only expressible with `using`. `typedef` cannot be parameterized by template arguments, which is the main modern reason to prefer `using`."
    },
    {
      "type": "code",
      "tag": "Bitfield",
      "question": "What does this most likely print, and is the value guaranteed?",
      "code": "#include <iostream>\nstruct S { int x : 3; };\nint main() {\n    S s; s.x = 5;\n    std::cout << s.x;\n}",
      "options": [
        "Always 5",
        "-3, and it is guaranteed",
        "-3 or 5 depending on whether int is signed here; implementation-defined",
        "Compilation error"
      ],
      "answer": 2,
      "explain": "A 3-bit field can hold the bit pattern 101 (which is 5), but whether a plain `int` bitfield is signed is implementation-defined, so the retrieved value may be -3 (if signed, 101 = -3 in two's complement) or 5. Relying on plain-int bitfield signedness is a classic bug; use explicit signed/unsigned."
    },
    {
      "type": "code",
      "tag": "Scoped",
      "question": "Does this switch compile cleanly?",
      "code": "enum class State { Idle, Run };\nint f(State s) {\n    switch (s) {\n        case State::Idle: return 0;\n        case State::Run:  return 1;\n    }\n    return -1;\n}",
      "options": [
        "No, you cannot switch on an enum class",
        "Yes, it compiles",
        "No, cases need static_cast to int",
        "Only with a default label"
      ],
      "answer": 1,
      "explain": "You can switch directly on a scoped enum, and case labels use the qualified enumerator names (State::Idle). No cast is needed because the case constants are of the enum type itself. The misconception is that enum class values must be cast to int to be used in a switch."
    },
    {
      "type": "mcq",
      "tag": "Forward",
      "question": "Which forward declaration of an enum is valid in C++11?",
      "options": [
        "enum class E;",
        "enum E;  // unscoped, no underlying type",
        "Both require the full definition; enums cannot be forward-declared",
        "enum E : short and enum class E; only the former"
      ],
      "answer": 0,
      "explain": "`enum class E;` is a valid opaque declaration because a scoped enum has a known underlying type (int) by default. An unscoped enum can only be forward-declared if you specify its underlying type, e.g. `enum E : int;`; `enum E;` alone is ill-formed."
    },
    {
      "type": "code",
      "tag": "Union",
      "question": "What is wrong with this union?",
      "code": "#include <string>\nunion U {\n    int i;\n    std::string s;\n};",
      "options": [
        "Nothing; it compiles and works",
        "It compiles but the compiler implicitly deletes the destructor/other special members, so a naive U u; may not even be usable safely",
        "std::string cannot be a union member ever",
        "It prints garbage"
      ],
      "answer": 1,
      "explain": "When a union has a member with a non-trivial special member function (like std::string's destructor), the union's corresponding special members are implicitly deleted, and you must manage the active member's lifetime manually with placement new and explicit destructor calls. Assuming it 'just works' leads to leaks or crashes."
    },
    {
      "type": "code",
      "tag": "Conversion",
      "question": "What does this print?",
      "code": "#include <iostream>\nenum Fruit { Apple, Banana };\nenum Veg { Carrot, Pea };\nint main() {\n    if (Apple == Carrot) std::cout << \"eq\";\n    else std::cout << \"ne\";\n}",
      "options": [
        "Compilation error: different enum types",
        "Prints ne",
        "Prints eq",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Both unscoped enumerators decay to int: Apple is 0 and Carrot is 0, so the comparison is 0 == 0 and prints 'eq' (C++20 emits a deprecation warning for comparing different enum types, but it still compiles). This silent cross-enum comparison is exactly the type-safety hole that enum class closes (it would refuse to compile)."
    },
    {
      "type": "code",
      "tag": "Sizeof",
      "question": "Assuming int is 4 bytes and 4-byte aligned, what is sizeof(P)?",
      "code": "struct P {\n    char c;\n    int i;\n};",
      "options": [
        "5",
        "8",
        "4",
        "6"
      ],
      "answer": 1,
      "explain": "Alignment padding inserts 3 bytes after the char so that `i` starts at a 4-byte boundary, making the size 8. Assuming sizeof is just the sum of member sizes (5) ignores alignment requirements."
    },
    {
      "type": "code",
      "tag": "Value",
      "question": "What are the values of B and C?",
      "code": "enum E { A = 5, B, C = 2, D };",
      "options": [
        "B=6, C=2, D=3",
        "B=1, C=2, D=3",
        "B=6, C=7, D=8",
        "Compilation error: values decrease"
      ],
      "answer": 0,
      "explain": "An enumerator without an initializer is one more than the previous: after A=5, B=6. C is explicitly 2, then D=3. Enum values may repeat or decrease; there is no requirement that they be unique or increasing, so re-using 2 is legal."
    },
    {
      "type": "mcq",
      "tag": "Scoped",
      "question": "Which is true about the scope of enumerator names?",
      "options": [
        "Unscoped enum enumerators leak into the surrounding scope; scoped enum enumerators do not",
        "Both leak into the surrounding scope",
        "Neither leaks; both require qualification",
        "Scoped enumerators leak, unscoped do not"
      ],
      "answer": 0,
      "explain": "Unscoped enum enumerators are injected into the enclosing scope, so two unscoped enums with a shared name like `Red` collide. Scoped enum enumerators live inside the enum's scope and must be qualified (Color::Red), which prevents such name clashes."
    },
    {
      "type": "code",
      "tag": "Cast",
      "question": "Is this well-defined and what does it print?",
      "code": "#include <iostream>\nenum class Level : int { Low = 1, High = 2 };\nint main() {\n    Level l = static_cast<Level>(7);\n    std::cout << static_cast<int>(l);\n}",
      "options": [
        "Undefined behavior: 7 is not an enumerator",
        "Prints 7; well-defined because the underlying type is fixed",
        "Compilation error",
        "Prints 2 (clamped to High)"
      ],
      "answer": 1,
      "explain": "When an enum has a fixed underlying type, casting any value representable in that type (like 7) is well-defined even if no enumerator equals it, so it prints 7. For enums WITHOUT a fixed underlying type, a value outside the range of representable values would be UB - that distinction is the gotcha."
    },
    {
      "type": "code",
      "tag": "Union",
      "question": "Is reading u.a.x after writing through u.b.x well-defined?",
      "code": "struct A { int x; float y; };\nstruct B { int x; double z; };\nunion U { A a; B b; };\nint main() {\n    U u; u.b.x = 10;\n    return u.a.x;  // read a.x\n}",
      "options": [
        "Undefined behavior always",
        "Well-defined: reading the common initial sequence member x is allowed",
        "Compilation error",
        "Depends on padding only"
      ],
      "answer": 1,
      "explain": "The common initial sequence rule: if two standard-layout structs in a union share a compatible initial sequence of members, it is permitted to read those shared members through either union member. Here both start with `int x`, so reading u.a.x after writing u.b.x is well-defined. Reading a non-shared member (like y or z) would be UB."
    },
    {
      "type": "mcq",
      "tag": "Underlying",
      "question": "What is the default underlying type of a scoped enum (enum class) with no explicit type?",
      "options": [
        "int",
        "unsigned int",
        "The smallest type that fits the enumerators",
        "char"
      ],
      "answer": 0,
      "explain": "A scoped enum's underlying type defaults to int, regardless of the enumerator values (even if they would fit in a smaller type). This differs from unscoped enums without a fixed type, whose underlying type is implementation-defined and value-dependent."
    },
    {
      "type": "code",
      "tag": "Bool",
      "question": "What does this print?",
      "code": "#include <iostream>\nenum Mode { Off = 0, On = 1 };\nint main() {\n    Mode m = Off;\n    if (!m) std::cout << \"A\";\n    if (m == false) std::cout << \"B\";\n    std::cout << \"end\";\n}",
      "options": [
        "Aend",
        "ABend",
        "Bend",
        "Compilation error"
      ],
      "answer": 1,
      "explain": "Off is 0, which converts to int/bool as false, so `!m` is true (prints A) and `m == false` compares 0 == 0 (prints B), giving 'ABend'. The implicit enum-to-bool/int conversions of unscoped enums allow these expressions; an enum class would reject both without casts."
    },
    {
      "type": "code",
      "tag": "Init",
      "question": "Which line fails to compile in C++17?",
      "code": "enum class Speed : int { Slow = 1, Fast = 2 };\nint main() {\n    Speed s1 = Speed::Slow;   // 1\n    Speed s2 = 2;             // 2\n    Speed s3{1};              // 3\n    int   n  = int(s1);       // 4\n}",
      "options": [
        "Line 1",
        "Line 2",
        "Line 3",
        "Line 4"
      ],
      "answer": 1,
      "explain": "Line 2 fails: an int does not implicitly convert to a scoped enum (you need static_cast). Line 1 (enum-to-enum) is fine; Line 3 `Speed s3{1}` is well-formed because direct-list-initialization of a scoped enum with a fixed underlying type from an integer is permitted since C++17, with a narrowing check that 1 passes; Line 4 is an explicit conversion to int. (Note: in C++11/14, Line 3 would ALSO fail, since that list-init form was only added in C++17 - which is why the standard version matters here.)"
    },
    {
      "type": "mcq",
      "tag": "Alias",
      "question": "Given `using Byte = unsigned char;`, what is Byte at the type-system level?",
      "options": [
        "A brand-new distinct type not interchangeable with unsigned char",
        "An alias — exactly the same type as unsigned char",
        "A subclass of unsigned char",
        "A typedef only valid for one translation unit"
      ],
      "answer": 1,
      "explain": "A `using` alias (like typedef) creates a synonym, not a new type; Byte and unsigned char are the same type and are fully interchangeable, including for overload resolution. If you need a genuinely distinct type, you must wrap it in a struct/class or use an enum class."
    },
    {
      "type": "code",
      "tag": "Overflow",
      "question": "For this enum without a fixed underlying type, is the cast well-defined?",
      "code": "enum E { A = 0, B = 1 };\nint main() {\n    E e = static_cast<E>(5);\n    return static_cast<int>(e);\n}",
      "options": [
        "Well-defined; the range covers 0..7 so 5 is representable",
        "Undefined behavior; 5 is outside the enum's representable range",
        "Compilation error",
        "Always returns 1"
      ],
      "answer": 1,
      "explain": "For an unscoped enum without a fixed underlying type, the representable range is fixed by the enumerators: the smallest bit-field holding all values. With enumerators 0 and 1, that is a single bit, so the range is only 0..1 - NOT 0..7. Casting an out-of-range value like 5 to such an enum is undefined behavior. Had the enum had a fixed underlying type, or an enumerator large enough to make 5 representable, the cast would be well-defined."
    }
  ]
};

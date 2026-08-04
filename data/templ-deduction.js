/* ===== C++ Templates — Template Argument Deduction & CTAD ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["templ-deduction"] = {
  title: "C++ Templates — Template Argument Deduction & CTAD",
  subtitle: "Deduced vs non-deduced contexts, decay, reference collapsing, forwarding references, braced-init traps, auto vs template deduction and C++17 CTAD.",
  crumb: "C++ Templates",
  questions: [
    {
      "type": "code",
      "tag": "Reference Collapsing",
      "question": "For the call below, what type does T deduce to?",
      "code": "template<class T> void f(T&& x);\nint i = 0;\nf(i);",
      "options": ["int", "int&", "int&&", "const int&"],
      "answer": 1,
      "explain": "With a forwarding reference and an lvalue argument, T deduces to int& (an lvalue reference). Reference collapsing then makes the parameter int& & -> int&."
    },
    {
      "type": "code",
      "tag": "Forwarding Reference",
      "question": "For the call below, what type does T deduce to?",
      "code": "template<class T> void f(T&& x);\nf(42);",
      "options": ["int", "int&", "int&&", "const int"],
      "answer": 0,
      "explain": "For an rvalue argument, T deduces to the plain type int, so the parameter becomes int&&. Only lvalue arguments make T deduce to a reference type."
    },
    {
      "type": "code",
      "tag": "By-Value Decay",
      "question": "Given the call, what type is T?",
      "code": "template<class T> void f(T x);\nconst int ci = 0;\nf(ci);",
      "options": ["const int", "int", "const int&", "int&"],
      "answer": 1,
      "explain": "For a by-value parameter the argument decays: top-level const (and volatile) are dropped. So T is int, not const int."
    },
    {
      "type": "code",
      "tag": "Array Decay",
      "question": "What type is T deduced to here?",
      "code": "template<class T> void f(T x);\nint a[10];\nf(a);",
      "options": ["int[10]", "int*", "int(&)[10]", "int**"],
      "answer": 1,
      "explain": "A by-value parameter causes array-to-pointer decay, so T is int*. The array size is lost."
    },
    {
      "type": "code",
      "tag": "Array By Reference",
      "question": "What type is T deduced to here?",
      "code": "template<class T> void f(T& x);\nint a[10];\nf(a);",
      "options": ["int*", "int[10]", "int(&)[10]", "int"],
      "answer": 1,
      "explain": "A reference parameter prevents decay, so T deduces to int[10] and the parameter is int(&)[10]. The bound is preserved."
    },
    {
      "type": "code",
      "tag": "Braced Init",
      "question": "Does this compile, and if so what is T?",
      "code": "template<class T> void f(T x);\nf({1, 2, 3});",
      "options": ["T = std::initializer_list<int>", "T = int[3]", "Does not compile: T cannot be deduced", "T = int"],
      "answer": 2,
      "explain": "A braced-init-list has no type, so a bare template parameter T is a non-deduced context here. Deduction fails and the code is ill-formed."
    },
    {
      "type": "code",
      "tag": "Initializer List",
      "question": "What is T for this call?",
      "code": "template<class T> void f(std::initializer_list<T> x);\nf({1, 2, 3});",
      "options": ["int", "std::initializer_list<int>", "int[3]", "Deduction fails"],
      "answer": 0,
      "explain": "When the parameter is std::initializer_list<T>, T is deduced from the element type of the braced list, giving T = int."
    },
    {
      "type": "code",
      "tag": "Auto Braced",
      "question": "What is the type of x?",
      "code": "auto x = {42};",
      "options": ["int", "std::initializer_list<int>", "int[1]", "Ill-formed"],
      "answer": 1,
      "explain": "Copy-list-initialization with auto deduces std::initializer_list<int>, even for a single element. This is a special auto-only rule."
    },
    {
      "type": "code",
      "tag": "Auto Direct Init",
      "question": "In C++17, what is the type of x?",
      "code": "auto x{42};",
      "options": ["std::initializer_list<int>", "int", "int[1]", "Ill-formed"],
      "answer": 1,
      "explain": "Since C++17, direct-list-initialization 'auto x{42}' with a single element deduces int (not initializer_list). Copy-list form auto x = {42} still gives initializer_list."
    },
    {
      "type": "code",
      "tag": "decltype(auto)",
      "question": "What is the type of x?",
      "code": "int i = 0;\ndecltype(auto) x = (i);",
      "options": ["int", "int&", "int&&", "const int"],
      "answer": 1,
      "explain": "decltype of a parenthesized lvalue expression (i) yields int&, so decltype(auto) x is int&. Without parentheses it would be int."
    },
    {
      "type": "code",
      "tag": "Perfect Forwarding",
      "question": "Which overload of g is ultimately called?",
      "code": "void g(int&);\nvoid g(int&&);\ntemplate<class T> void f(T&& x) { g(std::forward<T>(x)); }\nint i = 0;\nf(i);",
      "options": ["g(int&)", "g(int&&)", "Ambiguous", "Neither compiles"],
      "answer": 0,
      "explain": "For lvalue i, T = int&, so std::forward<int&>(x) yields an lvalue and g(int&) is chosen. Forwarding preserves the value category."
    },
    {
      "type": "code",
      "tag": "CTAD Basic",
      "question": "With C++17 CTAD, what type is v?",
      "code": "std::vector v{1, 2, 3};",
      "options": ["std::vector<int>", "std::vector<std::initializer_list<int>>", "Ill-formed, need <int>", "std::initializer_list<int>"],
      "answer": 0,
      "explain": "Class template argument deduction uses the implicit guide from the initializer_list constructor, deducing std::vector<int>."
    },
    {
      "type": "code",
      "tag": "CTAD Pair",
      "question": "What type is p under CTAD?",
      "code": "std::pair p{1, 2.5};",
      "options": ["std::pair<int, double>", "std::pair<int, int>", "std::pair<double, double>", "Ill-formed"],
      "answer": 0,
      "explain": "CTAD deduces each element type independently from the arguments: int and double, giving std::pair<int, double>."
    },
    {
      "type": "code",
      "tag": "CTAD Decay",
      "question": "What type does CTAD produce here?",
      "code": "std::pair p{\"hi\", 1};",
      "options": ["std::pair<const char*, int>", "std::pair<const char[3], int>", "std::pair<std::string, int>", "Ill-formed"],
      "answer": 0,
      "explain": "The implicit deduction guides take arguments by value, so the string literal decays to const char*. CTAD gives std::pair<const char*, int>, not std::string."
    },
    {
      "type": "code",
      "tag": "User Guide Decay",
      "question": "What type is w with this guide?",
      "code": "template<class T> struct Box { T v; };\ntemplate<class T> Box(T) -> Box<T>;\nBox w{\"hey\"};",
      "options": ["Box<const char*>", "Box<const char[4]>", "Box<std::string>", "Ill-formed"],
      "answer": 0,
      "explain": "Deduction guides deduce as if by a by-value function parameter, so the array decays to const char*, giving Box<const char*>."
    },
    {
      "type": "code",
      "tag": "CTAD Parens vs Braces",
      "question": "What is the difference between these two declarations?",
      "code": "std::vector a{5};\nstd::vector b(5);",
      "options": [
        "a is vector<int> with one element (5); b is ill-formed under CTAD",
        "Both are vector<int> with one element",
        "Both are vector<int> with five elements",
        "a is ill-formed, b succeeds"
      ],
      "answer": 0,
      "explain": "std::vector a{5} uses the initializer_list guide giving one element valued 5. std::vector b(5) has no matching implicit guide (the size_t count constructor is not a deduction guide for the element type), so CTAD for b is ill-formed."
    },
    {
      "type": "code",
      "tag": "Deduction Conflict",
      "question": "Does this compile?",
      "code": "template<class T> void f(T a, T b);\nf(1, 2.0);",
      "options": [
        "No: conflicting deductions int vs double for the same T",
        "Yes: T is double, int converts",
        "Yes: T is int, double truncates",
        "Yes: T is long double"
      ],
      "answer": 0,
      "explain": "The same parameter T is deduced independently from each argument and must agree. int and double conflict, so deduction fails; there is no promotion to reconcile them."
    },
    {
      "type": "code",
      "tag": "Array Bound NTTP",
      "question": "What value is N deduced as?",
      "code": "template<int N> void f(int (&)[N]);\nint a[5];\nf(a);",
      "options": ["5", "1", "0", "Deduction fails"],
      "answer": 0,
      "explain": "A reference-to-array parameter deduces the array bound. Passing int[5] gives N = 5."
    },
    {
      "type": "code",
      "tag": "Multidim Array",
      "question": "What are the bounds deduced here?",
      "code": "template<class T, int R, int C>\nvoid f(T (&)[R][C]);\nint m[3][4];\nf(m);",
      "options": ["R = 3, C = 4", "R = 4, C = 3", "R = 12, C = 1", "Deduction fails"],
      "answer": 0,
      "explain": "A reference to a 2D array deduces both bounds in order: R = 3 (rows), C = 4 (columns), with T = int."
    },
    {
      "type": "code",
      "tag": "Member Pointer",
      "question": "What are C and M deduced to?",
      "code": "struct S { int m; };\ntemplate<class C, class M> void f(M C::* p);\nf(&S::m);",
      "options": ["C = S, M = int", "C = int, M = S", "C = S, M = S::int", "Deduction fails"],
      "answer": 0,
      "explain": "A pointer-to-member type M C::* is a deduced context. &S::m has type int S::*, so C = S and M = int."
    },
    {
      "type": "code",
      "tag": "decltype Parens",
      "question": "Do d and e have the same type?",
      "code": "int i = 0;\ndecltype(i) d = i;\ndecltype((i)) e = i;",
      "options": [
        "No: d is int, e is int& (extra parentheses)",
        "Yes: both int",
        "Yes: both int&",
        "No: d is int&, e is int"
      ],
      "answer": 0,
      "explain": "decltype(i) on an unparenthesized id-expression gives the declared type int. decltype((i)) on a parenthesized lvalue gives int&."
    },
    {
      "type": "code",
      "tag": "vector<bool> Trap",
      "question": "What is the type of e when iterating a std::vector<bool>?",
      "code": "std::vector<bool> v{true};\nfor (auto e : v) { /* ... */ }",
      "options": [
        "std::vector<bool>::reference (a proxy), not bool",
        "bool",
        "bool&",
        "const bool&"
      ],
      "answer": 0,
      "explain": "vector<bool>'s iterator dereferences to a proxy reference type, and 'auto e' copies that proxy type, not a plain bool. A classic auto gotcha."
    },
    {
      "type": "code",
      "tag": "decltype(auto) Return",
      "question": "What is the return type of first()?",
      "code": "std::vector<int> v{1,2,3};\ndecltype(auto) first() { return v[0]; }",
      "options": ["int&", "int", "int&&", "const int&"],
      "answer": 0,
      "explain": "v[0] is an lvalue of type int&, and decltype(auto) preserves that, so the function returns int&. Plain auto would have returned int by value."
    },
    {
      "type": "code",
      "tag": "Explicit Forwarding",
      "question": "Does this compile?",
      "code": "template<class T> void f(T&& x);\nint i = 0;\nf<int>(i);",
      "options": [
        "No: T is fixed to int, so the parameter is int&& and the lvalue i cannot bind",
        "Yes: T is int&",
        "Yes: T is int and it binds",
        "Yes: T is const int&"
      ],
      "answer": 0,
      "explain": "Providing f<int> forces T = int, so the parameter is a plain int&& rvalue reference. The lvalue i cannot bind to int&&, even though f(i) alone would deduce int&."
    },
    {
      "type": "code",
      "tag": "Move vs Forward",
      "question": "What is wrong with using std::move here for perfect forwarding?",
      "code": "template<class T> void f(T&& x){ g(std::move(x)); }\nint i = 0;\nf(i);",
      "options": [
        "std::move unconditionally casts to an rvalue, so an lvalue passed to f is wrongly moved from",
        "std::move is required for forwarding references",
        "Nothing is wrong; move and forward are identical",
        "std::move fails to compile with T&&"
      ],
      "answer": 0,
      "explain": "std::move always yields an rvalue regardless of the original category, so an lvalue argument would be treated as movable. std::forward<T> is category-preserving and is the correct tool."
    },
    {
      "type": "code",
      "tag": "Prvalue Forwarding",
      "question": "What is T here?",
      "code": "template<class T> void f(T&& x);\nstd::string s;\nf(s + s);",
      "options": ["std::string", "std::string&", "std::string&&", "const std::string&"],
      "answer": 0,
      "explain": "s + s is a prvalue (temporary), so T deduces to std::string (no reference) and the parameter is std::string&&."
    },
    {
      "type": "mcq",
      "tag": "Non-deduced Context",
      "question": "Which parameter form places T in a non-deduced context?",
      "options": [
        "typename T::type",
        "T&",
        "const T&",
        "std::vector<T>"
      ],
      "answer": 0,
      "explain": "A nested name like T::type is a non-deduced context: the compiler cannot invert the member lookup to recover T. It must be supplied or deduced elsewhere."
    },
    {
      "type": "mcq",
      "tag": "Default Argument",
      "question": "Why can a default function argument not be used to deduce a template parameter, e.g. `template<class T> void f(T x = 0); f();`?",
      "options": [
        "A defaulted parameter supplies no call argument, and defaults are a non-deduced context, so T cannot be deduced",
        "Default arguments are always non-const",
        "Because defaults are evaluated at link time",
        "It can: T deduces to int from the default 0"
      ],
      "answer": 0,
      "explain": "Template argument deduction uses the actual call arguments. Calling f() passes nothing, and defaults do not participate in deduction, so T cannot be deduced; you would need f<int>()."
    },
    {
      "type": "mcq",
      "tag": "std::forward",
      "question": "Given a forwarding-reference parameter x, what does `std::forward<T>(x)` do?",
      "options": [
        "Casts x to T&&, which collapses to an lvalue ref if T is an lvalue ref, else an rvalue ref",
        "Always casts x to an rvalue reference",
        "Always casts x to an lvalue reference",
        "Makes a copy of x preserving const"
      ],
      "answer": 0,
      "explain": "std::forward<T>(x) is essentially static_cast<T&&>(x). Reference collapsing turns T&& into T& when T is an lvalue reference, otherwise a genuine rvalue reference, preserving the original value category."
    },
    {
      "type": "mcq",
      "tag": "Reference Collapsing",
      "question": "Under reference collapsing, which combination yields an rvalue reference (&&)?",
      "options": [
        "Only && applied to && (int&& && -> int&&)",
        "& applied to & (int& & -> int&&)",
        "& applied to && (int& && -> int&&)",
        "&& applied to & (int&& & -> int&&)"
      ],
      "answer": 0,
      "explain": "The rule is: if either reference is an lvalue reference (&), the result is an lvalue reference. Only rvalue-ref to rvalue-ref collapses to &&."
    },
    {
      "type": "mcq",
      "tag": "Forwarding Reference",
      "question": "Which of these is a genuine forwarding (universal) reference?",
      "options": [
        "`template<class T> void f(T&& x)`",
        "`template<class T> void f(const T&& x)`",
        "`template<class T> struct S { void f(T&& x); };` used as S<int>",
        "`void f(std::vector<int>&& x)`"
      ],
      "answer": 0,
      "explain": "A forwarding reference requires the exact form T&& where T is a template parameter deduced by that same call. const T&&, already-fixed class-template parameters, and concrete types are plain rvalue references."
    },
    {
      "type": "mcq",
      "tag": "Member Rvalue Ref",
      "question": "In `template<class T> struct S { void f(T&& x); };` used as `S<int>`, what is the parameter of f?",
      "options": [
        "A plain int&& rvalue reference (T is fixed by the class, not deduced by the call)",
        "A forwarding reference that binds lvalues and rvalues",
        "int& because of collapsing",
        "It is ill-formed"
      ],
      "answer": 0,
      "explain": "T is the class template parameter, already known when f is instantiated. It is not deduced by the call to f, so T&& is a plain rvalue reference (int&&), not a forwarding reference."
    },
    {
      "type": "mcq",
      "tag": "CTAD Scope",
      "question": "In which situation does CTAD NOT apply?",
      "options": [
        "When the class name already carries template arguments, e.g. `std::vector<int> v{...}`",
        "When there is at least one constructor argument",
        "When a user deduction guide exists",
        "During copy-initialization like `std::pair p = {1, 2};`"
      ],
      "answer": 0,
      "explain": "CTAD applies only when the class template name is used without template arguments. If you already wrote vector<int>, there is nothing to deduce."
    },
    {
      "type": "mcq",
      "tag": "Copy Deduction",
      "question": "Given `std::vector v{1,2,3};`, what type is `w` in `std::vector w{v};`?",
      "options": [
        "std::vector<int> — the special copy-deduction candidate wins over wrapping",
        "std::vector<std::vector<int>>",
        "std::initializer_list<int>",
        "Ill-formed"
      ],
      "answer": 0,
      "explain": "CTAD has a special copy-deduction rule: when the single braced argument is itself the same template, it prefers copying rather than wrapping, so w is std::vector<int>, not a vector of vectors."
    },
    {
      "type": "mcq",
      "tag": "Aggregate CTAD",
      "question": "For an aggregate `template<class T> struct Point { T x, y; };` with no user guide, when does `Point p{1, 2};` deduce Point<int>?",
      "options": [
        "Only in C++20 (aggregate CTAD); in C++17 it needs an explicit deduction guide",
        "In C++17 already",
        "In no standard version",
        "Only if you write Point<int>"
      ],
      "answer": 0,
      "explain": "Aggregate CTAD was added in C++20. In C++17 an aggregate without an explicit deduction guide cannot be deduced."
    },
    {
      "type": "mcq",
      "tag": "auto vs Template",
      "question": "What is the key difference between auto deduction and template deduction?",
      "options": [
        "They match almost everywhere, except `auto x = {..}` deduces std::initializer_list while a bare template T cannot deduce from {} at all",
        "auto always keeps references, templates never do",
        "Templates deduce initializer_list from {}, auto does not",
        "They are entirely unrelated mechanisms"
      ],
      "answer": 0,
      "explain": "auto deduction is defined in terms of template deduction, with one notable exception: 'auto x = {..}' deduces std::initializer_list, whereas a bare template parameter has no rule for braced lists and fails."
    },
    {
      "type": "mcq",
      "tag": "Deduced Context",
      "question": "Which of the following is a deduced context for P?",
      "options": [
        "`std::vector<P>`",
        "`typename P::value_type`",
        "`typename Identity<P>::type`",
        "`decltype(P{})`"
      ],
      "answer": 0,
      "explain": "Type patterns that structurally contain the parameter, like std::vector<P> or P*, are deduced contexts. Nested-name qualifiers and expressions using P are non-deduced."
    },
    {
      "type": "mcq",
      "tag": "Argument Adjustments",
      "question": "Before deduction against a by-value parameter, which adjustment is NOT performed on the argument type?",
      "options": [
        "Adding a reference",
        "Array-to-pointer decay",
        "Function-to-pointer decay",
        "Dropping top-level const/volatile"
      ],
      "answer": 0,
      "explain": "For by-value parameters, arguments decay (array/function to pointer) and top-level cv is dropped, and references are removed. A reference is never added."
    },
    {
      "type": "mcq",
      "tag": "By-Value Const",
      "question": "For `template<class T> void f(T x);` called with an `int* const p`, what is T?",
      "options": [
        "int* — top-level const on the pointer is dropped by value",
        "int* const",
        "const int*",
        "int**"
      ],
      "answer": 0,
      "explain": "Top-level const on the pointer itself is stripped for by-value deduction. Low-level const (const int*) would instead be kept."
    },
    {
      "type": "mcq",
      "tag": "Low-level Const",
      "question": "For `template<class T> void f(T x);` called with a `const int* p`, what is T?",
      "options": [
        "const int* — the const is low-level (on the pointee) and is preserved",
        "int*",
        "int* const",
        "const int"
      ],
      "answer": 0,
      "explain": "Only top-level const is stripped by value. Here const applies to the pointee, not the pointer, so it is preserved: T is const int*."
    },
    {
      "type": "mcq",
      "tag": "Reference Keeps Const",
      "question": "For `template<class T> void f(T& x);` called with a `const int ci`, what is T?",
      "options": [
        "const int (the parameter is const int&)",
        "int",
        "const int&",
        "int&"
      ],
      "answer": 0,
      "explain": "With a T& parameter, top-level const is not dropped: T deduces to const int and the parameter is const int&."
    },
    {
      "type": "mcq",
      "tag": "String Literal Value",
      "question": "For `template<class T> void f(T x);` called with the string literal `\"hello\"`, what is T?",
      "options": [
        "const char*",
        "const char[6]",
        "char*",
        "std::string"
      ],
      "answer": 0,
      "explain": "By value, the string-literal array (type const char[6]) decays to a pointer, so T is const char*."
    },
    {
      "type": "mcq",
      "tag": "String Literal Ref",
      "question": "For `template<class T> void f(T& x);` called with `\"hello\"`, what is T?",
      "options": [
        "const char[6] (5 characters plus the null terminator)",
        "const char*",
        "char[6]",
        "char*"
      ],
      "answer": 0,
      "explain": "A string literal is an lvalue of type const char[6]. A reference parameter prevents decay, so T is the full array type const char[6]."
    },
    {
      "type": "mcq",
      "tag": "auto Reference",
      "question": "For `const int ci = 0; auto& x = ci;`, what is the type of x?",
      "options": [
        "const int& (const is preserved by auto&)",
        "int&",
        "int",
        "const int"
      ],
      "answer": 0,
      "explain": "With auto&, const on the referred-to object is not dropped, so x is const int&. Plain 'auto x = ci' would give int."
    },
    {
      "type": "mcq",
      "tag": "auto Forwarding",
      "question": "For `int i = 0; auto&& x = i;`, what type is deduced for x?",
      "options": [
        "int& (auto&& is a forwarding reference binding an lvalue)",
        "int",
        "int&&",
        "const int&"
      ],
      "answer": 0,
      "explain": "auto&& is a forwarding reference. Binding to the lvalue i deduces auto = int&, and reference collapsing yields int& for x."
    },
    {
      "type": "mcq",
      "tag": "nullptr Deduction",
      "question": "For `template<class T> void f(T x); f(nullptr);`, what is T?",
      "options": [
        "std::nullptr_t",
        "void*",
        "int*",
        "std::nullptr_t*"
      ],
      "answer": 0,
      "explain": "The type of nullptr is std::nullptr_t, and by-value deduction gives T = std::nullptr_t. It does not become a null pointer of some element type."
    },
    {
      "type": "mcq",
      "tag": "Pointer Param",
      "question": "For `template<class T> void f(T* p); f(0);`, what happens?",
      "options": [
        "Deduction fails: the literal 0 has type int, not a pointer, so no T makes int a T*",
        "T deduces to int",
        "T deduces to void",
        "T deduces to std::nullptr_t"
      ],
      "answer": 0,
      "explain": "The parameter T* requires a pointer argument. The literal 0 is an int; there is no T for which int is a T*, so deduction fails."
    },
    {
      "type": "mcq",
      "tag": "Overloaded Name",
      "question": "For `template<class T> void f(T x);` with overloaded `void g(); void g(int);`, what happens for `f(g)`?",
      "options": [
        "Deduction fails: an overloaded name has no single type, so T cannot be deduced without a cast",
        "T is void(*)()",
        "T is void(*)(int)",
        "It picks the first overload"
      ],
      "answer": 0,
      "explain": "Passing an overloaded function name where the type must be deduced is ambiguous; the compiler cannot choose which overload. A static_cast to a specific signature is required."
    },
    {
      "type": "mcq",
      "tag": "Return-only Parameter",
      "question": "For `template<class T> T make(); auto x = make();`, does deduction succeed?",
      "options": [
        "No: T appears only in the return type, a non-deduced position, with no argument to deduce from",
        "Yes: T is int",
        "Yes: T is auto",
        "Yes: T is void"
      ],
      "answer": 0,
      "explain": "T is used only as the return type and never in a parameter, so there is nothing to deduce it from. You must call make<int>()."
    },
    {
      "type": "mcq",
      "tag": "No User Conversion",
      "question": "For `template<class T> void f(T x);` with `struct S { operator int() const; }; S s; f(s);`, what is T?",
      "options": [
        "S — template deduction does not consider user-defined conversions",
        "int, via the conversion operator",
        "Ambiguous",
        "Deduction fails because of the conversion operator"
      ],
      "answer": 0,
      "explain": "Deduction matches the argument's actual static type and never applies user-defined conversions, so T deduces to S; the conversion operator is irrelevant here."
    },
    {
      "type": "mcq",
      "tag": "Derived to Base",
      "question": "For `template<class T> void f(T x);` with `struct Base{}; struct Derived: Base{}; Derived d; f(d);`, what is T?",
      "options": [
        "Derived — deduction uses the static type; no base-class conversion is applied",
        "Base",
        "Derived&",
        "Ambiguous"
      ],
      "answer": 0,
      "explain": "By-value deduction uses the argument's static type, Derived. Slicing to Base would only occur if the parameter were declared Base, not a deduced T."
    },
    {
      "type": "mcq",
      "tag": "Base Class Deduction",
      "question": "For `template<class T> struct B{}; struct D: B<int>{};` and `template<class T> void f(B<T>& b); D d; f(d);`, what is T?",
      "options": [
        "int — deduction may inspect a unique matching base class",
        "Deduction fails: D is not a B",
        "D",
        "B<int>"
      ],
      "answer": 0,
      "explain": "For a parameter of the form B<T>&, deduction is allowed to consider a unique base class of the argument. D derives from B<int>, so T deduces to int."
    },
    {
      "type": "mcq",
      "tag": "Ambiguous Base",
      "question": "For `template<class T> struct B{}; struct D: B<int>, B<char>{};` and `template<class T> void f(B<T>& b); D d; f(d);`, what happens?",
      "options": [
        "Deduction is ambiguous and fails: two bases B<int> and B<char> match",
        "T is int",
        "T is char",
        "T is D"
      ],
      "answer": 0,
      "explain": "When more than one base matches the pattern B<T>, there is no single T, so deduction is ambiguous and fails."
    },
    {
      "type": "mcq",
      "tag": "auto Return",
      "question": "For a function with a plain `auto` return type, how is the return type deduced?",
      "options": [
        "By template-argument rules: references and top-level const are stripped",
        "By decltype rules on the returned expression",
        "It always returns void",
        "It preserves the exact declared type including references"
      ],
      "answer": 0,
      "explain": "A bare auto return type uses template-deduction rules, so returning a reference or const value yields a decayed, non-reference type. Use decltype(auto) to preserve reference-ness."
    },
    {
      "type": "mcq",
      "tag": "Partial Explicit",
      "question": "For `template<class T, class U> void f(U u); f<int>(2.5);`, what are T and U?",
      "options": [
        "T = int (explicit), U = double (deduced from the argument)",
        "T and U are both int",
        "It fails: U cannot be left undeduced",
        "It fails: explicit args must fill all parameters"
      ],
      "answer": 0,
      "explain": "Explicit arguments fill template parameters left to right, so T = int; U is then deduced from 2.5 as double."
    },
    {
      "type": "mcq",
      "tag": "Ref-Value Conflict",
      "question": "For `template<class T> void f(T a, T& b);` with `const int ci; int i; f(i, ci);`, what happens?",
      "options": [
        "Conflict: 'T a' deduces int (const stripped) but 'T& b' deduces const int",
        "T is const int",
        "T is int",
        "b is copied"
      ],
      "answer": 0,
      "explain": "The by-value parameter strips const giving T = int, while the reference parameter preserves it giving T = const int. The two deductions disagree, so the call is ill-formed."
    },
    {
      "type": "mcq",
      "tag": "auto Nontype",
      "question": "In C++17, for `template<auto V> struct C {};`, what is V in `C<42>`?",
      "options": [
        "An int with value 42 (its type is deduced from the argument)",
        "The literal placeholder auto",
        "A long",
        "Ill-formed"
      ],
      "answer": 0,
      "explain": "C++17 allows template<auto V>, where the type of the nontype parameter V is deduced from the argument. 42 makes V an int of value 42."
    },
    {
      "type": "mcq",
      "tag": "auto Nontype",
      "question": "For `template<auto V> struct C {};`, are `C<42>` and `C<42u>` the same type?",
      "options": [
        "No: V is int for 42 and unsigned int for 42u, so they are distinct specializations",
        "Yes: both collapse to int",
        "Yes: the values are equal",
        "Ill-formed"
      ],
      "answer": 0,
      "explain": "template<auto V> deduces the value's type. 42 is int and 42u is unsigned int, so C<42> and C<42u> differ."
    },
    {
      "type": "mcq",
      "tag": "Variadic Pack",
      "question": "For `template<class... Ts> void f(Ts... args); f(1, 2.0, 'c');`, what is the pack Ts?",
      "options": [
        "{int, double, char} — one deduced type per argument",
        "A single tuple type",
        "Empty",
        "Deduction fails"
      ],
      "answer": 0,
      "explain": "Each argument contributes one deduced type to the pack, with by-value decay applied to each: {int, double, char}."
    },
    {
      "type": "mcq",
      "tag": "Variadic Forwarding",
      "question": "For `template<class... Ts> void f(Ts&&... args); int i; f(i, 42);`, what are the pack members?",
      "options": [
        "Ts = {int&, int} (lvalue then rvalue)",
        "Ts = {int, int}",
        "Ts = {int&, int&}",
        "Ts = {int&&, int&&}"
      ],
      "answer": 0,
      "explain": "Each forwarding-reference pack element deduces independently: the lvalue i gives int&, the rvalue 42 gives int. Parameters collapse to int& and int&&."
    },
    {
      "type": "mcq",
      "tag": "Alias CTAD",
      "question": "In C++20, can CTAD deduce through an alias template such as `template<class T> using Vec = std::vector<T>;` for `Vec v{1,2,3};`?",
      "options": [
        "Yes, since C++20 alias-template CTAD deduces the underlying std::vector<int>",
        "No, aliases never support CTAD",
        "Only if you write Vec<int>",
        "It deduces std::vector<void>"
      ],
      "answer": 0,
      "explain": "C++20 added alias-template CTAD, synthesizing guides for the alias so Vec v{1,2,3} deduces std::vector<int>."
    },
    {
      "type": "mcq",
      "tag": "Guide Priority",
      "question": "When both implicit and user-defined deduction guides could match, which is chosen?",
      "options": [
        "Overload resolution over all guides picks the best match, so a user guide can win",
        "Implicit guides always win",
        "User guides are ignored if any constructor exists",
        "The first declared guide always wins"
      ],
      "answer": 0,
      "explain": "Deduction guides (implicit and explicit) form an overload set of fictitious functions; normal overload resolution selects the best match."
    },
    {
      "type": "mcq",
      "tag": "Iterator Guide",
      "question": "What makes `int a[]={1,2,3}; std::vector v(a, a+3);` deduce std::vector<int>?",
      "options": [
        "A library-provided deduction guide from a pair of iterators",
        "The initializer_list constructor",
        "Aggregate CTAD",
        "It does not compile"
      ],
      "answer": 0,
      "explain": "std::vector ships a user-defined deduction guide for (InputIt, InputIt) that deduces value_type from the iterator, yielding std::vector<int>."
    },
    {
      "type": "mcq",
      "tag": "make_pair Decay",
      "question": "Why does `std::make_pair(1, 2)` return std::pair<int, int> rather than a pair of references?",
      "options": [
        "make_pair applies decay to its arguments before forming the pair type",
        "make_pair never existed before CTAD",
        "make_pair keeps references",
        "It returns std::pair<int&, int&>"
      ],
      "answer": 0,
      "explain": "std::make_pair decays its arguments (with special handling for reference_wrapper) and returns a by-value pair, mirroring the by-value decay that CTAD also performs."
    },
    {
      "type": "mcq",
      "tag": "Why Braces Fail",
      "question": "Why can a bare template parameter T not be deduced from a braced-init-list argument like `{1, 2}`?",
      "options": [
        "A braced-init-list has no type, so there is nothing to match a bare T against",
        "Because braces always mean initializer_list and T is not one",
        "Because deduction is disabled inside braces",
        "Because braces create a temporary array that cannot bind"
      ],
      "answer": 0,
      "explain": "A braced-init-list is not an expression and has no type. Deduction matches the parameter pattern against the argument's type; with no type, a bare T is a non-deduced context. std::initializer_list<T> and auto have special rules to handle {}."
    },
    {
      "type": "mcq",
      "tag": "Not Forwarding",
      "question": "For `template<class T> void f(std::vector<T>&& x); std::vector<int> v; f(v);`, what happens?",
      "options": [
        "Ill-formed: the parameter is a real rvalue reference, not a forwarding reference, so the lvalue v cannot bind",
        "T deduces to int& and it binds",
        "v is moved automatically",
        "T cannot be deduced from vector"
      ],
      "answer": 0,
      "explain": "std::vector<T>&& is not a forwarding reference (the && must apply directly to a bare template parameter). It is a plain rvalue reference, so the lvalue v cannot bind."
    },
    {
      "type": "mcq",
      "tag": "const T& Binds Rvalue",
      "question": "For `template<class T> void f(const T& x); f(42);`, what is T?",
      "options": [
        "int — const T& binds the rvalue with T = int",
        "const int",
        "int&",
        "int&&"
      ],
      "answer": 0,
      "explain": "const T& can bind to the rvalue 42; matching int against const T& gives T = int, with const belonging to the parameter."
    },
    {
      "type": "mcq",
      "tag": "T& Rejects Rvalue",
      "question": "For `template<class T> void f(T& x); f(42);`, what happens?",
      "options": [
        "Ill-formed: a non-const lvalue reference cannot bind the rvalue 42",
        "T is int",
        "T is const int",
        "42 is promoted to bind"
      ],
      "answer": 0,
      "explain": "T& is a non-const lvalue reference and cannot bind to the prvalue 42. Declaring the parameter const T& would work, binding T = int."
    },
    {
      "type": "mcq",
      "tag": "List Mixed Types",
      "question": "For `template<class T> void f(std::initializer_list<T> l); f({1, 2.0});`, what happens?",
      "options": [
        "Ill-formed: elements int and double give conflicting T",
        "T is double",
        "T is int",
        "T is std::common_type of the elements"
      ],
      "answer": 0,
      "explain": "All elements of the braced list must yield the same T. int and double conflict, so deduction fails; no common-type promotion is applied in deduction."
    },
    {
      "type": "mcq",
      "tag": "Partial Pattern",
      "question": "For `template<class T> void f(std::pair<int, T> p); std::pair<int, char> pr; f(pr);`, what is T?",
      "options": [
        "char — the first element int is fixed, T comes from the second",
        "int",
        "std::pair<int, char>",
        "Deduction fails"
      ],
      "answer": 0,
      "explain": "The first element type int is fixed in the pattern; T is deduced from the second element, giving char."
    },
    {
      "type": "mcq",
      "tag": "Templated Ctor CTAD",
      "question": "For `template<class T> struct W { template<class U> W(U); };`, what happens with `W w{5};` (no user guide)?",
      "options": [
        "Ill-formed: the constructor's U does not determine the class parameter T, so a user guide is required",
        "W<int>",
        "W<U>",
        "W<void>"
      ],
      "answer": 0,
      "explain": "The constructor's U is unrelated to the class parameter T, so the implicit guide cannot deduce T. A user guide like `template<class U> W(U) -> W<U>;` is needed."
    },
    {
      "type": "mcq",
      "tag": "Volatile Stripped",
      "question": "For `template<class T> void f(T x); volatile int vi; f(vi);`, what is T?",
      "options": [
        "int — by-value deduction strips top-level cv, including volatile",
        "volatile int",
        "int&",
        "const volatile int"
      ],
      "answer": 0,
      "explain": "By-value deduction drops top-level cv-qualifiers, so both const and volatile are removed: T is int. A reference parameter would preserve them."
    },
    {
      "type": "mcq",
      "tag": "array Type+NTTP",
      "question": "For `template<class T, std::size_t N> void f(const std::array<T,N>& a); std::array<int,3> arr; f(arr);`, what is deduced?",
      "options": [
        "T = int, N = 3",
        "T = 3, N = int",
        "Deduction fails because N is a nontype parameter",
        "T = std::array<int,3>, N = 3"
      ],
      "answer": 0,
      "explain": "std::array<T, N> is a deduced context mixing a type and a nontype parameter; matching std::array<int,3> gives T = int and N = 3."
    },
    {
      "type": "mcq",
      "tag": "Forward in Ctor",
      "question": "In `template<class U> Holder(U&& u) : val(std::forward<U>(u)) {}` (val is of type T), what happens when constructing from an lvalue string s?",
      "options": [
        "U deduces to std::string&, forward yields an lvalue, and val is copy-constructed (s is left intact)",
        "s is moved from",
        "val becomes a reference to s",
        "It is ill-formed"
      ],
      "answer": 0,
      "explain": "For the lvalue s, U deduces to std::string&, so std::forward<U> produces an lvalue and val is copy-constructed, leaving s unchanged. An rvalue would instead be moved."
    },
    {
      "type": "mcq",
      "tag": "Const Lvalue Forward",
      "question": "With `void g(const int&); void g(int&&);` and a forwarding wrapper `template<class T> void f(T&& x){ g(std::forward<T>(x)); }`, which g runs for `f(ci)` where ci is a `const int`?",
      "options": [
        "g(const int&) — a const lvalue deduces T = const int& and forwards as a const lvalue",
        "g(int&&) — it is always moved",
        "Ambiguous between the two overloads",
        "Neither: the call is ill-formed"
      ],
      "answer": 0,
      "explain": "ci is a const lvalue, so T deduces to const int& and std::forward yields a const lvalue, matching g(const int&). A const object can never bind to int&&."
    }
  ]
};

/* ===== Professional C++ — Modern Language Features ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["procpp-modern"] = {
  title: "Professional C++ — Modern Language Features",
  subtitle: "Lambdas in depth, spaceship operator, modules, designated initializers, chrono and vocabulary types.",
  crumb: "Professional C++",
  questions: [
    {
      "type": "code",
      "tag": "Lambda init-capture",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n\nint main() {\n    auto p = std::make_unique<int>(42);\n    auto f = [q = std::move(p)]() { return *q + 1; };\n    std::cout << f() << \" \" << (p == nullptr);\n}",
      "options": [
        "43 1",
        "43 0",
        "42 1",
        "Undefined behavior: p is in an unspecified state after the move"
      ],
      "answer": 0,
      "explain": "An init-capture (C++14) lets you move a move-only type like std::unique_ptr into the closure, so q owns the int and f() returns 43. Unlike most moved-from types, std::unique_ptr gives a hard guarantee: after being moved from, it is null. Therefore p == nullptr is true and prints 1."
    },
    {
      "type": "code",
      "tag": "Lambda mutable",
      "question": "What is the output?",
      "code": "#include <iostream>\n\nint main() {\n    int x = 10;\n    auto f = [x]() mutable { x += 5; return x; };\n    std::cout << f() << \" \" << f() << \" \" << x;\n}",
      "options": [
        "15 20 20",
        "15 15 10",
        "15 20 10",
        "It does not compile: a by-value capture cannot be modified"
      ],
      "answer": 2,
      "explain": "A by-value capture copies x into the closure object; mutable makes the lambda's operator() non-const so that copy can be modified. The state persists between calls on the same closure, so the calls return 15 then 20. The original x is untouched and still prints 10."
    },
    {
      "type": "mcq",
      "tag": "Capturing this vs *this",
      "question": "A member function of class Widget returns a lambda written as [this]() { return m_value; }. The caller stores the lambda, the Widget is destroyed, and then the lambda is invoked. What is the correct analysis?",
      "options": [
        "It is safe: capturing this automatically extends the Widget's lifetime until the lambda is destroyed",
        "Undefined behavior: [this] captures only the pointer, so the lambda dereferences a dangling this; capturing [*this] (C++17) would copy the object and be safe",
        "It does not compile: member variables can only be captured with [=] or [&]",
        "It is safe: [this] performs a deep copy of the object into the closure"
      ],
      "answer": 1,
      "explain": "[this] stores just the raw pointer; accessing m_value inside the lambda is really this->m_value, which dangles once the object dies. C++17 added [*this], which copies the whole object into the closure, decoupling the lambda from the original's lifetime. Nothing about a lambda capture extends an object's lifetime."
    },
    {
      "type": "mcq",
      "tag": "Stateless lambdas",
      "question": "Given: auto fp = +[](int i) { return i * 2; }; — what is fp, and why does the unary + work?",
      "options": [
        "fp is still a closure object; unary + on a lambda is a no-op",
        "It does not compile; lambdas do not support unary +",
        "fp is a std::function<int(int)>; the + triggers type erasure",
        "fp is a function pointer of type int(*)(int); a captureless lambda has an implicit conversion to a function pointer, and unary + forces that conversion"
      ],
      "answer": 3,
      "explain": "Only stateless (captureless) lambdas provide a conversion operator to an ordinary function pointer. Unary + cannot apply to a closure type directly, so overload resolution invokes that conversion, yielding int(*)(int). This trick is handy for C callbacks or for forcing a concrete type in auto/template deduction; add any capture and the conversion disappears, making the code ill-formed."
    },
    {
      "type": "code",
      "tag": "operator<=>",
      "question": "What does this C++20 program print?",
      "code": "#include <compare>\n#include <iostream>\n\nstruct P {\n    int x, y;\n    auto operator<=>(const P&) const = default;\n};\n\nint main() {\n    P a{1, 5}, b{1, 3};\n    std::cout << (a > b) << (a == P{1, 5}) << (a < b);\n}",
      "options": [
        "110",
        "100",
        "It does not compile: operator== was never declared",
        "010"
      ],
      "answer": 0,
      "explain": "A defaulted operator<=> compares members lexicographically in declaration order: x ties, then 5 > 3 makes a > b true. Defaulting operator<=> also implicitly declares a defaulted operator==, so a == P{1, 5} compiles and is true. a < b is false, giving 110."
    },
    {
      "type": "mcq",
      "tag": "Comparison categories",
      "question": "struct Temp { double celsius; auto operator<=>(const Temp&) const = default; }; — what is the deduced return type of the defaulted operator<=>, and why?",
      "options": [
        "std::strong_ordering, because all built-in types compare with strong ordering",
        "std::partial_ordering, because floating-point types can hold NaN, which is unordered with everything",
        "std::weak_ordering, because doubles with different bit patterns can compare equal",
        "bool, because a defaulted comparison always collapses to true/false"
      ],
      "answer": 1,
      "explain": "With auto as the return type, the compiler deduces the common comparison category of all members. double's <=> yields std::partial_ordering because comparisons involving NaN return partial_ordering::unordered — none of <, ==, or > holds. int members alone would give strong_ordering; mixing them with a double still degrades the common category to partial_ordering."
    },
    {
      "type": "mcq",
      "tag": "Rewritten candidates",
      "question": "In C++20, class Id defines only bool operator==(const Id&) const and nothing else. Which comparison expressions on two Id objects are valid?",
      "options": [
        "Only a == b; a != b needs an explicit operator!=",
        "All six comparisons; == is enough for the compiler to synthesize an ordering",
        "a == b and a != b; the compiler rewrites a != b as !(a == b), but <, <=, >, >= still require operator<=>",
        "None, because C++20 requires operator<=> before any comparison operator can be used"
      ],
      "answer": 2,
      "explain": "C++20's rewritten candidates mean a != b is evaluated as !(a == b) when only operator== exists, and == also gains symmetry (b == a works even if only a member function on one side matches). Ordering operators are rewritten only in terms of operator<=>, e.g. a < b becomes (a <=> b) < 0, so without a spaceship operator the relational comparisons remain ill-formed."
    },
    {
      "type": "code",
      "tag": "Designated initializers",
      "question": "According to standard C++20, what is the result of this code?",
      "code": "struct Point { int x, y, z; };\n\nint main() {\n    Point p{ .y = 2, .x = 1 };\n    return p.x + p.z;\n}",
      "options": [
        "Compile error: designators must appear in the same order as the members are declared",
        "Returns 1; z is value-initialized to 0",
        "Returns 3; z takes the last designated value",
        "Undefined behavior: z is left uninitialized"
      ],
      "answer": 0,
      "explain": "Unlike C99, C++20 requires designated initializers to appear in declaration order, so .y before .x is ill-formed (gcc rejects it; clang accepts it only as an extension, with a warning). Had the order been { .x = 1, .y = 2 }, the code would compile, and the omitted z would be value-initialized to 0, returning 1. The ordering rule exists so evaluation order matches member declaration order, as with ordinary aggregate initialization."
    },
    {
      "type": "mcq",
      "tag": "Designated initializers",
      "question": "Which statement about C++20 designated initializers for an aggregate is true?",
      "options": [
        "You may freely mix designated and positional initializers, as in {1, .z = 3}",
        "Every member must be given a designator or the initialization is ill-formed",
        "Designated initializers also work for members inherited from base classes, using the base member's name",
        "You may skip members (they are value-initialized or use their default member initializer), but you cannot mix designated and non-designated initializers in the same braced list"
      ],
      "answer": 3,
      "explain": "A braced list must be all-designated or all-positional; {1, .z = 3} is ill-formed in C++20 (though C allows such mixing). Members without a designator get their default member initializer if one exists, otherwise they are value-initialized. Designators can only name direct non-static data members, so members of base classes cannot be designated."
    },
    {
      "type": "code",
      "tag": "Structured bindings",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <map>\n#include <string>\n\nint main() {\n    std::map<std::string, int> m{{\"a\", 1}, {\"b\", 2}};\n    for (auto& [key, val] : m) {\n        val *= 10;\n    }\n    std::cout << m[\"a\"] << \" \" << m[\"b\"];\n}",
      "options": [
        "1 2",
        "10 20",
        "It does not compile: map keys are const, so the binding must be const auto&",
        "Undefined behavior: modifying elements while iterating invalidates the loop"
      ],
      "answer": 1,
      "explain": "auto& [key, val] binds to each pair<const string, int>& in the map; key names the const key and val names the mutable mapped value. Multiplying val by 10 mutates the map in place, so it prints 10 20. Modifying mapped values does not invalidate map iterators — only insertions/erasures affect iteration, and even then map iterators to other elements stay valid."
    },
    {
      "type": "mcq",
      "tag": "Structured bindings",
      "question": "Why did C++17 forbid a lambda from capturing a structured binding like the 'key' in auto [key, val] = pair;, and what changed later?",
      "options": [
        "Structured bindings introduce names that are not ordinary variables (they refer into a hidden compiler object), so C++17 disallowed capturing them; C++20 explicitly permits capturing them by value or by reference",
        "Nothing forbade it; capturing structured bindings has always worked exactly like capturing variables",
        "They can never be captured because the hidden object's lifetime ends at the end of the declaration statement",
        "They could only be captured with [&] in C++17; C++20 added by-value capture"
      ],
      "answer": 0,
      "explain": "A structured binding declares names that alias parts of an unnamed compiler-introduced object rather than being independent variables, which is also why decltype(key) yields the referenced member type. Because they are not variables, C++17's wording excluded them from capture lists, and compilers rejected [key]. C++20 (P1091) lifted the restriction, allowing both copy and reference capture; a copy capture snapshots the bound element's value."
    },
    {
      "type": "code",
      "tag": "optional<bool> trap",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <optional>\n\nint main() {\n    std::optional<bool> flag = false;\n    if (flag) {\n        std::cout << \"A\";\n    } else {\n        std::cout << \"B\";\n    }\n    std::cout << *flag;\n}",
      "options": [
        "B0",
        "B then a throw of std::bad_optional_access",
        "A0",
        "A1"
      ],
      "answer": 2,
      "explain": "In a boolean context an optional tests engagement, not the contained value; flag holds false but is engaged, so the condition is true and A prints. Dereferencing then prints the contained false as 0. This double meaning of \"false\" is why optional<bool> is widely considered a trap — use flag.has_value() and *flag (or a three-state enum) to keep the two questions distinct."
    },
    {
      "type": "mcq",
      "tag": "optional access",
      "question": "For an empty std::optional<int> o, what is the difference between o.value() and *o, and how does o compare against a non-empty optional?",
      "options": [
        "Both throw std::bad_optional_access; empty optionals cannot be compared",
        "value() throws std::bad_optional_access, *o is undefined behavior; an empty optional compares less than any engaged optional",
        "Both are undefined behavior; comparing optionals compares only their contained values",
        "value() returns a default-constructed int, *o throws; an empty optional compares greater than any engaged one"
      ],
      "answer": 1,
      "explain": "value() performs a checked access and throws std::bad_optional_access when the optional is empty, while operator* (and operator->) are unchecked — using them on an empty optional is undefined behavior, mirroring the at()/operator[] split on containers. Relational operators are defined for optionals: an empty optional (or nullopt) compares less than any engaged optional, and two engaged optionals compare their contained values."
    },
    {
      "type": "code",
      "tag": "variant get_if",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <variant>\n\nint main() {\n    std::variant<int, std::string> v = \"hi\";\n    std::cout << v.index();\n    if (auto* p = std::get_if<int>(&v)) {\n        std::cout << *p;\n    } else {\n        std::cout << \"-\";\n    }\n    v = 7;\n    std::cout << std::get<int>(v);\n}",
      "options": [
        "1-7",
        "0-7",
        "1 then a throw of std::bad_variant_access",
        "It does not compile: \"hi\" is a const char*, which is not an alternative of the variant"
      ],
      "answer": 0,
      "explain": "The const char* \"hi\" converts to std::string (it cannot convert to int), so the string alternative at index 1 is active. std::get_if takes a pointer to the variant and returns nullptr instead of throwing when the requested alternative is not active, so the else branch prints \"-\". After v = 7 the int alternative is active and std::get<int> succeeds, printing 7; std::get would have thrown std::bad_variant_access only on a wrong-type access."
    },
    {
      "type": "mcq",
      "tag": "visit + overload idiom",
      "question": "What is the purpose of this C++ idiom, typically paired with std::visit?\n\ntemplate <typename... Ts> struct overload : Ts... { using Ts::operator()...; };",
      "options": [
        "It merges several lambdas into a single lambda whose captures are shared between them",
        "It lets std::visit call a member function of the variant's currently active alternative",
        "It inherits from several lambdas and pulls all their call operators into one overload set, so std::visit can dispatch each variant alternative to the matching lambda",
        "It prevents a variant from ever becoming valueless_by_exception during visitation"
      ],
      "answer": 2,
      "explain": "overload derives from every lambda's closure type and re-exposes each operator() with a pack-expanded using-declaration, producing one object with an overload set. std::visit then picks the best-matching call operator for the active alternative, e.g. overload{[](int){...}, [](const std::string&){...}}. In C++20 aggregate CTAD works out of the box, so the pre-C++20 deduction guide is no longer needed. It has nothing to do with valueless_by_exception, the rare empty state a variant enters when a type-changing assignment throws mid-construction."
    },
    {
      "type": "mcq",
      "tag": "std::any",
      "question": "Given std::any a = 42;, what happens with std::any_cast<double>(a) and with std::any_cast<double>(&a)?",
      "options": [
        "Both succeed, converting the stored int 42 to 42.0",
        "The reference form returns 42.0, but the pointer form returns nullptr",
        "Both are undefined behavior because the stored type does not match",
        "The reference form throws std::bad_any_cast; the pointer form returns nullptr, because any_cast requires the exact stored type and never converts"
      ],
      "answer": 3,
      "explain": "std::any stores the value together with its typeid, and any_cast matches types exactly — an int inside will never be handed out as double, long, or anything else convertible. The value/reference forms report a mismatch by throwing std::bad_any_cast, whereas the pointer overload is the non-throwing test, returning nullptr on mismatch, analogous to get vs get_if on a variant."
    },
    {
      "type": "code",
      "tag": "tuple + apply",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <tuple>\n\nint main() {\n    auto t = std::make_tuple(2, 3, 4);\n    int product = std::apply([](auto... v) { return (v * ...); }, t);\n    auto [a, b, c] = t;\n    std::cout << product << \" \" << a + c;\n}",
      "options": [
        "24 5",
        "24 6",
        "9 6",
        "It does not compile: std::apply requires the callable to take a std::tuple parameter"
      ],
      "answer": 1,
      "explain": "std::apply unpacks the tuple's elements and passes them as separate arguments to the callable, so the generic lambda receives 2, 3, 4 and the fold expression (v * ...) multiplies them to 24. The structured binding then copies the tuple into a, b, c, so a + c is 2 + 4 = 6. This is the idiomatic replacement for manual std::get<I> unpacking."
    },
    {
      "type": "code",
      "tag": "if with initializer",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <map>\n\nint main() {\n    std::map<int, int> m{{1, 100}};\n    if (auto it = m.find(2); it != m.end()) {\n        std::cout << it->second;\n    } else {\n        std::cout << \"missing \" << (it == m.end());\n    }\n}",
      "options": [
        "missing 1",
        "missing 0",
        "It does not compile: it is out of scope in the else branch",
        "100"
      ],
      "answer": 0,
      "explain": "The C++17 if-with-initializer declares it whose scope covers the condition, the then branch, and the else branch, ending when the whole if statement ends. find(2) fails, so the else branch runs and it == m.end() is true, printing \"missing 1\". This form keeps helper variables from leaking into the surrounding scope; the same syntax exists for switch (C++17) and range-based for (C++20)."
    },
    {
      "type": "mcq",
      "tag": "Inline variables",
      "question": "Why would you declare inline int s_counter = 0; at namespace scope in a header included by many source files?",
      "options": [
        "inline asks the compiler to place the variable in a register for faster access",
        "inline gives each translation unit its own private copy, like static at namespace scope",
        "inline permits the same variable definition in multiple translation units; the linker merges them into one entity, so the header stays self-contained without an out-of-line definition in a .cpp file",
        "inline is only valid on functions; the code needs extern instead"
      ],
      "answer": 2,
      "explain": "C++17 inline variables extend the classic inline-function ODR exemption to variables: every translation unit may contain the (identical) definition, and the program still gets exactly one object. Without inline, a non-const namespace-scope definition in a header causes duplicate-symbol link errors, while static would silently create a separate copy per translation unit. The same feature is why static data members can now be initialized directly in the class definition with inline static."
    },
    {
      "type": "mcq",
      "tag": "Attributes",
      "question": "What does the C++20 attribute [[no_unique_address]] on a non-static data member allow?",
      "options": [
        "It guarantees the member is placed at offset 0 of the enclosing class",
        "If the member's type is empty, the member may share its address with other members and occupy no extra storage — the empty-base optimization made available to members",
        "It tells the optimizer the member's address is never taken, enabling it to be kept in a register",
        "It removes the member from the object entirely, making any access to it undefined behavior"
      ],
      "answer": 1,
      "explain": "Normally every member must have a distinct address, so even an empty allocator or comparator member costs at least one byte plus padding. [[no_unique_address]] lets the compiler overlap a member of empty class type with other storage, which is how types like containers store stateless allocators for free without inheriting from them. Like [[likely]] and [[unlikely]] on branches, it is a hint about layout/optimization and never changes what the program is allowed to compute."
    },
    {
      "type": "mcq",
      "tag": "Modules",
      "question": "In a C++20 module interface file starting with export module math;, which statement is true?",
      "options": [
        "Every entity in the file is automatically visible to importers; export is only needed for templates",
        "Importing a module textually pastes its source into the importer, exactly like #include",
        "Modules fully replace headers, so a modules-based program can never use #include",
        "Only declarations marked export are visible to code that does import math; non-exported entities stay internal to the module, and the module can be split with partitions like module math:details"
      ],
      "answer": 3,
      "explain": "A module gives explicit control over its interface: only exported names are reachable by importers, while everything else has module linkage and stays hidden, and partitions (math:details) let large modules be organized across files. Import is a semantic operation on a compiled module representation, not textual inclusion, which is also why macros do not leak out of modules. Headers still exist because macros, legacy third-party code, and pre-modules toolchains must interoperate — often via #include inside the global module fragment (module; before the module declaration)."
    },
    {
      "type": "code",
      "tag": "chrono truncation",
      "question": "What does this program print?",
      "code": "#include <chrono>\n#include <iostream>\n\nint main() {\n    using namespace std::chrono;\n    seconds d = 150s;\n    auto m = duration_cast<minutes>(d);\n    std::cout << m.count() << \" \" << (d - m).count();\n}",
      "options": [
        "2 30",
        "3 -30",
        "2.5 0",
        "It does not compile: subtracting minutes from seconds mixes units"
      ],
      "answer": 0,
      "explain": "duration_cast performs integer conversion that truncates toward zero, so 150 s becomes 2 min, not a rounded 3 (use std::chrono::round/ceil/floor for other behavior). Mixed-unit arithmetic is legal and converts to the finer common type: d - m is computed in seconds as 150 - 120 = 30. Only lossy conversions require an explicit duration_cast; minutes to seconds would convert implicitly."
    },
    {
      "type": "code",
      "tag": "filesystem paths",
      "question": "What does this program print?",
      "code": "#include <filesystem>\n#include <iostream>\n\nint main() {\n    std::filesystem::path p = \"data\";\n    p /= \"logs\";\n    p += \".txt\";\n    std::cout << p.generic_string();\n}",
      "options": [
        "data/logs/.txt",
        "data/logs.txt",
        "datalogs.txt",
        "data.txt/logs"
      ],
      "answer": 1,
      "explain": "operator/= (and operator/) appends with a directory separator, producing data/logs, while operator+= does raw string concatenation with no separator, turning the filename into logs.txt. Confusing the two is a classic bug: p /= \".txt\" would have produced data/logs/.txt. generic_string() reports the path with forward slashes on every platform, whereas string() uses the native (preferred) separator."
    },
    {
      "type": "mcq",
      "tag": "source_location",
      "question": "void log(std::string_view msg, std::source_location loc = std::source_location::current()); — why is current() used as a default argument, and what does it report when someone calls log(\"hi\") from line 42 of app.cpp?",
      "options": [
        "It reports the file and line where log is declared, since defaults are evaluated at the declaration",
        "It cannot work: source_location::current() is only valid inside a function body",
        "Default arguments are evaluated at the call site, so loc captures app.cpp line 42 — the caller's location — replacing the old __FILE__/__LINE__ macro technique",
        "It reports the location of main(), because current() walks the call stack at run time"
      ],
      "answer": 2,
      "explain": "std::source_location::current() (C++20) yields the location where it is evaluated, and a default argument is evaluated in the context of each call expression. That combination makes the caller's file, line, column, and function name flow into the log function automatically, with no macros and no stack walking. Called inside the function body instead, current() would uselessly report the logging function's own location."
    },
    {
      "type": "code",
      "tag": "bit operations",
      "question": "What does this C++20 program print?",
      "code": "#include <bit>\n#include <iostream>\n\nint main() {\n    unsigned int x = 0b101100u;  // 44\n    std::cout << std::popcount(x)\n              << std::has_single_bit(16u)\n              << std::bit_width(x);\n}",
      "options": [
        "306",
        "216",
        "344",
        "316"
      ],
      "answer": 3,
      "explain": "std::popcount counts set bits: 101100 has three, so 3. std::has_single_bit(16u) is true (16 is a power of two), printed as 1. std::bit_width(44) is the number of bits needed to represent the value — the index of the highest set bit plus one — which is 6 for 101100. These <bit> functions, like std::bit_cast for safe type punning, take unsigned integer types only."
    },
    {
      "type": "code",
      "tag": "Lambda in unevaluated context",
      "question": "What does this C++20 program print?",
      "code": "#include <iostream>\n#include <set>\n\nint main() {\n    std::set<int, decltype([](int a, int b) { return a > b; })> s{3, 1, 4, 1, 5};\n    for (int v : s) std::cout << v << ' ';\n}",
      "options": [
        "3 1 4 5 (insertion order, with the duplicate removed)",
        "It does not compile: a lambda expression cannot appear inside a template argument",
        "5 4 3 1",
        "It compiles only if a comparator object is passed to the set's constructor"
      ],
      "answer": 2,
      "explain": "C++20 allows lambda expressions in unevaluated contexts such as decltype, and captureless closure types became default-constructible, so the set can create its own comparator — no constructor argument needed. The a > b comparator sorts descending, and the duplicate 1 is discarded, giving 5 4 3 1. Before C++20 the usual workaround was a function-pointer comparator or a named functor struct."
    },
    {
      "type": "mcq",
      "tag": "Closure type uniqueness",
      "question": "Given: auto a = [](int i) { return i; }; auto b = [](int i) { return i; }; — two token-for-token identical lambdas. Which statement about their types is correct?",
      "options": [
        "a and b have two distinct, unrelated closure types — every lambda expression introduces a unique type — so decltype(a) x = b; does not compile",
        "They have the same closure type because the lambdas are token-for-token identical",
        "Both have type std::function<int(int)>, so they are interchangeable",
        "Their types differ only if their capture lists differ"
      ],
      "answer": 0,
      "explain": "Each lambda expression creates a brand-new, unnamed closure type, even if the source text is identical, so decltype(a) cannot be initialized from b. This is why lambdas stored in containers or swapped between variables usually go through std::function, a function pointer (captureless only), or a template parameter. The uniqueness holds regardless of captures."
    },
    {
      "type": "code",
      "tag": "Default-constructible lambdas",
      "question": "What is the result of this C++20 program?",
      "code": "#include <iostream>\n\nint main() {\n    auto cmp = [](int a, int b) { return a < b; };\n    decltype(cmp) other;\n    decltype(cmp) third = cmp;\n    third = other;\n    std::cout << other(1, 2) << third(3, 2);\n}",
      "options": [
        "It does not compile: closure types are never default-constructible",
        "10",
        "11",
        "Undefined behavior: other is used before it has been given a state"
      ],
      "answer": 1,
      "explain": "Since C++20, stateless (captureless) closure types are default-constructible and assignable, so declaring other and assigning through third are both legal. A stateless lambda has no data members, so a default-constructed instance behaves identically to the original: other(1, 2) is 1 < 2, printing 1, and third(3, 2) is 3 < 2, printing 0. Add any capture and both operations become ill-formed again."
    },
    {
      "type": "mcq",
      "tag": "Deducing this (C++23)",
      "question": "C++23 allows: auto fib = [](this auto self, int n) -> int { return n < 2 ? n : self(n - 1) + self(n - 2); }; What does the explicit object parameter provide here?",
      "options": [
        "self refers to the this pointer of the enclosing member function, so the lambda can access class members",
        "It requires the lambda to capture [this] before it can be used",
        "It type-erases the lambda, giving it the same call overhead as std::function",
        "self names the closure object itself, so the lambda can call itself recursively without std::function and without passing itself as an extra argument"
      ],
      "answer": 3,
      "explain": "Deducing this (C++23) lets a lambda declare an explicit object parameter that binds to the closure itself, making natural recursion possible: self(n - 1) re-invokes the same lambda. Pre-C++23 workarounds were assigning to a std::function (indirection overhead, no auto parameters for self) or the Y-combinator trick of passing the lambda to itself. It has nothing to do with the enclosing class's this and adds no type erasure."
    },
    {
      "type": "code",
      "tag": "Recursive lambda (pre-C++23)",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nint main() {\n    auto fact = [](auto self, int n) -> int {\n        return n <= 1 ? 1 : n * self(self, n - 1);\n    };\n    std::cout << fact(fact, 5);\n}",
      "options": [
        "120",
        "It does not compile: a lambda cannot receive its own closure as an argument",
        "24",
        "Nothing — it recurses forever and overflows the stack"
      ],
      "answer": 0,
      "explain": "A generic lambda can take itself as its first parameter (a Y-combinator-style trick): fact(fact, 5) passes the closure in as self, and each level calls self(self, n - 1). The recursion terminates at n <= 1, computing 5 * 4 * 3 * 2 * 1 = 120. The explicit -> int return type is needed because the recursive call would otherwise require deducing the return type from itself; C++23's deducing this makes this pattern much cleaner."
    },
    {
      "type": "code",
      "tag": "IIFE for const init",
      "question": "What is the result of this program?",
      "code": "#include <iostream>\n\nint main() {\n    const int table = [] {\n        int sum = 0;\n        for (int i = 1; i <= 4; ++i) sum += i * i;\n        return sum;\n    }();\n    std::cout << table;\n}",
      "options": [
        "It does not compile: a lambda body cannot be followed by ()",
        "table holds the closure object itself, so the << operator fails to compile",
        "30",
        "16"
      ],
      "answer": 2,
      "explain": "This is an immediately invoked lambda: the trailing () calls the closure on the spot, so table is initialized with the returned int, not with the lambda. The loop sums 1 + 4 + 9 + 16 = 30. The idiom lets a variable that needs multi-statement initialization logic still be declared const, instead of being default-constructed and then mutated."
    },
    {
      "type": "mcq",
      "tag": "function vs template vs function_ref",
      "question": "You must accept a callback in an API. Compare taking std::function<int(int)>, a template parameter (template <typename F> void run(F f)), and a non-owning function_ref-style parameter. Which analysis is accurate?",
      "options": [
        "All three are equivalent after optimization; the choice is purely stylistic",
        "std::function owns a type-erased copy of the callable (possibly heap-allocating for large captures) and calls through an indirection; a template parameter avoids type erasure and can inline; a function_ref-style view is a cheap non-owning reference — ideal as a parameter, but unsafe to store beyond the call",
        "A template parameter always type-erases; std::function is what enables inlining",
        "std::function cannot hold lambdas with captures, which is why templates exist"
      ],
      "answer": 1,
      "explain": "std::function is an owning type-erasure wrapper: it copies the callable, may allocate when the callable outgrows the small-buffer optimization, and every call goes through an indirect dispatch. A template parameter binds the exact closure type, enabling inlining with zero overhead, at the cost of being a template. A function_ref-style type (standardized in C++26, easy to hand-roll) just stores a pointer to the callable plus an invoker, so it is cheap to pass but must not outlive the referenced callable."
    },
    {
      "type": "code",
      "tag": "bind_front",
      "question": "What does this C++20 program print?",
      "code": "#include <functional>\n#include <iostream>\n\nint sub(int a, int b, int c) { return a - b - c; }\n\nint main() {\n    auto f = std::bind_front(sub, 100, 20);\n    std::cout << f(5);\n}",
      "options": [
        "It does not compile: sub takes three arguments but f is called with only one",
        "-75",
        "85",
        "75"
      ],
      "answer": 3,
      "explain": "std::bind_front(sub, 100, 20) binds 100 and 20 to the leading parameters a and b; arguments supplied at call time fill the remaining parameters in order, so f(5) invokes sub(100, 20, 5) = 100 - 20 - 5 = 75. Unlike std::bind, bind_front needs no placeholders, does not silently ignore extra arguments, and propagates noexcept — which is why it is the recommended replacement."
    },
    {
      "type": "mcq",
      "tag": "bind_back (C++23)",
      "question": "Given int sub(int a, int b, int c) { return a - b - c; } and auto g = std::bind_back(sub, 5); (C++23), what does g(100, 20) compute?",
      "options": [
        "sub(100, 20, 5) = 75, because bind_back binds 5 to the last parameter while call-site arguments fill the front",
        "sub(5, 100, 20) = -115, because bound arguments always come first",
        "sub(20, 100, 5): bind_back also reverses the call-site arguments",
        "It does not compile: bind_back requires placeholders for the unbound parameters"
      ],
      "answer": 0,
      "explain": "std::bind_back is the mirror of bind_front: the bound arguments are appended after the call-site arguments, so g(100, 20) calls sub(100, 20, 5) = 75. Like bind_front, it decay-copies its bound arguments (use std::ref for by-reference semantics) and needs no placeholders. It is convenient for fixing trailing defaults-like parameters of an existing function."
    },
    {
      "type": "code",
      "tag": "Container comparisons",
      "question": "What does this C++20 program print?",
      "code": "#include <compare>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> a{1, 2, 3}, b{1, 2, 4}, c{1, 2};\n    std::cout << (a < b) << (c < a)\n              << ((a <=> b) == std::strong_ordering::less);\n}",
      "options": [
        "011",
        "110",
        "111",
        "101"
      ],
      "answer": 2,
      "explain": "Containers compare lexicographically: a < b because the first difference is 3 < 4, printing 1. A sequence that is a strict prefix compares less, so c < a is also true. Since C++20, vector supports operator<=> directly, and for vector<int> it yields std::strong_ordering — a <=> b is strong_ordering::less, so the final comparison also prints 1, giving 111."
    },
    {
      "type": "code",
      "tag": "Defaulted == deleted",
      "question": "What is the result of compiling this C++20 code?",
      "code": "struct NoEq {\n    int v;\n};\n\nstruct Wrapper {\n    NoEq n;\n    bool operator==(const Wrapper&) const = default;\n};\n\nint main() {\n    Wrapper a{{1}}, b{{1}};\n    return a == b;\n}",
      "options": [
        "It compiles and returns 1: the compiler compares the NoEq member byte by byte",
        "It fails to compile at a == b: the defaulted operator== is implicitly deleted because member NoEq provides no operator==",
        "It fails to compile at the '= default;' declaration itself",
        "It compiles: defaulting Wrapper's operator== implicitly generates NoEq::operator== as well"
      ],
      "answer": 1,
      "explain": "A class does not get operator== for free — NoEq never declares one, so Wrapper's defaulted operator==, which must compare members, is defined as deleted. Crucially, declaring it '= default' is still well-formed; the hard error appears only when a == b tries to call the deleted operator (compilers typically warn at the declaration). Defaulting a comparison never synthesizes operators for member types, and memberwise byte comparison does not exist in C++."
    },
    {
      "type": "mcq",
      "tag": "Category conversions",
      "question": "Which implicit conversions exist between the C++20 comparison category types std::strong_ordering, std::weak_ordering, and std::partial_ordering?",
      "options": [
        "partial_ordering converts to strong_ordering via static_cast, since both have less/equivalent/greater",
        "All three interconvert freely; they are just different names for the same three values",
        "No conversions exist; each category is a completely isolated type",
        "strong_ordering implicitly converts to weak_ordering and partial_ordering, and weak_ordering converts to partial_ordering — never the reverse, because a weaker result cannot manufacture stronger guarantees"
      ],
      "answer": 3,
      "explain": "Conversions only go from stronger to weaker: a strong ordering (substitutable equality) is trivially also a valid weak or partial ordering, but a partial ordering may contain unordered values that no strong ordering can represent. This one-way flow is what makes the common comparison category of a composite type degrade to its weakest member's category. Not even static_cast can go the other way — you would use functions like std::strong_order for that."
    },
    {
      "type": "code",
      "tag": "Declared category too strong",
      "question": "What is the result of compiling this C++20 code?",
      "code": "#include <compare>\n\nstruct Price {\n    double amount;\n    std::strong_ordering operator<=>(const Price&) const = default;\n};\n\nint main() {\n    Price a{1.0}, b{2.0};\n    return (a <=> b) < 0;\n}",
      "options": [
        "It fails to compile where a <=> b is used: double's comparison category is std::partial_ordering, which cannot convert to the declared std::strong_ordering, so the defaulted operator is unusable",
        "It compiles and returns 1",
        "It fails to compile: a defaulted operator<=> must use auto as its return type",
        "It compiles but has undefined behavior if amount is ever NaN"
      ],
      "answer": 0,
      "explain": "You may default operator<=> with an explicit return type, but each member's comparison result must then convert to that type. Comparing double yields partial_ordering (NaN is unordered), which does not convert to the stronger strong_ordering, so the defaulted operator is defined as deleted and the use a <=> b is ill-formed. Declaring the return type as std::partial_ordering — or keeping auto and letting the compiler deduce it — fixes the code."
    },
    {
      "type": "mcq",
      "tag": "Reversed candidates ambiguity",
      "question": "A C++17 codebase defines both free functions bool operator==(const A&, const B&) and bool operator==(const B&, const A&). After switching to C++20, the expression a == b (a is an A, b is a B) fails to compile. Why?",
      "options": [
        "C++20 forbids operator== between two different types",
        "C++20 requires operator<=> to be defined before any operator== is considered",
        "C++20 also considers rewritten candidates: for a == b it additionally tries operator==(const B&, const A&) with the arguments reversed, which now competes with the direct candidate and makes the call ambiguous; deleting the redundant overload fixes it",
        "Comparison operators must be member functions in C++20"
      ],
      "answer": 2,
      "explain": "C++20's rewritten-candidate rules make operator== symmetric: b == a's operator is considered for a == b with the arguments swapped. Code that predates this and manually wrote both directions now has two equally good candidates — the direct one and the reversed one — so overload resolution is ambiguous (compilers may accept it with a warning, but it is not portable). The modern fix is to keep a single operator== and let the compiler handle symmetry."
    },
    {
      "type": "code",
      "tag": "using enum",
      "question": "What is the result of this C++20 program?",
      "code": "#include <iostream>\n\nenum class Color { Red, Green, Blue };\n\nconst char* name(Color c) {\n    switch (c) {\n        using enum Color;\n        case Red:   return \"R\";\n        case Green: return \"G\";\n        case Blue:  return \"B\";\n    }\n    return \"?\";\n}\n\nint main() { std::cout << name(Color::Green); }",
      "options": [
        "It does not compile: case labels for a scoped enum must be fully qualified as Color::Green",
        "G",
        "?",
        "It does not compile: using enum is only allowed at namespace scope"
      ],
      "answer": 1,
      "explain": "C++20's using enum declaration imports all enumerators of Color into the enclosing scope — here the switch block — so the case labels can drop the Color:: qualification while the enum stays safely scoped everywhere else. The switch runs the Green case and prints G. This is the idiomatic middle ground between verbose qualification and falling back to unscoped enums; it works at namespace, class, function, and block scope."
    },
    {
      "type": "code",
      "tag": "Scoped enum conversions",
      "question": "What is the result of compiling this code?",
      "code": "enum Old { A = 1 };\nenum class New { B = 2 };\n\nint main() {\n    int x = A;\n    int y = New::B;\n    return x + y;\n}",
      "options": [
        "It compiles and returns 3",
        "It fails at int x = A;: enumerators always require a cast to int",
        "Both initializations fail: no enumeration type converts to int implicitly",
        "int x = A; compiles because unscoped enums implicitly convert to int, but int y = New::B; fails: scoped enums have no implicit conversion to their underlying type"
      ],
      "answer": 3,
      "explain": "Unscoped (plain) enums keep C's behavior of implicitly converting to integer types, so x = A is fine. Scoped enums (enum class) deliberately drop that conversion — it is one of their two safety improvements, alongside not leaking enumerator names — so New::B needs static_cast<int>(New::B) (or std::to_underlying in C++23). The trade-off is intentional: accidental arithmetic on category-like values becomes a compile error."
    },
    {
      "type": "mcq",
      "tag": "to_underlying (C++23)",
      "question": "What does C++23's std::to_underlying(e) do for an enum value e, and why prefer it over a plain cast?",
      "options": [
        "It is exactly static_cast<std::underlying_type_t<decltype(e)>>(e): it yields the value in the enum's true underlying type without you spelling that type, so it stays correct if the underlying type ever changes — unlike a hard-coded static_cast<int>",
        "It converts an integer back into the enum, validating that the value names an actual enumerator",
        "It returns the enumerator's name as a std::string_view",
        "It only works on unscoped enums, since scoped enums hide their underlying type"
      ],
      "answer": 0,
      "explain": "std::to_underlying (from <utility>) is a one-line convenience: static_cast to the enum's underlying type. Its value is maintainability and correctness — casting to a hand-written int silently truncates or changes signedness if the enum is later declared with, say, std::uint64_t as its underlying type, while to_underlying always tracks the real type. It performs no validation and works with both scoped and unscoped enums."
    },
    {
      "type": "mcq",
      "tag": "constexpr vector limits",
      "question": "In C++20, constexpr std::vector<int> v{1, 2, 3}; at namespace scope fails to compile, yet using std::vector inside a constexpr function works fine. Why?",
      "options": [
        "std::vector is not constexpr-enabled in C++20 at all; only std::array can be used",
        "The variable simply needs constinit instead of constexpr",
        "Compile-time allocation in C++20 is transient: memory allocated during constant evaluation must be deallocated before that evaluation ends, so a vector may live entirely within a constexpr computation but cannot persist into a constexpr variable that outlives it",
        "Namespace-scope constexpr variables are forbidden from having destructors"
      ],
      "answer": 2,
      "explain": "C++20 made std::vector and std::string constexpr precisely so they can be used as scratch space during constant evaluation, but the allocation rules are transient: whatever is new-ed at compile time must be delete-d before the evaluation finishes. A constexpr variable of vector type would need its heap buffer to survive into the runtime image, which is not allowed. The standard idiom is to compute with a vector inside a constexpr function and return a fixed-size result such as a std::array."
    },
    {
      "type": "code",
      "tag": "constexpr vector in action",
      "question": "What is the result of this C++20 program?",
      "code": "#include <iostream>\n#include <numeric>\n#include <vector>\n\nconstexpr int sum_to(int n) {\n    std::vector<int> v(n);\n    std::iota(v.begin(), v.end(), 1);\n    int s = 0;\n    for (int x : v) s += x;\n    return s;\n}\n\nint main() {\n    constexpr int s = sum_to(10);\n    static_assert(s == 55);\n    std::cout << s;\n}",
      "options": [
        "It does not compile: constexpr functions cannot allocate memory",
        "55",
        "0",
        "It compiles only if sum_to is declared consteval instead of constexpr"
      ],
      "answer": 1,
      "explain": "Because the vector is created, filled via std::iota, summed, and destroyed entirely inside one constant evaluation, this satisfies C++20's transient-allocation rule; s becomes 55 at compile time and the static_assert proves it. constexpr (not consteval) suffices — the function would also remain callable at run time. The sum 1 + 2 + ... + 10 = 55 is printed."
    },
    {
      "type": "code",
      "tag": "span views",
      "question": "What does this C++20 program print?",
      "code": "#include <iostream>\n#include <span>\n\nint main() {\n    int arr[]{10, 20, 30, 40, 50};\n    std::span<int> s{arr};\n    auto sub = s.subspan(1, 3);\n    std::cout << sub.front() << ' ' << sub.back() << ' ' << s.last(2)[0];\n}",
      "options": [
        "20 30 40",
        "10 30 50",
        "20 40 50",
        "20 40 40"
      ],
      "answer": 3,
      "explain": "subspan(1, 3) is a view of elements at indices 1..3, i.e. {20, 30, 40}, so front() is 20 and back() is 40. s.last(2) views the final two elements {40, 50}, whose element [0] is 40. All three are non-owning views into the same array — no copying occurs — and like operator[] on span, none of these perform bounds checking."
    },
    {
      "type": "code",
      "tag": "std::byte operations",
      "question": "What does this program print?",
      "code": "#include <cstddef>\n#include <iostream>\n\nint main() {\n    std::byte b{0b0011};\n    b <<= 2;\n    b |= std::byte{0b0001};\n    std::cout << std::to_integer<int>(b);\n}",
      "options": [
        "13",
        "12",
        "49",
        "It does not compile: std::byte does not support <<= with an int operand"
      ],
      "answer": 0,
      "explain": "std::byte supports exactly the bitwise operators — <<, >>, |, &, ^ and their compound forms — with an integer shift count, so b <<= 2 turns 0b0011 into 0b1100 (12) and OR-ing 0b0001 gives 13. Reading the numeric value requires the explicit std::to_integer<int>(b); there is no implicit conversion. Arithmetic like b + 1 would be the operation that fails to compile."
    },
    {
      "type": "mcq",
      "tag": "Why std::byte",
      "question": "unsigned char already works for raw buffer manipulation. What does C++17's std::byte add?",
      "options": [
        "It is guaranteed to be exactly 8 bits, unlike char",
        "It is a class with bounds-checked accessors for safer buffers",
        "It is a scoped enumeration over unsigned char that supports only bitwise operations plus an explicit std::to_integer conversion — it cannot be accidentally used in arithmetic or printed as a character, so it expresses 'this is raw memory, not a number or text' while keeping char-like aliasing permission",
        "It is faster than unsigned char because it bypasses aliasing analysis"
      ],
      "answer": 2,
      "explain": "std::byte (defined in <cstddef> as enum class byte : unsigned char) is about intent, not performance: a byte cannot take part in arithmetic, does not stream as a character, and never implicitly converts to an integer. Like char types, it may alias any object's storage, so it is fully usable for inspecting raw memory. Its size is that of char — at least 8 bits, not exactly 8."
    },
    {
      "type": "mcq",
      "tag": "std::endian",
      "question": "What is the standard C++20 way to detect the platform's byte order at compile time?",
      "options": [
        "Write an int through a union of int and char[4] and inspect the first byte in an if statement",
        "Compare std::endian::native (from <bit>) against std::endian::little or std::endian::big, e.g. in if constexpr; on an exotic mixed-endian platform, native equals neither",
        "Use the standard macro __BYTE_ORDER__, which all C++20 compilers must define",
        "Call std::byte::order() at program startup"
      ],
      "answer": 1,
      "explain": "std::endian is an enum in <bit> whose constants little, big, and native allow a compile-time test such as if constexpr (std::endian::native == std::endian::big). If a platform is all-little then native == little, all-big then native == big; on a mixed-endian architecture native equals neither value. __BYTE_ORDER__ is a compiler extension, and the union trick is a runtime test that also flirts with type-punning rules."
    },
    {
      "type": "code",
      "tag": "bitset",
      "question": "What does this program print?",
      "code": "#include <bitset>\n#include <iostream>\n\nint main() {\n    std::bitset<8> bits(\"10110000\");\n    bits.flip(0);\n    std::cout << bits.count() << ' ' << bits.test(7) << ' ' << bits.to_ulong();\n}",
      "options": [
        "3 1 176",
        "4 0 177",
        "3 0 13",
        "4 1 177"
      ],
      "answer": 3,
      "explain": "The string constructor reads left to right from the most significant bit, so \"10110000\" is the value 176 with bit 7 set and bit 0 clear. flip(0) sets the least significant bit, giving 177 with four set bits: count() is 4, test(7) is true (prints 1), and to_ulong() is 177. Remember that bitset indexing is by bit position, the reverse of the string's reading order."
    },
    {
      "type": "code",
      "tag": "Parenthesized aggregate init",
      "question": "What is the result of this C++20 program?",
      "code": "#include <iostream>\n#include <string>\n\nstruct Employee {\n    std::string name;\n    int id = 7;\n};\n\nint main() {\n    Employee e(\"Jan\");\n    auto* p = new Employee(\"Ada\", 1);\n    std::cout << e.name << e.id << p->id;\n    delete p;\n}",
      "options": [
        "Jan71",
        "It does not compile: Employee is an aggregate with no matching constructor",
        "Jan7, then reading p->id is undefined behavior because id was never initialized",
        "Jan01"
      ],
      "answer": 0,
      "explain": "C++20 allows initializing aggregates with parentheses, so Employee e(\"Jan\") and new Employee(\"Ada\", 1) are valid despite there being no constructor; before C++20 both lines were errors. Trailing members without an initializer still get their default member initializer, so e.id is 7, and p->id was explicitly set to 1 — printing Jan71. This change is what lets make_unique, emplace_back, and similar forwarding functions work with aggregates."
    },
    {
      "type": "mcq",
      "tag": "Parens vs braces for aggregates",
      "question": "For a C++20 aggregate, Agg a(args...) and Agg a{args...} are not perfectly equivalent. Which is a real difference?",
      "options": [
        "The parenthesized form requires an initializer for every member",
        "The braced form evaluates its initializers in unspecified order; the parenthesized form is left to right",
        "The parenthesized form permits narrowing conversions and does not lifetime-extend temporaries bound to reference members, and it performs no brace elision for nested aggregates — braced initialization forbids narrowing and does extend such lifetimes",
        "There is no difference; C++20 defines them to be identical"
      ],
      "answer": 2,
      "explain": "Parenthesized aggregate initialization is deliberately specified to behave like a constructor call: narrowing such as Agg a(3.14) into an int member is allowed, a temporary bound to a reference member dangles rather than being lifetime-extended, and nested braces cannot be elided. Both forms evaluate initializers left to right and both allow trailing members to fall back to default member initializers or value initialization. Braces remain the safer default; parentheses exist mainly so forwarding functions like make_unique work."
    },
    {
      "type": "mcq",
      "tag": "Aggregate definition change",
      "question": "struct Token { Token() = delete; int id; }; — In C++17, Token t{}; surprisingly compiled and created an object despite the deleted constructor. What is the situation in C++20?",
      "options": [
        "It still compiles: list-initialization of an aggregate never invokes constructors",
        "It fails to compile: C++20 tightened the aggregate definition so that any user-declared constructor — even one that is deleted or defaulted — makes the class a non-aggregate, so Token t{}; now tries to call the deleted default constructor",
        "It fails to compile only if Token also declares a destructor",
        "C++20 removed brace initialization for structs with deleted constructors but allows Token t();"
      ],
      "answer": 1,
      "explain": "In C++17 a deleted constructor was still 'not user-provided', so Token remained an aggregate and Token t{} bypassed the deletion entirely — an infamous loophole that made = delete meaningless for value construction. C++20 changed the aggregate definition to exclude any class with a user-declared constructor, whether deleted, defaulted, or defined. Token t{} therefore performs ordinary initialization, hits the deleted default constructor, and is ill-formed — exactly what the author of = delete intended."
    },
    {
      "type": "code",
      "tag": "CTAD for aggregates",
      "question": "What is the result of this C++20 program?",
      "code": "#include <iostream>\n\ntemplate <typename T, typename U>\nstruct Pair {\n    T first;\n    U second;\n};\n\nint main() {\n    Pair p{42, 3.5};\n    std::cout << p.first + p.second;\n}",
      "options": [
        "It does not compile: aggregates need a user-written deduction guide for CTAD",
        "45",
        "It does not compile: T and U cannot be deduced from a braced initializer list",
        "45.5"
      ],
      "answer": 3,
      "explain": "C++20 extended class template argument deduction to aggregates: from Pair p{42, 3.5} the compiler deduces Pair<int, double> directly from the element types, with no deduction guide required (pre-C++20 you had to write one, which is why the classic overload-set idiom for std::visit carried a guide). The sum 42 + 3.5 is the double 45.5."
    },
    {
      "type": "code",
      "tag": "[[fallthrough]]",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nint main() {\n    int n = 1, total = 0;\n    switch (n) {\n        case 0: total += 1; [[fallthrough]];\n        case 1: total += 2; [[fallthrough]];\n        case 2: total += 4; break;\n        case 3: total += 8;\n    }\n    std::cout << total;\n}",
      "options": [
        "6",
        "2",
        "7",
        "It does not compile: [[fallthrough]] may only appear before the final case of a switch"
      ],
      "answer": 0,
      "explain": "[[fallthrough]] changes nothing about execution — it only documents that the fall-through is intentional and suppresses the compiler warning that an unannotated fall-through would trigger. Execution enters at case 1 (adding 2), falls through to case 2 (adding 4), and the break stops before case 3, printing 6. Case 0 never runs because switch jumps directly to the matching label."
    },
    {
      "type": "mcq",
      "tag": "maybe_unused / deprecated",
      "question": "What do the standard attributes [[maybe_unused]] and [[deprecated(\"use v2\")]] actually do?",
      "options": [
        "[[maybe_unused]] removes the entity from the object file if it is unused; [[deprecated]] makes any use a hard compile error",
        "Both are compiler-specific extensions with no standard-mandated meaning",
        "[[maybe_unused]] suppresses the unused-entity warning for variables, parameters, functions, and more; [[deprecated]] makes each use of the entity produce a compiler warning carrying the given message — neither changes runtime behavior or generated code semantics",
        "They only apply to variables; functions and types cannot carry attributes"
      ],
      "answer": 2,
      "explain": "Both attributes affect diagnostics only. [[maybe_unused]] is typically used on parameters kept for interface reasons or variables used only inside assert, silencing the unused warning; [[deprecated]] steers callers away from an old API with a warning (not an error) that can include a migration hint. Both can be applied to a wide range of entities — functions, types, variables, enumerators, and more."
    },
    {
      "type": "code",
      "tag": "noexcept operator",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nvoid f() {}\nvoid g() noexcept {}\nint h() noexcept { return 1; }\n\nint main() {\n    std::cout << noexcept(f()) << noexcept(g())\n              << noexcept(f) << noexcept(h() + 1);\n}",
      "options": [
        "0101",
        "0111",
        "0110",
        "0011"
      ],
      "answer": 1,
      "explain": "The noexcept operator asks whether its (unevaluated) operand can throw. f() calls a potentially-throwing function, so 0; g() is noexcept, so 1. The trap is noexcept(f): without parentheses for a call, the operand merely names the function — an expression that cannot itself throw — so it is 1 regardless of f's exception specification. h() + 1 combines a noexcept call and integer addition, neither of which can throw, giving the final 1."
    },
    {
      "type": "code",
      "tag": "Safe integer comparison",
      "question": "What does this C++20 program print (assuming 32-bit int)?",
      "code": "#include <iostream>\n#include <utility>\n\nint main() {\n    int i = -1;\n    unsigned int u = 1;\n    std::cout << (i < u) << std::cmp_less(i, u);\n}",
      "options": [
        "11",
        "10",
        "00",
        "01"
      ],
      "answer": 3,
      "explain": "In i < u the usual arithmetic conversions convert the int -1 to unsigned, wrapping to 4294967295, so the comparison is false and prints 0 — the classic signed/unsigned trap that compilers flag with -Wsign-compare. std::cmp_less (from <utility>, C++20) compares the mathematical values, so -1 < 1 is correctly true, printing 1. The std::cmp_* functions accept only standard integer types — passing bool or character types is ill-formed."
    },
    {
      "type": "code",
      "tag": "std::midpoint",
      "question": "What does this C++20 program print?",
      "code": "#include <iostream>\n#include <numeric>\n\nint main() {\n    std::cout << std::midpoint(3, 8) << ' '\n              << std::midpoint(8, 3) << ' '\n              << std::midpoint(4'000'000'000u, 4'000'000'002u);\n}",
      "options": [
        "5 6 4000000001",
        "5 5 4000000001",
        "6 6 4000000001",
        "5 6 then undefined behavior from unsigned overflow"
      ],
      "answer": 0,
      "explain": "For integers, std::midpoint rounds a half-way result toward its first argument: midpoint(3, 8) is 5 while midpoint(8, 3) is 6 — the function is deliberately not symmetric in that case. Its other selling point is overflow safety: (a + b) / 2 with two values near 4 billion would wrap, but midpoint computes 4000000001 correctly. It also works for pointers into the same array."
    },
    {
      "type": "mcq",
      "tag": "std::lerp",
      "question": "What does std::lerp(10.0, 20.0, 1.5) (C++20, <cmath>) return, and is the interpolation parameter clamped?",
      "options": [
        "20.0 — t is clamped to the range [0, 1]",
        "15.0 — lerp ignores t and always returns the midpoint",
        "25.0 — lerp computes a + t * (b - a) and does not clamp, so t outside [0, 1] extrapolates beyond the endpoints",
        "It is undefined behavior to pass t outside [0, 1]"
      ],
      "answer": 2,
      "explain": "std::lerp is linear interpolation a + t * (b - a): with t = 1.5 the result is 10 + 1.5 * 10 = 25, a legitimate extrapolation — no clamping and no UB. The standard version also gives guarantees a naive hand-rolled formula lacks: exactness (lerp(a, b, 0) == a, lerp(a, b, 1) == b), monotonicity, and consistent behavior even when a and b have opposite signs."
    },
    {
      "type": "mcq",
      "tag": "std::numbers",
      "question": "You need the constant pi as a float in standard C++20. What is the correct approach?",
      "options": [
        "Use M_PI from <cmath>, which the C++ standard guarantees on all platforms",
        "Use std::numbers::pi_v<float> from <numbers>; the plain std::numbers::pi is an inline constexpr double",
        "Call std::numbers::pi<float>() as a function template",
        "Use std::math::pi, defined in <cmath> since C++20"
      ],
      "answer": 1,
      "explain": "C++20's <numbers> header finally standardized mathematical constants: std::numbers::pi (plus e, sqrt2, phi, ln2, and others) is an inline constexpr double, and each has a variable-template form like pi_v<float> or pi_v<long double> for other precisions. M_PI is a POSIX/compiler extension, not guaranteed by the C++ standard — historically requiring macros like _USE_MATH_DEFINES on some toolchains."
    },
    {
      "type": "code",
      "tag": "starts_with / ends_with",
      "question": "What does this C++20 program print?",
      "code": "#include <iostream>\n#include <string_view>\n\nint main() {\n    std::string_view s = \"config.local.json\";\n    std::cout << s.starts_with(\"config\") << s.ends_with(\".json\")\n              << s.starts_with('C');\n}",
      "options": [
        "111",
        "100",
        "011",
        "110"
      ],
      "answer": 3,
      "explain": "C++20 added starts_with and ends_with to std::string and std::string_view, each with overloads for a string_view, a single character, and a const char*. The prefix \"config\" and suffix \".json\" both match (1 and 1), but the character overload is case-sensitive: the string starts with lowercase 'c', not 'C', so the last test prints 0. C++23 completes the trio with contains()."
    },
    {
      "type": "mcq",
      "tag": "Where starts_with exists",
      "question": "Which standard library types provide the starts_with / ends_with member functions in C++20?",
      "options": [
        "Only std::string and std::string_view; std::span offers first() and last() to build subviews but has no content-testing starts_with — and C++23 additionally gives the string types contains()",
        "Every contiguous container, including std::vector and std::array",
        "std::string, std::string_view, and std::span all gained them in C++20",
        "Only std::string_view; std::string requires converting first"
      ],
      "answer": 0,
      "explain": "starts_with and ends_with are text-oriented members added to std::string and std::string_view only. It is easy to assume std::span has them too, but span's first(n) and last(n) return subviews rather than testing contents — to check whether a span begins with a given sequence you would compare a subspan yourself (e.g. with std::ranges::equal). C++23's starts_with/ends_with ranges algorithms generalize the operation to arbitrary ranges."
    },
    {
      "type": "code",
      "tag": "Calendar arithmetic",
      "question": "What does this C++20 program print?",
      "code": "#include <chrono>\n#include <iostream>\n\nint main() {\n    using namespace std::chrono;\n    year_month_day d = 2024y / January / 31;\n    d += months{1};\n    std::cout << d.ok() << ' ' << static_cast<unsigned>(d.day());\n}",
      "options": [
        "1 29 (the date snaps to the last day of February)",
        "1 31",
        "0 31",
        "It does not compile: months cannot be added to a year_month_day"
      ],
      "answer": 2,
      "explain": "Adding months to a year_month_day is pure calendar arithmetic on the month field: January 31 plus one month is February 31, which is stored as-is. Such a date reports ok() == false while still holding day 31, hence \"0 31\". You must handle the overflow yourself — the common snap-to-last-day idiom is ymd.year()/ymd.month()/last, or normalize by round-tripping through sys_days (which would yield March 2 in a leap year)."
    },
    {
      "type": "code",
      "tag": "sys_days and weekday",
      "question": "What does this C++20 program print? (March 1, 2024 fell on a Friday.)",
      "code": "#include <chrono>\n#include <iostream>\n\nint main() {\n    using namespace std::chrono;\n    sys_days d = 2024y / March / 1;\n    weekday wd{d};\n    std::cout << wd.c_encoding()\n              << (d + days{3} == sys_days{2024y / March / 4});\n}",
      "options": [
        "41",
        "51",
        "61",
        "It does not compile: a weekday cannot be constructed from sys_days"
      ],
      "answer": 1,
      "explain": "Converting the calendar date to sys_days gives a day-precision time_point, from which weekday is directly constructible; c_encoding() numbers the days with Sunday = 0, so Friday prints 5 (iso_encoding() would print Friday as 5 too, but Sunday as 7). Arithmetic on sys_days is exact day counting, so d + days{3} equals March 4, printing 1. This calendar/serial round trip is the standard way to do day-of-week and date-difference computations."
    },
    {
      "type": "mcq",
      "tag": "Formatting chrono types",
      "question": "With std::chrono::sys_days d = 2024y / March / 1;, what does std::format(\"{:%F}\", d) produce in C++20?",
      "options": [
        "\"03/01/2024\" — %F is the locale-dependent short date",
        "It does not compile: chrono types cannot be used with std::format",
        "\"2024-03-01 00:00:00\" — %F always includes the time of day",
        "\"2024-03-01\" — chrono types have std::format support, and %F is the ISO 8601 date, equivalent to %Y-%m-%d"
      ],
      "answer": 3,
      "explain": "C++20 gives all the chrono types formatter specializations with strftime-like conversion specifiers: %F prints the ISO date, %T a time, %A a weekday name, and so on. A sys_days holds only day precision, so %F yields exactly \"2024-03-01\" with no time part. The chrono types also have plain operator<< insertions, so std::cout << d prints the same ISO form without any format string."
    },
    {
      "type": "mcq",
      "tag": "zoned_time",
      "question": "What does C++20's std::chrono::zoned_time represent?",
      "options": [
        "A pairing of a time_zone (obtained via current_zone() or locate_zone(\"Europe/Brussels\")) with a sys_time instant: it converts between the UTC instant and the local wall-clock representation, including DST rules, without altering the underlying instant",
        "A time_point that has been permanently shifted by the zone's UTC offset",
        "A formatting-only wrapper; actual zone conversion needs a third-party library even in standard C++",
        "A clock type that ticks in local time instead of UTC"
      ],
      "answer": 0,
      "explain": "zoned_time bundles a pointer into the standard's IANA time-zone database with a system-clock time_point. Asking for get_sys_time() returns the absolute UTC instant, while get_local_time() returns the wall-clock time in that zone with DST applied — the instant itself never changes, only its representation. The tzdb is part of standard C++20 (<chrono>), though library support for it arrived later on some implementations."
    },
    {
      "type": "code",
      "tag": "path decomposition",
      "question": "What does this program print? (Path stream output is quoted.)",
      "code": "#include <filesystem>\n#include <iostream>\n\nint main() {\n    std::filesystem::path a = \"/home/user/.gitignore\";\n    std::filesystem::path b = \"archive.tar.gz\";\n    std::cout << a.stem() << ' ' << a.extension() << ' ' << b.stem();\n}",
      "options": [
        "\"\" \".gitignore\" \"archive.tar\"",
        "\".gitignore\" \".gitignore\" \"archive\"",
        "\".gitignore\" \"\" \"archive.tar\"",
        "\".git\" \"ignore\" \"archive\""
      ],
      "answer": 2,
      "explain": "A filename whose only dot is the leading one is treated as having no extension: for .gitignore, stem() is the whole name \".gitignore\" and extension() is empty — dotfiles are names, not extensions. Decomposition looks only at the last dot, so archive.tar.gz splits into stem \"archive.tar\" and extension \".gz\". Streaming a path quotes it, which is why the output shows the surrounding double quotes."
    },
    {
      "type": "mcq",
      "tag": "directory_iterator errors",
      "question": "You must scan a directory tree that may contain unreadable subdirectories, and the scanning code is not allowed to throw. What is the correct approach?",
      "options": [
        "Wrap the loop in try/catch anyway; the filesystem library offers no non-throwing API",
        "Use the std::error_code overloads — e.g. directory_iterator(dir, ec) and iterator increment with ec — which report failures through ec instead of throwing, and construct the recursive_directory_iterator with directory_options::skip_permission_denied so unreadable subdirectories are skipped rather than being an error",
        "Nothing special is needed: directory_iterator silently skips unreadable entries by default",
        "Use std::filesystem::safe_iterator, added in C++20 for exactly this purpose"
      ],
      "answer": 1,
      "explain": "Nearly every filesystem operation comes in two flavors: a throwing one (raising std::filesystem::filesystem_error) and an overload taking a std::error_code out-parameter that never throws for environmental failures. For traversal, the iterators' constructors and increment both have error_code overloads, and recursive_directory_iterator additionally accepts directory_options::skip_permission_denied to keep walking past forbidden directories. There is no safe_iterator, and by default hitting an unreadable directory is an error, not a silent skip."
    },
    {
      "type": "mcq",
      "tag": "exists / status / space",
      "question": "Which statement about std::filesystem's query functions is correct?",
      "options": [
        "exists(p) never throws; it simply returns false on any error",
        "symlink_status(p) follows the symbolic link and reports the target's type",
        "space(p) returns the size in bytes of the file p",
        "exists(p) can throw filesystem_error for errors other than the file simply not existing, while exists(p, ec) reports through the error_code instead; status(p) follows symlinks whereas symlink_status(p) describes the link itself; and space(p) reports capacity/free/available bytes for the filesystem containing p"
      ],
      "answer": 3,
      "explain": "exists follows the library-wide two-flavor pattern: the plain overload throws on genuine errors (e.g. permission failures while checking), and the error_code overload is non-throwing. status resolves symlinks to describe the target, while symlink_status is the one that reports the link itself — the naming trips people up. space returns a space_info struct about the containing volume, not a file size; that is file_size(p)."
    },
    {
      "type": "code",
      "tag": "Enum underlying type",
      "question": "What does this program print?",
      "code": "#include <cstdint>\n#include <iostream>\n#include <type_traits>\n\nenum class Flags : std::uint8_t { None = 0, All = 255 };\nenum class Plain { X };\n\nint main() {\n    std::cout << sizeof(Flags) << ' '\n              << std::is_same_v<std::underlying_type_t<Plain>, int> << ' '\n              << static_cast<int>(Flags::All);\n}",
      "options": [
        "1 1 255",
        "4 1 255",
        "1 0 255",
        "It does not compile: a scoped enum cannot specify std::uint8_t as its underlying type"
      ],
      "answer": 0,
      "explain": "A fixed underlying type controls the enum's size and range: with std::uint8_t, sizeof(Flags) is 1 and the value 255 fits exactly. A scoped enum without an explicit underlying type always defaults to int — so the is_same_v check prints 1 — whereas an unscoped enum without a fixed type gets an implementation-defined type large enough for its enumerators. Printing requires the explicit static_cast (or std::to_underlying in C++23), since scoped enums never convert implicitly."
    },
    {
      "type": "mcq",
      "tag": "stacktrace (C++23)",
      "question": "What does C++23's <stacktrace> provide, and how does it differ from std::source_location?",
      "options": [
        "It only works inside a debugger; release builds get empty traces by definition",
        "It records the stack automatically whenever an exception is thrown, retrievable from the exception object",
        "std::stacktrace::current() captures the run-time call chain at the point of the call; each entry can expose a description, source file, and line, and the whole trace is streamable and formattable — unlike source_location, which records just one code location determined at compile time with no call-chain information",
        "It is a compile-time facility, so capturing a trace has zero run-time cost"
      ],
      "answer": 2,
      "explain": "std::stacktrace (C++23) is a run-time capture of the current call stack: current() walks the actual frames, and entries offer description(), source_file(), and source_line(), with the whole object printable via ostream or std::format. source_location is the complementary compile-time tool — a single frame's worth of file/line/function, ideal as a defaulted argument, but blind to callers further up. Standard C++ does not attach traces to exceptions automatically; you capture one yourself, e.g. when constructing a custom exception."
    },
    {
      "type": "mcq",
      "tag": "print / println (C++23)",
      "question": "What are the advantages of C++23's std::println(\"x = {}\", x); over std::cout << \"x = \" << x << '\\n';?",
      "options": [
        "std::println is a thin macro over printf, so it is faster but loses type safety",
        "The format string is validated at compile time (a bad placeholder is a compile error), output is fully type-safe, the newline is appended automatically (std::print omits it), and there is no iostream state — no manipulators accidentally left set, and much less interleaving noise",
        "Its only difference from cout is that it flushes automatically after every call",
        "std::println can only print string arguments; numbers still require cout"
      ],
      "answer": 1,
      "explain": "std::print and std::println (from <print>) are built on std::format: the format string is checked against the argument types at compile time, so a mismatched {} placeholder fails to build rather than misbehaving at run time. println appends the newline; neither is required to flush. Because formatting state lives in the format string rather than in stream manipulators, there is no lingering hex/precision state, and any formattable type — user types included, via std::formatter specializations — can be printed."
    },
    {
      "type": "mcq",
      "tag": "mdspan (C++23)",
      "question": "You need matrix-style two-dimensional indexing over an existing contiguous buffer without copying it. What does C++23's std::mdspan offer?",
      "options": [
        "It allocates and owns a two-dimensional array, like a vector of vectors but contiguous",
        "It is a container adaptor over std::deque providing checked 2-D access",
        "It only supports dimensions fixed at compile time, so run-time-sized matrices still need vector<vector<T>>",
        "A non-owning multidimensional view over the buffer: extents may be static or dynamic, a layout policy (row-major layout_right by default; layout_left or strided also available) maps indices to offsets, and elements are accessed as m[r, c] using C++23's multidimensional subscript"
      ],
      "answer": 3,
      "explain": "std::mdspan is to multidimensional data what std::span is to one-dimensional data: a view that adds shape, not ownership. Its extents can mix compile-time and run-time sizes, and the layout policy decouples the indexing convention from the data (row-major, column-major for Fortran/BLAS interop, or strided for submatrices). Combined with C++23's operator[] taking multiple subscripts, it replaces error-prone manual index arithmetic and cache-hostile vector-of-vector designs."
    },
    {
      "type": "mcq",
      "tag": "flat_map (C++23)",
      "question": "How does C++23's std::flat_map differ from std::map?",
      "options": [
        "flat_map stores keys and values in two separate sorted contiguous sequences instead of a node-based tree: lookup is still logarithmic but with far better cache locality and lower memory overhead, while insertion and erasure become linear-time and any modification invalidates all iterators and references",
        "flat_map is a hash table, giving average O(1) lookup like unordered_map",
        "flat_map keeps elements in insertion order rather than key order",
        "flat_map matches std::map operation-for-operation, including O(log n) insertion and stable iterators; only the allocator differs"
      ],
      "answer": 0,
      "explain": "flat_map (and flat_set) are container adaptors over underlying sequences — by default two vectors, one of keys and one of values — kept sorted by key. Binary search over contiguous memory makes lookups and iteration much faster in practice than chasing tree nodes, and per-element pointer overhead disappears. The price is O(n) insert/erase (elements must shift) and full iterator/reference invalidation on modification, so they suit build-mostly, lookup-heavy workloads."
    },
    {
      "type": "mcq",
      "tag": "Freestanding vs hosted",
      "question": "What is the difference between a freestanding and a hosted C++ implementation?",
      "options": [
        "Freestanding means the compiler ships as a standalone binary; hosted means it runs inside an IDE",
        "A freestanding implementation is a header-only subset that supports containers but not templates",
        "A freestanding implementation targets environments without an operating system (kernels, firmware, embedded): it must support the full core language plus only a small set of library facilities (e.g. <type_traits>, <cstdint>, <new>, <atomic>), with no guarantee of iostreams, filesystem, or similar OS-dependent parts, and the program's startup need not be a conventional main(); a hosted implementation provides the complete standard library",
        "Hosted implementations are for cloud deployment; freestanding for desktop applications"
      ],
      "answer": 2,
      "explain": "The standard defines two conformance levels. Hosted is the familiar one: full library, execution starting at main(). Freestanding targets bare-metal environments — the core language is fully available, but only OS-independent library components are required, roughly the language-support and metaprogramming headers (C++23 substantially expanded this required subset). Facilities that presuppose an operating system, like iostreams, filesystem, and threads, need not exist."
    }
  ]
};

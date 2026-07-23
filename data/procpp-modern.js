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
    }
  ]
};

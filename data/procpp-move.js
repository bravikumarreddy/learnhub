/* ===== Professional C++ — Move Semantics & Value Categories ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["procpp-move"] = {
  title: "Professional C++ — Move Semantics & Value Categories",
  subtitle: "Value categories, perfect forwarding, ref-qualifiers, RVO/NRVO and moved-from states.",
  crumb: "Professional C++",
  questions: [
    {
      "type": "mcq",
      "tag": "Value categories",
      "question": "Given std::string s;, what is the value category of the expression std::move(s)?",
      "options": [
        "lvalue, because s is a named variable",
        "prvalue, because the result is a temporary",
        "xvalue, a glvalue whose resources may be reused",
        "It has no value category until it is bound to a reference"
      ],
      "answer": 2,
      "explain": "std::move(s) is a cast to std::string&&, and a function call returning an rvalue reference to object type is an xvalue. An xvalue is a glvalue (it denotes the same object as s) that overload resolution treats as an rvalue, so move constructors and rvalue-reference parameters can bind to it. It is not a prvalue: no new temporary object is created."
    },
    {
      "type": "mcq",
      "tag": "std::move",
      "question": "Which statement most accurately describes what std::move does?",
      "options": [
        "It moves the object's contents into a hidden temporary that the destination later steals from",
        "It is an unconditional cast to an rvalue reference; by itself it moves nothing and generates essentially no code",
        "It calls the type's move constructor and returns the moved-to object",
        "It marks the object so the compiler is required to destroy it at the end of the full expression"
      ],
      "answer": 1,
      "explain": "std::move is just static_cast<remove_reference_t<T>&&>(t) wrapped in a function; it performs no run-time work and typically compiles away entirely. The actual moving happens only if the resulting xvalue is subsequently used to select a move constructor or move assignment operator. If no such operation exists, the cast can silently result in a copy instead."
    },
    {
      "type": "code",
      "tag": "Forwarding references",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <type_traits>\n#include <utility>\n\ntemplate <typename T>\nvoid f(T&& param) {\n    if constexpr (std::is_lvalue_reference_v<T>) {\n        std::cout << \"L\";\n    } else {\n        std::cout << \"R\";\n    }\n}\n\nint main() {\n    int x = 42;\n    f(x);\n    f(42);\n    f(std::move(x));\n}",
      "options": [
        "LRR",
        "LLR",
        "RRR",
        "LRL"
      ],
      "answer": 0,
      "explain": "T&& on a deduced template parameter is a forwarding reference. Passing the lvalue x deduces T as int& (printing L); passing the prvalue 42 deduces T as int (printing R); passing the xvalue std::move(x) also deduces T as int (printing R). The lvalue-reference deduction for lvalue arguments is the special rule that makes perfect forwarding possible."
    },
    {
      "type": "mcq",
      "tag": "Reference collapsing",
      "question": "With using LRef = int&; and using RRef = int&&;, what are the types LRef&& and RRef&& after reference collapsing?",
      "options": [
        "int&& and int&&",
        "int& and int&&",
        "int& and int&",
        "int&& and int&"
      ],
      "answer": 1,
      "explain": "Under reference collapsing, an rvalue reference to an rvalue reference collapses to an rvalue reference, while every combination involving an lvalue reference collapses to an lvalue reference. So LRef&& is int& && which collapses to int&, and RRef&& is int&& && which collapses to int&&. This rule is what makes forwarding references and std::forward work."
    },
    {
      "type": "code",
      "tag": "std::forward",
      "question": "The author forgot std::forward inside make(). What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\n\nstruct Widget {\n    Widget(const std::string&) { std::cout << \"copy\"; }\n    Widget(std::string&&) { std::cout << \"move\"; }\n};\n\ntemplate <typename T>\nvoid make(T&& arg) {\n    Widget w(arg);  // note: no std::forward\n}\n\nint main() {\n    make(std::string(\"hi\"));\n}",
      "options": [
        "move",
        "copy",
        "Nothing; the Widget constructor is elided",
        "It does not compile because arg cannot bind to const std::string&"
      ],
      "answer": 1,
      "explain": "Although make() is called with a prvalue and arg has type std::string&&, arg is a named parameter, and a name is always an lvalue expression. An lvalue cannot bind to std::string&&, so overload resolution picks the const std::string& constructor and prints copy. Writing Widget w(std::forward<T>(arg)) would restore the original value category and print move."
    },
    {
      "type": "code",
      "tag": "std::forward",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\n\nstruct Widget {\n    Widget(const std::string&) { std::cout << \"copy\"; }\n    Widget(std::string&&) { std::cout << \"move\"; }\n};\n\ntemplate <typename T>\nvoid make(T&& arg) {\n    Widget w(std::forward<T>(arg));\n}\n\nint main() {\n    std::string s = \"hi\";\n    make(s);\n    make(std::move(s));\n}",
      "options": [
        "copycopy",
        "movemove",
        "copymove",
        "movecopy"
      ],
      "answer": 2,
      "explain": "For make(s), T deduces to std::string&, so std::forward<T> returns an lvalue reference and the copy constructor runs. For make(std::move(s)), T deduces to std::string, so std::forward<T> casts arg back to an xvalue and the move constructor runs. std::forward is a conditional cast: it restores the value category the caller originally supplied, encoded in T."
    },
    {
      "type": "code",
      "tag": "Forwarding ctor hijack",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\n\nstruct Person {\n    template <typename T>\n    Person(T&& name) { std::cout << \"template\"; }\n    Person(const Person&) { std::cout << \"copy\"; }\n};\n\nint main() {\n    Person p1(std::string(\"Ada\"));\n    Person p2(p1);\n}",
      "options": [
        "templatecopy",
        "templatetemplate",
        "copycopy",
        "It does not compile: the template conflicts with the copy constructor"
      ],
      "answer": 1,
      "explain": "For p2(p1), the argument is a non-const lvalue Person, so the forwarding-reference template instantiates Person(Person&), an exact match. The real copy constructor takes const Person&, which requires adding const, so the template wins overload resolution and prints template a second time. This hijacking is why perfect-forwarding constructors must be constrained (e.g., with a requires clause excluding Person itself)."
    },
    {
      "type": "mcq",
      "tag": "Forwarding ctor hijack",
      "question": "What is the standard fix for a perfect-forwarding constructor template <typename T> Person(T&& name) that hijacks calls intended for the copy constructor?",
      "options": [
        "Declare the copy constructor explicit so it is preferred during overload resolution",
        "Constrain the template (requires/enable_if) so it is removed from overload resolution when std::remove_cvref_t<T> is Person",
        "Take the parameter as const T&& instead of T&&",
        "Mark the template constructor noexcept so the compiler prefers the copy constructor"
      ],
      "answer": 1,
      "explain": "The template must be taken out of the candidate set whenever the argument is a Person (or something derived from it), which is done with a constraint such as requires (!std::is_same_v<std::remove_cvref_t<T>, Person>) or the equivalent enable_if. explicit and noexcept do not affect which candidate wins overload resolution here. const T&& would break the template entirely: it is not a forwarding reference and cannot accept non-const lvalues by move."
    },
    {
      "type": "mcq",
      "tag": "Copy elision",
      "question": "Under C++17, which form of copy elision is guaranteed by the language rather than merely permitted as an optimization?",
      "options": [
        "NRVO: returning a named local variable never invokes a copy or move constructor",
        "Returning a prvalue of the function's return type: the result object is initialized directly, with no copy or move constructor needed at all",
        "Both NRVO and prvalue returns are guaranteed to be elided",
        "Neither; all copy elision remains a discretionary optimization in C++17"
      ],
      "answer": 1,
      "explain": "C++17 redefined prvalues so that a returned prvalue such as return Widget{}; never designates a temporary to copy from; it directly initializes the caller's object, so it works even if the copy and move constructors are deleted. NRVO for named locals, in contrast, is still only permitted: the compiler may elide the copy/move, but a usable copy or move constructor must exist and may be called."
    },
    {
      "type": "code",
      "tag": "NRVO",
      "question": "Which outputs are possible for this program when compiled as C++20 (with or without optimization)?",
      "code": "#include <iostream>\n\nstruct S {\n    S() { std::cout << \"ctor\"; }\n    S(const S&) { std::cout << \"copy\"; }\n    S(S&&) noexcept { std::cout << \"move\"; }\n};\n\nS make() {\n    S s;\n    return s;\n}\n\nint main() {\n    S s = make();\n}",
      "options": [
        "Only \"ctor\"",
        "Only \"ctormove\"",
        "Either \"ctor\" or \"ctormove\", depending on whether NRVO is applied",
        "Either \"ctor\" or \"ctorcopy\", because return s uses the copy constructor"
      ],
      "answer": 2,
      "explain": "return s; makes the local eligible for NRVO, which is permitted but not guaranteed, so a compiler may construct s directly in the caller and print only ctor. If NRVO is not applied, overload resolution on a returned local treats it as an rvalue first, so the move constructor runs and the output is ctormove. The copy constructor is never chosen because a viable move constructor exists."
    },
    {
      "type": "code",
      "tag": "Pessimizing move",
      "question": "Compared with writing return s; in make(), what is the effect of return std::move(s); here?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct S {\n    S() = default;\n    S(const S&) { std::cout << \"copy\"; }\n    S(S&&) noexcept { std::cout << \"move\"; }\n};\n\nS make() {\n    S s;\n    return std::move(s);\n}\n\nint main() {\n    S s = make();\n}",
      "options": [
        "No difference; compilers elide the move in both versions",
        "It disables NRVO, so \"move\" is always printed, whereas return s; could print nothing",
        "It causes \"copy\" to be printed because std::move on a local yields a const reference",
        "It is undefined behavior because the function returns a reference to a destroyed local"
      ],
      "answer": 1,
      "explain": "NRVO applies only when the return expression is the plain name of a local object; std::move(s) is an xvalue expression, not a name, so elision is off the table and the move constructor must run. Plain return s; already treats the local as an rvalue when elision does not happen, so std::move buys nothing and can only pessimize. There is no dangling reference: the object is moved by value before s is destroyed."
    },
    {
      "type": "code",
      "tag": "Ref-qualifiers",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Text {\n    void print() & { std::cout << \"L\"; }\n    void print() && { std::cout << \"R\"; }\n};\n\nint main() {\n    Text t;\n    t.print();\n    Text{}.print();\n    std::move(t).print();\n}",
      "options": [
        "LLL",
        "LRR",
        "LLR",
        "It does not compile: Text{}.print() has no viable overload"
      ],
      "answer": 1,
      "explain": "Ref-qualifiers make overload resolution consider the value category of the implicit object argument. t is an lvalue, so the &-qualified overload prints L; Text{} is a prvalue and std::move(t) is an xvalue, and both rvalues select the &&-qualified overload, printing R twice. Once any overload is ref-qualified, all overloads of that name must be, which these are."
    },
    {
      "type": "mcq",
      "tag": "Ref-qualifiers",
      "question": "A class declares its assignment operator as Data& operator=(const Data& rhs) &; with an lvalue ref-qualifier. What does the trailing & accomplish?",
      "options": [
        "It allows assignment only when rhs is an lvalue",
        "It makes the operator callable on const objects",
        "It prevents assigning to a temporary, so expressions like makeData() = d; no longer compile",
        "It forces the compiler to also generate a &&-qualified overload"
      ],
      "answer": 2,
      "explain": "The ref-qualifier constrains the implicit object parameter, not rhs: with &, the left-hand side must be an lvalue. Accidental assignments to temporaries, such as makeData() = d; (a classic typo for ==), then fail to compile instead of silently modifying an object that is about to die. Nothing is auto-generated for rvalues; such calls simply have no viable overload."
    },
    {
      "type": "mcq",
      "tag": "Moved-from state",
      "question": "After auto b = std::move(a); where a is a std::string, what does the standard guarantee about a?",
      "options": [
        "a is guaranteed to be empty",
        "a is in a valid but unspecified state; operations without preconditions (destroying it, assigning to it, calling clear()) are safe",
        "Any use of a other than its destructor is undefined behavior",
        "a is guaranteed to be unchanged, because std::move only copies for small strings"
      ],
      "answer": 1,
      "explain": "For standard library types, a moved-from object is left in a valid but unspecified state: its invariants hold, but its value is unknown. You may safely destroy it, assign a new value to it, or call any member with no preconditions (empty(), clear()), but you must not rely on its contents, so asserting it is empty is nonportable. Small-string optimization may indeed leave the old text in place on some implementations, which is precisely why the value is unspecified rather than guaranteed."
    },
    {
      "type": "mcq",
      "tag": "noexcept move",
      "question": "Why should a move constructor be declared noexcept whenever it cannot throw?",
      "options": [
        "Because a throwing move constructor is ill-formed in C++20",
        "Because std::vector reallocation uses std::move_if_noexcept: without a noexcept move constructor it copies copyable elements to preserve the strong exception guarantee",
        "Because noexcept is required for the compiler to generate the corresponding move assignment operator",
        "Because std::move only performs the cast if the target type's move constructor is noexcept"
      ],
      "answer": 1,
      "explain": "When std::vector grows, it must keep the old buffer intact if transferring an element throws partway through; a throwing move could leave the old buffer half-gutted with no way to roll back. Reallocation therefore moves elements only when the move constructor is noexcept (via std::move_if_noexcept) and otherwise falls back to copying if a copy constructor exists. Forgetting noexcept silently turns every reallocation into deep copies, a major hidden performance cost."
    },
    {
      "type": "code",
      "tag": "move_if_noexcept",
      "question": "What does this program print? (Assume a standard-conforming library implementation.)",
      "code": "#include <iostream>\n#include <vector>\n\nstruct S {\n    S() = default;\n    S(const S&) { std::cout << \"C\"; }\n    S(S&&) { std::cout << \"M\"; }  // note: NOT noexcept\n};\n\nint main() {\n    std::vector<S> v;\n    v.reserve(1);\n    v.emplace_back();\n    v.emplace_back();  // capacity exceeded: reallocation\n}",
      "options": [
        "M",
        "C",
        "MM",
        "CC"
      ],
      "answer": 1,
      "explain": "Both emplace_back calls construct their element in place with the default constructor, which prints nothing. The second call exceeds the reserved capacity of 1, forcing reallocation; because the move constructor is not noexcept and S is copyable, the library copies the one existing element to the new buffer to preserve the strong exception guarantee, printing a single C. Adding noexcept to the move constructor would change the output to M."
    },
    {
      "type": "mcq",
      "tag": "Rule of five",
      "question": "A class declares only a destructor (even ~X() = default;) and nothing else. Which special member functions does the compiler still implicitly generate?",
      "options": [
        "Copy and move constructors and both assignment operators, as usual",
        "The copy operations (though this is deprecated); the move constructor and move assignment operator are not declared at all",
        "The move operations only; the copy operations are suppressed",
        "None; declaring any special member suppresses all of the others"
      ],
      "answer": 1,
      "explain": "A user-declared destructor prevents the implicit declaration of both move operations: the compiler assumes that if you manage destruction manually, memberwise moves may be wrong. The copy constructor and copy assignment operator are still generated, though relying on that is deprecated. As a result, std::move on such a type silently copies, which is why the rule of five says to declare (or =default) all five together."
    },
    {
      "type": "code",
      "tag": "Rule of five",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Legacy {\n    Legacy() = default;\n    ~Legacy() {}  // user-declared destructor\n    Legacy(const Legacy&) { std::cout << \"copy\"; }\n};\n\nint main() {\n    Legacy a;\n    Legacy b = std::move(a);\n}",
      "options": [
        "move",
        "copy",
        "Nothing; the initialization is elided",
        "It does not compile: no move constructor is available for an rvalue"
      ],
      "answer": 1,
      "explain": "With a user-declared destructor and a user-declared copy constructor, no move constructor is implicitly generated. The xvalue std::move(a) then binds to const Legacy&, since a const lvalue reference binds to rvalues, so the copy constructor runs and prints copy. This compiles cleanly, which is exactly the danger: std::move silently degrades to a copy."
    },
    {
      "type": "code",
      "tag": "std::exchange",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Handle {\n    int id{0};\n    explicit Handle(int i) : id(i) {}\n    Handle(Handle&& other) noexcept\n        : id(std::exchange(other.id, 0)) {}\n};\n\nint main() {\n    Handle a(7);\n    Handle b(std::move(a));\n    std::cout << a.id << b.id;\n}",
      "options": [
        "07",
        "70",
        "77",
        "00"
      ],
      "answer": 0,
      "explain": "std::exchange(other.id, 0) stores 0 into other.id and returns the old value 7, which initializes b.id. After the move, a.id is 0 and b.id is 7, so the program prints 07. This one-liner both steals the resource and resets the source to a well-defined empty state, which is why it is the idiomatic body for move constructors and move assignment operators."
    },
    {
      "type": "mcq",
      "tag": "std::exchange",
      "question": "In a move assignment operator, why is data = std::exchange(other.data, nullptr); preferred over the two-step data = other.data; other.data = nullptr;?",
      "options": [
        "std::exchange performs the swap atomically, making the operator thread-safe",
        "It expresses steal-and-reset in one expression, avoiding ordering mistakes, and keeps multi-member moves compact and uniform",
        "std::exchange calls the member's move constructor, whereas plain assignment always copies",
        "The two-step version is undefined behavior when this == &other"
      ],
      "answer": 1,
      "explain": "std::exchange writes the replacement into the source and returns the old value in a single expression, so each member transfer is one self-contained line that cannot get the steal/reset order wrong when the code is later edited. It provides no atomicity or thread-safety guarantees. Note that with a preceding delete data; the exchange form is also self-move-safe in a way the naive version is not, though self-move handling is usually addressed explicitly."
    },
    {
      "type": "mcq",
      "tag": "decltype",
      "question": "Given int x = 0;, what are decltype(x) and decltype((x)) respectively?",
      "options": [
        "int and int",
        "int and int&",
        "int& and int&",
        "int and int&&"
      ],
      "answer": 1,
      "explain": "For an unparenthesized id-expression, decltype yields the declared type of the entity: int. Adding parentheses makes (x) an ordinary expression, and for an lvalue expression of type T, decltype yields T&, so decltype((x)) is int&. This distinction matters for decltype(auto) return types, where accidental parentheses can return a dangling reference to a local."
    },
    {
      "type": "code",
      "tag": "decltype(auto)",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <type_traits>\n\nint main() {\n    int x = 0;\n    decltype(auto) a = x;\n    decltype(auto) b = (x);\n    std::cout << std::is_reference_v<decltype(a)>\n              << std::is_reference_v<decltype(b)>;\n}",
      "options": [
        "00",
        "01",
        "10",
        "11"
      ],
      "answer": 1,
      "explain": "decltype(auto) deduces exactly what decltype of the initializer expression would give. For a, the initializer is the unparenthesized name x, so decltype(x) is int and a is a plain int (prints 0). For b, the initializer (x) is a parenthesized lvalue expression, so decltype((x)) is int& and b is a reference (prints 1)."
    },
    {
      "type": "code",
      "tag": "auto&& range-for",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> v{1, 2, 3};\n    for (auto&& e : v) {\n        e *= 2;\n    }\n    for (auto e : v) {\n        std::cout << e;\n    }\n}",
      "options": [
        "123",
        "246",
        "It does not compile: you cannot modify elements through auto&&",
        "The output is unspecified because e binds to copies"
      ],
      "answer": 1,
      "explain": "Dereferencing a std::vector<int> iterator yields int&, an lvalue, so the forwarding reference auto&& deduces e as int& via reference collapsing. Each element is therefore modified in place, doubling it, and the second loop prints 246. auto&& is fully mutable here; it is const auto& that would reject the modification."
    },
    {
      "type": "mcq",
      "tag": "auto&& range-for",
      "question": "Why is for (auto&& e : container) the most general form for a modifying range-based for loop?",
      "options": [
        "auto&& always moves each element out of the container for faster iteration",
        "auto&& binds to both the int& elements of ordinary containers and the prvalue proxy objects of containers like std::vector<bool>, where for (auto& e : vb) fails to compile",
        "auto&& forces the compiler to vectorize the loop",
        "auto&& makes each element const-qualified, preventing accidental writes"
      ],
      "answer": 1,
      "explain": "For ordinary containers, iterator dereference yields an lvalue reference and auto&& collapses to a plain modifying reference. For proxy containers such as std::vector<bool>, dereference yields a prvalue proxy object; a non-const auto& cannot bind to that temporary, so the loop fails to compile, while auto&& binds to it as an rvalue reference and writes still reach the underlying bits through the proxy. Nothing is moved or made const; auto&& simply accepts any value category."
    },
    {
      "type": "code",
      "tag": "Value categories",
      "question": "What does this program print? (Guaranteed copy elision is in effect: C++17 or later.)",
      "code": "#include <iostream>\n\nstruct S {\n    S() { std::cout << \"ctor\"; }\n    S(const S&) { std::cout << \"copy\"; }\n    S(S&&) = delete;\n};\n\nS make() {\n    return S{};\n}\n\nint main() {\n    S s = make();\n}",
      "options": [
        "It does not compile: make() needs the deleted move constructor to return by value",
        "ctor",
        "ctormove",
        "ctorcopy"
      ],
      "answer": 1,
      "explain": "Since C++17, returning a prvalue of the function's own return type performs no copy or move at all: S{} directly initializes the result object, which in turn is the initializer of s, so exactly one default construction occurs. Because no copy or move constructor is ever selected, the deleted move constructor is irrelevant and the program prints just ctor. Before C++17 this code would have been ill-formed."
    }
  ]
};

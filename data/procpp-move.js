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
    },
    {
      "type": "mcq",
      "tag": "Const and move",
      "question": "Given const Widget w; where Widget has both copy and move constructors, what happens for Widget w2(std::move(w));?",
      "options": [
        "The program fails to compile because a const object cannot be cast to an rvalue reference",
        "The move constructor runs but is required to leave the const source unchanged",
        "std::move yields const Widget&&, which cannot bind to Widget&&, so overload resolution silently selects the copy constructor",
        "The compiler strips the const qualifier because the object is being consumed"
      ],
      "answer": 2,
      "explain": "std::move on a const lvalue produces a const Widget&&. A move constructor takes Widget&& (non-const, since it must modify the source), so it is not viable; the const Widget& copy constructor, which binds to any value category, is chosen instead. The code compiles cleanly and quietly copies, which is why objects you intend to move from must not be const."
    },
    {
      "type": "code",
      "tag": "Const and move",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Data {\n    Data() = default;\n    Data(const Data&) { std::cout << \"copy\"; }\n    Data(Data&&) noexcept { std::cout << \"move\"; }\n};\n\nint main() {\n    const Data d;\n    Data d2(std::move(d));\n}",
      "options": [
        "move",
        "copy",
        "Nothing; the construction is elided",
        "It does not compile: std::move cannot be applied to a const object"
      ],
      "answer": 1,
      "explain": "std::move(d) has type const Data&&, and the move constructor's Data&& parameter cannot bind to it. The const-qualified copy constructor can bind to a const rvalue, so it is selected and copy is printed. Nothing here is ill-formed, which makes this a notorious silent pessimization."
    },
    {
      "type": "mcq",
      "tag": "Const members",
      "question": "A class declares a data member const std::string id_ alongside other non-const members. What is the effect on the class's implicitly generated move constructor?",
      "options": [
        "The move constructor still exists, but it copies id_ (a const member cannot be moved from) while genuinely moving the other members",
        "The move constructor is defined as deleted because one member is const",
        "The move constructor moves id_ anyway, since move construction is allowed to modify the source",
        "The class becomes non-copyable and non-movable"
      ],
      "answer": 0,
      "explain": "The memberwise move applies std::move to each member, but for the const member the result is const std::string&&, which selects std::string's copy constructor. So the object is still move-constructible, just partially: id_ is deep-copied on every 'move'. A single const member thus silently degrades the performance benefit of moving the whole class."
    },
    {
      "type": "code",
      "tag": "Moved-from unique_ptr",
      "question": "What does this program print, and is that output guaranteed?",
      "code": "#include <iostream>\n#include <memory>\n#include <utility>\n\nint main() {\n    auto p = std::make_unique<int>(42);\n    auto q = std::move(p);\n    std::cout << (p == nullptr) << (q != nullptr);\n}",
      "options": [
        "10, but only on typical implementations",
        "11, but whether p is null afterwards is implementation-defined",
        "The output is unspecified because moved-from objects hold unspecified values",
        "11, guaranteed: a moved-from std::unique_ptr is required by the standard to be null"
      ],
      "answer": 3,
      "explain": "std::unique_ptr's move constructor has an explicit postcondition: ownership is transferred and the source is left empty, i.e., equal to nullptr. This is stronger than the 'valid but unspecified state' wording that applies to types like std::string and std::vector. So both comparisons are guaranteed to print 1."
    },
    {
      "type": "mcq",
      "tag": "Moved-from guarantees",
      "question": "Which statement about the state of moved-from standard library objects is correct?",
      "options": [
        "All standard types guarantee that the moved-from object is empty",
        "std::unique_ptr guarantees the source is null after a move, but std::string and std::vector promise only a valid but unspecified state",
        "std::string guarantees emptiness after a move, but std::vector does not",
        "No standard type documents its moved-from state, so any use of a moved-from object is undefined behavior"
      ],
      "answer": 1,
      "explain": "std::unique_ptr (like shared_ptr and a few others) has hard postconditions: the source is empty after a move. Containers and strings get only the generic library guarantee of a valid but unspecified state; a small string may even keep its old characters because of the small-string optimization. Using a moved-from object is not UB as long as you call operations without preconditions, such as assignment or clear()."
    },
    {
      "type": "code",
      "tag": "Moved-from reuse",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\n\nint main() {\n    std::string s = \"world\";\n    std::string t = std::move(s);\n    s = \"hello\";\n    std::cout << s << t;\n}",
      "options": [
        "helloworld, guaranteed: t receives the original value, and assigning a new value to a moved-from string is well-defined",
        "hello followed by an unspecified sequence of characters",
        "It is undefined behavior to assign to s after it has been moved from",
        "worldworld, because moving may leave the original characters in place"
      ],
      "answer": 0,
      "explain": "The move constructor gives t a value equivalent to the source's original value, so t is \"world\". s is then in a valid but unspecified state, but operator= has no preconditions, so s = \"hello\" is fully defined and re-establishes a known value. The output helloworld is therefore guaranteed; reusing moved-from objects by assigning to them is the idiomatic pattern."
    },
    {
      "type": "code",
      "tag": "Self-move",
      "question": "This move assignment operator has no self-assignment protection. What does the program print?",
      "code": "#include <iostream>\n#include <utility>\n#include <vector>\n\nstruct Buffer {\n    std::vector<int> data{1, 2, 3};\n    Buffer& operator=(Buffer&& other) noexcept {\n        data = std::move(other.data);\n        other.data.clear();\n        return *this;\n    }\n};\n\nint main() {\n    Buffer b;\n    b = std::move(b);\n    std::cout << b.data.size();\n}",
      "options": [
        "3, because self-move-assignment is a no-op",
        "The behavior is undefined",
        "0: the vector self-move leaves it in a valid but unspecified state, and the following clear() empties it, so the data is lost",
        "3, but only because the compiler detects and skips the self-move"
      ],
      "answer": 2,
      "explain": "With this == &other, data = std::move(other.data) self-move-assigns the vector, which for standard types is safe but leaves an unspecified value; then other.data.clear() clears that same vector, guaranteeing size 0. No undefined behavior occurs, yet the object's contents are destroyed, which is exactly why move assignment operators should either check if (this == &other) or use the swap idiom."
    },
    {
      "type": "mcq",
      "tag": "Self-move",
      "question": "For a standard library container v, what does the standard say about the self-move v = std::move(v);?",
      "options": [
        "It is undefined behavior",
        "It is safe: v ends up in a valid but unspecified state, so you must not rely on it keeping its elements",
        "It is guaranteed to be a no-op that preserves the contents",
        "It is guaranteed to clear the container"
      ],
      "answer": 1,
      "explain": "The library-wide rule is that an object assigned from an rvalue is left in a valid but unspecified state, and that includes the self-move case: no crash or UB, but no promise about the value either. Self-moves rarely appear literally but do occur through aliases, such as std::swap-like code or algorithms permuting a range. Your own types should meet at least this bar: a self-move must leave the object destructible and assignable."
    },
    {
      "type": "code",
      "tag": "Copy-and-swap",
      "question": "This class implements assignment with a single by-value operator=. What does the program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Widget {\n    Widget() = default;\n    Widget(const Widget&) { std::cout << \"C\"; }\n    Widget(Widget&&) noexcept { std::cout << \"M\"; }\n    Widget& operator=(Widget other) noexcept {\n        std::cout << \"=\";\n        return *this;\n    }\n};\n\nint main() {\n    Widget a, b;\n    a = b;\n    a = std::move(b);\n}",
      "options": [
        "C==",
        "M=M=",
        "C=C=",
        "C=M="
      ],
      "answer": 3,
      "explain": "For a = b the by-value parameter other is copy-constructed from the lvalue b (printing C), then the operator body runs (=). For a = std::move(b) the parameter is move-constructed from the xvalue (M), then = again. This is the copy-and-swap style: overload resolution on the parameter's initialization automatically makes one operator serve as both copy and move assignment."
    },
    {
      "type": "mcq",
      "tag": "Copy-and-swap",
      "question": "What is the main attraction of implementing assignment as Widget& operator=(Widget other) { swap(*this, other); return *this; } with a by-value parameter?",
      "options": [
        "One operator serves as both copy and move assignment, handles self-assignment safely, and provides the strong exception guarantee, because everything that can throw happens while constructing the parameter",
        "It never invokes the copy constructor, even for lvalue arguments",
        "It is always faster than writing separate copy and move assignment operators",
        "It lets the compiler continue to generate the defaulted move assignment operator alongside it"
      ],
      "answer": 0,
      "explain": "The parameter is copy-constructed from lvalues and move-constructed from rvalues, so a single operator covers both assignments. If that construction throws, *this has not been touched yet (strong guarantee), and a self-assignment simply swaps with a copy of itself. The trade-off is that it always performs a full construction, so it can be slower than a hand-written copy assignment that reuses existing capacity."
    },
    {
      "type": "code",
      "tag": "Memberwise move",
      "question": "Packet has no user-declared special members. What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\n\nstruct Packet {\n    std::string payload;\n    int id = 0;\n};\n\nint main() {\n    Packet a{\"data\", 7};\n    Packet b = std::move(a);\n    std::cout << b.id << a.id;\n}",
      "options": [
        "70",
        "07",
        "77",
        "The output is unspecified because a was moved from"
      ],
      "answer": 2,
      "explain": "The implicitly generated move constructor performs a memberwise move: the std::string is really moved, but for a scalar like int a 'move' is just a copy, and the source member is not zeroed. So b.id and a.id are both 7 and the output 77 is guaranteed. Only a.payload is in an unspecified state, and it is never printed."
    },
    {
      "type": "mcq",
      "tag": "Deleted =default move",
      "question": "The compiler defines a class's defaulted move constructor as deleted (for example, because a member cannot be moved). What actually happens for X b = std::move(a);?",
      "options": [
        "The code fails to compile, because std::move explicitly requests the deleted move constructor",
        "It compiles: a defaulted move constructor that is defined as deleted is ignored by overload resolution, so the copy constructor is used instead",
        "The compiler generates a memberwise copy for the movable members and leaves the rest uninitialized",
        "It compiles, but invoking it is undefined behavior"
      ],
      "answer": 1,
      "explain": "Unlike a function you delete yourself, which participates in overload resolution and produces an error when selected, a defaulted move constructor that ends up deleted is removed from the candidate set entirely. The xvalue then binds to the const X& copy constructor, so the code still compiles and copies. This rule prevents adding one awkward member from breaking every std::move already in the codebase, at the cost of silent copies."
    },
    {
      "type": "mcq",
      "tag": "Const members",
      "question": "A class has a data member const int id_. Which defaulted special member functions become defined as deleted?",
      "options": [
        "The move constructor",
        "The copy constructor",
        "Both the copy and move constructors",
        "The copy and move assignment operators: a const member cannot be assigned to, while both constructors still work (the move constructor simply copies id_)"
      ],
      "answer": 3,
      "explain": "Constructors initialize the const member, which is fine, so copy and move construction remain available; the move constructor just copies the int. Assignment, however, would have to assign to a const subobject, so both defaulted assignment operators are defined as deleted. This is why value types intended to be assignable should avoid const data members."
    },
    {
      "type": "code",
      "tag": "Returning parameters",
      "question": "What does this program print? (C++20)",
      "code": "#include <iostream>\n\nstruct S {\n    S() { std::cout << \"c\"; }\n    S(const S&) { std::cout << \"C\"; }\n    S(S&&) noexcept { std::cout << \"M\"; }\n};\n\nS pass(S s) {\n    return s;\n}\n\nint main() {\n    S x;\n    S y = pass(x);\n}",
      "options": [
        "cCM",
        "cC",
        "cCC",
        "cMM"
      ],
      "answer": 0,
      "explain": "S x prints c, and copy-constructing the by-value parameter from the lvalue prints C. A by-value parameter is an implicitly movable entity, so return s; move-constructs the result (M) without needing std::move — but unlike a local variable, a parameter is never eligible for copy elision, so this move always happens. The initialization of y from the returned prvalue is guaranteed-elided, so the output is exactly cCM."
    },
    {
      "type": "mcq",
      "tag": "Implicit move",
      "question": "In a return statement, which expressions are implicitly movable — treated as rvalues so a move constructor is preferred without writing std::move (C++20)?",
      "options": [
        "Any lvalue expression whose type matches the function's return type",
        "Only variables declared inside the function body, never parameters",
        "The plain names of non-volatile local variables and by-value function parameters (plus, since C++20, rvalue-reference variables) — but not data members or globals",
        "Only expressions explicitly cast with std::move"
      ],
      "answer": 2,
      "explain": "When the operand of return is the name of a local object or by-value parameter, overload resolution first treats it as an rvalue, so the move constructor wins automatically; C++20 extended this to variables of rvalue reference type. Expressions like w.member, globals, and static locals do not qualify, so returning those copies unless you std::move explicitly. This is also why adding std::move to a plain returning of a local is at best redundant."
    },
    {
      "type": "mcq",
      "tag": "C++23 implicit move",
      "question": "Widget&& pass(Widget&& w) { return w; }  How does this function behave across language standards?",
      "options": [
        "It compiles in all standards, because returning a reference never involves value categories",
        "It is an error before C++23 (w is an lvalue and cannot bind to Widget&&), but compiles in C++23, where the returned id-expression is treated as an xvalue",
        "It compiles everywhere but produces a dangling reference only in C++23",
        "It moves w into a fresh temporary Widget in every standard"
      ],
      "answer": 1,
      "explain": "Before C++23 the operand of return is the lvalue w, and an lvalue cannot bind to the Widget&& return type, so you had to write return std::move(w);. C++23's 'simpler implicit move' (P2266) makes a returned id-expression naming an implicitly movable entity an xvalue even when the function returns a reference type, so the code now compiles as-is. Note no object is created: the caller still must ensure the referenced Widget outlives its use."
    },
    {
      "type": "code",
      "tag": "Member init moves",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Name {\n    Name() = default;\n    Name(const Name&) { std::cout << \"C\"; }\n    Name(Name&&) noexcept { std::cout << \"M\"; }\n};\n\nstruct Person {\n    Name name;\n    Person(Name n) : name(std::move(n)) {}\n};\n\nint main() {\n    Name n;\n    Person p(n);\n}",
      "options": [
        "CC",
        "MM",
        "CM",
        "MC"
      ],
      "answer": 2,
      "explain": "Passing the lvalue n copy-constructs the by-value constructor parameter (C). In the member initializer list, std::move(n) turns the named parameter into an xvalue, so the member is move-constructed (M). Forgetting std::move there is a classic bug: the parameter is an lvalue, so the member would be copied and the program would print CC."
    },
    {
      "type": "mcq",
      "tag": "Pass-by-value sinks",
      "question": "For a constructor Person(std::string name) : name_(std::move(name)) {}, what is the cost for an lvalue argument and for an rvalue argument, respectively?",
      "options": [
        "Lvalue: one copy plus one move. Rvalue: at most two moves — and the move into the parameter is usually elided for a prvalue argument, leaving a single move",
        "Lvalue: two copies. Rvalue: one copy plus one move",
        "Both cases cost exactly one copy",
        "Lvalue: one move. Rvalue: one copy"
      ],
      "answer": 0,
      "explain": "The by-value parameter is copy-constructed from an lvalue or move-constructed from an rvalue (and for a prvalue argument that initialization is elided entirely), then std::move transfers it into the member with one cheap move. Compared with a const std::string& parameter it costs one extra move for lvalues but avoids writing const&/&& overload pairs or a forwarding-reference template. That makes take-by-value-and-move the idiomatic sink-parameter pattern."
    },
    {
      "type": "code",
      "tag": "Moving from captures",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <utility>\n\nint main() {\n    auto p = std::make_unique<int>(42);\n    auto grab = [p = std::move(p)]() mutable {\n        return std::move(p);\n    };\n    auto a = grab();\n    auto b = grab();\n    std::cout << (a != nullptr) << (b != nullptr);\n}",
      "options": [
        "11",
        "00",
        "01",
        "10"
      ],
      "answer": 3,
      "explain": "The init-capture moves the unique_ptr into the closure. Because the lambda is mutable, its captured p can be moved out: the first call transfers ownership to a, and the standard guarantees the moved-from capture is then null. The second call therefore moves a null pointer into b, so a != nullptr prints 1 and b != nullptr prints 0."
    },
    {
      "type": "mcq",
      "tag": "Moving from captures",
      "question": "Why does moving out of a lambda capture, e.g. [p = std::move(ptr)]() { return std::move(p); }, fail to compile for a move-only type unless the lambda is declared mutable?",
      "options": [
        "Captures are always stored const; mutable re-captures them by reference",
        "operator() is const by default, so inside the body the capture is const; std::move then yields const T&&, which cannot invoke a move-only type's move constructor. mutable makes operator() non-const",
        "Without mutable a lambda cannot use init-captures at all",
        "mutable changes the capture from by-value to by-reference"
      ],
      "answer": 1,
      "explain": "A lambda's call operator is const unless declared mutable, so by-value captures behave as const members inside the body. std::move on a const capture produces a const rvalue that cannot bind to the move constructor's T&& parameter, so a move-only type fails to compile — and a copyable type would silently copy instead, which is arguably worse. mutable removes the const, letting the capture actually be moved from."
    },
    {
      "type": "code",
      "tag": "Forwarding lambdas",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\n\nvoid sink(const std::string&) { std::cout << \"L\"; }\nvoid sink(std::string&&) { std::cout << \"R\"; }\n\nint main() {\n    auto relay = [](auto&& x) {\n        sink(std::forward<decltype(x)>(x));\n    };\n    std::string s = \"hi\";\n    relay(s);\n    relay(std::string(\"tmp\"));\n}",
      "options": [
        "LR",
        "LL",
        "RR",
        "RL"
      ],
      "answer": 0,
      "explain": "An auto&& parameter of a generic lambda is a forwarding reference. For the lvalue s, decltype(x) is std::string&, so std::forward passes an lvalue on and the const std::string& overload prints L. For the temporary, decltype(x) is std::string&&, so the forward restores rvalue-ness and the std::string&& overload prints R."
    },
    {
      "type": "mcq",
      "tag": "Forwarding lambdas",
      "question": "Inside a generic lambda [](auto&& x) { ... }, what is the correct way to perfectly forward x to another function?",
      "options": [
        "std::forward<auto>(x)",
        "std::move(x)",
        "std::forward<decltype(x)>(x): decltype(x) is T& for lvalue arguments and T&& for rvalues, and reference collapsing makes the forward behave exactly as in a function template",
        "static_cast<decltype(x)&&>(std::move(x))"
      ],
      "answer": 2,
      "explain": "A C++14 generic lambda has no named template parameter, so decltype(x) stands in for T: it is an lvalue reference when the argument was an lvalue and an rvalue reference otherwise, which is precisely what std::forward needs. std::move would unconditionally treat lvalue arguments as rvalues and steal from the caller. Since C++20 you can also write []<typename T>(T&& x) { f(std::forward<T>(x)); } with explicit template syntax."
    },
    {
      "type": "code",
      "tag": "Wrong-type forward",
      "question": "Note that r is an lvalue and the template argument to std::forward is written explicitly. What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Res {\n    Res() = default;\n    Res(const Res&) { std::cout << \"copy\"; }\n    Res(Res&&) noexcept { std::cout << \"move\"; }\n};\n\nint main() {\n    Res r;\n    Res r2(std::forward<Res>(r));\n}",
      "options": [
        "copy",
        "move",
        "It does not compile: std::forward requires a forwarding-reference context",
        "Nothing; the construction is elided"
      ],
      "answer": 1,
      "explain": "std::forward<T> casts its argument to T&&; with the non-reference type Res explicitly supplied, that is Res&&, an xvalue — regardless of the fact that r is an lvalue the caller may still need. The move constructor is therefore selected and move is printed. std::forward is only meaningful with the deduced template parameter of a forwarding reference; hard-coding a non-reference type makes it behave exactly like std::move."
    },
    {
      "type": "mcq",
      "tag": "Double forwarding",
      "question": "A function template uses its forwarding-reference parameter x several times. What is the correct discipline for std::forward?",
      "options": [
        "Apply std::forward on every use so the value category stays consistent",
        "Never use std::forward; apply std::move on the last use instead",
        "Apply std::forward only on the first use, then use the plain name",
        "Use the plain name for all uses except the last, and apply std::forward exactly once, on the final use"
      ],
      "answer": 3,
      "explain": "When the caller passed an rvalue, every std::forward<T>(x) yields an xvalue that a callee may move from, so forwarding on an early use can leave x moved-from for the later uses. Passing the plain name x keeps it a harmless lvalue; only the final use should forward, mirroring the rule for std::move. If two callees both genuinely need the rvalue, the design must copy explicitly instead."
    },
    {
      "type": "code",
      "tag": "Double forwarding",
      "question": "What does this program print, and why is relay() buggy?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct S {\n    S() = default;\n    S(const S&) { std::cout << \"C\"; }\n    S(S&&) noexcept { std::cout << \"M\"; }\n};\n\nvoid sink(S) {}\n\ntemplate <typename T>\nvoid relay(T&& x) {\n    sink(std::forward<T>(x));\n    sink(std::forward<T>(x));\n}\n\nint main() {\n    relay(S{});\n}",
      "options": [
        "MM: both calls move-construct sink's parameter, so the second call receives an object that was already moved from",
        "MC: the library detects the second forward and falls back to a copy",
        "CC: named parameters are lvalues, so both calls copy",
        "It does not compile: an object cannot be forwarded twice"
      ],
      "answer": 0,
      "explain": "relay(S{}) deduces T as S, so each std::forward<T>(x) is an xvalue and each call move-constructs sink's by-value parameter, printing MM. The code is perfectly legal, which is the trap: the second sink() operates on x after its guts were already transferred by the first call. The fix is to forward only on the last use (printing CM for an rvalue caller: first use copies, last one moves)."
    },
    {
      "type": "code",
      "tag": "emplace vs push_back",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n#include <vector>\n\nstruct S {\n    S() { std::cout << \"c\"; }\n    S(const S&) { std::cout << \"C\"; }\n    S(S&&) noexcept { std::cout << \"M\"; }\n};\n\nint main() {\n    std::vector<S> v;\n    v.reserve(2);\n    S s;\n    v.push_back(std::move(s));\n    v.emplace_back();\n}",
      "options": [
        "cMM",
        "ccM",
        "cMc",
        "cCc"
      ],
      "answer": 2,
      "explain": "S s prints c. push_back(std::move(s)) binds to the push_back(S&&) overload and move-constructs the element inside the vector, printing M. emplace_back() forwards its (empty) argument list straight to S's constructor, building the element in place with no copy or move at all, so the default constructor prints c. The reserve(2) call ensures no reallocation muddies the output."
    },
    {
      "type": "mcq",
      "tag": "emplace_back",
      "question": "Given std::vector<Widget> v and an existing lvalue Widget w, what does v.emplace_back(w) do?",
      "options": [
        "Constructs the element in place with no copy or move — that is the point of emplace",
        "Copy-constructs the element from w, exactly like v.push_back(w): emplace only helps when you pass constructor arguments instead of a ready-made object",
        "Move-constructs the element, leaving w in a moved-from state",
        "It does not compile: emplace_back accepts only constructor argument lists, not objects"
      ],
      "answer": 1,
      "explain": "emplace_back perfectly forwards its arguments to the element's constructor; forwarding the lvalue w selects Widget's copy constructor, the same cost as push_back(w). The saving appears with calls like emplace_back(a, b) that construct directly in the vector without a Widget temporary. To transfer an existing object you still need std::move: emplace_back(std::move(w)) and push_back(std::move(w)) are then equivalent."
    },
    {
      "type": "code",
      "tag": "map insert vs emplace",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <map>\n#include <utility>\n\nstruct V {\n    V() = default;\n    V(const V&) { std::cout << \"C\"; }\n    V(V&&) noexcept { std::cout << \"M\"; }\n};\n\nint main() {\n    std::map<int, V> m;\n    V v;\n    m.insert({1, v});\n    m.emplace(2, V{});\n}",
      "options": [
        "CM",
        "MMM",
        "CCM",
        "CMM"
      ],
      "answer": 3,
      "explain": "m.insert({1, v}) first materializes a value_type pair from the braced list, copy-constructing v into it (C), then the insert(value_type&&) overload move-constructs the stored pair inside the node (M). m.emplace(2, V{}) forwards its arguments directly to the pair constructed in the node, so the V{} temporary is moved into place (M) with no intermediate pair. Hence CMM — emplace saves one V construction compared with insert of a braced pair."
    },
    {
      "type": "mcq",
      "tag": "try_emplace",
      "question": "You call m.emplace(key, std::move(ptr)) on a std::map, but the key already exists so nothing is inserted. Why is try_emplace preferred here when the mapped value is move-only?",
      "options": [
        "try_emplace guarantees that if no insertion happens its arguments are left untouched; with emplace, whether ptr was moved from on a failed insertion is unspecified",
        "try_emplace is faster because it never allocates memory",
        "emplace throws an exception when the key exists; try_emplace returns a bool instead",
        "try_emplace copies the argument first so it can never be lost"
      ],
      "answer": 0,
      "explain": "emplace may construct the node — consuming its forwarded arguments — before discovering the key is a duplicate, and the standard leaves the arguments' state unspecified in that case, so your unique_ptr may be silently gone. try_emplace was added precisely with the guarantee that when the key already exists, the mapped-value arguments are not moved from. Both report the outcome the same way, via a pair of iterator and bool."
    },
    {
      "type": "code",
      "tag": "Structured bindings",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <utility>\n\nint main() {\n    std::pair<std::unique_ptr<int>, int> p{std::make_unique<int>(1), 2};\n    auto [ptr, num] = std::move(p);\n    std::cout << (p.first == nullptr) << *ptr << num;\n}",
      "options": [
        "012",
        "It is undefined behavior because p is used after being moved from",
        "112",
        "It does not compile: a unique_ptr cannot appear in a structured binding"
      ],
      "answer": 2,
      "explain": "auto [ptr, num] = std::move(p); move-constructs a hidden pair object from p, and the names ptr and num refer to that hidden object's members. unique_ptr's move guarantees p.first is null afterwards (prints 1), while ptr owns the int 1 and num holds 2. Examining a moved-from object is not UB; only its value would be unspecified, and here unique_ptr's postcondition even pins that down."
    },
    {
      "type": "mcq",
      "tag": "Structured bindings",
      "question": "For a std::pair p, what is the difference between auto [a, b] = std::move(p); and auto&& [a, b] = std::move(p);?",
      "options": [
        "They are identical; auto&& only changes the deduced constness",
        "The first move-constructs a hidden pair, so p's members really are moved from; the second merely binds a reference to p — nothing is moved until a or b is actually used",
        "The second moves each member individually; the first moves the pair as a whole",
        "auto&& is ill-formed when the initializer is an rvalue"
      ],
      "answer": 1,
      "explain": "A structured binding always introduces a hidden object e; the names are aliases for e's members. With auto, e is a new pair move-constructed from p, so the move happens immediately. With auto&&, e is just a reference bound to the xvalue std::move(p): p is untouched, a and b name p's own members, and writing std::move(a) later is what would actually steal from it."
    },
    {
      "type": "code",
      "tag": "Conditional moves",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct S {\n    S() = default;\n    S(const S&) { std::cout << \"C\"; }\n    S(S&&) noexcept { std::cout << \"M\"; }\n};\n\nint main() {\n    S a, b;\n    S x = true  ? std::move(a) : b;\n    S y = false ? std::move(a) : b;\n}",
      "options": [
        "MC",
        "MM",
        "CC",
        "CM"
      ],
      "answer": 0,
      "explain": "Mixing an xvalue (std::move(a)) and an lvalue (b) of the same type in a conditional expression yields a prvalue, which is materialized from whichever operand is selected and directly initializes x or y. The first line selects the moved-from branch, so a is moved (M); the second selects b, so it is copied (C). Only the chosen operand's constructor runs, hence exactly MC."
    },
    {
      "type": "mcq",
      "tag": "Conditional operator",
      "question": "Given std::string a, b;, what is the value category of the expression cond ? std::move(a) : std::move(b)?",
      "options": [
        "prvalue: the conditional operator always creates a temporary",
        "lvalue, because both operands are named variables",
        "The expression is ill-formed because the operands differ",
        "xvalue: both operands are xvalues of the same type, so the result keeps that category and no temporary is created"
      ],
      "answer": 3,
      "explain": "When both branches are glvalues of the same type and value category, the conditional expression preserves that category, so here the result is an xvalue that can initialize a string by moving whichever operand was selected. If only one branch were moved (cond ? std::move(a) : b), the categories would differ and the result would decay to a prvalue, forcing a temporary. The practical rule: move both branches or neither."
    },
    {
      "type": "code",
      "tag": "Named rvalue refs",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nvoid f(int&)  { std::cout << \"L\"; }\nvoid f(int&&) { std::cout << \"R\"; }\n\nint main() {\n    int&& r = 5;\n    f(r);\n    f(std::move(r));\n}",
      "options": [
        "RR",
        "LR",
        "RL",
        "LL"
      ],
      "answer": 1,
      "explain": "r is declared as int&&, but the expression r is the name of a variable, and every such id-expression is an lvalue — 'if it has a name, it is an lvalue'. So f(r) selects f(int&) and prints L. Only the explicit cast std::move(r) restores rvalue-ness, selecting f(int&&) and printing R."
    },
    {
      "type": "mcq",
      "tag": "Named rvalue refs",
      "question": "void consume(Widget&& w) { store(w); }  Why does store() receive w as an lvalue, and how do you actually pass the rvalue on?",
      "options": [
        "Because Widget&& decays to Widget& inside function bodies; write store(static_cast<Widget>(w))",
        "Because w is implicitly const inside the function; write store(std::forward<Widget&&>(w))",
        "Because a named rvalue reference is itself an lvalue expression — the object now has a name and could still be read again — so the transfer must be made explicit with store(std::move(w))",
        "store() does receive an rvalue; nothing needs to change"
      ],
      "answer": 2,
      "explain": "Value category belongs to expressions, not declarations: within consume, the expression w is an lvalue even though its declared type is Widget&&. That is a deliberate safety rule — since w can be mentioned repeatedly, an implicit move on first use could invisibly gut it before later uses. Each transfer point must therefore opt in with std::move(w) (std::forward is for deduced forwarding references, not concrete parameters)."
    },
    {
      "type": "code",
      "tag": "& vs && overloads",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <utility>\n\nvoid g(std::string&)  { std::cout << \"L\"; }\nvoid g(std::string&&) { std::cout << \"R\"; }\n\nint main() {\n    std::string s = \"x\";\n    g(s);\n    g(std::move(s));\n    g(std::string(\"y\"));\n}",
      "options": [
        "LLL",
        "LRL",
        "RRR",
        "LRR"
      ],
      "answer": 3,
      "explain": "The lvalue s binds to g(std::string&) and prints L. std::move(s) is an xvalue and the temporary std::string(\"y\") is a prvalue; both are rvalues, bind to g(std::string&&), and print R. Note the lvalue overload here is non-const, so it would reject const strings; a const std::string& overload is the usual catch-all in production overload sets."
    },
    {
      "type": "mcq",
      "tag": "Overload selection",
      "question": "With overloads void f(const Widget&); and void f(Widget&&);, which is selected by f(std::move(cw)); where cw is a const Widget?",
      "options": [
        "f(const Widget&): std::move(cw) is a const xvalue that cannot bind to Widget&&, while a const lvalue reference binds to any value category",
        "f(Widget&&), because std::move always routes to the rvalue overload",
        "The call is ambiguous and fails to compile",
        "Neither overload is viable, so the call is ill-formed"
      ],
      "answer": 0,
      "explain": "std::move(cw) has type const Widget&&, and the non-const Widget&& parameter cannot bind to it. The const Widget& overload is the universal fallback that accepts lvalues and rvalues, const or not, so it wins and the call copies. This is the overload-resolution mechanism behind the 'std::move on const silently copies' pitfall."
    },
    {
      "type": "code",
      "tag": "std::swap cost",
      "question": "Each special member prints a two-letter code (CC/MC = copy/move construction, CA/MA = copy/move assignment). What does std::swap(a, b) print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct S {\n    S() = default;\n    S(const S&) { std::cout << \"CC\"; }\n    S(S&&) noexcept { std::cout << \"MC\"; }\n    S& operator=(const S&) { std::cout << \"CA\"; return *this; }\n    S& operator=(S&&) noexcept { std::cout << \"MA\"; return *this; }\n};\n\nint main() {\n    S a, b;\n    std::swap(a, b);\n}",
      "options": [
        "CCCACA: std::swap is implemented with copies",
        "MCMAMA: one move construction followed by two move assignments",
        "MCMC: two move constructions",
        "Nothing: std::swap exchanges the objects' raw storage"
      ],
      "answer": 1,
      "explain": "The generic std::swap is T tmp(std::move(a)); a = std::move(b); b = std::move(tmp);. That is exactly one move construction (MC) and two move assignments (MA MA). For types with cheap moves this is nearly free, which is why swap-based idioms became practical once move semantics existed."
    },
    {
      "type": "mcq",
      "tag": "std::swap cost",
      "question": "What does std::swap(a, b) cost for a class that is copyable but provides no move operations?",
      "options": [
        "It fails to compile: std::swap requires movable types",
        "Two copies",
        "Three full copies: in the generic move-based implementation, std::move degrades to copying, so the temporary is copy-constructed and both assignments copy",
        "Zero copies; the compiler exchanges the objects' storage directly"
      ],
      "answer": 2,
      "explain": "std::swap still compiles because std::move merely casts and the rvalues then bind to the copy operations, but every one of the three steps becomes a deep copy. For a large resource-owning type that is a serious hidden cost. Such classes should either gain proper move operations or supply their own swap that exchanges internals directly, as the standard containers do."
    },
    {
      "type": "code",
      "tag": "ADL swap idiom",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nnamespace lib {\n    struct Grid {};\n    void swap(Grid&, Grid&) { std::cout << \"custom\"; }\n}\n\ntemplate <typename T>\nvoid reorder(T& a, T& b) {\n    using std::swap;\n    swap(a, b);\n}\n\nint main() {\n    lib::Grid a, b;\n    reorder(a, b);\n}",
      "options": [
        "custom",
        "Nothing: std::swap performs three moves silently",
        "It does not compile: the call to swap is ambiguous",
        "custom printed twice"
      ],
      "answer": 0,
      "explain": "The using-declaration makes std::swap visible as a fallback, but the call itself is unqualified, so argument-dependent lookup also finds lib::swap because the arguments are lib::Grid objects. The non-template exact match beats the std::swap template, so custom is printed once. This two-line pattern is the standard way generic code picks up a type's optimized swap."
    },
    {
      "type": "mcq",
      "tag": "ADL swap idiom",
      "question": "Inside a template, why write using std::swap; swap(a, b); rather than calling std::swap(a, b); directly?",
      "options": [
        "Qualified calls are slower because the compiler must search namespace std first",
        "std::swap(a, b) is ill-formed for user-defined types outside namespace std",
        "The using-declaration makes std::swap a better match than any user-provided swap",
        "The qualified call suppresses argument-dependent lookup, so a type's own optimized swap in its namespace would never be considered; the idiom lets ADL find it, with std::swap as the generic fallback"
      ],
      "answer": 3,
      "explain": "Writing std::swap(a, b) names the function explicitly, so only the generic three-move version is ever used even when the type ships a cheaper swap in its own namespace. The idiom's unqualified call engages ADL to find that customization, while the using-declaration guarantees the code still compiles for types without one. C++20's std::ranges::swap is a customization point object that performs this dance for you."
    },
    {
      "type": "code",
      "tag": "noexcept propagation",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <type_traits>\n\nstruct A { std::string s; };\n\nstruct B {\n    B() = default;\n    B(B&&) {}\n};\n\nint main() {\n    std::cout << std::is_nothrow_move_constructible_v<A>\n              << std::is_nothrow_move_constructible_v<B>;\n}",
      "options": [
        "00",
        "10",
        "01",
        "11"
      ],
      "answer": 1,
      "explain": "A's move constructor is implicitly generated, and an implicit special member is noexcept when the corresponding operation of every subobject is; std::string's move constructor is noexcept, so the trait yields 1. B's user-provided move constructor has no noexcept specifier, so it is considered potentially throwing and the trait yields 0. This matters in practice because containers consult exactly this trait when deciding whether to move elements during reallocation."
    },
    {
      "type": "mcq",
      "tag": "Conditional noexcept",
      "question": "Why do wrapper templates declare Wrapper(Wrapper&& other) noexcept(std::is_nothrow_move_constructible_v<T>)?",
      "options": [
        "Because a class template's move constructor is not allowed to be unconditionally noexcept",
        "To turn a throwing move of T into a compile-time error",
        "To propagate the member's guarantee: the wrapper's move is noexcept exactly when T's is, so containers of Wrapper<T> still move rather than copy on reallocation whenever T permits it",
        "Because noexcept(false) would delete the move constructor"
      ],
      "answer": 2,
      "explain": "An unconditional noexcept would be a lie for a throwing T (std::terminate if the member's move throws), while omitting noexcept entirely would make std::vector fall back to copying even for perfectly nothrow types. The conditional form mirrors the member's own guarantee, which is exactly what std::pair, std::tuple, and std::optional do. It is the standard technique for writing exception-specification-transparent wrappers."
    },
    {
      "type": "mcq",
      "tag": "Moving arrays",
      "question": "int a[4] = {1, 2, 3, 4};\nint b[4] = std::move(a);  What happens?",
      "options": [
        "It does not compile: a built-in array cannot be initialized or assigned from another array, and std::move changes nothing about that; use std::array (or a container) to get movable semantics",
        "b steals a's storage, leaving a as an empty array",
        "The four elements are moved one at a time into b",
        "It compiles and copies, because int has no move constructor"
      ],
      "answer": 0,
      "explain": "Built-in arrays are not copyable or assignable as whole objects, so there is nothing for the cast produced by std::move to enable; the declaration is simply ill-formed. std::array fixes this: it is an aggregate that copies and moves element-wise like any other class. Note the related rule that array members inside a class are moved element by element by the defaulted move operations."
    },
    {
      "type": "code",
      "tag": "Array members",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <utility>\n\nstruct Slots {\n    std::unique_ptr<int> arr[2];\n};\n\nint main() {\n    Slots a;\n    a.arr[0] = std::make_unique<int>(5);\n    Slots b = std::move(a);\n    std::cout << (a.arr[0] == nullptr) << *b.arr[0];\n}",
      "options": [
        "05",
        "0 followed by undefined behavior",
        "It does not compile: arrays are not movable",
        "15: the defaulted move constructor moves array members element by element, so a.arr[0] is guaranteed to be null"
      ],
      "answer": 3,
      "explain": "Although you cannot move a stand-alone array, the implicitly-defined move constructor of a class moves an array member by moving each element in order. Each std::unique_ptr element is genuinely moved, and its postcondition guarantees the source element is null, so the comparison prints 1 and the transferred value prints 5. This is one of the few places the language 'moves an array' for you."
    },
    {
      "type": "code",
      "tag": "Tuple moves",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <tuple>\n#include <utility>\n\nint main() {\n    std::tuple<std::unique_ptr<int>> t{std::make_unique<int>(9)};\n    auto p = std::get<0>(std::move(t));\n    std::cout << (std::get<0>(t) == nullptr) << *p;\n}",
      "options": [
        "09",
        "19",
        "It does not compile: std::get cannot be applied to an rvalue tuple",
        "The first character is unspecified"
      ],
      "answer": 1,
      "explain": "std::get has rvalue overloads: called on the xvalue std::move(t), std::get<0> returns std::unique_ptr<int>&&, so auto p move-constructs from the tuple's element. unique_ptr guarantees the source element inside the tuple is left null, so the first output is 1, followed by the owned value 9. Had t been an lvalue, get would return an lvalue reference and the move-only copy-initialization would not compile."
    },
    {
      "type": "mcq",
      "tag": "Moving pair members",
      "question": "Given std::pair<int, std::string> p;, which expressions move the string when used as the initializer std::string s = ...;?",
      "options": [
        "Only std::move(p.second)",
        "Only std::move(p).second",
        "Both: std::move(p.second) casts the member itself, and member access on the xvalue std::move(p) also yields an xvalue member",
        "Neither; pair members can only be moved with std::get<1>(std::move(p))"
      ],
      "answer": 2,
      "explain": "Class member access propagates the value category of the object expression: if the object is an xvalue, a non-static, non-reference data member accessed from it is an xvalue too. So std::move(p).second and std::move(p.second) both bind to the string's move constructor. The whole-object form is convenient when several members are being transferred from the same pair or struct in one statement."
    },
    {
      "type": "code",
      "tag": "Move iterators",
      "question": "What does this program print?",
      "code": "#include <algorithm>\n#include <iostream>\n#include <iterator>\n#include <vector>\n\nstruct S {\n    S() = default;\n    S(const S&) { std::cout << \"C\"; }\n    S(S&&) noexcept { std::cout << \"M\"; }\n};\n\nint main() {\n    std::vector<S> src(2);\n    std::vector<S> dst;\n    dst.reserve(2);\n    std::copy(std::make_move_iterator(src.begin()),\n              std::make_move_iterator(src.end()),\n              std::back_inserter(dst));\n}",
      "options": [
        "MM",
        "CC",
        "CM",
        "Nothing: std::copy never invokes constructors"
      ],
      "answer": 0,
      "explain": "std::make_move_iterator wraps the vector's iterators so that dereferencing yields S&& instead of S&. Plain std::copy therefore move-constructs each element it writes through the back_inserter, printing M twice — the algorithm 'copies', but every element transfer is a move. This adapter is how you request move semantics from any copying algorithm or range constructor."
    },
    {
      "type": "mcq",
      "tag": "Move algorithms",
      "question": "What does the call std::move(v.begin(), v.end(), out) do?",
      "options": [
        "It is ill-formed: std::move takes exactly one argument",
        "It casts the iterator range to rvalue references without touching any elements",
        "It relocates the vector's internal buffer to out in constant time",
        "It invokes the std::move algorithm from <algorithm>: like std::copy, but each element is moved to the output range, leaving the sources in valid but unspecified states"
      ],
      "answer": 3,
      "explain": "The single-argument std::move in <utility> is a cast, but there is an unrelated three-argument std::move algorithm in <algorithm> that move-assigns each element of the input range into the output range. The source elements are left valid but unspecified, and the container's size does not change. The ranges version, std::ranges::move(v, out), does the same and returns both the input and output positions."
    },
    {
      "type": "code",
      "tag": "Members of locals",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nstruct Part {\n    Part() = default;\n    Part(const Part&) { std::cout << \"C\"; }\n    Part(Part&&) noexcept { std::cout << \"M\"; }\n};\n\nstruct Machine {\n    Part part;\n};\n\nPart takePart() {\n    Machine m;\n    return m.part;\n}\n\nint main() {\n    Part p = takePart();\n}",
      "options": [
        "M",
        "Nothing: NRVO elides the copy",
        "C",
        "Either C or M, depending on the compiler"
      ],
      "answer": 2,
      "explain": "Implicit move and NRVO both require the return operand to be the plain name of a complete local object; m.part is a member subobject, so it qualifies for neither. The copy constructor therefore always runs and the output is deterministically C, unlike the elision-dependent case of returning a whole local. Writing return std::move(m.part); is the fix when the enclosing object is about to die, changing the output to M."
    }
  ]
};

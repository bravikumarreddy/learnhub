/* ===== Professional C++ — Templates, Concepts & Metaprogramming ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["procpp-templates"] = {
  title: "Professional C++ — Templates, Concepts & Metaprogramming",
  subtitle: "Deduction, specialization, variadics, C++20 concepts, CTAD and constexpr programming.",
  crumb: "Professional C++",
  questions: [
    {
      "type": "code",
      "tag": "Argument Deduction",
      "question": "What does T deduce to in call A and in call B?",
      "code": "template <typename T> void byVal(T param) {}\ntemplate <typename T> void byRef(T& param) {}\n\nint main() {\n    byVal(\"hello\");  // call A\n    byRef(\"hello\");  // call B\n}",
      "options": [
        "A: T = const char*   B: T = const char[6]",
        "A: T = const char[6]   B: T = const char*",
        "A: T = std::string   B: T = std::string",
        "Both calls deduce T = const char*"
      ],
      "answer": 0,
      "explain": "When deducing for a by-value parameter, arrays decay to pointers, so the string literal (type const char[6]) becomes const char* and T = const char*. When deducing for a reference parameter, no decay happens and T is deduced as the actual array type const char[6]. This is why templates like std::size can report the length of a raw array only when they take it by reference."
    },
    {
      "type": "code",
      "tag": "Argument Deduction",
      "question": "What happens when this program is compiled?",
      "code": "template <typename T>\nT maxOf(T a, T b) { return b < a ? a : b; }\n\nint main() {\n    auto m = maxOf(1, 2.5);\n}",
      "options": [
        "It compiles; m is 2.5 because int promotes to double",
        "It fails to compile: deduction produces conflicting types for T (int vs double)",
        "It compiles; m is 2 because double is truncated to int",
        "It fails to compile: return type deduction is not allowed for templates"
      ],
      "answer": 1,
      "explain": "Each function argument is deduced independently: T = int from the first argument and T = double from the second. Deduction does not perform arithmetic conversions to reconcile them, so it simply fails and the program is ill-formed. The fix is to specify the parameter explicitly, e.g. maxOf<double>(1, 2.5), or give the parameters two different template type parameters."
    },
    {
      "type": "code",
      "tag": "CTAD",
      "question": "What is the type of w?",
      "code": "#include <string>\n#include <utility>\n\ntemplate <typename T>\nstruct Wrapper {\n    Wrapper(T v) : value(std::move(v)) {}\n    T value;\n};\n\nWrapper(const char*) -> Wrapper<std::string>;\n\nint main() {\n    Wrapper w{\"hello\"};\n}",
      "options": [
        "Wrapper<const char*>",
        "Wrapper<char[6]>",
        "Wrapper<std::string>",
        "It fails to compile: the guide is ambiguous with the implicit one"
      ],
      "answer": 2,
      "explain": "CTAD considers both the implicit guide generated from the constructor (which would give Wrapper<const char*>) and the user-defined deduction guide. Both match the decayed const char* argument equally well, but the tie is broken in favor of the user-defined guide, so w is Wrapper<std::string>. This is exactly the trick the standard library uses so that pair p{\"a\", \"b\"} does not end up storing raw pointers in cases where the author provides guides."
    },
    {
      "type": "mcq",
      "tag": "Specialization",
      "question": "You want to partially specialize the function template `template<typename T> void process(T value)` for all pointer types. What does C++ allow?",
      "options": [
        "Write `template<typename T> void process<T*>(T* value)` — partial specializations of function templates are legal",
        "Function templates cannot be partially specialized; instead, add an overload `template<typename T> void process(T* value)` or delegate to a partially specialized class template",
        "It is only possible if process is declared inline in a header",
        "Partial specialization of function templates was added in C++17, so it works with -std=c++17 or later"
      ],
      "answer": 1,
      "explain": "The language permits partial specialization only for class templates and variable templates, never for function templates in any standard so far. The idiomatic alternatives are overloading (a template overload taking T* participates in partial ordering) or forwarding to a helper class template that you partially specialize. This restriction is a classic interview point because the syntax for the 'obvious' attempt simply does not exist."
    },
    {
      "type": "code",
      "tag": "Specialization",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\ntemplate <typename T> void f(T)   { std::cout << 1; }\ntemplate <> void f<int*>(int*)    { std::cout << 2; }\ntemplate <typename T> void f(T*)  { std::cout << 3; }\n\nint main() {\n    int i = 0;\n    f(&i);\n}",
      "options": [
        "1",
        "2",
        "3",
        "It fails to compile: the call is ambiguous"
      ],
      "answer": 2,
      "explain": "Overload resolution and partial ordering consider only the primary templates: f(T*) is more specialized than f(T) for an int* argument, so f(T*) wins. Explicit specializations do not participate in overload resolution; they only replace the body of the primary template they specialize. Because the specialization was declared before f(T*) existed, it specializes f(T), which is never selected, so 3 is printed — the famous Dimov/Abrahams ordering trap."
    },
    {
      "type": "code",
      "tag": "Overload Resolution",
      "question": "Which sequence of characters does this program output?",
      "code": "#include <iostream>\n\nvoid g(int)                    { std::cout << \"N\"; }\ntemplate <typename T> void g(T) { std::cout << \"T\"; }\n\nint main() {\n    g(42);\n    g(42L);\n}",
      "options": [
        "NT",
        "NN",
        "TT",
        "TN"
      ],
      "answer": 0,
      "explain": "For g(42) both candidates are exact matches, and when a non-template function and a template specialization are equally good, the non-template wins, printing N. For g(42L) the template can deduce T = long and provide an exact match, while the non-template would require a long-to-int conversion, so the template wins and prints T. The rule is 'prefer the non-template only on a tie', not 'always prefer the non-template'."
    },
    {
      "type": "mcq",
      "tag": "Dependent Names",
      "question": "Inside `template<typename T> void f() { T::value_type * p; }` the author intends to declare a pointer p. What actually happens?",
      "options": [
        "It declares a pointer as intended; the compiler can see value_type is a type once T is known",
        "The line is parsed as a multiplication of T::value_type by p, because a dependent qualified name is assumed to be a non-type unless prefixed with `typename`",
        "It fails to parse immediately with 'value_type is undefined' before any instantiation",
        "It works only if f is never instantiated"
      ],
      "answer": 1,
      "explain": "During the first phase of two-phase lookup the compiler must parse the template without knowing T, and the rule is that a dependent qualified name like T::value_type is assumed to name a non-type entity. The statement is therefore parsed as an expression multiplying T::value_type by p, which typically produces an error. Writing `typename T::value_type* p;` tells the parser the name is a type, which is the whole purpose of the typename keyword."
    },
    {
      "type": "mcq",
      "tag": "Dependent Names",
      "question": "In `template<typename T> void call(T obj) { /* invoke member template get with argument 0 */ }`, obj has a member function template get. Which syntax correctly calls it with template argument 0?",
      "options": [
        "obj.get<0>();",
        "obj.template get<0>();",
        "obj.typename get<0>();",
        "template obj.get<0>();"
      ],
      "answer": 1,
      "explain": "Because obj's type is dependent on T, the parser does not know that get is a member template, so obj.get<0>() is parsed with < and > as comparison operators: (obj.get < 0) > (). The `template` disambiguator after the dot tells the compiler that what follows is a member template name, making obj.template get<0>() the correct form. The same keyword is needed after -> and after :: in dependent contexts."
    },
    {
      "type": "code",
      "tag": "Fold Expressions",
      "question": "What is the output of this program?",
      "code": "#include <iostream>\n\ntemplate <typename... Ts>\nauto sum(Ts... args) {\n    return (args + ... + 0);\n}\n\nint main() {\n    std::cout << sum(1, 2, 3.5);\n}",
      "options": [
        "6",
        "6.5",
        "7",
        "It fails to compile: a fold cannot mix int and double"
      ],
      "answer": 1,
      "explain": "This is a binary right fold with init value 0, expanding to 1 + (2 + (3.5 + 0)). Usual arithmetic conversions apply at each +, so the result type is double and the value is 6.5. Folds happily mix types; the init value additionally makes the call sum() with an empty pack well-formed, returning 0."
    },
    {
      "type": "code",
      "tag": "Fold Expressions",
      "question": "What value does this program print?",
      "code": "#include <iostream>\n\ntemplate <typename... Ts>\nauto diff(Ts... a) {\n    return (a - ...);\n}\n\nint main() {\n    std::cout << diff(1, 2, 3);\n}",
      "options": [
        "-4",
        "2",
        "0",
        "It fails to compile: subtraction is not foldable"
      ],
      "answer": 1,
      "explain": "(a - ...) is a unary right fold, which expands to 1 - (2 - 3) = 1 - (-1) = 2. A left fold, written (... - a), would instead expand to (1 - 2) - 3 = -4. For non-associative operators like - the fold direction changes the result, so remembering that the ... sits on the side where grouping starts is essential."
    },
    {
      "type": "code",
      "tag": "Variadic Templates",
      "question": "What does this print?",
      "code": "#include <iostream>\n\ntemplate <typename... Ts>\nvoid p(Ts... args) {\n    std::cout << sizeof...(Ts) << sizeof...(args);\n}\n\nint main() {\n    p(1, \"a\", 2.0);\n}",
      "options": [
        "33",
        "3",
        "It fails to compile: sizeof... cannot be applied to a function parameter pack",
        "A number that depends on the byte sizes of int, const char* and double"
      ],
      "answer": 0,
      "explain": "sizeof... yields the number of elements in a pack, not any byte size, and it works on both template parameter packs (Ts) and function parameter packs (args). Both packs here have three elements, so the program prints 33. It is a compile-time constant, so it is usable in array bounds and template arguments."
    },
    {
      "type": "mcq",
      "tag": "Fold Expressions",
      "question": "What does the unary fold `(args && ...)` yield when the pack args is empty?",
      "options": [
        "true",
        "false",
        "It is a compile error: unary folds over an empty pack are always ill-formed",
        "An expression of type void"
      ],
      "answer": 0,
      "explain": "Three operators have defined identities for an empty pack in a unary fold: && yields true, || yields false, and the comma operator yields void(). For every other operator, including + and *, a unary fold over an empty pack is ill-formed, which is why you add an init value (a binary fold) when the pack may be empty."
    },
    {
      "type": "mcq",
      "tag": "Concepts",
      "question": "Given `template<typename T> concept Incrementable = requires(T t) { ++t; };` — what does the requires-expression actually do?",
      "options": [
        "It executes ++t at runtime on a default-constructed T and checks it does not throw",
        "It checks at compile time that the expression ++t would be well-formed for T; the expression is never evaluated",
        "It requires T to be default-constructible so that t can be created",
        "It checks that ++t returns T&, since that is the conventional return type"
      ],
      "answer": 1,
      "explain": "A requires-expression is a compile-time predicate: the compiler checks that each requirement inside it would compile for the given types, and the expressions are unevaluated operands, never executed. The parameter list (T t) introduces notional variables purely for writing the requirements — it imposes no default-constructibility requirement. Constraints on the result type would need a compound requirement such as { ++t } -> std::same_as<T&>."
    },
    {
      "type": "mcq",
      "tag": "Concepts",
      "question": "Concept B is defined as `template<typename T> concept B = A<T> && HasExtra<T>;` and there are two overloads: `void f(A auto x)` and `void f(B auto x)`. Calling f with a type satisfying both A and B results in:",
      "options": [
        "A compile error: the call is ambiguous because both constraints are satisfied",
        "The A overload, because it was declared first",
        "The B overload, because B's constraint subsumes A's, making it more constrained",
        "Undefined behavior: the compiler may pick either"
      ],
      "answer": 2,
      "explain": "When two candidates are otherwise equally good, the one with the more constrained declaration wins, and B = A<T> && HasExtra<T> subsumes A, so the B overload is chosen. Subsumption is computed by decomposing constraints into named concept atoms; if the same logic were written directly with raw type traits in two requires clauses, the atoms would not be recognized as related and the call would be ambiguous. This is a key practical reason to define named concepts rather than inlining boolean trait expressions."
    },
    {
      "type": "code",
      "tag": "Constrained auto",
      "question": "Which lines compile?",
      "code": "#include <concepts>\n\nint main() {\n    std::integral auto a = 42;         // line A\n    std::floating_point auto b = 42;   // line B\n}",
      "options": [
        "Both: line B implicitly converts 42 to 42.0 to satisfy the concept",
        "Only line A; line B fails because the deduced type int does not satisfy std::floating_point",
        "Only line B; integral auto is not valid syntax",
        "Neither: concepts cannot constrain auto variables, only function parameters"
      ],
      "answer": 1,
      "explain": "With constrained auto, ordinary deduction runs first — both lines deduce int from 42 — and only then is the concept checked against the deduced type. No conversion is ever attempted to make the constraint pass, so line B is ill-formed while line A compiles. Constrained auto works for variables, function return types, and parameters (abbreviated templates) in C++20."
    },
    {
      "type": "code",
      "tag": "if constexpr",
      "question": "This program compiles and prints 42. What happens if `if constexpr` is replaced with a plain `if`?",
      "code": "#include <iostream>\n#include <type_traits>\n\ntemplate <typename T>\nauto value(T t) {\n    if constexpr (std::is_pointer_v<T>) {\n        return *t;\n    } else {\n        return t;\n    }\n}\n\nint main() {\n    std::cout << value(42);\n}",
      "options": [
        "It still prints 42; the pointer branch is simply never executed",
        "It fails to compile: with a plain if both branches are instantiated, and *t is invalid for T = int (the two returns would also deduce conflicting types)",
        "It prints 0 because *t reads uninitialized memory",
        "It is undefined behavior at runtime"
      ],
      "answer": 1,
      "explain": "With if constexpr and a dependent condition, the false branch is discarded and not instantiated for that specialization, so *t is never checked for T = int. With a plain if, both branches must be fully compiled for every instantiation: *t on an int is ill-formed, and the two return statements would additionally make return type deduction inconsistent. Note that discarded branches must still be syntactically valid, and errors not dependent on T are diagnosed anyway."
    },
    {
      "type": "mcq",
      "tag": "consteval / constinit",
      "question": "Which statement about constexpr, consteval and constinit is correct?",
      "options": [
        "constexpr functions are always evaluated at compile time",
        "A consteval function must produce a compile-time constant at every call site; calling it with a runtime value is ill-formed",
        "constinit makes a variable immutable, like const",
        "consteval can be applied to variables to force compile-time initialization"
      ],
      "answer": 1,
      "explain": "consteval declares an immediate function: every call must be a constant expression, so passing a runtime value is a compile error. constexpr functions merely may run at compile time and fall back to runtime evaluation otherwise. constinit applies to variables with static or thread storage duration, guaranteeing static (compile-time) initialization to eliminate the static initialization order fiasco, but the variable itself remains mutable; consteval cannot be applied to variables at all."
    },
    {
      "type": "code",
      "tag": "consteval / constinit",
      "question": "What is the result of building and running this program?",
      "code": "#include <iostream>\n\nconstinit int counter = 10;\n\nint main() {\n    ++counter;\n    std::cout << counter;\n}",
      "options": [
        "It fails to compile: a constinit variable cannot be modified",
        "It compiles and prints 11",
        "It fails to compile: constinit is only allowed on local variables",
        "It compiles and prints 10 because the increment is optimized away"
      ],
      "answer": 1,
      "explain": "constinit only requires that the variable's initialization happen at compile time (static initialization); unlike constexpr, it does not make the object const. counter is therefore a normal mutable int at runtime and the program prints 11. constinit is in fact only allowed on variables with static or thread storage duration — the opposite of option three."
    },
    {
      "type": "code",
      "tag": "NTTPs",
      "question": "Compiled as C++20, what is the result?",
      "code": "#include <iostream>\n\nstruct Point { int x, y; };\n\ntemplate <Point P>\nint getX() { return P.x; }\n\nint main() {\n    std::cout << getX<Point{3, 4}>();\n}",
      "options": [
        "It prints 3",
        "It prints 4",
        "It fails to compile: class types can never be non-type template parameters",
        "It fails to compile: Point needs a constexpr constructor to be used this way"
      ],
      "answer": 0,
      "explain": "C++20 allows class types as non-type template parameters provided the type is 'structural' — roughly, a literal type whose bases and non-static data members are all public and themselves structural. The aggregate Point qualifies (aggregates need no user-written constexpr constructor), so getX<Point{3, 4}>() is a distinct instantiation whose P.x is 3. Before C++20 this was rejected, which is why the option about class types reflects the old rule."
    },
    {
      "type": "mcq",
      "tag": "NTTPs",
      "question": "Which of the following is NOT a valid non-type template parameter declaration in standard C++20?",
      "options": [
        "template <int N> struct A;",
        "template <double D> struct B;",
        "template <std::string S> struct C;",
        "template <auto V> struct D;"
      ],
      "answer": 2,
      "explain": "C++20 extended NTTPs to floating-point types and to structural class types, and template<auto V> (from C++17) deduces the parameter's type from the argument. std::string still does not qualify because it is not a structural type: it has private members and manages dynamic storage, so it cannot be a template parameter. std::array<char, N> or fixed-size literal wrapper classes are the standard workaround for passing string-like data as template arguments."
    },
    {
      "type": "code",
      "tag": "Abbreviated Templates",
      "question": "What does this C++20 program print?",
      "code": "#include <iostream>\n\nauto add(auto a, auto b) { return a + b; }\n\nint main() {\n    std::cout << add(1, 2.5);\n}",
      "options": [
        "3.5",
        "3",
        "It fails to compile: both auto parameters must deduce the same type",
        "It fails to compile: auto parameters are only allowed in lambdas"
      ],
      "answer": 0,
      "explain": "add is an abbreviated function template, exactly equivalent to template<typename T, typename U> auto add(T a, U b): each auto parameter introduces its own independent template parameter. So a = int, b = double, and int + double yields the double 3.5. C++14 allowed auto parameters only in generic lambdas; C++20 extended the syntax to ordinary functions."
    },
    {
      "type": "mcq",
      "tag": "SFINAE / enable_if",
      "question": "Why does writing two overloads as `template<typename T, typename = std::enable_if_t<std::is_integral_v<T>>> void f(T);` and `template<typename T, typename = std::enable_if_t<std::is_floating_point_v<T>>> void f(T);` fail?",
      "options": [
        "enable_if_t may only appear in the return type of a function template",
        "Default template arguments are not part of a function template's signature, so the two declarations declare the same template twice — a redefinition error",
        "is_integral_v and is_floating_point_v cannot both be used in the same translation unit",
        "SFINAE does not apply to default template arguments at all"
      ],
      "answer": 1,
      "explain": "A function template's signature ignores default template arguments, so both declarations are the same template and the second is an invalid redefinition. The classic fix is to move the condition into the type of a non-type parameter — std::enable_if_t<cond, int> = 0 versus std::enable_if_t<other, int> = 0 — or into the return type, both of which do differentiate the signatures. In C++20 the whole pattern is better expressed with requires clauses, which also participate in overload distinctness."
    },
    {
      "type": "mcq",
      "tag": "Member Templates",
      "question": "Class template Grid declares a member function template: `template<typename T> class Grid { template<typename U> void assign(const Grid<U>& other); };`. Which is the correct out-of-class definition?",
      "options": [
        "template <typename T, typename U> void Grid<T>::assign(const Grid<U>& other) {}",
        "template <typename T> template <typename U> void Grid<T>::assign(const Grid<U>& other) {}",
        "template <typename U> template <typename T> void Grid<T>::assign(const Grid<U>& other) {}",
        "Member function templates must be defined inside the class; no out-of-class form exists"
      ],
      "answer": 1,
      "explain": "Defining a member template of a class template outside the class requires two separate template parameter lists: the enclosing class's list first, then the member's own list. Merging them into one list, or reversing their order, is ill-formed. This member-template pattern is how Professional C++ implements conversions like assigning a Grid<int> to a Grid<double>."
    },
    {
      "type": "mcq",
      "tag": "Template Template Params",
      "question": "You want a class template whose parameter is itself a class template, so it can be instantiated like `Stack<int, std::deque>`. Which declaration is correct?",
      "options": [
        "template <typename T, template <typename...> typename Container> class Stack;",
        "template <typename T, typename Container<typename>> class Stack;",
        "template <typename T, class Container<T>> class Stack;",
        "template <typename T, Container<typename> C> class Stack;"
      ],
      "answer": 0,
      "explain": "A template template parameter is declared with its own nested parameter list: template <typename...> typename Container (using class instead of the second typename is also fine, and only became interchangeable there in C++17). The variadic inner list lets it match std::deque and std::vector, whose extra allocator parameter would otherwise have to be spelled out. The other options are simply not valid C++ syntax."
    },
    {
      "type": "code",
      "tag": "Partial Specialization",
      "question": "What is this program's output?",
      "code": "#include <iostream>\n\ntemplate <typename T> struct Traits      { static constexpr int id = 0; };\ntemplate <typename T> struct Traits<T*>  { static constexpr int id = 1; };\ntemplate <>           struct Traits<int> { static constexpr int id = 2; };\n\nint main() {\n    std::cout << Traits<int>::id << Traits<int*>::id << Traits<double>::id;\n}",
      "options": [
        "210",
        "220",
        "010",
        "It fails to compile: int* matches both the primary template and the full specialization"
      ],
      "answer": 0,
      "explain": "Traits<int> matches the full specialization exactly, giving 2. Traits<int*> does not match the full specialization (which is only for int, not int*) but does match the T* partial specialization, giving 1; a partial specialization is always preferred over the primary template when it matches. Traits<double> matches only the primary template, giving 0, so the output is 210."
    },
    {
      "type": "code",
      "tag": "Default Template Args",
      "question": "Does this compile, and if so, what is the type of s.storage?",
      "code": "#include <vector>\n#include <type_traits>\n\ntemplate <typename T, typename Container = std::vector<T>>\nstruct Stack {\n    Container storage;\n};\n\nint main() {\n    Stack<int> s;\n    static_assert(std::is_same_v<decltype(s.storage), std::vector<int>>);\n}",
      "options": [
        "It fails to compile: a default template argument cannot refer to an earlier template parameter of the same template",
        "It fails to compile: class templates may not mix defaulted and non-defaulted template parameters",
        "It compiles: a default template argument may reference earlier parameters, so Container becomes std::vector<int> and the static_assert holds",
        "It compiles, but storage has type std::vector<T> and the static_assert fails"
      ],
      "answer": 2,
      "explain": "Default template arguments are processed left to right and may use any parameter declared before them, so Container defaults to std::vector<T> with T already bound to int. This is exactly how the standard library declares std::vector<T, Allocator = std::allocator<T>> and std::set<T, Compare = std::less<T>>. The default is only substituted when the user omits the argument, and like other template machinery it is instantiated only when actually used."
    },
    {
      "type": "mcq",
      "tag": "Default Template Args",
      "question": "Given `template <typename T = double> T half(T x) { return x / 2; }`, what is T for the call half(3)?",
      "options": [
        "int — deduction from the argument succeeds and takes precedence; the default is consulted only when T cannot be deduced",
        "double — a default template argument always overrides deduction",
        "The call is ambiguous between int and double and fails to compile",
        "It fails to compile: function templates cannot have default template arguments"
      ],
      "answer": 0,
      "explain": "Function templates have been allowed default template arguments since C++11, but a default is used only when the parameter cannot be deduced from the call. Here deduction from the argument 3 yields T = int, so the double default is ignored and half returns 1 (integer division). The default would matter for something like template <typename T = double> T make(); where nothing in the call determines T."
    },
    {
      "type": "mcq",
      "tag": "extern template",
      "question": "A widely included header contains a full definition of the class template MyVector plus the line `extern template class MyVector<int>;`. What does that line do?",
      "options": [
        "It exports the instantiation from the current translation unit so other translation units can link against it",
        "It is an explicit instantiation declaration: it suppresses implicit instantiation of MyVector<int> in translation units that see it, and exactly one translation unit in the program must provide the matching explicit instantiation definition",
        "It forward-declares the template so its definition may appear later in the same translation unit",
        "It gives MyVector<int> internal linkage so each translation unit gets a private copy"
      ],
      "answer": 1,
      "explain": "extern template declares that the named specialization is instantiated elsewhere, so every including translation unit skips generating its members — a compile-time and object-size optimization for hot specializations. One source file must contain the matching explicit instantiation definition, `template class MyVector<int>;`, which forces all members to be instantiated there. The pairing is the template analogue of declaring in a header and defining in one .cpp file."
    },
    {
      "type": "code",
      "tag": "extern template",
      "question": "This single translation unit is the entire program. What is the result of building it?",
      "code": "template <typename T>\nT twice(T value) { return value + value; }\n\nextern template int twice<int>(int);\n\nint main() {\n    return twice(5);\n}",
      "options": [
        "It builds and returns 10",
        "It fails to compile: extern template cannot appear after the template's definition",
        "It fails to compile: twice<int> is used in main after its instantiation was suppressed",
        "It compiles, but linking fails with an undefined symbol for twice<int>: the explicit instantiation declaration suppresses implicit instantiation, and no translation unit provides the definition"
      ],
      "answer": 3,
      "explain": "The extern template line promises that twice<int> is explicitly instantiated in some other translation unit, so the compiler emits a call but no definition. Since no translation unit in the program contains `template int twice<int>(int);`, the program is ill-formed (no diagnostic required), which in practice surfaces as a linker error. Removing the extern line, or adding the explicit instantiation definition somewhere, makes the program build and return 10."
    },
    {
      "type": "mcq",
      "tag": "Templates & ODR",
      "question": "A function template is fully defined in a header that 20 different .cpp files include, and every file uses f<int>. Why is this not an ODR violation at link time?",
      "options": [
        "Because the linker keeps each definition in a separate section and duplicates are diagnosed only under link-time optimization",
        "Because templates automatically have internal linkage, so each translation unit gets its own uniquely named copy",
        "Because the ODR explicitly permits multiple definitions of templates (like inline functions) across translation units as long as they are token-for-token identical and mean the same thing; the toolchain then merges the duplicate instantiations",
        "It is an ODR violation, but all mainstream compilers suppress the error for templates"
      ],
      "answer": 2,
      "explain": "Templates, inline functions and inline variables are the ODR's carve-out: they may be defined in every translation unit provided all definitions are identical token sequences with identical meaning. Implicit instantiations of f<int> are emitted as mergeable (weak/COMDAT) symbols and the linker keeps one. If two translation units saw different definitions of the template, the program would be ill-formed with no diagnostic required — which is why template definitions belong in headers, not scattered per-file."
    },
    {
      "type": "code",
      "tag": "Dependent Base Lookup",
      "question": "What happens when this program is compiled?",
      "code": "template <typename T>\nstruct Base {\n    int data = 1;\n};\n\ntemplate <typename T>\nstruct Derived : Base<T> {\n    int get() { return data; }\n};\n\nint main() {\n    Derived<int> d;\n    return d.get();\n}",
      "options": [
        "It compiles and get() returns 1",
        "It fails to compile: data is a non-dependent name, so it is looked up at template definition time, and that lookup does not search the dependent base class Base<T>",
        "It compiles only as long as Derived is never instantiated",
        "It fails to compile because Base<T> is still an incomplete type when Derived is defined"
      ],
      "answer": 1,
      "explain": "Because Base<T> depends on T, it could be specialized to contain anything, so the compiler refuses to look inside it for the plain name data during the first phase of two-phase lookup — and finds nothing else. The fixes all make the name dependent so lookup is deferred to instantiation: this->data, Base<T>::data, or a using-declaration `using Base<T>::data;` in Derived. This is the reason for the this-> prefixes sprinkled through code that derives from template bases."
    },
    {
      "type": "mcq",
      "tag": "Dependent Base Lookup",
      "question": "In `template <typename T> struct D : B<T>`, a member function of D must call the base-class member helper(). Which of the following does NOT make the call compile?",
      "options": [
        "this->helper();",
        "B<T>::helper();",
        "Adding `using B<T>::helper;` to D and then calling helper();",
        "Calling ::helper();"
      ],
      "answer": 3,
      "explain": "The first three all turn helper into a dependent name so it is looked up at instantiation time, when B<T> can be searched. ::helper does the opposite: the scope-resolution prefix restricts lookup to the global namespace, which does not contain the base's member. Note one behavioral difference among the working forms: B<T>::helper() names the function with a qualified-id, which suppresses virtual dispatch, while this->helper() keeps it."
    },
    {
      "type": "code",
      "tag": "CRTP",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\ntemplate <typename Derived>\nstruct ObjectCounter {\n    inline static int count = 0;\n    ObjectCounter() { ++count; }\n};\n\nstruct Widget : ObjectCounter<Widget> {};\nstruct Gadget : ObjectCounter<Gadget> {};\n\nint main() {\n    Widget w1, w2;\n    Gadget g1;\n    std::cout << Widget::count << Gadget::count;\n}",
      "options": [
        "21",
        "33",
        "30",
        "It fails to compile: Widget is still incomplete when used as a template argument for its own base class"
      ],
      "answer": 0,
      "explain": "ObjectCounter<Widget> and ObjectCounter<Gadget> are two distinct classes, each with its own static count, so the CRTP gives every derived class a private per-type counter: 2 Widgets and 1 Gadget print 21. A plain non-template base would share one counter across all derived types. Using the still-incomplete Widget as a template argument is fine here because the base only needs the type's identity, not its definition."
    },
    {
      "type": "mcq",
      "tag": "CRTP",
      "question": "With CRTP, `struct D : Base<D>`, the class D is incomplete at the point where Base<D> is instantiated. Why can Base<D> nevertheless call D's members via static_cast<D*>(this)?",
      "options": [
        "Because the compiler delays instantiating the whole of Base<D> until D is complete",
        "Because static_cast on this is resolved dynamically at runtime, like dynamic_cast",
        "Because member function bodies of a class template are instantiated only when actually called, and by then D is a complete type",
        "It only works if the members being called are declared before the inheritance clause of D"
      ],
      "answer": 2,
      "explain": "Instantiating Base<D> instantiates the class's declarations, but each member function body is instantiated lazily on first use — long after D's definition is complete — so the downcast and calls into D are legal there. This is also why CRTP breaks if the base needs Derived's contents at class scope, e.g. `typename Derived::value_type member;` as a data member: that would require completeness too early. The cast itself is safe because the base subobject really does live inside a D."
    },
    {
      "type": "code",
      "tag": "auto Return Type",
      "question": "This recursive function uses an auto return type. What happens?",
      "code": "#include <iostream>\n\nauto fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n - 1);\n}\n\nint main() {\n    std::cout << fact(5);\n}",
      "options": [
        "It fails to compile: a function with a deduced return type can never be recursive",
        "It compiles and prints 120: the first return statement deduces int before the recursive call is reached, so the recursion uses an already-known return type",
        "It fails to compile: return type deduction requires exactly one return statement",
        "It compiles, but the deduced type is unspecified because deduction happens once per call"
      ],
      "answer": 1,
      "explain": "Recursion with a deduced return type is legal as long as a return statement that does not depend on the recursive call has already been seen, fixing the type. Here `return 1;` deduces int, so `n * fact(n - 1)` type-checks against it and the program prints 120. Swap the two returns (or write it as a single conditional whose recursive branch comes first) and it fails with 'function used before its return type is deduced'."
    },
    {
      "type": "code",
      "tag": "Deducing this (C++23)",
      "question": "Compiled as C++23, what does this program print?",
      "code": "#include <iostream>\n\nint main() {\n    auto fib = [](this auto self, int n) -> int {\n        return n < 2 ? n : self(n - 1) + self(n - 2);\n    };\n    std::cout << fib(6);\n}",
      "options": [
        "It fails to compile: a lambda cannot refer to itself",
        "6",
        "8",
        "13"
      ],
      "answer": 2,
      "explain": "The C++23 explicit object parameter (deducing this) hands the lambda's own closure object to the call as self, giving the lambda a name for itself and making direct recursion possible without std::function or a Y-combinator helper. fib computes the Fibonacci sequence, and fib(6) is 8 (0, 1, 1, 2, 3, 5, 8). Before C++23 the standard workaround was passing the lambda to itself or using std::function at a runtime cost."
    },
    {
      "type": "code",
      "tag": "Variable Templates",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\ntemplate <typename T> constexpr bool isPointer = false;\ntemplate <typename T> constexpr bool isPointer<T*> = true;\n\nint main() {\n    std::cout << isPointer<int*> << isPointer<int>;\n}",
      "options": [
        "10",
        "01",
        "It fails to compile: variable templates cannot be partially specialized",
        "11"
      ],
      "answer": 0,
      "explain": "Variable templates (C++14) support both partial and full specialization, unlike function templates and alias templates. isPointer<int*> matches the T* partial specialization and yields true (printed as 1); isPointer<int> falls back to the primary template's false. This is precisely the mechanism behind the standard library's _v shortcuts such as std::is_pointer_v."
    },
    {
      "type": "mcq",
      "tag": "Alias Templates",
      "question": "Which statement about alias templates such as `template <typename T> using Vec = std::vector<T>;` is correct?",
      "options": [
        "They can be explicitly specialized but not partially specialized",
        "They can be neither explicitly nor partially specialized; if you need per-type behavior, alias a class template (a traits class) and specialize that class template instead",
        "They can be both partially and explicitly specialized, exactly like class templates",
        "They can be partially specialized, but only for pointer and reference types"
      ],
      "answer": 1,
      "explain": "An alias template is transparent: writing Vec<int> immediately denotes std::vector<int>, so there is no distinct 'Vec entity' left for a specialization to attach to. When customization is needed, the idiom is a class template with a nested type (specialize the class), fronted by an alias like std::remove_cv_t that forwards to remove_cv<T>::type. The same transparency also means an alias template never triggers its own implicit instantiation bookkeeping."
    },
    {
      "type": "code",
      "tag": "Alias Templates",
      "question": "Why does the call store(3) fail to compile?",
      "code": "template <typename T> struct Identity { using type = T; };\ntemplate <typename T> using Identity_t = typename Identity<T>::type;\n\ntemplate <typename T>\nvoid store(Identity_t<T> value) {}\n\nint main() {\n    store(3);\n}",
      "options": [
        "Because 3 is an rvalue and Identity_t<T> requires an lvalue argument",
        "Because alias templates may not appear in function parameter lists",
        "Because Identity<int> was never explicitly instantiated before the call",
        "Because Identity_t<T> is immediately replaced by typename Identity<T>::type, and the part left of :: is a non-deduced context, so T cannot be inferred from the argument"
      ],
      "answer": 3,
      "explain": "The alias is transparent, so the parameter's real type is typename Identity<T>::type — and deduction never tries to invert a nested-name mapping, since arbitrary specializations of Identity could map many Ts to the same ::type. The call therefore fails with 'couldn't infer template argument T', although store<int>(3) with the argument spelled explicitly is fine. std::type_identity exists precisely to exploit this: it deliberately blocks deduction on chosen parameters."
    },
    {
      "type": "code",
      "tag": "auto Return Type",
      "question": "What happens when pick(1, true) is instantiated?",
      "code": "template <typename T>\nauto pick(T value, bool takeFirst) {\n    if (takeFirst) return value;\n    return 0.5;\n}\n\nint main() {\n    auto r = pick(1, true);\n}",
      "options": [
        "It fails to compile: the two return statements deduce conflicting types (int and double), which is ill-formed for a deduced return type",
        "It compiles; the return type is double because double can represent both values",
        "It compiles; the return type is int because the first return statement wins",
        "It compiles; the return type is std::common_type_t<int, double>"
      ],
      "answer": 0,
      "explain": "With a deduced return type, every return statement must deduce exactly the same type; the compiler performs no reconciliation such as computing a common type. For T = int the returns deduce int and double, so the instantiation is ill-formed. The fix is to converge the types yourself — e.g. return static_cast<double>(value); or declare the return type as std::common_type_t<T, double>."
    },
    {
      "type": "code",
      "tag": "decltype(auto)",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nint g = 10;\n\ndecltype(auto) direct() { return g; }\ndecltype(auto) parens() { return (g); }\n\nint main() {\n    parens() = 42;\n    std::cout << g;\n}",
      "options": [
        "It fails to compile: the result of a function call cannot be assigned to",
        "10, because parens() returns a copy of g",
        "42: with decltype(auto), return (g); deduces int& — a parenthesized name is treated as an lvalue expression — so parens() returns a reference to g",
        "The program has undefined behavior because parens() returns a dangling reference"
      ],
      "answer": 2,
      "explain": "decltype(auto) applies the decltype rules to the return expression: for the unparenthesized id-expression g it yields the declared type int, but for (g) it yields int& because the expression is an lvalue. parens() therefore returns a reference to the global, the assignment stores 42, and the program prints 42; direct() = 5 would not compile since it returns a prvalue. The reference is not dangling here because g has static storage duration — the same pattern with a local variable would be a bug."
    },
    {
      "type": "mcq",
      "tag": "decltype(auto)",
      "question": "A generic wrapper `template <typename F> ??? call(F f) { return f(); }` must return exactly what f() returns — including int& when f() returns a reference. Which placeholder return type is correct, and why?",
      "options": [
        "auto — it deduces int& automatically whenever f() returns int&",
        "decltype(auto) — it applies the decltype rules to the return expression, preserving reference-ness and cv-qualification, whereas plain auto uses template deduction rules and always strips references",
        "auto&& — it behaves identically to decltype(auto) in every case",
        "const auto& — the safest choice for any return type"
      ],
      "answer": 1,
      "explain": "Plain auto deduces like a by-value template parameter, so an int& returned by f() degrades to int and callers get a copy. decltype(auto) instead gives the wrapper exactly decltype(f()) — int for prvalues, int& or int&& for references — which is what perfect-forwarding wrappers need. auto&& is not equivalent: it always produces a reference type, so wrapping a by-value f() would return a reference to a temporary that is destroyed when call returns."
    },
    {
      "type": "code",
      "tag": "Trailing Return Type",
      "question": "What does this program print, and what is the trailing return type doing?",
      "code": "#include <iostream>\n#include <vector>\n\ntemplate <typename C>\nauto first(C& c) -> decltype(c[0]) { return c[0]; }\n\nint main() {\n    std::vector<int> v{1, 2, 3};\n    first(v) = 9;\n    std::cout << v[0];\n}",
      "options": [
        "It fails to compile: first(v) is an rvalue and cannot appear on the left of an assignment",
        "1 — the assignment writes into a temporary copy returned by first",
        "9 — but a plain auto return type would behave exactly the same way",
        "9 — decltype(c[0]) is int&, so the caller assigns through the returned reference; with a plain auto return type the function would return a copy and first(v) = 9 would not even compile"
      ],
      "answer": 3,
      "explain": "std::vector's operator[] returns int&, and decltype(c[0]) preserves that reference, so the assignment modifies the vector's first element and 9 is printed. Plain auto would strip the reference and return int by value, making the assignment target a prvalue — a compile error. The trailing position is required because the expression mentions the parameter c, which is not in scope before the parameter list (decltype(auto) is the modern alternative)."
    },
    {
      "type": "mcq",
      "tag": "SFINAE",
      "question": "A function template declares its return type as `-> decltype(t.serialize())`. During overload resolution for a type T that has no serialize() member, what happens?",
      "options": [
        "Substitution fails in the immediate context, so the candidate is silently removed from the overload set (SFINAE) and another overload can still be selected",
        "A hard compile error occurs, because return types are not part of the immediate context of substitution",
        "The candidate stays in the overload set but automatically loses every tie-break",
        "The candidate can be called, but throws an exception at runtime"
      ],
      "answer": 0,
      "explain": "This is C++11 expression SFINAE: an invalid expression or type formed while substituting template arguments into the declaration — parameter types, return type, template parameter list — is a deduction failure, not an error. The failed candidate simply drops out, which is why pairing such a template with a fallback overload works. Only failures in the immediate context count: an error triggered inside the body, or while instantiating some other class in order to check the declaration, is still a hard error."
    },
    {
      "type": "code",
      "tag": "Expression SFINAE",
      "question": "What is the output of this program?",
      "code": "#include <iostream>\n#include <string>\n\ntemplate <typename T>\nauto len(const T& t) -> decltype(t.size()) { return t.size(); }\n\nint len(...) { return -1; }\n\nint main() {\n    std::cout << len(std::string(\"abc\")) << ' ' << len(42);\n}",
      "options": [
        "It fails to compile: len(42) attempts to call 42.size()",
        "3 3",
        "3 -1",
        "-1 -1"
      ],
      "answer": 2,
      "explain": "For std::string, decltype(t.size()) substitutes successfully and the template — an exact match — beats the ellipsis overload, which always ranks last, printing 3. For int, substituting into the return type fails (42 has no size()), SFINAE removes the template, and the variadic fallback returns -1. This template-plus-ellipsis pairing is the skeleton of many pre-C++17 detection utilities."
    },
    {
      "type": "code",
      "tag": "void_t Detection",
      "question": "What does this detection-idiom program print?",
      "code": "#include <iostream>\n#include <type_traits>\n\ntemplate <typename, typename = void>\nstruct HasValueType : std::false_type {};\n\ntemplate <typename T>\nstruct HasValueType<T, std::void_t<typename T::value_type>>\n    : std::true_type {};\n\nstruct S { using value_type = int; };\n\nint main() {\n    std::cout << HasValueType<S>::value << HasValueType<double>::value;\n}",
      "options": [
        "01",
        "10",
        "11",
        "It fails to compile: double::value_type is ill-formed"
      ],
      "answer": 1,
      "explain": "For S, typename S::value_type is valid, void_t collapses it to void, and the partial specialization matches HasValueType<S, void>, giving true. For double the substitution into void_t fails, SFINAE discards the partial specialization instead of erroring, and the primary template answers false — so the output is 10. This is the classic C++17 detection idiom that C++20 concepts have largely replaced."
    },
    {
      "type": "mcq",
      "tag": "void_t Detection",
      "question": "In the void_t detection idiom, why must the primary template be declared `template <typename T, typename = void> struct Has : std::false_type {};` — with void specifically as the default?",
      "options": [
        "Because void is the only type permitted as a default template argument",
        "Because the default makes the trait instantiate lazily",
        "Because users write Has<T>, which means Has<T, void>; the partial specialization is chosen only if its void_t<...> both substitutes successfully AND yields that same type void — with any other default the specialization could never match",
        "Because it reserves a slot for future extensions of the trait"
      ],
      "answer": 2,
      "explain": "The mechanism has two gates: the expression inside void_t must be well-formed, and the resulting type (always void on success) must equal the argument being matched, which defaulted to void. If the primary's default were int, a successful void_t would produce void, fail to match Has<T, int>, and the specialization would be dead code — the trait would always report false. Understanding this two-step match is the key to writing custom detection traits correctly."
    },
    {
      "type": "mcq",
      "tag": "Nested Requirements",
      "question": "Inside a requires-expression, what is the difference between the requirement `sizeof(T) > 4;` and `requires sizeof(T) > 4;`?",
      "options": [
        "None — the requires keyword is optional inside a requires-expression",
        "The first is checked at runtime, the second at compile time",
        "The first form is ill-formed; every requirement must begin with the requires keyword",
        "`sizeof(T) > 4;` is a simple requirement that only checks the expression is well-formed — which it always is, so it constrains nothing; `requires sizeof(T) > 4;` is a nested requirement that actually evaluates the predicate and demands it be true"
      ],
      "answer": 3,
      "explain": "A simple requirement asserts only well-formedness of the expression, never its value, so sizeof(T) > 4 as a bare requirement is satisfied by every type. Prefixing requires turns it into a nested requirement whose constant expression must evaluate to true for the concept to hold. Forgetting the inner requires is one of the most common concepts bugs — the concept silently accepts everything."
    },
    {
      "type": "mcq",
      "tag": "requires requires",
      "question": "What does the doubled keyword mean in `template <typename T> requires requires(T t) { t + t; } T twice(T t);`?",
      "options": [
        "The first requires introduces the requires-clause, which needs a boolean constraint; the second begins an ad-hoc requires-expression serving as that constraint, checking that t + t is well-formed",
        "It is a typo — a single requires means exactly the same thing",
        "The doubled keyword makes the constraint checked twice: at declaration and again at instantiation",
        "The first requires constrains T while the second constrains the parameter t"
      ],
      "answer": 0,
      "explain": "A requires-clause must be followed by a constraint that is a constant boolean expression, and a requires-expression happens to be exactly that — a bool that is true when its requirements hold. Writing requires requires inlines an anonymous concept at the point of use. It is legal but usually a hint that the constraint deserves a name: a named concept is reusable, more readable, and participates properly in subsumption."
    },
    {
      "type": "code",
      "tag": "Constraint Subsumption",
      "question": "Both overloads' constraints are satisfied for int. What is the result?",
      "code": "#include <iostream>\n#include <type_traits>\n\ntemplate <typename T> requires std::is_integral_v<T>\nvoid f(T) { std::cout << 1; }\n\ntemplate <typename T> requires (std::is_integral_v<T> && sizeof(T) >= 4)\nvoid f(T) { std::cout << 2; }\n\nint main() {\n    f(42);\n}",
      "options": [
        "It prints 2, because the second overload's constraint is logically stricter",
        "It prints 1, because the first matching overload is chosen",
        "It prints 12: both overloads are invoked",
        "It fails to compile: the call is ambiguous, because subsumption is computed from named concepts, and the two textually identical is_integral_v atoms in different declarations are not recognized as related"
      ],
      "answer": 3,
      "explain": "Partial ordering by constraints compares atomic constraints, and two atoms are considered identical only when they come from the same expression in the source — the is_integral_v<T> in the first overload and the one in the second are different atoms. Neither constraint subsumes the other, both overloads survive, and the call is ambiguous. Wrap the traits in named concepts (concept Integral = std::is_integral_v<T>; concept BigIntegral = Integral<T> && sizeof(T) >= 4) and BigIntegral subsumes Integral, so 2 would be printed — the practical reason to always name your concepts."
    },
    {
      "type": "mcq",
      "tag": "Standard Concepts",
      "question": "Why is std::same_as<T, U> specified to check sameness in both directions (T same as U, and U same as T) rather than simply wrapping std::is_same_v<T, U>?",
      "options": [
        "Because std::is_same_v cannot be used inside a concept definition",
        "So that same_as<T, U> and same_as<U, T> subsume each other, letting concept-based overloads that spell the arguments in either order be compared during partial ordering",
        "Because sameness of types is not actually a symmetric relation in C++",
        "So that implicit conversions between T and U are also permitted"
      ],
      "answer": 1,
      "explain": "same_as is defined via a helper so it decomposes into two symmetric atomic constraints; without that, same_as<T, U> and same_as<U, T> would be unrelated atoms and overloads using the two spellings could not be partially ordered. Contrast std::convertible_to<From, To>, where direction is meaningful: it requires both implicit and static_cast (explicit) convertibility from From to To. Choosing same_as versus convertible_to in compound requirements is a real design decision — same_as pins the exact type, convertible_to accepts proxies."
    },
    {
      "type": "code",
      "tag": "Standard Concepts",
      "question": "What does this program print?",
      "code": "#include <concepts>\n#include <iostream>\n\nvoid f(std::integral auto)        { std::cout << 'I'; }\nvoid f(std::signed_integral auto) { std::cout << 'S'; }\n\nint main() {\n    f(5);\n    f(5u);\n}",
      "options": [
        "II",
        "SS",
        "SI",
        "It fails to compile: f(5) matches both overloads ambiguously"
      ],
      "answer": 2,
      "explain": "std::signed_integral is defined as integral<T> && is_signed_v<T>, so it subsumes std::integral, and for the int argument 5 — which satisfies both — the more constrained overload wins, printing S. The unsigned argument 5u fails signed_integral, leaving only the integral overload, printing I. The subsumption works because signed_integral is built from the named concept integral, not from raw type traits."
    },
    {
      "type": "code",
      "tag": "Constrained CTAD",
      "question": "What happens when this is compiled?",
      "code": "#include <concepts>\n\ntemplate <std::integral T>\nstruct Box {\n    Box(T value) {}\n};\n\nint main() {\n    Box b(3.14);\n}",
      "options": [
        "It fails to compile: CTAD deduces T = double from 3.14, and the constraint std::integral<double> then fails; no conversion to an integral type is attempted to rescue the deduction",
        "It compiles: 3.14 is converted to the int 3 so the constraint is satisfied",
        "It compiles as Box<double>: constraints are ignored during class template argument deduction",
        "It fails to compile: a constrained class template cannot use CTAD at all"
      ],
      "answer": 0,
      "explain": "Class template argument deduction runs first and deduces T = double from the constructor argument; the constraint on the template parameter is checked afterwards against the deduced type and fails. Deduction never inserts conversions to satisfy a constraint. Box b(3); would compile fine as Box<int>, and the constraint gives a far clearer error message than a static_assert buried in the class body."
    },
    {
      "type": "code",
      "tag": "Type Traits",
      "question": "What is the output?",
      "code": "#include <iostream>\n#include <type_traits>\n\nint main() {\n    std::cout << std::is_same_v<int, const int>\n              << std::is_same_v<int, signed>\n              << std::is_same_v<char, signed char>;\n}",
      "options": [
        "110",
        "010",
        "011",
        "111"
      ],
      "answer": 1,
      "explain": "is_same is an exact comparison including cv-qualifiers, so int and const int differ (strip with remove_cv_t or remove_cvref_t when you want qualifier-insensitive comparison). signed is merely another spelling of the same type int, so that test is true. char, however, is a genuinely distinct type from both signed char and unsigned char — even though it shares a representation with one of them — so the last test is false, giving 010."
    },
    {
      "type": "mcq",
      "tag": "Type Traits",
      "question": "Given `class B {}; class D : B {};` (note: inheritance is private by default for classes), which statement about std::is_base_of_v is correct?",
      "options": [
        "is_base_of_v<B, D> is false because the inheritance is private",
        "is_base_of_v<int, int> is true, since every type counts as its own base",
        "is_base_of_v<B, D> is true despite the private inheritance, and is_base_of_v<B, B> is true for classes — but is_base_of_v<int, int> is false, because non-class types have no bases",
        "is_base_of_v<D, B> is also true, because the trait is symmetric"
      ],
      "answer": 2,
      "explain": "is_base_of reports the inheritance relationship regardless of access control, so a private base still yields true — unlike std::is_convertible_v<D*, B*>, which would be false because the conversion is inaccessible. A class is considered its own (improper) base, but the trait is defined to be false whenever either type is not a class, so is_base_of_v<int, int> is false. The trait is directional: the base goes first, the derived second."
    },
    {
      "type": "code",
      "tag": "remove_cvref_t",
      "question": "What is the output?",
      "code": "#include <iostream>\n#include <type_traits>\n\nint main() {\n    std::cout << std::is_same_v<std::remove_cvref_t<const int&>, int>\n              << std::is_same_v<std::remove_cvref_t<const char(&)[3]>, const char*>\n              << std::is_same_v<std::decay_t<const char(&)[3]>, const char*>;\n}",
      "options": [
        "111",
        "110",
        "011",
        "101"
      ],
      "answer": 3,
      "explain": "remove_cvref_t (C++20) strips only the reference and cv-qualifiers: const int& becomes int (true), and const char(&)[3] becomes the array type char[3] — not a pointer — so the middle test is false. decay_t additionally applies array-to-pointer and function-to-pointer decay, modeling by-value parameter passing, so it does yield const char* (true), giving 101. Choose remove_cvref_t when you want the plain type without surprise decay, and decay_t when you want exactly what by-value deduction would produce."
    },
    {
      "type": "mcq",
      "tag": "conditional_t",
      "question": "`using U = std::conditional_t<std::is_integral_v<T>, std::make_unsigned_t<T>, T>;` fails to compile for T = double even though the condition is false. Why?",
      "options": [
        "Both the true and false branches must be valid types no matter which one is selected — std::make_unsigned_t<double> is ill-formed the moment it is written, because conditional_t does not evaluate its arguments lazily",
        "conditional_t evaluates its condition at runtime, so both branches must be compiled",
        "std::is_integral_v<double> is itself ill-formed",
        "std::make_unsigned_t requires a const-qualified type"
      ],
      "answer": 0,
      "explain": "All template arguments of conditional_t are formed eagerly before the selection happens; there is no short-circuiting in the type system. The fix is to defer the nested ::type access until after selection — e.g. typename std::conditional_t<std::is_integral_v<T>, std::make_unsigned<T>, std::type_identity<T>>::type, where the branches are cheap wrapper classes — or to sidestep types entirely with if constexpr in function code. The same eager-evaluation trap applies to any trait composed of other traits."
    },
    {
      "type": "code",
      "tag": "common_type_t",
      "question": "What is the output?",
      "code": "#include <iostream>\n#include <type_traits>\n\nint main() {\n    std::cout << std::is_same_v<std::common_type_t<int, long>, long>\n              << std::is_same_v<std::common_type_t<int, unsigned>, unsigned>\n              << std::is_same_v<std::common_type_t<char, short>, int>;\n}",
      "options": [
        "100",
        "101",
        "110",
        "111"
      ],
      "answer": 3,
      "explain": "common_type is modeled on the type of a ternary conditional expression, which applies the usual arithmetic conversions. int/long gives long; int/unsigned gives unsigned — the signed operand converts, a classic source of sign bugs; and char/short both promote to int before the comparison, so their common type is int. All three tests are true, printing 111."
    },
    {
      "type": "code",
      "tag": "index_sequence",
      "question": "This is a hand-rolled version of std::apply. What does it print?",
      "code": "#include <iostream>\n#include <tuple>\n#include <utility>\n\ntemplate <typename F, typename Tuple, std::size_t... Is>\ndecltype(auto) applyImpl(F&& f, Tuple&& t, std::index_sequence<Is...>) {\n    return std::forward<F>(f)(std::get<Is>(std::forward<Tuple>(t))...);\n}\n\ntemplate <typename F, typename Tuple>\ndecltype(auto) myApply(F&& f, Tuple&& t) {\n    constexpr auto size = std::tuple_size_v<std::remove_cvref_t<Tuple>>;\n    return applyImpl(std::forward<F>(f), std::forward<Tuple>(t),\n                     std::make_index_sequence<size>{});\n}\n\nint main() {\n    std::cout << myApply([](int a, int b) { return a * b; }, std::tuple{6, 7});\n}",
      "options": [
        "67",
        "42",
        "It fails to compile: a parameter pack cannot be expanded inside std::get",
        "13"
      ],
      "answer": 1,
      "explain": "make_index_sequence<2> produces index_sequence<0, 1>, and deducing it in applyImpl gives the function a pack of indices Is. The expansion std::get<Is>(t)... unrolls to f(get<0>(t), get<1>(t)), i.e. the lambda receives 6 and 7 and returns 42. This deduce-the-indices helper-function shape is the standard recipe behind std::apply, tuple printing, and most tuple metaprogramming."
    },
    {
      "type": "mcq",
      "tag": "index_sequence",
      "question": "What exactly is std::make_index_sequence<3>?",
      "options": [
        "An alias for std::integer_sequence<std::size_t, 0, 1, 2> — a compile-time list of indices starting at 0, carried entirely in the type",
        "An alias for std::integer_sequence<std::size_t, 1, 2, 3>",
        "A runtime container object holding the values 0, 1 and 2",
        "An array type equivalent to std::size_t[3]"
      ],
      "answer": 0,
      "explain": "make_index_sequence<N> expands to integer_sequence<size_t, 0, 1, ..., N-1>; the values exist purely as template arguments and the object itself is an empty tag. Its whole purpose is to be passed to a function template declared with template <std::size_t... Is> and a parameter of type index_sequence<Is...>, so deduction hands the body a usable pack of indices. Starting at 0 makes it line up directly with std::get and tuple element numbering."
    },
    {
      "type": "code",
      "tag": "Pack Indexing",
      "question": "Before C++26 there is no direct pack-indexing syntax. What does this workaround print?",
      "code": "#include <iostream>\n#include <tuple>\n#include <utility>\n\ntemplate <std::size_t N, typename... Ts>\ndecltype(auto) nth(Ts&&... args) {\n    return std::get<N>(std::forward_as_tuple(std::forward<Ts>(args)...));\n}\n\nint main() {\n    std::cout << nth<1>(10, 20, 30);\n}",
      "options": [
        "10",
        "30",
        "20",
        "It fails to compile: std::get requires an lvalue tuple"
      ],
      "answer": 2,
      "explain": "forward_as_tuple wraps the pack in a tuple of references without copying, and std::get<1> selects the second element (indices are 0-based), so 20 is printed. This tuple detour is the idiomatic pre-C++26 way to index a pack; C++26 finally adds native pack indexing spelled args...[1]. Returning decltype(auto) preserves the reference produced by std::get."
    },
    {
      "type": "code",
      "tag": "Recursive Variadics",
      "question": "This recursive variadic function has no zero-argument base-case overload. What happens?",
      "code": "#include <iostream>\n\ntemplate <typename T, typename... Rest>\nvoid printAll(T first, Rest... rest) {\n    std::cout << first;\n    if constexpr (sizeof...(rest) > 0) {\n        printAll(rest...);\n    }\n}\n\nint main() {\n    printAll(1, 'a', 2.5);\n}",
      "options": [
        "It fails to compile: recursion over a pack requires a separate printAll() overload for the empty pack",
        "It compiles and prints 1a2.5 — when the pack is empty, if constexpr discards the recursive call entirely, so a zero-argument call is never instantiated",
        "It compiles but prints only 1",
        "It compiles but recurses forever at runtime"
      ],
      "answer": 1,
      "explain": "In the final instantiation, sizeof...(rest) is 0, the constexpr condition is false, and the discarded branch is not instantiated — so the ill-formed zero-argument call never comes into existence. Before C++17 this pattern required a separate base-case overload taking either zero or one argument. A fold expression ((std::cout << args), ...) achieves the same output with no recursion at all."
    },
    {
      "type": "code",
      "tag": "Template Lambdas",
      "question": "Compiled as C++20, what happens?",
      "code": "int main() {\n    auto combine = []<typename T>(T a, T b) { return a + b; };\n    auto x = combine(1, 2);\n    auto y = combine(1, 2.5);\n}",
      "options": [
        "Both calls compile; y is 3.5",
        "Neither call compiles: lambdas cannot declare template parameter lists",
        "combine(1, 2.5) compiles because 1 is implicitly converted to double",
        "combine(1, 2) compiles, but combine(1, 2.5) fails: both parameters share the single template parameter T, and deduction produces the conflicting types int and double"
      ],
      "answer": 3,
      "explain": "C++20 lets a lambda declare an explicit template parameter list, and here it is used to force both arguments to the same type — something a generic [](auto a, auto b) lambda cannot express, since each auto is an independent parameter. Deduction for combine(1, 2.5) yields T = int and T = double, a conflict, exactly as it would for the equivalent function template. If mixed types were intended, the call can name T explicitly: combine.template operator()<double>(1, 2.5)."
    },
    {
      "type": "mcq",
      "tag": "Template Lambdas",
      "question": "What does a C++20 explicit-template-parameter lambda such as `[]<typename T>(std::vector<T>& v) { ... }` provide that a generic `[](auto& v)` lambda does not?",
      "options": [
        "Direct access to the element type by the name T, plus the ability to accept only std::vector instantiations — with auto you would have to recover the type via decltype and traits, and any container would be accepted",
        "Better runtime performance, because auto-parameter lambdas rely on type erasure",
        "Nothing — the two forms are exactly equivalent",
        "The ability to be stored in a std::function, which generic lambdas cannot be"
      ],
      "answer": 0,
      "explain": "The explicit template parameter list gives the lambda's call operator real named template parameters: T is directly usable in the body, and the parameter's shape is constrained to std::vector<T> so other argument types are rejected at deduction. It also enables clean perfect-forwarding packs, e.g. []<typename... Ts>(Ts&&... ts) { f(std::forward<Ts>(ts)...); }, which is clumsy with auto&&.... Both kinds of lambda compile to an ordinary templated call operator, so there is no performance difference, and either can go in a std::function with a fixed signature."
    },
    {
      "type": "mcq",
      "tag": "constexpr & static (C++23)",
      "question": "A constexpr function contains the line `static constexpr std::array<int, 3> table{1, 2, 3};`. Which statement is correct?",
      "options": [
        "It is legal in C++20 and C++23 alike; static locals were always allowed in constexpr functions",
        "It is illegal in both standards; a constexpr function can never contain a static variable",
        "It is ill-formed in C++20, where a constexpr function body could not define a variable of static storage duration, but C++23 (P2647) allows static constexpr locals — convenient for lookup tables that would otherwise pollute namespace scope",
        "It is legal only if the enclosing function is declared consteval rather than constexpr"
      ],
      "answer": 2,
      "explain": "C++20 flatly banned static and thread_local variables inside constexpr functions, forcing lookup tables out to namespace scope or into a separate non-constexpr helper. C++23 relaxed the rule for variables that are usable in constant expressions — a static constexpr local qualifies, and every evaluation, compile-time or runtime, sees the same immutable object. A plain mutable `static int counter = 0;` remains ill-formed in a constexpr function even in C++23."
    },
    {
      "type": "code",
      "tag": "constexpr Allocation",
      "question": "Does this program compile?",
      "code": "constexpr int compute() {\n    int* p = new int(5);\n    int result = *p;\n    delete p;\n    return result;\n}\n\nstatic_assert(compute() == 5);\n\nint main() {}",
      "options": [
        "No: operator new is never permitted inside a constexpr function",
        "Yes: since C++20, constant evaluation may allocate with new, provided the memory is deallocated before that evaluation ends — the delete makes compute() a valid constant expression",
        "No: static_assert cannot invoke a function",
        "Yes, but only because the optimizer removes the allocation; at -O0 it would fail"
      ],
      "answer": 1,
      "explain": "C++20 allows transient dynamic allocation during constant evaluation: new is fine as long as the matching delete runs before the evaluation completes, so compute() is a constant expression equal to 5. Remove the delete and the static_assert line fails to compile, because a leaking evaluation is not a constant expression. This rule is what lets std::vector and std::string work inside constexpr functions — as scratch space that is freed before the result escapes."
    },
    {
      "type": "mcq",
      "tag": "constexpr Allocation",
      "question": "Why does `constexpr int* leak() { return new int(7); }` combined with `constexpr int* p = leak();` fail to compile in C++20?",
      "options": [
        "Because pointers can never be declared constexpr variables",
        "Because new int(7) is invalid in constant evaluation — 7 is not a constant expression",
        "It actually compiles; p points into statically allocated storage",
        "Because C++20 forbids non-transient constexpr allocation: memory allocated during constant evaluation must be freed before that evaluation finishes, so it can never survive into runtime — the same reason a constexpr std::vector variable is ill-formed even though vector works inside constexpr functions"
      ],
      "answer": 3,
      "explain": "The initializer of p is a constant evaluation that ends with the allocation still live, so it is not a constant expression and the program is rejected. Compile-time-built data that must persist has to be copied into non-allocating storage, typically a std::array sized by a first constexpr pass. Non-transient allocation (letting such memory be promoted to static storage) has been proposed but is not in C++20 or C++23."
    },
    {
      "type": "code",
      "tag": "is_constant_evaluated",
      "question": "mode() is called at runtime here. What does the program print?",
      "code": "#include <iostream>\n#include <type_traits>\n\nconstexpr int mode() {\n    if constexpr (std::is_constant_evaluated()) {\n        return 1;\n    } else {\n        return 2;\n    }\n}\n\nint main() {\n    int m = mode();\n    std::cout << m;\n}",
      "options": [
        "1 — the condition of if constexpr is itself a constant evaluation, so is_constant_evaluated() returns true there unconditionally, and the runtime branch is discarded at compile time for every caller",
        "2, because main calls mode() at runtime",
        "Either 1 or 2 — the result is unspecified",
        "It fails to compile: is_constant_evaluated cannot appear inside if constexpr"
      ],
      "answer": 0,
      "explain": "is_constant_evaluated() answers 'am I being evaluated in a manifestly constant-evaluated context?' — and the condition of an if constexpr is always such a context, so the function is hard-wired to return 1 and the else branch is discarded from every instantiation. The correct usage is a plain if, letting each evaluation pick its branch; C++23's if consteval exists to make this class of bug impossible. Mainstream compilers now warn about exactly this pattern."
    },
    {
      "type": "mcq",
      "tag": "consteval Propagation",
      "question": "Given `consteval int sq(int n) { return n * n; }`, why does `constexpr int f(int n) { return sq(n); }` fail to compile?",
      "options": [
        "consteval functions may only be called from other consteval functions, never from constexpr ones",
        "sq must take n as a template argument to be consteval",
        "Inside f, the parameter n is not a constant expression — a constexpr function can also be called at runtime — so the immediate invocation sq(n) cannot be constant-folded and is ill-formed; making f consteval as well (letting the immediate-ness propagate upward) fixes it",
        "It compiles fine: the consteval requirement is only checked at f's call sites"
      ],
      "answer": 2,
      "explain": "A call to a consteval (immediate) function must itself be a constant expression unless it occurs in an immediate function context, and within a constexpr function the parameters are never constant expressions, so sq(n) is rejected at f's definition. Declaring f consteval places the call in an immediate function context and defers the constant requirement to f's own callers — this is how consteval tends to propagate up call chains. C++23 adds `if consteval { ... }` so a constexpr function can call consteval helpers only on its compile-time path."
    },
    {
      "type": "code",
      "tag": "Floating-Point NTTPs",
      "question": "C++20 allows floating-point non-type template parameters. What does this program print?",
      "code": "#include <iostream>\n#include <type_traits>\n\ntemplate <double D> struct Ratio {};\n\nint main() {\n    std::cout << std::is_same_v<Ratio<0.1 + 0.2>, Ratio<0.3>>\n              << std::is_same_v<Ratio<0.5>, Ratio<0.5>>;\n}",
      "options": [
        "11",
        "01",
        "00",
        "It fails to compile: double is not a structural type"
      ],
      "answer": 1,
      "explain": "Template-argument equivalence for floating-point parameters compares the values' representations, not operator==. In IEEE double, 0.1 + 0.2 evaluates to 0.30000000000000004..., a different value than the literal 0.3, so the two Ratio specializations are distinct types and the first test prints 0; identical literals give the same type, printing 1. The same value-identity rule means Ratio<+0.0> and Ratio<-0.0> are different types even though +0.0 == -0.0 — a reason to be cautious with computed floating-point template arguments."
    },
    {
      "type": "code",
      "tag": "UDL Templates",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\ntemplate <char... Cs>\nconstexpr int operator\"\"_len() { return sizeof...(Cs); }\n\nint main() {\n    std::cout << 1234_len << 3.5_len;\n}",
      "options": [
        "43",
        "It fails to compile: 3.5 cannot be passed to a char... parameter pack",
        "12343.5",
        "42"
      ],
      "answer": 0,
      "explain": "A numeric literal operator template receives the literal's source characters as a pack of char non-type template arguments: 1234_len instantiates operator\"\"_len<'1','2','3','4'>, and 3.5_len gets <'3','.','5'> — the form works for both integer and floating literals. sizeof...(Cs) is therefore 4 and then 3, printing 43. Because the characters arrive at compile time, such operators can parse literals with full validation, rejecting malformed input via static_assert or constraints."
    },
    {
      "type": "mcq",
      "tag": "static_assert(false)",
      "question": "In a primary template that should never be instantiated directly, why do authors traditionally write `static_assert(sizeof(T) == 0, \"use a specialization\")` or a dependent_false<T> helper rather than plain `static_assert(false, ...)`?",
      "options": [
        "Because static_assert(false) is a syntax error inside a template body",
        "Because sizeof(T) == 0 can be true for empty classes, providing an escape hatch",
        "Because dependent_false<T> produces a better error message but behaves identically to false",
        "Because a non-dependent false makes the template have no possible valid specialization, so compilers were entitled to (and did) fire the assertion immediately, without any instantiation; a dependent expression defers the check until a specialization is actually instantiated"
      ],
      "answer": 3,
      "explain": "The rule is that a template for which no valid specialization can be generated is ill-formed, no diagnostic required — and static_assert(false) triggers that as soon as the template is parsed. Making the expression dependent on T (sizeof(T) == 0 is never true: empty classes have size 1) keeps the template formally viable until someone instantiates the forbidden case. P2593, adopted as a defect report and implemented in recent GCC and Clang, now makes plain static_assert(false) in an uninstantiated template legal, but the dependent-false idiom is still what you will meet in existing code and older toolchains."
    },
    {
      "type": "code",
      "tag": "Compound Requirements",
      "question": "What does this program print?",
      "code": "#include <concepts>\n#include <cstddef>\n#include <iostream>\n\ntemplate <typename T>\nconcept HasSize = requires(const T t) {\n    { t.size() } -> std::convertible_to<std::size_t>;\n};\n\nstruct A { int size() const { return 3; } };\nstruct B { void size() const {} };\n\nint main() {\n    std::cout << HasSize<A> << HasSize<B>;\n}",
      "options": [
        "11",
        "00",
        "10",
        "It fails to compile: a concept cannot be used as a boolean expression"
      ],
      "answer": 2,
      "explain": "A compound requirement checks two things: the expression t.size() must be well-formed, and its type must satisfy the concept after the arrow — which implicitly receives the expression's type as its first argument. A's int size() is convertible to std::size_t, so HasSize<A> is true; B's size() is valid to call but returns void, which is not convertible, so HasSize<B> is false, printing 10. A concept name with arguments is itself a constexpr bool, which is why it can be streamed directly."
    },
    {
      "type": "mcq",
      "tag": "Deducing this (C++23)",
      "question": "How does C++23's explicit object parameter (deducing this) simplify the CRTP pattern?",
      "options": [
        "It makes the compiler insert the CRTP static_cast automatically into every member function",
        "A base-class member like `template <typename Self> void interface(this Self&& self)` deduces Self as the actual derived type of the object it is invoked on, so the base class no longer needs the derived class as a template parameter, and no static_cast is required",
        "It replaces CRTP with virtual functions that the compiler guarantees to devirtualize",
        "It helps only lambdas; ordinary member functions cannot declare an explicit object parameter"
      ],
      "answer": 1,
      "explain": "With an explicit object parameter, the object argument participates in ordinary template deduction, so when d.interface() is called on a D that inherits from a plain (non-template) Base, Self deduces to D& and self.implementation() resolves against the derived type directly. That removes both pieces of CRTP boilerplate: the Base<Derived> template parameter and the static_cast<Derived*>(this). The same feature also lets one member template replace the four const/ref-qualified overloads of an accessor."
    },
    {
      "type": "code",
      "tag": "Integer Sequences",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\ntemplate <typename T, T... Vals>\nconstexpr T sum(std::integer_sequence<T, Vals...>) {\n    return (Vals + ... + T{});\n}\n\nint main() {\n    std::cout << sum(std::make_integer_sequence<int, 5>{});\n}",
      "options": [
        "10",
        "15",
        "5",
        "It fails to compile: a fold expression cannot expand a pack of non-type template parameters"
      ],
      "answer": 0,
      "explain": "make_integer_sequence<int, 5> generates integer_sequence<int, 0, 1, 2, 3, 4> — the values start at 0 and stop before N — so the fold computes 0+1+2+3+4 = 10, not 15. Deduction against the function parameter extracts the values into the non-type pack Vals, and fold expressions expand non-type packs just as happily as function argument packs. The binary fold with T{} as the init value keeps the zero-length sequence well-formed."
    }
  ]
};

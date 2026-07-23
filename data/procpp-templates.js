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
    }
  ]
};

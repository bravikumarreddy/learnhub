/* ===== C++ Templates — Nontype & Variadic Templates ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["templ-nontype"] = {
  title: "C++ Templates — Nontype & Variadic Templates",
  subtitle: "Nontype parameter restrictions, auto nontype params, parameter packs, pack expansion and C++17 fold expressions.",
  crumb: "C++ Templates",
  questions: [
    {
      "type": "mcq",
      "tag": "Nontype Params",
      "question": "Which of these is NOT a valid kind of nontype template parameter in C++17?",
      "options": [
        "An integral constant such as int N",
        "A pointer to a function with linkage",
        "A double floating-point value",
        "std::nullptr_t"
      ],
      "answer": 2,
      "explain": "Floating-point nontype template parameters were not permitted until C++20; integral values, pointers to entities with linkage, and std::nullptr_t are all allowed."
    },
    {
      "type": "code",
      "tag": "Float NTTP",
      "question": "In C++17, what happens with this declaration?",
      "code": "template<double Ratio>\nstruct Scaler {};\n\nScaler<1.5> s;",
      "options": [
        "Compiles and works fine",
        "Compile error: floating-point nontype parameter not allowed pre-C++20",
        "Compiles but Ratio is truncated to 1",
        "Runtime error only"
      ],
      "answer": 1,
      "explain": "Before C++20, a floating-point type is not a permitted nontype template parameter type, so the declaration is ill-formed."
    },
    {
      "type": "mcq",
      "tag": "String Literal",
      "question": "Why can't you use a bare string literal as the argument for template<const char* Str>, e.g. Foo<\"hello\">?",
      "options": [
        "String literals are too long for template parameters",
        "A string literal has no linkage and its address is not a usable constant template argument",
        "const char* is not an allowed nontype parameter type",
        "The compiler cannot compute strlen at compile time"
      ],
      "answer": 1,
      "explain": "A pointer nontype argument must refer to an object with linkage; a string literal is an object with no linkage, so its address cannot be a template argument."
    },
    {
      "type": "code",
      "tag": "sizeof...",
      "question": "What does this print?",
      "code": "template<typename... Ts>\nint count(Ts... args) {\n  return sizeof...(Ts);\n}\n\nstd::cout << count(1, 2.0, '3', \"4\");",
      "options": [
        "3",
        "4",
        "0",
        "Compile error"
      ],
      "answer": 1,
      "explain": "sizeof...(Ts) yields the number of elements in the pack, which is 4 here; it is unrelated to sizeof of any type."
    },
    {
      "type": "code",
      "tag": "Fold Sum",
      "question": "What does this return?",
      "code": "template<typename... Ts>\nauto sum(Ts... xs) {\n  return (xs + ...);\n}\n\nsum(1, 2, 3, 4);",
      "options": [
        "10",
        "24",
        "4",
        "Compile error"
      ],
      "answer": 0,
      "explain": "(xs + ...) is a unary right fold expanding to (1 + (2 + (3 + 4))) = 10."
    },
    {
      "type": "code",
      "tag": "Empty Fold",
      "question": "What is the result of calling this with no arguments?",
      "code": "template<typename... Ts>\nauto sum(Ts... xs) {\n  return (xs + ...);\n}\n\nsum();",
      "options": [
        "Returns 0",
        "Returns void",
        "Compile error: empty pack not allowed for + fold",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Only &&, || and the comma operator have defined values for an empty pack in a unary fold; a unary fold over + with an empty pack is ill-formed."
    },
    {
      "type": "mcq",
      "tag": "Empty Fold",
      "question": "For a UNARY fold over an empty parameter pack, which operators are allowed and what values do they yield?",
      "options": [
        "+ yields 0, * yields 1, && yields true",
        "&& yields true, || yields false, comma yields void()",
        "All operators yield their identity element",
        "Only + and * are allowed, yielding 0 and 1"
      ],
      "answer": 1,
      "explain": "The standard defines empty-pack unary folds only for && (true), || (false), and comma (void()); any other operator with an empty pack is ill-formed."
    },
    {
      "type": "code",
      "tag": "Left Fold",
      "question": "For non-associative subtraction, what does this print?",
      "code": "template<typename... Ts>\nauto f(Ts... xs) {\n  return (... - xs);\n}\n\nstd::cout << f(1, 2, 3);",
      "options": [
        "-4",
        "2",
        "0",
        "6"
      ],
      "answer": 0,
      "explain": "(... - xs) is a unary LEFT fold: ((1 - 2) - 3) = -4."
    },
    {
      "type": "code",
      "tag": "Right Fold",
      "question": "What does this unary right fold produce?",
      "code": "template<typename... Ts>\nauto f(Ts... xs) {\n  return (xs - ...);\n}\n\nstd::cout << f(1, 2, 3);",
      "options": [
        "-4",
        "2",
        "0",
        "6"
      ],
      "answer": 1,
      "explain": "(xs - ...) is a right fold: (1 - (2 - 3)) = 1 - (-1) = 2."
    },
    {
      "type": "mcq",
      "tag": "Fold Syntax",
      "question": "Which is the syntax for a BINARY left fold with initial value I over operator op?",
      "options": [
        "(pack op ... op I)",
        "(I op ... op pack)",
        "(... op pack op I)",
        "(pack op I op ...)"
      ],
      "answer": 1,
      "explain": "A binary left fold is (I op ... op pack), expanding to (((I op x1) op x2) ... op xN)."
    },
    {
      "type": "code",
      "tag": "Print Fold",
      "question": "What does this print?",
      "code": "template<typename... Ts>\nvoid print(Ts... xs) {\n  (std::cout << ... << xs);\n}\n\nprint(1, 2, 3);",
      "options": [
        "123",
        "321",
        "6",
        "Compile error"
      ],
      "answer": 0,
      "explain": "(std::cout << ... << xs) is a binary left fold with std::cout as the init, producing ((cout << 1) << 2) << 3, printing 123."
    },
    {
      "type": "code",
      "tag": "auto NTTP",
      "question": "Is this valid in C++17, and what are the deduced types?",
      "code": "template<auto Value>\nstruct Constant {\n  static constexpr auto value = Value;\n};\n\nConstant<42> a;\nConstant<'x'> b;",
      "options": [
        "Yes, auto deduces int for a and char for b",
        "No, auto is not allowed for nontype parameters",
        "Only a compiles; char is not allowed",
        "Compiles but both deduce to int"
      ],
      "answer": 0,
      "explain": "C++17 allows auto nontype template parameters; the type is deduced from the argument, giving int for 42 and char for 'x'."
    },
    {
      "type": "code",
      "tag": "Pack Expansion",
      "question": "What does this print?",
      "code": "template<typename... Ts>\nvoid g(Ts... xs) {\n  int arr[] = { (xs * 2)... };\n  for (int v : arr) std::cout << v << ' ';\n}\n\ng(1, 2, 3);",
      "options": [
        "2 4 6",
        "1 2 3",
        "6 6 6",
        "Compile error"
      ],
      "answer": 0,
      "explain": "The pattern (xs * 2)... expands inside the braced initializer to { 2, 4, 6 }."
    },
    {
      "type": "mcq",
      "tag": "Pattern Expansion",
      "question": "Given pack Ts... and pattern Foo<Ts>*..., what does the expansion contain?",
      "options": [
        "Foo applied once to the whole pack",
        "The pattern repeated per element: Foo<T1>*, Foo<T2>*, ...",
        "A single pointer to a Foo of a pack",
        "It is ill-formed; you cannot combine Foo and *"
      ],
      "answer": 1,
      "explain": "Pack expansion repeats the entire pattern (Foo<Ts>*) once per pack element, substituting each element into every occurrence of the pack name."
    },
    {
      "type": "code",
      "tag": "Forwarding",
      "question": "Which expression correctly forwards the whole parameter pack to target?",
      "code": "template<typename... Args>\nvoid wrapper(Args&&... args) {\n  target(/* ? */);\n}",
      "options": [
        "std::forward<Args>(args)...",
        "std::forward(args)...",
        "std::forward<Args...>(args...)",
        "std::move(args)..."
      ],
      "answer": 0,
      "explain": "Perfect forwarding of a pack uses std::forward<Args>(args)..., which expands the fused pattern applying forward element-wise with each element's own type."
    },
    {
      "type": "mcq",
      "tag": "Forwarding Ref",
      "question": "In void f(Args&&... args) where Args is a deduced pack, what is Args&&...?",
      "options": [
        "An rvalue-reference pack — always binds to rvalues",
        "A forwarding (universal) reference pack — deduces lvalue/rvalue per element",
        "An lvalue-reference pack",
        "A const-reference pack"
      ],
      "answer": 1,
      "explain": "When Args is a deduced template parameter pack, Args&&... is a pack of forwarding references, each independently deducing value category from its argument."
    },
    {
      "type": "code",
      "tag": "Recursion Base",
      "question": "What makes this variadic recursion terminate correctly?",
      "code": "void print() {}\n\ntemplate<typename T, typename... Rest>\nvoid print(T first, Rest... rest) {\n  std::cout << first << ' ';\n  print(rest...);\n}",
      "options": [
        "The empty non-template print() is the base case",
        "It cannot terminate and loops forever",
        "You must add a sizeof... guard",
        "The base case must also be a template"
      ],
      "answer": 0,
      "explain": "The non-template print() overload serves as the recursion base case; when rest... is empty, print(rest...) resolves to the empty overload."
    },
    {
      "type": "code",
      "tag": "Comma Fold",
      "question": "What does this print?",
      "code": "template<typename... Ts>\nvoid print(const Ts&... xs) {\n  ((std::cout << xs << ' '), ...);\n}\n\nprint(\"a\", 1, 2.5);",
      "options": [
        "a 1 2.5 ",
        "2.5 1 a ",
        "6",
        "Compile error"
      ],
      "answer": 0,
      "explain": "((std::cout << xs << ' '), ...) is a unary right fold over the comma operator, evaluating each print in order left to right."
    },
    {
      "type": "mcq",
      "tag": "Reference NTTP",
      "question": "A nontype template parameter of reference type must be bound to what?",
      "options": [
        "Any temporary object",
        "An object with static storage duration and linkage",
        "A prvalue of the referenced type",
        "A local automatic variable"
      ],
      "answer": 1,
      "explain": "A reference nontype argument must refer to an object (or function) with linkage and a constant address, i.e. static storage duration, so temporaries and locals are not allowed."
    },
    {
      "type": "code",
      "tag": "Pointer NTTP",
      "question": "Does this compile (C++17)?",
      "code": "int global = 5;\n\ntemplate<int* P>\nstruct Ref {};\n\nRef<&global> r;",
      "options": [
        "Yes; &global has external linkage and a constant address",
        "No; you cannot take the address of a global for a template",
        "No; int* is not a valid nontype parameter",
        "Only if global is const"
      ],
      "answer": 0,
      "explain": "A pointer nontype argument may be the address of an object with linkage; a namespace-scope global qualifies, so Ref<&global> is well-formed."
    },
    {
      "type": "code",
      "tag": "Local Address",
      "question": "What is wrong here?",
      "code": "template<int* P>\nstruct Ref {};\n\nvoid f() {\n  int local = 0;\n  Ref<&local> r;\n}",
      "options": [
        "Nothing; it compiles",
        "&local is not a constant expression with linkage, so it is ill-formed",
        "local must be static to take its address at all",
        "int* P must be const int*"
      ],
      "answer": 1,
      "explain": "A local automatic variable has no linkage and its address is not a usable constant expression for a template argument, so this is ill-formed."
    },
    {
      "type": "mcq",
      "tag": "Class NTTP",
      "question": "In which standard did class-type (literal-class) nontype template parameters become allowed?",
      "options": [
        "C++11",
        "C++14",
        "C++17",
        "C++20"
      ],
      "answer": 3,
      "explain": "C++20 introduced nontype template parameters of structural (literal) class type, enabling techniques like compile-time strings via constexpr classes."
    },
    {
      "type": "code",
      "tag": "sizeof... Zero",
      "question": "What does this print when called as h()?",
      "code": "template<typename... Ts>\nvoid h(Ts... xs) {\n  std::cout << sizeof...(xs);\n}",
      "options": [
        "0",
        "1",
        "Compile error: cannot call with no args",
        "Undefined"
      ],
      "answer": 0,
      "explain": "An empty pack is valid; sizeof...(xs) is a constant expression equal to 0."
    },
    {
      "type": "code",
      "tag": "Nested Expansion",
      "question": "What does f(1, 2) expand the call to?",
      "code": "template<typename... Ts>\nvoid f(Ts... xs) {\n  g(xs..., xs...);\n}",
      "options": [
        "g(1, 2, 1, 2)",
        "g(1, 1, 2, 2)",
        "g(1, 2)",
        "Compile error"
      ],
      "answer": 0,
      "explain": "Each xs... expansion produces the full pack in order, so the two expansions concatenate: g(1, 2, 1, 2)."
    },
    {
      "type": "mcq",
      "tag": "Two Packs",
      "question": "Can a function template declare two function parameter packs, e.g. template<typename... As, typename... Bs> void f(As... a, Bs... b)?",
      "options": [
        "Yes, and both are always deducible from a call",
        "It is legal to declare, but a non-terminal parameter pack generally cannot be deduced from an ordinary call",
        "No, a function may have at most one template parameter total",
        "Only if As and Bs have the same length"
      ],
      "answer": 1,
      "explain": "You can write two function parameter packs, but a non-terminal function parameter pack usually can't be deduced; typically only the last pack is deducible."
    },
    {
      "type": "code",
      "tag": "Variadic Base",
      "question": "What does this idiom do?",
      "code": "template<typename... Bases>\nstruct Merged : Bases... {\n  using Bases::operator()...;\n};",
      "options": [
        "Inherits from every Base and brings each operator() into scope",
        "Inherits only from the first Base",
        "Is ill-formed; you cannot inherit a pack",
        "Creates a virtual base for each type"
      ],
      "answer": 0,
      "explain": "Bases... is a pack expansion in the base-specifier list, and using Bases::operator()... is a variadic using-declaration exposing every base's call operator (the 'overloaded' idiom)."
    },
    {
      "type": "mcq",
      "tag": "Variadic Using",
      "question": "The syntax using Bases::operator()...; requires which language version?",
      "options": [
        "C++11",
        "C++14",
        "C++17",
        "C++20"
      ],
      "answer": 2,
      "explain": "Variadic using-declarations (a pack expansion in a using-declaration) were introduced in C++17."
    },
    {
      "type": "code",
      "tag": "Fold Init",
      "question": "What does this binary left fold return for sum(1, 2, 3)?",
      "code": "template<typename... Ts>\nauto sum(Ts... xs) {\n  return (0 + ... + xs);\n}",
      "options": [
        "6",
        "0",
        "5",
        "Compile error"
      ],
      "answer": 0,
      "explain": "(0 + ... + xs) is a binary left fold with init 0: (((0 + 1) + 2) + 3) = 6; it also safely handles the empty pack."
    },
    {
      "type": "mcq",
      "tag": "Empty Binary Fold",
      "question": "What does a call with no arguments return for the fold return (0 + ... + xs);?",
      "options": [
        "0",
        "Compile error",
        "Undefined behavior",
        "void"
      ],
      "answer": 0,
      "explain": "A binary fold with an explicit init value is well-formed for an empty pack and simply yields the init value, 0."
    },
    {
      "type": "code",
      "tag": "All Of",
      "question": "What does allTrue(true, true, false) return?",
      "code": "template<typename... Ts>\nbool allTrue(Ts... xs) {\n  return (xs && ...);\n}",
      "options": [
        "false",
        "true",
        "Compile error",
        "Depends on evaluation order"
      ],
      "answer": 0,
      "explain": "(xs && ...) folds with &&; since one operand is false, the result is false (and && short-circuits during evaluation)."
    },
    {
      "type": "code",
      "tag": "Empty && Fold",
      "question": "What does allTrue() return for an empty pack?",
      "code": "template<typename... Ts>\nbool allTrue(Ts... xs) {\n  return (xs && ...);\n}\n\nallTrue();",
      "options": [
        "true",
        "false",
        "Compile error",
        "Undefined"
      ],
      "answer": 0,
      "explain": "A unary && fold over an empty pack is defined to yield true (the identity for logical AND)."
    },
    {
      "type": "mcq",
      "tag": "Empty || Fold",
      "question": "For the fold return (xs || ...);, what does a call with an empty pack yield?",
      "options": [
        "false",
        "true",
        "Compile error",
        "Undefined"
      ],
      "answer": 0,
      "explain": "A unary || fold over an empty pack yields false, the identity for logical OR."
    },
    {
      "type": "mcq",
      "tag": "Expansion Contexts",
      "question": "Which of the following is NOT a valid context for a pack expansion?",
      "options": [
        "A braced initializer list",
        "A function call argument list",
        "A template argument list",
        "The condition of a plain if statement (as a bare pack)"
      ],
      "answer": 3,
      "explain": "Pack expansion is allowed in argument/init lists, template argument lists, base specifiers, etc., but not as a bare expression in an if condition; you would need a fold expression there instead."
    },
    {
      "type": "mcq",
      "tag": "Enum NTTP",
      "question": "Is an enumeration type such as enum Color { Red, Green, Blue } valid as a nontype template parameter type?",
      "options": [
        "Yes; both scoped and unscoped enumeration types are allowed",
        "No; only int is allowed",
        "No; unscoped enums are not allowed",
        "Only scoped enum class is allowed"
      ],
      "answer": 0,
      "explain": "Enumeration types (scoped or unscoped) are valid nontype template parameter types."
    },
    {
      "type": "code",
      "tag": "auto Deduction",
      "question": "What type does Value have in Box<true>?",
      "code": "template<auto Value>\nstruct Box {};\n\nBox<true> b;",
      "options": [
        "bool",
        "int",
        "unsigned",
        "It is ambiguous"
      ],
      "answer": 0,
      "explain": "auto deduces the type from the argument; the literal true has type bool, so Value is bool."
    },
    {
      "type": "mcq",
      "tag": "Pack in Template Args",
      "question": "For template<typename... Ts> using TupleOf = std::tuple<Ts...>;, what does TupleOf<int, char> name?",
      "options": [
        "std::tuple<int, char>",
        "std::tuple<int>",
        "std::tuple<char>",
        "A compile error"
      ],
      "answer": 0,
      "explain": "Ts... expands in the template argument list of std::tuple, forwarding all pack elements: std::tuple<int, char>."
    },
    {
      "type": "mcq",
      "tag": "Fold Requirements",
      "question": "A fold expression requires the unexpanded pack to appear where relative to the ... ?",
      "options": [
        "The pack must not appear in the fold at all",
        "The pack must be an operand adjacent to the ... in the fold pattern",
        "Two different packs, one on each side of ...",
        "The pack must be inside sizeof..."
      ],
      "answer": 1,
      "explain": "A fold expression has exactly one unexpanded pack forming the operand pattern next to the ..., which the fold repeats over the binary operator."
    },
    {
      "type": "code",
      "tag": "Order of Eval",
      "question": "Is the left-to-right order of side effects guaranteed for this braced-init pack expansion?",
      "code": "int i = 0;\ntemplate<typename... Ts>\nvoid f(Ts... xs) {\n  int a[] = { (void(xs), i++)... };\n}",
      "options": [
        "Yes; elements of a braced-init-list are evaluated left to right",
        "No; order is unspecified in braced init",
        "Only in C++20",
        "Only for trivial types"
      ],
      "answer": 0,
      "explain": "Unlike a function call, the elements of a braced-init-list are sequenced left to right, which is why the braced-init trick guarantees ordered side effects."
    },
    {
      "type": "mcq",
      "tag": "Call Order",
      "question": "Is the evaluation order of the arguments in g(f(xs)...) guaranteed left to right?",
      "options": [
        "No; the order of evaluation of function arguments is unspecified",
        "Yes; always left to right",
        "Yes; guaranteed since C++17",
        "Only right to left"
      ],
      "answer": 0,
      "explain": "Function-call argument evaluation order is unspecified (C++17 only sequences within a single argument), so g(f(xs)...) has no guaranteed order; use braced-init or a comma fold for ordering."
    },
    {
      "type": "code",
      "tag": "Forward Fold",
      "question": "What does this construct-and-forward wrapper do?",
      "code": "template<typename... Args>\nauto makeVec(Args&&... args) {\n  std::vector<int> v;\n  (v.push_back(std::forward<Args>(args)), ...);\n  return v;\n}",
      "options": [
        "Pushes each arg in order via a comma fold",
        "Pushes only the first argument",
        "Is ill-formed; cannot fold push_back",
        "Pushes in reverse order"
      ],
      "answer": 0,
      "explain": "(expr, ...) is a unary right comma fold; combined with forwarding it inserts each argument in order."
    },
    {
      "type": "mcq",
      "tag": "Template Template",
      "question": "Can a template parameter pack consist of template template parameters, e.g. template<template<typename> class... Tmpls>?",
      "options": [
        "No; packs only hold types or values",
        "Yes; a pack of template template parameters is allowed",
        "Only in C++20",
        "Only if all templates are identical"
      ],
      "answer": 1,
      "explain": "Parameter packs may be type packs, nontype packs, or template template packs; template<template<typename> class... Tmpls> is legal."
    },
    {
      "type": "mcq",
      "tag": "Nontype Pack",
      "question": "Is a nontype parameter pack like template<int... Ns> valid, and can (Ns + ... + 0) sum it?",
      "options": [
        "Yes; the nontype pack is valid and the binary fold sums its elements",
        "No; nontype packs are not allowed",
        "The pack is valid but cannot be used in a fold",
        "Only auto... packs are allowed, not int..."
      ],
      "answer": 0,
      "explain": "A nontype parameter pack int... Ns is valid, and (Ns + ... + 0) is a binary right fold that computes the sum of the pack."
    },
    {
      "type": "mcq",
      "tag": "auto Pack",
      "question": "Is an auto nontype parameter PACK, template<auto... Vs>, allowed in C++17, accepting mixed-type values like <1, 'a', 2u>?",
      "options": [
        "Yes; each element's type is deduced independently, so heterogeneous values are fine",
        "No; auto cannot be combined with ...",
        "Only if all values share one type",
        "Only in C++20"
      ],
      "answer": 0,
      "explain": "C++17 permits auto... nontype parameter packs; each argument's type is deduced separately, so heterogeneous values are allowed."
    },
    {
      "type": "mcq",
      "tag": "Fold vs Recursion",
      "question": "Compared to recursive variadic function templates, C++17 fold expressions primarily offer what benefit?",
      "options": [
        "They run faster at runtime by definition",
        "They avoid the need for a separate base-case overload and reduce instantiations",
        "They allow floating-point nontype parameters",
        "They are the only way to expand a pack"
      ],
      "answer": 1,
      "explain": "Folds express the reduction directly without a recursion base case, typically cutting the number of template instantiations and boilerplate."
    },
    {
      "type": "mcq",
      "tag": "const NTTP Ptr",
      "question": "Given extern const char msg[] = \"hi\"; can Named<msg> work for template<const char* S>?",
      "options": [
        "Yes; msg is an array with external linkage that decays to a usable constant address",
        "No; const char* cannot be a nontype parameter",
        "No; arrays cannot decay in template arguments",
        "Only with std::string"
      ],
      "answer": 0,
      "explain": "An array object with external linkage has a constant address; msg decays to const char* and is a valid pointer nontype argument, unlike a bare string literal."
    },
    {
      "type": "mcq",
      "tag": "bool NTTP",
      "question": "Which type is valid as a nontype template parameter in C++17?",
      "options": [
        "std::string",
        "bool",
        "double",
        "A non-literal class type"
      ],
      "answer": 1,
      "explain": "bool is an integral type and thus a valid nontype parameter; std::string, double (pre-C++20), and non-literal classes are not."
    },
    {
      "type": "mcq",
      "tag": "Pack Not Last",
      "question": "In a class template, where must a template parameter pack appear?",
      "options": [
        "Anywhere in the parameter list",
        "It must be the last template parameter",
        "It must be first",
        "There can be at most zero packs"
      ],
      "answer": 1,
      "explain": "For class/alias templates a parameter pack must be the last parameter; unlike function templates it cannot be followed by other parameters that require deduction."
    },
    {
      "type": "mcq",
      "tag": "Expansion Length",
      "question": "When two packs co-expand in one pattern, e.g. std::pair<As, Bs>{}..., what is required?",
      "options": [
        "They must have the same number of elements or the program is ill-formed",
        "Mismatched lengths are silently truncated",
        "The shorter one is padded with defaults",
        "Only the first pack is actually used"
      ],
      "answer": 0,
      "explain": "When two packs appear in the same expansion pattern, they must have the same number of elements or the program is ill-formed."
    },
    {
      "type": "mcq",
      "tag": "Structural Type",
      "question": "For a C++20 class-type nontype parameter, the class must be what?",
      "options": [
        "Any class with a constructor",
        "A structural (literal) type with all public, structural members",
        "A class deriving from std::string",
        "A polymorphic class"
      ],
      "answer": 1,
      "explain": "C++20 requires the class to be a 'structural type': a literal class whose bases and non-static data members are public and themselves structural."
    },
    {
      "type": "mcq",
      "tag": "Empty Comma",
      "question": "What does the fold ((void)xs, ...) do when the pack is empty?",
      "options": [
        "Compiles and does nothing (empty comma fold yields void())",
        "Is a compile error on the empty pack",
        "Has undefined behavior",
        "Loops infinitely"
      ],
      "answer": 0,
      "explain": "A unary comma fold is one of the three operators defined for an empty pack; it yields void() and does nothing."
    },
    {
      "type": "mcq",
      "tag": "Fold Eval Order",
      "question": "Does a RIGHT fold (xs + ...) evaluate the operands of built-in + right-to-left?",
      "options": [
        "No; associativity (grouping) is right, but operand evaluation order for + is unspecified",
        "Yes; a right fold guarantees right-to-left evaluation",
        "Yes; always left-to-right",
        "The fold is ill-formed"
      ],
      "answer": 0,
      "explain": "A right fold controls how the expression is parenthesized (grouping), not the evaluation order of the operands of built-in +, which remains unspecified."
    },
    {
      "type": "mcq",
      "tag": "sizeof... Types",
      "question": "For template<typename... Ts> and a function taking Ts... xs, are sizeof...(Ts) and sizeof...(xs) equal?",
      "options": [
        "Yes; both give the number of pack elements",
        "No; sizeof...(Ts) sums byte sizes",
        "No; sizeof...(xs) counts bytes",
        "They differ by one"
      ],
      "answer": 0,
      "explain": "sizeof... applied to either the type pack or the corresponding function-parameter pack yields the same element count."
    },
    {
      "type": "mcq",
      "tag": "Fold Ternary",
      "question": "Which operator canNOT be used as the operator in a fold expression?",
      "options": [
        "The ternary conditional operator ?:",
        "The comma operator ,",
        "The bitwise operator ^",
        "The logical operator ||"
      ],
      "answer": 0,
      "explain": "Fold expressions support most binary operators but not the ternary conditional ?: (nor ., ->, [], etc.)."
    },
    {
      "type": "mcq",
      "tag": "Deduction Order",
      "question": "In make_unique<T>(Args&&...), why is the parameter pack conceptually the LAST function parameter?",
      "options": [
        "So Args can be deduced from the remaining call arguments after fixed parameters",
        "Because packs must always come first",
        "To force copy semantics",
        "It is purely stylistic with no rule"
      ],
      "answer": 0,
      "explain": "A trailing function parameter pack can be deduced from the remaining call arguments; a pack followed by more deduced parameters generally can't be deduced."
    },
    {
      "type": "mcq",
      "tag": "NTTP Linkage",
      "question": "Which object can be used as a pointer/reference nontype template argument?",
      "options": [
        "A string literal",
        "A namespace-scope variable with external or internal linkage",
        "A temporary",
        "A subobject computed at runtime"
      ],
      "answer": 1,
      "explain": "The argument must denote a complete object with linkage and a compile-time-constant address; a namespace-scope variable qualifies, whereas literals, temporaries and runtime values do not."
    },
    {
      "type": "mcq",
      "tag": "Default NTTP",
      "question": "Can a nontype template parameter have a default argument, e.g. template<int N = 10>?",
      "options": [
        "No; only type parameters can have defaults",
        "Yes; nontype parameters may have default arguments",
        "Only in class templates, never function templates",
        "Only for auto parameters"
      ],
      "answer": 1,
      "explain": "Nontype template parameters may have default arguments, such as template<int N = 10> struct A;."
    },
    {
      "type": "mcq",
      "tag": "Pack Deduction",
      "question": "For template<typename... Ts> void f(Ts*... ptrs), calling f(&a, &b) with int a, double b deduces Ts as?",
      "options": [
        "{int, double}",
        "{int*, double*}",
        "Deduction fails",
        "{int}"
      ],
      "answer": 0,
      "explain": "Each argument matches the pattern Ts*, so Ts deduces the pointee types: {int, double}."
    },
    {
      "type": "mcq",
      "tag": "Empty Product",
      "question": "Why is (Ns * ...) problematic for an empty pack while (Ns * ... * 1) is not?",
      "options": [
        "The unary * fold has no defined empty-pack value; the binary fold supplies the identity 1",
        "Multiplication is never foldable",
        "Both are equally valid",
        "The binary form is the ill-formed one"
      ],
      "answer": 0,
      "explain": "Empty-pack unary folds are only defined for &&, ||, and comma; a binary fold with explicit init (1) handles the empty case by yielding that init."
    },
    {
      "type": "mcq",
      "tag": "auto vs typename",
      "question": "What is the key difference between template<typename T> and template<auto V>?",
      "options": [
        "typename T introduces a type parameter; auto V introduces a nontype (value) parameter whose type is deduced from the argument",
        "They are identical",
        "auto V only works with pointers",
        "typename T is a nontype parameter"
      ],
      "answer": 0,
      "explain": "typename T is a type parameter (argument is a type); auto V is a nontype (value) parameter whose type the compiler deduces from the supplied value."
    },
    {
      "type": "mcq",
      "tag": "Pointer to Member",
      "question": "Is a pointer-to-member a valid nontype template parameter type?",
      "options": [
        "No; only object pointers are allowed",
        "Yes; pointer-to-member types (data and function) are permitted",
        "Only pointer-to-member-function, not data",
        "Only in C++20"
      ],
      "answer": 1,
      "explain": "Pointer-to-member (both data and function) is among the allowed nontype template parameter types."
    },
    {
      "type": "mcq",
      "tag": "sizeof... constexpr",
      "question": "Is sizeof...(pack) a constant expression usable in an array bound or static_assert?",
      "options": [
        "Yes; it is a compile-time std::size_t constant",
        "No; it is a runtime value",
        "Only inside constexpr functions",
        "Only for type packs, not value packs"
      ],
      "answer": 0,
      "explain": "sizeof...(pack) yields a std::size_t constant expression, valid in constant contexts like array bounds and static_assert."
    },
    {
      "type": "mcq",
      "tag": "Fold Init Side",
      "question": "Which binary fold form is the LEFT fold: (I + ... + xs) or (xs + ... + I)?",
      "options": [
        "(I + ... + xs) is the LEFT fold; (xs + ... + I) is the RIGHT fold",
        "(I + ... + xs) is the right fold",
        "Both are left folds",
        "Both are right folds"
      ],
      "answer": 0,
      "explain": "When the init is on the LEFT of ... it is a left fold ((((I op x1) op x2) ...)); init on the right of ... is a right fold."
    },
    {
      "type": "mcq",
      "tag": "auto Ref NTTP",
      "question": "Is template<auto& Ref> valid, and what does it accept?",
      "options": [
        "Valid; Ref is a deduced reference nontype parameter binding to an object with linkage",
        "Invalid; auto& is not allowed for nontype parameters",
        "Valid, but it binds to temporaries",
        "Valid; only for pointers"
      ],
      "answer": 0,
      "explain": "auto& forms a deduced reference nontype parameter; the argument must be an object with linkage and a constant address, with the type deduced."
    },
    {
      "type": "mcq",
      "tag": "Recursion Depth",
      "question": "What is a downside of implementing pack processing with pure recursion instead of a fold?",
      "options": [
        "Each element adds an instantiation/recursion level, which can hit compiler instantiation-depth limits",
        "Recursion cannot process more than two elements",
        "Recursion changes the runtime result",
        "Folds and recursion have identical instantiation cost"
      ],
      "answer": 0,
      "explain": "Recursive expansion instantiates one overload per pack element, and deep packs can hit instantiation-depth limits; folds avoid this by not recursing."
    },
    {
      "type": "mcq",
      "tag": "Multiple Expansions",
      "question": "Can the same parameter pack be expanded more than once in a function body?",
      "options": [
        "Yes; a pack may be expanded in multiple different patterns/contexts",
        "No; each pack can be expanded only once ever",
        "Only twice at most",
        "Only if sizeof... is used first"
      ],
      "answer": 0,
      "explain": "A parameter pack can be expanded any number of times in different contexts; each expansion independently repeats its pattern over all elements."
    },
    {
      "type": "mcq",
      "tag": "Nontype Reference Type",
      "question": "Which nontype template parameter type is INVALID even in C++20?",
      "options": [
        "A reference to a function",
        "std::string (a non-structural class owning heap memory)",
        "A pointer to an object with linkage",
        "An enumeration value"
      ],
      "answer": 1,
      "explain": "Even in C++20, class-type nontype parameters must be structural (literal, all-public members); std::string manages heap memory and is not structural."
    },
    {
      "type": "mcq",
      "tag": "Variadic CTAD",
      "question": "For std::tuple t{1, 'a', 2.0}; what does class template argument deduction yield?",
      "options": [
        "std::tuple<int, char, double>",
        "std::tuple<int>",
        "std::tuple<>",
        "Deduction fails"
      ],
      "answer": 0,
      "explain": "CTAD for the variadic tuple deduces each element's type from the initializer, giving std::tuple<int, char, double>."
    },
    {
      "type": "mcq",
      "tag": "Fold Operators Count",
      "question": "How many fold-operators may a single fold expression use between the pack and ...?",
      "options": [
        "Exactly one, repeated across elements",
        "Any number, as long as they associate",
        "Two: one for left and one for right",
        "Zero; folds have no operator"
      ],
      "answer": 0,
      "explain": "A fold uses exactly one fold-operator; more complex per-element expressions must be wrapped so the pattern presents a single operand to that one operator."
    },
    {
      "type": "mcq",
      "tag": "Fold Nesting",
      "question": "Can a fold expression be part of a larger pack expansion over the SAME pack?",
      "options": [
        "No; the fold consumes that pack, leaving nothing for an enclosing ...",
        "Yes; you can freely re-expand a pack after folding it",
        "Only with sizeof...",
        "Folds cannot appear in any expression"
      ],
      "answer": 0,
      "explain": "A fold over a pack fully reduces that pack; the same pack can't remain unexpanded for an enclosing ..., though a fold can be nested using a different pack."
    },
    {
      "type": "mcq",
      "tag": "Inherit Ctors",
      "question": "What does a variadic using-declaration using Bases::Bases...; in struct Multi : Bases... enable?",
      "options": [
        "Inheriting constructors from every base into the derived overload set",
        "Default-constructing each base only",
        "It is always ill-formed",
        "Hiding all base constructors"
      ],
      "answer": 0,
      "explain": "A variadic using-declaration can inherit constructors from each base (using Bases::Bases...), bringing all bases' constructors into the derived class."
    },
    {
      "type": "mcq",
      "tag": "Nontype Conversion",
      "question": "A nontype template argument undergoes what kind of conversion to the parameter type?",
      "options": [
        "A converted constant expression (constant-expression-valid implicit conversions, no narrowing)",
        "Any C-style cast",
        "A reinterpret_cast",
        "No conversion is ever allowed"
      ],
      "answer": 0,
      "explain": "The argument must be a converted constant expression of the parameter type: allowed implicit conversions apply, but narrowing/invalid conversions make it ill-formed."
    },
    {
      "type": "mcq",
      "tag": "Fold Grouping",
      "question": "What distinguishes a unary LEFT fold (... op pack) from a unary RIGHT fold (pack op ...)?",
      "options": [
        "Left fold groups from the leftmost element; right fold groups from the rightmost element",
        "They are identical in all cases",
        "Left fold reverses the pack",
        "Right fold requires an init value"
      ],
      "answer": 0,
      "explain": "Left fold parenthesizes as (((e1 op e2) op e3) ...), right fold as (e1 op (e2 op (... op eN))); they differ whenever op is non-associative."
    },
    {
      "type": "mcq",
      "tag": "Alias Pack Index",
      "question": "Can you directly index a parameter pack, e.g. Ts[0], to get its first element (pre-C++26)?",
      "options": [
        "No; you need a helper such as std::tuple_element or a recursive/partial specialization",
        "Yes; using First = Ts[0]; works",
        "Yes; using First = Ts...front; works",
        "Packs cannot be used in aliases at all"
      ],
      "answer": 0,
      "explain": "There is no direct pack-indexing syntax before C++26; selecting an element requires a helper like tuple_element or a specialization."
    },
    {
      "type": "mcq",
      "tag": "Forward Ref Trap",
      "question": "In a class template struct Wrapper { void set(Args&&... args); } where Args is the class's pack, are the Args&& forwarding references?",
      "options": [
        "No; since Args is fixed by the class, they are plain rvalue references",
        "Yes; always forwarding references",
        "It is a compile error",
        "They become lvalue references"
      ],
      "answer": 0,
      "explain": "Forwarding references require the type to be a deduced parameter of that same function; here Args belongs to the class template, so Args&& are ordinary rvalue references."
    },
    {
      "type": "mcq",
      "tag": "Ref Collapse",
      "question": "For make(x) with int x and template<typename... Args> void make(Args&&...), what is Args deduced as?",
      "options": [
        "Args = {int&}, and Args&& collapses to int&",
        "Args = {int}, and Args&& is int&&",
        "Args = {int&&}",
        "Deduction fails"
      ],
      "answer": 0,
      "explain": "For an lvalue argument, Args deduces to int& and reference collapsing makes the parameter int&, which is how forwarding preserves lvalue-ness."
    }
  ]
};

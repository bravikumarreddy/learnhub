/* ===== C++ Templates — Type Traits, SFINAE & enable_if ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["templ-traits"] = {
  title: "C++ Templates — Type Traits, SFINAE & enable_if",
  subtitle: "The type_traits library, writing traits, SFINAE & the immediate-context rule, enable_if, void_t detection idiom and if constexpr.",
  crumb: "C++ Templates",
  questions: [
    {
      "type": "mcq",
      "tag": "is_same",
      "question": "What is the value of std::is_same_v<int, const int>?",
      "options": [
        "false, because the const qualifier makes them distinct types",
        "It is ill-formed; is_same rejects cv-qualified arguments",
        "true, because is_same strips top-level cv-qualifiers before comparing",
        "true, because const int implicitly converts to int"
      ],
      "answer": 0,
      "explain": "is_same performs an exact type comparison and does NOT ignore cv-qualifiers; int and const int are different types, so the result is false."
    },
    {
      "type": "mcq",
      "tag": "helper suffix",
      "question": "What does the _v suffix (e.g. std::is_integral_v<T>) denote?",
      "options": [
        "A variable template that equals the trait's ::value member",
        "A type alias for the trait's ::type member",
        "A function that returns the trait result at runtime",
        "A volatile-qualified version of the trait"
      ],
      "answer": 0,
      "explain": "The _v suffix (C++17) is a variable template shorthand: is_integral_v<T> is defined as is_integral<T>::value, saving the ::value access."
    },
    {
      "type": "mcq",
      "tag": "_t suffix",
      "question": "std::remove_reference_t<T> is a convenience for which expression?",
      "options": [
        "std::remove_reference<T>::value",
        "typename std::remove_reference<T>::reference",
        "typename std::remove_reference<T>::type",
        "std::remove_reference<T>()"
      ],
      "answer": 2,
      "explain": "The _t alias templates (C++14) expand to typename Trait<...>::type, removing the need for the typename keyword and ::type at each use."
    },
    {
      "type": "mcq",
      "tag": "remove_reference",
      "question": "What type does std::remove_reference_t<int&&> name?",
      "options": [
        "int&",
        "int&&",
        "const int",
        "int"
      ],
      "answer": 3,
      "explain": "remove_reference strips both lvalue and rvalue reference qualifiers, so remove_reference_t<int&&> is plain int."
    },
    {
      "type": "mcq",
      "tag": "remove_cv",
      "question": "What is std::remove_cv_t<const volatile int*>?",
      "options": [
        "int*",
        "const volatile int* (the pointer itself has no top-level cv)",
        "volatile int*",
        "const int*"
      ],
      "answer": 1,
      "explain": "remove_cv removes only TOP-LEVEL cv-qualifiers. Here the pointer is not itself const/volatile; the cv applies to the pointee, so the type is unchanged."
    },
    {
      "type": "mcq",
      "tag": "decay",
      "question": "What is std::decay_t<int[5]>?",
      "options": [
        "int",
        "int(&)[5]",
        "int*",
        "int[5]"
      ],
      "answer": 2,
      "explain": "decay models by-value argument passing: arrays decay to pointers, so int[5] becomes int*. It also strips references and cv, and functions decay to function pointers."
    },
    {
      "type": "mcq",
      "tag": "decay",
      "question": "What is std::decay_t<const int&>?",
      "options": [
        "const int",
        "int",
        "const int&",
        "int&"
      ],
      "answer": 1,
      "explain": "decay removes the reference and then strips top-level cv-qualifiers, yielding plain int — exactly what a by-value parameter would deduce."
    },
    {
      "type": "mcq",
      "tag": "is_integral",
      "question": "Which of these gives std::is_integral_v == false?",
      "options": [
        "unsigned long long",
        "float",
        "char",
        "bool"
      ],
      "answer": 1,
      "explain": "is_integral is true for bool, char (and variants), and all standard integer types, but NOT for floating-point types like float or double."
    },
    {
      "type": "mcq",
      "tag": "is_pointer",
      "question": "For which type is std::is_pointer_v true?",
      "options": [
        "int* (a plain object pointer)",
        "int& (a reference)",
        "std::nullptr_t",
        "int T::* (a pointer-to-member)"
      ],
      "answer": 0,
      "explain": "is_pointer is true only for object/function pointers. It is false for references, for nullptr_t, and importantly for pointers-to-members (which have their own trait)."
    },
    {
      "type": "mcq",
      "tag": "conditional",
      "question": "std::conditional_t<Cond, T, F> names which type when Cond is true?",
      "options": [
        "The compiler picks based on which is smaller",
        "void",
        "F (the third argument)",
        "T (the second argument)"
      ],
      "answer": 3,
      "explain": "conditional_t<Cond, T, F> is T when Cond is true and F when it is false — a compile-time ternary on types."
    },
    {
      "type": "code",
      "tag": "conditional",
      "question": "Both type arguments of std::conditional are always evaluated. What happens here for T = int?",
      "code": "template<class T>\nusing Elem = std::conditional_t<std::is_pointer_v<T>,\n                               std::remove_pointer_t<T>,\n                               T>;\nusing X = Elem<int>;  // T is int (not a pointer)",
      "options": [
        "X is a compile error because both branches conflict",
        "Compile error: remove_pointer_t<int> is ill-formed for a non-pointer",
        "X is void",
        "X is int; remove_pointer_t<int> is computed but is just int, so it is harmless"
      ],
      "answer": 3,
      "explain": "conditional evaluates both type arguments, but remove_pointer_t<int> is well-formed (it leaves non-pointers unchanged). Only the selected branch (T = int) is used, so X is int."
    },
    {
      "type": "code",
      "tag": "conditional_t",
      "question": "What is the resulting type of this nested conditional?",
      "code": "using A = std::conditional_t<false, char,\n              std::conditional_t<true, long, int>>;",
      "options": [
        "int",
        "char",
        "long",
        "void"
      ],
      "answer": 2,
      "explain": "The outer condition is false, so it selects the third argument: conditional_t<true,long,int>, which is long."
    },
    {
      "type": "mcq",
      "tag": "SFINAE meaning",
      "question": "SFINAE stands for 'Substitution Failure Is Not An Error.' What does the 'substitution' refer to?",
      "options": [
        "Replacing a base class member with a derived override",
        "The linker substituting symbol addresses",
        "Substituting default arguments for missing function call arguments",
        "Replacing template parameters with deduced/explicit arguments in a function template's signature"
      ],
      "answer": 3,
      "explain": "SFINAE concerns the step where template arguments are substituted into the template's signature; if that substitution produces an invalid type/expression, the candidate is silently removed rather than causing an error."
    },
    {
      "type": "mcq",
      "tag": "immediate context",
      "question": "SFINAE only applies to failures in the 'immediate context' of substitution. What does that exclude?",
      "options": [
        "Errors that occur inside the body of an instantiated function or class template",
        "Errors in the function's return type",
        "Errors in the types of the function parameters",
        "Errors in a default template argument that names a type"
      ],
      "answer": 0,
      "explain": "Only failures in the immediate context (the signature: template params, return type, parameter types) are soft. An error deep inside a function body or during instantiation of a class template is a hard error."
    },
    {
      "type": "code",
      "tag": "hard error",
      "question": "T = int is passed. Is this a SFINAE removal or a hard error?",
      "code": "template<class T>\nvoid f(T x) {\n    typename T::value_type v;  // int has no value_type\n}\nf(42);",
      "options": [
        "No error: T::value_type defaults to int",
        "SFINAE: the overload is quietly removed from the candidate set",
        "Hard error: the failure is inside the function body, not the immediate context",
        "Hard error at link time only"
      ],
      "answer": 2,
      "explain": "The signature void f(T) substitutes fine; the bad expression is in the body, which is not the immediate context. Instantiation of the body triggers a hard compile error."
    },
    {
      "type": "code",
      "tag": "immediate context",
      "question": "T = int is passed. What happens?",
      "code": "template<class T>\ntypename T::value_type f(T x);  // constrained by return type\nvoid f(...);                    // fallback\nf(42);",
      "options": [
        "The first f is chosen and fails to compile",
        "The first f is SFINAE'd out; the variadic fallback is called",
        "Ambiguous call between the two overloads",
        "Hard error: T::value_type is invalid"
      ],
      "answer": 1,
      "explain": "Here T::value_type is in the return type — the immediate context. Substitution fails softly, the first overload is dropped, and the ... fallback is selected."
    },
    {
      "type": "mcq",
      "tag": "enable_if basics",
      "question": "What is std::enable_if<true, int>::type?",
      "options": [
        "void",
        "true",
        "int",
        "There is no ::type member"
      ],
      "answer": 2,
      "explain": "enable_if<Cond, T> provides a ::type member equal to T only when Cond is true (T defaults to void). enable_if<true, int>::type is int."
    },
    {
      "type": "mcq",
      "tag": "enable_if basics",
      "question": "What is special about std::enable_if<false, T>?",
      "options": [
        "It is a compile error to name it",
        "Its ::type member is T",
        "It has NO ::type member, which is what triggers a substitution failure",
        "Its ::type member is void"
      ],
      "answer": 2,
      "explain": "When the condition is false, the primary template of enable_if has no nested ::type. Naming enable_if<false,T>::type is a substitution failure — the mechanism behind conditionally-enabled overloads."
    },
    {
      "type": "code",
      "tag": "enable_if return",
      "question": "This uses enable_if in the return type. When is g enabled?",
      "code": "template<class T>\nstd::enable_if_t<std::is_integral_v<T>, T>\ng(T x) { return x; }",
      "options": [
        "Always; enable_if in the return type has no effect on overload resolution",
        "Only when T is a floating-point type",
        "Only when T is an integral type; otherwise the overload is removed",
        "Never; this fails to compile for all T"
      ],
      "answer": 2,
      "explain": "enable_if_t<cond, T> is T when cond holds and a substitution failure otherwise. So g exists (and returns T) only for integral T; other T removes it via SFINAE."
    },
    {
      "type": "code",
      "tag": "enable_if param",
      "question": "This uses enable_if as a defaulted non-type template parameter. Is it valid?",
      "code": "template<class T,\n         std::enable_if_t<std::is_integral_v<T>, int> = 0>\nvoid h(T x);",
      "options": [
        "Yes; this is a common idiom that keeps the return type clean",
        "No; enable_if cannot appear as a non-type template parameter",
        "Yes, but only if T is explicitly specified at the call site",
        "No; the default value must be void, not 0"
      ],
      "answer": 0,
      "explain": "Using enable_if_t<...,int> = 0 as an anonymous defaulted non-type parameter is a standard idiom. When the condition fails, the parameter type is ill-formed and the overload is SFINAE'd out."
    },
    {
      "type": "code",
      "tag": "two overloads",
      "question": "Are these two enable_if overloads well-formed as a pair?",
      "code": "template<class T>\nstd::enable_if_t<std::is_integral_v<T>> f(T);\ntemplate<class T>\nstd::enable_if_t<!std::is_integral_v<T>> f(T);",
      "options": [
        "Yes — putting enable_if in the return type gives each a distinct signature, and the conditions are mutually exclusive",
        "No — enable_if cannot be used with a void result type",
        "No — they redeclare the same function; the signatures are identical templates",
        "No — only one enable_if overload is ever allowed in a program"
      ],
      "answer": 0,
      "explain": "These are well-formed: the enable_if in the return type gives each a distinct return type, and the complementary conditions ensure exactly one participates for any given T."
    },
    {
      "type": "code",
      "tag": "two overloads",
      "question": "Why is THIS pair ill-formed (redefinition)?",
      "code": "template<class T,\n         std::enable_if_t<std::is_integral_v<T>, int> = 0>\nvoid f(T);\ntemplate<class T,\n         std::enable_if_t<!std::is_integral_v<T>, int> = 0>\nvoid f(T);",
      "options": [
        "The two enable_if conditions overlap for some T",
        "You cannot default a non-type template parameter",
        "enable_if_t with a second argument of int is invalid",
        "Default template arguments are not part of the signature, so both declare the same template void f(T)"
      ],
      "answer": 3,
      "explain": "Default arguments of template parameters do not participate in the function template's signature. Both templates therefore have the identical signature, a redefinition. Fix by giving the parameters distinct types."
    },
    {
      "type": "mcq",
      "tag": "declval",
      "question": "What is std::declval<T>() used for?",
      "options": [
        "Constructing a real T object at runtime",
        "Producing a value of type T&& in an unevaluated context without needing T to be constructible",
        "Converting T to a pointer type",
        "Checking whether T has a default constructor at runtime"
      ],
      "answer": 1,
      "explain": "declval<T>() yields an rvalue reference to T for use inside decltype/sizeof (unevaluated contexts). It never requires a constructor and must never be ODR-used (called for real)."
    },
    {
      "type": "code",
      "tag": "declval",
      "question": "What is wrong with this use of declval?",
      "code": "int x = std::declval<int>();  // in evaluated context",
      "options": [
        "declval<int>() returns int& not int",
        "Nothing is wrong; x becomes 0",
        "declval is declared but never defined; it may only appear in unevaluated contexts like decltype",
        "declval requires a template argument that is a class type"
      ],
      "answer": 2,
      "explain": "std::declval has no definition on purpose. Using it in an evaluated context (actually calling it) is ill-formed; it is intended solely for type computations inside decltype, sizeof, noexcept, etc."
    },
    {
      "type": "code",
      "tag": "decltype SFINAE",
      "question": "What does this trailing-return-type SFINAE express?",
      "code": "template<class T>\nauto size(const T& c) -> decltype(c.size()) {\n    return c.size();\n}",
      "options": [
        "size works for every type; decltype is just documentation",
        "size returns void for all T",
        "This is a hard error for any T without .size()",
        "size participates in overload resolution only for types that have a .size() member"
      ],
      "answer": 3,
      "explain": "decltype(c.size()) in the trailing return type is the immediate context. If c.size() is not valid, substitution fails softly and the overload is removed — a classic decltype-based SFINAE guard."
    },
    {
      "type": "mcq",
      "tag": "void_t",
      "question": "How is std::void_t defined and what makes it useful?",
      "options": [
        "template<class...> using void_t = void; it maps any well-formed type list to void, so a bad type triggers SFINAE",
        "It is an alias for std::conditional",
        "It stores a runtime void value",
        "It is a function returning void for any argument"
      ],
      "answer": 0,
      "explain": "void_t<...> is always void when its arguments are valid types. Placing an expression's type inside it lets a partial specialization succeed only when that expression is well-formed — the core of the detection idiom."
    },
    {
      "type": "code",
      "tag": "detection idiom",
      "question": "What does has_type_member<T> report for a type T that has a nested ::type?",
      "code": "template<class, class = void>\nstruct has_type_member : std::false_type {};\ntemplate<class T>\nstruct has_type_member<T, std::void_t<typename T::type>>\n    : std::true_type {};",
      "options": [
        "It is ambiguous between the two",
        "true_type — the specialization matches because void_t<typename T::type> is well-formed",
        "Compile error for any T",
        "false_type — the primary template always wins"
      ],
      "answer": 1,
      "explain": "When T::type exists, void_t<typename T::type> is void, so the more specialized partial specialization (inheriting true_type) is selected. Otherwise substitution fails and the primary false_type template is used."
    },
    {
      "type": "mcq",
      "tag": "is_convertible",
      "question": "std::is_convertible_v<Derived*, Base*> (Base a public base of Derived) is:",
      "options": [
        "false unless Base is virtual",
        "true — a derived pointer implicitly converts to a base pointer",
        "false — pointers of different types never convert",
        "true only with an explicit cast"
      ],
      "answer": 1,
      "explain": "is_convertible tests implicit convertibility. A Derived* converts implicitly to an accessible, unambiguous Base*, so the trait is true."
    },
    {
      "type": "mcq",
      "tag": "is_convertible",
      "question": "How does std::is_convertible_v<From, To> decide its result?",
      "options": [
        "Whether an imaginary function returning To could 'return' a From value via implicit conversion",
        "Whether a static_cast<To>(From) compiles",
        "Whether From and To have the same size",
        "Whether From publicly inherits from To"
      ],
      "answer": 0,
      "explain": "is_convertible checks implicit convertibility, modeled as whether 'To f() { return declval<From>(); }' would be valid. It is stricter than static_cast, which also allows explicit conversions."
    },
    {
      "type": "mcq",
      "tag": "common_type",
      "question": "What does std::common_type_t<int, double> yield?",
      "options": [
        "void",
        "int",
        "long double",
        "double"
      ],
      "answer": 3,
      "explain": "common_type gives the type to which all arguments can be converted, roughly the type of a ?: expression among them. For int and double that is double."
    },
    {
      "type": "mcq",
      "tag": "common_type",
      "question": "How is std::common_type<Ts...>::type essentially computed?",
      "options": [
        "As the first type in the pack",
        "As the decayed type of the ternary conditional expression among values of the types",
        "As the largest type by sizeof",
        "As the type with the most derived class"
      ],
      "answer": 1,
      "explain": "common_type is defined in terms of the type of the ?: conditional expression (with decay applied) among the argument types, giving a natural 'common' result."
    },
    {
      "type": "code",
      "tag": "write trait",
      "question": "Complete this hand-written is_pointer-like trait. What should the specialization inherit from?",
      "code": "template<class T> struct IsPtr : std::false_type {};\ntemplate<class T> struct IsPtr<T*> : /* ??? */ {};",
      "options": [
        "std::is_pointer<T>",
        "T",
        "std::true_type",
        "std::false_type"
      ],
      "answer": 2,
      "explain": "The partial specialization IsPtr<T*> matches pointer types and should inherit std::true_type; the primary template covers everything else with false_type. This is the classic trait pattern."
    },
    {
      "type": "code",
      "tag": "value template",
      "question": "What is is_void_trait<int>::value here?",
      "code": "template<class T>\nstruct is_void_trait { static constexpr bool value = false; };\ntemplate<>\nstruct is_void_trait<void> { static constexpr bool value = true; };",
      "options": [
        "It fails to compile",
        "false",
        "0 (an int, not a bool)",
        "true"
      ],
      "answer": 1,
      "explain": "int uses the primary template whose value is false. Only the explicit specialization for void yields true. This is how is_void is fundamentally built."
    },
    {
      "type": "mcq",
      "tag": "tag dispatch",
      "question": "Tag dispatch selects an implementation by:",
      "options": [
        "Passing an extra argument whose type (a tag) picks a distinct overload via ordinary overload resolution",
        "Using enable_if inside the return type",
        "Throwing and catching a tag exception at runtime",
        "Using virtual functions on a tag base class"
      ],
      "answer": 0,
      "explain": "Tag dispatch adds a helper argument — e.g. std::true_type{}/std::false_type{} or an iterator category tag — so overload resolution, not SFINAE, chooses the right implementation function."
    },
    {
      "type": "code",
      "tag": "tag dispatch",
      "question": "Which impl is called for a random-access iterator?",
      "code": "void advance_impl(It& i, N n, std::random_access_iterator_tag) { i += n; }\nvoid advance_impl(It& i, N n, std::input_iterator_tag) { while(n--) ++i; }\n// call: advance_impl(i, n,\n//   typename std::iterator_traits<It>::iterator_category{});",
      "options": [
        "Neither; tags cannot be constructed",
        "The input_iterator_tag overload, always",
        "It is ambiguous between the two",
        "The random_access_iterator_tag overload, an exact match that beats the input_iterator_tag base"
      ],
      "answer": 3,
      "explain": "The category tag types form an inheritance hierarchy. A random_access_iterator_tag argument matches its own overload exactly (better than the base input_iterator_tag), so the efficient i += n version is chosen."
    },
    {
      "type": "code",
      "tag": "if constexpr",
      "question": "What allows this single function to compile for every T without SFINAE?",
      "code": "template<class T>\nauto get(T t) {\n    if constexpr (std::is_pointer_v<T>)\n        return *t;\n    else\n        return t;\n}",
      "options": [
        "Both branches are always instantiated but the compiler ignores errors",
        "auto forces both branches to have the same type",
        "if constexpr discards the untaken branch, so *t is only instantiated when T is a pointer",
        "The compiler runs the condition at runtime and skips the bad branch"
      ],
      "answer": 2,
      "explain": "With a constant condition, if constexpr does not instantiate the discarded branch's statements. So *t never gets instantiated for non-pointer T, avoiding a hard error and replacing an enable_if pair."
    },
    {
      "type": "code",
      "tag": "if constexpr",
      "question": "Why does this if constexpr fail to compile even though the branch is discarded for most T?",
      "code": "template<class T>\nvoid f(T t) {\n    if constexpr (sizeof(T) == 0) {\n        static_assert(false, \"never\");\n    }\n}",
      "options": [
        "sizeof(T) is never zero, so the branch is fine",
        "static_assert(false) does not depend on T, so it fires unconditionally regardless of the branch",
        "if constexpr always instantiates both branches",
        "static_assert is illegal inside if constexpr"
      ],
      "answer": 1,
      "explain": "A discarded if constexpr branch is still parsed. A static_assert whose condition doesn't depend on template parameters is evaluated regardless, making the template ill-formed. Make the condition depend on T to avoid this."
    },
    {
      "type": "mcq",
      "tag": "constexpr",
      "question": "What can a constexpr function do in metaprogramming that a recursive value-trait cannot easily?",
      "options": [
        "Compute compile-time values with ordinary imperative code (loops, locals) that also works at runtime",
        "Perform I/O at compile time",
        "Produce types as results",
        "Bypass the type system entirely"
      ],
      "answer": 0,
      "explain": "constexpr functions let you write normal control-flow code the compiler can evaluate at compile time (and also at runtime), a far more readable way to compute values than recursive template instantiation."
    },
    {
      "type": "code",
      "tag": "constexpr",
      "question": "Is this valid, and what is arr's size?",
      "code": "constexpr int square(int n) { return n * n; }\nint arr[square(4)];",
      "options": [
        "Invalid; square must be consteval",
        "Valid but arr has an implementation-defined size",
        "Valid; arr has 16 elements because square(4) is a constant expression",
        "Invalid; a function call cannot appear in an array bound"
      ],
      "answer": 2,
      "explain": "square is constexpr and called with a constant argument, so square(4) is a core constant expression usable as an array bound. arr has 16 elements."
    },
    {
      "type": "mcq",
      "tag": "concepts",
      "question": "In C++20, which is the idiomatic replacement for an enable_if-guarded template?",
      "options": [
        "A macro that expands to enable_if",
        "typeid-based runtime dispatch",
        "A virtual function",
        "A concept used as a constrained template parameter or requires-clause"
      ],
      "answer": 3,
      "explain": "Concepts express requirements directly and produce far better diagnostics. 'template<std::integral T>' or 'requires std::integral<T>' replaces the enable_if noise and still constrains overload resolution."
    },
    {
      "type": "code",
      "tag": "concepts",
      "question": "What does this concept-constrained overload require?",
      "code": "template<class T>\nrequires std::is_integral_v<T>\nT twice(T x) { return x + x; }",
      "options": [
        "It is a hard error for floating-point T",
        "twice participates only when T is integral; otherwise it is not a candidate",
        "twice works for any T that supports +",
        "The requires-clause is only documentation and has no effect"
      ],
      "answer": 1,
      "explain": "A requires-clause is a constraint: the template is only a viable candidate when the constraint (is_integral_v<T>) is satisfied. It is the C++20 way to do what enable_if did, but cleaner."
    },
    {
      "type": "mcq",
      "tag": "concepts",
      "question": "Compared to SFINAE via enable_if, a key advantage of concepts for overload resolution is:",
      "options": [
        "Concepts allow multiple identical signatures",
        "Concepts eliminate the need for templates",
        "Concepts are checked only at runtime",
        "Constraints are ordered by subsumption, so a more-constrained overload is preferred over a less-constrained one"
      ],
      "answer": 3,
      "explain": "The compiler compares constraints via subsumption: an overload whose constraints imply another's is more specialized and wins, avoiding the awkward mutually-exclusive enable_if conditions."
    },
    {
      "type": "code",
      "tag": "requires expression",
      "question": "What does this requires-expression test?",
      "code": "template<class T>\nconcept Addable = requires(T a, T b) {\n    a + b;\n};",
      "options": [
        "Whether T has an operator+ member function only",
        "Whether a + b equals a specific value at runtime",
        "Whether the expression a + b is well-formed for values of type T",
        "Whether T is an arithmetic type"
      ],
      "answer": 2,
      "explain": "A requires-expression with a simple requirement 'a + b;' is satisfied when that expression compiles (is well-formed) for the given operands, regardless of its value."
    },
    {
      "type": "mcq",
      "tag": "concepts",
      "question": "A named concept improves on an unnamed enable_if condition mainly because:",
      "options": [
        "It is reusable and produces readable diagnostics naming the unsatisfied requirement",
        "It removes the need to compile the constrained template",
        "It executes faster at runtime",
        "It allows implicit narrowing conversions"
      ],
      "answer": 0,
      "explain": "Concepts give the constraint a name and structure, so compiler errors say which requirement failed instead of dumping a failed enable_if substitution. They are also reusable across many templates."
    },
    {
      "type": "mcq",
      "tag": "true_type",
      "question": "std::true_type is an alias for which type?",
      "options": [
        "std::integral_constant<bool, true>",
        "A plain typedef for bool",
        "std::conditional<true, int, int>",
        "std::is_same<bool, bool>"
      ],
      "answer": 0,
      "explain": "true_type is std::integral_constant<bool, true> and false_type is integral_constant<bool, false>. They carry a static ::value and an implicit conversion to bool, forming the base of most traits."
    },
    {
      "type": "mcq",
      "tag": "add_pointer",
      "question": "What is std::add_pointer_t<int&>?",
      "options": [
        "int&* (a pointer to reference)",
        "int**",
        "int&",
        "int* — the reference is removed first, then a pointer is added"
      ],
      "answer": 3,
      "explain": "There is no such thing as a pointer to a reference, so add_pointer first strips the reference and then forms a pointer to the referred type, giving int*."
    },
    {
      "type": "mcq",
      "tag": "remove_pointer",
      "question": "std::remove_pointer_t<int**> is:",
      "options": [
        "int* — only one level of pointer is removed",
        "void*",
        "int**",
        "int"
      ],
      "answer": 0,
      "explain": "remove_pointer removes a single level of pointer indirection. Applied to int** it yields int*; you would need to apply it twice to reach int."
    },
    {
      "type": "mcq",
      "tag": "is_base_of",
      "question": "std::is_base_of_v<T, T> for a complete class type T is:",
      "options": [
        "false — a class is not its own base",
        "Only true if T is polymorphic",
        "It is ill-formed",
        "true — a class is considered a base of itself"
      ],
      "answer": 3,
      "explain": "By definition is_base_of<Base, Derived> is true when they are the same class (or Base is an actual base). So is_base_of_v<T,T> is true for a complete class type T."
    },
    {
      "type": "mcq",
      "tag": "is_class",
      "question": "std::is_class_v is true for which of these?",
      "options": [
        "An enum type",
        "A struct type (structs are classes)",
        "A function type",
        "A union type"
      ],
      "answer": 1,
      "explain": "is_class is true for non-union class types, which includes struct (structs are classes with default public access). It is false for unions, enums, and functions."
    },
    {
      "type": "mcq",
      "tag": "is_arithmetic",
      "question": "std::is_arithmetic_v<T> is defined as which combination?",
      "options": [
        "is_signed_v<T> || is_unsigned_v<T>",
        "is_scalar_v<T> only",
        "is_integral_v<T> && is_floating_point_v<T>",
        "is_integral_v<T> || is_floating_point_v<T>"
      ],
      "answer": 3,
      "explain": "Arithmetic types are exactly the integral types plus the floating-point types, so is_arithmetic is the logical OR of is_integral and is_floating_point."
    },
    {
      "type": "mcq",
      "tag": "is_const",
      "question": "std::is_const_v<const int*> is:",
      "options": [
        "It is ill-formed",
        "true — it contains the word const",
        "false — the pointer itself is not const; the pointee is",
        "true — pointers to const are const"
      ],
      "answer": 2,
      "explain": "is_const checks the TOP-LEVEL const of the type. const int* is a (non-const) pointer to const int, so the top level is not const and the trait is false. (int* const would be true.)"
    },
    {
      "type": "mcq",
      "tag": "is_signed",
      "question": "std::is_signed_v<bool> is:",
      "options": [
        "true — bool can be negated",
        "It is ill-formed",
        "false — bool is not a signed arithmetic type",
        "true — bool is stored as a signed byte"
      ],
      "answer": 2,
      "explain": "is_signed is true only for signed arithmetic types where T(-1) < T(0). bool cannot represent negative values, so is_signed_v<bool> is false (and is_unsigned_v<bool> is true)."
    },
    {
      "type": "mcq",
      "tag": "make_unsigned",
      "question": "std::make_unsigned_t<int> is:",
      "options": [
        "int",
        "unsigned char",
        "std::size_t",
        "unsigned int"
      ],
      "answer": 3,
      "explain": "make_unsigned maps an integer type to its unsigned counterpart of the same size, so int becomes unsigned int. (It is undefined for bool and non-integral, non-enum types.)"
    },
    {
      "type": "code",
      "tag": "underlying_type",
      "question": "What does std::underlying_type_t give here?",
      "code": "enum class Color : unsigned char { Red, Green };\nusing U = std::underlying_type_t<Color>;",
      "options": [
        "int",
        "unsigned int",
        "Color",
        "unsigned char"
      ],
      "answer": 3,
      "explain": "underlying_type yields the integer type an enum is represented in. Here the enum class explicitly fixes it to unsigned char, so U is unsigned char."
    },
    {
      "type": "mcq",
      "tag": "is_function",
      "question": "std::is_function_v<void()> is true. What is std::is_function_v<void(*)()> (a function pointer)?",
      "options": [
        "true — it still refers to a function",
        "It is ill-formed",
        "It depends on the calling convention",
        "false — a function pointer is an object (pointer) type, not a function type"
      ],
      "answer": 3,
      "explain": "is_function is true for actual function types like void(). A function POINTER void(*)() is a pointer (object) type, so is_function is false for it (is_pointer would be true)."
    },
    {
      "type": "mcq",
      "tag": "detection idiom",
      "question": "The 'detection idiom' (is_detected / detected_or) primarily lets you:",
      "options": [
        "Detect memory leaks at compile time",
        "Replace all runtime polymorphism",
        "Detect the CPU architecture",
        "Ask 'is this expression/typedef valid for T?' and get a boolean or a fallback type without writing two class templates each time"
      ],
      "answer": 3,
      "explain": "The detection idiom packages the void_t partial-specialization trick into reusable utilities so you can query validity of a member or expression and optionally supply a default type."
    },
    {
      "type": "code",
      "tag": "detection member",
      "question": "What does has_push_back<std::vector<int>>::value give?",
      "code": "template<class T, class = void>\nstruct has_push_back : std::false_type {};\ntemplate<class T>\nstruct has_push_back<T, std::void_t<\n    decltype(std::declval<T&>().push_back(\n        std::declval<typename T::value_type>()))>>\n    : std::true_type {};",
      "options": [
        "It is a hard error",
        "false — the primary template always wins",
        "true — vector<int> has a push_back accepting its value_type",
        "It depends on the allocator"
      ],
      "answer": 2,
      "explain": "declval<vector<int>&>().push_back(declval<int>()) is well-formed, so void_t yields void and the true_type specialization is selected. The detection idiom combines declval, decltype and void_t."
    },
    {
      "type": "mcq",
      "tag": "type vs value",
      "question": "Which trait is a 'transformation trait' (produces a type) rather than a 'predicate trait' (produces a value)?",
      "options": [
        "std::is_pointer",
        "std::is_base_of",
        "std::is_same",
        "std::remove_const"
      ],
      "answer": 3,
      "explain": "remove_const yields a ::type (a transformed type). is_pointer, is_same, and is_base_of are predicates yielding a ::value (bool). Transformation traits use _t; predicate traits use _v."
    },
    {
      "type": "mcq",
      "tag": "is_default_constructible",
      "question": "How does a trait like std::is_default_constructible ultimately determine its answer?",
      "options": [
        "By comparing sizeof(T) to zero",
        "By checking (in an unevaluated context) whether an expression that value-initializes T is well-formed",
        "By requiring the programmer to specialize it for each type",
        "By calling T's constructor at runtime and catching exceptions"
      ],
      "answer": 1,
      "explain": "Such traits are implemented with SFINAE/detection over an unevaluated construction expression (e.g. using declval and decltype). If forming T{} is valid the trait is true — no runtime construction occurs."
    },
    {
      "type": "mcq",
      "tag": "is_trivially_copyable",
      "question": "What does std::is_trivially_copyable_v<T> being true permit?",
      "options": [
        "Copying objects of T with std::memcpy and preserving object semantics",
        "That T has no members",
        "That T has a user-provided copy constructor",
        "That T is an integral type"
      ],
      "answer": 0,
      "explain": "A trivially copyable type may be copied byte-for-byte (e.g. via memcpy) and remain valid. User-provided copy/move operations would make it NON-trivially copyable."
    },
    {
      "type": "mcq",
      "tag": "is_empty",
      "question": "std::is_empty_v<T> is true when:",
      "options": [
        "sizeof(T) == 0",
        "T is void",
        "T is a non-union class with no non-static data members (and no virtuals/virtual bases)",
        "T has never been instantiated"
      ],
      "answer": 2,
      "explain": "is_empty detects classes with no non-static data members, no virtual functions, and no virtual/non-empty bases. Such a type still has sizeof >= 1, but it is eligible for the empty base optimization."
    },
    {
      "type": "code",
      "tag": "SFINAE overload",
      "question": "For a call print(std::vector<int>{}), what is the outcome?",
      "code": "template<class T>\nauto print(const T& c) -> decltype(c.begin(), void()); // A: containers\ntemplate<class T>\nvoid print(const T& x);                                 // B: fallback",
      "options": [
        "A unambiguously, because A is more specialized",
        "Ambiguous — both A and B are equally-specialized templates that match vector",
        "B unambiguously",
        "Neither compiles"
      ],
      "answer": 1,
      "explain": "Both A and B are equally specialized function templates that match vector, so the call is ambiguous. SFINAE removes non-viable candidates but does not rank two equally-viable ones — you must add a priority tag or differing parameter to disambiguate."
    },
    {
      "type": "code",
      "tag": "nested SFINAE",
      "question": "Why is this a HARD error rather than SFINAE when T lacks value_type?",
      "code": "template<class T>\nstruct Helper { using type = typename T::value_type; };\ntemplate<class T>\nauto f(T) -> typename Helper<T>::type;",
      "options": [
        "typename is missing somewhere",
        "Helper is not a template",
        "It is actually SFINAE-friendly",
        "The invalid access happens while instantiating Helper<T>, outside f's immediate context"
      ],
      "answer": 3,
      "explain": "Naming Helper<T>::type forces instantiation of Helper<T>, and the failure (T::value_type invalid) occurs inside that instantiation — not in f's immediate context. Such nested failures are hard errors."
    },
    {
      "type": "code",
      "tag": "decltype parens",
      "question": "Why might this static_assert FAIL?",
      "code": "int x = 0;\nstatic_assert(std::is_same_v<decltype((x)), int>);",
      "options": [
        "decltype((x)) is int& because parenthesizing an lvalue yields an lvalue-reference type",
        "decltype((x)) is int*",
        "decltype((x)) is const int",
        "It actually passes; parentheses have no effect"
      ],
      "answer": 0,
      "explain": "decltype of a parenthesized lvalue expression yields an lvalue reference. x is an lvalue of type int, so decltype((x)) is int&, not int — a well-known decltype gotcha."
    },
    {
      "type": "code",
      "tag": "SFINAE default arg",
      "question": "This puts enable_if in a default function argument. Does it constrain the overload?",
      "code": "template<class T>\nvoid f(T x, std::enable_if_t<std::is_integral_v<T>, int> = 0);",
      "options": [
        "Yes; the parameter's type is part of the signature, so a non-integral T makes it ill-formed and removes the overload",
        "No; default arguments are never checked during overload resolution",
        "No; only template parameters can carry enable_if",
        "It changes the number of arguments the caller must pass"
      ],
      "answer": 0,
      "explain": "Even with a default, the parameter's TYPE (enable_if_t<...,int>) is part of the function's signature and immediate context. A non-integral T makes that type ill-formed, SFINAE-removing the overload."
    },
    {
      "type": "code",
      "tag": "SFINAE member",
      "question": "Why is copy written as a member template with U = T rather than a plain member?",
      "code": "template<class T>\nstruct Box {\n    template<class U = T>\n    std::enable_if_t<std::is_copy_constructible_v<U>> copy();\n};",
      "options": [
        "Because enable_if_t with no second argument is invalid",
        "To make copy virtual",
        "It is purely stylistic; a non-template member would work identically",
        "SFINAE needs a template parameter to substitute; U = T lets enable_if apply per call, since T alone is already fixed"
      ],
      "answer": 3,
      "explain": "A non-template member can't SFINAE on the class's already-fixed T. Adding a defaulted member template parameter U = T gives substitution something to fail on, enabling/disabling copy per instantiation."
    },
    {
      "type": "code",
      "tag": "enable_if ctor",
      "question": "Why is enable_if placed in a defaulted template parameter for CONSTRUCTORS rather than the return type?",
      "code": "template<class U,\n         std::enable_if_t<std::is_convertible_v<U, T>, int> = 0>\nBox(U&& u);",
      "options": [
        "Constructors cannot be templates",
        "enable_if is banned in return types",
        "The return type of a constructor is the class itself",
        "Constructors have no return type, so the return-type technique is unavailable"
      ],
      "answer": 3,
      "explain": "Constructors (and conversion operators, destructors) have no return type to hang enable_if on, so the defaulted non-type template parameter idiom is used to conditionally enable them."
    },
    {
      "type": "code",
      "tag": "trait short-circuit",
      "question": "Why does ok<int> cause a hard error here?",
      "code": "template<class T>\nconstexpr bool ok =\n    std::is_class_v<T> && std::is_same_v<typename T::x, int>;",
      "options": [
        "&& on _v values still forms typename T::x even when is_class_v<T> is false, and int has no member x",
        "It short-circuits correctly and yields false",
        "It yields true for int",
        "&& is not allowed in a variable template"
      ],
      "answer": 0,
      "explain": "The && operates on already-substituted expressions: typename T::x is formed regardless of the left operand's value, and for int (no member x) that is a hard error. std::conjunction would short-circuit the instantiation; plain && does not."
    },
    {
      "type": "mcq",
      "tag": "conjunction",
      "question": "What is the benefit of std::conjunction<is_a<T>, is_b<T>> over is_a_v<T> && is_b_v<T>?",
      "options": [
        "There is no difference at all",
        "conjunction runs the checks at runtime",
        "conjunction short-circuits instantiation: later traits are not instantiated once an earlier one is false",
        "conjunction ignores the second trait entirely"
      ],
      "answer": 2,
      "explain": "std::conjunction (and disjunction) short-circuits at the template level: once a trait yields false, the remaining ones are not instantiated. Plain && on _v values instantiates every trait first."
    },
    {
      "type": "mcq",
      "tag": "well-formed pack",
      "question": "Which of these is a substitution failure (SFINAE), NOT a hard error, when substituting T?",
      "options": [
        "Dividing by a zero constant inside the function body",
        "Instantiating a class template whose body is invalid for T",
        "Forming the type T::type in a function's return type when T has no member type",
        "A static_assert(false) that does not depend on T"
      ],
      "answer": 2,
      "explain": "Naming T::type in the signature (immediate context) is a soft substitution failure. The others occur outside the immediate context (body, unconditional assert, nested instantiation) and are hard errors."
    },
    {
      "type": "mcq",
      "tag": "enable_if_t default",
      "question": "std::enable_if_t<Cond> with only one argument has ::type equal to what when Cond is true?",
      "options": [
        "Cond",
        "bool",
        "There is no ::type",
        "void (the default second template argument)"
      ],
      "answer": 3,
      "explain": "The second template parameter of enable_if defaults to void, so enable_if_t<true> is void. This is why single-argument enable_if gates class-template partial specializations against a void default."
    },
    {
      "type": "mcq",
      "tag": "remove_cvref",
      "question": "std::remove_cvref_t<const int&> (C++20) is:",
      "options": [
        "const int — only the reference is removed",
        "int& — only the const is removed",
        "int — it strips both reference and cv-qualifiers",
        "const int& — remove_cvref does not exist"
      ],
      "answer": 2,
      "explain": "std::remove_cvref_t (C++20) combines remove_reference and remove_cv, so const int& becomes int. It is the concise tool for normalizing a forwarding-reference type."
    },
    {
      "type": "mcq",
      "tag": "invoke_result",
      "question": "For a lambda [](int x){ return x * 1.0; } named lam, what is std::invoke_result_t<decltype(lam), int>?",
      "options": [
        "int",
        "decltype(lam)",
        "double",
        "void"
      ],
      "answer": 2,
      "explain": "invoke_result_t<F, Args...> gives the type of invoking F with Args. The lambda returns x * 1.0, a double, so the result is double. It replaced the older result_of."
    },
    {
      "type": "mcq",
      "tag": "is_floating_point",
      "question": "std::is_floating_point_v<long double> is:",
      "options": [
        "It is ill-formed",
        "false — only float and double count",
        "true only on 80-bit platforms",
        "true — long double is one of the standard floating-point types"
      ],
      "answer": 3,
      "explain": "The standard floating-point types are float, double, and long double; is_floating_point is true for all three regardless of their actual bit width on a given platform."
    },
    {
      "type": "mcq",
      "tag": "if constexpr",
      "question": "A key rule that makes if constexpr replace many SFINAE overload sets is that in a template, the discarded branch:",
      "options": [
        "Is compiled into a separate translation unit",
        "Is not instantiated, so template-dependent code that would be ill-formed for this T never triggers an error",
        "Is executed but its result is thrown away at runtime",
        "Must still be valid for every possible T"
      ],
      "answer": 1,
      "explain": "Inside a template, the branch not taken by a constant condition is not instantiated. Dependent code that would otherwise be a hard error for this T is simply skipped, letting one function replace an enable_if pair."
    }
  ]
};

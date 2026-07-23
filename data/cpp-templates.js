/* ===== C++ — Templates & the STL =====
   Original question bank generated for LearnHub. Engine shape:
   { type: "mcq"|"code", tag, question, code?, options[], answer (0-based), explain }
   52 questions. Presented in random order by the quiz engine.
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-templates"] = {
  title: "C++ — Templates & the STL",
  subtitle: "Function/class templates, specialization & generic algorithms.",
  crumb: "C++",
  questions: [
    {
      "type": "code",
      "tag": "Deduction",
      "question": "What happens when this code is compiled and run?",
      "code": "#include <iostream>\ntemplate <typename T>\nT max_val(T a, T b) { return a > b ? a : b; }\n\nint main() {\n    std::cout << max_val(3, 4.5);\n    return 0;\n}",
      "options": [
        "Prints 4.5",
        "Prints 4",
        "Compilation error",
        "Prints 3"
      ],
      "answer": 2,
      "explain": "Both parameters share the single template parameter T, but the arguments deduce T=int (from 3) and T=double (from 4.5) simultaneously, which conflict. Deduction never applies implicit conversions to reconcile them, so it fails to compile. It would only print 4.5 if the parameters used two independent template parameters."
    },
    {
      "type": "code",
      "tag": "typename",
      "question": "Why does this template fail to compile?",
      "code": "template <typename T>\nvoid f() {\n    T::value_type x;\n    (void)x;\n}",
      "options": [
        "value_type must be public",
        "Missing 'typename' before T::value_type",
        "T must be a class type",
        "It compiles fine"
      ],
      "answer": 1,
      "explain": "T::value_type is a dependent name and the compiler assumes a dependent qualified name is a value, not a type, unless told otherwise. You must write 'typename T::value_type x;'. The access level is irrelevant here because the parse itself fails before any instantiation."
    },
    {
      "type": "mcq",
      "tag": "Headers",
      "question": "Why must the full definition of a template (not just its declaration) normally live in a header file?",
      "options": [
        "Because templates cannot be exported as symbols by any linker",
        "Because the compiler needs the definition visible at each instantiation point to generate code for the specific types used",
        "Because header files compile faster than source files",
        "Because 'template' is a preprocessor keyword"
      ],
      "answer": 1,
      "explain": "A template is a pattern; the compiler can only emit code once it knows the concrete arguments, so the definition must be visible in every translation unit that instantiates it. Putting only the definition in a .cpp file typically yields undefined-reference link errors. Linkers do handle the resulting weak symbols fine; visibility at instantiation is the real constraint."
    },
    {
      "type": "code",
      "tag": "Specialization",
      "question": "Which function is called by g(0)?",
      "code": "#include <iostream>\ntemplate <typename T> void g(T)   { std::cout << \"A\"; }\ntemplate <typename T> void g(T*)  { std::cout << \"B\"; }\nvoid g(int)                        { std::cout << \"C\"; }\n\nint main() { g(0); }",
      "options": [
        "Prints A",
        "Prints B",
        "Prints C",
        "Ambiguous, does not compile"
      ],
      "answer": 2,
      "explain": "0 is an int. A non-template function that is an exact match is preferred over any function template specialization during overload resolution. The g(T) template with T=int is also an exact match, but the ordinary function wins the tie, so C prints."
    },
    {
      "type": "code",
      "tag": "Two-phase",
      "question": "Does this compile, and if not, why?",
      "code": "template <typename T>\nstruct Base { void hello() {} };\n\ntemplate <typename T>\nstruct Derived : Base<T> {\n    void go() { hello(); }\n};",
      "options": [
        "Compiles; hello is found normally",
        "Error: hello() is not found without this-> or Base<T>::",
        "Error: Base must be declared friend",
        "Compiles only if T is int"
      ],
      "answer": 1,
      "explain": "Under two-phase lookup, non-dependent names like hello() are looked up at definition time, and members of a dependent base (Base<T>) are NOT visible then. You must write this->hello() or Base<T>::hello() to make the name dependent so lookup is deferred to instantiation. The base being a template is exactly what makes it dependent."
    },
    {
      "type": "code",
      "tag": "NonType",
      "question": "What is the result of compiling this?",
      "code": "template <int N>\nstruct Array { int data[N]; };\n\nint main() {\n    int n = 5;\n    Array<n> a;\n    (void)a;\n}",
      "options": [
        "Compiles; a holds 5 ints",
        "Error: n is not a constant expression",
        "Compiles; a holds garbage size",
        "Error: N must be unsigned"
      ],
      "answer": 1,
      "explain": "A non-type template argument must be a compile-time constant expression. A plain 'int n = 5;' is not usable as a constant expression, so Array<n> fails. Writing 'const int n = 5;' (or constexpr) with an initializer would make it work."
    },
    {
      "type": "code",
      "tag": "Specialization",
      "question": "What does this print?",
      "code": "#include <iostream>\ntemplate <typename T> struct S { static const int v = 1; };\ntemplate <> struct S<int> { static const int v = 2; };\n\nint main() {\n    std::cout << S<int>::v << S<char>::v;\n}",
      "options": [
        "Prints 12",
        "Prints 21",
        "Prints 11",
        "Prints 22"
      ],
      "answer": 1,
      "explain": "S<int> matches the explicit full specialization (v=2), while S<char> falls back to the primary template (v=1). So S<int>::v prints 2 and S<char>::v prints 1, giving '21'. The '12' distractor reverses which template each type binds to."
    },
    {
      "type": "mcq",
      "tag": "Specialization",
      "question": "Which statement about explicit specialization of function templates versus class templates is TRUE in C++11/14?",
      "options": [
        "Function templates support partial specialization just like class templates",
        "Class templates support partial specialization, but function templates do not (you overload instead)",
        "Neither can be partially specialized",
        "Function templates can be partially specialized but class templates cannot"
      ],
      "answer": 1,
      "explain": "C++ allows partial specialization only for class (and variable, in later standards) templates. To get specialization-like behavior for functions you add another overload, letting overload resolution and partial ordering choose. Attempting 'template<typename T> void f<T*>()' is ill-formed."
    },
    {
      "type": "code",
      "tag": "Deduction",
      "question": "What is deduced for T, and what prints?",
      "code": "#include <iostream>\ntemplate <typename T>\nvoid f(T x) { std::cout << sizeof(x); }\n\nint main() {\n    const int a = 10;\n    f(a);\n}",
      "options": [
        "T is const int; prints sizeof(int)",
        "T is int (const stripped); prints sizeof(int)",
        "Error: cannot deduce from const",
        "T is int&; prints sizeof(int)"
      ],
      "answer": 1,
      "explain": "When deducing for a by-value parameter (T x), top-level const and reference qualifiers on the argument are ignored, so T deduces to int, not const int. The value is still copied. Const would only survive if the parameter were T& or const T&."
    },
    {
      "type": "code",
      "tag": "Two-phase",
      "question": "Why might this compile on some compilers but is technically ill-formed?",
      "code": "template <typename T>\nvoid f() {\n    undefined_function();\n}",
      "options": [
        "undefined_function is a dependent name",
        "undefined_function is a non-dependent name that must be declared at definition time",
        "Templates may call undeclared functions",
        "f is never instantiated so it is fine"
      ],
      "answer": 1,
      "explain": "undefined_function() takes no template-dependent arguments, so it is a non-dependent name that must be visible during the first phase (template definition). A conforming compiler may diagnose it even if f is never instantiated (the program is ill-formed, no diagnostic required), though many compilers historically only complained at instantiation. ADL cannot save it because there are no arguments to trigger it."
    },
    {
      "type": "code",
      "tag": "Deduction",
      "question": "What prints?",
      "code": "#include <iostream>\ntemplate <typename T>\nvoid f(const T& x) { std::cout << sizeof(x); }\n\nint main() {\n    const char arr[7] = \"hello!\";\n    f(arr);\n}",
      "options": [
        "Prints sizeof(char*), e.g. 8",
        "Prints 7",
        "Prints 1",
        "Compilation error"
      ],
      "answer": 1,
      "explain": "When the parameter is a reference (const T&), array-to-pointer decay does NOT happen, so T deduces to char[7] and sizeof(x) is 7. If the parameter were by value (T x), the array would decay to a pointer and you'd get pointer size instead."
    },
    {
      "type": "code",
      "tag": "NonType",
      "question": "Does this compile in C++11/14?",
      "code": "template <double D>\nstruct Scaler { };\n\nint main() {\n    Scaler<3.14> s;\n    (void)s;\n}",
      "options": [
        "Yes, floating-point non-type parameters are allowed",
        "No, floating-point types are not allowed as non-type template parameters",
        "Only if D is constexpr",
        "Yes, but only for float, not double"
      ],
      "answer": 1,
      "explain": "In C++11/14, non-type template parameters may be integral, enumeration, pointer, reference, or pointer-to-member types, but NOT floating-point. (Floating-point non-type parameters were only permitted starting in C++20.) The constant-ness of the argument is irrelevant; the parameter type itself is disallowed."
    },
    {
      "type": "code",
      "tag": "typename",
      "question": "What is wrong here?",
      "code": "template <typename T>\nstruct Wrapper {\n    typename T::iterator it;\n};\n\nint main() {\n    Wrapper<int> w;\n    (void)w;\n}",
      "options": [
        "Nothing; it compiles and runs",
        "Error at instantiation: int has no member iterator",
        "Error: typename is misused here",
        "Error: Wrapper needs a default constructor"
      ],
      "answer": 1,
      "explain": "The 'typename' keyword is correctly required and used because T::iterator is a dependent type. The template definition is fine, but instantiating Wrapper<int> fails because int has no nested iterator type. The error surfaces only at instantiation, illustrating two-phase checking."
    },
    {
      "type": "mcq",
      "tag": "Deduction",
      "question": "For a template parameter declared as 'template <typename T> void f(T&& x)', what does T deduce to when called as f(lvalue_int)?",
      "options": [
        "T deduces to int",
        "T deduces to int&, and T&& collapses to int&",
        "T deduces to int&&",
        "Deduction fails for lvalues"
      ],
      "answer": 1,
      "explain": "A T&& parameter in a deduced context is a forwarding (universal) reference. For an lvalue argument of type int, T deduces to int& and reference collapsing turns int& && into int&. An rvalue argument would instead deduce T=int, giving int&&."
    },
    {
      "type": "code",
      "tag": "Overloading",
      "question": "What does this print?",
      "code": "#include <iostream>\ntemplate <typename T> void h(T)  { std::cout << \"1\"; }\ntemplate <typename T> void h(T&) { std::cout << \"2\"; }\n\nint main() {\n    int x = 0;\n    h(x);\n}",
      "options": [
        "Prints 1",
        "Prints 2",
        "Ambiguous: does not compile",
        "Prints 12"
      ],
      "answer": 2,
      "explain": "Both h(T) with T=int and h(T&) with T=int are exact matches for an lvalue int, and partial ordering strips the reference so neither template is more specialized. Overload resolution is therefore ambiguous and the call fails to compile (confirmed on g++/clang). This is a classic trap: adding a by-reference overload alongside a by-value one for the same type creates ambiguity."
    },
    {
      "type": "code",
      "tag": "Specialization",
      "question": "Why is this ill-formed?",
      "code": "template <typename T> void f(T) { }\n\ntemplate <> void f<int>(int) { }\ntemplate <> void f<int>(int) { }",
      "options": [
        "A function template cannot be specialized",
        "f<int> is explicitly specialized twice (redefinition)",
        "Explicit specialization needs 'inline'",
        "T cannot be int"
      ],
      "answer": 1,
      "explain": "An explicit specialization is a concrete definition; providing two definitions of the same specialization f<int> is a redefinition, which is ill-formed just like defining any function twice. A single explicit specialization is perfectly legal; the problem is the duplicate."
    },
    {
      "type": "code",
      "tag": "Instantiation",
      "question": "What does this print?",
      "code": "#include <iostream>\ntemplate <typename T>\nstruct Counter {\n    static int count;\n};\ntemplate <typename T> int Counter<T>::count = 0;\n\nint main() {\n    Counter<int>::count = 5;\n    std::cout << Counter<double>::count;\n}",
      "options": [
        "Prints 5",
        "Prints 0",
        "Prints garbage",
        "Compilation error: static not defined"
      ],
      "answer": 1,
      "explain": "Each instantiation of a class template has its own distinct copy of static members. Counter<int> and Counter<double> are unrelated types, so setting Counter<int>::count does not affect Counter<double>::count, which remains its initialized 0. Thus it prints 0. The out-of-class definition line is required and correctly provided."
    },
    {
      "type": "code",
      "tag": "Deduction",
      "question": "Does f({1,2,3}) compile?",
      "code": "template <typename T>\nvoid f(T x) { (void)x; }\n\nint main() {\n    f({1, 2, 3});\n}",
      "options": [
        "Yes, T deduces to std::initializer_list<int>",
        "No; a braced-init-list has no type, so T cannot be deduced",
        "Yes, T deduces to int[3]",
        "Yes, T deduces to int"
      ],
      "answer": 1,
      "explain": "Template argument deduction from a braced-init-list to a plain type parameter T fails because a braced-init-list has no type of its own. Only a parameter explicitly declared std::initializer_list<T> (or auto) can deduce from braces. This is why f({1,2,3}) is a hard error."
    },
    {
      "type": "code",
      "tag": "NonType",
      "question": "What does this print?",
      "code": "#include <iostream>\ntemplate <int N>\nint factorial() { return N * factorial<N-1>(); }\ntemplate <>\nint factorial<0>() { return 1; }\n\nint main() {\n    std::cout << factorial<4>();\n}",
      "options": [
        "Prints 24",
        "Prints 0",
        "Infinite recursion / does not compile",
        "Prints 4"
      ],
      "answer": 0,
      "explain": "This is compile-time recursion via a non-type parameter, terminated by the explicit specialization factorial<0>. It expands to 4*3*2*1*1 = 24. Without the base-case specialization it would recurse forever and fail to instantiate; here the specialization correctly stops it."
    },
    {
      "type": "mcq",
      "tag": "typename",
      "question": "In 'std::vector<T>::size_type', when writing generic code, why is 'typename' required before it inside a template but NOT for 'std::vector<int>::size_type'?",
      "options": [
        "typename is only stylistic and never actually required",
        "Because vector<T> is a dependent type (depends on T), so the compiler cannot know size_type is a type; vector<int> is non-dependent and resolvable immediately",
        "Because size_type is private in vector<T>",
        "Because vector<int> is a specialization and specializations never need typename"
      ],
      "answer": 1,
      "explain": "When the qualifier depends on a template parameter (vector<T>), the nested name is a dependent name and defaults to being parsed as a non-type, so 'typename' is needed to declare it a type. With a concrete type like vector<int>, the compiler can look inside immediately and knows size_type is a type. It is a real requirement, not stylistic."
    },
    {
      "type": "code",
      "tag": "Overloading",
      "question": "Which overload is selected for p being an int*?",
      "code": "#include <iostream>\ntemplate <typename T> void k(T)  { std::cout << \"gen\"; }\ntemplate <typename T> void k(T*) { std::cout << \"ptr\"; }\n\nint main() {\n    int* p = nullptr;\n    k(p);\n}",
      "options": [
        "Prints gen",
        "Prints ptr",
        "Ambiguous",
        "Prints gen then ptr"
      ],
      "answer": 1,
      "explain": "Both templates match (T=int* for the first, T=int for the second), but partial ordering deems k(T*) more specialized than k(T), so the pointer overload wins and prints 'ptr'. More-specialized templates are preferred; this is how you emulate partial specialization for functions."
    },
    {
      "type": "code",
      "tag": "Deduction",
      "question": "Does this compile?",
      "code": "template <typename T>\nvoid f(T a, T b) { (void)a; (void)b; }\n\nint main() {\n    unsigned u = 1;\n    long l = 2;\n    f(u, l);\n}",
      "options": [
        "Yes; T deduces to long via promotion",
        "Yes; T deduces to unsigned",
        "No; conflicting deductions for T (unsigned vs long)",
        "Yes; T deduces to int"
      ],
      "answer": 2,
      "explain": "Deduction treats each argument independently: u gives T=unsigned, l gives T=long. These conflict and deduction does not apply promotions or conversions to reconcile them, so it fails. Casting one argument or supplying f<long>(u, l) explicitly would fix it."
    },
    {
      "type": "code",
      "tag": "Two-phase",
      "question": "What is the defect in this code?",
      "code": "template <typename T>\nstruct Base { typedef T type; };\n\ntemplate <typename T>\nstruct Derived : Base<T> {\n    type value;\n};",
      "options": [
        "Nothing; type is inherited fine",
        "Error: 'type' from dependent base is not visible; needs typename Base<T>::type",
        "Error: Base must be virtual",
        "Error: T is undefined"
      ],
      "answer": 1,
      "explain": "Names from a dependent base class are not found by unqualified lookup during phase one, and even qualified they are dependent, so you must write 'typename Base<T>::type value;'. Both the qualification (to find it) and the typename keyword (because it is a dependent type) are required. Inheritance alone does not expose it."
    },
    {
      "type": "mcq",
      "tag": "Headers",
      "question": "What is the primary purpose of an explicit instantiation definition like 'template class Stack<int>;' in a .cpp file?",
      "options": [
        "It forbids Stack from being used with any other type",
        "It forces the compiler to generate all of Stack<int>'s code in that translation unit, letting you keep the template definition out of headers for that type",
        "It makes Stack<int> run faster at runtime",
        "It is required syntax before any use of Stack<int>"
      ],
      "answer": 1,
      "explain": "Explicit instantiation pre-generates a specialization's code in one .cpp, so the template body can stay in a .cpp and clients only need a declaration (often with 'extern template' on their side). It does not restrict other types or change runtime speed; other instantiations simply must be generated elsewhere."
    },
    {
      "type": "code",
      "tag": "Deduction",
      "question": "What does this print?",
      "code": "#include <iostream>\ntemplate <typename T>\nvoid f(T x) { std::cout << \"T\"; }\n\ntemplate <typename T>\nvoid f(T* x) { std::cout << \"P\"; }\n\nint main() {\n    f(\"hello\");\n}",
      "options": [
        "Prints T",
        "Prints P",
        "Ambiguous",
        "Compilation error"
      ],
      "answer": 1,
      "explain": "A string literal \"hello\" has type const char[6], which decays to const char* when passed by value. Both f(T) and f(T*) match, but f(T*) is more specialized (T=const char), so it wins and prints 'P'. The array decays before deduction because the parameters are by-value."
    },
    {
      "type": "code",
      "tag": "Specialization",
      "question": "What prints, and why is the ordering of declarations dangerous?",
      "code": "#include <iostream>\ntemplate <typename T> void f(T) { std::cout << \"gen\"; }\n\nint main() {\n    f(5);\n}\n\ntemplate <> void f<int>(int) { std::cout << \"spec\"; }",
      "options": [
        "Prints spec",
        "Prints gen; the specialization appears after the point of use, so it is not seen (ill-formed, no diagnostic required)",
        "Compilation error: specialization after use",
        "Prints gen safely, this is well-defined"
      ],
      "answer": 1,
      "explain": "An explicit specialization must be declared before the first use that would cause an implicit instantiation; here f(5) instantiates f<int> from the primary template before the specialization is seen. This is ill-formed, no diagnostic required, and typically silently calls the generic version, a nasty ODR-style trap. Always declare specializations before any use."
    },
    {
      "type": "code",
      "tag": "Erase-Remove",
      "question": "What does this program print?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3, 2, 1};\n    std::remove(v.begin(), v.end(), 2);\n    std::cout << v.size();\n}",
      "options": [
        "3",
        "5",
        "2",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "std::remove works only through iterators; it cannot resize the container, so it shifts the kept elements forward and returns the new logical end but leaves size() unchanged at 5. The tempting answer 3 assumes remove shrinks the vector, but you must feed its return value to erase() to actually drop the tail."
    },
    {
      "type": "code",
      "tag": "Erase-Remove",
      "question": "What is the output?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{5, 6, 7, 8, 9};\n    v.erase(std::remove_if(v.begin(), v.end(),\n            [](int x){ return x % 2 != 0; }), v.end());\n    std::cout << v.size() << ' ' << v[0] << v[1];\n}",
      "options": [
        "2 68",
        "5 68",
        "2 56",
        "3 678"
      ],
      "answer": 0,
      "explain": "remove_if compacts the even numbers {6,8} to the front and returns an iterator to the new end; erase then removes the leftover tail, giving size 2 with v[0]=6, v[1]=8. This is the correct erase-remove idiom; without the erase call the size would remain 5."
    },
    {
      "type": "code",
      "tag": "Accumulate",
      "question": "What is printed?",
      "code": "#include <numeric>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<double> v{1.5, 2.5, 3.0};\n    std::cout << std::accumulate(v.begin(), v.end(), 0);\n}",
      "options": [
        "7",
        "6",
        "7.0",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "The accumulator type is deduced from the init value 0, which is an int, so every partial sum is truncated to int: 0+1.5->1, 1+2.5->3, 3+3.0->6. Passing 0.0 (a double) would correctly yield 7; this is a classic accumulate init-type trap."
    },
    {
      "type": "code",
      "tag": "Accumulate",
      "question": "What happens?",
      "code": "#include <numeric>\n#include <string>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<std::string> v{\"a\", \"b\", \"c\"};\n    std::cout << std::accumulate(v.begin(), v.end(), \"\");\n}",
      "options": [
        "Prints \"abc\"",
        "Prints an empty line",
        "Does not compile",
        "Prints \"cba\""
      ],
      "answer": 2,
      "explain": "The literal \"\" has type const char*, so T is deduced as const char* and the body computes acc = acc + *it, i.e. const char* + std::string, which yields a std::string that cannot be assigned back to a const char* accumulator — a compile error. Using std::string(\"\") as the init would correctly produce \"abc\"."
    },
    {
      "type": "code",
      "tag": "Sort-UB",
      "question": "What is the status of this program?",
      "code": "#include <algorithm>\n#include <vector>\nint main() {\n    std::vector<int> v{4, 2, 2, 7, 1};\n    std::sort(v.begin(), v.end(),\n              [](int a, int b){ return a <= b; });\n}",
      "options": [
        "Sorts ascending, well-defined",
        "Sorts descending",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 2,
      "explain": "std::sort requires the comparator to be a strict weak ordering, which must return false when a==b (irreflexivity). Using <= returns true for equal elements, violating that contract and causing undefined behavior — often an out-of-bounds read in practice. The correct comparator is <."
    },
    {
      "type": "code",
      "tag": "Iterators",
      "question": "What is the result?",
      "code": "#include <algorithm>\n#include <list>\nint main() {\n    std::list<int> l{3, 1, 2};\n    std::sort(l.begin(), l.end());\n}",
      "options": [
        "Compiles and sorts the list",
        "Does not compile",
        "Compiles but is undefined behavior",
        "Compiles but does nothing"
      ],
      "answer": 1,
      "explain": "std::sort requires RandomAccessIterators (it needs iterator arithmetic like it + n), but std::list only provides BidirectionalIterators, so the call fails to compile. The intended tool is the member function l.sort(), which is specialized for lists."
    },
    {
      "type": "code",
      "tag": "Copy",
      "question": "What is the behavior?",
      "code": "#include <algorithm>\n#include <vector>\nint main() {\n    std::vector<int> src{1, 2, 3};\n    std::vector<int> dst;\n    std::copy(src.begin(), src.end(), dst.begin());\n}",
      "options": [
        "dst becomes {1,2,3}",
        "dst stays empty",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 2,
      "explain": "std::copy writes through the output iterator but never allocates; since dst is empty, dst.begin() == dst.end() and writing there overruns the container — undefined behavior. You must either dst.resize(3) first or use std::back_inserter(dst) so each write appends."
    },
    {
      "type": "code",
      "tag": "Unique",
      "question": "What is printed?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 1, 2, 2, 1};\n    auto it = std::unique(v.begin(), v.end());\n    std::cout << (it - v.begin());\n}",
      "options": [
        "2",
        "3",
        "5",
        "1"
      ],
      "answer": 1,
      "explain": "std::unique only collapses *consecutive* equal elements, so {1,1,2,2,1} becomes the logical range {1,2,1} of length 3. It does not remove all duplicates globally — the trailing 1 survives because it is not adjacent to the earlier 1s; to fully dedup you must sort first."
    },
    {
      "type": "code",
      "tag": "Transform",
      "question": "What is the output?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3, 4};\n    std::transform(v.begin(), v.end(), v.begin(),\n                   [](int x){ return x * x; });\n    for (int x : v) std::cout << x;\n}",
      "options": [
        "Undefined behavior (aliasing)",
        "14916",
        "1234",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "std::transform with a unary op is explicitly allowed to have the output range equal the input range, so writing back into v.begin() is well-defined and produces {1,4,9,16}. In-place is safe here because each output element depends only on the single input element at the same position."
    },
    {
      "type": "code",
      "tag": "For-each",
      "question": "What is printed?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nstruct Counter { int n = 0; void operator()(int){ ++n; } };\nint main() {\n    std::vector<int> v{10, 20, 30};\n    Counter c = std::for_each(v.begin(), v.end(), Counter{});\n    std::cout << c.n;\n}",
      "options": [
        "0",
        "3",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "std::for_each returns (a moved copy of) the function object after applying it to every element, so the returned Counter has n incremented once per element: 3. A common misconception is that the functor is passed by value and its state is lost — but capturing the return value recovers the accumulated state."
    },
    {
      "type": "code",
      "tag": "Count-if",
      "question": "What is the output?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{-2, 0, 3, -1, 5, 0};\n    std::cout << std::count_if(v.begin(), v.end(),\n                 [](int x){ return x > 0; });\n}",
      "options": [
        "2",
        "3",
        "4",
        "6"
      ],
      "answer": 0,
      "explain": "count_if returns how many elements satisfy the predicate x > 0; only 3 and 5 qualify, so the answer is 2. The zeros and negatives are excluded — a distractor answer of 3 wrongly counts a zero as positive."
    },
    {
      "type": "code",
      "tag": "Find",
      "question": "What does this print?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    auto it = std::find(v.begin(), v.end(), 9);\n    std::cout << *it;\n}",
      "options": [
        "9",
        "0",
        "Undefined behavior",
        "Nothing (empty)"
      ],
      "answer": 2,
      "explain": "When the value is absent, std::find returns the end iterator; dereferencing end() is undefined behavior. The correct pattern is to compare the result against v.end() before dereferencing it."
    },
    {
      "type": "code",
      "tag": "Accumulate",
      "question": "What is the output?",
      "code": "#include <numeric>\n#include <functional>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    std::cout << std::accumulate(v.begin(), v.end(), 10,\n                                 std::minus<int>());\n}",
      "options": [
        "4",
        "-6",
        "16",
        "14"
      ],
      "answer": 0,
      "explain": "accumulate is a left fold applying op(acc, *it): 10-1=9, 9-2=7, 7-3=4. It is not symmetric — the accumulator is always the left operand, so the answer is 4, not init minus the plain sum's negation."
    },
    {
      "type": "mcq",
      "tag": "Stability",
      "question": "You sort a vector of records by age using std::sort. Two records with equal age appear in input order A then B. After the sort, what is guaranteed about their relative order?",
      "options": [
        "A still precedes B",
        "B precedes A",
        "Their relative order is not guaranteed",
        "It is undefined behavior"
      ],
      "answer": 2,
      "explain": "std::sort is not stable, so equal elements may be reordered relative to each other; nothing is guaranteed. If you need equal keys to retain their original order, use std::stable_sort."
    },
    {
      "type": "code",
      "tag": "Remove-tail",
      "question": "What is printed (v is untouched except by remove)?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3, 4};\n    auto e = std::remove(v.begin(), v.end(), 2);\n    std::cout << *(v.end() - 1);\n}",
      "options": [
        "4",
        "3",
        "Guaranteed a specific value is impossible to state",
        "1"
      ],
      "answer": 2,
      "explain": "After remove, the elements from the returned iterator e to the old end have valid but unspecified values (they were moved from), so the last element's value is not portably predictable. Relying on any particular leftover value in the removed tail is a bug — you should only use the range [begin, e)."
    },
    {
      "type": "mcq",
      "tag": "Iterators",
      "question": "Which algorithm imposes the WEAKEST iterator category requirement on its main input range?",
      "options": [
        "std::sort (random access)",
        "std::reverse (bidirectional)",
        "std::find (input)",
        "std::rotate (forward)"
      ],
      "answer": 2,
      "explain": "std::find only reads each element once moving forward, so it needs merely an InputIterator — the weakest of the listed categories. sort needs random access, reverse needs bidirectional, and rotate needs forward, all strictly stronger requirements."
    },
    {
      "type": "code",
      "tag": "Transform2",
      "question": "What is the output?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> a{1, 2, 3};\n    std::vector<int> b{10, 20, 30};\n    std::vector<int> out(3);\n    std::transform(a.begin(), a.end(), b.begin(),\n                   out.begin(), std::plus<int>());\n    for (int x : out) std::cout << x << ' ';\n}",
      "options": [
        "11 22 33 ",
        "10 20 30 ",
        "1 2 3 ",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "The binary form of std::transform reads element i from both a and b and writes op(a[i], b[i]) to out, giving {11,22,33}. Note the second range only needs a begin iterator — the algorithm assumes it is at least as long as the first range."
    },
    {
      "type": "mcq",
      "tag": "Binary-search",
      "question": "You call std::binary_search on a vector that happens to be UNsorted. What is the outcome?",
      "options": [
        "It always returns false",
        "It falls back to a linear scan",
        "Behavior is undefined / unspecified",
        "It throws std::logic_error"
      ],
      "answer": 2,
      "explain": "binary_search (like lower_bound, upper_bound, and equal_range) requires the range to be sorted with respect to the comparator; on unsorted data the precondition is violated and the result is unspecified/undefined. It never silently falls back to a linear search, and it does not throw."
    },
    {
      "type": "code",
      "tag": "Lambda-capture",
      "question": "What is printed?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3, 4, 5};\n    int sum = 0;\n    std::for_each(v.begin(), v.end(),\n                  [sum](int x) mutable { sum += x; });\n    std::cout << sum;\n}",
      "options": [
        "15",
        "0",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "sum is captured by value; mutable only lets the lambda modify its own private copy, so the outer sum is never touched and remains 0. To accumulate into the real variable you must capture by reference ([&sum]) — capturing by value plus mutable is a classic silent-no-op trap."
    },
    {
      "type": "mcq",
      "tag": "Semantics",
      "question": "Which statement best explains why std::remove cannot actually delete elements from a std::vector?",
      "options": [
        "Because remove is const-correct and vectors are immutable",
        "Because algorithms operate on iterators and have no access to the container's resizing operations",
        "Because remove only works on std::list",
        "Because remove requires a sorted range"
      ],
      "answer": 1,
      "explain": "Standard algorithms are decoupled from containers: they receive only iterators, which can read and overwrite elements but cannot change the container's size. That is why remove merely shifts kept elements and returns a new end, leaving true deletion to the container's own erase member."
    },
    {
      "type": "code",
      "tag": "Min-element",
      "question": "What is the output?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{4, 2, 8, 2, 1, 1};\n    auto it = std::min_element(v.begin(), v.end());\n    std::cout << *it << ' ' << (it - v.begin());\n}",
      "options": [
        "1 4",
        "1 5",
        "2 1",
        "1 0"
      ],
      "answer": 0,
      "explain": "min_element returns an iterator to the FIRST occurrence of the smallest element; the minimum is 1, first appearing at index 4, so it prints '1 4'. A distractor picks index 5 (the second 1), but the algorithm guarantees the earliest minimum."
    },
    {
      "type": "code",
      "tag": "Sort-partial",
      "question": "What does this print?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{5, 3, 8, 1, 9, 2};\n    std::partial_sort(v.begin(), v.begin() + 3, v.end());\n    std::cout << v[0] << v[1] << v[2];\n}",
      "options": [
        "123",
        "135",
        "358",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "partial_sort places the 3 smallest elements, in sorted order, into the first 3 positions; the three smallest of the set are 1,2,3, so it prints 123. The remaining elements after the middle iterator are left in an unspecified order."
    },
    {
      "type": "code",
      "tag": "Fill-n",
      "question": "What is the behavior?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v;\n    std::fill_n(v.begin(), 3, 7);\n    std::cout << v.size();\n}",
      "options": [
        "Prints 3",
        "Prints 0",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 2,
      "explain": "fill_n writes 3 elements starting at v.begin(), but v is empty so it immediately writes past the end — undefined behavior, exactly like the copy-into-empty trap. You need std::fill_n(std::back_inserter(v), 3, 7) or a pre-sized vector."
    },
    {
      "type": "mcq",
      "tag": "Predicate",
      "question": "std::sort calls your comparator many times during a single sort. What must the comparator NOT do to stay well-defined?",
      "options": [
        "Compare the two arguments with <",
        "Return a bool",
        "Depend on mutable external state so that comp(a,b) can change between calls",
        "Take its arguments by const reference"
      ],
      "answer": 2,
      "explain": "The comparator must induce a consistent strict weak ordering for the whole sort; if it returns different results for the same pair across calls (e.g. reads a changing counter or random source), the ordering is inconsistent and behavior is undefined. Returning bool, using <, and taking const& arguments are all perfectly fine."
    },
    {
      "type": "code",
      "tag": "Count",
      "question": "What is printed?",
      "code": "#include <algorithm>\n#include <string>\n#include <iostream>\nint main() {\n    std::string s = \"mississippi\";\n    std::cout << std::count(s.begin(), s.end(), 's');\n}",
      "options": [
        "4",
        "2",
        "11",
        "3"
      ],
      "answer": 0,
      "explain": "std::count returns the number of elements equal to the given value; 's' appears 4 times in \"mississippi\". Use count for equality against a value and count_if when you need a predicate."
    },
    {
      "type": "code",
      "tag": "All-of",
      "question": "What does this print for the empty vector?",
      "code": "#include <algorithm>\n#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v;\n    bool a = std::all_of(v.begin(), v.end(),\n                         [](int x){ return x > 100; });\n    std::cout << a;\n}",
      "options": [
        "1",
        "0",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 0,
      "explain": "all_of over an empty range is vacuously true and returns true (prints 1), because there is no element that fails the predicate. Correspondingly any_of on an empty range is false and none_of is true — an easy edge case to get wrong."
    }
  ]
};

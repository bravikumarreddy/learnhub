/* ===== C++ Templates — Function & Class Templates ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["templ-basics"] = {
  title: "C++ Templates — Function & Class Templates",
  subtitle: "Function/class template basics, lazy instantiation, member templates, the inclusion model and default template arguments.",
  crumb: "C++ Templates",
  questions: [
    {
      "type": "mcq",
      "tag": "Deduction Basics",
      "question": "For `template<class T> void f(T a, T b);`, which call is ill-formed because template argument deduction fails?",
      "options": ["f(1, 2)","f(1, 2u)","f(1.0, 2.0)","f('a', 'b')"],
      "answer": 1,
      "explain": "A single parameter T is deduced from two arguments; `1` (int) and `2u` (unsigned) yield conflicting deductions for T, so deduction fails. No implicit conversion is applied to make them agree during deduction."
    },
    {
      "type": "mcq",
      "tag": "Explicit Args",
      "question": "Given `template<class T> void f(T);`, what does the explicit call `f<double>(1)` do with the argument `1`?",
      "options": ["Fails: 1 is int, not double","Deduces T=int and ignores the <double>","Sets T=double, then converts int 1 to double","Is ambiguous"],
      "answer": 2,
      "explain": "When T is given explicitly, no deduction occurs for it; the argument is simply converted to the parameter type. So `1` is converted to `1.0`. Explicit args disable deduction for that parameter."
    },
    {
      "type": "code",
      "tag": "Lazy Instantiation",
      "question": "Does this compile?",
      "code": "template<class T>\nstruct S {\n  void ok() { }\n  void bad() { T x; x.nonexistent(); }\n};\nint main() {\n  S<int> s;\n  s.ok();\n}",
      "options": ["No: bad() references int.nonexistent()","Yes: bad() is never instantiated","No: S<int> can't be formed","Only with -fpermissive"],
      "answer": 1,
      "explain": "Member functions of a class template are instantiated only when used (lazy instantiation). Since bad() is never called, its body is never instantiated and its invalid code is never checked."
    },
    {
      "type": "mcq",
      "tag": "Inclusion Model",
      "question": "Why do template definitions typically live entirely in header files rather than being split into .cpp?",
      "options": ["Templates cannot be compiled to object code at all","The compiler needs the full definition visible at each instantiation point","Headers compile faster than source files","The linker forbids template symbols in objects"],
      "answer": 1,
      "explain": "To instantiate a template for a given argument, the compiler must see its complete definition in that translation unit. Placing definitions in headers makes them visible wherever they are used — this is the inclusion model."
    },
    {
      "type": "code",
      "tag": "Copy Ctor Gotcha",
      "question": "Which constructor is called for `B b2 = b1;` where b1 is a B?",
      "code": "struct B {\n  B() {}\n  B(const B&) { }\n  template<class T>\n  B(const T&) { }\n};\nB b1;\nB b2 = b1;",
      "options": ["The templated constructor (T=B)","The copy constructor","Ambiguous — compile error","No constructor matches"],
      "answer": 1,
      "explain": "A templated constructor is never a copy constructor. For copying a B from a B, the non-template copy constructor is preferred over the template specialization, so the copy constructor wins."
    },
    {
      "type": "mcq",
      "tag": "Template Params",
      "question": "In `template<class T> class Stack { ... };`, and later `Stack<int> s;`, which statement is correct?",
      "options": ["T is a template argument; int is a template parameter","T is a template parameter; int is a template argument","Both T and int are parameters","Both T and int are arguments"],
      "answer": 1,
      "explain": "Parameters appear in the template declaration (T); arguments are supplied at instantiation (int). The parameter T is substituted with the argument int."
    },
    {
      "type": "code",
      "tag": "auto Return",
      "question": "What is the deduced return type of f(5)?",
      "code": "template<class T>\nauto f(T x) { return x + x; }\n// call: f(5)",
      "options": ["T (i.e. int)","int&","auto","double"],
      "answer": 0,
      "explain": "With plain `auto` return type, deduction uses the rules for `auto`, which drop references and cv-qualifiers. `x + x` for int is a prvalue int, so the return type is int."
    },
    {
      "type": "mcq",
      "tag": "decltype(auto)",
      "question": "How does `decltype(auto)` as a function return type differ from plain `auto`?",
      "options": ["decltype(auto) always adds const","decltype(auto) preserves references and cv-qualifiers of the return expression","They are exactly identical","decltype(auto) forbids references"],
      "answer": 1,
      "explain": "Plain `auto` decays (strips references/cv), while `decltype(auto)` deduces exactly as `decltype` of the return expression, preserving references and value categories. This lets a wrapper forward an lvalue reference unchanged."
    },
    {
      "type": "mcq",
      "tag": "Nontype Params",
      "question": "Which is a valid nontype template parameter declaration (pre-C++20)?",
      "options": ["template<double D>","template<std::string S>","template<int N>","template<float F>"],
      "answer": 2,
      "explain": "Nontype parameters were restricted to integral/enum types, pointers, references, etc. `int N` is classic and valid. Floating-point and class-type nontype parameters were not allowed until C++20."
    },
    {
      "type": "code",
      "tag": "Overload vs Template",
      "question": "Which function is called by max(1, 2)?",
      "code": "int max(int a, int b) { return a>b?a:b; }\ntemplate<class T>\nT max(T a, T b) { return a>b?a:b; }\n// call: max(1, 2)",
      "options": ["The template with T=int","The non-template int overload","Ambiguous","Neither compiles"],
      "answer": 1,
      "explain": "When a non-template and a template are equally good matches, the non-template is preferred. max(1,2) exactly matches the int overload without instantiation, so it is chosen."
    },
    {
      "type": "mcq",
      "tag": "Default Args",
      "question": "Which is true about default template arguments for a function template like `template<class T = int> void f();`?",
      "options": ["They were never allowed for function templates","They are allowed and let you write f<>()","They require C++20","They can only appear on the last parameter of a class template, never a function"],
      "answer": 1,
      "explain": "Default template arguments for function templates are allowed since C++11. `f<>()` uses the default T=int. (Older C++03 forbade them on function templates, which is a common outdated belief.)"
    },
    {
      "type": "code",
      "tag": "Member Template",
      "question": "Does this assignment compile?",
      "code": "template<class T>\nstruct Wrap {\n  T v;\n  template<class U>\n  Wrap& operator=(const Wrap<U>& o) { v = o.v; return *this; }\n};\nWrap<long> a; Wrap<int> b;\n// a = b;",
      "options": ["Yes: member template converts Wrap<int> to Wrap<long>","No: types differ","No: member templates can't be operators","Only if U==T"],
      "answer": 0,
      "explain": "A member template `operator=` accepts a different instantiation Wrap<U>. Assigning int's v to long's v is a valid implicit conversion, so a=b compiles with U=int."
    },
    {
      "type": "mcq",
      "tag": "Member Template",
      "question": "A member template assignment operator `template<class U> Wrap& operator=(const Wrap<U>&)` — does it suppress the implicitly-declared copy assignment operator?",
      "options": ["Yes, the compiler stops generating the copy assignment","No, the copy assignment is still implicitly declared","Only if U is constrained","It makes the class non-copyable"],
      "answer": 1,
      "explain": "A member template is never treated as the copy assignment operator, so the implicit copy assignment is still generated. For same-type assignment, that implicit one is used, not the template."
    },
    {
      "type": "code",
      "tag": "Two-Phase",
      "question": "What is needed to make this compile?",
      "code": "template<class T>\nstruct D : T {\n  void g() { f(); }   // f is a member of base T\n};",
      "options": ["Nothing, it compiles","Write this->f() or T::f()","Add typename before f()","Add template before f()"],
      "answer": 1,
      "explain": "In a template, unqualified names are not looked up in dependent base classes during the first phase. You must qualify with `this->f()` or `T::f()` so the name is found in the dependent base."
    },
    {
      "type": "mcq",
      "tag": "typename",
      "question": "In `template<class T> void f() { typename T::iterator it; }`, why is `typename` required?",
      "options": ["To make it a nontype parameter","To tell the compiler T::iterator is a type, not a value","To default-construct it","It is optional stylistic sugar"],
      "answer": 1,
      "explain": "T::iterator is a dependent name; by default the compiler assumes a dependent qualified name is a value. `typename` disambiguates it as a type so the declaration parses correctly."
    },
    {
      "type": "code",
      "tag": "CTAD",
      "question": "With C++17 class template argument deduction, what is the type of p?",
      "code": "template<class T>\nstruct Pair { T a, b; Pair(T x, T y):a(x),b(y){} };\nPair p(1, 2);",
      "options": ["Pair<int>","Pair (incomplete)","Compile error: need Pair<int>","Pair<double>"],
      "answer": 0,
      "explain": "CTAD (C++17) deduces class template arguments from constructor arguments. Both args are int, so T=int and p is Pair<int>. Before C++17 you had to write Pair<int> explicitly."
    },
    {
      "type": "mcq",
      "tag": "friend",
      "question": "Inside `template<class T> class C`, declaring `friend void h(C<T>);` — what does it grant friendship to?",
      "options": ["All instantiations of h","The specific non-template function h(C<T>) for each T","A template h","Nothing; it's a syntax error"],
      "answer": 1,
      "explain": "This declares a distinct ordinary friend function h taking C<T> for each instantiation of C. It is not a template; each instantiation of C befriends its own matching h."
    },
    {
      "type": "code",
      "tag": "ODR",
      "question": "Two .cpp files both include the header defining `template<class T> void f(){}` and both call f<int>(). At link time?",
      "code": "// header.h\ntemplate<class T> void f() {}\n// a.cpp and b.cpp both: #include \"header.h\"; f<int>();",
      "options": ["Multiple-definition linker error","Links fine; duplicate instantiations are merged","Undefined reference to f<int>","Only the first TU gets f<int>"],
      "answer": 1,
      "explain": "Template instantiations have implicit external linkage but are exempt from the one-definition-rule conflict: identical instantiations across TUs are merged by the linker (COMDAT folding). No multiple-definition error occurs."
    },
    {
      "type": "mcq",
      "tag": "Deduction Basics",
      "question": "For `template<class T> void f(T& x);`, calling f with a string literal \"hi\" deduces T as?",
      "options": ["const char*","char[3] (i.e. const char(&)[3])","std::string","char"],
      "answer": 1,
      "explain": "For a reference parameter T&, the array does not decay to a pointer. \"hi\" has type const char[3], so T is deduced as const char[3] and x is const char(&)[3]."
    },
    {
      "type": "mcq",
      "tag": "Deduction Basics",
      "question": "For `template<class T> void f(T x);` (by value), calling f(\"hi\") deduces T as?",
      "options": ["const char[3]","const char*","std::string","char"],
      "answer": 1,
      "explain": "For a by-value parameter, array-to-pointer decay applies during deduction. So \"hi\" (const char[3]) decays and T is deduced as const char*."
    },
    {
      "type": "code",
      "tag": "Templates of Templates",
      "question": "What must the template template parameter look like to accept Stack below?",
      "code": "template<class T> class Stack { /*...*/ };\n\ntemplate<template<class> class Cont>\nstruct User { Cont<int> c; };\n// User<Stack> u;",
      "options": ["It is wrong: use template<class> class","User<Stack> works as written","Needs template<class,class>","Template template params don't exist"],
      "answer": 1,
      "explain": "The template template parameter `template<class> class Cont` matches Stack, which has one type parameter. User<Stack> forms Cont<int> = Stack<int>. This is a template template argument."
    },
    {
      "type": "mcq",
      "tag": "Explicit Instantiation",
      "question": "What does `template class std::vector<int>;` (at namespace scope) do?",
      "options": ["Declares a specialization","Explicit instantiation definition of vector<int> and all its members","Is a syntax error","Forward-declares vector"],
      "answer": 1,
      "explain": "This is an explicit instantiation definition: it forces instantiation of the class and all its member functions in this TU, which can reduce compile times elsewhere and enable placing template code in a .cpp."
    },
    {
      "type": "code",
      "tag": "Lazy Instantiation",
      "question": "Does S<int> itself (without calling methods) compile here?",
      "code": "template<class T>\nstruct S {\n  void f() { T::static_thing(); }\n};\nint main() { S<int> s; (void)s; }",
      "options": ["No: int::static_thing() is invalid","Yes: f() is not instantiated","No: S<int> object can't exist","Undefined behavior at runtime"],
      "answer": 1,
      "explain": "Merely instantiating the class does not instantiate its member function bodies. f() is never called, so its invalid `int::static_thing()` is never checked. Lazy instantiation saves it."
    },
    {
      "type": "mcq",
      "tag": "Explicit Args",
      "question": "Given `template<class RT, class T> RT convert(T x);`, how must you call it to get RT=long from an int argument?",
      "options": ["convert(x) — deduced automatically","convert<long>(x)","convert<long,int>(x) only","It cannot be called"],
      "answer": 1,
      "explain": "RT cannot be deduced (it appears only in the return type), so it must be given explicitly. `convert<long>(x)` supplies RT=long; T is then deduced from x. Trailing deducible args can be omitted."
    },
    {
      "type": "code",
      "tag": "Overload Resolution",
      "question": "Which overload does print(3.14) select?",
      "code": "template<class T> void print(T) { /* generic */ }\ntemplate<> void print(int) { /* int spec */ }\nvoid print(double) { /* plain */ }\n// call: print(3.14)",
      "options": ["The generic template T=double","The int explicit specialization","The plain print(double) function","Ambiguous"],
      "answer": 2,
      "explain": "The non-template print(double) is an exact match and is preferred over the function template. Explicit specializations do not participate in overload resolution independently — the primary template is what competes, and the non-template wins."
    },
    {
      "type": "mcq",
      "tag": "Default Args",
      "question": "In a class template `template<class T, class Cont = std::vector<T>> class Stack;`, what is notable about the default?",
      "options": ["It's illegal to reference T in the default","A later default parameter may use earlier parameters","Cont must come before T","Defaults are disallowed on class templates"],
      "answer": 1,
      "explain": "A default template argument may refer to previously declared template parameters, so Cont can default to std::vector<T>. `Stack<int>` then uses std::vector<int>."
    },
    {
      "type": "code",
      "tag": "Ref Collapsing",
      "question": "For a forwarding reference, what is T deduced as when calling g with an lvalue int?",
      "code": "template<class T>\nvoid g(T&& x);\nint i = 0;\n// call: g(i)",
      "options": ["int","int&","int&&","const int&"],
      "answer": 1,
      "explain": "For a forwarding reference T&&, when the argument is an lvalue of type int, T is deduced as int& (reference collapsing then gives int& && = int&). An rvalue would deduce T=int."
    },
    {
      "type": "mcq",
      "tag": "Two-Phase",
      "question": "Two-phase lookup checks a template's non-dependent names at:",
      "options": ["Only at instantiation","Definition time (phase 1)","Link time","Never; all names are dependent"],
      "answer": 1,
      "explain": "Non-dependent names and syntax are checked when the template is defined (phase 1). Dependent names are looked up and checked at instantiation (phase 2). This is why some errors surface before any instantiation."
    },
    {
      "type": "code",
      "tag": "Member Template",
      "question": "What syntax is needed at the marked line to call the member template?",
      "code": "struct Holder {\n  template<class U> void set() {}\n};\ntemplate<class T>\nvoid f(T& obj) {\n  obj.set<int>();   // T is a template param\n}",
      "options": ["It's fine as written","obj.template set<int>();","obj.set<int>;","typename obj.set<int>();"],
      "answer": 1,
      "explain": "When calling a member template through a dependent object, you must use the `.template` disambiguator: `obj.template set<int>()`, otherwise `<` is parsed as less-than."
    },
    {
      "type": "mcq",
      "tag": "Instantiation",
      "question": "What is the point of instantiation for a template used inside another function — roughly where does the compiler consider it instantiated?",
      "options": ["At the start of the TU","At a point immediately after the enclosing definition (namespace scope)","At the exact call line only","At link time"],
      "answer": 1,
      "explain": "The point of instantiation for a specialization used in a function is placed at namespace scope immediately after the using definition. This affects which declarations are visible to the instantiation (relevant for ADL and ordering)."
    },
    {
      "type": "code",
      "tag": "auto Return",
      "question": "Does this compile, and if so what's the return type?",
      "code": "template<class T>\nauto id(T&& x) -> decltype(x) { return x; }\nint i = 5;\n// auto&& r = id(i);",
      "options": ["Return type int; copies","Return type int&&... trailing decltype(x) gives int& for lvalue","Compile error","Returns void"],
      "answer": 1,
      "explain": "With a forwarding reference and lvalue argument, x is an lvalue of type int, and `decltype(x)` on the named entity gives int&, so the trailing return type is int&. The function returns a reference to i."
    },
    {
      "type": "mcq",
      "tag": "friend",
      "question": "To befriend a specific function template from within a class template, you typically must:",
      "options": ["Just write friend void f();","Forward-declare the template and use friend void f<>(...) or a template friend declaration","Friendship of templates is impossible","Use friend class only"],
      "answer": 1,
      "explain": "Befriending a template requires the template to be declared and referenced as a template, e.g. `friend void f<>(C&)` or a full `template<class U> friend ...`. A plain friend declaration would name a different, non-template function."
    },
    {
      "type": "code",
      "tag": "Nontype Params",
      "question": "What prints?",
      "code": "template<int N>\nint sq() { return N*N; }\n#include <iostream>\nint main(){ std::cout << sq<5>(); }",
      "options": ["10","25","5","compile error"],
      "answer": 1,
      "explain": "N is a nontype template parameter bound to 5 at compile time; sq<5>() returns 5*5 = 25. N is a compile-time constant, not a runtime argument."
    },
    {
      "type": "mcq",
      "tag": "Nontype Params",
      "question": "Which cannot be used as a template argument for `template<int* P> struct S;`?",
      "options": ["Address of a static-storage-duration variable","&some_global","Address of a local automatic variable","nullptr (as a constant)"],
      "answer": 2,
      "explain": "A pointer nontype template argument must denote an object with static storage duration (a constant address known at compile/link time). The address of a local automatic variable is not a constant expression usable here."
    },
    {
      "type": "code",
      "tag": "Copy Ctor Gotcha",
      "question": "Why might this fail to copy correctly / behave surprisingly?",
      "code": "struct A {\n  A() {}\n  template<class T> A(T&&) { /* greedy */ }\n};\nconst A ca;\nA a2 = ca;   // copy a const A",
      "options": ["The template constructor is chosen over the copy ctor","The copy constructor is chosen","It fails to compile always","It calls the default constructor"],
      "answer": 1,
      "explain": "Copying a const A: the copy constructor takes const A& (exact match), while the forwarding template would deduce T=const A& (also A&). The non-template copy constructor is preferred, so it is used. (Had ca been non-const, the greedy template could win — the classic trap.)"
    },
    {
      "type": "mcq",
      "tag": "Inclusion Model",
      "question": "If you define template member functions in a .cpp separate from the header (no explicit instantiation), what typically happens?",
      "options": ["Faster builds, no downside","Undefined-reference linker errors when instantiated elsewhere","A compile error in the .cpp","The template is instantiated for all types"],
      "answer": 1,
      "explain": "Without the definition visible at the instantiation point (or an explicit instantiation in the .cpp), other TUs cannot instantiate the template and you get undefined-reference errors at link time."
    },
    {
      "type": "code",
      "tag": "Templates of Templates",
      "question": "Why does this fail to match with a standard container?",
      "code": "template<template<class> class C>\nstruct X {};\n// X<std::vector> v;   (C++11/14)",
      "options": ["vector has more than one template parameter (allocator)","vector is not a template","X is ill-formed","std::vector needs a value"],
      "answer": 0,
      "explain": "std::vector is `template<class T, class Alloc=...>` — two parameters. A `template<class>` template template parameter historically required an exact arity match, so it wouldn't bind (variadic template template params or C++17 relaxed default-arg matching fix this)."
    },
    {
      "type": "mcq",
      "tag": "Instantiation",
      "question": "The difference between implicit and explicit instantiation is:",
      "options": ["Implicit is done by the user via keyword; explicit by the compiler","Implicit happens automatically on use; explicit is requested with `template ...;`","They are synonyms","Explicit instantiation only works for functions"],
      "answer": 1,
      "explain": "Implicit instantiation is triggered automatically when a specialization is needed by use. Explicit instantiation is an explicit directive (`template class C<int>;`) that forces instantiation regardless of use."
    },
    {
      "type": "code",
      "tag": "Overload vs Template",
      "question": "Which is called by f(1, 2.0)?",
      "code": "template<class T> void f(T, T) {}      // (1)\ntemplate<class A,class B> void f(A,B){} // (2)\n// call: f(1, 2.0)",
      "options": ["(1) after converting","(2), because (1) can't deduce a single T","Ambiguous","Neither"],
      "answer": 1,
      "explain": "For (1), deducing one T from int and double conflicts, so (1) is removed from the candidate set. (2) deduces A=int, B=double and is viable, so (2) is selected."
    },
    {
      "type": "mcq",
      "tag": "Deduction Basics",
      "question": "During deduction for `template<class T> void f(const T& x);`, calling f with an `int` lvalue deduces T as?",
      "options": ["const int","int","int&","const int&"],
      "answer": 1,
      "explain": "The const in the parameter is part of the parameter, not deduced into T. For const T&, T is deduced as int (top-level const of the argument is ignored). x is then const int&."
    },
    {
      "type": "code",
      "tag": "Class Template",
      "question": "Is this valid? Passing a class-template name without arguments:",
      "code": "template<class T> struct Vec {};\nVec v;   // C++14",
      "options": ["Valid: T defaults","Invalid in C++14: Vec is not a type without arguments","Valid always","Valid only in headers"],
      "answer": 1,
      "explain": "In C++14 a class template name alone is not a type; you must write Vec<int> (or provide args). Only C++17 CTAD lets `Vec v` deduce from an initializer — and here there is no initializer, so it's ill-formed."
    },
    {
      "type": "mcq",
      "tag": "Member Class Template",
      "question": "A nested class template inside a class template, e.g. `template<class T> struct Outer { template<class U> struct Inner{}; };` — Inner is:",
      "options": ["A specialization of Outer","A member class template, instantiated per (T,U)","Illegal nesting","A friend"],
      "answer": 1,
      "explain": "Inner is a member class template. Each Outer<T>::Inner<U> is its own type. Member class templates are fully supported and commonly used (e.g. allocator rebind)."
    },
    {
      "type": "code",
      "tag": "Deduction Basics",
      "question": "What is T deduced as?",
      "code": "template<class T> void f(T) {}\nint arr[10];\n// call: f(arr)",
      "options": ["int[10]","int*","int(&)[10]","compile error"],
      "answer": 1,
      "explain": "By-value parameter causes array-to-pointer decay during deduction, so T is int*. To capture the array type or size you'd need a reference parameter like T(&)[N]."
    },
    {
      "type": "code",
      "tag": "Nontype Deduction",
      "question": "What is N deduced as?",
      "code": "template<class T, int N>\nint size(T(&)[N]) { return N; }\nint a[7];\n// call: size(a)",
      "options": ["7","0","1","compile error: N not given"],
      "answer": 0,
      "explain": "With a reference-to-array parameter T(&)[N], both T (=int) and the nontype N (=7) are deduced from the array. size(a) returns 7. This is the classic compile-time array-size idiom."
    },
    {
      "type": "mcq",
      "tag": "Specialization",
      "question": "A full explicit specialization `template<> class C<int> { ... };` must appear:",
      "options": ["Before any use of C<int> that would implicitly instantiate it","Only after C<int> is used","In a .cpp only","Anywhere; order never matters"],
      "answer": 0,
      "explain": "An explicit specialization must be declared before the first use that would otherwise cause an implicit instantiation, otherwise the program is ill-formed (no diagnostic required). Order matters here."
    },
    {
      "type": "mcq",
      "tag": "Template Params",
      "question": "Which is NOT a legal kind of template parameter?",
      "options": ["Type parameter (class/typename)","Nontype parameter (e.g. int)","Template template parameter","Function parameter (a runtime value like `void f(int x)` as template param)"],
      "answer": 3,
      "explain": "The three kinds of template parameters are type, nontype (compile-time value), and template template parameters. A runtime function-style parameter is not a template parameter kind."
    },
    {
      "type": "code",
      "tag": "Overload Resolution",
      "question": "Which f is called for f(&x) where x is int?",
      "code": "template<class T> void f(T)  {}   // (1)\ntemplate<class T> void f(T*) {}   // (2)\nint x;\n// call: f(&x)",
      "options": ["(1) with T=int*","(2) with T=int","Ambiguous","Compile error"],
      "answer": 1,
      "explain": "Both are viable, but (2) f(T*) is more specialized than (1) f(T). Partial ordering of function templates prefers the more specialized (2), deducing T=int."
    },
    {
      "type": "mcq",
      "tag": "Inclusion Model",
      "question": "The keyword `export` for templates (C++98/03 era) was intended to allow separate compilation. Its status is:",
      "options": ["Widely supported and recommended","Removed/never practically supported; deprecated then repurposed","Mandatory for all templates","Equivalent to inline"],
      "answer": 1,
      "explain": "`export` templates were almost never implemented (only one front-end), removed in C++11, and the keyword was later repurposed for modules. The inclusion model remains the practical approach."
    },
    {
      "type": "code",
      "tag": "Dependent Name",
      "question": "What is wrong here?",
      "code": "template<class T>\nvoid f() {\n  T::type * p;\n}",
      "options": ["Nothing","Without typename, T::type*p is parsed as a multiplication, not a pointer declaration","p must be initialized","T must be a pointer"],
      "answer": 1,
      "explain": "T::type is a dependent name assumed to be a value, so `T::type * p` parses as multiply. Write `typename T::type* p;` to declare a pointer. This is the canonical typename gotcha."
    },
    {
      "type": "mcq",
      "tag": "Default Args",
      "question": "For class templates, default template arguments must obey which rule about position?",
      "options": ["Any parameter may have a default in any order","Once a parameter has a default, all following parameters must also have defaults","Only the first may have a default","Defaults must be leftmost"],
      "answer": 1,
      "explain": "Like default function arguments, once a template parameter is given a default, every parameter to its right must also have a default (for class templates). Function templates are more flexible because of deduction."
    },
    {
      "type": "mcq",
      "tag": "Instantiation",
      "question": "When a class template is implicitly instantiated, which members are instantiated?",
      "options": ["All members immediately","Only the declarations needed; member function bodies only when used","None until explicitly requested","Only static members"],
      "answer": 1,
      "explain": "Implicit instantiation of a class template instantiates the class definition and member declarations, but member function definitions (bodies), and static data members, are instantiated only when actually used."
    },
    {
      "type": "mcq",
      "tag": "Member Template",
      "question": "Can a member template be virtual?",
      "options": ["Yes, always","No — member function templates cannot be virtual","Only in abstract classes","Only if the class template is final"],
      "answer": 1,
      "explain": "A member function template cannot be virtual, because the set of instantiations is unbounded and the vtable would need an unknown number of slots. The compiler rejects `virtual template<...>` members."
    },
    {
      "type": "mcq",
      "tag": "Overload vs Template",
      "question": "You have a non-template f(int) and template f(T). Calling f(1L) (a long). What happens?",
      "options": ["Non-template chosen (needs conversion long->int) over exact template match","Template chosen: f(T=long) is an exact match, no conversion","Ambiguous","Non-template always wins regardless"],
      "answer": 1,
      "explain": "The template f(long) is an exact match; the non-template f(int) needs a long->int conversion. A better-matching template beats a worse-matching non-template; the non-template preference only breaks ties among equally good matches."
    },
    {
      "type": "mcq",
      "tag": "Nontype Params",
      "question": "Two instantiations `Array<int,10>` and `Array<int,20>` for `template<class T,int N> struct Array;` are:",
      "options": ["The same type","Different, unrelated types","Implicitly convertible","Base and derived"],
      "answer": 1,
      "explain": "Different nontype arguments produce distinct types. Array<int,10> and Array<int,20> are unrelated with no implicit conversion, just as different type arguments would be."
    },
    {
      "type": "mcq",
      "tag": "friend",
      "question": "A friend function DEFINED inside a class template (`friend void f(C& c){...}`) has what special property?",
      "options": ["It is a template","It is a non-template found only by ADL (argument-dependent lookup)","It is public and callable by name anywhere","It is virtual"],
      "answer": 1,
      "explain": "An inline friend defined in the class is a non-template ordinary function injected into the enclosing namespace but findable only via ADL on its arguments. This is the hidden-friend idiom used to generate per-instantiation operators."
    },
    {
      "type": "mcq",
      "tag": "Deduction Basics",
      "question": "The parameter type `std::vector<T>::value_type` in `template<class T> void f(typename std::vector<T>::value_type);` is a:",
      "options": ["Deduced context; T is found","Non-deduced context; T cannot be deduced from the argument","Syntax error","Deduced only for pointers"],
      "answer": 1,
      "explain": "A qualified name before :: (nested-name-specifier) is a non-deduced context; the compiler cannot invert it to find T. T must be supplied explicitly or deduced from another parameter."
    },
    {
      "type": "mcq",
      "tag": "Inclusion Model",
      "question": "Marking a template function `inline` vs. relying on template linkage — for an ordinary (non-member) function template, is `inline` needed to avoid ODR violations across TUs?",
      "options": ["Yes, always add inline","No — function templates already have the needed vague/linkonce linkage; inline is redundant for that purpose","inline makes them non-instantiable","inline is illegal on templates"],
      "answer": 1,
      "explain": "Function templates (and their instantiations) already get vague linkage so identical definitions across TUs merge without ODR conflict; `inline` is not required for that. (It can still hint inlining but isn't needed to avoid multiple-definition errors.)"
    },
    {
      "type": "mcq",
      "tag": "Template Template",
      "question": "A template template parameter's own parameter names are:",
      "options": ["Required to match the argument template's names","Ignored/unused — only the kinds and arity matter","Used as default arguments","Runtime values"],
      "answer": 1,
      "explain": "In `template<template<class Elem> class C>`, the name Elem is unused; only the parameter kinds/arity are significant for matching a template template argument. You may even omit the name."
    },
    {
      "type": "mcq",
      "tag": "Deduction Basics",
      "question": "Given `template<class T> void f(T, T);`, how can you still call it with an int and a double?",
      "options": ["You cannot at all","Provide the type explicitly: f<double>(i, d)","Add const","Use f(i, d) — it just works"],
      "answer": 1,
      "explain": "Deduction fails on conflicting T, but giving the type explicitly with f<double>(i,d) disables deduction; the int is then converted to double. Explicit args bypass the deduction conflict."
    },
    {
      "type": "mcq",
      "tag": "Instantiation",
      "question": "A template is used with type X that lacks a needed operation. When is the error reported?",
      "options": ["When the template is defined","When the template is instantiated for X (the operation is a dependent expression)","Never","At program startup"],
      "answer": 1,
      "explain": "Operations on template-parameter-dependent types are checked at instantiation (phase 2). The missing operation on X surfaces only when the template is instantiated with X, not at the template's definition."
    },
    {
      "type": "mcq",
      "tag": "Nontype Params",
      "question": "Which C++20 feature is relevant to nontype template parameters?",
      "options": ["Nothing changed","Floating-point and certain literal class types became allowed as NTTPs","NTTPs were removed","NTTPs became runtime values"],
      "answer": 1,
      "explain": "C++20 broadened NTTPs to allow floating-point types and structural (literal class) types. Before C++20, e.g. a double or a user struct could not be a nontype template parameter."
    },
    {
      "type": "mcq",
      "tag": "Explicit Instantiation",
      "question": "The difference between an explicit instantiation DECLARATION (`extern template class C<int>;`) and DEFINITION (`template class C<int>;`) is:",
      "options": ["Nothing","extern template suppresses instantiation in this TU (expecting it elsewhere), reducing redundant code","extern template forces instantiation everywhere","The declaration is illegal"],
      "answer": 1,
      "explain": "`extern template` (C++11) is an explicit instantiation declaration that tells the compiler NOT to instantiate here, relying on a definition in another TU. This cuts compile time and code bloat."
    },
    {
      "type": "mcq",
      "tag": "Class Template",
      "question": "When you write `S<int>::static_member` where static_member is a static data member of class template S, when is that static member's definition instantiated?",
      "options": ["Never","When it is odr-used","At class instantiation always","At program load"],
      "answer": 1,
      "explain": "Static data members of a class template are instantiated (and their definitions emitted) only when odr-used, consistent with lazy instantiation — merely instantiating the class doesn't emit them."
    },
    {
      "type": "mcq",
      "tag": "Two-Phase",
      "question": "Which name in a template is 'dependent'?",
      "options": ["A name whose meaning depends on a template parameter","Any name with a namespace","Only macro names","Names of local variables"],
      "answer": 0,
      "explain": "A dependent name is one whose meaning depends on a template parameter (e.g. T::type, or a base T's members). Such names are resolved at instantiation (phase 2), unlike non-dependent names."
    },
    {
      "type": "mcq",
      "tag": "Overload vs Template",
      "question": "Partial ordering of function templates is used to:",
      "options": ["Order template parameters alphabetically","Choose the more specialized template when multiple templates match","Sort instantiations","Decide inlining"],
      "answer": 1,
      "explain": "When several function templates are viable for a call, partial ordering picks the most specialized one (e.g. f(T*) over f(T)). If none is more specialized, the call is ambiguous."
    },
    {
      "type": "mcq",
      "tag": "Member Template",
      "question": "Given a class `template<class T> class C` with a converting member template constructor `template<class U> C(const C<U>&)`, converting C<Derived*> to C<Base*> works if:",
      "options": ["Never","The member's body performs a valid conversion (e.g. Derived*->Base*) — the template constructor enables it","Only if T==U","C is final"],
      "answer": 1,
      "explain": "The member template constructor accepts C<U> for any U and, if its body converts U's stored value to T (Derived*->Base*), enables smart-pointer-style covariant conversions. This is how shared_ptr converts across related types."
    },
    {
      "type": "mcq",
      "tag": "Inclusion Model",
      "question": "Putting template definitions in a header can cause which practical downside?",
      "options": ["Runtime slowdown","Longer compile times and code bloat from repeated instantiation","ODR violations always","Loss of type safety"],
      "answer": 1,
      "explain": "The inclusion model means the full definition is parsed in every including TU and instantiations are emitted repeatedly (later merged), increasing compile time and object size. extern template can mitigate this."
    },
    {
      "type": "mcq",
      "tag": "Deduction Basics",
      "question": "Function template argument deduction considers which conversions on the deduced parameter?",
      "options": ["All standard conversions freely","Only a limited set: lvalue-to-rvalue, array/function decay, qualification, and derived-to-base in some cases","None at all","User-defined conversions only"],
      "answer": 1,
      "explain": "Deduction allows only a restricted set of conversions (decay, cv-qualification adjustments, derived-to-base for references in specific cases). It does not perform arbitrary implicit conversions to make deduction succeed."
    },
    {
      "type": "mcq",
      "tag": "Template Params",
      "question": "The keywords `class` and `typename` in a template parameter list (`template<class T>` vs `template<typename T>`) are:",
      "options": ["Different: class requires a class type","Interchangeable for declaring a type parameter","typename only for nontype","class only for templates of templates"],
      "answer": 1,
      "explain": "For declaring a type parameter, `class` and `typename` are exactly equivalent — `class T` does not require T to be a class type. (typename has an additional, separate role for disambiguating dependent type names.)"
    },
    {
      "type": "mcq",
      "tag": "Specialization",
      "question": "Can function templates be partially specialized?",
      "options": ["Yes, like class templates","No — you overload instead","Only for one parameter","Only in C++20"],
      "answer": 1,
      "explain": "Function templates cannot be partially specialized. The idiomatic alternative is to add overloaded function templates, letting partial ordering pick the most specialized. Only full explicit specialization is allowed for functions."
    },
    {
      "type": "mcq",
      "tag": "auto Return",
      "question": "Before C++14's `auto` return deduction, how did you write a function template whose return depended on the args?",
      "options": ["Impossible","Trailing return type with decltype, e.g. `auto f(T a,U b) -> decltype(a+b)`","Return void","Use a macro"],
      "answer": 1,
      "explain": "C++11 introduced trailing return types `-> decltype(expr)` so the return could be expressed after the parameters are in scope. C++14 later allowed plain `auto` return deduction, dropping the trailing part in many cases."
    },
    {
      "type": "mcq",
      "tag": "Overload vs Template",
      "question": "Adding a non-template overload alongside a function template can change behavior how?",
      "options": ["It has no effect","For exact-match cases the non-template is preferred, potentially shadowing the template","It deletes the template","It forces ambiguity"],
      "answer": 1,
      "explain": "When both the non-template and a template instantiation are equally good matches, the non-template wins the tie-break. Adding it can silently redirect certain calls away from the template — a subtle behavioral change."
    },
    {
      "type": "mcq",
      "tag": "Template Template",
      "question": "Since C++17, why does `template<template<class...> class C> struct X;` accept both vector and map?",
      "options": ["It doesn't","A variadic template template parameter matches templates with any number of type parameters","Only vector matches","map isn't a template"],
      "answer": 1,
      "explain": "A variadic `template<class...> class C` template template parameter matches any class template taking type parameters (vector<T,Alloc>, map<K,V,...>), sidestepping the arity-mismatch problem of fixed-arity template template parameters."
    },
    {
      "type": "mcq",
      "tag": "Explicit Args",
      "question": "For `template<class... Ts> void f(Ts...);`, can you mix explicit and deduced arguments, e.g. f<int>(1, 2.0)?",
      "options": ["No, all or nothing","Yes: the first pack element is int (explicit); the rest are deduced","Only f<int,double>","Variadics can't be explicit"],
      "answer": 1,
      "explain": "You can specify a prefix of a parameter pack explicitly; remaining arguments are deduced. f<int>(1, 2.0) fixes the first Ts as int and deduces the second as double, giving Ts = {int, double}."
    },
    {
      "type": "mcq",
      "tag": "Two-Phase",
      "question": "A consequence of two-phase lookup is that names in dependent base classes:",
      "options": ["Are found by unqualified lookup automatically","Are NOT found by unqualified lookup; must use this-> or Base::","Are always private","Cannot be used"],
      "answer": 1,
      "explain": "Because a dependent base's members aren't visible to phase-1 unqualified lookup, you must qualify them (this->member or Base<T>::member). Forgetting this is a very common template compilation error."
    }
  ]
};

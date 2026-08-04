/* ===== C++ Templates — Tricky Basics & Dependent Names ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["templ-tricky"] = {
  title: "C++ Templates — Tricky Basics & Dependent Names",
  subtitle: "typename & .template disambiguation, this-> in dependent bases, zero init, and raw arrays / string literals as template arguments.",
  crumb: "C++ Templates",
  questions: [
    {
      "type": "code",
      "tag": "typename",
      "question": "Why does this fail to compile without a keyword?",
      "code": "template<class C>\nvoid f(){ C::iterator* p; }",
      "options": ["C::iterator is a dependent name that the compiler assumes is a value, so C::iterator* p parses as a multiplication expression, not a pointer declaration", "Pointers to iterators are illegal in C++", "iterator must be declared public inside C", "The variable p is uninitialized"],
      "answer": 0,
      "explain": "For a dependent qualified name the compiler defaults to treating it as a non-type (a value), so 'C::iterator * p' is read as a multiplication. 'typename' tells it C::iterator is a type."
    },
    {
      "type": "code",
      "tag": ".template",
      "question": "Why does this need a keyword before get?",
      "code": "template<class T>\nvoid f(T t){ auto x = t.get<0>(); }",
      "options": ["get is a dependent member; without t.template get<0>() the '<' is parsed as a less-than operator", "get<0>() needs to be spelled get(0)", "auto cannot be used with member templates", "The template parameter T must be a class"],
      "answer": 0,
      "explain": "When calling a dependent member template, '<' is ambiguous with less-than. 't.template get<0>()' tells the parser get is a template so the angle brackets start a template argument list."
    },
    {
      "type": "code",
      "tag": "array decay",
      "question": "What is the deduced type of T here?",
      "code": "template<class T>\nvoid f(T p);\n\nint a[10];\nf(a);",
      "options": ["int* — the array decays to a pointer when passed by value", "int[10] — the array type is preserved", "int& — a reference to the first element", "Deduction fails; arrays cannot be passed"],
      "answer": 0,
      "explain": "When a by-value parameter is deduced, array-to-pointer decay applies, so T is int* and the size 10 is lost."
    },
    {
      "type": "code",
      "tag": "reference decay",
      "question": "Does array decay happen for this by-reference parameter?",
      "code": "template<class T>\nvoid f(const T& s);\n\nf(\"hi\");",
      "options": ["No — with a reference parameter no decay occurs, so T = char[3]", "Yes — T = const char*", "T = char and the rest is ignored", "Deduction is ambiguous"],
      "answer": 0,
      "explain": "Reference parameters suppress decay, so the literal keeps its array type: T deduces to char[3] (the const is supplied by the parameter's const T&)."
    },
    {
      "type": "code",
      "tag": "dependent base",
      "question": "Why does the unqualified call fail?",
      "code": "template<class T>\nstruct Base { void log(); };\n\ntemplate<class T>\nstruct Derived : Base<T> {\n  void run(){ log(); }   // error: log not declared\n};",
      "options": ["log is a member of the dependent base Base<T> and is invisible to unqualified lookup; use this->log() or Base<T>::log()", "log must be declared virtual", "run() must be a template itself", "Base<T> must be listed after Derived"],
      "answer": 0,
      "explain": "First-phase (non-dependent) lookup does not examine dependent base classes, so unqualified log is not found. Qualify it to defer lookup to instantiation."
    },
    {
      "type": "code",
      "tag": "aggregate",
      "question": "Is this templated aggregate initialization valid?",
      "code": "template<class T>\nstruct Pair { T first; T second; };\n\nPair<int> p{1, 2};",
      "options": ["Yes — Pair<int> is an aggregate, so brace-init fills first and second", "No — templates cannot be aggregates", "No — you must call a constructor", "No — T must be a class type"],
      "answer": 0,
      "explain": "A class template with only public data members, no user-declared constructors, no private/protected non-static data, etc., is an aggregate once instantiated and supports aggregate initialization."
    },
    {
      "type": "code",
      "tag": "array size",
      "question": "How can you deduce a raw array's size as a compile-time constant?",
      "code": "template<class T, std::size_t N>\nstd::size_t len(T (&)[N]){ return N; }\n\nint a[7];",
      "options": ["len(a) returns 7 — N is deduced from the reference-to-array parameter", "len(a) returns sizeof(a)", "len(a) fails because arrays decay", "N must be passed explicitly"],
      "answer": 0,
      "explain": "A reference-to-array parameter T(&)[N] deduces N as the array's element count at compile time. len(a) yields 7 without any runtime sizeof arithmetic."
    },
    {
      "type": "code",
      "tag": ".template",
      "question": "Fix the parse error in this dependent call.",
      "code": "template<class Tup>\nauto first(Tup& t){ return t.get<0>(); }",
      "options": ["Write t.template get<0>() so '<' is parsed as a template argument list", "Write t.get(0) instead", "Write get<0>(t)", "Write typename t.get<0>()"],
      "answer": 0,
      "explain": "t has dependent type Tup, so t.get<0>() is misparsed ('<' as less-than). The .template disambiguator fixes it: t.template get<0>()."
    },
    {
      "type": "code",
      "tag": "typename",
      "question": "Is typename required in this trailing return type?",
      "code": "template<class T>\nauto begin(T& c) -> decltype(c.begin());",
      "options": ["No — decltype(c.begin()) yields a type directly, so typename is not needed here", "Yes — every trailing return type needs typename", "Yes — because c is dependent", "No — because begin() cannot be dependent"],
      "answer": 0,
      "explain": "decltype(expr) already produces a type; typename is not used with decltype. typename is for qualified names like T::something, not decltype expressions."
    },
    {
      "type": "code",
      "tag": "array param",
      "question": "What is deduced for the multidimensional case?",
      "code": "template<class T, std::size_t R, std::size_t C>\nvoid f(T (&a)[R][C]);\n\nint m[3][4];\nf(m);",
      "options": ["T = int, R = 3, C = 4 — reference-to-array deduces all extents", "T = int*, R and C not deducible", "T = int[3][4], R = C = 1", "Deduction fails for 2D arrays"],
      "answer": 0,
      "explain": "A reference to a 2D array T(&)[R][C] preserves the type and both bounds, deducing T = int, R = 3, C = 4 with no decay."
    },
    {
      "type": "code",
      "tag": "string literal",
      "question": "What is the type of the string literal itself?",
      "code": "auto x = \"hello\";",
      "options": ["const char[6] — a lvalue array of const char including the null terminator (auto here deduces const char*)", "std::string", "char*", "const char (a single character)"],
      "answer": 0,
      "explain": "The literal \"hello\" is an lvalue of type const char[6]. With auto (by value), it decays to const char*. Only reference binding preserves the array type."
    },
    {
      "type": "code",
      "tag": "member template",
      "question": "Where does the disambiguator go in a chained access?",
      "code": "template<class T>\nauto f(T& t){ return t.inner.template get<0>(); }",
      "options": ["Immediately before the dependent member template name: t.inner.template get<0>()", "Before t: template t.inner.get<0>()", "After get: t.inner.get<0>.template()", "It is never allowed in a chain"],
      "answer": 0,
      "explain": "The template keyword goes right before the member template whose name it disambiguates. If t.inner is dependent, that member is get, so: t.inner.template get<0>()."
    },
    {
      "type": "code",
      "tag": "typename",
      "question": "Is typename correct in this parameter list?",
      "code": "template<class T>\nvoid f(typename T::value_type v);",
      "options": ["Yes — T::value_type is a dependent type name used as a parameter type, so typename is required (and note: T is non-deducible from v)", "No — parameters never take typename", "No — value_type must be first", "Yes — and T is deducible from v"],
      "answer": 0,
      "explain": "typename is required for the dependent type T::value_type. A side effect: because T appears only in a non-deduced context (qualifier of value_type), it can't be deduced from the argument."
    },
    {
      "type": "code",
      "tag": "dependent base",
      "question": "Why does calling a dependent-base member from a lambda inside the template also fail unqualified?",
      "code": "template<class T>\nstruct D : Base<T> {\n  auto make(){ return [this]{ return helper(); }; }  // helper in Base<T>\n};",
      "options": ["Unqualified helper still skips the dependent base; use this->helper() (the captured this makes it accessible once qualified)", "Lambdas cannot capture this in templates", "helper must be static to be used in a lambda", "The lambda needs its own template parameter"],
      "answer": 0,
      "explain": "The same two-phase rule applies inside the lambda body: unqualified helper isn't found in the dependent base. Writing this->helper() (with this captured) resolves it at instantiation."
    },
    {
      "type": "code",
      "tag": "member template",
      "question": "Where is the error?",
      "code": "template<class T>\nvoid f(T& obj){\n  obj.template foo();   // foo takes no template args\n}",
      "options": ["Using .template before foo when foo has no template arguments is ill-formed; only use it when supplying explicit template args", "You must add <> after foo", "foo must be static", "There is no error"],
      "answer": 0,
      "explain": "The template disambiguator must be followed by a template name with a template argument list. Applying it to a non-template (or a template call without <...>) is incorrect."
    },
    {
      "type": "code",
      "tag": "array decay",
      "question": "Why does passing a 2D array by value collapse oddly?",
      "code": "template<class T> void f(T p);\nint m[3][4];\nf(m);",
      "options": ["The outer array decays to a pointer to its element (an array), so T = int(*)[4] — the first extent is lost, the inner one kept", "T = int** ", "T = int[3][4]", "Deduction fails entirely"],
      "answer": 0,
      "explain": "Array-to-pointer decay affects only the outermost extent: int[3][4] decays to int(*)[4], a pointer to array-of-4-int. The size 3 is lost but 4 remains."
    },
    {
      "type": "code",
      "tag": "zero init",
      "question": "Does 'T{}' ever call a constructor for class T?",
      "code": "struct C { C(){ /* side effect */ } };\ntemplate<class T> T make(){ return T{}; }   // T = C",
      "options": ["Yes — for a class with a user-provided default constructor, T{} value-initialization invokes that constructor", "No — T{} always just zero-fills memory", "No — it copy-constructs from a temporary", "It fails to compile"],
      "answer": 0,
      "explain": "Value-initialization of a class with a user-provided default constructor calls that constructor (running its side effects). Zero-filling only applies to scalars and trivial classes."
    },
    {
      "type": "code",
      "tag": "member template",
      "question": "Why is the disambiguator required specifically for THIS call?",
      "code": "template<class Obj>\nvoid f(Obj o){ auto r = o.cast<double>(); }",
      "options": ["Obj is a template parameter, so o is dependent; without o.template cast<double>() the compiler treats '<' as less-than", "cast is a reserved keyword", "double cannot be a template argument", "cast() must return auto"],
      "answer": 0,
      "explain": "Because o has the dependent type Obj, the member template call needs o.template cast<double>() so the parser reads the angle brackets as a template argument list."
    },
    {
      "type": "code",
      "tag": "member template",
      "question": "Is .template needed when the member template is a nested type, not a function?",
      "code": "template<class T>\nvoid f(){ typename T::template Rebind<int> x; }",
      "options": ["Yes — Rebind is a dependent member template used as a type, so both typename and ::template are needed", "No — types never need template", "No — only functions need template", "typename alone suffices"],
      "answer": 0,
      "explain": "The disambiguator applies to any dependent member template — function OR nested type. Here Rebind<int> needs ::template, and the whole name needs typename because it's a type."
    },
    {
      "type": "code",
      "tag": "this->",
      "question": "Does qualifying with the injected-class-name help find a dependent-base member?",
      "code": "template<class T>\nstruct D : Base<T> {\n  void run(){ Base<T>::act(); }\n};",
      "options": ["Yes — Base<T>::act() explicitly names the dependent base, deferring lookup to instantiation (an alternative to this->act())", "No — you must use this->", "No — Base<T>:: is a syntax error", "It calls a global act()"],
      "answer": 0,
      "explain": "Explicitly qualifying with Base<T>:: makes the call dependent and directs lookup to that base at instantiation, an equally valid alternative to this->act()."
    },
    {
      "type": "code",
      "tag": "typename",
      "question": "Is typename needed for the qualifier in this cast expression?",
      "code": "template<class T>\nvoid f(){ auto n = static_cast<int>(T::size); }   // size is a value",
      "options": ["No — T::size is used as a value here, so no typename; typename would be an error", "Yes — all T:: uses need typename", "Yes — inside static_cast", "No — but it needs the template keyword"],
      "answer": 0,
      "explain": "T::size is read as a value expression (the thing being cast), not a type. typename applies only to dependent type names, so it must not be added here."
    },
    {
      "type": "code",
      "tag": "string literal",
      "question": "What is deduced when both arrays differ in size for the same template parameter?",
      "code": "template<class T> void f(T a, T b);\nf(\"hi\", \"bye\");",
      "options": ["T = const char* for both — by value each literal decays to a pointer, so the differing sizes don't conflict", "It fails: \"hi\" and \"bye\" have different array types", "T = const char[3]", "T = const char[4]"],
      "answer": 0,
      "explain": "By-value parameters decay both literals to const char*, so despite their different original array sizes they deduce the same T and the call is fine."
    },
    {
      "type": "code",
      "tag": "member template",
      "question": "Which explains why the explicit-args form matters?",
      "code": "template<class T>\nvoid f(T x){ x.get<0>(); }   // vs x.get() with no args",
      "options": ["Only the explicit-argument form (get<0>) triggers the '<' ambiguity requiring .template; x.get() needs nothing", "Both forms need .template", "Neither form ever needs .template", "x.get() needs typename"],
      "answer": 0,
      "explain": "The disambiguation problem arises only when explicit template arguments introduce a '<'. A plain call x.get() has no angle brackets, so no disambiguator is needed."
    },
    {
      "type": "mcq",
      "tag": "typename rule",
      "question": "When is the 'typename' keyword required before a qualified name like X::Y?",
      "options": ["When X::Y is a type AND the name is dependent on a template parameter", "Before every use of :: inside any template", "Only when X is a class template", "Never in modern C++; it was removed in C++11"],
      "answer": 0,
      "explain": "typename is required precisely when a qualified name is both dependent (relies on a template parameter) and names a type. Non-dependent qualified type names don't need it."
    },
    {
      "type": "mcq",
      "tag": "typename rule",
      "question": "When is the 'typename' keyword required before a qualified name like X::Y?",
      "options": ["When X::Y is a type AND the name is dependent on a template parameter", "Before every use of :: inside any template", "Only when X is a class template", "Never in modern C++; it was removed in C++11"],
      "answer": 0,
      "explain": "typename is required precisely when a qualified name is both dependent (relies on a template parameter) and names a type. Non-dependent qualified type names don't need it."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "What makes a name 'dependent' in a template?",
      "options": ["Its meaning depends on one or more template parameters", "It depends on a header file being included", "It is declared with the 'depends' attribute", "It appears after a return statement"],
      "answer": 0,
      "explain": "A dependent name is one whose meaning is tied to a template parameter, so it can only be fully resolved at instantiation time when the parameter is known."
    },
    {
      "type": "mcq",
      "tag": "non-dependent",
      "question": "For a non-dependent qualified type name such as std::vector<int>::iterator inside a template, is 'typename' required?",
      "options": ["No — it does not depend on a template parameter, so the compiler already knows it is a type", "Yes — any name with :: inside a template needs typename", "Yes — but only under C++11", "No — because iterator is always a type everywhere"],
      "answer": 0,
      "explain": "std::vector<int>::iterator is fully known independently of any template parameter, so it is non-dependent and typename is neither required nor (pre-C++20) needed."
    },
    {
      "type": "mcq",
      "tag": "this->",
      "question": "Which of these does NOT make an inherited member 'm' from a dependent base visible?",
      "options": ["Writing plain 'm' unqualified", "Writing 'this->m'", "Writing 'Base<T>::m'", "Adding 'using Base<T>::m;' in the derived class"],
      "answer": 0,
      "explain": "Plain unqualified 'm' is looked up non-dependently and skips the dependent base. this->m, Base<T>::m, and the using-declaration all make the reference dependent so it resolves at instantiation."
    },
    {
      "type": "mcq",
      "tag": ".template",
      "question": "In which situations is the '.template' (or '->template', '::template') disambiguator needed?",
      "options": ["When accessing a member template through a dependent expression/type and explicitly supplying template arguments", "Before every call to a member function inside a template", "Whenever a class has any member template at all", "Only when the member template returns void"],
      "answer": 0,
      "explain": "The disambiguator is needed when the object or type is dependent and you name a member template with explicit template arguments, so the compiler knows '<' opens an argument list."
    },
    {
      "type": "mcq",
      "tag": "zero init",
      "question": "Which initialization portably zero-initializes a member of dependent type T in a constructor?",
      "options": ["Member initializer 'x{}' (or 'x()') in the initializer list", "Leaving x out of the initializer list entirely", "Writing 'x;' in the body", "Assigning 'x = null' in the body"],
      "answer": 0,
      "explain": "Using x{} or x() in the member initializer list value-initializes x, which zero-initializes scalars. Omitting it default-initializes and leaves scalars indeterminate."
    },
    {
      "type": "mcq",
      "tag": "member template",
      "question": "What is a member template?",
      "options": ["A template (function or class) declared as a member of a class or class template", "A template that can only have one member", "A member function marked 'template' at call time", "A member that is instantiated at link time only"],
      "answer": 0,
      "explain": "A member template is a template nested inside a class (possibly itself a template), such as a templated member function or a nested class template."
    },
    {
      "type": "mcq",
      "tag": "variable template",
      "question": "Which correctly declares a C++14 variable template for pi?",
      "options": ["template<class T> constexpr T pi = T(3.1415926535897932385L);", "template<class T> constexpr T pi() { return 3.14; }", "constexpr template<T> pi = 3.14;", "template pi<class T> = 3.14;"],
      "answer": 0,
      "explain": "A variable template is a template whose declaration is a variable: template<class T> constexpr T pi = ...; It is used as pi<double>."
    },
    {
      "type": "mcq",
      "tag": "variable template",
      "question": "How do you use the variable template 'template<class T> constexpr T pi = ...;' for double?",
      "options": ["pi<double>", "pi(double)", "pi::double", "pi.double"],
      "answer": 0,
      "explain": "A variable template is used with explicit template arguments in angle brackets, e.g. pi<double>, which names the specialization for that type."
    },
    {
      "type": "mcq",
      "tag": "typename contexts",
      "question": "Historically (pre-C++20), in which context was 'typename' NOT allowed even for a dependent type name?",
      "options": ["In a base-class specifier list (e.g. after ':')", "In a local variable declaration", "In a function return type", "In a function parameter type"],
      "answer": 0,
      "explain": "Base-class specifiers are already known to name types, so typename was disallowed there. C++20 later made typename optional in many places but base lists still don't take it in the disambiguating sense."
    },
    {
      "type": "mcq",
      "tag": "two-phase",
      "question": "In two-phase name lookup, when are non-dependent names looked up?",
      "options": ["At the point of the template definition", "At the point of instantiation only", "At link time", "They are never looked up"],
      "answer": 0,
      "explain": "Non-dependent names are bound when the template is defined (first phase). Dependent names are looked up later, at instantiation (second phase)."
    },
    {
      "type": "mcq",
      "tag": "two-phase",
      "question": "When are dependent names resolved in two-phase lookup?",
      "options": ["At instantiation, when template arguments are known (second phase)", "At the template's definition (first phase)", "During preprocessing", "Never — they cause errors"],
      "answer": 0,
      "explain": "Dependent names cannot be resolved until the template arguments are known, so their lookup is deferred to instantiation (the second phase)."
    },
    {
      "type": "mcq",
      "tag": "value init",
      "question": "For a class type T with a user-provided default constructor, do 'T x;' and 'T x{};' differ?",
      "options": ["No meaningful difference — both run the user-provided default constructor", "T x{} skips the constructor entirely", "T x; is a compile error", "T x{} calls a copy constructor"],
      "answer": 0,
      "explain": "When a class has a user-provided default constructor, both default- and value-initialization invoke it. The difference only matters for scalars and classes without user-provided constructors (where {} zero-initializes)."
    },
    {
      "type": "mcq",
      "tag": "value init",
      "question": "For a class type T with a user-provided default constructor, do 'T x;' and 'T x{};' differ?",
      "options": ["No meaningful difference — both run the user-provided default constructor", "T x{} skips the constructor entirely", "T x; is a compile error", "T x{} calls a copy constructor"],
      "answer": 0,
      "explain": "When a class has a user-provided default constructor, both default- and value-initialization invoke it. The difference only matters for scalars and classes without user-provided constructors (where {} zero-initializes)."
    },
    {
      "type": "mcq",
      "tag": "aggregate",
      "question": "Which feature would make an instantiated class template NOT an aggregate?",
      "options": ["Declaring a user-provided constructor", "Having a member of dependent type", "Being a class template rather than a plain class", "Having more than two data members"],
      "answer": 0,
      "explain": "Aggregates must have no user-declared/provided constructors (among other rules). Being a template or having dependent members does not by itself disqualify aggregate status."
    },
    {
      "type": "mcq",
      "tag": "current instantiation",
      "question": "Inside a class template, is a name referring to the 'current instantiation' (e.g. a member of the same template) treated as dependent needing this->?",
      "options": ["Members of the current instantiation are found by ordinary lookup; the this-> problem is specific to dependent BASE classes", "All member access inside a template needs this->", "Members of the current instantiation always need typename", "You can never access your own members inside a template"],
      "answer": 0,
      "explain": "Names in the current instantiation (the class template's own members) are visible to ordinary lookup. The invisibility problem arises only for members inherited from dependent base classes."
    },
    {
      "type": "mcq",
      "tag": "C++20",
      "question": "What did C++20 change about typename in some contexts?",
      "options": ["In certain clear 'type-only' contexts (e.g. return types, trailing return types) typename became optional because a type is the only thing allowed there", "typename was removed from the language", "typename now works only inside concepts", "C++20 made typename mandatory everywhere including base lists"],
      "answer": 0,
      "explain": "C++20 relaxed the rules so that in contexts where only a type can appear, the compiler assumes a dependent name is a type, making typename optional there (though still allowed)."
    },
    {
      "type": "mcq",
      "tag": "typename",
      "question": "Is 'typename' ever used to introduce a template type parameter?",
      "options": ["Yes — 'template<typename T>' uses typename interchangeably with 'class' to declare a type parameter", "No — typename is only for disambiguating dependent names", "No — only 'class' can declare type parameters", "Yes — but only for non-type parameters"],
      "answer": 0,
      "explain": "typename has two roles: introducing a template type parameter (interchangeable with class) and disambiguating dependent qualified type names. Here it's the former."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "Which of these names is dependent inside 'template<class T> ...'?",
      "options": ["T::type", "std::string", "int", "std::size_t"],
      "answer": 0,
      "explain": "T::type depends on the template parameter T, making it a dependent name. std::string, int, and std::size_t are all fixed regardless of T."
    },
    {
      "type": "mcq",
      "tag": "variable template",
      "question": "Can variable templates be specialized?",
      "options": ["Yes — variable templates support both full and partial specialization", "No — variable templates cannot be specialized at all", "Only full specialization is allowed", "Only partial specialization is allowed"],
      "answer": 0,
      "explain": "Like class templates, variable templates (C++14) can be fully and partially specialized, e.g. specializing a trait-like value for particular types."
    },
    {
      "type": "mcq",
      "tag": "auto",
      "question": "How does 'auto' help avoid typename gotchas with dependent types?",
      "options": ["auto deduces the type from the initializer, so you needn't name dependent types like typename Map::iterator explicitly", "auto disables two-phase lookup", "auto makes all names non-dependent", "auto forces zero initialization"],
      "answer": 0,
      "explain": "Using auto lets the compiler deduce dependent types from the initializer expression, sidestepping the need to spell out (and typename-qualify) names like Map::iterator."
    },
    {
      "type": "mcq",
      "tag": "template keyword",
      "question": "Besides '.template', where else can the 'template' disambiguation keyword appear?",
      "options": ["After :: (T::template X<...>) and after -> (p->template m<...>)", "Only after a dot", "Before the class keyword", "Inside a return statement only"],
      "answer": 0,
      "explain": "The template disambiguator follows any of the member-access tokens: '.', '->', or '::', signaling that the following dependent name is a template."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "Is a call like foo(t) (where t has a dependent type) itself dependent?",
      "options": ["Yes — because an argument has a type dependent on a template parameter, the call is type-dependent and resolved at instantiation", "No — function calls are never dependent", "Only if foo is a template", "Only if foo returns void"],
      "answer": 0,
      "explain": "An expression is type-dependent if any subexpression has a dependent type; the call foo(t) then depends on the template parameter and its overload resolution (via ADL) happens at instantiation."
    },
    {
      "type": "mcq",
      "tag": "this->",
      "question": "Does 'this->' force virtual dispatch or change which member is chosen at runtime?",
      "options": ["No — this-> only affects name lookup (making it dependent); it does not change virtual/static dispatch semantics", "Yes — this-> always triggers a virtual call", "Yes — this-> disables virtual dispatch", "It changes the member to static"],
      "answer": 0,
      "explain": "this-> is purely a lookup device here: it defers the name to the second phase so dependent-base members are found. Virtual dispatch rules are unchanged."
    },
    {
      "type": "mcq",
      "tag": "typename contexts",
      "question": "Which context requires typename for a dependent nested type?",
      "options": ["A template default argument that is a dependent type name, e.g. template<class T, class U = typename T::value_type>", "A base-class specifier", "The name inside a mem-initializer that names a base", "An elaborated-type-specifier like 'class T::X'"],
      "answer": 0,
      "explain": "A dependent type used as a default template argument needs typename. Base-class lists and elaborated-type-specifiers (class/struct keyword) already imply a type, so they don't take typename."
    },
    {
      "type": "mcq",
      "tag": "two-phase",
      "question": "Some older compilers (e.g. MSVC's permissive mode) accepted unqualified access to dependent-base members. What is the risk?",
      "options": ["The code is non-portable and ill-formed by the standard; conforming compilers reject it", "It runs faster", "It is always fine — the standard allows it", "It only fails at link time"],
      "answer": 0,
      "explain": "Relying on permissive lookup that finds dependent-base members without this-> is non-standard. Conforming two-phase compilers reject it, so the code is not portable."
    },
    {
      "type": "mcq",
      "tag": "two-phase",
      "question": "Some older compilers (e.g. MSVC's permissive mode) accepted unqualified access to dependent-base members. What is the risk?",
      "options": ["The code is non-portable and ill-formed by the standard; conforming compilers reject it", "It runs faster", "It is always fine — the standard allows it", "It only fails at link time"],
      "answer": 0,
      "explain": "Relying on permissive lookup that finds dependent-base members without this-> is non-standard. Conforming two-phase compilers reject it, so the code is not portable."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "Which statement about non-dependent names in a template is TRUE?",
      "options": ["They are bound at definition time and are not affected by the template arguments", "They are re-evaluated for every instantiation", "They always require typename", "They cannot refer to global functions"],
      "answer": 0,
      "explain": "Non-dependent names have a meaning fixed at the point of definition, independent of any template argument, and are bound in the first lookup phase."
    },
    {
      "type": "mcq",
      "tag": "non-deduced",
      "question": "Why can't T be deduced from a parameter of type 'typename T::type'?",
      "options": ["The left of :: is a non-deduced context — the compiler can't invert an arbitrary member alias to recover T", "typename disables deduction globally", "Nested types are never used as parameters", "Because type is always int"],
      "answer": 0,
      "explain": "A template parameter appearing only as the qualifier before :: is in a non-deduced context; there's no general way to run the member-type mapping backward, so T must be supplied explicitly."
    },
    {
      "type": "mcq",
      "tag": "variable template",
      "question": "Compared to a constexpr function template, what is a distinctive trait of a variable template?",
      "options": ["It names a value directly (pi<double>) rather than requiring a call (pi<double>())", "It cannot be constexpr", "It must return void", "It cannot be used at compile time"],
      "answer": 0,
      "explain": "A variable template is used as a value expression with just the template arguments (pi<double>), whereas a function template needs a call. Both can be constexpr."
    },
    {
      "type": "mcq",
      "tag": "template keyword",
      "question": "The '.template' keyword tells the compiler that the following member name is what?",
      "options": ["A template, so a subsequent '<' begins a template argument list rather than a comparison", "A type that needs typename", "A virtual function", "A private member"],
      "answer": 0,
      "explain": "The disambiguator asserts the dependent member is a template, so the parser reads the following < as opening template arguments instead of a less-than operator."
    },
    {
      "type": "mcq",
      "tag": "zero init",
      "question": "In generic code, why prefer 'T x{};' over 'T x = 0;' to zero a value?",
      "options": ["T x{} works for all types (including class types) whereas '= 0' only works when 0 is convertible to T", "'= 0' is faster", "T x{} only works for pointers", "They are identical for every T"],
      "answer": 0,
      "explain": "T x{} value-initializes any type generically, while T x = 0; requires that 0 be convertible to T (fails for many class types), so braces are the portable generic choice."
    },
    {
      "type": "mcq",
      "tag": "typename",
      "question": "Which statement about 'typename' and 'template' disambiguators is correct?",
      "options": ["typename marks a dependent name as a TYPE; template marks a dependent name as a TEMPLATE", "Both mark names as types", "Both mark names as templates", "typename is for templates, template is for types"],
      "answer": 0,
      "explain": "They solve complementary parsing ambiguities: typename says 'this dependent qualified name is a type', while template says 'this dependent member is a template'."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "Is 'sizeof...(Ts)' for a parameter pack Ts a dependent expression?",
      "options": ["Yes — it depends on the template parameter pack and is value-dependent until instantiation", "No — it is a fixed constant known before templates exist", "It is always 0", "It requires typename"],
      "answer": 0,
      "explain": "sizeof...(Ts) yields the number of pack elements, which depends on the template arguments, making it a value-dependent (dependent) expression."
    },
    {
      "type": "mcq",
      "tag": "two-phase",
      "question": "What is the practical benefit of two-phase lookup catching errors at phase one?",
      "options": ["Errors in the non-dependent parts of a template are diagnosed even before any instantiation", "It makes templates compile faster at runtime", "It removes the need for headers", "It allows templates without any parameters"],
      "answer": 0,
      "explain": "Phase-one lookup checks non-dependent names at definition, so genuine mistakes there are reported without waiting for (or even requiring) an instantiation."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "Which is TRUE about ADL (argument-dependent lookup) and dependent calls?",
      "options": ["For a dependent function call, ADL is performed at the point of instantiation using the actual argument types", "ADL is disabled inside templates", "ADL happens only at definition time", "ADL ignores dependent arguments"],
      "answer": 0,
      "explain": "For dependent calls, ordinary lookup happens at definition but ADL is (also) performed at instantiation with the real argument types, which is why unqualified calls can find functions defined near the argument types."
    },
    {
      "type": "mcq",
      "tag": "variable template",
      "question": "Which library-style pattern is commonly implemented with variable templates?",
      "options": ["Trait value shortcuts like is_integral_v<T> = is_integral<T>::value", "Virtual function tables", "Exception hierarchies", "RAII lock guards"],
      "answer": 0,
      "explain": "The C++17 _v trait aliases (e.g. std::is_integral_v<T>) are variable templates defined as the ::value of the corresponding trait, giving a concise value form."
    },
    {
      "type": "mcq",
      "tag": "this->",
      "question": "If a dependent base has an overloaded member and the derived class also declares one, what does this->m find?",
      "options": ["Ordinary member lookup on this-> finds the derived class's m first (hiding the base's), same as normal name hiding", "It always calls the base version", "It calls both", "It is ambiguous and fails"],
      "answer": 0,
      "explain": "this-> only changes the lookup timing/dependence; normal name-hiding still applies, so a same-named member in the derived class hides the base's unless brought in via using."
    },
    {
      "type": "mcq",
      "tag": "zero init",
      "question": "What does 'default-initialization' of a scalar do?",
      "options": ["Leaves it with an indeterminate value (no initialization performed)", "Sets it to zero", "Sets it to the type's maximum", "Throws an exception"],
      "answer": 0,
      "explain": "Default-initializing a scalar (e.g. int x;) performs no initialization, leaving an indeterminate value. Value-initialization (int x{};) is what zeroes it."
    },
    {
      "type": "mcq",
      "tag": "zero init",
      "question": "What does 'default-initialization' of a scalar do?",
      "options": ["Leaves it with an indeterminate value (no initialization performed)", "Sets it to zero", "Sets it to the type's maximum", "Throws an exception"],
      "answer": 0,
      "explain": "Default-initializing a scalar (e.g. int x;) performs no initialization, leaving an indeterminate value. Value-initialization (int x{};) is what zeroes it."
    },
    {
      "type": "mcq",
      "tag": "typename",
      "question": "Since C++20, in a simple-type-specifier or type-id context, what happens to a dependent qualified name?",
      "options": ["It is implicitly treated as a type, so typename may be omitted where only a type is valid", "It is always treated as a value", "It becomes ill-formed", "It requires the template keyword instead"],
      "answer": 0,
      "explain": "C++20 made typename optional in contexts where only a type can appear (type-id, simple-type-specifier), assuming a dependent qualified name is a type there."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "A member enumerator accessed as T::Color::Red inside a template — is it dependent?",
      "options": ["Yes — anything qualified by the template parameter T is dependent and resolved at instantiation", "No — enumerators are never dependent", "Only if Color is a class", "Only the Red part is dependent"],
      "answer": 0,
      "explain": "Because the access is rooted in the template parameter T, the whole qualified name is dependent and its meaning is fixed only when T is known at instantiation."
    },
    {
      "type": "mcq",
      "tag": "two-phase",
      "question": "Which names get their lookup deferred to the second phase (instantiation)?",
      "options": ["Dependent names — those whose meaning relies on template parameters", "All names in the template", "Only names inside function bodies", "Only type names"],
      "answer": 0,
      "explain": "Only dependent names are deferred to instantiation; non-dependent names are resolved during the first (definition-time) phase."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "Is the expression 'T{}' type-dependent inside a template?",
      "options": ["Yes — its type is T, which depends on the template parameter, so it is type-dependent", "No — braces make it non-dependent", "Only if T is a class", "It is value-dependent but not type-dependent"],
      "answer": 0,
      "explain": "T{} has type T, and since T is a template parameter, the expression is type-dependent and its exact meaning is finalized at instantiation."
    },
    {
      "type": "mcq",
      "tag": "typename",
      "question": "Which is a valid reason NOT to need typename for a nested name in a template?",
      "options": ["The nested name refers to a member of the CURRENT instantiation whose kind (type/non-type) is already known", "Because the template has only one parameter", "Because the file uses 'using namespace std;'", "Because the nested name is short"],
      "answer": 0,
      "explain": "When the qualifier names the current instantiation, the compiler already knows the members and whether each is a type, so typename can be unnecessary in that case."
    },
    {
      "type": "mcq",
      "tag": "variable template",
      "question": "Can a variable template have a non-type template parameter?",
      "options": ["Yes — e.g. template<int N> constexpr int square = N * N;", "No — only type parameters are allowed", "No — variable templates take no parameters", "Only if it is also constexpr-forbidden"],
      "answer": 0,
      "explain": "Variable templates can be parameterized by type or non-type parameters, e.g. template<int N> constexpr int square = N*N; used as square<5>."
    },
    {
      "type": "mcq",
      "tag": "two-phase",
      "question": "Why must you sometimes write this-> even though it feels redundant to programmers?",
      "options": ["Because the standard's two-phase lookup deliberately excludes dependent bases from unqualified lookup to keep name binding predictable", "Because compilers are buggy", "Because this-> is faster", "Because it is required by all C++ style guides"],
      "answer": 0,
      "explain": "It's a deliberate language rule: dependent-base members are excluded from first-phase unqualified lookup so that name meanings don't silently change per instantiation. this-> opts into second-phase lookup."
    },
    {
      "type": "mcq",
      "tag": "template keyword",
      "question": "If you omit a needed '.template', what typically happens?",
      "options": ["A confusing compile error, because '<' is parsed as less-than and the expression no longer makes sense", "The program silently uses the wrong overload at runtime", "Nothing — it is optional", "A linker error only"],
      "answer": 0,
      "explain": "Without the disambiguator, the parser treats '<' as a comparison operator, producing a syntax/semantic error that often looks unrelated to the real cause."
    },
    {
      "type": "mcq",
      "tag": "zero init",
      "question": "For 'T x = T();' with T a scalar template type, the result is:",
      "options": ["Zero — T() value-initializes a scalar to 0, then copy-initializes x", "Indeterminate", "A compile error for scalar T", "The maximum value of T"],
      "answer": 0,
      "explain": "T() value-initializes, giving 0 for scalars; x is then initialized from it. This is a classic pre-C++11 idiom for portably zeroing a dependent value."
    },
    {
      "type": "mcq",
      "tag": "dependent name",
      "question": "Which best distinguishes type-dependent from value-dependent expressions?",
      "options": ["Type-dependent: the expression's TYPE depends on a template parameter; value-dependent: its VALUE (as a constant) depends on one", "They are the same thing", "Value-dependent expressions are always type-dependent", "Type-dependent expressions cannot be constants"],
      "answer": 0,
      "explain": "Type-dependence concerns whether the expression's type relies on template parameters; value-dependence concerns whether its constant value does. An expression can be one, both, or neither."
    },
    {
      "type": "mcq",
      "tag": "two-phase",
      "question": "Which of these is checked in phase ONE (definition) rather than phase two?",
      "options": ["Syntax and non-dependent name resolution in the template body", "Whether a dependent base has a particular member", "The result of ADL for dependent calls", "Instantiation of member functions"],
      "answer": 0,
      "explain": "Phase one validates syntax and binds non-dependent names at definition. Dependent-base member checks, dependent-call ADL, and instantiation all belong to phase two."
    }
  ]
};

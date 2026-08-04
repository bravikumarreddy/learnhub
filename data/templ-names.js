/* ===== C++ Templates — Names, Lookup & Instantiation ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["templ-names"] = {
  title: "C++ Templates — Names, Lookup & Instantiation",
  subtitle: "Two-phase lookup, dependent names & ADL, injected-class-name, points of instantiation and explicit / extern instantiation.",
  crumb: "C++ Templates",
  questions: [
    {
      "type": "mcq",
      "tag": "Two-Phase Lookup",
      "question": "In C++'s two-phase name lookup, what happens during the first phase (at the point the template is defined)?",
      "options": [
        "Only syntax and non-dependent names are checked; dependent names are looked up later",
        "The entire template is fully type-checked as if all template arguments were already known",
        "Nothing is checked; all checking is deferred until instantiation",
        "Only the template's return type is validated against its declaration"
      ],
      "answer": 0,
      "explain": "Phase 1 checks syntax and binds/checks names that do not depend on template parameters. Names that depend on the parameters are resolved in phase 2 at instantiation."
    },
    {
      "type": "mcq",
      "tag": "Two-Phase Lookup",
      "question": "During the second phase of two-phase lookup, which names are (re)looked-up for a template instantiation?",
      "options": [
        "Dependent names, using the actual template arguments",
        "All names in the template, from scratch",
        "Only names declared 'static' in the template",
        "Only names appearing in the template's parameter list"
      ],
      "answer": 0,
      "explain": "Phase 2 occurs at each point of instantiation and resolves dependent names using the concrete template arguments; non-dependent names were already bound in phase 1."
    },
    {
      "type": "mcq",
      "tag": "Phase-1 Error",
      "question": "In 'template<typename T> void f(){ undeclared_symbol(); }', the name undeclared_symbol is not declared anywhere and does not depend on T. When is this an error?",
      "options": [
        "At phase 1 (template definition), even if f is never instantiated",
        "Only when f is instantiated with a specific T",
        "Only at link time",
        "Never; unqualified calls are always deferred"
      ],
      "answer": 0,
      "explain": "undeclared_symbol is a non-dependent name, so it must be found by ordinary lookup at definition time. A conforming compiler diagnoses it in phase 1 regardless of instantiation."
    },
    {
      "type": "mcq",
      "tag": "Dependent Name",
      "question": "Which of the following makes a name 'dependent' inside a template?",
      "options": [
        "It depends in some way on a template parameter",
        "It contains an underscore",
        "It is declared after the template",
        "It is used more than once"
      ],
      "answer": 0,
      "explain": "A name is dependent when its meaning relies on a template parameter (e.g. a type derived from T, or a call whose argument types involve T), so its lookup is postponed to instantiation."
    },
    {
      "type": "code",
      "tag": "typename",
      "question": "This is intended to declare a local variable x. Why does it fail to compile?",
      "code": "template<typename T>\nvoid f() {\n    T::value_type x;   // intended: declare x\n}",
      "options": [
        "T::value_type is a dependent name assumed to be a non-type; 'typename' is required to treat it as a type",
        "You cannot access nested names of a template parameter",
        "value_type is a reserved identifier",
        "x must be initialized"
      ],
      "answer": 0,
      "explain": "A dependent qualified name is assumed to name a non-type unless prefixed with 'typename'. Without it, 'T::value_type x;' parses as a multiplication/expression, not a declaration."
    },
    {
      "type": "code",
      "tag": "template disambig",
      "question": "What is the role of the 'template' keyword in this member access?",
      "code": "template<typename T>\nvoid f(T p) {\n    p.template get<int>();\n}",
      "options": [
        "It tells the parser that dependent member 'get' is a template, so '<' begins a template argument list",
        "It re-declares get as a new template",
        "It is optional stylistic noise",
        "It forces get to be called at compile time"
      ],
      "answer": 0,
      "explain": "When a dependent member is a member template, the 'template' disambiguator is required so '<' is parsed as the start of template arguments rather than the less-than operator."
    },
    {
      "type": "mcq",
      "tag": "ADL",
      "question": "Argument-Dependent Lookup (ADL) adds which additional scopes to the set searched for an unqualified function call?",
      "options": [
        "The namespaces and classes associated with the types of the call's arguments",
        "Every namespace in the translation unit",
        "Only the global namespace",
        "The scopes of the caller's base classes only"
      ],
      "answer": 0,
      "explain": "ADL augments ordinary lookup by also searching the associated namespaces and classes of the argument types, which is how operators and free functions are found without qualification."
    },
    {
      "type": "code",
      "tag": "ADL in template",
      "question": "For the call call(N::S{}), how is g found?",
      "code": "namespace N { struct S{}; void g(S){} }\ntemplate<typename T>\nvoid call(T t){ g(t); }   // call(N::S{})",
      "options": [
        "g is a dependent call; at instantiation ADL finds N::g via the argument type N::S",
        "g must be visible at the definition of call or it is an error",
        "g is found by ordinary lookup in the global namespace",
        "The call is ambiguous and rejected"
      ],
      "answer": 0,
      "explain": "g(t) has an argument whose type depends on T, so the call is dependent. At instantiation ADL searches namespace N (associated with N::S) and finds N::g."
    },
    {
      "type": "mcq",
      "tag": "ADL + Phase-1",
      "question": "For a dependent function call in a template, how do ordinary lookup and ADL split across the two phases?",
      "options": [
        "Ordinary lookup uses declarations visible at the definition; ADL uses declarations visible at the point of instantiation",
        "Both ordinary lookup and ADL are done entirely at instantiation",
        "Both are done entirely at definition",
        "Only ADL runs, never ordinary lookup"
      ],
      "answer": 0,
      "explain": "For dependent calls, the ordinary-lookup part is bound with the template definition context, while the ADL part additionally considers declarations visible from the instantiation context."
    },
    {
      "type": "code",
      "tag": "Non-ADL name",
      "question": "helper is only declared AFTER this template. For the int call helper(42), does the later declaration help?",
      "code": "template<typename T>\nvoid f(T t){\n    helper(t);    // dependent\n    helper(42);   // non-dependent argument\n}\nvoid helper(int);",
      "options": [
        "No; helper(42) is non-dependent and int has no associated namespace, so it needs a declaration visible at definition",
        "Yes; all calls in templates are deferred to instantiation",
        "Yes; the later declaration is always found by ADL",
        "No; helper(t) also fails for the same reason"
      ],
      "answer": 0,
      "explain": "helper(42) is a non-dependent call and fundamental types have no associated namespaces, so ADL cannot rescue it. It must be visible via ordinary lookup at the definition."
    },
    {
      "type": "mcq",
      "tag": "Associated NS",
      "question": "Which type has NO associated namespace/class for ADL purposes?",
      "options": [
        "A fundamental type like int or double",
        "A class type",
        "An enumeration type",
        "A class template specialization"
      ],
      "answer": 0,
      "explain": "Fundamental types carry no associated namespaces or classes, so ADL contributes nothing for arguments of such types; only user-defined types drive ADL."
    },
    {
      "type": "code",
      "tag": "Injected-class-name",
      "question": "Inside Node, what does the unqualified name 'Node' in 'Node* next' refer to?",
      "code": "template<typename T>\nstruct Node {\n    Node* next;   // what is 'Node' here?\n};",
      "options": [
        "The injected-class-name: Node<T>, the current specialization",
        "The class template Node with no arguments, which is an error",
        "A distinct type unrelated to Node<T>",
        "Node<void> by default"
      ],
      "answer": 0,
      "explain": "Inside a class template, the injected-class-name lets you use the template's own name as a shorthand for the current instantiation, here equivalent to Node<T>*."
    },
    {
      "type": "mcq",
      "tag": "Injected-class-name",
      "question": "Inside a class template C, are the injected-class-name C and the written-out C<T> the same type?",
      "options": [
        "Yes; the injected-class-name C is equivalent to C<T> inside the class",
        "No; C means C<void>",
        "No; bare C is ill-formed inside its own body",
        "Only if T is default-constructible"
      ],
      "answer": 0,
      "explain": "The injected-class-name C names the current specialization C<T>, so the two denote the same type inside the class template."
    },
    {
      "type": "mcq",
      "tag": "Injected-class-name",
      "question": "In a derived class template, why can the injected-class-name of a dependent base sometimes need qualification with 'typename' or explicit template arguments?",
      "options": [
        "Because a name from a dependent base is not found by ordinary unqualified lookup and may be ambiguous with the template",
        "Because injected-class-names are always non-dependent",
        "Because base classes have no injected-class-name",
        "Because the derived class hides all base names permanently"
      ],
      "answer": 0,
      "explain": "Names from dependent bases are not visible to unqualified lookup, so the compiler will not automatically consult the base; you must qualify to reach the base's injected-class-name or members."
    },
    {
      "type": "code",
      "tag": "Dependent base",
      "question": "Why does the call h() inside Der::g fail to compile?",
      "code": "template<typename T> struct Base { void h(); };\ntemplate<typename T> struct Der : Base<T> {\n    void g(){ h(); }   // error\n};",
      "options": [
        "h is in a dependent base and is not found by unqualified lookup; use this->h() or Base<T>::h()",
        "h must be declared virtual",
        "Der cannot call non-const members",
        "h is private by default"
      ],
      "answer": 0,
      "explain": "Because Base<T> is dependent, unqualified lookup does not search it in phase 1. Qualify the call (this->h() or Base<T>::h()) to make it a dependent name resolved at instantiation."
    },
    {
      "type": "code",
      "tag": "this->",
      "question": "What does prefixing the call with this-> accomplish here?",
      "code": "template<typename T>\nstruct D : T {\n    void f(){ this->member(); }\n};",
      "options": [
        "It makes 'member' a dependent name, deferring lookup into the dependent base T until instantiation",
        "It is required by all member calls in templates",
        "It calls member on a copy of *this",
        "It disables ADL for member"
      ],
      "answer": 0,
      "explain": "this-> turns member into a dependent name (member of the current instantiation), so lookup is postponed to phase 2 where the base T is known and searched."
    },
    {
      "type": "mcq",
      "tag": "POI",
      "question": "What is a 'point of instantiation' (POI) for a function template specialization used in a translation unit?",
      "options": [
        "A location in the source where the specialization's definition is conceptually inserted for instantiation",
        "The line where the template is first declared",
        "The address of the generated function in memory",
        "The start of the translation unit only"
      ],
      "answer": 0,
      "explain": "A POI is the point where the compiler acts as if the instantiated definition appears, determining which surrounding declarations are visible for phase-2 lookup."
    },
    {
      "type": "mcq",
      "tag": "POI location",
      "question": "For a function or member function template, where is the point of instantiation placed relative to the referencing statement?",
      "options": [
        "Immediately after the nearest enclosing namespace-scope declaration containing the use",
        "Exactly at the referencing statement, inside the function body",
        "At the very top of the file",
        "At the closing brace of main()"
      ],
      "answer": 0,
      "explain": "For function templates the POI is right after the enclosing namespace-scope declaration/definition that contains the use, not inside the referencing function's body."
    },
    {
      "type": "mcq",
      "tag": "POI class",
      "question": "How does the point of instantiation for a CLASS template specialization differ from that of a function template?",
      "options": [
        "The class template's POI is immediately BEFORE the enclosing namespace-scope declaration containing the use",
        "It is identical to the function template rule",
        "A class template has no point of instantiation",
        "It is always at end of file"
      ],
      "answer": 0,
      "explain": "A class template specialization's POI is placed just before the nearest enclosing namespace-scope declaration/definition that requires the instantiation, whereas a function's is just after."
    },
    {
      "type": "mcq",
      "tag": "Multiple POIs",
      "question": "A template specialization can have multiple points of instantiation in one translation unit. What does the standard require of these?",
      "options": [
        "They must yield equivalent instantiations; if they differ in meaning the program is ill-formed (no diagnostic required)",
        "Only the first POI is ever used",
        "Multiple POIs are forbidden",
        "Each POI produces a distinct, independent function"
      ],
      "answer": 0,
      "explain": "The program is valid only if all POIs would produce equivalent results; if lookup at different POIs would differ meaningfully, behavior is undefined/ill-formed NDR."
    },
    {
      "type": "mcq",
      "tag": "End-of-TU POI",
      "question": "What additional point of instantiation exists at the end of a translation unit?",
      "options": [
        "An end-of-TU POI is added for every specialization that was implicitly instantiated in that TU",
        "None; POIs only occur at first use",
        "Only for class templates, never functions",
        "Only for templates marked 'inline'"
      ],
      "answer": 0,
      "explain": "The end of the TU is also a POI for each implicitly instantiated specialization; declarations added later in the file can therefore participate in ADL at that final POI."
    },
    {
      "type": "code",
      "tag": "End-of-TU ADL",
      "question": "g is declared only later in the same file, after use(). Can the end-of-TU POI find it via ADL?",
      "code": "template<typename T> void use(T t){ g(t); }\nstruct X{};\nint main(){ use(X{}); }\nvoid g(X);   // declared after use",
      "options": [
        "Possibly yes if the two POIs agree; if the first POI and end-of-TU POI disagree, the program is ill-formed NDR",
        "Always yes; ADL sees the whole file",
        "Always no; ADL never crosses the point of use",
        "Yes, guaranteed and well-defined"
      ],
      "answer": 0,
      "explain": "Different POIs (at the use vs. end-of-TU) could see different declaration sets. If they would resolve differently, the program is ill-formed with no diagnostic required."
    },
    {
      "type": "mcq",
      "tag": "Implicit inst.",
      "question": "What triggers implicit (on-demand) instantiation of a class template specialization?",
      "options": [
        "A use requiring the type to be complete, e.g. defining an object, accessing a member, or applying sizeof",
        "Merely naming the type in a pointer or reference declaration",
        "Any mention of the class template name anywhere",
        "Only an explicit instantiation directive"
      ],
      "answer": 0,
      "explain": "The specialization is implicitly instantiated when its completeness is needed. A pointer/reference to it, by contrast, does not force instantiation because the type may stay incomplete."
    },
    {
      "type": "mcq",
      "tag": "Incomplete OK",
      "question": "Given 'template<typename T> struct S;' (declared, not defined), does the declaration 'S<int>* p;' require S<int> to be instantiated?",
      "options": [
        "No; a pointer to S<int> does not require it to be complete, so no instantiation occurs",
        "Yes; any use of S<int> instantiates it",
        "No; but only because S is undefined",
        "Yes; pointers always force instantiation"
      ],
      "answer": 0,
      "explain": "Declaring a pointer/reference to a class template specialization does not need a complete type, so it does not trigger implicit instantiation."
    },
    {
      "type": "mcq",
      "tag": "Lazy members",
      "question": "When a class template is implicitly instantiated, which of its member functions get instantiated?",
      "options": [
        "Only the members that are actually used (odr-used) are instantiated",
        "All member functions, always",
        "None; members are never instantiated implicitly",
        "Only the constructor and destructor"
      ],
      "answer": 0,
      "explain": "Instantiation is lazy: instantiating the class does not instantiate every member. A member function is instantiated only when it is used."
    },
    {
      "type": "code",
      "tag": "Lazy members",
      "question": "bad() contains an expression that is invalid for T=int, but bad() is never called. Does this compile?",
      "code": "template<typename T> struct W {\n    void ok(){}\n    void bad(){ T::nope(); }   // ill-formed for int\n};\nW<int> w; w.ok();   // bad() never called",
      "options": [
        "Yes; bad() is never used, so it is not instantiated and its body is not checked in phase 2",
        "No; instantiating W<int> instantiates all members",
        "No; T::nope() fails during phase 1",
        "Yes; but only because int has a nope()"
      ],
      "answer": 0,
      "explain": "Members are instantiated lazily. Since bad() is never odr-used, its body is never instantiated for W<int>, so the invalid T::nope() is never checked."
    },
    {
      "type": "mcq",
      "tag": "Explicit inst.",
      "question": "What does an explicit instantiation definition, e.g. 'template struct Vector<int>;', do?",
      "options": [
        "Forces instantiation of the specialization (and its members) in that translation unit, producing definitions",
        "Declares that Vector<int> exists but generates nothing",
        "Suppresses instantiation of Vector<int>",
        "Creates a template specialization with new behavior"
      ],
      "answer": 0,
      "explain": "An explicit instantiation definition eagerly instantiates the named specialization and its members in the current TU, which is useful for controlling code bloat and build times."
    },
    {
      "type": "mcq",
      "tag": "Explicit inst. members",
      "question": "How does explicit instantiation of a class template differ from implicit instantiation regarding members?",
      "options": [
        "Explicit instantiation instantiates ALL members, not just the used ones",
        "It instantiates fewer members than implicit",
        "It instantiates only virtual members",
        "There is no difference"
      ],
      "answer": 0,
      "explain": "Unlike lazy implicit instantiation, an explicit instantiation definition instantiates every member of the class template (those that can be instantiated), which can surface errors implicit use would hide."
    },
    {
      "type": "mcq",
      "tag": "extern template",
      "question": "What does the declaration 'extern template class Vector<int>;' mean?",
      "options": [
        "Suppress implicit instantiation of Vector<int> in this TU; assume it is instantiated elsewhere",
        "Force instantiation of Vector<int> here",
        "Declare Vector<int> as an external variable",
        "Export the template to other modules"
      ],
      "answer": 0,
      "explain": "An 'extern template' (explicit instantiation declaration) tells the compiler not to implicitly instantiate that specialization in this TU, relying on a definition provided in another TU."
    },
    {
      "type": "mcq",
      "tag": "extern template",
      "question": "What is the primary practical benefit of 'extern template' declarations?",
      "options": [
        "Reducing redundant instantiations across TUs, cutting compile time and object-file size",
        "Making templates run faster at runtime",
        "Allowing templates without definitions",
        "Enabling ADL for template parameters"
      ],
      "answer": 0,
      "explain": "extern template prevents the same specialization from being instantiated in every TU that uses it; you instantiate it once (explicitly) elsewhere, reducing build cost and bloat."
    },
    {
      "type": "code",
      "tag": "extern + explicit",
      "question": "A header contains 'extern template class Vec<int>;'. Where must the matching explicit instantiation DEFINITION appear?",
      "code": "// header.h\nextern template class Vec<int>;\n// somewhere.cpp\ntemplate class Vec<int>;",
      "options": [
        "In exactly one translation unit, as 'template class Vec<int>;'",
        "In every translation unit that includes the header",
        "Nowhere; extern template needs no definition",
        "In the header itself"
      ],
      "answer": 0,
      "explain": "The extern declaration suppresses local instantiation, so a single explicit instantiation definition must exist in one TU to provide the actual code, avoiding a link error."
    },
    {
      "type": "mcq",
      "tag": "ODR templates",
      "question": "The one-definition rule allows a template's definition to appear in multiple translation units provided what?",
      "options": [
        "Each definition is token-for-token identical and resolves the same names to the same entities",
        "They are compiled with different optimization levels",
        "Only one TU may ever define a template",
        "They differ only in whitespace and comments randomly"
      ],
      "answer": 0,
      "explain": "Templates are typically defined in headers and thus appear in many TUs; the ODR requires those definitions to be identical in tokens and in the meaning of the names they use."
    },
    {
      "type": "mcq",
      "tag": "ODR merge",
      "question": "When the same implicit specialization is generated in multiple TUs, what does the linker/toolchain do?",
      "options": [
        "Treats them as the same entity and keeps a single definition (they have external, inline-like linkage semantics)",
        "Links all copies causing a multiple-definition error",
        "Keeps a separate copy per TU that never merges",
        "Rejects the program as an ODR violation"
      ],
      "answer": 0,
      "explain": "Implicitly instantiated specializations behave like inline definitions for linkage: identical instantiations across TUs are merged into one, so no multiple-definition error occurs."
    },
    {
      "type": "code",
      "tag": "Name hiding",
      "question": "For the call call(N::S{}), which g is called?",
      "code": "int g(int);\nnamespace N { struct S{}; }\nint g(N::S);\ntemplate<typename T> int call(T t){ return g(t); }\n// call(N::S{})",
      "options": [
        "The global g(N::S), found by ordinary lookup from the definition context",
        "No g is found; ADL fails",
        "g(int) after converting S to int",
        "It is ambiguous"
      ],
      "answer": 0,
      "explain": "Both g overloads are visible at the definition by ordinary lookup; overload resolution picks g(N::S) as the exact match for the N::S argument."
    },
    {
      "type": "mcq",
      "tag": "Qualified lookup",
      "question": "For a QUALIFIED dependent name like T::type in a template, does ADL participate?",
      "options": [
        "No; ADL applies only to unqualified function-call names, not to qualified name lookup",
        "Yes; ADL always applies",
        "Only if T is a namespace",
        "Only for member function calls"
      ],
      "answer": 0,
      "explain": "ADL is triggered only by unqualified function calls. Qualified names (X::y) use ordinary qualified lookup within the named scope; ADL never contributes there."
    },
    {
      "type": "mcq",
      "tag": "ADL suppressed",
      "question": "In a template body, how does writing the call as (g)(t) instead of g(t) affect lookup of g?",
      "options": [
        "Parenthesizing the callee suppresses ADL; only ordinary lookup is used for g",
        "It has no effect on lookup",
        "It forces ADL and disables ordinary lookup",
        "It makes g a dependent name"
      ],
      "answer": 0,
      "explain": "Writing (g)(t) rather than g(t) turns off ADL for the call, so g must be found by ordinary unqualified lookup alone."
    },
    {
      "type": "mcq",
      "tag": "friend injection",
      "question": "A friend function defined inside a class template (a 'hidden friend') is found by which mechanism?",
      "options": [
        "Argument-Dependent Lookup only, via the enclosing class as an associated class",
        "Ordinary unqualified lookup from anywhere",
        "Qualified lookup with the class name",
        "It is never callable"
      ],
      "answer": 0,
      "explain": "An in-class-defined friend is not visible to ordinary lookup; it is found only through ADL when one of the call's arguments has the befriending class as an associated class."
    },
    {
      "type": "code",
      "tag": "Hidden friend",
      "question": "How is operator+ found for the expression a + b?",
      "code": "template<typename T>\nstruct Num {\n    friend Num operator+(Num, Num){ return {}; }\n};\nNum<int> a,b; auto c = a + b;",
      "options": [
        "By ADL: Num<int> arguments make Num<int> an associated class, exposing the in-class friend",
        "By ordinary lookup at namespace scope",
        "It cannot be found and is an error",
        "By qualified lookup Num<int>::operator+"
      ],
      "answer": 0,
      "explain": "The friend operator+ is only injected for ADL. Because a and b are Num<int>, ADL considers the class and finds the hidden friend during overload resolution."
    },
    {
      "type": "code",
      "tag": "friend gotcha",
      "question": "How many distinct ping functions exist after instantiating A<int> and A<double>?",
      "code": "template<typename T> struct A { friend void ping(A){} };\nA<int> x; ping(x);\nping(A<double>{});",
      "options": [
        "Each instantiation injects its own ping; ADL finds ping(A<int>) and ping(A<double>) separately",
        "Only one ping exists for all A",
        "None are visible without qualification",
        "ping is ambiguous for both calls"
      ],
      "answer": 0,
      "explain": "A friend defined in a class template is injected per specialization. Instantiating A<int> and A<double> injects two distinct ping functions, each found via ADL on its own argument type."
    },
    {
      "type": "mcq",
      "tag": "friend not injected",
      "question": "Why can a hidden friend that is DEFINED in a class template not be called with an unqualified name that has no argument of that class type?",
      "options": [
        "Because it is only reachable via ADL, which needs an argument whose associated class is the befriending class",
        "Because friends are private",
        "Because friend functions cannot take arguments",
        "Because template friends are always deleted"
      ],
      "answer": 0,
      "explain": "Without an argument of the class type, ADL does not consider that class, and since the friend is invisible to ordinary lookup, there is no way to name it."
    },
    {
      "type": "code",
      "tag": "Non-dependent op",
      "question": "Inside the body's a.v==b.v, is the inner == a dependent call?",
      "code": "template<typename T> struct Wrap { T v; };\ntemplate<typename T>\nbool operator==(Wrap<T> a, Wrap<T> b){\n    return a.v == b.v;   // a.v, b.v have type T\n}",
      "options": [
        "Yes; a.v and b.v have type T, so operator== on them is a dependent call resolved at instantiation",
        "No; it always uses the built-in int ==",
        "No; it recursively calls this operator==",
        "It is a phase-1 error"
      ],
      "answer": 0,
      "explain": "a.v and b.v are of type T, so the == between them is a dependent expression; the actual operator is chosen at instantiation via ordinary lookup + ADL on T."
    },
    {
      "type": "mcq",
      "tag": "Value-dependent",
      "question": "A non-type template parameter N is used as 'array[N]'. The expression involving N is best described as:",
      "options": [
        "Value-dependent, so its value is not known until instantiation",
        "Type-dependent, needing 'typename'",
        "Non-dependent, fully known at definition",
        "An error inside templates"
      ],
      "answer": 0,
      "explain": "Expressions using non-type parameters are value-dependent; the concrete value is only fixed at instantiation, though the array declaration itself is well-formed in phase 1."
    },
    {
      "type": "mcq",
      "tag": "Current inst.",
      "question": "The 'current instantiation' refers to which type inside a class template's own definition?",
      "options": [
        "The class template specialization being defined, e.g. C<T> inside template<class T> struct C",
        "Any specialization of the template",
        "Only fully specialized versions",
        "The base class of the template"
      ],
      "answer": 0,
      "explain": "Within a class template, the current instantiation is the enclosing specialization (like C<T>); members of the current instantiation get special, more lenient dependent-name treatment."
    },
    {
      "type": "code",
      "tag": "Current inst.",
      "question": "Do 'type' and 'C::type' need the 'typename' keyword here?",
      "code": "template<typename T>\nstruct C {\n    using type = int;\n    void f(){ type x; C::type y; }\n};",
      "options": [
        "No; C is the current instantiation, so members like C::type are known to be types without 'typename'",
        "Yes; both need 'typename'",
        "Only C::type needs 'typename'",
        "It is ill-formed regardless"
      ],
      "answer": 0,
      "explain": "Members of the current instantiation are looked up in the template definition, so the compiler already knows 'type' names a type; no 'typename' disambiguator is required."
    },
    {
      "type": "mcq",
      "tag": "Unknown special.",
      "question": "Why do members accessed through an UNKNOWN specialization (a dependent base you can't see into) require 'typename'/'template' disambiguators, unlike the current instantiation?",
      "options": [
        "Because the compiler cannot know their kind (type/template/value) until the specialization is chosen at instantiation",
        "Because dependent bases are always empty",
        "Because such members are always types",
        "Because the standard forbids inheriting from templates"
      ],
      "answer": 0,
      "explain": "For a member of an unknown specialization the compiler has no definition to inspect in phase 1, so you must state its kind explicitly with typename/template."
    },
    {
      "type": "code",
      "tag": "static member",
      "question": "When is S<char>::count instantiated?",
      "code": "template<typename T> struct S { static int count; };\ntemplate<typename T> int S<T>::count = 0;\nint main(){ return S<char>::count; }",
      "options": [
        "Only when S<char>::count is odr-used, as here in main",
        "As soon as the template is defined",
        "Never; static members aren't instantiated",
        "Once per translation unit unconditionally"
      ],
      "answer": 0,
      "explain": "Static data members of class templates are instantiated lazily, only when odr-used. Merely defining the template does not create S<char>::count."
    },
    {
      "type": "mcq",
      "tag": "Nondependent bind",
      "question": "A non-dependent name used in a template is bound at the point of definition. What is the consequence if a better-matching overload is declared LATER?",
      "options": [
        "The later overload is ignored for that use; binding was fixed at the definition",
        "The later overload always wins",
        "The program is ill-formed",
        "The call becomes ambiguous"
      ],
      "answer": 0,
      "explain": "Non-dependent names are resolved once, at definition. Declarations appearing after the template definition cannot change that binding (unlike dependent calls, which see the instantiation context)."
    },
    {
      "type": "code",
      "tag": "Dependent overload",
      "question": "Which log is called for trace(5)?",
      "code": "void log(long);\ntemplate<typename T> void trace(T t){ log(t); }\nvoid log(int);\nint main(){ trace(5); }",
      "options": [
        "log(long); log(t) is dependent, but ordinary lookup sees only log(long) from the definition and int has no ADL namespace",
        "log(int), because it is declared before main",
        "It is ambiguous",
        "Neither; a phase-1 error occurs"
      ],
      "answer": 0,
      "explain": "log(t) is dependent, but int contributes no associated namespaces, so ADL adds nothing. Only the definition-context declaration log(long) is visible, and 5 converts to long."
    },
    {
      "type": "mcq",
      "tag": "Template def context",
      "question": "The set of declarations used for the ordinary-lookup part of a dependent call is fixed by which context?",
      "options": [
        "The template definition context (declarations visible where the template is defined)",
        "The instantiation context only",
        "The caller's function scope",
        "The global namespace at end of file"
      ],
      "answer": 0,
      "explain": "Ordinary lookup for dependent names uses the template's definition context; only the ADL portion additionally consults the instantiation context."
    },
    {
      "type": "mcq",
      "tag": "Instantiation context",
      "question": "The 'instantiation context' contributes which declarations to a dependent call's lookup?",
      "options": [
        "Those found by ADL from the associated namespaces/classes, visible at the point of instantiation",
        "All declarations of the entire program",
        "Only declarations in the same function",
        "None; instantiation context is irrelevant to lookup"
      ],
      "answer": 0,
      "explain": "The instantiation context supplies the ADL-reachable declarations (from the argument types' associated scopes) that are visible at the POI, combined with the definition-context ordinary lookup."
    },
    {
      "type": "code",
      "tag": "template-template",
      "question": "Is C<T> a dependent type here?",
      "code": "template<template<typename> class C, typename T>\nvoid f(){ C<T> obj; }",
      "options": [
        "Yes; C is a template template parameter and C<T> depends on both parameters, resolved at instantiation",
        "No; C<T> is always std::vector",
        "No; template template parameters are non-dependent",
        "It is a syntax error"
      ],
      "answer": 0,
      "explain": "C<T> uses a template template parameter and a type parameter, so it is a dependent type whose meaning is determined when f is instantiated with concrete C and T."
    },
    {
      "type": "mcq",
      "tag": "Alias template",
      "question": "How are names in an alias template's definition treated with respect to dependence?",
      "options": [
        "The alias is transparently substituted; dependence follows from the aliased type using the alias's arguments",
        "Alias templates are never dependent",
        "Alias templates create a new independent scope with no dependence",
        "They always require 'typename'"
      ],
      "answer": 0,
      "explain": "An alias template is replaced by its definition with arguments substituted; whether the result is dependent follows from the substituted type, not from the alias name itself."
    },
    {
      "type": "mcq",
      "tag": "friend template",
      "question": "In 'class Box { template<typename T> friend void peek(T); };', does this in-class friend DECLARATION make peek callable via ordinary lookup outside Box?",
      "options": [
        "No; a friend declaration alone does not introduce a name into the enclosing namespace for ordinary lookup",
        "Yes; peek is now a global function",
        "Yes; peek becomes a member of Box",
        "No; friend templates are illegal"
      ],
      "answer": 0,
      "explain": "A friend declaration grants access but does not make the name visible to ordinary lookup at namespace scope; the function must be declared/defined separately (or found via ADL if defined in-class)."
    },
    {
      "type": "mcq",
      "tag": "Two-phase history",
      "question": "Before compilers implemented true two-phase lookup, a common non-conforming behavior was to:",
      "options": [
        "Defer nearly all name lookup to instantiation, accepting code that omits 'typename'/'this->' and finds later declarations",
        "Reject all templates that used dependent names",
        "Instantiate every member eagerly",
        "Ignore ADL entirely"
      ],
      "answer": 0,
      "explain": "Some older compilers (notably early MSVC) delayed all lookup to instantiation, which leniently accepted non-conforming code lacking disambiguators and relying on late declarations."
    },
    {
      "type": "mcq",
      "tag": "Missing typename",
      "question": "Why is 'typename' needed in the return type of 'template<typename T> typename T::result_type run(T t);'?",
      "options": [
        "T::result_type is a dependent qualified name assumed to be a value unless 'typename' marks it as a type",
        "typename declares a new template parameter",
        "It is optional here",
        "typename makes run a template"
      ],
      "answer": 0,
      "explain": "Because T::result_type depends on T, the compiler defaults to treating it as a non-type; 'typename' is required so it is parsed as a type in the return position."
    },
    {
      "type": "mcq",
      "tag": "typename C++20",
      "question": "In which contexts did C++20 relax the requirement to write 'typename' before dependent type names?",
      "options": [
        "Contexts where only a type can appear (e.g. return types, member declarations, aliases) allow omitting 'typename'",
        "Everywhere; 'typename' is never needed in C++20",
        "Only inside lambdas",
        "Nowhere; the rules are unchanged"
      ],
      "answer": 0,
      "explain": "C++20 made 'typename' optional in positions where the grammar permits only a type, though it is still required where a name could be a type or a value."
    },
    {
      "type": "mcq",
      "tag": "POI vs ODR",
      "question": "Why does the notion of point of instantiation matter for correctness rather than just being an implementation detail?",
      "options": [
        "Because it defines exactly which declarations are visible for phase-2 dependent-name resolution",
        "Because it sets the runtime call order",
        "Because it names the object file",
        "Because it decides inlining"
      ],
      "answer": 0,
      "explain": "The POI fixes the visible declaration set for resolving dependent names in phase 2; different POIs can therefore change which functions a template call resolves to."
    },
    {
      "type": "mcq",
      "tag": "Injected as template",
      "question": "Can the injected-class-name of a class template be used as a template (e.g. C<U> for a DIFFERENT argument) inside the class?",
      "options": [
        "Yes; the injected-class-name can be used with explicit arguments to name a different specialization, e.g. C<U>",
        "No; it can only ever mean the current instantiation",
        "No; it is not a name at all",
        "Only in static member functions"
      ],
      "answer": 0,
      "explain": "The injected-class-name doubles as the template name: bare C means the current instantiation, but C<U> can name other specializations of the same template."
    },
    {
      "type": "mcq",
      "tag": "Base injected",
      "question": "In 'template<typename T> struct D : B<T> { D() : B() {} };', does 'B()' in the mem-initializer list refer to the base subobject?",
      "options": [
        "Yes; the base's injected-class-name B denotes B<T>, so B() initializes the base subobject",
        "No; B() is ambiguous and must be B<T>()",
        "No; you cannot use injected names of a base",
        "Only if B has a default constructor named differently"
      ],
      "answer": 0,
      "explain": "The base class B<T> contributes its injected-class-name B, which is usable in the mem-initializer to refer to that base specialization."
    },
    {
      "type": "mcq",
      "tag": "Explicit inst. decl",
      "question": "An explicit instantiation DECLARATION uses the 'extern template' form. How does it differ syntactically from an explicit instantiation DEFINITION?",
      "options": [
        "The declaration adds the 'extern' keyword; without 'extern' it is a definition that generates code",
        "The declaration adds 'inline'",
        "There is no syntactic difference",
        "The definition adds 'extern'"
      ],
      "answer": 0,
      "explain": "'template class C<int>;' is a definition (emits code); prefixing 'extern' makes it a declaration that suppresses instantiation in that TU."
    },
    {
      "type": "mcq",
      "tag": "ADL classes",
      "question": "For a class type argument, ADL's associated CLASSES include which of the following?",
      "options": [
        "The class itself, its direct and indirect base classes, and any enclosing class",
        "Only the class itself",
        "Every class in the program",
        "Only classes with the same name"
      ],
      "answer": 0,
      "explain": "Associated classes for a class-type argument include the class, all its bases, and enclosing classes, and the associated namespaces are those in which these classes are defined."
    },
    {
      "type": "code",
      "tag": "friend in namespace",
      "question": "In which namespace is the injected friend 'tag' considered to live for ADL?",
      "code": "namespace N {\n  template<typename T> struct H { friend void tag(H){} };\n}\nN::H<int> h; tag(h);",
      "options": [
        "Namespace N, since the befriending class H is in N; ADL on N::H<int> searches N",
        "The global namespace",
        "No namespace; friends are unscoped",
        "Namespace std"
      ],
      "answer": 0,
      "explain": "A hidden friend belongs to the innermost enclosing namespace of the class (N). ADL on an N::H<int> argument searches N and finds tag."
    },
    {
      "type": "mcq",
      "tag": "Instantiation depth",
      "question": "Implementations impose a maximum instantiation depth primarily to guard against what?",
      "options": [
        "Runaway recursive template instantiation that would otherwise never terminate",
        "Excessive runtime recursion",
        "Too many overloads",
        "ADL searching too many namespaces"
      ],
      "answer": 0,
      "explain": "Recursive instantiation (a template instantiating itself with new arguments) can be unbounded, so implementations cap the depth (commonly a few hundred to a thousand) to fail gracefully."
    },
    {
      "type": "code",
      "tag": "Dependent switch",
      "question": "For run(Z{}) versus run(1.0), which h is chosen in each?",
      "code": "void h(double);\ntemplate<typename T> void run(T t){ h(t); }\nstruct Z{}; void h(Z);\nint main(){ run(Z{}); run(1.0); }",
      "options": [
        "run(Z{}) calls h(Z) via ADL; run(1.0) calls h(double) via ordinary lookup (double has no ADL namespace)",
        "Both call h(double)",
        "Both call h(Z)",
        "run(Z{}) fails to find h(Z)"
      ],
      "answer": 0,
      "explain": "h(t) is dependent. For Z, ADL adds h(Z) from the global namespace; for double, ADL adds nothing, so only the definition-visible h(double) applies."
    },
    {
      "type": "mcq",
      "tag": "Vtable POI",
      "question": "For a class template with virtual functions, why do implementations often instantiate all virtual members even if unused?",
      "options": [
        "Because the vtable references every virtual function, so they are effectively odr-used when the class is instantiated",
        "Because virtual functions cannot be templates",
        "Because the standard forbids lazy virtuals",
        "Because ADL requires them"
      ],
      "answer": 0,
      "explain": "The virtual table must contain pointers to all virtual functions, so instantiating a class with virtuals typically forces those members to be instantiated regardless of direct use."
    },
    {
      "type": "mcq",
      "tag": "Qualified vs ADL",
      "question": "For 'namespace N{ struct S{}; void f(S){} }' used in 'template<typename T> void call(T t){ N::f(t); }', does qualifying the call as N::f change the lookup behavior?",
      "options": [
        "Yes; N::f is a qualified name, so ADL is not used and f is looked up only within N",
        "No; ADL still applies to qualified names",
        "It becomes a phase-1 error",
        "It calls a global f"
      ],
      "answer": 0,
      "explain": "A qualified call N::f uses ordinary qualified lookup restricted to namespace N; ADL is only triggered by unqualified call names, so it plays no role here."
    },
    {
      "type": "mcq",
      "tag": "Definition required",
      "question": "For implicit instantiation to succeed at a POI, the template's DEFINITION (not just declaration) must be:",
      "options": [
        "Visible in the same translation unit at that POI",
        "Provided by the linker automatically",
        "Located in a precompiled header only",
        "Unnecessary; a declaration suffices"
      ],
      "answer": 0,
      "explain": "Because instantiation generates code from the template body, the full definition must be visible in the TU; this is why templates are usually defined in headers."
    },
    {
      "type": "mcq",
      "tag": "SFINAE boundary",
      "question": "Errors that occur during template argument substitution into the immediate context (SFINAE) versus errors in the instantiated body differ how?",
      "options": [
        "Substitution failures in the immediate context are not errors (remove the candidate); errors deep in the body are hard errors",
        "Both are always hard errors",
        "Both are silently ignored",
        "Body errors trigger SFINAE too"
      ],
      "answer": 0,
      "explain": "SFINAE only applies to failures in the immediate context of substitution (signatures); an error arising while instantiating the function body is a hard error, not a substitution failure."
    },
    {
      "type": "code",
      "tag": "Delayed body",
      "question": "Taking the address &f<int> - is the body instantiated, and does it compile?",
      "code": "template<typename T> int f(T t){ return t.size(); }\nint main(){ auto p = &f<int>; }",
      "options": [
        "Yes; taking the address odr-uses f<int>, forcing body instantiation, so t.size() on int is an error",
        "No; addresses never instantiate bodies",
        "No; only calling instantiates the body",
        "Yes, but t.size() is fine for int"
      ],
      "answer": 0,
      "explain": "Forming a pointer to a specialization odr-uses it and forces the body to be instantiated; instantiating f<int> then fails because int has no size() member."
    },
    {
      "type": "mcq",
      "tag": "Two definitions",
      "question": "If two translation units both implicitly instantiate Stack<int> and the resulting code differs (e.g. due to different visible declarations affecting a dependent call), the program is:",
      "options": [
        "Ill-formed, no diagnostic required (an ODR violation)",
        "Well-defined; the linker picks one",
        "A compile error in both TUs",
        "Fine as long as both compile"
      ],
      "answer": 0,
      "explain": "The ODR requires that all instantiations of the same specialization mean the same thing; if visible declarations cause them to differ, it is an ODR violation with no required diagnostic."
    },
    {
      "type": "mcq",
      "tag": "Non-dependent const",
      "question": "A template 'template<typename T> void f(){ int a[SIZE]; }' uses SIZE, a global constant declared AFTER the template. Is this valid?",
      "options": [
        "No; SIZE is a non-dependent name and must be visible at the template definition",
        "Yes; it is found at instantiation via ADL",
        "Yes; non-type names are always deferred",
        "No; but only because arrays are dependent"
      ],
      "answer": 0,
      "explain": "SIZE does not depend on T, so it is a non-dependent name bound at definition. Declaring it after the template means ordinary lookup cannot find it in phase 1 - an error."
    },
    {
      "type": "mcq",
      "tag": "Inline instantiation",
      "question": "Which linkage-related property lets identical implicit instantiations in different TUs coexist without violating the ODR's single-definition rule?",
      "options": [
        "They are given vague (COMDAT/inline-like) linkage so duplicates are folded to one",
        "They have internal linkage in each TU",
        "They have no linkage at all",
        "The compiler renames each copy"
      ],
      "answer": 0,
      "explain": "Instantiated specializations get vague linkage (COMDAT sections / inline semantics), so the linker keeps a single copy from among identical duplicates across TUs."
    },
    {
      "type": "code",
      "tag": "typename in nested",
      "question": "What is wrong with 'Outer<T>::Inner x;'?",
      "code": "template<typename T> struct Outer { struct Inner{}; };\ntemplate<typename T>\nvoid f(){ Outer<T>::Inner x; }",
      "options": [
        "Outer<T>::Inner is a dependent type name and needs 'typename': typename Outer<T>::Inner x;",
        "Inner is private",
        "You cannot instantiate nested classes",
        "Outer<T> must be complete first"
      ],
      "answer": 0,
      "explain": "Outer<T> is a dependent type, so Outer<T>::Inner is a dependent qualified name assumed to be a non-type; 'typename' is required to declare x of that type."
    },
    {
      "type": "code",
      "tag": "Nested dependent",
      "question": "Why are BOTH 'typename' and 'template' needed in this declaration?",
      "code": "template<typename T>\nvoid f(){\n    typename T::template rebind<int>::other x;\n}",
      "options": [
        "'typename' marks the whole qualified name as a type; 'template' marks 'rebind' as a member template so '<int>' is an argument list",
        "Only 'typename' is actually required",
        "'template' declares rebind; 'typename' names x",
        "Both are redundant"
      ],
      "answer": 0,
      "explain": "rebind is a dependent member template, needing the 'template' disambiguator for its argument list, and the overall dependent qualified name needs 'typename' to be treated as a type."
    },
    {
      "type": "mcq",
      "tag": "POI ordering",
      "question": "Consider a template used at two places in a file with a relevant declaration in between. Why can the POI rules make this subtle?",
      "options": [
        "Because each use has its own POI seeing a different set of declarations, and the end-of-TU POI adds another",
        "Because only the last use matters",
        "Because POIs are randomly ordered",
        "Because declarations between uses are ignored"
      ],
      "answer": 0,
      "explain": "Distinct uses create distinct POIs with potentially different visible declarations, and the end-of-TU POI adds a further set; the program is valid only if they all agree."
    }
  ]
};

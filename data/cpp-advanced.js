/* ===== C++ — Exceptions, Scope & I/O =====
   Original question bank generated for LearnHub. Engine shape:
   { type: "mcq"|"code", tag, question, code?, options[], answer (0-based), explain }
   71 questions. Presented in random order by the quiz engine.
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-advanced"] = {
  title: "C++ — Exceptions, Scope & I/O",
  subtitle: "Exception safety, RAII, namespaces/ADL & iostreams.",
  crumb: "C++",
  questions: [
    {
      "type": "code",
      "tag": "Catch order",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <stdexcept>\nint main() {\n    try {\n        throw std::runtime_error(\"boom\");\n    } catch (const std::exception& e) {\n        std::cout << \"base\";\n    } catch (const std::runtime_error& e) {\n        std::cout << \"derived\";\n    }\n}",
      "options": [
        "base",
        "derived",
        "Compile error: unreachable handler",
        "Runtime crash (std::terminate)"
      ],
      "answer": 0,
      "explain": "Handlers are tried top-to-bottom and the FIRST one whose type can catch the exception wins, not the most-derived match. Since runtime_error is-a exception, the base handler catches it and prints 'base'; the derived handler is unreachable (most compilers warn). Always order catch clauses derived-before-base."
    },
    {
      "type": "code",
      "tag": "Slicing",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct E { virtual const char* who() const { return \"E\"; } };\nstruct D : E { const char* who() const override { return \"D\"; } };\nint main() {\n    try {\n        throw D{};\n    } catch (E e) {\n        std::cout << e.who();\n    }\n}",
      "options": [
        "D",
        "E",
        "Compile error",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Catching by value copies the thrown object into a parameter of static type E, slicing off the D part, so the virtual call resolves to E::who and prints 'E'. Catching by reference (catch (const E&)) would preserve the dynamic type and print 'D'. Always catch by (const) reference."
    },
    {
      "type": "code",
      "tag": "Rethrow",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct E { virtual const char* who() const { return \"E\"; } };\nstruct D : E { const char* who() const override { return \"D\"; } };\nvoid f() {\n    try { throw D{}; }\n    catch (E& e) { throw e; }\n}\nint main() {\n    try { f(); }\n    catch (E& e) { std::cout << e.who(); }\n}",
      "options": [
        "D",
        "E",
        "Compile error",
        "std::terminate is called"
      ],
      "answer": 1,
      "explain": "`throw e;` creates a NEW exception object by copying the static type of e (which is E), slicing the D subobject away, so the outer handler prints 'E'. Writing `throw;` (with no operand) rethrows the original D object and would print 'D'. This is the classic rethrow-slicing trap."
    },
    {
      "type": "code",
      "tag": "Destructor throw",
      "question": "What is the result of running this program?",
      "code": "#include <iostream>\nstruct Bomb { ~Bomb() { throw 42; } };\nint main() {\n    try {\n        Bomb b;\n        throw 1;\n    } catch (int) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "caught",
        "std::terminate is called (program aborts)",
        "1",
        "Compile error"
      ],
      "answer": 1,
      "explain": "`throw 1` starts stack unwinding, which destroys b, but ~Bomb throws while another exception is in flight. Throwing during unwinding calls std::terminate. (Independently, in C++11 destructors are implicitly noexcept, so ~Bomb throwing would terminate anyway.) Never let a destructor emit an exception."
    },
    {
      "type": "code",
      "tag": "noexcept",
      "question": "What happens when this program runs?",
      "code": "#include <iostream>\nvoid g() noexcept {\n    throw 1;\n}\nint main() {\n    try {\n        g();\n    } catch (int) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "caught",
        "std::terminate is called",
        "Compile error: throw in noexcept function",
        "Nothing is printed, returns 0"
      ],
      "answer": 1,
      "explain": "noexcept is a promise, not a compile-time ban: the code compiles, but when the exception actually tries to escape the noexcept boundary, std::terminate is invoked before it can reach main's handler. The catch in main never runs."
    },
    {
      "type": "code",
      "tag": "noexcept scope",
      "question": "What does this program print?",
      "code": "#include <iostream>\nvoid g() noexcept {\n    try { throw 1; }\n    catch (int) { std::cout << \"caught\"; }\n}\nint main() { g(); }",
      "options": [
        "caught",
        "std::terminate is called",
        "Compile error",
        "Nothing is printed"
      ],
      "answer": 0,
      "explain": "noexcept only forbids an exception from ESCAPING the function. An exception thrown and fully handled inside the same noexcept function never crosses the boundary, so it is caught normally and 'caught' is printed. noexcept constrains propagation, not internal control flow."
    },
    {
      "type": "code",
      "tag": "Construction",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct A { A(){std::cout<<\"A\";} ~A(){std::cout<<\"~A\";} };\nstruct B {\n    A a;\n    B(){ std::cout<<\"B\"; throw 1; }\n    ~B(){ std::cout<<\"~B\"; }\n};\nint main() {\n    try { B b; }\n    catch (int) { std::cout << \"C\"; }\n}",
      "options": [
        "AB~A~AC",
        "AB~AC",
        "AB~A~B C",
        "ABC"
      ],
      "answer": 1,
      "explain": "Member a is fully constructed ('A'), then B's body prints 'B' and throws. Because the B object never finished constructing, ~B is NOT called, but the already-constructed member a IS destroyed ('~A'), then the handler prints 'C'. Result: AB~AC. A partially constructed object's own destructor never runs."
    },
    {
      "type": "code",
      "tag": "No conversion",
      "question": "What does this program print?",
      "code": "#include <iostream>\nint main() {\n    try {\n        throw 42;\n    } catch (long) {\n        std::cout << \"long\";\n    } catch (...) {\n        std::cout << \"any\";\n    }\n}",
      "options": [
        "long",
        "any",
        "Compile error",
        "std::terminate is called"
      ],
      "answer": 1,
      "explain": "Exception matching does NOT apply the usual arithmetic conversions/promotions. An int is not a long, so catch(long) does not match; only the exact type (plus base-class and qualification/pointer conversions) matches. The catch(...) handler catches it and prints 'any'."
    },
    {
      "type": "mcq",
      "tag": "Guarantees",
      "question": "What does the 'strong exception safety guarantee' promise about an operation?",
      "options": [
        "It has no observable effect at all under any circumstance",
        "If it throws, program state is unchanged (as if the call never happened) — the operation is a rollback",
        "It never throws, guaranteed by noexcept",
        "If it throws, all objects remain destructible and no resources leak, but state may have changed"
      ],
      "answer": 1,
      "explain": "The STRONG guarantee means commit-or-rollback: on failure, observable state is exactly as before the call. Option 4 describes the weaker BASIC guarantee (no leaks, valid-but-unspecified state). The NOTHROW guarantee is 'never throws'. Copy-and-swap is the canonical way to achieve the strong guarantee."
    },
    {
      "type": "mcq",
      "tag": "Guarantees",
      "question": "What does the 'basic exception safety guarantee' promise?",
      "options": [
        "No resources are leaked and every object is left in a valid (but possibly changed) state",
        "The operation is atomic: it either completes fully or has no effect",
        "The operation is guaranteed never to throw",
        "Any thrown exception is automatically caught and logged"
      ],
      "answer": 0,
      "explain": "The BASIC guarantee: invariants are preserved and nothing leaks, but objects may be left in a valid-yet-unspecified state (e.g., a container that partially changed). Option 2 is the STRONGER strong guarantee. The basic guarantee is the minimum a well-behaved operation should offer."
    },
    {
      "type": "mcq",
      "tag": "Move safety",
      "question": "When std::vector reallocates its buffer (e.g., on push_back growth), how does it decide between moving and copying existing elements?",
      "options": [
        "It always uses copies to be safe",
        "If T's move constructor is noexcept, elements are moved; otherwise they are copied to preserve the strong guarantee",
        "It always uses moves for performance",
        "It uses moves only if T has no copy constructor"
      ],
      "answer": 1,
      "explain": "During reallocation std::vector must not lose data if construction fails. If T's move constructor is noexcept, moving can't throw so it's safe; otherwise vector falls back to copying (via move_if_noexcept) so a throw leaves the source intact. This is why marking move operations noexcept is a real performance lever."
    },
    {
      "type": "code",
      "tag": "Empty throw",
      "question": "What happens when this program runs?",
      "code": "#include <iostream>\nint main() {\n    try {\n        throw;\n    } catch (...) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "caught",
        "std::terminate is called",
        "Compile error: throw needs an operand",
        "Nothing; returns 0"
      ],
      "answer": 1,
      "explain": "A bare `throw;` rethrows the exception CURRENTLY being handled. Here there is no active exception, so the standard specifies std::terminate is called immediately. `throw;` is only valid inside (dynamically) a catch handler's active exception."
    },
    {
      "type": "code",
      "tag": "Unwinding order",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct G { char c; ~G(){ std::cout << c; } };\nint main() {\n    try {\n        G a{'1'}; G b{'2'}; G c{'3'};\n        throw 0;\n    } catch (int) {\n        std::cout << 'X';\n    }\n}",
      "options": [
        "123X",
        "321X",
        "X123",
        "X321"
      ],
      "answer": 1,
      "explain": "Stack unwinding destroys automatic objects in REVERSE order of construction, so ~c, ~b, ~a run, printing 321, then the handler runs printing X: '321X'. RAII cleanup during unwinding always follows the reverse-construction rule."
    },
    {
      "type": "code",
      "tag": "Function try",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct A { A(){ throw 1; } };\nstruct B {\n    A a;\n    B() try : a() {\n        std::cout << \"body\";\n    } catch (...) {\n        std::cout << \"handler\";\n    }\n};\nint main() {\n    try { B b; }\n    catch (...) { std::cout << \"outer\"; }\n}",
      "options": [
        "handler",
        "handlerouter",
        "body",
        "outer"
      ],
      "answer": 1,
      "explain": "A function-try-block on a constructor catches exceptions from the member initializer list, but it CANNOT swallow them: after the handler runs, the exception is automatically rethrown. So it prints 'handler' then the rethrown exception reaches main, printing 'outer'. The body never runs because member a's construction failed."
    },
    {
      "type": "code",
      "tag": "Dtor noexcept",
      "question": "What happens when this program runs? (Note: no other exception is active.)",
      "code": "#include <iostream>\nstruct T { ~T() { throw 1; } };\nint main() {\n    try {\n        T t;\n    } catch (int) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "caught",
        "std::terminate is called",
        "Compile error",
        "Nothing; returns 0"
      ],
      "answer": 1,
      "explain": "There is no other exception in flight here, yet it still terminates: in C++11 a destructor is implicitly noexcept(true) unless declared otherwise, so throwing from ~T violates its noexcept spec and calls std::terminate. To (legally) throw from a destructor you must declare it noexcept(false) — which is still almost always a bug."
    },
    {
      "type": "code",
      "tag": "catch(...)",
      "question": "What is the result of compiling and running this program?",
      "code": "#include <iostream>\nint main() {\n    try {\n        throw 3.14;\n    } catch (...) {\n        std::cout << \"A\";\n    } catch (double) {\n        std::cout << \"B\";\n    }\n}",
      "options": [
        "A",
        "B",
        "Compile error",
        "AB"
      ],
      "answer": 2,
      "explain": "catch(...) must be the LAST handler in a try block; placing another catch clause after it is ill-formed and the program does not compile (GCC: 'catch-all handler must come last'). Reorder so catch(double) precedes catch(...). This is a hard compile error, not a warning."
    },
    {
      "type": "mcq",
      "tag": "terminate",
      "question": "When std::terminate is invoked (e.g. an exception escapes a noexcept function), what is the default behavior?",
      "options": [
        "It resumes execution after the throw site",
        "By default it calls std::abort, terminating the program abnormally",
        "It rethrows the exception to the OS as a signal that can be caught",
        "It unwinds the stack fully, running all destructors, then returns from main"
      ],
      "answer": 1,
      "explain": "std::terminate calls the current terminate handler, which by default calls std::abort — an abnormal, immediate shutdown. Crucially, stack unwinding is NOT guaranteed to have happened, so destructors may not run. That's why a stray exception from a noexcept function or a destructor is so destructive."
    },
    {
      "type": "code",
      "tag": "Scope",
      "question": "What is the result of compiling this program?",
      "code": "#include <iostream>\nint main() {\n    try {\n        int x = 5;\n        throw 1;\n    } catch (int) {\n        std::cout << x;\n    }\n}",
      "options": [
        "5",
        "0",
        "Compile error: x is not in scope",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Variables declared inside the try block are scoped to that block and are already destroyed/out of scope in the catch handler. Referencing x in catch is a name-lookup error, so the program does not compile. To use a value in the handler, declare it before the try."
    },
    {
      "type": "code",
      "tag": "Nested throw",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct Loud {\n    ~Loud() { std::cout << \"~\"; }\n};\nint main() {\n    try {\n        try {\n            Loud l;\n            throw 1;\n        } catch (int) {\n            std::cout << \"inner\";\n            throw;\n        }\n    } catch (int) {\n        std::cout << \"outer\";\n    }\n}",
      "options": [
        "~innerouter",
        "inner~outer",
        "innerouter",
        "innerouter~"
      ],
      "answer": 0,
      "explain": "The inner throw unwinds the inner try, destroying l ('~'), then the inner handler prints 'inner' and `throw;` rethrows the SAME exception, which the outer handler catches and prints 'outer'. Note l is already destroyed before either handler body runs, so the tilde comes first: '~innerouter'."
    },
    {
      "type": "code",
      "tag": "Pointer",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\nint main() {\n    try {\n        int local = 7;\n        throw &local;\n    } catch (int* p) {\n        std::cout << *p;\n    }\n}",
      "options": [
        "7",
        "Undefined behavior: dangling pointer",
        "0",
        "Compile error"
      ],
      "answer": 1,
      "explain": "`local` is an automatic variable inside the try block; when the exception propagates, stack unwinding ends its lifetime, so the thrown pointer dangles. Dereferencing p in the handler is undefined behavior. The thrown VALUE (the pointer) is copied, but what it points to is gone — never throw pointers/references to locals."
    },
    {
      "type": "mcq",
      "tag": "noexcept operator",
      "question": "What does the expression noexcept(f()) evaluate to and do?",
      "options": [
        "It calls f() and returns true if the call didn't throw",
        "It is a compile-time operator that yields true if the expression is declared not to throw, without evaluating f()",
        "It marks f() as noexcept from now on",
        "It returns the number of exceptions f() can throw"
      ],
      "answer": 1,
      "explain": "noexcept(expr) is an unevaluated, compile-time operator: it does NOT run f(); it yields a bool constant that is true iff expr is known not to throw (based on noexcept specifications of the operations involved). It's easy to confuse the noexcept OPERATOR with the noexcept SPECIFIER — the operator queries, it never executes the expression."
    },
    {
      "type": "code",
      "tag": "Base ref",
      "question": "What does this program print? (std::out_of_range derives from std::logic_error.)",
      "code": "#include <iostream>\n#include <stdexcept>\nint main() {\n    try {\n        throw std::out_of_range(\"idx\");\n    } catch (const std::logic_error& e) {\n        std::cout << \"logic\";\n    } catch (const std::exception& e) {\n        std::cout << \"exc\";\n    }\n}",
      "options": [
        "logic",
        "exc",
        "std::terminate is called",
        "Compile error"
      ],
      "answer": 0,
      "explain": "std::out_of_range derives from std::logic_error (which derives from std::exception). Handlers are matched top-to-bottom and a base-class reference catches a derived exception, so the first handler catch(const std::logic_error&) matches and prints 'logic'. Knowing the standard exception hierarchy matters for ordering catch clauses correctly."
    },
    {
      "type": "mcq",
      "tag": "Safety design",
      "question": "You want an assignment operator to provide the strong exception guarantee. Which technique achieves this most directly?",
      "options": [
        "Wrap the whole function body in try/catch and log the error",
        "Perform all operations that might throw on temporaries/copies first, then commit the result with only non-throwing operations (e.g. swap) at the end",
        "Mark the function noexcept so it can't fail",
        "Call std::set_terminate to install a custom recovery routine"
      ],
      "answer": 1,
      "explain": "The copy-and-swap idiom gives the STRONG guarantee: do the throwing work on a temporary, and only when it fully succeeds swap it into place using operations that cannot throw. If any step throws, the original object is untouched. Merely wrapping in try/catch or slapping on noexcept doesn't provide rollback semantics."
    },
    {
      "type": "code",
      "tag": "ADL",
      "question": "What does this program print?",
      "code": "#include <iostream>\nnamespace lib {\n    struct Widget {};\n    void render(const Widget&) { std::cout << \"lib\\n\"; }\n}\nint main() {\n    lib::Widget w;\n    render(w);   // no qualification, no using\n}",
      "options": [
        "Compile error: 'render' was not declared in this scope",
        "lib",
        "Undefined behavior",
        "Compile error: ambiguous call to 'render'"
      ],
      "answer": 1,
      "explain": "Argument-dependent lookup (ADL) adds the namespaces of the argument types to the lookup set for an unqualified function call. Because 'w' has type lib::Widget, namespace lib is searched and lib::render is found, so no 'using' is needed. The tempting 'not declared' answer forgets that ADL runs even when ordinary unqualified lookup finds nothing."
    },
    {
      "type": "code",
      "tag": "ADL",
      "question": "Does this compile, and if so what happens?",
      "code": "namespace num {\n    void twice(int x) { /* ... */ }\n}\nint main() {\n    twice(21);   // built-in argument type\n}",
      "options": [
        "Compiles and calls num::twice",
        "Compile error: 'twice' not declared in this scope",
        "Compiles but is undefined behavior",
        "Compiles only with a warning"
      ],
      "answer": 1,
      "explain": "ADL uses the *associated namespaces* of the argument types, but fundamental types like int have no associated namespace. So the argument 21 never brings num into the lookup set, ordinary lookup finds nothing, and the call fails. ADL is a class/enum/template thing, not a magic 'search everywhere' rule."
    },
    {
      "type": "code",
      "tag": "Hidden friend",
      "question": "Which line, if any, fails to compile?",
      "code": "struct S {\n    friend void ping(S) { }   // hidden friend, defined in-class\n};\nint main() {\n    S s;\n    ping(s);    // A\n    ::ping(s);  // B\n}",
      "options": [
        "Line A fails",
        "Line B fails",
        "Both A and B fail",
        "Neither fails; both compile"
      ],
      "answer": 1,
      "explain": "An inline friend defined inside the class ('hidden friend') is not injected into any enclosing namespace scope; it can be found ONLY by ADL. Line A works because ADL searches S's associated entities. Line B uses qualified lookup (::ping) which does NOT perform ADL, so the global namespace has no 'ping' and it fails."
    },
    {
      "type": "code",
      "tag": "Qualified lookup",
      "question": "Which call fails to compile?",
      "code": "namespace N {\n    struct T {};\n    void f(T) {}\n}\nint main() {\n    N::T t;\n    f(t);      // 1\n    N::f(t);   // 2\n    ::f(t);    // 3\n}",
      "options": [
        "Call 1",
        "Call 2",
        "Call 3",
        "None; all compile"
      ],
      "answer": 2,
      "explain": "Call 1 succeeds via ADL, and call 2 is an explicit qualified name. Call 3 is also qualified (::f names the global namespace explicitly), and qualified lookup never triggers ADL, so it only looks in the global scope where no 'f' exists. Explicit qualification is exactly how you *disable* ADL."
    },
    {
      "type": "mcq",
      "tag": "static vs unnamed",
      "question": "You want a helper *type* (a struct) usable only within one .cpp file, with internal linkage so it never collides across translation units. What is the correct tool?",
      "options": [
        "Prefix the struct with the 'static' keyword: static struct Helper { ... };",
        "Define the struct inside an unnamed (anonymous) namespace",
        "Mark every member function of the struct 'static'",
        "Both 'static struct' and an unnamed namespace work equally well"
      ],
      "answer": 1,
      "explain": "The 'static' storage-class keyword cannot be applied to a class/struct definition to give the type internal linkage; it is only for variables and functions. An unnamed namespace, however, gives everything inside it (including type names) internal linkage. This is the classic reason unnamed namespaces superseded file-static for anything beyond plain functions and variables."
    },
    {
      "type": "code",
      "tag": "using-directive",
      "question": "Where does the error occur?",
      "code": "namespace A { int value; }\nnamespace B { int value; }\nusing namespace A;   // 1\nusing namespace B;   // 2\nint main() {\n    value = 7;       // 3\n}",
      "options": [
        "Line 1",
        "Line 2",
        "Line 3",
        "No error; B's 'value' wins because it comes last"
      ],
      "answer": 2,
      "explain": "A using-directive does NOT merge or override; both A::value and B::value become candidates visible in the enclosing scope. Having two using-directives is fine (lines 1-2 are legal). The ambiguity is only diagnosed when the name is actually *used*, so the error is reported at line 3, not before. Nothing 'wins by being last'."
    },
    {
      "type": "mcq",
      "tag": "using vs directive",
      "question": "What is the key behavioral difference between a using-DECLARATION (using A::x;) and a using-DIRECTIVE (using namespace A;) regarding name conflicts at namespace/global scope?",
      "options": [
        "There is no difference; both just make names visible",
        "A using-declaration can conflict and cause an immediate redeclaration error, while a using-directive's names are merely candidates that error only if an ambiguous use occurs",
        "A using-directive causes immediate errors while a using-declaration defers them",
        "Both defer all conflicts until point of use"
      ],
      "answer": 1,
      "explain": "A using-declaration introduces the name *as if* declared in the current scope, so a subsequent conflicting declaration of the same name is a hard redeclaration error at that point. A using-directive only makes names *available for lookup* (candidates), so a clash is diagnosed lazily, only when an unqualified use is actually ambiguous."
    },
    {
      "type": "code",
      "tag": "Shadowing",
      "question": "What is printed?",
      "code": "#include <iostream>\nint n = 10;\nint main() {\n    int n = 20;\n    std::cout << n << ' ' << ::n << '\\n';\n}",
      "options": [
        "20 20",
        "10 10",
        "20 10",
        "10 20"
      ],
      "answer": 2,
      "explain": "The local 'n' shadows the global one, so unqualified 'n' is 20. The scope-resolution operator with an empty left side, ::n, forces lookup in the global namespace, retrieving the global 10. Result: '20 10'. This ::-prefix trick is the standard way to reach a shadowed global."
    },
    {
      "type": "code",
      "tag": "ADL suppression",
      "question": "Does this compile?",
      "code": "namespace N {\n    struct T {};\n    void act(T) {}\n}\nint main() {\n    int act = 0;    // local variable named 'act'\n    N::T t;\n    act(t);         // <-- here\n}",
      "options": [
        "Yes; ADL still finds N::act",
        "No; 'act' is found as an int, ADL is suppressed, and calling an int fails",
        "Yes, but it is undefined behavior",
        "No; ADL finds two candidates and the call is ambiguous"
      ],
      "answer": 1,
      "explain": "ADL is *suppressed* when ordinary unqualified lookup finds a block-scope declaration that is not a function (here, the local variable 'act'). Lookup stops at the int, so 'act(t)' is an attempt to 'call' an int and fails to compile. A local name shadowing a function name silently disables ADL for that call."
    },
    {
      "type": "code",
      "tag": "Inline namespace",
      "question": "What value is returned?",
      "code": "namespace lib {\n    inline namespace v2 { int api() { return 2; } }\n    namespace v1 { int api() { return 1; } }\n}\nint main() {\n    return lib::api();\n}",
      "options": [
        "1",
        "2",
        "Compile error: ambiguous between v1::api and v2::api",
        "0"
      ],
      "answer": 1,
      "explain": "An inline namespace's members are transparently visible in the enclosing namespace, so lib::api resolves to v2::api and returns 2. v1 is a normal (non-inline) namespace, so v1::api is NOT a candidate for the name 'lib::api' and there is no ambiguity. Inline namespaces are the mechanism behind versioned APIs and symbol versioning."
    },
    {
      "type": "code",
      "tag": "ADL operator",
      "question": "What does this print?",
      "code": "#include <iostream>\nnamespace geo {\n    struct Point { int x, y; };\n    std::ostream& operator<<(std::ostream& os, const Point& p) {\n        return os << p.x;\n    }\n}\nint main() {\n    geo::Point p{5, 9};\n    std::cout << p << '\\n';\n}",
      "options": [
        "Compile error: no matching operator<< for geo::Point",
        "5",
        "59",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Even though operator<< lives in namespace geo, the expression 'std::cout << p' is an unqualified operator call whose operand 'p' has type geo::Point, so ADL pulls in geo and finds geo::operator<<. This is exactly why stream operators for a type are conventionally placed in the same namespace as the type."
    },
    {
      "type": "mcq",
      "tag": "swap idiom",
      "question": "Why is the idiom 'using std::swap; swap(a, b);' preferred over writing 'std::swap(a, b);' directly in generic code?",
      "options": [
        "It is purely a style choice with no functional difference",
        "The using-declaration makes std::swap a candidate, then unqualified 'swap(a,b)' lets ADL also find a type-specific swap in the argument's namespace and pick the best match",
        "std::swap is deprecated and must not be called qualified",
        "It forces the compiler to always use std::swap regardless of the type"
      ],
      "answer": 1,
      "explain": "Writing std::swap(a,b) qualifies the call and thereby *disables* ADL, locking you into the generic std::swap. The two-step idiom brings std::swap in as a fallback candidate but leaves the call unqualified, so ADL can also discover a more efficient user-provided swap for the argument's own type; overload resolution then chooses the best one."
    },
    {
      "type": "code",
      "tag": "using-declaration",
      "question": "Does this compile?",
      "code": "namespace A { int id; }\nusing A::id;   // using-declaration\nint id;        // <-- here\nint main() { id = 1; }",
      "options": [
        "Yes; the global 'int id' shadows A::id",
        "No; the using-declaration already introduced 'id' at global scope, so 'int id;' is a redeclaration error",
        "Yes; A::id and ::id coexist without issue",
        "No; the error is at 'id = 1;' due to ambiguity"
      ],
      "answer": 1,
      "explain": "A using-declaration acts like a real declaration of the name in the current scope. So after 'using A::id;', the later 'int id;' is a conflicting redeclaration of the same name in the same scope, a hard error at that line. Had it been a using-DIRECTIVE (using namespace A;), the global int would simply shadow A::id with no error."
    },
    {
      "type": "code",
      "tag": "Namespaces",
      "question": "What does this print?",
      "code": "#include <iostream>\nnamespace outer {\n    int x = 1;\n    namespace inner {\n        int x = 2;\n        void show() { std::cout << x; }\n    }\n}\nint main() { outer::inner::show(); }",
      "options": [
        "1",
        "2",
        "Compile error: ambiguous 'x'",
        "12"
      ],
      "answer": 1,
      "explain": "Unqualified lookup inside inner::show proceeds outward through enclosing scopes and stops at the *first* scope that declares the name. inner::x (value 2) is found before outer::x is ever consulted, so it prints 2. Nested namespaces do not merge names; the innermost declaration hides outer ones."
    },
    {
      "type": "mcq",
      "tag": "ADL templates",
      "question": "For the unqualified call 'store(v)' where v has type std::vector<lib::Widget>, which namespaces does ADL add as associated namespaces?",
      "options": [
        "Only std, because that is where vector is declared",
        "Only lib, because that is where Widget is declared",
        "Both std and lib, because template argument types contribute their namespaces too",
        "Neither; ADL does not apply to class templates"
      ],
      "answer": 2,
      "explain": "For a class template specialization, the associated namespaces include that of the template itself (std) AND the associated namespaces of all type template arguments (lib, from lib::Widget). This is why calling an unqualified helper on a std::vector<YourType> can still find a function in YOUR namespace via the element type."
    },
    {
      "type": "code",
      "tag": "Global scope",
      "question": "What is printed?",
      "code": "#include <iostream>\nvoid greet() { std::cout << \"global\"; }\nnamespace app {\n    void greet() { std::cout << \"app\"; }\n    void run() {\n        greet();     // A\n        ::greet();   // B\n    }\n}\nint main() { app::run(); }",
      "options": [
        "appapp",
        "globalglobal",
        "appglobal",
        "globalapp"
      ],
      "answer": 2,
      "explain": "Inside app::run, unqualified 'greet()' (line A) finds app::greet first via enclosing-scope lookup, printing 'app'. Line B uses ::greet to explicitly select the global-scope function, printing 'global'. So the output is 'appglobal'. The leading :: is how you bypass a same-named name in an enclosing namespace."
    },
    {
      "type": "code",
      "tag": "Shadowing",
      "question": "What does this print?",
      "code": "#include <iostream>\nint main() {\n    int v = 1;\n    {\n        std::cout << v;\n        int v = v + 10;   // <-- initializer\n        std::cout << v;\n    }\n}",
      "options": [
        "111",
        "1 followed by undefined behavior",
        "121",
        "Compile error: v redeclared in same expression"
      ],
      "answer": 1,
      "explain": "The inner 'int v' comes into scope at its own declaration point, which is BEFORE its initializer is evaluated. So 'v + 10' reads the just-declared, still-uninitialized inner v, not the outer v=1. Reading that indeterminate value is undefined behavior. A subtle shadowing trap: the name shadows before you'd expect."
    },
    {
      "type": "mcq",
      "tag": "Namespace alias",
      "question": "Which statement about 'namespace short_name = very::long::name;' is TRUE?",
      "options": [
        "It creates a copy of the namespace, so later additions to very::long::name are invisible through short_name",
        "It is an alias: short_name and very::long::name refer to the same namespace, and the alias is only valid in the scope where it is declared",
        "It permanently renames the namespace everywhere in the program",
        "It requires all members of the target namespace to already be defined"
      ],
      "answer": 1,
      "explain": "A namespace alias is just another name bound to the same namespace, not a snapshot or copy, so anything later added to the real namespace is reachable through the alias too. Like any declaration, the alias name is subject to normal scoping: declaring it inside a function or namespace limits where the short name can be used."
    },
    {
      "type": "code",
      "tag": "using-directive",
      "question": "Does this compile and run cleanly?",
      "code": "#include <iostream>\nnamespace A { void f() { std::cout << \"A\"; } }\nnamespace B { void f() { std::cout << \"B\"; } }\nint main() {\n    using namespace A;\n    using namespace B;\n    A::f();\n}",
      "options": [
        "No; the two using-directives conflict immediately",
        "Yes; it prints A",
        "No; the call is ambiguous",
        "Yes; it prints B because B's directive comes last"
      ],
      "answer": 1,
      "explain": "Two using-directives coexist without error, and the ambiguity would only surface on an *unqualified* use of f(). But the call here is A::f(), a fully qualified name, so no ambiguity arises and it simply prints 'A'. Qualification sidesteps the whole using-directive ambiguity problem."
    },
    {
      "type": "code",
      "tag": "ADL enum",
      "question": "Does the call compile?",
      "code": "namespace col {\n    enum Color { Red, Green };\n    void describe(Color) {}\n}\nint main() {\n    col::Color c = col::Red;\n    describe(c);   // unqualified\n}",
      "options": [
        "Yes; ADL associates namespace col via the enum type",
        "No; ADL only works for class types, not enums",
        "No; enumerators are not associated with any namespace",
        "Yes, but only because Color is implicitly convertible to int"
      ],
      "answer": 0,
      "explain": "The associated namespaces for ADL include the innermost enclosing namespace of the argument's type, and this applies to enumeration types too, not just classes. Since c has type col::Color, namespace col is searched and col::describe is found. The 'convertible to int' answer is a red herring; describe takes Color, and ADL is what locates it."
    },
    {
      "type": "mcq",
      "tag": "unnamed namespace",
      "question": "A header file 'util.h' contains 'namespace { int counter = 0; }' and is included by three .cpp files. How many distinct 'counter' objects exist in the final program?",
      "options": [
        "One shared object, like an ordinary global",
        "Three; each translation unit gets its own 'counter' with internal linkage",
        "Zero; unnamed-namespace variables are not allocated",
        "A link error occurs due to multiple definitions of 'counter'"
      ],
      "answer": 1,
      "explain": "Everything in an unnamed namespace has internal linkage, so each translation unit that includes the header gets its OWN private 'counter'. There is no multiple-definition link error precisely because the names don't have external linkage, but the flip side is you do NOT get one shared variable. Putting mutable state in an unnamed namespace inside a header is a classic bug."
    },
    {
      "type": "code",
      "tag": "Name hiding",
      "question": "Does this compile?",
      "code": "struct Base {\n    void g(int) {}\n};\nstruct Derived : Base {\n    void g(double) {}\n};\nint main() {\n    Derived d;\n    d.g(5);   // int argument\n}",
      "options": [
        "Compile error: no matching function",
        "Calls Base::g(int) after promotion",
        "Calls Derived::g(double), converting 5 to 5.0",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Declaring g in Derived HIDES all overloads named g in Base, so Base::g(int) is not even a candidate; member-name lookup stops at Derived. The int argument 5 is therefore implicitly converted to double and Derived::g(double) is called. To un-hide the base overload you would add 'using Base::g;' in Derived."
    },
    {
      "type": "code",
      "tag": "Qualified lookup",
      "question": "What does this print?",
      "code": "#include <iostream>\nnamespace lib {\n    int mode = 1;\n    void bump() { ++mode; }\n}\nint main() {\n    lib::bump();\n    lib::bump();\n    std::cout << lib::mode;\n}",
      "options": [
        "1",
        "2",
        "3",
        "Compile error: 'mode' is private to lib"
      ],
      "answer": 2,
      "explain": "Namespace members are not private; lib::mode is a single object with external linkage that lib::bump increments each call. After two calls it is 3. Namespaces provide name organization, not access control, so there is no privacy error. Answer: 3."
    },
    {
      "type": "mcq",
      "tag": "using in header",
      "question": "Why is putting 'using namespace std;' at global scope in a widely-included HEADER considered a serious defect (not just bad style)?",
      "options": [
        "It slows compilation to a measurable crawl but is otherwise harmless",
        "It silently injects all of std into the global namespace of every including file, which can change overload resolution and cause surprising ambiguities or ADL clashes far from the header",
        "It is a syntax error in headers specifically",
        "It prevents the header from being included more than once"
      ],
      "answer": 1,
      "explain": "A using-directive at global scope in a header leaks into every translation unit that includes it (directly or transitively). This can pull std names into unqualified lookup where user code didn't expect them, altering overload resolution or introducing ambiguities in unrelated files, bugs that are extremely hard to trace back to the header. It compiles fine, which is what makes it dangerous."
    },
    {
      "type": "code",
      "tag": "setw",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <iomanip>\nint main() {\n    std::cout << std::setw(5) << 42 << 7 << '\\n';\n}",
      "options": [
        "\"   427\"",
        "\"   42    7\"",
        "\"42   7\"",
        "\"   42   7\""
      ],
      "answer": 0,
      "explain": "std::setw is a one-shot manipulator: it applies only to the very next output operation. So 42 is padded to width 5 (\"   42\"), but 7 is printed with the default width of 0, giving \"   427\". The trap is assuming setw is sticky like std::hex."
    },
    {
      "type": "code",
      "tag": "setprecision",
      "question": "What is the output?",
      "code": "#include <iostream>\n#include <iomanip>\nint main() {\n    std::cout << std::setprecision(2) << 3.14159 << '\\n';\n}",
      "options": [
        "\"3.14\"",
        "\"3.1\"",
        "\"3.14159\"",
        "\"3.2\""
      ],
      "answer": 1,
      "explain": "In the default (non-fixed) float format, setprecision sets the total number of significant digits, not digits after the decimal point. 3.14159 to 2 significant figures is 3.1: the third significant digit (4) rounds down, so it stays 3.1. You would need std::fixed for setprecision to mean decimal places (which would give 3.14)."
    },
    {
      "type": "code",
      "tag": "setprecision",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <iomanip>\nint main() {\n    std::cout << std::fixed << std::setprecision(2) << 3.14159 << '\\n';\n}",
      "options": [
        "\"3.2\"",
        "\"3.14\"",
        "\"3.141\"",
        "\"3.14159\""
      ],
      "answer": 1,
      "explain": "With std::fixed active, setprecision(2) means exactly 2 digits after the decimal point, so 3.14159 rounds to 3.14. Contrast with the default format where setprecision counts significant digits. Both std::fixed and the precision are sticky and persist for subsequent output."
    },
    {
      "type": "mcq",
      "tag": "boolalpha",
      "question": "After you write `std::cout << std::boolalpha;`, which statement is true?",
      "options": [
        "Only the next bool printed uses \"true\"/\"false\"; the flag then resets",
        "The flag is sticky and affects all future bool output on that stream until std::noboolalpha",
        "It also makes std::cin accept the words \"true\" and \"false\"",
        "It affects both cout and cin because they share the same format flags"
      ],
      "answer": 1,
      "explain": "boolalpha is a sticky format flag (unlike setw), so every subsequent bool inserted into that stream prints as text until you set noboolalpha. It is per-stream, so setting it on cout does not affect cin. (Separately, setting boolalpha on cin WOULD make >> parse the words, but that's a different stream.)"
    },
    {
      "type": "code",
      "tag": "hex",
      "question": "What is printed?",
      "code": "#include <iostream>\nint main() {\n    std::cout << std::hex << 255 << ' ' << 16 << std::dec << ' ' << 16 << '\\n';\n}",
      "options": [
        "\"ff 10 16\"",
        "\"ff 16 16\"",
        "\"255 16 16\"",
        "\"ff 0x10 16\""
      ],
      "answer": 0,
      "explain": "std::hex is sticky, so both 255 (ff) and 16 (10) print in hexadecimal until std::dec switches the base back, making the final 16 print as decimal. std::hex does not add a \"0x\" prefix unless you also use std::showbase, so option 3 is wrong."
    },
    {
      "type": "code",
      "tag": "getline-vs-op",
      "question": "Given input \"42\\nhello world\\n\", what does line hold?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    int n; std::string line;\n    std::cin >> n;\n    std::getline(std::cin, line);\n    std::cout << '[' << line << ']' << '\\n';\n}",
      "options": [
        "\"[hello world]\"",
        "\"[]\"",
        "\"[42]\"",
        "\"[ hello world]\""
      ],
      "answer": 1,
      "explain": "operator>> reads the 42 but leaves the newline after it in the buffer. getline then immediately hits that newline, stops, and returns an empty string. The classic fix is std::cin.ignore(...) or std::ws before getline. This is the single most common getline gotcha."
    },
    {
      "type": "mcq",
      "tag": "stream-state",
      "question": "After `std::cin >> x;` fails to parse an integer (input was \"abc\"), what happens to x and the stream in C++11?",
      "options": [
        "x is set to 0 and the stream's failbit is set",
        "x is left unchanged and the stream's failbit is set",
        "x gets a garbage value and the stream stays good",
        "x is set to 0 but the stream remains good so the next read works"
      ],
      "answer": 0,
      "explain": "Since C++11, a failed numeric extraction sets the value to 0 (in C++03 it was left unmodified) and sets failbit. Until you call cin.clear(), all further >> operations are no-ops. Many people still believe the pre-C++11 rule that x is untouched."
    },
    {
      "type": "code",
      "tag": "loop-bug",
      "question": "With input \"1 2 x 3\", how many numbers does this loop print?",
      "code": "#include <iostream>\nint main() {\n    int n;\n    while (std::cin >> n)\n        std::cout << n << ' ';\n}",
      "options": [
        "It prints \"1 2 \" then stops",
        "It prints \"1 2 3 \"",
        "It loops forever printing \"1 2 \"",
        "It prints \"1 2 0 3 \""
      ],
      "answer": 0,
      "explain": "When >> hits \"x\" it sets failbit; `while (std::cin >> n)` converts the stream to false and the loop exits, so \"3\" is never reached. It does NOT loop forever here because the loop condition itself sees the failed state. (An infinite loop happens only if you keep reading without checking the state, e.g. a for-loop with an inner failing read that never clears.)"
    },
    {
      "type": "code",
      "tag": "clear-ignore",
      "question": "To recover and read the 3 after the bad \"x\" in input \"1 2 x 3\", what must replace the comment?",
      "code": "#include <iostream>\nint main() {\n    int n;\n    while (!(std::cin >> n)) {\n        /* recover here */\n    }\n    std::cout << n;\n}",
      "options": [
        "std::cin.clear(); std::cin.ignore();",
        "std::cin.ignore(); std::cin.clear();",
        "std::cin.clear();",
        "std::cin.sync();"
      ],
      "answer": 0,
      "explain": "You must clear() first to reset the error state, THEN ignore() to discard the offending character(s) from the buffer. If you call ignore() while failbit is still set, ignore does nothing (it's a no-op on a failed stream), so the bad character stays and you loop forever. Order matters."
    },
    {
      "type": "code",
      "tag": "stringstream",
      "question": "What does rest contain?",
      "code": "#include <sstream>\n#include <iostream>\nint main() {\n    std::istringstream iss(\"10 20 30\");\n    int a, b; iss >> a >> b;\n    std::string rest; std::getline(iss, rest);\n    std::cout << '[' << rest << ']';\n}",
      "options": [
        "\"[ 30]\"",
        "\"[30]\"",
        "\"[10 20 30]\"",
        "\"[]\"",
        "\"[20 30]\""
      ],
      "answer": 0,
      "explain": "After reading 10 and 20 with >>, the stream position sits right before the space preceding 30. getline reads the rest of the line verbatim including that leading space, giving \" 30\". >> skips leading whitespace but getline does not, which is why the space survives."
    },
    {
      "type": "code",
      "tag": "stringstream",
      "question": "What is the value of the output?",
      "code": "#include <sstream>\n#include <iostream>\nint main() {\n    std::ostringstream oss;\n    oss << \"x=\" << 5;\n    oss.str(\"reset\");\n    std::cout << oss.str();\n}",
      "options": [
        "\"reset\"",
        "\"resetx=5\"",
        "\"x=5reset\"",
        "\"x=5\""
      ],
      "answer": 0,
      "explain": "str(\"reset\") replaces the entire buffer contents with \"reset\", discarding the previously written \"x=5\". A common misconception is that str(s) appends or that it only sets a prefix; it does neither, it wholesale replaces the buffer. (The write position is a separate matter, but str() here fully overwrites what str() returns.)"
    },
    {
      "type": "mcq",
      "tag": "stringstream",
      "question": "You reuse one std::stringstream across a loop to parse many lines. After a parse fails on one line, subsequent iterations mysteriously fail too. Why?",
      "options": [
        "str() does not clear the error state, so failbit/eofbit persist across ss.str(newLine)",
        "stringstream cannot be reused; you must construct a new one each iteration",
        "str() clears the buffer but not the get pointer, corrupting reads",
        "operator>> permanently disables the stream after any failure"
      ],
      "answer": 0,
      "explain": "Assigning new content with ss.str(newLine) replaces the buffer but does NOT reset the stream state flags. If a previous line set eofbit or failbit, those stick, and every later extraction is a no-op. You must also call ss.clear() each iteration. This is a notorious reuse bug."
    },
    {
      "type": "code",
      "tag": "eof",
      "question": "For a well-formed file of 3 integers, how many times does \"got\" print?",
      "code": "#include <fstream>\n#include <iostream>\nint main() {\n    std::ifstream in(\"nums.txt\"); // contains: 1 2 3\n    int x;\n    while (!in.eof()) {\n        in >> x;\n        std::cout << \"got \" << x << '\\n';\n    }\n}",
      "options": [
        "Exactly 3 times",
        "4 times, with the last line printing a stale/zero value",
        "Exactly 1 time",
        "0 times"
      ],
      "answer": 1,
      "explain": "This is the classic `while (!eof())` bug. After reading 3, eofbit is not yet set; the loop runs a 4th time, >> fails (setting x to 0 and failbit), but you print anyway, producing a bogus 4th line. Always loop on the read itself: `while (in >> x)`, which stops correctly after 3."
    },
    {
      "type": "mcq",
      "tag": "file-open",
      "question": "You do `std::ofstream out(\"log.txt\");` but the write silently produces nothing. Which is the most likely real cause and correct check?",
      "options": [
        "The default open mode is read-only; you must pass std::ios::out",
        "Opening may have failed (e.g. permissions); check `if (!out)` before writing",
        "ofstream truncates on open so all writes are discarded until flush",
        "You must call out.open() separately; the constructor never opens the file"
      ],
      "answer": 1,
      "explain": "ofstream opens for writing by default and the constructor does open the file, but the open can fail (bad path, permissions, read-only dir). Writes to a failed stream are silently ignored, so you must test `if (!out)` (or out.is_open()). Truncation is normal and does not discard later writes."
    },
    {
      "type": "mcq",
      "tag": "file-mode",
      "question": "To append to an existing file without erasing its contents, which open mode is required?",
      "options": [
        "std::ofstream f(\"a.txt\"); — the default appends",
        "std::ofstream f(\"a.txt\", std::ios::app);",
        "std::ofstream f(\"a.txt\", std::ios::out); with a manual seek",
        "std::ofstream f(\"a.txt\", std::ios::in);"
      ],
      "answer": 1,
      "explain": "An ofstream opened in the default mode truncates the file to empty. You must pass std::ios::app to append. std::ios::app forces every write to the end even after seeks, unlike std::ios::ate which only positions at the end initially. The default-mode option silently destroys existing data, which is the trap."
    },
    {
      "type": "code",
      "tag": "getline-delim",
      "question": "Given input \"a,b,c\", what is captured?",
      "code": "#include <sstream>\n#include <iostream>\n#include <string>\nint main() {\n    std::istringstream ss(\"a,b,c\");\n    std::string tok;\n    std::getline(ss, tok, ',');\n    std::getline(ss, tok, ',');\n    std::cout << tok;\n}",
      "options": [
        "\"b\"",
        "\"a\"",
        "\"b,c\"",
        "\",b\""
      ],
      "answer": 0,
      "explain": "getline's third argument sets a custom delimiter. The first call reads up to the first comma (\"a\") and consumes that comma; the second call reads up to the next comma, yielding \"b\". The delimiter is extracted and discarded, so it never appears in the token, ruling out \",b\"."
    },
    {
      "type": "code",
      "tag": "endl-flush",
      "question": "Which statement about these two lines is correct?",
      "code": "std::cout << \"a\" << std::endl;\nstd::cout << \"b\" << '\\n';",
      "options": [
        "Both write a newline, but std::endl also flushes the stream while '\\n' does not",
        "They are byte-for-byte identical in behavior",
        "'\\n' flushes the buffer but std::endl does not",
        "std::endl writes \"\\r\\n\" on all platforms; '\\n' writes just \"\\n\""
      ],
      "answer": 0,
      "explain": "std::endl inserts '\\n' AND flushes the output buffer; '\\n' just inserts the newline and lets the buffer flush on its own schedule. Overusing std::endl in loops is a real performance gotcha because each flush is a costly operation. Neither writes \"\\r\\n\" at the C++ level; that translation is handled by text-mode I/O, not endl."
    },
    {
      "type": "code",
      "tag": "tie-flush",
      "question": "What is guaranteed about the ordering of output and the prompt here?",
      "code": "#include <iostream>\nint main() {\n    int x;\n    std::cout << \"Enter x: \";\n    std::cin >> x;\n}",
      "options": [
        "The prompt may not appear before input because cout is buffered and not flushed",
        "The prompt is guaranteed to appear because cin >> automatically flushes cout via tie()",
        "Nothing prints until the program ends",
        "The prompt appears only if you add std::endl"
      ],
      "answer": 1,
      "explain": "By default std::cin is tied to std::cout (std::cin.tie() == &std::cout), so any input operation on cin first flushes cout. This guarantees the prompt is displayed before the program blocks for input, even without std::endl. If you were to untie them, the prompt could indeed be swallowed by the buffer."
    },
    {
      "type": "code",
      "tag": "width-fill",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <iomanip>\nint main() {\n    std::cout << std::setfill('*') << std::left\n              << std::setw(6) << 42 << '|';\n}",
      "options": [
        "\"42****|\"",
        "\"****42|\"",
        "\"42    |\"",
        "\"000042|\""
      ],
      "answer": 0,
      "explain": "std::left aligns the value to the left within the field, and std::setfill('*') replaces the default space padding, so the fill goes on the right: \"42****\". Both setfill and left are sticky flags. The default (std::right) would give \"****42\", which is the tempting distractor."
    },
    {
      "type": "mcq",
      "tag": "get-pointer",
      "question": "After a plain `char c; std::cin.get(c);` versus `std::cin >> c;`, what is the key difference?",
      "options": [
        "get(c) reads the next character including whitespace/newlines; >> skips leading whitespace first",
        "They are identical for single chars",
        "get(c) skips whitespace; >> reads it",
        "get(c) reads a whole line; >> reads one word"
      ],
      "answer": 0,
      "explain": "operator>> for a char skips leading whitespace (spaces, tabs, newlines) then reads one non-whitespace character. cin.get(c) reads the very next character unconditionally, whitespace included. This distinction matters when you need to detect spaces or newlines that >> would silently discard."
    },
    {
      "type": "code",
      "tag": "failbit-throw",
      "question": "What is the behavior of this program on input \"abc\"?",
      "code": "#include <iostream>\nint main() {\n    std::cin.exceptions(std::ios::failbit);\n    int n;\n    std::cin >> n;\n    std::cout << \"read \" << n;\n}",
      "options": [
        "Prints \"read 0\"",
        "Throws std::ios_base::failure (typically terminating the program)",
        "Prints \"read \" with garbage",
        "Blocks waiting for more input"
      ],
      "answer": 1,
      "explain": "cin.exceptions(std::ios::failbit) tells the stream to throw std::ios_base::failure whenever failbit becomes set. Parsing \"abc\" as int fails, so instead of the silent failbit behavior an exception propagates; if uncaught it calls std::terminate. Without the exceptions() call it would simply print \"read 0\"."
    },
    {
      "type": "code",
      "tag": "peek-unget",
      "question": "What does this print for input \"7x\"?",
      "code": "#include <iostream>\nint main() {\n    int n; char c;\n    std::cin >> n;\n    c = std::cin.peek();\n    std::cout << n << ',' << c;\n}",
      "options": [
        "\"7,x\"",
        "\"7,\\n\"",
        "\"7,7\"",
        "Nothing; peek fails"
      ],
      "answer": 0,
      "explain": "peek() returns the next character in the buffer WITHOUT extracting it. After >> reads 7, the next unread character is 'x', so peek returns 'x' and leaves it in place for a future read. peek does not skip whitespace and does not advance the get pointer, distinguishing it from get()."
    },
    {
      "type": "code",
      "tag": "mixed-precision",
      "question": "What is the output?",
      "code": "#include <iostream>\n#include <iomanip>\nint main() {\n    std::cout << std::setprecision(3) << 1234.5678 << ' '\n              << 0.000123456 << '\\n';\n}",
      "options": [
        "\"1.23e+03 0.000123\"",
        "\"1234.568 0.000\"",
        "\"1234.5 0.000123456\"",
        "\"1235 0.000123\""
      ],
      "answer": 0,
      "explain": "In the default float format, setprecision(3) means 3 significant digits total and the stream uses scientific notation when the exponent is >= the precision, so 1234.5678 becomes 1.23e+03. The small value 0.000123456 to 3 sig figs is 0.000123. Beginners expect 3 decimal places, but that only happens under std::fixed."
    },
    {
      "type": "mcq",
      "tag": "binary-mode",
      "question": "On a text file read with the default (text) mode, which is a genuine cross-platform gotcha?",
      "options": [
        "On Windows, '\\r\\n' in the file is translated to a single '\\n', so byte counts from tellg may not match string lengths",
        "Text mode strips all spaces from each line",
        "Reading in text mode is undefined behavior; you must always use std::ios::binary",
        "Text mode reverses the byte order of multi-byte characters"
      ],
      "answer": 0,
      "explain": "In text mode on Windows, the '\\r\\n' line ending is translated to a single '\\n' on read (and vice versa on write). This means the number of characters your program sees can differ from the on-disk byte count, so positions from tellg/seekg and manual byte arithmetic can be off. Using std::ios::binary disables this translation."
    }
  ]
};

/* ===== Professional C++ — Error Handling & Exception Safety ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["procpp-errors"] = {
  title: "Professional C++ — Error Handling & Exception Safety",
  subtitle: "Exception guarantees, noexcept semantics, stack unwinding, error codes and std::expected.",
  crumb: "Professional C++",
  questions: [
    {
      "type": "mcq",
      "tag": "Exception guarantees",
      "question": "A function documents that it provides the strong exception guarantee. What exactly does that promise?",
      "options": [
        "The function never throws an exception under any circumstances.",
        "If an exception is thrown, all program state affected by the function is left exactly as it was before the call (commit-or-rollback semantics).",
        "If an exception is thrown, no resources are leaked, but the observable state may have partially changed.",
        "The function catches every internal exception and converts it into an error code."
      ],
      "answer": 1,
      "explain": "The strong guarantee is commit-or-rollback: either the operation completes fully, or an exception propagates and everything is rolled back to the pre-call state. Leaving invariants intact but state possibly changed is only the basic guarantee, and never throwing at all is the nothrow guarantee. The classic way to implement the strong guarantee is copy-and-swap: do all throwing work on a copy, then commit with a nothrow swap."
    },
    {
      "type": "mcq",
      "tag": "Strong guarantee",
      "question": "std::vector::push_back provides the strong exception guarantee. During a reallocation, why will a standard library implementation copy the existing elements instead of moving them if the element's move constructor is not declared noexcept?",
      "options": [
        "Copy constructors are always faster than move constructors for reallocation.",
        "The C++ standard forbids calling any move constructor from within a container member function.",
        "If a move constructor threw halfway through the transfer, some elements would already have been moved out of the old buffer and the original state could not be restored; copying keeps the old buffer intact so the operation can be rolled back.",
        "Moving would invalidate iterators, while copying preserves them."
      ],
      "answer": 2,
      "explain": "To keep the strong guarantee, vector uses std::move_if_noexcept-style logic: it only moves elements when the move constructor cannot throw. If a throwing move failed mid-transfer, the source elements would be in a moved-from state and push_back could not roll back. Copying leaves the original buffer untouched, so on failure the vector is unchanged — this is why you should mark your move constructors noexcept."
    },
    {
      "type": "code",
      "tag": "noexcept operator",
      "question": "What does this program print? (Note that f and g are declared but never defined.)",
      "code": "#include <iostream>\n\nvoid f() noexcept;\nvoid g();\n\nint main() {\n    std::cout << noexcept(f()) << noexcept(g()) << '\\n';\n}",
      "options": [
        "10",
        "11",
        "00",
        "It fails to link because f and g have no definition."
      ],
      "answer": 0,
      "explain": "Here noexcept is used as an operator: it is a compile-time query that reports whether its operand expression is potentially-throwing, based on declarations only. f() is declared noexcept so noexcept(f()) is true (1); g() may throw so the result is false (0). The operand is an unevaluated context — f and g are never actually called — so missing definitions cause no link error."
    },
    {
      "type": "code",
      "tag": "noexcept violation",
      "question": "What happens when this program runs?",
      "code": "#include <iostream>\n#include <stdexcept>\n\nvoid boom() noexcept {\n    throw std::runtime_error(\"kaboom\");\n}\n\nint main() {\n    try {\n        boom();\n    } catch (const std::exception& e) {\n        std::cout << \"caught: \" << e.what() << '\\n';\n    }\n}",
      "options": [
        "It prints \"caught: kaboom\" because the try block encloses the call.",
        "std::terminate is called; the exception never reaches the catch handler, and the stack is not even guaranteed to be unwound.",
        "The behavior is undefined, so anything may happen including silently continuing.",
        "It does not compile: a throw expression is ill-formed inside a noexcept function."
      ],
      "answer": 1,
      "explain": "Throwing from a noexcept function is perfectly legal to compile, but when the exception tries to leave the function, std::terminate is called immediately. The enclosing try/catch is irrelevant — the exception never propagates past the noexcept boundary. The standard even leaves it unspecified whether any stack unwinding happens first, which is why noexcept enables optimizations."
    },
    {
      "type": "code",
      "tag": "Throwing destructor",
      "question": "What is the outcome of running this program?",
      "code": "#include <iostream>\n#include <stdexcept>\n\nstruct D {\n    ~D() { throw std::runtime_error(\"from dtor\"); }\n};\n\nint main() {\n    try {\n        D d;\n    } catch (const std::exception& e) {\n        std::cout << \"caught: \" << e.what() << '\\n';\n    }\n}",
      "options": [
        "It prints \"caught: from dtor\" — the destructor runs inside the try block, so the handler catches it.",
        "It prints nothing and exits with status 0.",
        "std::terminate is called, because destructors are implicitly noexcept since C++11 and this one throws.",
        "It fails to compile: throw statements are not allowed in destructors."
      ],
      "answer": 2,
      "explain": "Since C++11, destructors are implicitly declared noexcept (unless a member or base forces otherwise or you write noexcept(false)). The throw is legal syntax, but when the exception attempts to leave the destructor, the noexcept specification is violated and std::terminate runs — even though the object lives inside a try block. This is the core reason the guideline says: never let exceptions escape a destructor."
    },
    {
      "type": "code",
      "tag": "Constructor failure",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <stdexcept>\n\nstruct A {\n    A()  { std::cout << \"A\"; }\n    ~A() { std::cout << \"~A\"; }\n};\n\nstruct B {\n    B()  { std::cout << \"B\"; throw std::runtime_error(\"fail\"); }\n    ~B() { std::cout << \"~B\"; }\n};\n\nstruct C {\n    A a;\n    B b;\n    C()  { std::cout << \"C\"; }\n    ~C() { std::cout << \"~C\"; }\n};\n\nint main() {\n    try {\n        C c;\n    } catch (...) {\n        std::cout << \"X\";\n    }\n}",
      "options": [
        "AB~AX",
        "ABC~C~B~AX",
        "AB~B~AX",
        "ABX"
      ],
      "answer": 0,
      "explain": "Members are constructed in declaration order: a prints \"A\", then b prints \"B\" and throws. Only fully constructed subobjects are destroyed during unwinding, in reverse order — so ~A runs (\"~A\"), but ~B and ~C do not: b never finished constructing and C as a whole was never a complete object. Finally the handler prints \"X\". This is why a half-constructed object never has its own destructor called."
    },
    {
      "type": "code",
      "tag": "Function-try-block",
      "question": "This constructor uses a function-try-block to catch an exception thrown while initializing a member. What does the program print?",
      "code": "#include <iostream>\n#include <stdexcept>\n\nstruct M {\n    M() { throw std::runtime_error(\"member\"); }\n};\n\nstruct H {\n    M m;\n    H() try : m() {\n        std::cout << \"body \";\n    } catch (const std::exception& e) {\n        std::cout << \"handler:\" << e.what() << ' ';\n    }\n};\n\nint main() {\n    try {\n        H h;\n    } catch (const std::exception& e) {\n        std::cout << \"outer:\" << e.what();\n    }\n}",
      "options": [
        "handler:member (the exception is swallowed and h is usable)",
        "handler:member outer:member",
        "outer:member (the function-try-block handler is skipped for member initializers)",
        "body handler:member"
      ],
      "answer": 1,
      "explain": "A function-try-block on a constructor does catch exceptions from the member initializer list, so \"handler:member \" is printed and \"body \" never runs. But a constructor's handler cannot swallow the exception: reaching the end of the handler implicitly rethrows it, because the object could not be constructed. The rethrown exception is then caught in main, printing \"outer:member\". Function-try-blocks are for logging or translating, not suppressing."
    },
    {
      "type": "code",
      "tag": "Rethrow: throw; vs throw e;",
      "question": "What does this program print?",
      "code": "#include <exception>\n#include <iostream>\n\nstruct Base : std::exception {\n    const char* what() const noexcept override { return \"base\"; }\n};\n\nstruct Derived : Base {\n    const char* what() const noexcept override { return \"derived\"; }\n};\n\nvoid forward() {\n    try {\n        throw Derived{};\n    } catch (Base& e) {\n        throw e;   // note: not \"throw;\"\n    }\n}\n\nint main() {\n    try {\n        forward();\n    } catch (const Base& e) {\n        std::cout << e.what();\n    }\n}",
      "options": [
        "derived",
        "base",
        "std::terminate is called because you cannot throw from inside a catch block.",
        "derivedbase"
      ],
      "answer": 1,
      "explain": "\"throw e;\" throws a brand-new exception object copy-initialized from e, and the type of that new object is the static type of e — Base. The Derived part is sliced away, so the outer handler's e.what() prints \"base\". A bare \"throw;\" would have rethrown the original Derived object with no copy and no slicing, printing \"derived\". Always rethrow with \"throw;\"."
    },
    {
      "type": "code",
      "tag": "Catch by value",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nstruct E {\n    virtual const char* name() const { return \"E\"; }\n    virtual ~E() = default;\n};\n\nstruct F : E {\n    const char* name() const override { return \"F\"; }\n};\n\nint main() {\n    try {\n        throw F{};\n    } catch (E e) {   // caught by value\n        std::cout << e.name();\n    }\n}",
      "options": [
        "F, because name() is virtual and dispatches to the thrown object's type",
        "E, because catching by value copies (slices) the F into a plain E",
        "Nothing — an F cannot match a handler for E",
        "std::terminate, because slicing a polymorphic exception is forbidden"
      ],
      "answer": 1,
      "explain": "The handler catch (E e) matches because F derives from E, but e is a fresh E copy-constructed from the E subobject of the thrown F — the derived part is sliced off. Virtual dispatch on e therefore calls E::name(). Catching by reference (catch (const E&)) would bind to the actual F object and print \"F\". Rule of thumb: throw by value, catch by (const) reference."
    },
    {
      "type": "code",
      "tag": "Catch ordering",
      "question": "std::out_of_range derives from std::logic_error, which derives from std::exception. What does this program print? (Assume warnings are not errors.)",
      "code": "#include <iostream>\n#include <stdexcept>\n\nint main() {\n    try {\n        throw std::out_of_range(\"oops\");\n    } catch (const std::exception& e) {\n        std::cout << \"generic\";\n    } catch (const std::out_of_range& e) {\n        std::cout << \"out_of_range\";\n    }\n}",
      "options": [
        "out_of_range — the most specific (best-matching) handler is chosen",
        "generic — handlers are tried strictly in order, and the base-class handler matches first",
        "genericout_of_range — both matching handlers run",
        "It fails to compile because the second handler is unreachable"
      ],
      "answer": 1,
      "explain": "Unlike overload resolution, exception handlers are not matched by \"best fit\": they are tried in the order written, and the first handler whose type matches wins. A const std::exception& handler matches every std::out_of_range, so the second handler is unreachable dead code (compilers typically warn but still compile). Always order catch clauses from most derived to most basic."
    },
    {
      "type": "mcq",
      "tag": "std::exception_ptr",
      "question": "What is std::exception_ptr primarily designed for?",
      "options": [
        "It is a shared-ownership handle to an exception object, obtained with std::current_exception(), that can be stored or passed between threads and rethrown later with std::rethrow_exception().",
        "It is a raw pointer to the active exception that is only valid inside the catch block where it was taken.",
        "It replaces try/catch by letting you poll for exceptions instead of catching them.",
        "It is a compile-time descriptor of a function's exception specification."
      ],
      "answer": 0,
      "explain": "std::exception_ptr behaves like a shared_ptr to the in-flight exception: capturing it with std::current_exception() keeps the exception object alive for as long as any exception_ptr refers to it. Its killer use case is transporting an exception out of its original context — for example from a worker thread to the thread calling future::get(), where std::rethrow_exception() rethrows it. It is a nullable, copyable value type, not a scoped raw pointer."
    },
    {
      "type": "mcq",
      "tag": "Nested exceptions",
      "question": "Inside a catch block, a library calls std::throw_with_nested(MyException(\"higher-level context\")). What does this accomplish?",
      "options": [
        "It throws MyException and permanently discards the original exception being handled.",
        "It throws an object that is both a MyException and a std::nested_exception carrying the currently handled exception, so callers can later unwrap the chain with std::rethrow_if_nested.",
        "It defers the throw until the current stack unwinding finishes, avoiding std::terminate.",
        "It throws two separate exceptions that must be caught by two consecutive catch blocks."
      ],
      "answer": 1,
      "explain": "std::throw_with_nested throws a type derived from both your exception and std::nested_exception; the nested_exception part captures std::current_exception() automatically. This builds a chain: a high-level error (\"could not open project\") wrapping the low-level cause (\"file not found\"). A handler can walk the chain by calling std::rethrow_if_nested on each caught exception, typically in a recursive printing function. The original exception is preserved, not discarded."
    },
    {
      "type": "code",
      "tag": "Stack unwinding",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <stdexcept>\n\nstruct Tracer {\n    const char* n;\n    Tracer(const char* n) : n(n) { std::cout << '+' << n; }\n    ~Tracer() { std::cout << '-' << n; }\n};\n\nvoid work() {\n    Tracer a{\"a\"};\n    Tracer b{\"b\"};\n    throw std::runtime_error(\"stop\");\n}\n\nint main() {\n    try {\n        work();\n    } catch (...) {\n        std::cout << '!';\n    }\n}",
      "options": [
        "+a+b-b-a!",
        "+a+b-a-b!",
        "+a+b!-b-a",
        "+a+b! (local destructors are skipped when an exception is thrown)"
      ],
      "answer": 0,
      "explain": "When the exception leaves work(), stack unwinding destroys all fully constructed automatic objects in reverse order of construction: b first, then a — producing -b-a. Only after unwinding completes does control transfer to the matching handler, which prints '!'. This deterministic reverse-order destruction during unwinding is exactly the mechanism RAII relies on."
    },
    {
      "type": "mcq",
      "tag": "terminate vs abort",
      "question": "What is the relationship between std::terminate and std::abort?",
      "options": [
        "They are two names for the same function.",
        "std::terminate invokes the installed terminate handler, which by default calls std::abort; std::abort raises SIGABRT and ends the process without running local or static destructors.",
        "std::abort first calls std::terminate, which then fully unwinds the stack before exiting.",
        "std::terminate exits cleanly with status 1 after running all atexit handlers, while std::abort does not."
      ],
      "answer": 1,
      "explain": "std::terminate is the C++ exception machinery's dead end (unhandled exception, noexcept violation, throwing during unwinding, etc.): it calls the current terminate handler, replaceable via std::set_terminate. The default handler calls std::abort, which raises SIGABRT and kills the process abnormally — no stack unwinding, no static-object destructors, no atexit handlers. Neither performs an orderly shutdown like std::exit does."
    },
    {
      "type": "mcq",
      "tag": "uncaught_exceptions()",
      "question": "C++17 replaced bool std::uncaught_exception() with int std::uncaught_exceptions(). Why is the counting version more useful, for example to a ScopeGuard/transaction class?",
      "options": [
        "It is faster because it avoids a boolean conversion.",
        "It counts nested try blocks, letting code detect how deep it is inside handlers.",
        "By storing the count at construction and comparing it in the destructor, an object can tell whether a *new* exception is unwinding it — which works correctly even when the object lives inside a catch block where the old bool version was already true.",
        "It returns the number of catch clauses that matched the current exception."
      ],
      "answer": 2,
      "explain": "The old bool answered \"is any exception in flight?\", which gave wrong answers for objects created inside a catch handler or during unwinding cleanup — the flag was already true, so they could not detect their own failure path. The count of in-flight exceptions fixes this: a guard records std::uncaught_exceptions() in its constructor, and in its destructor a larger value means this scope is being unwound by a new exception (rollback), while an equal value means normal exit (commit)."
    },
    {
      "type": "mcq",
      "tag": "Error codes vs exceptions",
      "question": "Which statement about error-reporting mechanisms (errno, returned error codes, exceptions) is accurate?",
      "options": [
        "errno is automatically reset to zero by every successful standard library call, so it can always be checked after the fact.",
        "Exceptions are faster than error codes on the failure path because no stack unwinding is required.",
        "Returned error codes are easy for a caller to silently ignore, whereas an exception that is never handled cannot simply be ignored — it propagates and ultimately calls std::terminate.",
        "std::error_code throws std::system_error whenever it is assigned a nonzero value."
      ],
      "answer": 2,
      "explain": "The classic weakness of errno and returned codes is that nothing forces the caller to look at them ([[nodiscard]] only adds a warning). An exception, by contrast, demands attention: it propagates up the stack until handled, and an unhandled exception terminates the program. The trade-off runs the other way on the failure path — throwing and unwinding is far more expensive than returning a code — and errno is only meaningful right after a failing call (successful calls are not required to clear it). std::error_code itself never throws; it exists precisely as a non-throwing channel."
    },
    {
      "type": "mcq",
      "tag": "std::expected (C++23)",
      "question": "What is the key advantage of C++23's std::expected<T, E> over std::optional<T> as the return type of a function that can fail?",
      "options": [
        "std::expected automatically throws E at the end of the scope if the caller never inspects it.",
        "On failure, std::expected carries an error value of an arbitrary type E describing *why* the operation failed, whereas an empty optional communicates only that there is no value.",
        "std::expected requires E to derive from std::exception, guaranteeing interoperability with try/catch.",
        "std::optional cannot be returned from functions, while std::expected can."
      ],
      "answer": 1,
      "explain": "std::expected<T, E> holds either a T (success) or an E (failure), where E is any type you choose — an enum, an error struct, a string. That makes the reason for failure part of the return value, which optional cannot express: an empty optional is just \"nothing here\". Nothing is thrown automatically (only value() on a failed expected throws std::bad_expected_access), and E has no required base class."
    },
    {
      "type": "code",
      "tag": "std::expected (C++23)",
      "question": "Compiled as C++23, what does this program print?",
      "code": "#include <expected>\n#include <iostream>\n#include <string>\n\nstd::expected<int, std::string> parse(int x) {\n    if (x < 0) {\n        return std::unexpected(\"negative input\");\n    }\n    return x * 2;\n}\n\nint main() {\n    auto r = parse(-5);\n    std::cout << r.value_or(42);\n}",
      "options": [
        "-10",
        "negative input",
        "42",
        "It throws std::bad_expected_access and terminates."
      ],
      "answer": 2,
      "explain": "parse(-5) takes the error branch and returns an expected holding the std::string error \"negative input\", so r has no value. value_or(42) returns the contained value when one exists, otherwise its argument — here 42. Only r.value() would have thrown std::bad_expected_access; value_or is the non-throwing accessor with a fallback, and the error text is only reachable via r.error()."
    },
    {
      "type": "mcq",
      "tag": "assert & NDEBUG",
      "question": "A source file contains assert(connection.open()) where open() actually establishes the connection. What happens in a release build compiled with NDEBUG defined?",
      "options": [
        "The assertion still runs but failures are logged instead of aborting.",
        "assert expands to nothing, so connection.open() is never evaluated — the release build silently loses the side effect and the connection is never opened.",
        "The macro evaluates the expression but ignores the result.",
        "The program fails to compile because assert requires !defined(NDEBUG)."
      ],
      "answer": 1,
      "explain": "When NDEBUG is defined, the assert macro expands to a no-op (essentially ((void)0)), so its argument expression disappears entirely — including any side effects. That makes this code a classic bug: it works in debug builds and breaks in release. Assertions must only check conditions, never perform work; they are for catching programming errors during development, not for runtime error handling."
    },
    {
      "type": "mcq",
      "tag": "[[nodiscard]]",
      "question": "A function returning an error status is declared [[nodiscard]] ErrorCode save(); What does the attribute do when a caller writes save(); and ignores the result?",
      "options": [
        "The program fails to compile: [[nodiscard]] makes discarding the value a hard error in standard C++.",
        "The compiler is encouraged to issue a warning at that call site; the attribute can also be placed on a type (like the ErrorCode enum itself) so every function returning it is covered.",
        "At runtime, std::terminate is called if the value is destroyed unexamined.",
        "It forces the return value to be stored in a variable, which may not be named _."
      ],
      "answer": 1,
      "explain": "[[nodiscard]] tells the compiler that ignoring the return value is almost certainly a bug, and compilers respond with a warning (not a standard-mandated error, though teams often promote it with -Werror). Marking the error type itself [[nodiscard]] is even better, since the check then applies to every function returning it. There is no runtime component; it is purely a compile-time diagnostic aid, and an explicit cast to void suppresses it when discarding is intentional."
    },
    {
      "type": "mcq",
      "tag": "RAII",
      "question": "Why is RAII considered the foundation of writing exception-safe C++, compared to releasing resources manually?",
      "options": [
        "RAII disables exceptions inside the scope of the managed object.",
        "Destructors of automatic objects are guaranteed to run during stack unwinding, so a resource owned by an object is released on both the normal path and the exception path; a manual release after a throw is simply skipped.",
        "RAII objects catch any exception thrown while they are alive and rethrow it after cleanup.",
        "RAII moves all cleanup to a global handler installed with std::set_terminate."
      ],
      "answer": 1,
      "explain": "Code like p = new T; ...; delete p; leaks the moment anything between new and delete throws, because the delete is skipped. Wrap the resource in an object (unique_ptr, lock_guard, fstream, a scope guard) and its destructor runs deterministically when the scope exits — whether by return or by unwinding. RAII objects do not catch or suppress anything; they piggyback on the guarantee that unwinding destroys fully constructed automatic objects."
    },
    {
      "type": "mcq",
      "tag": "noexcept idiom",
      "question": "A generic swap wrapper is declared: template<class T> void mySwap(T& a, T& b) noexcept(noexcept(std::swap(a, b))); What do the two occurrences of noexcept mean?",
      "options": [
        "Both are the noexcept operator; writing it twice is required by the grammar.",
        "The outer one is the noexcept specifier taking a boolean condition, and the inner one is the noexcept operator that yields true if std::swap(a, b) cannot throw — so mySwap is non-throwing exactly when the underlying swap is.",
        "Both are specifiers: the outer applies to mySwap, the inner forces std::swap to become noexcept.",
        "It is a syntax error: noexcept cannot be nested."
      ],
      "answer": 1,
      "explain": "These are two different features sharing one keyword. The outer noexcept(...) is the conditional specifier: the function is declared non-throwing if the compile-time constant inside is true. The inner noexcept(std::swap(a, b)) is the operator: an unevaluated compile-time query of whether that expression is potentially-throwing. Combined, the wrapper faithfully propagates the exception specification of whatever swap it forwards to — essential for generic code and for containers choosing move vs copy."
    },
    {
      "type": "code",
      "tag": "Throw during unwinding",
      "question": "This destructor is explicitly marked noexcept(false). What happens when the program runs?",
      "code": "#include <iostream>\n#include <stdexcept>\n\nstruct Risky {\n    ~Risky() noexcept(false) {\n        throw std::runtime_error(\"dtor\");\n    }\n};\n\nint main() {\n    try {\n        Risky r;\n        throw std::logic_error(\"body\");\n    } catch (const std::exception& e) {\n        std::cout << e.what();\n    }\n}",
      "options": [
        "It prints \"body\" — the first exception wins and the destructor's exception is discarded.",
        "It prints \"dtor\" — the newer exception replaces the one in flight.",
        "std::terminate is called: while unwinding due to the logic_error, the destructor throws a second exception, and two simultaneous in-flight exceptions are fatal.",
        "It prints \"bodydtor\" — the handler runs once for each exception."
      ],
      "answer": 2,
      "explain": "The throw of logic_error starts stack unwinding, which destroys r. Its destructor — legally, since it is noexcept(false) — throws a second exception while the first is still propagating. C++ cannot have two exceptions in flight from the same unwinding, so the runtime calls std::terminate immediately; the catch block never runs. Even a noexcept(false) destructor must check std::uncaught_exceptions() before throwing, which is why destructors should not throw at all."
    },
    {
      "type": "code",
      "tag": "Constructor leak",
      "question": "What does this program print, and what is the hidden problem?",
      "code": "#include <iostream>\n#include <stdexcept>\n\nstruct Widget {\n    int* data;\n    Widget() : data(new int[100]) {\n        throw std::runtime_error(\"ctor failed\");\n    }\n    ~Widget() {\n        delete[] data;\n        std::cout << \"freed \";\n    }\n};\n\nint main() {\n    try {\n        Widget w;\n    } catch (...) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "\"freed caught\" — the destructor runs during unwinding before the handler.",
        "\"caught\" only — ~Widget never runs because w was never fully constructed, so the array from new int[100] leaks.",
        "\"caught\" only, but there is no leak: the runtime frees memory allocated in a failed constructor.",
        "std::terminate — throwing from a constructor is not allowed."
      ],
      "answer": 1,
      "explain": "A destructor runs only for a fully constructed object; since Widget's constructor exits via an exception, w never becomes one, ~Widget is skipped, and the 400 bytes from new int[100] leak — printing just \"caught\". The runtime does free memory from the new expression that allocates the object itself when its constructor throws, but not resources the constructor acquired internally. The fix is RAII inside the class: make data a std::unique_ptr<int[]> or std::vector<int>, because fully constructed *members* are destroyed even when the constructor body throws."
    },
    {
      "type": "mcq",
      "tag": "Nothrow guarantee",
      "question": "Which of the following operations provides the nothrow (no-fail) guarantee?",
      "options": [
        "std::vector<int>::at(size_t), for any index",
        "std::vector<int>::push_back, when no reallocation is needed",
        "Swapping two std::vector<int> objects with their noexcept member swap (exchanging internal buffers, no element copies)",
        "std::stoi on arbitrary user input"
      ],
      "answer": 2,
      "explain": "vector::swap just exchanges internal pointers and bookkeeping and is declared noexcept (with default allocators) — no allocation, no element operations, no failure path. That is exactly why copy-and-swap yields the strong guarantee: all risky work happens on a copy, then a nothrow swap commits. In contrast, at() throws std::out_of_range on a bad index, push_back can always throw std::bad_alloc (and capacity checks are not part of its contract), and std::stoi throws std::invalid_argument or std::out_of_range on bad input."
    }
  ]
};

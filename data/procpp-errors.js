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
    },
    {
      "type": "mcq",
      "tag": "Dynamic exception specs",
      "question": "What is the status of dynamic exception specifications such as void f() throw(std::bad_alloc); in modern C++?",
      "options": [
        "They are still valid but are silently ignored by conforming compilers.",
        "They were removed in C++11 when noexcept was introduced.",
        "They were deprecated in C++11 and removed in C++17; the empty form throw() survived as a synonym for noexcept until it too was removed in C++20.",
        "Only throw(...) with an ellipsis remains valid, meaning the function may throw anything."
      ],
      "answer": 2,
      "explain": "Dynamic exception specifications like throw(std::bad_alloc) proved unworkable: violations were only detected at runtime (via std::unexpected) and they inhibited optimization, so C++11 deprecated them and C++17 removed them entirely. The empty specification throw() was redefined in C++17 to mean exactly noexcept(true) and lingered until C++20 removed it as well. Modern code has exactly two choices: noexcept (possibly conditional) or no specification at all."
    },
    {
      "type": "mcq",
      "tag": "noexcept & overriding",
      "question": "A base class declares virtual void save() noexcept;. What are the rules for a derived class overriding save()?",
      "options": [
        "The override must be at least as restrictive: overriding a noexcept virtual with a potentially-throwing function is ill-formed, while adding noexcept to an override of a non-noexcept virtual is fine.",
        "The override must repeat the exception specification exactly, character for character.",
        "The override may freely drop noexcept; the base's specification is what callers see anyway.",
        "Exception specifications are ignored during overriding; they only matter for non-virtual functions."
      ],
      "answer": 0,
      "explain": "A virtual function's exception specification is a promise inherited by every override: code calling through a Base* relies on save() not throwing. Therefore an override may strengthen the guarantee (add noexcept) but never weaken it — declaring the override without noexcept (or with noexcept(false)) is a compile-time error. This is also why overriding std::exception::what() must be declared noexcept: the base declares it that way."
    },
    {
      "type": "code",
      "tag": "noexcept in fn types",
      "question": "Compiled as C++20, what is the result of this program?",
      "code": "void safe() noexcept {}\nvoid risky() {}\n\nint main() {\n    void (*p1)() noexcept = safe;\n    void (*p2)()          = safe;\n    void (*p3)() noexcept = risky;\n}",
      "options": [
        "It compiles; all three pointers are valid because noexcept is not part of a function's type.",
        "It compiles, but calling p3() would be undefined behavior.",
        "It fails to compile at p2: a noexcept function cannot lose its specification.",
        "It fails to compile at p3: since C++17 noexcept is part of the function type, and a pointer-to-noexcept-function cannot be bound to a potentially-throwing function."
      ],
      "answer": 3,
      "explain": "Since C++17, noexcept participates in the function type, so void() and void() noexcept are different types. The conversion is one-way: a noexcept function can safely be stored in an ordinary function pointer (p2), because promising less is harmless. But p3 would let callers rely on a nothrow guarantee that risky never made, so that initialization is ill-formed."
    },
    {
      "type": "mcq",
      "tag": "Overloading on noexcept",
      "question": "A developer writes these two declarations in the same scope:\n\nvoid process(int x);\nvoid process(int x) noexcept;\n\nWhat happens?",
      "options": [
        "Valid overloading: callers select the noexcept version via static_cast.",
        "It is ill-formed: the two declarations declare the same function with mismatched exception specifications, and you cannot overload solely on noexcept.",
        "The second declaration silently replaces the first.",
        "It compiles, and the compiler picks the noexcept version whenever the call site is itself inside a noexcept function."
      ],
      "answer": 1,
      "explain": "Even though noexcept became part of the function type in C++17, the standard explicitly forbids overloading functions that differ only in their exception specification — the second declaration is a redeclaration of the same function with a conflicting specification, which is an error. Contrast this with function pointers and template arguments, where the noexcept-ness of the type does participate. Overload resolution never selects functions based on noexcept."
    },
    {
      "type": "code",
      "tag": "Conditional noexcept",
      "question": "relocate is declared with a conditional noexcept specification. What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <type_traits>\n#include <utility>\n\nstruct Legacy {\n    Legacy() = default;\n    Legacy(Legacy&&) {}   // move constructor, not noexcept\n};\n\ntemplate <typename T>\nvoid relocate(T& t) noexcept(std::is_nothrow_move_constructible_v<T>) {\n    T moved(std::move(t));\n}\n\nint main() {\n    std::string s;\n    Legacy l;\n    std::cout << noexcept(relocate(s)) << noexcept(relocate(l));\n}",
      "options": [
        "10",
        "11",
        "00",
        "01"
      ],
      "answer": 0,
      "explain": "relocate is conditionally noexcept: its specification evaluates std::is_nothrow_move_constructible_v<T> per instantiation. std::string's move constructor is noexcept, so noexcept(relocate(s)) is true and prints 1. Legacy's user-provided move constructor has no noexcept specification, so the trait is false and noexcept(relocate(l)) prints 0. This is exactly how generic library code propagates the exception guarantees of the types it manipulates."
    },
    {
      "type": "code",
      "tag": "move_if_noexcept",
      "question": "Buffer's move constructor is not marked noexcept. What does this program print?",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Buffer {\n    Buffer() = default;\n    Buffer(const Buffer&) { std::cout << \"copy\"; }\n    Buffer(Buffer&&) { std::cout << \"move\"; }   // not noexcept\n};\n\nint main() {\n    Buffer a;\n    Buffer b(std::move_if_noexcept(a));\n}",
      "options": [
        "copy",
        "move",
        "Nothing — move_if_noexcept elides both constructors.",
        "It fails to compile: move_if_noexcept requires a noexcept move constructor."
      ],
      "answer": 0,
      "explain": "std::move_if_noexcept(a) returns an rvalue reference only if Buffer's move constructor is noexcept (or if there is no copy constructor); otherwise it returns an lvalue reference so overload resolution picks the copy constructor. Buffer's move constructor is potentially throwing, so the copy constructor runs and prints \"copy\". Adding noexcept to the move constructor changes the output to \"move\" — the same mechanism std::vector uses during reallocation."
    },
    {
      "type": "code",
      "tag": "Implicit dtor noexcept",
      "question": "What does this program print? (noexcept is used here as an operator on explicit destructor calls, in an unevaluated context.)",
      "code": "#include <iostream>\n#include <utility>\n\nstruct Loose {\n    ~Loose() noexcept(false) {}\n};\n\nstruct Plain {\n    ~Plain() {}\n};\n\nstruct Holder {\n    Loose m;\n    ~Holder() {}   // no explicit exception specification\n};\n\nint main() {\n    std::cout << noexcept(std::declval<Plain&>().~Plain())\n              << noexcept(std::declval<Holder&>().~Holder());\n}",
      "options": [
        "10",
        "11",
        "00",
        "It fails to compile: a destructor cannot be called explicitly inside a noexcept operator."
      ],
      "answer": 0,
      "explain": "A destructor with no explicit exception specification gets an implicit one, computed from its subobjects: it is noexcept unless a base or member destructor is potentially throwing. Plain's destructor is therefore noexcept (prints 1). Holder contains a Loose member whose destructor is noexcept(false), so Holder's own destructor is implicitly potentially throwing too (prints 0) — the looseness propagates outward. This is why one noexcept(false) destructor can quietly infect every class that contains it."
    },
    {
      "type": "mcq",
      "tag": "Exceptions across C code",
      "question": "A C++ callback passed to a C library (for example a qsort comparator or a C event loop) throws an exception that would have to propagate through the C library's stack frames to reach a C++ handler. What does portable code have to assume?",
      "options": [
        "This is fully supported: the C++ runtime unwinds C frames like any others.",
        "The exception is automatically converted to errno at the language boundary.",
        "The C library catches the exception and returns a nonzero status to its caller.",
        "There is no guarantee it works: unwinding through non-C++ frames is not covered by the C++ standard, so a portable callback must catch everything at the boundary and report failure through a side channel such as an error code or stored exception_ptr."
      ],
      "answer": 3,
      "explain": "The C++ standard defines unwinding only for C++ code; whether an exception can pass through frames of a C library depends on how that library was compiled (e.g. with unwind tables) and is not something portable code may rely on — in practice it is often undefined behavior. The robust pattern is a catch(...) inside the callback that converts the failure into a return code, a flag, or a stored std::exception_ptr that is rethrown once control is safely back in C++. The same rule applies to any foreign-function boundary."
    },
    {
      "type": "code",
      "tag": "Exception escaping thread",
      "question": "What happens when this program runs?",
      "code": "#include <iostream>\n#include <stdexcept>\n#include <thread>\n\nint main() {\n    try {\n        std::thread t([] { throw std::runtime_error(\"worker failed\"); });\n        t.join();\n        std::cout << \"joined\\n\";\n    } catch (const std::exception& e) {\n        std::cout << \"caught: \" << e.what() << '\\n';\n    }\n}",
      "options": [
        "It prints \"caught: worker failed\" — the try block surrounds the thread's lifetime.",
        "It prints \"joined\" — join() swallows exceptions from the thread body.",
        "std::terminate is called: an exception escaping a thread's top-level function is never propagated to another thread's try block, no matter where the std::thread object lives.",
        "join() rethrows the worker's exception in main, which then prints \"caught: worker failed\"."
      ],
      "answer": 2,
      "explain": "Each thread has its own stack; the try block in main is on the parent's stack and can never catch anything thrown in the worker. When an exception reaches the top of a thread's initial function, std::terminate is called and the whole process dies — join() has no rethrow semantics. To move a failure across threads you must catch it in the worker and transport it, e.g. via std::promise::set_exception or by using std::async, whose future rethrows at get()."
    },
    {
      "type": "code",
      "tag": "async propagation",
      "question": "The task launched via std::async exits by throwing. What does this program print?",
      "code": "#include <future>\n#include <iostream>\n#include <stdexcept>\n\nint main() {\n    auto fut = std::async(std::launch::async, []() -> int {\n        throw std::runtime_error(\"task failed\");\n    });\n    try {\n        int v = fut.get();\n        std::cout << \"value \" << v;\n    } catch (const std::exception& e) {\n        std::cout << \"caught: \" << e.what();\n    }\n}",
      "options": [
        "std::terminate is called because the exception escapes the task thread.",
        "caught: task failed",
        "value 0 — a failed task produces a default-constructed result.",
        "Nothing: get() blocks forever because the task never produced a value."
      ],
      "answer": 1,
      "explain": "A task run by std::async that exits via an exception does not terminate the program: the exception is captured and stored in the shared state of the returned future. The stored exception is rethrown in the calling thread when fut.get() is invoked, so main catches it and prints \"caught: task failed\". This automatic capture-and-rethrow is the key error-handling difference between std::async and a raw std::thread."
    },
    {
      "type": "mcq",
      "tag": "broken_promise",
      "question": "A worker thread accepts a std::promise<int>, but a bug makes it return without ever calling set_value or set_exception, and the promise is destroyed. What happens in the consumer blocked in future.get()?",
      "options": [
        "get() blocks forever, since no value will ever arrive.",
        "get() throws std::future_error with the error condition std::future_errc::broken_promise, because the promise was abandoned with the shared state unfulfilled.",
        "get() returns a value-initialized int (0).",
        "The consumer thread is terminated along with the worker."
      ],
      "answer": 1,
      "explain": "Destroying a promise that never delivered a result does not leave waiters hanging: the destructor stores a std::future_error with future_errc::broken_promise into the shared state, releasing anyone blocked on it. The consumer's get() then throws that exception. This is a deliberate safety net — the error-reporting channel itself reports the error when it is abandoned — and it is one of the future_errc conditions worth recognizing in production code."
    },
    {
      "type": "code",
      "tag": "promise::set_exception",
      "question": "The worker thread stores an exception into the promise instead of a value. What does this program print?",
      "code": "#include <future>\n#include <iostream>\n#include <stdexcept>\n#include <thread>\n\nint main() {\n    std::promise<int> prom;\n    auto fut = prom.get_future();\n    std::thread t([&prom] {\n        prom.set_exception(\n            std::make_exception_ptr(std::runtime_error(\"no result\")));\n    });\n    try {\n        std::cout << fut.get();\n    } catch (const std::exception& e) {\n        std::cout << \"caught: \" << e.what();\n    }\n    t.join();\n}",
      "options": [
        "caught: no result",
        "std::terminate is called: exceptions cannot be transferred between threads.",
        "0 — the promise delivers a default value when given an exception.",
        "caught: std::bad_exception, because the runtime_error was constructed outside a catch block."
      ],
      "answer": 0,
      "explain": "std::make_exception_ptr builds an exception_ptr to a copy of the runtime_error without any throw appearing in the source, and promise::set_exception stores it in the shared state. When main calls fut.get(), the stored exception is rethrown on the consumer's side and caught, printing \"caught: no result\". This promise/future pair is the manual version of what std::async does automatically, and it works even though the exception was never in flight in the worker."
    },
    {
      "type": "mcq",
      "tag": "make_exception_ptr",
      "question": "What does std::make_exception_ptr(e) do?",
      "options": [
        "It wraps a reference to the caller's e; the exception_ptr dangles once e goes out of scope.",
        "It returns an exception_ptr referring to a copy of e, behaving as if e were thrown and immediately captured with std::current_exception() — no exception needs to be in flight when you call it.",
        "It throws e immediately and relies on the caller to catch it.",
        "It only works when called inside a catch block handling e."
      ],
      "answer": 1,
      "explain": "std::make_exception_ptr is specified as if it executed try { throw e; } catch (...) { return std::current_exception(); } — so the resulting exception_ptr owns a copy of e with shared-ownership lifetime, independent of the original. It is the way to manufacture a stored exception when none is currently being handled, for example to feed promise::set_exception on a validation failure. Implementations may build the object directly without actually throwing."
    },
    {
      "type": "code",
      "tag": "Collecting exceptions",
      "question": "Both loop iterations throw, and each exception is captured into the vector. What does this program print?",
      "code": "#include <exception>\n#include <iostream>\n#include <stdexcept>\n#include <string>\n#include <vector>\n\nint main() {\n    std::vector<std::exception_ptr> errors;\n    for (int i = 0; i < 2; ++i) {\n        try {\n            throw std::runtime_error(\"task \" + std::to_string(i));\n        } catch (...) {\n            errors.push_back(std::current_exception());\n        }\n    }\n    for (const auto& ep : errors) {\n        try {\n            std::rethrow_exception(ep);\n        } catch (const std::exception& e) {\n            std::cout << e.what() << ' ';\n        }\n    }\n}",
      "options": [
        "task 1 task 0",
        "Nothing: an exception_ptr becomes invalid once its catch block exits.",
        "task 1 task 1 — current_exception() always refers to the most recent exception.",
        "task 0 task 1"
      ],
      "answer": 3,
      "explain": "Each iteration captures its own exception with std::current_exception(); the returned exception_ptr shares ownership of that exception object, keeping it alive in the vector long after the catch block ends. Rethrowing each stored pointer in order prints \"task 0 task 1 \". This collect-then-report pattern is how batch or parallel operations gather every failure instead of stopping at the first one."
    },
    {
      "type": "mcq",
      "tag": "Null exception_ptr",
      "question": "Which statement about a default-constructed std::exception_ptr is correct?",
      "options": [
        "It refers to a std::bad_exception object.",
        "It is a null pointer value that compares equal to nullptr, and passing it to std::rethrow_exception violates that function's precondition (the pointer must be non-null) — so you must test it first.",
        "Rethrowing it is a no-op, making unconditional rethrow_exception calls safe.",
        "std::current_exception() returns it only when the current exception cannot be copied."
      ],
      "answer": 1,
      "explain": "A default-constructed exception_ptr holds no exception and compares equal to nullptr; the idiomatic check is a simple if (eptr). std::rethrow_exception requires a non-null argument — calling it with a null pointer breaks its precondition, so there is no defined 'no-op' behavior to rely on. The typical worker-thread pattern therefore stores a null exception_ptr, assigns current_exception() on failure, and only rethrows after testing it in the consuming thread."
    },
    {
      "type": "code",
      "tag": "Unwrapping nested chain",
      "question": "loadConfig wraps a low-level failure using std::throw_with_nested, and printChain unwraps recursively. What does this program print?",
      "code": "#include <exception>\n#include <iostream>\n#include <stdexcept>\n\nvoid printChain(const std::exception& e) {\n    std::cout << e.what() << ';';\n    try {\n        std::rethrow_if_nested(e);\n    } catch (const std::exception& inner) {\n        printChain(inner);\n    }\n}\n\nvoid loadConfig() {\n    try {\n        throw std::runtime_error(\"disk error\");\n    } catch (...) {\n        std::throw_with_nested(std::runtime_error(\"config unreadable\"));\n    }\n}\n\nint main() {\n    try {\n        loadConfig();\n    } catch (const std::exception& e) {\n        printChain(e);\n    }\n}",
      "options": [
        "disk error;config unreadable;",
        "config unreadable; (the original disk error is lost when the new exception is thrown)",
        "config unreadable;disk error;",
        "It recurses forever, since rethrow_if_nested always rethrows."
      ],
      "answer": 2,
      "explain": "loadConfig translates the low-level failure by calling std::throw_with_nested, which throws an object that is both a runtime_error(\"config unreadable\") and a nested_exception capturing the disk error. printChain prints the outer message first, then rethrow_if_nested rethrows the captured inner exception, which the recursive call prints. The recursion stops naturally at \"disk error\": that exception is not derived from std::nested_exception, so rethrow_if_nested does nothing and no handler runs."
    },
    {
      "type": "mcq",
      "tag": "Custom exception design",
      "question": "When writing a custom exception class for a library, why is deriving from std::runtime_error (or std::logic_error) and passing the message to its constructor usually better than deriving directly from std::exception with your own std::string member?",
      "options": [
        "runtime_error already stores the message and implements what() with correct lifetime, and its copy constructor cannot throw — whereas a std::string member makes your copy constructor potentially throwing, which is risky because the exception machinery itself may copy the exception object.",
        "Deriving directly from std::exception is not allowed outside the standard library.",
        "runtime_error's what() returns std::string, which is safer than const char*.",
        "Exceptions derived from runtime_error are automatically caught even without a matching handler."
      ],
      "answer": 0,
      "explain": "std::runtime_error stores its message in an internal (typically reference-counted) buffer, provides a correct what() override, and guarantees a nothrow copy constructor — important because the runtime may copy the exception object while it is being thrown, and a throwing copy at that point leads toward std::terminate. Rolling your own std::string member forfeits that guarantee and forces you to manage what() yourself. Deriving from the standard hierarchy also lets callers catch your type via catch (const std::exception&)."
    },
    {
      "type": "mcq",
      "tag": "what() lifetime",
      "question": "A custom exception overrides what() like this:\n\nconst char* what() const noexcept override {\n    return (\"error in \" + m_file + \": \" + m_reason).c_str();\n}\n\nWhat is wrong?",
      "options": [
        "Nothing; c_str() pins the temporary string for the lifetime of the exception object.",
        "what() is not allowed to concatenate strings because it is const.",
        "It returns a pointer into a temporary std::string that is destroyed when what() returns, so the caller receives a dangling pointer — the message must be built once (e.g. in the constructor) and stored in the object.",
        "The override must be declared noexcept(false) because string concatenation can throw."
      ],
      "answer": 2,
      "explain": "The concatenation creates a temporary std::string that dies at the end of the return statement, so the returned const char* immediately dangles — classic undefined behavior that often 'works' in tests and fails in production. The pointer returned by what() must stay valid at least as long as the exception object, so compose the full message in the constructor and store it (or pass it to the runtime_error base). As a bonus, building the string inside what() could throw, which its noexcept specification forbids."
    },
    {
      "type": "mcq",
      "tag": "Exception object copy",
      "question": "For a local variable e of class type, what does the statement throw e; actually throw?",
      "options": [
        "The variable e itself, by reference; handlers mutate the original variable.",
        "A pointer to e, which is why handlers must catch by reference.",
        "Nothing is copied or moved; the compiler is required to reuse e's storage in all cases.",
        "A distinct exception object in unspecified storage, copy- or move-initialized from e; the copy/move constructor must be accessible even if the compiler elides the actual copy."
      ],
      "answer": 3,
      "explain": "The thrown exception is never the operand itself: the runtime materializes a separate exception object (in unspecified storage, outside the unwinding stack) that is copy- or move-initialized from the operand and lives until the last handler for it completes. The compiler may elide this copy for suitable local variables, but eliding is optional — so the copy or move constructor must still be accessible, and is best kept noexcept. This is also why the exception object survives while the stack that held e is being unwound."
    },
    {
      "type": "code",
      "tag": "Elision at throw",
      "question": "Compiled as C++17 or later, what does this program print?",
      "code": "#include <iostream>\n\nstruct E {\n    E() { std::cout << \"ctor \"; }\n    E(const E&) { std::cout << \"copy \"; }\n};\n\nint main() {\n    try {\n        throw E{};\n    } catch (const E&) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "ctor copy caught — the temporary is copied into the exception object.",
        "copy caught",
        "ctor copy copy caught — one copy for the exception object and one for the handler.",
        "ctor caught"
      ],
      "answer": 3,
      "explain": "The operand of throw is a prvalue E{}, and since C++17 guaranteed copy elision means that prvalue directly initializes the exception object itself — no copy constructor is invoked, so only \"ctor \" is printed. The handler catches by const reference, binding to the exception object without another copy, then prints \"caught\". Had the handler caught by value, an additional \"copy \" would appear."
    },
    {
      "type": "code",
      "tag": "Modify and rethrow",
      "question": "middle() catches by non-const reference, appends to the exception object, then rethrows with a bare throw;. What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nstruct Err {\n    std::string trace;\n};\n\nvoid inner() {\n    throw Err{\"inner\"};\n}\n\nvoid middle() {\n    try {\n        inner();\n    } catch (Err& e) {\n        e.trace += \">middle\";\n        throw;\n    }\n}\n\nint main() {\n    try {\n        middle();\n    } catch (const Err& e) {\n        std::cout << e.trace;\n    }\n}",
      "options": [
        "inner — the modification is lost because throw; rethrows the originally thrown object.",
        "inner>middle",
        "It calls std::terminate: a mutated exception cannot be rethrown.",
        ">middle — the rethrow creates a fresh Err and only keeps the handler's changes."
      ],
      "answer": 1,
      "explain": "Catching by non-const reference binds e to the actual exception object, so e.trace += \">middle\" mutates the exception in place. A bare throw; then rethrows that same object — no copy, no reset — so the outer handler observes the accumulated trace \"inner>middle\". This catch-by-reference, annotate, rethrow pattern is a lightweight way to add context while preserving the exception's identity and dynamic type."
    },
    {
      "type": "mcq",
      "tag": "Cost model of exceptions",
      "question": "Under the 'zero-cost' (table-based) exception model used by mainstream 64-bit compilers, which statement correctly describes the performance trade-off of exceptions versus returned error codes?",
      "options": [
        "Every function call inside a try block pays a small bookkeeping cost, but throwing is nearly free.",
        "try blocks are expensive but throw statements compile to a simple goto.",
        "Exceptions and error codes have identical costs on all paths; the choice is purely stylistic.",
        "The non-throwing path executes with essentially no runtime overhead because handler information sits in static tables consulted only when a throw occurs — but an actual throw is comparatively expensive (exception object allocation plus table-driven unwinding), unlike returning an error code."
      ],
      "answer": 3,
      "explain": "Table-based EH moves all the bookkeeping out of the hot path: entering a try block or calling a potentially-throwing function costs nothing extra, because the unwinder finds handlers and cleanups by looking up the program counter in static tables only when an exception is actually thrown. The throw path, in contrast, involves allocating the exception object and walking those tables frame by frame — typically orders of magnitude slower than returning a code. Hence the guideline: exceptions for exceptional situations, not for ordinary control flow on hot paths."
    },
    {
      "type": "mcq",
      "tag": "Handling bad_alloc",
      "question": "A long-running server wants to survive std::bad_alloc from a huge, user-driven allocation. Which approach is sound?",
      "options": [
        "Catch std::bad_alloc close to the oversized request and fail just that operation, making sure the recovery path itself performs no dynamic allocation (preallocated buffers, no allocating log calls); process-wide recovery from general heap exhaustion is rarely reliable.",
        "Catch std::bad_alloc, log the failure with std::string formatting, and retry the same allocation in a loop.",
        "bad_alloc cannot be caught because operator new is noexcept.",
        "Call std::set_terminate to convert bad_alloc into a recoverable signal."
      ],
      "answer": 0,
      "explain": "bad_alloc is an ordinary exception and is perfectly catchable — the classic recoverable case is a single oversized request (a giant image, a hostile message length) where failing that one operation is meaningful. The trap is that the handler runs in a low-memory situation: if it builds strings or logs via allocating APIs it may throw bad_alloc again mid-handling. When the whole heap is truly exhausted, most programs cannot do useful work anyway, which is why 'catch low, keep the handler allocation-free, otherwise die cleanly' is the professional guidance."
    },
    {
      "type": "code",
      "tag": "nothrow new",
      "question": "What does this program print? (Assume the 500 TB allocation cannot succeed.)",
      "code": "#include <iostream>\n#include <new>\n\nint main() {\n    char* p = new (std::nothrow) char[500'000'000'000'000ULL];\n    std::cout << (p == nullptr ? \"null\" : \"ok\") << ' ';\n    delete[] p;\n    std::cout << \"done\";\n}",
      "options": [
        "It terminates with an uncaught std::bad_alloc.",
        "null done",
        "ok done — the allocation is virtual and always succeeds.",
        "null, then undefined behavior: delete[] on a null pointer is invalid."
      ],
      "answer": 1,
      "explain": "The nothrow overload of operator new[] returns nullptr on failure instead of throwing std::bad_alloc, so the program prints \"null \". Applying delete[] to a null pointer is explicitly well-defined and does nothing, so \"done\" follows. Note the asymmetry: plain new never returns nullptr (checking its result is dead code); only the std::nothrow form communicates failure through the return value."
    },
    {
      "type": "mcq",
      "tag": "new_handler contract",
      "question": "When operator new cannot satisfy a request and a new-handler is installed via std::set_new_handler, what must that handler do to avoid an infinite loop?",
      "options": [
        "One of: make more memory available, install a different new-handler (or deinstall itself), throw std::bad_alloc or a class derived from it, or terminate the program — because operator new calls the handler and then simply retries the allocation, forever.",
        "Return a fallback pointer that operator new passes back to the caller.",
        "Return false, which makes operator new give up and return nullptr.",
        "Log the failure and return normally; operator new throws bad_alloc after the handler returns once."
      ],
      "answer": 0,
      "explain": "operator new sits in a loop: attempt allocation; on failure call the installed new-handler and try again. The handler's return type is void and a plain return just means 'retry', so a handler that changes nothing produces an infinite loop. Its legitimate moves are exactly: release reserved memory so the retry can succeed, swap in a different handler, throw bad_alloc (or a derived type) to break out, or abort/exit. This is the classic new-handler contract."
    },
    {
      "type": "code",
      "tag": "new_handler in action",
      "question": "Assuming the 1 PB allocation cannot succeed, what does this program print?",
      "code": "#include <iostream>\n#include <new>\n\nint main() {\n    std::set_new_handler([] {\n        std::cout << \"handler \";\n        throw std::bad_alloc();\n    });\n    try {\n        char* p = new char[1'000'000'000'000'000ULL];\n        std::cout << \"allocated \" << static_cast<void*>(p);\n    } catch (const std::bad_alloc&) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "caught — the handler is skipped because the try block has its own bad_alloc handling.",
        "handler handler handler ... forever, because operator new keeps retrying.",
        "handler caught",
        "allocated 0x0"
      ],
      "answer": 2,
      "explain": "The impossible allocation fails, so operator new invokes the installed new-handler, which prints \"handler \" and then throws std::bad_alloc. Throwing from the handler is one of the sanctioned ways to break operator new's retry loop; the exception propagates out of the new expression and the catch block prints \"caught\". Had the handler simply returned without changing anything, the program really would loop forever."
    },
    {
      "type": "mcq",
      "tag": "filesystem dual API",
      "question": "std::filesystem offers many operations in two overloads, e.g. file_size(p) and file_size(p, ec). What is the design?",
      "options": [
        "The ec overload only reports errors that are not serious; fatal ones still throw.",
        "The two overloads are aliases; both throw on failure and additionally fill in ec.",
        "The throwing overload returns an error via errno, while the ec overload throws filesystem_error.",
        "The first overload reports failure by throwing std::filesystem::filesystem_error (derived from std::system_error, carrying the paths and an error_code); the second is non-throwing for OS-level errors and writes the result into the std::error_code out-parameter, for callers where failure is routine."
      ],
      "answer": 3,
      "explain": "The filesystem library acknowledges that for I/O, failure is often an expected outcome, so nearly every operation comes in a throwing flavor and an error_code flavor. The throwing overloads raise filesystem_error — a system_error subclass that also carries the involved path(s) — appropriate when failure is exceptional. The ec overloads report OS failures through the out-parameter without throwing, which suits probing patterns (does this exist? try to delete it) and hot paths. This dual interface is a model worth copying in your own libraries."
    },
    {
      "type": "code",
      "tag": "system_error from thread",
      "question": "join() is called a second time on a thread that has already been joined. What does this program print?",
      "code": "#include <iostream>\n#include <system_error>\n#include <thread>\n\nint main() {\n    std::thread t([] {});\n    t.join();\n    try {\n        t.join();   // join a second time\n    } catch (const std::system_error& e) {\n        std::cout << (e.code() == std::errc::invalid_argument);\n    }\n}",
      "options": [
        "Nothing — the second join is a harmless no-op.",
        "1 — the second join throws std::system_error whose code matches std::errc::invalid_argument.",
        "std::terminate is called, because joining a joined thread is fatal.",
        "0 — the exception's code has the system category, so it never matches an errc value."
      ],
      "answer": 1,
      "explain": "After the first join() the thread object is no longer joinable, and the standard specifies that join() then throws std::system_error with an error code equivalent to errc::invalid_argument. The comparison e.code() == std::errc::invalid_argument goes through the category's mapping to error_condition and yields true, printing 1. The thread library is the flagship user of the <system_error> machinery — its exceptions carry structured codes, not just message strings."
    },
    {
      "type": "mcq",
      "tag": "error_category identity",
      "question": "Two std::error_code objects both have value() == 2, but one was created with the generic category and one with a custom category. Why does operator== report them unequal, and what does that imply for custom categories?",
      "options": [
        "They actually compare equal — only value() participates in equality.",
        "operator== compares the categories' name() strings, so renaming a category changes equality.",
        "error_code equality compares the category by identity (address) as well as the numeric value, and each category must therefore be a unique, program-wide singleton — typically exposed via a function returning a reference to a single instance.",
        "Custom categories are not allowed to reuse numeric values already used by the generic category."
      ],
      "answer": 2,
      "explain": "An error_code is a (value, category) pair, and equality requires both the same integer and the very same category object — categories are compared by identity, not by name. The same number means different things in different domains (2 might be ENOENT in the generic category and something unrelated in yours), so this is by design. Consequently a custom category must exist exactly once in the program: the canonical pattern is a final class derived from std::error_category with a singleton accessor, guaranteeing one address to compare against."
    },
    {
      "type": "code",
      "tag": "error_code basics",
      "question": "This program exercises error_code's operator bool and its comparison against a std::errc enumerator. What does it print?",
      "code": "#include <iostream>\n#include <system_error>\n\nint main() {\n    std::error_code ec;\n    std::cout << static_cast<bool>(ec);\n    ec = std::make_error_code(std::errc::timed_out);\n    std::cout << static_cast<bool>(ec);\n    std::cout << (ec == std::errc::timed_out);\n}",
      "options": [
        "111",
        "010",
        "001",
        "011"
      ],
      "answer": 3,
      "explain": "A default-constructed error_code has value 0 in the system category, and its explicit operator bool returns value() != 0 — so the first output is 0, the convention being that zero means success. After assigning make_error_code(errc::timed_out) the value is nonzero, printing 1. The final comparison ec == std::errc::timed_out converts the errc to an error_condition and asks the categories whether they correspond — true here, printing 1."
    },
    {
      "type": "mcq",
      "tag": "code vs condition",
      "question": "In the <system_error> design, what is the intended distinction between std::error_code and std::error_condition?",
      "options": [
        "error_code is the concrete, potentially platform-specific fact of what happened (the exact error in a given category), while error_condition is the portable, platform-independent abstraction you test against — comparisons between the two go through the category's equivalence mapping.",
        "error_condition is the exception-throwing sibling of error_code.",
        "error_code is for the C++ standard library only; user code may only create error_conditions.",
        "They are identical types under different names, kept for backward compatibility."
      ],
      "answer": 0,
      "explain": "The two types are structurally similar but semantically opposite in direction: an error_code records precisely what occurred, in whatever category (system, custom library, OS), while an error_condition represents a portable meaning like 'permission denied'. The categories provide the bridge — comparing a code to a condition invokes the category's equivalent() logic, which is how ec == std::errc::permission_denied works even when ec holds a raw platform value. Rule of thumb: transport error_codes, test against error_conditions (errc)."
    },
    {
      "type": "code",
      "tag": "make_error_code",
      "question": "An error_code is built from a std::errc enumerator via make_error_code. What does this program print?",
      "code": "#include <iostream>\n#include <system_error>\n\nint main() {\n    std::error_code ec = std::make_error_code(std::errc::permission_denied);\n    std::cout << (ec.category() == std::generic_category())\n              << (ec.category() == std::system_category())\n              << (ec.value() == static_cast<int>(std::errc::permission_denied));\n}",
      "options": [
        "101",
        "011",
        "110",
        "111"
      ],
      "answer": 0,
      "explain": "make_error_code(std::errc) is specified to build an error_code with the generic category and the numeric value of the enumerator, so the first comparison is true (1) and the system_category comparison is false (0). The last output is 1 because value() stores exactly that enumerator's integer value. The errc enum primarily names portable error conditions, but this factory produces a concrete generic-category code from it."
    },
    {
      "type": "mcq",
      "tag": "operator bool subtlety",
      "question": "What exactly does if (ec) test for a std::error_code ec, and what subtlety follows?",
      "options": [
        "It calls the category's virtual failed() function, which may implement any policy.",
        "It tests value() != 0 and nothing else — so it means 'an error occurred' only under the convention that every category maps 0 to success, and a category that used a nonzero code for a success-like status would make if (ec) misleading.",
        "It tests whether the category pointer is non-null; a default error_code is falsy because it has no category.",
        "It returns true on success, mirroring the convention of POSIX return values."
      ],
      "answer": 1,
      "explain": "error_code's explicit operator bool is defined purely as value() != 0; the category is not consulted. The whole system therefore leans on the convention that 0 means success in every category — the standard categories obey it, and your custom categories must too. Note the polarity trap for newcomers: if (ec) is true on failure, so post-call code reads if (ec) { handle failure }, the opposite of how success-returning booleans read."
    },
    {
      "type": "mcq",
      "tag": "narrow vs narrow_cast",
      "question": "The C++ Core Guidelines' support library (GSL) offers gsl::narrow_cast<T>() and gsl::narrow<T>(). What is the difference?",
      "options": [
        "narrow_cast performs the checked conversion; narrow is the unchecked fast path.",
        "Both are compile-time only; they reject narrowing conversions during constexpr evaluation.",
        "narrow_cast is merely a static_cast that documents 'narrowing is intended here', while narrow additionally checks at runtime that the value survives the round trip (same value, same sign) and throws gsl::narrowing_error if information was lost.",
        "narrow returns std::optional<T> instead of throwing."
      ],
      "answer": 2,
      "explain": "Both express intentional narrowing, but at different safety levels: narrow_cast<T>(x) is exactly static_cast<T>(x) plus a searchable name announcing that the loss of range is deliberate. narrow<T>(x) performs the cast and then verifies that converting back reproduces the original value (also catching signed/unsigned sign flips), throwing on mismatch — turning silent truncation into a loud error. Choose narrow at trust boundaries where a lossy value is a genuine runtime error, and narrow_cast where you have already proven the range."
    },
    {
      "type": "code",
      "tag": "expected monadic ops (C++23)",
      "question": "Compiled as C++23, what does this program print?",
      "code": "#include <expected>\n#include <iostream>\n#include <string>\n\nstd::expected<int, std::string> parse(const std::string& s) {\n    if (s.empty()) { return std::unexpected(\"empty\"); }\n    return static_cast<int>(s.size());\n}\n\nint main() {\n    auto r = parse(\"\")\n        .and_then([](int n) -> std::expected<int, std::string> {\n            return n * 10;\n        })\n        .transform([](int n) { return n + 1; })\n        .or_else([](const std::string& e) -> std::expected<int, std::string> {\n            return static_cast<int>(e.size());\n        });\n    std::cout << r.value();\n}",
      "options": [
        "1",
        "0",
        "5",
        "It throws std::bad_expected_access because parse failed."
      ],
      "answer": 2,
      "explain": "parse(\"\") returns an unexpected holding the string \"empty\", so both and_then and transform are skipped — the monadic success operations pass a failed expected straight through, error intact. or_else then runs with the error and recovers by returning a valid expected containing the error's length, 5. The final r.value() succeeds, so nothing throws; this skip-on-error chaining is precisely what the C++23 monadic interface exists for."
    },
    {
      "type": "mcq",
      "tag": "expected<void, E> (C++23)",
      "question": "A function performs an action that returns no data but can fail with a structured error. What does C++23's std::expected<void, E> offer here?",
      "options": [
        "It is ill-formed; std::expected requires a non-void value type.",
        "It behaves like std::optional<E>, where an empty state signals failure.",
        "It throws E automatically when destroyed in the failed state.",
        "A vocabulary return type for 'success with no payload, or an E describing the failure': has_value()/operator bool report success, error() carries the reason, and callers can compose it with the same monadic operations as non-void expected."
      ],
      "answer": 3,
      "explain": "The void specialization is the error-carrying counterpart of a bool return: there is no value to fetch, but has_value() (or if (result)) cleanly separates success from failure and error() explains the failure. It replaces the weaker alternatives — bool loses the reason, optional<E> reads backwards (engaged means failed) — and it participates in and_then/or_else chains. It is the idiomatic C++23 signature for fallible operations like save() or remove() that produce no data."
    },
    {
      "type": "code",
      "tag": "uncaught_exceptions guard",
      "question": "The Txn class implements a commit/rollback scope guard using std::uncaught_exceptions(). What does this program print?",
      "code": "#include <exception>\n#include <iostream>\n#include <stdexcept>\n\nclass Txn {\n    int entry = std::uncaught_exceptions();\npublic:\n    ~Txn() {\n        if (std::uncaught_exceptions() > entry) {\n            std::cout << \"rollback \";\n        } else {\n            std::cout << \"commit \";\n        }\n    }\n};\n\nvoid update(bool fail) {\n    Txn txn;\n    if (fail) { throw std::runtime_error(\"oops\"); }\n}\n\nint main() {\n    update(false);\n    try {\n        update(true);\n    } catch (...) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "commit commit caught",
        "commit rollback caught",
        "rollback commit caught",
        "rollback rollback caught"
      ],
      "answer": 1,
      "explain": "Each Txn snapshots the number of in-flight exceptions at construction and compares it in its destructor: a larger count means this scope is being unwound by a new exception. update(false) exits normally — the counts are equal — so it prints \"commit \". In update(true), the throw starts unwinding and the destructor sees one more uncaught exception than at entry, printing \"rollback \" before the handler prints \"caught\". This is the standard automatic commit-or-rollback guard pattern enabled by the C++17 counting API."
    },
    {
      "type": "code",
      "tag": "Guard during unwinding",
      "question": "This program creates a Txn guard inside a destructor that itself runs during stack unwinding. What does it print, and what does that demonstrate?",
      "code": "#include <exception>\n#include <iostream>\n#include <stdexcept>\n\nclass Txn {\n    int entry = std::uncaught_exceptions();\npublic:\n    ~Txn() {\n        std::cout << (std::uncaught_exceptions() > entry ? \"rollback \" : \"commit \");\n    }\n};\n\nstruct Logger {\n    ~Logger() {          // runs while main's exception is unwinding\n        Txn txn;\n        std::cout << \"flush \";\n    }\n};\n\nint main() {\n    try {\n        Logger log;\n        throw std::runtime_error(\"boom\");\n    } catch (...) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "flush rollback caught — any active exception forces rollback.",
        "rollback flush caught",
        "std::terminate — creating objects during unwinding is not allowed.",
        "flush commit caught — the count taken at construction equals the count at destruction, so the guard correctly commits; the old bool-returning uncaught_exception() would have wrongly reported an exception and forced a rollback."
      ],
      "answer": 3,
      "explain": "Logger's destructor executes while main's exception is unwinding, so std::uncaught_exceptions() is already 1 when Txn is constructed — and still 1 when it is destroyed. Equal counts mean no *new* exception threatens this scope, so the flush legitimately commits: output \"flush commit caught\". Under the pre-C++17 bool API the guard would only see 'an exception is active' and needlessly roll back — exactly the defect that motivated replacing the bool with a count."
    },
    {
      "type": "code",
      "tag": "Guarantee analysis: assignment",
      "question": "On this happy path the program runs fine — but which exception-safety guarantee does Name::operator= provide if new char[] throws std::bad_alloc?",
      "code": "#include <cstring>\n\nclass Name {\n    char* text;\npublic:\n    explicit Name(const char* s) : text(new char[std::strlen(s) + 1]) {\n        std::strcpy(text, s);\n    }\n    Name(const Name&) = delete;\n    Name& operator=(const Name& rhs) {\n        if (this == &rhs) { return *this; }\n        delete[] text;\n        text = new char[std::strlen(rhs.text) + 1];   // may throw\n        std::strcpy(text, rhs.text);\n        return *this;\n    }\n    ~Name() { delete[] text; }\n};\n\nint main() {\n    Name a(\"alpha\");\n    Name b(\"beta\");\n    a = b;\n}",
      "options": [
        "The strong guarantee: a is either fully assigned or unchanged.",
        "The basic guarantee: a's value is unspecified but it remains a valid Name.",
        "No guarantee at all: the old buffer is deleted before the new one is allocated, so if new throws, text is left dangling and ~Name will delete it again — undefined behavior.",
        "The nothrow guarantee, because operator= returns a reference."
      ],
      "answer": 2,
      "explain": "The operator destroys the old state (delete[] text) before attempting the operation that can fail; if new throws, the exception propagates out of a Name whose text points to freed memory, and its eventual destructor performs a double delete. That broken invariant means the code fails even the basic guarantee. The minimal fix — allocate and copy into a temporary pointer first, then delete and reassign — restores the strong guarantee; copy-and-swap achieves the same more systematically."
    },
    {
      "type": "code",
      "tag": "Guarantee analysis: invariant",
      "question": "Roster documents the invariant names.size() == ids.size(). If ids.push_back(id) throws std::bad_alloc after names.push_back(name) succeeded, what is the exception-safety status of add?",
      "code": "#include <string>\n#include <vector>\n\nclass Roster {\n    // Invariant: names.size() == ids.size()\n    std::vector<std::string> names;\n    std::vector<int> ids;\npublic:\n    void add(const std::string& name, int id) {\n        names.push_back(name);   // may throw\n        ids.push_back(id);       // may throw\n    }\n};\n\nint main() {\n    Roster r;\n    r.add(\"Ada\", 1);\n}",
      "options": [
        "Nothing leaks, but the documented invariant is broken (the vectors' sizes diverge), so add does not even meet the basic guarantee for this class; a rollback — catching the exception and popping names before rethrowing — would restore the strong guarantee.",
        "It meets the strong guarantee because each push_back individually provides it.",
        "It meets the basic guarantee: both vectors remain valid vectors, which is all that is required.",
        "It is undefined behavior, since bad_alloc during push_back corrupts the vector."
      ],
      "answer": 0,
      "explain": "Each push_back is individually strong and nothing leaks, but exception safety is judged against the class's own invariant: after the partial failure names has an entry ids lacks, leaving the Roster observably corrupt — worse than 'valid but unspecified'. The basic guarantee requires invariants to hold, so this fails it. The classic repair is a rollback (try the second push_back, and on exception pop_back the first before rethrowing), or reserving capacity up front so the second push_back cannot throw — both upgrade add to the strong guarantee."
    },
    {
      "type": "code",
      "tag": "Copy-and-swap in action",
      "question": "Box uses the copy-and-swap idiom, and copying a Box whose size exceeds 100 throws. What does this program print?",
      "code": "#include <iostream>\n#include <stdexcept>\n#include <utility>\n\nclass Box {\n    int size;\npublic:\n    Box(int s) : size(s) {}\n    Box(const Box& other) : size(other.size) {\n        if (size > 100) { throw std::runtime_error(\"copy failed\"); }\n    }\n    Box& operator=(Box rhs) {          // pass by value: copy happens here\n        std::swap(size, rhs.size);     // nothrow commit\n        return *this;\n    }\n    int get() const { return size; }\n};\n\nint main() {\n    Box a(7);\n    Box big(500);\n    try {\n        a = big;\n    } catch (...) {\n        std::cout << \"failed,\";\n    }\n    std::cout << a.get();\n}",
      "options": [
        "failed,500",
        "500",
        "failed,7",
        "7 — but a is left in a moved-from state, so reading it is unspecified."
      ],
      "answer": 2,
      "explain": "Because operator= takes its parameter by value, the potentially-throwing copy of big happens while initializing rhs — before the assignment body ever runs. The copy constructor throws (500 > 100), so a = big aborts without touching a, the handler prints \"failed,\", and a.get() still returns 7. All risky work first, then a nothrow swap to commit: that ordering is exactly what gives copy-and-swap assignment the strong guarantee."
    },
    {
      "type": "mcq",
      "tag": "Two-phase commit",
      "question": "A function must update three data structures so that observers never see a partial update, even if any step throws. Which design achieves the strong guarantee?",
      "options": [
        "Update the structures in order of decreasing importance, so a failure loses only minor data.",
        "Phase one: perform every operation that can throw on side copies (or compute the new versions) without touching the live structures; phase two: publish the results using only nothrow operations such as swap or pointer reassignment.",
        "Wrap the three updates in a try block and log any exception before continuing.",
        "Mark the function noexcept so that no exception can interrupt the update."
      ],
      "answer": 1,
      "explain": "The strong guarantee across multiple objects comes from separating fallible work from publication: build the three new states off to the side (copies, staged versions), where a throw damages nothing observable, and only when everything has succeeded commit with operations guaranteed not to throw — member swap, moving a noexcept handle, repointing a smart pointer. If the commit phase cannot throw, the update is atomic with respect to exceptions. Ordering by importance or logging does not prevent partial visibility, and noexcept would just turn a failure into std::terminate."
    },
    {
      "type": "mcq",
      "tag": "[[assume]] vs assert (C++23)",
      "question": "How does C++23's [[assume(expr)]] differ from assert(expr)?",
      "options": [
        "[[assume]] is a portable spelling of assert that also works in release builds.",
        "[[assume]] checks the condition at compile time and rejects the program if it can be false.",
        "assert verifies the condition at runtime (in debug builds) and aborts with a diagnostic when it fails, whereas [[assume]] never evaluates the expression at all — it is a promise to the optimizer, and if the assumed condition would not hold at that point, the behavior is undefined.",
        "They are equivalent when NDEBUG is defined."
      ],
      "answer": 2,
      "explain": "The two point in opposite directions: assert is a safety net that catches your mistakes by evaluating the condition and aborting on failure (in debug builds), while [[assume(expr)]] hands the optimizer a fact it may exploit — dropping range checks, simplifying branches — without ever evaluating expr at runtime. If the assumption is wrong you do not get a diagnostic; you get undefined behavior, potentially miscompiled code. So assume is a sharp performance tool for conditions you have already proven, never a substitute for checking."
    },
    {
      "type": "mcq",
      "tag": "static_assert vs runtime",
      "question": "A template Pool<T> requires that T be nothrow-move-constructible for its rebalancing algorithm to keep the strong guarantee. What is the best way to enforce this?",
      "options": [
        "static_assert(std::is_nothrow_move_constructible_v<T>, \"...\") in the template: the requirement is knowable at compile time, so violations should fail the build with a clear message and impose zero runtime cost, rather than surface as a debug-only assert or a thrown exception.",
        "assert(std::is_nothrow_move_constructible_v<T>) at the top of each member function.",
        "Throw std::invalid_argument from the constructor when the trait is false.",
        "Document the requirement; enforcing type properties in code is impossible."
      ],
      "answer": 0,
      "explain": "The property is a compile-time fact about the type, so the check belongs at compile time: static_assert costs nothing at runtime, cannot be compiled out accidentally, and reports the violation at the exact instantiation point with your message. A runtime assert would evaluate a constant and fire only in debug builds; throwing turns a programming error into a runtime path that should never legitimately execute. Reserve runtime checks (assert, exceptions) for conditions that depend on runtime data; use static_assert or concepts for everything the compiler can prove."
    },
    {
      "type": "mcq",
      "tag": "Wide vs narrow contracts",
      "question": "std::vector::at() and operator[] differ in their contracts. Which description is correct?",
      "options": [
        "Both have narrow contracts; at() merely aborts more predictably.",
        "operator[] has a wide contract: it returns a default value for bad indexes.",
        "at() has a narrow contract enforced by the linker; operator[] is checked at runtime.",
        "at() has a wide contract — any index is acceptable input, and out-of-range is a specified, checked outcome (it throws std::out_of_range); operator[] has a narrow contract — a valid index is a precondition, and violating it is undefined behavior, unchecked in release builds."
      ],
      "answer": 3,
      "explain": "A wide contract defines behavior for every input: at() promises a bounds check and a std::out_of_range exception, making bad indexes a recoverable, specified event. A narrow contract states preconditions the caller must uphold: operator[] does not define what happens for an invalid index, so violating it is UB — typically unchecked in release, possibly assert-caught in debug. The design guidance follows: narrow contracts plus assertions for internal code where callers can guarantee validity (paying no check cost), wide contracts at trust boundaries where inputs cannot be assumed."
    },
    {
      "type": "mcq",
      "tag": "Swallowing exceptions",
      "question": "A code review finds this in a request handler:\n\ntry {\n    processOrder(order);\n} catch (...) {\n    // ignore: keep the server running\n}\n\nWhy is this pattern dangerous, and what is the accepted alternative?",
      "options": [
        "It is fine as long as processOrder provides the basic guarantee.",
        "catch (...) silently swallows everything — logic_errors revealing bugs, bad_alloc, failures the caller was owed — leaving the system running in a possibly corrupt state with no record; instead catch the specific types you expect, and in any catch-all log and rethrow with a bare throw; (or translate to a defined error result) rather than fall through silently.",
        "catch (...) is illegal outside of main().",
        "The only problem is performance: an empty handler forces a full stack unwind."
      ],
      "answer": 1,
      "explain": "An empty catch-all converts every failure — including ones that indicate corrupted invariants or exhausted resources — into silent success, so the process keeps running on possibly inconsistent state and the defect surfaces later, far from its cause, with no diagnostic trail. Reserve catch (...) for boundaries where exceptions must not leak (thread entry points, C callbacks, plugin edges), and even there: log, then rethrow with throw; or convert to an explicit error result. Swallowing should be a rare, commented, deliberate decision about a specific exception type, never the default."
    },
    {
      "type": "code",
      "tag": "set_terminate",
      "question": "What is the outcome of running this program?",
      "code": "#include <cstdlib>\n#include <exception>\n#include <iostream>\n\nint main() {\n    std::set_terminate([] {\n        std::cout << \"custom handler\" << std::endl;\n        std::abort();\n    });\n    throw 42;   // no handler anywhere\n}",
      "options": [
        "It prints nothing; custom terminate handlers are ignored for uncaught exceptions.",
        "It prints \"custom handler\" and then aborts abnormally (SIGABRT): the uncaught int triggers std::terminate, which invokes the installed handler, and the handler must end the program — it is not allowed to return.",
        "It prints \"custom handler\" and then exits normally with status 0.",
        "It fails to compile: throw requires an operand derived from std::exception."
      ],
      "answer": 1,
      "explain": "Throwing an int is legal (any copyable type can be thrown), and with no matching handler anywhere std::terminate is called, which invokes the handler registered via std::set_terminate. The lambda prints its message and calls std::abort — required, since a terminate handler must not return to its caller. Such handlers are a last-chance hook for logging or crash reporting, not a recovery mechanism: there is no way to resume the program from terminate."
    },
    {
      "type": "mcq",
      "tag": "Escaping main()",
      "question": "An exception propagates out of main() with no handler. Which statement matches the standard?",
      "options": [
        "main() implicitly catches everything and returns EXIT_FAILURE.",
        "The stack is fully unwound, static destructors run, and then std::terminate is called.",
        "std::terminate is called — but whether the stack is unwound first (i.e. whether destructors of local objects run) is implementation-defined, so RAII cleanup such as flushing files or releasing system-wide resources is not guaranteed on this path.",
        "The behavior is undefined; anything may happen."
      ],
      "answer": 2,
      "explain": "When no handler is found for an exception, std::terminate is called, and the standard leaves it implementation-defined whether the stack is unwound before that happens — many implementations skip unwinding entirely to preserve the crash context for debugging. That means destructors of locals in main and below may never run: buffered data can be lost, lock files left behind. Programs that need orderly shutdown on any failure therefore wrap main's body in try { } catch (...) { /* log, cleanup */ } so cleanup happens via a normal handler path instead."
    },
    {
      "type": "code",
      "tag": "future_error",
      "question": "get_future() is called twice on the same promise. What does this program print?",
      "code": "#include <future>\n#include <iostream>\n\nint main() {\n    std::promise<int> prom;\n    auto f1 = prom.get_future();\n    try {\n        auto f2 = prom.get_future();   // second future from same promise\n        std::cout << \"second future \";\n    } catch (const std::future_error& e) {\n        std::cout << (e.code() == std::future_errc::future_already_retrieved) << ' ';\n    }\n    prom.set_value(9);\n    std::cout << f1.get();\n}",
      "options": [
        "second future 9",
        "It deadlocks: two futures on one promise wait for two set_value calls.",
        "0 9 — the exception's code is compared against the wrong error category.",
        "1 9"
      ],
      "answer": 3,
      "explain": "A promise owns a single shared state, and get_future() may be called exactly once; the second call throws std::future_error with the condition future_errc::future_already_retrieved, so the comparison prints 1. Note that future_error carries a code from the future category — the library reuses the <system_error> machinery for its own domain-specific errors instead of inventing a new mechanism. The program then completes normally: set_value(9) fulfills the promise and f1.get() prints 9."
    },
    {
      "type": "code",
      "tag": "Static init retried",
      "question": "The local static c is dynamically initialized the first time get() is called. What does this program print?",
      "code": "#include <iostream>\n#include <stdexcept>\n\nint attempts = 0;\n\nstruct Conn {\n    Conn() {\n        if (++attempts < 3) { throw std::runtime_error(\"refused\"); }\n        std::cout << \"connected(\" << attempts << \") \";\n    }\n};\n\nConn& get() {\n    static Conn c;   // dynamic initialization of a local static\n    return c;\n}\n\nint main() {\n    for (int i = 0; i < 4; ++i) {\n        try {\n            get();\n            std::cout << \"ok\" << i << ' ';\n        } catch (const std::exception&) {\n            std::cout << \"fail\" << i << ' ';\n        }\n    }\n}",
      "options": [
        "fail0 fail1 fail2 fail3 — once initialization fails, the static is poisoned forever.",
        "connected(1) ok0 ok1 ok2 ok3",
        "fail0 fail1 connected(3) ok2 ok3",
        "fail0 fail1 connected(3) ok2 connected(4) ok3"
      ],
      "answer": 2,
      "explain": "If the initialization of a local static exits via an exception, the standard says initialization is not considered complete, and it is attempted again the next time control passes through the declaration. The first two calls throw (attempts 1 and 2), printing fail0 and fail1; the third attempt succeeds, printing connected(3) then ok2; the fourth call sees an already-initialized static, skips construction, and prints ok3. This retry semantic makes throwing constructors compatible with the Meyers-singleton pattern — a failed first use does not doom later ones."
    }
  ]
};

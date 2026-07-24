/* ===== C++ Software Design — Strategy, Command & std::function ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["swd-strategy"] = {
  title: "C++ Software Design — Strategy, Command & std::function",
  subtitle: "Behavior injection, strategy vs command, std::function-based design and its costs.",
  crumb: "C++ Software Design",
  questions: [
    {
      "type": "mcq",
      "tag": "Strategy intent",
      "question": "Which statement best captures the intent of the Strategy design pattern as presented in \"C++ Software Design\"?",
      "options": [
        "To encapsulate a request as an object so it can be queued, logged, and undone later",
        "To give every class a single, stable public interface that never needs to change",
        "To extract the implementation details of HOW an operation is performed, so that this behavior can vary independently and be injected from outside the class",
        "To convert the interface of an existing class into another interface that clients expect"
      ],
      "answer": 2,
      "explain": "Strategy is about isolating a variation point: the class keeps WHAT it does, but HOW it does it is extracted behind an abstraction and injected. This lets the behavior vary without modifying the class itself. Option 0 describes Command and option 3 describes Adapter; both are different intents."
    },
    {
      "type": "mcq",
      "tag": "Drawing example",
      "question": "In Iglberger's running example, Circle::draw() initially contains OpenGL code directly inside the shape class. What is the primary design flaw he identifies?",
      "options": [
        "The shape classes are coupled to the details of one concrete drawing implementation, so switching or adding a graphics library forces changes to every shape class",
        "Drawing is too slow because the OpenGL calls cannot be inlined into the shape classes",
        "The shapes cannot be stored in a std::vector because OpenGL handle types are not copyable",
        "Virtual draw() functions cannot take parameters, so the OpenGL context has to be a global variable"
      ],
      "answer": 0,
      "explain": "Hard-coding the drawing implementation inside Circle couples the geometric abstraction to one specific technology and one implementation detail. Every change to drawing ripples through all shapes, and supporting a second library becomes invasive. The fix is to extract HOW drawing happens and inject it — the essence of Strategy."
    },
    {
      "type": "code",
      "tag": "std::function strategy",
      "question": "This is a compressed version of the book's std::function-based Strategy. What does the program print?",
      "code": "#include <functional>\n#include <iostream>\n\nclass Circle {\npublic:\n    using DrawStrategy = std::function<void(const Circle&)>;\n    Circle(double radius, DrawStrategy drawer)\n        : radius_(radius), drawer_(std::move(drawer)) {}\n    void draw() const { drawer_(*this); }\n    double radius() const { return radius_; }\nprivate:\n    double radius_;\n    DrawStrategy drawer_;\n};\n\nint main() {\n    Circle c1(2.0, [](const Circle& c){ std::cout << \"GL:\" << c.radius() << \" \"; });\n    Circle c2(3.0, [](const Circle& c){ std::cout << \"SVG:\" << c.radius(); });\n    c1.draw();\n    c2.draw();\n}",
      "options": [
        "GL:2 SVG:2",
        "GL:3 SVG:2",
        "SVG:3 GL:2",
        "GL:2 SVG:3"
      ],
      "answer": 3,
      "explain": "Each Circle stores its own copy of the injected callable and draw() simply delegates to it, passing itself as argument. c1 was constructed with the GL lambda and radius 2, c2 with the SVG lambda and radius 3, so the output is \"GL:2 SVG:3\". The behavior is chosen per object at construction time, not globally."
    },
    {
      "type": "mcq",
      "tag": "Classic OO Strategy",
      "question": "In the classic object-oriented Strategy solution from the book, how does a Circle obtain its drawing behavior?",
      "options": [
        "It inherits from an OpenGLCircle base class that provides a concrete draw() implementation",
        "A std::unique_ptr to a DrawCircleStrategy implementation is passed to Circle's constructor and stored as a member; draw() delegates to it",
        "It looks up the currently active strategy in a global registry every time draw() is called",
        "The strategy is supplied as a template parameter that is fixed at compile time"
      ],
      "answer": 1,
      "explain": "The classic form defines an abstract strategy base class and injects a concrete implementation through the constructor, typically owned via std::unique_ptr. The shape delegates the operation to the stored strategy. Registry lookups and template parameters are different mechanisms, and inheriting per implementation is exactly the design the pattern avoids."
    },
    {
      "type": "code",
      "tag": "Virtual strategy",
      "question": "What does this classic (virtual-function-based) Strategy program print?",
      "code": "#include <iostream>\n#include <memory>\n\nclass DrawStrategy {\npublic:\n    virtual ~DrawStrategy() = default;\n    virtual void draw() const = 0;\n};\nclass OpenGLDrawer : public DrawStrategy {\npublic:\n    void draw() const override { std::cout << \"GL\"; }\n};\nclass VulkanDrawer : public DrawStrategy {\npublic:\n    void draw() const override { std::cout << \"VK\"; }\n};\n\nclass Shape {\npublic:\n    explicit Shape(std::unique_ptr<DrawStrategy> s) : strategy_(std::move(s)) {}\n    void draw() const { strategy_->draw(); }\nprivate:\n    std::unique_ptr<DrawStrategy> strategy_;\n};\n\nint main() {\n    Shape a(std::make_unique<OpenGLDrawer>());\n    Shape b(std::make_unique<VulkanDrawer>());\n    a.draw();\n    b.draw();\n}",
      "options": [
        "GLGL",
        "VKGL",
        "GLVK",
        "Compile error: a std::unique_ptr<DrawStrategy> cannot hold a derived type"
      ],
      "answer": 2,
      "explain": "Each Shape owns whatever concrete strategy was injected at construction: a holds an OpenGLDrawer, b a VulkanDrawer. The virtual call dispatches to the dynamic type, printing \"GL\" then \"VK\". unique_ptr to base holding a derived object is the standard ownership idiom here — and the virtual destructor in the base makes the deletion safe."
    },
    {
      "type": "mcq",
      "tag": "Strategy proliferation",
      "question": "Iglberger notes that a DrawCircleStrategy does not help when serialization must also become configurable. What structural problem emerges as more operations need to vary?",
      "options": [
        "A separate strategy base class — and a whole hierarchy of implementations — is needed per customizable operation, so strategy interfaces proliferate with every new aspect",
        "All strategies must derive from one common base class, so unrelated operations become artificially coupled together",
        "Each new operation requires adding a virtual function to the Shape base class, which breaks binary compatibility",
        "Strategies must become templates, forcing all client code to move into header files"
      ],
      "answer": 0,
      "explain": "Strategy extracts one operation at a time: drawing gets a DrawStrategy hierarchy, serialization would need its own SerializationStrategy hierarchy, and so on. Each new variation point spawns another interface plus implementations, which is the proliferation cost of the classic form. This is one motivation the book gives for the leaner std::function-based variant."
    },
    {
      "type": "mcq",
      "tag": "Inheritance alternative",
      "question": "Instead of Strategy one could derive OpenGLCircle, MetalCircle, OpenGLSquare, MetalSquare, ... from the shape classes. Why does the book reject this approach?",
      "options": [
        "Derived classes cannot override draw() when shapes are used as value types",
        "It requires RTTI, which many production codebases disable",
        "It makes the shape classes abstract, so plain circles could no longer be instantiated",
        "It causes a combinatorial explosion of classes and couples the shape hierarchy to implementation details — adding one more library means touching every shape"
      ],
      "answer": 3,
      "explain": "With N shapes and M implementations you would need N times M derived classes, and each new library multiplies the hierarchy again. Worse, implementation details climb into the inheritance hierarchy, which should express abstraction, not technology choices. Strategy composes the varying behavior instead of inheriting it."
    },
    {
      "type": "mcq",
      "tag": "Costs of virtual strategy",
      "question": "Which costs does the pointer-to-base (classic) Strategy implementation carry, according to the book?",
      "options": [
        "The strategy call cannot be virtual, so the behavior cannot vary at run time",
        "A heap allocation for the strategy object, an extra indirection on every call, and pointer-based lifetime/ownership management — i.e. reference semantics",
        "The strategy is fixed at compile time and can never be replaced afterwards",
        "Every shape must itself be heap-allocated, because classes with virtual members cannot live on the stack"
      ],
      "answer": 1,
      "explain": "The classic form allocates the concrete strategy on the heap, reaches it through a pointer, and dispatches virtually — costs in allocation, indirection, and lifetime management. It also drags in reference semantics, which the book generally advises minimizing. Options 0 and 2 invert the facts, and stack allocation of polymorphic objects is perfectly legal."
    },
    {
      "type": "mcq",
      "tag": "std::function benefits",
      "question": "What is the key usability benefit of implementing Strategy with std::function instead of a strategy base class?",
      "options": [
        "It is guaranteed to be faster than a virtual call because the compiler can always inline through std::function",
        "It automatically provides undo support for whatever behavior is injected",
        "Callers can pass any matching callable — lambda, free function, functor — without writing a class that inherits from a strategy interface, and the object owns its behavior with value semantics",
        "It removes the need to choose behavior at construction; the behavior is instead selected independently at every call site"
      ],
      "answer": 2,
      "explain": "std::function erases the concrete callable type, so users provide behavior directly as lambdas or functions with zero inheritance boilerplate. The shape stores its own copy — value semantics — rather than a pointer into a hierarchy. Performance is not improved (it is comparable to a virtual call or worse), so option 0 is wrong."
    },
    {
      "type": "code",
      "tag": "Reassigning std::function",
      "question": "A std::function strategy is invoked, reassigned, and finally set to nullptr. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nint main() {\n    std::function<int(int)> f = [](int x){ return x + 1; };\n    std::cout << f(1);\n    f = [](int x){ return x * 10; };\n    std::cout << f(2);\n    f = nullptr;\n    std::cout << (f ? \"Y\" : \"N\");\n}",
      "options": [
        "220N",
        "23Y",
        "220Y",
        "2, then it throws std::bad_function_call"
      ],
      "answer": 0,
      "explain": "f(1) with the first lambda yields 2, then f is reassigned and f(2) yields 20 — a strategy held in std::function can be swapped at run time. Assigning nullptr empties f, and an empty std::function converts to false, printing N. Nothing throws because the empty function is never invoked."
    },
    {
      "type": "code",
      "tag": "Function pointer strategy",
      "question": "Free functions can serve as strategies too. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nint twice(int x)  { return 2 * x; }\nint thrice(int x) { return 3 * x; }\n\nint main() {\n    std::function<int(int)> scale = twice;\n    std::cout << scale(4);\n    scale = thrice;\n    std::cout << scale(4);\n}",
      "options": [
        "88",
        "1212",
        "8 12",
        "812"
      ],
      "answer": 3,
      "explain": "std::function happily wraps plain function pointers: scale(4) first calls twice, printing 8. After reassignment it calls thrice, printing 12, with no separator between the two outputs. This shows the injected behavior is not limited to lambdas or classes."
    },
    {
      "type": "mcq",
      "tag": "std::function copies",
      "question": "A class stores a std::function member holding a stateful lambda. What happens when an instance of the class is copied?",
      "options": [
        "Both copies share the same captured state through an internal shared_ptr",
        "The wrapped callable, including its captured state, is copied — the two std::function objects are fully independent afterwards",
        "The copy is shallow: the new std::function refers to the original until it is first modified (copy-on-write)",
        "The copy is ill-formed; std::function is a move-only type"
      ],
      "answer": 1,
      "explain": "std::function has genuine value semantics: copying it copies the stored callable, captures and all. Afterwards the two objects evolve independently, which is exactly the behavior value-based design wants. It is copyable (unlike std::move_only_function) and performs no sharing or copy-on-write."
    },
    {
      "type": "code",
      "tag": "Mutable lambda state",
      "question": "A mutable lambda is copied into and between std::function objects. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nint main() {\n    int n = 0;\n    auto lam = [n]() mutable { return ++n; };\n    std::function<int()> f = lam;\n    std::function<int()> g = f;\n    std::cout << f() << f() << g() << lam();\n}",
      "options": [
        "1231",
        "1233",
        "1211",
        "1212"
      ],
      "answer": 2,
      "explain": "f receives a copy of lam with n == 0, and g copies f before any calls, so g starts at 0 as well. f() twice prints 1 then 2; g(), operating on its own independent state, prints 1; lam itself was never advanced, so lam() prints 1. Every copy of a stateful callable carries its own state — a core value-semantics point."
    },
    {
      "type": "code",
      "tag": "Reference-capturing strategy",
      "question": "A Counter class stores a strategy that captures a local variable by reference, and the Counter is copied. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nclass Counter {\npublic:\n    explicit Counter(std::function<void()> op) : op_(std::move(op)) {}\n    void run() { op_(); }\nprivate:\n    std::function<void()> op_;\n};\n\nint main() {\n    int calls = 0;\n    Counter a([&calls]{ ++calls; });\n    Counter b = a;\n    a.run();\n    b.run();\n    b.run();\n    std::cout << calls;\n}",
      "options": [
        "3",
        "1",
        "2",
        "0"
      ],
      "answer": 0,
      "explain": "The lambda captures calls by reference, so although Counter b copies the std::function from a, both copies still refer to the same int in main. All three run() calls increment that one variable, printing 3. Reference captures silently reintroduce shared state even in an otherwise value-based design."
    },
    {
      "type": "code",
      "tag": "Per-copy state",
      "question": "The counter state lives inside the callable itself via an init-capture, and the Widget is copied. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nclass Widget {\npublic:\n    explicit Widget(std::function<int()> op) : op_(std::move(op)) {}\n    int run() { return op_(); }\nprivate:\n    std::function<int()> op_;\n};\n\nint main() {\n    Widget a([n = 0]() mutable { return ++n; });\n    Widget b = a;\n    std::cout << a.run() << a.run() << b.run();\n}",
      "options": [
        "123",
        "111",
        "122",
        "121"
      ],
      "answer": 3,
      "explain": "The init-capture [n = 0] stores the counter inside the closure, so the state lives in the callable itself. b copies a (and its closure state, still 0) before any call. a.run() twice yields 1 and 2; b.run() on its independent copy yields 1 — output \"121\". Compare this with a reference capture, where all copies would share one counter."
    },
    {
      "type": "mcq",
      "tag": "Sink parameter idiom",
      "question": "The book's Circle takes its strategy as Circle(DrawStrategy drawer) : drawer_(std::move(drawer)). Why take the std::function by value and move it?",
      "options": [
        "Passing by value rejects temporaries, guaranteeing the strategy outlives the circle",
        "By-value accepts both lvalues (one copy) and rvalues (moved in), and std::move into the member avoids a second copy — a simple, near-optimal sink idiom",
        "std::function cannot be passed by const reference, so by-value is the only option",
        "std::move performs a deep copy that re-anchors any reference captures to the new object"
      ],
      "answer": 1,
      "explain": "A by-value \"sink\" parameter lets callers pass lvalues (copied into the parameter) or rvalues (moved into it), and the constructor then moves the parameter into the member. That gives at most one copy for lvalues and zero for rvalues, with a single overload. std::move is just a cast to rvalue; it neither copies nor fixes up captures."
    },
    {
      "type": "code",
      "tag": "Multiple strategies",
      "question": "This class has two independently injected behaviors. What does the program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <string>\n\nclass Document {\npublic:\n    Document(std::function<std::string()> render,\n             std::function<std::string()> exporter)\n        : render_(std::move(render)), export_(std::move(exporter)) {}\n    void print() const { std::cout << render_() << \"/\" << export_(); }\nprivate:\n    std::function<std::string()> render_;\n    std::function<std::string()> export_;\n};\n\nint main() {\n    Document d([]{ return std::string(\"html\"); },\n               []{ return std::string(\"pdf\"); });\n    d.print();\n}",
      "options": [
        "pdf/html",
        "html/html",
        "html/pdf",
        "Compile error: a class may have only one std::function member per signature"
      ],
      "answer": 2,
      "explain": "Nothing prevents a class from holding several std::function members, one per customizable operation; they are ordinary members with distinct names. render_ was bound to the \"html\" lambda and export_ to the \"pdf\" lambda, so print() emits \"html/pdf\". This is the std::function answer to needing multiple variation points without multiple strategy hierarchies."
    },
    {
      "type": "mcq",
      "tag": "One member per aspect",
      "question": "A class needs customizable drawing AND customizable serialization. What is the natural std::function-based design, in the spirit of the book?",
      "options": [
        "Store one std::function member per customizable operation and inject each separately, keeping the variation points independent instead of building one fat strategy interface",
        "Store a single std::function<void()> and switch on a mode flag inside the callable",
        "Merge both operations into one abstract strategy class with two pure virtual functions, since std::function cannot express two behaviors",
        "Use std::function<void(int)> and encode which operation to perform in the int argument"
      ],
      "answer": 0,
      "explain": "Each std::function member represents exactly one variation point, so drawing and serialization can be configured, tested, and replaced independently. Bundling unrelated operations into one interface couples clients to functions they do not need — the interface-segregation problem the granular approach avoids. Mode flags and encoded arguments are just fat interfaces in disguise."
    },
    {
      "type": "code",
      "tag": "Signature conversions",
      "question": "The lambda takes double but the std::function is declared with an int parameter. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nint main() {\n    std::function<double(int)> f = [](double x){ return x / 2; };\n    std::cout << f(5);\n}",
      "options": [
        "2",
        "5",
        "2.5",
        "Compile error: the lambda parameter type must match the std::function signature exactly"
      ],
      "answer": 2,
      "explain": "std::function only requires the stored callable to be invocable with the declared argument types — implicit conversions are fine. The int 5 converts to double 5.0, the lambda returns 2.5, and that double is returned unchanged. This flexibility is part of the type erasure: exact signature identity is not required."
    },
    {
      "type": "mcq",
      "tag": "Empty std::function",
      "question": "What happens when you invoke a default-constructed (empty) std::function?",
      "options": [
        "Undefined behavior: the call jumps through an uninitialized pointer",
        "It throws std::bad_function_call",
        "It returns a value-initialized result and performs no other action",
        "It is a harmless no-op for void signatures and UB for non-void ones"
      ],
      "answer": 1,
      "explain": "Calling an empty std::function is well-defined: it throws std::bad_function_call. This is friendlier than a raw null function pointer, but it still means a run-time failure. Designs that must never throw here either validate the callable at injection time or install a do-nothing null-object strategy as the default."
    },
    {
      "type": "code",
      "tag": "bad_function_call",
      "question": "An empty std::function is invoked inside a try block. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nint main() {\n    std::function<void()> f;\n    try {\n        f();\n    } catch (const std::bad_function_call&) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "Nothing: the program crashes with a segmentation fault",
        "Nothing: invoking an empty std::function is specified as a no-op",
        "caught",
        "Nothing is guaranteed: the invocation is undefined behavior"
      ],
      "answer": 2,
      "explain": "f holds no target, and the standard specifies that invoking an empty std::function throws std::bad_function_call. The handler catches it and prints \"caught\". The empty state is well-defined and detectable (via the explicit operator bool), not UB."
    },
    {
      "type": "code",
      "tag": "Comparator strategy",
      "question": "A comparison strategy is passed to std::sort through a std::function. What does this program print?",
      "code": "#include <algorithm>\n#include <functional>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> v{3, 1, 2};\n    std::function<bool(int, int)> cmp = [](int a, int b){ return a > b; };\n    std::sort(v.begin(), v.end(), cmp);\n    for (int x : v) std::cout << x;\n}",
      "options": [
        "321",
        "123",
        "132",
        "Compile error: std::sort requires a comparator type, not a std::function"
      ],
      "answer": 0,
      "explain": "std::sort accepts any callable comparator, including a std::function, and the injected lambda orders descending (a > b), giving 3 2 1. Note the cost: every comparison goes through the type-erased indirect call, whereas passing the lambda directly would let the compiler inline it — the classic std::function-versus-template trade-off in miniature."
    },
    {
      "type": "mcq",
      "tag": "Call overhead comparison",
      "question": "How does the calling overhead of a std::function-based strategy compare to the virtual and template alternatives, per the book's discussion?",
      "options": [
        "std::function is always faster than a virtual call because it avoids the vtable",
        "All three mechanisms compile to identical machine code in optimized builds",
        "The template policy is the slowest because template instantiation happens at run time",
        "A std::function call costs roughly on the order of a virtual call (indirection, usually no inlining), while a template policy binds at compile time and can be fully inlined"
      ],
      "answer": 3,
      "explain": "Type erasure buys runtime flexibility at the price of an indirect call that optimizers generally cannot inline — comparable to (sometimes worse than) a virtual dispatch. The template policy resolves the call statically, so the strategy code can be inlined into the caller with zero dispatch overhead. Templates are instantiated at compile time, never at run time."
    },
    {
      "type": "mcq",
      "tag": "Policy trade-off",
      "question": "What is the essential trade-off of supplying the strategy as a template parameter (policy-based design)?",
      "options": [
        "It requires all policies to derive from a common CRTP base class",
        "You get zero-overhead, compile-time binding with full inlining potential, but the chosen strategy is baked into the type and cannot change at run time",
        "It allows runtime switching but pessimizes every call into a double indirection",
        "It works only with stateless policies that have no data members"
      ],
      "answer": 1,
      "explain": "A template policy is resolved during compilation: no virtual dispatch, no type erasure, and the optimizer sees straight through the call. The cost is rigidity — each policy choice produces a distinct class type, so the decision is fixed per instantiation and cannot be revised at run time. No common base is required, and stateful policies are perfectly possible."
    },
    {
      "type": "code",
      "tag": "Policy dispatch",
      "question": "A sorting policy is supplied as a template parameter. What does this program print?",
      "code": "#include <iostream>\n\nstruct Quick { void apply() { std::cout << \"Q\"; } };\nstruct Merge { void apply() { std::cout << \"M\"; } };\n\ntemplate <typename SortPolicy>\nclass Container {\npublic:\n    void sort() { SortPolicy{}.apply(); }\n};\n\nint main() {\n    Container<Quick> a;\n    Container<Merge> b;\n    a.sort();\n    b.sort();\n    a.sort();\n}",
      "options": [
        "QM",
        "QQM",
        "QMQ",
        "Compile error: SortPolicy{}.apply() requires apply() to be virtual"
      ],
      "answer": 2,
      "explain": "Container<Quick> and Container<Merge> are two distinct instantiations, each statically bound to its policy. The calls resolve at compile time — a.sort() prints Q, b.sort() prints M, a.sort() prints Q again — no virtual functions involved. This is the Strategy pattern moved entirely to compile time."
    },
    {
      "type": "code",
      "tag": "Static policy functions",
      "question": "Each policy exposes a static apply() function used by a function template. What does this program print?",
      "code": "#include <iostream>\n\nstruct Doubler { static int apply(int x) { return 2 * x; } };\nstruct Squarer { static int apply(int x) { return x * x; } };\n\ntemplate <typename Policy>\nint compute(int x) {\n    return Policy::apply(x);\n}\n\nint main() {\n    std::cout << compute<Doubler>(3) << compute<Squarer>(3);\n}",
      "options": [
        "69",
        "96",
        "66",
        "39"
      ],
      "answer": 0,
      "explain": "compute<Doubler>(3) statically calls Doubler::apply, yielding 6; compute<Squarer>(3) yields 9 — output \"69\". Because Policy::apply is a static member resolved at compile time, no policy object is even constructed and the calls can be inlined completely. This is the zero-overhead end of the strategy spectrum."
    },
    {
      "type": "code",
      "tag": "Default policy",
      "question": "The greeting policy has a default template argument. What does this program print?",
      "code": "#include <iostream>\n\nstruct Loud  { static void greet() { std::cout << \"HI\"; } };\nstruct Quiet { static void greet() { std::cout << \"hi\"; } };\n\ntemplate <typename GreetPolicy = Quiet>\nstruct Greeter {\n    void greet() const { GreetPolicy::greet(); }\n};\n\nint main() {\n    Greeter<> g1;\n    Greeter<Loud> g2;\n    g1.greet();\n    g2.greet();\n}",
      "options": [
        "HIhi",
        "hihi",
        "HIHI",
        "hiHI"
      ],
      "answer": 3,
      "explain": "Greeter<> uses the default template argument Quiet, printing \"hi\"; Greeter<Loud> overrides the default, printing \"HI\". Default policy parameters give templates a sensible out-of-the-box behavior while keeping the variation point open — the compile-time analogue of a default strategy."
    },
    {
      "type": "mcq",
      "tag": "Type infection",
      "question": "The book describes the drawback of the template-based strategy as the strategy \"infecting\" the type. What does that mean?",
      "options": [
        "The policy's private members become accessible to the host class template",
        "The chosen strategy becomes part of the class type itself: Circle<OpenGLStrategy> and Circle<VulkanStrategy> are unrelated types that cannot share a container or an interface, and the choice cannot be revised at run time",
        "The policy type must be complete before the host template is declared, causing include-order problems to spread",
        "Template strategies implicitly convert to one another, quietly spreading bugs between instantiations"
      ],
      "answer": 1,
      "explain": "With a template parameter, the behavioral choice is welded into the type identity. Everything generic over shapes must now be generic over strategies too, heterogeneous collections become impossible without extra erasure, and the decision is frozen at compile time. That viral spread of the parameter through all client code is the \"infection\"."
    },
    {
      "type": "code",
      "tag": "Infection in practice",
      "question": "This program fails to compile. Why?",
      "code": "#include <vector>\n\ntemplate <typename DrawStrategy>\nclass Circle {\npublic:\n    Circle() = default;\n};\n\nstruct OpenGL {};\nstruct Vulkan {};\n\nint main() {\n    std::vector<Circle<OpenGL>> shapes;\n    shapes.push_back(Circle<OpenGL>{});\n    shapes.push_back(Circle<Vulkan>{});\n}",
      "options": [
        "Circle<Vulkan> is an abstract class and cannot be instantiated",
        "std::vector requires its element type to define a user-provided copy constructor",
        "Circle<OpenGL> and Circle<Vulkan> are distinct, unrelated types with no conversion between them, so a Circle<Vulkan> cannot be stored in a vector of Circle<OpenGL>",
        "The Circle class template is missing the definition of its draw() member function"
      ],
      "answer": 2,
      "explain": "Each instantiation of a class template is its own type; the two Circles share nothing but their name. push_back needs a Circle<OpenGL> (or something convertible to one) and Circle<Vulkan> is neither, so overload resolution fails. This is the concrete face of \"the strategy infects the type\": mixed-strategy containers require type erasure or a common base instead."
    },
    {
      "type": "code",
      "tag": "Distinct instantiations",
      "question": "Two instantiations of a strategy-parameterized class template are compared with std::is_same_v. What does this program print?",
      "code": "#include <iostream>\n#include <type_traits>\n\ntemplate <typename DrawStrategy>\nclass Circle {};\n\nstruct OpenGL {};\nstruct Vulkan {};\n\nint main() {\n    std::cout << std::boolalpha\n              << std::is_same_v<Circle<OpenGL>, Circle<OpenGL>> << \" \"\n              << std::is_same_v<Circle<OpenGL>, Circle<Vulkan>>;\n}",
      "options": [
        "true false",
        "true true",
        "false false",
        "1 0"
      ],
      "answer": 0,
      "explain": "Circle<OpenGL> is the same type as itself (true) but a different type from Circle<Vulkan> (false); std::boolalpha makes the stream spell the words out rather than printing 1 and 0. The type system itself records the strategy choice — precisely the property that prevents runtime strategy swapping in the template approach."
    },
    {
      "type": "mcq",
      "tag": "Policy-based design",
      "question": "How does the template-parameter strategy relate to \"policy-based design\"?",
      "options": [
        "Policy-based design refers to runtime strategy objects owned through shared_ptr",
        "They are unrelated: policies configure data layout while strategies configure behavior",
        "Policy-based design is the C-style equivalent that uses raw function pointers",
        "The template-parameter strategy essentially is policy-based design (popularized by Alexandrescu's Modern C++ Design): the Strategy pattern shifted to compile time"
      ],
      "answer": 3,
      "explain": "Iglberger points out that injecting behavior via template parameters is the static form of Strategy, known as policy-based design since Alexandrescu's work. The design intent — isolating and injecting HOW something is done — is identical; only the binding time differs. That is why he treats policies and strategies as one pattern in two costumes."
    },
    {
      "type": "mcq",
      "tag": "Choosing a mechanism",
      "question": "Per the book's comparison, which mechanism is the most reasonable default when behavior must be configurable at run time, value semantics are desired, and there is no extreme performance constraint?",
      "options": [
        "A raw pointer to a strategy base class, set through a setter",
        "A type-erased callable such as std::function, injected at construction",
        "A template policy parameter on the class",
        "A protected virtual hook that users override in derived classes"
      ],
      "answer": 1,
      "explain": "std::function gives runtime flexibility, frees users from inheritance, and keeps value semantics — the combination the book repeatedly favors for general use. Template policies win when the choice can be fixed at compile time and performance is critical; raw pointers and inheritance hooks bring reference semantics and coupling. Choosing among these consciously is the point of the comparison."
    },
    {
      "type": "mcq",
      "tag": "std::function costs",
      "question": "Which option correctly lists the costs the book attributes to std::function?",
      "options": [
        "A mandatory heap allocation on every construction, plus reference counting on each copy",
        "It cannot hold stateful lambdas, and every call is routed through the dynamic loader",
        "A possible heap allocation when the callable outgrows the small internal buffer, an indirect call that generally cannot be inlined, and no equality comparison between two std::function objects",
        "It leaks the callable's concrete type into the class interface, defeating encapsulation"
      ],
      "answer": 2,
      "explain": "Type erasure has a price: large callables force dynamic allocation (small ones may fit the internal buffer), invocation goes through an indirection that blocks inlining, and targets cannot be compared for equality. Allocation is not mandatory for every construction, there is no reference counting, and the concrete type is hidden — which is the whole point."
    },
    {
      "type": "mcq",
      "tag": "Small buffer optimization",
      "question": "What is the small buffer optimization (SBO) in the context of std::function?",
      "options": [
        "Sufficiently small callables are stored inline inside the std::function object itself, avoiding heap allocation; larger callables are allocated dynamically",
        "The compiler replaces small std::function objects with direct calls during constant folding",
        "Small captures are deduplicated into a process-wide pool shared by all std::function instances",
        "The C++ standard guarantees that callables up to exactly 16 bytes are always stored inline"
      ],
      "answer": 0,
      "explain": "Implementations reserve a small internal buffer; if the callable (with its captures) fits, it lives inside the std::function object and construction allocates nothing. Bigger callables spill to the heap. The standard encourages this for small targets like plain function pointers but guarantees no particular threshold, so option 3 overstates it."
    },
    {
      "type": "code",
      "tag": "SBO in action",
      "question": "This program instruments operator new. On a typical implementation where std::function has a small buffer optimization (as on the libc++/libstdc++ toolchains this was verified with), what does it print?",
      "code": "#include <array>\n#include <cstdio>\n#include <cstdlib>\n#include <functional>\n#include <new>\n\nstatic bool allocated = false;\nvoid* operator new(std::size_t n) {\n    allocated = true;\n    return std::malloc(n);\n}\nvoid operator delete(void* p) noexcept { std::free(p); }\nvoid operator delete(void* p, std::size_t) noexcept { std::free(p); }\n\nint main() {\n    std::function<void()> small = []{};\n    bool first = allocated;\n    allocated = false;\n    std::array<char, 1024> big{};\n    std::function<void()> large = [big]{ (void)big; };\n    std::printf(\"%d%d\", first ? 1 : 0, allocated ? 1 : 0);\n}",
      "options": [
        "00",
        "11",
        "10",
        "01"
      ],
      "answer": 3,
      "explain": "The captureless lambda is tiny and fits the internal buffer, so constructing small allocates nothing — first digit 0. The second lambda captures a 1024-byte array by value, far exceeding any realistic buffer, so std::function must heap-allocate — second digit 1. The exact threshold is implementation-defined, which is why hidden allocations are listed among std::function's costs."
    },
    {
      "type": "mcq",
      "tag": "No equality",
      "question": "Why can two std::function objects not be compared with operator==?",
      "options": [
        "The committee removed operator== in C++11 to reduce compile times",
        "There is no general way to decide equality of two arbitrary callables, so std::function deliberately offers no operator== between two instances — only comparison against nullptr to test emptiness",
        "operator== exists but runs in O(n) of the capture size, so the book merely advises against using it",
        "Equality is available, but only when both stored targets are plain function pointers"
      ],
      "answer": 1,
      "explain": "Two closures may behave identically yet be incomparable — lambdas do not even have operator== — so a general equality over erased callables is unimplementable in a meaningful way. The library therefore provides only nullptr comparisons to check for emptiness. This matters when strategies must be identified, deduplicated, or unregistered: you need IDs or tokens instead."
    },
    {
      "type": "code",
      "tag": "Equality is missing",
      "question": "Two std::function objects are compared with ==. Why does this program fail to compile?",
      "code": "#include <functional>\n#include <iostream>\n\nint main() {\n    std::function<void()> f = []{};\n    std::function<void()> g = f;\n    std::cout << (f == g);\n}",
      "options": [
        "g is a dangling copy of f, and comparing dangling std::functions is ill-formed",
        "std::function declares operator== as a private member",
        "std::function provides no operator== between two std::function objects — only comparisons with nullptr — because arbitrary erased callables cannot be meaningfully compared",
        "The closure type of []{} lacks operator==, but defining one on the lambda would make this compile"
      ],
      "answer": 2,
      "explain": "The only equality operators for std::function compare against std::nullptr_t (is it empty?); no overload takes two std::function operands, so f == g does not resolve. This is by design: after type erasure there is no general way to decide whether two targets are \"the same behavior\". Even a lambda with its own operator== would not help, since the comparison is rejected at the std::function level."
    },
    {
      "type": "code",
      "tag": "Inspecting the target",
      "question": "A function pointer and a lambda are stored in std::function objects and queried with target<T>(). What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nint addOne(int x) { return x + 1; }\n\nint main() {\n    std::function<int(int)> f = addOne;\n    std::function<int(int)> g = [](int x){ return x + 1; };\n    std::cout << (f.target<int(*)(int)>() != nullptr);\n    std::cout << (g.target<int(*)(int)>() != nullptr);\n}",
      "options": [
        "10",
        "11",
        "00",
        "01"
      ],
      "answer": 0,
      "explain": "target<T>() returns a pointer to the stored callable only if its type is exactly T. f stores a genuine function pointer of type int(*)(int), so the first query succeeds (1). g stores the lambda's unique closure type — not a function pointer, despite being convertible to one — so the query returns nullptr (0)."
    },
    {
      "type": "mcq",
      "tag": "target and target_type",
      "question": "What do std::function::target<T>() and target_type() offer, and how should a design-conscious developer view them?",
      "options": [
        "They convert the stored callable into a T, enabling reuse of a strategy across signatures",
        "They expose the mangled symbol name, but only in debug builds",
        "They are the officially supported way to compare two std::function objects for equality",
        "They allow runtime introspection of the erased callable's concrete type; relying on them reintroduces exactly the dependency on concrete types that type erasure was meant to eliminate"
      ],
      "answer": 3,
      "explain": "target_type() returns the type_info of the stored callable and target<T>() yields a pointer to it when the type matches exactly. Code that branches on this information is coupling itself back to concrete strategy types, undoing the abstraction. They exist for rare interop cases, not as a routine design tool."
    },
    {
      "type": "mcq",
      "tag": "function_ref",
      "question": "What is a function_ref (as proposed for the standard library and discussed alongside std::function)?",
      "options": [
        "An owning, allocation-free replacement for std::function with a guaranteed 64-byte small buffer",
        "A non-owning, cheaply copyable reference to a callable — excellent for function parameters, but risky as a stored member because it does not extend the lifetime of the referenced callable",
        "A reference-counted callable wrapper that keeps its target alive as long as any reference exists",
        "A compile-time wrapper that can bind only to captureless lambdas"
      ],
      "answer": 1,
      "explain": "function_ref is essentially two pointers: one to the callable, one to a thunk that invokes it. That makes it perfect for passing behavior down the call stack without allocation or copying. But it observes, never owns — store it beyond the callable's lifetime and you get a dangling reference, which is why it suits parameters rather than long-lived strategy members."
    },
    {
      "type": "mcq",
      "tag": "Type erasure",
      "question": "Which description best defines type erasure as the book uses the term?",
      "options": [
        "Declaring a type's copy operations as deleted so it can only be observed through references",
        "Casting objects to void* and back at each call site",
        "A technique that combines an internal abstract interface, a templated implementation wrapping any conforming concrete type, and a value-semantics facade — so unrelated types are used uniformly without clients ever seeing inheritance",
        "The linker discarding unused template instantiations from the final binary"
      ],
      "answer": 2,
      "explain": "Type erasure packages external polymorphism, a templated model that adapts any conforming type, and a value-like wrapper into one abstraction: clients hold a value, not a pointer into a hierarchy. std::function is the standard library's canonical example, erasing the concrete callable type behind a uniform call interface. It is neither void* casting nor a linker feature."
    },
    {
      "type": "mcq",
      "tag": "Command intent",
      "question": "Which statement best captures the intent of the Command design pattern?",
      "options": [
        "Encapsulate a request or action as an object, so that it can be parameterized, stored, queued, journaled, and potentially undone",
        "Extract HOW a fixed operation is implemented so the implementation can be configured from outside",
        "Route all function calls of a program through one global dispatcher object",
        "Convert user input events into a chain of responsibility of handlers"
      ],
      "answer": 0,
      "explain": "Command turns \"do this\" into a first-class object with its own identity and lifetime. Once an action is an object you can put it in containers, hand it to schedulers, persist it, and pair it with an inverse for undo. Option 1 is the Strategy intent — configuring how, not packaging what."
    },
    {
      "type": "mcq",
      "tag": "Command use cases",
      "question": "Which of the following is NOT one of the classic motivations for the Command pattern?",
      "options": [
        "Implementing undo/redo stacks in an interactive editor",
        "Queuing units of work for a thread pool or scheduler to execute later",
        "Journaling executed operations so system state can be reconstructed by replaying them",
        "Selecting at construction time how a shape object will perform its drawing"
      ],
      "answer": 3,
      "explain": "Undo/redo, work queues, and journaling all exploit the same property: an action reified as an object can be stored and executed at a different time or place. Configuring how a shape draws is behavior injection — the Strategy pattern — not the packaging of an action. The two patterns share structure but not motivation."
    },
    {
      "type": "mcq",
      "tag": "Command vs Strategy",
      "question": "How does Iglberger distinguish the Command pattern from the Strategy pattern?",
      "options": [
        "Strategy objects live on the heap while command objects live on the stack",
        "Strategy specifies HOW an existing operation is performed — configuration, usually injected up front; Command represents WHAT to do — an action in its own right, often carrying state and potentially supporting undo",
        "Command must be implemented with inheritance, whereas Strategy works only with templates",
        "Strategy is a behavioral pattern while Command is classified as creational"
      ],
      "answer": 1,
      "explain": "The book's distinction is one of intent: a strategy fills a predefined \"how\" slot inside some class, while a command is itself the thing being done, passed around as a value of its own. Commands consequently tend to carry state (arguments, undo information) and may offer an inverse operation. Both are behavioral patterns and both can use any implementation mechanism."
    },
    {
      "type": "mcq",
      "tag": "Identical structure",
      "question": "Implemented via std::function, a Strategy and a Command can be structurally identical code. What actually distinguishes them, per the book?",
      "options": [
        "The number of arguments the callable takes",
        "Command always requires two callables while Strategy requires exactly one",
        "Intent and semantics rather than structure: whether the callable configures how an object performs its own work, or whether the callable is itself the unit of work being handed around",
        "Nothing — the book argues the distinction has become obsolete in modern C++"
      ],
      "answer": 2,
      "explain": "A std::function member injected into a class and a std::function sitting in a task queue can look byte-for-byte the same. What differs is the design meaning: configuration of an operation (Strategy) versus a reified action (Command). The book stresses reading patterns as statements of intent, not as fixed class diagrams."
    },
    {
      "type": "code",
      "tag": "Undo stack",
      "question": "Commands built from pairs of std::function closures are executed and pushed onto an undo stack. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <stack>\n\nstruct Command {\n    std::function<void()> execute;\n    std::function<void()> undo;\n};\n\nint main() {\n    int value = 0;\n    std::stack<Command> history;\n    auto makeAdd = [&value](int d) {\n        return Command{ [&value, d]{ value += d; },\n                        [&value, d]{ value -= d; } };\n    };\n    auto run = [&history](Command c){ c.execute(); history.push(c); };\n    run(makeAdd(5));\n    run(makeAdd(3));\n    history.top().undo();\n    history.pop();\n    run(makeAdd(10));\n    std::cout << value;\n}",
      "options": [
        "15",
        "18",
        "8",
        "10"
      ],
      "answer": 0,
      "explain": "The adds push value to 5 and then 8, each recording an undo closure. The top command (add 3) is undone, returning value to 5, and then add 10 brings it to 15. Pairing each execute with its inverse and stacking them is the minimal Command-based undo machine."
    },
    {
      "type": "code",
      "tag": "Command objects with state",
      "question": "Add commands carrying their amount as state are executed and recorded in a history. What does this program print?",
      "code": "#include <iostream>\n#include <vector>\n\nclass AddCommand {\npublic:\n    explicit AddCommand(int amount) : amount_(amount) {}\n    void execute(int& v) const { v += amount_; }\n    void undo(int& v) const { v -= amount_; }\nprivate:\n    int amount_;\n};\n\nint main() {\n    int value = 10;\n    std::vector<AddCommand> history;\n    auto run = [&](AddCommand c) { c.execute(value); history.push_back(c); };\n    run(AddCommand(4));\n    run(AddCommand(6));\n    history.back().undo(value);\n    history.pop_back();\n    std::cout << value << \" \" << history.size();\n}",
      "options": [
        "20 2",
        "14 2",
        "20 1",
        "14 1"
      ],
      "answer": 3,
      "explain": "Executing AddCommand(4) and AddCommand(6) takes value from 10 to 20, with both commands stored in history. history.back() is the add-6 command; its undo() subtracts 6, giving 14, and pop_back leaves one command recorded. The amount stored inside each command is exactly the state that makes the inverse operation possible."
    },
    {
      "type": "mcq",
      "tag": "Undo needs state",
      "question": "Why is a bare std::function often insufficient for undoable commands, pushing the design toward a small class instead?",
      "options": [
        "std::function cannot store lambdas that have captures",
        "Undo requires the inverse operation together with the state captured at execution time (what was changed, previous values); bundling execute(), undo(), and that state naturally calls for a class rather than one callable",
        "std::function's call operator is const, so the callable cannot modify anything",
        "The redo stack requires its elements to be trivially copyable, which lambdas are not"
      ],
      "answer": 1,
      "explain": "A single callable expresses \"do it\" but has nowhere obvious to keep \"how to take it back\". Undo needs the inverse action plus whatever data it depends on — the removed character, the previous value — recorded when execute ran. A command class holds both operations and that state together, which is why undoable commands are usually classes (or pairs of callables plus data), not lone lambdas."
    },
    {
      "type": "code",
      "tag": "Stateful undo",
      "question": "A command remembers the character it removed so that it can undo the removal. What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nclass RemoveLastCommand {\npublic:\n    explicit RemoveLastCommand(std::string& target) : target_(target) {}\n    void execute() { removed_ = target_.back(); target_.pop_back(); }\n    void undo()    { target_.push_back(removed_); }\nprivate:\n    std::string& target_;\n    char removed_{};\n};\n\nint main() {\n    std::string s = \"abc\";\n    RemoveLastCommand cmd(s);\n    cmd.execute();\n    std::cout << s << \" \";\n    cmd.undo();\n    std::cout << s;\n}",
      "options": [
        "ab ab",
        "abc ab",
        "ab abc",
        "abc abc"
      ],
      "answer": 2,
      "explain": "execute() remembers the popped character (c) in the command's removed_ member before shortening the string, so the first output is \"ab\". undo() uses that remembered state to push 'c' back, restoring \"abc\". Without storing removed_ at execution time, the inverse operation would be impossible — the essence of stateful commands."
    },
    {
      "type": "code",
      "tag": "Undo/redo trace",
      "question": "A tiny text editor supports insert, undo, and redo. What does this program print?",
      "code": "#include <iostream>\n#include <stack>\n#include <string>\n\nint main() {\n    std::string text;\n    std::stack<char> undoStack, redoStack;\n    auto doInsert = [&](char c) {\n        text.push_back(c);\n        undoStack.push(c);\n        redoStack = {};\n    };\n    auto undo = [&] {\n        text.pop_back();\n        redoStack.push(undoStack.top());\n        undoStack.pop();\n    };\n    auto redo = [&] {\n        char c = redoStack.top();\n        redoStack.pop();\n        text.push_back(c);\n        undoStack.push(c);\n    };\n    doInsert('a'); doInsert('b'); doInsert('c');\n    undo(); undo();\n    redo();\n    doInsert('z');\n    std::cout << text;\n}",
      "options": [
        "abz",
        "az",
        "abcz",
        "abbz"
      ],
      "answer": 0,
      "explain": "After inserting a, b, c the text is \"abc\"; two undos leave \"a\" with c and b on the redo stack; redo re-applies b giving \"ab\". The final doInsert('z') appends z — and clears the redo stack, discarding the still-pending c. Result: \"abz\"."
    },
    {
      "type": "code",
      "tag": "Redo invalidation",
      "question": "What does this program print (text, then the size of the redo stack)?",
      "code": "#include <iostream>\n#include <stack>\n#include <string>\n\nint main() {\n    std::string text;\n    std::stack<char> undoStack, redoStack;\n    auto doInsert = [&](char c) {\n        text.push_back(c);\n        undoStack.push(c);\n        redoStack = {};\n    };\n    auto undo = [&] {\n        text.pop_back();\n        redoStack.push(undoStack.top());\n        undoStack.pop();\n    };\n    doInsert('x');\n    doInsert('y');\n    undo();\n    doInsert('z');\n    std::cout << text << \" \" << redoStack.size();\n}",
      "options": [
        "xyz 1",
        "xz 1",
        "xyz 0",
        "xz 0"
      ],
      "answer": 3,
      "explain": "After x and y, one undo removes y (\"x\") and parks it on the redo stack. Executing the new command z then clears the redo stack (redoStack = {}), because redoing y after an unrelated edit would corrupt the history. Hence \"xz\" and a redo size of 0 — the standard invalidate-redo-on-new-command rule."
    },
    {
      "type": "mcq",
      "tag": "Inverse vs snapshot",
      "question": "What is the trade-off between implementing undo via inverse operations versus via snapshots (memento-style) of the affected state?",
      "options": [
        "Snapshots are always cheaper because they can be shared copy-on-write",
        "Inverse operations are memory-cheap but demand that every command be invertible; snapshots work for arbitrary operations but capturing and storing the prior state can cost substantial memory and time",
        "Inverse operations require RTTI support, whereas snapshots do not",
        "Snapshots cannot be combined with the Command pattern at all"
      ],
      "answer": 1,
      "explain": "An inverse (subtract what you added, reinsert what you deleted) stores almost nothing but only exists for operations that are actually reversible. A snapshot of the prior state can undo anything — including lossy operations — at the price of copying and retaining that state per step. Real systems often mix both: inverses where cheap, snapshots where necessary."
    },
    {
      "type": "mcq",
      "tag": "Macro commands",
      "question": "What is a macro command?",
      "options": [
        "A command generated by preprocessor macros at compile time",
        "A command that always executes on a background thread",
        "A composite command that stores a sequence of child commands and executes them in order; its undo typically runs the children's inverses in reverse order",
        "A command bound to a keyboard shortcut in the UI layer"
      ],
      "answer": 2,
      "explain": "A macro command applies the Composite idea to Command: since commands are objects with a uniform interface, a container of them is itself a command. Executing runs the children front to back; undoing must unwind back to front so later effects are removed before earlier ones. Recorded editor macros and transactional batches are typical uses."
    },
    {
      "type": "code",
      "tag": "Composite of commands",
      "question": "Several commands are collected into one composite and the composite is run twice. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<std::function<void()>> macro;\n    macro.push_back([]{ std::cout << \"A\"; });\n    macro.push_back([]{ std::cout << \"B\"; });\n    macro.push_back([]{ std::cout << \"C\"; });\n    auto runMacro = [&macro]{ for (auto& cmd : macro) cmd(); };\n    runMacro();\n    runMacro();\n}",
      "options": [
        "ABCABC",
        "ABC",
        "CBACBA",
        "AABBCC"
      ],
      "answer": 0,
      "explain": "The vector of callables is a minimal macro command: runMacro executes the children in insertion order, printing ABC. Invoking the macro twice replays the same sequence, giving ABCABC. Because the children are stored objects, the composite can be replayed, persisted, or extended at run time."
    },
    {
      "type": "code",
      "tag": "Task queue",
      "question": "Commands are processed from a queue, and one of them enqueues another. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <queue>\n\nint main() {\n    std::queue<std::function<void()>> tasks;\n    tasks.push([&tasks]{\n        std::cout << \"A\";\n        tasks.push([]{ std::cout << \"B\"; });\n    });\n    tasks.push([]{ std::cout << \"C\"; });\n    while (!tasks.empty()) {\n        auto t = tasks.front();\n        tasks.pop();\n        t();\n    }\n}",
      "options": [
        "ABC",
        "CAB",
        "AC",
        "ACB"
      ],
      "answer": 3,
      "explain": "The queue is FIFO: the first task prints A and pushes the B-task to the back, behind the already-waiting C-task. So C runs next, and B runs last — \"ACB\". Note the loop copies the front task and pops before invoking it, which keeps the reference valid even though the callable mutates the queue."
    },
    {
      "type": "mcq",
      "tag": "Commands as work items",
      "question": "What property of commands makes them the natural currency of task queues and schedulers?",
      "options": [
        "Command objects execute faster than direct function calls",
        "A command is a first-class object: it can be stored, moved to another thread, and executed later — decoupling the point where work is created from the point (and time) where it is performed",
        "Commands automatically serialize all access to shared state",
        "Schedulers can inline command objects at compile time"
      ],
      "answer": 1,
      "explain": "Reifying an action as an object separates creation from execution: the producer builds the command now, the consumer runs it elsewhere, later. That decoupling is exactly what thread pools, event loops, and job systems need. Commands add indirection rather than speed, and they provide no automatic synchronization."
    },
    {
      "type": "mcq",
      "tag": "Journaling",
      "question": "In the context of the Command pattern, what is journaling?",
      "options": [
        "Compressing the undo stack to bound its memory usage",
        "Logging human-readable diagnostics for each user action",
        "Persisting the executed commands so that after a crash the system can reconstruct its state by replaying them — which requires commands to be replayable and deterministic",
        "Broadcasting each executed command to registered observer objects"
      ],
      "answer": 2,
      "explain": "A journal is a durable record of the commands themselves, not just their effects. Recovery replays the journal against a known baseline to rebuild state, the same idea behind write-ahead logs in databases. It only works if commands are serializable and their replay is deterministic — nondeterministic commands must capture their inputs."
    },
    {
      "type": "code",
      "tag": "Replay from a journal",
      "question": "Executed commands are journaled and later replayed against a fresh value. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <vector>\n\nint main() {\n    int value = 0;\n    std::vector<std::function<void(int&)>> journal;\n    auto apply = [&](std::function<void(int&)> cmd) {\n        cmd(value);\n        journal.push_back(cmd);\n    };\n    apply([](int& v){ v += 4; });\n    apply([](int& v){ v *= 3; });\n    std::cout << value << \" \";\n    int recovered = 0;\n    for (auto& cmd : journal) cmd(recovered);\n    std::cout << recovered;\n}",
      "options": [
        "12 12",
        "12 0",
        "7 7",
        "12 7"
      ],
      "answer": 0,
      "explain": "Applying +4 then *3 to 0 yields 12, and each command is appended to the journal as it executes. Replaying the journal against a fresh int repeats the same sequence deterministically, producing 12 again. The state can be reconstructed purely from the recorded commands — the essence of journaling."
    },
    {
      "type": "mcq",
      "tag": "Null Object pattern",
      "question": "What is the Null Object pattern in the context of strategies?",
      "options": [
        "Setting the std::function member to nullptr and checking it before every call",
        "A strategy implementation that throws, signalling that a real strategy must be installed",
        "A sentinel value returned when a strategy lookup in a registry fails",
        "A valid, do-nothing implementation of the strategy interface used as a safe default — call sites need no null checks and no special cases"
      ],
      "answer": 3,
      "explain": "Instead of representing \"no behavior\" with an empty pointer or empty std::function that every caller must test, you install an object that fulfills the interface by doing nothing. Calls remain unconditional and cannot throw bad_function_call. It trades a trivial object for the removal of an entire class of defensive checks."
    },
    {
      "type": "code",
      "tag": "Do-nothing default",
      "question": "One shape gets a printing strategy, the other a do-nothing default from nullStrategy(). What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nclass Shape {\npublic:\n    explicit Shape(std::function<void()> draw) : draw_(std::move(draw)) {}\n    void draw() const { draw_(); }\nprivate:\n    std::function<void()> draw_;\n};\n\nstd::function<void()> nullStrategy() { return []{}; }\n\nint main() {\n    Shape a([]{ std::cout << \"X\"; });\n    Shape b(nullStrategy());\n    a.draw();\n    b.draw();\n    a.draw();\n    std::cout << \"!\";\n}",
      "options": [
        "X!",
        "XX!",
        "X, then it throws std::bad_function_call",
        "Undefined behavior: b holds an empty std::function"
      ],
      "answer": 1,
      "explain": "nullStrategy() returns []{} — a perfectly valid callable that does nothing — not an empty std::function, so b.draw() is safe and silent. a.draw() prints X before and after, and the final ! confirms normal completion: \"XX!\". This is the Null Object pattern making the default case an ordinary, check-free code path."
    },
    {
      "type": "mcq",
      "tag": "Dependency injection",
      "question": "The book frames Strategy in terms of dependency injection. What is the correspondence?",
      "options": [
        "The strategy acts as a service locator that the class queries at run time",
        "Dependency injection needs a DI framework; Strategy is the manual fallback for codebases without one",
        "The strategy is a dependency handed to the class from outside — typically at construction — so the class depends on an abstraction instead of hard-wiring and creating a concrete implementation itself",
        "Strategy inverts the direction of data flow, while dependency injection inverts control flow"
      ],
      "answer": 2,
      "explain": "Injecting a strategy is dependency injection in its simplest form: the class declares what it needs (a drawing behavior) and someone outside decides which concrete implementation satisfies it. The class neither names nor constructs the concrete type, which decouples it and makes substitution trivial. No framework is required — a constructor parameter is enough."
    },
    {
      "type": "mcq",
      "tag": "Mock strategies",
      "question": "How does strategy-based design improve testability — for instance in the book's drawing example?",
      "options": [
        "Tests can inject a mock or stub strategy that records calls or does nothing, so shapes are tested in isolation without a real graphics library or GPU",
        "The strategy hierarchy provides reflection metadata that test frameworks consume",
        "std::function strategies compare equal in tests, enabling direct assertions on behavior",
        "Mocking requires writing a test double that inherits from every shape class"
      ],
      "answer": 0,
      "explain": "Because the behavior arrives through an interface (or callable) chosen by the caller, a test simply passes a fake: a lambda that counts invocations, captures arguments, or does nothing. The shape under test never knows the difference, and no OpenGL context is needed in CI. This substitutability is a primary practical payoff of treating strategies as injected dependencies."
    },
    {
      "type": "code",
      "tag": "Injected test behavior",
      "question": "The combining behavior is injected as a parameter — the same seam a unit test would use. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <vector>\n\nint process(const std::vector<int>& data,\n            std::function<int(int, int)> combine) {\n    int result = 0;\n    for (int x : data) result = combine(result, x);\n    return result;\n}\n\nint main() {\n    std::cout << process({1, 2, 3}, [](int a, int b){ return a + b; });\n    std::cout << \" \";\n    std::cout << process({1, 2, 3}, [](int a, int b){ return a * 10 + b; });\n}",
      "options": [
        "6 6",
        "123 6",
        "6 60",
        "6 123"
      ],
      "answer": 3,
      "explain": "With the addition lambda, folding 1, 2, 3 from 0 gives 6. With the second lambda each step multiplies the accumulator by 10 and adds the element: 1, then 12, then 123. Same algorithm skeleton, two injected behaviors — process() itself never changed, which is exactly what behavior injection buys."
    },
    {
      "type": "mcq",
      "tag": "Stateless strategies",
      "question": "A drawing strategy holds no data members. What sharing opportunity does this open up (the flyweight interaction)?",
      "options": [
        "It can be declared as a static local inside every shape, one instance per shape object",
        "A single instance can safely be shared by many shapes — via shared_ptr or a reference to one long-lived instance — flyweight-style, because calls never mutate the strategy",
        "It can be placed in the read-only data segment, which turns its calls into compile-time evaluations",
        "None: the book requires every shape to own a private copy of its strategy regardless of state"
      ],
      "answer": 1,
      "explain": "Statelessness means every invocation is independent, so one instance serves any number of clients without interference — the same insight behind Flyweight. Sharing eliminates per-shape allocations for the classic pointer-based strategy. The moment a strategy acquires mutable state, this free sharing disappears."
    },
    {
      "type": "code",
      "tag": "Shared strategy instance",
      "question": "Three shapes share one stateless strategy instance. What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n\nstruct DrawStrategy { virtual ~DrawStrategy() = default; };\nstruct OpenGL : DrawStrategy {};\n\nstruct Shape { std::shared_ptr<DrawStrategy> strategy; };\n\nint main() {\n    auto gl = std::make_shared<OpenGL>();\n    {\n        Shape a{gl}, b{gl}, c{gl};\n        std::cout << gl.use_count();\n    }\n    std::cout << gl.use_count();\n}",
      "options": [
        "44",
        "31",
        "41",
        "40"
      ],
      "answer": 2,
      "explain": "Inside the block, gl itself plus the three Shape copies hold the strategy: use_count() is 4. When the shapes go out of scope their shared_ptr copies are destroyed, leaving only gl: use_count() is 1. One stateless strategy object served all shapes — no per-shape allocation was ever needed."
    },
    {
      "type": "mcq",
      "tag": "Shared mutable state",
      "question": "Why must a shared, stateful strategy be treated with care?",
      "options": [
        "All objects sharing it observe each other's mutations — one object's calls change the behavior the others see — and concurrent use of the shared state can produce data races",
        "shared_ptr cannot point to objects that have mutable data members",
        "Stateful strategies cannot declare virtual member functions",
        "The shared state is reset whenever any one of the owners is destroyed"
      ],
      "answer": 0,
      "explain": "Sharing is only free when there is nothing to corrupt. A stateful strategy shared across objects becomes hidden global state: mutations leak between supposedly independent objects, and multithreaded callers race on it. The choices are per-object copies (value semantics), synchronization, or redesigning the strategy to be stateless."
    },
    {
      "type": "code",
      "tag": "Value vs reference capture",
      "question": "Two lambdas capture the same variable in different ways before being wrapped in std::function. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n\nint main() {\n    int n = 0;\n    auto byRef = [&n]{ ++n; };\n    auto byVal = [n]() mutable { ++n; };\n    std::function<void()> f = byRef;\n    std::function<void()> g = byVal;\n    f(); g(); f(); g();\n    std::cout << n;\n}",
      "options": [
        "4",
        "0",
        "1",
        "2"
      ],
      "answer": 3,
      "explain": "f wraps the reference-capturing lambda, so its two invocations increment the n in main: n becomes 2. g wraps a copy of byVal, whose mutable increments affect only the state stored inside g — never the original n. The capture mode, not the std::function wrapper, decides whether state is shared."
    },
    {
      "type": "mcq",
      "tag": "Capture guideline",
      "question": "What is the guideline for lambda captures when the lambda will be stored as a long-lived strategy or command?",
      "options": [
        "Always capture by reference to avoid the cost of copying captured data",
        "Prefer capturing by value (or otherwise owning what you need): the stored callable may outlive the current scope, and by-reference captures would then dangle",
        "Stored lambdas must be captureless; move any needed data into global variables",
        "Capture this by value, which deep-copies the enclosing object into the closure"
      ],
      "answer": 1,
      "explain": "A strategy member or queued command routinely survives the scope that created it, so references into that scope become dangling. Value captures (including init-captures that move ownership in) make the closure self-contained and safe to store. Reference captures are fine only when the callable is provably used before the referents die. Note that capturing this by value copies just the pointer, not the object."
    },
    {
      "type": "code",
      "tag": "Dangling capture",
      "question": "makeStrategy returns a lambda that captures a local variable by reference. What is the behavior of this program?",
      "code": "#include <functional>\n#include <iostream>\n\nstd::function<int()> makeStrategy() {\n    int factor = 42;\n    return [&factor]{ return factor; };\n}\n\nint main() {\n    std::function<int()> s = makeStrategy();\n    std::cout << s();\n}",
      "options": [
        "It prints 42; the capture extends factor's lifetime until the std::function is destroyed",
        "It throws std::bad_function_call, because the stored target became invalid",
        "Undefined behavior: factor is destroyed when makeStrategy returns, so the stored closure holds a dangling reference — any observed output (such as 42) is coincidence, not a guarantee",
        "Compile error: a local variable cannot be captured by reference in a returned lambda"
      ],
      "answer": 2,
      "explain": "Per the standard, factor's lifetime ends when makeStrategy returns; the closure keeps only a reference, and reading through it afterwards is undefined behavior. Captures never extend lifetimes — that is precisely why the guideline says stored callables should capture by value. The program may well print 42 in practice (it did when compiled here), which makes this bug treacherous rather than harmless."
    },
    {
      "type": "code",
      "tag": "Escaping this",
      "question": "What is the behavior of this program?",
      "code": "#include <functional>\n#include <iostream>\n\nclass Widget {\npublic:\n    int value = 7;\n    std::function<int()> getter() {\n        return [this]{ return value; };\n    }\n};\n\nint main() {\n    std::function<int()> f;\n    {\n        Widget w;\n        f = w.getter();\n    }\n    std::cout << f();\n}",
      "options": [
        "Undefined behavior: the lambda captured the this pointer, and the Widget is destroyed before f is invoked — the stored strategy outlives its object",
        "It prints 7",
        "It prints 0, because the Widget is value-initialized again when the block ends",
        "It throws std::bad_function_call because f refers to a destroyed object"
      ],
      "answer": 0,
      "explain": "[this] captures only the pointer, so the closure's validity is chained to the Widget's lifetime — which ends at the closing brace, before f() runs. Invoking f then reads a member of a destroyed object: undefined behavior per the standard, even if it happens to print 7 on a given run. Callables that may outlive *this must copy the data they need (e.g. [v = value]) instead of capturing this."
    },
    {
      "type": "code",
      "tag": "Loop-variable capture",
      "question": "Commands are collected in a loop and executed afterwards. What is the behavior of this program?",
      "code": "#include <functional>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<std::function<void()>> commands;\n    for (int i = 0; i < 3; ++i) {\n        commands.push_back([&i]{ std::cout << i; });\n    }\n    for (auto& cmd : commands) cmd();\n}",
      "options": [
        "It prints 012",
        "It prints 222",
        "It is guaranteed to print 333, because every lambda observes the final value of i",
        "Undefined behavior: each lambda captured the loop variable i by reference, and i is destroyed when the loop ends — the commands run on dangling references"
      ],
      "answer": 3,
      "explain": "The loop variable's lifetime ends with the loop, but the stored closures still hold references to it, so invoking them afterwards is undefined behavior — no output is guaranteed by the standard. Capturing i by value ([i]) would snapshot 0, 1, 2 into independent closures and print 012. This deferred-execution trap is exactly why stored commands should own their data."
    },
    {
      "type": "mcq",
      "tag": "Prefer value semantics",
      "question": "Why does Iglberger's guideline \"prefer value semantics\" apply so directly to strategies and commands?",
      "options": [
        "Value-based strategies are guaranteed to be allocation-free",
        "Values avoid null pointers, dangling references, and hidden shared mutable state: each object owns its behavior outright, making copying, reasoning, and thread-safety far simpler",
        "Reference semantics has been deprecated since C++20",
        "Only value types can be stored inside a std::vector"
      ],
      "answer": 1,
      "explain": "Pointer-based strategies invite the classic reference-semantics hazards: null checks, unclear ownership, aliasing, and lifetime bugs like the dangling-capture examples. A value-based strategy (e.g. a std::function member holding value-captured state) is self-contained — copying the owner copies the behavior, and no distant object can mutate it. Value semantics is not automatically allocation-free (std::function may allocate), so option 0 overclaims."
    },
    {
      "type": "mcq",
      "tag": "Why constructor injection",
      "question": "Why does the book inject the strategy through the constructor rather than through a setter called after construction?",
      "options": [
        "Constructors can be constexpr while setters cannot",
        "A setter would additionally require the strategy type to be copyable",
        "The object is completely configured from the instant it exists — the invariant \"a shape can always draw itself\" holds throughout its lifetime, with no window where the behavior is missing or half-initialized",
        "Constructor injection permits replacing the strategy later, whereas setters do not"
      ],
      "answer": 2,
      "explain": "Constructor injection makes a valid strategy part of the object's establishment of invariants: there is never a moment when the shape exists but cannot perform its operation. With setter injection, every use must consider the not-yet-configured state, reintroducing null checks or empty-function throws. A setter can still be added on top when runtime replacement is genuinely needed."
    },
    {
      "type": "code",
      "tag": "Strategy registry",
      "question": "Strategies are looked up by name from a registry. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <map>\n#include <string>\n\nint main() {\n    std::map<std::string, std::function<int(int)>> registry{\n        {\"inc\", [](int x){ return x + 1; }},\n        {\"dbl\", [](int x){ return 2 * x; }}\n    };\n    std::cout << registry[\"dbl\"](registry[\"inc\"](3));\n}",
      "options": [
        "8",
        "7",
        "6",
        "It throws std::bad_function_call, because operator[] default-constructs missing entries"
      ],
      "answer": 0,
      "explain": "registry[\"inc\"](3) returns 4, and registry[\"dbl\"](4) returns 8. Both keys exist, so operator[] finds the stored callables and nothing throws — though the distractor describes a real hazard: looking up a missing key would default-construct an empty std::function whose invocation throws bad_function_call. A registry of type-erased strategies like this enables selecting behavior from runtime data (config files, user input)."
    },
    {
      "type": "mcq",
      "tag": "When to use Strategy",
      "question": "According to the book, when should you reach for the Strategy pattern?",
      "options": [
        "Whenever a class has more than one public member function",
        "Only after a profiler has shown that virtual function calls are a bottleneck",
        "When you need to keep adding new operations to a fixed, stable set of types",
        "When you have identified a genuine variation point — an aspect of HOW something is done that is expected to differ or change — and you want to isolate it behind an abstraction and inject it (design for change)"
      ],
      "answer": 3,
      "explain": "Strategy is a tool for anticipated variation: once drawing (or allocation, or sorting) is recognized as an axis of change, extracting and injecting it protects the rest of the code from that change. Applying it everywhere adds indirection without benefit, so identifying real variation points comes first. Option 2 describes the Visitor scenario — adding operations, not varying one."
    }
  ]
};

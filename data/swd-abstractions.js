/* ===== C++ Software Design — Abstractions & Interfaces ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["swd-abstractions"] = {
  title: "C++ Software Design — Abstractions & Interfaces",
  subtitle: "Semantic requirements of abstractions, LSP contracts, dependency graphs and architecture boundaries.",
  crumb: "C++ Software Design",
  questions: [
    {
      "type": "mcq",
      "tag": "Semantic Contracts",
      "question": "According to Klaus Iglberger, what does an abstraction such as a base class or a concept fundamentally represent?",
      "options": [
        "A way to reuse code between related classes without duplication",
        "A compile-time optimization barrier that hides implementation details from the optimizer",
        "A set of semantic requirements and expectations — a contract that callers rely on and that every implementation must fulfill",
        "A mechanism to reduce binary size by sharing vtables between translation units"
      ],
      "answer": 2,
      "explain": "This is the book's central theme: an abstraction is first and foremost a bundle of expectations. The visible signatures are only the syntactic surface; the real contract is semantic — what callers may assume about behavior. Code reuse and dispatch mechanics are secondary consequences, not the purpose of the abstraction."
    },
    {
      "type": "mcq",
      "tag": "Semantic Contracts",
      "question": "A new class implements every pure virtual function of an interface and the project compiles cleanly. What can you conclude about the class's conformance to the abstraction?",
      "options": [
        "Nothing yet: the compiler checks only the syntactic part of the contract; the semantic expectations (pre/postconditions, invariants) remain entirely unchecked",
        "It fully conforms: overriding all pure virtuals is exactly what conformance means",
        "It conforms as long as every override is marked with the override keyword",
        "It conforms if the interface also has a virtual destructor"
      ],
      "answer": 0,
      "explain": "Compiling against an interface proves only that the signatures match. Whether the implementation honors the documented expectations — what the functions mean, what state they guarantee, what callers may rely on — is invisible to the compiler. Iglberger stresses that most real LSP violations are exactly these silent semantic mismatches."
    },
    {
      "type": "code",
      "tag": "Concepts & Semantics",
      "question": "The static_assert passes, yet calling std::sort on a vector<Money> has undefined behavior. What does this demonstrate?",
      "code": "#include <concepts>\n\ntemplate <typename T>\nconcept Sortable = requires(T a, T b) {\n    { a < b } -> std::convertible_to<bool>;\n};\n\nstruct Money {\n    // \"less than\" that is not a strict weak ordering\n    bool operator<(const Money&) const { return true; }\n};\n\nstatic_assert(Sortable<Money>);",
      "options": [
        "static_assert is evaluated too early in the translation unit to see the operator's definition",
        "Concepts check syntactic requirements only; semantic requirements such as 'operator< is a strict weak ordering' remain the programmer's responsibility",
        "std::totally_ordered would detect at compile time that the ordering is not strict weak",
        "std::sort requires operator<=> in C++20, so the concept tests the wrong operator"
      ],
      "answer": 1,
      "explain": "A requires-expression can only verify that expressions are valid and have suitable types. No concept — not even std::totally_ordered — can prove that operator< behaves like a strict weak ordering; that is a semantic requirement stated in prose. This mirrors the book's point that every abstraction, static or dynamic, carries expectations the compiler cannot enforce."
    },
    {
      "type": "code",
      "tag": "Contract Violations",
      "question": "This compiles without warnings. Which statement is accurate?",
      "code": "class Inventory {\npublic:\n    virtual ~Inventory() = default;\n    // Contract: returns the number of items, never negative.\n    virtual int count() const = 0;\n};\n\nclass BrokenInventory : public Inventory {\npublic:\n    int count() const override { return -1; }  // \"not loaded yet\"\n};",
      "options": [
        "The override keyword guarantees the returned value satisfies the base class contract",
        "Returning -1 is fine because the contract is only documentation, and callers must defensively check for negative values",
        "The compiler enforces the signature but not the documented postcondition; BrokenInventory silently violates the abstraction and breaks every caller that relies on 'never negative'",
        "The program is ill-formed because an override may not return a value outside the base's documented range"
      ],
      "answer": 2,
      "explain": "The documented postcondition 'never negative' is part of the abstraction, and callers are entitled to rely on it without defensive checks — that reliance is the entire point of having a contract. BrokenInventory weakens the postcondition, which is a textbook LSP violation even though it is syntactically a perfect override. C++ has no mechanism to diagnose this; only design discipline and review catch it."
    },
    {
      "type": "mcq",
      "tag": "Liskov Substitution",
      "question": "Iglberger stresses that the Liskov Substitution Principle is not about real-world taxonomy ('a penguin is a bird'). What is LSP actually about?",
      "options": [
        "Ensuring derived classes physically contain their base class subobject at offset zero",
        "Behavioral substitutability: the expectations that users of the abstraction hold must remain valid for every subtype",
        "Ensuring derived classes never add member functions beyond the base interface",
        "Guaranteeing that dynamic_cast between siblings in a hierarchy always fails"
      ],
      "answer": 1,
      "explain": "LSP is a statement about contracts, not about how we classify things in the real world. A subtype must honor every expectation callers legitimately derive from the base abstraction, so code written against the base works unchanged with any derived type. Whether the is-a relationship sounds natural in English is irrelevant — what matters is whether the behavioral contract survives substitution."
    },
    {
      "type": "code",
      "tag": "Liskov Substitution",
      "question": "What does this print, and why is it an LSP problem?",
      "code": "#include <iostream>\n\nstruct Rectangle {\n    virtual ~Rectangle() = default;\n    virtual void setWidth(int w)  { w_ = w; }\n    virtual void setHeight(int h) { h_ = h; }\n    int area() const { return w_ * h_; }\nprotected:\n    int w_ = 0, h_ = 0;\n};\n\nstruct Square : Rectangle {\n    void setWidth(int w)  override { w_ = h_ = w; }\n    void setHeight(int h) override { w_ = h_ = h; }\n};\n\nint main() {\n    Square s;\n    Rectangle& r = s;\n    r.setWidth(3);\n    r.setHeight(4);\n    std::cout << r.area();\n}",
      "options": [
        "12 — there is no LSP problem; Square correctly specializes Rectangle",
        "0 — w_ and h_ are overwritten to zero because Square lacks a constructor",
        "16 — the real problem is that Square should have used private inheritance to hide setWidth",
        "16 — Square::setWidth breaks Rectangle's implicit postcondition that setting the width leaves the height unchanged, so code written against Rectangle misbehaves"
      ],
      "answer": 3,
      "explain": "setWidth(3) sets both members to 3, then setHeight(4) sets both to 4, giving area 16 instead of the expected 12. Rectangle's users legitimately assume the two dimensions vary independently — an implicit postcondition Square cannot honor. Mathematically every square is a rectangle, yet as mutable types the substitution fails, showing again that LSP is about expectations, not taxonomy."
    },
    {
      "type": "mcq",
      "tag": "Liskov Substitution",
      "question": "Which combination correctly states the LSP contract rules for an override in a derived class?",
      "options": [
        "Preconditions may not be strengthened; postconditions may not be weakened; base class invariants must be preserved",
        "Preconditions may not be weakened; postconditions may not be strengthened; invariants may be replaced",
        "Preconditions and postconditions may both be strengthened as long as invariants are documented",
        "Only invariants matter; pre- and postconditions are implementation details"
      ],
      "answer": 0,
      "explain": "A subtype may demand less (weaker or equal preconditions) and promise more (stronger or equal postconditions), never the reverse, and it must keep every base invariant intact. Any override that asks callers for more or delivers less than the base contract breaks code that was written, correctly, against the abstraction alone."
    },
    {
      "type": "mcq",
      "tag": "Liskov Substitution",
      "question": "An interface declares `virtual void store(const Record&)` and documents 'accepts any well-formed Record'. A new implementation throws for Records larger than 1 MB. Under LSP, this is…",
      "options": [
        "…acceptable: throwing is always allowed because exceptions are part of C++",
        "…acceptable if the implementation documents the new limit in its own header",
        "…a weakened postcondition, which LSP permits",
        "…a strengthened precondition, and therefore an LSP violation: callers written against the base contract may now fail"
      ],
      "answer": 3,
      "explain": "The base contract says every well-formed Record is acceptable; the implementation narrows the set of valid inputs, i.e., strengthens the precondition. Callers dispatching through the interface neither know nor should know which implementation they hit, so documenting the limit on the derived class does not help them. If size limits are a real concern, they belong in the abstraction's contract itself."
    },
    {
      "type": "mcq",
      "tag": "Concepts & Semantics",
      "question": "Why does the standard describe semantic requirements (like equality preservation) for std::regular even though the compiler cannot check them?",
      "options": [
        "Because a concept names a semantic contract: types claiming to model it promise behavior, which lets generic code reason about correctness beyond what syntax checking proves",
        "Because compilers are expected to add runtime instrumentation for those requirements in debug builds",
        "Because semantic requirements are enforced at link time through mangled names",
        "It is a historical leftover from the failed C++0x concepts design and has no practical meaning"
      ],
      "answer": 0,
      "explain": "Standard concepts deliberately bundle prose semantics with syntactic checks: a type 'models' std::regular only if the semantic axioms hold, even though satisfaction is all the compiler verifies. Generic algorithms are specified against those semantics, which is why passing a syntactically-satisfying but semantically-lying type yields undefined behavior. Concepts are abstractions in exactly Iglberger's sense — named sets of expectations."
    },
    {
      "type": "code",
      "tag": "Interface Design",
      "question": "Does Pdf::clone() compile as an override even though its return type differs from the base declaration?",
      "code": "struct Document {\n    virtual ~Document() = default;\n    virtual Document* clone() const = 0;\n};\n\nstruct Pdf : Document {\n    Pdf* clone() const override { return new Pdf(*this); }\n};",
      "options": [
        "No — an override must have the identical return type",
        "No — covariance is allowed only for references, not pointers",
        "Yes, but only if Pdf::clone is also marked final",
        "Yes — Pdf* is covariant with Document*, so this is a valid override; callers through Document* still receive a Document*"
      ],
      "answer": 3,
      "explain": "C++ permits covariant return types: an override may return a pointer (or reference) to a class derived from the base function's return class. Callers using the abstraction see a Document*, while code holding a Pdf directly gets the more precise Pdf* without casting. Covariance is the one sanctioned way an override's signature may differ, because it strengthens the postcondition rather than weakening it."
    },
    {
      "type": "mcq",
      "tag": "Overload Sets",
      "question": "Iglberger argues that a set of overloaded free functions (e.g., every overload of serialize()) forms an abstraction just like a base class. What follows from that view?",
      "options": [
        "Overloads may freely differ in meaning since each has its own signature",
        "All overloads must share the same semantics and expectations — adding an overload that behaves differently violates the abstraction exactly like a misbehaving override does",
        "Overload sets exist only at compile time, so no semantic rules apply to them",
        "Overload sets should be replaced by a single variadic template to become a true abstraction"
      ],
      "answer": 1,
      "explain": "Generic code calls serialize(x) expecting one consistent meaning regardless of which overload resolution picks — the overload set is the interface. An overload of abs() that returned the negative magnitude would break callers just as surely as a virtual override that lies. The LSP-style demand for uniform semantics therefore applies to overload sets, templates, and concepts, not only to class hierarchies."
    },
    {
      "type": "code",
      "tag": "Customization Points",
      "question": "save() neither declares nor includes any serialize overload of its own. What happens?",
      "code": "#include <iostream>\n\nnamespace lib {\n    struct Widget {};\n    void serialize(const Widget&) { std::cout << \"lib\"; }\n}\n\ntemplate <typename T>\nvoid save(const T& value) {\n    serialize(value);   // unqualified call\n}\n\nint main() {\n    lib::Widget w;\n    save(w);\n}",
      "options": [
        "It prints \"lib\": argument-dependent lookup searches Widget's namespace and finds lib::serialize, which makes an unqualified call like this an extensible customization point",
        "Compilation fails: serialize is not visible at the point of the call",
        "It prints nothing: the call selects a compiler-generated default serializer",
        "Undefined behavior: unqualified calls in templates are ill-formed, no diagnostic required"
      ],
      "answer": 0,
      "explain": "Because the call is unqualified, argument-dependent lookup adds the namespaces of the argument's type — here lib — to the search. Any type owner can therefore opt into the save() abstraction by providing a serialize overload next to their type, without touching the library. This is the classic free-function customization point pattern that std::swap, begin, and end are built on."
    },
    {
      "type": "mcq",
      "tag": "Customization Points",
      "question": "Why does the book favor free functions over member functions as the extension surface of an abstraction?",
      "options": [
        "Free functions run faster because there is no implicit this parameter",
        "Member functions cannot be overloaded, so free functions are the only choice",
        "Free functions are automatically inline, which reduces coupling",
        "A free function can be added for a type without modifying the type — even for third-party or built-in types — keeping the abstraction open for extension but closed for modification"
      ],
      "answer": 3,
      "explain": "A member function can only be added by whoever owns the class, but a free function can be supplied by anyone, anywhere, including for int or for types from a closed-source library. That makes free functions the more open, less intrusive abstraction mechanism, realizing the Open-Closed Principle. It also decouples the operation from the type's private state, often improving encapsulation rather than harming it."
    },
    {
      "type": "code",
      "tag": "Customization Points",
      "question": "reorder() uses the two-step swap idiom. What does this print?",
      "code": "#include <iostream>\n#include <utility>\n\nnamespace app {\n    struct Grid {};\n    void swap(Grid&, Grid&) { std::cout << \"app\"; }\n}\n\ntemplate <typename T>\nvoid reorder(T& a, T& b) {\n    using std::swap;\n    swap(a, b);\n}\n\nint main() {\n    app::Grid a, b;\n    reorder(a, b);\n}",
      "options": [
        "\"app\" is printed only in C++23 and later",
        "It prints \"app\": the using-declaration makes std::swap the fallback, ADL still finds app::swap, and the non-template exact match beats the std::swap template",
        "It prints nothing: std::swap is selected and swaps the two empty objects",
        "Compilation fails: the two swap candidates are ambiguous"
      ],
      "answer": 1,
      "explain": "Inside reorder, the candidate set contains std::swap (via the using-declaration) and app::swap (via ADL on Grid). Overload resolution prefers the non-template function over the template specialization when both match equally well, so the type-specific swap wins. This is the standard 'two-step' that lets a type's own optimized swap participate while the generic one remains the fallback."
    },
    {
      "type": "mcq",
      "tag": "Customization Points",
      "question": "What problem does the `using std::swap; swap(a, b);` two-step solve that a direct call to `std::swap(a, b)` does not?",
      "options": [
        "It avoids having to include <utility> in the header",
        "It prevents ADL from ever running, which makes the call deterministic",
        "It makes the swap usable in constexpr contexts",
        "The qualified call would lock in the generic std::swap; the two-step keeps the door open for a type's own swap found via ADL while retaining std::swap as the fallback"
      ],
      "answer": 3,
      "explain": "Writing std::swap(a, b) names one specific function template and suppresses argument-dependent lookup entirely, so a hand-written, more efficient swap in the type's namespace is silently ignored. The two-step turns the call site into a genuine customization point: specialized behavior when the type provides it, generic behavior otherwise. Designing call sites this way is part of designing the abstraction."
    },
    {
      "type": "code",
      "tag": "Hidden Friends",
      "question": "operator<< is defined only inside the class body as a friend. How is the call in main resolved?",
      "code": "#include <iostream>\n\nnamespace geo {\n    class Point {\n        int x_ = 1;\n        friend std::ostream& operator<<(std::ostream& os, const Point& p) {\n            return os << \"Point(\" << p.x_ << \")\";\n        }\n    };\n}\n\nint main() {\n    std::cout << geo::Point{};\n}",
      "options": [
        "It fails: friend functions defined in-class are not callable from outside the namespace",
        "Ordinary unqualified lookup finds it because friends are injected into the global namespace",
        "ADL finds it through the Point argument; as a 'hidden friend' it is invisible to ordinary lookup, keeping geo's overload set clean",
        "The compiler synthesizes a member operator<< that forwards to the friend"
      ],
      "answer": 2,
      "explain": "A friend function defined inside the class is a namespace-scope function, but it is not found by ordinary name lookup — only argument-dependent lookup can see it. Since one argument is geo::Point, ADL examines namespace geo, discovers the friend, and the call succeeds, with full access to x_. Printing prints \"Point(1)\"."
    },
    {
      "type": "mcq",
      "tag": "Hidden Friends",
      "question": "Which is a genuine design benefit of the hidden-friend idiom for a class's operators?",
      "options": [
        "The operator participates in overload resolution only when an argument is of the class type, shrinking the candidate set, improving error messages, and blocking unwanted conversions from unrelated types",
        "Hidden friends can access private members of every class in the enclosing namespace",
        "Hidden friends are implicitly constexpr and noexcept",
        "Hidden friends are exempt from the one-definition rule across translation units"
      ],
      "answer": 0,
      "explain": "Because a hidden friend is reachable only via ADL on its class, it never pollutes the namespace-wide overload set: a call like a << b for unrelated types will not even consider it. That reduces accidental matches through implicit conversions and keeps compiler diagnostics focused. It is a small-scale example of controlling exactly how wide an abstraction's surface is."
    },
    {
      "type": "mcq",
      "tag": "tag_invoke Style",
      "question": "Conceptually, what does a tag_invoke-style customization design improve over plain named ADL customization points like serialize(x)?",
      "options": [
        "It removes the need for ADL entirely by using virtual dispatch",
        "It allows customization from a different translation unit, which named functions cannot do",
        "It guarantees the customization is found at runtime via a registry",
        "All customizations funnel through one entry point keyed by a CPO tag type, so distinct customization points cannot collide even when they would share a natural name, and the library checks constraints centrally"
      ],
      "answer": 3,
      "explain": "With plain named customization points, every library that picks a popular name like size or serialize competes in the same global 'name space' of ADL candidates, risking accidental matches. In the tag_invoke style there is a single overloadable name whose first parameter is the customization-point object's tag type, so each extension is unambiguously tied to the abstraction it customizes. The central entry point also gives the library one place to constrain, forward, and document the contract."
    },
    {
      "type": "code",
      "tag": "Policy NTTP",
      "question": "What is printed, and what kind of design knob is Transform?",
      "code": "#include <iostream>\n\nint twice(int x) { return 2 * x; }\n\ntemplate <int (*Transform)(int)>\nint apply(int x) {\n    return Transform(x);\n}\n\nint main() {\n    std::cout << apply<twice>(21);\n}",
      "options": [
        "42 — Transform is a non-type template parameter: the policy is bound at compile time, enabling inlining and zero-overhead dispatch",
        "21 — function pointers cannot be template parameters, so Transform defaults to the identity",
        "42 — Transform is resolved through a hidden vtable created by the compiler",
        "Compilation fails: only type parameters may parameterize templates"
      ],
      "answer": 0,
      "explain": "Function pointers are valid non-type template parameters, so apply<twice> is a distinct function whose call target is a compile-time constant — the optimizer can inline it completely. This is the static cousin of the Strategy pattern: behavior is injected, but the binding happens at instantiation time rather than at runtime. The output is 42."
    },
    {
      "type": "mcq",
      "tag": "Policy NTTP",
      "question": "Compared with a runtime Strategy object, what is the main cost of configuring behavior through a template policy parameter?",
      "options": [
        "Policies cannot access the host class's state",
        "Policy-based code always runs slower due to template instantiation overhead at runtime",
        "Each distinct policy yields a distinct instantiated type: behavior cannot be swapped at runtime, the types don't mix in one container, and heavy use multiplies instantiations and compile time",
        "Policies require RTTI, which many codebases disable"
      ],
      "answer": 2,
      "explain": "A policy chosen via template parameter is welded into the type: vector-of-different-policies is impossible without type erasure, and reconfiguring an object at runtime is off the table. You also pay in build time and code size as combinations multiply. The trade is deliberate — maximum performance and compile-time checking in exchange for runtime flexibility — and choosing which side of it you need is an architectural decision."
    },
    {
      "type": "mcq",
      "tag": "What Is Architecture",
      "question": "Which best matches the book's working definition of software architecture?",
      "options": [
        "The UML diagrams produced before coding starts",
        "The set of decisions and structures that are expensive to change later — the big-picture dependencies and abstractions that shape how the parts of the system interact",
        "The choice of build system, compiler flags, and CI pipeline",
        "Everything written by the most senior engineer on the team"
      ],
      "answer": 1,
      "explain": "Architecture is characterized by cost of change: the key abstractions, the boundaries between parts, and the direction of dependencies across those boundaries are hard to revisit once many components rely on them. Diagrams and tooling merely document or support those decisions. This definition is what lets the book distinguish 'architecture' from freely changeable implementation details."
    },
    {
      "type": "mcq",
      "tag": "Detail vs Architecture",
      "question": "Which of the following is an architecture-level decision rather than an implementation detail?",
      "options": [
        "Replacing a raw loop with std::ranges::for_each inside one function",
        "Renaming a local variable in a .cpp file",
        "Whether a private, unobserved member cache uses std::map or std::unordered_map",
        "Which component owns the Serializer abstraction and in which direction other components may depend on it"
      ],
      "answer": 3,
      "explain": "Ownership of an abstraction and the permitted dependency directions constrain every current and future client — changing them later means touching many components, which is precisely the definition of architectural. The other three choices are invisible outside a single implementation unit and can be revised at will. Iglberger's rule of thumb: if changing it ripples across boundaries, it is architecture."
    },
    {
      "type": "mcq",
      "tag": "Base Class vs Concept",
      "question": "Both a base class and a C++20 concept can express the abstraction 'things that can draw()'. What is the key coupling difference?",
      "options": [
        "A base class is intrusive — every conforming type must inherit from it and carry the machinery — while a concept is non-intrusive: any type with the right interface models it, including third-party types you cannot modify",
        "Concepts create stronger coupling because they are checked at compile time",
        "There is no difference; concepts compile down to abstract base classes",
        "Base classes work with value semantics while concepts force reference semantics"
      ],
      "answer": 0,
      "explain": "Inheritance requires the conforming type to name the base class in its own definition, physically coupling it to the abstraction (and to that library). A concept imposes no such requirement: conformance is structural, checked at the point of use, so even int or a closed-source type can satisfy it. Both express semantic requirements; they differ in intrusiveness, binding time, and the dependency arrows they create."
    },
    {
      "type": "code",
      "tag": "Concept Refinement",
      "question": "Triangle satisfies both constraints. What happens?",
      "code": "#include <iostream>\n#include <string>\n\ntemplate <typename T>\nconcept Shape = requires(T t) { t.area(); };\n\ntemplate <typename T>\nconcept Polygon = Shape<T> && requires(T t) { t.vertices(); };\n\nstruct Triangle {\n    double area() const { return 1.0; }\n    int vertices() const { return 3; }\n};\n\ntemplate <Shape T>\nstd::string kind(const T&) { return \"shape\"; }\n\ntemplate <Polygon T>\nstd::string kind(const T&) { return \"polygon\"; }\n\nint main() {\n    std::cout << kind(Triangle{});\n}",
      "options": [
        "Compilation fails: the two kind() overloads are ambiguous for Triangle",
        "\"shape\" — the first declared overload wins",
        "\"polygon\" — Polygon subsumes Shape because it is defined as Shape<T> plus more, so the more constrained overload is preferred, mirroring how a refined abstraction extends a base contract",
        "\"shapepolygon\" — both overloads are called in declaration order"
      ],
      "answer": 2,
      "explain": "Because Polygon's definition conjoins Shape<T> with additional requirements, the compiler can prove Polygon subsumes Shape and rates the Polygon overload as more constrained; partial ordering then selects it. This is the concepts analogue of a refined interface inheriting from a base interface. Note that subsumption only works through named concepts — repeating the raw requires-expressions would have made the overloads ambiguous."
    },
    {
      "type": "mcq",
      "tag": "Static vs Dynamic",
      "question": "You can express an extension point as an abstract base class or as a function template constrained by a concept. Which dependency consequence is real?",
      "options": [
        "The template approach moves the implementation into headers, so every client recompiles when that implementation changes; the virtual-interface approach can keep implementations in a single .cpp behind a stable header",
        "The virtual approach requires clients to recompile whenever any override changes",
        "Templates prevent code reuse across types",
        "The two approaches have identical build-time coupling"
      ],
      "answer": 0,
      "explain": "A template must be visible at instantiation time, so its full definition lives in headers and becomes a compile-time dependency of every user. An abstract interface inverts this: clients see only declarations, and concrete implementations can change freely behind the link boundary. Runtime indirection versus build-time insulation is one of the central trade-offs when choosing between static and dynamic abstraction."
    },
    {
      "type": "mcq",
      "tag": "Dependency Inversion",
      "question": "In a layered design, where should an abstraction such as the PaymentGateway interface live, according to the Dependency Inversion Principle as Iglberger presents it?",
      "options": [
        "In the low-level module next to the concrete implementations, so they stay in sync",
        "In a neutral third-party package that neither layer owns",
        "With the high level: the abstraction belongs to the code that uses it, and the low-level implementations depend on it — flipping the classic source-code dependency direction",
        "Duplicated in both layers so each can evolve independently"
      ],
      "answer": 2,
      "explain": "The interface exists to serve the high-level policy's needs, so the high level owns and shapes it; concrete gateways then depend upward on that abstraction. If the interface lived beside the implementations, the high level would still transitively depend on the low-level package, and low-level concerns would leak into the contract. Ownership of abstractions by the high level is the essence of DIP, not merely 'use a base class'."
    },
    {
      "type": "mcq",
      "tag": "Dependency Inversion",
      "question": "Which statement reflects a common misunderstanding of DIP that the book corrects?",
      "options": [
        "'DIP means using pointers to base classes everywhere.' In truth DIP is about the direction and ownership of dependencies: high-level policy must not depend on low-level detail — both depend on abstractions owned by the high level",
        "'DIP applies to templates as well as virtual functions' — in truth it applies only to virtual functions",
        "'DIP is about dependency direction' — in truth it is about minimizing heap allocations",
        "'Abstractions should be owned by the high level' — in truth the standard requires them in the lowest layer"
      ],
      "answer": 0,
      "explain": "Sprinkling abstract base classes through a codebase does not invert anything if the interfaces are still defined in, and owned by, the low-level packages. The principle is architectural: draw the dependency arrows so details point toward stable abstractions that the high level controls. Concepts, overload sets, and templates can realize DIP just as well as virtual interfaces."
    },
    {
      "type": "code",
      "tag": "Dependency Inversion",
      "question": "Which change fixes the dependency direction so plugins can vary without touching the engine?",
      "code": "// engine/engine.h   (high-level component)\n#include \"plugins/mp3_decoder.h\"   // concrete low-level class\n\nclass Engine {\n    Mp3Decoder decoder_;           // by value\npublic:\n    void play();\n};",
      "options": [
        "Move Engine into the plugins folder so the include paths match",
        "Declare an abstract Decoder interface owned by the engine component, hold std::unique_ptr<Decoder>, and let mp3_decoder.h include engine/decoder.h — the plugin then depends on the engine's abstraction",
        "Include mp3_decoder.h in engine.cpp instead of engine.h; the architecture is then inverted",
        "Make Mp3Decoder a template parameter of Engine and keep the include"
      ],
      "answer": 1,
      "explain": "The high-level Engine currently names, includes, and physically contains a concrete low-level type, so every new codec means editing the engine. Introducing an engine-owned Decoder abstraction reverses the arrow: plugins include the engine's header and implement its contract, while the engine compiles against the stable interface alone. The by-value member also has to become an owning indirection, since the concrete type's size can no longer be known."
    },
    {
      "type": "mcq",
      "tag": "Plugin Architecture",
      "question": "A plugin system loads decoders from shared libraries at runtime. Which dependency arrangement is correct?",
      "options": [
        "Core and plugins both depend on each concrete decoder's header for efficiency",
        "Each plugin defines its own interface and the core adapts to each at compile time",
        "The plugin interface lives in each plugin and is copied into the core via code generation",
        "The core defines and owns the stable plugin interface; each plugin includes that header and implements it, while the core never sees plugin headers"
      ],
      "answer": 3,
      "explain": "Runtime-loaded plugins are the purest illustration of dependency inversion: the core cannot know concrete plugin types at compile time even if it wanted to. The interface header is the architectural boundary — owned, versioned, and kept stable by the core — and every plugin depends inward on it. Any arrangement where the core knows plugin headers reverses the arrow and defeats dynamic loading."
    },
    {
      "type": "mcq",
      "tag": "ABI Stability",
      "question": "Why are C++ abstract interfaces (pure virtual functions only, no data members, non-inline) a workable ABI boundary for plugins?",
      "options": [
        "The vtable-based call mechanism is de-facto stable per platform ABI, and clients compile against declarations only — never against object layout or inline code that would bake implementation details into the plugin binary",
        "Because virtual functions cannot be inlined, the optimizer keeps binaries identical",
        "Because abstract classes are guaranteed by the ISO standard to have identical layout across all compilers",
        "Because pure virtual functions are exported with C linkage automatically"
      ],
      "answer": 0,
      "explain": "The ISO standard says nothing about ABI, but each platform ABI (Itanium, MSVC) fixes vtable layout, so calls through a pure interface work across separately compiled binaries built with compatible toolchains. Crucially, a data-free, inline-free interface gives the client nothing to copy into its own binary: no layout, no code, just vtable slot indices. That is what allows the implementation side to change freely without recompiling clients."
    },
    {
      "type": "mcq",
      "tag": "ABI Stability",
      "question": "A published abstract interface is compiled into dozens of third-party plugins. Which modification is ABI-safe without recompiling those plugins?",
      "options": [
        "Adding a new virtual function between two existing ones",
        "Reordering the existing virtual functions alphabetically",
        "Adding a non-virtual free helper function in the interface's header",
        "Adding a data member to the interface for caching"
      ],
      "answer": 2,
      "explain": "Plugin binaries hard-code vtable slot indices, so inserting or reordering virtual functions silently makes old binaries call the wrong function — often the worst kind of failure. Adding a data member changes object size and layout assumptions. A free non-member helper touches neither vtable nor layout, which is one more reason the book likes free functions as the growth surface of an abstraction."
    },
    {
      "type": "code",
      "tag": "Pimpl",
      "question": "Why must the destructor be declared here but defined in widget.cpp?",
      "code": "// widget.h\n#include <memory>\n\nclass Widget {\npublic:\n    Widget();\n    ~Widget();                    // declared here, defined in widget.cpp\nprivate:\n    struct Impl;                  // defined only in widget.cpp\n    std::unique_ptr<Impl> pImpl_;\n};",
      "options": [
        "Because exported classes may not have inline destructors under the one-definition rule",
        "A compiler-generated (inline) destructor would instantiate unique_ptr's deleter in client code, where Impl is incomplete — defining it in widget.cpp, where Impl is complete, keeps clients fully insulated from Impl",
        "unique_ptr requires all special member functions to be user-declared",
        "Only destructors defined in a .cpp file can free memory allocated in another translation unit"
      ],
      "answer": 1,
      "explain": "If the destructor were implicitly generated, every translation unit that destroys a Widget would instantiate std::default_delete<Impl>, which requires the complete Impl type — exactly what pimpl is hiding. Declaring ~Widget in the header and defining it (even as '= default') after Impl's definition moves that instantiation into widget.cpp. The same reasoning applies to the move special members."
    },
    {
      "type": "mcq",
      "tag": "Insulation",
      "question": "What does the pimpl idiom buy at the architecture level, and what does it cost?",
      "options": [
        "Buys faster runtime dispatch; costs increased header size",
        "Buys ABI-stable layout with zero overhead; costs nothing measurable",
        "Buys automatic thread safety; costs an extra mutex per object",
        "Buys insulation — private members can change without recompiling clients, shrinking the rebuild ripple across the codebase — at the cost of an extra allocation and a pointer indirection per object"
      ],
      "answer": 3,
      "explain": "Pimpl is a physical-design tool: it moves the class's private world out of the header, so implementation churn stops propagating through the include graph, and it can stabilize ABI as a bonus. The price is real — heap allocation on construction, an indirection on every access, and boilerplate forwarding. Whether that trade pays off is an architectural judgment about how widely the header is included and how often the internals change."
    },
    {
      "type": "mcq",
      "tag": "Destructor Guidelines",
      "question": "State the classic guideline for destructors of polymorphic base classes.",
      "options": [
        "Always make the destructor pure virtual so the class stays abstract",
        "Make the destructor public and virtual if deletion through a base pointer is intended, or protected and non-virtual if it is not",
        "Make it public and non-virtual so derived classes can shadow it cheaply",
        "Make it private and virtual to force use of a factory"
      ],
      "answer": 1,
      "explain": "The two valid designs correspond to the two roles a base class can play: an owning abstraction, deleted polymorphically (public virtual destructor), or a pure implementation/mixin interface never used for ownership (protected non-virtual destructor, so deleting through it simply does not compile). The dangerous combination is the accidental default — public and non-virtual — which invites undefined behavior. The destructor policy is part of the abstraction's contract."
    },
    {
      "type": "code",
      "tag": "Destructor Guidelines",
      "question": "What is the behavior of `delete t`?",
      "code": "#include <string>\n\nstruct Task {\n    ~Task() {}                       // non-virtual\n};\n\nstruct BigTask : Task {\n    std::string payload = std::string(1000, 'x');\n};\n\nint main() {\n    Task* t = new BigTask;\n    delete t;                        // ?\n}",
      "options": [
        "Undefined behavior: deleting a derived object through a base pointer whose destructor is non-virtual — ~BigTask never runs, the string may leak, and the deallocation itself may be wrong",
        "Well-defined: the compiler tracks the dynamic type and calls ~BigTask",
        "Compilation error: Task's destructor must be virtual for this to compile",
        "A well-defined leak: ~Task runs and payload leaks, but nothing else can go wrong"
      ],
      "answer": 0,
      "explain": "The standard says deleting through a pointer whose static type differs from the dynamic type is undefined behavior unless the static type's destructor is virtual. In practice the derived destructor is skipped and the allocator may be handed the wrong pointer or size — but being UB, nothing is guaranteed, not even 'just a leak'. This is why the destructor guideline exists at all."
    },
    {
      "type": "code",
      "tag": "Destructor Guidelines",
      "question": "What happens at `delete l`?",
      "code": "class UpdateListener {\npublic:\n    virtual void onUpdate() = 0;\nprotected:\n    ~UpdateListener() = default;     // protected, non-virtual\n};\n\nclass Widget : public UpdateListener {\npublic:\n    void onUpdate() override {}\n};\n\nint main() {\n    UpdateListener* l = new Widget;\n    l->onUpdate();\n    delete l;                        // ?\n}",
      "options": [
        "Undefined behavior at runtime, as with any non-virtual destructor",
        "It works: delete always resolves to the most-derived destructor",
        "Compilation fails: the protected destructor is inaccessible here — exactly the guideline's intent, turning would-be runtime UB into a compile-time error for non-owning interfaces",
        "It compiles but leaks the Widget object"
      ],
      "answer": 2,
      "explain": "A protected destructor cannot be invoked from outside the class hierarchy, so the delete-expression is ill-formed and the compiler rejects it. That is the whole point of the 'protected and non-virtual' half of the destructor guideline: the interface advertises 'you may observe through me, but you do not own through me'. Ownership must then be managed via the concrete type, which destructs normally."
    },
    {
      "type": "code",
      "tag": "Destructor Guidelines",
      "question": "What is printed when p goes out of scope?",
      "code": "#include <iostream>\n#include <memory>\n\nstruct Base {\n    virtual ~Base() { std::cout << \"B\"; }\n};\n\nstruct Derived : Base {\n    ~Derived() override { std::cout << \"D\"; }\n};\n\nint main() {\n    std::unique_ptr<Base> p = std::make_unique<Derived>();\n}",
      "options": [
        "\"B\" — unique_ptr<Base> only knows about Base",
        "\"DB\" — the virtual destructor dispatches to ~Derived, which then implicitly runs ~Base; unique_ptr<Base> is safe here precisely because the destructor is virtual",
        "\"BD\" — base cleanup always runs before derived cleanup",
        "Nothing — destructors of empty classes are elided"
      ],
      "answer": 1,
      "explain": "unique_ptr's default deleter performs `delete ptr` on the stored Base*, and because ~Base is virtual, dispatch reaches ~Derived first; base subobject destruction follows automatically, printing D then B. Had the destructor been non-virtual, this idiomatic line would have been undefined behavior. Smart pointers do not repair a broken destructor contract — the abstraction itself must declare it."
    },
    {
      "type": "mcq",
      "tag": "NVI",
      "question": "What is the core idea of the Non-Virtual Interface (Template Method) idiom?",
      "options": [
        "All functions, including customization points, should be public virtual for maximum flexibility",
        "Virtual functions should be non-member friends found by ADL",
        "The public interface consists of non-virtual functions that delegate to private virtual hooks — the base class enforces the contract (pre/postconditions, locking, logging) in one place, while derived classes customize only the steps",
        "Interfaces should contain no functions, only type aliases"
      ],
      "answer": 2,
      "explain": "NVI splits the two jobs a public virtual function conflates: the stable interface offered to callers and the variability offered to subclasses. The non-virtual wrapper is the single choke point where the base class can check preconditions, take locks, or instrument, and the private virtual is purely a customization step. It is the object-oriented incarnation of the Template Method pattern."
    },
    {
      "type": "code",
      "tag": "NVI",
      "question": "Circle overrides a private pure virtual of Shape. Does this compile, and what prints?",
      "code": "#include <iostream>\n\nclass Shape {\npublic:\n    void draw() const {              // fixed public contract\n        std::cout << \"[\";\n        doDraw();\n        std::cout << \"]\";\n    }\nprivate:\n    virtual void doDraw() const = 0;\n};\n\nclass Circle : public Shape {\nprivate:\n    void doDraw() const override { std::cout << \"circle\"; }\n};\n\nint main() {\n    Circle c;\n    c.draw();\n}",
      "options": [
        "No: private virtual functions cannot be overridden outside the class",
        "Yes, but it prints \"circle\" without brackets because the override bypasses draw()",
        "No: a pure virtual function cannot be private",
        "Yes, it prints \"[circle]\": access control is independent of overriding — derived classes can override what they cannot call, which is exactly how NVI separates customization from invocation"
      ],
      "answer": 3,
      "explain": "Access specifiers govern who may call a function, not who may override it, so overriding a private pure virtual is perfectly legal. Callers can only enter through the non-virtual draw(), which guarantees the bracket pre/post steps always run around the customized core. This separation — callers use the public non-virtual, subclasses implement the private virtual — is the entire machinery of NVI."
    },
    {
      "type": "mcq",
      "tag": "NVI",
      "question": "Why does the guideline say virtual functions should generally be private (or protected), not public?",
      "options": [
        "Private virtuals dispatch faster because the vtable is smaller",
        "A public virtual function fuses two responsibilities — the interface offered to callers and the customization point for derived classes; separating them lets each evolve independently",
        "Public virtual functions cannot be pure",
        "It prevents derived classes from calling the base implementation"
      ],
      "answer": 1,
      "explain": "When a function is both the caller-facing API and the subclass extension point, any change to one role drags the other along — you cannot add argument checking or instrumentation without touching every override's contract. Making the virtual private and exposing a non-virtual wrapper decouples the two audiences of the class. Interface stability for callers, implementation freedom for subclasses."
    },
    {
      "type": "code",
      "tag": "Virtual Pitfalls",
      "question": "The default arguments differ between Base and Derived. What does this print?",
      "code": "#include <iostream>\n\nstruct Base {\n    virtual void log(int level = 1) { std::cout << \"base \" << level; }\n    virtual ~Base() = default;\n};\n\nstruct Derived : Base {\n    void log(int level = 2) override { std::cout << \"derived \" << level; }\n};\n\nint main() {\n    Derived d;\n    Base& b = d;\n    b.log();\n}",
      "options": [
        "\"derived 2\"",
        "\"base 1\"",
        "\"derived 1\" — the function dispatches dynamically but the default argument binds statically to Base's declaration; keeping defaults on one non-virtual entry point (as NVI does) avoids this trap",
        "\"base 2\""
      ],
      "answer": 2,
      "explain": "Default arguments are substituted at compile time from the static type of the expression — here Base, giving 1 — while the call itself dispatches at runtime to Derived::log. The mismatch produces 'derived 1', a combination neither author wrote deliberately. This is a standard argument for the NVI style: put default arguments on the non-virtual public function and keep the virtual hooks default-free."
    },
    {
      "type": "code",
      "tag": "Virtual Pitfalls",
      "question": "Base's constructor calls a virtual function. What is printed?",
      "code": "#include <iostream>\n\nstruct Base {\n    Base() { init(); }\n    virtual void init() { std::cout << \"base\"; }\n    virtual ~Base() = default;\n};\n\nstruct Derived : Base {\n    void init() override { std::cout << \"derived\"; }\n};\n\nint main() {\n    Derived d;\n}",
      "options": [
        "\"base\" — during Base's constructor the dynamic type is still Base, so the virtual call never reaches Derived::init; the abstraction is not fully formed while it is being built",
        "\"derived\" — virtual dispatch always uses the most-derived type",
        "Undefined behavior — calling any virtual function in a constructor is UB",
        "\"basederived\" — both implementations are called in order"
      ],
      "answer": 0,
      "explain": "While Base's constructor runs, the object's dynamic type is Base — the Derived parts do not exist yet — so the virtual call resolves to Base::init. This is well-defined for non-pure virtuals (calling a pure virtual there would be UB). The lesson for interface design: a class cannot delegate part of its own construction to subclass overrides; use factories or post-construction initialization instead."
    },
    {
      "type": "code",
      "tag": "Pure Virtual",
      "question": "A pure virtual function with an out-of-class definition — what happens?",
      "code": "#include <iostream>\n\nstruct Animal {\n    virtual ~Animal() = default;\n    virtual void describe() const = 0;\n};\n\nvoid Animal::describe() const { std::cout << \"animal\"; }\n\nstruct Dog : Animal {\n    void describe() const override {\n        Animal::describe();\n        std::cout << \" (dog)\";\n    }\n};\n\nint main() {\n    Dog d;\n    d.describe();\n}",
      "options": [
        "Compilation fails: pure virtual functions may not have bodies",
        "It prints \"animal (dog)\": '= 0' forces every concrete derived class to override, yet the base still offers a default that overrides may opt into explicitly via a qualified call",
        "It prints \"animal\": the pure virtual definition suppresses the override",
        "It prints \" (dog)\": the qualified call is ignored for pure virtuals"
      ],
      "answer": 1,
      "explain": "'Pure' and 'defined' are independent properties: '= 0' only means the class is abstract and derived classes must override, while a separate definition remains callable through a qualified name. This yields a useful contract: subclasses must consciously decide, but can delegate to the base's default rather than duplicating it. Dog::describe calls the base implementation and then appends, printing 'animal (dog)'."
    },
    {
      "type": "code",
      "tag": "Pure Virtual",
      "question": "Is the out-of-class definition of ~Interface actually required?",
      "code": "struct Interface {\n    virtual ~Interface() = 0;        // pure virtual destructor\n};\n\nInterface::~Interface() = default;   // definition — required?\n\nstruct Impl : Interface {};\n\nint main() {\n    Impl i;\n}",
      "options": [
        "No: pure virtual functions never need definitions",
        "No: '= default' inside the class would be required instead",
        "Only if Impl objects are created on the heap",
        "Yes: ~Impl calls ~Interface directly (not virtually), so without a definition the program fails to link — a pure virtual destructor makes the class abstract but must still be defined"
      ],
      "answer": 3,
      "explain": "Destructors are special: every derived destructor ends with a direct, non-virtual call to its base's destructor, so ~Interface is always odr-used and needs a definition. A pure virtual destructor is the standard trick for making a class abstract when no other function is a natural candidate for '= 0'. Note you cannot write both '= 0' and '= default' inside the class body; the definition must be separate."
    },
    {
      "type": "mcq",
      "tag": "NVI",
      "question": "Which is a genuine drawback of the Non-Virtual Interface idiom to weigh against its benefits?",
      "options": [
        "It makes pre- and postcondition checks impossible",
        "It adds a layer of functions and some rigidity: the non-virtual wrapper fixes the call protocol so derived classes cannot legitimately restructure it, and the idiom cannot be applied to destructors",
        "It forces every customization hook to be public",
        "It prevents the base class from holding any state"
      ],
      "answer": 1,
      "explain": "Every NVI function is really two functions, which is boilerplate, and the wrapper's fixed sequence of steps is a hard promise — if a subclass genuinely needs a different protocol, the design fights back. Destructors cannot follow the idiom since they are themselves the customization point. The benefits (centralized contract enforcement) usually outweigh these costs, but they are real costs."
    },
    {
      "type": "mcq",
      "tag": "Interface Segregation",
      "question": "What is the primary symptom that an interface violates the Interface Segregation Principle?",
      "options": [
        "It has more than five member functions",
        "It uses templates and virtual functions together",
        "Clients are forced to depend on (and recompile for) operations they never call, and implementations must stub out functions that make no sense for them",
        "It is implemented by more than one class"
      ],
      "answer": 2,
      "explain": "The tell-tale signs are on both sides of the contract: callers drag in declarations, dependencies, and rebuilds for functionality they ignore, and implementers write empty or throwing bodies for operations that do not apply to them. Both are coupling without benefit. Function count alone is irrelevant — a large but cohesive interface can be fine, while a three-function interface serving two unrelated client groups is not."
    },
    {
      "type": "mcq",
      "tag": "Interface Segregation",
      "question": "A Document interface offers print(), serialize(), and render(). The print server uses only print(). Applying ISP at architecture scale means…",
      "options": [
        "…marking serialize() and render() as '= delete' in the print server's build",
        "…having the print server include document.h but promising in a comment not to call the other functions",
        "…splitting Document into role interfaces (Printable, Serializable, …) in separate headers so the print server depends only on Printable — decoupled from serialization changes at both the design and the build level",
        "…merging the three functions into one function taking an enum parameter"
      ],
      "answer": 2,
      "explain": "Segregation must be physical to matter architecturally: separate role interfaces in separate headers mean a change to serialization no longer touches, recompiles, or redeploys the print server. A comment-level promise still leaves the full compile-time dependency in place. Concrete document types can implement several role interfaces at once; each client sees only the slice it needs."
    },
    {
      "type": "mcq",
      "tag": "Interface Segregation",
      "question": "How does Iglberger relate ISP to the other SOLID principles?",
      "options": [
        "ISP contradicts SRP: one asks to split interfaces, the other to merge them",
        "ISP is really the Single Responsibility Principle applied to interfaces: an interface should represent one cohesive set of expectations — one reason to change",
        "ISP is a performance guideline, unlike the design-oriented rest of SOLID",
        "ISP applies only to dynamic polymorphism, never to templates or overload sets"
      ],
      "answer": 1,
      "explain": "An interface serving multiple unrelated client groups has multiple reasons to change — the very definition of an SRP violation, observed at the interface level. Iglberger also emphasizes that ISP applies to every abstraction mechanism: a fat concept or a sprawling overload set couples its users exactly like a fat base class. Cohesion of expectations is the universal criterion."
    },
    {
      "type": "code",
      "tag": "Interface Segregation",
      "question": "A new parameter is added to Printable::print(). Which code must recompile?",
      "code": "// --- printable.h ---\nclass Printable {\npublic:\n    virtual ~Printable() = default;\n    virtual void print() const = 0;\n};\n\n// --- serializable.h ---\nclass Serializable {\npublic:\n    virtual ~Serializable() = default;\n    virtual void serialize() const = 0;\n};\n\n// --- document.h (includes both headers) ---\nclass Document : public Printable, public Serializable {\npublic:\n    void print() const override;\n    void serialize() const override;\n};\n\n// --- archive.cpp (includes only serializable.h) ---\nvoid archive(const Serializable& s) { s.serialize(); }",
      "options": [
        "archive.cpp too, because Document implements both interfaces",
        "Everything that includes serializable.h, since the two interfaces are siblings",
        "Only Document and code that includes printable.h; archive.cpp is untouched because it depends solely on serializable.h — the payoff of segregated role interfaces",
        "Nothing: virtual functions can change signature without recompilation"
      ],
      "answer": 2,
      "explain": "archive.cpp's physical dependency set contains serializable.h and nothing else, so a change confined to printable.h cannot reach it — the build system will not even schedule it. Had there been a single fat Document interface, every client would recompile for a change to any operation. Interface segregation is thus as much about the include graph as about the class diagram."
    },
    {
      "type": "mcq",
      "tag": "Physical Design",
      "question": "Why must the component dependency graph of a well-architected system be acyclic (levelizable)?",
      "options": [
        "Cyclic dependencies mean the components can only be built, tested, understood, and reused together — they are effectively one big component; an acyclic graph lets you assign levels and work bottom-up",
        "Because C++ linkers refuse to link cyclic object files",
        "Because cyclic includes are ill-formed even with include guards",
        "Acyclicity is only an aesthetic preference with no engineering consequence"
      ],
      "answer": 0,
      "explain": "Two components that depend on each other cannot be compiled, unit-tested, or reused independently — every boundary between them is fictional. An acyclic graph can be levelized: level-0 components depend on nothing internal, level-1 only on level-0, and so on, giving a concrete order for building, testing, and understanding the system. Toolchains tolerate cycles at the file level; architectures do not."
    },
    {
      "type": "code",
      "tag": "Physical Design",
      "question": "Why can this mutual by-value relationship never compile, and what is the architectural fix?",
      "code": "class Order;\n\nclass Customer {\n    Order lastOrder_;     // by value\n};\n\nclass Order {\n    Customer buyer_;      // by value\n};",
      "options": [
        "It compiles as long as both classes are defined in one header",
        "It fails only because Order is declared after Customer; reordering the definitions fixes it",
        "Each object would have to contain the other, giving infinite size; at least one side must hold a pointer/reference (or other indirection), which also breaks the physical dependency cycle between their components",
        "It fails because classes may not contain user-defined types by value"
      ],
      "answer": 2,
      "explain": "A by-value member requires the complete type, and mutual containment would make each object infinitely large — no ordering of the definitions can help. Replacing one side with an indirection to a forward-declared type resolves it, and doing so forces you to decide which class is the lower-level one. The type-level cycle and the component-level cycle are the same problem seen at two scales."
    },
    {
      "type": "code",
      "tag": "Compile-Time Coupling",
      "question": "With only a forward declaration of Engine available, which member line fails to compile?",
      "code": "class Engine;                 // forward declaration only\n\nclass Car {\n    Engine* engine_;          // A\n    Engine& turbo();          // B (declaration only)\n    Engine  spare_;           // C\n};",
      "options": [
        "A — pointers require a complete type",
        "B — return types always require a complete type at the point of declaration",
        "All three fail",
        "C — a by-value member needs Engine's full definition (size, alignment); pointers, references, and function declarations do not"
      ],
      "answer": 3,
      "explain": "The compiler must know Car's size, and that requires the size of every by-value member — so line C demands the complete Engine definition. A pointer member has a known size regardless of the pointee, and a function declaration returning Engine& commits to nothing about Engine's layout. Exploiting this asymmetry is the basis of minimizing compile-time dependencies with forward declarations."
    },
    {
      "type": "code",
      "tag": "Compile-Time Coupling",
      "question": "How can report.h shed its dependency on database.h?",
      "code": "// report.h\n#include \"database.h\"        // full include — necessary?\n#include <string>\n\nclass Report {\npublic:\n    explicit Report(Database& db);\n    std::string title() const;\nprivate:\n    Database* db_;\n};",
      "options": [
        "Replace the include with `class Database;` — the header uses Database only as a reference parameter and a pointer member, so a forward declaration suffices and database.h moves into report.cpp, cutting the transitive rebuild chain for every client of report.h",
        "It cannot: constructor parameters always require complete types",
        "Move the include below the class definition",
        "Mark the constructor explicit — explicit constructors do not require complete parameter types"
      ],
      "answer": 0,
      "explain": "Nothing in this header needs Database's definition: reference parameters in declarations and pointer members are fine with an incomplete type. With the forward declaration, clients of report.h no longer transitively include database.h, so changes to the database component stop rebuilding the reporting world. Include what you use in the .cpp; forward-declare what you can in the header."
    },
    {
      "type": "mcq",
      "tag": "Compile-Time Coupling",
      "question": "Which usage in a header genuinely requires the complete definition of class X rather than a forward declaration?",
      "options": [
        "Declaring a function that takes X by value",
        "Declaring a member of type X* or X&",
        "Declaring a function returning X (with the definition elsewhere)",
        "Inheriting from X, holding an X by value, or calling a member of X inside an inline function body"
      ],
      "answer": 3,
      "explain": "Layout and lookup are what force completeness: a base class and a by-value member contribute to the object's size, and calling a member function requires X's declaration set. Mere declarations that mention X by value — parameters and return types — are fine with an incomplete type, since completeness is checked only where the function is defined or called. Knowing this table is the everyday craft of dependency minimization."
    },
    {
      "type": "mcq",
      "tag": "Physical Design",
      "question": "What does it mean for a header to be self-contained, and why does it matter architecturally?",
      "options": [
        "It contains no #include directives at all",
        "It can only be included once per program",
        "It compiles as the first include of a translation unit — including or forward-declaring everything it needs — so clients depend on a well-defined surface instead of accidental include order, keeping physical dependencies explicit",
        "It inlines all function definitions to avoid link errors"
      ],
      "answer": 2,
      "explain": "A non-self-contained header works only when some other header happens to be included first, which turns the include order of every client into an undocumented dependency. Self-containment makes each header an honest, checkable unit — its includes are exactly its dependencies, which is what dependency analysis and levelization rely on. The standard test is to include the header first in its own .cpp."
    },
    {
      "type": "code",
      "tag": "Insulation",
      "question": "Adding a private member `std::string note_;` to Widget changes no public behavior. What is the build consequence, and the standard remedy?",
      "code": "// widget.h — included by ~400 translation units\nclass Widget {\npublic:\n    int value() const;\nprivate:\n    int cached_ = 0;          // plan: add another private member\n};",
      "options": [
        "No consequence: private members are invisible to clients, so nothing recompiles",
        "All ~400 translation units recompile, because they include the definition and the class's size/layout changed; insulating with pimpl (or an abstract interface) is the standard way to stop private details from radiating rebuilds",
        "Only widget.cpp recompiles, but all clients must relink against a new ABI hash",
        "The program becomes ill-formed unless note_ is declared mutable"
      ],
      "answer": 1,
      "explain": "Access control is a logical boundary, not a physical one: clients that include widget.h compile against the full class layout, so any private change dirties them all. Encapsulation hides names; insulation hides the physical dependency, and only the latter prevents rebuild avalanches. Pimpl, abstract interfaces, and free-function APIs are the standard insulation techniques."
    },
    {
      "type": "mcq",
      "tag": "Speculative Generality",
      "question": "A team adds an abstract base class, a factory, and configuration hooks for a subsystem that has exactly one implementation and no concrete second use in sight. The book's verdict?",
      "options": [
        "Good practice: abstractions are free and future-proofing always pays off",
        "Acceptable only if the factory is a singleton",
        "The problem is only the factory; unused base classes are cost-free",
        "This is speculative generality: an unproven abstraction adds indirection, cognitive load, and maintenance cost, and often abstracts the wrong axis — abstractions should be extracted from real, repeated need"
      ],
      "answer": 3,
      "explain": "An abstraction designed from a single example usually enshrines that example's accidents as requirements, and when a real second use case arrives it rarely fits the guessed interface. Meanwhile every reader pays the indirection tax on every visit. The cheapest time to introduce an abstraction is when the second concrete need makes the right one obvious — not before."
    },
    {
      "type": "mcq",
      "tag": "Inheritance Warning",
      "question": "Iglberger repeatedly warns that 'inheritance is rarely the answer'. What is the core technical reason?",
      "options": [
        "Virtual dispatch costs make inheritance too slow for modern CPUs",
        "Inheritance cannot express polymorphism for more than one function",
        "Compilers devirtualize everything anyway, making inheritance pointless",
        "Public inheritance is one of the strongest couplings in C++: derived types are bound to the base's interface, behavior, and often its protected internals, so hierarchy-wide change becomes expensive and the design rigid"
      ],
      "answer": 3,
      "explain": "A derived class inherits not just an interface but every decision baked into the base — signatures, invariants, protected state, even bugs — and cannot shed any of it. Changing the base means auditing the whole hierarchy, which is why deep hierarchies calcify. The warning is not that inheritance is useless (it powers abstract interfaces), but that it is far too strong a coupling to use as a default reuse mechanism."
    },
    {
      "type": "mcq",
      "tag": "Inheritance Warning",
      "question": "What tends to go wrong with deep class hierarchies as a program evolves?",
      "options": [
        "Base-class decisions ossify: every level inherits accumulated assumptions, features get wedged into intermediate classes, and cross-cutting variation forces combinatorial subclasses — the 'class explosion'",
        "They exceed the standard's limit of 16 inheritance levels",
        "Each inheritance level adds a mandatory heap allocation",
        "Deep hierarchies prevent use of the standard library"
      ],
      "answer": 0,
      "explain": "Hierarchies grow along one axis of variation, so a second independent axis (persistence, rendering backend, threading model) multiplies subclasses instead of adding them. Intermediate classes accumulate members 'for the children', violating ISP and SRP along the way. Composition, policies, and type erasure let independent axes vary independently, which is why the book keeps steering away from deep trees."
    },
    {
      "type": "code",
      "tag": "Slicing",
      "question": "What is printed?",
      "code": "#include <iostream>\n#include <string>\n\nstruct Shape {\n    virtual ~Shape() = default;\n    virtual std::string name() const { return \"shape\"; }\n};\n\nstruct Circle : Shape {\n    std::string name() const override { return \"circle\"; }\n};\n\nvoid print(Shape s) {                 // by value!\n    std::cout << s.name();\n}\n\nint main() {\n    Circle c;\n    print(c);\n}",
      "options": [
        "\"circle\" — virtual dispatch works regardless of how the object is passed",
        "\"shape\" — passing by value slices the Circle down to its Shape subobject; polymorphic abstractions must be passed by reference, pointer, or smart pointer",
        "Compilation fails: polymorphic bases cannot be passed by value",
        "Undefined behavior due to the temporary copy"
      ],
      "answer": 1,
      "explain": "The parameter is a brand-new Shape object copy-constructed from just the Shape subobject of c — the Circle part is 'sliced' away, legally and silently. Inside print, the dynamic type genuinely is Shape, so virtual dispatch correctly prints 'shape'. Slicing is a key reason reference semantics creeps into inheritance-based designs, and one of the book's arguments for value-semantic alternatives like type erasure."
    },
    {
      "type": "code",
      "tag": "Name Hiding",
      "question": "What happens at f.log(42)?",
      "code": "#include <string>\n\nstruct Logger {\n    void log(int n);\n};\n\nstruct FileLogger : Logger {\n    void log(const std::string& msg);\n};\n\nint main() {\n    FileLogger f;\n    f.log(42);        // ?\n}",
      "options": [
        "It calls Logger::log(int): overloads from base and derived merge into one set",
        "It calls FileLogger::log by converting 42 to std::string",
        "It fails to compile: FileLogger::log hides the entire base overload set, and 42 cannot convert to std::string; the fix is `using Logger::log;` — hiding silently narrows the interface clients see",
        "It is an ambiguous call between the two overloads"
      ],
      "answer": 2,
      "explain": "Name lookup stops at the first scope containing the name, so FileLogger::log hides every Logger::log regardless of signature, and overload resolution never sees the int version. Since int has no conversion to std::string, the call is ill-formed. A derived class that accidentally shrinks the inherited overload set has quietly changed the abstraction — `using Logger::log;` restores the full set."
    },
    {
      "type": "code",
      "tag": "Name Hiding",
      "question": "Derived re-exports Base::f with a using-declaration. What is printed?",
      "code": "#include <iostream>\n\nstruct Base {\n    int f(int) { return 1; }\n};\n\nstruct Derived : Base {\n    using Base::f;\n    int f(double) { return 2; }\n};\n\nint main() {\n    Derived d;\n    std::cout << d.f(3) << d.f(3.5);\n}",
      "options": [
        "\"22\" — the derived overload always wins",
        "\"11\" — the using-declaration gives base functions priority",
        "Compilation fails: using-declarations may not merge overload sets",
        "\"12\" — the using-declaration merges Base::f into Derived's overload set, so ordinary overload resolution picks f(int) for 3 and f(double) for 3.5"
      ],
      "answer": 3,
      "explain": "The using-declaration imports Base::f(int) into Derived's scope, so both functions compete in one overload set with no hiding. The int argument exactly matches f(int) and the double argument exactly matches f(double), printing 1 then 2. This is the standard technique for extending an inherited overload set instead of accidentally replacing it."
    },
    {
      "type": "code",
      "tag": "Override Contract",
      "question": "What happens when this is compiled?",
      "code": "struct Codec {\n    virtual ~Codec() = default;\n    virtual void process(int frame);\n};\n\nstruct FastCodec : Codec {\n    void process(long frame) override;   // ?\n};",
      "options": [
        "Error: process(long) does not override anything — the parameter type differs — and `override` turns what would be silent hiding into a hard diagnostic; without it, FastCodec would quietly stop customizing the abstraction",
        "It compiles: long is implicitly convertible from int, so it overrides",
        "It compiles: override is only a documentation hint with no semantic effect",
        "Error: overrides may not widen parameter types, but removing `override` would make it a valid covariant override"
      ],
      "answer": 0,
      "explain": "Overriding requires identical parameter types — implicit convertibility does not count (only covariant return types get leeway). Without the override keyword this would compile as an unrelated function that hides the base one, and calls through Codec* would silently use the base behavior. Marking every intended override is thus contract enforcement, not style."
    },
    {
      "type": "code",
      "tag": "Static vs Dynamic",
      "question": "Why does this not compile, and what does it reveal about the two polymorphism mechanisms?",
      "code": "struct Serializer {\n    template <typename T>\n    virtual void write(const T& value) = 0;   // ?\n};",
      "options": [
        "It compiles in C++20 when concepts are enabled",
        "Member function templates cannot be virtual: a vtable needs a fixed, finite set of slots, but a template generates unboundedly many functions — dynamic and static polymorphism must be bridged deliberately (e.g., via type erasure), not mixed on one function",
        "It fails only because write is pure; giving it a body would fix it",
        "It fails because T is unconstrained; writing `template <std::copyable T>` would fix it"
      ],
      "answer": 1,
      "explain": "Virtual dispatch is built on a per-class table whose size is fixed when the class is defined, while a member template's set of instantiations is open-ended and only known at each call site — the two models are fundamentally incompatible on a single function. Designs that need 'a virtual function for any T' reach for type erasure or a fixed pre-declared set of virtual overloads. Recognizing which polymorphism a boundary needs is an architectural decision."
    },
    {
      "type": "mcq",
      "tag": "Composition",
      "question": "Mechanically, what replaces inheritance when applying 'prefer composition over inheritance'?",
      "options": [
        "The class stores the reused component as a member (or holds a strategy/std::function) and forwards or delegates — exposing only the operations that make sense, and even swapping behavior at runtime",
        "The class uses protected inheritance to hide the base",
        "The class copies the source code of the reused class into itself",
        "The class befriends the reused component to reach its internals"
      ],
      "answer": 0,
      "explain": "Composition reuses through membership and delegation: the outer class decides exactly which capabilities to re-export, under what names, with what checks. Unlike a base class, a member can be replaced, wrapped, or reconfigured at runtime, and its public interface does not leak into yours. You give up implicit substitutability — which is precisely the point when substitutability was never the goal."
    },
    {
      "type": "code",
      "tag": "Composition",
      "question": "What prints, and how does Greeter depend on the lambda's concrete type?",
      "code": "#include <functional>\n#include <iostream>\n#include <string>\n\nclass Greeter {\npublic:\n    explicit Greeter(std::function<std::string(const std::string&)> style)\n        : style_(std::move(style)) {}\n    std::string greet(const std::string& name) const { return style_(name); }\nprivate:\n    std::function<std::string(const std::string&)> style_;\n};\n\nint main() {\n    Greeter g([](const std::string& n) { return \"Hi \" + n; });\n    std::cout << g.greet(\"Ada\");\n}",
      "options": [
        "\"Hi Ada\"; Greeter stores the lambda type as a template parameter, so each style creates a distinct Greeter type",
        "Compilation fails: lambdas cannot be stored in std::function members",
        "\"Hi Ada\"; it does not depend on it at all — std::function type-erases the callable, so behavior is composed at runtime with no inheritance relationship and no named hierarchy anywhere",
        "\"Hi Ada\"; Greeter must privately inherit from the lambda's closure type internally"
      ],
      "answer": 2,
      "explain": "std::function is type erasure in a box: any callable with the right signature can be stored, and Greeter's own type never changes. This is the Strategy pattern without a Strategy base class — the 'interface' is just the call signature plus the semantic expectation of what a style does. The book presents exactly this shift, from inheritance hierarchies to composed, value-semantic behavior, as the modern C++ default."
    },
    {
      "type": "mcq",
      "tag": "Is-a vs Has-a",
      "question": "Which relationship modeling is correct?",
      "options": [
        "Car should inherit from Engine to reuse start() without writing a forwarding function",
        "A Car has-an Engine (composition); public inheritance is reserved for genuine behavioral substitutability, where every base-class expectation holds for the derived type",
        "Engine should inherit from Car so the dependency arrow points upward",
        "Car is-an Engine because a car cannot exist without one"
      ],
      "answer": 1,
      "explain": "Inheriting to reuse an implementation confuses is-a with has-a: a Car passed to code expecting an Engine would be nonsense, so the substitutability test fails immediately. Composition expresses the real relationship, keeps Engine's interface from leaking into Car's, and costs only a trivial forwarding function. The is-a question is always about the semantic contract, never about convenience of reuse."
    },
    {
      "type": "code",
      "tag": "Is-a vs Has-a",
      "question": "This compiles. Which two design faults does it contain?",
      "code": "#include <vector>\n\nclass Stack : public std::vector<int> {   // \"a stack IS a vector, right?\"\npublic:\n    void push(int v) { push_back(v); }\n    int  pop() { int v = back(); pop_back(); return v; }\n};\n\nint main() {\n    std::vector<int>* v = new Stack;\n    v->insert(v->begin(), 99);            // breaks LIFO discipline\n    delete v;                              // ?\n}",
      "options": [
        "Only a style issue: standard containers may be inherited from freely",
        "insert() is the only problem; delete through the base pointer is fine for standard containers",
        "pop() is the problem, because calling back() on an empty vector throws",
        "delete through vector<int>* is UB (non-virtual destructor), and the public inheritance exposes the whole vector interface, letting clients destroy the stack's LIFO invariant — the relationship is implemented-in-terms-of, not is-a"
      ],
      "answer": 3,
      "explain": "std::vector's destructor is non-virtual, so deleting a Stack through vector<int>* is undefined behavior. Just as damaging at the design level: is-a publishes every vector operation as part of Stack's contract, so nothing stops clients from inserting in the middle. A stack is implemented in terms of a vector — private inheritance or, better, a plain member expresses that honestly."
    },
    {
      "type": "mcq",
      "tag": "Private Inheritance",
      "question": "When is private inheritance a defensible alternative to composition for 'implemented-in-terms-of'?",
      "options": [
        "When the implementing class needs to override a virtual function of the reused class, access its protected members, or exploit the empty base optimization — needs that plain membership cannot satisfy",
        "Whenever the reused class is expensive to copy",
        "When you want clients to convert Derived* to Base* implicitly",
        "Never: private inheritance was deprecated in C++17"
      ],
      "answer": 0,
      "explain": "Composition should be the default for implemented-in-terms-of, but it cannot override virtuals, reach protected members, or shrink an empty helper to zero bytes — those require being a class's derived type. Private inheritance grants exactly that, while denying clients any base-class conversion or interface access. It remains valid, occasionally indispensable, modern C++."
    },
    {
      "type": "code",
      "tag": "Private Inheritance",
      "question": "Which marked line fails, and what does that say about private inheritance?",
      "code": "class Timer {\npublic:\n    void start() {}\n};\n\nclass Stopwatch : private Timer {\npublic:\n    using Timer::start;    // re-export just this\n};\n\nint main() {\n    Stopwatch s;\n    s.start();             // A\n    Timer* t = &s;         // B\n}",
      "options": [
        "A fails: private inheritance hides all base members permanently",
        "B fails: outside the class, conversion to an inaccessible base is an error — private inheritance is pure implementation reuse, deliberately not an is-a relationship visible to clients",
        "Both compile: using-declarations restore the full public interface including conversions",
        "Both fail: private bases cannot be used at all from derived objects"
      ],
      "answer": 1,
      "explain": "The using-declaration selectively re-exports start(), so line A is fine — the derived class curates exactly which base capabilities become part of its own interface. But the derived-to-base conversion is governed by the inheritance's access level, so line B is ill-formed outside Stopwatch. That asymmetry is the point: clients get the chosen operations without ever being able to treat a Stopwatch as a Timer."
    },
    {
      "type": "mcq",
      "tag": "Private Inheritance",
      "question": "How does the empty base optimization (EBO) motivate private inheritance in library design, for example when storing an allocator?",
      "options": [
        "EBO makes empty bases allocate their storage lazily on first use",
        "EBO applies equally to empty members, so composition is always identical",
        "An empty class used as a data member must still occupy at least one byte (plus padding), but as a base class it can occupy zero bytes — so containers privately inherit from stateless allocators or comparators to stay lean",
        "EBO removes the vtable pointer from polymorphic classes"
      ],
      "answer": 2,
      "explain": "Every data member needs a distinct address, so even an empty allocator member inflates the container, often by a whole word after alignment. A base class subobject is exempt: it may share its address and take zero space. Standard library implementations therefore privately inherit from (or use compressed-pair tricks with) stateless policies; C++20's [[no_unique_address]] now offers a member-based alternative."
    },
    {
      "type": "mcq",
      "tag": "Speculative Generality",
      "question": "Which heuristic best guards against building the wrong abstraction?",
      "options": [
        "Always write the interface first and the implementations later",
        "Let abstractions be discovered: wait until at least a second concrete, real use exists, because an abstraction generalized from one example usually encodes that example's accidents as if they were essentials",
        "Generalize every function that exceeds ten lines",
        "Prohibit new abstractions entirely until version 2.0"
      ],
      "answer": 1,
      "explain": "With one data point you cannot tell which properties are essential to the concept and which are incidental to the instance, so the guessed interface tends to fit only its origin. A second real use triangulates: what both need is the abstraction, what only one needs is detail. This is not an argument against abstraction — it is an argument for extracting it from evidence."
    },
    {
      "type": "mcq",
      "tag": "Value Semantics",
      "question": "Why does the book push value semantics as the default over reference-semantics-style hierarchies?",
      "options": [
        "Values are always cheaper to copy than pointers are to dereference",
        "Reference semantics is required by the standard containers, so values avoid the STL",
        "Value semantics cannot be combined with polymorphism, which simplifies designs by removing it",
        "Values avoid the aliasing, lifetime, and nullability questions that pointer-heavy designs create; code becomes easier to reason about, and polymorphism can still be had via type erasure or variants rather than shared mutable objects"
      ],
      "answer": 3,
      "explain": "Inheritance-based designs force indirection — you traffic in pointers to bases — and with it come dangling references, nulls, aliasing surprises, and defensive cloning. Value types compose, copy, and destroy predictably, which pays off in correctness and often in performance through locality. Type erasure (std::function-style) and std::variant show that dynamic behavior does not require abandoning values."
    },
    {
      "type": "mcq",
      "tag": "Component Boundaries",
      "question": "Which of these belongs to the architecture (the hard-to-change agreements) rather than to a component's private freedom?",
      "options": [
        "The stable interfaces exchanged between components and the allowed direction of dependencies across those boundaries",
        "Whether a component's internal loop uses an index or an iterator",
        "The naming of local variables inside a component",
        "Which private container a component caches its results in"
      ],
      "answer": 0,
      "explain": "Cross-boundary interfaces and dependency directions are relied upon by other components and other teams; changing them requires coordinated change everywhere, which is what makes them architectural. Everything confined inside one component can be revised without anyone else noticing — that freedom is exactly what good boundaries are supposed to protect. Architecture is the small set of agreements that keep the rest freely changeable."
    },
    {
      "type": "mcq",
      "tag": "Choosing Abstractions",
      "question": "A media engine must load codecs as separately compiled shared-library plugins from other vendors at runtime. Which abstraction mechanism fits best, and why?",
      "options": [
        "A C++20 concept: it constrains the codec types with zero runtime cost",
        "An NTTP policy template, so each codec is inlined into the engine",
        "An abstract base class behind a stable header: dynamic dispatch works across binary boundaries, whereas concepts and templates require the concrete types to be visible at the engine's compile time",
        "A std::variant listing all codec types, for value-semantic polymorphism"
      ],
      "answer": 2,
      "explain": "Concepts, templates, and variants all demand that the set of concrete types be known when the engine is compiled — impossible when vendors ship codecs later as shared libraries. Only dynamic polymorphism defers the binding to load time, and a data-free pure interface doubles as a reasonably stable ABI boundary. Choosing between static and dynamic abstraction is driven by when the set of implementations is closed."
    }
  ]
};

/* ===== C++ Software Design — External Polymorphism & Type Erasure ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["swd-typeerasure"] = {
  "title": "C++ Software Design — External Polymorphism & Type Erasure",
  "subtitle": "Manual vtables, owning vs non-owning erasure, SBO, and the type-erasure pattern end to end.",
  "crumb": "C++ Software Design",
  "questions": [
    {
      "type": "mcq",
      "tag": "Pattern origin",
      "question": "The External Polymorphism design pattern, on which Iglberger builds Type Erasure, was originally described by:",
      "options": [
        "Gamma, Helm, Johnson, and Vlissides in the GoF book Design Patterns",
        "Andrei Alexandrescu in Modern C++ Design",
        "Cleeland, Schmidt, and Harrison in a 1996 pattern paper",
        "Herb Sutter in the Exceptional C++ series"
      ],
      "answer": 2,
      "explain": "External Polymorphism is not a GoF pattern; it was published by Chris Cleeland, Douglas C. Schmidt, and Timothy H. Harrison. Iglberger presents it as one of the most underrated design patterns and as the key ingredient of Type Erasure. Sean Parent later popularized the value-semantics-based Type Erasure form in talks, but the underlying pattern predates that."
    },
    {
      "type": "mcq",
      "tag": "Intent",
      "question": "What is the intent of the External Polymorphism pattern?",
      "options": [
        "To speed up virtual dispatch by moving the vtable pointer outside the object",
        "To allow classes that are unrelated by inheritance and/or have no virtual functions to be treated polymorphically, from outside the types themselves",
        "To replace all runtime polymorphism with compile-time templates",
        "To let derived classes override behavior without declaring virtual functions in the base class"
      ],
      "answer": 1,
      "explain": "External Polymorphism extracts the polymorphic behavior out of the participating types: the types themselves stay free of base classes and virtual functions. An externalized inheritance hierarchy (Concept plus Model<T>) provides the polymorphism on their behalf. This makes even third-party types and built-in-style value types usable polymorphically."
    },
    {
      "type": "mcq",
      "tag": "Concept class",
      "question": "In the External Polymorphism pattern, what is the role of the Concept base class (e.g., ShapeConcept)?",
      "options": [
        "It declares, as a classic abstract base class, the set of requirements (operations) that the erased types must support -- it represents the external hierarchy's interface",
        "It stores the concrete object by value and forwards operations to it",
        "It is a C++20 concept used to constrain which types may be erased",
        "It provides default implementations of all operations so that Model<T> can stay empty"
      ],
      "answer": 0,
      "explain": "ShapeConcept is an ordinary abstract base class with pure virtual functions; it expresses the requirements on all erased types. Despite the name it is a runtime construct, not a C++20 language concept, although the two ideas are related in spirit. The concrete object lives in Model<T>, not in Concept."
    },
    {
      "type": "mcq",
      "tag": "Model template",
      "question": "What is the job of the Model<T> class template in the Concept/Model architecture?",
      "options": [
        "It defines the public interface of the wrapper class that users call",
        "It selects at compile time whether T needs virtual dispatch at all",
        "It stores type-erased function pointers for each operation of T",
        "It inherits from Concept, stores the concrete T, and implements the virtual functions by forwarding to T's operations (e.g., calling the free draw(obj))"
      ],
      "answer": 3,
      "explain": "Model<T> is the generic glue code: one instantiation per erased type. It overrides each pure virtual of Concept and forwards to the corresponding operation on the stored T, typically a free function found via ADL. The compiler generates all of these adapters for us, which is why Iglberger calls this part delightfully mechanical."
    },
    {
      "type": "mcq",
      "tag": "Non-intrusive",
      "question": "Why does Iglberger stress that External Polymorphism is non-intrusive, and why does that matter so much in practice?",
      "options": [
        "Because it avoids all heap allocations, which intrusive designs require",
        "Because virtual functions are deprecated in modern C++",
        "Because types you do not own (third-party or standard-library types) cannot be modified to inherit from your base class, yet External Polymorphism can still make them polymorphic",
        "Because it prevents users from ever creating derived classes"
      ],
      "answer": 2,
      "explain": "Intrusive designs require editing the type to add a base class, which is impossible for std::string, types from a vendor SDK, or any code you cannot change. External Polymorphism adds the polymorphic behavior entirely from the outside, so any type with the right operations can participate. That is a textbook application of the Open-Closed Principle."
    },
    {
      "type": "mcq",
      "tag": "Values not pointers",
      "question": "Which statement about External Polymorphism / Type Erasure and value types is correct, per the book?",
      "options": [
        "Erased types must still provide at least one virtual function themselves",
        "Simple value types (even something like an int or a plain struct) can participate in polymorphic behavior without inheriting from any base class",
        "Only classes with virtual destructors can be erased safely",
        "Erased types must be allocated on the heap by the user before wrapping"
      ],
      "answer": 1,
      "explain": "Because the hierarchy is external, the participating types remain plain values: no base class, no vptr, no forced heap allocation in user code. Circle stays a simple struct with a radius. The virtual machinery lives only inside the hidden Concept/Model hierarchy."
    },
    {
      "type": "mcq",
      "tag": "EP vs Adapter",
      "question": "How does the book distinguish External Polymorphism from the Adapter design pattern, which it superficially resembles?",
      "options": [
        "Adapter adapts a type to an existing interface it must fit into, while External Polymorphism creates a new external hierarchy for the purpose of treating unrelated types polymorphically",
        "Adapter only works with pointers, External Polymorphism only with references",
        "There is no difference; the book treats them as the same pattern",
        "Adapter is a runtime pattern while External Polymorphism is purely compile time"
      ],
      "answer": 0,
      "explain": "Model<T> does look like an object adapter: it wraps T and translates calls. The difference is intent: Adapter fits a type into an already existing interface, whereas External Polymorphism deliberately fabricates the abstraction (the Concept hierarchy) to endow a family of unrelated types with polymorphic behavior. Intent, not structure, is what distinguishes many patterns."
    },
    {
      "type": "mcq",
      "tag": "EP shortcoming",
      "question": "Plain External Polymorphism (without the Type Erasure wrapper) leaves users with which drawback that Type Erasure then fixes?",
      "options": [
        "Operations can no longer be added without recompiling all erased types",
        "It cannot support more than one operation per Concept",
        "Virtual dispatch becomes measurably slower than with an ordinary base class",
        "Users still deal in pointers to the Concept base class -- reference semantics, manual lifetime management, and explicit Model<T> instantiation"
      ],
      "answer": 3,
      "explain": "With External Polymorphism alone, calling code creates Model<Circle> objects and passes ShapeConcept pointers or references around, with all the usual lifetime pitfalls. Type Erasure wraps that machinery in a value-semantic class (Shape) whose constructor performs the erasure and whose copy operations clone the hidden model. That is why Iglberger describes Type Erasure as External Polymorphism plus Bridge plus Prototype."
    },
    {
      "type": "code",
      "tag": "Deep copy",
      "question": "This is the book's canonical owning Type Erasure design. What does the program print?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n    virtual std::unique_ptr<Concept> clone() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    std::unique_ptr<Concept> clone() const override { return std::make_unique<Model>(*this); }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  Shape(Shape const& other) : pimpl(other.pimpl->clone()) {}\n  Shape& operator=(Shape const& other) { pimpl = other.pimpl->clone(); return *this; }\n  Shape(Shape&&) noexcept = default;\n  Shape& operator=(Shape&&) noexcept = default;\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }\n};\n\nint main() {\n  Shape a{ Circle{1.0} };\n  Shape b = a;\n  a = Shape{ Circle{9.0} };\n  draw(a);\n  draw(b);\n}",
      "options": [
        "Circle 9.0, then Circle 1.0",
        "Circle 9.0, then Circle 9.0",
        "Circle 1.0, then Circle 1.0",
        "It does not compile: Shape holds a unique_ptr and cannot be copied"
      ],
      "answer": 0,
      "explain": "Shape b = a invokes the user-provided copy constructor, which calls clone() and deep-copies the Model<Circle>, so b owns an independent Circle{1.0}. Reassigning a to a new Shape does not affect b. This deep-copying copy constructor is exactly what gives the erased wrapper value semantics."
    },
    {
      "type": "mcq",
      "tag": "Compound pattern",
      "question": "Iglberger dissects Type Erasure into a compound of exactly three design patterns. Which three?",
      "options": [
        "Visitor, Strategy, and Bridge",
        "External Polymorphism, Bridge, and Prototype",
        "Adapter, Decorator, and Factory Method",
        "External Polymorphism, Singleton, and Template Method"
      ],
      "answer": 1,
      "explain": "External Polymorphism contributes the non-intrusive Concept/Model hierarchy; Bridge contributes the pimpl-style decoupling of the wrapper from the hidden implementation details; Prototype contributes clone() so the wrapper can be copied. Together they yield a value-semantics wrapper around non-intrusive runtime polymorphism."
    },
    {
      "type": "mcq",
      "tag": "Prototype's job",
      "question": "Within the Type Erasure compound, which responsibility is contributed by the Prototype pattern?",
      "options": [
        "Hiding the concrete type behind a void pointer",
        "Dispatching draw() calls through the vtable",
        "The virtual clone() function that lets the wrapper copy the concrete Model<T> it does not statically know",
        "Registering each erased type in a global prototype registry"
      ],
      "answer": 2,
      "explain": "The wrapper's copy constructor only has a Concept pointer; it cannot name the dynamic Model<T> type to copy it. clone() solves this: each Model<T> knows how to duplicate itself and returns a fresh copy through the base-class interface. That is precisely the Prototype pattern's abstract self-copy operation."
    },
    {
      "type": "mcq",
      "tag": "Bridge's job",
      "question": "Within the Type Erasure compound, what does the Bridge pattern contribute to the Shape wrapper?",
      "options": [
        "The pimpl-style unique_ptr<Concept> data member that decouples Shape's public interface from the hidden implementation details of the erased types",
        "The template constructor that deduces T",
        "The free draw() function found by ADL",
        "The ability to add new operations at runtime"
      ],
      "answer": 0,
      "explain": "Shape stores only a unique_ptr to the Concept base class -- a classic pimpl, which is itself a form of Bridge. Users of Shape depend neither on Model<T> nor on the concrete erased types, so those can change without recompiling client code. The bridge is what makes the wrapper a stable, dependency-free abstraction."
    },
    {
      "type": "code",
      "tag": "Allocation count",
      "question": "Global operator new is instrumented to count allocations. What sequence does the program print?",
      "code": "#include <cstdio>\n#include <cstdlib>\n#include <memory>\n#include <new>\n#include <utility>\n\nint allocs = 0;\nvoid* operator new(std::size_t n) { ++allocs; return std::malloc(n); }\nvoid operator delete(void* p) noexcept { std::free(p); }\nvoid operator delete(void* p, std::size_t) noexcept { std::free(p); }\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n    virtual std::unique_ptr<Concept> clone() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    std::unique_ptr<Concept> clone() const override { return std::make_unique<Model>(*this); }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  Shape(Shape const& other) : pimpl(other.pimpl->clone()) {}\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }\n};\n\nint main() {\n  Circle c{1.0};\n  std::printf(\"%d\\n\", allocs);\n  Shape s{ c };\n  std::printf(\"%d\\n\", allocs);\n  Shape t = s;\n  std::printf(\"%d\\n\", allocs);\n}",
      "options": [
        "0, 1, 1",
        "1, 2, 3",
        "0, 1, 2",
        "0, 2, 4"
      ],
      "answer": 2,
      "explain": "Creating the plain Circle allocates nothing (it is a stack value). Constructing Shape allocates once for the Model<Circle> via make_unique. Copying the Shape calls clone(), which performs one more make_unique. This is the setup cost of owning Type Erasure that Iglberger tells you to keep in mind: every construction and every copy pays an allocation."
    },
    {
      "type": "mcq",
      "tag": "Cost profile",
      "question": "According to the book, where are the dominant costs of a basic owning Type Erasure wrapper concentrated?",
      "options": [
        "In the destructor, which must run RTTI queries",
        "In every call, which costs an order of magnitude more than a virtual call",
        "Nowhere; type erasure is free compared to inheritance",
        "In setup: construction and copying pay a dynamic allocation plus a copy of the object, while an erased call costs about as much as an ordinary virtual call"
      ],
      "answer": 3,
      "explain": "Invoking draw() through the wrapper is one indirection through a vtable, comparable to any virtual call. The real price is paid when wrappers are created, copied, or assigned: each such operation allocates and copies the stored object. That is why the book has a dedicated guideline about the setup costs of owning wrappers, and why SBO and non-owning variants exist."
    },
    {
      "type": "code",
      "tag": "Owning copy",
      "question": "The Circle is modified after the Shape has been constructed from it. What does the program print?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n    virtual std::unique_ptr<Concept> clone() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    std::unique_ptr<Concept> clone() const override { return std::make_unique<Model>(*this); }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  Shape(Shape const& other) : pimpl(other.pimpl->clone()) {}\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }\n};\n\nint main() {\n  Circle c{1.0};\n  Shape s{ c };\n  c.r = 7.0;\n  draw(s);\n}",
      "options": [
        "Circle 7.0",
        "Circle 1.0",
        "Undefined behavior: s refers to a modified object",
        "It does not compile: Shape cannot be constructed from an lvalue"
      ],
      "answer": 1,
      "explain": "The owning wrapper stores its own copy of the Circle inside Model<Circle> (T obj is held by value). Later changes to the original c are invisible to s, so it still draws radius 1.0. Contrast this with a non-owning erased reference, which would observe the mutation."
    },
    {
      "type": "code",
      "tag": "Moved-from wrapper",
      "question": "Shape's move constructor is defaulted, so moving transfers the unique_ptr. What is the status of the final draw(a) call?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n    virtual std::unique_ptr<Concept> clone() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    std::unique_ptr<Concept> clone() const override { return std::make_unique<Model>(*this); }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  Shape(Shape const& other) : pimpl(other.pimpl->clone()) {}\n  Shape(Shape&&) noexcept = default;\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }\n};\n\nint main() {\n  Shape a{ Circle{1.0} };\n  Shape b{ std::move(a) };\n  draw(b);\n  draw(a);\n}",
      "options": [
        "It throws std::bad_function_call",
        "It prints Circle 1.0, because moving clones the model",
        "It is undefined behavior: a's pimpl is null after the move, and draw dereferences it",
        "It does not compile: draw cannot accept a moved-from object"
      ],
      "answer": 2,
      "explain": "The defaulted move constructor leaves a.pimpl empty (nullptr), and draw unconditionally calls s.pimpl->do_draw(), dereferencing a null pointer -- undefined behavior per the standard. A moved-from wrapper only supports operations with no preconditions, such as destruction or assignment. Implementations can guard against this, but the canonical minimal version does not."
    },
    {
      "type": "mcq",
      "tag": "Ctor constraint",
      "question": "Why should the wrapper's templated constructor (especially a forwarding-reference form like template<typename T> Shape(T&& x)) be constrained to exclude Shape itself?",
      "options": [
        "Because otherwise it can win overload resolution against the copy constructor (e.g., for non-const lvalue Shape arguments) and try to erase a Shape inside a Shape instead of copying it",
        "Because template constructors cannot coexist with copy constructors at all",
        "Because the compiler would otherwise generate one wrapper class per erased type",
        "Because unconstrained templates are ill-formed in C++20"
      ],
      "answer": 0,
      "explain": "A forwarding reference deduces T as Shape& for a non-const lvalue Shape and is then a better match than the copy constructor taking Shape const&. The wrapper would recursively wrap itself rather than copy. A requires clause such as (!std::same_as<std::decay_t<T>, Shape>) restores the intended behavior; the book's implementations apply exactly this kind of constraint."
    },
    {
      "type": "code",
      "tag": "Missing clone",
      "question": "This Type Erasure attempt omits clone() and any user-defined copy operations. What happens?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;   // no clone(), no user copy operations\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }\n};\n\nint main() {\n  Shape a{ Circle{1.0} };\n  Shape b = a;\n  draw(b);\n}",
      "options": [
        "It compiles, and b shares the Circle with a",
        "It does not compile: Shape's copy constructor is implicitly deleted because of the unique_ptr member, so 'Shape b = a' is rejected",
        "It compiles, and b holds an independent copy of the Circle",
        "It compiles but crashes at runtime with a double free"
      ],
      "answer": 1,
      "explain": "std::unique_ptr is move-only, so the implicitly declared copy constructor of Shape is defined as deleted. Without the Prototype part (clone() plus a user-provided copy constructor), the wrapper cannot be a value type. Clang reports a call to an implicitly-deleted copy constructor. This shows why Prototype is a non-optional ingredient of owning Type Erasure."
    },
    {
      "type": "code",
      "tag": "Abstract Model",
      "question": "The author forgot to override clone() in Model. What is the result?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nstruct Concept {\n  virtual ~Concept() = default;\n  virtual void do_draw() const = 0;\n  virtual std::unique_ptr<Concept> clone() const = 0;\n};\ntemplate<typename T>\nstruct Model : Concept {\n  explicit Model(T t) : obj(std::move(t)) {}\n  void do_draw() const override { draw(obj); }\n  // no clone() override\n  T obj;\n};\n\nint main() {\n  std::unique_ptr<Concept> p = std::make_unique<Model<Circle>>(Circle{1.0});\n  p->do_draw();\n}",
      "options": [
        "It compiles; clone() is only needed when copying",
        "It compiles but p->do_draw() dispatches to the wrong function",
        "Undefined behavior at runtime when clone() is called",
        "It does not compile: Model<Circle> is abstract (clone() is still pure virtual), so make_unique cannot instantiate it"
      ],
      "answer": 3,
      "explain": "A class that leaves any inherited pure virtual function unoverridden remains abstract, and abstract classes cannot be instantiated. The error fires at the make_unique call, at compile time, even though no one ever calls clone(). The Concept's requirement list is enforced wholesale on every Model<T> instantiation."
    },
    {
      "type": "code",
      "tag": "Non-virtual dtor",
      "question": "Concept's destructor is deliberately not virtual. What is the status of this program when p is destroyed?",
      "code": "#include <cstdio>\n#include <memory>\n#include <string>\n#include <utility>\n\nstruct Concept {\n  virtual void do_draw() const = 0;\n  ~Concept() = default;   // note: NOT virtual\n};\ntemplate<typename T>\nstruct Model : Concept {\n  explicit Model(T t) : obj(std::move(t)) {}\n  void do_draw() const override { std::puts(\"draw\"); }\n  T obj;\n};\n\nint main() {\n  std::unique_ptr<Concept> p =\n      std::make_unique<Model<std::string>>(std::string(100, 'x'));\n  p->do_draw();\n}   // p is destroyed here",
      "options": [
        "Well-defined: unique_ptr remembers the concrete type it was created with",
        "Well-defined, but the std::string member leaks",
        "Undefined behavior: deleting a Model<std::string> through a Concept pointer whose destructor is non-virtual is UB per the standard",
        "It does not compile: unique_ptr<Concept> requires a virtual destructor"
      ],
      "answer": 2,
      "explain": "Per [expr.delete], deleting an object through a pointer to a base class is undefined behavior unless the base's destructor is virtual. unique_ptr<Concept>'s default deleter does exactly that delete. In practice the derived destructor may be skipped and the string may leak, but the standard makes no promise at all. This is why every Concept in the book declares virtual ~Concept() = default."
    },
    {
      "type": "mcq",
      "tag": "Why virtual dtor",
      "question": "Why must the Concept base class in an owning Type Erasure implementation declare a virtual destructor?",
      "options": [
        "To enable dynamic_cast from Concept to Model<T>",
        "Because the wrapper destroys the Model<T> through a Concept pointer, and only a virtual destructor makes that deletion well-defined and runs ~Model<T>",
        "Because pure virtual functions require a virtual destructor to link",
        "It is optional; unique_ptr's deleter handles polymorphic deletion automatically"
      ],
      "answer": 1,
      "explain": "The wrapper's unique_ptr<Concept> deletes through the base-class pointer. Without a virtual destructor that is undefined behavior, and the concrete Model<T>'s destructor (and its T member's destructor) would not reliably run. The default deleter does not perform any dynamic-type magic; the virtual destructor is what routes destruction correctly."
    },
    {
      "type": "code",
      "tag": "Self-assignment",
      "question": "The copy-assignment operator clones first and then replaces pimpl. What does the program print after the aliased self-assignment?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n    virtual std::unique_ptr<Concept> clone() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    std::unique_ptr<Concept> clone() const override { return std::make_unique<Model>(*this); }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  Shape(Shape const& other) : pimpl(other.pimpl->clone()) {}\n  Shape& operator=(Shape const& other) {\n    pimpl = other.pimpl->clone();\n    return *this;\n  }\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }\n};\n\nint main() {\n  Shape a{ Circle{2.5} };\n  Shape& alias = a;\n  a = alias;          // self-assignment\n  draw(a);\n}",
      "options": [
        "Undefined behavior: pimpl is destroyed before the clone happens",
        "Nothing; the self-assignment is detected and skipped, and draw is never reached",
        "It does not compile: assignment from an alias is ambiguous",
        "Circle 2.5 -- the clone is taken from other.pimpl before the old model is released, so self-assignment is safe"
      ],
      "answer": 3,
      "explain": "In pimpl = other.pimpl->clone(), the right-hand side is fully evaluated first: a new Model<Circle> copy is created while the original is still alive. Only then does unique_ptr's move-assignment destroy the old model. The order of evaluation makes this implementation safe even when other is *this, with no explicit self-check needed."
    },
    {
      "type": "mcq",
      "tag": "Copy-and-swap",
      "question": "Some Type Erasure implementations declare a single assignment operator: Shape& operator=(Shape other) taking the parameter by value and swapping. What does this buy?",
      "options": [
        "It avoids the clone() call entirely, even for copies",
        "It makes assignment noexcept in all cases",
        "One operator serves as both copy and move assignment, is self-assignment safe, and provides the strong exception guarantee, at the cost of always constructing a temporary",
        "It prevents the wrapper from ever being empty"
      ],
      "answer": 2,
      "explain": "The by-value parameter is copy-constructed from lvalue arguments (paying the clone) and move-constructed from rvalues, so one function covers both assignments. All potentially throwing work happens while building the parameter, before the swap touches *this, giving the strong guarantee. The trade-off is that even a self-assignment or a copy assignment into a rich target pays a full temporary."
    },
    {
      "type": "code",
      "tag": "Hidden friend lookup",
      "question": "draw is a hidden friend of lib::Shape. Which call fails to compile, and why?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n\nnamespace lib {\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }  // hidden friend\n};\n}\n\nint main() {\n  lib::Shape s{ lib::Circle{1.0} };\n  draw(s);        // (1)\n  lib::draw(s);   // (2)\n}",
      "options": [
        "Both calls compile; (2) is just more explicit",
        "Call (1): unqualified lookup cannot see a friend defined inside a class",
        "Both calls fail; hidden friends can only be invoked from member functions",
        "Call (2): qualified lookup does not find hidden friends, so lib::draw only finds draw(Circle const&), which cannot accept a Shape"
      ],
      "answer": 3,
      "explain": "A friend function defined inside a class is a 'hidden friend': it is not visible to ordinary qualified or unqualified lookup and is found only by argument-dependent lookup. Call (1) succeeds because ADL inspects Shape's class scope. Call (2) performs qualified lookup in namespace lib, finds only the Circle overload, and fails with a no-viable-conversion error."
    },
    {
      "type": "mcq",
      "tag": "Hidden friend why",
      "question": "Why do Type Erasure implementations commonly define the erased operations (like draw) as hidden friends of the wrapper?",
      "options": [
        "They are found only via ADL on the wrapper type, keeping the enclosing namespace clean and shrinking the overload set considered for unrelated calls, while still reading like a free function",
        "Hidden friends compile to faster calls than namespace-scope functions",
        "Only friends may access the pimpl pointer; a member function could not",
        "Hidden friends are required for the wrapper to satisfy C++20 concepts"
      ],
      "answer": 0,
      "explain": "A hidden friend is invisible except to ADL with the wrapper in the argument list, so it never pollutes the namespace or interferes with other overloads named draw. It still gives the free-function call syntax that mirrors the erased duck-typed interface. Access to private members is a side benefit -- a namespace-scope friend would also have that -- but lookup hygiene is the design reason."
    },
    {
      "type": "code",
      "tag": "Erasure-time binding",
      "question": "speak is overloaded for Animal and Dog. What does the program print?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n\nstruct Animal { };\nstruct Dog : Animal { };\nvoid speak(Animal const&) { std::puts(\"generic\"); }\nvoid speak(Dog const&)    { std::puts(\"woof\"); }\n\nclass Pet {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_speak() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_speak() const override { speak(obj); }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Pet(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  friend void speak(Pet const& p) { p.pimpl->do_speak(); }\n};\n\nint main() {\n  Dog d;\n  Pet p1{ d };\n  speak(p1);\n  Animal& ref = d;\n  Pet p2{ ref };\n  speak(p2);\n}",
      "options": [
        "woof, then woof",
        "woof, then generic",
        "generic, then generic",
        "It does not compile: Pet cannot be constructed from a reference"
      ],
      "answer": 1,
      "explain": "For p1, T deduces as Dog and Model<Dog>::do_speak calls speak(Dog const&). For p2, deduction from an Animal& yields T = Animal: the Dog is copy-sliced into an Animal member and the generic overload is baked in at instantiation time. Type Erasure captures the static type seen by the constructor -- it performs no dynamic re-dispatch on the erased object's original dynamic type."
    },
    {
      "type": "mcq",
      "tag": "Duck typing",
      "question": "When is the requirement 'draw(obj) must be a valid call for the erased type T' actually checked in the canonical implementation?",
      "options": [
        "At runtime, on the first call through the wrapper, throwing on failure",
        "Never; unsupported operations silently do nothing",
        "At compile time, when Model<T> is instantiated by the wrapper's templated constructor (and a C++20 concept on that constructor can surface the error even earlier and more clearly)",
        "At link time, when the vtable for Model<T> is emitted"
      ],
      "answer": 2,
      "explain": "Type Erasure is compile-time duck typing: instantiating Model<T> instantiates its do_draw override, and if draw(obj) does not resolve, compilation fails. There is no runtime discovery as in dynamically typed languages. Constraining the wrapper's constructor with a concept moves the diagnostic to the call site with a far better message."
    },
    {
      "type": "code",
      "tag": "Vector growth",
      "question": "clone() increments a global counter. Shape's move operations are defaulted and noexcept. After three push_backs (with reallocations), what does the program print?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n#include <vector>\n\nint clones = 0;\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n    virtual std::unique_ptr<Concept> clone() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    std::unique_ptr<Concept> clone() const override {\n      ++clones;\n      return std::make_unique<Model>(*this);\n    }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  Shape(Shape const& other) : pimpl(other.pimpl->clone()) {}\n  Shape(Shape&&) noexcept = default;\n  Shape& operator=(Shape&&) noexcept = default;\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }\n};\n\nint main() {\n  std::vector<Shape> v;\n  v.push_back(Shape{ Circle{1.0} });\n  v.push_back(Shape{ Circle{2.0} });\n  v.push_back(Shape{ Circle{3.0} });\n  std::printf(\"clones %d\\n\", clones);\n}",
      "options": [
        "clones 0",
        "clones 2",
        "clones 3",
        "clones 6"
      ],
      "answer": 0,
      "explain": "The push_back arguments are rvalue temporaries, so they are moved into the vector. On reallocation, vector uses move_if_noexcept; since Shape's move constructor is noexcept, elements are moved, not copied. No clone() is ever called -- a key reason the book insists erased wrappers should have cheap noexcept moves."
    },
    {
      "type": "code",
      "tag": "Vector copy",
      "question": "clone() increments a global counter and Shape's move operations are defaulted and noexcept. Two elements are pushed into the vector, which is then copied wholesale. What does the program print?",
      "code": "#include <cstdio>\n#include <memory>\n#include <utility>\n#include <vector>\n\nint clones = 0;\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n    virtual std::unique_ptr<Concept> clone() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    std::unique_ptr<Concept> clone() const override {\n      ++clones;\n      return std::make_unique<Model>(*this);\n    }\n    T obj;\n  };\n  std::unique_ptr<Concept> pimpl;\npublic:\n  template<typename T>\n  Shape(T t) : pimpl(std::make_unique<Model<T>>(std::move(t))) {}\n  Shape(Shape const& other) : pimpl(other.pimpl->clone()) {}\n  Shape(Shape&&) noexcept = default;\n  Shape& operator=(Shape&&) noexcept = default;\n  friend void draw(Shape const& s) { s.pimpl->do_draw(); }\n};\n\nint main() {\n  std::vector<Shape> v;\n  v.push_back(Shape{ Circle{1.0} });\n  v.push_back(Shape{ Circle{2.0} });\n  auto w = v;\n  std::printf(\"clones %d\\n\", clones);\n}",
      "options": [
        "clones 0: vectors share their buffers on copy",
        "clones 4: each element is cloned during push_back and again during the copy",
        "It does not compile: vector requires assignable elements",
        "clones 2: copying the vector copy-constructs each Shape, and each copy performs one clone"
      ],
      "answer": 3,
      "explain": "The two push_backs move rvalue temporaries, costing no clones. auto w = v then copy-constructs every element, and each Shape copy calls clone() exactly once, so the counter reads 2. Deep-copying containers of erased values is where the Prototype-based copy cost shows up in real programs."
    },
    {
      "type": "mcq",
      "tag": "Value semantics",
      "question": "Which property is essential to Iglberger's claim that the Type Erasure wrapper is a true value type, even though it uses virtual dispatch internally?",
      "options": [
        "It caches the result of draw() so repeated calls are pure",
        "It forbids storing types with mutable state",
        "It exposes the Concept pointer so users can share the model",
        "Copying the wrapper deep-copies the stored object via clone(), two Shapes never share mutable state, and no pointers or lifetimes leak into the user-facing API"
      ],
      "answer": 3,
      "explain": "Value semantics means copies are independent and the type behaves like an int: copyable, assignable, destructible with no aliasing surprises. The clone-based copy constructor guarantees independence, while the pimpl hides every pointer from the interface. Users get reference-free code with the flexibility of runtime polymorphism -- the central promise of the chapter."
    },
    {
      "type": "mcq",
      "tag": "Non-owning layout",
      "question": "In the book's sketch of a non-owning Type Erasure wrapper (an erased reference), what does the wrapper typically store?",
      "options": [
        "A shared_ptr to a heap-allocated Model<T>",
        "A void pointer to the referenced object plus a function pointer (or a pointer to a static table of function pointers) that knows how to operate on it",
        "A copy of the object in an internal small buffer",
        "A std::any holding the object and a std::function per operation"
      ],
      "answer": 1,
      "explain": "The non-owning form drops the allocation and the ownership: it keeps just the object's address as void* and, per operation, a function pointer instantiated from a template that casts back to T. Copying such a view is trivial (a couple of pointers). The price is that it references, not owns -- all lifetime responsibility stays with the caller."
    },
    {
      "type": "code",
      "tag": "View dispatch",
      "question": "ShapeView erases via void* plus a captureless-lambda function pointer. What does the program print?",
      "code": "#include <cstdio>\n\nstruct Circle { double r; };\nstruct Square { double s; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\nvoid draw(Square const& s) { std::printf(\"Square %.1f\\n\", s.s); }\n\nclass ShapeView {\n  void const* obj;\n  void (*fn)(void const*);\npublic:\n  template<typename T>\n  ShapeView(T const& t)\n    : obj(&t)\n    , fn(+[](void const* p) { draw(*static_cast<T const*>(p)); }) {}\n  friend void draw(ShapeView v) { v.fn(v.obj); }\n};\n\nint main() {\n  Circle c{2.0};\n  Square s{3.0};\n  ShapeView v = c;\n  draw(v);\n  v = ShapeView{s};\n  draw(v);\n}",
      "options": [
        "Circle 2.0, then Square 3.0",
        "Circle 2.0, then Circle 2.0",
        "It does not compile: a lambda cannot be converted to a function pointer",
        "Square 3.0, then Square 3.0"
      ],
      "answer": 0,
      "explain": "Each constructor instantiation bakes T into a captureless lambda, which converts to a plain function pointer that casts the void* back to T and calls the right draw overload. Reassigning v rebinds both the object pointer and the function pointer, so the Square overload runs second. This is virtual dispatch rebuilt manually from two pointers."
    },
    {
      "type": "code",
      "tag": "View aliasing",
      "question": "The Circle is modified after the ShapeView is created. What does the program print?",
      "code": "#include <cstdio>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass ShapeView {\n  void const* obj;\n  void (*fn)(void const*);\npublic:\n  template<typename T>\n  ShapeView(T const& t)\n    : obj(&t)\n    , fn(+[](void const* p) { draw(*static_cast<T const*>(p)); }) {}\n  friend void draw(ShapeView v) { v.fn(v.obj); }\n};\n\nint main() {\n  Circle c{1.0};\n  ShapeView v = c;\n  c.r = 7.0;\n  draw(v);\n}",
      "options": [
        "Circle 1.0",
        "Undefined behavior: the view was invalidated by the write",
        "Circle 7.0",
        "It does not compile: views require const objects"
      ],
      "answer": 2,
      "explain": "The view stores only the address of c, so it observes the later mutation and prints 7.0. This is the defining semantic difference from the owning wrapper, which copies at construction and would print 1.0. Reference semantics can be exactly what you want for a function parameter -- and exactly wrong for stored state."
    },
    {
      "type": "code",
      "tag": "Dangling temporary",
      "question": "A ShapeView is bound to a temporary Circle on its own statement line. What is the status of draw(v)?",
      "code": "#include <cstdio>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass ShapeView {\n  void const* obj;\n  void (*fn)(void const*);\npublic:\n  template<typename T>\n  ShapeView(T const& t)\n    : obj(&t)\n    , fn(+[](void const* p) { draw(*static_cast<T const*>(p)); }) {}\n  friend void draw(ShapeView v) { v.fn(v.obj); }\n};\n\nint main() {\n  ShapeView v = Circle{2.0};\n  draw(v);\n}",
      "options": [
        "Well-defined: the view extends the temporary's lifetime like a const reference would",
        "Well-defined: the lambda captured the Circle by value",
        "It does not compile: binding a temporary to T const& in the constructor is ill-formed",
        "Undefined behavior: the temporary is destroyed at the end of the declaration's full-expression, so the view dangles"
      ],
      "answer": 3,
      "explain": "Lifetime extension applies only when a temporary binds directly to a reference variable; storing its address inside a constructed object grants no extension. After the semicolon the Circle is gone and the view holds a dangling pointer, so the call is undefined behavior. This is the central danger the book flags for non-owning erased references."
    },
    {
      "type": "code",
      "tag": "Temporary argument",
      "question": "Here the temporary Circle is passed directly to a function taking a ShapeView parameter. What happens?",
      "code": "#include <cstdio>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass ShapeView {\n  void const* obj;\n  void (*fn)(void const*);\npublic:\n  template<typename T>\n  ShapeView(T const& t)\n    : obj(&t)\n    , fn(+[](void const* p) { draw(*static_cast<T const*>(p)); }) {}\n  friend void draw(ShapeView v) { v.fn(v.obj); }\n};\n\nvoid render(ShapeView v) { draw(v); }\n\nint main() {\n  render(Circle{2.0});\n}",
      "options": [
        "Well-defined; it prints Circle 2.0, because the temporary lives until the end of the full-expression that includes the render call",
        "Undefined behavior, exactly like storing the view in a local variable",
        "It does not compile: rvalues cannot bind to T const&",
        "It prints an indeterminate value"
      ],
      "answer": 0,
      "explain": "Temporaries are destroyed at the end of the enclosing full-expression, and render(Circle{2.0}) completes -- including the draw call -- before that point. So a non-owning erased wrapper is perfectly safe as a pure function parameter. The book recommends exactly this use, in analogy to std::string_view."
    },
    {
      "type": "code",
      "tag": "Stored views",
      "question": "Views into loop-local Circles are stored in a vector and used after the loop. What is the status of the final loop?",
      "code": "#include <cstdio>\n#include <vector>\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass ShapeView {\n  void const* obj;\n  void (*fn)(void const*);\npublic:\n  template<typename T>\n  ShapeView(T const& t)\n    : obj(&t)\n    , fn(+[](void const* p) { draw(*static_cast<T const*>(p)); }) {}\n  friend void draw(ShapeView v) { v.fn(v.obj); }\n};\n\nint main() {\n  std::vector<ShapeView> views;\n  for (double r : {1.0, 2.0}) {\n    Circle c{r};\n    views.push_back(c);\n  }\n  for (auto v : views) draw(v);\n}",
      "options": [
        "Well-defined: push_back copies the Circle into the vector",
        "Undefined behavior: each view points to a loop-local Circle that was destroyed at the end of its iteration",
        "Well-defined: it prints Circle 1.0 and Circle 2.0",
        "It does not compile: ShapeView is not copyable"
      ],
      "answer": 1,
      "explain": "ShapeView stores only the address of the Circle; push_back copies the view (two pointers), not the shape. Each Circle dies at the end of its loop iteration, so every stored view dangles and draw(v) is undefined behavior. Non-owning erasure must never outlive the referenced objects -- if you need to store, you need the owning wrapper."
    },
    {
      "type": "mcq",
      "tag": "Views for parameters",
      "question": "For which situation does the book suggest a non-owning erased wrapper is the right tool, and why?",
      "options": [
        "As the element type of long-lived containers, because copies are cheap",
        "As class data members, to avoid include dependencies",
        "As function parameters, because setup cost is essentially zero (no allocation, no copy) and the referenced object reliably outlives the call",
        "As return values from factory functions"
      ],
      "answer": 2,
      "explain": "A parameter's argument almost always outlives the function call, so reference semantics are safe there, and the wrapper costs only two pointers to set up. Storing such views in members or containers invites dangling references. This mirrors the accepted guidance for std::string_view and the proposed function_ref."
    },
    {
      "type": "mcq",
      "tag": "Analogy",
      "question": "Which standard-library analogy best captures the relationship between a non-owning erased wrapper and the owning Type Erasure wrapper?",
      "options": [
        "std::vector is to std::array",
        "std::string_view is to std::string",
        "std::weak_ptr is to std::unique_ptr",
        "std::span is to std::any"
      ],
      "answer": 1,
      "explain": "string_view references character data it does not own and is cheap to create and copy, while string owns and manages its data; the same split holds between an erased reference and the owning wrapper. The analogy extends to the dangers: both view types dangle if kept beyond the owner's lifetime. weak_ptr is a poor fit because it can detect expiry -- a raw erased view cannot."
    },
    {
      "type": "mcq",
      "tag": "View limitations",
      "question": "Which capability does a non-owning erased wrapper fundamentally give up compared to the owning wrapper?",
      "options": [
        "Calling operations with the free-function syntax",
        "Supporting more than one erased operation",
        "Working with third-party types",
        "Independent value-semantic copies: copying the view duplicates the reference, never the referenced object, and the wrapper cannot manage or extend the object's lifetime"
      ],
      "answer": 3,
      "explain": "With no ownership there is no clone: copying a view yields another alias of the same object, and destruction of the view does nothing for the object. That makes the view unable to guarantee validity beyond the referenced object's lifetime. Everything else -- multiple operations, ADL syntax, third-party types -- works the same as in the owning form."
    },
    {
      "type": "code",
      "tag": "Manual vtable",
      "question": "This non-owning design replaces the virtual Concept hierarchy with a struct of function pointers. What does the program print?",
      "code": "#include <cstdio>\n\nstruct Circle { double r; };\nstruct Square { double s; };\nvoid draw(Circle const& c) { std::printf(\"C%.0f\\n\", c.r); }\nvoid draw(Square const& s) { std::printf(\"S%.0f\\n\", s.s); }\n\nstruct VTable {\n  void (*draw)(void const*);\n};\n\ntemplate<typename T>\nconstexpr VTable vtable{\n  [](void const* p) { draw(*static_cast<T const*>(p)); }\n};\n\nstruct ShapeRef {\n  void const* obj;\n  VTable const* vt;\n  template<typename T>\n  ShapeRef(T const& t) : obj(&t), vt(&vtable<T>) {}\n};\nvoid draw(ShapeRef r) { r.vt->draw(r.obj); }\n\nint main() {\n  Circle c{4};\n  Square s{5};\n  ShapeRef shapes[]{ c, s };\n  for (auto r : shapes) draw(r);\n}",
      "options": [
        "C4, then S5",
        "C4, then C5",
        "It does not compile: a lambda cannot initialize a constexpr function pointer",
        "S5, then C4"
      ],
      "answer": 0,
      "explain": "The variable template vtable<T> produces one static VTable per erased type, its draw slot filled by a captureless lambda that casts the void* back to T. Each ShapeRef stores the object's address and a pointer to its type's table, so dispatch selects the right overload: C4 then S5. This is exactly a hand-rolled vtable -- the compiler-generated mechanism rebuilt with plain function pointers."
    },
    {
      "type": "mcq",
      "tag": "Manual dispatch idea",
      "question": "In the optimization discussion of Type Erasure, what does 'manual implementation of virtual dispatch' mean?",
      "options": [
        "Replacing the virtual functions of the Concept/Model hierarchy with explicit function pointers (individually stored, or grouped in a static vtable-like struct per erased type)",
        "Writing the assembly for the call by hand",
        "Using switch statements over an enum of known types",
        "Calling the member functions through pointers-to-member instead of virtuals"
      ],
      "answer": 0,
      "explain": "The book shows that the compiler's virtual dispatch can be reproduced manually: for each operation store a function pointer that a template instantiation fills with the T-specific behavior. This removes the Concept/Model classes entirely and gives the implementer control over the dispatch layout. A switch over an enum is the closed-set Visitor/variant alternative, not manual virtual dispatch."
    },
    {
      "type": "code",
      "tag": "Fn-pointer clone",
      "question": "An owning erased type built purely from function pointers, including clone and destroy slots. What does the program print?",
      "code": "#include <cstdio>\n#include <utility>\n\nstruct Widget { int id; };\nvoid print(Widget const& w) { std::printf(\"Widget %d\\n\", w.id); }\nvoid bump(Widget& w) { ++w.id; }\n\nclass Erased {\n  struct VTable {\n    void (*print)(void const*);\n    void (*bump)(void*);\n    void* (*clone)(void const*);\n    void (*destroy)(void*);\n  };\n  template<typename T>\n  static constexpr VTable table{\n    [](void const* p) { print(*static_cast<T const*>(p)); },\n    [](void* p) { bump(*static_cast<T*>(p)); },\n    [](void const* p) -> void* { return new T(*static_cast<T const*>(p)); },\n    [](void* p) { delete static_cast<T*>(p); }\n  };\n  void* obj;\n  VTable const* vt;\npublic:\n  template<typename T>\n  Erased(T t) : obj(new T(std::move(t))), vt(&table<T>) {}\n  Erased(Erased const& o) : obj(o.vt->clone(o.obj)), vt(o.vt) {}\n  Erased& operator=(Erased const&) = delete;\n  ~Erased() { vt->destroy(obj); }\n  friend void print(Erased const& e) { e.vt->print(e.obj); }\n  friend void bump(Erased& e) { e.vt->bump(e.obj); }\n};\n\nint main() {\n  Erased a{ Widget{1} };\n  Erased b = a;\n  bump(a);\n  print(a);\n  print(b);\n}",
      "options": [
        "Widget 2, then Widget 2",
        "Widget 1, then Widget 1",
        "Widget 2, then Widget 1",
        "Undefined behavior: two Erased objects delete the same Widget"
      ],
      "answer": 2,
      "explain": "The copy constructor calls the clone slot, which heap-allocates an independent Widget copy, so bump(a) only increments a's Widget. Each object's destroy slot deletes its own allocation -- no double free. The program demonstrates that full value semantics (Prototype included) survive the switch from virtual functions to a static table of function pointers."
    },
    {
      "type": "mcq",
      "tag": "Vtable layout",
      "question": "When manually implementing dispatch, you can store each function pointer directly inside the wrapper or store one pointer to a static per-type table. What is the essential trade-off?",
      "options": [
        "Inline pointers cannot support clone(); a table can",
        "Inline function pointers enlarge every wrapper object (one slot per operation) but need one less indirection per call; a table pointer keeps the object small (one pointer) but each call goes through the extra table hop, like a classic vptr",
        "The table variant is not thread-safe",
        "There is no difference in either size or speed"
      ],
      "answer": 1,
      "explain": "This is a size-versus-indirection trade, and the book discusses both layouts. With many operations, inline slots bloat each object and copying it; with one static table per type you pay a vptr-like double indirection. Which is faster depends on operation count, object count, and cache behavior -- another reason to measure rather than assume."
    },
    {
      "type": "mcq",
      "tag": "Performance claims",
      "question": "What is the book's bottom line on the performance benchmarks of SBO and manual-dispatch Type Erasure implementations?",
      "options": [
        "Manual dispatch is always exactly as fast as virtual dispatch",
        "Optimizations are pointless because the allocator dominates every workload",
        "Type Erasure is inherently slower than a classic inheritance hierarchy and cannot be optimized",
        "The optimized implementations showed substantial speedups in the book's benchmarks, but results vary across compilers and workloads, so you must measure -- performance numbers are grains of salt, not guarantees"
      ],
      "answer": 3,
      "explain": "Iglberger reports clear wins for SBO and manual dispatch variants in his benchmark, in part because Type Erasure gives you an implementation you fully control and can tune. He repeatedly cautions that the exact numbers depend on compiler, standard library, and hardware. The durable lesson is the optimization potential and the habit of benchmarking, not any specific ratio."
    },
    {
      "type": "mcq",
      "tag": "SBO purpose",
      "question": "What problem does the small buffer optimization (SBO) address in an owning Type Erasure wrapper?",
      "options": [
        "Every construction and copy of the basic wrapper pays a dynamic memory allocation; SBO stores small Model<T> objects in-place inside the wrapper, eliminating the allocation and improving locality",
        "Virtual calls are too slow, so SBO caches the last dispatch target",
        "It compresses large objects to fit into the wrapper",
        "It makes the wrapper trivially copyable"
      ],
      "answer": 0,
      "explain": "The dominant setup cost of owning erasure is the heap allocation per wrapper. With SBO the wrapper embeds a suitably sized and aligned raw buffer and placement-news the Model<T> into it when it fits. Besides skipping the allocator, in-place storage keeps the object next to the wrapper, which helps caches; std::function and std::any implementations do the same."
    },
    {
      "type": "code",
      "tag": "SBO in action",
      "question": "This wrapper stores Model<T> in an internal 64-byte buffer via placement new, and global operator new counts allocations. What does the program print?",
      "code": "#include <cstdio>\n#include <cstdlib>\n#include <new>\n#include <utility>\n\nint allocs = 0;\nvoid* operator new(std::size_t n) { ++allocs; return std::malloc(n); }\nvoid operator delete(void* p) noexcept { std::free(p); }\nvoid operator delete(void* p, std::size_t) noexcept { std::free(p); }\n\nstruct Circle { double r; };\nvoid draw(Circle const& c) { std::printf(\"Circle %.1f\\n\", c.r); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n    virtual void clone_into(void* buf) const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    void clone_into(void* buf) const override { ::new (buf) Model(*this); }\n    T obj;\n  };\n  alignas(std::max_align_t) unsigned char buffer[64];\n  Concept const* get() const { return reinterpret_cast<Concept const*>(buffer); }\n  Concept* get() { return reinterpret_cast<Concept*>(buffer); }\npublic:\n  template<typename T>\n  Shape(T t) {\n    static_assert(sizeof(Model<T>) <= sizeof(buffer));\n    ::new (buffer) Model<T>(std::move(t));\n  }\n  Shape(Shape const& o) { o.get()->clone_into(buffer); }\n  Shape& operator=(Shape const&) = delete;\n  ~Shape() { get()->~Concept(); }\n  friend void draw(Shape const& s) { s.get()->do_draw(); }\n};\n\nint main() {\n  Shape a{ Circle{1.5} };\n  Shape b = a;\n  draw(b);\n  std::printf(\"allocs %d\\n\", allocs);\n}",
      "options": [
        "Circle 1.5, then allocs 2",
        "Circle 1.5, then allocs 1",
        "Circle 1.5, then allocs 0",
        "It does not compile: placement new cannot construct into an unsigned char array"
      ],
      "answer": 2,
      "explain": "Model<Circle> (a vptr plus a double) fits easily into the 64-byte buffer, so construction placement-news in place, and the copy constructor's clone_into does the same into the destination's buffer. Placement new does not call the replaced allocating operator new, so the counter stays at 0. Both wrapper objects live entirely on the stack."
    },
    {
      "type": "code",
      "tag": "SBO capacity",
      "question": "The buffer is 32 bytes and the constructor static_asserts that Model<T> fits. What happens?",
      "code": "#include <cstdio>\n#include <new>\n#include <utility>\n\nstruct Circle { double r; };\nstruct Big { double pts[16]; };\nvoid draw(Circle const&) { std::puts(\"circle\"); }\nvoid draw(Big const&) { std::puts(\"big\"); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void do_draw() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T t) : obj(std::move(t)) {}\n    void do_draw() const override { draw(obj); }\n    T obj;\n  };\n  alignas(8) unsigned char buffer[32];\npublic:\n  template<typename T>\n  Shape(T t) {\n    static_assert(sizeof(Model<T>) <= sizeof(buffer),\n                  \"Model does not fit into the SBO buffer\");\n    ::new (buffer) Model<T>(std::move(t));\n  }\n  ~Shape() { reinterpret_cast<Concept*>(buffer)->~Concept(); }\n  friend void draw(Shape const& s) {\n    reinterpret_cast<Concept const*>(s.buffer)->do_draw();\n  }\n};\n\nint main() {\n  Shape a{ Circle{1.0} };   // (1)\n  Shape b{ Big{} };         // (2)\n  draw(a);\n  draw(b);\n}",
      "options": [
        "Both lines compile; Big is silently heap-allocated instead",
        "Line (2) fails to compile: the static_assert fires because Model<Big> (vptr plus 128 bytes of data) exceeds the 32-byte buffer",
        "Both lines compile, but line (2) has undefined behavior at runtime",
        "Line (1) fails to compile: Circle is too small for the buffer"
      ],
      "answer": 1,
      "explain": "sizeof(Model<Big>) is about 136 bytes, so the compile-time size check rejects the instantiation with the 'Model does not fit into the SBO buffer' message, while Model<Circle> at 16 bytes passes. A pure in-place implementation simply refuses oversized types at compile time. Production designs (like std::function) instead fall back to heap allocation when the buffer is too small."
    },
    {
      "type": "code",
      "tag": "SBO move",
      "question": "Tracker prints its copy/move operations, and this SBO wrapper implements move via a virtual move_into. What is printed after the \"--\" line?",
      "code": "#include <cstdio>\n#include <new>\n#include <type_traits>\n#include <utility>\n\nstruct Tracker {\n  Tracker() = default;\n  Tracker(Tracker const&) { std::puts(\"copy\"); }\n  Tracker(Tracker&&) noexcept { std::puts(\"move\"); }\n};\nvoid draw(Tracker const&) { std::puts(\"draw\"); }\n\nclass Shape {\n  struct Concept {\n    virtual ~Concept() = default;\n    virtual void move_into(void* buf) = 0;\n    virtual void do_draw() const = 0;\n  };\n  template<typename T>\n  struct Model final : Concept {\n    explicit Model(T&& t) : obj(std::move(t)) {}\n    Model(Model&& o) noexcept : obj(std::move(o.obj)) {}\n    void move_into(void* buf) override { ::new (buf) Model(std::move(*this)); }\n    void do_draw() const override { draw(obj); }\n    T obj;\n  };\n  alignas(8) unsigned char buf[64];\n  Concept* get() { return reinterpret_cast<Concept*>(buf); }\n  Concept const* get() const { return reinterpret_cast<Concept const*>(buf); }\npublic:\n  template<typename T>\n  Shape(T&& t) { ::new (buf) Model<std::decay_t<T>>(std::move(t)); }\n  Shape(Shape&& o) noexcept { o.get()->move_into(buf); }\n  ~Shape() { get()->~Concept(); }\n  friend void draw(Shape const& s) { s.get()->do_draw(); }\n};\n\nint main() {\n  Shape a{ Tracker{} };\n  std::puts(\"--\");\n  Shape b{ std::move(a) };\n  draw(b);\n}",
      "options": [
        "Nothing but draw: moving an SBO wrapper just steals a pointer",
        "copy, then draw",
        "move, move, then draw",
        "move, then draw"
      ],
      "answer": 3,
      "explain": "A heap-based wrapper moves by transferring the unique_ptr -- the stored object never moves. With SBO the object lives inside the source buffer, so moving the wrapper must move-construct the Model (and thus the Tracker) into the destination buffer: one 'move' line, then 'draw'. Moves of SBO wrappers cost whatever the stored type's move costs, which is why they should be noexcept and cheap."
    },
    {
      "type": "mcq",
      "tag": "SBO move semantics",
      "question": "Why does the small buffer optimization fundamentally change the move semantics of an owning Type Erasure wrapper?",
      "options": [
        "With in-place storage there is no pointer to steal: moving the wrapper must move-construct the stored object into the target's buffer (and destroy the source), so moves are no longer trivial pointer swaps and their cost and noexcept-ness depend on the erased type",
        "SBO makes moves illegal, so the wrapper becomes copy-only",
        "SBO moves are faster than pointer moves in every case",
        "The buffer must be reallocated on every move"
      ],
      "answer": 0,
      "explain": "unique_ptr-based wrappers move in O(1) by exchanging pointers and are trivially noexcept. Once the object is embedded, a move has to relocate the object itself, typically through a virtual move_into or a move slot in the vtable. If the erased type's move could throw, the wrapper's noexcept guarantee (and things like vector reallocation behavior) are affected -- a real design cost of SBO."
    },
    {
      "type": "mcq",
      "tag": "Buffer alignment",
      "question": "Besides being large enough, what must the SBO buffer guarantee, and how is that expressed in code?",
      "options": [
        "It must be zero-initialized before each placement new",
        "It must be allocated with operator new to get default alignment",
        "It must be suitably aligned for every Model<T> constructed in it -- expressed with alignas on the buffer member (and ideally a compile-time check of alignof(Model<T>))",
        "Nothing else; unsigned char arrays are always aligned for any type"
      ],
      "answer": 2,
      "explain": "A plain unsigned char array only has alignment 1, so placement-newing a Model with stricter alignment into it would be undefined behavior. The book's SBO code puts alignas on the buffer and checks size and alignment against Model<T> at compile time. Alignment bugs are nastier than size bugs because they may work by accident on one platform and crash on another."
    },
    {
      "type": "mcq",
      "tag": "std::function erases",
      "question": "std::function<int(int)> is one of the standard library's Type Erasure examples. Exactly what does it erase, and what does it preserve?",
      "options": [
        "It erases the call signature but preserves the callable's concrete type",
        "It erases the concrete callable type (function pointer, lambda, functor...) while preserving only the call signature int(int) -- plus the requirements of copyability and destructibility",
        "It erases both the callable type and the signature",
        "It only accepts function pointers, erasing nothing"
      ],
      "answer": 1,
      "explain": "Any copyable callable invocable as int(int) can be stored, and afterwards the wrapper's static type tells you nothing about which one it is. The signature is the Concept of this erasure: the one operation the wrapper promises. This is precisely the owning Shape pattern specialized to a single call operator."
    },
    {
      "type": "code",
      "tag": "function copies",
      "question": "A mutable lambda holding a counter is stored in f, and g is a copy of f. What does the program print?",
      "code": "#include <cstdio>\n#include <functional>\n\nint main() {\n  int n = 0;\n  auto lam = [n]() mutable { return ++n; };\n  std::function<int()> f = lam;\n  std::function<int()> g = f;\n  f(); f();\n  int a = f();\n  int b = g();\n  std::printf(\"%d %d\\n\", a, b);\n}",
      "options": [
        "3 3",
        "1 1",
        "2 1",
        "3 1"
      ],
      "answer": 3,
      "explain": "std::function has value semantics: copying f deep-copies the stored lambda, including its captured counter, at the moment of the copy (when n is still 0). The three calls on f raise its private counter to 3, while g's first call returns 1. Erased wrappers copying their state independently is exactly the Prototype-derived behavior of the Shape example."
    },
    {
      "type": "code",
      "tag": "Empty function",
      "question": "An empty std::function is invoked. What does the program print?",
      "code": "#include <cstdio>\n#include <functional>\n\nint main() {\n  std::function<void()> f;\n  try {\n    f();\n  } catch (std::bad_function_call const&) {\n    std::puts(\"bad_function_call\");\n  }\n  std::puts(\"done\");\n}",
      "options": [
        "Nothing; invoking an empty function is undefined behavior and the program crashes",
        "done only; the empty call is silently ignored",
        "bad_function_call, then done -- invoking an empty std::function throws std::bad_function_call",
        "It does not compile: f is not initialized"
      ],
      "answer": 2,
      "explain": "Unlike the hand-written wrapper, whose moved-from or empty state makes calls undefined behavior, std::function specifies its empty state: operator() throws std::bad_function_call. That is a deliberate design decision trading a branch per call for safety. The catch block prints, and execution continues normally to 'done'."
    },
    {
      "type": "code",
      "tag": "reference_wrapper escape",
      "question": "The Counter functor is passed through std::ref before being stored. What does the program print?",
      "code": "#include <cstdio>\n#include <functional>\n\nstruct Counter {\n  int n = 0;\n  int operator()() { return ++n; }\n};\n\nint main() {\n  Counter c;\n  std::function<int()> f = std::ref(c);\n  f(); f();\n  int r = f();\n  std::printf(\"%d %d\\n\", r, c.n);\n}",
      "options": [
        "3 0",
        "3 3",
        "1 1",
        "It does not compile: reference_wrapper is not callable"
      ],
      "answer": 1,
      "explain": "std::function normally copies its callable, which would leave the original c untouched. Storing std::reference_wrapper<Counter> instead erases a reference: every f() forwards to the original c, so after three calls both the returned value and c.n are 3. std::ref is the standard escape hatch from owning erasure into non-owning reference semantics -- with the matching lifetime obligations."
    },
    {
      "type": "code",
      "tag": "Stateful callable",
      "question": "The same capturing lambda is assigned to a std::function and to a raw function pointer. What is the result?",
      "code": "#include <cstdio>\n#include <functional>\n\nint main() {\n  int x = 42;\n  auto lam = [x] { return x; };\n  std::function<int()> f = lam;   // (1)\n  int (*p)() = lam;               // (2)\n  std::printf(\"%d %d\\n\", f(), p());\n}",
      "options": [
        "Both lines compile and the program prints 42 42",
        "Line (1) fails: std::function cannot store lambdas with captures",
        "Both lines fail to compile",
        "Line (2) fails: a lambda with captures has no conversion to a function pointer, while std::function stores it fine"
      ],
      "answer": 3,
      "explain": "Only captureless lambdas convert to plain function pointers, because a function pointer has nowhere to keep state. std::function is a type-erasing wrapper with storage: it can hold the closure object itself, state included. This is the practical reason type erasure exists for callables -- the C-style alternative would need a separate void* context parameter."
    },
    {
      "type": "mcq",
      "tag": "std::any erases",
      "question": "How does std::any fit into the Type Erasure picture, and what is the catch compared to std::function?",
      "options": [
        "It erases only types that share a common base class",
        "It stores at most one predeclared list of types, like variant",
        "It erases the stored type while preserving no operations at all beyond copy/move/destroy -- to do anything useful you must recover the exact concrete type via any_cast",
        "It preserves all operations of the stored type through reflection"
      ],
      "answer": 2,
      "explain": "std::any's Concept is essentially empty: any copy-constructible type can go in, but the wrapper offers no erased operation to call on it. Retrieval requires naming the exact stored type. That makes std::any the degenerate corner of the pattern -- maximum openness of types, zero preserved behavior -- and per the book, rarely the right design tool."
    },
    {
      "type": "code",
      "tag": "any exact type",
      "question": "A double is stored in a std::any and an int is requested. What does the program print?",
      "code": "#include <any>\n#include <cstdio>\n\nint main() {\n  std::any a = 3.14;\n  try {\n    std::printf(\"%d\\n\", std::any_cast<int>(a));\n  } catch (std::bad_any_cast const&) {\n    std::puts(\"bad any_cast\");\n  }\n  std::printf(\"%.2f\\n\", std::any_cast<double>(a));\n}",
      "options": [
        "bad any_cast, then 3.14",
        "3 (the double is converted to int), then 3.14",
        "It does not compile: any_cast<int> of an any holding double is ill-formed",
        "0, then 3.14"
      ],
      "answer": 0,
      "explain": "any_cast checks the stored typeid for an exact match; it never applies conversions, not even double to int. The mismatch throws std::bad_any_cast, which the handler reports, and the subsequent any_cast<double> succeeds. Type recovery from full erasure is all-or-nothing on the precise type."
    },
    {
      "type": "code",
      "tag": "any_cast pointer",
      "question": "The pointer form of any_cast is applied twice to an any holding a std::string. What does the program print?",
      "code": "#include <any>\n#include <cstdio>\n#include <string>\n\nint main() {\n  std::any a = std::string(\"hi\");\n  if (auto p = std::any_cast<int>(&a)) std::printf(\"int %d\\n\", *p);\n  else std::puts(\"null\");\n  if (auto q = std::any_cast<std::string>(&a)) std::printf(\"%s\\n\", q->c_str());\n}",
      "options": [
        "int 0, then hi",
        "null, then hi",
        "It throws std::bad_any_cast on the first cast",
        "null, then null"
      ],
      "answer": 1,
      "explain": "Given a pointer to the any, any_cast returns a pointer to the stored object on a type match and nullptr on a mismatch -- no exception is involved in this form. The int query yields nullptr, printing 'null'; the string query succeeds and prints 'hi'. This is the exception-free probing interface for recovering from erasure."
    },
    {
      "type": "code",
      "tag": "any copies",
      "question": "b is copied from a before a's contents are modified through any_cast<int&>. What does the program print?",
      "code": "#include <any>\n#include <cstdio>\n\nint main() {\n  std::any a = 41;\n  std::any b = a;\n  std::any_cast<int&>(a) = 100;\n  std::printf(\"%d %d\\n\", std::any_cast<int>(a), std::any_cast<int>(b));\n}",
      "options": [
        "100 100",
        "41 41",
        "100 41",
        "It does not compile: any_cast cannot return a reference"
      ],
      "answer": 2,
      "explain": "Copying a std::any deep-copies the stored value, so b owns an independent int equal to 41 at copy time. any_cast<int&>(a) then yields a mutable reference into a's storage only. Like Shape and std::function, std::any is a value-semantic erased wrapper: copies never share state."
    },
    {
      "type": "code",
      "tag": "shared_ptr deleter",
      "question": "Two shared_ptr<int> objects are created with different lambda deleters, and the static_assert claims they have the same type. What does the program print?",
      "code": "#include <cstdio>\n#include <memory>\n#include <type_traits>\n\nint main() {\n  std::shared_ptr<int> a(new int(1), [](int* p) { std::puts(\"A\"); delete p; });\n  std::shared_ptr<int> b(new int(2), [](int* p) { std::puts(\"B\"); delete p; });\n  static_assert(std::is_same_v<decltype(a), decltype(b)>);\n  std::puts(\"scope end\");\n}",
      "options": [
        "It does not compile: the static_assert fails because each lambda has a distinct type",
        "A, then B, then scope end",
        "scope end, then A, then B",
        "scope end, then B, then A -- the deleter type is erased into the control block, so both pointers have type shared_ptr<int>, and destruction runs in reverse declaration order"
      ],
      "answer": 3,
      "explain": "shared_ptr type-erases its deleter: the lambda is stored in the dynamically allocated control block and never appears in the pointer's type, so the static_assert holds. At the closing brace, b is destroyed before a (reverse order of declaration), invoking deleter B first, then A. The deleter is a hidden, erased strategy -- one of the standard library's quiet uses of this pattern."
    },
    {
      "type": "code",
      "tag": "unique_ptr deleter",
      "question": "The same experiment with unique_ptr: two identical-looking lambda deleters, and a static_assert that the two smart-pointer types differ. What happens?",
      "code": "#include <cstdio>\n#include <memory>\n#include <type_traits>\n\nint main() {\n  auto d1 = [](int* p) { delete p; };\n  auto d2 = [](int* p) { delete p; };\n  std::unique_ptr<int, decltype(d1)> a(new int(1), d1);\n  std::unique_ptr<int, decltype(d2)> b(new int(2), d2);\n  static_assert(!std::is_same_v<decltype(a), decltype(b)>);\n  std::printf(\"distinct types: %d\\n\", (int)!std::is_same_v<decltype(a), decltype(b)>);\n}",
      "options": [
        "It compiles and prints 'distinct types: 1' -- unique_ptr's deleter is a template parameter, part of the pointer's type, and each lambda is a unique type",
        "The static_assert fails: both deleters do the same thing, so the types are equal",
        "It does not compile: unique_ptr does not accept lambda deleters",
        "It compiles, but both unique_ptrs share one deleter object"
      ],
      "answer": 0,
      "explain": "std::unique_ptr<T, D> carries the deleter in its type and stores it inline (usually at zero size for empty deleters) -- nothing is erased. Two lambdas are always distinct types even with identical bodies, so decltype(a) and decltype(b) differ and the negated is_same holds. This is the deliberate zero-overhead counterpoint to shared_ptr's erased deleter."
    },
    {
      "type": "mcq",
      "tag": "Why the asymmetry",
      "question": "Why does shared_ptr erase its deleter type while unique_ptr does not?",
      "options": [
        "An oversight in C++11 that cannot be fixed for ABI reasons",
        "shared_ptr already pays for a dynamically allocated control block to hold the reference counts, so storing the deleter there adds little cost; unique_ptr is designed as a zero-overhead abstraction with no allocation in which to hide an erased deleter",
        "unique_ptr predates the invention of type erasure",
        "Erasing the deleter would make shared_ptr non-copyable"
      ],
      "answer": 1,
      "explain": "Type erasure needs somewhere to put the erased state and its dispatch machinery. shared_ptr's control block exists anyway, so the deleter rides along nearly for free, keeping the deleter out of the type and letting shared_ptr<int> with different deleters interoperate. unique_ptr refuses that overhead: same size and codegen as a raw pointer for the default deleter, at the price of the deleter appearing in the type."
    },
    {
      "type": "code",
      "tag": "function target",
      "question": "std::function's target<T>() is the any_cast-style hook for recovering the stored callable. What does the program print?",
      "code": "#include <cstdio>\n#include <functional>\n\nint add(int a, int b) { return a + b; }\n\nint main() {\n  std::function<int(int, int)> f = add;\n  if (f.target<int(*)(int, int)>()) std::puts(\"fnptr\");\n  if (f.target<std::plus<int>>()) std::puts(\"plus\");\n  else std::puts(\"no plus\");\n  f = std::plus<int>{};\n  if (f.target<std::plus<int>>()) std::puts(\"now plus\");\n}",
      "options": [
        "fnptr, plus, now plus",
        "no plus, now plus",
        "fnptr, no plus, now plus",
        "fnptr, no plus"
      ],
      "answer": 2,
      "explain": "target<T>() returns a pointer to the stored callable if T exactly matches its type, else nullptr. Initially the function holds int(*)(int,int), so the first probe succeeds and the plus probe fails; after reassignment, the plus probe succeeds. This mirrors any_cast: erased wrappers can offer opt-in, exact-type recovery hooks without exposing the type otherwise."
    },
    {
      "type": "code",
      "tag": "RTTI on models",
      "question": "typeid is applied through the Concept pointer of an erased Model<int>. What does the program print?",
      "code": "#include <cstdio>\n#include <memory>\n#include <typeinfo>\n\nstruct Concept { virtual ~Concept() = default; };\ntemplate<typename T>\nstruct Model final : Concept { T obj{}; };\n\nint main() {\n  std::unique_ptr<Concept> p = std::make_unique<Model<int>>();\n  std::printf(\"%d\\n\", (int)(typeid(*p) == typeid(Model<int>)));\n  std::printf(\"%d\\n\", (int)(typeid(*p) == typeid(int)));\n}",
      "options": [
        "1, then 0 -- the dynamic type is Model<int>, so comparing against typeid(int) fails",
        "0, then 1",
        "1, then 1",
        "It does not compile: typeid cannot be applied through a pointer"
      ],
      "answer": 0,
      "explain": "Because Concept is polymorphic, typeid(*p) queries the dynamic type, which is the wrapper-internal Model<int>, not int itself. So RTTI 'sees' the erasure machinery, not the erased type directly. An any_cast-like facility must therefore be built deliberately, for example by comparing against typeid(Model<T>) or storing typeid(T) at construction."
    },
    {
      "type": "mcq",
      "tag": "Lost affordances",
      "question": "Which affordance of a classic public inheritance hierarchy is NOT automatically available on a basic Type Erasure wrapper like Shape?",
      "options": [
        "Calling the erased operations polymorphically",
        "Storing heterogeneous objects in one std::vector",
        "Copying objects without knowing their concrete type",
        "Recovering the concrete type via dynamic_cast (or otherwise asking 'is this a Circle?') -- the wrapper hides the hierarchy, so downcasting hooks must be added explicitly if wanted"
      ],
      "answer": 3,
      "explain": "Users hold a Shape, not a Concept pointer, and the Model type is a private detail, so there is nothing visible to dynamic_cast against. If type recovery is needed, the wrapper must provide an any_cast/target-style function built on typeid comparison. The book counts this loss of easy downcasting as mostly a feature: it discourages type-switching designs."
    },
    {
      "type": "mcq",
      "tag": "Equality problem",
      "question": "Why is providing operator== for two type-erased wrappers (e.g., two Shapes) fundamentally awkward?",
      "options": [
        "Virtual functions cannot return bool",
        "The two wrappers may hold different concrete types, so equality must first compare the stored types (e.g., via typeid) and only then compare values -- and putting equality into the erased interface forces every participating type to be comparable",
        "operator== cannot be a hidden friend",
        "Erased objects are immutable, so equality is meaningless"
      ],
      "answer": 1,
      "explain": "Equality is a binary operation over two dynamically typed operands; the Concept interface naturally expresses unary dispatch. An implementation must recover or compare the underlying types (different types usually meaning 'not equal') and then delegate to T's operator==, which becomes a requirement on all erased types. Iglberger notes std::function omits equality for closely related reasons."
    },
    {
      "type": "mcq",
      "tag": "Extension axes",
      "question": "Along the two axes 'adding new types' and 'adding new operations', how do Type Erasure and std::variant + visitor compare?",
      "options": [
        "Both are open in types and operations",
        "Type Erasure is closed in both; variant is open in both",
        "Type Erasure (like OO hierarchies) keeps the set of types open but the set of operations fixed in the Concept; variant/visitor fixes the set of types but lets you add new operations (visitors) freely",
        "They are identical: both fix types and operations at compile time"
      ],
      "answer": 2,
      "explain": "This is the book's recurring design-space map. Anyone can erase a brand-new type into Shape without touching existing code, but adding an operation means changing the Concept and every Model. A variant's alternatives are enumerated once, while each new visitor is a free extension. Choose by asking which axis your project actually extends."
    },
    {
      "type": "code",
      "tag": "variant visit",
      "question": "A visitor with two operator() overloads is applied to a variant before and after reassignment. What does the program print?",
      "code": "#include <cstdio>\n#include <string>\n#include <variant>\n\nstruct Print {\n  void operator()(int i) const { std::printf(\"int %d\\n\", i); }\n  void operator()(std::string const& s) const { std::printf(\"str %s\\n\", s.c_str()); }\n};\n\nint main() {\n  std::variant<int, std::string> v = 5;\n  std::visit(Print{}, v);\n  v = std::string(\"hi\");\n  std::visit(Print{}, v);\n  std::printf(\"%d\\n\", (int)v.index());\n}",
      "options": [
        "int 5, str hi, then 0",
        "int 5, str hi, then 1",
        "str hi, int 5, then 1",
        "It does not compile: visit needs a generic lambda"
      ],
      "answer": 1,
      "explain": "std::visit dispatches on the active alternative: first the int overload with 5, then after assignment the string overload. index() reports the zero-based position of the active alternative in the type list, and std::string is alternative 1. This is the closed-set counterpart of the erased draw() dispatch."
    },
    {
      "type": "code",
      "tag": "Closed type set",
      "question": "A std::string is assigned to a std::variant<int, double>. What happens?",
      "code": "#include <string>\n#include <variant>\n\nint main() {\n  std::variant<int, double> v = 3;\n  v = 3.14;\n  v = std::string(\"oops\");\n}",
      "options": [
        "It does not compile: no viable overloaded '=' exists, because string is not one of the variant's alternatives",
        "It compiles; the variant becomes valueless_by_exception",
        "It compiles; the string is converted to a double",
        "It compiles and throws std::bad_variant_access at runtime"
      ],
      "answer": 0,
      "explain": "A variant's alternatives are fixed in its type: assignment is only defined for (things convertible to) the listed types, so the string assignment is rejected at compile time. Contrast Type Erasure, where a completely new type can be wrapped without touching any existing declaration. Closed type set, enforced by the compiler, is variant's defining property."
    },
    {
      "type": "mcq",
      "tag": "Choosing variant",
      "question": "In which situation does the book steer you toward std::variant (Visitor-style) rather than Type Erasure?",
      "options": [
        "When third-party clients must plug in their own types",
        "When every type must stay a pure value type -- variant is the only value-semantic option",
        "When you need to erase callables of one fixed signature",
        "When the set of alternative types is fixed and known up front while new operations are added frequently"
      ],
      "answer": 3,
      "explain": "variant shines when types are a closed, stable set: every operation is just another visitor, added without touching the alternatives. Type Erasure shines in the transposed case -- open types, stable operations. Note that Type Erasure wrappers are also value types, so value semantics alone does not decide between them; the extension axis does."
    },
    {
      "type": "mcq",
      "tag": "Versus inheritance",
      "question": "Compared to a classic public inheritance hierarchy (Circle : public Shape with virtual draw), what does the Type Erasure version of Shape improve?",
      "options": [
        "It removes the intrusive base-class requirement and replaces reference semantics (pointers, manual lifetimes, risk of slicing) with value semantics, while decoupling shape types from the drawing abstraction",
        "It makes each draw call allocation-free, unlike virtual dispatch",
        "It allows deeper inheritance chains",
        "It lets you add new operations without recompiling anything"
      ],
      "answer": 0,
      "explain": "The hierarchy forces every shape to inherit, couples all shapes to the base's dependencies, and makes users traffic in Shape pointers. The erased Shape keeps Circle a plain struct, is copyable like an int, and confines the virtual machinery to an implementation detail. Adding operations, however, remains the closed axis in both designs."
    },
    {
      "type": "mcq",
      "tag": "Allocation profile",
      "question": "Which of these designs stores its alternatives in-place, with no per-object heap allocation, by its very definition?",
      "options": [
        "A vector of unique_ptr<ShapeBase> in a classic hierarchy",
        "The canonical unique_ptr-based Type Erasure wrapper",
        "std::variant<Circle, Square> -- the object occupies the size of the largest alternative (plus a discriminator) inside the variant itself",
        "std::any for objects of arbitrary size"
      ],
      "answer": 2,
      "explain": "variant is a tagged union: alternatives live inline, so a vector<variant<...>> is one contiguous allocation-free block, which is a large part of its performance appeal in the book's comparisons. The pointer-based hierarchy and the basic erased wrapper allocate per object, and std::any must allocate whenever the object outgrows its small buffer. Only SBO-limited Type Erasure can match variant's profile, and only for small types."
    },
    {
      "type": "mcq",
      "tag": "Testing benefit",
      "question": "How does Type Erasure simplify testing compared to demanding a concrete class or a specific base class in function signatures?",
      "options": [
        "It disables virtual dispatch in test builds",
        "A test can pass any lightweight fake or mock that merely provides the required operations (e.g., a free draw), with no inheritance from a production base class and no mocking framework hooks in the production types",
        "Erased wrappers automatically record and replay their calls",
        "It has no effect on testing"
      ],
      "answer": 1,
      "explain": "Because conformance is duck-typed, a three-line test struct with a draw function is a fully valid Shape. Production types stay free of test-only virtual seams, and tests avoid heavyweight fixture hierarchies. Non-intrusiveness pays off twice: for third-party integration and for cheap test doubles."
    },
    {
      "type": "mcq",
      "tag": "Replacing hierarchies",
      "question": "The book's guideline says to 'consider replacing inheritance hierarchies with Type Erasure'. Which summary best captures the motivation?",
      "options": [
        "You gain non-intrusive extensibility, value semantics, and looser coupling (clients depend only on the wrapper), at the cost of a more elaborate implementation and a fixed operation set -- so it suits stable interfaces over an open family of types",
        "Inheritance is always wrong in modern C++ and must be eliminated",
        "Type Erasure removes the need for any design patterns",
        "It compiles faster in all cases"
      ],
      "answer": 0,
      "explain": "The recommendation is a considered trade, not a ban on inheritance: the wrapper is genuinely harder to write than a base class, and its operations are fixed in the Concept. In exchange, client code sheds pointers, manual lifetime handling, and base-class coupling, and unrelated third-party types join the abstraction freely. Iglberger presents it as the default to consider whenever the operation set is stable."
    },
    {
      "type": "mcq",
      "tag": "Setup-cost guideline",
      "question": "The guideline 'be aware of the setup costs of owning Type Erasure wrappers' leads to which practical advice?",
      "options": [
        "Never use owning wrappers anywhere",
        "Always add SBO to remove all setup costs for every type",
        "Prefer reference semantics throughout the codebase",
        "When a function merely needs to observe an erased argument, an owning wrapper's allocation-plus-copy per call may be wasteful; a non-owning erased reference makes the call nearly free -- but reintroduces reference semantics, so confine it to parameter-like, non-storing uses"
      ],
      "answer": 3,
      "explain": "Constructing an owning wrapper at every call site copies the object and usually allocates -- pure overhead if the callee only reads. The non-owning variant erases a reference for the duration of the call at near-zero cost. The book pairs the advice with a warning: the moment such a view is stored, all the string_view-style lifetime hazards return."
    }
  ]
};

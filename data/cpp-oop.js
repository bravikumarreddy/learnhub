/* ===== C++ — Inheritance & Polymorphism =====
   Original question bank generated for LearnHub. Engine shape:
   { type: "mcq"|"code", tag, question, code?, options[], answer (0-based), explain }
   45 questions. Presented in random order by the quiz engine.
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-oop"] = {
  title: "C++ — Inheritance & Polymorphism",
  subtitle: "Virtuals, object slicing, virtual destructors & name hiding.",
  crumb: "C++",
  questions: [
    {
      "type": "code",
      "tag": "Dtor order",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct Base {\n    Base()  { std::cout << \"B(\"; }\n    ~Base() { std::cout << \"~B)\"; }\n};\nstruct Derived : Base {\n    Derived()  { std::cout << \"D(\"; }\n    ~Derived() { std::cout << \"~D\"; }\n};\nint main() {\n    Derived d;\n}",
      "options": [
        "B(D(~D~B)",
        "D(B(~B~D)",
        "B(D(~B~D)",
        "D(B(~D~B)"
      ],
      "answer": 0,
      "explain": "Construction runs base-first (B( then D(), so the base subobject exists before the derived body runs. Destruction is the exact reverse: derived body (~D) then base (~B), giving B(D(~D~B). The tempting D(B( ordering wrongly assumes the most-derived constructor body runs before its base is built."
    },
    {
      "type": "mcq",
      "tag": "Access",
      "question": "With `class D : private B { ... };` and `B` having a `public` member `x`, what is the accessibility of `x` when accessed through a `D` object from outside `D`?",
      "options": [
        "Inaccessible from outside D",
        "public, unchanged",
        "protected",
        "Accessible only via an explicit cast to B*"
      ],
      "answer": 0,
      "explain": "Private inheritance makes every inherited member (public or protected) private in D, so outside code cannot touch x through a D. Option 3 is a trap: even a cast to B* fails from outside because the derived-to-base conversion is itself inaccessible under private inheritance except within D and its members."
    },
    {
      "type": "code",
      "tag": "Name hiding",
      "question": "Does this compile, and if so what does it print?",
      "code": "#include <iostream>\nstruct Base {\n    void f(int)    { std::cout << \"int\"; }\n    void f(double) { std::cout << \"double\"; }\n};\nstruct Derived : Base {\n    void f(const char*) { std::cout << \"str\"; }\n};\nint main() {\n    Derived d;\n    d.f(42);\n}",
      "options": [
        "Prints int",
        "Prints double",
        "Prints str",
        "Does not compile"
      ],
      "answer": 3,
      "explain": "Declaring any `f` in Derived hides ALL base `f` overloads by name, so lookup stops at Derived and only `f(const char*)` is visible. Passing 42 (an int) can't convert to const char* (only a literal 0/nullptr is a null pointer constant), so it fails to compile. It does NOT quietly call Base::f(int) — name hiding happens before overload resolution."
    },
    {
      "type": "code",
      "tag": "using",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base {\n    void f(int)    { std::cout << \"int\"; }\n    void f(double) { std::cout << \"double\"; }\n};\nstruct Derived : Base {\n    using Base::f;\n    void f(const char*) { std::cout << \"str\"; }\n};\nint main() {\n    Derived d;\n    d.f(3.14);\n}",
      "options": [
        "Prints int",
        "Prints double",
        "Prints str",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "The `using Base::f;` declaration pulls both base overloads into Derived's scope, so all three f's participate in overload resolution together. 3.14 is a double and best-matches f(double). Without the using-declaration this would have failed; with it, the exact double match wins over any conversion."
    },
    {
      "type": "mcq",
      "tag": "Conversion",
      "question": "Given `struct D : protected B {};`, where can an implicit conversion from `D*` to `B*` legally occur?",
      "options": [
        "Only inside D's own members/friends",
        "Anywhere, since it's still an is-a relationship",
        "Inside D and inside classes derived from D (and their friends)",
        "Nowhere; protected inheritance forbids the conversion entirely"
      ],
      "answer": 2,
      "explain": "Under protected inheritance the derived-to-base conversion is accessible in D's members/friends AND in further-derived classes' members (they inherit the protected access to the base subobject). Option 0 describes private inheritance; option 1 describes public inheritance. The relationship still exists, it's just access-restricted."
    },
    {
      "type": "code",
      "tag": "Slicing",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base {\n    int v = 1;\n    virtual int who() { return v; }\n};\nstruct Derived : Base {\n    Derived() { v = 99; }\n    int who() override { return 42; }\n};\nvoid take(Base b) { std::cout << b.who(); }\nint main() {\n    Derived d;\n    take(d);\n}",
      "options": [
        "Prints 42",
        "Prints 99",
        "Prints 1",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Passing Derived by value into a Base parameter slices: only the Base subobject is copied, so b is a genuine Base whose vtable is Base's. who() therefore calls Base::who returning b.v, which was copied as 99 (set in Derived's constructor). The trap is expecting 42 (virtual dispatch), but slicing destroys the dynamic type."
    },
    {
      "type": "code",
      "tag": "Ctor dispatch",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base {\n    Base() { report(); }\n    virtual void report() { std::cout << \"Base\"; }\n};\nstruct Derived : Base {\n    void report() override { std::cout << \"Derived\"; }\n};\nint main() {\n    Derived d;\n}",
      "options": [
        "Prints Derived",
        "Prints Base",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "During Base's constructor the object's dynamic type is still Base (the Derived part isn't constructed yet), so the virtual call resolves to Base::report. Calling a virtual from a constructor never dispatches to the derived override. It is well-defined here (not UB) because report is not pure and the object's Base subobject is fully alive."
    },
    {
      "type": "mcq",
      "tag": "Access",
      "question": "Which statement about `protected` members is TRUE?",
      "options": [
        "A derived class member function may access the protected base member of ANY Base object it can name",
        "A derived class member function may access a protected base member only through an object of its own derived type (or further derived), not through an unrelated Base&",
        "protected and private behave identically for derived classes",
        "protected members become public in the derived class"
      ],
      "answer": 1,
      "explain": "A member of Derived can access an inherited protected member only via a Derived (or more-derived) object, not through a plain Base& or a sibling type. This surprising rule stops one derived class from poking the protected internals of an unrelated Base instance. Option 0 states the common misconception."
    },
    {
      "type": "code",
      "tag": "MI order",
      "question": "With multiple inheritance, what does this print?",
      "code": "#include <iostream>\nstruct A { A() { std::cout << \"A\"; } };\nstruct B { B() { std::cout << \"B\"; } };\nstruct C : B, A {\n    C() : A(), B() { std::cout << \"C\"; }\n};\nint main() { C c; }",
      "options": [
        "Prints ABC",
        "Prints BAC",
        "Prints CAB",
        "Prints BCA"
      ],
      "answer": 1,
      "explain": "Base subobjects are constructed in the order they are listed in the base-specifier list (B then A), NOT the order written in the member-initializer list. So B, then A, then C's body: BAC. Reordering the init list (A(), B()) is a classic trap that many compilers warn about precisely because it misleads readers."
    },
    {
      "type": "code",
      "tag": "Ambiguity",
      "question": "What is the result of this code?",
      "code": "struct A { void f() {} };\nstruct B { void f() {} };\nstruct C : A, B {};\nint main() {\n    C c;\n    c.f();\n}",
      "options": [
        "Calls A::f",
        "Calls B::f",
        "Does not compile (ambiguous)",
        "Calls both"
      ],
      "answer": 2,
      "explain": "C inherits an f from both A and B; unqualified c.f() is ambiguous and ill-formed because name lookup finds two members named f in different base subobjects. It won't silently pick one. You must disambiguate with c.A::f() or c.B::f()."
    },
    {
      "type": "mcq",
      "tag": "Private inh",
      "question": "Private inheritance `class D : private B` is best described as modeling which relationship?",
      "options": [
        "is-a (D is a kind of B)",
        "implemented-in-terms-of / has-a",
        "D is a base of B",
        "No relationship at all"
      ],
      "answer": 1,
      "explain": "Private inheritance expresses 'implemented in terms of B' — an implementation detail, essentially composition with the ability to override virtuals and access protected members. It is NOT a public is-a relationship, so clients can't convert D* to B*. That's why containment (has-a) is usually preferred unless you need those extra abilities."
    },
    {
      "type": "code",
      "tag": "Dtor virtual",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\nstruct Base {\n    ~Base() { std::cout << \"~B\"; }\n};\nstruct Derived : Base {\n    int* p = new int[100];\n    ~Derived() { delete[] p; std::cout << \"~D\"; }\n};\nint main() {\n    Base* b = new Derived;\n    delete b;\n}",
      "options": [
        "Prints ~D~B, memory freed",
        "Prints ~B only; undefined behavior",
        "Prints ~B~D",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "Deleting a Derived through a Base* whose destructor is non-virtual is undefined behavior; in practice only ~Base runs, so ~Derived is skipped and p leaks. The fix is a virtual destructor in Base. Option 0 is what you'd get only WITH a virtual destructor."
    },
    {
      "type": "code",
      "tag": "Ctor init",
      "question": "Does this compile?",
      "code": "struct Base {\n    Base(int) {}\n};\nstruct Derived : Base {\n    Derived() {}\n};\nint main() {\n    Derived d;\n}",
      "options": [
        "Yes; Base is default-constructed",
        "No; Base has no default constructor and Derived doesn't call Base(int)",
        "Yes; Base(int) is called with 0",
        "No; Derived needs a virtual destructor"
      ],
      "answer": 1,
      "explain": "Base has a user-declared constructor Base(int), which suppresses the implicit default constructor. Derived's constructor doesn't list Base in its initializer, so the compiler tries to default-construct the Base subobject and fails. You must write Derived() : Base(someInt) {}."
    },
    {
      "type": "mcq",
      "tag": "Access",
      "question": "Inside a member of `class D : private B`, can you convert `this` (a D*) to a B*?",
      "options": [
        "No, private inheritance blocks it everywhere",
        "Yes; the derived-to-base conversion is accessible within D's own members and friends",
        "Only with a C-style cast that bypasses access control",
        "Only if B has a virtual destructor"
      ],
      "answer": 1,
      "explain": "Private inheritance restricts the derived-to-base conversion to D's members and friends — inside D it works normally. It's OUTSIDE code (and even further-derived classes) that cannot perform the conversion. So a D member can legitimately treat itself as a B."
    },
    {
      "type": "code",
      "tag": "Name hiding",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base {\n    int f() { return 1; }\n};\nstruct Derived : Base {\n    int f(int x) { return x; }\n};\nint main() {\n    Derived d;\n    std::cout << d.f();\n}",
      "options": [
        "Prints 1",
        "Prints 0",
        "Does not compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "Derived::f(int) hides Base::f() entirely by name, even though the signatures differ. d.f() finds only f(int) in Derived and cannot be called with zero arguments, so it fails to compile. Adding `using Base::f;` would make d.f() return 1."
    },
    {
      "type": "code",
      "tag": "MI dtor",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct A { ~A() { std::cout << \"a\"; } };\nstruct B { ~B() { std::cout << \"b\"; } };\nstruct C : A, B { ~C() { std::cout << \"c\"; } };\nint main() { C c; }",
      "options": [
        "Prints cba",
        "Prints cab",
        "Prints abc",
        "Prints bac"
      ],
      "answer": 0,
      "explain": "Destruction order is the reverse of construction. Bases construct in declaration order A then B, so they destruct B then A, and the derived destructor runs first: c, then b, then a = 'cba'. The trap 'cab' wrongly keeps bases in declaration order during destruction."
    },
    {
      "type": "mcq",
      "tag": "Conversion",
      "question": "Why are arrays of Derived unsafe to treat as arrays of Base, even though a single `Base* p = &derivedObj;` is fine?",
      "options": [
        "Because array-to-base conversion would use sizeof(Base) striding over Derived objects, misaligning element access",
        "Because arrays cannot be converted at all in any way",
        "Because Base must be abstract",
        "Because Derived arrays are stored in a different memory segment"
      ],
      "answer": 0,
      "explain": "A single derived-to-base pointer conversion adjusts to the Base subobject, but treating a Derived[] as a Base[] would index with sizeof(Base), not sizeof(Derived), so p[1] would land in the middle of the first Derived. This is exactly why polymorphism through arrays-of-base is a well-known pitfall; use containers of pointers instead."
    },
    {
      "type": "code",
      "tag": "using access",
      "question": "What does the using-declaration marked (*) do here?",
      "code": "struct Base {\nprotected:\n    void helper() {}\n};\nstruct Derived : Base {\npublic:\n    using Base::helper;   // (*)\n};\nint main() {\n    Derived d;\n    d.helper();\n}",
      "options": [
        "Compiles; using-declaration changes helper's access to public in Derived",
        "Does not compile; you cannot change access with using",
        "Undefined behavior",
        "Compiles but helper stays protected"
      ],
      "answer": 0,
      "explain": "A using-declaration for an inherited member adopts the access level of the section it appears in. Placed under `public:`, it re-exposes the protected Base::helper as a public member of Derived, so d.helper() is legal. This is a legitimate tool to selectively widen (or narrow) inherited member access."
    },
    {
      "type": "code",
      "tag": "Assignment slice",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base { int x = 1; };\nstruct Derived : Base {\n    int y = 2;\n    Derived() { x = 10; y = 20; }\n};\nint main() {\n    Derived d;\n    Base b;\n    b = d;              // (*)\n    std::cout << b.x;\n}",
      "options": [
        "Prints 10",
        "Prints 1",
        "Prints 20",
        "Does not compile"
      ],
      "answer": 0,
      "explain": "b = d invokes Base's copy-assignment, which copies only the Base subobject of d (its x, which is 10). The derived y is silently sliced away, but b.x correctly becomes 10. The point of the gotcha is that this compiles cleanly and quietly loses the Derived data — no error, no warning by default."
    },
    {
      "type": "mcq",
      "tag": "Final override",
      "question": "A base declares `virtual void g();`. A derived writes `void g() const override;`. What happens?",
      "options": [
        "Compiles; overrides the base g",
        "Does not compile; the const version has a different signature so it overrides nothing, and `override` catches the mistake",
        "Compiles but hides g instead of overriding",
        "Undefined behavior at runtime"
      ],
      "answer": 1,
      "explain": "Adding const changes the function's signature, so g() const does NOT override the non-const base g() — it would be a new, non-overriding function. The `override` specifier's whole purpose is to turn this silent mistake into a compile error. Without `override` it would compile and merely hide/introduce a separate function."
    },
    {
      "type": "code",
      "tag": "Init order",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base {\n    Base(int v) { std::cout << v; }\n};\nstruct Derived : Base {\n    int a;\n    int b;\n    Derived() : b(2), a(1), Base(0) {   // (*)\n        std::cout << a << b;\n    }\n};\nint main() { Derived d; }",
      "options": [
        "Prints 012",
        "Prints 021",
        "Prints 210",
        "Does not compile"
      ],
      "answer": 0,
      "explain": "Regardless of the order written in the init list, initialization runs: base class first (Base(0) -> 0), then members in DECLARATION order (a then b), so a=1,b=2. The body prints a then b = 12. Total: 012. The scrambled init-list order (b(2),a(1),Base(0)) is a red herring — declaration order governs, which is exactly why compilers warn here."
    },
    {
      "type": "code",
      "tag": "Abstract",
      "question": "What is the result?",
      "code": "struct Base {\n    virtual void f() = 0;\n    Base() { f(); }        // (*)\n};\nstruct Derived : Base {\n    void f() override {}\n};\nint main() { Derived d; }",
      "options": [
        "Runs fine; calls Derived::f",
        "Undefined behavior: pure virtual call during construction",
        "Does not compile",
        "Calls Base::f"
      ],
      "answer": 1,
      "explain": "Inside Base's constructor the dynamic type is Base, so f() resolves to Base::f, which is pure (has no definition) — calling a pure virtual during construction is undefined behavior (typically a runtime 'pure virtual function call' abort). It does NOT dispatch to Derived::f. Providing a definition for the pure function would be needed to make such a call defined."
    },
    {
      "type": "mcq",
      "tag": "Private inh",
      "question": "Which is a genuine reason to prefer private inheritance over a member subobject?",
      "options": [
        "To gain access to the base's protected members or override its virtual functions",
        "To make the relationship publicly visible as is-a",
        "To automatically get derived-to-base conversion for clients",
        "There is never any reason; composition is always identical"
      ],
      "answer": 0,
      "explain": "Private inheritance's legitimate uses are needing to override the base's virtual functions or access its protected members (and the empty-base optimization) — things a plain member can't do. It does NOT create a client-visible is-a relationship or public conversion (that's public inheritance). So it's not always interchangeable with composition."
    },
    {
      "type": "code",
      "tag": "MI diamond",
      "question": "Without virtual inheritance, what does this print?",
      "code": "#include <iostream>\nstruct A { int x = 5; };\nstruct B : A {};\nstruct C : A {};\nstruct D : B, C {};\nint main() {\n    D d;\n    std::cout << d.B::x << d.C::x;   // (*)\n}",
      "options": [
        "Prints 55 (two separate A subobjects)",
        "Prints 5 once; only one A exists",
        "Does not compile; x is ambiguous even when qualified",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "With non-virtual inheritance D contains two distinct A subobjects (one via B, one via C), each with its own x=5, so qualified access d.B::x and d.C::x are both valid and independent, printing 55. A plain d.x WOULD be ambiguous, but the B::/C:: qualification resolves which A subobject you mean. Virtual inheritance would instead merge them into a single shared A."
    },
    {
      "type": "code",
      "tag": "Slicing",
      "question": "What does this program print?",
      "code": "#include <iostream>\nstruct Animal {\n    virtual void speak() const { std::cout << \"...\"; }\n};\nstruct Dog : Animal {\n    void speak() const override { std::cout << \"Woof\"; }\n};\nvoid make(Animal a) { a.speak(); }\nint main() {\n    Dog d;\n    make(d);\n    std::cout << '\\n';\n}",
      "options": [
        "Woof",
        "...",
        "Nothing; it fails to compile",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "make takes Animal by value, so the Dog is sliced: only the Animal base subobject is copied and its dynamic type is Animal, printing \"...\". Passing by reference (const Animal&) would preserve the Dog dynamic type and print \"Woof\"."
    },
    {
      "type": "code",
      "tag": "Virtual dtor",
      "question": "Which statement about this code is correct?",
      "code": "#include <iostream>\nstruct Base { ~Base() { std::cout << \"~Base\"; } };\nstruct Derived : Base {\n    int* p;\n    Derived() : p(new int[100]) {}\n    ~Derived() { delete[] p; std::cout << \"~Derived\"; }\n};\nint main() {\n    Base* b = new Derived;\n    delete b;\n}",
      "options": [
        "Prints \"~Derived~Base\" and frees all memory",
        "Prints \"~Base\" only; deleting through the base leaks and is undefined behavior",
        "Fails to compile because Base has no virtual destructor",
        "Prints \"~Base~Derived\""
      ],
      "answer": 1,
      "explain": "Deleting a derived object through a base pointer when the base destructor is non-virtual is undefined behavior; in practice only ~Base runs, so Derived::p leaks. The fix is to declare Base's destructor virtual, which makes delete dispatch to ~Derived first."
    },
    {
      "type": "mcq",
      "tag": "Override",
      "question": "You write a derived function intending to override a base virtual, but the signatures differ subtly (e.g. a missing const). What is the benefit of marking it 'override'?",
      "options": [
        "It forces the function to be virtual even if the base isn't",
        "It makes the compiler emit an error when nothing in a base class is actually being overridden",
        "It improves runtime dispatch performance",
        "It automatically corrects the signature to match the base"
      ],
      "answer": 1,
      "explain": "'override' is a compile-time assertion: if the function does not override a base virtual with a matching signature, compilation fails, catching silent 'accidental overload' bugs. It does not change performance, fix signatures, or make a non-virtual base function virtual."
    },
    {
      "type": "code",
      "tag": "Default arg",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Shape {\n    virtual void draw(int scale = 1) { std::cout << \"S\" << scale; }\n};\nstruct Circle : Shape {\n    void draw(int scale = 100) override { std::cout << \"C\" << scale; }\n};\nint main() {\n    Shape* s = new Circle;\n    s->draw();\n    delete s;\n}",
      "options": [
        "C100",
        "C1",
        "S1",
        "S100"
      ],
      "answer": 1,
      "explain": "Default arguments are bound statically by the pointer's static type (Shape), so scale=1 is used, but the function called is chosen dynamically (Circle::draw), giving \"C1\". This split is a classic trap; avoid default arguments on virtual functions."
    },
    {
      "type": "mcq",
      "tag": "Abstract",
      "question": "Which statement about a pure virtual function (e.g. 'virtual void f() = 0;') is TRUE?",
      "options": [
        "A class with a pure virtual function cannot be instantiated directly",
        "A pure virtual function can never have a body/definition",
        "Derived classes are not required to override it to become concrete",
        "The '= 0' makes the function non-virtual"
      ],
      "answer": 0,
      "explain": "A pure virtual function makes the class abstract, so you cannot create objects of it directly (only of concrete derived classes that override it). Notably, a pure virtual CAN still have an out-of-line definition that derived classes may call explicitly."
    },
    {
      "type": "code",
      "tag": "Dtor virtual",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct A {\n    virtual ~A() { cleanup(); }\n    virtual void cleanup() { std::cout << \"A\"; }\n};\nstruct B : A {\n    void cleanup() override { std::cout << \"B\"; }\n};\nint main() {\n    A* a = new B;\n    delete a;\n    std::cout << '\\n';\n}",
      "options": [
        "B",
        "A",
        "BA",
        "AB"
      ],
      "answer": 1,
      "explain": "Even with a virtual destructor, calling a virtual from within ~A happens after B's part is already destroyed, so the dynamic type has reverted to A and A::cleanup runs, printing \"A\". Virtual dispatch in destructors resolves to the currently-destructing class, never the derived override."
    },
    {
      "type": "code",
      "tag": "Slicing",
      "question": "What is the result of this code?",
      "code": "#include <iostream>\n#include <vector>\nstruct Base { virtual int id() const { return 0; } };\nstruct Derived : Base { int id() const override { return 1; } };\nint main() {\n    std::vector<Base> v;\n    v.push_back(Derived{});\n    std::cout << v[0].id() << '\\n';\n}",
      "options": [
        "1",
        "0",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "A std::vector<Base> stores Base objects by value, so push_back copies only the Base subobject of the Derived temporary (slicing), and v[0].id() returns 0. To store polymorphic objects you must use a container of pointers, e.g. vector<unique_ptr<Base>>."
    },
    {
      "type": "mcq",
      "tag": "Final",
      "question": "What does declaring a virtual function 'final' in a class guarantee?",
      "options": [
        "No further-derived class may override that function; doing so is a compile error",
        "The function can no longer be called through a base pointer",
        "The function becomes non-virtual and is dispatched statically",
        "Only that class may call the function"
      ],
      "answer": 0,
      "explain": "'final' on a virtual prevents any more-derived class from overriding it, enforced at compile time. It does not disable virtual dispatch through base pointers, though it may enable devirtualization optimizations; access control is unrelated."
    },
    {
      "type": "code",
      "tag": "Override",
      "question": "Why does this fail to compile?",
      "code": "struct Base {\n    virtual void handle(int) {}\n};\nstruct Derived : Base {\n    void handle(long) override {}\n};",
      "options": [
        "'handle' cannot be overloaded",
        "Derived::handle(long) does not override any base virtual, and 'override' requires it to",
        "Base::handle must be pure virtual to be overridden",
        "You cannot use int and long in the same hierarchy"
      ],
      "answer": 1,
      "explain": "handle(long) has a different signature than the base's handle(int), so it overrides nothing; the 'override' keyword turns this silent mismatch into a compile error. Without 'override' it would compile as a separate (hiding) overload, a subtle bug."
    },
    {
      "type": "code",
      "tag": "Name hiding",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base {\n    virtual void f(int) { std::cout << \"Base-int\"; }\n};\nstruct Derived : Base {\n    void f(double) { std::cout << \"Derived-double\"; }\n};\nint main() {\n    Derived d;\n    d.f(5);\n    std::cout << '\\n';\n}",
      "options": [
        "Base-int",
        "Derived-double",
        "Ambiguous; does not compile",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "Declaring f(double) in Derived hides ALL base f overloads, so name lookup finds only Derived::f, and 5 converts to double, printing \"Derived-double\". Base::f(int) is not considered unless you add 'using Base::f;'. This is name hiding, not overriding."
    },
    {
      "type": "mcq",
      "tag": "Dispatch",
      "question": "For a call 'obj.f()' (obj a named object, not a reference/pointer) where f is virtual, how is f resolved?",
      "options": [
        "Dynamically, based on runtime type",
        "Statically, because the object's type is known exactly at compile time",
        "It is undefined behavior",
        "It always calls the base version"
      ],
      "answer": 1,
      "explain": "When you call through an object of known concrete type (not a reference or pointer), the compiler knows the exact dynamic type and resolves statically, often devirtualizing the call. Virtual dispatch matters only when calling through references or pointers whose dynamic type can differ from their static type."
    },
    {
      "type": "code",
      "tag": "Pure virtual dtor",
      "question": "Is this well-formed, and what happens?",
      "code": "#include <iostream>\nstruct Interface {\n    virtual ~Interface() = 0;\n};\nInterface::~Interface() { std::cout << \"~I\"; }\nstruct Impl : Interface { ~Impl() { std::cout << \"~Impl\"; } };\nint main() {\n    Interface* p = new Impl;\n    delete p;\n    std::cout << '\\n';\n}",
      "options": [
        "Does not compile: pure virtual can't have a body",
        "Prints \"~Impl~I\"",
        "Prints \"~I~Impl\"",
        "Undefined behavior: linker error on Interface::~Interface"
      ],
      "answer": 1,
      "explain": "A pure virtual destructor is a common idiom to make a class abstract while still needing a body, because every derived destructor implicitly calls the base destructor. Destruction runs derived-first, so \"~Impl\" then \"~I\". The out-of-line definition is required, not forbidden."
    },
    {
      "type": "code",
      "tag": "Scope override",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base {\n    virtual void g() { std::cout << \"Base\"; }\n    void call() { Base::g(); }\n};\nstruct Derived : Base {\n    void g() override { std::cout << \"Derived\"; }\n};\nint main() {\n    Derived d;\n    d.call();\n    std::cout << '\\n';\n}",
      "options": [
        "Derived",
        "Base",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "A qualified call 'Base::g()' explicitly suppresses virtual dispatch and always calls Base::g, printing \"Base\", even though the object is a Derived. Using the class-name qualifier is the standard way to bypass the vtable and invoke a specific version."
    },
    {
      "type": "code",
      "tag": "Slicing assign",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base { virtual const char* who() const { return \"Base\"; } };\nstruct Derived : Base { const char* who() const override { return \"Derived\"; } };\nint main() {\n    Derived d;\n    Base b;\n    b = d;\n    std::cout << b.who() << '\\n';\n}",
      "options": [
        "Derived",
        "Base",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 1,
      "explain": "'b = d' invokes Base's copy-assignment, which copies only the Base subobject; b remains a Base object with dynamic type Base, so who() returns \"Base\". Assignment never changes an object's dynamic type; the vtable pointer of b is unchanged."
    },
    {
      "type": "mcq",
      "tag": "Design",
      "question": "Why is calling a virtual function inside a base-class constructor generally discouraged (beyond it not dispatching to derived overrides)?",
      "options": [
        "It can silently invoke a pure-virtual-with-no-definition, which is undefined behavior",
        "Virtual calls are illegal in constructors and won't compile",
        "The vtable does not exist during construction",
        "It always leaks memory"
      ],
      "answer": 0,
      "explain": "During base construction the call resolves to the base version; if that function is pure virtual with no definition, the call is undefined behavior (often a runtime 'pure virtual function call' abort). The vtable does exist (set to the base's), and such calls are legal to write, just semantically surprising."
    },
    {
      "type": "code",
      "tag": "Covariant",
      "question": "Does this compile, and why?",
      "code": "struct Base {\n    virtual Base* clone() const { return new Base(*this); }\n};\nstruct Derived : Base {\n    Derived* clone() const override { return new Derived(*this); }\n};",
      "options": [
        "Yes: covariant return types allow a derived override to return a more-derived pointer",
        "No: an override must have the exact same return type",
        "No: clone cannot be virtual",
        "Yes, but only because both return raw pointers to the same type"
      ],
      "answer": 0,
      "explain": "C++ permits covariant return types: an override may return a pointer/reference to a class derived from the base version's return type (Derived* is covariant with Base*). This is exactly what enables type-preserving clone() idioms. Note: smart pointers like unique_ptr<Derived> are NOT covariant."
    },
    {
      "type": "code",
      "tag": "Reference",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base { virtual void p() const { std::cout << \"B\"; } };\nstruct Derived : Base { void p() const override { std::cout << \"D\"; } };\nvoid show(const Base& r) { r.p(); }\nint main() {\n    Derived d;\n    show(d);\n    std::cout << '\\n';\n}",
      "options": [
        "D",
        "B",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 0,
      "explain": "Passing by reference (const Base&) does not slice: r binds to the actual Derived object, so the virtual call dispatches dynamically to Derived::p, printing \"D\". Contrast with pass-by-value, which would slice and print \"B\"."
    },
    {
      "type": "code",
      "tag": "typeid",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <typeinfo>\nstruct Base { virtual ~Base() {} };\nstruct Derived : Base {};\nint main() {\n    Derived d;\n    Base& r = d;\n    std::cout << (typeid(r) == typeid(Derived)) << '\\n';\n}",
      "options": [
        "1",
        "0",
        "Undefined behavior",
        "Does not compile"
      ],
      "answer": 0,
      "explain": "Because Base is polymorphic (has a virtual function), typeid on a reference/dereferenced pointer inspects the runtime type, yielding Derived, so the comparison is true (prints 1). If Base had no virtual members, typeid would use the static type Base and print 0."
    },
    {
      "type": "code",
      "tag": "Ctor order",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct A {\n    A() { std::cout << \"A\"; f(); }\n    virtual void f() { std::cout << \"Af\"; }\n};\nstruct B : A {\n    B() { std::cout << \"B\"; }\n    void f() override { std::cout << \"Bf\"; }\n};\nint main() {\n    B b;\n    std::cout << '\\n';\n}",
      "options": [
        "AAfB",
        "ABfB",
        "AAfBBf",
        "ABBf"
      ],
      "answer": 0,
      "explain": "A's constructor runs first, printing \"A\", then calls f(); during A's construction the dynamic type is A, so A::f runs printing \"Af\"; finally B's body prints \"B\". Result: \"AAfB\". The override B::f is never reached from the base constructor."
    },
    {
      "type": "mcq",
      "tag": "vtable",
      "question": "Which single change causes a class with only non-virtual members to gain a vtable pointer and become polymorphic?",
      "options": [
        "Adding at least one virtual function (including a virtual destructor)",
        "Adding a pointer data member",
        "Deriving from any base class",
        "Marking a member function 'const'"
      ],
      "answer": 0,
      "explain": "A class becomes polymorphic (gains a vtable/vptr) precisely when it declares or inherits at least one virtual function; a virtual destructor counts. Plain inheritance, extra data members, or const-qualification do not by themselves introduce a vtable."
    },
    {
      "type": "code",
      "tag": "Static call",
      "question": "What does this print?",
      "code": "#include <iostream>\nstruct Base {\n    virtual void v() { std::cout << \"Bv\"; }\n    void nv() { std::cout << \"Bnv\"; }\n};\nstruct Derived : Base {\n    void v() override { std::cout << \"Dv\"; }\n    void nv() { std::cout << \"Dnv\"; }\n};\nint main() {\n    Base* p = new Derived;\n    p->v();\n    p->nv();\n    delete p;\n    std::cout << '\\n';\n}",
      "options": [
        "DvDnv",
        "DvBnv",
        "BvBnv",
        "BvDnv"
      ],
      "answer": 1,
      "explain": "v() is virtual so it dispatches dynamically to Derived::v (\"Dv\"); nv() is non-virtual so it binds statically to the pointer's type Base, calling Base::nv (\"Bnv\"). Result: \"DvBnv\". Only virtual functions use the runtime type."
    }
  ]
};

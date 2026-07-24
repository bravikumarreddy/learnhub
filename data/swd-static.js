/* ===== C++ Software Design — CRTP, Concepts & Static Polymorphism ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["swd-static"] = {
  title: "C++ Software Design — CRTP, Concepts & Static Polymorphism",
  subtitle: "CRTP interfaces and mixins, C++20 concepts as the modern replacement, compile-time vs runtime dispatch.",
  crumb: "C++ Software Design",
  questions: [
    {
      "type": "mcq",
      "tag": "CRTP Mechanics",
      "question": "Which class definition is an example of the Curiously Recurring Template Pattern (CRTP)?",
      "options": [
        "class Circle : public Shape<Circle> {};",
        "class Circle : public virtual Shape {};",
        "template <typename T> class Circle : public Shape<T> {};",
        "class Circle : public Shape<Square> {};"
      ],
      "answer": 0,
      "explain": "CRTP means a class derives from a class template and passes *itself* as the template argument, so the base knows its concrete derived type at compile time. Option 3 is precisely the classic copy-paste bug (deriving from a CRTP base instantiated with a different class), and option 1 is ordinary runtime polymorphism machinery."
    },
    {
      "type": "code",
      "tag": "CRTP Mechanics",
      "question": "A static interface built with CRTP. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename Derived>\nclass Shape {\npublic:\n    void draw() const { static_cast<Derived const&>(*this).drawImpl(); }\n};\nclass Circle : public Shape<Circle> {\npublic:\n    void drawImpl() const { std::cout << \"Circle \"; }\n};\nclass Square : public Shape<Square> {\npublic:\n    void drawImpl() const { std::cout << \"Square \"; }\n};\ntemplate <typename T>\nvoid render(Shape<T> const& s) { s.draw(); }\nint main() { Circle c; Square s; render(c); render(s); }",
      "options": [
        "It fails to compile: Shape<T> declares no drawImpl",
        "Square Square ",
        "Circle Square ",
        "Undefined behavior: the static_cast may fail at run time"
      ],
      "answer": 2,
      "explain": "Shape<Derived> downcasts *this to the concrete type it received as a template argument and calls drawImpl on it, so each call resolves at compile time to the right implementation: Circle Square. The base never needs to declare drawImpl itself because the call is only looked up when Shape<Derived>::draw is instantiated, at which point Derived is complete. No virtual dispatch and no runtime check is involved."
    },
    {
      "type": "mcq",
      "tag": "CRTP Mechanics",
      "question": "In CRTP, how can the base class Shape<Derived> invoke the correct derived-class implementation without any virtual functions?",
      "options": [
        "The compiler inserts a hidden vtable pointer for class template bases",
        "The base knows the concrete derived type at compile time through its template parameter and downcasts with static_cast<Derived&>(*this)",
        "It uses dynamic_cast, which resolves the actual type at run time",
        "Name lookup finds the derived function through argument-dependent lookup"
      ],
      "answer": 1,
      "explain": "The derived class hands its own type to the base as a template argument, so inside the base the exact dynamic type is already known statically. static_cast<Derived&>(*this) performs the downcast with zero runtime cost, and the subsequent member call binds at compile time. That is the whole trick: the 'polymorphism' is resolved by the compiler, not by a vtable."
    },
    {
      "type": "code",
      "tag": "CRTP Mechanics",
      "question": "The base provides a default greetImpl. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nclass Base {\npublic:\n    void greet() const { static_cast<D const&>(*this).greetImpl(); }\n    void greetImpl() const { std::cout << \"generic \"; }\n};\nclass English : public Base<English> {\npublic:\n    void greetImpl() const { std::cout << \"hello \"; }\n};\nclass Silent : public Base<Silent> {};\nint main() { English e; Silent s; e.greet(); s.greet(); }",
      "options": [
        "generic generic ",
        "It fails to compile: Silent lacks greetImpl",
        "hello hello ",
        "hello generic "
      ],
      "answer": 3,
      "explain": "For English, the cast to English const& makes name lookup start in the derived class, where greetImpl hides the base version, so \"hello \" is printed. Silent defines no greetImpl, so lookup on Silent proceeds into the base class and finds the default, printing \"generic \". This name-hiding mechanism is how CRTP interfaces offer overridable default implementations without virtual."
    },
    {
      "type": "mcq",
      "tag": "CRTP Mechanics",
      "question": "Why does the CRTP base use static_cast rather than dynamic_cast for the downcast to Derived?",
      "options": [
        "static_cast is required: dynamic_cast needs a polymorphic (virtual-function-bearing) source type and would not even compile here, while the downcast is known valid by construction of the pattern",
        "dynamic_cast would also work but is merely stylistically discouraged",
        "static_cast checks the cast at run time and throws on mismatch",
        "reinterpret_cast would be equally safe and is sometimes preferred"
      ],
      "answer": 0,
      "explain": "A CRTP base has no virtual functions, and dynamic_cast to a derived type requires a polymorphic source class, so it is not an option. More importantly, it is unnecessary: as long as every class X derives from Base<X>, the object really is a Derived, so the unchecked static_cast is safe and free. This is exactly the compile-time knowledge that virtual dispatch lacks."
    },
    {
      "type": "code",
      "tag": "CRTP Mixin",
      "question": "The Doubler mixin calls back into the class deriving from it. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct Doubler {\n    int twice() const { return 2 * static_cast<D const&>(*this).value(); }\n};\nstruct Num : Doubler<Num> {\n    int value() const { return 21; }\n};\nint main() { std::cout << Num{}.twice(); }",
      "options": [
        "It fails to compile: Doubler<Num> uses Num before Num is complete",
        "23",
        "0",
        "42"
      ],
      "answer": 3,
      "explain": "Although Num is incomplete when Doubler<Num> appears in its base-clause, the body of twice() is only instantiated when it is called, and by then Num is complete — this deferred instantiation is what makes CRTP legal at all. twice() casts to Num const& and calls value(), returning 2*21 = 42."
    },
    {
      "type": "code",
      "tag": "CRTP Mixin",
      "question": "This CRTP base enables fluent chaining. What does the program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nclass Fluent {\npublic:\n    D& bold()   { std::cout << \"b\"; return self(); }\n    D& italic() { std::cout << \"i\"; return self(); }\nprivate:\n    D& self() { return static_cast<D&>(*this); }\n};\nclass Text : public Fluent<Text> {\npublic:\n    Text& print() { std::cout << \"p\"; return *this; }\n};\nint main() { Text t; t.bold().italic().print(); }",
      "options": [
        "bip",
        "It fails to compile: bold() returns Fluent<Text>&, which has no print()",
        "bp",
        "ibp"
      ],
      "answer": 0,
      "explain": "The key detail is that bold() and italic() return self(), i.e. D& = Text&, not Fluent<Text>&. Because the chain never degrades to the base type, t.bold().italic().print() can finish with the derived-only member print(). Output is \"bip\". Returning the base type instead is the classic way fluent APIs break under inheritance, and CRTP is the standard fix."
    },
    {
      "type": "mcq",
      "tag": "CRTP Pitfall",
      "question": "Why must a CRTP base class never invoke the derived implementation (via static_cast<Derived&>(*this)) from its own constructor?",
      "options": [
        "Because the derived constructor runs first, members would be double-initialized",
        "It is actually fine, since the cast target is known at compile time",
        "During the base-class constructor the Derived object has not begun its lifetime, so using the result of the downcast to access derived members is undefined behavior",
        "Because CRTP bases are not allowed to declare constructors"
      ],
      "answer": 2,
      "explain": "Base subobjects are constructed before the derived object, so while Base<Derived>'s constructor runs there is no Derived object yet — its members are uninitialized and its invariants not established. Casting to Derived& and touching its members at that point is undefined behavior. This mirrors the classic 'no virtual calls in constructors' rule, but with CRTP nothing even slows down to catch you."
    },
    {
      "type": "mcq",
      "tag": "Design Guideline",
      "question": "According to C++ Software Design, which use of CRTP should you avoid?",
      "options": [
        "Using CRTP to implement static mixin classes such as operator-generating bases",
        "Using CRTP as an 'ersatz' runtime abstraction — treating the CRTP base like a classic polymorphic interface for clients",
        "Using CRTP to define static type categories for a family of related types",
        "Combining CRTP with the hidden friends idiom"
      ],
      "answer": 1,
      "explain": "Iglberger's guideline is that CRTP shines for static mixins and static type categories, but it is a poor substitute for a runtime interface: there is no common base type, everything touching it becomes a template, and virtual-like flexibility is absent. If you need a static interface today, C++20 concepts express it more directly; if you need runtime polymorphism, use a real abstraction."
    },
    {
      "type": "code",
      "tag": "Static vs Dynamic",
      "question": "A uses an (empty) CRTP base; B uses a virtual destructor. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct StaticShape {};\nstruct A : StaticShape<A> { int area = 0; };\nstruct B { virtual ~B() = default; int area = 0; };\nint main() {\n    std::cout << (sizeof(A) == sizeof(int)) << (sizeof(B) > sizeof(int));\n}",
      "options": [
        "01",
        "00",
        "11",
        "10"
      ],
      "answer": 2,
      "explain": "The empty CRTP base is eligible for the empty base optimization, so A is exactly the size of its int and the first comparison prints 1. B needs a vptr for its vtable, so its size exceeds sizeof(int) (typically 16 bytes with alignment), printing 1 again. Zero per-object space overhead is one of the concrete advantages of static polymorphism."
    },
    {
      "type": "mcq",
      "tag": "CRTP Pitfall",
      "question": "The book highlights a consequence of using CRTP as a static interface: what happens to every function that wants to operate on the 'interface' Shape<T>?",
      "options": [
        "It becomes a virtual member function, reintroducing dynamic dispatch",
        "It becomes a constexpr function evaluated at compile time",
        "It becomes a friend function found only by ADL",
        "It becomes a function template parameterized on the concrete type — callers become templates too, spreading template code and header dependencies through the codebase"
      ],
      "answer": 3,
      "explain": "Since Shape<Circle> and Shape<Square> are different types, any function accepting 'any shape' must be a template over T, and so must its callers, transitively. That pushes implementations into headers, increases compile times, and infects the design with templates — one of the main reasons the book cautions against CRTP as a general abstraction mechanism."
    },
    {
      "type": "mcq",
      "tag": "Static Interface",
      "question": "In the book's linear-algebra example, what is the purpose of a CRTP base class like DenseVector<Derived>?",
      "options": [
        "It defines a static type category: a compile-time 'interface' plus shared operations for all dense vector types, with no runtime dispatch overhead",
        "It provides a common runtime base class so all vectors can be stored in one container",
        "It exists only to give every vector a virtual destructor",
        "It caches the results of expensive vector operations between calls"
      ],
      "answer": 0,
      "explain": "DenseVector<Derived> expresses that Derived belongs to the family of dense vectors and centralizes common operations, all resolved statically — this is Iglberger's 'static type category' use of CRTP. It deliberately does not provide a common base type for heterogeneous storage; that would require dynamic polymorphism."
    },
    {
      "type": "code",
      "tag": "CRTP Pitfall",
      "question": "Type traits applied to two CRTP-derived shape classes. What does this program print?",
      "code": "#include <iostream>\n#include <type_traits>\ntemplate <typename D>\nstruct Shape {};\nstruct Circle : Shape<Circle> {};\nstruct Square : Shape<Square> {};\nint main() {\n    std::cout << std::is_base_of_v<Shape<Circle>, Circle>\n              << std::is_base_of_v<Shape<Circle>, Square>\n              << std::is_same_v<Shape<Circle>, Shape<Square>>;\n}",
      "options": [
        "111",
        "100",
        "110",
        "000"
      ],
      "answer": 1,
      "explain": "Shape<Circle> is a base of Circle (1), but it is not a base of Square — Square derives from Shape<Square>, a completely different instantiation (0). And Shape<Circle> and Shape<Square> are distinct, unrelated types (0). Every CRTP instantiation is its own class, which is exactly why CRTP provides no common base type."
    },
    {
      "type": "mcq",
      "tag": "CRTP Pitfall",
      "question": "Why can't Circle : Shape<Circle> and Square : Shape<Square> be stored together in one std::vector through a common base pointer?",
      "options": [
        "Because Shape<Circle> and Shape<Square> are two unrelated types — each CRTP instantiation is a distinct base class, so there is no single base to point to",
        "Because CRTP bases conventionally have protected destructors",
        "Because a class template cannot serve as the base class of more than one type",
        "They can, as long as the vector stores Shape<void>*"
      ],
      "answer": 0,
      "explain": "A class template is not a type; only its instantiations are, and Shape<Circle> shares nothing with Shape<Square>. Consequently there is no common pointer type spanning all shapes — the defining limitation the book stresses when warning against CRTP as a replacement for runtime interfaces. Shape<void> would just be yet another unrelated instantiation."
    },
    {
      "type": "code",
      "tag": "CRTP Pitfall",
      "question": "An attempt to store different CRTP-derived shapes in one vector. What happens when this is compiled?",
      "code": "#include <vector>\ntemplate <typename D>\nstruct Shape {};\nstruct Circle : Shape<Circle> {};\nstruct Square : Shape<Square> {};\nint main() {\n    std::vector<Shape<Circle>*> shapes;\n    Circle c;\n    Square s;\n    shapes.push_back(&c);\n    shapes.push_back(&s);\n}",
      "options": [
        "It compiles; both shapes are stored via their common Shape base",
        "It compiles, but calling functions through the stored pointers is undefined behavior",
        "The second push_back fails to compile: Square* cannot convert to Shape<Circle>*, because Square derives from Shape<Square>, an unrelated type",
        "The vector declaration itself fails: class templates cannot be pointer element types"
      ],
      "answer": 2,
      "explain": "shapes stores Shape<Circle>*, and &c converts fine because Circle derives from Shape<Circle>. But Square's base is Shape<Square> — a different type with no relationship to Shape<Circle> — so &s has no conversion and push_back(&s) is a compile error. This is the 'no common base type' limitation of CRTP made concrete."
    },
    {
      "type": "code",
      "tag": "Wrong-Derived Bug",
      "question": "Note the copy-paste bug: Gadget derives from Counted<Widget>. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct Counted {\n    static inline int created = 0;\n    Counted() { ++created; }\n};\nstruct Widget : Counted<Widget> {};\nstruct Gadget : Counted<Widget> {};\nint main() {\n    Widget w1, w2;\n    Gadget g;\n    std::cout << Counted<Widget>::created << ' ' << Counted<Gadget>::created;\n}",
      "options": [
        "2 1",
        "It fails to compile: Gadget must pass itself to Counted",
        "3 0 — Gadget silently increments Widget's counter, because nothing forces the template argument to match the deriving class",
        "2 0"
      ],
      "answer": 2,
      "explain": "Nothing in the language ties the template argument of a CRTP base to the class deriving from it, so 'struct Gadget : Counted<Widget>' compiles cleanly. Constructing g runs Counted<Widget>'s constructor, bumping Widget's counter to 3, while Counted<Gadget> was never instantiated as anyone's base and stays 0. The bug is silent — which is why a guard idiom is recommended."
    },
    {
      "type": "code",
      "tag": "Guard Idiom",
      "question": "The base guards itself with a private constructor plus friend declaration. What happens?",
      "code": "template <typename D>\nclass Base {\nprivate:\n    Base() = default;\n    friend D;\n};\nstruct Widget : Base<Widget> {};\nstruct Gadget : Base<Widget> {};\nint main() {\n    Widget w;\n    Gadget g;\n}",
      "options": [
        "It compiles and runs; friendship is inherited by classes derived from the friend",
        "Widget w; fails: the private constructor blocks all derived classes",
        "Both object definitions fail: a class cannot befriend its own template parameter",
        "Gadget g; fails to compile: only Widget is a friend of Base<Widget>, so Gadget cannot invoke the private default constructor"
      ],
      "answer": 3,
      "explain": "Base<D> makes its constructor private and befriends exactly D. Widget is the friend of Base<Widget>, so Widget w; is fine, but Gadget — deriving from Base<Widget> due to the copy-paste bug — is not a friend and cannot call the base constructor, so its implicit default constructor is deleted and Gadget g; fails to compile. The guard idiom turns the silent wrong-derived bug into a compile error."
    },
    {
      "type": "code",
      "tag": "Wrong-Derived Bug",
      "question": "B mistakenly derives from Base<A>. What is the outcome?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct Base {\n    int read() const { return static_cast<D const&>(*this).value; }\n};\nstruct A : Base<A> { int value = 1; };\nstruct B : Base<A> { int value = 2; };\nint main() {\n    B b;\n    std::cout << b.read();\n}",
      "options": [
        "It fails to compile: B does not derive from A",
        "It compiles, but read() static_casts the Base<A> subobject to A while the actual object is a B — undefined behavior (in practice it often appears to print 2 by layout coincidence)",
        "It reliably prints 1, because the cast target A has value = 1",
        "It reliably prints 0"
      ],
      "answer": 1,
      "explain": "b.read() executes static_cast<A const&>(*this) on an object whose dynamic type is B, which contains a Base<A> subobject but no A subobject — the cast's precondition is violated, so the behavior is undefined. Because A and B happen to have identical layouts, typical builds print 2, which makes the bug even more insidious: it 'works' until it doesn't. The static_cast that makes CRTP fast is also what makes this mistake unchecked."
    },
    {
      "type": "mcq",
      "tag": "CRTP Pitfall",
      "question": "How should destruction be handled for a CRTP base class?",
      "options": [
        "Give it a public virtual destructor, like any other base class",
        "Delete the destructor entirely",
        "CRTP bases never need destructors because they cannot hold data",
        "Keep the destructor non-virtual and non-public (e.g. protected): CRTP objects are never deleted through a base pointer, so a virtual destructor would only add a vtable for nothing"
      ],
      "answer": 3,
      "explain": "Nobody should ever own or delete an object through Base<D>*, so a virtual destructor would betray the whole point of CRTP by adding a vptr and vtable. The idiomatic protection is a protected, non-virtual destructor: derived classes destroy fine, while accidental delete-through-base fails to compile. This follows the general rule: make base destructors either public-and-virtual or protected-and-non-virtual."
    },
    {
      "type": "mcq",
      "tag": "Heterogeneous Storage",
      "question": "You need to iterate over a mixed collection of Circles and Squares but want to avoid virtual functions. Which tool fits, according to the book?",
      "options": [
        "std::variant<Circle, Square> plus std::visit — a closed set of alternatives dispatched without inheritance",
        "A std::vector<void*> with manual casts based on a stored type code",
        "CRTP — the shared Shape<T> base enables heterogeneous storage",
        "std::any with any_cast attempts in a chain of ifs"
      ],
      "answer": 0,
      "explain": "CRTP cannot help here because its base instantiations are unrelated types. For a known, closed set of alternatives, std::variant provides value-semantic heterogeneous storage and std::visit dispatches over the alternatives without any inheritance — the design the book develops for the 'procedural' variant solution. void* and std::any sacrifice type safety and structure."
    },
    {
      "type": "mcq",
      "tag": "CRTP Mixin",
      "question": "What is Iglberger's recommended 'sweet spot' for CRTP (Guideline: use CRTP for static mixin classes)?",
      "options": [
        "A full replacement for virtual functions in large class hierarchies",
        "Static mixin classes that inject capabilities — operators, counters, and similar — into the deriving class with zero runtime cost",
        "Implementing singletons safely",
        "It should never be used at all now that C++20 has concepts"
      ],
      "answer": 1,
      "explain": "The book distinguishes CRTP-as-interface (avoid: no common base, templates everywhere) from CRTP-as-mixin (embrace: the base contributes implementation, not abstraction). Mixins like EqualityComparable<D> or instance counters add functionality to D at compile time, cost nothing at run time, and don't pretend to be a polymorphic interface. Concepts replace the interface use, not the mixin use."
    },
    {
      "type": "code",
      "tag": "CRTP Mixin",
      "question": "What does this instance-counting mixin program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct InstanceCounter {\n    static inline int alive = 0;\n    InstanceCounter() { ++alive; }\n    InstanceCounter(InstanceCounter const&) { ++alive; }\n    ~InstanceCounter() { --alive; }\n};\nstruct Widget : InstanceCounter<Widget> {};\nstruct Gadget : InstanceCounter<Gadget> {};\nint main() {\n    Widget w1, w2;\n    Gadget g;\n    std::cout << Widget::alive << Gadget::alive;\n}",
      "options": [
        "33",
        "30",
        "3",
        "21"
      ],
      "answer": 3,
      "explain": "Because Widget derives from InstanceCounter<Widget> and Gadget from InstanceCounter<Gadget>, each gets its own instantiation of the base — and therefore its own 'alive' static. Two live Widgets and one live Gadget print 21. The per-type counter works precisely because each CRTP instantiation is a distinct class; a plain (non-template) base would share one counter across all types."
    },
    {
      "type": "code",
      "tag": "CRTP Mixin",
      "question": "Money derives privately from the mixin. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct EqualityComparable {\n    friend bool operator!=(D const& a, D const& b) { return !(a == b); }\n};\nclass Money : private EqualityComparable<Money> {\n    int cents;\npublic:\n    explicit Money(int c) : cents(c) {}\n    friend bool operator==(Money const& a, Money const& b) { return a.cents == b.cents; }\n};\nint main() {\n    Money a{100}, b{250};\n    std::cout << (a != b) << (a != a);\n}",
      "options": [
        "10",
        "It fails to compile: EqualityComparable is a private base, so operator!= is inaccessible",
        "01",
        "It fails to compile: operator!= must be a member function"
      ],
      "answer": 0,
      "explain": "The mixin's operator!= is a hidden friend: it is not a member, so base-class access control does not apply to calling it. Argument-dependent lookup considers the base classes of Money's type (even private ones) when collecting associated classes, finds the friend, and a != b evaluates !(a == b) → 1, while a != a → 0. Private inheritance is idiomatic here since the mixin is an implementation detail."
    },
    {
      "type": "code",
      "tag": "CRTP Mixin",
      "question": "The Ordered mixin derives three comparisons from operator<. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct Ordered {\n    friend bool operator>(D const& a, D const& b)  { return b < a; }\n    friend bool operator<=(D const& a, D const& b) { return !(b < a); }\n    friend bool operator>=(D const& a, D const& b) { return !(a < b); }\n};\nclass Version : public Ordered<Version> {\n    int v;\npublic:\n    explicit Version(int v) : v(v) {}\n    friend bool operator<(Version const& a, Version const& b) { return a.v < b.v; }\n};\nint main() {\n    Version a{1}, b{2};\n    std::cout << (a > b) << (a <= b) << (b >= a);\n}",
      "options": [
        "101",
        "011",
        "010",
        "It fails to compile: Version defines only operator<"
      ],
      "answer": 1,
      "explain": "With a=1, b=2: a>b is b<a → false (0); a<=b is !(b<a) → true (1); b>=a is !(b<a) → true (1). Output 011. The mixin manufactures a full ordering interface from the single operator< the class author writes — the classic operator-generation use of CRTP (note C++20's rewritten-operator rules only auto-generate from <=> and ==, not from <)."
    },
    {
      "type": "mcq",
      "tag": "Barton–Nackman",
      "question": "A class template base that injects friend operator functions, so that deriving classes obtain a complete operator set from one user-defined operator, is historically known as what?",
      "options": [
        "Argument-dependent lookup poisoning",
        "The Pimpl idiom",
        "The Barton–Nackman trick (restricted template expansion)",
        "Tag dispatch"
      ],
      "answer": 2,
      "explain": "John Barton and Lee Nackman used friend-function injection from a class template base to define operators for the deriving class — originally to work around missing function-template overloading in early compilers. Today the same shape survives as CRTP operator mixins (Boost.Operators being the famous example), with the injected friends found via ADL."
    },
    {
      "type": "code",
      "tag": "Strong Types",
      "question": "StrongType uses a tag parameter and an Addable mixin. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct Addable {\n    friend D operator+(D const& a, D const& b) { return D{a.get() + b.get()}; }\n};\ntemplate <typename T, typename Tag>\nclass StrongType : public Addable<StrongType<T, Tag>> {\n    T value;\npublic:\n    explicit StrongType(T v) : value(v) {}\n    T const& get() const { return value; }\n};\nusing Meter  = StrongType<long, struct MeterTag>;\nusing Second = StrongType<long, struct SecondTag>;\nint main() {\n    Meter m = Meter{2} + Meter{3};\n    std::cout << m.get();\n}",
      "options": [
        "It fails to compile: StrongType declares no operator+",
        "23",
        "Undefined behavior: Addable casts to the wrong type",
        "5"
      ],
      "answer": 3,
      "explain": "Meter derives from Addable<Meter>, whose hidden friend operator+ builds D{a.get() + b.get()}; ADL finds it through the base class, so Meter{2} + Meter{3} yields Meter{5} and prints 5. This is the strong-type recipe: a thin wrapper gains exactly the operations you opt into via mixins, with no runtime overhead."
    },
    {
      "type": "code",
      "tag": "Strong Types",
      "question": "This StrongType library distinguishes units via tag types. What happens when Meter and Second are mixed?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct Addable {\n    friend D operator+(D const& a, D const& b) { return D{a.get() + b.get()}; }\n};\ntemplate <typename T, typename Tag>\nclass StrongType : public Addable<StrongType<T, Tag>> {\n    T value;\npublic:\n    explicit StrongType(T v) : value(v) {}\n    T const& get() const { return value; }\n};\nusing Meter  = StrongType<long, struct MeterTag>;\nusing Second = StrongType<long, struct SecondTag>;\nint main() {\n    auto x = Meter{2} + Second{3};\n    std::cout << x.get();\n}",
      "options": [
        "8",
        "5",
        "It compiles because both wrap long, and prints 5",
        "It fails to compile: Meter and Second are distinct types, and operator+ exists only for two operands of the same StrongType instantiation"
      ],
      "answer": 3,
      "explain": "The tag parameters make StrongType<long, MeterTag> and StrongType<long, SecondTag> unrelated types even though both wrap long. Each Addable instantiation defines operator+ for one D only, so no overload accepts (Meter, Second) and the program is ill-formed. That compile error is the entire point of strong types: unit mix-ups die at compile time instead of producing wrong numbers."
    },
    {
      "type": "code",
      "tag": "Variadic Mixins",
      "question": "Skills are supplied as template template parameters. What does this program print?",
      "code": "#include <iostream>\ntemplate <typename D> struct Printable    { void print() const { std::cout << \"print \"; } };\ntemplate <typename D> struct Serializable { void save()  const { std::cout << \"save \";  } };\ntemplate <template <typename> class... Skills>\nclass Widget : public Skills<Widget<Skills...>>... {};\nint main() {\n    Widget<Printable, Serializable> w;\n    w.print();\n    w.save();\n}",
      "options": [
        "print save ",
        "It fails to compile: a parameter pack cannot be expanded in a base-clause",
        "save print ",
        "It fails to compile: Widget passes itself to its bases while still incomplete"
      ],
      "answer": 0,
      "explain": "The pack expansion Skills<Widget<Skills...>>... makes Widget derive from Printable<Widget<...>> and Serializable<Widget<...>>, so w has both print() and save(); the calls print \"print save \". Using the incomplete Widget as a template argument in its own base-clause is fine because the mixin bodies are only instantiated when called. This 'skills' pattern composes CRTP mixins à la carte."
    },
    {
      "type": "mcq",
      "tag": "Variadic Mixins",
      "question": "What is the main design benefit of the variadic CRTP 'skills' pattern, e.g. Widget<Printable, Serializable>?",
      "options": [
        "It allows adding and removing capabilities at run time",
        "Capabilities are composed à la carte at compile time: each combination is its own type that pays only for the skills it selects",
        "It reduces compile times compared to writing the members by hand",
        "It guarantees that the empty base optimization cannot apply"
      ],
      "answer": 1,
      "explain": "Each mixin contributes an orthogonal capability, and the variadic parameter list lets users pick any subset without a combinatorial explosion of handwritten classes. The composition is fixed at compile time — that is both its strength (zero overhead, type-safe) and its limitation (no runtime reconfiguration). EBO typically applies since the mixins are empty."
    },
    {
      "type": "mcq",
      "tag": "Deducing this",
      "question": "How does C++23 'deducing this' express what CRTP was traditionally needed for?",
      "options": [
        "By making the this pointer a runtime parameter of every member function",
        "By adding a new static_virtual dispatch keyword",
        "By declaring an explicit object parameter — e.g. template <typename Self> void interface(this Self&& self) — so a member function deduces the concrete type of the object it is invoked on",
        "By requiring all mixins to be written as lambdas"
      ],
      "answer": 2,
      "explain": "With an explicit object parameter, the implicit *this becomes an ordinary deduced function parameter. Call the inherited function on a Derived object and Self deduces to Derived, so a plain (non-template!) base class can reach derived members as self.impl() — no CRTP template parameter, no static_cast. This is why deducing this is regarded as the modern successor to many CRTP uses."
    },
    {
      "type": "mcq",
      "tag": "Deducing this",
      "question": "Compared to CRTP, what does the C++23 deducing-this approach eliminate for mixin-style code?",
      "options": [
        "It generates measurably faster code than CRTP",
        "It works in C++11 as well, unlike CRTP",
        "It enables virtual dispatch on the deduced type",
        "The mixin needs no template parameter and no static_cast: the concrete type is deduced per call, removing CRTP's boilerplate — and with it the wrong-template-argument bug"
      ],
      "answer": 3,
      "explain": "A deducing-this base is a normal class; the derived type is rediscovered at each call site through deduction of the explicit object parameter. Because the derived class no longer passes itself as a template argument, the copy-paste wrong-derived bug cannot occur, and no downcast is written by hand. Runtime performance is equivalent — both resolve statically."
    },
    {
      "type": "mcq",
      "tag": "Concepts vs CRTP",
      "question": "Why does C++ Software Design recommend C++20 concepts over CRTP for expressing static interfaces?",
      "options": [
        "Concepts are non-intrusive: types need no inheritance from a special base, requirements are stated directly on the template, and violations produce clearer errors at the call boundary",
        "Concepts perform runtime checks that CRTP cannot perform",
        "Concepts allow storing unrelated types in one container through a common base",
        "Concepts automatically generate operators the way CRTP mixins do"
      ],
      "answer": 0,
      "explain": "A concept states 'what a type must provide' without demanding that the type derive from anything, so third-party and built-in types can satisfy it as-is. Constrained templates get checked where they are called, giving named, comprehensible diagnostics. Concepts still yield compile-time polymorphism — they don't provide runtime dispatch or heterogeneous storage, and they don't inject code like mixins."
    },
    {
      "type": "code",
      "tag": "Concepts",
      "question": "render is constrained by the Drawable concept instead of a CRTP base. What does this program print?",
      "code": "#include <concepts>\n#include <iostream>\ntemplate <typename T>\nconcept Drawable = requires(T t) { { t.draw() } -> std::same_as<void>; };\nstruct Circle { void draw() const { std::cout << \"Circle \"; } };\nstruct Square { void draw() const { std::cout << \"Square \"; } };\nvoid render(Drawable auto const& shape) { shape.draw(); }\nint main() { render(Circle{}); render(Square{}); }",
      "options": [
        "It fails to compile: Circle and Square do not inherit from Drawable",
        "It fails to compile: a concept cannot constrain an auto parameter",
        "Circle Square ",
        "Circle Circle "
      ],
      "answer": 2,
      "explain": "Drawable is satisfied by any type with a void-returning draw(); no inheritance is involved — that is the point of replacing CRTP interfaces with concepts. 'Drawable auto const&' is a constrained placeholder making render an abbreviated function template, instantiated separately for Circle and Square. Output: Circle Square."
    },
    {
      "type": "code",
      "tag": "CRTP + Concepts",
      "question": "The CRTP base probes the derived class with a requires-expression. What does this print?",
      "code": "#include <iostream>\ntemplate <typename D>\nstruct Base {\n    void describe() const {\n        if constexpr (requires(D const d) { d.label(); })\n            static_cast<D const&>(*this).label();\n        else\n            std::cout << \"anon \";\n    }\n};\nstruct Named : Base<Named> { void label() const { std::cout << \"named \"; } };\nstruct Plain : Base<Plain> {};\nint main() { Named n; Plain p; n.describe(); p.describe(); }",
      "options": [
        "named named ",
        "named anon ",
        "It fails to compile: requires-expressions cannot appear inside if constexpr",
        "anon anon "
      ],
      "answer": 1,
      "explain": "Inside describe(), the requires-expression is a compile-time boolean testing whether D has a callable label(). For Named it is true, so the downcast branch is instantiated and prints \"named \"; for Plain it is false and the discarded branch is never instantiated, so the fallback prints \"anon \". Combining if constexpr with ad hoc requires-expressions is the modern way to give CRTP bases optional customization points."
    },
    {
      "type": "mcq",
      "tag": "Concepts",
      "question": "What does the construct `template <typename T> requires requires(T t) { t.begin(); } void f(T);` mean?",
      "options": [
        "It is a syntax error — the keyword cannot appear twice in a row",
        "It doubles the strictness of the constraint check",
        "The second requires names a standard library concept",
        "The first requires begins the requires-clause; the second introduces an anonymous, ad hoc requires-expression used as the constraint — often a hint that a named concept would be cleaner"
      ],
      "answer": 3,
      "explain": "requires plays two roles: a requires-clause attaches constraints to a declaration, and a requires-expression is a compile-time predicate over expressions. 'requires requires' is the clause immediately followed by an inline expression. It's legal and sometimes convenient, but naming the requirement as a concept documents intent and enables reuse and subsumption."
    },
    {
      "type": "code",
      "tag": "Constrained Overloads",
      "question": "One overload is constrained, one is not. What does this program print?",
      "code": "#include <iostream>\n#include <vector>\ntemplate <typename T>\nrequires requires(T t) { t.begin(); }\nvoid probe(T const&) { std::cout << \"range \"; }\ntemplate <typename T>\nvoid probe(T const&) { std::cout << \"scalar \"; }\nint main() {\n    std::vector<int> v;\n    probe(v);\n    probe(42);\n}",
      "options": [
        "range scalar ",
        "It fails to compile: probe(v) is ambiguous",
        "scalar scalar ",
        "range range "
      ],
      "answer": 0,
      "explain": "For the vector, both templates are viable and otherwise tied; the partial-ordering tiebreaker prefers the more constrained candidate, so the requires-clause version wins and prints \"range \". For 42, the constraint fails, that candidate drops out of the overload set (no hard error), and the unconstrained fallback prints \"scalar \". Constraints both prune and prioritize overloads."
    },
    {
      "type": "code",
      "tag": "Concepts",
      "question": "IntCountable uses a compound requirement with std::same_as. What does this print?",
      "code": "#include <concepts>\n#include <iostream>\ntemplate <typename T>\nconcept IntCountable = requires(T t) { { t.count() } -> std::same_as<int>; };\nstruct A { int  count() const { return 1; } };\nstruct B { long count() const { return 1; } };\nint main() { std::cout << IntCountable<A> << IntCountable<B>; }",
      "options": [
        "11",
        "00",
        "It fails to compile: count() is const but t is not",
        "10"
      ],
      "answer": 3,
      "explain": "The compound requirement { t.count() } -> std::same_as<int> checks that the expression is valid AND that its type is exactly int. A::count() returns int → true; B::count() returns long, and same_as demands identity, not convertibility → false. Printed as booleans: 10. Use std::convertible_to when 'close enough' types should also satisfy the concept."
    },
    {
      "type": "code",
      "tag": "Constrained Overloads",
      "question": "info has a concept-constrained template overload and a C-style ellipsis fallback. What does this program print?",
      "code": "#include <iostream>\n#include <string>\ntemplate <typename T>\nconcept HasSize = requires(T const t) { t.size(); };\ntemplate <HasSize T> void info(T const&) { std::cout << \"sized \"; }\nvoid info(...)                           { std::cout << \"plain \"; }\nint main() {\n    std::string s = \"hi\";\n    info(s);\n    info(42);\n}",
      "options": [
        "sized sized ",
        "plain plain ",
        "sized plain ",
        "It fails to compile: int does not satisfy HasSize, which is a hard error"
      ],
      "answer": 2,
      "explain": "std::string has size(), so the constrained template wins over the ... fallback (a real ellipsis match is the worst possible conversion sequence) and prints \"sized \". For 42, HasSize is unsatisfied, so the template is removed from the overload set — silently, like SFINAE — and the variadic fallback prints \"plain \". Unsatisfied constraints only become hard errors when no alternative remains."
    },
    {
      "type": "code",
      "tag": "Constrained auto",
      "question": "A constrained placeholder type receives a double. What happens when this is compiled?",
      "code": "#include <concepts>\nint main() {\n    std::integral auto count = 3.14;\n}",
      "options": [
        "count is a double holding 3.14",
        "count is an int holding 3 — the initializer is converted",
        "It fails to compile: the deduced type double does not satisfy std::integral",
        "It compiles, but count is left uninitialized"
      ],
      "answer": 2,
      "explain": "A constrained placeholder first deduces the type exactly as plain auto would — here double — and then checks the concept against the result. std::integral<double> is false, so the declaration is ill-formed; no conversion to a satisfying type is ever attempted. Constrained auto is an assertion about what you got, not a request to convert."
    },
    {
      "type": "mcq",
      "tag": "Concepts",
      "question": "During overload resolution, what happens when the concept constraining a function template is not satisfied for the deduced arguments?",
      "options": [
        "A hard compile error is issued at the concept's definition",
        "The candidate is removed from the overload set so other overloads can win; an error occurs only if no viable candidate remains",
        "The compiler inserts a runtime check before the call",
        "The concept is re-evaluated with implicit conversions applied to the arguments"
      ],
      "answer": 1,
      "explain": "Unsatisfied constraints behave like SFINAE, quietly discarding the candidate — which is what makes constrained overload sets composable: you can layer a constrained fast path over a general fallback. Only when the failing candidate was the sole option does the compiler report an error, and then it names the violated concept, which is far more readable than a deep instantiation backtrace."
    },
    {
      "type": "mcq",
      "tag": "Concept Design",
      "question": "What is the relationship between the syntactic and the semantic requirements of a concept?",
      "options": [
        "The compiler verifies both the syntax and the semantics of a concept",
        "Semantic requirements are enforced by static_assert inside the concept body",
        "A concept can only check syntax — that expressions compile and types match; semantic guarantees (e.g. that == is an equivalence relation, or that copies are independent) remain a documented contract the modeling type must uphold",
        "Semantics are checked by the linker when instantiations are merged"
      ],
      "answer": 2,
      "explain": "requires-expressions test compilability, not meaning: a type whose operator== returns random booleans still 'satisfies' std::equality_comparable syntactically. The book stresses that a good concept carries semantics — algorithms are written against that contract, and violating it yields wrong behavior, not compile errors. Documenting semantics is part of designing the concept."
    },
    {
      "type": "mcq",
      "tag": "Concept Design",
      "question": "What is an 'archetype' in the context of testing constrained templates?",
      "options": [
        "A deliberately minimal test type implementing exactly the operations the concept requires — and nothing more — used to prove that a template does not quietly rely on extra operations",
        "The most feature-rich type known to satisfy the concept",
        "A macro that expands to all of the concept's requirements",
        "The primary template from which a concept is specialized"
      ],
      "answer": 0,
      "explain": "If a template constrained on concept C compiles when instantiated with C's archetype, it provably uses only what C guarantees. Testing with rich types like int or std::string hides over-reach because they support far more than the concept promises. Archetypes are the standard technique for validating that constraints are neither too weak for the implementation nor accidentally bypassed."
    },
    {
      "type": "mcq",
      "tag": "Concept Design",
      "question": "Which statement best describes a well-designed concept?",
      "options": [
        "It lists exactly the expressions one particular algorithm uses — ideally one concept per function",
        "It captures a coherent, reusable abstraction with meaningful semantics — like std::regular or a domain notion such as Drawable — rather than an incidental grab-bag of one function's syntactic needs",
        "It is always a pure conjunction of standard type traits",
        "Every class in the codebase should define a matching concept"
      ],
      "answer": 1,
      "explain": "Concepts modeled after real abstractions survive refactoring, compose via subsumption, and communicate intent; per-function requirement dumps multiply endlessly and mean nothing. The book echoes the standard-library philosophy: few, general concepts (Regular, Sortable, ...) with documented semantics beat many ad hoc ones. When you can't articulate the abstraction's meaning, that's a design smell."
    },
    {
      "type": "mcq",
      "tag": "Subsumption",
      "question": "Under what conditions does one concept subsume another, allowing the compiler to prefer the more constrained overload?",
      "options": [
        "Whenever its requirements happen to be a superset of the other's",
        "Subsumption is resolved dynamically at run time",
        "Subsumption is computed from conjunctions/disjunctions of atomic constraints, and textually identical requires-expressions in different concepts are still different atoms — so a finer concept must be built from the coarser one by name (Fine = Coarse<T> && ...) for the ordering to exist",
        "Only concepts in namespace std can subsume one another"
      ],
      "answer": 2,
      "explain": "The compiler never proves logical implication between arbitrary expressions; it only decomposes constraint expressions into atoms and checks containment, where atoms are identical only if they originate from the same declaration. Repeating the same requirements textually creates unrelated atoms and thus ambiguity. The design rule: layer concepts explicitly on top of each other."
    },
    {
      "type": "code",
      "tag": "Subsumption",
      "question": "Dog is defined as Animal<T> plus an extra requirement. What does this print?",
      "code": "#include <iostream>\ntemplate <typename T>\nconcept Animal = requires(T t) { t.name(); };\ntemplate <typename T>\nconcept Dog = Animal<T> && requires(T t) { t.bark(); };\nstruct Beagle {\n    void name() {}\n    void bark() {}\n};\ntemplate <Animal T> void identify(T) { std::cout << \"animal\"; }\ntemplate <Dog T>    void identify(T) { std::cout << \"dog\"; }\nint main() { identify(Beagle{}); }",
      "options": [
        "animal",
        "It fails to compile: the call is ambiguous",
        "It prints nothing",
        "dog"
      ],
      "answer": 3,
      "explain": "Beagle satisfies both concepts, so both overloads are viable. Because Dog is written as Animal<T> && ..., its constraint set contains Animal's atoms plus more, so Dog subsumes Animal and partial ordering picks the more constrained overload: \"dog\". This is the concept-based analog of derived-to-base overload preference, resolved entirely at compile time."
    },
    {
      "type": "code",
      "tag": "Subsumption",
      "question": "ReadWritable repeats t.read() instead of reusing Readable. What happens?",
      "code": "#include <iostream>\ntemplate <typename T>\nconcept Readable = requires(T t) { t.read(); };\ntemplate <typename T>\nconcept ReadWritable = requires(T t) { t.read(); t.write(); };\nstruct File { void read() {} void write() {} };\ntemplate <Readable T>     void open(T) { std::cout << \"r\"; }\ntemplate <ReadWritable T> void open(T) { std::cout << \"rw\"; }\nint main() { open(File{}); }",
      "options": [
        "rw — the more demanding concept wins",
        "It fails to compile: the call is ambiguous, because ReadWritable's textually repeated t.read() is a different atomic constraint than Readable's, so neither concept subsumes the other",
        "r — the earlier declared overload wins ties",
        "rrw — both overloads are invoked"
      ],
      "answer": 1,
      "explain": "Subsumption compares atomic constraints by identity of origin, not by text: the t.read() inside ReadWritable is a distinct atom from the one inside Readable. With no subsumption relation, both viable overloads are equally good and the call is ambiguous — a compile error. Defining ReadWritable as Readable<T> && requires(T t){ t.write(); } restores the ordering and selects \"rw\"."
    },
    {
      "type": "code",
      "tag": "Subsumption",
      "question": "Using the standard concepts, what does this program print?",
      "code": "#include <concepts>\n#include <iostream>\ntemplate <std::integral T>        void f(T) { std::cout << \"integral \"; }\ntemplate <std::signed_integral T> void f(T) { std::cout << \"signed \"; }\nint main() { f(42); f(42u); }",
      "options": [
        "integral integral ",
        "signed signed ",
        "It fails to compile: f(42) is ambiguous",
        "signed integral "
      ],
      "answer": 3,
      "explain": "std::signed_integral is defined as std::integral<T> && std::is_signed_v<T>, so it subsumes std::integral, and f(42) with int picks the more constrained overload: \"signed \". For 42u, signed_integral is unsatisfied, leaving only the integral overload: \"integral \". The standard concepts are deliberately layered this way so overload sets order themselves."
    },
    {
      "type": "mcq",
      "tag": "Static vs Dynamic",
      "question": "Which optimization advantage does static polymorphism (templates/CRTP/concepts) have over virtual functions?",
      "options": [
        "Calls are resolved at compile time, so they can be inlined and optimized further (constant propagation, vectorization) — which is impossible across an opaque virtual dispatch",
        "It reliably produces a smaller final binary",
        "It removes the need for a linker",
        "It makes debugging optimized builds easier"
      ],
      "answer": 0,
      "explain": "When the callee is known statically the optimizer can inline it and keep optimizing through the call — often the difference between a tight vectorized loop and a sequence of indirect calls. Binary size actually tends to grow with static polymorphism (instantiations), so option B has it backwards. This performance headroom is why performance-critical libraries favor static dispatch."
    },
    {
      "type": "mcq",
      "tag": "Static vs Dynamic",
      "question": "What causes the 'code bloat' associated with static polymorphism?",
      "options": [
        "Virtual functions duplicate their code once per derived class",
        "Templates share a single compiled body across all instantiations",
        "Each distinct combination of template arguments instantiates its own copy of the code, so heavily templated designs can substantially grow the binary",
        "Code bloat only occurs in unoptimized debug builds"
      ],
      "answer": 2,
      "explain": "A function template is a recipe: every distinct set of template arguments stamps out separate machine code. With CRTP interfaces, policies, and deep template compositions, the combinations multiply, inflating binaries and instruction-cache pressure. Dynamic polymorphism compiles one body called through indirection — the mirror-image tradeoff."
    },
    {
      "type": "mcq",
      "tag": "Static vs Dynamic",
      "question": "You are designing a plugin boundary where third parties ship separately compiled shared libraries against your stable interface. Which approach fits, and why?",
      "options": [
        "CRTP — static interfaces have the least overhead",
        "Concepts — constraints are verified across the shared-library boundary",
        "Expression templates",
        "A classic virtual interface: dynamic polymorphism provides a stable binary interface usable by separately compiled and shipped code, whereas templates must be visible as source and are instantiated at compile time"
      ],
      "answer": 3,
      "explain": "Templates (and thus CRTP and concepts) are a source-level, compile-time mechanism — the library author's compiler must see the concrete types, which is impossible when plugins are compiled later by someone else. An abstract base class compiled into the binary gives a fixed ABI contract that plugin authors implement. This is the 'binary interface' criterion the book lists in the static-vs-dynamic tradeoff."
    },
    {
      "type": "mcq",
      "tag": "Static vs Dynamic",
      "question": "How do error messages differ between an unconstrained template and a concept-constrained one when misused?",
      "options": [
        "Unconstrained: the error erupts deep inside the instantiation stack at the point of misuse; constrained: the violation is reported at the call boundary in terms of the named, unsatisfied requirement",
        "Concepts produce longer and more cryptic errors than unconstrained templates",
        "Both produce identical diagnostics since C++20",
        "Unconstrained templates defer their errors to link time"
      ],
      "answer": 0,
      "explain": "Without constraints, a bad argument type sails through the interface and fails wherever the first invalid expression is instantiated — possibly many layers deep in library internals. A concept moves the check to the front door and lets the compiler say which requirement of which concept failed. Better diagnostics are one of the book's core arguments for constraining templates."
    },
    {
      "type": "mcq",
      "tag": "Static vs Dynamic",
      "question": "According to the performance discussion, what is usually the dominant cost of virtual functions?",
      "options": [
        "The extra memory consumed by the vptr in each object",
        "The lost optimization opportunities — the compiler cannot inline or optimize across a runtime-resolved call — rather than the indirect jump itself",
        "The vtable lookup requires acquiring a mutex",
        "Building the vtables at program startup"
      ],
      "answer": 1,
      "explain": "The indirect call itself is cheap on modern, well-predicted hardware; what hurts is that an opaque call is an optimization barrier — no inlining, no constant propagation, no loop transformations across it. That's why devirtualization and static dispatch matter in hot loops, and why the cost is workload-dependent rather than a fixed per-call tax. The vptr's space cost is real but rarely dominant."
    },
    {
      "type": "mcq",
      "tag": "Static vs Dynamic",
      "question": "In which situation is dynamic (virtual) polymorphism the appropriate choice over static polymorphism?",
      "options": [
        "When peak performance in a tight inner loop is the top priority",
        "When all participating types are known at compile time",
        "When the set of concrete types is open and chosen at run time — user input, configuration, plugins — and objects must be handled uniformly through one interface (e.g. in heterogeneous collections)",
        "When you want the empty base optimization to apply"
      ],
      "answer": 2,
      "explain": "Static polymorphism requires the concrete types at compile time; if the type is decided while the program runs, or unrelated implementations must live behind one pointer in one container, you need a runtime abstraction. The book's advice is to pick the mechanism by the problem's nature — templates for compile-time variation, virtual interfaces (or type erasure) for runtime variation — not by performance folklore."
    },
    {
      "type": "mcq",
      "tag": "Policy Design",
      "question": "What is policy-based design?",
      "options": [
        "A design in which a host class template delegates configurable behavior — allocation, locking, formatting, deletion — to policy classes supplied as template parameters and composed at compile time",
        "A layer of virtual strategy objects injected through the constructor",
        "A runtime configuration file parsed at program startup",
        "A macro-based system for conditional compilation"
      ],
      "answer": 0,
      "explain": "Popularized by Alexandrescu's Modern C++ Design, the host template stitches together orthogonal policy classes chosen by its template arguments, generating a family of related classes from one implementation. Each behavioral axis is factored into its own small policy with a documented interface. It is compile-time dependency injection: flexibility without virtual dispatch."
    },
    {
      "type": "code",
      "tag": "Policy Design",
      "question": "VoicePolicy defaults to Quiet. What does this program print?",
      "code": "#include <iostream>\nstruct Loud  { static void speak() { std::cout << \"HELLO \"; } };\nstruct Quiet { static void speak() { std::cout << \"hi \"; } };\ntemplate <typename VoicePolicy = Quiet>\nclass Greeter {\npublic:\n    void greet() const { VoicePolicy::speak(); }\n};\nint main() {\n    Greeter<>     a;\n    Greeter<Loud> b;\n    a.greet();\n    b.greet();\n}",
      "options": [
        "HELLO hi ",
        "hi hi ",
        "It fails to compile: Greeter<> is invalid syntax",
        "hi HELLO "
      ],
      "answer": 3,
      "explain": "Greeter<> uses the default template argument Quiet (the angle brackets are required, but empty is fine pre-CTAD-style), so a.greet() prints \"hi \". Greeter<Loud> substitutes the other policy, printing \"HELLO \". Default policies give sensible out-of-the-box behavior while keeping every axis overridable — a hallmark of policy-based design."
    },
    {
      "type": "code",
      "tag": "Policy Design",
      "question": "Logger composes two orthogonal policies. What does this program print?",
      "code": "#include <cctype>\n#include <iostream>\n#include <string>\nstruct Upper { static std::string fmt(std::string s) { for (char& c : s) c = std::toupper(c); return s; } };\nstruct Raw   { static std::string fmt(std::string s) { return s; } };\nstruct Stars { static void write(std::string const& s) { std::cout << '*' << s << '*'; } };\ntemplate <typename Format, typename Sink>\nstruct Logger {\n    static void log(std::string const& msg) { Sink::write(Format::fmt(msg)); }\n};\nint main() { Logger<Upper, Stars>::log(\"done\"); }",
      "options": [
        "*done*",
        "*DONE*",
        "DONE",
        "It fails to compile: policies must be passed as objects, not types"
      ],
      "answer": 1,
      "explain": "Logger<Upper, Stars> pipes the message through the formatting policy (uppercasing to \"DONE\") and hands the result to the sink policy, which wraps it in asterisks: *DONE*. Formatting and output are orthogonal axes: any Format works with any Sink, so M formats and N sinks yield M×N behaviors from M+N small classes."
    },
    {
      "type": "mcq",
      "tag": "Policy vs Strategy",
      "question": "How does policy-based design relate to the classic Strategy design pattern?",
      "options": [
        "They are identical patterns under different names",
        "Strategy is the compile-time variant; policies are bound at run time",
        "Policy-based design is the compile-time analog of Strategy: behavior is injected as a template argument with zero dispatch overhead, but the choice becomes part of the type and cannot be swapped at run time",
        "Policies require inheritance from the host; strategies never involve inheritance"
      ],
      "answer": 2,
      "explain": "Both extract a varying behavior behind an interface the host uses. Strategy binds it dynamically (a stored polymorphic object, swappable at run time, uniform host type); a policy binds it statically (a template argument, fully inlinable, but Host<PolicyA> and Host<PolicyB> are different types). Choosing between them is exactly the static-versus-dynamic polymorphism tradeoff applied to one pattern."
    },
    {
      "type": "mcq",
      "tag": "Policy Design",
      "question": "Why should policies be designed to be orthogonal?",
      "options": [
        "Each policy should govern one independent aspect, so policies combine freely — M formatting × N threading behaviors from M+N classes instead of an exploding hierarchy of hand-written combinations",
        "Orthogonal policies must never be instantiated together in one host",
        "Orthogonality means all policies derive from a common abstract base",
        "It refers to keeping policy objects aligned on cache-line boundaries"
      ],
      "answer": 0,
      "explain": "The power of policy-based design is combinatorial: independent axes of variation multiply into a large design space while the code you write only grows additively. If two policies overlap in responsibility, combinations become invalid or order-dependent and the design collapses. Factoring behavior into truly independent axes is the hard, valuable design work."
    },
    {
      "type": "code",
      "tag": "Policy Design",
      "question": "std::unique_ptr's deleter is a policy. What does this program print?",
      "code": "#include <iostream>\n#include <memory>\nstruct Logging {\n    void operator()(int* p) const { std::cout << \"deleted\"; delete p; }\n};\nint main() {\n    std::cout << (sizeof(std::unique_ptr<int, Logging>) == sizeof(int*))\n              << (sizeof(std::unique_ptr<int, void (*)(int*)>) == 2 * sizeof(int*))\n              << ' ';\n    std::unique_ptr<int, Logging> p{new int(7)};\n    std::cout << *p << ' ';\n}",
      "options": [
        "01 7 deleted",
        "11 7 ",
        "11 7 deleted",
        "It fails to compile: unique_ptr requires a function-pointer deleter"
      ],
      "answer": 2,
      "explain": "The stateless Logging functor occupies no storage thanks to the empty-base/no_unique_address optimization, so unique_ptr<int, Logging> is exactly pointer-sized (1). A function-pointer deleter must actually be stored, doubling the size (1). Then *p prints 7, and at scope exit the deleter policy runs, printing \"deleted\". The deleter type is part of unique_ptr's type — textbook policy-based design in the standard library."
    },
    {
      "type": "mcq",
      "tag": "Policy Design",
      "question": "std::vector<int, MyAlloc> and std::vector<int>: what does this illustrate about the cost of policy-based design?",
      "options": [
        "The allocator affects only performance characteristics, never the type",
        "They are distinct, incompatible types — the policy becomes part of the type, so code handling both must itself be templated (or type-erased), a real interface cost of compile-time policies",
        "The two vector types convert implicitly into each other",
        "Allocators are runtime strategy objects, not policies"
      ],
      "answer": 1,
      "explain": "Because policies are template arguments, every policy choice mints a new type: you cannot pass vector<int, MyAlloc> to a function taking vector<int>&. Interfaces must template over the allocator or erase it (std::pmr takes the type-erasure route precisely to escape this). Type proliferation is the flip side of zero-overhead configurability."
    },
    {
      "type": "mcq",
      "tag": "Policy Design",
      "question": "Which standard library components are examples of policy-based design?",
      "options": [
        "std::vector's Allocator, std::unique_ptr's Deleter, and std::unordered_map's Hash and KeyEqual parameters",
        "The virtual destructors of the iostream hierarchy",
        "The callable stored inside std::function",
        "std::pmr memory resources, which dispatch through a virtual interface"
      ],
      "answer": 0,
      "explain": "Allocator, Deleter, Hash, and KeyEqual are all behaviors injected as template parameters with defaults — policies in the precise sense. std::function's callable and std::pmr::memory_resource are the contrasting technique: runtime polymorphism (type erasure / virtual dispatch), configurable per object rather than per type. Knowing which mechanism each uses is knowing its tradeoffs."
    },
    {
      "type": "code",
      "tag": "Tag Dispatch",
      "question": "advance2 dispatches on the iterator category. What does this program print?",
      "code": "#include <iostream>\n#include <iterator>\n#include <list>\n#include <vector>\ntemplate <typename It>\nvoid step(It& it, int n, std::random_access_iterator_tag) {\n    std::cout << \"jump \";\n    it += n;\n}\ntemplate <typename It>\nvoid step(It& it, int n, std::input_iterator_tag) {\n    std::cout << \"walk \";\n    while (n--) ++it;\n}\ntemplate <typename It>\nvoid advance2(It& it, int n) {\n    step(it, n, typename std::iterator_traits<It>::iterator_category{});\n}\nint main() {\n    std::vector<int> v{1, 2, 3};\n    std::list<int>   l{4, 5, 6};\n    auto vi = v.begin();\n    auto li = l.begin();\n    advance2(vi, 2);\n    advance2(li, 2);\n    std::cout << *vi << *li;\n}",
      "options": [
        "jump jump 36",
        "jump walk 36",
        "walk walk 36",
        "It fails to compile: no overload accepts bidirectional_iterator_tag"
      ],
      "answer": 1,
      "explain": "vector iterators are random access, selecting the \"jump\" overload. list iterators report bidirectional_iterator_tag, and although no overload takes that exact tag, the tag classes form an inheritance chain (bidirectional → forward → input), so the tag object converts to input_iterator_tag and \"walk\" is selected. Both iterators end on the third element: 3 and 6."
    },
    {
      "type": "mcq",
      "tag": "Tag Dispatch",
      "question": "How does tag dispatch select an implementation?",
      "options": [
        "Tags are strings compared at run time inside the dispatcher",
        "Tags are enum values tested in a switch statement",
        "An extra parameter of an empty tag type routes the call to the right overload during overload resolution at compile time; because tag types form an inheritance hierarchy, a more refined tag falls back to a base-tag overload automatically",
        "Tag dispatch queries RTTI via typeid"
      ],
      "answer": 2,
      "explain": "The dispatcher constructs a tag object (e.g. iterator_traits<It>::iterator_category{}) and passes it as an argument; ordinary overload resolution on that parameter picks the implementation, and the empty object compiles away entirely. The derived-to-base conversion between tag types provides graceful degradation for categories without a dedicated overload — a feature if constexpr chains must reproduce by hand."
    },
    {
      "type": "code",
      "tag": "if constexpr",
      "question": "classify selects a branch with an if constexpr chain. What does this program print?",
      "code": "#include <iostream>\n#include <type_traits>\ntemplate <typename T>\nvoid classify(T) {\n    if constexpr (std::is_integral_v<T>)            std::cout << \"integral \";\n    else if constexpr (std::is_floating_point_v<T>) std::cout << \"floating \";\n    else                                            std::cout << \"other \";\n}\nint main() { classify(7); classify(2.5f); classify(\"text\"); }",
      "options": [
        "integral floating other ",
        "integral integral other ",
        "It fails to compile: \"text\" matches no branch",
        "integral floating floating "
      ],
      "answer": 0,
      "explain": "if constexpr evaluates each trait at compile time per instantiation and discards the untaken branches: int selects integral, float selects floating, and const char* falls through to the else. Each instantiation compiles only its own branch, which is what makes this a compile-time customization mechanism rather than a runtime one."
    },
    {
      "type": "code",
      "tag": "if constexpr",
      "question": "Note the plain if (not if constexpr). What happens when this is compiled?",
      "code": "#include <cstddef>\n#include <type_traits>\ntemplate <typename T>\nstd::size_t length(T const& t) {\n    if (std::is_arithmetic_v<T>)\n        return 1;\n    else\n        return t.size();\n}\nint main() { return static_cast<int>(length(42)); }",
      "options": [
        "It returns 1",
        "It compiles; the untaken else branch is optimized away",
        "It returns 42",
        "It fails to compile: with a runtime if, both branches are fully compiled for T = int, and int has no member size(); if constexpr would have discarded the else branch"
      ],
      "answer": 3,
      "explain": "A runtime if only decides which branch executes — both branches must still compile for every instantiation. With T = int, t.size() is ill-formed, so length<int> fails to compile even though that branch could never run. Replacing if with if constexpr discards the not-taken branch at instantiation time, which is the entire reason the feature exists."
    },
    {
      "type": "mcq",
      "tag": "if constexpr",
      "question": "What is the key design tradeoff between if constexpr and overload/tag-dispatch based customization?",
      "options": [
        "They generate different machine code for the selected branch",
        "if constexpr keeps all cases in one function — concise, but the function accumulates every special case and is closed to outside extension; overloads and tag dispatch keep cases as separate functions that users can extend by adding overloads",
        "Tag dispatch is always faster at run time than if constexpr",
        "if constexpr works only with type traits and cannot use concepts"
      ],
      "answer": 1,
      "explain": "if constexpr centralizes the logic — great readability for a fixed, known set of cases, but every new case means editing that one function. Overload sets are open: a new type or tag can be supported from outside by adding an overload. Both resolve at compile time and cost nothing at run time; the difference is extensibility and code organization, not performance."
    },
    {
      "type": "mcq",
      "tag": "Expression Templates",
      "question": "What problem do expression templates solve in a linear-algebra library?",
      "options": [
        "They encode an expression like a + b + c in its type, delaying evaluation so the whole expression is computed in a single fused loop without materializing intermediate temporary vectors",
        "They cache computed results so repeated evaluations are free",
        "They move all vector arithmetic to compile time",
        "They automatically parallelize expressions across threads"
      ],
      "answer": 0,
      "explain": "Naively, a + b + c allocates and fills a temporary for a + b, then another for the final result — extra allocations and multiple passes over memory. Expression templates make operator+ return a lightweight node that records the operation; evaluation happens element-wise only when the result is assigned into a real vector, fusing everything into one loop. This is the classic performance use of templates the book discusses, and a domain where CRTP (DenseVector<Derived>) traditionally structures the types."
    },
    {
      "type": "code",
      "tag": "Expression Templates",
      "question": "A miniature expression template. What does this program print, and what is expr?",
      "code": "#include <cstddef>\n#include <iostream>\n#include <vector>\ntemplate <typename L, typename R>\nstruct Sum {\n    L const& lhs;\n    R const& rhs;\n    double operator[](std::size_t i) const { return lhs[i] + rhs[i]; }\n};\nstruct Vec {\n    std::vector<double> data;\n    double operator[](std::size_t i) const { return data[i]; }\n};\ntemplate <typename L, typename R>\nSum<L, R> operator+(L const& l, R const& r) { return {l, r}; }\nint main() {\n    Vec a{{1.0, 2.0}};\n    Vec b{{10.0, 20.0}};\n    auto expr = a + b;\n    std::cout << expr[1];\n}",
      "options": [
        "It fails to compile: no operator+ yields a printable value",
        "22 — and expr is a Sum<Vec, Vec> proxy holding references; the addition happens lazily inside expr[1]",
        "22 — and expr is a Vec containing {11, 22}, computed eagerly by operator+",
        "30"
      ],
      "answer": 1,
      "explain": "operator+ performs no arithmetic; it returns Sum<Vec, Vec>, a two-reference proxy whose type encodes the pending operation. Only the call expr[1] evaluates, computing 2.0 + 20.0 = 22 on demand. auto faithfully deduces the proxy type — which is exactly why auto and expression templates interact dangerously when the operands are temporaries."
    },
    {
      "type": "code",
      "tag": "Expression Templates",
      "question": "makeSum returns a + b built from local vectors. What is the outcome?",
      "code": "#include <cstddef>\n#include <iostream>\n#include <vector>\ntemplate <typename L, typename R>\nstruct Sum {\n    L const& lhs;\n    R const& rhs;\n    double operator[](std::size_t i) const { return lhs[i] + rhs[i]; }\n};\nstruct Vec {\n    std::vector<double> data;\n    double operator[](std::size_t i) const { return data[i]; }\n};\ntemplate <typename L, typename R>\nSum<L, R> operator+(L const& l, R const& r) { return {l, r}; }\nauto makeSum() {\n    Vec a{{1.0}};\n    Vec b{{2.0}};\n    return a + b;\n}\nint main() {\n    auto expr = makeSum();\n    std::cout << expr[0];\n}",
      "options": [
        "3 — the Sum stores copies of the vectors",
        "It fails to compile: a Sum cannot be returned from a function",
        "It compiles, but the behavior is undefined: the returned Sum holds references to makeSum's local vectors, which are destroyed when the function returns — the classic auto + expression-template dangling trap",
        "3 — lifetime extension keeps the locals alive until expr is destroyed"
      ],
      "answer": 2,
      "explain": "Sum stores L const& and R const&, so the returned proxy refers to a and b, which die at the end of makeSum; expr[0] then reads through dangling references — undefined behavior that may print garbage or seem to work. Lifetime extension applies only to a temporary bound directly to a reference variable, not to references smuggled inside a returned object. The fix: evaluate into a real Vec before the operands disappear."
    },
    {
      "type": "mcq",
      "tag": "Expression Templates",
      "question": "In an expression-template library, why is `Vector v = a + b;` safe where `auto v = a + b;` is risky?",
      "options": [
        "auto disables copy elision for class types",
        "Vector's constructor is faster than auto deduction",
        "auto silently makes v a const reference",
        "Assigning to Vector forces immediate evaluation of the expression into a real, owning container, while auto deduces the proxy type — whose stored references may dangle and whose every use re-evaluates the expression"
      ],
      "answer": 3,
      "explain": "The conversion/assignment to Vector is where an ET library runs its fused evaluation loop and copies results into owned storage. auto instead preserves the proxy: it may outlive its operands (dangling) and re-runs the computation at each access. General guideline from this trap: be careful with auto at API boundaries of proxy-returning libraries — know whether you are holding a value or a view."
    },
    {
      "type": "code",
      "tag": "Hidden Friends",
      "question": "Both operators are hidden friends. What does this program print?",
      "code": "#include <iostream>\nclass Distance {\n    int meters;\npublic:\n    explicit Distance(int m) : meters(m) {}\n    friend Distance operator+(Distance a, Distance b) { return Distance{a.meters + b.meters}; }\n    friend std::ostream& operator<<(std::ostream& os, Distance d) { return os << d.meters << \"m\"; }\n};\nint main() { std::cout << Distance{1} + Distance{2}; }",
      "options": [
        "3m",
        "12m",
        "It fails to compile: operator+ is not visible outside the class",
        "3"
      ],
      "answer": 0,
      "explain": "Both friends are defined inside the class, so they are 'hidden': invisible to ordinary lookup but found by argument-dependent lookup because an operand is a Distance. Distance{1} + Distance{2} resolves via ADL to the friend, producing Distance{3}, and the hidden friend operator<< streams \"3m\". The operators exist at namespace scope semantically — they just can't clutter it."
    },
    {
      "type": "code",
      "tag": "Hidden Friends",
      "question": "The call uses explicit qualification: ::operator+(...). What happens?",
      "code": "#include <iostream>\nclass Distance {\n    int meters;\npublic:\n    explicit Distance(int m) : meters(m) {}\n    friend Distance operator+(Distance a, Distance b) { return Distance{a.meters + b.meters}; }\n};\nint main() {\n    Distance d = ::operator+(Distance{1}, Distance{2});\n}",
      "options": [
        "3 — qualified lookup finds the friend in the global namespace",
        "It fails to compile: a hidden friend is invisible to qualified and ordinary unqualified lookup; it can only be found by argument-dependent lookup, e.g. via Distance{1} + Distance{2}",
        "It fails to compile because operator+ takes its operands by value",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "A friend defined inside a class is a member of the enclosing namespace, but its name is not visible there — neither ::operator+ nor a plain qualified call can see it. Only ADL, triggered by an operand of class type, considers it. That deliberate invisibility is the 'hidden' in hidden friends, and this error demonstrates it directly."
    },
    {
      "type": "mcq",
      "tag": "Hidden Friends",
      "question": "Why does the book recommend the hidden friends idiom for a class's operators?",
      "options": [
        "Hidden friends are implicitly constexpr",
        "Hidden friends execute faster than free functions",
        "Being findable only via ADL keeps them out of the namespace's visible overload set: fewer candidates for unrelated calls, fewer accidental matches via conversions, better error messages, and less overload-resolution work",
        "Hidden friends can access the privates of every class in their namespace"
      ],
      "answer": 2,
      "explain": "A namespace-scope operator template participates in overload resolution for every vaguely matching call in that namespace; dozens of such operators make resolution slow and diagnostics noisy. A hidden friend is considered only when one of its operands actually is (or converts from) the class, shrinking candidate sets dramatically. It also keeps the operator textually next to the class it serves."
    },
    {
      "type": "mcq",
      "tag": "Hidden Friends",
      "question": "Why implement a symmetric binary operator such as == or + as a (hidden) friend rather than a member function?",
      "options": [
        "Member functions cannot return by value",
        "A member operator permits conversions only on the right-hand operand; a friend taking both operands as parameters treats both sides symmetrically, so 1 + meter and meter + 1 both work when such conversions are intended",
        "Friend operators have been required by the standard since C++20",
        "Member operators cannot be declared const"
      ],
      "answer": 1,
      "explain": "For m + 1 a member operator+ works (conversion on the argument), but 1 + m cannot convert the left operand into *this, so the asymmetry shows. A two-parameter friend puts both operands through normal conversion rules. Combined with the hidden-friend property — participating only when an operand involves the class — this is the idiomatic form for symmetric operators."
    },
    {
      "type": "mcq",
      "tag": "Static vs Dynamic",
      "question": "Which of the following is a genuine cost of heavy static polymorphism (templates, CRTP, policies) compared to virtual interfaces?",
      "options": [
        "Slower dispatch at each call site",
        "Every object grows by a vptr",
        "Longer compile times and header-heavy code: implementations must be visible to users, every client recompiles them, and changes ripple through all dependents",
        "It cannot be unit tested"
      ],
      "answer": 2,
      "explain": "Template definitions live in headers and are re-instantiated in every translation unit that uses them, so builds slow down and any change to the implementation triggers wide recompilation — the opposite of the source-code insulation a compiled virtual interface provides. Dispatch speed and object size are where static polymorphism wins, not loses."
    }
  ]
};

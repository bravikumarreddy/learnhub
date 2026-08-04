/* ===== C++ Templates — Templates & Design ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["templ-design"] = {
  title: "C++ Templates — Templates & Design",
  subtitle: "Static vs dynamic polymorphism, CRTP & mixins, type erasure, expression templates, policy/traits classes and template metaprogramming.",
  crumb: "C++ Templates",
  questions: [
    {
      "type": "code",
      "tag": "CRTP",
      "question": "At the point Base<D> is instantiated as a base class, D is still incomplete. What does that forbid inside Base?",
      "code": "template<class D>\nstruct Base {\n  using V = typename D::value_type; // used in a member type alias here\n  void f(){ static_cast<D*>(this)->impl(); }\n};\nstruct Derived : Base<Derived> {\n  using value_type = int;\n  void impl();\n};",
      "options": ["Naming D::value_type directly in Base's class body fails because Derived is incomplete while Base<Derived> is being formed","static_cast<D*>(this) is illegal until D is complete","Calling impl() through the cast is a compile error because impl is not yet declared","Nothing is wrong; D is always complete inside Base"],
      "answer": 0,
      "explain": "When Base<Derived> is instantiated to serve as a base subobject, Derived is not yet complete, so member accesses like D::value_type at class scope are ill-formed. Uses inside member function bodies are fine because those are instantiated later, when Derived is complete."
    },
    {
      "type": "mcq",
      "tag": "static polymorphism",
      "question": "What is the primary runtime advantage of static (compile-time) polymorphism over dynamic polymorphism?",
      "options": ["It allows storing objects of unrelated types in one container","Calls can be inlined and there is no virtual dispatch or vtable indirection","It reduces the size of the compiled binary","It permits changing behavior after the program has started"],
      "answer": 1,
      "explain": "Static polymorphism resolves the target function at compile time, so the compiler can inline and optimize across the call; there is no vtable lookup. The cost is loss of runtime heterogeneity and potential code bloat."
    },
    {
      "type": "mcq",
      "tag": "trade-offs",
      "question": "Which cost is most characteristic of static polymorphism compared to dynamic polymorphism?",
      "options": ["Higher per-call overhead at runtime","Inability to inline calls","Code bloat from instantiating the algorithm for every concrete type","The need for a shared virtual base class"],
      "answer": 2,
      "explain": "Because each distinct type produces its own instantiation of the templated code, static polymorphism can bloat the binary. Dynamic polymorphism shares one function body across all derived types at the cost of indirect calls."
    },
    {
      "type": "mcq",
      "tag": "runtime heterogeneity",
      "question": "You need a std::vector holding a mix of Circle, Square, and Triangle handled uniformly at runtime, with the set of shapes read from a file. Which approach fits?",
      "options": ["CRTP static interface","Dynamic polymorphism with a virtual base or type erasure","Expression templates","A single function template"],
      "answer": 1,
      "explain": "Runtime heterogeneity — an unknown-at-compile-time mix of types in one container — requires a runtime mechanism: virtual dispatch through a common base or a type-erased wrapper. Templates fix types at compile time."
    },
    {
      "type": "code",
      "tag": "CRTP",
      "question": "This CRTP downcast compiles but is undefined behavior when used. Why?",
      "code": "template<class D> struct Base {\n  void run(){ static_cast<D*>(this)->go(); }\n};\nstruct A : Base<A> { void go(); };\nstruct B : Base<A> { void go(); }; // note: Base<A>, not Base<B>",
      "options": ["B does not inherit go()","static_cast<A*>(this) inside a B object yields a pointer to a non-existent A, so the call is UB","Base<A> cannot be inherited twice","There is no bug; both compile and run correctly"],
      "answer": 1,
      "explain": "B mistakenly passes A as the CRTP parameter. The base then casts a B* to A*, but the object is not an A, so dereferencing it is undefined behavior. Each class must pass itself as the template argument."
    },
    {
      "type": "code",
      "tag": "CRTP counter",
      "question": "In this counter mixin, what must the derived constructors do for the count to stay correct?",
      "code": "template<class D> struct Counter {\n  static inline int n = 0;\n  Counter(){ ++n; }\n  Counter(const Counter&){ ++n; }\n  ~Counter(){ --n; }\n};\nstruct Widget : Counter<Widget> {};",
      "options": ["Nothing special; the copy constructor of Counter must also increment, which it does here","They must manually call ++n","They must declare n themselves","They must make the destructor virtual"],
      "answer": 0,
      "explain": "The trap is forgetting the copy constructor: if only the default constructor incremented, a copied Widget would destruct and decrement without a matching increment, corrupting the count. This code correctly increments in both constructors."
    },
    {
      "type": "mcq",
      "tag": "CRTP mixin",
      "question": "CRTP is often used to inject a full comparison interface from just one operator. Given operator< in the derived class, what does a CRTP 'Ordered' base typically supply?",
      "options": ["operator new and delete","operator>, <=, >=, ==, != derived from operator<","A virtual destructor","Move constructors"],
      "answer": 1,
      "explain": "A CRTP mixin can define the remaining relational operators in terms of the derived class's operator< (and possibly ==), so each derived type only implements the primitive and inherits the rest. (C++20's <=> automates much of this.)"
    },
    {
      "type": "mcq",
      "tag": "Barton-Nackman",
      "question": "The Barton-Nackman trick defines operators as friend functions inside a class template. What problem was it originally designed to solve?",
      "options": ["Reducing binary size","Making non-member operators (like operator==) available and found via ADL without polluting the enclosing namespace, in an era before robust two-phase lookup","Enabling virtual operators","Avoiding template instantiation"],
      "answer": 1,
      "explain": "Friend name injection defines the operator as a non-member tied to the class, found by argument-dependent lookup. Historically it also worked around weak function-template overloading; today it remains a clean way to provide symmetric non-member operators."
    },
    {
      "type": "code",
      "tag": "Barton-Nackman",
      "question": "Why is defining operator== as an inline friend here often preferable to a member operator==?",
      "code": "template<class T>\nstruct Eq {\n  friend bool operator==(const T& a, const T& b){ return a.equals(b); }\n};\nstruct Money : Eq<Money> { long c; bool equals(const Money&) const; };",
      "options": ["A friend allows implicit conversions on both operands symmetrically, whereas a member fixes the left operand type","A friend is faster at runtime","A member operator cannot access private data","Only friends can be constexpr"],
      "answer": 0,
      "explain": "A non-member (friend) operator treats both operands equally, so user-defined conversions can apply to either side. A member operator== has an implicit 'this' left operand, breaking symmetry."
    },
    {
      "type": "mcq",
      "tag": "type erasure",
      "question": "Classic type erasure (as in std::function) is typically built from which combination?",
      "options": ["A macro that generates a switch on typeid","An owning wrapper holding a pointer to an abstract Concept base, with a templated Model<T> derived class implementing the virtual interface","A giant variant of every possible type","Pure CRTP with no virtual functions"],
      "answer": 1,
      "explain": "The wrapper stores a Concept* (abstract interface). Model<T> derives from Concept and forwards virtual calls to the held T. This erases T from the wrapper's type while preserving a fixed interface."
    },
    {
      "type": "code",
      "tag": "type erasure",
      "question": "What role does Model<T> play in this type-erasure skeleton?",
      "code": "struct Concept { virtual ~Concept()=default; virtual void draw() const=0; };\ntemplate<class T> struct Model : Concept {\n  T obj;\n  Model(T o):obj(std::move(o)){}\n  void draw() const override { obj.draw(); }\n};\nstruct Drawable { std::unique_ptr<Concept> p; /* templated ctor */ };",
      "options": ["Model<T> adapts a concrete T to the virtual Concept interface, capturing T's type only at construction","Model<T> is the public wrapper users hold","Model<T> stores a vtable pointer for Drawable","Model<T> performs small-buffer optimization automatically"],
      "answer": 0,
      "explain": "Model<T> is the concrete implementation of the abstract Concept for a specific T; it forwards virtual calls to the stored object. The public wrapper (Drawable) holds only a Concept*, so its type does not depend on T."
    },
    {
      "type": "mcq",
      "tag": "type erasure SBO",
      "question": "Why do implementations of std::function often include a small-buffer optimization (SBO)?",
      "options": ["To make the callable virtual","To avoid a heap allocation when the stored callable is small enough to fit inline in the wrapper","To enable RTTI","To reduce compile time"],
      "answer": 1,
      "explain": "SBO stores small callables directly inside the function object's buffer, avoiding dynamic allocation and indirection. Larger callables spill to the heap. This is a performance optimization, not a semantic one."
    },
    {
      "type": "mcq",
      "tag": "type erasure trade-offs",
      "question": "Compared to a plain template parameter, what does type erasure (e.g., std::function) cost you?",
      "options": ["Compile-time type safety","An indirect (virtual) call and usually a heap allocation, losing inlining","The ability to store callables","Support for lambdas"],
      "answer": 1,
      "explain": "Type erasure trades the template's static binding and inlining for runtime flexibility: calls go through a virtual dispatch and the target may live on the heap. A raw template parameter would inline but cannot be stored uniformly."
    },
    {
      "type": "mcq",
      "tag": "type erasure vs inheritance",
      "question": "A key advantage of type erasure over requiring types to inherit a common base is:",
      "options": ["It is always faster","Stored types need not derive from anything or even know about the interface; the wrapper adapts them non-intrusively","It avoids all heap allocation","It removes virtual calls entirely"],
      "answer": 1,
      "explain": "Type erasure is non-intrusive: any type providing the required operations can be wrapped, without modifying it or making it inherit an interface. This decouples the value semantics from an inheritance hierarchy."
    },
    {
      "type": "mcq",
      "tag": "std::any",
      "question": "std::any is a form of type erasure. What does it erase, and what does it require to get the value back?",
      "options": ["It erases the value; you use dynamic_cast","It erases the static type; retrieval requires any_cast with the exact stored type","It erases nothing; it stores void*","It erases const-ness only"],
      "answer": 1,
      "explain": "std::any hides the concrete type behind a uniform interface. To read the value you must name the exact type via any_cast; a mismatch throws std::bad_any_cast (pointer form returns nullptr)."
    },
    {
      "type": "code",
      "tag": "expression templates",
      "question": "In this expression-template sketch, what does 'a + b' actually produce?",
      "code": "template<class L, class R> struct Sum {\n  const L& l; const R& r;\n  double operator[](size_t i) const { return l[i] + r[i]; }\n};\ntemplate<class L,class R> Sum<L,R> operator+(const L& l,const R& r){ return {l,r}; }",
      "options": ["A fully evaluated vector of sums","A lightweight Sum node that references l and r and computes element sums lazily on indexing","A temporary std::vector copy","A compile error, since operator[] is not defined for L"],
      "answer": 1,
      "explain": "Expression templates build an expression tree of small proxy objects. No arithmetic happens at '+'; the actual addition is computed lazily when operator[] is invoked, avoiding intermediate temporaries."
    },
    {
      "type": "mcq",
      "tag": "expression templates",
      "question": "What is the main performance benefit expression templates provide for a += b + c + d over vectors?",
      "options": ["They parallelize automatically","They fuse the whole expression into a single loop, eliminating the temporary vectors that naive operator+ would create","They reduce the vectors' memory footprint permanently","They convert the operation to integer math"],
      "answer": 1,
      "explain": "Naive operator+ allocates a temporary for each subexpression. Expression templates defer evaluation and produce one loop that computes each element once, avoiding multiple passes and temporaries."
    },
    {
      "type": "code",
      "tag": "expression templates",
      "question": "Why does this use of auto with an expression-template library cause a dangling reference?",
      "code": "auto e = a + b;   // e is Sum<Vec,Vec> holding references to a and b\ndouble x = e[0];  // fine so far\n// ... later, in a function returning the expression:\nauto make(){ Vec a,b; return a + b; }  // returns Sum holding refs to locals",
      "options": ["auto copies the vectors, so no dangling occurs","The Sum node stores references to a and b; when they go out of scope, indexing e reads dangling references","auto forces immediate evaluation, so it is safe","operator+ returns by value, which is always safe"],
      "answer": 1,
      "explain": "Expression nodes hold references to their operands to stay cheap. Capturing the node in auto (especially returning it) can outlive the referenced temporaries/locals, leaving dangling references. You must materialize the result (e.g., assign to a Vec) before the operands die."
    },
    {
      "type": "mcq",
      "tag": "expression templates",
      "question": "Why can capturing an expression-template result in `auto` be surprising to users who expect eager evaluation?",
      "options": ["auto changes the arithmetic result","auto deduces the proxy expression type rather than the evaluated value type, so the 'value' is really an unevaluated tree tied to its operands' lifetimes","auto always allocates on the heap","auto disables the expression templates"],
      "answer": 1,
      "explain": "Users expect `auto sum = a + b;` to be a vector, but it is actually a lazy Sum proxy. Its correctness depends on the operands living long enough, which is a subtle lifetime pitfall unique to lazy/ET designs."
    },
    {
      "type": "mcq",
      "tag": "policy classes",
      "question": "In policy-based design, a 'policy' is best described as:",
      "options": ["A runtime configuration file","A template parameter (often a class) supplying a pluggable behavioral or structural decision, combined at compile time","A virtual base class","An exception-handling strategy only"],
      "answer": 1,
      "explain": "Policies are orthogonal design decisions injected as template parameters. The host class combines chosen policies at compile time (often via inheritance or composition), yielding tailored, zero-overhead configurations."
    },
    {
      "type": "code",
      "tag": "policy classes",
      "question": "How does the host class typically gain the policy's behavior in this pattern?",
      "code": "template<class ThreadingPolicy, class CheckingPolicy>\nclass Widget : private ThreadingPolicy, private CheckingPolicy {\n  void op(){ this->lock(); this->check(); /* ... */ }\n};",
      "options": ["By deriving from the policies, so their members become available to the host","By calling policies through virtual dispatch","By storing policy objects in a std::any","By copying the policy source code via macros"],
      "answer": 0,
      "explain": "Inheriting (often privately) from policy classes injects their members into the host and enables the empty base optimization for stateless policies. The host calls policy members directly with no runtime overhead."
    },
    {
      "type": "mcq",
      "tag": "policy vs strategy",
      "question": "How does compile-time policy-based design differ from the runtime Strategy pattern?",
      "options": ["Policies are chosen at compile time and can be inlined with no per-call cost; Strategy selects behavior at runtime via a virtual/function-pointer indirection","They are identical","Policies require RTTI; Strategy does not","Strategy cannot change behavior at runtime"],
      "answer": 0,
      "explain": "Policy-based design bakes the choice into the type at compile time, enabling inlining and empty-base optimization. Strategy swaps behavior objects at runtime through indirection, trading performance for late binding."
    },
    {
      "type": "mcq",
      "tag": "empty base optimization",
      "question": "Why is inheriting from stateless policy classes often chosen over holding them as members?",
      "options": ["Members are illegal for policies","The empty base optimization lets stateless bases occupy no storage, whereas an empty member still takes at least one byte","Inheritance is always faster to call","Members cannot be templated"],
      "answer": 1,
      "explain": "An empty class as a member would still add at least one byte (and padding). As a base subobject, the empty base optimization allows it to consume no additional size, keeping the host as small as possible."
    },
    {
      "type": "mcq",
      "tag": "traits",
      "question": "How do traits templates differ in role from policy classes, as commonly distinguished?",
      "options": ["Traits carry no information; policies carry all","Traits typically describe fixed properties of a type (configuration/queries), while policies inject pluggable behavior chosen by the user","They are interchangeable synonyms with no distinction","Traits require inheritance; policies never do"],
      "answer": 1,
      "explain": "Traits usually answer 'what is true about type T' (e.g., iterator_traits, numeric_limits) and are often fixed per type. Policies are behavioral knobs the client selects. The line is fuzzy, but this is the conventional split."
    },
    {
      "type": "code",
      "tag": "traits",
      "question": "What does specializing this traits template let a generic algorithm do?",
      "code": "template<class T> struct RingTraits {\n  static constexpr T zero(){ return T{}; }\n  static constexpr T one(){ return T{1}; }\n};\ntemplate<> struct RingTraits<Matrix> {\n  static Matrix zero(){ return Matrix::Zero(); }\n  static Matrix one(){ return Matrix::Identity(); }\n};",
      "options": ["Adapt the notion of additive/multiplicative identity per type without changing the algorithm","Make T polymorphic at runtime","Force all T to derive from a Ring base","Erase the type of T"],
      "answer": 0,
      "explain": "Traits provide a customization point: the algorithm asks RingTraits<T>::zero()/one() and each type supplies the right identities via specialization, with no runtime cost and no intrusive changes to T."
    },
    {
      "type": "code",
      "tag": "metaprogramming",
      "question": "What does this template compute, and when?",
      "code": "template<unsigned N> struct Fact { static constexpr unsigned value = N * Fact<N-1>::value; };\ntemplate<> struct Fact<0> { static constexpr unsigned value = 1; };\nconstexpr auto x = Fact<5>::value;",
      "options": ["5! at runtime","5! (=120) entirely at compile time via template recursion, with the specialization as the base case","Nothing; it fails to instantiate","A vtable for Fact"],
      "answer": 1,
      "explain": "This is classic template-recursion metaprogramming: each instantiation multiplies by the next-lower factorial, and Fact<0> terminates the recursion. The value is a compile-time constant (120)."
    },
    {
      "type": "mcq",
      "tag": "metaprogramming",
      "question": "For a numeric compile-time computation like factorial, why is a constexpr function often preferred over template recursion today?",
      "options": ["constexpr runs only at runtime","constexpr functions read like ordinary code, avoid instantiating a distinct type per value, and generally compile faster with clearer errors","Template recursion produces smaller binaries","constexpr cannot compute at compile time"],
      "answer": 1,
      "explain": "constexpr functions express the same computation in normal control flow and do not spawn a new type per recursion step, easing compile time and error messages. Template recursion is still needed for type-level (rather than value-level) computation."
    },
    {
      "type": "mcq",
      "tag": "loop unrolling",
      "question": "Template metaprogramming can force loop unrolling by recursion on an integer parameter. What is the main risk if the count is large?",
      "options": ["Runtime stack overflow","Excessive code size and long compile times from many instantiations, plus possibly worse cache behavior","Loss of type safety","The loop will not terminate at runtime"],
      "answer": 1,
      "explain": "Each recursive step is a separate instantiation that emits inline code, so a large unroll factor bloats the binary and slows compilation, and unbounded unrolling can hurt instruction-cache performance. Modern compilers often unroll better on their own."
    },
    {
      "type": "mcq",
      "tag": "mixins",
      "question": "A 'mixin' via templated inheritance is best described as:",
      "options": ["A class that inherits from its own template parameter, so clients choose the base to add functionality onto","A class with no members","A runtime plugin loaded via dlopen","A virtual base class shared by all types"],
      "answer": 0,
      "explain": "A mixin template like `template<class Base> struct Logged : Base { ... }` layers behavior onto whatever Base is supplied, allowing composable, order-flexible stacking of features at compile time."
    },
    {
      "type": "code",
      "tag": "mixins",
      "question": "What does stacking these mixins produce for `using W = Timed<Logged<Widget>>;`?",
      "code": "template<class B> struct Logged : B { void op(){ log(); B::op(); } };\ntemplate<class B> struct Timed : B { void op(){ auto t=now(); B::op(); record(now()-t); } };\nstruct Widget { void op(); };",
      "options": ["A Widget whose op() is timed, and within that, logged, then the real op runs","A compile error from diamond inheritance","Only the outermost mixin's op() runs","Runtime virtual dispatch across the mixins"],
      "answer": 0,
      "explain": "Each mixin wraps its base's op() and calls B::op() to chain down. Timed<Logged<Widget>> times around Logged's op(), which logs and then calls Widget::op(). The composition order is determined statically by the nesting."
    },
    {
      "type": "mcq",
      "tag": "mixins vs CRTP",
      "question": "How does a CRTP mixin differ from a plain 'inherit-from-parameter' mixin?",
      "options": ["CRTP cannot add behavior","In CRTP the base is the template and the derived is the argument (base calls into derived); in a parameter mixin the derived is the template and the base is the argument (derived wraps the base)","They are the same technique","Parameter mixins require virtual functions"],
      "answer": 1,
      "explain": "CRTP inverts the direction: the mixin is the base and downcasts to the derived to reach its operations. A parameter mixin derives from the supplied base and forwards up the chain. Both compose behavior statically but flow in opposite directions."
    },
    {
      "type": "code",
      "tag": "tag dispatch",
      "question": "How does this tag-dispatch design pick an implementation?",
      "code": "struct random_access_tag{}; struct forward_tag{};\ntemplate<class It> void adv(It& i, int n, random_access_tag){ i += n; }\ntemplate<class It> void adv(It& i, int n, forward_tag){ while(n--) ++i; }\ntemplate<class It> void advance(It& i, int n){ adv(i,n, typename Traits<It>::category{}); }",
      "options": ["At runtime via a switch on the tag value","At compile time via overload resolution on the tag type from the iterator's traits","By dynamic_cast on the iterator","Randomly, since both overloads match"],
      "answer": 1,
      "explain": "The trait yields a tag type, and overload resolution statically selects the matching adv() overload. This dispatches on a compile-time category without runtime branching or if constexpr."
    },
    {
      "type": "mcq",
      "tag": "tag dispatch",
      "question": "Why use empty tag types for dispatch instead of a runtime enum and if/else?",
      "options": ["Tags are faster to compare at runtime","Overloading on tag types selects code at compile time and lets unrelated branches not even be instantiated for a given type, avoiding invalid-code issues","Enums cannot be passed to functions","Tags reduce memory usage of the iterator"],
      "answer": 1,
      "explain": "Tag dispatch resolves via overload selection, so only the chosen overload is instantiated. A runtime if/else would require all branches to compile for every type, which can fail when some operations are ill-formed for certain types."
    },
    {
      "type": "mcq",
      "tag": "bridging",
      "question": "A common technique to bridge static and dynamic polymorphism wraps a template in a runtime interface. What does this achieve?",
      "options": ["It removes all templates from the program","You get template-based flexibility internally while presenting a single runtime interface (e.g., type erasure) for heterogeneous storage","It forces every type to be known at link time","It disables inlining everywhere"],
      "answer": 1,
      "explain": "By type-erasing template implementations behind a virtual interface, you combine compile-time generality (any conforming type) with runtime heterogeneity (uniform storage/dispatch). This is precisely how type erasure bridges the two worlds."
    },
    {
      "type": "mcq",
      "tag": "code bloat",
      "question": "Two functions template<class T> f take Circle and Square. Why might this bloat the binary more than a virtual-based design?",
      "options": ["Templates always run slower","Each distinct T yields a separate compiled copy of f, whereas one virtual function body is shared across all derived types","Virtual functions are never compiled","Templates cannot be inlined"],
      "answer": 1,
      "explain": "Template instantiation duplicates code per type argument. A virtual design compiles the algorithm once and dispatches at runtime, so it can be smaller when many types share a large algorithm — at the cost of indirect calls."
    },
    {
      "type": "mcq",
      "tag": "error messages",
      "question": "A frequently cited downside of heavy template/metaprogramming designs versus virtual interfaces is:",
      "options": ["They cannot express polymorphism","Notoriously long and hard-to-read compiler error messages when a type fails to model the expected interface","They always run slower","They require dynamic allocation"],
      "answer": 1,
      "explain": "Because constraints were historically checked deep inside instantiation, a small mismatch could produce pages of errors. Concepts (C++20) improve this by diagnosing at the interface, but template errors remain a real cost."
    },
    {
      "type": "code",
      "tag": "CRTP",
      "question": "This CRTP interface uses a member of D inside the base's data member. Why is it ill-formed?",
      "code": "template<class D> struct Base {\n  typename D::size_type sz;  // needs D complete here\n};\nstruct Derived : Base<Derived> { using size_type = int; };",
      "options": ["Because Base is not a template","Because at the point Base<Derived> is instantiated as a base, Derived is incomplete, so D::size_type cannot be named","Because size_type is private","It is well-formed and sz has type int"],
      "answer": 1,
      "explain": "Naming D::size_type at class scope in Base requires Derived to be complete, but it is not while forming the base subobject. This is the canonical 'can't use Derived's not-yet-defined members' CRTP gotcha; deferring the use into a function body avoids it."
    },
    {
      "type": "mcq",
      "tag": "type erasure",
      "question": "In a type-erased 'AnyDrawable', why must the Concept base have a virtual destructor?",
      "options": ["To enable copying","So deleting through a Concept* correctly destroys the concrete Model<T> and its contained T","To allow SBO","To make draw() faster"],
      "answer": 1,
      "explain": "The wrapper owns a Concept* that actually points to a Model<T>. Without a virtual destructor, deleting through the base pointer is undefined behavior and would not run Model<T>'s destructor (leaking or mis-destroying the T)."
    },
    {
      "type": "mcq",
      "tag": "static polymorphism",
      "question": "Which statement about inlining is accurate when comparing the two polymorphism styles?",
      "options": ["Virtual calls are always inlined; template calls never are","Static polymorphism exposes the exact callee at compile time so it can be inlined; virtual calls generally cannot be inlined unless the compiler can devirtualize","Neither can be inlined","Both are inlined identically"],
      "answer": 1,
      "explain": "Template/CRTP calls bind to a known function, enabling inlining and cross-call optimization. Virtual calls are indirect; the compiler can only inline them when it can prove the dynamic type (devirtualization), which is not always possible."
    },
    {
      "type": "mcq",
      "tag": "ABI",
      "question": "Why are heavily templated interfaces awkward for stable ABIs and shared-library boundaries?",
      "options": ["Templates cannot be exported at all","Instantiation happens in the client, so the concrete types and code layout leak across the boundary and changes force recompilation, unlike a stable virtual interface","Templates require RTTI to be disabled","Virtual interfaces have no ABI"],
      "answer": 1,
      "explain": "Templates are instantiated where used, so a library exposing templates ties clients to its implementation details and header changes. A non-template virtual interface (or type-erased facade) provides a more stable, versionable ABI boundary."
    },
    {
      "type": "mcq",
      "tag": "policy classes",
      "question": "What is a downside of expressing many independent design decisions as separate policy template parameters?",
      "options": ["It forces virtual dispatch","The class's template signature grows unwieldy and every distinct policy combination is a distinct type, multiplying instantiations","Policies cannot have state","It prevents inlining"],
      "answer": 1,
      "explain": "Each policy adds a template parameter; N policies with several options each yield a combinatorial explosion of types and possibly code. Defaulted parameters and policy bundling mitigate the verbosity but the type multiplication remains."
    },
    {
      "type": "mcq",
      "tag": "metaprogramming",
      "question": "Which is a legitimate reason to still use template (type-level) metaprogramming rather than constexpr functions?",
      "options": ["constexpr is slower at runtime","You need to compute or transform types themselves (e.g., build a tuple type, select a type), which constexpr values cannot express","Templates always produce smaller binaries","constexpr cannot do arithmetic"],
      "answer": 1,
      "explain": "constexpr operates on values; when the result must be a type (typelist manipulation, conditional type selection, tuple construction), you need template metafunctions or type traits. Value computation, by contrast, is cleaner in constexpr."
    },
    {
      "type": "code",
      "tag": "metaprogramming",
      "question": "What type does this metafunction select?",
      "code": "template<bool B, class T, class F> struct If { using type = T; };\ntemplate<class T, class F> struct If<false,T,F> { using type = F; };\nusing R = If<(sizeof(void*)==8), long long, int>::type;",
      "options": ["Always int","long long on a 64-bit pointer platform, int otherwise, chosen at compile time","A runtime-dependent type","void"],
      "answer": 1,
      "explain": "This reimplements std::conditional: the boolean selects the primary template (T) or the false specialization (F). On a platform with 8-byte pointers, R is long long; otherwise int. The choice is entirely compile-time."
    },
    {
      "type": "mcq",
      "tag": "type erasure vs template",
      "question": "You are writing a hot inner loop that calls a user-supplied callable millions of times. Which choice usually performs best?",
      "options": ["std::function parameter","A template parameter for the callable, so the exact type is known and the call inlines","std::any","A virtual functor base"],
      "answer": 1,
      "explain": "A template callable parameter binds the exact type, letting the compiler inline the call and optimize the loop. std::function/type erasure adds indirection and possibly allocation, which hurts in tight loops."
    },
    {
      "type": "mcq",
      "tag": "type erasure",
      "question": "One reason type erasure improves compile times and reduces bloat versus pure templates in large systems is:",
      "options": ["It never uses virtual functions","Client code depends only on the erased wrapper's fixed interface, so it need not be re-instantiated for every concrete type and can hide implementations behind a non-template boundary","It disables optimization","It requires no headers"],
      "answer": 1,
      "explain": "By presenting a single non-template interface, type erasure lets clients compile against one type rather than instantiating templates per concrete type, which can cut compile times and shrink code — trading some runtime speed for build/scaling benefits."
    },
    {
      "type": "mcq",
      "tag": "static vs dynamic",
      "question": "Which scenario clearly favors dynamic polymorphism over CRTP/static polymorphism?",
      "options": ["A math library maximizing throughput on known element types","A plugin system loading unknown implementations at runtime and storing them uniformly","A compile-time-fixed set of two shapes","An inlined comparison mixin"],
      "answer": 1,
      "explain": "Plugins/late binding require types unknown at compile time to be handled through a common interface at runtime — the essence of dynamic polymorphism. Static polymorphism cannot represent types the program has not been compiled against."
    },
    {
      "type": "code",
      "tag": "expression templates",
      "question": "Spot the lifetime bug in this expression-template usage.",
      "code": "Vec big(1000000);\nauto expr = big * 2.0 + shift(big);\nreturn expr; // function returns the expression, not a Vec",
      "options": ["expr copies big, so returning it is fine","expr is a proxy referencing big; returning it (while big is a local) leaves dangling references — you should return a materialized Vec","The multiplication overflows","shift() must be virtual"],
      "answer": 1,
      "explain": "The proxy holds references into big and the temporaries. Returning the proxy escapes those references' lifetimes, so the caller reads dangling memory. Force evaluation (e.g., `Vec result = expr; return result;`) before the operands die."
    },
    {
      "type": "mcq",
      "tag": "policy classes",
      "question": "std::char_traits and std::allocator are used as policy/traits parameters of std::basic_string. What does this enable?",
      "options": ["Runtime replacement of the allocator per call","Customizing character comparison/behavior and memory allocation at compile time without changing basic_string's algorithms","Virtual dispatch for each character operation","Erasing the character type"],
      "answer": 1,
      "explain": "basic_string is parameterized on the char type, its traits (comparison/length semantics), and an allocator policy. Users tailor behavior by supplying these template arguments, and the core logic stays generic with zero per-operation overhead."
    },
    {
      "type": "mcq",
      "tag": "tag types",
      "question": "Standard library uses tag types like std::in_place, std::nothrow, and std::allocator_arg. What design purpose do such empty tags serve?",
      "options": ["They store runtime configuration data","They disambiguate overloaded constructors/functions by type, selecting a specific behavior at compile time with no runtime cost","They enable polymorphism","They replace exceptions"],
      "answer": 1,
      "explain": "Empty tag types let overload resolution pick a specific overload (e.g., in-place construction vs. copy) unambiguously. They carry meaning through their type, not any value, and add no runtime overhead."
    },
    {
      "type": "code",
      "tag": "type erasure",
      "question": "Why is the constructor of this wrapper a template, but the class itself is not?",
      "code": "struct Any {\n  template<class T> Any(T x)\n    : self(std::make_unique<Model<T>>(std::move(x))) {}\n  std::unique_ptr<Concept> self;\n};",
      "options": ["Because Any must be a template to work","The templated constructor captures the concrete T to build a Model<T>, but Any itself stores only a Concept*, so Any is a single non-template type","Because Model<T> is not a template","Because self must be a raw pointer"],
      "answer": 1,
      "explain": "This is the heart of type erasure: T is captured only at construction to instantiate Model<T>, then discarded from the wrapper's type. Any remains one concrete type usable in containers, since it holds a type-erased Concept*."
    },
    {
      "type": "mcq",
      "tag": "metaprogramming",
      "question": "Deep template recursion in metaprogramming risks hitting which practical limit?",
      "options": ["Runtime stack depth","The compiler's template instantiation depth limit, causing a compile error","Heap exhaustion at runtime","Linker symbol limits only"],
      "answer": 1,
      "explain": "Compilers cap recursive instantiation depth (commonly a few hundred to a thousand). Excessively recursive metafunctions can exceed it and fail to compile; fold expressions or constexpr often flatten such recursion."
    },
    {
      "type": "mcq",
      "tag": "bridging",
      "question": "std::function bridges static and dynamic worlds. Which description is correct?",
      "options": ["It stores callables by requiring them to inherit a base","Its templated constructor accepts any compatible callable (static/generic), then dispatches through a type-erased virtual interface at call time (dynamic)","It only accepts function pointers","It evaluates lazily like expression templates"],
      "answer": 1,
      "explain": "std::function accepts arbitrary callables via a template constructor (compile-time generality) and invokes them through a type-erased interface (runtime dispatch), a textbook bridge between static and dynamic polymorphism."
    },
    {
      "type": "mcq",
      "tag": "trade-offs",
      "question": "When choosing between templates and type erasure for a public library API, which factor argues FOR type erasure?",
      "options": ["Maximum inlining in hot loops","A stable, non-template ABI and faster client builds, accepting some runtime dispatch cost","Compile-time type computation","Zero heap allocation guaranteed"],
      "answer": 1,
      "explain": "Type erasure hides implementations behind a fixed interface, giving ABI stability and reduced client instantiation. The price is runtime indirection and possible allocation — a reasonable trade for API boundaries where raw speed is secondary."
    },
    {
      "type": "code",
      "tag": "metaprogramming",
      "question": "What does this pack-based sum compute, and at what time?",
      "code": "template<class... Ts>\nconstexpr auto sum(Ts... xs){ return (xs + ... + 0); }\nconstexpr int s = sum(1,2,3,4);",
      "options": ["A runtime loop summing the values","A compile-time fold expression evaluating to 10, expanded at instantiation","A typelist of the arguments","Nothing; folds need at least two args"],
      "answer": 1,
      "explain": "This is a binary right fold with identity 0: it expands to 1+(2+(3+(4+0))) = 10. Being constexpr, s is computed at compile time. Fold expressions replace much older recursive-template summation."
    },
    {
      "type": "mcq",
      "tag": "CRTP",
      "question": "The gotcha 'the base cannot use Derived's members that are not yet defined' primarily affects which uses in the CRTP base?",
      "options": ["Uses inside member function bodies","Uses in the class body itself (data member types, base-class-list decisions, non-deferred typedefs) where Derived must already be complete","Uses in static_assert inside functions","Nothing is affected"],
      "answer": 1,
      "explain": "Anything evaluated while the base subobject is being formed sees Derived as incomplete. Member function bodies are instantiated later (when Derived is complete) and are safe; immediate class-scope uses of Derived's members are not."
    },
    {
      "type": "code",
      "tag": "type erasure",
      "question": "Why does this call go through a virtual function even though no inheritance is visible at the call site?",
      "code": "Drawable d = Circle{};   // Circle has a non-virtual draw()\nd.draw();                // calls Concept::draw via Model<Circle>",
      "options": ["Circle::draw() is secretly virtual","The wrapper stored the Circle in a Model<Circle> whose overridden Concept::draw() forwards to Circle::draw(); the wrapper call dispatches virtually","d.draw() is a compile-time call","Drawable copies Circle's vtable"],
      "answer": 1,
      "explain": "Type erasure synthesizes the polymorphism: Circle needs no virtuals of its own, but Model<Circle> overrides the abstract Concept::draw() and forwards to Circle::draw(). The wrapper's draw() dispatches through Concept virtually."
    },
    {
      "type": "mcq",
      "tag": "static vs dynamic",
      "question": "Which best summarizes the fundamental trade being made between static and dynamic polymorphism?",
      "options": ["Static gives runtime flexibility; dynamic gives speed","Static gives compile-time binding, speed, and type-specific optimization but no runtime heterogeneity; dynamic gives runtime flexibility and shared code at the cost of indirection","Both are identical in every practical respect","Dynamic always produces smaller and faster code"],
      "answer": 1,
      "explain": "The core trade-off: static polymorphism optimizes and specializes at compile time but cannot handle types unknown until runtime; dynamic polymorphism handles heterogeneous runtime types through one interface but pays for indirect dispatch and blocks some inlining."
    },
    {
      "type": "mcq",
      "tag": "metaprogramming",
      "question": "Which task genuinely requires compile-time computation rather than a runtime alternative?",
      "options": ["Summing a runtime-sized vector","Producing a value usable as a non-type template argument or array bound, which must be a constant expression","Sorting user input","Reading a file"],
      "answer": 1,
      "explain": "Contexts like template arguments, array bounds, static_assert, and case labels demand constant expressions, which only compile-time computation (constexpr or template metaprogramming) can supply. Runtime values cannot be used there."
    },
    {
      "type": "code",
      "tag": "CRTP",
      "question": "Why does this attempt to call a Derived member from the base constructor misbehave?",
      "code": "template<class D> struct Base {\n  Base(){ static_cast<D*>(this)->init(); } // called during construction\n};\nstruct Widget : Base<Widget> {\n  int v = 5;\n  void init(){ /* uses v */ }\n};",
      "options": ["It fails to compile","During Base's constructor the Widget subobject (including v) is not yet constructed, so init() touches uninitialized members — a subtle CRTP construction-order bug","It calls a virtual function safely","static_cast is invalid in a constructor"],
      "answer": 1,
      "explain": "Base's constructor runs before Widget's members are initialized. Downcasting and calling init() there accesses Widget state that does not exist yet, causing undefined behavior — analogous to (and worse than) calling virtuals from a base constructor."
    },
    {
      "type": "mcq",
      "tag": "type erasure",
      "question": "Which pair are standard-library examples of type erasure?",
      "options": ["std::vector and std::array","std::function and std::any (and std::shared_ptr's deleter)","std::tuple and std::pair","std::optional and std::variant"],
      "answer": 1,
      "explain": "std::function erases a callable's type behind a call interface; std::any erases any type behind a value interface; shared_ptr type-erases its deleter. variant/optional/tuple, by contrast, retain the exact types statically."
    },
    {
      "type": "mcq",
      "tag": "traits",
      "question": "std::iterator_traits is a traits template that provides a level of indirection so that:",
      "options": ["Iterators run faster at runtime","Both class-type iterators and raw pointers can be queried uniformly for value_type, difference_type, category, etc., via a specialization for pointers","Iterators become polymorphic","Algorithms avoid templates"],
      "answer": 1,
      "explain": "iterator_traits lets generic algorithms ask for an iterator's associated types uniformly. A partial specialization for T* supplies those types for raw pointers, which cannot carry member typedefs — a classic traits adaptation."
    },
    {
      "type": "mcq",
      "tag": "static polymorphism",
      "question": "Why can a CRTP-based numeric library sometimes outperform an equivalent virtual-based one by a wide margin?",
      "options": ["It avoids all function calls","Removing virtual dispatch lets the compiler inline element operations and vectorize/optimize the resulting straight-line code","It uses less memory per element","It runs on the GPU automatically"],
      "answer": 1,
      "explain": "Static binding exposes the concrete operations to the optimizer, enabling inlining and auto-vectorization of tight numeric kernels. A virtual call per element would block these optimizations and add indirection overhead."
    },
    {
      "type": "mcq",
      "tag": "policy classes",
      "question": "Andrei Alexandrescu's policy-based design assembles a class from policies mainly to achieve:",
      "options": ["Runtime plugin loading","Combinatorial flexibility with compile-time selection and no runtime penalty, replacing an explosion of hand-written subclasses","Smaller compile times","Elimination of all templates"],
      "answer": 1,
      "explain": "Policy-based design composes orthogonal choices as template parameters, generating exactly the wanted combination at compile time with zero overhead. It replaces a combinatorial explosion of manually written derived classes."
    },
    {
      "type": "mcq",
      "tag": "type erasure",
      "question": "When a type-erased wrapper uses small-buffer optimization, which correctness concern arises for the stored object?",
      "options": ["It can never be copied","Move/copy of the wrapper must correctly relocate the inline object (invoking its move/copy), since it lives inside the wrapper's buffer, not on the heap","It must be trivially destructible","It cannot have a destructor"],
      "answer": 1,
      "explain": "With SBO the object lives inside the wrapper. Moving/copying the wrapper cannot just copy a pointer; it must properly move/copy the embedded object using type-erased operations, and handle non-trivial destructors — more complex than the heap case."
    },
    {
      "type": "mcq",
      "tag": "trade-offs",
      "question": "Which statement about compile times is most accurate for template-heavy static polymorphism?",
      "options": ["It has no effect on compile time","Extensive instantiation across many types can significantly increase compile times and memory use, a real cost weighed against runtime gains","It always compiles faster than virtual code","Compile time depends only on lines of source, not instantiations"],
      "answer": 1,
      "explain": "Every instantiation is compiled work; template-heavy code with many type arguments can dramatically raise build times and compiler memory. This is a genuine engineering trade-off against the runtime performance benefits."
    },
    {
      "type": "mcq",
      "tag": "type erasure vs variant",
      "question": "How does type erasure (std::any-style) differ from a closed variant (std::variant) for holding 'one of several types'?",
      "options": ["They are identical","variant is a closed, fixed set of types known at compile time (no heap, exhaustive visitation); type erasure is open to any conforming type but usually needs allocation and a fixed interface","variant requires inheritance; any does not","type erasure cannot store class types"],
      "answer": 1,
      "explain": "variant enumerates its alternatives at compile time and stores them inline, enabling exhaustive visitation. Type erasure accepts an open set of types behind a common interface, typically at the cost of allocation and indirection."
    },
    {
      "type": "mcq",
      "tag": "bridging",
      "question": "A design exposes templates internally but a virtual 'IShape' interface at module boundaries. What is the chief benefit?",
      "options": ["It removes the need for any interface","Internal code stays fast and generic while the boundary offers runtime heterogeneity and a stable interface for callers who need it","It forces all shapes to be known at compile time","It eliminates virtual calls"],
      "answer": 1,
      "explain": "This layered approach keeps hot internal paths statically optimized and presents a runtime-polymorphic facade where flexibility/stability matter — a pragmatic bridge letting each layer use the polymorphism style that fits."
    },
    {
      "type": "mcq",
      "tag": "policy vs traits",
      "question": "You want users to select a growth strategy (double vs. +50%) for a custom container. Is this best modeled as a trait or a policy?",
      "options": ["A trait, since it describes a fixed property of the element type","A policy, since it is a pluggable behavioral decision the user chooses independently of the element type","Neither; use a virtual function only","A macro"],
      "answer": 1,
      "explain": "Growth strategy is a behavioral knob orthogonal to the element type, chosen by the user — the hallmark of a policy. A trait would be the wrong fit because it is not an intrinsic property queried from the element type."
    },
    {
      "type": "mcq",
      "tag": "CRTP mixin",
      "question": "std::enable_shared_from_this<T> uses a CRTP-like parameter T. What does passing T enable?",
      "options": ["It makes T polymorphic","shared_from_this() can return a shared_ptr<T> of the exact derived type, because the base is parameterized on T","It stores T by value","It disables weak_ptr"],
      "answer": 1,
      "explain": "By parameterizing on the derived type T, enable_shared_from_this<T>::shared_from_this() yields shared_ptr<T> without extra casts — the same 'base knows the derived type' idea CRTP uses, applied to shared-ownership recovery."
    },
    {
      "type": "code",
      "tag": "metaprogramming",
      "question": "What does this variadic-inheritance 'overloaded' visitor pattern accomplish?",
      "code": "template<class... Fs> struct overloaded : Fs... { using Fs::operator()...; };\ntemplate<class... Fs> overloaded(Fs...) -> overloaded<Fs...>;\n// std::visit(overloaded{ [](int){}, [](double){} }, v);",
      "options": ["It stores the lambdas on the heap","It inherits from each lambda and merges their operator() into one overload set, letting std::visit pick the right handler per alternative at compile time","It makes the lambdas virtual","It erases the lambda types"],
      "answer": 1,
      "explain": "By deriving from each callable and pulling in every operator() with a using-declaration, overloaded builds a single overload set. std::visit then statically selects the matching lambda for the active variant alternative — a neat metaprogramming design idiom."
    },
    {
      "type": "mcq",
      "tag": "static vs dynamic",
      "question": "Which is a false claim about static polymorphism?",
      "options": ["It can eliminate virtual-call overhead","It supports storing arbitrary runtime-determined types in one container","It may increase binary size via instantiation","It enables inlining of the dispatched call"],
      "answer": 1,
      "explain": "Static polymorphism cannot store runtime-determined heterogeneous types uniformly — that is dynamic polymorphism's job. The other three statements correctly describe static polymorphism's benefits and costs."
    },
    {
      "type": "code",
      "tag": "CRTP",
      "question": "Why does adding a data member of type D to Base<D> create a problem that a D* member would not?",
      "code": "template<class D> struct Bad { D value; };        // requires D complete\ntemplate<class D> struct Ok  { D* ptr; };          // pointer is fine\nstruct S : Bad<S> {};  // ill-formed",
      "options": ["Bad is fine; Ok is the error","A D value member requires D to be complete when Bad<S> is instantiated as S's base, but S is still incomplete then; a D* only needs an incomplete type","Both are ill-formed","D* cannot be a member"],
      "answer": 1,
      "explain": "A by-value member needs the complete type to know its size/layout, which is impossible while S is being defined. A pointer member only needs an incomplete type, so it is legal. This is a concrete face of the CRTP completeness gotcha."
    },
    {
      "type": "mcq",
      "tag": "type erasure",
      "question": "Which is the best summary of type erasure's value proposition?",
      "options": ["Compile-time-only polymorphism with zero overhead","Non-intrusive, value-semantic runtime polymorphism: any conforming type works without inheriting a base, behind a single concrete wrapper type","A way to avoid writing any interface","A replacement for constexpr"],
      "answer": 1,
      "explain": "Type erasure gives runtime polymorphism over an open set of unrelated, non-intrusive types, presenting them through one concrete value type (like std::function/std::any). The cost is indirection and often allocation."
    },
    {
      "type": "code",
      "tag": "policy classes",
      "question": "How does this policy host let a stateless CheckingPolicy add cost-free precondition checks?",
      "code": "template<class Check>\nstruct Stack : private Check {\n  void pop(){ Check::require(!empty()); /* ... */ }\n};\nstruct NoCheck { static void require(bool){} };\nstruct Assert  { static void require(bool b){ if(!b) std::terminate(); } };",
      "options": ["Through virtual dispatch to Check","By statically calling Check::require; with NoCheck the empty function inlines away to nothing, while Assert inserts the check — chosen at compile time","By storing a Check object per Stack element","By using RTTI to pick the policy"],
      "answer": 1,
      "explain": "The policy's static require() is called directly and inlined. NoCheck compiles to nothing (zero overhead), Assert compiles in the check — the behavior is selected by the template argument at compile time with empty-base optimization keeping Stack small."
    },
    {
      "type": "mcq",
      "tag": "metaprogramming",
      "question": "Why might replacing recursive template metafunctions with fold expressions or index_sequence improve a design?",
      "options": ["They run at runtime instead","They reduce instantiation depth and the number of intermediate types, typically improving compile times and diagnostics","They enable virtual dispatch","They eliminate the need for templates"],
      "answer": 1,
      "explain": "Fold expressions and std::index_sequence express many operations without deep per-step recursion, cutting instantiation counts and depth. That tends to compile faster and produce shorter error messages than hand-rolled recursion."
    }
  ]
};

/* ===== C++ Software Design — Design Principles & SOLID ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["swd-principles"] = {
  title: "C++ Software Design — Design Principles & SOLID",
  subtitle: "SRP, OCP, LSP, ISP, DIP applied to real C++ — spotting violations and the cost of coupling.",
  crumb: "C++ Software Design",
  questions: [

    /* ---------- Design fundamentals, design for change, dependencies ---------- */

    {
      "type": "mcq",
      "tag": "What Is Design",
      "question": "According to Iglberger, what is the essence of software design?",
      "options": [
        "Selecting optimal algorithms and data structures for performance-critical code paths",
        "The art of managing dependencies and abstractions between the parts of a software system",
        "Producing complete UML documentation of the system before implementation begins",
        "Applying as many Gang-of-Four design patterns as possible to demonstrate craftsmanship"
      ],
      "answer": 1,
      "explain": "The book's central thesis is that design is about managing dependencies and abstractions — deciding what depends on what, and hiding volatile decisions behind stable boundaries. Algorithms, language features and patterns are means; the dependency structure is what determines whether software stays changeable."
    },
    {
      "type": "mcq",
      "tag": "Features vs Design",
      "question": "The C++ community spends enormous energy on language mechanics (move semantics, constexpr, coroutines). Why does the book argue this focus misses what makes software projects succeed long-term?",
      "options": [
        "Because those features are too new to be used safely in production code",
        "Because compilers optimize code well enough that language mechanics rarely matter",
        "Because language features are implementation details; maintainability is determined by the structure and dependencies of the code, i.e., by its design",
        "Because most C++ projects are legacy codebases stuck on C++98 anyway"
      ],
      "answer": 2,
      "explain": "Guideline 'understand the importance of software design': features help you express a design well, but they cannot rescue a bad dependency structure. A project with perfect move semantics and tangled coupling still becomes unmaintainable — structure, not syntax, decides the cost of change."
    },
    {
      "type": "mcq",
      "tag": "Three Levels",
      "question": "Iglberger distinguishes software architecture, software design, and implementation details. Which of the following decisions sits at the software *design* level?",
      "options": [
        "Introducing an abstraction so the reporting module no longer depends on the concrete database class",
        "Splitting the system into separately deployable services that communicate over a message bus",
        "Replacing a hand-written sorting loop with std::ranges::sort",
        "Marking a function constexpr so it can be evaluated at compile time"
      ],
      "answer": 0,
      "explain": "Design lives between the big architectural picture (deployable units, service boundaries) and implementation details (which language feature or algorithm to use). Managing the dependency between a module and a concrete class — typically with an abstraction or a design pattern — is exactly the design level."
    },
    {
      "type": "mcq",
      "tag": "Design for Change",
      "question": "Why does the book elevate 'design for change' to one of its very first guidelines?",
      "options": [
        "Because requirements can be fully captured up front if the analysis phase is thorough enough",
        "Because performance requirements dominate every other concern in C++ projects",
        "Because the compiler guarantees that any change which still compiles is safe",
        "Because change is the one constant in software: a design that resists change accumulates coupling, and each modification becomes riskier and more expensive"
      ],
      "answer": 3,
      "explain": "Software that succeeds gets changed — requirements shift, dependencies update, teams learn. Since we cannot predict the exact change, the guideline says to keep coupling low and separate concerns so that whatever change arrives stays local instead of rippling through the system."
    },
    {
      "type": "mcq",
      "tag": "Cost of a Dependency",
      "question": "What is the *real* cost of a source-code dependency from module A on module B?",
      "options": [
        "The runtime overhead of the extra function calls into B",
        "Every change in B becomes a potential reason for A to change, recompile, retest, and redeploy — B's volatility is transitively imposed on A",
        "Slightly longer link times, which modern hardware makes negligible",
        "There is no meaningful cost as long as B's interface is documented"
      ],
      "answer": 1,
      "explain": "Dependencies transmit change. A depends on B means A inherits B's reasons to change: recompilation, retesting, re-release. That is why the book treats every dependency as a liability to be justified — minimizing and directing dependencies is the whole game of design."
    },
    {
      "type": "mcq",
      "tag": "Artificial Coupling",
      "question": "What does the book mean by an *artificial* dependency (artificial coupling)?",
      "options": [
        "A dependency on a decision that is irrelevant to the dependent code's actual purpose — such as a concrete container type, serialization format, or vendor library it never needed",
        "Any use of a third-party library instead of the standard library",
        "Two classes that reference each other from different namespaces",
        "Coupling introduced by templates rather than by virtual functions"
      ],
      "answer": 0,
      "explain": "Coupling is artificial when code is bound to details it does not logically require — e.g., an algorithm that only needs to iterate a sequence but demands a std::vector. Such accidental dependencies multiply the reasons the code must change, without buying anything in return."
    },
    {
      "type": "code",
      "tag": "Coupling to Containers",
      "question": "average() only needs to iterate a sequence of doubles. Which criticism, in the spirit of minimizing dependencies, applies to this utility used across a large codebase?",
      "code": "#include <vector>\n\ndouble average(const std::vector<double>& values)\n{\n    double sum = 0.0;\n    for (double v : values) { sum += v; }\n    return values.empty() ? 0.0 : sum / static_cast<double>(values.size());\n}",
      "options": [
        "It should take std::vector by value so callers' data cannot be modified",
        "It should be a member function of a Statistics class instead of a free function",
        "It artificially couples every caller to one container choice; a std::span<const double> (or an iterator/range interface) would demand only what the function actually needs",
        "Nothing — passing by const reference already minimizes coupling as much as C++ allows"
      ],
      "answer": 2,
      "explain": "The function's true requirement is 'a readable sequence of doubles', but its signature demands one specific container, so callers holding a std::array or deque must copy into a vector. Depending on more than you need is artificial coupling; std::span or a range parameter states the real, minimal requirement."
    },
    {
      "type": "code",
      "tag": "Leaky Interface",
      "question": "What long-term design cost does the entries() accessor create for PhoneBook?",
      "code": "#include <map>\n#include <string>\n\nclass PhoneBook\n{\npublic:\n    void add(std::string name, int number)\n    {\n        entries_.emplace(std::move(name), number);\n    }\n\n    const std::map<std::string, int>& entries() const { return entries_; }\n\nprivate:\n    std::map<std::string, int> entries_;\n};",
      "options": [
        "Returning a const reference risks dangling references in single-threaded code, so it must return by value",
        "std::map is too slow for lookups; std::unordered_map should have been chosen from the start",
        "The accessor makes PhoneBook non-copyable, limiting its reuse",
        "The choice of std::map is now part of the public contract: clients will rely on its type, ordering, and iterators, so the internal representation can never change without breaking them"
      ],
      "answer": 3,
      "explain": "Exposing the member's exact type promotes an implementation detail into the interface. Every client that touches the returned map couples itself to ordering guarantees and iterator types, so switching to unordered_map or a flat vector becomes a breaking change. Interfaces should express what clients need (lookup, iteration), not how it is stored."
    },
    {
      "type": "mcq",
      "tag": "Ripple Effects",
      "question": "Renaming a field in the on-disk JSON format forces edits inside the pricing engine's core calculation code. What does this symptom indicate?",
      "options": [
        "JSON was the wrong choice; a binary format would decouple the modules",
        "A missing abstraction: persistence details have leaked into high-level business logic, coupling it to a volatile low-level decision",
        "The pricing engine lacks unit tests to catch the change earlier",
        "The team violated the Law of Demeter when parsing the file"
      ],
      "answer": 1,
      "explain": "High-level policy (pricing rules) changing because a low-level detail (field names in a file format) changed is the classic ripple effect of a missing boundary. An abstraction between logic and persistence would confine format changes to the persistence side — that is design for change in action."
    },
    {
      "type": "mcq",
      "tag": "Scope of SOLID",
      "question": "How does the book position the SOLID principles for modern C++?",
      "options": [
        "As general guidelines about managing change and dependencies, applicable to functions, modules, templates, and overload sets — not just virtual-function class hierarchies",
        "As rules that only make sense in Java-style object-oriented designs",
        "As obsolete advice superseded by value semantics and std::variant",
        "As hard laws that must all be maximally satisfied in every piece of code"
      ],
      "answer": 0,
      "explain": "Iglberger repeatedly shows SOLID outside classic OO: SRP for functions and modules, OCP via overloading and templates, LSP for concept semantics, ISP for template argument requirements, DIP at compile time. The principles are about dependency management, which every paradigm has to face."
    },

    /* ---------- SRP & cohesion ---------- */

    {
      "type": "code",
      "tag": "SRP Violation",
      "question": "Which principle does the Order class most directly violate?",
      "code": "#include <ostream>\n#include <string>\n#include <vector>\n\nstruct Item\n{\n    std::string name;\n    double price;\n};\n\nclass Order\n{\npublic:\n    void addItem(Item item);\n    double totalWithDiscounts() const;      // pricing rules\n    std::string toJSON() const;             // wire format\n    void saveToDatabase();                  // persistence\n    void renderHTML(std::ostream& os) const; // presentation\n\nprivate:\n    std::vector<Item> items_;\n};",
      "options": [
        "Open-closed: the class cannot be extended without adding virtual functions",
        "Liskov substitution: Order cannot be substituted for Item in generic code",
        "Single responsibility: pricing rules, wire format, persistence, and presentation are four unrelated reasons for this one class to change",
        "Dependency inversion: Order should be an abstract base class with concrete order kinds"
      ],
      "answer": 2,
      "explain": "Each concern answers to a different stakeholder: finance changes discounts, the API team changes JSON, DBAs change the schema, UX changes HTML. Fusing them means every one of those changes touches (and can break) the same class. SRP says to separate things that change for different reasons."
    },
    {
      "type": "mcq",
      "tag": "SRP Meaning",
      "question": "Which statement best captures what the single-responsibility principle actually demands?",
      "options": [
        "Every class should have exactly one public member function",
        "Every class should correspond to exactly one real-world entity",
        "Classes should be kept as small as the language allows",
        "Group the things that change for the same reason; separate the things that change for different reasons"
      ],
      "answer": 3,
      "explain": "SRP is not about size or method counts — it is about variation points. An entity should have one reason to change, meaning its contents are cohesive with respect to change. This orthogonality keeps modifications local and prevents unrelated features from breaking each other."
    },
    {
      "type": "code",
      "tag": "Separating Concerns",
      "question": "Money mixes arithmetic with locale-dependent display. Which refactoring best follows the single-responsibility principle?",
      "code": "#include <string>\n\nclass Money\n{\npublic:\n    explicit Money(long cents) : cents_(cents) {}\n\n    Money operator+(Money rhs) const { return Money(cents_ + rhs.cents_); }\n    long cents() const { return cents_; }\n\n    // Reads the user's locale configuration from disk and\n    // renders e.g. \"1.234,56 EUR\" or \"$1,234.56\".\n    std::string toDisplayString() const;\n\nprivate:\n    long cents_;\n};",
      "options": [
        "Extract display formatting into a separate formatter (a UI-side class or free function), leaving Money purely about monetary value and arithmetic",
        "Make toDisplayString() virtual so subclasses can adapt the format per locale",
        "Turn Money into a class template parameterized on a Locale policy",
        "Cache the locale configuration in a static variable so disk reads happen only once"
      ],
      "answer": 0,
      "explain": "Monetary arithmetic changes for financial reasons; display strings change for UI and localization reasons — two different owners, two rates of change. Moving formatting out means locale churn never touches (or recompiles) the value type. The other options keep the coupling and merely reshuffle mechanics."
    },
    {
      "type": "mcq",
      "tag": "SRP Smell",
      "question": "Which observation is the strongest signal that a class violates the single-responsibility principle?",
      "options": [
        "The class is longer than 500 lines",
        "Commits from unrelated feature streams — a tax-rule change, a file-format change, a UI tweak — keep editing this same class",
        "The class has more than one data member",
        "The class implements more than one interface"
      ],
      "answer": 1,
      "explain": "Reasons-to-change are best observed in version history: when independent kinds of change repeatedly converge on one entity, it is serving several masters. Size and member counts are weak proxies; a large but single-purpose class can be perfectly cohesive."
    },
    {
      "type": "mcq",
      "tag": "Cohesion",
      "question": "What does *high cohesion* mean for a class or module?",
      "options": [
        "Its member functions all call one another at least once",
        "It has few outgoing dependencies on other classes",
        "Its parts genuinely belong together: they serve one purpose and tend to change together",
        "All of its data members are private and accessed through getters"
      ],
      "answer": 2,
      "explain": "Cohesion measures how strongly the contents of an entity relate to a single purpose. High cohesion is the flip side of SRP: elements that change together live together. Few outgoing dependencies is low efferent coupling — related, but a different property."
    },
    {
      "type": "code",
      "tag": "Inheritance for Reuse",
      "question": "What is the primary *structural* problem with this design?",
      "code": "#include <fstream>\n#include <string>\n\nclass FileLogger\n{\npublic:\n    void log(const std::string& msg) { file_ << msg << '\\n'; }\n\nprivate:\n    std::ofstream file_{\"log.txt\"};\n};\n\nclass TaxCalculator : public FileLogger\n{\npublic:\n    double tax(double amount)\n    {\n        log(\"computing tax\");\n        return amount * 0.19;\n    }\n};",
      "options": [
        "Implementation inheritance is being abused for code reuse: TaxCalculator publicly claims to BE a FileLogger and is welded to one concrete logging mechanism; a logger should be an injected collaborator",
        "The log file name is hard-coded and should come from a configuration file",
        "std::ofstream cannot be a class member because it is not copyable",
        "FileLogger lacks a virtual destructor, which makes any use of TaxCalculator undefined behavior"
      ],
      "answer": 0,
      "explain": "Public inheritance advertises substitutability, but a tax calculator is not a logger — this is reuse-driven inheritance, one of the strongest forms of coupling. Business logic is now inseparable from file I/O, hurting both testability and change. Composition with an injected logging abstraction expresses the real relationship. (The missing virtual destructor only matters when deleting through a base pointer.)"
    },
    {
      "type": "mcq",
      "tag": "Change Insurance",
      "question": "We cannot predict which change will arrive. How does the book say a design should prepare for change anyway?",
      "options": [
        "Add configuration options for every behavior that might vary",
        "Introduce an abstract base class in front of every concrete class",
        "Freeze requirements contractually before implementation begins",
        "Keep concerns separated and coupling low, so that whichever change arrives remains localized instead of cascading"
      ],
      "answer": 3,
      "explain": "Design for change is not fortune-telling; it is damage control. Separation of concerns is cheap, general insurance: it does not guess the change, it limits any change's blast radius. Speculative options and blanket abstractions, by contrast, are guesses that usually miss (YAGNI)."
    },
    {
      "type": "mcq",
      "tag": "SRP for Functions",
      "question": "A 300-line function parses a file, validates the data, computes statistics, and prints a report. What is the SRP-driven improvement?",
      "options": [
        "Insert banner comments marking the four sections for readability",
        "Extract each concern into its own function so each has a single reason to change and can be tested in isolation",
        "Convert the function into a class with one large run() member function",
        "Turn it into a function template so different report types can reuse it"
      ],
      "answer": 1,
      "explain": "SRP applies below the class level too. Parsing, validation, computation, and presentation change for different reasons; as separate functions, each can be modified, replaced, and unit-tested independently. Comments and mechanical repackaging leave the coupling exactly where it was."
    },

    /* ---------- DRY, YAGNI, premature abstraction ---------- */

    {
      "type": "mcq",
      "tag": "DRY",
      "question": "What does the Don't-Repeat-Yourself principle actually demand?",
      "options": [
        "No two functions in a codebase may contain textually similar statements",
        "All numeric constants must be gathered into one global header",
        "Every piece of *knowledge* — a business rule, a policy, a format — has a single authoritative representation, so a change to it happens in exactly one place",
        "Common behavior should always be shared through a common base class"
      ],
      "answer": 2,
      "explain": "DRY is about knowledge, not keystrokes. If the same rule lives in two places, someday one copy will be updated and the other forgotten. But the converse matters too: code that merely *looks* alike while encoding different knowledge is not duplication in DRY's sense."
    },
    {
      "type": "mcq",
      "tag": "Coincidental Duplication",
      "question": "Two modules contain identical five-line computations — but one implements a tax rounding rule and the other a shipping-weight heuristic. What does the book advise?",
      "options": [
        "Leave them separate: they represent different knowledge owned by different stakeholders and will evolve independently; unifying them couples unrelated concerns",
        "Merge them into a shared utility function immediately, as DRY requires",
        "Merge them and add a boolean parameter to cover future divergence",
        "Delete one and have its module call into the other module directly"
      ],
      "answer": 0,
      "explain": "This is coincidental duplication: the sameness is an accident of today's numbers, not shared knowledge. Unify it and the first stakeholder to change 'their' rule silently changes the other's — or must fork the abstraction under pressure. DRY misapplied creates coupling that is worse than the duplication."
    },
    {
      "type": "code",
      "tag": "False DRY",
      "question": "A developer noticed both discounts were 10% and 'deduplicated'. What is the danger?",
      "code": "// pricing/employee.cpp — HR-owned policy\ndouble employeeDiscount(double price)\n{\n    return price * 0.90;\n}\n\n// pricing/promo.cpp — marketing-owned policy\n// \"It's the same math, so reuse it!\"\ndouble promoPrice(double price)\n{\n    return employeeDiscount(price);\n}",
      "options": [
        "The extra function call adds measurable runtime overhead in hot paths",
        "promoPrice should at least take the discount rate as a parameter",
        "None — this is exactly the reuse DRY calls for",
        "The equality is coincidental: employee benefits and marketing promos are different pieces of knowledge with different owners; when HR changes its policy, promo prices silently change too"
      ],
      "answer": 3,
      "explain": "Two policies that happen to share a number today are still two policies. The dependency welds marketing's price to HR's benefit rule — a change in one stakeholder's domain now propagates invisibly into another's. DRY protects single sources of knowledge; this code fabricates a shared source that never existed."
    },
    {
      "type": "mcq",
      "tag": "YAGNI",
      "question": "What does the YAGNI principle ('You Aren't Gonna Need It') warn against?",
      "options": [
        "Refactoring code before it has caused a production incident",
        "Implementing functionality or abstractions for hypothetical future needs — unused generality is coupling, cognitive load, and maintenance cost with no payoff",
        "Depending on third-party libraries you could write yourself",
        "Writing tests for code paths that are not yet reachable"
      ],
      "answer": 1,
      "explain": "Speculative features and extension points are bets, and most bets on unknown futures lose. Meanwhile the unused flexibility must be read, maintained, and worked around every day. YAGNI complements design for change: prepare via separation of concerns, not via imagined features."
    },
    {
      "type": "mcq",
      "tag": "Wrong Abstraction",
      "question": "Why is a premature (and therefore likely wrong) abstraction often more expensive than living with duplication?",
      "options": [
        "Abstractions always cost a virtual call, which dominates in practice",
        "Duplication never causes bugs, so there is nothing to weigh against",
        "A wrong abstraction spreads: clients contort around it, flags and parameters accrete to cover mismatched cases, and unwinding it later costs far more than de-duplicating straightforward copies would have",
        "Because template abstractions increase compile times beyond acceptable limits"
      ],
      "answer": 2,
      "explain": "Abstractions are load-bearing: every user builds on their shape. When the shape is wrong, each new case is patched in with parameters and special cases, and removal requires touching every client. Plain duplication, by contrast, can be unified later once the *real* commonality is known."
    },
    {
      "type": "code",
      "tag": "Speculative Generality",
      "question": "This hierarchy has exactly one implementation, and no second one is planned. Which criticism is most apt?",
      "code": "#include <memory>\n\nclass Calculator\n{\npublic:\n    virtual ~Calculator() = default;\n    virtual double compute(double x) const = 0;\n};\n\nclass DefaultCalculator : public Calculator\n{\npublic:\n    double compute(double x) const override { return x * 2.0; }\n};\n\nstd::unique_ptr<Calculator> makeCalculator()\n{\n    return std::make_unique<DefaultCalculator>();\n}",
      "options": [
        "Speculative generality (YAGNI): with one implementation and no identified axis of variation, the abstraction adds indirection, allocation, and cognitive cost while insuring against a change nobody has predicted",
        "The factory must return std::shared_ptr so ownership can be shared later",
        "Calculator should additionally be a class template to maximize flexibility",
        "The design is wrong because factories and abstract classes may not be combined"
      ],
      "answer": 0,
      "explain": "An abstraction earns its keep by decoupling from real variation. Here there is nothing to vary, so every caller pays for dynamic allocation, pointer indirection, and an extra concept to understand — for free insurance against an unknown risk. Introduce the interface when a second implementation or a genuine test-seam need materializes."
    },
    {
      "type": "mcq",
      "tag": "When to Abstract",
      "question": "What guidance does the book's philosophy give for *when* to introduce an abstraction?",
      "options": [
        "Abstract every dependency on principle — interfaces are free",
        "Abstract only after a profiler shows the concrete coupling is a bottleneck",
        "Never abstract in application code; abstractions belong exclusively in libraries",
        "Introduce it when a real, identified axis of change or a second concrete use exists — good abstractions are discovered from actual variation, not invented from speculation"
      ],
      "answer": 3,
      "explain": "Abstraction is the tool for managing *known* volatility: a dependency you expect to swap, a detail that changes on a different schedule. Without observed or clearly anticipated variation you are guessing, and a guessed abstraction usually has the wrong shape (the premature-abstraction trap)."
    },

    /* ---------- OCP ---------- */

    {
      "type": "code",
      "tag": "Switch on Type",
      "question": "The codebase contains many functions shaped like area(), each switching on ShapeType. What does adding a triangle actually cost?",
      "code": "enum class ShapeType { circle, square };\n\nstruct Shape\n{\n    ShapeType type;\n    double dimension;\n};\n\ndouble area(const Shape& s)\n{\n    switch (s.type)\n    {\n        case ShapeType::circle:\n            return 3.14159265 * s.dimension * s.dimension;\n        case ShapeType::square:\n            return s.dimension * s.dimension;\n    }\n    return 0.0;\n}\n\ndouble perimeter(const Shape& s); // another switch, in another file\nvoid draw(const Shape& s);        // another switch, in another file",
      "options": [
        "Almost nothing: adding one case to area() is a single local edit",
        "Every switch over ShapeType scattered across the codebase must be found and edited, modifying existing tested code — the design is closed against type extension, violating the open-closed principle on the type axis",
        "It violates Liskov substitution, because a triangle cannot be represented by one dimension",
        "It cannot be done: adding an enumerator to a C++ enum class is a binary-breaking change"
      ],
      "answer": 1,
      "explain": "The type information is data, and every operation re-interprets it — so a new type touches all of them, and a forgotten switch fails only at runtime (or silently returns 0.0). OCP asks that anticipated extensions be additive. If new *types* are the expected change, this procedural shape is the wrong axis choice."
    },
    {
      "type": "mcq",
      "tag": "OCP Statement",
      "question": "Which formulation best expresses the open-closed principle as a practical goal?",
      "options": [
        "You should be able to add new behavior by adding new code, without modifying existing, tested code",
        "All classes should be declared final unless extension is explicitly designed for",
        "All data members should be private and reachable only through accessors",
        "Every class must sit behind a virtual interface so it can be replaced"
      ],
      "answer": 0,
      "explain": "Open for extension, closed for modification: the design provides points where new functionality plugs in additively. The payoff is risk management — shipped, tested code stays untouched, and change concentrates in the new artifact. Encapsulation and final are different tools for different problems."
    },
    {
      "type": "mcq",
      "tag": "Extension Axes",
      "question": "What is the fundamental trade-off between an inheritance hierarchy with virtual functions and a procedural design (enum/switch or std::variant/visitor)?",
      "options": [
        "The virtual hierarchy is always faster because switches defeat branch prediction",
        "There is no trade-off; the visitor pattern makes both designs equivalent",
        "OO hierarchies make adding new *types* additive but adding new *operations* intrusive; procedural/variant designs make adding new *operations* additive but adding new *types* intrusive",
        "Switch statements always violate the open-closed principle, so only the hierarchy is a legitimate design"
      ],
      "answer": 2,
      "explain": "This duality (the 'expression problem') is central to the book's OCP discussion. A new derived class slots into a hierarchy without touching old code, but a new virtual operation edits the base and every derived class. Variant/visitor mirrors it exactly. Neither is universally right — the anticipated direction of change decides."
    },
    {
      "type": "code",
      "tag": "Hierarchy Extension Cost",
      "question": "In this classic hierarchy, which kind of extension is *expensive*?",
      "code": "class Shape\n{\npublic:\n    virtual ~Shape() = default;\n    virtual double area() const = 0;\n    virtual void draw() const = 0;\n};\n\nclass Circle : public Shape\n{\npublic:\n    explicit Circle(double r) : radius_(r) {}\n    double area() const override;\n    void draw() const override;\n\nprivate:\n    double radius_;\n};\n\nclass Square : public Shape\n{\npublic:\n    explicit Square(double s) : side_(s) {}\n    double area() const override;\n    void draw() const override;\n\nprivate:\n    double side_;\n};",
      "options": [
        "Adding a new shape type such as Triangle — it requires editing Shape",
        "Calling area() through a Shape reference — it requires a dynamic_cast per call",
        "Making Circle final — it would break existing clients of Shape",
        "Adding a new operation such as serialize(): the abstract base and every existing derived class must be modified, so the hierarchy is open for type extension but closed against operation extension"
      ],
      "answer": 3,
      "explain": "A new type is purely additive here — write Triangle, override the virtuals, done. But a new operation must be injected into the base class's interface and implemented in every derived class, touching all the existing tested code. If operations are the volatile axis, a visitor- or variant-based design fits better."
    },
    {
      "type": "mcq",
      "tag": "Choosing the Axis",
      "question": "How should you decide between a virtual class hierarchy and a std::variant/visitor design for a closed-vs-open modeling problem?",
      "options": [
        "Always prefer std::variant — it is the modern C++ replacement for inheritance",
        "Identify which axis is most likely to be extended — the set of types or the set of operations — and pick the design that keeps *that* axis open",
        "Always prefer the hierarchy — visitors reintroduce switch statements through the back door",
        "Benchmark both and choose whichever is faster on the target platform"
      ],
      "answer": 1,
      "explain": "OCP cannot be satisfied in every direction at once, so design becomes a bet on the direction of change. A plugin-style system with ever-new types wants dynamic polymorphism; a fixed set of alternatives with ever-new operations wants variant plus visitors. Dogma in either direction ignores the actual volatility."
    },
    {
      "type": "code",
      "tag": "Variant Design",
      "question": "Which statement correctly characterizes this std::variant-based design?",
      "code": "#include <variant>\n\nstruct Circle { double radius; };\nstruct Square { double side; };\n\nusing Shape = std::variant<Circle, Square>;\n\nstruct Area\n{\n    double operator()(const Circle& c) const\n    {\n        return 3.14159265 * c.radius * c.radius;\n    }\n    double operator()(const Square& s) const\n    {\n        return s.side * s.side;\n    }\n};\n\ndouble area(const Shape& s)\n{\n    return std::visit(Area{}, s);\n}",
      "options": [
        "New operations are non-intrusive (write another visitor like Perimeter without touching existing code), but a new shape alternative is intrusive (edit the variant and every visitor) — the mirror image of a virtual hierarchy",
        "Both axes are open: std::variant fully solves the open-closed principle",
        "This is just slower inheritance — the extension trade-offs are identical to a virtual hierarchy",
        "Adding the Perimeter operation requires modifying Circle, Square, and Area"
      ],
      "answer": 0,
      "explain": "With value-based variants, operations live outside the types, so a new operation is a new visitor — purely additive, and Circle/Square stay untouched. The price is paid on the type axis: extending the variant's alternative list forces every visitor to handle the newcomer (helpfully, as a compile error)."
    },
    {
      "type": "mcq",
      "tag": "Operations Grow Weekly",
      "question": "The set of shape types is stable, but new operations (export, hit-testing, measuring) are added weekly by different teams. Which design serves the open-closed principle best?",
      "options": [
        "An abstract Shape base class that grows one pure virtual function per operation",
        "A single Shape class holding an enum, with each operation added as a new member function containing a switch",
        "A closed set of types in std::variant, with each new operation written as a new free-standing visitor — no existing file is modified",
        "A Shape base class with a generic doOperation(int opCode, void* args) escape hatch"
      ],
      "answer": 2,
      "explain": "When operations are the volatile axis, keep them outside the types: each team ships its feature as a new visitor (or overload set) without touching the shape definitions or each other's code. Growing a base class weekly churns every derived class; the void* escape hatch abandons type safety entirely."
    },
    {
      "type": "mcq",
      "tag": "Closed for Modification",
      "question": "What does 'closed for modification' concretely buy a team when it holds?",
      "options": [
        "Clients never need to recompile for any reason",
        "The public API is frozen forever, which simplifies versioning",
        "Objects become immutable, eliminating data races",
        "Existing, tested, shipped code stays untouched when features are added, so regression risk and retest effort concentrate in the new code"
      ],
      "answer": 3,
      "explain": "Modification of working code is where regressions come from; addition of new code is comparatively safe and reviewable in isolation. OCP is thus a risk-containment strategy: extension points channel change into fresh artifacts while the proven core remains stable."
    },

    /* ---------- LSP ---------- */

    {
      "type": "code",
      "tag": "Rectangle/Square",
      "question": "resize() is handed a Square. What does it return?",
      "code": "class Rectangle\n{\npublic:\n    virtual ~Rectangle() = default;\n    virtual void setWidth(int w)  { width_ = w; }\n    virtual void setHeight(int h) { height_ = h; }\n    int area() const { return width_ * height_; }\n\nprotected:\n    int width_  = 0;\n    int height_ = 0;\n};\n\nclass Square : public Rectangle\n{\npublic:\n    void setWidth(int s) override  { width_ = height_ = s; }\n    void setHeight(int s) override { width_ = height_ = s; }\n};\n\nint resize(Rectangle& r)\n{\n    r.setWidth(4);\n    r.setHeight(5);\n    return r.area(); // caller expects independent width and height\n}",
      "options": [
        "20",
        "25",
        "16",
        "The behavior is undefined because the overrides modify protected state"
      ],
      "answer": 1,
      "explain": "Square's overrides couple the dimensions, so setWidth(4) sets both to 4 and setHeight(5) then sets both to 5 — area() returns 25, not the 20 the Rectangle contract implies. Mathematically a square is a rectangle, but behaviorally a mutable Square cannot honor 'setters act independently', which is exactly the Liskov substitution failure."
    },
    {
      "type": "code",
      "tag": "Precondition Strengthening",
      "question": "Which LSP contract rule does PositiveIntSet break?",
      "code": "#include <stdexcept>\n#include <vector>\n\nclass IntSet\n{\npublic:\n    virtual ~IntSet() = default;\n\n    // Contract: accepts any int value.\n    virtual void insert(int value) { data_.push_back(value); }\n\nprotected:\n    std::vector<int> data_;\n};\n\nclass PositiveIntSet : public IntSet\n{\npublic:\n    void insert(int value) override\n    {\n        if (value <= 0) { throw std::invalid_argument(\"positive only\"); }\n        IntSet::insert(value);\n    }\n};",
      "options": [
        "It strengthens the precondition: the base promises to accept any int, the subtype demands positive values, so correct code written against IntSet can now throw",
        "It weakens the postcondition: insert() no longer guarantees the value was stored",
        "It violates the invariant of std::vector by calling push_back through the base",
        "None — throwing on invalid input documents the restriction and is therefore acceptable"
      ],
      "answer": 0,
      "explain": "Behavioral subtyping demands that a subtype require no more than the base: preconditions may only stay the same or weaken. Code holding an IntSet& is entitled to insert(-3); the subtype turns a valid call into an exception. Clients are punished for demanding exactly what the base contract granted."
    },
    {
      "type": "mcq",
      "tag": "Override Contract Rules",
      "question": "Under behavioral subtyping, what may an override legitimately do to the base function's contract?",
      "options": [
        "Strengthen preconditions and weaken postconditions, if documented",
        "Strengthen both preconditions and postconditions symmetrically",
        "Weaken (or keep) preconditions and strengthen (or keep) postconditions, while preserving all base-class invariants",
        "Change pre- and postconditions freely as long as the signature is identical"
      ],
      "answer": 2,
      "explain": "The subtype may demand less and promise more — never the reverse. Accepting more inputs or delivering stronger guarantees keeps every base-written caller correct; demanding more or delivering less breaks them. Invariants the base establishes must survive in the subtype, since clients reason with them."
    },
    {
      "type": "code",
      "tag": "Throwing Override",
      "question": "ReadOnlyDocument turns save() into a runtime error. What is the best *design-level* fix?",
      "code": "#include <stdexcept>\n#include <string>\n\nclass Document\n{\npublic:\n    virtual ~Document() = default;\n    virtual void display() const = 0;\n    virtual void save(const std::string& path) = 0;\n};\n\nclass ReadOnlyDocument : public Document\n{\npublic:\n    void display() const override;\n\n    void save(const std::string&) override\n    {\n        throw std::logic_error(\"read-only document cannot be saved\");\n    }\n};",
      "options": [
        "Wrap every call to save() in try/catch throughout the codebase",
        "Document on Document::save() that some implementations may throw",
        "Make save() non-virtual so it cannot be overridden incorrectly",
        "Restructure the hierarchy: saving is not part of every document's contract, so extract it into a separate interface (e.g., Saveable) implemented only by writable documents"
      ],
      "answer": 3,
      "explain": "The throw is a symptom: ReadOnlyDocument was forced to implement a capability it does not have, so the abstraction over-promises. Splitting the fat contract (an ISP move) restores LSP — every remaining implementer of Saveable can genuinely save, and clients needing persistence request that interface explicitly. Weakening the base contract for everyone (option B) degrades all callers instead."
    },
    {
      "type": "mcq",
      "tag": "IS-A Semantics",
      "question": "A square *is* a rectangle mathematically. Why does that fact fail to justify inheritance in code?",
      "options": [
        "Because C++ inheritance is too inefficient to model mathematical relationships",
        "Because IS-A in design means *behavioral substitutability against the base contract*: a mutable Square cannot honor Rectangle's promise of independently settable width and height, so it is not a subtype in Liskov's sense",
        "Because Square should derive from Shape directly to keep the hierarchy flat",
        "Because mathematical taxonomies use different axioms and are irrelevant to programming"
      ],
      "answer": 1,
      "explain": "Subtyping is a promise about behavior visible through the base interface, not a statement about real-world classification. Immutable squares substitute for immutable rectangles just fine; the contradiction appears only with the mutating contract. The lesson: derive from the *expected behavior*, not from the noun."
    },
    {
      "type": "code",
      "tag": "Virtual Dispatch Trap",
      "question": "What does this program print? (Consider how virtual dispatch and default arguments interact.)",
      "code": "#include <iostream>\n#include <string>\n\nclass Base\n{\npublic:\n    virtual ~Base() = default;\n    virtual void greet(const std::string& name = \"Base\") const\n    {\n        std::cout << \"Hello \" << name << '\\n';\n    }\n};\n\nclass Derived : public Base\n{\npublic:\n    void greet(const std::string& name = \"Derived\") const override\n    {\n        std::cout << \"Hi \" << name << '\\n';\n    }\n};\n\nint main()\n{\n    Derived d;\n    const Base& b = d;\n    b.greet();\n}",
      "options": [
        "Hello Base",
        "Hi Derived",
        "Hi Base",
        "Hello Derived"
      ],
      "answer": 2,
      "explain": "The function body is chosen dynamically (Derived::greet prints \"Hi\"), but default arguments are bound statically from the type of the expression — Base — so \"Base\" is passed. The observable behavior is a hybrid neither author wrote, which is why redefining default arguments in overrides silently corrupts the base contract."
    },
    {
      "type": "mcq",
      "tag": "Invariants",
      "question": "What obligation does a subtype have toward the invariants its base class establishes?",
      "options": [
        "It must preserve every base invariant, because clients holding a base reference reason and act on the strength of those invariants",
        "It may relax invariants as long as the relaxation is documented in the derived class",
        "Invariants only constrain data members inherited as protected, not private ones",
        "Invariants are enforced by the compiler, so subtypes cannot break them"
      ],
      "answer": 0,
      "explain": "An invariant is part of the observable contract: 'this container is always sorted', 'balance never goes negative'. Code written against the base assumes it unconditionally. A subtype that weakens it breaks those clients in ways the type system cannot detect — LSP violations are semantic, invisible to the compiler."
    },
    {
      "type": "code",
      "tag": "Object Slicing",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nclass Shape\n{\npublic:\n    virtual ~Shape() = default;\n    virtual void draw() const { std::cout << \"Shape\\n\"; }\n};\n\nclass Circle : public Shape\n{\npublic:\n    void draw() const override { std::cout << \"Circle\\n\"; }\n};\n\nvoid render(Shape s)\n{\n    s.draw();\n}\n\nint main()\n{\n    Circle c;\n    render(c);\n}",
      "options": [
        "Circle",
        "Shape",
        "It fails to compile: a Circle cannot be passed by value as a Shape",
        "The behavior is undefined because the Circle part is destroyed early"
      ],
      "answer": 1,
      "explain": "render() takes Shape by value, so the Circle is *sliced*: only the Shape subobject is copied and the parameter's dynamic type is exactly Shape, printing \"Shape\". Substitutability through the base interface requires reference (or pointer) semantics; pass-by-value of a polymorphic base silently discards the derived behavior."
    },
    {
      "type": "mcq",
      "tag": "LSP and Templates",
      "question": "How does the Liskov substitution idea apply to templates and C++20 concepts?",
      "options": [
        "It does not — LSP is defined exclusively for virtual-function hierarchies",
        "Concepts make LSP automatic, because the compiler verifies the constraint",
        "It applies only to CRTP-based static polymorphism",
        "The same idea holds: a type passed to a template must honor the *semantic* expectations behind the concept (like the meaning of ++ or ==), which syntactic constraint checks cannot verify"
      ],
      "answer": 3,
      "explain": "A template's constraint is an interface, and instantiating types are its 'subtypes'. Concepts check syntax — that operations exist — but the template also assumes semantics (equality is an equivalence, iteration visits each element once). A type that compiles but bends those meanings breaks generic code exactly the way an LSP-violating override breaks OO code."
    },
    {
      "type": "code",
      "tag": "Postcondition Weakening",
      "question": "Which contract rule does FastSorter violate?",
      "code": "#include <vector>\n\nclass Sorter\n{\npublic:\n    virtual ~Sorter() = default;\n\n    // Contract: returns the values in ascending order.\n    virtual std::vector<int> sort(std::vector<int> values) const;\n};\n\nclass FastSorter : public Sorter\n{\npublic:\n    // \"Optimization\": for large inputs, returns the values\n    // only partially ordered to save time.\n    std::vector<int> sort(std::vector<int> values) const override;\n};",
      "options": [
        "It weakens the postcondition: the base promises ascending order, the subtype delivers less, breaking every client that relied on the base guarantee (e.g., code doing binary search on the result)",
        "It strengthens the precondition by rejecting large inputs",
        "Nothing is violated yet, because the functions are only declared, not defined",
        "It violates the open-closed principle by overriding instead of overloading"
      ],
      "answer": 0,
      "explain": "Postconditions may only stay equal or get stronger in a subtype. A client that calls sort() through Sorter& and then binary-searches the result is fully correct per the base contract — and silently wrong with FastSorter. Note the compiler is happy; the contract lives in documentation and clients' justified expectations."
    },
    {
      "type": "mcq",
      "tag": "Whose Contract",
      "question": "When we say an override 'breaks the contract', against what standard is the violation judged?",
      "options": [
        "The derived class's own documentation",
        "The C++ standard's rules for virtual dispatch",
        "The base class's documented guarantees — the expectations promised to clients that program against the base abstraction",
        "The unit tests that ship with the derived class"
      ],
      "answer": 2,
      "explain": "Substitutability is defined from the client's seat: code that knows only the base must keep working, unaware of which subtype it holds. Therefore the base's stated preconditions, postconditions, and invariants are the yardstick. A derived class can document anything it likes — if base-written clients can observe the difference and break, LSP is violated."
    },

    /* ---------- ISP ---------- */

    {
      "type": "code",
      "tag": "Fat Interface",
      "question": "What design problem does SimplePrinter's implementation reveal?",
      "code": "class Machine\n{\npublic:\n    virtual ~Machine() = default;\n    virtual void print() = 0;\n    virtual void scan() = 0;\n    virtual void fax() = 0;\n};\n\nclass SimplePrinter : public Machine\n{\npublic:\n    void print() override { /* real work */ }\n    void scan()  override { /* do nothing?? throw?? */ }\n    void fax()   override { /* do nothing?? throw?? */ }\n};",
      "options": [
        "SimplePrinter should throw std::logic_error from scan() and fax() to make the limitation explicit",
        "The interface aggregates unrelated capabilities: devices without them are forced into meaningless stubs, and printing clients become coupled to scanning and faxing they never use",
        "Machine is missing a virtual destructor, so deleting a SimplePrinter through Machine* is undefined",
        "print(), scan(), and fax() should return error codes instead of void"
      ],
      "answer": 1,
      "explain": "This is the interface-segregation failure: Machine bundles three independent capabilities, so every implementer must answer for all of them and every client drags in all of them. The empty (or throwing — an LSP violation) stubs are the symptom. Small role interfaces — Printer, Scanner, Fax — let devices implement what they truly offer."
    },
    {
      "type": "mcq",
      "tag": "ISP Statement",
      "question": "Which statement expresses the interface-segregation principle?",
      "options": [
        "An interface should be implemented by at least two classes before it is justified",
        "Every interface should contain exactly one member function",
        "Interfaces should always be defined in their own header files",
        "No client should be forced to depend on member functions (or requirements) it does not use"
      ],
      "answer": 3,
      "explain": "ISP targets a specific form of artificial coupling: dependency on the unused. When a client must see a wide contract to use one corner of it, changes to the other corners still ripple into that client. Segregating interfaces by client need cuts those needless dependency edges."
    },
    {
      "type": "mcq",
      "tag": "Fat Interface Cost",
      "question": "A client calls only draw() on a ten-method interface. What cost does the fat interface still impose on that client?",
      "options": [
        "It is coupled to all ten declarations: a signature change to any unused method still forces the client to recompile — and forces every implementer it relies on to adapt — even though its own code is untouched",
        "Each unused entry makes the vtable dispatch of draw() measurably slower",
        "Every object instance grows by one pointer per unused method",
        "None — unused virtual functions are dead-stripped by the linker, removing the dependency"
      ],
      "answer": 0,
      "explain": "Dependencies are contracted at the interface, not at the call site. The client's translation unit includes the whole class definition, so any churn in it propagates; and the pool of usable implementations is limited to classes willing to implement all ten methods. ISP trims the contract to what the client actually consumes."
    },
    {
      "type": "code",
      "tag": "Depending on the Unused",
      "question": "render() uses only draw(). What is problematic about its parameter type, and for whom?",
      "code": "#include <string>\n\nclass Document\n{\npublic:\n    virtual ~Document() = default;\n    virtual void draw() const = 0;\n    virtual std::string serialize() const = 0;\n    virtual void spellcheck() = 0;\n};\n\nvoid render(const Document& doc)\n{\n    doc.draw();\n}",
      "options": [
        "render() should take Document by value to avoid aliasing issues",
        "draw() should not be const, since rendering may cache state",
        "render() and all rendering clients are coupled to serialization and spell-checking: changes there force recompilation of rendering code, and anything drawable must also implement both — clients should depend on a minimal Drawable abstraction instead",
        "Nothing — three methods is well under any reasonable threshold for a 'fat' interface"
      ],
      "answer": 2,
      "explain": "Fat is relative to the client: for render(), two-thirds of this contract is dead weight that still transmits change. A tiny Drawable interface (or a concept requiring just draw()) frees renderers from serialization churn and lets things that cannot serialize still be drawn. ISP is measured per client, not by method count."
    },
    {
      "type": "mcq",
      "tag": "ISP and SRP",
      "question": "How does the book relate the interface-segregation principle to the single-responsibility principle?",
      "options": [
        "They conflict: ISP multiplies interfaces while SRP minimizes classes",
        "ISP is SRP applied to interfaces: separate an interface's concerns so that clients depend only on the responsibility they actually need",
        "ISP generalizes Liskov substitution to non-virtual functions",
        "ISP is a performance guideline, while SRP is a maintainability guideline"
      ],
      "answer": 1,
      "explain": "A fat interface is a low-cohesion entity: it bundles capabilities that serve different clients and change for different reasons. Segregating it is exactly the SRP move — grouping what belongs together, separating what does not — performed on the abstraction rather than the implementation."
    },
    {
      "type": "code",
      "tag": "ISP for Concepts",
      "question": "Per the book's 'ISP applies to templates too', what is wrong with this concept?",
      "code": "#include <string>\n\ntemplate<typename T>\nconcept Drawable = requires(T t)\n{\n    t.draw();\n    { t.serialize() } -> std::same_as<std::string>;\n};\n\nvoid render(Drawable auto& shape)\n{\n    shape.draw();   // serialize() is never called\n}",
      "options": [
        "The constraint demands more than render() uses: types that can draw but not serialize are rejected, and every caller is coupled to a serialization requirement the algorithm never exercises — concepts should require exactly what the code needs",
        "A concept may not contain two requirements in one requires-expression",
        "requires-expressions cannot check return types, so the serialize clause is ignored",
        "render() should use virtual dispatch, because concepts cannot express polymorphism"
      ],
      "answer": 0,
      "explain": "Template constraints are interfaces, and over-constraining is the template-world fat interface: it needlessly narrows the set of usable types and welds callers to irrelevant requirements that may churn. The guideline is minimal, client-focused concepts — require draw() here, and let a separate Serializable concept serve the code that serializes."
    },
    {
      "type": "mcq",
      "tag": "Segregation Remedy",
      "question": "What is the standard remedy once a fat interface has been identified?",
      "options": [
        "Give the unused pure virtuals empty default implementations so implementers can skip them",
        "Add capability queries such as supportsFax() that clients must check before calling",
        "Keep the interface but document which subsets each client may call",
        "Split it into small, client-focused role interfaces; implementers inherit and compose exactly the roles they genuinely support"
      ],
      "answer": 3,
      "explain": "Role interfaces align contracts with real capabilities and real client needs: Printer, Scanner, Fax instead of Machine. Default no-op bodies and runtime capability flags merely hide the mismatch until runtime — they keep the coupling and add a new failure mode (forgetting to check). Segregation removes the false dependency at compile time."
    },

    /* ---------- DIP ---------- */

    {
      "type": "code",
      "tag": "Concrete Dependency",
      "question": "From a dependency-structure viewpoint, what is the core problem in OrderProcessor?",
      "code": "#include <string>\n\nclass MySQLDatabase\n{\npublic:\n    void execute(const std::string& sql);\n};\n\nclass OrderProcessor\n{\npublic:\n    void process()\n    {\n        // ... business rules ...\n        db_.execute(\"INSERT INTO orders VALUES (...)\");\n    }\n\nprivate:\n    MySQLDatabase db_;\n};",
      "options": [
        "The SQL string should be a named constant shared with the schema definition",
        "OrderProcessor::process() does too many things in one member function",
        "The high-level policy is welded to a concrete low-level detail: OrderProcessor cannot be compiled, tested, or reused without MySQL — it should depend on a persistence abstraction that it (the high level) owns",
        "The database member should be a pointer so that it can be null when offline"
      ],
      "answer": 2,
      "explain": "Business rules are the valuable, stable part; the database vendor is a volatile detail. Here the dependency arrow points from policy down to detail, so every database change threatens the policy code and tests must run against real MySQL. Inverting the dependency — an abstraction owned by the order module, implemented by a MySQL adapter — frees the high level."
    },
    {
      "type": "mcq",
      "tag": "DIP Statement",
      "question": "Which is the canonical statement of the dependency-inversion principle?",
      "options": [
        "Always use a dependency-injection framework to construct object graphs",
        "High-level modules should not depend on low-level modules; both should depend on abstractions — and abstractions should not depend on details, details should depend on abstractions",
        "Every dependency between two classes must be routed through an interface",
        "Lower architectural layers must never call functions in higher layers"
      ],
      "answer": 1,
      "explain": "DIP has two halves: direct the source-code arrows away from volatile details, and keep the abstractions themselves ignorant of those details. It does not demand interfaces everywhere — only across boundaries where the low-level side is volatile and the high-level side must be protected."
    },
    {
      "type": "mcq",
      "tag": "Abstraction Ownership",
      "question": "In a DIP-conforming architecture, who *owns* the abstraction (e.g., the persistence interface)?",
      "options": [
        "The high-level module: the abstraction expresses what the high level needs, so it belongs with — and is defined by — the high level",
        "The low-level implementer, since only it knows what capabilities can be offered",
        "A dedicated global 'interfaces' module that every other module depends on",
        "Ownership is irrelevant as long as an abstract class exists somewhere"
      ],
      "answer": 0,
      "explain": "This is the subtle half of DIP that the book stresses: an interface belongs architecturally to its *clients*. If the database module defines the interface, the business module still depends on the database module. When the high level owns it, the detail implements the high level's contract — the arrow genuinely turns around."
    },
    {
      "type": "code",
      "tag": "Misplaced Abstraction",
      "question": "An abstraction exists, yet something is still architecturally wrong. What?",
      "code": "// ---- low-level module: <database> ----\nnamespace database {\n\nclass IPersistence\n{\npublic:\n    virtual ~IPersistence() = default;\n    virtual void save(int orderId) = 0;\n};\n\nclass MySQL : public IPersistence\n{\npublic:\n    void save(int orderId) override;\n};\n\n} // namespace database\n\n// ---- high-level module: <business> ----\nnamespace business {\n\nclass OrderFlow\n{\npublic:\n    explicit OrderFlow(database::IPersistence& p) : p_(p) {}\n    void run() { p_.save(42); }\n\nprivate:\n    database::IPersistence& p_;\n};\n\n} // namespace business",
      "options": [
        "Nothing — programming to IPersistence satisfies dependency inversion regardless of where the interface lives",
        "IPersistence should have a protected, non-virtual destructor",
        "MySQL should inherit privately, since inheritance of implementation is a detail",
        "The abstraction is owned by the low-level database module, so business still depends on database; moving IPersistence into the high-level module makes the detail depend on the policy instead"
      ],
      "answer": 3,
      "explain": "Follow the arrows at module granularity: business names database::IPersistence, so business → database persists, and database-module churn (including MySQL details in the same unit) still reaches the policy code. Relocating the interface into business flips the module-level arrow: database then includes business's header to implement its contract."
    },
    {
      "type": "mcq",
      "tag": "What Is Inverted",
      "question": "In dependency *inversion*, what exactly gets inverted?",
      "options": [
        "The runtime call direction: with DIP, the database calls into the business logic",
        "The order in which modules must be compiled and linked",
        "The source-code dependency: at runtime the high level still calls down into the low level, but the compile-time arrow now points from the low-level implementation *up* to the abstraction the high level owns",
        "Ownership of heap-allocated objects, which moves to the caller"
      ],
      "answer": 2,
      "explain": "Control flow is unchanged — policies still invoke details through the interface. What flips is the direction of source dependency: the concrete class inherits from (and therefore depends on) the abstraction, while the high level knows only that abstraction. Compile-time arrows opposing runtime call flow is the signature of DIP."
    },
    {
      "type": "code",
      "tag": "Compile-Time DIP",
      "question": "How does this template-based design relate to the dependency-inversion principle?",
      "code": "#include <string>\n\ntemplate<typename Database>\nclass OrderProcessor\n{\npublic:\n    explicit OrderProcessor(Database& db) : db_(db) {}\n\n    void process()\n    {\n        db_.execute(\"INSERT INTO orders VALUES (...)\");\n    }\n\nprivate:\n    Database& db_;\n};",
      "options": [
        "It violates DIP, because there is no abstract base class involved",
        "It achieves dependency inversion at compile time: OrderProcessor depends on an implicit concept ('something with execute'), not on any concrete database, and tests can inject a fake without virtual dispatch",
        "Templates cannot express dependency inversion; only virtual functions can invert an arrow",
        "It is the service-locator pattern, which DIP explicitly forbids"
      ],
      "answer": 1,
      "explain": "The abstraction here is the implied (ideally concept-constrained) template requirement, owned by OrderProcessor itself. Concrete databases conform to that requirement, so details depend on the policy's contract — inversion without vtables. The book emphasizes that abstractions in C++ include concepts and overload sets, not just base classes."
    },
    {
      "type": "mcq",
      "tag": "Plugin Architecture",
      "question": "Why is a plugin architecture the archetypal illustration of the dependency-inversion principle?",
      "options": [
        "The application owns and publishes the interface; plugins — the volatile details — depend on the application's contract, while the application knows nothing about any concrete plugin",
        "Plugins live in shared libraries, and dynamic loading removes compile-time coupling automatically",
        "Plugins run in separate processes, so no dependency can exist in either direction",
        "Each plugin defines its own interface, which the application then implements"
      ],
      "answer": 0,
      "explain": "The host application is the high-level policy and would be absurd to rebuild for every new plugin. So the arrow must point from plugin to application: plugins implement the app's published extension interface. Stable side owns the contract; volatile side conforms to it — DIP in its purest architectural form."
    },
    {
      "type": "code",
      "tag": "Inverted Arrows",
      "question": "After refactoring, the abstraction lives in the high-level module. Which statement about source-code dependencies is now true?",
      "code": "// ---- high-level module: <business> ----\nnamespace business {\n\nclass Persistence   // abstraction owned by the high level\n{\npublic:\n    virtual ~Persistence() = default;\n    virtual void save(int orderId) = 0;\n};\n\nclass OrderFlow\n{\npublic:\n    explicit OrderFlow(Persistence& p) : p_(p) {}\n    void run() { p_.save(42); }\n\nprivate:\n    Persistence& p_;\n};\n\n} // namespace business\n\n// ---- low-level module: <database> ----\nnamespace database {\n\nclass MySQLPersistence : public business::Persistence\n{\npublic:\n    void save(int orderId) override;\n};\n\n} // namespace database",
      "options": [
        "business and database now depend on each other, forming an acceptable cycle",
        "business depends on database, because MySQL executes the queries at runtime",
        "Neither module depends on the other; the compiler resolves the calls structurally",
        "The arrow points only from database up to business: the low-level detail implements the high-level module's abstraction, and business compiles with no knowledge of database"
      ],
      "answer": 3,
      "explain": "MySQLPersistence names business::Persistence, so database → business is the sole source-code dependency; business's translation units never mention the database module. Swapping vendors, or faking persistence in tests, now touches nothing in the policy code — the practical dividend of the high level owning its abstraction."
    },
    {
      "type": "mcq",
      "tag": "DIP Enables OCP",
      "question": "What is the relationship between dependency inversion and the open-closed principle?",
      "options": [
        "They are independent principles that rarely interact in practice",
        "OCP has replaced DIP in modern C++, since value semantics removed inheritance",
        "The abstraction introduced for DIP is precisely what creates the extension point OCP needs: new implementations plug in behind the interface without modifying the high-level code",
        "DIP applies only at the architecture level, while OCP applies only to individual functions"
      ],
      "answer": 2,
      "explain": "The two principles are complementary views of the same boundary. DIP says the policy should face an abstraction it owns; OCP says new behavior should arrive additively. One well-placed abstraction delivers both: the policy is protected from details (DIP) and each new detail is a new class, not an edit (OCP)."
    },

    /* ---------- Law of Demeter ---------- */

    {
      "type": "code",
      "tag": "Talking to Strangers",
      "question": "Which principle does shippingCity() violate, and why does it matter?",
      "code": "#include <string>\n\nclass Address\n{\npublic:\n    const std::string& city() const;\n};\n\nclass Customer\n{\npublic:\n    const Address& address() const;\n};\n\nclass Order\n{\npublic:\n    const Customer& customer() const;\n};\n\nstd::string shippingCity(const Order& order)\n{\n    return order.customer().address().city();\n}",
      "options": [
        "Single responsibility: Order should not know about customers at all",
        "Law of Demeter: shippingCity() navigates Order → Customer → Address, hard-coding the object graph's internal structure into distant code; any structural change (say, per-order shipping addresses) breaks it",
        "Dependency inversion: Address should be an abstract interface",
        "Open-closed: new kinds of city cannot be added without modifying the chain"
      ],
      "answer": 1,
      "explain": "The function talks to strangers: it received an Order but reaches through it into objects two hops away, so it now depends on the internals of three classes. 'Don't talk to strangers' limits knowledge to immediate collaborators; asking the Order for its shipping city keeps the graph's shape a private, changeable detail."
    },
    {
      "type": "code",
      "tag": "Tell, Don't Ask",
      "question": "checkout() digs into Customer's wallet twice. Which refactoring best addresses the coupling?",
      "code": "class Wallet\n{\npublic:\n    double balance() const;\n    void debit(double amount);\n};\n\nclass Customer\n{\npublic:\n    Wallet& wallet() { return wallet_; }\n\nprivate:\n    Wallet wallet_;\n};\n\nbool checkout(Customer& c, double amount)\n{\n    if (c.wallet().balance() >= amount)\n    {\n        c.wallet().debit(amount);\n        return true;\n    }\n    return false;\n}",
      "options": [
        "Give Customer a pay(amount) operation that returns success ('tell, don't ask'); checkout asks the customer to pay, and the wallet becomes an invisible internal detail",
        "Return the Wallet by value from wallet() so callers cannot mutate the original",
        "Make balance() and debit() static members of Wallet for easier access",
        "Have checkout() take Wallet& directly, removing Customer from the call chain"
      ],
      "answer": 0,
      "explain": "checkout() currently implements Customer's payment policy from outside, using knowledge of Wallet's API — two classes' internals leaked into a third place. Moving the decision next to the data (Customer::pay) collapses the chain, and a later change (multiple wallets, credit, loyalty points) stays inside Customer."
    },
    {
      "type": "mcq",
      "tag": "Demeter's Real Point",
      "question": "What is the Law of Demeter fundamentally about — and what is it *not* about?",
      "options": [
        "It mechanically forbids more than one dot or arrow per statement, without exception",
        "It forbids getters; all state must be manipulated through command methods",
        "It applies only to raw pointers, since references cannot dangle",
        "A unit should not depend on the internal *structure* of its collaborators: each chained accessor hard-codes structural knowledge that will break when the structure changes — while chains that stay on one object, like fluent builders returning *this, are perfectly fine"
      ],
      "answer": 3,
      "explain": "Demeter is a coupling principle, not a punctuation rule. The harm is in *knowledge*: a.b().c().d() encodes the private shape of three objects into a fourth place. Fluent APIs and range pipelines chain calls on the same logical object and reveal no foreign structure, so they are not violations."
    },

    /* ---------- Testability ---------- */

    {
      "type": "code",
      "tag": "Hidden Clock",
      "question": "Why is Session::isExpired() hard to unit-test well?",
      "code": "#include <chrono>\n\nclass Session\n{\npublic:\n    explicit Session(std::chrono::system_clock::time_point expiry)\n        : expiry_(expiry)\n    {}\n\n    bool isExpired() const\n    {\n        return std::chrono::system_clock::now() > expiry_;\n    }\n\nprivate:\n    std::chrono::system_clock::time_point expiry_;\n};",
      "options": [
        "std::chrono clocks behave differently across platforms, so results vary by OS",
        "time_point values cannot be constructed directly inside test code",
        "isExpired() has a hidden dependency on the ambient system clock: a test cannot control 'now', so it must either sleep, manipulate the machine clock, or accept flakiness — the time source should be an injectable, substitutable dependency",
        "The constructor should be private, with sessions created by a factory"
      ],
      "answer": 2,
      "explain": "The dependency on the wall clock never appears in any signature — it is reached for from inside, so no test seam exists. Tests are the first client to demand substitution, and they expose the coupling immediately. Injecting a time source (an interface, a template parameter, or even a plain function) makes expiry logic deterministic to test."
    },
    {
      "type": "mcq",
      "tag": "Tests as First Client",
      "question": "Why does the book treat testability as a *design* indicator rather than merely a QA concern?",
      "options": [
        "Tests slow development down, so design must compensate with simplicity",
        "Tests are the first real client of your code: if a class is hard to instantiate or isolate in a test, its hidden coupling will hurt every future client and every future change the same way",
        "Testability only matters for library code with external consumers",
        "Because 100% branch coverage is required before applying design principles"
      ],
      "answer": 1,
      "explain": "A test tries to use a class alone, with substituted collaborators — precisely what reuse and change will demand later. Friction in the test (needs a database, a real clock, a singleton warmed up) is a coupling report, delivered early and cheaply. Design for testability and design for change are largely the same activity."
    },
    {
      "type": "code",
      "tag": "Singleton Seam",
      "question": "Which change most improves the testability of PriceCalculator?",
      "code": "#include <string>\n\nclass Config\n{\npublic:\n    static Config& instance();   // global singleton\n    std::string get(const std::string& key) const;\n};\n\nclass PriceCalculator\n{\npublic:\n    double finalPrice(double basePrice) const\n    {\n        double taxRate =\n            std::stod(Config::instance().get(\"tax_rate\"));\n        return basePrice * (1.0 + taxRate);\n    }\n};",
      "options": [
        "Add a static Config::setTestInstance() hook so tests can swap the singleton",
        "Read \"tax_rate\" once and cache it in a function-local static for speed",
        "Make finalPrice() a static member function, since it uses no object state",
        "Pass the dependency in: construct PriceCalculator with its tax rate (or an abstract config source), so tests build one with known values and no global state at all"
      ],
      "answer": 3,
      "explain": "The singleton access is an invisible input: nothing in the signature reveals that behavior depends on global mutable state. Constructor injection turns the hidden dependency into an explicit, substitutable one — tests simply pass 0.19. A setTestInstance() hook keeps the global coupling and adds shared-state ordering hazards between tests."
    },
    {
      "type": "mcq",
      "tag": "Testability Killers",
      "question": "Which design habit most damages unit-testability?",
      "options": [
        "Reaching out to global state, singletons, the real clock, or the filesystem from inside member functions, so collaborators cannot be observed or substituted from outside",
        "Programming against pure virtual interfaces rather than concrete classes",
        "Keeping data members private and exposing behavior instead of state",
        "Preferring free functions over member functions for algorithms"
      ],
      "answer": 0,
      "explain": "Substitutability is the currency of testing, and hidden acquisition of dependencies destroys it: the test cannot intercept what the code grabs for itself internally. Interfaces, encapsulation, and free functions all *aid* testing. The rule of thumb: dependencies should enter through the front door — parameters and constructors."
    },

    /* ---------- Coupling metrics, SDP, ADP ---------- */

    {
      "type": "mcq",
      "tag": "Coupling Metrics",
      "question": "What do afferent coupling (Ca) and efferent coupling (Ce) measure for a component?",
      "options": [
        "Afferent counts outgoing dependencies; efferent counts incoming ones",
        "Both count only inheritance relationships crossing the component boundary",
        "Afferent coupling counts who depends *on* the component (incoming edges); efferent coupling counts what the component itself depends on (outgoing edges)",
        "They measure runtime call frequency into and out of the component"
      ],
      "answer": 2,
      "explain": "The two directions capture different pressures: high Ca means many others feel your changes (responsibility — you have strong reasons NOT to change), high Ce means many others' changes reach you (dependence — you have many reasons TO change). These are static, structural counts, not runtime measurements, and they feed the instability metric I = Ce / (Ce + Ca)."
    },
    {
      "type": "mcq",
      "tag": "Instability",
      "question": "Instability is defined as I = Ce / (Ce + Ca). What does I ≈ 1 say about a component?",
      "options": [
        "It is depended upon by many components and is therefore risky to modify",
        "It depends on others while almost nothing depends on it — it is maximally unstable, meaning easy and safe to change",
        "It participates in a dependency cycle that inflates the metric",
        "It consists mostly of abstract classes and interfaces"
      ],
      "answer": 1,
      "explain": "Instability here is descriptive, not pejorative: I ≈ 1 (all outgoing, no incoming edges) marks a component free to change without breaking dependents — typical for top-level application code. I ≈ 0 marks a component whose changes ripple widely. Healthy architectures deliberately place components along this spectrum."
    },
    {
      "type": "mcq",
      "tag": "Stable and Abstract",
      "question": "A component has dozens of dependents and no outgoing dependencies (I ≈ 0). What does dependency-management theory recommend for it?",
      "options": [
        "Make it abstract: since modifying it is painful for all dependents, it should consist of stable abstractions that allow behavior to be extended without editing it",
        "Add outgoing dependencies to raise its instability toward the ideal of 0.5",
        "Rewrite it header-only so dependents at least recompile faster",
        "Reduce its afferent coupling by forbidding new components from using it"
      ],
      "answer": 0,
      "explain": "Maximum stability plus maximum concreteness is the painful corner: everyone depends on it, yet changing behavior requires editing it. The remedy is abstractness — interfaces and extension points let the component stay physically untouched while implementations evolve around it (the stable-abstractions idea, and why mature cores become interface-heavy)."
    },
    {
      "type": "code",
      "tag": "Dependency Cycle",
      "question": "The car and engine modules reference each other. What is the architectural consequence?",
      "code": "// ---- module: <car> ----\nclass Engine;   // defined in module <engine>\n\nclass Car\n{\npublic:\n    void install(Engine& e);\n\nprivate:\n    Engine* engine_ = nullptr;\n};\n\n// ---- module: <engine> ----\nclass Engine\n{\npublic:\n    void mountInto(Car& c);\n\nprivate:\n    Car* car_ = nullptr;\n};",
      "options": [
        "It cannot compile: mutually referencing classes are ill-formed in C++",
        "There is a risk of infinite recursion when install() and mountInto() call each other",
        "Only heap fragmentation: each object holds a pointer into the other module",
        "The two modules have fused into one de-facto component: neither can be built, tested, versioned, or reused without the other, and changes ripple around the loop — the cycle should be broken with an abstraction or by extracting a third component"
      ],
      "answer": 3,
      "explain": "Forward declarations make the code legal, but the *logical* cycle remains: car needs engine and engine needs car, so they ship, break, and get understood only together. The acyclic-dependencies idea demands a DAG between components; break the loop by having one side depend on an abstraction (DIP) or by extracting the shared concern."
    },
    {
      "type": "code",
      "tag": "Depending Downhill",
      "question": "TextFormatter lives in the core module used by ~40 others; ThemeSettings lives in the UI module and changes every sprint. Which dependency principle is violated?",
      "code": "#include <string>\n\n// ---- module: <ui> (changes every sprint) ----\nstruct ThemeSettings\n{\n    std::string fontName;\n    int         fontSize;\n    bool        highContrast;\n};\n\n// ---- module: <core> (used by ~40 other modules) ----\nclass TextFormatter\n{\npublic:\n    explicit TextFormatter(const ThemeSettings& theme)\n        : theme_(theme)\n    {}\n\n    std::string format(const std::string& text) const;\n\nprivate:\n    ThemeSettings theme_;\n};",
      "options": [
        "Interface segregation: ThemeSettings exposes fields TextFormatter never reads",
        "Acyclic dependencies: core and ui now form a dependency cycle",
        "Stable dependencies: a heavily-depended-upon (stable) component now depends on a volatile one, so every sprint's UI churn ripples through core into 40 modules — dependencies must point toward stability",
        "Law of Demeter: TextFormatter reaches through ThemeSettings' members"
      ],
      "answer": 2,
      "explain": "Depend in the direction of stability: things many rely on must themselves rely only on things at least as stable. Here the arrow points uphill — stable core to volatile UI — so ThemeSettings' weekly edits recompile and re-test the world. Fix by inverting: core defines an abstract formatting-options contract that the UI module fulfills."
    },
    {
      "type": "code",
      "tag": "Construction Contract",
      "question": "Base's constructor calls a virtual hook that Derived overrides. What does this program print?",
      "code": "#include <iostream>\n\nclass Base\n{\npublic:\n    Base() { hook(); }\n    virtual ~Base() = default;\n    virtual void hook() const { std::cout << \"Base\\n\"; }\n};\n\nclass Derived : public Base\n{\npublic:\n    void hook() const override { std::cout << \"Derived\\n\"; }\n};\n\nint main()\n{\n    Derived d;\n}",
      "options": [
        "Base",
        "Derived",
        "Nothing — the call is undefined behavior and may crash",
        "It fails to compile: virtual functions may not be called from constructors"
      ],
      "answer": 0,
      "explain": "During Base's constructor, the object's dynamic type *is* Base — the Derived part does not exist yet — so the virtual call resolves to Base::hook and prints \"Base\". This is well-defined but treacherous: a base class advertising 'derived classes customize hook()' silently breaks its own contract for construction-time calls."
    },
    {
      "type": "mcq",
      "tag": "Why Cycles Hurt",
      "question": "Why are dependency cycles between components considered so harmful?",
      "options": [
        "C++ compilers reject cyclic includes even with include guards in place",
        "The components in the cycle fuse into one de-facto unit: none can be built, tested, versioned, or reused independently, and a change anywhere in the loop can propagate all the way around it",
        "Cycles inevitably cause memory leaks through mutual shared_ptr ownership",
        "They matter only when components are packaged as shared libraries"
      ],
      "answer": 1,
      "explain": "A dependency structure should be a DAG so that components can be developed, released, and understood in a definite order. A cycle erases every boundary inside it: 'independent' modules must be integrated, tested, and shipped as one blob, and impact analysis becomes 'everything in the loop'. That is organizational, not just technical, damage."
    },
    {
      "type": "mcq",
      "tag": "Breaking Cycles",
      "question": "Modules A and B depend on each other. Which are the two standard ways to break the cycle?",
      "options": [
        "Merge A and B into a single module, making the cycle official",
        "Use forward declarations everywhere so the compiler no longer sees the cycle",
        "Introduce include guards and precompiled headers in both modules",
        "Apply dependency inversion (one side depends on an abstraction that the other implements), or extract the shared functionality into a new component that both depend on"
      ],
      "answer": 3,
      "explain": "Both remedies restore the DAG. Inversion flips one edge: B implements an interface owned by A, so both arrows now point the same way. Extraction removes the mutual need: the piece A wanted from B (and vice versa) moves into C, and A → C ← B is acyclic. Forward declarations only hide the physical symptom — the logical cycle remains."
    }
  ]
};

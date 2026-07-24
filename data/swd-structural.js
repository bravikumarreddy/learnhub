/* ===== C++ Software Design — Adapter, Observer, Bridge & Prototype ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["swd-structural"] = {
  title: "C++ Software Design — Adapter, Observer, Bridge & Prototype",
  subtitle: "Interface adaptation, push/pull observers, pimpl as bridge, clone and prototype semantics.",
  crumb: "C++ Software Design",
  questions: [
    {
      "type": "mcq",
      "tag": "Adapter Intent",
      "question": "What is the intent of the Adapter design pattern?",
      "options": [
        "Convert the interface of an existing class into the interface clients expect, so that classes with incompatible interfaces can work together",
        "Define a family of interchangeable algorithms and make them configurable from outside",
        "Establish a one-to-many dependency so dependents are notified when an object changes state",
        "Decouple an abstraction from its implementation so the two can vary independently"
      ],
      "answer": 0,
      "explain": "Adapter is about making an existing, otherwise incompatible interface conform to the one clients already expect — a translation layer, not new functionality. The other options describe Strategy, Observer, and Bridge respectively. Iglberger stresses that Adapter is one of the most useful patterns for integrating foreign or legacy code non-intrusively."
    },
    {
      "type": "code",
      "tag": "Object Adapter",
      "question": "This is a classic object adapter. What does the program print?",
      "code": "#include <iostream>\n#include <string>\n\nclass LegacyPrinter {\npublic:\n  void printDocument(std::string const& text) {\n    std::cout << \"[legacy] \" << text << '\\n';\n  }\n};\n\nclass Printer {\npublic:\n  virtual ~Printer() = default;\n  virtual void print(std::string const& text) = 0;\n};\n\nclass PrinterAdapter : public Printer {\npublic:\n  void print(std::string const& text) override {\n    legacy_.printDocument(text);\n  }\nprivate:\n  LegacyPrinter legacy_;\n};\n\nint main() {\n  PrinterAdapter adapter;\n  Printer& printer = adapter;\n  printer.print(\"hello\");\n}",
      "options": [
        "hello",
        "[legacy] [legacy] hello",
        "[legacy] hello",
        "Compilation fails: LegacyPrinter does not implement the Printer interface"
      ],
      "answer": 2,
      "explain": "PrinterAdapter implements the Printer interface and forwards every call to its composed LegacyPrinter member, so the legacy formatting appears exactly once. The adaptee never needs to know about Printer — that is the whole point: the adapter, not the legacy class, does the conforming."
    },
    {
      "type": "mcq",
      "tag": "Object vs Class Adapter",
      "question": "What is the structural difference between an object adapter and a class adapter?",
      "options": [
        "An object adapter can only adapt final classes, while a class adapter works with any class",
        "An object adapter holds the adaptee via composition (a member or reference), while a class adapter inherits from the adaptee",
        "An object adapter requires virtual inheritance, while a class adapter uses ordinary inheritance",
        "A class adapter can switch between several adaptee objects at runtime, while an object adapter is fixed at compile time"
      ],
      "answer": 1,
      "explain": "The object adapter composes the adaptee as a data member (or holds a reference/pointer to it); the class adapter inherits from the adaptee, usually privately in C++, and forwards or re-exports its operations. Switching adaptees at runtime is a strength of the object form, not the class form. Iglberger recommends preferring the composition-based object adapter, in line with 'prefer composition over inheritance'."
    },
    {
      "type": "code",
      "tag": "Class Adapter",
      "question": "This class adapter uses private inheritance plus a using-declaration. How many times is \"work\" printed?",
      "code": "#include <iostream>\n\nclass LegacyTask {\npublic:\n  void doWork() { std::cout << \"work\\n\"; }\n};\n\nclass TaskAdapter : private LegacyTask {\npublic:\n  using LegacyTask::doWork;\n  void doTwice() {\n    doWork();\n    doWork();\n  }\n};\n\nint main() {\n  TaskAdapter t;\n  t.doWork();\n  t.doTwice();\n}",
      "options": [
        "Once",
        "Twice",
        "It is never printed: doWork is inaccessible through TaskAdapter",
        "Three times"
      ],
      "answer": 3,
      "explain": "Private inheritance hides LegacyTask's interface, but the using-declaration re-exports doWork as a public member of TaskAdapter, so t.doWork() is legal and prints once. doTwice() calls the inherited function twice more, for three prints total. This re-exporting trick is exactly how std::stack-style class adapters selectively expose parts of an implementation class."
    },
    {
      "type": "code",
      "tag": "Function Adapter",
      "question": "A free function is adapted to a different call signature via std::function. What does the program print?",
      "code": "#include <functional>\n#include <iostream>\n\ndouble half(double x) { return x / 2.0; }\n\nint main() {\n  std::function<int(int)> f = half;\n  std::cout << f(5) << '\\n';\n}",
      "options": [
        "2",
        "2.5",
        "3",
        "Compilation fails: a double(double) function cannot initialize std::function<int(int)>"
      ],
      "answer": 0,
      "explain": "std::function only requires that the target be callable with int and yield something convertible to int, so it silently adapts the signature: 5 converts to 5.0, half returns 2.5, and the return value is truncated to 2. This shows that adaptation is not limited to classes — callable wrappers act as function adapters, conversions included."
    },
    {
      "type": "mcq",
      "tag": "Adapting Free Functions",
      "question": "Iglberger points out that the Adapter pattern is not limited to classes. Which of these acts as a function adapter?",
      "options": [
        "std::variant, because it can hold any one of several alternative types",
        "CRTP, because it injects an interface into a derived class at compile time",
        "A lambda (or std::function) that wraps a free function so its parameters and return type match what a client expects",
        "dynamic_cast, because it converts between pointers to related interface types"
      ],
      "answer": 2,
      "explain": "Wrapping a free function in a lambda or std::function to reshape its signature is adaptation of a callable — the client sees the interface it wants while the existing function stays untouched. std::variant and CRTP are about type alternatives and static interfaces, and dynamic_cast navigates an existing hierarchy rather than making incompatible interfaces conform."
    },
    {
      "type": "code",
      "tag": "Duck Typing",
      "question": "This adapter presents a Turkey as a Duck. What does the program print?",
      "code": "#include <iostream>\n\nclass Duck {\npublic:\n  virtual ~Duck() = default;\n  virtual void quack() = 0;\n};\n\nclass Turkey {\npublic:\n  void gobble() { std::cout << \"Gobble\"; }\n};\n\nclass TurkeyAdapter : public Duck {\npublic:\n  void quack() override {\n    turkey_.gobble();\n    turkey_.gobble();\n  }\nprivate:\n  Turkey turkey_;\n};\n\nint main() {\n  TurkeyAdapter adapter;\n  Duck& duck = adapter;\n  duck.quack();\n  std::cout << '\\n';\n}",
      "options": [
        "Quack",
        "QuackQuack",
        "Compilation fails: TurkeyAdapter must also implement gobble()",
        "GobbleGobble"
      ],
      "answer": 3,
      "explain": "The adapter maps one quack() call onto two gobble() calls, so callers holding a Duck& get turkey behavior. Syntactically everything conforms, but semantically a turkey is not a duck — this is Iglberger's warning that adapters make it dangerously easy to violate the Liskov Substitution Principle by adapting things that merely look alike."
    },
    {
      "type": "mcq",
      "tag": "LSP Warning",
      "question": "What is Iglberger's central warning about the Adapter pattern (illustrated by the duck/turkey example)?",
      "options": [
        "Adapters always violate the Liskov Substitution Principle and should therefore be avoided in modern C++",
        "Adapters are only safe when implemented with public inheritance from the adaptee",
        "The compiler will reject an adapter whose adaptee is not semantically substitutable",
        "An adapter can make interfaces conform syntactically, but it cannot make behavior conform — adapting something semantically different silently breaks the expectations (LSP) of code using the target interface"
      ],
      "answer": 3,
      "explain": "An adapter only translates calls; it cannot turn a turkey into a duck. If the adapted type's behavior does not honor the contract of the target abstraction, every client of that abstraction now operates on false assumptions — a Liskov Substitution Principle violation the compiler cannot detect. The pattern itself is fine; the danger lies in adapting semantically incompatible things."
    },
    {
      "type": "code",
      "tag": "Adapter Conversion",
      "question": "This adapter converts between incompatible units while adapting the interface. What does the program print?",
      "code": "#include <iostream>\n\nclass FahrenheitSensor {\npublic:\n  double readFahrenheit() { return 212.0; }\n};\n\nclass CelsiusSensor {\npublic:\n  virtual ~CelsiusSensor() = default;\n  virtual double celsius() = 0;\n};\n\nclass SensorAdapter : public CelsiusSensor {\npublic:\n  double celsius() override {\n    return (sensor_.readFahrenheit() - 32.0) * 5.0 / 9.0;\n  }\nprivate:\n  FahrenheitSensor sensor_;\n};\n\nint main() {\n  SensorAdapter s;\n  std::cout << s.celsius() << '\\n';\n}",
      "options": [
        "100",
        "212",
        "37.7778",
        "180"
      ],
      "answer": 0,
      "explain": "The adapter does more than rename a function: it converts the value on the way through, (212 − 32) · 5 / 9 = 100. Adapters routinely perform such small representation translations — the key constraint is that the result must still mean what the target interface promises (here: degrees Celsius)."
    },
    {
      "type": "mcq",
      "tag": "Std Adapters",
      "question": "Which standard library components are textbook examples of the Adapter pattern?",
      "options": [
        "std::vector and std::list, which adapt raw memory to a container interface",
        "std::sort and std::find, which adapt ranges to algorithms",
        "std::shared_ptr and std::unique_ptr, which adapt raw pointers to RAII",
        "The container adaptors std::stack, std::queue, and std::priority_queue, which wrap a container and expose a restricted, different interface"
      ],
      "answer": 3,
      "explain": "std::stack, std::queue, and std::priority_queue are literally called container adaptors: each holds another container (deque or vector by default) and re-exposes a narrowed interface — push/pop/top instead of the container's full API. That is the Adapter pattern in the standard library, adapting an existing interface to the one clients of a stack or queue expect."
    },
    {
      "type": "code",
      "tag": "Container Adapter",
      "question": "This hand-written container adapter wraps std::vector. What does the program print?",
      "code": "#include <iostream>\n#include <vector>\n\ntemplate <typename T, typename Container = std::vector<T>>\nclass Stack {\npublic:\n  void push(T const& value) { c_.push_back(value); }\n  void pop() { c_.pop_back(); }\n  T const& top() const { return c_.back(); }\nprivate:\n  Container c_;\n};\n\nint main() {\n  Stack<int> s;\n  s.push(1);\n  s.push(2);\n  s.push(3);\n  s.pop();\n  std::cout << s.top() << '\\n';\n}",
      "options": [
        "1",
        "3",
        "2",
        "Compilation fails: pop_back() returns void, so pop() cannot compile"
      ],
      "answer": 2,
      "explain": "The adapter maps push/pop/top onto push_back/pop_back/back. After pushing 1, 2, 3 and popping once, the vector holds {1, 2} and back() is 2. Note the adapter deliberately narrows the interface: clients can no longer index into the middle, which is exactly the abstraction a stack should present."
    },
    {
      "type": "mcq",
      "tag": "Class Adapter Drawback",
      "question": "Why does Iglberger recommend the object adapter (composition) over the class adapter (inheritance) as the default?",
      "options": [
        "Inheritance couples the adapter tightly to the adaptee's implementation, drags in its full interface, and fixes the adaptee at compile time, while composition keeps the adapter loosely coupled and flexible",
        "A class adapter cannot forward calls to protected members of the adaptee",
        "Class adapters are significantly slower because every forwarded call becomes a virtual call",
        "Object adapters can be created without invoking the adaptee's constructor"
      ],
      "answer": 0,
      "explain": "Inheriting from the adaptee is an intrusive, maximal-coupling relationship: the adapter inherits everything, may accidentally interact with virtual functions, and can never swap the adaptee at runtime. Composition needs only the adaptee's public interface and can hold any object, even one supplied from outside. This mirrors the general guideline to prefer composition over inheritance."
    },
    {
      "type": "code",
      "tag": "Adapter by Reference",
      "question": "This adapter holds its adaptee by reference. What does the program print?",
      "code": "#include <iostream>\n\nclass Counter {\npublic:\n  void increment() { ++count_; }\n  int value() const { return count_; }\nprivate:\n  int count_ = 0;\n};\n\nclass CounterAdapter {\npublic:\n  explicit CounterAdapter(Counter& c) : counter_(c) {}\n  void tick() { counter_.increment(); }\n  int value() const { return counter_.value(); }\nprivate:\n  Counter& counter_;\n};\n\nint main() {\n  Counter c;\n  CounterAdapter a(c);\n  a.tick();\n  c.increment();\n  std::cout << a.value() << '\\n';\n}",
      "options": [
        "0",
        "1",
        "2",
        "Compilation fails: a reference member cannot be initialized from a constructor parameter"
      ],
      "answer": 2,
      "explain": "Because the adapter stores a reference, it observes the very same Counter object that main also modifies: one increment through the adapter plus one direct increment gives 2. Had the adapter stored the Counter by value, it would own a private copy and print 1 — choosing value versus reference for the adaptee is a real design decision with observable consequences."
    },
    {
      "type": "mcq",
      "tag": "Adapter Overuse",
      "question": "When is introducing an Adapter over-engineering rather than good design?",
      "options": [
        "When the adaptee comes from a third-party library that cannot be modified",
        "When several unrelated libraries must be integrated behind one common interface",
        "When the adapted class must remain untouched for ABI stability",
        "When you own both interfaces and could simply change one of them — the extra indirection then adds complexity without buying any decoupling"
      ],
      "answer": 3,
      "explain": "Adapter earns its keep when the adaptee cannot or should not change: third-party code, legacy code, frozen ABIs. If both sides are yours, the honest fix is usually to align the interfaces directly; wrapping your own code in adapters just to avoid an edit piles up indirection and maintenance cost for no architectural benefit."
    },
    {
      "type": "code",
      "tag": "Private Inheritance",
      "question": "What is the result of compiling and running this class-adapter attempt?",
      "code": "#include <iostream>\n\nclass Engine {\npublic:\n  void start() { std::cout << \"start\\n\"; }\n};\n\nclass Car : private Engine {\npublic:\n  void drive() {\n    start();\n    std::cout << \"drive\\n\";\n  }\n};\n\nint main() {\n  Car car;\n  car.drive();\n  car.start();\n}",
      "options": [
        "It prints start, drive, start",
        "It prints start, drive, and then crashes at runtime",
        "Compilation fails: start() is inaccessible in main because Car inherits from Engine privately",
        "Compilation fails: a class with private inheritance cannot be instantiated"
      ],
      "answer": 2,
      "explain": "Private inheritance is an implementation detail: inside Car, drive() may call the inherited start(), but externally Engine's members are private, so car.start() in main is rejected. This access control is precisely why class adapters use private inheritance — they consume the adaptee's interface without republishing it, unless a using-declaration deliberately re-exports a member."
    },
    {
      "type": "mcq",
      "tag": "Adapter vs Strategy",
      "question": "Adapter and Strategy can look structurally similar. What distinguishes their intent?",
      "options": [
        "Strategy requires templates, while Adapter requires virtual functions",
        "Adapter retrofits an existing, incompatible interface to one clients expect, while Strategy is a designed-in customization point where behavior is injected from the outside",
        "Adapter changes behavior at runtime, while Strategy fixes behavior at compile time",
        "There is no difference in intent, only in the number of participating classes"
      ],
      "answer": 1,
      "explain": "The two are distinguished by when and why the flexibility exists: Strategy is planned variation — the class is designed from the start to have a piece of behavior supplied from outside. Adapter is unplanned reconciliation — something already exists with the wrong interface and is wrapped after the fact. Structure alone (a class holding another object and forwarding) does not identify a pattern; intent does."
    },
    {
      "type": "mcq",
      "tag": "Observer Intent",
      "question": "What is the intent of the Observer design pattern?",
      "options": [
        "Cache the results of expensive computations so repeated queries become cheap",
        "Encapsulate a request as an object so it can be queued, logged, and undone",
        "Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically",
        "Give a surrogate object control over access to another object"
      ],
      "answer": 2,
      "explain": "Observer decouples a subject from an open-ended set of dependents: the subject knows only an abstract notification interface, and observers come and go at runtime. The state-changing side does not need recompiling or even knowledge of who is listening — that is the key dependency inversion. The other options describe caching, Command, and Proxy."
    },
    {
      "type": "code",
      "tag": "Notify Order",
      "question": "A push-style subject notifies its observers. What does the program print?",
      "code": "#include <iostream>\n#include <string>\n#include <vector>\n\nclass Observer {\npublic:\n  explicit Observer(std::string name) : name_(std::move(name)) {}\n  void update(int value) { std::cout << name_ << '=' << value << ' '; }\nprivate:\n  std::string name_;\n};\n\nclass Subject {\npublic:\n  void attach(Observer* o) { observers_.push_back(o); }\n  void set(int v) {\n    state_ = v;\n    for (auto* o : observers_) o->update(state_);\n  }\nprivate:\n  std::vector<Observer*> observers_;\n  int state_ = 0;\n};\n\nint main() {\n  Observer a(\"a\");\n  Observer b(\"b\");\n  Subject s;\n  s.attach(&b);\n  s.attach(&a);\n  s.set(7);\n  std::cout << '\\n';\n}",
      "options": [
        "a=7 b=7",
        "b=0 a=0",
        "a=0 b=0",
        "b=7 a=7"
      ],
      "answer": 3,
      "explain": "The subject pushes the new state (7) to each registered observer in registration order, and b was attached before a. Relying on that order is fragile, though: the Observer pattern makes no ordering guarantee, and well-designed observers should not depend on when they run relative to their peers."
    },
    {
      "type": "mcq",
      "tag": "Push Model",
      "question": "In a push-style Observer, how does information flow, and what is the main tradeoff?",
      "options": [
        "The subject passes the changed data as arguments to update(); observers need no back-reference to the subject, but the notification interface must commit up front to what data every observer might ever need",
        "Observers poll the subject on a timer, trading latency for decoupling",
        "Observers query the subject from inside update(), so the subject need not know what they read",
        "The subject serializes its state into a queue that observers drain asynchronously"
      ],
      "answer": 0,
      "explain": "Push means the subject sends the information along with the notification. Observers stay simple and need no handle to the subject, but everyone receives whatever the interface pushes — including data a given observer does not care about — and extending the pushed data later means changing the update() signature for all observers. That interface commitment is the coupling cost of push."
    },
    {
      "type": "mcq",
      "tag": "Pull Model",
      "question": "What is the defining property — and cost — of a pull-style observer?",
      "options": [
        "The subject sends a complete snapshot of its state with every notification",
        "Observers are notified only once, on registration",
        "update() carries little or no data; each observer pulls exactly what it needs from the subject, which requires access to the subject and couples observers to its query interface",
        "Pull observers cannot be used with virtual functions"
      ],
      "answer": 2,
      "explain": "In the pull model the notification is just a doorbell; the observer turns around and reads whatever state it needs. That avoids shipping unwanted data, but every observer now depends on the subject's concrete query interface and must hold a reference to it — and by the time it pulls, the state may have changed again. Push and pull thus trade different couplings, not more versus less."
    },
    {
      "type": "code",
      "tag": "Pull Trace",
      "question": "This pull-style observer reads the subject's state during notification. What does the program print?",
      "code": "#include <iostream>\n#include <vector>\n\nclass Subject;\n\nclass Observer {\npublic:\n  virtual ~Observer() = default;\n  virtual void update(Subject const& s) = 0;\n};\n\nclass Subject {\npublic:\n  int state() const { return state_; }\n  void attach(Observer* o) { observers_.push_back(o); }\n  void setBoth(int first, int second) {\n    state_ = first;\n    state_ = second;\n    for (auto* o : observers_) o->update(*this);\n  }\nprivate:\n  std::vector<Observer*> observers_;\n  int state_ = 0;\n};\n\nclass Printer : public Observer {\npublic:\n  void update(Subject const& s) override { std::cout << s.state() << ' '; }\n};\n\nint main() {\n  Subject s;\n  Printer p;\n  s.attach(&p);\n  s.setBoth(1, 2);\n  s.setBoth(3, 4);\n  std::cout << '\\n';\n}",
      "options": [
        "1 2 3 4",
        "2 4",
        "1 3",
        "4 4"
      ],
      "answer": 1,
      "explain": "The subject overwrites state twice and only then notifies, so the pulling observer sees 2 after the first call and 4 after the second — the intermediate values 1 and 3 are lost forever. This is a fundamental property of pull: observers see the state at the moment they pull, not a history of changes, which matters whenever events are collapsed or threads interleave."
    },
    {
      "type": "code",
      "tag": "Detach During Notify",
      "question": "An observer is detached while notify() iterates by index. What does the program print?",
      "code": "#include <iostream>\n#include <vector>\n\nclass Observer {\npublic:\n  Observer(char id, bool once) : id_(id), once_(once) {}\n  bool once() const { return once_; }\n  void update() { std::cout << id_ << ' '; }\nprivate:\n  char id_;\n  bool once_;\n};\n\nclass Subject {\npublic:\n  void attach(Observer* o) { observers_.push_back(o); }\n  void detach(Observer* o) { std::erase(observers_, o); }\n  void notify() {\n    for (std::size_t i = 0; i < observers_.size(); ++i) {\n      Observer* o = observers_[i];\n      o->update();\n      if (o->once()) detach(o);\n    }\n  }\nprivate:\n  std::vector<Observer*> observers_;\n};\n\nint main() {\n  Observer a('A', true);\n  Observer b('B', false);\n  Observer c('C', false);\n  Subject s;\n  s.attach(&a);\n  s.attach(&b);\n  s.attach(&c);\n  s.notify();\n  std::cout << '\\n';\n}",
      "options": [
        "A B C",
        "A",
        "A C",
        "B C"
      ],
      "answer": 2,
      "explain": "After A is notified it is erased, so B and C shift left to indices 0 and 1. The loop then moves on to index 1 — which is now C — and B is silently skipped. Mutating the observer list mid-notification is a classic Observer hazard; even when it avoids undefined behavior, it produces wrong delivery like this."
    },
    {
      "type": "code",
      "tag": "Snapshot Notify",
      "question": "This subject's notify() deliberately iterates over a snapshot copy of the observer list, and observers flagged 'once' are detached right after their update. What does the program print?",
      "code": "#include <iostream>\n#include <vector>\n\nclass Observer {\npublic:\n  Observer(char id, bool once) : id_(id), once_(once) {}\n  bool once() const { return once_; }\n  void update() { std::cout << id_ << ' '; }\nprivate:\n  char id_;\n  bool once_;\n};\n\nclass Subject {\npublic:\n  void attach(Observer* o) { observers_.push_back(o); }\n  void detach(Observer* o) { std::erase(observers_, o); }\n  void notify() {\n    auto snapshot = observers_;\n    for (auto* o : snapshot) {\n      o->update();\n      if (o->once()) detach(o);\n    }\n  }\nprivate:\n  std::vector<Observer*> observers_;\n};\n\nint main() {\n  Observer a('A', true);\n  Observer b('B', false);\n  Observer c('C', false);\n  Subject s;\n  s.attach(&a);\n  s.attach(&b);\n  s.attach(&c);\n  s.notify();\n  std::cout << '\\n';\n}",
      "options": [
        "A C",
        "A B C",
        "B C",
        "A B"
      ],
      "answer": 1,
      "explain": "Iterating a snapshot decouples delivery from list mutation: A's removal changes observers_ but not the copy being traversed, so all three observers of this round are notified. The tradeoff is that a detached observer may still receive the in-flight notification, and freshly attached observers miss it — a policy the subject should document either way."
    },
    {
      "type": "mcq",
      "tag": "Unsubscribe Hazard",
      "question": "Why is unsubscribing an observer during notification a notorious problem in Observer implementations?",
      "options": [
        "Because unsubscribing requires a dynamic_cast, which may fail during iteration",
        "Because observers are stored by value, so removal always slices them",
        "Because the standard forbids calling erase() from inside any member function",
        "Because notify() is iterating the observer container at that moment: erasing invalidates iterators or shifts elements, causing skipped observers, double notification, or undefined behavior"
      ],
      "answer": 3,
      "explain": "update() is user code and may legitimately call detach() — often to remove itself. If notify() is walking the live container, that mutation invalidates the traversal: vector iterators dangle, index loops skip elements. Standard mitigations are iterating a copy, deferring removals until after notification, or marking entries dead and compacting later; each has its own delivery semantics."
    },
    {
      "type": "code",
      "tag": "Callback Observers",
      "question": "This subject stores std::function callbacks instead of observer interfaces. What does the program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <vector>\n\nclass Subject {\npublic:\n  void subscribe(std::function<void(int)> callback) {\n    callbacks_.push_back(std::move(callback));\n  }\n  void publish(int value) {\n    for (auto& cb : callbacks_) cb(value);\n  }\nprivate:\n  std::vector<std::function<void(int)>> callbacks_;\n};\n\nint main() {\n  Subject s;\n  int total = 0;\n  s.subscribe([&total](int v) { total += v; });\n  s.subscribe([&total](int v) { total *= v; });\n  s.publish(3);\n  std::cout << total << '\\n';\n}",
      "options": [
        "3",
        "6",
        "9",
        "12"
      ],
      "answer": 2,
      "explain": "The callbacks run in subscription order against the shared captured variable: total += 3 makes it 3, then total *= 3 makes it 9. Note that both lambdas capture total by reference — the std::function values themselves are copyable, but their usefulness here depends on referencing state that outlives the subscription, a typical limitation of value-semantics observers."
    },
    {
      "type": "mcq",
      "tag": "std::function Observer",
      "question": "What is the main tradeoff of implementing Observer with std::function callbacks instead of an observer base class?",
      "options": [
        "std::function observers are notified in reverse order of registration",
        "std::function cannot capture state, so only stateless observers are possible",
        "Callbacks make the subject a template, so it can no longer live in a source file",
        "Any callable can subscribe without inheriting from anything, but std::function objects cannot be compared for equality, so unsubscription needs an extra handle, index, or token"
      ],
      "answer": 3,
      "explain": "std::function decouples completely from any class hierarchy — lambdas, free functions, and member-function binders can all subscribe. The price is identity: two std::function objects cannot be tested for equality, so detach() cannot take 'the same callback' as an argument, and implementations return connection handles or ids instead. A second limitation is that each registration carries exactly one callable, where an interface can bundle several update operations."
    },
    {
      "type": "code",
      "tag": "Double Registration",
      "question": "The same observer is attached twice. What does the program print?",
      "code": "#include <iostream>\n#include <vector>\n\nstruct Observer {\n  int notified = 0;\n  void update() { ++notified; }\n};\n\nclass Subject {\npublic:\n  void attach(Observer* o) { observers_.push_back(o); }\n  void notify() {\n    for (auto* o : observers_) o->update();\n  }\nprivate:\n  std::vector<Observer*> observers_;\n};\n\nint main() {\n  Observer a;\n  Observer b;\n  Subject s;\n  s.attach(&a);\n  s.attach(&b);\n  s.attach(&a);\n  s.notify();\n  std::cout << a.notified << ' ' << b.notified << '\\n';\n}",
      "options": [
        "1 1",
        "2 1",
        "2 2",
        "1 2"
      ],
      "answer": 1,
      "explain": "A vector-based subject happily stores the same pointer twice, so a is updated twice per notification while b is updated once. Whether duplicate registration should be allowed, ignored, or reported is a design decision: using a std::set of pointers, or checking before push_back, gives ignore-duplicates semantics at the cost of extra work on attach."
    },
    {
      "type": "mcq",
      "tag": "Dangling Observer",
      "question": "A subject stores raw pointers to observers. What is the classic lifetime bug, and its usual mitigation?",
      "options": [
        "The subject may be destroyed before its observers, which makes attach() throw an exception",
        "Raw pointers prevent the observer's destructor from running, leaking memory",
        "If an observer is destroyed without detaching itself, the subject keeps a dangling pointer and the next notify() invokes undefined behavior; observers therefore detach in their destructor, or the subject holds weak references",
        "Raw pointers make notification O(n^2), which is mitigated with a hash map"
      ],
      "answer": 2,
      "explain": "The subject has no idea when an observer dies; it will happily call update() through a stale pointer. Disciplined designs make the observer's destructor call detach(), wrap registration in a RAII 'connection' object, or store weak_ptr so liveness can be tested at notification time. Iglberger flags this shared lifetime management as one of Observer's intrinsic costs."
    },
    {
      "type": "code",
      "tag": "weak_ptr Observers",
      "question": "This subject stores weak_ptr and skips expired observers. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <vector>\n\nclass Observer {\npublic:\n  explicit Observer(char id) : id_(id) {}\n  void update() { std::cout << id_; }\nprivate:\n  char id_;\n};\n\nclass Subject {\npublic:\n  void attach(std::shared_ptr<Observer> const& o) {\n    observers_.push_back(o);\n  }\n  void notify() {\n    for (auto& weak : observers_) {\n      if (auto o = weak.lock()) o->update();\n    }\n  }\nprivate:\n  std::vector<std::weak_ptr<Observer>> observers_;\n};\n\nint main() {\n  Subject s;\n  auto a = std::make_shared<Observer>('A');\n  {\n    auto b = std::make_shared<Observer>('B');\n    s.attach(a);\n    s.attach(b);\n  }\n  s.notify();\n  std::cout << '\\n';\n}",
      "options": [
        "AB",
        "B",
        "The program has undefined behavior: it dereferences a dangling observer pointer",
        "A"
      ],
      "answer": 3,
      "explain": "b's shared_ptr dies at the end of the inner scope, so the subject's weak_ptr to it expires; lock() returns an empty shared_ptr and B is skipped, leaving only A notified. weak_ptr turns the dangling-observer crash into a clean miss — at the cost of forcing observers onto the heap under shared ownership and paying lock() on every notification."
    },
    {
      "type": "mcq",
      "tag": "Interface Observer",
      "question": "What does a classic observer base-class interface offer that a bare std::function callback does not?",
      "options": [
        "A stable identity — the observer's address is a natural key for detach() — and the ability to group several named update operations in one observer object",
        "Faster notification, because virtual dispatch is cheaper than std::function invocation",
        "Automatic detachment when the observer is destroyed",
        "Compile-time verification that observers do not modify the subject"
      ],
      "answer": 0,
      "explain": "With an interface, the observer is an object with an address, so the subject can find and remove it, and one observer can implement several update functions (or one tagged update) coherently. Virtual dispatch is not meaningfully cheaper than std::function, and neither approach detaches automatically — that always requires extra machinery like RAII connections."
    },
    {
      "type": "code",
      "tag": "Reentrant Notify",
      "question": "One observer sets the subject again from inside update(). What does the program print?",
      "code": "#include <iostream>\n#include <vector>\n\nclass Subject;\n\nclass Observer {\npublic:\n  virtual ~Observer() = default;\n  virtual void update(Subject& s) = 0;\n};\n\nclass Subject {\npublic:\n  int state() const { return state_; }\n  void attach(Observer* o) { observers_.push_back(o); }\n  void set(int v);\nprivate:\n  std::vector<Observer*> observers_;\n  int state_ = 0;\n};\n\nclass Relay : public Observer {\npublic:\n  void update(Subject& s) override {\n    if (s.state() == 1) s.set(2);\n  }\n};\n\nclass Printer : public Observer {\npublic:\n  void update(Subject& s) override {\n    std::cout << s.state() << ' ';\n  }\n};\n\nvoid Subject::set(int v) {\n  state_ = v;\n  for (auto* o : observers_) o->update(*this);\n}\n\nint main() {\n  Subject s;\n  Relay r;\n  Printer p;\n  s.attach(&r);\n  s.attach(&p);\n  s.set(1);\n  std::cout << '\\n';\n}",
      "options": [
        "1 2",
        "1 1",
        "2 1",
        "2 2"
      ],
      "answer": 3,
      "explain": "set(1) notifies Relay first, which reentrantly calls set(2); the nested notification runs to completion (Relay ignores 2, Printer prints 2), then the outer loop resumes and Printer runs again — but state is already 2, so it prints 2 again. Printer never observes state 1 at all: reentrancy reorders and hides updates even in single-threaded code."
    },
    {
      "type": "mcq",
      "tag": "Reentrancy",
      "question": "What is the general reentrancy problem in the Observer pattern?",
      "options": [
        "notify() cannot be called from a member function of the subject",
        "An observer's update() may change the subject again (or attach/detach observers), so notifications nest: observers can see states out of order, miss intermediate states, or iterate a mutated list — the subject must define and document its policy",
        "Observers may only be attached before the first notification, never after",
        "Reentrancy only matters in multithreaded programs; single-threaded observers are immune"
      ],
      "answer": 1,
      "explain": "Because update() is arbitrary user code, it can re-enter the subject while a notification is still in flight — entirely single-threaded. The subject must decide: forbid reentrant mutation, queue changes until the current notification finishes, or accept nested notification and document the consequences. Silence on this question is where subtle Observer bugs breed."
    },
    {
      "type": "code",
      "tag": "Erase Semantics",
      "question": "An observer that was attached twice is detached once. What does the program print?",
      "code": "#include <iostream>\n#include <vector>\n\nclass Observer {\npublic:\n  explicit Observer(char id) : id_(id) {}\n  void update() { std::cout << id_ << ' '; }\nprivate:\n  char id_;\n};\n\nclass Subject {\npublic:\n  void attach(Observer* o) { observers_.push_back(o); }\n  void detach(Observer* o) { std::erase(observers_, o); }\n  void notify() {\n    for (auto* o : observers_) o->update();\n  }\nprivate:\n  std::vector<Observer*> observers_;\n};\n\nint main() {\n  Observer a('A');\n  Observer b('B');\n  Observer c('C');\n  Subject s;\n  s.attach(&a);\n  s.attach(&b);\n  s.attach(&b);\n  s.attach(&c);\n  s.detach(&b);\n  s.notify();\n  std::cout << '\\n';\n}",
      "options": [
        "A C",
        "A B C",
        "A B B C",
        "B C"
      ],
      "answer": 0,
      "explain": "std::erase (the C++20 erase-remove replacement) removes all elements equal to the given value, so both stored pointers to b vanish in one detach() call. If the intended semantics were 'one detach undoes one attach', the implementation would need std::find plus erase of a single element — the container idiom you pick silently defines your subscription semantics."
    },
    {
      "type": "mcq",
      "tag": "Hybrid Update",
      "question": "Iglberger's Observer example passes both a reference to the subject and a tag describing what changed (e.g. update(person, nameChanged)). Why this hybrid?",
      "options": [
        "It is a push/pull compromise: the pushed tag lets observers cheaply ignore irrelevant changes, while the subject reference lets interested observers pull exactly the data they need",
        "Passing the subject avoids making update() virtual",
        "The tag is required so the compiler can devirtualize the update() call",
        "It allows one observer instance to be registered with several subjects simultaneously, which is otherwise impossible"
      ],
      "answer": 0,
      "explain": "A pure pull observer must re-query everything and cannot tell what actually changed; a pure push interface must ship every potentially useful datum. Pushing just a cheap StateChange tag plus the subject reference gives observers an early-exit filter and on-demand access to current state. Its cost is that observers see the subject's latest state, not the state at change time."
    },
    {
      "type": "code",
      "tag": "Tagged Update",
      "question": "This observer filters notifications by a StateChange tag. What does the program print?",
      "code": "#include <iostream>\n#include <string>\n#include <vector>\n\nclass Person;\n\nclass PersonObserver {\npublic:\n  enum StateChange { nameChanged, addressChanged };\n  virtual ~PersonObserver() = default;\n  virtual void update(Person const& person, StateChange property) = 0;\n};\n\nclass Person {\npublic:\n  explicit Person(std::string name) : name_(std::move(name)) {}\n  std::string const& name() const { return name_; }\n  void attach(PersonObserver* o) { observers_.push_back(o); }\n  void setName(std::string name) {\n    name_ = std::move(name);\n    notify(PersonObserver::nameChanged);\n  }\n  void setAddress(std::string address) {\n    address_ = std::move(address);\n    notify(PersonObserver::addressChanged);\n  }\nprivate:\n  void notify(PersonObserver::StateChange property) {\n    for (auto* o : observers_) o->update(*this, property);\n  }\n  std::string name_;\n  std::string address_;\n  std::vector<PersonObserver*> observers_;\n};\n\nclass NameWatcher : public PersonObserver {\npublic:\n  void update(Person const& person, StateChange property) override {\n    if (property == nameChanged) {\n      std::cout << \"name:\" << person.name() << ' ';\n    }\n  }\n};\n\nint main() {\n  Person p(\"Ada\");\n  NameWatcher w;\n  p.attach(&w);\n  p.setAddress(\"Berlin\");\n  p.setName(\"Grace\");\n  std::cout << '\\n';\n}",
      "options": [
        "name:Ada",
        "name:Berlin name:Grace",
        "name:Grace",
        "name:Ada name:Grace"
      ],
      "answer": 2,
      "explain": "The address change does reach the observer, but the tag lets it return immediately without touching the subject. Only the name change passes the filter, and by then the subject already holds the new name, so it prints name:Grace. This is the push/pull hybrid at work: push the 'what changed' tag, pull the actual data."
    },
    {
      "type": "mcq",
      "tag": "Value Semantics Limit",
      "question": "Iglberger concedes that Observer resists a fully value-based implementation. Why?",
      "options": [
        "std::function cannot be stored in standard containers, forcing pointer-based designs",
        "Value types cannot have virtual functions, and update() must be virtual",
        "Registration establishes a lasting link to one particular observer: observers are entities with identity that the subject must refer to over time, so copies would sever or duplicate the link; std::function moves the boundary but its captures typically still reference outside entities",
        "The C++ standard requires observers to be allocated with new"
      ],
      "answer": 2,
      "explain": "An observer is registered so that this one recipient hears about future changes — that is identity, the hallmark of reference semantics. Copying the subject or the observers leaves the question of what the copies mean unanswered. A std::function-based design gives the subscription list itself value semantics, but useful callbacks usually capture references to stateful entities, so the entity character merely hides inside the callable."
    },
    {
      "type": "mcq",
      "tag": "Thread Safety",
      "question": "Why is there no perfect recipe for a thread-safe Observer, according to Iglberger?",
      "options": [
        "Because std::mutex cannot be a member of a class template",
        "Because observers must always run on the thread that created them",
        "Because atomic operations cannot protect a std::vector of pointers",
        "Because notify() calls unknown user code: holding the subject's lock during callbacks invites deadlock and blocks attach/detach from within update(), while releasing it (e.g. notifying over a copy) means an observer can be notified after it detached — every choice sacrifices something"
      ],
      "answer": 3,
      "explain": "The subject cannot know what observers will do: lock held during callbacks means an update() that calls back into the subject (or into another lock) deadlocks; lock released means the observer list can change concurrently with delivery, so a detached observer may still receive one late notification. Real designs pick a documented compromise — often copy-under-lock plus 'you may be notified once after detach' — rather than pretending to full safety."
    },
    {
      "type": "mcq",
      "tag": "Signals & Slots",
      "question": "How do signals/slots frameworks (Qt, Boost.Signals2) relate to the Observer pattern?",
      "options": [
        "They are a packaged Observer: the signal is the subject's notification source, slots are callable observers, and connection objects manage the subscription — enabling automatic disconnection on destruction and, in some libraries, thread-safe emission",
        "They replace Observer with polling, avoiding its lifetime problems entirely",
        "They are an unrelated language extension that requires a special compiler in all implementations",
        "They implement Observer without any registration step: every object automatically observes every other"
      ],
      "answer": 0,
      "explain": "Signals/slots is Observer with the operational pain points productized: connections are first-class objects, so disconnection can be automatic (scoped_connection, QObject destruction) and emission policies (ordering, combined return values, thread affinity) are handled by the library. Qt's moc is an implementation detail of one framework, not a requirement of the idea — Boost.Signals2 is pure C++."
    },
    {
      "type": "mcq",
      "tag": "Bridge Intent",
      "question": "What is the intent of the Bridge design pattern?",
      "options": [
        "Compose objects into tree structures to represent part-whole hierarchies",
        "Decouple an abstraction from its implementation so that the two can vary — and be compiled — independently",
        "Provide a unified higher-level interface to a set of interfaces in a subsystem",
        "Ensure a class has exactly one instance with a global access point"
      ],
      "answer": 1,
      "explain": "Bridge splits one conceptual class into an abstraction that clients see and an implementation hidden behind a pointer, so each side can evolve without disturbing the other. Iglberger emphasizes the physical-dependency angle: the implementation's definition moves out of the client-visible header, cutting both logical and compile-time coupling. The other options are Composite, Facade, and Singleton."
    },
    {
      "type": "mcq",
      "tag": "Pimpl as Bridge",
      "question": "How does the pimpl idiom relate to the Bridge pattern?",
      "options": [
        "Pimpl is the opposite of Bridge: it maximizes coupling to gain speed",
        "Pimpl is Bridge applied only to template classes",
        "Pimpl is the simplest, non-polymorphic form of Bridge: a single hidden implementation class reached through a pointer, used purely to cut physical dependencies rather than to support multiple implementations",
        "Pimpl requires a virtual implementation hierarchy, whereas Bridge never uses one"
      ],
      "answer": 2,
      "explain": "A full Bridge typically has an abstract implementation hierarchy so the abstraction can be paired with different implementations. Pimpl degenerates that to exactly one concrete Impl, known only to the source file — no virtual functions needed. The motivation shifts accordingly: not runtime flexibility, but hiding implementation details and stabilizing the header (compile-time firewall, stable ABI)."
    },
    {
      "type": "code",
      "tag": "Incomplete Type",
      "question": "Impl is deliberately defined only in a separate source file (not shown), so this translation unit never sees its definition. Why does this fail to compile?",
      "code": "#include <memory>\n\nstruct Impl;\n\nclass Widget {\npublic:\n  Widget();\nprivate:\n  std::unique_ptr<Impl> pimpl_;\n};\n\nWidget::Widget() : pimpl_(nullptr) {}\n\nint main() {\n  Widget w;\n}",
      "options": [
        "A std::unique_ptr data member of incomplete type is ill-formed at the point of declaration",
        "Widget has no user-declared destructor, so the implicit inline ~Widget() instantiates std::default_delete<Impl>::operator() right here — and deleting an incomplete type is rejected",
        "pimpl_(nullptr) is invalid: unique_ptr cannot be initialized from nullptr",
        "Impl must be defined before class Widget, because forward declarations may not be used as template arguments"
      ],
      "answer": 1,
      "explain": "Declaring unique_ptr<Impl> with an incomplete Impl is fine; destroying it is not. Since Widget declares no destructor, the compiler generates an inline one at the point of use in main, which must instantiate default_delete<Impl>'s call operator — and that static_asserts on a complete type. The fix is the pimpl rule: declare ~Widget in the header and define it (even as = default) in the source file after Impl's definition."
    },
    {
      "type": "code",
      "tag": "Pimpl Layout",
      "question": "Header and source of a pimpl class are merged into one file for the quiz. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n\n// ---- widget.h ----\nclass Widget {\npublic:\n  explicit Widget(int value);\n  ~Widget();\n  int value() const;\nprivate:\n  struct Impl;\n  std::unique_ptr<Impl> pimpl_;\n};\n\n// ---- widget.cpp ----\nstruct Widget::Impl {\n  explicit Impl(int v) : value(v) {}\n  int value;\n};\n\nWidget::Widget(int value) : pimpl_(std::make_unique<Impl>(value)) {}\nWidget::~Widget() = default;\nint Widget::value() const { return pimpl_->value; }\n\nint main() {\n  Widget w(41);\n  std::cout << w.value() + 1 << '\\n';\n}",
      "options": [
        "41",
        "42",
        "Compilation fails: '= default' destructors are not allowed outside the class definition",
        "Compilation fails: Impl is incomplete where pimpl_ is declared"
      ],
      "answer": 1,
      "explain": "This is the canonical pimpl layout: the header declares a nested Impl and the special members; the source defines Impl first and only then the destructor, so '= default' is instantiated where Impl is complete. A defaulted definition outside the class is perfectly legal C++. The program constructs Impl{41} and prints 41 + 1 = 42."
    },
    {
      "type": "mcq",
      "tag": "Compile Firewall",
      "question": "Why is pimpl called a 'compile-time firewall'?",
      "options": [
        "All private members move into Impl in the source file, so changing them alters neither the header nor the visible class layout — dependent translation units need no recompilation, and the class's ABI stays stable",
        "The Impl struct is compiled with different optimization flags than the header",
        "It prevents clients from calling private member functions via friend declarations",
        "It forces the compiler to check the implementation twice, catching more errors"
      ],
      "answer": 0,
      "explain": "In ordinary C++, private members are invisible to clients logically but not physically: they sit in the header, so touching them recompiles every includer. Pimpl moves those details behind an opaque pointer into one source file — the header, and hence the rebuild frontier and the binary interface, stop changing. That is the firewall, and it is the main reason libraries use pimpl at ABI boundaries."
    },
    {
      "type": "mcq",
      "tag": "Destructor Placement",
      "question": "Where must the destructor of a class with a std::unique_ptr pimpl member be defined, and how?",
      "options": [
        "It must not be declared at all; the compiler-generated destructor always works with unique_ptr",
        "Inline in the header, so that clients can destroy Widget efficiently",
        "It cannot be defaulted; the destructor must manually call pimpl_.reset()",
        "Declared in the header, defined in the source file — even simply as '= default' — at a point where Impl is a complete type"
      ],
      "answer": 3,
      "explain": "unique_ptr's deleter needs a complete Impl at the point where the destructor is instantiated. Leaving the destructor implicit makes it inline in every client translation unit, where Impl is incomplete — a compile error. Declaring it in the header and defining it after Impl in the source moves the instantiation to the one place that sees the full type; '= default' is entirely sufficient there."
    },
    {
      "type": "code",
      "tag": "Deleted Copy",
      "question": "Widget declares no copy operations. What happens when this is compiled?",
      "code": "#include <memory>\n\nclass Widget {\npublic:\n  explicit Widget(int value);\n  ~Widget();\n  int value() const;\nprivate:\n  struct Impl;\n  std::unique_ptr<Impl> pimpl_;\n};\n\nstruct Widget::Impl {\n  explicit Impl(int v) : value(v) {}\n  int value;\n};\n\nWidget::Widget(int value) : pimpl_(std::make_unique<Impl>(value)) {}\nWidget::~Widget() = default;\nint Widget::value() const { return pimpl_->value; }\n\nint main() {\n  Widget a(1);\n  Widget b = a;\n  return b.value();\n}",
      "options": [
        "It compiles; b receives a deep copy of a's Impl",
        "It compiles; a and b share a single Impl object",
        "Compilation fails: Widget's copy constructor is implicitly deleted because std::unique_ptr is move-only",
        "It compiles, but b's pimpl_ is nullptr, so b.value() has undefined behavior"
      ],
      "answer": 2,
      "explain": "A unique_ptr member has a deleted copy constructor, which deletes the containing class's implicit copy constructor too, so 'Widget b = a;' is rejected. This is a feature, not an accident: the compiler cannot know whether copying a pimpl class should duplicate the Impl, so it refuses until you decide — a pimpl class is move-only by default and needs hand-written copy operations to be copyable."
    },
    {
      "type": "code",
      "tag": "Deep Copy Pimpl",
      "question": "This pimpl class implements deep-copying special members. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n\nclass Widget {\npublic:\n  explicit Widget(int value);\n  ~Widget();\n  Widget(Widget const& other);\n  Widget& operator=(Widget const& other);\n  void set(int value);\n  int value() const;\nprivate:\n  struct Impl;\n  std::unique_ptr<Impl> pimpl_;\n};\n\nstruct Widget::Impl {\n  explicit Impl(int v) : value(v) {}\n  int value;\n};\n\nWidget::Widget(int value) : pimpl_(std::make_unique<Impl>(value)) {}\nWidget::~Widget() = default;\nWidget::Widget(Widget const& other)\n  : pimpl_(std::make_unique<Impl>(*other.pimpl_)) {}\nWidget& Widget::operator=(Widget const& other) {\n  *pimpl_ = *other.pimpl_;\n  return *this;\n}\nvoid Widget::set(int value) { pimpl_->value = value; }\nint Widget::value() const { return pimpl_->value; }\n\nint main() {\n  Widget a(1);\n  Widget b = a;\n  b.set(9);\n  std::cout << a.value() << ' ' << b.value() << '\\n';\n}",
      "options": [
        "1 9",
        "9 9",
        "1 1",
        "9 1"
      ],
      "answer": 0,
      "explain": "The copy constructor allocates a fresh Impl initialized from *other.pimpl_, so a and b own independent implementation objects; mutating b leaves a at 1. Note the assignment operator copies through the pointers rather than reallocating — a common pimpl optimization that also keeps the target's Impl address stable."
    },
    {
      "type": "mcq",
      "tag": "Rule of Five",
      "question": "Which special members of a unique_ptr-based pimpl class need out-of-line definitions in the source file?",
      "options": [
        "Only the copy constructor; everything else can stay compiler-generated inline",
        "None — unique_ptr generates all five special members correctly inline",
        "Effectively all of them that the class supports: destructor, move operations, and any copy operations are declared in the header and defined after Impl in the source, because compiler-generated inline versions would need the complete type in client code",
        "Only the default constructor, because make_unique requires a complete type"
      ],
      "answer": 2,
      "explain": "Any special member that destroys or copies the Impl — the destructor, move assignment (destroys the target's Impl), and copy operations — requires a complete Impl where it is instantiated, so they are declared in the header and defined (often '= default') in the source. This is the pimpl-flavored Rule of Five: the definitions are trivial, but their placement is essential."
    },
    {
      "type": "code",
      "tag": "Pimpl Move",
      "question": "This pimpl class supports moving. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <utility>\n\nclass Widget {\npublic:\n  explicit Widget(int value);\n  ~Widget();\n  Widget(Widget&& other) noexcept;\n  int value() const;\nprivate:\n  struct Impl;\n  std::unique_ptr<Impl> pimpl_;\n};\n\nstruct Widget::Impl {\n  explicit Impl(int v) : value(v) {}\n  int value;\n};\n\nWidget::Widget(int value) : pimpl_(std::make_unique<Impl>(value)) {}\nWidget::~Widget() = default;\nWidget::Widget(Widget&& other) noexcept = default;\nint Widget::value() const { return pimpl_->value; }\n\nint main() {\n  Widget a(5);\n  Widget b(std::move(a));\n  std::cout << b.value() << '\\n';\n}",
      "options": [
        "5",
        "0",
        "Compilation fails: a move constructor cannot be defaulted outside the class definition",
        "The program is guaranteed to crash, because moving destroys a's Impl object"
      ],
      "answer": 0,
      "explain": "The defaulted move constructor transfers the unique_ptr, so b now owns the Impl holding 5 — no Impl is destroyed or copied. Defaulting a special member at its out-of-class definition is standard practice for pimpl. The subtle hazard is the moved-from object: a.pimpl_ is now null, so calling a.value() would dereference null; pimpl classes must decide how to treat moved-from state."
    },
    {
      "type": "mcq",
      "tag": "Shallow Const",
      "question": "In a pimpl class, a const member function can modify data inside Impl. Why?",
      "options": [
        "Because Impl members are implicitly declared mutable",
        "const on the member function makes the pointer const (Impl* const), not the pointee — this 'shallow const' means the Impl object itself stays freely mutable unless you add discipline or a propagating wrapper such as propagate_const",
        "Because unique_ptr::operator-> ignores the constness of its owner",
        "This is a compiler bug that C++23 fixed with 'deducing this'"
      ],
      "answer": 1,
      "explain": "Inside a const member function, members are const — but for a pointer member that only means the pointer cannot be reseated. Dereferencing it still yields a non-const Impl&, so writes compile silently and logical constness is lost. std::experimental::propagate_const, private const-overloaded accessors that return Impl const&, or plain code review are the usual countermeasures."
    },
    {
      "type": "code",
      "tag": "Const Leak",
      "question": "touch() is a const member function that writes through the pimpl pointer. What is the result?",
      "code": "#include <iostream>\n#include <memory>\n\nstruct Impl {\n  int value = 1;\n};\n\nclass Widget {\npublic:\n  Widget() : pimpl_(std::make_unique<Impl>()) {}\n  void touch() const { pimpl_->value = 42; }\n  int value() const { return pimpl_->value; }\nprivate:\n  std::unique_ptr<Impl> pimpl_;\n};\n\nint main() {\n  Widget const w;\n  w.touch();\n  std::cout << w.value() << '\\n';\n}",
      "options": [
        "Compilation fails: touch() cannot modify a member of a const object",
        "1",
        "Compilation fails: a const Widget cannot call touch()",
        "42"
      ],
      "answer": 3,
      "explain": "Even on a const Widget, the const member function only receives a const pointer to a non-const Impl, so the assignment compiles and runs: the program prints 42. The physical bits of w never change — only what the pointer points to does. This demonstrates that pimpl silently converts deep const into shallow const, a leak of logical constness worth guarding against."
    },
    {
      "type": "mcq",
      "tag": "Pimpl Cost",
      "question": "What are the runtime costs of the pimpl idiom?",
      "options": [
        "Only binary size: pimpl classes generate about twice as much code",
        "There are none; pimpl is a purely compile-time technique",
        "Every member function becomes virtual, adding vtable dispatch",
        "Each object pays a dynamic allocation, each access an extra pointer indirection with worse cache locality, and the optimizer can no longer inline across the header boundary — so pimpl is a poor fit for small, hot, frequently created types"
      ],
      "answer": 3,
      "explain": "The Impl lives in a separate heap allocation: construction allocates, destruction deallocates, and every member function chases a pointer to reach the data. Because the implementation is out of view of client translation units, inlining across the boundary is largely off the table too. These costs are trivial for large or rarely constructed classes, and prohibitive for tight value types — which is why pimpl is applied selectively."
    },
    {
      "type": "code",
      "tag": "Pimpl Size",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <string>\n\nstruct Impl {\n  int i;\n  double d;\n  std::string text;\n  char buffer[64];\n};\n\nclass Widget {\nprivate:\n  std::unique_ptr<Impl> pimpl_;\n};\n\nint main() {\n  std::cout << std::boolalpha\n            << (sizeof(Widget) == sizeof(void*)) << '\\n';\n}",
      "options": [
        "false — sizeof(Widget) includes sizeof(Impl)",
        "false — unique_ptr also stores its deleter as a data member",
        "true",
        "The code does not compile: sizeof cannot be applied to a class with a unique_ptr member"
      ],
      "answer": 2,
      "explain": "Widget's only member is a unique_ptr with the stateless default_delete, which occupies exactly one pointer thanks to empty-deleter optimization. The Impl's size is irrelevant to Widget's footprint — it lives elsewhere on the heap. This fixed, tiny layout is what makes pimpl classes ABI-stable: Impl can grow arbitrarily without changing sizeof(Widget)."
    },
    {
      "type": "mcq",
      "tag": "Fast Pimpl",
      "question": "What is the 'fast pimpl' technique, and what does it trade away?",
      "options": [
        "The Impl object is constructed by placement new inside a suitably sized and aligned in-class byte buffer instead of on the heap — eliminating the allocation and improving locality, but hardcoding the storage size and alignment into the header, which weakens the firewall",
        "The Impl is stored in a global object pool shared by all instances",
        "The pimpl pointer is replaced by a shared_ptr so copies become cheap",
        "The compiler is told via [[likely]] to prefetch the Impl on every call"
      ],
      "answer": 0,
      "explain": "Fast pimpl swaps the unique_ptr for raw aligned storage (e.g. alignas(A) std::byte buf[N]) in the class itself, with placement new and explicit destructor calls in the source file. Allocation cost and pointer-chasing locality problems disappear, but N and A now appear in the header: growing Impl beyond them changes the header anyway, and getting them wrong must be caught explicitly. You keep information hiding, but only part of the compile-time and ABI firewall."
    },
    {
      "type": "mcq",
      "tag": "Fast Pimpl Safety",
      "question": "A fast-pimpl class reserves a fixed byte buffer for its Impl. What guard keeps this from silently corrupting memory when Impl grows?",
      "options": [
        "Nothing is needed: placement new automatically checks the buffer size at runtime",
        "Marking the buffer volatile so the compiler cannot reorder writes past its end",
        "A static_assert in the source file that sizeof(Impl) fits the reserved storage and that the buffer's alignment satisfies alignof(Impl), so any growth fails loudly at compile time",
        "Wrapping every access in a try/catch block for std::bad_alloc"
      ],
      "answer": 2,
      "explain": "Placement new performs no size checking whatsoever — writing a grown Impl into a too-small buffer is silent undefined behavior. The idiomatic guard is a static_assert next to Impl's definition comparing sizeof/alignof against the reserved storage, turning a future maintenance change into an immediate compile error instead of memory corruption. std::bad_alloc never enters the picture because nothing is heap-allocated."
    },
    {
      "type": "code",
      "tag": "Copy-and-Swap",
      "question": "This pimpl class uses a by-value assignment operator with swap. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <utility>\n\nclass Widget {\npublic:\n  explicit Widget(int value);\n  ~Widget();\n  Widget(Widget const& other);\n  Widget& operator=(Widget other);\n  void set(int value);\n  int value() const;\nprivate:\n  struct Impl;\n  std::unique_ptr<Impl> pimpl_;\n};\n\nstruct Widget::Impl {\n  explicit Impl(int v) : value(v) {}\n  int value;\n};\n\nWidget::Widget(int value) : pimpl_(std::make_unique<Impl>(value)) {}\nWidget::~Widget() = default;\nWidget::Widget(Widget const& other)\n  : pimpl_(std::make_unique<Impl>(*other.pimpl_)) {}\nWidget& Widget::operator=(Widget other) {\n  std::swap(pimpl_, other.pimpl_);\n  return *this;\n}\nvoid Widget::set(int value) { pimpl_->value = value; }\nint Widget::value() const { return pimpl_->value; }\n\nint main() {\n  Widget a(1);\n  Widget b(2);\n  b = a;\n  a.set(9);\n  std::cout << a.value() << ' ' << b.value() << '\\n';\n}",
      "options": [
        "9 9",
        "1 1",
        "9 1",
        "2 1"
      ],
      "answer": 2,
      "explain": "'b = a' copy-constructs a temporary (deep copy of a's Impl holding 1), swaps it into b, and destroys b's old Impl with the temporary. a and b are fully independent afterwards, so a.set(9) does not affect b: output is 9 1. Copy-and-swap gives the strong exception guarantee and reuses the copy constructor — convenient for pimpl classes."
    },
    {
      "type": "mcq",
      "tag": "Impl Placement",
      "question": "Where does the Impl class of a pimpl'd Widget conventionally live?",
      "options": [
        "In a separate public header, widget_impl.h, so clients can inspect it when debugging",
        "Declared as a private nested struct inside Widget in the header, and defined only in widget.cpp",
        "As an anonymous union inside Widget",
        "In the header, but wrapped in a 'detail' namespace that clients promise not to open"
      ],
      "answer": 1,
      "explain": "'struct Impl;' as a private nested declaration keeps the name scoped to Widget — it pollutes no namespace and cannot collide with other Impls — while the definition stays entirely inside the source file, invisible to clients. A detail namespace in the header would defeat the purpose: the definition would still be textually present and recompilation-triggering."
    },
    {
      "type": "mcq",
      "tag": "Bridge vs Strategy",
      "question": "Bridge and Strategy both end up with 'a class holding a pointer to something that does the work'. How does Iglberger distinguish them?",
      "options": [
        "By intent and configuration: with Strategy, callers inject the behavior from outside as a designed customization point; with Bridge, the class itself selects and owns its implementation as a hidden internal detail",
        "Bridge uses unique_ptr while Strategy must use shared_ptr",
        "Strategy involves exactly one virtual function; Bridge involves at least two",
        "They differ only in name; the Gang of Four listed them as aliases"
      ],
      "answer": 0,
      "explain": "Structure does not identify a pattern — intent does. If the pointer exists so users can hand in different behaviors (the constructor takes the 'engine' of logic from outside), it is Strategy. If the pointer exists so the class can hide how it works and vary it without telling anyone (implementation details chosen internally), it is Bridge. The same skeleton serves opposite purposes."
    },
    {
      "type": "code",
      "tag": "Bridge Trace",
      "question": "This is a classic runtime Bridge: the abstraction delegates to an implementation hierarchy. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n\nclass Engine {\npublic:\n  virtual ~Engine() = default;\n  virtual void start() = 0;\n};\n\nclass ElectricEngine : public Engine {\npublic:\n  void start() override { std::cout << \"electric \"; }\n};\n\nclass PetrolEngine : public Engine {\npublic:\n  void start() override { std::cout << \"petrol \"; }\n};\n\nclass Car {\npublic:\n  explicit Car(std::unique_ptr<Engine> engine)\n    : engine_(std::move(engine)) {}\n  void drive() {\n    engine_->start();\n    std::cout << \"vroom\";\n  }\nprivate:\n  std::unique_ptr<Engine> engine_;\n};\n\nint main() {\n  Car car(std::make_unique<ElectricEngine>());\n  car.drive();\n  std::cout << '\\n';\n}",
      "options": [
        "petrol vroom",
        "electric vroom",
        "vroom electric",
        "Compilation fails: Car's constructor cannot accept a unique_ptr to an abstract Engine"
      ],
      "answer": 1,
      "explain": "Car is the abstraction and Engine the implementation hierarchy; drive() first delegates through the bridge pointer (printing 'electric ') and then adds its own behavior. Car's header needs only the Engine declaration, so new engine types can be added without touching Car — abstraction and implementation vary independently. unique_ptr to an abstract base is perfectly fine; only creation requires a concrete type."
    },
    {
      "type": "mcq",
      "tag": "Pimpl Overuse",
      "question": "When is applying pimpl (or Bridge) to a class over-engineering?",
      "options": [
        "When the class already has virtual functions, since the two mechanisms conflict",
        "When the class has more than five data members",
        "When the class is used by more than one translation unit",
        "When the class is small, allocation- or latency-sensitive, or its header is not widely included — the indirection and boilerplate cost real performance while the firewall pays off mainly at stable module boundaries with many dependents"
      ],
      "answer": 3,
      "explain": "Pimpl's benefits scale with the number of translation units shielded from rebuilds and with the need for a stable ABI; its costs (allocation, indirection, lost inlining, Rule-of-Five boilerplate) are per-object and per-call. Blanket-pimpl'ing every class inverts the tradeoff: small hot value types gain nothing and pay everywhere. Apply it deliberately at module boundaries, not reflexively."
    },
    {
      "type": "mcq",
      "tag": "Prototype Intent",
      "question": "What is the intent of the Prototype design pattern?",
      "options": [
        "Provide a template method that subclasses refine step by step",
        "Guarantee that all instances of a class are created by a central factory",
        "Enable creating copies of objects whose concrete dynamic type is unknown at the call site, by asking the object to clone itself through a virtual function — effectively a virtual copy constructor",
        "Reduce memory usage by sharing immutable state between many similar objects"
      ],
      "answer": 2,
      "explain": "When code holds only a Base pointer or reference, it cannot invoke the right copy constructor itself — only the object knows its own dynamic type. Prototype pushes the copy into the hierarchy as a virtual clone() that each concrete class implements by copying itself. Iglberger calls it what it is: the C++ idiom of the virtual copy constructor. The last option describes Flyweight."
    },
    {
      "type": "mcq",
      "tag": "When Prototype",
      "question": "In which situation is the Prototype pattern actually needed?",
      "options": [
        "You hold only a pointer or reference to an abstract base and need an exact copy of the concrete object behind it — direct copy construction is impossible (abstract base) or would slice",
        "You need many objects that differ only in one cheap parameter",
        "You want to prevent a class from ever being copied",
        "You need to convert an object of one concrete type into an object of a sibling type"
      ],
      "answer": 0,
      "explain": "Prototype exists for exactly one gap: copying through an abstraction. If you know the concrete type, the ordinary copy constructor is simpler and better; if the types are values, plain copies suffice. Only polymorphic entities accessed through base pointers need clone() — and there, nothing else does the job."
    },
    {
      "type": "code",
      "tag": "Slicing",
      "question": "Instead of cloning, this code copies a polymorphic object by value through its base class. What does the program print?",
      "code": "#include <iostream>\n#include <string>\n\nclass Animal {\npublic:\n  virtual ~Animal() = default;\n  virtual std::string sound() const { return \"generic\"; }\n};\n\nclass Dog : public Animal {\npublic:\n  std::string sound() const override { return \"woof\"; }\n};\n\nvoid copyAndSpeak(Animal animal) {\n  std::cout << animal.sound() << '\\n';\n}\n\nint main() {\n  Dog dog;\n  copyAndSpeak(dog);\n}",
      "options": [
        "woof",
        "generic",
        "Compilation fails: an Animal parameter cannot bind to a Dog argument by value",
        "The behavior is undefined because the vtable pointer is copied incorrectly"
      ],
      "answer": 1,
      "explain": "Passing by value invokes Animal's copy constructor with the Dog's base subobject: the Dog part is sliced away and the parameter is a genuine Animal, so the virtual call resolves to the base version and prints 'generic'. Slicing is well-defined but almost never what you want — it is precisely the failure mode that motivates clone() for copying polymorphic objects."
    },
    {
      "type": "code",
      "tag": "Covariant Clone",
      "question": "Derived::clone() returns Derived* while the base returns Base*. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n\nclass Base {\npublic:\n  virtual ~Base() = default;\n  virtual Base* clone() const { return new Base(*this); }\n  virtual char id() const { return 'B'; }\n};\n\nclass Derived : public Base {\npublic:\n  Derived* clone() const override { return new Derived(*this); }\n  char id() const override { return 'D'; }\n};\n\nint main() {\n  std::unique_ptr<Base> p = std::make_unique<Derived>();\n  std::unique_ptr<Base> q(p->clone());\n  std::cout << q->id() << '\\n';\n}",
      "options": [
        "D",
        "B",
        "Compilation fails: an override must return exactly the same type as the base declaration",
        "The output depends on which compiler is used"
      ],
      "answer": 0,
      "explain": "Returning Derived* from an override of a function returning Base* is a legal covariant return type. The virtual call p->clone() dispatches on the dynamic type, so Derived::clone runs and produces a copy whose id() prints 'D'. Covariance is a convenience for callers who already hold a Derived: they get the precise pointer type without casting."
    },
    {
      "type": "mcq",
      "tag": "Covariant Rules",
      "question": "What exactly does C++ allow as a covariant return type in an overriding virtual function?",
      "options": [
        "Any type implicitly convertible to the base function's return type",
        "A pointer or reference to a class derived from the class that the base version's pointer or reference return type refers to",
        "Any class template instantiated with a more derived argument, such as std::unique_ptr<Derived>",
        "Covariance applies to parameters as well as return types"
      ],
      "answer": 1,
      "explain": "The rule is narrow: both return types must be pointers (or both references) to classes, with the override's class derived from the base's, unambiguously and accessibly. General convertibility is not enough, smart pointers do not qualify because unique_ptr<Derived> and unique_ptr<Base> are unrelated class types, and parameters are never covariant — they must match exactly for overriding."
    },
    {
      "type": "code",
      "tag": "unique_ptr Covariance",
      "question": "clone() is modernized to return std::unique_ptr. What happens when this is compiled?",
      "code": "#include <memory>\n\nclass Base {\npublic:\n  virtual ~Base() = default;\n  virtual std::unique_ptr<Base> clone() const = 0;\n};\n\nclass Derived : public Base {\npublic:\n  std::unique_ptr<Derived> clone() const override {\n    return std::make_unique<Derived>(*this);\n  }\n};\n\nint main() {\n  Derived d;\n  auto c = d.clone();\n}",
      "options": [
        "It compiles: unique_ptr<Derived> converts to unique_ptr<Base>, so the override is treated as covariant",
        "It compiles, and calling clone() through a Base& yields a unique_ptr<Derived>",
        "Compilation fails: clone() would need to be declared final in Derived",
        "Compilation fails: covariant returns work only for raw pointers and references, so unique_ptr<Derived> is an invalid return type for this override"
      ],
      "answer": 3,
      "explain": "Although unique_ptr<Derived> implicitly converts to unique_ptr<Base>, the covariance rule does not consider conversions: the two smart-pointer types are simply different classes, so the override's return type mismatches and the program is ill-formed. This is the well-known friction between owning-pointer clone() and covariance, and the reason workarounds like a private do_clone() plus public wrappers exist."
    },
    {
      "type": "mcq",
      "tag": "Clone Workaround",
      "question": "What is the standard workaround for combining clone() with std::unique_ptr ownership, given that smart pointers cannot be covariant?",
      "options": [
        "A private virtual do_clone() returning a raw owning pointer (which can be covariant), wrapped by a public non-virtual clone() that returns unique_ptr<Base>; derived classes may add their own non-virtual clone() returning unique_ptr<Derived>",
        "Declaring clone() as a function template so each caller instantiates the right return type",
        "Returning shared_ptr<Base> instead, since shared_ptr supports covariant overriding",
        "Making Base a class template parameterized on the derived type (CRTP), which enables true smart-pointer covariance"
      ],
      "answer": 0,
      "explain": "Splitting the operation keeps both benefits: the virtual layer uses raw pointers, where covariance works and dynamic dispatch picks the right copy, while the public non-virtual layer immediately wraps the result in unique_ptr so ownership never leaks. shared_ptr overrides are just as non-covariant as unique_ptr ones, and virtual function templates do not exist in C++."
    },
    {
      "type": "code",
      "tag": "NVI Clone",
      "question": "This hierarchy uses the do_clone() workaround. What is the result?",
      "code": "#include <iostream>\n#include <memory>\n\nclass Animal {\npublic:\n  virtual ~Animal() = default;\n  std::unique_ptr<Animal> clone() const {\n    return std::unique_ptr<Animal>(do_clone());\n  }\n  virtual void speak() const = 0;\nprivate:\n  virtual Animal* do_clone() const = 0;\n};\n\nclass Dog : public Animal {\npublic:\n  std::unique_ptr<Dog> clone() const {\n    return std::unique_ptr<Dog>(static_cast<Dog*>(do_clone()));\n  }\n  void speak() const override { std::cout << \"Woof \"; }\nprivate:\n  Dog* do_clone() const override { return new Dog(*this); }\n};\n\nint main() {\n  std::unique_ptr<Animal> a = std::make_unique<Dog>();\n  auto copy1 = a->clone();\n  Dog d;\n  auto copy2 = d.clone();\n  copy1->speak();\n  copy2->speak();\n  std::cout << '\\n';\n}",
      "options": [
        "Woof",
        "Compilation fails: Dog::clone hides Animal::clone, which is ill-formed",
        "Compilation fails: do_clone() is private, so a->clone() cannot call it",
        "Woof Woof"
      ],
      "answer": 3,
      "explain": "a->clone() runs the non-virtual Animal::clone, which dispatches virtually to Dog::do_clone and wraps the copy as unique_ptr<Animal>; d.clone() statically selects Dog's shadowing clone and yields unique_ptr<Dog>. Name hiding between the two non-virtual clones is legal and intentional here. Access control is checked at the point of call — Animal::clone may call its own private virtual, and overriding a private virtual in Dog is fine."
    },
    {
      "type": "code",
      "tag": "Shallow Clone",
      "question": "Polygon::clone() relies on the compiler-generated copy constructor, and Polygon stores its points behind a shared_ptr. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <vector>\n\nclass Shape {\npublic:\n  virtual ~Shape() = default;\n  virtual Shape* clone() const = 0;\n};\n\nclass Polygon : public Shape {\npublic:\n  Polygon() : points_(std::make_shared<std::vector<int>>()) {}\n  Polygon* clone() const override { return new Polygon(*this); }\n  void addPoint(int p) { points_->push_back(p); }\n  std::size_t pointCount() const { return points_->size(); }\nprivate:\n  std::shared_ptr<std::vector<int>> points_;\n};\n\nint main() {\n  Polygon original;\n  original.addPoint(1);\n  std::unique_ptr<Polygon> copy(original.clone());\n  copy->addPoint(2);\n  std::cout << original.pointCount() << '\\n';\n}",
      "options": [
        "1",
        "2",
        "0",
        "Compilation fails: Polygon's copy constructor is deleted because of the shared_ptr member"
      ],
      "answer": 1,
      "explain": "The memberwise copy duplicates the shared_ptr, not the vector, so original and clone share one point container: adding a point through the clone is visible through the original, and the count is 2. This is a shallow clone — syntactically a copy, semantically an alias. A correct deep clone must copy the pointed-to data, not the pointer."
    },
    {
      "type": "mcq",
      "tag": "Deep vs Shallow",
      "question": "Why do clone() implementations need special attention to deep versus shallow copying?",
      "options": [
        "Because clone() cannot call the copy constructor, deep copies must be assembled field by field",
        "Because shallow copies are always faster, clone() should prefer them whenever possible",
        "Because clone() typically delegates to the compiler-generated copy constructor, which copies pointers rather than pointees: any resource held by pointer or shared_ptr becomes shared between the original and its 'copy', so owned mutable state needs an explicit deep copy",
        "Because deep copies of polymorphic objects require RTTI to be enabled"
      ],
      "answer": 2,
      "explain": "A prototype copy is supposed to be an independent object; memberwise copying quietly breaks that promise for anything reached through a pointer. Whether sharing is acceptable depends on the member: immutable shared data is fine to alias, mutable owned state is not. The decision must be made per member — which is exactly why writing clone() forces you to understand your class's ownership structure."
    },
    {
      "type": "code",
      "tag": "Deep Clone",
      "question": "This Polygon stores its points directly in a std::vector data member and clones via the compiler-generated copy constructor. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <vector>\n\nclass Shape {\npublic:\n  virtual ~Shape() = default;\n  virtual Shape* clone() const = 0;\n};\n\nclass Polygon : public Shape {\npublic:\n  Polygon* clone() const override { return new Polygon(*this); }\n  void addPoint(int p) { points_.push_back(p); }\n  std::size_t pointCount() const { return points_.size(); }\nprivate:\n  std::vector<int> points_;\n};\n\nint main() {\n  Polygon original;\n  original.addPoint(1);\n  std::unique_ptr<Polygon> copy(original.clone());\n  copy->addPoint(2);\n  std::cout << original.pointCount() << '\\n';\n}",
      "options": [
        "2",
        "0",
        "1",
        "Compilation fails: std::vector cannot be copied by the implicit copy constructor"
      ],
      "answer": 2,
      "explain": "std::vector has value semantics: the compiler-generated copy constructor copies the elements, so the clone owns an independent container. Adding a point to the copy leaves the original at one point. This is Iglberger's broader lesson — prefer members with value semantics, and deep copying comes for free from the ordinary special members."
    },
    {
      "type": "code",
      "tag": "Copy Count",
      "question": "The derived copy constructor announces itself. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n\nclass Base {\npublic:\n  virtual ~Base() = default;\n  virtual Base* clone() const = 0;\n};\n\nclass Derived : public Base {\npublic:\n  Derived() = default;\n  Derived(Derived const&) { std::cout << \"copy \"; }\n  Base* clone() const override { return new Derived(*this); }\n};\n\nint main() {\n  Derived d;\n  std::unique_ptr<Base> first(d.clone());\n  std::unique_ptr<Base> second(first->clone());\n  std::cout << '\\n';\n}",
      "options": [
        "copy",
        "copy copy",
        "It prints nothing",
        "copy copy copy"
      ],
      "answer": 1,
      "explain": "Each clone() call executes new Derived(*this), invoking the copy constructor exactly once — first from d, then from the first clone via virtual dispatch through the Base pointer. Two clones, two copies. Prototype is precisely this: the copy constructor invoked polymorphically, one level removed."
    },
    {
      "type": "code",
      "tag": "Clone Chain",
      "question": "A container of prototypes is cloned. What does the program print?",
      "code": "#include <iostream>\n#include <memory>\n#include <vector>\n\nclass Shape {\npublic:\n  virtual ~Shape() = default;\n  virtual std::unique_ptr<Shape> clone() const = 0;\n  virtual void draw() const = 0;\n};\n\nclass Circle : public Shape {\npublic:\n  std::unique_ptr<Shape> clone() const override {\n    return std::make_unique<Circle>(*this);\n  }\n  void draw() const override { std::cout << 'C'; }\n};\n\nclass Square : public Shape {\npublic:\n  std::unique_ptr<Shape> clone() const override {\n    return std::make_unique<Square>(*this);\n  }\n  void draw() const override { std::cout << 'S'; }\n};\n\nint main() {\n  std::vector<std::unique_ptr<Shape>> shapes;\n  shapes.push_back(std::make_unique<Circle>());\n  shapes.push_back(std::make_unique<Square>());\n\n  std::vector<std::unique_ptr<Shape>> copies;\n  for (auto const& s : shapes) copies.push_back(s->clone());\n  copies.push_back(copies.front()->clone());\n\n  for (auto const& s : copies) s->draw();\n  std::cout << '\\n';\n}",
      "options": [
        "CS",
        "CSS",
        "CSC",
        "CSCS"
      ],
      "answer": 2,
      "explain": "Cloning the source vector yields copies = {Circle, Square}; cloning copies.front() appends another Circle, giving Circle, Square, Circle — 'CSC'. This is the pattern's home turf: duplicating a heterogeneous collection through the base interface, with each element producing the right concrete copy. Note that unique_ptr forces clone-based copying; the vector itself cannot be copied."
    },
    {
      "type": "mcq",
      "tag": "Value Alternative",
      "question": "What is the value-semantics alternative that makes Prototype unnecessary, and when does it apply?",
      "options": [
        "Using std::any, which clones its contents lazily on each access",
        "When objects are values — regular copyable types held directly, or type-erased in a std::variant of value types — the ordinary copy constructor already does everything clone() would do",
        "Registering every object in a global prototype registry keyed by type name",
        "Replacing all copies with moves, which eliminates the need for cloning"
      ],
      "answer": 1,
      "explain": "clone() exists only to reach the right copy constructor through an abstraction. If there is no reference-semantics abstraction — because the design uses concrete value types, or a variant that always knows its alternative — plain copy construction is the prototype. Iglberger's overarching advice applies: prefer value semantics, and many patterns collapse into ordinary C++."
    },
    {
      "type": "mcq",
      "tag": "No Modern Substitute",
      "question": "What is Iglberger's overall assessment of Prototype in modern C++?",
      "options": [
        "It is deprecated: std::polymorphic_allocator now performs polymorphic copies automatically",
        "It should always be replaced by a factory function that reconstructs objects from serialized state",
        "It is only relevant for garbage-collected languages and has no place in C++",
        "Unlike many classic patterns, it has no slick modern value-semantics replacement: when you genuinely work with polymorphic entities through base pointers and need copies, a virtual clone() is simply the solution — otherwise prefer values and plain copies"
      ],
      "answer": 3,
      "explain": "For Strategy, Command, or Adapter, Iglberger shows shiny value-based alternatives (std::function, type erasure). Prototype is different: it is essentially the virtual copy constructor, and if the problem is copying through an abstraction, that is the tool — there is nothing more modern hiding behind it. The real modern advice is upstream: design with values so the problem rarely arises."
    },
    {
      "type": "mcq",
      "tag": "Speculative Clone",
      "question": "Which of these is a clear sign that adding clone() to a hierarchy is over-engineering?",
      "options": [
        "Nobody ever copies objects through the base interface — clone() forces every derived class to implement a capability with no user (speculative generality)",
        "The hierarchy contains more than three derived classes",
        "The clone() function is implemented using the copy constructor",
        "The hierarchy is also used with std::vector"
      ],
      "answer": 0,
      "explain": "A pure virtual clone() taxes every current and future derived class and enlarges the interface's contract. If no call site copies through the base — copies happen only where concrete types are known, or never — the pattern solves a problem the codebase does not have. Patterns should be introduced when their intent matches an actual need, not 'just in case'."
    }
  ]
};

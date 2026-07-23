/* ===== Professional C++ — Threads, Atomics & Coroutines ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["procpp-concurrency"] = {
  title: "Professional C++ — Threads, Atomics & Coroutines",
  subtitle: "jthread, mutexes, condition variables, atomics & memory ordering, futures and coroutine basics.",
  crumb: "Professional C++",
  questions: [
    {
      "type": "code",
      "tag": "std::thread",
      "question": "What is guaranteed to happen when this program runs?",
      "code": "#include <iostream>\n#include <thread>\n\nint main() {\n    std::thread t([] { std::cout << \"hi\\n\"; });\n    // neither join() nor detach() is called\n}",
      "options": [
        "It prints \"hi\" and exits with status 0; the runtime joins the thread automatically.",
        "std::terminate() is called, aborting the program, because a std::thread that is still joinable is destroyed.",
        "Undefined behavior: the outcome depends on whether the lambda finished before main returned.",
        "main() blocks in the std::thread destructor until the lambda completes, then exits normally."
      ],
      "answer": 1,
      "explain": "The std::thread destructor checks joinable(); if the thread was neither joined nor detached, it calls std::terminate(), which aborts the process. Whether \"hi\" appears first is a timing accident, but the abort itself is guaranteed and well-defined — it is not UB. This is exactly the sharp edge std::jthread was designed to remove."
    },
    {
      "type": "code",
      "tag": "std::jthread",
      "question": "What does this C++20 program do?",
      "code": "#include <iostream>\n#include <thread>\n\nint main() {\n    std::jthread t([](std::stop_token st) {\n        while (!st.stop_requested()) {\n            std::this_thread::yield();\n        }\n        std::cout << \"stopped\\n\";\n    });\n}   // t's destructor runs here",
      "options": [
        "It never terminates: nobody calls request_stop(), so the loop spins forever.",
        "std::terminate() is called because t is destroyed while joinable.",
        "It prints \"stopped\" exactly once and exits cleanly: the jthread destructor calls request_stop() and then join().",
        "It exits immediately without printing, because the destructor detaches the thread."
      ],
      "answer": 2,
      "explain": "std::jthread fixes both std::thread pain points: its destructor first calls request_stop() on its internal std::stop_source and then join(). The stop request flips the stop_token, the loop exits, \"stopped\" is printed, and the join completes before main returns. A callable whose first parameter is std::stop_token automatically receives the thread's token."
    },
    {
      "type": "mcq",
      "tag": "data race vs race condition",
      "question": "Which statement correctly distinguishes a data race from a race condition in C++?",
      "options": [
        "They are synonyms: both simply mean the result depends on thread scheduling.",
        "A data race is unsynchronized concurrent access to the same non-atomic memory location where at least one access is a write, and it makes the program's behavior undefined; a race condition is a higher-level correctness bug where the outcome depends on timing, and can exist even in a program with no data races.",
        "A race condition is undefined behavior, while a data race is merely nondeterministic but well-defined.",
        "A data race only exists when two threads write the same object; concurrent read/write pairs are always safe."
      ],
      "answer": 1,
      "explain": "The standard defines a data race precisely — conflicting (at least one write), non-atomic, unsynchronized accesses — and its consequence is undefined behavior, so anything may happen. A race condition is a broader design flaw (e.g., check-then-act on a bank balance) that can occur even when every access is under a mutex. Eliminating data races does not automatically eliminate race conditions."
    },
    {
      "type": "mcq",
      "tag": "lock types",
      "question": "Which statement about std::lock_guard, std::scoped_lock, and std::unique_lock is correct?",
      "options": [
        "std::unique_lock supports deferred, timed, and try locking, can be unlocked manually and moved, and is what std::condition_variable::wait() requires; std::scoped_lock is a simpler RAII wrapper that can additionally lock several mutexes at once deadlock-free.",
        "std::scoped_lock supports unlock() and relock(), which is why condition variables require it.",
        "std::lock_guard can lock multiple mutexes atomically, while std::scoped_lock is limited to one.",
        "std::unique_lock is deprecated in C++20 in favor of std::scoped_lock."
      ],
      "answer": 0,
      "explain": "unique_lock is the flexible one: std::defer_lock, try_lock_for(), manual unlock()/lock(), and move semantics, which is why std::condition_variable::wait takes a unique_lock<mutex> it can release while blocked. scoped_lock (C++17) is the cheap default for plain critical sections and uses the std::lock algorithm when given multiple mutexes. lock_guard is the older single-mutex, no-frills wrapper; none of them is deprecated."
    },
    {
      "type": "code",
      "tag": "deadlock",
      "question": "Two threads run threadA() and threadB() concurrently. What can happen, and what is the standard fix?",
      "code": "std::mutex m1, m2;\n\nvoid threadA() {\n    std::lock_guard lockA1{ m1 };\n    std::lock_guard lockA2{ m2 };\n    // ... work ...\n}\n\nvoid threadB() {\n    std::lock_guard lockB1{ m2 };\n    std::lock_guard lockB2{ m1 };\n    // ... work ...\n}",
      "options": [
        "Deadlock is guaranteed on every execution because the lock orders differ.",
        "The program may deadlock: if A holds m1 while B holds m2, each blocks forever on the other's mutex. Fix: acquire both with std::scoped_lock lock{ m1, m2 }; (or std::lock) in both threads, or agree on one global lock order.",
        "Nothing bad: std::lock_guard detects the cycle at runtime and releases one mutex.",
        "This is a data race and therefore undefined behavior, even on runs where no deadlock occurs."
      ],
      "answer": 1,
      "explain": "Deadlock needs an unlucky interleaving, so it is intermittent — the worst kind of bug — but any run where each thread gets its first mutex before the other's second acquisition hangs forever. std::scoped_lock with multiple mutexes (built on std::lock) acquires them with a deadlock-avoidance algorithm, and a fixed global ordering works too. Mutexes don't detect cycles, and blocking on a mutex is not a data race."
    },
    {
      "type": "mcq",
      "tag": "condition_variable",
      "question": "Why should you call cv.wait(lock, predicate) instead of the predicate-less cv.wait(lock)?",
      "options": [
        "The predicate overload is merely a convenience; the two forms have identical semantics.",
        "Because the predicate-less overload does not release the mutex while blocking.",
        "Because spurious wakeups are undefined behavior unless a predicate is supplied.",
        "Because wait() can return spuriously without any notification, and a notification can arrive for a condition that another thread already consumed; the predicate form re-checks the condition under the lock in a loop and only returns when it is actually true."
      ],
      "answer": 3,
      "explain": "Condition variables permit spurious wakeups — wait() may return with no notify at all — and even a real notify proves only that the condition was true at some point, not that it still is. cv.wait(lock, pred) is exactly while (!pred()) wait(lock);, evaluating pred with the mutex held. Every correct condition-variable wait therefore loops on the state, and spurious wakeups are legal behavior, not UB."
    },
    {
      "type": "code",
      "tag": "condition_variable",
      "question": "What is wrong with this producer/consumer code?",
      "code": "std::mutex m;\nstd::condition_variable cv;\nbool ready = false;   // plain bool\n\nvoid consumer() {\n    std::unique_lock lock{ m };\n    cv.wait(lock, [] { return ready; });\n    // ... consume ...\n}\n\nvoid producer() {\n    ready = true;      // mutex NOT held\n    cv.notify_one();\n}",
      "options": [
        "Nothing: notify_one() itself provides all the synchronization needed for ready.",
        "The write to ready races with the predicate's read — undefined behavior — and the consumer can also miss the update between its predicate check and blocking, then wait forever. The producer must set ready while holding m.",
        "The only bug is using notify_one() where notify_all() is required for correctness.",
        "The only bug is that ready should be std::atomic<bool>; the mutex is irrelevant to the notify."
      ],
      "answer": 1,
      "explain": "The consumer reads ready under the mutex, but the producer writes it with no synchronization: that is a data race and hence UB. There is also a lost-wakeup window: the consumer can evaluate the predicate as false, and if the producer sets the flag and notifies before the consumer has re-blocked inside wait, the notification is missed. Writing ready under the mutex closes both holes (an atomic flag alone would fix the race but not, by itself, the lost-wakeup pattern)."
    },
    {
      "type": "mcq",
      "tag": "notify & unlock",
      "question": "A thread updates shared state under the mutex and must notify a condition variable. Which statement about calling notify_one() before versus after unlocking the mutex is correct?",
      "options": [
        "notify_one() must be called while holding the mutex, or the notification is lost.",
        "notify_one() must be called after unlocking, or the program deadlocks.",
        "Both are correct as long as the shared-state update itself happened under the mutex; notifying after unlocking can avoid a pessimization where the woken thread immediately blocks again trying to acquire the still-held mutex.",
        "Neither order is safe; C++20 requires std::atomic_notify_one() instead."
      ],
      "answer": 2,
      "explain": "The notifying thread does not need to hold the mutex during notify_one(); what must be under the mutex is the modification of the state the predicate inspects. Notifying while still holding the lock can wake a waiter that instantly blocks on the mutex (\"hurry up and wait\"), so unlock-then-notify is a common micro-optimization, though many implementations mitigate this with wait morphing. Correctness is identical either way."
    },
    {
      "type": "mcq",
      "tag": "atomics: lock-free",
      "question": "What is the difference between std::atomic<T>::is_lock_free() and std::atomic<T>::is_always_lock_free?",
      "options": [
        "is_always_lock_free is a static constexpr constant that is true only if every object of that atomic specialization is lock-free on the target; is_lock_free() is a per-object runtime query, since lock-freedom may depend on the object's size and alignment. If they are not lock-free, atomics fall back to an internal lock.",
        "They are identical; is_lock_free() is just the pre-C++17 spelling.",
        "is_lock_free() reports whether the surrounding code uses mutexes; is_always_lock_free reports whether the CPU has a cache.",
        "All std::atomic<T> specializations are guaranteed lock-free, so both always yield true."
      ],
      "answer": 0,
      "explain": "std::atomic<T> works for any trivially copyable T, but for large T the implementation may use a hidden lock — so an \"atomic\" can secretly block. is_always_lock_free (C++17) lets you assert lock-freedom at compile time, while is_lock_free() answers for a particular object at run time. Only std::atomic_flag is guaranteed lock-free by the standard."
    },
    {
      "type": "code",
      "tag": "release/acquire",
      "question": "reader() runs in one thread and writer() in another. What does reader() print?",
      "code": "int data = 0;\nstd::atomic<bool> flag{ false };\n\nvoid writer() {\n    data = 42;\n    flag.store(true, std::memory_order_release);\n}\n\nvoid reader() {\n    while (!flag.load(std::memory_order_acquire)) {}\n    std::cout << data;\n}",
      "options": [
        "It is guaranteed to print 42: the acquire load that reads true synchronizes-with the release store, so data = 42 happens-before the read of data.",
        "It may print 0 or 42, because data itself is not atomic.",
        "Undefined behavior: data is written and read by different threads without a mutex.",
        "42 on x86 only; on weakly ordered CPUs such as ARM it may print 0."
      ],
      "answer": 0,
      "explain": "This is the canonical message-passing pattern. When the acquire load observes the value written by the release store, the store synchronizes-with the load, so everything sequenced before the store (data = 42) happens-before everything after the load. That happens-before edge means the accesses to non-atomic data are ordered — no data race, and 0 is impossible on any conforming implementation, regardless of CPU."
    },
    {
      "type": "code",
      "tag": "relaxed ordering",
      "question": "t1() and t2() run concurrently; x, y start at 0. After both threads join, is the outcome r1 == 0 && r2 == 0 possible?",
      "code": "std::atomic<int> x{ 0 }, y{ 0 };\nint r1 = -1, r2 = -1;\n\nvoid t1() {\n    x.store(1, std::memory_order_relaxed);\n    r1 = y.load(std::memory_order_relaxed);\n}\n\nvoid t2() {\n    y.store(1, std::memory_order_relaxed);\n    r2 = x.load(std::memory_order_relaxed);\n}",
      "options": [
        "No: within each thread the store is sequenced before the load, so at least one load must observe 1.",
        "No, because int is lock-free on all mainstream platforms.",
        "The program has a data race on x and y, so the question is moot — it is undefined behavior.",
        "Yes: with relaxed ordering each load may fail to see the other thread's store (effectively store/load reordering), so both can read 0. Only if all four operations used memory_order_seq_cst would r1 == 0 && r2 == 0 be forbidden."
      ],
      "answer": 3,
      "explain": "This is the classic store-buffering litmus test. Relaxed (and even acquire/release) operations impose no single global order, so each thread's load may be satisfied before the other thread's store becomes visible, yielding r1 == r2 == 0 — real hardware exhibits this. Sequential consistency is precisely the guarantee of one total order over all seq_cst operations, which rules that outcome out. Atomic accesses never constitute a data race."
    },
    {
      "type": "mcq",
      "tag": "compare_exchange",
      "question": "Why does std::atomic provide both compare_exchange_weak() and compare_exchange_strong(), and when should you prefer weak?",
      "options": [
        "weak skips the memory-ordering arguments to run faster; strong honors them.",
        "compare_exchange_weak() may fail spuriously — return false even though the stored value equals expected — which lets it map to cheaper LL/SC instruction sequences; since a CAS retry loop must handle failure anyway, prefer weak inside loops and strong for a single, non-looped attempt. On failure both update expected with the value actually seen.",
        "strong is atomic while weak is not, so weak needs an external mutex.",
        "weak compares only the low-order bytes of the object, making it faster but less precise."
      ],
      "answer": 1,
      "explain": "On load-linked/store-conditional architectures a CAS can fail for incidental reasons (e.g., an interrupt), and compare_exchange_weak exposes that directly instead of hiding it in an internal retry loop. Inside while (!a.compare_exchange_weak(expected, desired)) the spurious failure costs one extra iteration, and the automatic reload of expected on failure makes the idiom self-updating. Both variants are fully atomic and take memory-order arguments."
    },
    {
      "type": "code",
      "tag": "plain int race",
      "question": "What does this program print?",
      "code": "int counter = 0;\n\nvoid work() {\n    for (int i = 0; i < 100'000; ++i) {\n        ++counter;\n    }\n}\n\nint main() {\n    std::thread t1{ work };\n    std::thread t2{ work };\n    t1.join();\n    t2.join();\n    std::cout << counter;\n}",
      "options": [
        "Always 200000: ++ on int is a single instruction and therefore atomic.",
        "A nondeterministic but well-defined value between 100000 and 200000.",
        "The program has undefined behavior: two threads perform unsynchronized read-modify-writes on a non-atomic int, which is a data race, so no particular output — or any output at all — is guaranteed.",
        "Exactly 200000 on 64-bit platforms, possibly less on 32-bit ones."
      ],
      "answer": 2,
      "explain": "++counter is a load, an add, and a store; interleavings lose updates, and formally the conflicting unsynchronized accesses are a data race — undefined behavior, not merely \"some smaller number\". Compilers may even hoist the counter into a register and store it once. In practice you typically see a value below 200000, but the standard guarantees nothing once UB exists; the fix is std::atomic<int> or a mutex."
    },
    {
      "type": "code",
      "tag": "atomic RMW",
      "question": "Same program, but the counter is atomic and incremented with relaxed ordering. What does it print?",
      "code": "std::atomic<int> counter{ 0 };\n\nvoid work() {\n    for (int i = 0; i < 100'000; ++i) {\n        counter.fetch_add(1, std::memory_order_relaxed);\n    }\n}\n\nint main() {\n    std::thread t1{ work };\n    std::thread t2{ work };\n    t1.join();\n    t2.join();\n    std::cout << counter;\n}",
      "options": [
        "Possibly less than 200000: relaxed ordering allows increments to be lost.",
        "Exactly 200000 only if memory_order_seq_cst is used.",
        "Exactly 200000, guaranteed: atomic read-modify-writes never lose updates — each fetch_add reads the latest value in the object's modification order — and relaxed only weakens ordering relative to other memory operations, not atomicity. The joins order the final read.",
        "Undefined behavior: relaxed atomics still constitute a data race."
      ],
      "answer": 2,
      "explain": "Atomicity and ordering are separate dials. Every atomic RMW is required to read the value immediately preceding its own write in that object's modification order, so no increment can be lost even at memory_order_relaxed — a pure counter is the textbook legitimate use of relaxed. thread::join() gives a happens-before edge, so main's read sees the final 200000."
    },
    {
      "type": "mcq",
      "tag": "thread_local",
      "question": "What does the thread_local storage-class specifier guarantee for a variable declared with it?",
      "options": [
        "Each thread gets its own distinct instance of the variable, initialized before its first use in that thread and destroyed when the thread exits; changes made in one thread are invisible to others.",
        "The variable is shared by all threads but every access is implicitly atomic.",
        "The variable lives only inside the thread's entry function and cannot be a class member or global.",
        "It is a hint for cache placement; the variable remains an ordinary shared global."
      ],
      "answer": 0,
      "explain": "thread_local gives thread storage duration: conceptually one copy per thread, so unsynchronized use is race-free because no memory is shared. It combines with static or extern for namespace-scope and static-member variables, and a thread_local declared inside a function is per-thread and initialized on first execution in that thread. Classic uses are per-thread caches, RNG state, and errno-style values."
    },
    {
      "type": "code",
      "tag": "magic statics",
      "question": "Many threads call Logger::instance() concurrently, before any other use. What does C++ guarantee?",
      "code": "class Logger {\npublic:\n    static Logger& instance() {\n        static Logger s_instance;   // expensive constructor\n        return s_instance;\n    }\nprivate:\n    Logger() { /* opens files, allocates */ }\n};",
      "options": [
        "There is a race on the initialization; std::call_once with a std::once_flag is required for safety.",
        "Since C++11, initialization of a function-local static is thread-safe: exactly one thread runs the constructor while concurrent callers block until it completes (\"magic statics\"), so every caller gets the same fully constructed object.",
        "Each thread constructs and receives its own Logger instance.",
        "It is safe only if Logger also deletes its copy constructor."
      ],
      "answer": 1,
      "explain": "C++11 requires that if control enters a block-scope static's declaration concurrently, other threads wait for initialization to finish — the compiler emits the necessary synchronization. This makes the Meyers singleton correct with zero extra code, and it is generally preferred over the equivalent std::call_once/once_flag pattern, which remains useful when the once-only action isn't tied to initializing a single static. Deleting the copy constructor is good style but irrelevant to thread safety."
    },
    {
      "type": "code",
      "tag": "launch::deferred",
      "question": "What is the behavior of this snippet?",
      "code": "auto fut = std::async(std::launch::deferred,\n                      [] { return 42; });\n\nwhile (fut.wait_for(std::chrono::milliseconds(10)) !=\n       std::future_status::ready) {\n    std::cout << \"waiting...\\n\";\n}\nstd::cout << fut.get();",
      "options": [
        "It prints \"waiting...\" a few times while the task runs, then 42.",
        "It prints 42 immediately; deferred tasks run on construction.",
        "It loops forever: wait_for() on a deferred future returns std::future_status::deferred without ever running the task, so the status never becomes ready. The lambda would only execute inside get() or wait().",
        "It throws std::future_error{ future_errc::no_state }."
      ],
      "answer": 2,
      "explain": "std::launch::deferred means lazy evaluation on the thread that eventually calls get()/wait() — no new thread, and no execution until then. Timed waits report future_status::deferred and do not trigger execution, so status polling loops spin forever: a classic trap, especially since plain std::async(f) may pick deferred by itself. Poll only futures you know are async, or just call get()."
    },
    {
      "type": "code",
      "tag": "future dtor blocks",
      "question": "Approximately how long does main() take, and why?",
      "code": "void slow() {\n    std::this_thread::sleep_for(std::chrono::seconds(1));\n}\n\nint main() {\n    std::async(std::launch::async, slow);   // returned future discarded\n    std::async(std::launch::async, slow);   // returned future discarded\n}",
      "options": [
        "About 1 second: both tasks run concurrently on separate threads.",
        "About 2 seconds: each call returns a temporary std::future whose destructor — uniquely for futures obtained from std::async — blocks until the associated task finishes, so the second task cannot start until the first completes.",
        "About 0 seconds: since get() is never called, neither task ever runs.",
        "Undefined behavior: discarding the future returned by std::async is ill-formed."
      ],
      "answer": 1,
      "explain": "Futures from std::async carry special shared state: the last future referencing it blocks in its destructor until the task completes. Here each future is a temporary destroyed at the end of its full expression, so the first async call is fully synchronous in effect and the calls serialize — roughly 2 seconds total. This is why 'fire-and-forget' with std::async does not work; futures from promise or packaged_task do not block this way."
    },
    {
      "type": "mcq",
      "tag": "packaged_task",
      "question": "What does std::packaged_task add over calling std::async, and how is it used?",
      "options": [
        "It runs the callable in a guaranteed fresh thread, unlike std::async.",
        "It is a compile-time wrapper that memoizes the callable's result.",
        "It executes the callable immediately in the current thread and caches the future.",
        "It wraps a callable so its result (or exception) is delivered through a std::future obtained via get_future(), while leaving you in full control of when and on which thread the task executes — you invoke the packaged_task yourself, e.g. after handing it to a worker thread or thread pool."
      ],
      "answer": 3,
      "explain": "std::async couples \"create the task\" with \"decide how it runs\"; packaged_task decouples them. You call task.get_future() first, then move the task wherever it should run and invoke its operator(), which stores the return value or caught exception into the shared state. That makes it the standard building block for thread pools and work queues; it is move-only, like the one-shot resource it represents."
    },
    {
      "type": "mcq",
      "tag": "shared_future",
      "question": "Several threads must all wait for, and read, one result produced once. Why is std::shared_future the right tool rather than std::future?",
      "options": [
        "std::future::get() may be called only once — it moves the result out and leaves the future invalid — and future is move-only; std::shared_future, obtained e.g. via future::share(), is copyable, each copy's get() can be called repeatedly, and multiple threads may each wait on their own copy of it.",
        "std::shared_future is merely std::future plus an internal mutex; they are otherwise identical.",
        "std::future cannot be used across threads at all; shared_future is the only thread-safe future.",
        "shared_future lets multiple producers set the value; future permits only one."
      ],
      "answer": 0,
      "explain": "A plain future represents exclusive one-shot retrieval: get() transfers the result and invalidates the future. shared_future makes the state reference-counted and get() returns a const reference-like access that can be repeated, so a one-time event (configuration loaded, go-signal fired) can be observed by many consumers. The usual practice is to give each thread its own copy of the shared_future to wait on."
    },
    {
      "type": "mcq",
      "tag": "latch vs barrier",
      "question": "Which statement correctly contrasts std::latch and std::barrier (C++20)?",
      "options": [
        "A latch is a single-use countdown — threads call count_down() and/or wait() until it reaches zero, it can never be reset, and a thread need not wait on a latch it decrements; a barrier is reusable across phases: each cycle, arriving threads block until all have arrived, an optional completion function runs, and the barrier resets for the next phase.",
        "A barrier is single-use; a latch automatically resets after each wave of threads.",
        "They are interchangeable; barrier is just the allocating version of latch.",
        "A latch can only be decremented by one designated thread; a barrier can be decremented by any thread."
      ],
      "answer": 0,
      "explain": "std::latch is a one-shot gate: useful for \"wait until N startup steps complete\", and decrementers need not be waiters (arrive_and_wait() does both). std::barrier coordinates a fixed group through repeated rounds — after all participants arrive, the completion callback runs and the barrier is automatically reused, with arrive_and_drop() shrinking the group. Loop phases fit barriers; one-time events fit latches."
    },
    {
      "type": "mcq",
      "tag": "semaphore",
      "question": "What can a C++20 std::counting_semaphore/std::binary_semaphore do that a std::mutex cannot?",
      "options": [
        "Nothing — binary_semaphore and mutex are required to be implemented identically.",
        "Guarantee FIFO fairness among blocked threads.",
        "A semaphore has no notion of an owning thread: release() may be called by a thread that never called acquire(), so one thread can signal another (and a counting semaphore can admit N threads at once); a mutex must be unlocked by the thread that locked it, and violating that is undefined behavior.",
        "Semaphores can protect data from data races, while mutexes only provide scheduling hints."
      ],
      "answer": 2,
      "explain": "Ownership is the key difference: mutexes pair lock/unlock in one thread, which is exactly wrong for signaling patterns where thread A waits and thread B announces an event. binary_semaphore (a counting_semaphore with max 1) is a lightweight signaling primitive, and counting_semaphore bounds concurrent access to N slots of a resource. Semaphores are also often faster than a condition_variable-plus-mutex pair for simple notifications; no fairness order is guaranteed."
    },
    {
      "type": "mcq",
      "tag": "coroutine basics",
      "question": "What makes a C++20 function a coroutine, and what does its caller actually receive?",
      "options": [
        "Declaring its return type as std::coroutine_handle<> marks it as a coroutine.",
        "Using the coroutine keyword before the function name, analogous to async in other languages.",
        "The presence of at least one co_await, co_yield, or co_return in its body makes it a coroutine; its declared return type must then supply a nested promise_type (located via std::coroutine_traits), and the caller receives the return object created from promise.get_return_object() — typically as soon as the coroutine first suspends — not the co_return value directly.",
        "Any function that returns std::generator or task is automatically compiled as a coroutine even without co_* keywords."
      ],
      "answer": 2,
      "explain": "Coroutine-ness is determined purely by the body: any co_await, co_yield, or co_return triggers the coroutine transformation. The compiler allocates a coroutine frame, constructs the promise_type, and hands the caller promise.get_return_object() (e.g. a generator or task object); the value passed to co_return travels through promise.return_value(), reachable only via that return object. A plain return statement is ill-formed inside a coroutine."
    },
    {
      "type": "mcq",
      "tag": "coroutine mechanics",
      "question": "Which statement about C++20 coroutine suspension mechanics is correct?",
      "options": [
        "co_yield v is rewritten as co_await promise.yield_value(v): the value is handed to the promise, and the awaiter that yield_value returns (typically std::suspend_always) decides whether the coroutine actually suspends at that point.",
        "If promise_type::initial_suspend() returns std::suspend_always, the coroutine can never be started.",
        "co_return v invokes the caller's continuation directly, bypassing the promise object.",
        "A coroutine suspends automatically after every statement so the scheduler can interleave it."
      ],
      "answer": 0,
      "explain": "co_yield is sugar over co_await promise.yield_value(expr); a generator's promise stores the value and returns suspend_always so control goes back to the consumer until the next resume(). initial_suspend() returning suspend_always simply makes the coroutine lazy — created suspended at the top, run only when resumed — while suspend_never makes it start eagerly. Suspension happens only at explicit suspend points (co_await/co_yield and initial/final suspend), never arbitrarily."
    },
    {
      "type": "code",
      "tag": "promise/future",
      "question": "One thread fulfills a promise while the main thread calls get(). What is the output?",
      "code": "std::promise<int> p;\nstd::future<int> fut = p.get_future();\n\nstd::thread t([&p] {\n    std::this_thread::sleep_for(std::chrono::milliseconds(50));\n    p.set_value(42);\n});\n\nstd::cout << fut.get();\nt.join();",
      "options": [
        "Guaranteed 42: fut.get() blocks until the promise's set_value() fulfills the shared state, and that shared state synchronizes the two threads, so no race exists on the value.",
        "It may throw std::future_error because get() is called before set_value().",
        "It may print an indeterminate value if get() wins the race against set_value().",
        "Undefined behavior: a std::promise may not be captured by reference in another thread."
      ],
      "answer": 0,
      "explain": "A promise/future pair is a one-shot, thread-safe channel: get() blocks until the result is stored, and set_value() synchronizes-with the completion of get(), so the transfer is race-free by construction — with no explicit mutex or condition variable. Calling get() before the value exists is precisely the intended use, not an error. The reference capture is safe here because main keeps p alive until join()."
    },
    {
      "type": "code",
      "tag": "thread arguments",
      "question": "A colleague writes this to increment x on another thread. What happens?",
      "code": "#include <thread>\n\nvoid increment(int& value) { ++value; }\n\nint main() {\n    int x = 0;\n    std::thread t{ increment, x };\n    t.join();\n    return x;\n}",
      "options": [
        "It compiles and x is 1 after join(): the reference parameter binds directly to x.",
        "It compiles, but increment() operates on an internal copy, so x silently stays 0.",
        "It fails to compile: std::thread decay-copies its arguments into internal storage and invokes the callable with rvalues, which cannot bind to a non-const int&. To pass a real reference you must wrap the argument: std::thread t{ increment, std::ref(x) }.",
        "It compiles, but the behavior is undefined because x may go out of scope while the thread runs."
      ],
      "answer": 2,
      "explain": "std::thread copies (after decay) every argument into the new thread's storage and calls the function with those copies as rvalues, so a parameter declared int& makes the construction ill-formed — libc++/libstdc++ reject it with a static assertion. Note the nastier cousin: a const int& parameter would compile but bind to the internal copy, silently discarding the caller's expectation. std::ref/std::cref wrap the argument in a reference_wrapper that survives the decay copy."
    },
    {
      "type": "mcq",
      "tag": "hardware_concurrency",
      "question": "What does std::thread::hardware_concurrency() actually promise?",
      "options": [
        "It returns the exact number of physical cores and throws std::system_error if it cannot determine it.",
        "It is a static member returning only a hint — the number of concurrent threads the implementation can support, often the count of logical cores — and it is allowed to return 0 when the value is not computable, so sizing code must handle 0 (e.g., fall back to a default).",
        "It returns the number of threads currently alive in the calling process.",
        "It is constexpr, so it can be used to size a std::array of workers at compile time."
      ],
      "answer": 1,
      "explain": "The standard only requires a hint: the value 'should be considered only an estimate', and 0 is the defined escape hatch when the count is unknown. Typical code does auto n = std::thread::hardware_concurrency(); if (n == 0) n = 4; before sizing a pool. It is a runtime query, not constexpr, and it says nothing about how many threads your process is using."
    },
    {
      "type": "code",
      "tag": "std::ref",
      "question": "addTen takes its parameter by reference. What does this program print?",
      "code": "#include <functional>\n#include <iostream>\n#include <thread>\n\nvoid addTen(int& value) { value += 10; }\n\nint main() {\n    int x = 5;\n    std::thread t{ addTen, std::ref(x) };\n    t.join();\n    std::cout << x;\n}",
      "options": [
        "Guaranteed 15: std::ref wraps x in a std::reference_wrapper that survives std::thread's decay copy, so addTen() mutates the caller's x, and join() makes that write happen-before main's read.",
        "5: the reference_wrapper itself is copied, so the update lands in a temporary.",
        "5 or 15, nondeterministically, depending on whether the thread finishes before main reads x.",
        "Undefined behavior: handing a reference to another thread is a data race by definition."
      ],
      "answer": 0,
      "explain": "reference_wrapper is the sanctioned way to smuggle a real reference through std::thread's (and std::bind's / std::async's) by-value argument machinery: copying the wrapper still refers to x. There is no race and no nondeterminism because t.join() creates a happens-before edge between the thread's write and main's read. The caller just must guarantee x outlives the thread — trivially true here."
    },
    {
      "type": "code",
      "tag": "dangling capture",
      "question": "What can be said about this program's behavior?",
      "code": "#include <chrono>\n#include <iostream>\n#include <string>\n#include <thread>\n\nvoid spawn() {\n    std::string msg = \"hello\";\n    std::thread t{ [&msg] { std::cout << msg; } };\n    t.detach();\n}   // msg is destroyed here\n\nint main() {\n    spawn();\n    std::this_thread::sleep_for(std::chrono::milliseconds(100));\n}",
      "options": [
        "Guaranteed to print \"hello\": detach() runs the lambda to completion before returning.",
        "Guaranteed to print nothing: a detached thread is killed when the function that created it returns.",
        "It always deadlocks, because a detached thread may not use std::cout.",
        "It may exhibit undefined behavior: the detached thread can execute after spawn() returns, at which point msg is destroyed and the lambda's captured reference dangles — printing \"hello\", garbage, or crashing are all possible outcomes."
      ],
      "answer": 3,
      "explain": "detach() severs the handle but the thread keeps running on its own schedule; nothing stops spawn() from returning and destroying msg first, after which the capture-by-reference is a dangling reference and any use is UB. The sleep in main is a probabilistic band-aid, not synchronization. The fixes are to capture by value ([msg]) or to join before msg dies — a core rule from Professional C++: never let a detached thread touch captured locals by reference."
    },
    {
      "type": "mcq",
      "tag": "this_thread::yield",
      "question": "What does std::this_thread::yield() guarantee?",
      "options": [
        "It suspends the calling thread for exactly one scheduler quantum.",
        "It atomically releases any mutexes the calling thread holds so other threads can run.",
        "Nothing concrete: it is merely a hint that gives the implementation an opportunity to reschedule and run other threads; the caller may resume immediately. It is a politeness measure inside spin-wait loops, not a synchronization or timing tool.",
        "It blocks until at least one other ready thread has made progress."
      ],
      "answer": 2,
      "explain": "yield() maps to something like sched_yield: the OS may switch to another ready thread of appropriate priority, or may not. It provides no ordering, releases nothing, and guarantees no delay, so correctness must never depend on it. Its legitimate niche is easing CPU pressure in short spin loops (as in this quiz's jthread example) before escalating to a real blocking primitive."
    },
    {
      "type": "code",
      "tag": "thread identity",
      "question": "What does this program print about the two thread ids it compares?",
      "code": "#include <iostream>\n#include <thread>\n\nint main() {\n    std::thread t;                              // default-constructed\n    std::cout << (t.get_id() == std::thread::id{}) << \" \";\n    std::thread w{ [] {} };\n    std::thread moved = std::move(w);\n    std::cout << (w.get_id() == std::thread::id{});\n    moved.join();\n}",
      "options": [
        "\"0 0\": every std::thread object receives a unique id at construction.",
        "\"1 1\": both a default-constructed thread and a moved-from thread represent no thread of execution, and get_id() on such an object returns the default-constructed std::thread::id, so both comparisons are true.",
        "\"1 0\": moving transfers joinability but the source keeps its original id.",
        "The comparisons are unspecified for thread objects that do not own a thread."
      ],
      "answer": 1,
      "explain": "std::thread::id{} is the distinguished 'no thread' identity. A default-constructed std::thread owns nothing, and after std::thread moved = std::move(w); the source w is left in that same empty state — not joinable, id equal to std::thread::id{} — while moved now owns the thread and must be joined. This id round-trip is the standard way to test whether a thread object currently owns a thread of execution."
    },
    {
      "type": "code",
      "tag": "moving threads",
      "question": "Both lambdas are trivial and finish quickly. What is guaranteed to happen at the line t1 = std::move(t2)?",
      "code": "#include <thread>\n\nint main() {\n    std::thread t1{ [] {} };\n    std::thread t2{ [] {} };\n    t1 = std::move(t2);\n    t1.join();\n}",
      "options": [
        "std::terminate() is called: move-assigning onto a std::thread that is still joinable terminates the program, exactly like destroying a joinable thread — the running thread t1 owns would otherwise be silently orphaned.",
        "t1's original thread is detached automatically and the program exits cleanly.",
        "t1's original thread is joined first, and then t2's thread is adopted.",
        "Undefined behavior: assigning to an active std::thread is a data race."
      ],
      "answer": 0,
      "explain": "The move assignment operator has the same precondition as the destructor: the target must not be joinable. Here t1 still owns an unjoined thread, so the assignment calls std::terminate() — deterministically, regardless of whether the lambda already finished (joinable() stays true until join() or detach()). The fix is to join or detach t1 before reusing it; moving into an empty (default-constructed or moved-from) thread object is fine."
    },
    {
      "type": "mcq",
      "tag": "thread ownership",
      "question": "Which statement about std::thread's ownership semantics is correct?",
      "options": [
        "std::thread is copyable, and each copy refers to the same underlying OS thread.",
        "After t2 = std::move(t1), both objects remain joinable and either may call join().",
        "join() may be called repeatedly on the same object; only the first call blocks.",
        "std::thread is move-only: copying is deleted because two owners could not agree on who joins; moving transfers the underlying thread and leaves the source non-joinable, which is what lets you store threads in containers (e.g., vector<std::thread> with push_back(std::move(t))) — and exactly one join() or detach() must eventually happen on whichever object ends up owning the thread."
      ],
      "answer": 3,
      "explain": "A std::thread models unique ownership of a thread of execution, so its copy operations are deleted and ownership moves like unique_ptr. After a move the source is empty (joinable() == false, get_id() == std::thread::id{}), and calling join() on it throws std::system_error. Containers of workers rely on this move semantics; the one-join-or-detach obligation follows the object that currently owns the thread."
    },
    {
      "type": "mcq",
      "tag": "recursive_mutex",
      "question": "When is std::recursive_mutex appropriate, and what does it cost?",
      "options": [
        "It should be the default mutex type, since it prevents deadlocks between different threads.",
        "It allows the thread that owns it to lock it again (each lock must be matched by an unlock before others can acquire it), which rescues designs where one public locking method calls another public locking method of the same class; the costs are extra bookkeeping overhead versus std::mutex and a hidden design smell — the usual cleaner fix is private non-locking helpers called by locking public wrappers.",
        "It allows two threads in a parent/child relationship to hold the lock simultaneously.",
        "Its only difference from std::mutex is that unlock() may be called from a different thread."
      ],
      "answer": 1,
      "explain": "recursive_mutex maintains an owner and a lock count, so re-locking by the owner is defined where std::mutex::lock() by the owner is undefined behavior. That bookkeeping makes it somewhat more expensive, and needing it usually signals layering problems: Professional C++ recommends refactoring so the locking happens once at the public boundary and internal calls go to non-locking private implementations. It does nothing about cross-thread deadlocks or unlock ownership rules."
    },
    {
      "type": "code",
      "tag": "recursive locking",
      "question": "outer() calls inner() while already holding the lock. What happens?",
      "code": "#include <iostream>\n#include <mutex>\n\nstd::recursive_mutex m;\n\nvoid inner() {\n    std::lock_guard lock{ m };\n    std::cout << \"inner\\n\";\n}\n\nvoid outer() {\n    std::lock_guard lock{ m };\n    std::cout << \"outer\\n\";\n    inner();\n}\n\nint main() { outer(); }",
      "options": [
        "Deadlock: inner() waits forever for outer()'s lock_guard to be destroyed.",
        "Undefined behavior: locking any standard mutex twice from one thread is always UB.",
        "It prints \"outer\" then \"inner\", guaranteed: a recursive_mutex may be re-acquired by its owning thread, raising its ownership count to 2; each lock_guard destructor releases one level, and the mutex is fully free when outer() returns.",
        "The output order is unspecified because the two lock_guards contend."
      ],
      "answer": 2,
      "explain": "This is the canonical recursive_mutex scenario: single-threaded, deterministic, and well-defined — outer acquires level 1, inner level 2, then the levels unwind in reverse. Had m been a plain std::mutex, the second lock() by the owning thread would be undefined behavior (commonly manifesting as a self-deadlock). Note the trade-off: this compiles and runs, but a refactor into a non-locking private inner_impl() would avoid the recursive mutex entirely."
    },
    {
      "type": "code",
      "tag": "timed_mutex",
      "question": "main() holds the timed_mutex while it joins the worker. What does this program print?",
      "code": "#include <chrono>\n#include <iostream>\n#include <mutex>\n#include <thread>\n\nstd::timed_mutex m;\n\nint main() {\n    m.lock();\n    std::thread t{ [] {\n        bool ok = m.try_lock_for(std::chrono::milliseconds(50));\n        std::cout << (ok ? \"acquired\" : \"timed out\");\n    } };\n    t.join();\n    m.unlock();\n}",
      "options": [
        "\"timed out\", guaranteed: main locks the timed_mutex before spawning t and does not unlock until after join(), so the mutex is held for the entire lifetime of t; try_lock_for() therefore cannot succeed and returns false once the 50 ms budget elapses.",
        "\"acquired\": join() releases main's lock so the waiting try_lock_for succeeds.",
        "It deadlocks: a thread may not call join() while it holds a mutex.",
        "Undefined behavior: try_lock_for on a mutex owned by another thread is UB."
      ],
      "answer": 0,
      "explain": "try_lock_for blocks up to the given duration and returns whether ownership was obtained; since the owner (main) provably holds the lock across the child's entire lifetime, false is the only possible result. Holding a mutex while joining is legal (join is not a lock operation) — the UB rule concerns try/lock calls by a thread that already owns a non-recursive mutex, which is not the case across threads. timed_mutex adds try_lock_for/try_lock_until to the plain mutex interface."
    },
    {
      "type": "mcq",
      "tag": "shared_mutex",
      "question": "What is the intended usage pattern for std::shared_mutex, and when does it pay off?",
      "options": [
        "Writers take std::shared_lock so they can cooperate; readers take std::unique_lock for safety.",
        "It makes unsynchronized concurrent reads defined behavior even when no lock object is used.",
        "It is designed for write-heavy workloads, where exclusive locks would serialize writers.",
        "Readers acquire shared ownership (std::shared_lock / lock_shared()), so any number of readers proceed concurrently; writers acquire exclusive ownership (std::unique_lock or lock()), excluding readers and writers alike. It wins when reads heavily outnumber writes and read sections do meaningful work — for tiny critical sections or write-heavy loads, plain std::mutex is often faster because shared locking itself costs more."
      ],
      "answer": 3,
      "explain": "shared_mutex implements the classic reader-writer lock: shared mode for the many, exclusive mode for the few. The idiomatic guards are shared_lock<shared_mutex> in const/read paths and unique_lock (or scoped_lock) in mutating paths. Its internal state is more expensive to maintain than std::mutex, so measure: uncontended or short sections frequently favor the plain mutex. shared_timed_mutex additionally offers the timed try variants."
    },
    {
      "type": "code",
      "tag": "lock upgrade",
      "question": "One thread runs main(). What does the standard say about this program?",
      "code": "#include <iostream>\n#include <shared_mutex>\n\nstd::shared_mutex m;\n\nint main() {\n    m.lock_shared();      // acquire a reader lock\n    std::cout << \"reading\\n\";\n    m.lock();             // now request the writer lock on the same thread\n    std::cout << \"writing\\n\";\n    m.unlock();\n    m.unlock_shared();\n}",
      "options": [
        "It prints \"reading\" then \"writing\": lock() atomically upgrades the shared lock to exclusive.",
        "Undefined behavior: a thread that already holds any ownership of a shared_mutex may not call lock() on it; in practice this usually self-deadlocks, since the writer waits for all readers to leave — including itself. The standard library has no lock-upgrade operation: you must release the shared lock and then acquire the exclusive lock, revalidating any state read.",
        "It throws std::system_error with resource_deadlock_would_occur, guaranteed.",
        "It prints both lines, because shared_mutex ownership is recursive within one thread."
      ],
      "answer": 1,
      "explain": "All standard mutex lock functions have the precondition that the calling thread does not already own the mutex (in any mode, for shared_mutex), so this is formally UB rather than a guaranteed deadlock or exception. Upgradable locks exist in Boost (upgrade_lock) but were deliberately left out of the standard. The correct sequence — unlock_shared, then lock — opens a window in which another writer may have changed the data, so the read must be redone under the exclusive lock."
    },
    {
      "type": "mcq",
      "tag": "writer starvation",
      "question": "What is writer starvation in the context of a reader-writer lock such as std::shared_mutex?",
      "options": [
        "Under a continuous stream of overlapping readers, a writer waiting for exclusive access may wait unboundedly, because there is never a moment with zero shared owners; implementations avoid it only if they block new readers once a writer is queued, and the C++ standard mandates no fairness policy — so whether writers starve is implementation-specific.",
        "The standard requires shared_mutex to prioritize writers, so starvation cannot occur in conforming implementations.",
        "Writer starvation is impossible, because lock() atomically preempts all current shared owners.",
        "Writer starvation only arises when a single thread calls lock_shared() recursively."
      ],
      "answer": 0,
      "explain": "Exclusive acquisition needs the reader count to hit zero; if new readers keep arriving before old ones leave, that never happens unless arrivals are gated behind the waiting writer. Quality implementations typically queue new shared requests behind a pending exclusive request (which then penalizes readers instead), but the standard is silent, so portable code should not assume either policy. This is a classic reason to benchmark shared_mutex against plain mutex for your actual read/write mix."
    },
    {
      "type": "mcq",
      "tag": "lock tags",
      "question": "Which statement correctly describes std::defer_lock, std::adopt_lock, and std::try_to_lock?",
      "options": [
        "adopt_lock defers locking; defer_lock adopts an already-held lock; try_to_lock blocks until the lock is acquired.",
        "All three tags are accepted by std::lock_guard as well as std::unique_lock.",
        "defer_lock stores the mutex without locking it (precondition: the thread does not own it), typically so several locks can later be acquired together via std::lock; adopt_lock wraps a mutex the calling thread has already locked, transferring unlock duty to the guard; try_to_lock attempts a non-blocking acquisition whose outcome must be checked with owns_lock(). lock_guard accepts only adopt_lock — unique_lock accepts all three.",
        "try_to_lock throws std::system_error whenever the mutex is already held by another thread."
      ],
      "answer": 2,
      "explain": "The three tags select different constructor behaviors for lock wrappers. defer_lock leaves the wrapper unlocked-but-armed (the basis of the unique_lock + std::lock multi-mutex idiom), adopt_lock hands an existing ownership to RAII, and try_to_lock maps to try_lock() with the result exposed through owns_lock()/operator bool. Since lock_guard has no unlock/relock machinery, only adoption makes sense for it; scoped_lock likewise has an adopting constructor form."
    },
    {
      "type": "code",
      "tag": "defer_lock + std::lock",
      "question": "Both unique_locks are constructed with std::defer_lock. What does this program print?",
      "code": "#include <iostream>\n#include <mutex>\n\nstd::mutex m1, m2;\n\nint main() {\n    std::unique_lock lock1{ m1, std::defer_lock };\n    std::unique_lock lock2{ m2, std::defer_lock };\n    std::lock(lock1, lock2);\n    std::cout << lock1.owns_lock() << lock2.owns_lock();\n}",
      "options": [
        "It can deadlock against another thread running the same code with the declarations of lock1 and lock2 swapped.",
        "\"00\": std::lock locks the underlying mutexes, but the unique_lock objects do not register ownership.",
        "It fails to compile: std::lock accepts mutexes only, not unique_lock objects.",
        "\"11\", guaranteed: both unique_locks are created deferred (mutex stored, not locked), std::lock then acquires both using its deadlock-avoidance algorithm and marks each wrapper as owning its mutex, and both destructors release the locks."
      ],
      "answer": 3,
      "explain": "std::lock accepts anything Lockable — including unique_lock, whose lock/try_lock/unlock forward to the wrapped mutex and update owns_lock(). Because std::lock acquires the whole set atomically-in-effect (using a try-and-back-off strategy), even two threads passing the same mutexes in opposite order cannot deadlock, which kills option one. Since C++17 the tidier spelling of this exact pattern is std::scoped_lock lock{ m1, m2 }."
    },
    {
      "type": "code",
      "tag": "adopt_lock",
      "question": "The lock_guard is constructed with std::adopt_lock after a manual lock(). What does this program print?",
      "code": "#include <iostream>\n#include <mutex>\n\nstd::mutex m;\n\nint main() {\n    m.lock();\n    {\n        std::lock_guard<std::mutex> guard{ m, std::adopt_lock };\n        std::cout << \"in section\\n\";\n    }   // guard's destructor runs here\n    m.lock();                     // would deadlock if m were still locked\n    std::cout << \"relocked\\n\";\n    m.unlock();\n}",
      "options": [
        "Undefined behavior: lock_guard always locks in its constructor, so m ends up locked twice by one thread.",
        "\"in section\" then \"relocked\", guaranteed: the adopt_lock constructor takes over the already-acquired m without locking again, the guard's destructor performs the single matching unlock at the end of the block, and main can then lock m afresh.",
        "Deadlock at the second m.lock(): a lock_guard never unlocks an adopted mutex.",
        "Only \"in section\" is printed: the second lock() throws because m was already unlocked."
      ],
      "answer": 1,
      "explain": "std::lock_guard<std::mutex> guard{ m, std::adopt_lock } is the one tagged constructor lock_guard has: it assumes — as a precondition — that the calling thread already owns m, and simply takes responsibility for the unlock. So the program is a well-defined lock/adopt/unlock/relock/unlock sequence. Adopting a mutex the thread does not actually own would violate the precondition and be undefined behavior, which is why this tag mostly appears right after a manual lock() or std::lock() call."
    },
    {
      "type": "mcq",
      "tag": "condition_variable_any",
      "question": "How does std::condition_variable_any differ from std::condition_variable?",
      "options": [
        "condition_variable_any can wait on any lock type satisfying BasicLockable — shared_lock, unique_lock over other mutex types, even user-defined locks — whereas condition_variable is specialized for std::unique_lock<std::mutex> only; the generality may cost extra size and overhead, and in C++20 condition_variable_any is also the one that gained stop_token-aware wait overloads for interruptible waiting.",
        "condition_variable_any eliminates the possibility of spurious wakeups.",
        "condition_variable_any may be waited on without holding any lock at all.",
        "There is no difference; _any is a deprecated alias kept for source compatibility."
      ],
      "answer": 0,
      "explain": "The '_any' refers to the lock parameter: wait() is a template over the lock type, so you can pair it with a shared_mutex's shared_lock or a custom RAII lock. That flexibility can require the implementation to carry an internal mutex, hence the guidance to prefer plain condition_variable when unique_lock<mutex> suffices. Spurious wakeups and the hold-the-lock protocol apply equally to both; the C++20 wait(lock, stop_token, pred) overloads exist only on condition_variable_any."
    },
    {
      "type": "mcq",
      "tag": "notify_all_at_thread_exit",
      "question": "What does std::notify_all_at_thread_exit(cv, std::move(lock)) do?",
      "options": [
        "It calls cv.notify_all() immediately and then terminates the calling thread.",
        "It registers cv to be notified whenever any thread in the process exits.",
        "It schedules a deferred signal: when the calling thread actually ends — after its thread_local destructors have completed — the transferred lock is released and cv.notify_all() is called. This lets code (typically a detached thread) publish \"I am completely finished, including thread-local cleanup\", which an ordinary notify executed inside the thread cannot promise.",
        "It is equivalent to calling join() on the current thread from within itself."
      ],
      "answer": 2,
      "explain": "The function takes ownership of a locked unique_lock<mutex> and arranges the unlock+notify_all to run as part of thread termination, ordered after thread_local destruction. Waiters must still loop on a mutex-protected predicate, because the wakeup carries the usual condition-variable caveats. It is a niche tool — mostly a building block for detached-thread handshakes and futures-like machinery — but it answers a question join() answers only for joinable threads."
    },
    {
      "type": "code",
      "tag": "interruptible wait",
      "question": "dataReady is never set to true. What does this program print?",
      "code": "#include <chrono>\n#include <condition_variable>\n#include <iostream>\n#include <mutex>\n#include <thread>\n\nstd::mutex m;\nstd::condition_variable_any cv;\nbool dataReady = false;   // never set to true\n\nint main() {\n    std::jthread worker{ [](std::stop_token st) {\n        std::unique_lock lock{ m };\n        bool result = cv.wait(lock, st, [] { return dataReady; });\n        std::cout << (result ? \"data\" : \"cancelled\");\n    } };\n    std::this_thread::sleep_for(std::chrono::milliseconds(50));\n}   // worker's destructor runs here",
      "options": [
        "Nothing: the worker blocks forever in wait(), so the jthread destructor deadlocks in join().",
        "\"data\": request_stop() forces the wait's predicate to evaluate as true.",
        "Undefined behavior: condition_variable_any may not be used from a jthread's callable.",
        "\"cancelled\", guaranteed: this C++20 wait overload internally registers a stop_callback on the token; the jthread destructor calls request_stop(), which wakes the wait, the predicate is checked one final time, and since dataReady is still false, wait returns false and the thread prints \"cancelled\" before being joined."
      ],
      "answer": 3,
      "explain": "condition_variable_any::wait(lock, stop_token, pred) is the standard interruptible wait: it returns pred()'s value, which is false exactly when it woke because stop was requested. That is what makes jthread cancellation cooperative even for threads parked on a condition variable — the destructor's request_stop() reaches them. With a plain condition_variable (which lacks these overloads), the destructor's stop request would not wake the waiter and this program would indeed hang."
    },
    {
      "type": "mcq",
      "tag": "stop_source details",
      "question": "Which statement about std::stop_source, std::stop_token, and request_stop() is correct?",
      "options": [
        "Each stop_token holds an independent flag, so a request through one token is invisible to other tokens from the same source.",
        "All stop_source copies and stop_tokens obtained from one source share a single stop state; request_stop() may be called from any thread, only the first successful call has an effect (it returns true, later calls return false), the request can never be reset, and registered stop_callbacks are invoked synchronously on the thread making that first request.",
        "request_stop() can be undone with clear_stop() so the source can be reused for a new operation.",
        "stop_requested() blocks the caller until a stop is actually requested."
      ],
      "answer": 1,
      "explain": "The stop machinery is a shared, one-shot, thread-safe flag plus a callback list. jthread exposes its internal source via get_stop_source()/get_stop_token(), and any number of copies observe the same state; stop_requested() is a non-blocking query. Because callbacks run on the requesting thread (during request_stop()), they must be fast and must not block — and a callback registered after the request has already happened runs immediately in the registering thread instead."
    },
    {
      "type": "code",
      "tag": "stop_callback",
      "question": "What does this single-threaded program print?",
      "code": "#include <iostream>\n#include <stop_token>\n\nint main() {\n    std::stop_source src;\n    src.request_stop();\n    std::cout << \"a\";\n    std::stop_callback cb{ src.get_token(), [] { std::cout << \"b\"; } };\n    std::cout << \"c\";\n}",
      "options": [
        "\"abc\", guaranteed: stop was already requested when the stop_callback is constructed, and in that case the standard requires the callback to be invoked immediately, in the constructing thread, before the constructor returns — so \"b\" lands between \"a\" and \"c\".",
        "\"ac\": callbacks registered after a stop request are silently dropped.",
        "\"acb\": the callback fires when cb goes out of scope at the end of main.",
        "The position of \"b\" is unspecified, because stop callbacks execute on an internal background thread."
      ],
      "answer": 0,
      "explain": "stop_callback has exactly two invocation paths: on the thread calling request_stop() if the request comes after registration, or synchronously inside the stop_callback constructor if the state is already stopped — never on some hidden thread, and never dropped. This immediate-invocation rule is what makes late registration safe in cancellation code: you cannot miss the stop. Destroying the callback object deregisters it and, notably, waits if the callback is running concurrently elsewhere."
    },
    {
      "type": "mcq",
      "tag": "atomic_ref",
      "question": "Which statement about std::atomic_ref (C++20) is correct?",
      "options": [
        "atomic_ref copies the referenced object and performs its atomic operations on the private copy.",
        "Once any atomic_ref has been created for an object, that object remains atomic for the rest of its lifetime.",
        "atomic_ref applies atomic operations to an existing non-atomic object. The contract: for the lifetime of any atomic_ref bound to an object, every access to that object must go through some atomic_ref — mixing in plain reads/writes is a data race — the object must be suitably aligned (see atomic_ref<T>::required_alignment), and it must outlive all atomic_refs bound to it.",
        "atomic_ref only compiles for types where the operations are guaranteed lock-free."
      ],
      "answer": 2,
      "explain": "atomic_ref decouples atomicity from the object's declared type: data can live its whole life as plain T (packed in arrays, used by serial code at full speed) and become atomic just for a concurrent phase. The discipline is temporal — during that phase all touches go through atomic_ref instances, afterwards plain access is fine again. Alignment beyond alignof(T) may be required for lock-freedom, which is why required_alignment exists; non-lock-free specializations are still valid and may lock internally."
    },
    {
      "type": "code",
      "tag": "atomic_ref in action",
      "question": "What does this C++20 program print?",
      "code": "#include <atomic>\n#include <iostream>\n#include <thread>\n\nint main() {\n    int counter = 0;              // plain, non-atomic int\n    auto work = [&counter] {\n        std::atomic_ref<int> ref{ counter };\n        for (int i = 0; i < 100'000; ++i) {\n            ref.fetch_add(1, std::memory_order_relaxed);\n        }\n    };\n    std::thread t1{ work }, t2{ work };\n    t1.join();\n    t2.join();\n    std::cout << counter;\n}",
      "options": [
        "Undefined behavior: counter is a plain int touched by two threads.",
        "A value between 100000 and 200000: atomic_ref cannot prevent lost updates on a non-atomic object.",
        "It fails to compile: std::atomic_ref may not be constructed inside a lambda.",
        "Exactly 200000, guaranteed: during the entire concurrent phase every access to counter goes through an atomic_ref, so the fetch_adds are genuine atomic read-modify-writes on the same object (relaxed order does not weaken atomicity), and the two join() calls order main's plain read after all increments."
      ],
      "answer": 3,
      "explain": "Both threads wrap the same int in atomic_ref and use only atomic operations on it, satisfying atomic_ref's no-mixed-access contract, so there is no data race and no increment can be lost — RMWs always read the immediately preceding value in the modification order. Reading counter directly afterwards is legal because the concurrent phase (and every atomic_ref) is over by then, and join() supplies the happens-before edge. Note the two atomic_ref objects referring to one int are exactly how the type is meant to be used."
    },
    {
      "type": "code",
      "tag": "atomic<double>",
      "question": "How does this translation unit behave when compiled as C++17 versus C++20?",
      "code": "#include <atomic>\n#include <iostream>\n\nint main() {\n    std::atomic<double> d{ 1.5 };\n    d.fetch_add(2.5);\n    d += 1.0;\n    std::cout << d.load();\n}",
      "options": [
        "It compiles under both standards and prints 5; floating-point atomics have been feature-complete since C++11.",
        "C++17: it fails to compile — std::atomic<double> existed, but only with load/store/exchange/compare-exchange; there was no fetch_add and no arithmetic operator+= for floating-point specializations. C++20 added fetch_add/fetch_sub (and the compound operators) for floating-point types, so it compiles and prints 5.",
        "It fails to compile under both: fetch_add is defined only for integral and pointer specializations, even in C++20.",
        "It compiles under both standards, but before C++20 the additions are performed non-atomically."
      ],
      "answer": 1,
      "explain": "Pre-C++20 code had to add to an atomic<double> with a compare_exchange_weak loop; P0020 added the floating-point fetch_add/fetch_sub, wait-free where hardware allows, with the usual memory-order parameters. The integral-only rule in the third option was exactly the C++17 state of affairs, which is what makes it a tempting wrong answer for C++20. There is no standard mode in which the operators silently become non-atomic."
    },
    {
      "type": "code",
      "tag": "atomic wait/notify",
      "question": "The main thread may store and notify before the worker even reaches wait(). What does this program print?",
      "code": "#include <atomic>\n#include <iostream>\n#include <thread>\n\nstd::atomic<bool> ready{ false };\n\nint main() {\n    std::thread t{ [] {\n        ready.wait(false);        // block while the value equals false\n        std::cout << \"woke: \" << ready.load();\n    } };\n    ready.store(true);\n    ready.notify_one();\n    t.join();\n}",
      "options": [
        "\"woke: 1\", guaranteed: C++20 atomic wait is stateful, like a condition variable with a built-in predicate — wait(false) blocks only while the atomic's value compares equal to false and re-checks the value around any wakeup. If the store to true already happened, wait returns immediately, so the notification cannot be \"missed\".",
        "If notify_one() executes before the worker reaches wait(), the notification is lost and the program hangs forever.",
        "Undefined behavior: notify_one() on an atomic requires the notifying thread to hold a lock.",
        "It may print \"woke: 0\", because atomic waits can return spuriously."
      ],
      "answer": 0,
      "explain": "This futex-style API (wait/notify_one/notify_all on std::atomic and atomic_flag) removes the classic lost-wakeup hazard of bare condition signaling: the wait's argument is the 'old' value, and the function only blocks while the current value equals it. Wakeups may occur spuriously internally, but wait re-checks and returns only once the value differs from false — and nothing here ever sets it back — so \"woke: 0\" is impossible. No mutex is involved anywhere, which is precisely its appeal for simple flags."
    },
    {
      "type": "mcq",
      "tag": "memory_order_acq_rel",
      "question": "What does std::memory_order_acq_rel mean, and which operations can use it?",
      "options": [
        "It upgrades any load or store to be both acquire and release, making it equivalent to seq_cst.",
        "It may be applied to a plain store to make the store an acquire operation as well.",
        "It is meaningful for atomic read-modify-write operations (exchange, fetch_add, compare_exchange, …): the read half is an acquire and the write half is a release, so a single RMW can both synchronize-with a prior release from another thread and publish its own effects to a later acquire. A pure load can never be release, and a pure store can never be acquire; unlike seq_cst, acq_rel operations do not join a single total order.",
        "It is what makes fetch_add atomic; with weaker orders concurrent increments can be lost."
      ],
      "answer": 2,
      "explain": "acq_rel is the natural order for link-in-a-chain RMWs — reference-count upgrades, lock handoffs, node splicing — where one instruction must both consume previous writes and publish new ones. On plain loads acq_rel is not permitted (loads take relaxed/acquire/seq_cst; stores take relaxed/release/seq_cst). Atomicity itself is order-independent: even relaxed fetch_add never loses updates, so the last option confuses the two dials."
    },
    {
      "type": "code",
      "tag": "atomic fences",
      "question": "writer() and reader() run on different threads; both atomic accesses are relaxed. What does reader() print?",
      "code": "#include <atomic>\n#include <iostream>\n#include <thread>\n\nint data = 0;\nstd::atomic<int> flag{ 0 };\n\nvoid writer() {\n    data = 42;\n    std::atomic_thread_fence(std::memory_order_release);\n    flag.store(1, std::memory_order_relaxed);\n}\n\nvoid reader() {\n    while (flag.load(std::memory_order_relaxed) != 1) {}\n    std::atomic_thread_fence(std::memory_order_acquire);\n    std::cout << data;\n}\n\nint main() {\n    std::thread t1{ writer }, t2{ reader };\n    t1.join();\n    t2.join();\n}",
      "options": [
        "It may print 0: relaxed operations never synchronize, with or without fences.",
        "Undefined behavior: data is non-atomic and fences cannot remove the data race.",
        "42 on x86 only; the fences compile to nothing on weakly ordered CPUs like ARM.",
        "42, guaranteed: a release fence sequenced before a relaxed store synchronizes with an acquire fence sequenced after a relaxed load that reads the stored value. That synchronizes-with edge makes data = 42 happen-before the read of data — fence-based message passing, equivalent in effect to tagging the store release and the load acquire."
      ],
      "answer": 3,
      "explain": "This is the standard's fence-fence synchronization rule: fence(release); relaxed-store paired with relaxed-load-that-observes-it; fence(acquire) creates the same happens-before as release/acquire on the operations themselves — so the non-atomic data access is ordered and race-free. Fences also pair asymmetrically (release fence with acquire operation, release operation with acquire fence). Their practical niche is hoisting one barrier out of a loop of relaxed operations instead of paying per-operation ordering."
    },
    {
      "type": "mcq",
      "tag": "false sharing",
      "question": "Two threads each increment their own separate (properly synchronized) counter, yet scaling is terrible. What is false sharing, and what is the standard C++17 remedy?",
      "options": [
        "False sharing: logically independent variables end up on the same cache line, so each core's write invalidates the other core's cached copy and the line ping-pongs between them — a pure performance problem with zero logical contention. The fix is spacing/aligning each hot per-thread datum with alignas(std::hardware_destructive_interference_size) (typically 64, sometimes 128 bytes) so they occupy different lines.",
        "False sharing is a form of data race and therefore undefined behavior; the counters must become std::atomic.",
        "hardware_destructive_interference_size reports the size of the L1 data cache in bytes.",
        "False sharing affects only std::atomic variables; plain synchronized integers are immune."
      ],
      "answer": 0,
      "explain": "Cache coherence works at line granularity, so neighbors in memory become accidental rivals: correctness is untouched, throughput dies. hardware_destructive_interference_size is the portable 'keep apart' constant, and its sibling hardware_constructive_interference_size is the 'keep together' size for data you want co-resident on one line. Padding per-thread slots in arrays of counters, queue heads/tails, and spinlocks are the classic applications; atomic and non-atomic data are equally affected."
    },
    {
      "type": "code",
      "tag": "double-checked locking",
      "question": "Multiple threads call Widget::instance() concurrently. What is wrong with this classic pattern?",
      "code": "#include <mutex>\n\nclass Widget {\npublic:\n    static Widget* instance() {\n        if (s_instance == nullptr) {            // first check: no lock held\n            std::lock_guard lock{ s_mutex };\n            if (s_instance == nullptr) {        // second check: lock held\n                s_instance = new Widget{};\n            }\n        }\n        return s_instance;\n    }\nprivate:\n    static Widget* s_instance;                  // plain pointer\n    static std::mutex s_mutex;\n};\n\nWidget* Widget::s_instance = nullptr;\nstd::mutex Widget::s_mutex;\n\nint main() { Widget::instance(); }",
      "options": [
        "Nothing: the second check under the lock makes double-checked locking fully correct since C++11.",
        "The only issue is performance: the unlocked first check is redundant work.",
        "The unlocked first read of s_instance races with the locked write — a data race, hence undefined behavior. Even ignoring that, a thread may observe a non-null pointer before the effects of Widget's constructor are visible to it and then use a partially constructed object. The pointer must be std::atomic<Widget*> (release store after construction, acquire load in the fast path) — or drop the pattern for a magic static.",
        "It deadlocks, because lock_guard may not be used inside a static member function."
      ],
      "answer": 2,
      "explain": "This is the famously broken pre-C++11 DCLP: the mutex orders the two writers-side checks, but the fast-path read is completely unsynchronized against the write, and 'pointer visible before pointee' reorderings are real on both compilers and CPUs. C++11 finally provides the tools to express it correctly — atomics with acquire/release — and simultaneously made the whole exercise mostly unnecessary via thread-safe function-local statics. The lock itself is fine; option four is pure fiction."
    },
    {
      "type": "mcq",
      "tag": "lazy initialization",
      "question": "Which is a correct C++11-or-later strategy for lazily initializing a shared singleton pointer?",
      "options": [
        "Keep the plain pointer but declare it volatile; volatile prevents the compiler and CPU reorderings that break double-checked locking.",
        "Hold it in a std::atomic<Widget*>: fast path does an acquire load and returns if non-null; slow path locks a mutex, re-checks, constructs, and publishes with a release store. Or skip the ceremony entirely: a function-local static (guaranteed thread-safe initialization since C++11) or std::call_once/once_flag both express \"initialize exactly once\" directly.",
        "Perform both checks without any lock, but make only the second check use an atomic load.",
        "Insert std::this_thread::yield() between the two checks so the initializing thread has time to finish."
      ],
      "answer": 1,
      "explain": "The atomic version is the repaired DCLP: release-publish after full construction pairs with the acquire fast-path load, so no thread can see the pointer without also seeing the constructed object. In C++ (unlike Java or MSVC extensions), volatile provides no inter-thread ordering whatsoever, and yield() is a scheduler hint, not synchronization. In modern code the magic static is the recommended default and call_once covers once-only actions that are not a single static's initialization."
    },
    {
      "type": "code",
      "tag": "spinlock",
      "question": "Two threads increment a plain int under a hand-rolled atomic_flag spinlock. What does this print?",
      "code": "#include <atomic>\n#include <iostream>\n#include <thread>\n\nstd::atomic_flag spin = ATOMIC_FLAG_INIT;\nint counter = 0;\n\nvoid work() {\n    for (int i = 0; i < 100'000; ++i) {\n        while (spin.test_and_set(std::memory_order_acquire)) {}\n        ++counter;\n        spin.clear(std::memory_order_release);\n    }\n}\n\nint main() {\n    std::thread t1{ work }, t2{ work };\n    t1.join();\n    t2.join();\n    std::cout << counter;\n}",
      "options": [
        "Exactly 200000, guaranteed: test_and_set with acquire ordering on lock and clear with release ordering on unlock make each unlock synchronize-with the next successful lock acquisition, so the critical sections are totally ordered and the increments of the non-atomic counter never race and are never lost.",
        "A value up to 200000: a spinlock built on atomic_flag cannot protect non-atomic data.",
        "Undefined behavior: counter is non-atomic, and only std::mutex can create happens-before edges.",
        "It compiles only if both operations use memory_order_seq_cst."
      ],
      "answer": 0,
      "explain": "This is the textbook minimal-correct spinlock: acquire on the winning test_and_set prevents the critical section from leaking upward, release on clear prevents it from leaking downward, and the release-to-acquire pairing chains the sections into a total order — exactly the guarantee a mutex gives. Weakening the clear to relaxed would break it. atomic_flag is the one type the standard guarantees lock-free, which is why it is the canonical spinlock substrate; seq_cst is permitted but not required."
    },
    {
      "type": "mcq",
      "tag": "TTAS spinlock",
      "question": "Why do production-quality spinlocks spin on a plain load (\"test-and-test-and-set\") instead of hammering test_and_set() in a tight loop?",
      "options": [
        "Because test_and_set() loses its atomicity when it is executed repeatedly in a loop.",
        "Because a plain load can acquire the lock faster than a read-modify-write can.",
        "It is a correctness requirement: back-to-back RMW operations on one cache line are undefined behavior.",
        "Every test_and_set() is a write-intending RMW that must take the cache line in exclusive state, so N spinning cores generate continuous coherence traffic that also slows the lock holder trying to release it. Spinning on a read lets all waiters share the cached line quietly; only when the lock is observed free do they attempt the real test_and_set — usually combined with a pause/yield to be gentler still."
      ],
      "answer": 3,
      "explain": "The pure TAS loop turns waiting cores into a denial-of-service attack on the very line the owner needs to write on unlock. TTAS (spin on test(), then test_and_set on observed-free; C++20's atomic_flag::test makes this expressible in portable C++) keeps waiters read-only until there is a genuine chance of success. It changes nothing about correctness — both loops are correct — it is purely about coherence-protocol behavior under contention, plus the usual etiquette of pause instructions and eventual fallback to blocking."
    },
    {
      "type": "mcq",
      "tag": "ABA problem",
      "question": "What is the ABA problem in lock-free programming?",
      "options": [
        "ABA is when two threads swap the values A and B so that both end up holding the wrong one.",
        "A CAS-based algorithm reads value A, gets preempted while another thread changes the value to B and then back to A (classically: a stack node is popped and freed, and a newly allocated node reuses the same address), and the resumed CAS then succeeds — the bit pattern matches — even though the structure it validated no longer exists, corrupting the data structure. Mitigations include tagged/versioned pointers (pointer + generation counter CAS'd together) and safe reclamation schemes that prevent address reuse while readers remain.",
        "ABA occurs only on weakly ordered CPUs and disappears when every operation uses seq_cst.",
        "ABA is the standard's name for the spurious-failure mode of compare_exchange_weak."
      ],
      "answer": 1,
      "explain": "CAS checks value equality, not history: 'still A' is treated as 'nothing happened', which is false when A was recycled. Memory ordering cannot help — the compare genuinely succeeds — so the defenses change what is compared (add a version counter, use double-width CAS) or make recycling impossible while anyone might still hold the old pointer (hazard pointers, epochs, GC). Spurious CAS failure is the safe direction and unrelated; ABA is a wrongly succeeding CAS."
    },
    {
      "type": "mcq",
      "tag": "lock-free stack",
      "question": "A Treiber-style lock-free stack pops by CAS-ing head from the observed node to node->next. Beyond writing the CAS loop itself, what is the genuinely hard problem?",
      "options": [
        "Making push and pop use identical memory_order arguments, without which the stack corrupts.",
        "Preventing two threads from pushing at the same time, which CAS alone cannot arbitrate.",
        "Safe memory reclamation: even after one thread's pop wins the CAS, other threads that read head earlier may be just about to dereference that same node (to read node->next in their own attempt), so the winner cannot simply delete it. Industrial solutions are hazard pointers, epoch/RCU-style deferred reclamation, or reference counting — and premature freeing also re-enables ABA when the allocator reuses the node's address.",
        "Eliminating spurious wakeups from the compare_exchange retry loop."
      ],
      "answer": 2,
      "explain": "The CAS loop is the easy 20%; deciding when a removed node is unreachable by all concurrent operations is the research-grade 80%, which is why the C++ literature (and Professional C++'s advice to prefer proven libraries) treats hand-rolled lock-free structures as a last resort. Hazard pointers and RCU both trade some overhead for a guarantee that no thread holds a reference before memory is reused. Push contention is exactly what CAS handles, and mixed memory orders per se are not the issue."
    },
    {
      "type": "mcq",
      "tag": "producer-consumer design",
      "question": "Which statement about designing a mutex + condition_variable producer-consumer queue is correct?",
      "options": [
        "A bounded queue wants two wait conditions — consumers wait for \"not empty\", producers wait for \"not full\" — each waited with a predicate loop; the bound provides backpressure so a fast producer cannot exhaust memory, and using two condition variables (or at least carefully targeted notifies) prevents waking a producer when only a consumer can make progress.",
        "An unbounded queue is strictly better, because producers then never have to block.",
        "One condition_variable with notify_one is always sufficient when producers and consumers share it, since any wakeup lets someone make progress.",
        "The mutex can be omitted whenever the queue's push and pop operations are internally thread-safe; the waiting logic is unaffected."
      ],
      "answer": 0,
      "explain": "Bounding is a design decision about flow control: it converts memory exhaustion into producer blocking, usually what a robust pipeline wants. With mixed waiter classes on one CV, notify_one can wake a same-class waiter that immediately re-sleeps while the opposite class starves — hence the two-CV idiom (not_full/not_empty). And condition variables fundamentally require the predicate state to be read and written under the associated mutex; a lock-free container does not exempt the wait protocol."
    },
    {
      "type": "mcq",
      "tag": "async default policy",
      "question": "What does calling plain std::async(f) — with no launch policy argument — mean?",
      "options": [
        "It always runs f on a new thread, behaving like std::thread plus a future.",
        "It always defers execution until the first get() or wait() on the future.",
        "It is ill-formed: the policy argument is mandatory.",
        "The default policy is std::launch::async | std::launch::deferred: the implementation chooses, per call, between spawning asynchronous execution and lazy deferred execution. Correct code must therefore tolerate both — a wait_for()/wait_until() polling loop can spin forever if deferred was chosen (status stays future_status::deferred and the task never starts), and f may end up running on the thread that calls get(), affecting thread_local expectations."
      ],
      "answer": 3,
      "explain": "The two-flag default gives the library freedom (e.g., to avoid oversubscription) at the price of your determinism. If behavior matters, say so explicitly: launch::async to guarantee concurrent execution, launch::deferred for intentional laziness. Defensive code checks wait_for(0s) == future_status::deferred before entering any polling loop — precisely the trap this quiz's earlier deferred question demonstrates — or simply calls get() unconditionally."
    },
    {
      "type": "code",
      "tag": "exceptions across threads",
      "question": "compute() always throws. What does this program print?",
      "code": "#include <future>\n#include <iostream>\n#include <stdexcept>\n\nint compute() {\n    throw std::runtime_error{ \"failed\" };\n}\n\nint main() {\n    auto fut = std::async(std::launch::async, compute);\n    try {\n        std::cout << fut.get();\n    } catch (const std::runtime_error& e) {\n        std::cout << \"caught: \" << e.what();\n    }\n}",
      "options": [
        "The program std::terminate()s: an exception cannot leave the thread it was thrown on.",
        "\"caught: failed\", guaranteed: the exception escaping compute() is caught by the std::async machinery and stored in the future's shared state; fut.get() then rethrows that very exception in the calling thread, where the catch handler receives it.",
        "It prints 0: a task that throws produces a value-initialized result.",
        "get() throws std::future_error with future_errc::broken_promise instead of the original exception."
      ],
      "answer": 1,
      "explain": "Futures are the standard's channel for marshalling exceptions between threads: whatever escapes the task — here a runtime_error — is captured (as if by std::current_exception) and delivered by get(), preserving type and message, so cross-thread error handling looks like ordinary try/catch. An exception escaping a plain std::thread function, by contrast, really does terminate the program. broken_promise signals an abandoned shared state, a different failure entirely; and after this get(), the future is invalid."
    },
    {
      "type": "code",
      "tag": "broken promise",
      "question": "The promise dies without ever being satisfied. What does this program print?",
      "code": "#include <future>\n#include <iostream>\n\nint main() {\n    std::future<int> fut;\n    {\n        std::promise<int> p;\n        fut = p.get_future();\n    }   // p destroyed here without set_value()\n    try {\n        std::cout << fut.get();\n    } catch (const std::future_error& e) {\n        std::cout << \"future_error caught\";\n    }\n}",
      "options": [
        "Nothing — get() blocks forever waiting for a set_value() that will never come.",
        "0: get() returns a default-constructed int when no value was set.",
        "\"future_error caught\": destroying a promise whose shared state was never satisfied stores a std::future_error with future_errc::broken_promise into that state, so the blocked-or-later get() throws it rather than hanging. A future outliving its promise is safe by design.",
        "Undefined behavior: a std::future must not outlive the std::promise it came from."
      ],
      "answer": 2,
      "explain": "Abandonment is a defined protocol, not a bug trap: the promise's destructor 'abandons' the shared state, which counts as making it ready with a broken_promise error. That is exactly what prevents producer crashes or early returns from stranding consumers forever. The shared state is reference-counted, so the future keeps it alive after the promise is gone; e.code() here would compare equal to make_error_code(future_errc::broken_promise)."
    },
    {
      "type": "mcq",
      "tag": "promise_already_satisfied",
      "question": "set_value() is called on a std::promise that has already been satisfied (or set_exception() follows a set_value()). What happens?",
      "options": [
        "The second call throws std::future_error with future_errc::promise_already_satisfied: a shared state can be set exactly once, and the first stored result is preserved untouched.",
        "The new value overwrites the old one, provided get() has not yet been called.",
        "Undefined behavior: the standard leaves double-setting unchecked for performance.",
        "The second call blocks until a consumer has retrieved the first value, then stores the new one."
      ],
      "answer": 0,
      "explain": "A promise/future pair is a strictly one-shot channel, and the library enforces it with a defined exception rather than UB — the same future_error family that covers broken_promise and no_state. This bites in retry logic that may attempt to fulfill the same promise twice; the cure is a fresh promise per attempt, or routing results so only one writer can ever win. The consumer side is unaffected: get() still yields the first (only) result."
    },
    {
      "type": "code",
      "tag": "semaphore try_acquire",
      "question": "This runs on a single thread; the semaphore starts with count 2. What can be said about the printed digits?",
      "code": "#include <iostream>\n#include <semaphore>\n\nint main() {\n    std::counting_semaphore<4> sem{ 2 };\n    std::cout << sem.try_acquire();\n    std::cout << sem.try_acquire();\n    std::cout << sem.try_acquire();\n    sem.release(2);\n    std::cout << sem.try_acquire();\n}",
      "options": [
        "Guaranteed \"1101\": semaphore operations on a single thread are strictly deterministic.",
        "Guaranteed \"1100\": release() only readmits other threads, so the final try_acquire fails.",
        "Undefined behavior: try_acquire may not be mixed with release() on the same semaphore.",
        "In practice \"1101\", but only the third digit is fully guaranteed: with the count at zero try_acquire must return false, while the standard explicitly permits try_acquire to return false spuriously even when the count is positive — an allowance for weak implementations — so the three 1s are overwhelmingly likely rather than formally guaranteed."
      ],
      "answer": 3,
      "explain": "counting_semaphore::try_acquire is specified to 'attempt' the decrement and is allowed to fail even when it could have succeeded, mirroring compare_exchange_weak's spurious-failure license; real implementations essentially never do, but a strict guaranteed-output question must respect the wording. The certain part is negative: count 0 cannot be decremented, so digit three is 0. Blocking acquire() has no such out — it simply waits until it can decrement — and release(2) adding back both permits is perfectly ordinary usage; the template argument 4 is only the least-max-value bound."
    },
    {
      "type": "code",
      "tag": "barrier completion",
      "question": "Two threads pass a two-participant std::barrier twice. How many times is \"phase \" printed?",
      "code": "#include <barrier>\n#include <iostream>\n#include <thread>\n\nint main() {\n    std::barrier b{ 2, []() noexcept { std::cout << \"phase \"; } };\n    auto work = [&b] {\n        b.arrive_and_wait();   // round 1\n        b.arrive_and_wait();   // round 2\n    };\n    std::thread t1{ work }, t2{ work };\n    t1.join();\n    t2.join();\n}",
      "options": [
        "Once: a barrier's completion function runs only when the barrier is destroyed.",
        "Four times: once per arriving thread per round.",
        "Exactly twice, guaranteed — once per completed round: each time the last participant arrives, the completion function is executed exactly once (by one of the participating threads) while the others remain blocked; when it finishes, everyone is released and the barrier automatically resets its count for the next round.",
        "The count is unspecified, because completion functions may run concurrently with the released threads."
      ],
      "answer": 2,
      "explain": "The completion step is the barrier's defining extra over a latch loop: a per-phase, exactly-once hook (which must be invocable noexcept) that runs after all arrivals and before any release — ideal for swapping buffers or aggregating per-round results with no extra locking, since no participant is running user code at that moment. Two rounds, therefore two executions. arrive_and_drop() would shrink the participant count for subsequent phases; destruction runs no completion."
    },
    {
      "type": "mcq",
      "tag": "sleep_for",
      "question": "What does std::this_thread::sleep_for(100ms) actually guarantee?",
      "options": [
        "The thread sleeps for exactly 100 ms; any deviation is a quality-of-implementation bug.",
        "It blocks the thread for at least the requested duration — it may well be longer, at the mercy of timer resolution and scheduling — and, being duration-based, it is measured against a steady (monotonic) clock, so wall-clock adjustments such as NTP or DST changes cannot cut it short. By contrast, sleep_until with a std::chrono::system_clock time_point is tied to the adjustable wall clock.",
        "It spins the CPU at full speed for the duration to guarantee timing accuracy.",
        "It temporarily releases every lock the thread holds while it sleeps."
      ],
      "answer": 1,
      "explain": "The standard promises only a lower bound: the thread becomes ready no earlier than now + duration, and how much later is up to the system. sleep_for is defined in terms of a steady clock precisely so relative delays are immune to clock warping; choosing sleep_until's clock chooses your semantics. It is a true blocking wait (no spinning), and — unlike condition_variable::wait — it interacts with no locks whatsoever, which is why sleeping while holding a mutex is a classic contention bug."
    },
    {
      "type": "mcq",
      "tag": "await_suspend returns",
      "question": "An awaiter's await_suspend() may return void, bool, or a std::coroutine_handle. What do the three variants mean?",
      "options": [
        "void: unconditionally suspend and return control to the caller/resumer. bool: returning false vetoes the suspension — the coroutine resumes immediately (useful when the awaited result became ready during await_suspend); true suspends. coroutine_handle: symmetric transfer — the runtime immediately resumes the returned coroutine as a tail-transfer without growing the stack, which is how chains of coroutines resuming one another avoid stack overflow.",
        "bool: returning true vetoes the suspension; returning false suspends the coroutine.",
        "coroutine_handle: the returned handle is destroyed and its coroutine's frame is freed.",
        "The three forms are interchangeable style choices; the returned value is ignored."
      ],
      "answer": 0,
      "explain": "The return type is a protocol: void is the simple always-suspend form; bool exists to close the race where the operation completes while you are arranging the suspension; and returning a handle tells the compiler 'run this coroutine next', performed as a transfer rather than a nested resume() call. Returning std::noop_coroutine() from the handle form means 'nothing to resume, go back to the caller'. Symmetric transfer (P0913) is what makes deeply chained task awaits stack-safe."
    },
    {
      "type": "code",
      "tag": "awaiter mechanics",
      "question": "run() co_awaits a custom awaiter whose await_suspend returns false. What is the guaranteed output?",
      "code": "#include <coroutine>\n#include <iostream>\n\nstruct Awaiter {\n    bool await_ready() { std::cout << \"ready \"; return false; }\n    bool await_suspend(std::coroutine_handle<>) {\n        std::cout << \"suspend \";\n        return false;      // note: returns false\n    }\n    void await_resume() { std::cout << \"resume \"; }\n};\n\nstruct Task {\n    struct promise_type {\n        Task get_return_object() { return {}; }\n        std::suspend_never initial_suspend() { return {}; }\n        std::suspend_never final_suspend() noexcept { return {}; }\n        void return_void() {}\n        void unhandled_exception() {}\n    };\n};\n\nTask run() {\n    co_await Awaiter{};\n    std::cout << \"after\";\n}\n\nint main() { run(); }",
      "options": [
        "\"ready suspend\" and nothing more: returning false from await_suspend abandons the coroutine.",
        "\"ready resume after\": await_suspend is skipped whenever await_ready has run.",
        "\"suspend ready resume after\": await_suspend is always evaluated before await_ready.",
        "\"ready suspend resume after\", guaranteed: await_ready() returns false, so the coroutine suspends and await_suspend() runs; returning false from await_suspend cancels the suspension, so the coroutine resumes immediately — await_resume() executes and the body continues — all synchronously on the caller's thread."
      ],
      "answer": 3,
      "explain": "The co_await protocol is: evaluate await_ready(); if false, suspend and call await_suspend(handle); a bool false result un-suspends on the spot; finally await_resume() produces the expression's result. With initial_suspend and final_suspend both suspend_never, the whole coroutine runs eagerly to completion inside the call to run() and its frame is cleaned up automatically — so the entire line executes deterministically on one thread with no concurrency involved."
    },
    {
      "type": "mcq",
      "tag": "await_transform",
      "question": "What is promise_type::await_transform for?",
      "options": [
        "It converts the coroutine's return object into an awaitable that the caller can co_await.",
        "It is invoked once at startup to transform the result of initial_suspend().",
        "If the promise type defines await_transform, then every operand of every co_await in that coroutine's body is first rewritten as promise.await_transform(operand), and the result is what actually gets awaited. This customization point lets a coroutine type adapt foreign awaitables, inject scheduler or cancellation context, and restrict what may be awaited — once any await_transform exists, operand types with no matching overload simply fail to compile.",
        "It rewrites co_yield expressions into co_return statements at the end of the generator."
      ],
      "answer": 2,
      "explain": "await_transform is the promise's interception hook on co_await, complementing yield_value (which plays the same role for co_yield). Task libraries use it to wrap arbitrary awaitables with bookkeeping; generator promises exploit the all-or-nothing lookup rule to ban co_await outright by declaring an unusable overload set. Note the sharp edge: providing even one overload disables 'plain' awaiting of everything else unless you add a pass-through overload."
    },
    {
      "type": "code",
      "tag": "lazy start",
      "question": "Task's initial_suspend returns suspend_always, and main never stores or resumes anything. What is printed?",
      "code": "#include <coroutine>\n#include <iostream>\n\nstruct Task {\n    struct promise_type {\n        Task get_return_object() { return {}; }\n        std::suspend_always initial_suspend() { return {}; }\n        std::suspend_never final_suspend() noexcept { return {}; }\n        void return_void() {}\n        void unhandled_exception() {}\n    };\n};\n\nTask hello() {\n    std::cout << \"body \";\n    co_return;\n}\n\nint main() {\n    hello();               // return object discarded, never resumed\n    std::cout << \"main\";\n}",
      "options": [
        "\"body main\": every coroutine runs eagerly up to its first co_await.",
        "\"main\" only, guaranteed: because initial_suspend() yields suspend_always, hello() creates its coroutine suspended at the initial suspend point — before any body statement — and returns the Task; nothing ever resumes it, so \"body \" is never printed. Since this toy Task also never captures a handle to destroy, the suspended frame is simply leaked.",
        "\"body main\", but only in optimized builds where the coroutine frame is elided.",
        "Undefined behavior: discarding a coroutine's return object is ill-formed."
      ],
      "answer": 1,
      "explain": "initial_suspend is the eager/lazy switch: suspend_never runs the body immediately (as in this quiz's awaiter-order question), suspend_always parks the coroutine at the top until someone resumes it — the model used by generators and most task types. The output is fully deterministic; no thread is involved. The leak highlights why real coroutine types store the coroutine_handle in the return object and destroy() it in their destructor: a suspended coroutine is a heap-allocated resource with no automatic reclamation."
    },
    {
      "type": "mcq",
      "tag": "coroutine frame",
      "question": "Where does a coroutine's state live between suspensions?",
      "options": [
        "In the coroutine frame: the promise object, copies of the parameters, and any locals alive across a suspend point are stored in a compiler-generated activation frame that is typically allocated dynamically (via operator new — customizable by declaring one on the promise type), because the coroutine outlives the call that created it. Compilers may elide the allocation into the enclosing frame (HALO) when the coroutine's lifetime provably does not escape, but that is an optimization you must not rely on.",
        "Always on the caller's stack; avoiding heap allocation is what makes coroutines cheap.",
        "Each co_await allocates a fresh frame and releases the previous one.",
        "References passed as parameters are lifetime-extended so they remain valid until the coroutine is destroyed."
      ],
      "answer": 0,
      "explain": "A suspended coroutine is a first-class object whose lifetime is controlled by its handle, so its state cannot live in a stack frame that unwinds at the first suspension — hence the (elidable) dynamic allocation, sized by the compiler. Parameters are moved/copied into the frame, but a reference parameter stays a reference: awaiting a coroutine after the referred-to argument died is a canonical dangling bug (the coroutine version of the detached-thread capture trap). Promise-level operator new/delete enables pooling and custom allocators."
    },
    {
      "type": "code",
      "tag": "resume after done",
      "question": "numbers() yields 1 and 2. What is the output, and what does line E do?",
      "code": "#include <coroutine>\n#include <iostream>\n\nstruct Gen {\n    struct promise_type {\n        int value = 0;\n        Gen get_return_object() {\n            return Gen{ std::coroutine_handle<promise_type>::from_promise(*this) };\n        }\n        std::suspend_always initial_suspend() { return {}; }\n        std::suspend_always final_suspend() noexcept { return {}; }\n        std::suspend_always yield_value(int v) { value = v; return {}; }\n        void return_void() {}\n        void unhandled_exception() { std::terminate(); }\n    };\n    std::coroutine_handle<promise_type> h;\n    ~Gen() { if (h) { h.destroy(); } }\n};\n\nGen numbers() {\n    co_yield 1;\n    co_yield 2;\n}\n\nint main() {\n    Gen g = numbers();\n    g.h.resume(); std::cout << g.h.promise().value;   // A\n    g.h.resume(); std::cout << g.h.promise().value;   // B\n    g.h.resume();                                     // C\n    std::cout << g.h.done();                          // D\n    g.h.resume();                                     // E\n}",
      "options": [
        "It prints \"1210\" and E restarts the generator from the first co_yield.",
        "It prints \"121\" and E throws std::coroutine_error.",
        "It prints \"12\"; C is already undefined behavior because the generator has no third value.",
        "A prints 1 and B prints 2; C legally resumes the coroutine, which runs off the end (return_void) and parks at its final suspend point, so D prints 1 because done() is now true — output \"121\". E then resumes a coroutine suspended at its final suspend point, which is undefined behavior (in practice frequently a crash); the only valid operations on a done coroutine are done() and destroy()."
      ],
      "answer": 3,
      "explain": "Resuming past the last co_yield is fine — that is how the coroutine reaches completion — and final_suspend() returning suspend_always is what keeps the frame alive so done() and the promise remain inspectable. But resume() has the precondition that the coroutine is suspended at a point other than final suspend; violating it is UB, with no diagnostic required. This is precisely why real generator iterators check done() in operator++ and why ++ on an end iterator of a range is equally off-limits."
    },
    {
      "type": "mcq",
      "tag": "std::generator",
      "question": "Which statement about std::generator is correct?",
      "options": [
        "std::generator was added in C++20 together with the co_yield keyword.",
        "std::generator eagerly runs the coroutine to completion, collecting all values into an internal vector.",
        "std::generator<T> is C++23 (header <generator>): the first standard-library coroutine type. It is a move-only view modeling input_range, whose coroutine body produces elements lazily with co_yield — each step of iteration (e.g., one pass of a range-based for) resumes the coroutine just long enough to produce the next element — and std::ranges::elements_of lets a generator yield all elements of a nested range or generator efficiently.",
        "To use std::generator you must still write your own promise_type with yield_value and get_return_object."
      ],
      "answer": 2,
      "explain": "C++20 shipped the coroutine language machinery but no library types, so everyone hand-rolled generator classes (as earlier questions here do); C++23's std::generator finally standardizes the everyday case, promise and all — you just write a function returning std::generator<T> and co_yield values. Being an input range, it composes with ranges algorithms and views, supports recursive/nested yielding via elements_of, and, like all generators, computes nothing until iterated."
    }
  ]
};

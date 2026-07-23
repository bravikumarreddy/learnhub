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
    }
  ]
};

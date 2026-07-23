/* ===== Professional C++ — Smart Pointers & Memory Mastery ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["procpp-memory"] = {
  title: "Professional C++ — Smart Pointers & Memory Mastery",
  subtitle: "unique_ptr/shared_ptr internals, weak_ptr, aliasing, custom deleters and allocation traps.",
  crumb: "Professional C++",
  questions: [
    {
      "type": "mcq",
      "tag": "make_shared",
      "question": "What is the key memory-layout difference between std::make_shared<T>() and std::shared_ptr<T>(new T)?",
      "options": [
        "make_shared performs a single allocation holding both the control block and the T object; shared_ptr(new T) performs two separate allocations",
        "make_shared allocates on the stack while shared_ptr(new T) allocates on the heap",
        "There is no layout difference; make_shared is only a convenience wrapper that forwards arguments",
        "shared_ptr(new T) embeds the object inside the control block, while make_shared keeps them separate for exception safety"
      ],
      "answer": 0,
      "explain": "make_shared allocates one contiguous block containing the control block (strong/weak counts, deleter machinery) and the T object itself, improving locality and halving allocation cost. shared_ptr(new T) must allocate T first and then a separate control block. This fused layout is also why, with make_shared, the object's raw storage cannot be returned to the allocator while any weak_ptr survives."
    },
    {
      "type": "code",
      "tag": "weak_ptr & storage",
      "question": "What does this program print, and what is true of the allocation made by make_shared at the point of the print?",
      "code": "#include <memory>\n#include <iostream>\n\nint main() {\n    auto sp = std::make_shared<int>(42);\n    std::weak_ptr<int> wp = sp;\n    sp.reset();\n    std::cout << wp.expired() << ' ' << wp.use_count() << '\\n';\n}",
      "options": [
        "Prints \"0 1\"; the weak_ptr keeps the int alive, so it is not destroyed until wp goes away",
        "Prints \"1 1\"; expired() is true but use_count() still counts the weak reference",
        "Prints \"1 0\"; the int has been destroyed, but the fused allocation (control block + object storage) is still held alive by the weak_ptr",
        "Prints \"1 0\"; both the int and its entire allocation were freed the moment sp.reset() ran"
      ],
      "answer": 2,
      "explain": "When the last shared_ptr goes away the object is destroyed (expired() == true, printed as 1) and use_count() returns the strong count, which is 0. However, the control block must survive until the last weak_ptr dies, and because make_shared fuses control block and object storage into one allocation, the (destroyed) int's storage cannot be deallocated until wp is gone. This is the classic make_shared trade-off for large objects with long-lived weak_ptrs."
    },
    {
      "type": "mcq",
      "tag": "aliasing ctor",
      "question": "What does the shared_ptr aliasing constructor, std::shared_ptr<U>(owner, ptr), actually do?",
      "options": [
        "It creates a second, independent control block that manages ptr and deletes it when the count reaches zero",
        "It creates a shared_ptr whose get() returns ptr but which shares ownership of (and keeps alive) whatever owner manages; ptr itself is never deleted by this shared_ptr",
        "It performs a checked downcast of owner to U*, throwing std::bad_cast if ptr is not part of the owned object",
        "It transfers ownership from owner to the new shared_ptr, leaving owner empty"
      ],
      "answer": 1,
      "explain": "The aliasing constructor decouples the stored pointer from the owned object: use_count and destruction follow owner's control block, while get() and operator* refer to ptr. It is designed for handing out shared_ptrs to members or elements of a shared object. Nothing is ever done to ptr on destruction; the owner's deleter runs on the originally owned object."
    },
    {
      "type": "code",
      "tag": "aliasing ctor",
      "question": "This program aliases a shared_ptr to a member of a shared object, then resets the original. What does it print?",
      "code": "#include <memory>\n#include <iostream>\n\nstruct Pair {\n    int a = 1;\n    int b = 2;\n};\n\nint main() {\n    auto p = std::make_shared<Pair>();\n    std::shared_ptr<int> pb(p, &p->b);   // aliasing constructor\n    p.reset();\n    std::cout << *pb << ' ' << pb.use_count() << '\\n';\n}",
      "options": [
        "2 0",
        "Undefined behavior: pb dangles once p.reset() destroys the Pair",
        "2 1",
        "1 1"
      ],
      "answer": 2,
      "explain": "pb shares the Pair's control block, so after p.reset() the strong count is still 1 and the Pair is alive; *pb reads b, which is 2, and use_count() is 1. The Pair is destroyed only when pb also goes away. This is exactly the aliasing constructor's purpose: a member stays valid as long as any alias to it survives."
    },
    {
      "type": "mcq",
      "tag": "deleter storage",
      "question": "Why is the deleter part of unique_ptr's type (unique_ptr<T, D>) but not part of shared_ptr's type (shared_ptr<T>)?",
      "options": [
        "shared_ptr forbids custom deleters entirely, so there is nothing to encode in its type",
        "unique_ptr needs the deleter type only for arrays; for scalars the parameter is ignored",
        "It is a historical accident: shared_ptr predates variadic templates and could not carry a second parameter",
        "unique_ptr stores the deleter inline (often via empty-base optimization) so it stays zero-overhead; shared_ptr type-erases the deleter into its heap-allocated control block, so deleters never affect the pointer's type"
      ],
      "answer": 3,
      "explain": "unique_ptr is meant to cost the same as a raw pointer, so its deleter is a member (an empty stateless deleter adds no size thanks to EBO) and therefore must appear in the type. shared_ptr already pays for a control block, so it stores the deleter there via type erasure. A practical consequence: shared_ptr<T> objects with different deleters are the same type and freely assignable, while unique_ptr<T, D1> and unique_ptr<T, D2> are unrelated types."
    },
    {
      "type": "code",
      "tag": "custom deleter",
      "question": "Two unique_ptrs carry a printing deleter and one is move-assigned onto the other. What is the exact output?",
      "code": "#include <memory>\n#include <cstdio>\n\nstruct D {\n    void operator()(int* p) const { std::printf(\"D(%d) \", *p); delete p; }\n};\n\nint main() {\n    std::unique_ptr<int, D> a(new int(1));\n    std::unique_ptr<int, D> b(new int(2));\n    a = std::move(b);\n    std::printf(\"live(%d) \", *a);\n}",
      "options": [
        "live(2) D(1) D(2)",
        "D(1) live(2) D(2)",
        "D(1) live(2) D(2) D(2)",
        "live(2) D(2) D(1)"
      ],
      "answer": 1,
      "explain": "Move assignment first disposes of a's current resource, so the deleter runs on the int holding 1 (\"D(1)\"), then a takes ownership of 2 and b becomes null. The printf shows \"live(2)\". At scope exit b is destroyed first but is null (a null unique_ptr never invokes its deleter), then a is destroyed, printing \"D(2)\"."
    },
    {
      "type": "mcq",
      "tag": "enable_shared_from_this",
      "question": "In C++17 and later, what happens if you call shared_from_this() on an object that derives from enable_shared_from_this but is NOT currently owned by any shared_ptr (e.g., it was created on the stack or via plain new)?",
      "options": [
        "It returns an empty shared_ptr with use_count() == 0",
        "It is undefined behavior in all standard versions",
        "It throws std::bad_weak_ptr",
        "It creates a brand-new control block that takes ownership of the object"
      ],
      "answer": 2,
      "explain": "enable_shared_from_this works by having the first shared_ptr that owns the object initialize a hidden weak_ptr member. If no shared_ptr ever owned the object, that weak member is empty, and since C++17 shared_from_this() is specified to throw std::bad_weak_ptr (before C++17 it was undefined behavior). It never invents a new control block, which would inevitably cause a double delete."
    },
    {
      "type": "code",
      "tag": "enable_shared_from_this",
      "question": "What does this C++17 program print?",
      "code": "#include <memory>\n#include <iostream>\n\nstruct S : std::enable_shared_from_this<S> {\n    S() {\n        try {\n            auto self = shared_from_this();\n            std::cout << \"ok\\n\";\n        } catch (const std::bad_weak_ptr&) {\n            std::cout << \"bad_weak_ptr\\n\";\n        }\n    }\n};\n\nint main() {\n    auto sp = std::make_shared<S>();\n}",
      "options": [
        "ok",
        "bad_weak_ptr",
        "Nothing; the program crashes with a double delete",
        "It fails to compile because shared_from_this() cannot appear in a constructor"
      ],
      "answer": 1,
      "explain": "The hidden weak_ptr inside enable_shared_from_this is initialized by the owning shared_ptr only after the object's constructor has finished. During the constructor the object is not yet owned, so shared_from_this() throws std::bad_weak_ptr, which the try/catch converts into the printed message. The same trap applies in destructors: never call shared_from_this() from either."
    },
    {
      "type": "mcq",
      "tag": "thread safety",
      "question": "Which statement correctly describes shared_ptr's thread-safety guarantees?",
      "options": [
        "shared_ptr makes the pointed-to object fully thread-safe, since all access goes through the atomic control block",
        "Reference-count updates in the control block are atomic, so different shared_ptr instances pointing to the same object may be copied/destroyed from different threads; but unsynchronized access to the same shared_ptr instance (with at least one writer), or to the pointee, is a data race",
        "shared_ptr offers no thread-safety at all; even copying two distinct shared_ptr instances to one object from two threads is a race",
        "Only make_shared-created shared_ptrs have atomic reference counts; shared_ptr(new T) uses non-atomic counts for speed"
      ],
      "answer": 1,
      "explain": "The guarantee covers exactly one thing: the strong and weak counts in the control block are modified atomically. Thus thread A and thread B can each hold and copy their own shared_ptr to the same object safely. Mutating one specific shared_ptr object from multiple threads (e.g., one thread reset()s it while another copies it) is a race — that needs std::atomic<std::shared_ptr<T>> or a mutex — and the pointee itself gets no protection whatsoever."
    },
    {
      "type": "code",
      "tag": "unique_ptr<T[]>",
      "question": "A unique_ptr to an array of three objects with printing destructors is reset. What is the output?",
      "code": "#include <memory>\n#include <iostream>\n\nstruct T {\n    int v = 0;\n    ~T() { std::cout << v << ' '; }\n};\n\nint main() {\n    auto arr = std::make_unique<T[]>(3);\n    for (int i = 0; i < 3; ++i) arr[i].v = i + 1;\n    arr.reset();\n    std::cout << \"done\";\n}",
      "options": [
        "1 2 3 done",
        "done",
        "The destruction order of array elements is unspecified, so any permutation may appear before \"done\"",
        "3 2 1 done"
      ],
      "answer": 3,
      "explain": "unique_ptr<T[]> uses default_delete<T[]>, which calls delete[], and the language guarantees array elements are destroyed in reverse order of construction. So the destructors print 3, then 2, then 1, before \"done\". The array specialization also provides operator[] and deliberately removes operator* and operator->."
    },
    {
      "type": "mcq",
      "tag": "array trap",
      "question": "What is wrong with std::unique_ptr<int> p(new int[10]); ?",
      "options": [
        "Its destructor will run delete (not delete[]) on memory obtained from new[], which is undefined behavior; std::unique_ptr<int[]> should be used instead",
        "Nothing; unique_ptr detects at runtime that the pointer came from new[] and calls delete[]",
        "It fails to compile because unique_ptr<int> cannot be initialized from a pointer returned by new[]",
        "It compiles but leaks all ten ints, because unique_ptr<int> only releases sizeof(int) bytes"
      ],
      "answer": 0,
      "explain": "unique_ptr<int> uses default_delete<int>, which executes plain delete. Freeing a new[]-allocated array with scalar delete is undefined behavior (and skips element destructors for class types). There is no runtime detection — new[] returns a plain int*, indistinguishable by type — which is exactly why the distinct unique_ptr<int[]> specialization with delete[] exists."
    },
    {
      "type": "code",
      "tag": "weak_ptr::lock",
      "question": "A weak_ptr is locked while its target is alive and again after the owning shared_ptr leaves scope. What does the program print?",
      "code": "#include <memory>\n#include <iostream>\n\nint main() {\n    std::weak_ptr<int> wp;\n    {\n        auto sp = std::make_shared<int>(7);\n        wp = sp;\n        if (auto locked = wp.lock())\n            std::cout << *locked << ' ';\n    }\n    std::cout << (wp.lock() ? \"alive\" : \"gone\");\n}",
      "options": [
        "7 alive",
        "gone",
        "7 gone",
        "Undefined behavior: locking an expired weak_ptr dereferences a dangling pointer"
      ],
      "answer": 2,
      "explain": "Inside the block the int is alive, lock() returns a non-empty shared_ptr, and 7 is printed. After sp leaves scope the strong count hits zero and the int is destroyed; wp's control block survives, and lock() on an expired weak_ptr safely returns an empty shared_ptr (it never dangles), so the conversion to bool is false and \"gone\" is printed."
    },
    {
      "type": "mcq",
      "tag": "expired vs lock",
      "question": "In multithreaded code, why is `if (!wp.expired()) { do_something(*wp.lock()); }` broken, and what is the correct pattern?",
      "options": [
        "expired() acquires the control-block mutex and lock() deadlocks trying to acquire it again; the fix is to call lock() from a separate thread",
        "Between expired() and lock() another thread may release the last shared_ptr, so lock() can return an empty shared_ptr that is then dereferenced; the fix is to call lock() once, store the result, and test it before use",
        "It is fine: expired() and lock() execute as one atomic transaction on the control block",
        "lock() invalidates the weak_ptr, so a second call anywhere later would return null; the fix is to copy the weak_ptr first"
      ],
      "answer": 1,
      "explain": "This is a classic time-of-check/time-of-use race: expired() reports a snapshot of the strong count, which another thread can drop to zero immediately afterwards, making the subsequent lock() return empty and the dereference undefined behavior. lock() itself is the safe primitive — it atomically increments the strong count only if it is still non-zero. The correct idiom is `if (auto sp = wp.lock()) { use(*sp); }`."
    },
    {
      "type": "code",
      "tag": "cyclic references",
      "question": "Two Nodes with printing destructors point at each other through shared_ptr members. What does this program print?",
      "code": "#include <memory>\n#include <iostream>\n\nstruct Node {\n    std::shared_ptr<Node> next;\n    ~Node() { std::cout << \"~Node \"; }\n};\n\nint main() {\n    {\n        auto a = std::make_shared<Node>();\n        auto b = std::make_shared<Node>();\n        a->next = b;\n        b->next = a;\n    }\n    std::cout << \"end\";\n}",
      "options": [
        "~Node ~Node end",
        "~Node end",
        "~Node ~Node ~Node ~Node end",
        "end"
      ],
      "answer": 3,
      "explain": "When a and b leave scope, each Node still has a strong count of 1 because the other Node's `next` member points at it. Neither count can reach zero, so neither destructor runs and both Nodes (and their control blocks) leak — reference counting cannot collect cycles. Only \"end\" is printed."
    },
    {
      "type": "mcq",
      "tag": "breaking cycles",
      "question": "In a parent/child design where a parent holds shared_ptr<Child> and each child needs a reference back to its parent, what is the idiomatic way to avoid a leak?",
      "options": [
        "Store the back-reference as a second shared_ptr but call reset() on it inside the child's destructor",
        "Have both sides use weak_ptr so no control block is created at all",
        "Store the back-reference as std::weak_ptr<Parent> and call lock() when the child needs to use the parent",
        "Replace the parent's shared_ptr<Child> with a raw Child* so only the child keeps a strong reference"
      ],
      "answer": 2,
      "explain": "Ownership should flow in one direction: the parent owns the child strongly, and the child observes the parent weakly. A weak_ptr does not contribute to the strong count, so destroying the last external shared_ptr<Parent> actually destroys the parent, which in turn releases the children. Resetting inside the destructor cannot help — the destructor never runs precisely because the cycle keeps the count above zero."
    },
    {
      "type": "mcq",
      "tag": "out_ptr (C++23)",
      "question": "What problem do C++23's std::out_ptr and std::inout_ptr solve?",
      "options": [
        "They provide non-owning views of a unique_ptr so it can be passed to functions without transferring ownership",
        "They convert between unique_ptr and shared_ptr in place without touching the reference count",
        "They mark a pointer parameter as an output in function signatures purely for documentation and static analysis",
        "They adapt a smart pointer for C-style factory APIs taking T** out-parameters: they hand the API a temporary T**, and on destruction re-seat the smart pointer with the pointer the API wrote (inout_ptr additionally releases the old pointer first)"
      ],
      "answer": 3,
      "explain": "Before C++23 you had to write the dance by hand: call the C API with &raw, then p.reset(raw). std::out_ptr(p) yields a proxy convertible to T** (or void**); when the proxy is destroyed at the end of the full expression, it calls p.reset() with whatever the API stored. inout_ptr is for APIs that both consume the old pointer and produce a new one, so it release()s the smart pointer before the call. Both work with unique_ptr and (with a deleter argument) shared_ptr."
    },
    {
      "type": "code",
      "tag": "get_deleter",
      "question": "std::get_deleter is queried twice on a shared_ptr built with a function-pointer deleter. What does the program print?",
      "code": "#include <memory>\n#include <iostream>\n\nvoid del(int* p) { delete p; }\n\nint main() {\n    std::shared_ptr<int> sp(new int(1), del);\n    auto* d1 = std::get_deleter<void(*)(int*)>(sp);\n    auto* d2 = std::get_deleter<std::default_delete<int>>(sp);\n    std::cout << (d1 != nullptr) << (d2 != nullptr);\n}",
      "options": [
        "11",
        "10",
        "00",
        "01"
      ],
      "answer": 1,
      "explain": "std::get_deleter<D>(sp) peeks inside the control block and returns a pointer to the stored deleter only if the stored deleter's type is exactly D; otherwise it returns nullptr. The deleter here is the function pointer void(*)(int*), so d1 is non-null (prints 1) and the default_delete query fails (prints 0). This runtime type query exists precisely because shared_ptr's deleter is type-erased."
    },
    {
      "type": "code",
      "tag": "double delete",
      "question": "What is the behavior of this program?",
      "code": "#include <memory>\n\nint main() {\n    int* raw = new int(5);\n    std::shared_ptr<int> a(raw);\n    std::shared_ptr<int> b(raw);\n}   // <-- what happens here?",
      "options": [
        "Undefined behavior: a and b each created their own control block, so the int is deleted twice at scope exit",
        "Well-defined: b finds a's existing control block, use_count becomes 2, and the int is deleted exactly once",
        "It fails to compile: shared_ptr's constructor from a raw pointer is explicit and cannot be used twice on the same pointer",
        "Well-defined but leaks: the second shared_ptr silently becomes empty"
      ],
      "answer": 0,
      "explain": "Constructing a shared_ptr from a raw pointer always creates a brand-new control block; there is no global registry mapping addresses to existing control blocks. So a and b independently believe they are the sole owner (each use_count() == 1), and at scope exit each runs delete on the same int — a double delete, which is undefined behavior. The rule: take ownership of a raw pointer exactly once, then only copy the shared_ptr (or use enable_shared_from_this)."
    },
    {
      "type": "code",
      "tag": "placement new",
      "question": "An object is created with placement new in a stack buffer and destroyed explicitly. What is the exact output?",
      "code": "#include <new>\n#include <iostream>\n\nstruct P {\n    P()  { std::cout << \"ctor \"; }\n    ~P() { std::cout << \"dtor \"; }\n};\n\nint main() {\n    alignas(P) unsigned char buf[sizeof(P)];\n    P* p = new (buf) P;      // placement new\n    std::cout << \"use \";\n    p->~P();                 // explicit destructor call\n    std::cout << \"end\";\n}",
      "options": [
        "ctor use end dtor",
        "ctor use dtor end dtor",
        "ctor use dtor end",
        "Undefined behavior, because objects created with placement new must be released with delete"
      ],
      "answer": 2,
      "explain": "Placement new constructs an object in storage you already own — it allocates nothing — so cleanup is split: you must invoke the destructor explicitly (p->~P()), and the storage (here an automatic buffer) is reclaimed by its own rules. Calling delete p would be undefined behavior since the memory never came from operator new. The output follows the source order: ctor, use, dtor, end; buf's destruction at scope exit runs no P destructor because unsigned char has none."
    },
    {
      "type": "mcq",
      "tag": "std::align",
      "question": "Given `void* p = std::align(alignment, size, ptr, space);` — what does std::align do?",
      "options": [
        "It reallocates the buffer at ptr to a new, correctly aligned block of `size` bytes",
        "If the buffer at ptr with `space` bytes can fit `size` bytes at the requested alignment, it advances ptr to the first suitably aligned address, decreases `space` by the number of bytes skipped, and returns the adjusted ptr; otherwise it returns nullptr and changes nothing",
        "It checks alignment only: it returns ptr unchanged if already aligned, or throws std::bad_alloc if not",
        "It rounds `size` up to a multiple of `alignment` and stores the result back through ptr"
      ],
      "answer": 1,
      "explain": "std::align is the standard tool for carving aligned objects out of a raw buffer, e.g., in arena allocators. It mutates both ptr and space in place so you can call it repeatedly to sub-allocate successive objects. On failure (the aligned object would overflow the remaining space) it returns nullptr and leaves ptr/space untouched; it never allocates or moves memory itself."
    },
    {
      "type": "mcq",
      "tag": "PMR",
      "question": "Which statement about std::pmr::monotonic_buffer_resource is correct?",
      "options": [
        "It is thread-safe and intended to be shared across threads without synchronization",
        "It returns each block to its upstream resource as soon as the block is deallocated, minimizing peak memory",
        "It can only serve allocations from the initial buffer passed to its constructor and throws bad_alloc once that buffer is exhausted",
        "Its deallocate() is a no-op: memory is only reclaimed all at once when the resource is destroyed or release() is called, which makes allocation extremely fast but unsuitable for long-lived, high-churn containers"
      ],
      "answer": 3,
      "explain": "monotonic_buffer_resource just bumps a pointer through its current buffer, so allocate() is nearly free and deallocate() deliberately does nothing — everything is released in bulk on destruction or release(). When the initial buffer runs out it fetches more from its upstream resource rather than failing. It is explicitly not thread-safe; the standard's thread-safe pooled option is synchronized_pool_resource."
    },
    {
      "type": "mcq",
      "tag": "polymorphic_allocator",
      "question": "How does std::pmr::polymorphic_allocator let two vectors that use completely different allocation strategies have the same type (std::pmr::vector<int>)?",
      "options": [
        "It moves the allocation strategy out of the type system: the allocator holds a runtime pointer to a std::memory_resource, and allocation is dispatched through that resource's virtual do_allocate/do_deallocate",
        "It uses compile-time if-constexpr branching over every known resource type baked into the allocator",
        "It stores a copy of the entire memory resource by value inside each container",
        "It cannot: pmr::vector<int> instances backed by different resources are actually different types related by inheritance"
      ],
      "answer": 0,
      "explain": "Classic allocators encode the strategy in the container's type (vector<int, MyAlloc> vs vector<int>), which fractures APIs. polymorphic_allocator<T> is a single concrete type that merely wraps a memory_resource*, and memory_resource is an abstract base with virtual do_allocate/do_deallocate/do_is_equal. The strategy is chosen at runtime by which resource you pass in, at the cost of a virtual call per allocation. Note pmr containers also propagate the resource to nested pmr elements via uses-allocator construction."
    },
    {
      "type": "code",
      "tag": "nothrow new",
      "question": "A type whose constructor throws is created with new (std::nothrow). What does the program print?",
      "code": "#include <new>\n#include <iostream>\n\nstruct Boom {\n    Boom() { throw 42; }\n};\n\nint main() {\n    try {\n        Boom* p = new (std::nothrow) Boom;\n        std::cout << (p ? \"ptr\" : \"null\");\n    } catch (int) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "null",
        "ptr",
        "caught",
        "std::terminate is called because nothrow new must not let exceptions escape"
      ],
      "answer": 2,
      "explain": "nothrow only changes the allocation function: if operator new(size_t, nothrow_t) cannot get memory it returns nullptr instead of throwing bad_alloc. Here allocation succeeds, then Boom's constructor throws 42; a constructor exception always propagates regardless of the new form used. The runtime automatically calls the matching nothrow operator delete to free the raw memory before the exception leaves the new-expression, so \"caught\" is printed with no leak."
    },
    {
      "type": "mcq",
      "tag": "incomplete types",
      "question": "In the pimpl idiom — `class Widget { std::unique_ptr<Impl> m_impl; ... };` with Impl only forward-declared in the header — why must Widget's destructor be declared in the header but defined (even as `= default`) in the .cpp file where Impl is complete?",
      "options": [
        "unique_ptr cannot ever hold an incomplete type, so the destructor placement is irrelevant; only shared_ptr supports pimpl",
        "The unique_ptr destructor instantiates default_delete<Impl>::operator(), which statically rejects deleting an incomplete type; placing ~Widget's definition where Impl is complete defers that instantiation to a point where delete is safe",
        "The compiler requires all special member functions of a class template member to appear in the same translation unit as the class definition",
        "It is purely a style guideline to keep headers small; defining ~Widget in the header would compile and behave correctly"
      ],
      "answer": 1,
      "explain": "unique_ptr<Impl> itself may be declared with Impl incomplete; completeness is required only where the deleter is invoked — i.e., wherever ~unique_ptr is instantiated. If ~Widget were implicitly generated (or defaulted) in the header, every including TU would instantiate default_delete<Impl> against an incomplete Impl, and default_delete's static_assert on sizeof rejects it (guarding against the UB of deleting an incomplete type). shared_ptr<Impl> avoids this because it captures a correctly typed deleter at construction, where Impl is complete."
    },
    {
      "type": "code",
      "tag": "null + deleter",
      "question": "One shared_ptr is default-constructed; another is given a null pointer plus a printing deleter. What is the exact output?",
      "code": "#include <memory>\n#include <iostream>\n\nint main() {\n    std::shared_ptr<int> a;                       // default-constructed\n    std::shared_ptr<int> b(static_cast<int*>(nullptr),\n                           [](int*) { std::cout << \"deleter \"; });\n    std::cout << a.use_count() << b.use_count() << ' ';\n}",
      "options": [
        "00",
        "01",
        "11 deleter",
        "01 deleter"
      ],
      "answer": 3,
      "explain": "A default-constructed shared_ptr has no control block at all, so a.use_count() is 0. But b was given a pointer-plus-deleter, which always creates a control block that owns that pointer — even a null one — so b.use_count() is 1 and prints \"01 \". When b is destroyed the strong count reaches zero and the stored deleter is invoked with nullptr, printing \"deleter \". Owning null is a real state, distinct from being empty, and custom deleters must therefore tolerate null arguments."
    },
    {
      "type": "code",
      "tag": "release()",
      "question": "A unique_ptr is release()d and the raw pointer deleted manually. What is the exact output?",
      "code": "#include <memory>\n#include <iostream>\nstruct R { ~R() { std::cout << \"dtor \"; } };\nint main() {\n    auto p = std::make_unique<R>();\n    R* raw = p.release();\n    std::cout << (p ? \"owned \" : \"empty \");\n    delete raw;\n    std::cout << \"end\";\n}",
      "options": [
        "owned dtor end",
        "dtor empty end",
        "empty dtor end",
        "empty end — the object leaks because release() detaches the deleter along with the pointer"
      ],
      "answer": 2,
      "explain": "release() relinquishes ownership and returns the raw pointer WITHOUT destroying the object, leaving the unique_ptr null — so \"empty \" prints first. Responsibility for the int transfers to the caller, and the manual delete prints \"dtor \". Forgetting that delete is the classic release() leak; if you just want to destroy the object, reset() is the right call."
    },
    {
      "type": "mcq",
      "tag": "release/reset/swap",
      "question": "Which statement correctly distinguishes unique_ptr's release(), reset(), and swap()?",
      "options": [
        "release() gives up ownership and returns the raw pointer without destroying the object; reset() destroys the currently owned object (if any) and optionally adopts a new pointer; swap() exchanges both the stored pointers and the deleters of two unique_ptrs",
        "release() destroys the owned object and returns nullptr; reset() only nulls the internal pointer without deleting; swap() exchanges the pointers but deliberately leaves each deleter in place",
        "release() and reset() are synonyms that both destroy the object; swap() is only available on the unique_ptr<T[]> array specialization",
        "release() runs the deleter and returns the dead pointer for post-mortem inspection; reset() transfers ownership into a returned unique_ptr; swap() requires both deleters to compare equal"
      ],
      "answer": 0,
      "explain": "release() is the \"escape hatch\" that hands the raw pointer back to manual management — nothing is destroyed. reset(q) first stores q, then invokes the deleter on the old pointer, covering both \"destroy now\" (reset()) and \"replace\" (reset(q)) uses. swap() must exchange deleters too, since unique_ptr owns its deleter as part of its state."
    },
    {
      "type": "code",
      "tag": "const unique_ptr",
      "question": "What happens when this is compiled and run?",
      "code": "#include <memory>\n\nint main() {\n    const std::unique_ptr<int> p(new int(1));\n    *p = 5;                 // mutate the pointee\n    p.reset(new int(2));    // reseat the pointer\n}",
      "options": [
        "Fails to compile at *p = 5: a const unique_ptr propagates its constness to the pointee",
        "Fails to compile at p.reset(new int(2)): reset() is a non-const member function — const unique_ptr<int> behaves like int* const, so the pointer cannot be reseated even though the pointee stays mutable",
        "Prints 2",
        "Prints 5"
      ],
      "answer": 1,
      "explain": "A const unique_ptr<int> mirrors int* const, not const int*: operator* returns a mutable int&, so *p = 5 is fine, but every mutating member (reset, release, operator=) is non-const and rejected on a const object. Declaring members as const unique_ptr is actually a useful idiom for \"set once at construction, never reseated\". For deep const propagation to the pointee, std::experimental::propagate_const-style wrappers are needed."
    },
    {
      "type": "mcq",
      "tag": "API design",
      "question": "According to widely accepted API-design guidance (echoed in Professional C++), how should a function that merely USES a Widget — never storing or sharing ownership — receive it, when the caller happens to hold a shared_ptr<Widget>?",
      "options": [
        "As shared_ptr<Widget> by value, so the function keeps the object alive even if another thread resets the caller's pointer",
        "As const shared_ptr<Widget>&, which documents that the function does not take ownership",
        "As weak_ptr<Widget>, which the function must lock() before each use",
        "As Widget& (or Widget* if \"no widget\" is meaningful): ownership vocabulary types belong in a signature only when the function actually participates in ownership transfer or sharing"
      ],
      "answer": 3,
      "explain": "Smart-pointer parameters make claims about ownership. A pure observer should take a reference or raw pointer, which also keeps the function callable by clients holding unique_ptr, stack objects, or members. Reserve unique_ptr-by-value for sinks, shared_ptr-by-value for functions that genuinely keep a share, and smart-pointer references for functions that may reseat the pointer itself."
    },
    {
      "type": "code",
      "tag": "sink parameter",
      "question": "A unique_ptr is passed by value into a sink function. What is the exact output?",
      "code": "#include <memory>\n#include <iostream>\n\nvoid consume(std::unique_ptr<int> p) {\n    std::cout << \"consumed\" << *p << ' ';\n}\n\nint main() {\n    auto p = std::make_unique<int>(9);\n    consume(std::move(p));\n    std::cout << (p ? \"alive\" : \"null\");\n}",
      "options": [
        "consumed9 null",
        "consumed9 alive — the caller's unique_ptr still points at the int until main returns",
        "Fails to compile: unique_ptr cannot be passed to a function by value",
        "Undefined behavior: the int is destroyed twice, once inside consume and once in main"
      ],
      "answer": 0,
      "explain": "A by-value unique_ptr parameter is the canonical sink signature: the caller must hand over ownership explicitly with std::move, after which the parameter owns the int and destroys it when consume returns. A moved-from unique_ptr is guaranteed to be null (not merely \"valid but unspecified\"), so the final comparison prints \"null\". There is no double delete because main's p no longer owns anything."
    },
    {
      "type": "mcq",
      "tag": "implicit move",
      "question": "A factory function ends with \"std::unique_ptr<Widget> w = ...; return w;\". Why does this compile even though unique_ptr has no copy constructor — and why is writing \"return std::move(w);\" mildly discouraged?",
      "options": [
        "The compiler always elides the return entirely, so no copy or move is ever considered; std::move is discouraged purely as a style matter",
        "unique_ptr has a hidden copy constructor that is accessible only inside return statements",
        "In a return statement, a named local variable is treated as an rvalue — overload resolution tries the move constructor first — so w is moved out automatically; an explicit std::move(w) is redundant and, because the operand is no longer just the name of a local, it can disable NRVO",
        "It only compiles since C++23 introduced simplified implicit-move rules; in C++20 the std::move was mandatory"
      ],
      "answer": 2,
      "explain": "Since C++11 the \"implicit move on return\" rule treats a returned local as an rvalue, so move-only types flow out of functions naturally; C++20/23 merely broadened the rule (e.g., to more reference cases). NRVO applies only when the return operand is the plain name of a local object, so wrapping it in std::move both adds nothing and can pessimize by forcing an actual move where the object might have been constructed in place."
    },
    {
      "type": "code",
      "tag": "factory upcast",
      "question": "This factory returns a local unique_ptr<Derived> as unique_ptr<Base> without std::move. What happens?",
      "code": "#include <memory>\n#include <iostream>\nstruct Base { virtual ~Base() { std::cout << \"~B \"; } };\nstruct Derived : Base { ~Derived() override { std::cout << \"~D \"; } };\nstd::unique_ptr<Base> make() {\n    auto d = std::make_unique<Derived>();\n    return d;   // note: no std::move\n}\nint main() {\n    auto p = make();\n    std::cout << \"got \";\n}",
      "options": [
        "Fails to compile: returning d requires std::move because unique_ptr is non-copyable",
        "Prints \"got ~D ~B \": the return implicitly moves d through unique_ptr's converting constructor (unique_ptr<Derived> to unique_ptr<Base>), and Base's virtual destructor makes deletion through the Base pointer run ~Derived first",
        "Prints \"got ~B \": deleting through unique_ptr<Base> only destroys the Base subobject",
        "Fails to compile: unique_ptr<Derived> is a completely unrelated type to unique_ptr<Base>"
      ],
      "answer": 1,
      "explain": "Even when the return type differs from the local's type, the returned local is still treated as an rvalue, so unique_ptr's converting move constructor (enabled because Derived* converts to Base*) is used. default_delete<Base> then executes \"delete basePtr\", which is only correct because ~Base is virtual — without it, this would be undefined behavior. Destructors then run ~D before ~B as always."
    },
    {
      "type": "code",
      "tag": "vector<unique_ptr>",
      "question": "What happens when this is compiled?",
      "code": "#include <memory>\n#include <vector>\nint main() {\n    std::vector<std::unique_ptr<int>> v;\n    auto p = std::make_unique<int>(1);\n    v.push_back(p);\n    v.push_back(std::make_unique<int>(2));\n}",
      "options": [
        "Compiles; the vector ends up holding copies of both ints",
        "Compiles; push_back(p) silently moves from p, leaving it null",
        "Fails to compile at the second push_back: a temporary unique_ptr cannot bind to push_back",
        "Fails to compile at v.push_back(p): with an lvalue argument, push_back needs unique_ptr's deleted copy constructor; the fix is v.push_back(std::move(p)). The second push_back is fine because its argument is a prvalue"
      ],
      "answer": 3,
      "explain": "vector<unique_ptr<T>> is perfectly legal, but every operation that would copy an element is ill-formed. push_back(p) selects the const-lvalue-reference overload, which must copy-construct — and unique_ptr's copy constructor is deleted, so compilation fails with the infamous \"call to deleted constructor\" error. Passing std::move(p) or a temporary selects the rvalue overload, which move-constructs the element into the vector."
    },
    {
      "type": "mcq",
      "tag": "move-only containers",
      "question": "Given std::vector<std::unique_ptr<Shape>> a; populated with elements, which statement is true?",
      "options": [
        "\"auto b = a;\" fails to compile because copying the vector requires copying each element; \"auto b = std::move(a);\" compiles and merely transfers the heap buffer; producing a genuine duplicate requires an explicit loop invoking something like clone() on each element",
        "\"auto b = a;\" compiles and performs a deep copy by asking each unique_ptr to clone its pointee",
        "\"auto b = std::move(a);\" also fails to compile, because moving a vector must move-construct every element individually, which containers forbid",
        "Neither compiles; unique_ptr elements can only be stored in containers when wrapped in shared_ptr"
      ],
      "answer": 0,
      "explain": "A container of move-only elements is itself movable but not copyable: vector's copy constructor is instantiated only when used, and using it triggers the deleted unique_ptr copy. Moving the vector is cheap — it steals the buffer wholesale and touches no elements. Since C++ has no universal virtual clone, deep-copying a polymorphic collection is your job, typically via a clone() virtual on Shape."
    },
    {
      "type": "code",
      "tag": "static_pointer_cast",
      "question": "A shared_ptr<B> is downcast with static_pointer_cast. What does this program print?",
      "code": "#include <memory>\n#include <iostream>\nstruct B { virtual ~B() = default; };\nstruct D : B { int v = 5; };\nint main() {\n    std::shared_ptr<B> b = std::make_shared<D>();\n    auto d = std::static_pointer_cast<D>(b);\n    std::cout << d->v << ' ' << b.use_count();\n}",
      "options": [
        "5 1",
        "Undefined behavior: downcasting a shared_ptr without dynamic_cast is never allowed",
        "5 2",
        "Fails to compile: static_pointer_cast cannot convert shared_ptr<B> to shared_ptr<D>"
      ],
      "answer": 2,
      "explain": "static_pointer_cast applies static_cast to the stored pointer but makes the result SHARE the source's control block, so after the cast use_count() is 2. The downcast is valid here because the object really is a D (same rule as raw static_cast: fine when the dynamic type is known, UB when wrong). Never build a shared_ptr from static_cast<D*>(b.get()) instead — that mints a second control block and a double delete."
    },
    {
      "type": "code",
      "tag": "dynamic_pointer_cast",
      "question": "The dynamic_pointer_cast here targets the wrong derived type. What is printed?",
      "code": "#include <memory>\n#include <iostream>\nstruct B { virtual ~B() = default; };\nstruct D1 : B {};\nstruct D2 : B {};\nint main() {\n    std::shared_ptr<B> b = std::make_shared<D1>();\n    auto d = std::dynamic_pointer_cast<D2>(b);\n    std::cout << (d ? \"cast \" : \"null \") << b.use_count();\n}",
      "options": [
        "cast 2",
        "null 1 — a failed dynamic_pointer_cast returns an EMPTY shared_ptr and leaves the source (and its reference count) untouched",
        "null 2 — the failed cast still shares ownership with b",
        "It throws std::bad_cast, mirroring dynamic_cast on references"
      ],
      "answer": 1,
      "explain": "dynamic_pointer_cast performs a runtime-checked dynamic_cast on the stored pointer. On success the result shares the control block (count would become 2); on failure it returns an empty shared_ptr that owns nothing, so b remains sole owner with use_count() == 1. The throwing behavior belongs to dynamic_cast on references, not pointers — the pointer form, and this wrapper, signal failure with null/empty."
    },
    {
      "type": "mcq",
      "tag": "pointer casts",
      "question": "Which statement about std::static_pointer_cast, dynamic_pointer_cast, const_pointer_cast, and reinterpret_pointer_cast is correct?",
      "options": [
        "Each allocates a fresh control block for the result, so the source and the cast pointer keep independent reference counts",
        "dynamic_pointer_cast throws std::bad_cast when the downcast fails, exactly like dynamic_cast on a reference",
        "They are documentation-only aliases: writing shared_ptr<D>(static_cast<D*>(b.get())) is equivalent and equally safe",
        "Each returns a shared_ptr that shares the SAME control block as the source (so use_count rises), with dynamic_pointer_cast yielding an empty shared_ptr on failure — unlike wrapping a raw cast of get() in a brand-new shared_ptr, which creates a second control block and ends in a double delete"
      ],
      "answer": 3,
      "explain": "The four *_pointer_cast functions exist precisely so that casting never disturbs ownership: internally they use the aliasing machinery to pair the casted pointer with the original control block. The tempting manual alternative — shared_ptr<D>(static_cast<D*>(b.get())) — compiles cleanly and then deletes the object twice. reinterpret_pointer_cast (C++17) completes the family for bit-level reinterpretation cases."
    },
    {
      "type": "code",
      "tag": "const_pointer_cast",
      "question": "A shared_ptr<const int> is stripped of const and written through. What does this program print?",
      "code": "#include <memory>\n#include <iostream>\nint main() {\n    std::shared_ptr<const int> c = std::make_shared<int>(10);\n    auto m = std::const_pointer_cast<int>(c);\n    *m += 5;\n    std::cout << *c << ' ' << c.use_count();\n}",
      "options": [
        "15 2",
        "Fails to compile: const cannot be cast away from a shared_ptr<const int>",
        "10 2 — the cast produces a copy of the int, so the original is unchanged",
        "Undefined behavior: writing through the result of const_pointer_cast is always undefined"
      ],
      "answer": 0,
      "explain": "const_pointer_cast applies const_cast to the stored pointer while sharing the same control block (use_count becomes 2). Writing through the result is well-defined here because the underlying object was created non-const (make_shared<int>); only modifying an object that is itself const would be UB. The write is visible through c, so it prints 15, then the shared count 2."
    },
    {
      "type": "code",
      "tag": "shared_ptr<void>",
      "question": "An S is stored in a shared_ptr<void> and then reset. What is the output?",
      "code": "#include <memory>\n#include <iostream>\nstruct S { ~S() { std::cout << \"~S \"; } };\nint main() {\n    std::shared_ptr<void> v = std::make_shared<S>();\n    v.reset();\n    std::cout << \"end\";\n}",
      "options": [
        "end — the destructor is skipped because void has no destructor to call",
        "Undefined behavior: this is equivalent to delete on a void pointer",
        "~S end",
        "Fails to compile: shared_ptr<void> cannot take ownership of an S"
      ],
      "answer": 2,
      "explain": "shared_ptr type-erases destruction at construction time: make_shared<S>() bakes machinery that destroys an S into the control block, and converting to shared_ptr<void> changes only the stored pointer's static type. When the count hits zero the control block runs the original, correctly typed destruction — so ~S fires, unlike raw \"delete (void*)p\", which is UB. This makes shared_ptr<void> a safe generic handle for heterogeneous resources."
    },
    {
      "type": "mcq",
      "tag": "type erasure",
      "question": "Why does destroying the last shared_ptr<void> that owns a Widget correctly run ~Widget, when \"delete static_cast<void*>(p)\" would be undefined behavior?",
      "options": [
        "Because shared_ptr<void> requires Widget to have a virtual destructor and dispatches through the vtable",
        "Because the deleter is fixed at CONSTRUCTION, while the static type is still Widget*: shared_ptr<Widget> stores a correctly typed destruction routine in its control block, and later conversion to shared_ptr<void> changes only the stored pointer's type, never the deleter",
        "It doesn't: the memory is freed but the destructor is silently skipped, exactly like delete on void*",
        "Because shared_ptr records typeid(Widget) and performs a runtime destructor lookup through RTTI"
      ],
      "answer": 1,
      "explain": "The control block is created by the constructor that first captures the raw pointer, at which point the full static type is known, and the deleter it stores is permanently typed for that. Conversions between shared_ptr<T> and shared_ptr<void> (or shared_ptr<Base>) never touch the control block. The same mechanism is why shared_ptr<Base> can delete a Derived correctly even WITHOUT a virtual destructor — a property unique_ptr<Base> does not share."
    },
    {
      "type": "code",
      "tag": "owner equivalence",
      "question": "Two aliasing shared_ptrs point at different members of the same owned object. What does this print?",
      "code": "#include <memory>\n#include <iostream>\n\nstruct Pair { int a = 1; int b = 2; };\n\nint main() {\n    auto p = std::make_shared<Pair>();\n    std::shared_ptr<int> pa(p, &p->a);\n    std::shared_ptr<int> pb(p, &p->b);\n    std::cout << (pa == pb)\n              << (pa.owner_before(pb) || pb.owner_before(pa));\n}",
      "options": [
        "11",
        "10",
        "01",
        "00"
      ],
      "answer": 3,
      "explain": "operator== on shared_ptr compares the STORED pointers — &p->a and &p->b differ, so the first output is 0. owner_before compares by control block instead: both aliases share p's block, so neither orders before the other and the || of both directions is also 0, meaning they are \"owner-equivalent\". This is exactly the distinction between value-based and owner-based comparison."
    },
    {
      "type": "mcq",
      "tag": "owner_before",
      "question": "What are shared_ptr::owner_before and std::owner_less for?",
      "options": [
        "They order smart pointers by CONTROL BLOCK rather than by stored pointer value, providing the strict weak ordering needed to key associative containers — especially with weak_ptr, which cannot be dereferenced or safely compared by pointee — and under it two aliases of one owner compare equivalent even when get() differs",
        "They report which of two shared_ptrs was constructed first, mainly as a debugging aid for ownership order",
        "They compare use counts so containers can keep the most-shared pointers first",
        "owner_before is simply the operator< that std::set<shared_ptr<T>> uses by default"
      ],
      "answer": 0,
      "explain": "A weak_ptr has no reliable value to sort by: it may expire at any moment, and lock()-then-compare is racy. Owner-based ordering is stable for the life of the control block, so std::map<std::weak_ptr<T>, V, std::owner_less<std::weak_ptr<T>>> works safely. Default comparisons on shared_ptr use the stored pointer instead, which treats aliases of the same owner as different keys."
    },
    {
      "type": "code",
      "tag": "weak use_count",
      "question": "A weak_ptr watches an int whose shared_ptr owners disappear one by one. What does this program print?",
      "code": "#include <memory>\n#include <iostream>\n\nint main() {\n    auto a = std::make_shared<int>(5);\n    auto b = a;\n    std::weak_ptr<int> w = a;\n    std::cout << w.use_count() << ' ';\n    b.reset();\n    std::cout << w.use_count() << ' ';\n    a.reset();\n    std::cout << w.use_count();\n}",
      "options": [
        "2 2 1",
        "3 2 1",
        "2 1 0",
        "1 1 0"
      ],
      "answer": 2,
      "explain": "weak_ptr::use_count() reports the number of shared_ptr owners — the weak_ptr itself is never counted. With a and b both owning, it prints 2; after b.reset() only a remains (1); after a.reset() the object is gone and the count is 0, at which point w is expired. The weak reference keeps only the control block alive, never the object."
    },
    {
      "type": "mcq",
      "tag": "use_count caveats",
      "question": "Which is true of weak_ptr::use_count()?",
      "options": [
        "It returns the number of weak_ptrs currently attached to the control block",
        "It returns the current number of shared_ptr owners of the object, 0 once expired; weak references are never included, and in concurrent code the returned value is only a snapshot that may already be stale when you read it",
        "It returns the sum of the strong and weak counts stored in the control block",
        "Calling it on an expired weak_ptr is undefined behavior; expired() must be checked first"
      ],
      "answer": 1,
      "explain": "use_count() mirrors the strong count only; there is deliberately no standard API exposing the weak count. Like shared_ptr::use_count(), the value is advisory in multithreaded programs — another thread can change it immediately — so it must never gate a dereference; that is what lock() is for. On an expired or empty weak_ptr it safely returns 0."
    },
    {
      "type": "code",
      "tag": "array value-init",
      "question": "An int array is created with make_unique and read immediately. What does this program print?",
      "code": "#include <memory>\n#include <iostream>\n\nint main() {\n    auto arr = std::make_unique<int[]>(3);\n    std::cout << arr[0] << arr[1] << arr[2];\n}",
      "options": [
        "000 — make_unique<T[]> VALUE-initializes every element, so the ints are zeroed",
        "Unspecified digits: the elements are default-initialized, like new int[3]",
        "Undefined behavior from reading uninitialized ints",
        "Fails to compile: make_unique cannot create arrays; only make_shared can"
      ],
      "answer": 0,
      "explain": "make_unique<T[]>(n) is specified as new T[n]() — note the parentheses — which value-initializes each element, guaranteeing zeros for arithmetic types. Plain new int[3] (no parentheses) would default-initialize, leaving indeterminate values. When the zeroing cost matters and the buffer is about to be overwritten, C++20's make_unique_for_overwrite<T[]>(n) provides the default-initializing variant."
    },
    {
      "type": "mcq",
      "tag": "for_overwrite",
      "question": "What is the difference between make_unique<int[]>(256) and make_unique_for_overwrite<int[]>(256) (C++20)?",
      "options": [
        "They are identical; the _for_overwrite suffix is just the C++20 naming convention",
        "make_unique default-initializes (indeterminate ints) while _for_overwrite value-initializes to zero",
        "make_unique_for_overwrite works only for scalar types, never for arrays",
        "make_unique VALUE-initializes the elements (ints become 0), while make_unique_for_overwrite DEFAULT-initializes them (ints are indeterminate), skipping the zero-fill for buffers that are about to be completely overwritten anyway"
      ],
      "answer": 3,
      "explain": "For a large I/O or scratch buffer, zeroing 256 ints only to immediately overwrite them is wasted work; make_unique_for_overwrite exists exactly for that case, mapping to new int[256] without parentheses. Reading an element before writing it is then UB, so it is strictly an optimization for overwrite-first patterns. Both scalar and array forms exist, and shared_ptr gained the parallel make_shared_for_overwrite."
    },
    {
      "type": "code",
      "tag": "allocate_shared",
      "question": "allocate_shared is given a printing allocator. What is the exact output?",
      "code": "#include <memory>\n#include <iostream>\n\ntemplate <class T>\nstruct PrintAlloc {\n    using value_type = T;\n    PrintAlloc() = default;\n    template <class U> PrintAlloc(const PrintAlloc<U>&) {}\n    T* allocate(std::size_t n) {\n        std::cout << \"alloc \";\n        return static_cast<T*>(::operator new(n * sizeof(T)));\n    }\n    void deallocate(T* p, std::size_t) {\n        std::cout << \"free \";\n        ::operator delete(p);\n    }\n};\n\nint main() {\n    {\n        auto sp = std::allocate_shared<int>(PrintAlloc<int>{}, 3);\n        std::cout << *sp << ' ';\n    }\n    std::cout << \"end\";\n}",
      "options": [
        "alloc alloc 3 free free end — the object and the control block are two separate allocations",
        "alloc 3 end — the block is freed through global operator delete, not the allocator",
        "alloc 3 free end — ONE fused allocation (control block + S) is obtained from a rebound copy of the allocator, and the same allocator later returns it",
        "Fails to compile: allocate_shared requires the allocator to provide construct() and destroy()"
      ],
      "answer": 2,
      "explain": "allocate_shared is make_shared with the memory source swapped out: it still performs the single fused allocation, but requests it from a rebound copy of your allocator and stores that allocator in the control block. When the last weak reference disappears, deallocation goes back through the stored allocator — global new/delete are never involved. A minimal allocator (value_type, allocate, deallocate, rebinding copy ctor) suffices because allocator_traits fills in the rest."
    },
    {
      "type": "mcq",
      "tag": "custom allocation",
      "question": "What does std::allocate_shared<T>(alloc, args...) do differently from std::make_shared<T>(args...)?",
      "options": [
        "It allocates the T object with alloc, but the control block still comes from global operator new",
        "It performs the same single fused allocation as make_shared, but obtains the memory from a rebound copy of alloc and stores that allocator in the control block so the very same allocator deallocates it later; global operator new is never called",
        "It exists to attach a custom deleter, which make_shared cannot accept",
        "It makes two allocations — one from alloc for T and one from a control-block allocator — trading speed for flexibility"
      ],
      "answer": 1,
      "explain": "The allocator replaces the memory source for the whole fused block, which is why the control block must remember it (type-erased, like a deleter) for symmetric deallocation. Note that allocate_shared takes no deleter — destruction semantics are fixed — while the shared_ptr(ptr, deleter, alloc) constructor is the variant that combines a custom deleter with an allocator for the (separate) control block."
    },
    {
      "type": "mcq",
      "tag": "atomic shared_ptr",
      "question": "Two threads must concurrently read and reseat ONE global shared_ptr<Config> instance (e.g., hot-reloaded configuration). What is the recommended C++20 tool?",
      "options": [
        "Nothing extra: shared_ptr's atomic reference count already makes concurrent access to one instance safe",
        "The std::atomic_load(&g) / std::atomic_store(&g, sp) free functions — the modern replacement for std::atomic<std::shared_ptr>",
        "std::atomic<std::shared_ptr<Config>>: C++20 specializes std::atomic for shared_ptr and weak_ptr, while the old atomic_load/atomic_store free functions on plain shared_ptr are deprecated in C++20 — they were error-prone because one forgotten call site silently became a data race",
        "A weak_ptr<Config> global, because all weak_ptr operations are guaranteed lock-free"
      ],
      "answer": 2,
      "explain": "The control block's atomic counters protect DIFFERENT shared_ptr instances that point to one object; mutating one shared_ptr object from two threads is a plain data race on its pointer members. The C++11 stopgap was free functions taking shared_ptr*, but nothing stopped ordinary unsynchronized access to the same variable elsewhere. std::atomic<std::shared_ptr<T>> makes the type system enforce it (though implementations are typically lock-based, not lock-free)."
    },
    {
      "type": "code",
      "tag": "deleter size",
      "question": "On mainstream implementations (libc++, libstdc++, MSVC), what does this program print?",
      "code": "#include <memory>\n#include <iostream>\n\nint main() {\n    int extra = 0;\n    auto d1 = [](int* p) { delete p; };\n    auto d2 = [extra](int* p) { delete p; };\n    std::unique_ptr<int, decltype(d1)> a(new int(1), d1);\n    std::unique_ptr<int, decltype(d2)> b(new int(2), d2);\n    std::cout << (sizeof(a) == sizeof(int*))\n              << (sizeof(b) > sizeof(int*));\n}",
      "options": [
        "00",
        "10",
        "01",
        "11"
      ],
      "answer": 3,
      "explain": "A captureless lambda is an empty class, so the deleter contributes no storage (empty-base/compressed-pair optimization) and a stays raw-pointer-sized: first output 1. The lambda capturing an int must physically store that int inside b alongside the pointer, so sizeof(b) exceeds sizeof(int*): second output 1. The standard does not formally mandate the EBO here, but every major implementation performs it — and stateful deleters always cost real space."
    },
    {
      "type": "mcq",
      "tag": "EBO",
      "question": "Why does sizeof(std::unique_ptr<int>) equal sizeof(int*) on mainstream implementations, even though unique_ptr also stores a deleter?",
      "options": [
        "default_delete<int> is an empty class, and implementations store pointer and deleter in a compressed pair applying the Empty Base Optimization, so the stateless deleter occupies zero bytes; a function-pointer or capturing-lambda deleter genuinely enlarges the object",
        "The deleter is kept in a global side table indexed by the pointer value, so it never occupies space in the unique_ptr",
        "The C++ standard mandates sizeof(unique_ptr<T, D>) == sizeof(T*) for every deleter type D",
        "unique_ptr heap-allocates its deleter next to the managed object, similar to shared_ptr's control block"
      ],
      "answer": 0,
      "explain": "The zero-overhead claim for unique_ptr rests on the deleter being an empty class: EBO lets a base subobject of empty type share an address, so a compressed pair of (T*, empty D) is just a pointer. The standard encourages but does not strictly require this layout; in practice libstdc++ (std::tuple with EBO), libc++, and MSVC all deliver it. This is also the practical argument for struct-with-operator() deleters over function pointers."
    },
    {
      "type": "code",
      "tag": "deleter identity",
      "question": "A shared_ptr with a class-type deleter is copied, and get_deleter is called on both. What is printed?",
      "code": "#include <memory>\n#include <iostream>\n\nstruct D {\n    void operator()(int* p) const { delete p; }\n};\n\nint main() {\n    std::shared_ptr<int> a(new int(1), D{});\n    std::shared_ptr<int> b = a;\n    D* da = std::get_deleter<D>(a);\n    D* db = std::get_deleter<D>(b);\n    std::cout << (da == db) << (da != nullptr);\n}",
      "options": [
        "01 — each shared_ptr copy carries its own private copy of D",
        "11 — copying a shared_ptr copies nothing deleter-related; both copies see the single D instance stored in the shared control block",
        "00 — get_deleter only works for function-pointer deleters",
        "Fails to compile: get_deleter cannot be used on a copied shared_ptr"
      ],
      "answer": 1,
      "explain": "The deleter lives exactly once, inside the control block created when a took ownership; b = a merely bumps the reference count. get_deleter<D> returns a pointer to that single stored instance for both a and b, so the addresses compare equal (1) and are non-null (1). Consequence: a stateful deleter's state is shared by all copies — mutating it through one shared_ptr affects the destruction seen by all."
    },
    {
      "type": "mcq",
      "tag": "deleter semantics",
      "question": "When smart pointers are moved or copied, what happens to their deleters?",
      "options": [
        "Copying a shared_ptr copies the deleter into the new instance; moving a unique_ptr leaves the deleter behind in the source",
        "Deleters are reference-counted independently of the objects for both smart pointer types",
        "Moving a unique_ptr moves (or copies) the deleter along with the pointer — and with unique_ptr<T, D&> the deleter is only referenced, not owned; copying a shared_ptr touches no deleter at all, since every copy points at the single deleter instance inside the shared control block",
        "Both smart pointers require deleters to be trivially copyable so they can be memcpy-ed with the pointer"
      ],
      "answer": 2,
      "explain": "unique_ptr physically contains its deleter, so ownership transfer must transfer the deleter too — the deleter type must be move-constructible (or be a reference type, in which case only the reference is copied and the referenced deleter must outlive the pointer). shared_ptr's deleter is part of the control block, which copies share by reference counting, so copying is deleter-agnostic. This is also why two shared_ptr<T> with wildly different deleters remain the same static type."
    },
    {
      "type": "code",
      "tag": "swap()",
      "question": "Two unique_ptrs with a printing deleter are swapped. What is the exact output?",
      "code": "#include <memory>\n#include <cstdio>\nstruct D { void operator()(int* p) const { std::printf(\"D%d \", *p); delete p; } };\nint main() {\n    std::unique_ptr<int, D> a(new int(1));\n    std::unique_ptr<int, D> b(new int(2));\n    a.swap(b);\n    std::printf(\"a%d b%d \", *a, *b);\n}",
      "options": [
        "a2 b1 D1 D2",
        "a2 b1 D2 D1",
        "a1 b2 D1 D2",
        "a2 b1 D2 D2"
      ],
      "answer": 0,
      "explain": "swap() exchanges the stored pointers (and deleters), so afterwards a holds 2 and b holds 1, printing \"a2 b1 \". At scope exit, destruction runs in reverse declaration order: b is destroyed first and deletes the int holding 1 (\"D1 \"), then a deletes the int holding 2 (\"D2 \"). No object is ever destroyed or leaked by the swap itself."
    },
    {
      "type": "mcq",
      "tag": "new-expression",
      "question": "What is the relationship between a new-EXPRESSION such as \"new Widget(a)\" and the function \"operator new\"?",
      "options": [
        "They are two spellings of the same thing; \"new Widget(a)\" is shorthand for \"operator new(Widget(a))\"",
        "operator new both allocates and constructs; the new-expression additionally zeroes the memory first",
        "A new-expression may be overloaded per class, but operator new is a fixed, non-replaceable runtime primitive",
        "The new-expression is fixed core language performing two steps — call an allocation function (some operator new overload) for raw memory, then construct the object in it; you can replace or overload operator new, but never the construction step or the two-step protocol, and if the constructor throws, the matching operator delete is invoked automatically"
      ],
      "answer": 3,
      "explain": "This split is the foundation of all C++ memory customization: operator new is \"malloc with a C++ calling convention\" that user code can replace globally or per class, while construction is compiler territory. The automatic operator delete call on constructor exception is why every custom placement operator new should have a matching placement operator delete. delete-expressions mirror the protocol: destructor first, then the deallocation function."
    },
    {
      "type": "code",
      "tag": "raw allocation",
      "question": "Memory is obtained from ::operator new, an object is placement-constructed into it, then both are torn down manually. What is the exact output?",
      "code": "#include <new>\n#include <iostream>\n\nstruct S {\n    S()  { std::cout << \"ctor \"; }\n    ~S() { std::cout << \"dtor \"; }\n};\n\nint main() {\n    void* mem = ::operator new(sizeof(S));\n    std::cout << \"raw \";\n    S* s = new (mem) S;\n    s->~S();\n    ::operator delete(mem);\n    std::cout << \"end\";\n}",
      "options": [
        "ctor raw dtor end",
        "raw ctor dtor end",
        "raw ctor end dtor",
        "Undefined behavior: memory from ::operator new may not be used with placement new"
      ],
      "answer": 1,
      "explain": "::operator new(sizeof(S)) is pure allocation — no constructor runs, so \"raw \" prints before any S exists. Placement new then constructs (\"ctor \"), the explicit destructor call destroys (\"dtor \"), and ::operator delete releases the raw bytes, followed by \"end\". This is precisely the decomposition a new-expression performs automatically, and it is the mechanism containers use via allocators to separate storage from object lifetime."
    },
    {
      "type": "code",
      "tag": "class operator new",
      "question": "A class provides its own operator new and operator delete. What is the exact output?",
      "code": "#include <iostream>\n#include <cstdlib>\n\nstruct S {\n    int v = 1;\n    static void* operator new(std::size_t n) {\n        std::cout << \"new \";\n        return std::malloc(n);\n    }\n    static void operator delete(void* p) {\n        std::cout << \"delete \";\n        std::free(p);\n    }\n};\n\nint main() {\n    S* s = new S;\n    std::cout << \"use\" << s->v << ' ';\n    delete s;\n    std::cout << \"end\";\n}",
      "options": [
        "use1 end — member operator new is ignored unless explicitly qualified as S::operator new",
        "new use1 end delete",
        "new use1 delete end",
        "Fails to compile: operator delete cannot be overloaded at class scope"
      ],
      "answer": 2,
      "explain": "A new-expression for S looks up operator new starting in S's scope, so the member version is found and prints \"new \" before construction; likewise \"delete s\" runs the destructor and then S::operator delete (\"delete \"). Both functions are implicitly static. Class-level overloads are the standard hook for per-class pools and allocation tracking; ::new S would bypass them."
    },
    {
      "type": "mcq",
      "tag": "allocation hooks",
      "question": "Which is true about class-level operator new and operator delete?",
      "options": [
        "They are implicitly STATIC member functions even without the keyword (they run before the object exists or after it is gone), they are INHERITED by derived classes, and a \"::new Widget\" expression bypasses them in favor of the global versions",
        "They must be declared virtual so that deleting through a base pointer finds the most-derived operator delete",
        "They are not inherited; every derived class must redeclare them or fall back to the globals",
        "Defining operator new for one class replaces allocation for all types in the same translation unit"
      ],
      "answer": 0,
      "explain": "There is no object yet during allocation and no longer one during deallocation, so these functions cannot be ordinary members; the language simply makes them static implicitly. Inheritance means a base-class pool allocator serves all derived types — which is why careful implementations check the size argument. Interestingly, deletion through a base pointer with a virtual destructor does find the derived class's operator delete, via the destructor mechanism rather than virtual dispatch on operator delete itself."
    },
    {
      "type": "code",
      "tag": "sized delete",
      "question": "This class declares only the SIZED operator delete. Assuming sizeof(double) == 8, what is the output?",
      "code": "#include <iostream>\n#include <cstddef>\n#include <cstdlib>\n\nstruct S {\n    double a, b;\n    static void* operator new(std::size_t n) { return std::malloc(n); }\n    static void operator delete(void* p, std::size_t sz) {\n        std::cout << \"sized \" << sz << ' ';\n        std::free(p);\n    }\n};\n\nint main() {\n    S* s = new S;\n    delete s;\n    std::cout << \"end\";\n}",
      "options": [
        "end — the sized overload is never selected when the unsized one is absent",
        "Fails to compile: a class must declare the unsized operator delete before the sized one",
        "sized 8 end",
        "sized 16 end"
      ],
      "answer": 3,
      "explain": "C++14 added sized deallocation: operator delete(void*, size_t), where the compiler passes the size of the deleted object so pool allocators can find the right bucket without a lookup. At class scope, declaring only the sized form is fine — the delete-expression uses it, passing sizeof(S), which is 16 for two doubles. (When both forms are declared in a class, the implementation may prefer either, but with one declared there is no choice.)"
    },
    {
      "type": "mcq",
      "tag": "delete this",
      "question": "Under what conditions is \"delete this;\" inside a member function legal?",
      "options": [
        "Never; the standard makes delete this undefined behavior in all circumstances",
        "It is legal only if the object was allocated by a plain new-expression (not new[], not on the stack, not static, not a subobject), and after the statement nothing touches the object again — no member access, no further use of this — with callers aware the object is gone; intrusive reference-counted release() methods use exactly this pattern",
        "It is legal for any object, including stack objects, as long as the destructor is public",
        "It is legal only when written inside the destructor itself, where the object is already being destroyed"
      ],
      "answer": 1,
      "explain": "delete this is well-defined C++ under strict discipline: the pointer must genuinely come from scalar new, and this becomes invalid the instant the statement completes — even reading a member afterwards, or letting the function implicitly touch state, is UB. It appears in COM-style Release() implementations and other intrusive ref counts. Calling it in a destructor would be infinite recursion, and on a stack object it is heap corruption."
    },
    {
      "type": "code",
      "tag": "polymorphic arrays",
      "question": "An array of Derived is deleted through a Base pointer. What is the behavior?",
      "code": "#include <iostream>\n\nstruct B {\n    int x = 0;\n    virtual ~B() { std::cout << \"~B \"; }\n};\nstruct D : B {\n    int y = 0;\n    ~D() override { std::cout << \"~D \"; }\n};\n\nint main() {\n    B* p = new D[3];   // array of Derived through a Base pointer\n    delete[] p;        // undefined behavior\n}",
      "options": [
        "Prints \"~B ~B ~B \" — the base subobjects are destroyed correctly and the derived parts leak",
        "Prints \"~B ~B ~B \" with no leak, because the virtual destructor handles each element",
        "Undefined behavior: for delete[] the pointer's static type must match the array's dynamic element type; arrays are not polymorphic, and the standard makes deleting new D[3] through a B* undefined (in practice the element stride sizeof(B) misaddresses every element after the first)",
        "Fails to compile: a D* returned by new D[3] cannot be assigned to a B*"
      ],
      "answer": 2,
      "explain": "The derived-to-base pointer conversion compiles because D* converts to B* element-agnostically — but delete[] (unlike scalar delete with a virtual destructor) has no per-element dispatch. The standard simply declares the behavior undefined when the static and dynamic element types differ. This is why \"treat arrays polymorphically\" is a classic C++ trap: use vector<unique_ptr<B>> (or spans of pointers) for heterogeneous collections instead."
    },
    {
      "type": "mcq",
      "tag": "bug taxonomy",
      "question": "A function executes: int* p = new int(1); p = new int(2); delete p; — how is this bug correctly classified?",
      "options": [
        "A memory LEAK: the first int becomes unreachable when p is reassigned and is never freed, but no dangling pointer exists. The complementary bug — a DANGLING pointer — is when a pointer outlives its object (e.g., using p after delete), and sanitizers detect the two differently (LeakSanitizer vs AddressSanitizer use-after-free)",
        "A dangling pointer: p dangles from the moment it is reassigned to the second allocation",
        "A double delete: both ints are freed by the single delete because p transferred ownership",
        "No bug: reassigning a raw pointer releases its previous allocation, just as reset() does for smart pointers"
      ],
      "answer": 0,
      "explain": "The two failure modes are mirror images: a leak is memory without a pointer (allocation outlives all references to it), while a dangling pointer is a pointer without memory (reference outlives the allocation). The snippet only orphans the first int — the second is correctly freed. Raw pointer reassignment does nothing to the old target; encoding the \"free on replace\" policy is exactly what unique_ptr::reset and operator= automate."
    },
    {
      "type": "code",
      "tag": "dangling get()",
      "question": "A raw pointer is taken from a unique_ptr with get(), then the unique_ptr is reset. What is the behavior?",
      "code": "#include <memory>\n#include <iostream>\n\nint main() {\n    auto p = std::make_unique<int>(1);\n    int* raw = p.get();\n    p.reset(new int(2));\n    std::cout << *raw;\n}",
      "options": [
        "Prints 1 — raw is an independent copy of the value",
        "Prints 2 — raw is transparently updated to the new allocation",
        "Prints 1 or 2 depending on whether the allocator reuses the freed block",
        "Undefined behavior (per the standard): reset(new int(2)) destroys the first int, so raw dangles and dereferencing it reads a destroyed object — even if it may appear to \"work\" or print stale values in practice"
      ],
      "answer": 3,
      "explain": "get() hands out a non-owning copy of the pointer with no lifetime link back to the unique_ptr; reset() then deletes the first int, leaving raw dangling. Dereferencing it is UB — the classic outcome is reading stale or recycled memory (the freed block is even a prime candidate for reuse by the very next allocation), but the standard permits anything. Cache raw pointers from get() only for scopes where the smart pointer provably stays alive and unmodified."
    },
    {
      "type": "code",
      "tag": "self-reset",
      "question": "A unique_ptr is reset with its OWN currently held pointer. What is the behavior?",
      "code": "#include <memory>\n#include <iostream>\nint main() {\n    std::unique_ptr<int> p(new int(7));\n    p.reset(p.get());\n    std::cout << *p;\n}",
      "options": [
        "Prints 7 — resetting to the same pointer is a documented no-op",
        "Undefined behavior: reset stores the new (identical) pointer first and only then deletes the old one, so p ends up owning an already-deleted int; the subsequent read is use-after-free and scope exit deletes it a second time",
        "Well-defined: reset detects self-assignment by comparing pointers and does nothing",
        "Fails to compile: reset cannot accept the result of get()"
      ],
      "answer": 1,
      "explain": "The standard specifies reset(q) as: save the old pointer, assign q, then delete the saved pointer — deliberately in that order so deleters observing the unique_ptr see the new state. With q == get(), that sequence deletes the very object p now points to, so p holds a dangling pointer, *p is UB, and p's destructor performs a double delete. Unlike assignment operators, reset has no self-safety check; the precondition is simply \"don't do this\"."
    },
    {
      "type": "mcq",
      "tag": "std::launder",
      "question": "When is std::launder (C++17) actually required?",
      "options": [
        "After every placement new, before the returned pointer may be used",
        "To fix the alignment of pointers obtained from malloc before casting them",
        "When a NEW object has been created in storage where an old one lived and you access it through an OLD pointer/reference rather than the pointer placement new returned, in cases where the old pointer is not \"transparently replaceable\" — classically when the type has const or reference members; std::launder(oldPtr) yields a pointer validly referring to the new object",
        "To convert the void* returned by operator new into a typed pointer without a cast"
      ],
      "answer": 2,
      "explain": "Normally, reusing storage lets old pointers \"transparently\" refer to the new object, and the pointer returned by placement new is always fine. The exception involved types with const or reference non-static data members (the compiler may assume those never change through a given pointer); C++20 relaxed the transparent-replaceability rules, narrowing but not eliminating launder's role (it still matters e.g. for pointers derived from arrays of bytes holding objects). It is a compile-time optimization barrier, generating no code."
    },
    {
      "type": "mcq",
      "tag": "implicit lifetime",
      "question": "Which statement about implicit-lifetime types (C++20) is correct?",
      "options": [
        "Every class with at least one constructor is implicit-lifetime, since constructors define lifetime",
        "Implicit lifetime means such objects are garbage-collected by the runtime rather than destroyed manually",
        "std::string is implicit-lifetime because its small-string optimization makes it trivially relocatable",
        "For these types — scalars, arrays, and aggregates/classes meeting triviality requirements — certain operations such as malloc, memcpy into a buffer, or starting the lifetime of a char array can implicitly CREATE objects, retroactively making the C-style pattern \"cast a malloc'd buffer to struct pointer and use it\" well-defined in C++20 (it was formally UB before, even though it worked in practice)"
      ],
      "answer": 3,
      "explain": "Pre-C++20, the object model said no T object exists until a T is explicitly created, so using malloc'd memory as a struct without placement new was technically UB that all compilers happened to tolerate. C++20 (P0593) blesses it: designated operations implicitly create objects of implicit-lifetime types when doing so gives the program defined behavior. Non-trivial classes (std::string, anything with user-provided constructors/destructors) still require genuine construction; std::start_lifetime_as (C++23) extends the toolkit."
    },
    {
      "type": "code",
      "tag": "aligned new",
      "question": "A 64-byte over-aligned type is allocated with new. What does this print under C++17 and later, and why?",
      "code": "#include <cstdint>\n#include <iostream>\n#include <new>\n\nstruct alignas(64) Big {\n    char data[64];\n};\n\nint main() {\n    Big* p = new Big;\n    std::cout << (reinterpret_cast<std::uintptr_t>(p) % 64 == 0);\n    delete p;\n}",
      "options": [
        "Prints 1: for a type whose alignment exceeds __STDCPP_DEFAULT_NEW_ALIGNMENT__, the new-expression automatically calls the aligned allocation overload operator new(size_t, align_val_t), so 64-byte alignment is guaranteed",
        "Prints 1 or 0 unpredictably; alignment beyond max_align_t is never guaranteed by new",
        "Fails to compile: alignas may not exceed alignof(std::max_align_t)",
        "Undefined behavior: a pointer may not be converted to uintptr_t"
      ],
      "answer": 0,
      "explain": "C++17 fixed a long-standing hole: plain operator new only guaranteed max_align_t alignment (typically 16), so new of an over-aligned type could silently return unsuitable storage — UB for SIMD or cache-line-aligned types. Now the compiler statically compares alignof(Big) with __STDCPP_DEFAULT_NEW_ALIGNMENT__ and routes over-aligned requests to the align_val_t overloads (with matching aligned operator delete). The uintptr_t conversion is well-defined and the alignment check prints 1."
    },
    {
      "type": "mcq",
      "tag": "over-alignment",
      "question": "Before C++17, what was the problem with \"new Vec\" for a struct declared alignas(64) Vec { ... }?",
      "options": [
        "It failed to compile until C++17 added support for alignas on classes",
        "Plain operator new only guaranteed alignment suitable for max_align_t (typically 16 bytes), so new Vec could return storage insufficiently aligned for the 64-byte requirement — undefined behavior when the object was used; C++17 added the align_val_t overloads that the new-expression now selects automatically for over-aligned types",
        "new silently rounded the alignment requirement down to 16 and the object model adapted to the weaker alignment",
        "There was no problem; malloc and operator new have always honored arbitrary alignas values"
      ],
      "answer": 1,
      "explain": "alignas itself is C++11; the gap was purely in dynamic allocation, where the allocation function knew only a size, not an alignment. Programmers resorted to over-allocating and hand-aligning, or posix_memalign/_aligned_malloc. C++17's operator new(size_t, align_val_t) family (plus std::aligned_alloc in C17/C++17) closed the gap, and the compiler decides per-type at compile time which family a new-expression calls."
    },
    {
      "type": "code",
      "tag": "pmr propagation",
      "question": "A pmr::vector of pmr::string is given a monotonic_buffer_resource. What does this print?",
      "code": "#include <memory_resource>\n#include <string>\n#include <vector>\n#include <iostream>\n\nint main() {\n    std::pmr::monotonic_buffer_resource pool;\n    std::pmr::vector<std::pmr::string> v{&pool};\n    v.emplace_back(\"a string long enough to avoid SSO allocation\");\n    std::cout << (v.get_allocator().resource() == &pool)\n              << (v[0].get_allocator().resource() == &pool);\n}",
      "options": [
        "10 — the vector uses the pool but the strings fall back to the default resource",
        "00 — resources are not observable through get_allocator()",
        "11 — via uses-allocator construction, the container passes its memory resource down to each pmr::string element, so both the vector and the string it contains allocate from &pool",
        "Fails to compile: emplace_back cannot convert a const char* to pmr::string"
      ],
      "answer": 2,
      "explain": "polymorphic_allocator is a scoped-allocator design: when a pmr container constructs an element that is itself allocator-aware with a compatible allocator type, it appends its own allocator to the element's constructor arguments. The const char* is therefore used to construct pmr::string WITH the vector's resource — the long string's buffer comes from the pool, not global new. This silent propagation only works when the element type is a pmr type."
    },
    {
      "type": "mcq",
      "tag": "pmr pitfalls",
      "question": "Why is std::pmr::vector<std::string> (note: std::string, not std::pmr::string) usually an allocator mistake?",
      "options": [
        "Uses-allocator construction can hand the vector's memory resource only to elements whose allocator type is compatible — std::string is hardwired to std::allocator, so while the vector's own buffer comes from your resource, every string's character buffer silently falls back to global new/delete, defeating the pool; nesting requires pmr types all the way down (std::pmr::string elements)",
        "It fails to compile: pmr containers statically require pmr element types",
        "The strings will draw from the pool but never return memory to it, leaking the resource",
        "Nothing is wrong: allocators propagate automatically through any element type"
      ],
      "answer": 0,
      "explain": "This compiles and runs, which is what makes it treacherous: the outer allocations are pooled but the (often far more numerous) per-string allocations are not, so profiling shows the pool \"not working\". std::string and std::pmr::string differ only in their allocator template argument, but that difference is exactly what uses-allocator construction keys on. The same rule applies recursively for maps of vectors of strings, etc."
    },
    {
      "type": "mcq",
      "tag": "pool resources",
      "question": "std::pmr::unsynchronized_pool_resource vs std::pmr::monotonic_buffer_resource — which comparison is correct?",
      "options": [
        "They differ only in thread safety: the pool resource is the lock-guarded variant of monotonic",
        "Both are monotonic: neither ever reuses deallocated memory before the resource is destroyed",
        "monotonic_buffer_resource is thread-safe while the pool resources are not",
        "The pool resource maintains buckets of similarly sized blocks and RETURNS deallocated blocks to their pool for reuse, suiting long-lived containers with churn; monotonic never reuses memory until the whole resource is released. Neither of these two is thread-safe — synchronized_pool_resource is the locking sibling — and both draw further memory from an upstream resource"
      ],
      "answer": 3,
      "explain": "The three stock resources cover distinct lifetimes: monotonic for bulk-free arena patterns (deallocate is a no-op), pool resources for steady-state reuse without touching the global heap, with synchronized/unsynchronized differing only in internal locking. Oversized requests exceeding the pools' largest bucket pass straight through to upstream. Choosing between them is a lifetime-pattern decision, not just a speed knob."
    },
    {
      "type": "mcq",
      "tag": "allocator_traits",
      "question": "Why do standard containers call std::allocator_traits<A>::allocate(a, n) instead of calling a.allocate(n) directly?",
      "options": [
        "allocator_traits adds mandatory bounds and leak checking around every allocator call",
        "allocator_traits supplies defaults for everything an allocator does not provide — construct/destroy (falling back to placement new and destructor calls), max_size, pointer typedefs, rebind_alloc, and the POCCA/POCMA propagation policies — so a minimal conforming allocator needs only value_type, allocate, deallocate and equality; containers are required to go through the traits so those defaults take effect",
        "Direct member calls were deprecated in C++11 and removed in C++20 for all allocator types",
        "allocator_traits transparently serializes allocator calls with a mutex, making any allocator thread-safe"
      ],
      "answer": 1,
      "explain": "Before C++11, writing an allocator meant implementing a large boilerplate surface. allocator_traits inverted that: the traits template detects which members exist and synthesizes the rest, shrinking a custom allocator to a handful of lines. The propagation traits (propagate_on_container_copy/move_assignment, swap) also answer the subtle question of what happens to allocators when containers themselves are copied, moved, or swapped."
    },
    {
      "type": "code",
      "tag": "move vs copy",
      "question": "A shared_ptr is first copied, then moved from. What does this print?",
      "code": "#include <memory>\n#include <iostream>\n\nint main() {\n    auto a = std::make_shared<int>(1);\n    auto b = a;                    // copy: count -> 2\n    auto c = std::move(a);         // move: count unchanged\n    std::cout << c.use_count() << ' '\n              << (a ? \"set\" : \"empty\");\n}",
      "options": [
        "3 set",
        "2 set",
        "2 empty",
        "1 empty"
      ],
      "answer": 2,
      "explain": "The copy (b = a) bumps the strong count to 2. The move (c = std::move(a)) transfers a's ownership stake to c without touching the count — no atomic operation is needed, which is exactly why moving shared_ptr is cheaper than copying. Afterwards owners are b and c (use_count 2), and a moved-from shared_ptr is guaranteed empty (null), so it prints \"empty\"."
    },
    {
      "type": "mcq",
      "tag": "ref-count cost",
      "question": "What is the real cost concern when choosing between passing shared_ptr<T> by value and by const reference?",
      "options": [
        "Passing by value copy-bumps and later drops the ATOMIC strong count — a read-modify-write that can contend and ping-pong the control block's cache line across cores — so pass by value exactly when the callee actually keeps a share (then std::move it into its final home); const& costs nothing per call but requires the caller to guarantee the pointer outlives the call",
        "Passing by value duplicates the pointed-to object, so it is only safe for cheaply copyable T",
        "Passing by const& is a data race, because reading the reference count through a reference is unsynchronized",
        "There is no difference: compilers are permitted to elide reference-count updates across the call boundary"
      ],
      "answer": 0,
      "explain": "The copy itself is only two pointer copies plus one atomic increment, but atomics on a shared cache line scale badly in hot paths — measurable in code that forwards shared_ptrs through many layers. The guideline composes with sink semantics: take by value when storing (and move into the member, avoiding a second bump), by const& (or better, T&/T* per the observer rule) otherwise. Compilers cannot elide the counting: it is observable behavior."
    },
    {
      "type": "mcq",
      "tag": "FILE deleter",
      "question": "What are the drawbacks of std::unique_ptr<FILE, decltype(&fclose)> f(fopen(\"x\", \"r\"), &fclose); compared with using a small function-object deleter?",
      "options": [
        "It fails to compile: function pointers cannot serve as unique_ptr deleters",
        "fclose cannot be used at all because it returns int rather than void",
        "There are none; the standard endorses this as the canonical RAII wrapper for FILE",
        "The function-pointer deleter is runtime state: it doubles the smart pointer's size (pointer + function pointer, no EBO possible), and such a unique_ptr is not default-constructible — the standard deletes the default constructor when the deleter is a pointer type, since a null deleter would later be invoked; a tiny \"struct FCloser { void operator()(FILE* f) const { fclose(f); } }\" keeps it one pointer wide, default-constructible, and inlinable"
      ],
      "answer": 3,
      "explain": "A function pointer must be stored per instance and could be null, hence the deleted default constructor and the size penalty; calls through it also resist inlining compared to a named function object. The struct deleter is an empty class, restoring raw-pointer size via EBO and enabling \"std::unique_ptr<FILE, FCloser> f;\" as a default-constructed member. (Pedantically, taking the address of most standard library functions is not portable either — one more reason to wrap.)"
    }
  ]
};

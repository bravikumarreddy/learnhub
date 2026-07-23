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
    }
  ]
};

/* ===== Professional C++ — Containers, Algorithms & Ranges ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["procpp-stdlib"] = {
  title: "Professional C++ — Containers, Algorithms & Ranges",
  subtitle: "Container guarantees, heterogeneous lookup, erase-remove, C++20 ranges and views.",
  crumb: "Professional C++",
  questions: [
    {
      "type": "mcq",
      "tag": "Iterator invalidation",
      "question": "You hold iterators AND references into a container, then insert new elements at arbitrary positions. Which container guarantees that all existing iterators and references remain valid?",
      "options": [
        "std::vector",
        "std::deque",
        "std::list",
        "std::unordered_map"
      ],
      "answer": 2,
      "explain": "Node-based sequence containers like std::list (and std::map/std::set) never invalidate iterators or references on insertion; only iterators to an erased element die. std::vector invalidates everything on reallocation and everything at/after the insertion point otherwise. std::deque invalidates all iterators on any insertion (though references survive insertion at either end), and std::unordered_map invalidates all iterators when it rehashes."
    },
    {
      "type": "code",
      "tag": "vector invalidation",
      "question": "All needed headers are included. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 3};\nv.reserve(4);\nauto it = v.begin();\nv.push_back(4);\nstd::cout << *it;",
      "options": [
        "1",
        "4",
        "Undefined behavior: push_back always invalidates vector iterators",
        "0"
      ],
      "answer": 0,
      "explain": "reserve(4) guarantees capacity() >= 4, so the push_back cannot trigger a reallocation. Without reallocation, only iterators at or after the insertion point (here, end()) are invalidated; begin() still points at the element 1. Had a second push_back exceeded the capacity, dereferencing it would have been undefined behavior."
    },
    {
      "type": "mcq",
      "tag": "unordered_map rehash",
      "question": "An std::unordered_map grows past its max_load_factor and rehashes. Which of the following remain valid afterwards?",
      "options": [
        "All iterators into the map",
        "Pointers and references to the stored elements",
        "Both iterators and references",
        "Neither iterators nor references"
      ],
      "answer": 1,
      "explain": "Rehashing rebuilds the bucket array and relinks the nodes, which invalidates every iterator into the container. The nodes themselves are not moved in memory, so pointers and references to elements survive. This is why you can safely keep a reference to a mapped value across many insertions, but never a cached iterator."
    },
    {
      "type": "code",
      "tag": "map operator[]",
      "question": "The map starts empty. What does this snippet print?",
      "code": "std::map<std::string, int> m;\nstd::cout << m[\"answer\"] << \" \" << m.size();",
      "options": [
        "0 1",
        "0 0",
        "Throws std::out_of_range",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "operator[] on a map is a lookup-or-insert: if the key is absent it default-inserts a value-initialized mapped value (int{} == 0) and returns a reference to it. So the read prints 0 and the map now has one element. This is also why operator[] cannot be called on a const map — use find() or at() there; at() is the one that throws std::out_of_range."
    },
    {
      "type": "code",
      "tag": "try_emplace / insert_or_assign",
      "question": "After all four modifying calls, what does this snippet print?",
      "code": "std::map<int, std::string> m{{1, \"one\"}};\nm.try_emplace(1, \"uno\");\nm.insert({1, \"eins\"});\nm.insert_or_assign(1, \"ein\");\nstd::cout << m[1];",
      "options": [
        "one",
        "uno",
        "eins",
        "ein"
      ],
      "answer": 3,
      "explain": "try_emplace and insert both do nothing when the key already exists, so \"one\" survives the first two calls. insert_or_assign is the only member here that overwrites an existing mapped value, leaving \"ein\". Bonus rule: try_emplace additionally guarantees its arguments are not moved-from when the key exists, unlike emplace."
    },
    {
      "type": "code",
      "tag": "erase-remove",
      "question": "Note that the return value of std::remove is discarded. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 3, 2, 4};\nstd::remove(v.begin(), v.end(), 2);\nstd::cout << v.size();",
      "options": [
        "3",
        "5",
        "4",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "std::remove cannot change a container's size — it only shifts the kept elements to the front and returns an iterator to the new logical end, leaving moved-from garbage behind it. The size stays 5 until you call v.erase(newEnd, v.end()), which is the erase-remove idiom. Since C++20 you can simply write std::erase(v, 2) (or std::erase_if for a predicate), which does both steps and returns the count removed."
    },
    {
      "type": "mcq",
      "tag": "std::erase_if",
      "question": "Why can the classic erase-remove idiom (std::remove_if + erase) NOT be used to delete entries from an std::map, forcing a manual loop or C++20 std::erase_if?",
      "options": [
        "remove_if requires random-access iterators, which map does not provide",
        "map elements have a const key and a fixed sorted position, so they cannot be shifted/assigned over each other as remove_if requires",
        "map::erase does not accept iterator arguments",
        "The idiom works fine on map; erase_if is only a convenience"
      ],
      "answer": 1,
      "explain": "std::remove_if works by move-assigning kept elements over removed ones, so elements must be move-assignable and freely reorderable. A map's value_type is std::pair<const Key, T> — the const key kills assignment, and reordering would break the sorted invariant anyway. C++20's std::erase_if(container, pred) is specialized per container and erases node by node, returning the number of elements removed."
    },
    {
      "type": "code",
      "tag": "Heterogeneous lookup",
      "question": "What happens with this snippet?",
      "code": "std::set<std::string> s{\"apple\", \"banana\"};\nstd::string_view key = \"apple\";\nauto it = s.find(key);\nstd::cout << (it != s.end());",
      "options": [
        "Prints 1",
        "Prints 0",
        "Fails to compile",
        "Undefined behavior"
      ],
      "answer": 2,
      "explain": "The default comparator std::less<std::string> is not transparent, so the only find overload takes const std::string&, and std::string's constructor from a string_view-like type is explicit — no implicit conversion exists, so the call does not compile. Declaring the set as std::set<std::string, std::less<>> enables the template find overload (heterogeneous lookup), which compares the string_view directly with no temporary std::string allocation."
    },
    {
      "type": "mcq",
      "tag": "is_transparent",
      "question": "You want unordered_map<std::string, int>::find(std::string_view) to work in C++20 without constructing a temporary std::string. What is required?",
      "options": [
        "Nothing; unordered containers support this out of the box",
        "Using std::less<> as the third template argument",
        "Both the hasher and the key-equality functor must be transparent (each exposing an is_transparent type) and able to handle string_view",
        "It is impossible; heterogeneous lookup only exists for ordered containers"
      ],
      "answer": 2,
      "explain": "C++20 added heterogeneous lookup to the unordered containers, but the transparent overloads are enabled only when Hash::is_transparent AND KeyEqual::is_transparent both exist. In practice you supply a custom hasher whose operator() accepts string_view (marked with is_transparent) plus std::equal_to<>. For ordered containers the equivalent switch is a transparent comparator such as std::less<>."
    },
    {
      "type": "mcq",
      "tag": "Node handles",
      "question": "Which statement about node handles on the associative containers is TRUE?",
      "options": [
        "extract() returns a node handle through which the key can be modified, and the node can be reinserted into a compatible container without any allocation or copy",
        "extract() copies the element out, leaving the original element in the container",
        "merge() moves every element from the source, overwriting destination elements that have the same key",
        "extract() invalidates all iterators into the container"
      ],
      "answer": 0,
      "explain": "extract() unlinks the node and hands you ownership; nh.key() gives non-const access, so you can rekey an element and reinsert it with zero allocations — the only sanctioned way to change a map key in place. merge() moves elements over node by node, but elements whose key already exists in the destination stay behind in the source (for the non-multi containers). Only iterators/references to the extracted element itself are invalidated."
    },
    {
      "type": "code",
      "tag": "reserve vs resize",
      "question": "The vector starts empty. What happens with this snippet?",
      "code": "std::vector<int> v;\nv.reserve(10);\nv[5] = 42;\nstd::cout << v[5];",
      "options": [
        "Prints 42",
        "Prints 0",
        "Undefined behavior: size() is still 0",
        "Fails to compile"
      ],
      "answer": 2,
      "explain": "reserve() only allocates capacity; it never creates elements, so size() remains 0 and v[5] indexes into raw uninitialized storage — undefined behavior (operator[] does no bounds check). resize(10) is what actually value-initializes ten elements and would make this legal. Rule of thumb: reserve before a sequence of push_back/emplace_back; resize when you intend to index directly."
    },
    {
      "type": "mcq",
      "tag": "Capacity",
      "question": "A vector holds 1,000,000 elements; you erase almost all of them. Which call can actually reduce its capacity?",
      "options": [
        "v.clear()",
        "v.resize(10)",
        "v.erase(v.begin() + 10, v.end())",
        "v.shrink_to_fit()"
      ],
      "answer": 3,
      "explain": "clear(), resize() to a smaller size, and erase() destroy elements but are guaranteed not to reallocate, so capacity is untouched — the memory stays reserved. shrink_to_fit() is the only capacity-reducing call, and even it is formally a non-binding request (implementations in practice reallocate to the smaller size). The alternative classic trick is the swap idiom: std::vector<T>(v).swap(v)."
    },
    {
      "type": "code",
      "tag": "std::span dangers",
      "question": "What happens with this program?",
      "code": "std::span<int> makeSpan() {\n    std::vector<int> data{1, 2, 3};\n    return std::span<int>{data};\n}\n\nint main() {\n    auto s = makeSpan();\n    std::cout << s[0];\n}",
      "options": [
        "Prints 1",
        "Prints 0",
        "Fails to compile",
        "Undefined behavior"
      ],
      "answer": 3,
      "explain": "std::span is a non-owning view over contiguous memory; it never extends the lifetime of what it views. The vector is destroyed when makeSpan returns, so s dangles and s[0] is undefined behavior — this compiles without any warning on most compilers. The same danger applies to keeping a span across a push_back that reallocates the underlying vector."
    },
    {
      "type": "mcq",
      "tag": "std::span",
      "question": "A function is declared as void process(std::span<const int> data). Which argument can NOT be passed to it?",
      "options": [
        "A std::vector<int>",
        "A C-style array int arr[10]",
        "A std::array<int, 4>",
        "A std::list<int>"
      ],
      "answer": 3,
      "explain": "std::span requires contiguous storage, because it is just a pointer plus a size. vector, std::array, and C arrays all satisfy the contiguous_range requirement and convert implicitly; span<const T> additionally accepts non-const sources. std::list stores each element in a separate node, so no span can view it."
    },
    {
      "type": "code",
      "tag": "Structured bindings",
      "question": "Note the structured binding in the loop. What does this snippet print?",
      "code": "std::map<std::string, int> m{{\"a\", 1}, {\"b\", 2}};\nfor (auto [key, value] : m) {\n    value *= 10;\n}\nstd::cout << m[\"a\"];",
      "options": [
        "10",
        "1",
        "Fails to compile: map elements cannot be copied",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "auto [key, value] (no &) copies each std::pair<const std::string, int> out of the map, so value refers into a temporary copy and the *= 10 is thrown away — m[\"a\"] is still 1. Writing for (auto& [key, value] : m) binds to the real elements and would print 10; key would then be const std::string& automatically because the pair's first is const. Use const auto& when you only read."
    },
    {
      "type": "code",
      "tag": "Ranges projections",
      "question": "What does this program print?",
      "code": "struct Person { std::string name; int age; };\n\nint main() {\n    std::vector<Person> people{{\"Ann\", 30}, {\"Bob\", 25}, {\"Cy\", 35}};\n    std::ranges::sort(people, {}, &Person::age);\n    for (const auto& p : people) std::cout << p.name << ' ';\n}",
      "options": [
        "Ann Bob Cy",
        "Bob Ann Cy",
        "Cy Ann Bob",
        "Fails to compile: Person has no operator<"
      ],
      "answer": 1,
      "explain": "The third argument is a projection: each element is passed through &Person::age (via std::invoke) before being handed to the comparator, so Person needs no operator< at all. The {} defaults the comparator to std::ranges::less, giving an ascending sort by age: 25 (Bob), 30 (Ann), 35 (Cy). Projections are a headline advantage of the ranges algorithms over the classic ones, which would need a hand-written lambda comparator here."
    },
    {
      "type": "code",
      "tag": "View laziness",
      "question": "The view is built but never iterated. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 3, 4, 5, 6};\nint calls = 0;\nauto isEven = [&calls](int i) { ++calls; return i % 2 == 0; };\nauto evens = v | std::views::filter(isEven);\nstd::cout << calls;",
      "options": [
        "0",
        "6",
        "3",
        "1"
      ],
      "answer": 0,
      "explain": "Views are lazy: constructing a filter_view stores the predicate but evaluates nothing, so calls is still 0. The predicate only runs when the view is iterated — begin() advances to the first match, and each ++ advances to the next. This laziness also explains why filter-then-transform pipelines invoke the predicate on every element but the transform only on the survivors, and why order of adaptors matters for cost."
    },
    {
      "type": "code",
      "tag": "Borrowed ranges",
      "question": "makeVector() returns a std::vector<int>{1, 2, 3} by value. What happens with this program?",
      "code": "std::vector<int> makeVector();  // returns {1, 2, 3}\n\nint main() {\n    auto it = std::ranges::max_element(makeVector());\n    std::cout << *it;\n}",
      "options": [
        "Prints 3",
        "Undefined behavior: it points into a destroyed temporary",
        "Fails to compile: it has type std::ranges::dangling, which cannot be dereferenced",
        "Prints 1"
      ],
      "answer": 2,
      "explain": "When a ranges algorithm is given an rvalue of a non-borrowed range, it refuses to hand back an iterator that would dangle and instead returns the placeholder type std::ranges::dangling. The algorithm call itself compiles; it is the dereference *it that fails to compile, turning a would-be runtime bug into a compile-time error. Borrowed ranges such as std::span or std::string_view (whose iterators outlive the range object) return real iterators even when passed as rvalues."
    },
    {
      "type": "mcq",
      "tag": "common_view",
      "question": "Some view pipelines (e.g. views::iota(1) | views::take_while(...)) produce ranges where begin() and end() have different types. Which adaptor makes such a range usable with pre-ranges code that needs a matching iterator pair, like std::vector's (first, last) constructor in C++20?",
      "options": [
        "std::views::all",
        "std::views::common",
        "std::views::join",
        "std::ranges::subrange"
      ],
      "answer": 1,
      "explain": "Ranges generalize end() into a sentinel that may have a different type than the iterator, which classic iterator-pair APIs cannot digest. std::views::common wraps the range so begin() and end() return the same type, enabling vector<int>(r.begin(), r.end()) style code. In C++23 you usually skip this dance and materialize directly with std::ranges::to<std::vector>()."
    },
    {
      "type": "code",
      "tag": "partial_sort",
      "question": "What does this snippet print, and what is guaranteed about it?",
      "code": "std::vector<int> v{5, 1, 4, 2, 3};\nstd::partial_sort(v.begin(), v.begin() + 2, v.end());\nstd::cout << v[0] << ' ' << v[1];",
      "options": [
        "1 2",
        "5 1",
        "2 1",
        "Unspecified: partial_sort makes no ordering guarantee for any element"
      ],
      "answer": 0,
      "explain": "partial_sort(first, middle, last) places the smallest (middle - first) elements, fully sorted, into [first, middle) — here the two smallest values 1 and 2 in order. Only the tail [middle, last) is left in unspecified order. It runs in O(n log k), cheaper than a full sort when you need just the top-k; nth_element is cheaper still if you don't need those k sorted."
    },
    {
      "type": "mcq",
      "tag": "stable_sort",
      "question": "A vector of employees is already sorted by name. You now sort it by department and require that employees within the same department stay in name order. Which is correct?",
      "options": [
        "std::sort suffices; it never reorders equivalent elements",
        "Use std::stable_sort; std::sort gives no guarantee about the relative order of equivalent elements",
        "Use std::partial_sort, which is the stable variant of sort",
        "Sorting by department must recompare names; no single-pass algorithm can preserve them"
      ],
      "answer": 1,
      "explain": "std::sort (typically introsort) is free to reorder elements that compare equivalent, so the previous name order can be destroyed. std::stable_sort (typically merge sort) guarantees equivalent elements keep their relative order, which is exactly what multi-key 'sort by the least significant key first' pipelines rely on. The price is O(n log n) only with extra memory, degrading to O(n log^2 n) without; partial_sort is about sorting a prefix, not stability."
    },
    {
      "type": "code",
      "tag": "Strict weak ordering",
      "question": "The vector contains twenty copies of the value 7. What happens with this snippet?",
      "code": "std::vector<int> v(20, 7);\nstd::sort(v.begin(), v.end(),\n          [](int a, int b) { return a <= b; });\nstd::cout << v.front();",
      "options": [
        "Prints 7",
        "Prints 0",
        "Fails to compile",
        "Undefined behavior: the comparator violates strict weak ordering"
      ],
      "answer": 3,
      "explain": "A comparator must define a strict weak ordering, which requires irreflexivity: comp(x, x) must be false. With <=, comp(7, 7) is true, so equal elements each claim to precede the other; std::sort is allowed to assume this never happens and can walk off the ends of the range — real implementations crash or loop forever on inputs like this all-equal vector. The same rule makes <= or >= comparators UB for std::map, std::set, binary_search, and friends: always use strict < or >."
    },
    {
      "type": "mcq",
      "tag": "set vs unordered_set",
      "question": "std::unordered_set advertises average O(1) lookup versus std::set's O(log n). In which situation can the unordered_set actually be the SLOWER choice?",
      "options": [
        "Never; O(1) always beats O(log n)",
        "When keys are expensive to hash (e.g. long strings) or collisions pile up in a bucket, degrading lookups toward O(n)",
        "When the container holds more than a few thousand elements",
        "When the elements are small integers"
      ],
      "answer": 1,
      "explain": "The O(1) is an average over good hash distributions: every lookup must first hash the key (which for a long string means touching every character), and a bucket full of colliding keys is scanned linearly, so the worst case is O(n). For few elements, expensive-to-hash keys, or adversarial/poor hash functions, std::set's handful of comparisons can win. Ordered sets are also required whenever you need sorted iteration or range queries (lower_bound/upper_bound), which hash tables cannot provide."
    },
    {
      "type": "code",
      "tag": "multimap equal_range",
      "question": "What does this multimap snippet print?",
      "code": "std::multimap<int, char> m{{1, 'a'}, {2, 'b'}, {2, 'c'}, {3, 'd'}};\nauto [first, last] = m.equal_range(2);\nstd::cout << std::distance(first, last);",
      "options": [
        "1",
        "2",
        "3",
        "Fails to compile: multimap has no equal_range"
      ],
      "answer": 1,
      "explain": "equal_range returns a pair of iterators, [lower_bound(2), upper_bound(2)), delimiting every element with key 2 — here 'b' and 'c', so the distance is 2. It is the idiomatic way to visit all values for one key in a multimap, since find would give only an unspecified one of them. The structured binding unpacks the returned std::pair of iterators."
    },
    {
      "type": "code",
      "tag": "vector<bool>",
      "question": "Note the auto on line 2. What does this snippet print?",
      "code": "std::vector<bool> v{true, false, true};\nauto flag = v[0];\nv[0] = false;\nstd::cout << flag;",
      "options": [
        "1",
        "0",
        "Fails to compile",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "std::vector<bool> is a packed-bit specialization: operator[] returns a proxy object of type std::vector<bool>::reference, not bool&. auto therefore deduces the proxy, so flag still refers to bit 0 and observes the later write, printing 0 — with any other vector<T>, auto would have made an independent copy. Write bool flag = v[0]; to force a real copy; the proxy is also why you cannot take a bool* into the container or hand it to code expecting real references."
    },
    {
      "type": "mcq",
      "tag": "deque internals",
      "question": "std::deque is typically implemented as a set of fixed-size blocks plus a map of pointers to those blocks. Which statement follows from this structure?",
      "options": [
        "Elements are stored in one contiguous buffer, so &d[0] can be passed to a C API expecting an array",
        "push_front and push_back never move existing elements, so references to elements survive end insertions even though iterators do not",
        "operator[] is O(log n) because the right block must be searched for",
        "push_front is O(n) because every element must shift one slot to the right"
      ],
      "answer": 1,
      "explain": "New blocks are simply hooked onto either end of the block map, so growth at the ends is O(1) and existing elements never move — that is why the standard guarantees references stay valid on end insertions, while iterators (which know their position in the block map) are still invalidated. The block structure also means memory is NOT contiguous, so a deque can never back a std::span or a C array API. Random access is still O(1): block index and offset are computed arithmetically."
    },
    {
      "type": "code",
      "tag": "deque references",
      "question": "All needed headers are included. What does this snippet print?",
      "code": "std::deque<int> d{1, 2, 3};\nint& r = d[1];\nd.push_front(0);\nd.push_back(4);\nstd::cout << r << ' ' << d.size();",
      "options": [
        "2 5",
        "Undefined behavior: insertion invalidates all references into a deque",
        "1 5",
        "Fails to compile"
      ],
      "answer": 0,
      "explain": "For std::deque, insertion at either end invalidates all iterators but is guaranteed to leave references and pointers to existing elements valid, because elements never move — new blocks are just attached at the ends. So r still refers to the element 2 and the deque now holds five elements. Had the insertion happened in the middle, both iterators and references would have been invalidated."
    },
    {
      "type": "code",
      "tag": "list splice",
      "question": "Note the iterator obtained into b before the splice. What does this snippet print?",
      "code": "std::list<int> a{1, 2, 3};\nstd::list<int> b{4, 5, 6};\nauto it = std::next(b.begin());\na.splice(a.end(), b);\nstd::cout << b.size() << ' ' << *it << ' ' << a.size();",
      "options": [
        "3 5 6 — splice copies the elements, leaving b untouched",
        "Undefined behavior: it was invalidated by the splice",
        "0 5 6",
        "0 5 3"
      ],
      "answer": 2,
      "explain": "splice transfers the nodes themselves — no elements are copied, moved, or destroyed — so b becomes empty and a grows to six elements. Iterators keep pointing at the same nodes and simply become iterators into the destination list, so *it is still 5. This node-transfer semantic is the signature capability of linked lists and has no equivalent on vector or deque."
    },
    {
      "type": "mcq",
      "tag": "splice complexity",
      "question": "For std::list, compare a.splice(pos, b) (entire other list) with a.splice(pos, b, first, last) (a range from a different list b). Which statement is TRUE since C++11?",
      "options": [
        "All splice overloads are O(1); that is the whole point of a linked list",
        "All splice overloads are O(n) because size() must be recomputed from scratch",
        "The range overload is O(1) only when the two lists use different allocators",
        "Whole-list and single-element splices are O(1), but splicing a range from a different list is linear in the range length, because both lists must update their O(1) size()"
      ],
      "answer": 3,
      "explain": "C++11 made list::size() O(1), which forces the container to maintain an element count. Splicing an entire list or one element transfers a known count, so relinking stays O(1); but a range [first, last) from a *different* list has an unknown length, so the nodes must be counted — O(distance(first, last)). Splicing a range within the same list remains O(1) because the total count does not change."
    },
    {
      "type": "code",
      "tag": "forward_list",
      "question": "All needed headers are included. What does this snippet print?",
      "code": "std::forward_list<int> fl{2, 3};\nfl.insert_after(fl.before_begin(), 1);\nfl.erase_after(fl.begin());\nstd::cout << fl.front() << ' ' << *std::next(fl.begin());",
      "options": [
        "2 3",
        "1 3",
        "1 2",
        "Undefined behavior: before_begin() refers to no element and cannot be used"
      ],
      "answer": 1,
      "explain": "A singly linked list can only insert and erase AFTER a given node, so forward_list exposes before_begin(), a special iterator one before the first element that exists exactly to allow insertion at the front (and erasure of the first element) via the _after functions. insert_after(before_begin(), 1) prepends 1, giving {1, 2, 3}; erase_after(begin()) then removes the 2, leaving {1, 3}. before_begin() may be used as a position but never dereferenced."
    },
    {
      "type": "mcq",
      "tag": "forward_list API",
      "question": "Which of the following member functions does std::forward_list deliberately NOT provide?",
      "options": [
        "size()",
        "push_front()",
        "insert_after()",
        "max_size()"
      ],
      "answer": 0,
      "explain": "forward_list is designed for minimal per-object and per-node overhead: keeping an element count would cost extra space and make splice_after more expensive, so there is no size() — you must use std::distance(fl.begin(), fl.end()) in O(n) if you really need it. It also lacks push_back, back(), and any reverse iteration, since the links only go forward. empty() is still available and O(1)."
    },
    {
      "type": "mcq",
      "tag": "array vs C array",
      "question": "Which statement correctly contrasts std::array<T, N> with a built-in C array T[N]?",
      "options": [
        "std::array stores its elements on the heap, like vector",
        "Swapping two std::arrays is an O(1) pointer swap, just like vector",
        "std::array can be copied, assigned, and compared element-wise with ==, and does not decay to a pointer when passed by value",
        "std::array supports push_back as long as fewer than N elements are in use"
      ],
      "answer": 2,
      "explain": "std::array is a thin aggregate wrapper around a C array, so the elements live inline (on the stack for a local), yet it behaves like a proper value type: copy, assignment, ==/<=> comparing elements, and .size() all work, and passing one to a function passes the whole object rather than decaying to T*. The price of inline storage is that swap must exchange all N elements in O(N) — unlike vector's O(1) pointer swap. Its size is fixed forever, so there is no push_back."
    },
    {
      "type": "code",
      "tag": "array fill",
      "question": "Note that a is default-initialized before the fill. What does this snippet print?",
      "code": "std::array<int, 4> a;\na.fill(7);\nstd::array<int, 4> b{7, 7, 7, 7};\nstd::cout << (a == b) << ' ' << (a < b);",
      "options": [
        "1 0",
        "1 1",
        "0 0",
        "Undefined behavior: a is read while holding indeterminate values"
      ],
      "answer": 0,
      "explain": "A default-initialized std::array<int, N> has indeterminate values (like a C array), but fill(7) overwrites every element before anything is read, so there is no UB. operator== compares element-wise and finds all four pairs equal, printing 1; operator< is a lexicographic comparison, and equal sequences are not less-than, printing 0. C arrays offer none of this: == would not even compile after decay-to-pointer adjustments in most contexts, and assignment is impossible."
    },
    {
      "type": "code",
      "tag": "map insert result",
      "question": "The structured bindings decompose insert's return value. What does this snippet print?",
      "code": "std::map<int, std::string> m;\nauto [i1, ok1] = m.insert({1, \"one\"});\nauto [i2, ok2] = m.insert({1, \"uno\"});\nstd::cout << ok1 << ok2 << ' ' << i2->second;",
      "options": [
        "11 uno",
        "10 one",
        "10 uno",
        "Fails to compile: insert's return value cannot be decomposed"
      ],
      "answer": 1,
      "explain": "For unique-key associative containers, insert returns std::pair<iterator, bool>: the bool says whether insertion happened, and the iterator points at the element with that key either way. The first insert succeeds (true), the second finds the key occupied and does nothing (false) — crucially, i2 still points to the existing element, whose value remains \"one\". This 'iterator regardless of outcome' contract is what makes patterns like 'insert, and update if already present' a single tree lookup."
    },
    {
      "type": "mcq",
      "tag": "insert with hint",
      "question": "std::map::insert has overloads taking a hint iterator: m.insert(hintIt, value). What does the hint actually do?",
      "options": [
        "A wrong hint causes the element to be inserted at the wrong position, corrupting the sort order",
        "The call throws std::invalid_argument when the hint is wrong",
        "Hints exist only on the unordered containers, where they identify the target bucket",
        "A correct hint makes the insertion amortized O(1) instead of O(log n); an incorrect hint merely forfeits the speedup, never correctness"
      ],
      "answer": 3,
      "explain": "The hint is a pure optimization: if the new element belongs immediately before the hinted position, the tree can link it in amortized constant time instead of searching from the root in O(log n). If the hint is wrong, the container simply falls back to a normal search — the map's ordering invariant is never at risk. The classic use is bulk-inserting already-sorted data while passing the previous insert's return value (or end()) as the hint."
    },
    {
      "type": "code",
      "tag": "const map access",
      "question": "What happens with this program?",
      "code": "void printAnswer(const std::map<std::string, int>& m) {\n    std::cout << m[\"answer\"];\n}\n\nint main() {\n    std::map<std::string, int> config{{\"answer\", 42}};\n    printAnswer(config);\n}",
      "options": [
        "Prints 42",
        "Prints 0 after inserting a default value",
        "Fails to compile: operator[] has no const overload because it may insert",
        "Throws std::out_of_range"
      ],
      "answer": 2,
      "explain": "map::operator[] is defined as lookup-or-insert, so it can modify the container and is therefore only provided as a non-const member — calling it through a const reference does not compile. On a const map you must use at() (which throws std::out_of_range for a missing key), find(), or contains(). This compile error is a common surprise the first time a map member is read inside a const member function."
    },
    {
      "type": "code",
      "tag": "lower/upper_bound",
      "question": "The vector is sorted. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 2, 2, 3};\nauto lo = std::lower_bound(v.begin(), v.end(), 2);\nauto hi = std::upper_bound(v.begin(), v.end(), 2);\nstd::cout << (lo - v.begin()) << ' ' << (hi - lo);",
      "options": [
        "1 2",
        "2 3",
        "1 3",
        "1 4"
      ],
      "answer": 2,
      "explain": "lower_bound returns the first position where 2 could be inserted without breaking the order — the first 2, at index 1. upper_bound returns the position just past the last 2 (index 4), so hi - lo counts the occurrences: 3. Together they form the same half-open range that equal_range returns in one call, and on a random-access range each is O(log n)."
    },
    {
      "type": "mcq",
      "tag": "member lower_bound",
      "question": "Given std::map<int, X> m, why should you call m.lower_bound(k) rather than std::lower_bound(m.begin(), m.end(), ...)?",
      "options": [
        "The member navigates the tree directly in O(log n); the free algorithm on map's bidirectional iterators still does O(log n) comparisons but O(n) iterator movement",
        "There is no difference; both run in O(log n)",
        "The free algorithm does not compile on a map because its iterators are not random access",
        "The member function is O(1) thanks to an internal cache of the last lookup"
      ],
      "answer": 0,
      "explain": "std::lower_bound only assumes forward iterators: it halves the number of comparisons, but advancing a bidirectional map iterator to the midpoint costs linear steps, so the overall traversal is O(n). The member version descends the red-black tree using its internal structure, achieving a true O(log n). Rule: when a container offers a member with the same name as an algorithm (find, count, lower_bound, ...), the member exploits the container's structure and should be preferred."
    },
    {
      "type": "mcq",
      "tag": "binary_search",
      "question": "Which statement about std::binary_search is TRUE?",
      "options": [
        "It returns an iterator to the element it finds",
        "It returns only a bool; the range must be sorted (at least partitioned) with respect to the comparator, and to learn the position you need lower_bound or equal_range",
        "It works correctly on any range, sorted or not, at the cost of falling back to O(n)",
        "It requires random-access iterators and refuses to compile otherwise"
      ],
      "answer": 1,
      "explain": "binary_search answers only 'is an equivalent element present?' — it discards the position, which surprises many people. Its precondition is that the range is partitioned with respect to the search value (sorted is the common case); on an unsorted range the result is meaningless. It compiles for forward iterators too (with more traversal cost); when you need the element itself, use lower_bound and check, or equal_range."
    },
    {
      "type": "mcq",
      "tag": "equal_range precondition",
      "question": "A colleague calls std::equal_range on a vector that is NOT sorted, and the unit test happens to pass. What is the correct assessment?",
      "options": [
        "equal_range degenerates to a linear scan, so the result is correct but slow",
        "It throws std::logic_error when the range is detected to be unsorted",
        "The behavior is undefined: sortedness is an unchecked precondition, so the call may 'work' today and silently return nonsense with different data or a different implementation",
        "The result is implementation-defined but always a valid iterator pair delimiting all matching elements"
      ],
      "answer": 2,
      "explain": "All the binary-search-family algorithms (lower_bound, upper_bound, equal_range, binary_search) state as a precondition that the range is partitioned with respect to the comparator and value; the standard imposes no diagnostic, so violating it is undefined behavior. Because the algorithms merely probe midpoints, an unsorted range can coincidentally give the expected answer — the worst kind of latent bug. The returned pair may be an empty or wrong range next time; only sorting the data (or using find on unsorted data) is correct."
    },
    {
      "type": "mcq",
      "tag": "load factor",
      "question": "Which statement about the unordered containers' bucket interface is TRUE?",
      "options": [
        "load_factor() is the number of collisions in the fullest bucket",
        "load_factor() equals size() / bucket_count(), and an insertion that would push it past max_load_factor() triggers an automatic rehash with more buckets",
        "max_load_factor() is fixed at 1.0 and cannot be changed",
        "Calling rehash() keeps all iterators valid, since only references are ever invalidated"
      ],
      "answer": 1,
      "explain": "The load factor is the average number of elements per bucket, size()/bucket_count(), and the container automatically grows and rehashes whenever an insertion would exceed max_load_factor() (typically defaulted to 1.0, but settable). Lowering max_load_factor trades memory for fewer collisions; reserve(n) pre-sizes the bucket array to hold n elements without rehashing. Any rehash invalidates all iterators (though not references), the exact opposite of option four."
    },
    {
      "type": "mcq",
      "tag": "unordered ordering",
      "question": "A test iterates an std::unordered_map, writes the elements to a file, and compares against a golden copy. Why is this test fundamentally fragile?",
      "options": [
        "Iteration order is insertion order, so the test only breaks if insertions are reordered",
        "Iteration order is ascending key order, so the test is actually fine",
        "Iteration order is random per process but guaranteed stable across versions of the same library",
        "Iteration order is unspecified — it depends on hash values, bucket count, and insertion/rehash history, and may legitimately change between library versions or even between runs"
      ],
      "answer": 3,
      "explain": "Unordered containers place elements by hash-modulo-bucket-count, so the visit order is an artifact of the hash function, the current bucket array size, and the exact history of insertions and rehashes. Nothing in the standard pins it down; a library update, a different platform, or hash randomization (used by some implementations to resist hash-flooding attacks) can all change it. Tests and serialization code must sort the elements first or compare order-insensitively; if iteration order matters, use std::map."
    },
    {
      "type": "code",
      "tag": "priority_queue comparator",
      "question": "Note the std::greater comparator. What does this snippet print?",
      "code": "std::priority_queue<int, std::vector<int>,\n                    std::greater<int>> pq;\npq.push(3);\npq.push(1);\npq.push(2);\nstd::cout << pq.top();",
      "options": [
        "3 — priority_queue always surfaces the largest element",
        "1",
        "2",
        "Fails to compile: greater<int> is not a valid comparator for priority_queue"
      ],
      "answer": 1,
      "explain": "The comparator direction is the classic priority_queue gotcha: the default std::less yields a MAX-heap, so supplying std::greater flips it into a MIN-heap, and top() returns the smallest element, 1. Think of it as 'the element that loses every comparison sinks; the element that would sort last comes out on top'. The full template signature also shows the second parameter: the underlying container, defaulting to vector."
    },
    {
      "type": "mcq",
      "tag": "priority_queue iteration",
      "question": "You need to log every element of a std::priority_queue in priority order without losing the data. What are your options?",
      "options": [
        "Call std::sort on pq.begin(), pq.end() first",
        "Iterate the protected member c directly; the standard exposes it for exactly this purpose",
        "Use the const_iterator interface, which visits elements in priority order",
        "There is no iteration interface at all; you must pop() elements one by one from the queue (or from a copy of it), or choose a different structure such as a sorted container"
      ],
      "answer": 3,
      "explain": "priority_queue deliberately exposes only push, pop, top, size, and empty — no iterators — because the heap's internal array order is meaningless except for its top element. Getting all elements in priority order is inherently destructive: copy the queue and pop the copy dry, or maintain a std::set / sorted vector instead if ordered traversal is a recurring need. The underlying container is a protected member named c, but reaching it requires inheriting, and its raw heap layout is still not priority order."
    },
    {
      "type": "mcq",
      "tag": "container adaptors",
      "question": "Which statement about the underlying containers of the std::stack and std::queue adaptors is TRUE?",
      "options": [
        "stack and queue default to vector; priority_queue defaults to deque",
        "All adaptors require deque and accept nothing else",
        "stack and queue both default to std::deque; std::vector can serve as stack's container but not queue's, because queue needs pop-from-the-front operations vector does not provide",
        "queue defaults to std::list because O(1) front removal is impossible with deque"
      ],
      "answer": 2,
      "explain": "The adaptors are thin wrappers that forward to a container supplied as a template parameter: stack needs back(), push_back(), pop_back(); queue additionally needs front() and pop_front(). deque satisfies both and is the default for both; vector works fine for stack (std::stack<int, std::vector<int>>) but lacks pop_front, so it cannot back a queue. priority_queue is the one that defaults to vector, since heap algorithms want random access."
    },
    {
      "type": "mcq",
      "tag": "list::sort",
      "question": "Why does std::list provide its own sort() member function, and how does it differ from std::sort?",
      "options": [
        "std::sort requires random-access iterators, so it does not compile for list; the member list::sort (a stable merge sort) relinks nodes instead of moving elements",
        "std::sort works on list but is slower than the member version",
        "list::sort is unstable, unlike std::stable_sort",
        "The member sort copies the elements into a temporary vector, sorts that, and copies back"
      ],
      "answer": 0,
      "explain": "std::sort's introsort needs to jump around the sequence, so it demands random-access iterators — list's bidirectional iterators make the call ill-formed, not merely slow. The member version runs a merge sort over the links themselves: elements are never copied or moved, iterators remain attached to their (re-ordered) elements, and the sort is stable. The same 'member beats/replaces algorithm' story applies to list::merge, remove, unique, and reverse."
    },
    {
      "type": "mcq",
      "tag": "flat_map (C++23)",
      "question": "C++23 introduces std::flat_map. Which description is accurate?",
      "options": [
        "It is a container adaptor keeping keys and values in two separate sorted contiguous sequences — cache-friendly lookup and iteration, but O(n) insertion and vector-style iterator invalidation",
        "It is a hash map stored in a single flat array using open addressing",
        "It is a drop-in replacement for std::map with identical O(log n) insertion and stable iterators",
        "It stores pair<const Key, T> nodes contiguously, so all existing std::map code compiles unchanged"
      ],
      "answer": 0,
      "explain": "flat_map (like flat_set and friends) is an adaptor over two underlying sequence containers — by default a vector of keys and a vector of values, kept sorted in parallel. Lookups are O(log n) binary searches over contiguous memory, which is dramatically more cache-friendly than chasing tree nodes; the trade-off is O(n) insertion/erasure (elements must shift) and vector-like invalidation of all iterators on modification. Because keys and values live apart, value_type is pair<Key, T> accessed through proxies, so it is not a perfect drop-in for map."
    },
    {
      "type": "code",
      "tag": "accumulate init",
      "question": "Note the type of the initial value. What does this snippet print?",
      "code": "std::vector<double> v{0.5, 0.5, 0.5};\nauto total = std::accumulate(v.begin(), v.end(), 0);\nstd::cout << total;",
      "options": [
        "1.5",
        "1",
        "0",
        "Fails to compile: cannot add double to int"
      ],
      "answer": 2,
      "explain": "accumulate's accumulator has the TYPE OF THE INIT ARGUMENT, and the literal 0 is an int. Every step computes acc + 0.5 as a double but assigns it back into the int accumulator, truncating 0.5 to 0 each time, so the final result is 0 — not even a rounded 1. Passing 0.0 fixes it; this init-type trap is one of the most common numeric bugs with accumulate."
    },
    {
      "type": "mcq",
      "tag": "reduce vs accumulate",
      "question": "How does C++17's std::reduce differ from std::accumulate?",
      "options": [
        "std::reduce may group and reorder the operations arbitrarily — so the operation should be associative and commutative — and it accepts execution policies; std::accumulate is a guaranteed strict left-to-right fold",
        "They are interchangeable; reduce is just the C++17 spelling of accumulate",
        "accumulate can be parallelized with std::execution::par; reduce cannot",
        "reduce guarantees left-to-right order but additionally requires random-access iterators"
      ],
      "answer": 0,
      "explain": "accumulate is defined as a sequential left fold: ((init op a) op b) op c, in exactly that order. reduce is allowed to split the range, combine partial results in any grouping and order, and run under an execution policy — which is precisely what enables parallel tree reductions, but means non-associative or non-commutative operations (like floating-point subtraction, or string concatenation) can give different or unspecified results. Use reduce for sums of numbers; keep accumulate when order matters."
    },
    {
      "type": "code",
      "tag": "transform + back_inserter",
      "question": "out starts empty. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 3};\nstd::vector<int> out;\nstd::transform(v.begin(), v.end(), std::back_inserter(out),\n               [](int i) { return i * i; });\nstd::cout << out.size() << ' ' << out[2];",
      "options": [
        "Undefined behavior: out is empty, so transform writes past its end",
        "0 9",
        "3 9",
        "Fails to compile"
      ],
      "answer": 2,
      "explain": "Algorithms never grow the destination themselves — writing through out.begin() here WOULD be undefined behavior. back_inserter wraps the container in an output iterator whose every write calls push_back, so the three squared values are appended and out becomes {1, 4, 9}. The alternative is pre-sizing the destination (out.resize(3)) and writing through out.begin(); front_inserter and inserter are the siblings for other containers."
    },
    {
      "type": "code",
      "tag": "copy_if",
      "question": "The destination is pre-sized to 6 elements. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 3, 4, 5, 6};\nstd::vector<int> out(6);\nauto newEnd = std::copy_if(v.begin(), v.end(), out.begin(),\n                           [](int i) { return i % 2 == 0; });\nstd::cout << out.size() << ' ' << (newEnd - out.begin())\n          << ' ' << out[4];",
      "options": [
        "3 3 0",
        "6 3 0",
        "6 6 0",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "copy_if writes only the three even values into the first three slots and returns an iterator just past the last element written — algorithms never resize a container, so out.size() stays 6 and the tail keeps its value-initialized zeros (out[4] == 0). The returned iterator is how you know where the meaningful data ends, typically followed by out.erase(newEnd, out.end()). Using back_inserter on an empty vector is the alternative that avoids the leftover-elements problem entirely."
    },
    {
      "type": "mcq",
      "tag": "set algorithms",
      "question": "Which statement about std::set_union (and its siblings set_intersection, set_difference) is TRUE?",
      "options": [
        "The inputs may be unsorted; set_union sorts them internally before merging",
        "These algorithms work only on std::set, as their names imply",
        "Both input ranges must already be sorted by the same comparator (otherwise the behavior is undefined), and the result is typically written through an insert iterator such as back_inserter",
        "set_union removes duplicates within a single input range, like std::unique"
      ],
      "answer": 2,
      "explain": "Despite the names, these are generic algorithms over any sorted ranges — sorted vectors are the classic use. They perform a single linear merge pass, which only works if both inputs are ordered by the same comparator; unsorted input is a precondition violation and undefined behavior. The output range must be big enough or growable, so back_inserter into an empty vector is idiomatic; on sets themselves you would more often use C++17 merge() or extract()."
    },
    {
      "type": "code",
      "tag": "set_intersection",
      "question": "Both vectors are sorted. What does this snippet print?",
      "code": "std::vector<int> a{1, 2, 3, 4};\nstd::vector<int> b{2, 4, 6};\nstd::vector<int> out;\nstd::set_intersection(a.begin(), a.end(), b.begin(), b.end(),\n                      std::back_inserter(out));\nfor (int i : out) std::cout << i << ' ';",
      "options": [
        "2 4",
        "1 2 3 4 6",
        "4 2",
        "2 2 4 4"
      ],
      "answer": 0,
      "explain": "set_intersection walks both sorted ranges in one linear pass and emits each value present in both — here 2 and 4, in ascending order, appended via back_inserter. Elements are emitted at most min(m, n) times per value, so no duplicates appear from a value existing once in each input. The whole operation is O(m + n), which is why pre-sorted vectors plus the set algorithms often beat building actual std::sets."
    },
    {
      "type": "code",
      "tag": "iota",
      "question": "All needed headers are included. What does this snippet print?",
      "code": "std::vector<int> v(5);\nstd::iota(v.begin(), v.end(), 10);\nstd::cout << v.front() << ' ' << v.back();",
      "options": [
        "0 4",
        "10 15",
        "Fails to compile: iota requires a generator lambda",
        "10 14"
      ],
      "answer": 3,
      "explain": "std::iota (from <numeric>) fills the range with sequentially incremented values starting at the given seed: 10, 11, 12, 13, 14. The last of the five elements is therefore 14, not 15 — an off-by-one worth double-checking in interviews. For arbitrary value sequences, std::generate with a stateful lambda is the general tool; iota is the special case of ++."
    },
    {
      "type": "code",
      "tag": "generate",
      "question": "Note the stateful lambda. What does this snippet print?",
      "code": "std::vector<int> v(4);\nint n = 1;\nstd::generate(v.begin(), v.end(), [&n] { return n *= 2; });\nstd::cout << v[3];",
      "options": [
        "8",
        "16",
        "2",
        "Undefined behavior: generate may call the lambda in any order"
      ],
      "answer": 1,
      "explain": "std::generate calls the (argument-less) generator once per element, in order, assigning the results: 2, 4, 8, 16 — so v[3] is 16. Capturing n by reference is what lets the lambda carry state between calls; capturing by value would yield 2, 2, 2, 2 with a mutable lambda quirk besides. The sequential guarantee holds for plain generate; only the parallel overloads relax ordering."
    },
    {
      "type": "code",
      "tag": "minmax_element",
      "question": "Note that the maximum value 5 appears twice. What does this snippet print?",
      "code": "std::vector<int> v{3, 5, 1, 5, 2};\nauto [mn, mx] = std::minmax_element(v.begin(), v.end());\nstd::cout << *mn << ' ' << (mx - v.begin());",
      "options": [
        "1 1",
        "3 5",
        "1 4",
        "1 3"
      ],
      "answer": 3,
      "explain": "minmax_element finds both extremes in a single pass using about 3n/2 comparisons — cheaper than calling min_element and max_element separately. Subtle contract difference: with duplicates, it returns the FIRST smallest but the LAST largest, so mx points at index 3, whereas a standalone max_element would have returned the first 5 at index 1. The structured binding unpacks the returned pair of iterators."
    },
    {
      "type": "code",
      "tag": "nth_element",
      "question": "What does this snippet print, and with what guarantee?",
      "code": "std::vector<int> v{5, 1, 4, 2, 3};\nstd::nth_element(v.begin(), v.begin() + 2, v.end());\nstd::cout << v[2];",
      "options": [
        "1",
        "4",
        "3",
        "Unspecified: nth_element makes no guarantee about the element at the nth position"
      ],
      "answer": 2,
      "explain": "nth_element guarantees exactly one position: after the call, v[2] holds the value that WOULD be at index 2 if the range were fully sorted — the median 3. Everything before it is <= it and everything after is >= it, but within those two sides the order is unspecified. It runs in O(n) on average (quickselect), making it the right tool for medians and percentiles when a full O(n log n) sort would be wasted."
    },
    {
      "type": "code",
      "tag": "stable_partition",
      "question": "All needed headers are included. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 3, 4, 5};\nstd::stable_partition(v.begin(), v.end(),\n                      [](int i) { return i % 2 == 0; });\nfor (int i : v) std::cout << i << ' ';",
      "options": [
        "2 4 1 3 5",
        "4 2 1 3 5",
        "2 4 5 3 1",
        "1 3 5 2 4"
      ],
      "answer": 0,
      "explain": "Partitioning moves every element satisfying the predicate (the evens) before every element that does not, and STABLE_partition additionally preserves the original relative order within each group: 2, 4 then 1, 3, 5. Plain std::partition would also put evens first but in unspecified internal order, so its output could not be keyed deterministically. Both return an iterator to the partition point, and stability costs extra: O(n log n) swaps without spare memory, O(n) with it."
    },
    {
      "type": "code",
      "tag": "rotate",
      "question": "Note that rotate's return value is captured. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 3, 4, 5};\nauto it = std::rotate(v.begin(), v.begin() + 2, v.end());\nstd::cout << v.front() << ' ' << *it;",
      "options": [
        "1 3",
        "3 3",
        "4 1",
        "3 1"
      ],
      "answer": 3,
      "explain": "rotate(first, middle, last) performs a left rotation that brings *middle to the front: {3, 4, 5, 1, 2}. Its return value is the new position of the ORIGINAL first element — first + (last - middle), here index 3, which holds 1. That returned iterator is what makes rotate composable, e.g. the classic 'slide a block of elements elsewhere in the vector' idiom."
    },
    {
      "type": "code",
      "tag": "unique",
      "question": "The vector is NOT sorted. What does this snippet print?",
      "code": "std::vector<int> v{1, 1, 2, 2, 1};\nv.erase(std::unique(v.begin(), v.end()), v.end());\nfor (int i : v) std::cout << i;",
      "options": [
        "12",
        "112",
        "11221",
        "121"
      ],
      "answer": 3,
      "explain": "std::unique only collapses runs of ADJACENT equal elements — it is not a global deduplicator. The runs 1,1 and 2,2 shrink to single elements, but the final 1 is not adjacent to the first run and survives, giving 1, 2, 1. Global deduplication requires sorting first (sort + unique + erase) or building a set; also note unique follows the remove-idiom, so the erase call is required to actually shrink the vector."
    },
    {
      "type": "mcq",
      "tag": "shuffle",
      "question": "What is the correct modern way to randomly shuffle a std::vector, and why?",
      "options": [
        "std::random_shuffle(v.begin(), v.end()) — still the canonical way",
        "std::shuffle(v.begin(), v.end(), gen) with a seeded generator such as std::mt19937; std::random_shuffle was deprecated and removed (C++17) because it relied on rand()",
        "std::shuffle(v.begin(), v.end()) — the generator argument is optional and defaults to a global engine",
        "for (auto& x : v) std::swap(x, v[rand() % v.size()]);"
      ],
      "answer": 1,
      "explain": "std::shuffle requires you to pass a uniform random bit generator explicitly — typically an std::mt19937 seeded from std::random_device — giving reproducibility when you keep the seed and decent statistical quality. random_shuffle was removed in C++17 precisely because its implicit use of rand() was low-quality and global-state-dependent. The hand-rolled swap loop in the last option is a subtly biased shuffle (it does not implement Fisher–Yates correctly) on top of using rand()."
    },
    {
      "type": "mcq",
      "tag": "std::sample",
      "question": "Which statement about C++17's std::sample is TRUE?",
      "options": [
        "It selects with replacement, so the same element can appear twice in the output",
        "It shuffles the selected elements into random order before writing them",
        "It picks without replacement, returns the whole range if you ask for more elements than exist, and for forward ranges writes the chosen elements in their original relative order",
        "It modifies the input range by removing the sampled elements"
      ],
      "answer": 2,
      "explain": "std::sample(first, last, out, n, gen) chooses min(n, distance(first, last)) DISTINCT elements — selection without replacement — using the supplied random generator, and leaves the input untouched. When the input provides forward iterators (selection sampling), each element is emitted in the same relative order it had in the source, which is sometimes exactly what you want and sometimes a surprise if you expected a shuffled sample. Follow it with std::shuffle if random output order matters."
    },
    {
      "type": "mcq",
      "tag": "execution policies",
      "question": "You change std::sort(v.begin(), v.end()) to std::sort(std::execution::par, v.begin(), v.end()). Which statement is TRUE?",
      "options": [
        "std::execution::par guarantees the algorithm actually runs on multiple threads",
        "The library automatically synchronizes access to shared state inside your comparator, so it may increment a shared counter safely",
        "Exceptions thrown inside a parallel algorithm are collected into a std::vector<std::exception_ptr> and rethrown together",
        "The policy grants permission, not a guarantee: you must keep the element-access functions free of data races (no unsynchronized shared state), and an exception escaping one of them calls std::terminate"
      ],
      "answer": 3,
      "explain": "An execution policy tells the library it MAY parallelize; the implementation can still run sequentially. Responsibility flips to the caller: any lambda, comparator, or projection you pass must not introduce data races (mutexes are allowed under par, but not under par_unseq, whose iterations may be interleaved on one thread via vectorization). And unlike normal algorithms, an exception escaping an element-access function under any policy goes straight to std::terminate — there is no aggregation mechanism."
    },
    {
      "type": "code",
      "tag": "iota view + take",
      "question": "Note that views::iota(1) has no upper bound. What happens with this snippet?",
      "code": "int sum = 0;\nfor (int i : std::views::iota(1) | std::views::take(5)) {\n    sum += i;\n}\nstd::cout << sum;",
      "options": [
        "The loop never terminates: views::iota(1) is an infinite range",
        "Fails to compile: an infinite range cannot appear in a range-based for loop",
        "10",
        "15"
      ],
      "answer": 3,
      "explain": "views::iota(1) with a single argument is a lazily generated, unbounded sequence 1, 2, 3, ... — nothing is computed until iteration. Piping it into views::take(5) caps the traversal at five elements, so the loop sums 1+2+3+4+5 = 15 and ends normally. Lazy generation plus a truncating adaptor is the idiomatic ranges way to express 'first n of an infinite series'; only iterating the infinite view WITHOUT such a bound would hang."
    },
    {
      "type": "code",
      "tag": "keys/values views",
      "question": "All needed headers are included. What does this snippet print?",
      "code": "std::map<int, char> m{{1, 'a'}, {2, 'b'}};\nfor (int k : std::views::keys(m)) std::cout << k;\nfor (char c : std::views::values(m)) std::cout << c;",
      "options": [
        "12ab",
        "1a2b",
        "ab12",
        "Fails to compile: keys/values require a view, not a container"
      ],
      "answer": 0,
      "explain": "views::keys and views::values adapt any range of pair-like elements, projecting out the first or second member respectively — they are shorthands for views::elements<0> and views::elements<1>. The first loop prints the keys 1 and 2 in the map's sorted order, the second prints the mapped characters a and b. Containers are implicitly wrapped via views::all, so passing the map directly is fine; the views are lazy and copy nothing."
    },
    {
      "type": "code",
      "tag": "split view",
      "question": "All needed headers are included. What does this snippet print?",
      "code": "std::string s = \"one,two,three\";\nfor (auto part : std::views::split(s, ',')) {\n    std::cout << std::string_view(part.begin(), part.end()) << '|';\n}",
      "options": [
        "onetwothree|",
        "one,two,three|",
        "one|two|three|",
        "Fails to compile: split's subranges cannot be converted to string_view"
      ],
      "answer": 2,
      "explain": "views::split lazily yields one subrange per delimiter-separated piece, excluding the delimiter itself — three pieces here, each printed followed by '|'. Because splitting a string keeps contiguous character subranges, each piece can be turned back into a std::string_view via the C++20 iterator-pair constructor with zero copying — the idiomatic allocation-free tokenizer. (Its sibling views::lazy_split works on non-contiguous input but its pieces are only forward ranges, making the string_view round-trip harder.)"
    },
    {
      "type": "code",
      "tag": "equal_range subrange",
      "question": "Note the structured binding on the result of the ranges algorithm. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 2, 3};\nauto [first, last] = std::ranges::equal_range(v, 2);\nstd::cout << std::distance(first, last) << ' ' << *first;",
      "options": [
        "2 3",
        "2 2",
        "1 2",
        "Fails to compile: the result of ranges::equal_range cannot be decomposed with structured bindings"
      ],
      "answer": 1,
      "explain": "The ranges version of equal_range returns a std::ranges::subrange rather than a std::pair, and subrange opts into the tuple protocol, so a structured binding cleanly decomposes it into its begin and end iterators. The range covers both 2s, so the distance is 2 and *first is the value 2 itself. A subrange is also itself iterable — for (int i : std::ranges::equal_range(v, 2)) works directly, which is often nicer than unpacking."
    },
    {
      "type": "code",
      "tag": "member-function projection",
      "question": "What does this program print?",
      "code": "struct Person {\n    std::string name;\n    int age = 0;\n    int getAge() const { return age; }\n};\n\nint main() {\n    std::vector<Person> people{{\"Ann\", 30}, {\"Bob\", 41}, {\"Cy\", 35}};\n    auto it = std::ranges::max_element(people, {}, &Person::getAge);\n    std::cout << it->name;\n}",
      "options": [
        "Ann",
        "Cy",
        "Fails to compile: projections must be pointers to data members, not member functions",
        "Bob"
      ],
      "answer": 3,
      "explain": "Projections are applied through std::invoke, which happily accepts a pointer to member FUNCTION as well as a pointer to data member, so each Person is projected to getAge() before comparison — no lambda needed even for computed values. The {} defaults the comparator to ranges::less, and the largest projected value, 41, belongs to Bob. This std::invoke plumbing is the same reason member pointers work directly in std::function, bind, and the ranges algorithms generally."
    },
    {
      "type": "code",
      "tag": "adaptor order",
      "question": "The same two adaptors are composed in both orders. What does this snippet print?",
      "code": "std::vector<int> v{1, 2, 3, 4};\nauto doubled = [](int i) { return i * 2; };\nauto div4 = [](int i) { return i % 4 == 0; };\nauto a = v | std::views::transform(doubled)\n           | std::views::filter(div4);\nauto b = v | std::views::filter(div4)\n           | std::views::transform(doubled);\nstd::cout << std::ranges::distance(a) << ' '\n          << std::ranges::distance(b);",
      "options": [
        "2 1",
        "1 2",
        "2 2",
        "1 1"
      ],
      "answer": 0,
      "explain": "Adaptor composition is not commutative: pipeline a doubles first ({2, 4, 6, 8}) and then keeps multiples of 4, yielding {4, 8} — two elements; pipeline b filters the original values (only 4 qualifies) and then doubles, yielding {8} — one element. The predicate sees post-transform values in a and pre-transform values in b. Order also matters for cost even when results coincide: filtering early means the transform runs on fewer elements."
    },
    {
      "type": "mcq",
      "tag": "filter caching",
      "question": "Why can reusing the same std::views::filter view object after modifying the underlying container produce wrong results?",
      "options": [
        "filter_view::begin() rescans from the start on every call, which makes results inconsistent",
        "Views hold a snapshot copy of the data, so mutations to the container are simply never visible",
        "filter_view caches the first matching position the first time begin() is called (to meet the amortized O(1) begin() requirement); after you mutate the underlying container, that cached iterator can be stale — recreate the view after modifying the data",
        "The cache is invalidated automatically whenever the container changes, so this cannot actually happen"
      ],
      "answer": 2,
      "explain": "All views must provide amortized constant-time begin(), but finding the first element that passes a filter is O(n) — so filter_view memoizes the result of its first begin() call inside the view object. The view has no way to observe later changes to the container: the cached position may now skip a newly qualifying element, point at one that no longer qualifies, or dangle entirely after reallocation. The rule of thumb: treat a view as ephemeral — build it, consume it, and rebuild it after any mutation of the underlying range."
    },
    {
      "type": "mcq",
      "tag": "const views",
      "question": "A function template takes const R& range and iterates it with a range-based for loop. Why can this fail for some standard views?",
      "options": [
        "All standard views are const-iterable; the code cannot fail for a view",
        "Views that cache state in begin() — such as filter_view and drop_while_view — have no const-qualified begin(), so iterating a const view of those types simply does not compile",
        "A const view can be iterated but yields copies of the elements instead of references",
        "Iterating a const view is undefined behavior unless the underlying container is also const"
      ],
      "answer": 1,
      "explain": "Because filter_view (and drop_while_view, and others) must mutate their internal cache inside begin(), that begin() cannot be const — so deep const-iteration is unsupported and the const R& instantiation fails to compile, often with a baffling error. transform_view and iota_view, by contrast, are const-iterable, which is why the bug appears only for certain pipelines. The practical guidance: accept ranges in templates by forwarding reference (R&&), and pass views by value — they are cheap to copy by design."
    },
    {
      "type": "mcq",
      "tag": "view iterator category",
      "question": "You apply std::views::filter to a std::vector<int>. What happens to the iterator category of the resulting range?",
      "options": [
        "Random access is preserved; view adaptors never change the iterator category",
        "The result is input-only; every adaptor degrades its input to input iterators",
        "The result is still contiguous, because the elements physically live in a vector",
        "The filtered range is at best bidirectional — filter cannot jump straight to the i-th match, so operator[] and iterator arithmetic are unavailable (transform, by contrast, preserves random access but drops contiguity)"
      ],
      "answer": 3,
      "explain": "Each adaptor advertises the strongest category it can honestly implement. Reaching the n-th element that passes a predicate inherently requires walking and testing elements one at a time, so filter_view caps the category at bidirectional even over a vector — no r[i], no it + n, and algorithms requiring random access (like std::ranges::sort on the view) will not compile. transform_view keeps random access, since element i is computable directly, but it loses contiguity because elements are computed rather than stored."
    },
    {
      "type": "mcq",
      "tag": "zip/enumerate (C++23)",
      "question": "In C++23, a has 5 elements and b has 3. What does iterating std::views::zip(a, b) produce?",
      "options": [
        "Three tuples: zip stops at the end of the shortest range, and each tuple holds references to the original elements",
        "Five tuples: the shorter range is padded with value-initialized elements",
        "It fails to compile: zip requires ranges of equal length",
        "It compiles but throws std::out_of_range at runtime when b is exhausted"
      ],
      "answer": 0,
      "explain": "views::zip walks all its ranges in lockstep and ends when the SHORTEST one ends — no padding, no error — so here you get exactly three tuples. The tuples contain references, so writing through them (e.g. std::swap on zipped elements) mutates the originals, which is what makes zip useful for parallel-array algorithms. Its cousin views::enumerate(r) is essentially zip with an integer index sequence, yielding (index, element&) pairs and eliminating the manual counter variable."
    },
    {
      "type": "mcq",
      "tag": "chunk/slide (C++23)",
      "question": "In C++23, given v = {1, 2, 3, 4, 5}, how many windows do v | std::views::chunk(2) and v | std::views::slide(2) produce, respectively?",
      "options": [
        "chunk: 2 windows, because incomplete chunks are dropped; slide: 4 windows",
        "chunk: 3 windows, the last holding only {5}; slide: 4 overlapping windows of exactly 2 elements each",
        "chunk: 3 windows; slide: 5 windows, the last holding only {5}",
        "Both produce 3 windows; the adaptors differ only in element order"
      ],
      "answer": 1,
      "explain": "chunk(n) cuts the range into consecutive non-overlapping pieces of n elements, keeping a smaller final piece when the length is not divisible: [1,2], [3,4], [5]. slide(n) instead yields every window of EXACTLY n consecutive elements, advancing by one each time: [1,2], [2,3], [3,4], [4,5] — count = size - n + 1, and never a partial window. chunk suits batching work; slide suits pairwise/moving-window computations like adjacent differences or moving averages."
    },
    {
      "type": "mcq",
      "tag": "ranges::to (C++23)",
      "question": "Which statement about C++23's std::ranges::to is TRUE?",
      "options": [
        "std::ranges::to is a view adaptor, so it is lazy just like filter and transform",
        "You must always spell out the full element type, as in ranges::to<std::vector<int>>(); deduction is not possible",
        "auto v = r | std::ranges::to<std::vector>(); eagerly copies the pipeline's results into a new vector, deducing the element type — replacing the C++20 views::common plus iterator-pair-constructor workaround",
        "ranges::to works only on sized ranges, so pipelines involving take() on an infinite view are rejected"
      ],
      "answer": 2,
      "explain": "ranges::to is the missing 'materialize' step: it terminates a lazy pipeline by constructing a real container from it, and it may be spelled with just the container template — ranges::to<std::vector>() — letting the element type be deduced from the range. Unlike the adaptors before it in the pipe, it executes immediately and allocates. Before C++23 you had to funnel pipelines through views::common and call the container's iterator-pair constructor (as C++20 code in this quiz's earlier questions must); ranges::to also nests, converting e.g. a split view into std::vector<std::string>."
    }
  ]
};

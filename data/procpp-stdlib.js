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
    }
  ]
};

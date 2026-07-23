/* ===== Professional C++ — Strings, string_view & Formatting ===== */
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["procpp-strings"] = {
  title: "Professional C++ — Strings, string_view & Formatting",
  subtitle: "std::string internals, string_view lifetime traps, conversions, and std::format.",
  crumb: "Professional C++",
  questions: [
    {
      "type": "mcq",
      "tag": "SSO",
      "question": "What does the small string optimization (SSO) used by all mainstream std::string implementations actually do?",
      "options": [
        "It interns identical short strings so that equal strings share one global buffer",
        "It stores short strings inside the string object's own internal buffer, so no heap allocation occurs for them",
        "It reference-counts short strings and copies them lazily only when one copy is modified",
        "It places short strings in read-only static storage alongside string literals"
      ],
      "answer": 1,
      "explain": "With SSO, a std::string object contains a small internal buffer (typically around 15 or 22 characters, implementation dependent); strings that fit go there instead of the heap, which is why a default-constructed string usually reports a nonzero capacity. Interning is not something std::string does, and copy-on-write has been effectively forbidden for std::string since C++11 because of its iterator/reference invalidation guarantees."
    },
    {
      "type": "code",
      "tag": "capacity",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s;\n    std::cout << s.size() << ' ';\n    s.reserve(50);\n    std::cout << (s.capacity() >= 50) << ' ' << s.size();\n}",
      "options": [
        "0 1 0",
        "0 1 50",
        "0 0 0",
        "50 1 50"
      ],
      "answer": 0,
      "explain": "reserve() affects only capacity (the storage the string may grow into without reallocating); it never changes size() or the contents. After reserve(50) the capacity is guaranteed to be at least 50, so the boolean prints 1, while size() is still 0. Separating size from capacity is exactly how you pre-allocate to avoid repeated reallocation while appending."
    },
    {
      "type": "code",
      "tag": "string_view lifetime",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\n#include <string>\n#include <string_view>\n\nint main() {\n    std::string_view sv = std::string(\"Hello\") + \", World\";\n    std::cout << sv;\n}",
      "options": [
        "Prints \"Hello, World\" — the view keeps the temporary alive",
        "Compile error: a std::string does not convert to std::string_view",
        "Prints \"Hello\" only, because the view is bound before concatenation",
        "Undefined behavior: sv dangles because the temporary string is destroyed at the end of the initialization statement"
      ],
      "answer": 3,
      "explain": "operator+ produces a temporary std::string, and string_view's converting constructor stores a pointer into that temporary's buffer. Unlike binding a temporary to a const reference, a string_view never extends the lifetime of anything, so the temporary is destroyed at the end of the full expression and sv is left dangling. This 'view into a temporary' pattern is one of the classic string_view traps."
    },
    {
      "type": "code",
      "tag": "string_view lifetime",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\n#include <string>\n#include <string_view>\n\nstd::string_view makeGreeting() {\n    std::string s = \"Hello, Professional C++\";\n    return s;\n}\n\nint main() {\n    std::string_view v = makeGreeting();\n    std::cout << v;\n}",
      "options": [
        "Prints the greeting reliably, because the return value copies the characters",
        "Compile error: no implicit conversion from std::string to std::string_view",
        "Undefined behavior: the returned view refers to the local string, which is destroyed when makeGreeting() returns",
        "Guaranteed to print an empty string, since string_view resets itself when its source dies"
      ],
      "answer": 2,
      "explain": "std::string has an implicit conversion operator to std::string_view, so this compiles cleanly — which is precisely what makes it dangerous. The view holds a pointer into s's buffer, s is destroyed when the function returns, and the caller reads freed memory. The rule from Professional C++: never return a string_view that refers to a local or temporary string; return std::string instead."
    },
    {
      "type": "mcq",
      "tag": "substr semantics",
      "question": "How does std::string_view::substr differ from std::string::substr?",
      "options": [
        "string_view::substr returns another view over the same character data in O(1) with no allocation, while string::substr copies the characters into a newly allocated std::string",
        "They are identical; both return a std::string containing the requested characters",
        "string_view::substr additionally null-terminates the result so it can be passed to C APIs",
        "string_view::substr modifies the view in place, like remove_prefix and remove_suffix do"
      ],
      "answer": 0,
      "explain": "A string_view is just a pointer plus a length, so its substr merely adjusts those two values and returns a new view — constant time, zero allocation, but still tied to the original data's lifetime. std::string::substr performs a real copy, which is safer lifetime-wise but costs an allocation. This is why parsing code that slices strings heavily prefers string_view."
    },
    {
      "type": "code",
      "tag": "string_view",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string_view>\n\nint main() {\n    std::string_view sv{\"  trim me  \"};\n    sv.remove_prefix(2);\n    sv.remove_suffix(2);\n    std::cout << '[' << sv << ']';\n}",
      "options": [
        "[  trim me]",
        "[trim me  ]",
        "[trim me]",
        "[im me]"
      ],
      "answer": 2,
      "explain": "remove_prefix(2) advances the view's start pointer past the two leading spaces, and remove_suffix(2) shrinks its length by two, dropping the trailing spaces. The underlying characters are untouched — only the window moves — which is why these members exist on string_view but not on std::string. Note that after such trimming the view is no longer null-terminated at its logical end."
    },
    {
      "type": "mcq",
      "tag": "parameter passing",
      "question": "Why does Professional C++ recommend std::string_view over const std::string& for read-only string parameters?",
      "options": [
        "string_view is guaranteed null-terminated, so it is safer to pass around",
        "Passing a string literal or const char* to a const std::string& parameter materializes a temporary std::string (a possible heap allocation), while string_view wraps the existing characters directly",
        "string_view prevents the callee from copying the data, guaranteeing better performance in all cases",
        "A const std::string& parameter cannot bind to temporaries, so literals would not compile"
      ],
      "answer": 1,
      "explain": "When the caller has a literal or char buffer, a const string& parameter forces construction of a temporary std::string, potentially allocating just to read characters that already exist. A string_view parameter accepts std::string, literals, and pointer/length pairs uniformly without any copy. The other options are false: string_view is not null-terminated, and const references bind to temporaries just fine."
    },
    {
      "type": "mcq",
      "tag": "string_view pitfalls",
      "question": "In which situation is std::string_view a poor choice as a function parameter type?",
      "options": [
        "When callers will mostly pass string literals",
        "When the function only reads the characters without modifying them",
        "When the function needs to know the length of the text",
        "When the function forwards the characters to a C API that requires a null-terminated string"
      ],
      "answer": 3,
      "explain": "string_view::data() is not guaranteed to point at a null-terminated sequence — a view produced by substr or remove_suffix ends mid-buffer. To call a C API you would have to copy into a std::string anyway to get c_str(), so you may as well take const std::string& (or std::string by value if you store it). The other scenarios are exactly where string_view shines."
    },
    {
      "type": "code",
      "tag": "std::format",
      "question": "What does this program print?",
      "code": "#include <format>\n#include <iostream>\n\nint main() {\n    std::cout << std::format(\"{1}, {0}!\", \"World\", \"Hello\");\n}",
      "options": [
        "Hello, World!",
        "World, Hello!",
        "Nothing — it throws std::format_error at runtime",
        "It fails to compile: positional indices must appear in increasing order"
      ],
      "answer": 0,
      "explain": "Explicit indices in the format string select arguments by position: {1} picks the second argument (\"Hello\") and {0} the first (\"World\"), so the output is \"Hello, World!\". Reordering like this is a key advantage of std::format over iostream chaining, especially for localization. You may not mix automatic {} and manual {n} indexing in one format string, but using only manual indices in any order is perfectly valid."
    },
    {
      "type": "code",
      "tag": "format specifiers",
      "question": "What does this program print?",
      "code": "#include <format>\n#include <iostream>\n\nint main() {\n    std::cout << std::format(\"[{:*^7}]\", 42);\n}",
      "options": [
        "[***42**]",
        "[*****42]",
        "[**42***]",
        "[42*****]"
      ],
      "answer": 2,
      "explain": "The specifier reads: fill with '*', align centered (^), in a field of width 7. \"42\" needs 5 fill characters; for center alignment the fill is split with the extra character going to the right, giving two stars on the left and three on the right. With > the value would be right-aligned (fill on the left), and with < left-aligned."
    },
    {
      "type": "mcq",
      "tag": "format errors",
      "question": "With a conforming C++20 implementation (P2216 applied, as shipped by GCC, Clang, and MSVC), what happens for: auto s = std::format(\"{:d}\", \"hi\");",
      "options": [
        "It compiles but throws std::format_error at runtime",
        "It fails to compile: the format string is a compile-time constant and is checked against the argument types, and {:d} is invalid for a string argument",
        "It prints 0, because the string cannot be parsed as a number",
        "It prints \"hi\"; incompatible specifiers are silently ignored"
      ],
      "answer": 1,
      "explain": "std::format requires its format string to be a constant expression and validates every replacement field against the corresponding argument type at compile time, so a type/specifier mismatch is a hard compile error, not an exception. Runtime-supplied format strings must go through std::vformat (or C++26 std::runtime_format), and only those paths report bad format strings by throwing std::format_error."
    },
    {
      "type": "code",
      "tag": "format precision",
      "question": "What does this program print?",
      "code": "#include <format>\n#include <iostream>\n#include <string>\n\nint main() {\n    std::cout << std::format(\"{:.3}\", std::string(\"formatting\"));\n}",
      "options": [
        "formatting",
        "fo",
        "ing",
        "for"
      ],
      "answer": 3,
      "explain": "For string arguments, the precision field means 'use at most this many characters', so {:.3} truncates \"formatting\" to its first three characters. This mirrors printf's \"%.3s\" and is genuinely useful for fixed-width tabular output. For floating-point arguments the same syntax instead controls the number of digits."
    },
    {
      "type": "code",
      "tag": "stoi",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::cout << std::stoi(\"42abc\");\n}",
      "options": [
        "42",
        "0",
        "Nothing — it throws std::invalid_argument",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "std::stoi converts the longest valid leading numeric prefix and simply stops at the first character that cannot be part of the number, so \"42abc\" yields 42 with no error. It throws std::invalid_argument only when no conversion is possible at all (e.g. \"abc\") and std::out_of_range when the value does not fit. If you need to detect trailing junk, pass a pos out-parameter and check it, or use std::from_chars."
    },
    {
      "type": "mcq",
      "tag": "from_chars",
      "question": "Which statement correctly contrasts std::from_chars with std::stoi?",
      "options": [
        "from_chars throws std::invalid_argument on bad input, whereas stoi returns an error code",
        "from_chars requires a std::string argument, whereas stoi works on raw character pointers",
        "from_chars is non-throwing, non-allocating, and locale-independent, reporting errors through a std::errc in its result; stoi takes a std::string and reports failure by throwing exceptions",
        "They behave identically except that from_chars is deprecated in C++20"
      ],
      "answer": 2,
      "explain": "std::from_chars (from <charconv>) was designed for high-performance parsing: it works on a raw [first, last) character range, never allocates, ignores the locale, and returns a from_chars_result whose ec member is std::errc{} on success, errc::invalid_argument, or errc::result_out_of_range. stoi is the convenient but heavier option: it needs a std::string and signals failure via exceptions. Professional C++ recommends from_chars for perfect round-tripping and speed-critical code."
    },
    {
      "type": "code",
      "tag": "from_chars",
      "question": "What does this program print?",
      "code": "#include <charconv>\n#include <iostream>\n\nint main() {\n    const char str[] = \"42abc\";\n    int v = 0;\n    auto res = std::from_chars(str, str + 5, v);\n    std::cout << v << ' ' << (res.ec == std::errc{});\n}",
      "options": [
        "0 0",
        "42 1",
        "42 0",
        "Nothing — it throws std::invalid_argument"
      ],
      "answer": 1,
      "explain": "from_chars parses the leading \"42\", stores 42 in v, and stops at 'a'; res.ptr points at the first unparsed character. Parsing a valid prefix counts as success, so res.ec is a value-initialized std::errc (which compares equal to std::errc{}) and the boolean prints 1. from_chars never throws — errors are communicated purely through the result struct."
    },
    {
      "type": "code",
      "tag": "raw string literals",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nint main() {\n    std::cout << R\"(C:\\temp\\newfile.txt)\";\n}",
      "options": [
        "C:\\temp\\newfile.txt",
        "C:{tab}emp followed by a line break and \"ewfile.txt\", because \\t and \\n are processed",
        "It fails to compile: backslashes must still be escaped inside raw string literals",
        "C:tempnewfile.txt with the backslashes removed"
      ],
      "answer": 0,
      "explain": "Inside a raw string literal R\"(...)\" no escape sequences are processed: every character between the delimiters, including backslashes, is taken verbatim. That makes raw literals ideal for Windows paths and regular expressions, where the equivalent normal literal would need doubled backslashes (\"C:\\\\temp\\\\newfile.txt\"). Line breaks typed inside a raw literal also become part of the string as-is."
    },
    {
      "type": "mcq",
      "tag": "raw string literals",
      "question": "Your raw string literal must itself contain the character sequence )\" (a closing parenthesis followed by a double quote). How do you write it?",
      "options": [
        "Escape it with a backslash, as in R\"( ... \\)\" ... )\"",
        "You cannot; such text requires a normal string literal with escapes",
        "Double the closing parenthesis so the compiler treats the first one as literal text",
        "Use a custom delimiter, e.g. R\"x( ... )\" ... )x\", so only )x\" terminates the literal"
      ],
      "answer": 3,
      "explain": "Raw string literals support an optional delimiter of up to 16 characters between the quote and the parenthesis: R\"delim(...)delim\". The literal ends only at the exact sequence )delim\", so choosing a delimiter that does not occur in the content lets you embed )\" freely. Backslash escapes are not an option, since raw literals by definition do not process them."
    },
    {
      "type": "mcq",
      "tag": "char8_t",
      "question": "Which statement about the u8\"...\" literal is true in C++20?",
      "options": [
        "It still has type const char[N], exactly as in C++17",
        "Its type is const char8_t[N]; it no longer implicitly converts to const char*, and streaming it to std::cout is ill-formed because that operator<< overload is deleted",
        "char8_t is just a type alias for unsigned char, so no code changes are needed",
        "u8 literals are encoded as UTF-16 code units in C++20"
      ],
      "answer": 1,
      "explain": "C++20 introduced char8_t as a distinct type for UTF-8 code units and changed the type of u8 literals from const char[N] to const char8_t[N]. This is a breaking change: const char* p = u8\"text\"; compiles in C++17 but not in C++20, and the operator<< overloads for char8_t pointers on the narrow streams are explicitly deleted. char8_t has the same size and representation as unsigned char but is a separate type for overloading purposes."
    },
    {
      "type": "code",
      "tag": "literal concatenation",
      "question": "What happens when you compile this program?",
      "code": "#include <string>\n\nint main() {\n    std::string s = \"Hello\" + \", World!\";\n    return static_cast<int>(s.size());\n}",
      "options": [
        "It compiles and s holds \"Hello, World!\"",
        "It compiles, but the result is garbage because the two pointers are added numerically",
        "It fails to compile: both operands decay to const char*, and there is no operator+ that adds two pointers",
        "It compiles and s holds only \"Hello\""
      ],
      "answer": 2,
      "explain": "String literals are arrays that decay to const char*, and adding two pointers is not a defined operation, so the compiler rejects the expression outright — the std::string operator+ overloads never come into play because neither operand is a std::string. Fixes include making one operand a std::string (std::string{\"Hello\"} + \", World!\"), using a \"s\" literal suffix, or simply juxtaposing the literals (\"Hello\" \", World!\"), which the preprocessor-free translation phase concatenates."
    },
    {
      "type": "mcq",
      "tag": "concatenation performance",
      "question": "You build a large string by appending thousands of small pieces in a loop. What is the recommended approach?",
      "options": [
        "Call reserve() up front with an estimate of the final size, then append each piece with += or append(), which reuse the string's existing buffer",
        "Write result = result + piece; each iteration — the compiler is required to eliminate the temporaries",
        "Rely on copy-on-write: since C++11, std::string copies share their buffer, so the concatenation cost is negligible",
        "Convert everything to const char* buffers and combine them with strcat for maximum speed"
      ],
      "answer": 0,
      "explain": "operator+ in the form result = result + piece constructs a fresh temporary each iteration and then assigns it — allocations and copies the compiler is not obliged to remove — whereas += and append grow the existing buffer in place, and reserve() prevents even the amortized reallocation-and-copy cycles. COW string implementations have been non-conforming since C++11. strcat adds buffer-management and safety problems without solving the repeated-copy issue."
    },
    {
      "type": "mcq",
      "tag": "custom formatter",
      "question": "You want std::format(\"{}\", point) to work for your own class Point. What is the standard mechanism?",
      "options": [
        "Overload operator<< for std::ostream; std::format automatically falls back to it",
        "Specialize std::to_string for Point",
        "Nothing is needed — std::format uses reflection to print public members",
        "Specialize std::formatter<Point> and implement its parse() and format() member functions"
      ],
      "answer": 3,
      "explain": "std::format finds formatting logic for a type through the std::formatter<T> specialization: parse() consumes any custom specifier text between the colon and the closing brace and typically stores options, and format() writes the value through the format context's output iterator (often by delegating with std::format_to). Unlike some libraries, std::format deliberately does not fall back to operator<<; a type without a formatter specialization simply fails to compile."
    },
    {
      "type": "code",
      "tag": "starts_with/ends_with",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s{\"archive.tmp.txt\"};\n    std::cout << s.starts_with(\"arch\")\n              << s.ends_with(\".tmp\")\n              << s.ends_with(\".txt\");\n}",
      "options": [
        "111",
        "101",
        "100",
        "001"
      ],
      "answer": 1,
      "explain": "starts_with and ends_with (added in C++20 for both std::string and std::string_view) test only the extreme ends of the string. \"archive.tmp.txt\" begins with \"arch\" (true, 1) and ends with \".txt\" (true, 1); \".tmp\" appears in the middle, so ends_with(\".tmp\") is false (0). Without std::boolalpha the bools print as 1 and 0, giving 101 — a middle match would need find or C++23's contains."
    },
    {
      "type": "mcq",
      "tag": "contains",
      "question": "Regarding s.contains(\"needle\") on a std::string, which statement is correct?",
      "options": [
        "contains has been available since C++11 alongside find",
        "contains was never standardized; you need Boost for substring tests",
        "contains was added in C++23; in C++20 you express the same test as s.find(\"needle\") != std::string::npos",
        "contains only accepts a single character, not a substring"
      ],
      "answer": 2,
      "explain": "C++20 added starts_with/ends_with, but a plain substring membership test had to wait for C++23's contains, which accepts a string_view, a C string, or a single char. Until then the idiomatic spelling is comparing find's result against std::string::npos. Knowing which of these members landed in which standard matters when you target a C++20 toolchain."
    },
    {
      "type": "code",
      "tag": "c_str lifetime",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s = \"abc\";\n    const char* p = s.c_str();\n    s += \" - a considerably longer suffix that forces reallocation\";\n    std::cout << p;\n}",
      "options": [
        "Undefined behavior: the append can reallocate the string's buffer, leaving p pointing at freed memory",
        "Guaranteed to print \"abc\", because c_str() returns a stable snapshot",
        "Guaranteed to print the full appended string, because p tracks the string",
        "Compile error: c_str() cannot be stored while the string is non-const"
      ],
      "answer": 0,
      "explain": "c_str() returns a pointer into the string's current internal buffer, not a copy. Any operation that can reallocate — appending beyond capacity, reserve, assignment — invalidates that pointer, and here the long append certainly exceeds the SSO/initial capacity. The safe pattern is to call c_str() at the point of use (e.g. directly in the C API call) and never cache the pointer across mutations; the same invalidation rule also breaks code like the classic getString().c_str() dangling-temporary bug."
    },
    {
      "type": "code",
      "tag": "to_string",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::cout << std::to_string(3.14);\n}",
      "options": [
        "3.14",
        "3.140000",
        "3.1400000000000001",
        "An implementation-defined scientific-notation form such as 3.14e+00"
      ],
      "answer": 1,
      "explain": "std::to_string(double) is specified to produce the same text as printf's \"%f\", i.e. fixed notation with exactly six digits after the decimal point, so 3.14 becomes \"3.140000\". That fixed format can both pad with useless zeros and lose precision for very large or tiny values. For a shortest round-trip representation, use std::format(\"{}\", value) or std::to_chars instead."
    },
    {
      "type": "code",
      "tag": "iterator invalidation",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s = \"hello\";\n    auto it = s.begin();\n    s.reserve(200);\n    std::cout << *it;\n}",
      "options": [
        "Guaranteed to print h — reserve only changes capacity, so existing iterators remain valid",
        "Compile error: you may not call reserve() while an iterator into the string exists",
        "Undefined behavior: reserve(200) exceeds the current capacity, forcing a reallocation that invalidates every previously obtained iterator, pointer, and reference into the string",
        "Prints h for SSO strings and a random character otherwise — both outcomes are well-defined"
      ],
      "answer": 2,
      "explain": "Any operation that increases capacity — reserve, or an append that overflows the current buffer — may move the characters to new storage, and the standard says all iterators, pointers, and references into the string are invalidated. Dereferencing it afterwards is undefined behavior, so this cannot be verified by running it: in practice it may even appear to work, which is what makes the bug so insidious. Re-acquire iterators after any capacity-changing call."
    },
    {
      "type": "mcq",
      "tag": "reserve shrink",
      "question": "A std::string s currently has size() == 5 and capacity() == 120. In C++20, what is the effect of calling s.reserve(10)?",
      "options": [
        "Capacity is reduced to exactly 10, which is safe because size() is smaller",
        "Nothing at all — since C++20, calling reserve() with an argument at or below the current capacity is specified to have no effect; reserve can never shrink a string",
        "It is a non-binding shrink request, so the implementation may reduce the capacity",
        "Undefined behavior, because the argument is smaller than the current capacity"
      ],
      "answer": 1,
      "explain": "Before C++20, reserve() with a small argument was a non-binding shrink request, which made its behavior unpredictable across implementations. C++20 (P0966) changed reserve(n) to be a strict no-op whenever n is not greater than the current capacity, so it now only ever grows. To actually give memory back you must use the separate shrink_to_fit() request."
    },
    {
      "type": "code",
      "tag": "substr bounds",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <stdexcept>\n#include <string>\n\nint main() {\n    std::string s = \"abcdef\";\n    try {\n        std::cout << s.substr(4, 100) << ' ';\n        std::cout << s.substr(7);\n    } catch (const std::out_of_range&) {\n        std::cout << \"out_of_range\";\n    }\n}",
      "options": [
        "ef out_of_range",
        "out_of_range — a count that reaches past the end already throws in the first call",
        "ef  — substr starting past the end simply returns an empty string, nothing throws",
        "Undefined behavior: both calls read beyond the end of the buffer"
      ],
      "answer": 0,
      "explain": "substr's two parameters are checked very differently: the count is silently clamped to the available characters, so substr(4, 100) happily returns \"ef\", but a starting position greater than size() throws std::out_of_range, so substr(7) on a six-character string throws. Note that pos == size() is still legal and yields an empty string. This asymmetry trips up code that computes positions from find() results."
    },
    {
      "type": "mcq",
      "tag": "shrink_to_fit",
      "question": "After building a huge std::string and then erasing most of its contents, you call s.shrink_to_fit(). What does the standard guarantee?",
      "options": [
        "capacity() becomes exactly equal to size()",
        "capacity() drops to the SSO buffer size if the remaining text fits there, otherwise to size()",
        "The excess memory is freed immediately, and no iterators are invalidated",
        "Nothing — shrink_to_fit is a non-binding request to reduce capacity; the implementation may or may not comply, and if it does reallocate, all pointers, references, and iterators into the string are invalidated"
      ],
      "answer": 3,
      "explain": "shrink_to_fit is specified only as a request: implementations are free to ignore it, and there is no guarantee capacity() ends up equal to size(). If the implementation does honor it, the characters move to a smaller allocation, which invalidates everything pointing into the old buffer. It is the correct tool after trimming a string, since C++20 reserve() can no longer shrink."
    },
    {
      "type": "code",
      "tag": "explicit conversion",
      "question": "What happens when you compile this program?",
      "code": "#include <string>\n#include <string_view>\n\nint main() {\n    std::string_view sv = \"compact\";\n    std::string s = sv;\n}",
      "options": [
        "It compiles; string and string_view convert implicitly in both directions",
        "It fails to compile: the std::string constructor taking a string_view is explicit, so copy-initialization is rejected — you must write std::string s{sv}; (or use sv.data() and sv.size())",
        "It compiles, but s is empty because the view is not guaranteed to be null-terminated",
        "It fails to compile because a string_view cannot be initialized from a string literal"
      ],
      "answer": 1,
      "explain": "The conversion is deliberately asymmetric: string to string_view is implicit because it is cheap and safe, but string_view to string allocates and copies, so the committee made that constructor explicit to keep expensive conversions visible. Direct-initialization with braces or parentheses works fine. The same rule is why a function taking std::string will not silently accept a string_view argument."
    },
    {
      "type": "code",
      "tag": "heterogeneous compare",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n#include <string_view>\n\nint main() {\n    std::string str = \"abc\";\n    std::string_view sv = \"abc\";\n    std::cout << (str == sv) << (sv == \"abc\") << (\"abc\" == str);\n}",
      "options": [
        "011 — a string and a string_view never compare equal because they are distinct types",
        "It fails to compile: std::string and std::string_view share no comparison operator",
        "111",
        "101 — \"abc\" == str compares pointer addresses rather than characters"
      ],
      "answer": 2,
      "explain": "All three comparisons compare character contents and yield true. string and string_view compare directly thanks to the implicit string-to-string_view conversion feeding the string_view comparison operators, and comparisons against string literals go through overloads that treat the literal as text, never as a pointer address. This heterogeneous comparison support means no temporaries are created for any of these tests."
    },
    {
      "type": "mcq",
      "tag": "remove_prefix bounds",
      "question": "Given std::string_view sv = \"abc\"; what does the standard say about calling sv.remove_prefix(10)?",
      "options": [
        "It is undefined behavior — remove_prefix has the precondition n <= size(), and the standard specifies neither clamping nor an exception when it is violated",
        "The view becomes empty; excess amounts are clamped, like substr's count parameter",
        "It throws std::out_of_range, just like at() does",
        "The view's data pointer wraps around, producing an empty but valid view"
      ],
      "answer": 0,
      "explain": "remove_prefix and remove_suffix are the fastest possible operations — a pointer bump and a length adjustment — precisely because they perform no checking at all; passing a count larger than size() violates their precondition and is undefined behavior. This contrasts with substr, whose count is clamped and whose out-of-range position throws. Guard trim loops with sv.empty() or compare against size() first."
    },
    {
      "type": "code",
      "tag": "npos arithmetic",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s = \"no colon here\";\n    std::cout << s.substr(s.find(':') + 1);\n}",
      "options": [
        "It throws std::out_of_range, because find returned npos and npos + 1 is past the end",
        "An empty string — substr starting at npos + 1 yields no characters",
        "o colon here — the failed search falls back to position 0, and 1 is then added",
        "no colon here — find returns npos (the largest size_t value), npos + 1 wraps around to 0, so the call is substr(0) and returns the entire string"
      ],
      "answer": 3,
      "explain": "npos is defined as size_type(-1), the maximum unsigned value, so adding 1 wraps to exactly 0 — and substr(0) silently returns the whole string instead of signaling the failed search. This 'skip past the delimiter' idiom is only correct when the delimiter is known to exist. Always compare find's result against npos before doing arithmetic on it."
    },
    {
      "type": "code",
      "tag": "unsigned find result",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s = \"hello\";\n    if (s.find('z') >= 0)\n        std::cout << \"found\";\n    else\n        std::cout << \"not found\";\n}",
      "options": [
        "found — find returns the unsigned type std::string::size_type, so the comparison >= 0 is tautologically true even when the character is absent",
        "not found",
        "It fails to compile: comparing an unsigned value against 0 with >= is ill-formed",
        "Unspecified — the result depends on how the implementation encodes npos"
      ],
      "answer": 0,
      "explain": "find never returns a negative value: on failure it returns npos, which as an unsigned quantity is still >= 0, so this test always takes the \"found\" branch. Compilers typically emit a tautological-comparison warning here, which is worth treating as an error. The correct test is s.find('z') != std::string::npos, or s.contains('z') in C++23."
    },
    {
      "type": "code",
      "tag": "default alignment",
      "question": "What does this program print?",
      "code": "#include <format>\n#include <iostream>\n\nint main() {\n    std::cout << std::format(\"[{:6}]\", 42)\n              << std::format(\"[{:6}]\", \"hi\");\n}",
      "options": [
        "[42    ][    hi]",
        "[    42][hi    ]",
        "[    42][    hi]",
        "[42    ][hi    ]"
      ],
      "answer": 1,
      "explain": "When a width is given without an explicit alignment, std::format uses type-dependent defaults: arithmetic types are right-aligned (like columns of numbers) while strings and characters are left-aligned. That is why 42 gets its padding on the left and \"hi\" gets it on the right. Explicit <, >, or ^ specifiers override these defaults."
    },
    {
      "type": "mcq",
      "tag": "zero padding",
      "question": "What string does std::format(\"{:06}\", -42) produce?",
      "options": [
        "000-42 — the padding is inserted before the entire formatted value",
        "-42 padded with three trailing zeros",
        "-00042 — the 0 flag pads with zeros after the sign, so the result stays numerically readable",
        "It throws std::format_error: zero padding requires an explicit alignment specifier"
      ],
      "answer": 2,
      "explain": "The 0 flag enables sign-aware zero padding: the zeros are inserted between the sign (or 0x-style prefix) and the digits, which is equivalent to a zero fill with internal alignment. A plain fill character, by contrast, would go before the sign. If you specify an explicit alignment such as > together with 0, the 0 flag is ignored."
    },
    {
      "type": "code",
      "tag": "sign and alternate form",
      "question": "What does this program print?",
      "code": "#include <format>\n#include <iostream>\n\nint main() {\n    std::cout << std::format(\"{:+d} {:#x}\", 42, 255);\n}",
      "options": [
        "42 ff",
        "+42 ff",
        "42 0xff",
        "+42 0xff"
      ],
      "answer": 3,
      "explain": "The + option forces a sign even for non-negative numbers, so 42 becomes +42 — useful for diffs and deltas. The # alternate-form option prepends the base prefix for integer presentations: 0x for hex, 0 for octal, 0b for binary; 255 in {:#x} therefore prints as 0xff. Use {:#X} to get both the prefix and the digits in uppercase."
    },
    {
      "type": "code",
      "tag": "runtime width",
      "question": "What does this program print?",
      "code": "#include <format>\n#include <iostream>\n\nint main() {\n    std::cout << std::format(\"[{:>{}}]\", \"ab\", 5);\n}",
      "options": [
        "[   ab]",
        "[ab   ]",
        "It throws std::format_error: the field width must be a literal number in the format string",
        "[{}ab]"
      ],
      "answer": 0,
      "explain": "A nested {} in the width position takes the width from the next argument, here 5, so the field is five characters wide; the > forces right alignment, overriding the left-align default for strings, giving three leading spaces. Precision can be supplied the same way with .{}. This is how you build tables whose column widths are computed at runtime without assembling format strings dynamically."
    },
    {
      "type": "mcq",
      "tag": "brace escaping",
      "question": "You need std::format to emit literal brace characters, e.g. the exact text {id}. How do you write the format string?",
      "options": [
        "Escape each brace with a backslash: \"\\\\{id\\\\}\"",
        "Double the braces: {{ produces a literal { and }} produces a literal }, so std::format(\"{{{}}}\", x) yields the value of x wrapped in braces",
        "Use the %{ and %} escapes carried over from printf",
        "It is impossible; braces are reserved, so literal braces must be concatenated on afterwards"
      ],
      "answer": 1,
      "explain": "std::format follows the same escaping rule as Python and {fmt}: doubling a brace produces one literal brace. So \"{{{}}}\" parses as {{ (literal {), {} (a replacement field), and }} (literal }); with the argument 5 it produces \"{5}\". Backslash escapes have no special meaning to the format parser."
    },
    {
      "type": "code",
      "tag": "mixed indexing",
      "question": "What happens when you compile this program with a conforming C++20 implementation?",
      "code": "#include <format>\n\nint main() {\n    auto s = std::format(\"{0} {}\", 1, 2);\n}",
      "options": [
        "It prints 1 2 — after an explicit index, automatic numbering resumes with the next unused argument",
        "It compiles, but throws std::format_error at runtime",
        "It fails to compile: a format string must use either automatic {} numbering or manual {n} indexing, never both, and the compile-time format-string check rejects the mix",
        "It prints 1 1 — the automatic {} restarts counting from argument zero"
      ],
      "answer": 2,
      "explain": "Mixing automatic and manual argument indexing within one format string is invalid; you must commit to one style. Because std::format's format string is a constant expression checked at compile time, the error surfaces as a compilation failure rather than an exception. The same string passed to std::vformat would instead throw std::format_error at runtime."
    },
    {
      "type": "mcq",
      "tag": "formatting bool",
      "question": "What does std::format(\"{} {:d}\", true, false) return?",
      "options": [
        "1 0",
        "true false",
        "1 false",
        "true 0"
      ],
      "answer": 3,
      "explain": "The default presentation for bool is textual, so {} on true yields \"true\". The d presentation type formats a bool as an integer instead, so {:d} on false yields \"0\"; conversely {:s} explicitly requests the textual form. This differs from iostreams, where bools print as 1 and 0 unless std::boolalpha is set."
    },
    {
      "type": "mcq",
      "tag": "formatting pointers",
      "question": "Given int x = 5; int* p = &x; what happens with std::format(\"{}\", p)?",
      "options": [
        "It fails to compile: among pointer types, std::formatter is specialized only for void*, const void*, and nullptr_t, so an int* must be cast first, e.g. static_cast<void*>(p)",
        "It prints the pointee value 5, following the pointer automatically",
        "It prints the address in hexadecimal, exactly like std::cout << p would",
        "It compiles but throws std::format_error because no presentation type was given"
      ],
      "answer": 0,
      "explain": "std::format deliberately refuses arbitrary object pointers: only void pointers (and nullptr_t) are formattable, using the p presentation, so you must make the intent to print an address explicit with a cast. This avoids the iostream pitfall where a const char* prints as a C string while every other pointer prints as an address. Attempting it with int* selects a disabled formatter and the code simply does not compile."
    },
    {
      "type": "mcq",
      "tag": "locale-aware format",
      "question": "What does the L option do in a std::format specifier, e.g. std::format(loc, \"{:L}\", 1234567)?",
      "options": [
        "It left-aligns the value; L is a synonym for <",
        "It enables locale-specific formatting: paired with the locale-taking overload (or the global locale otherwise), the integer is printed with that locale's digit grouping, e.g. 1,234,567 under en_US",
        "It formats the number as a long, widening the argument before conversion",
        "It switches integer output to lowercase hexadecimal"
      ],
      "answer": 1,
      "explain": "By design std::format is locale-independent unless you opt in, so output is reproducible across machines by default. The L option is that opt-in: integers gain digit-group separators, floating-point values use the locale decimal point, and bools use the locale-specific true/false names. Pass the locale explicitly as the first argument to format, or the global locale is used."
    },
    {
      "type": "code",
      "tag": "vformat errors",
      "question": "What does this program print?",
      "code": "#include <format>\n#include <iostream>\n#include <string>\n\nint main() {\n    std::string fmt = \"{:d}\";\n    std::string value = \"hi\";\n    try {\n        std::cout << std::vformat(fmt, std::make_format_args(value));\n    } catch (const std::format_error&) {\n        std::cout << \"format_error\";\n    }\n}",
      "options": [
        "hi — {:d} falls back to the default presentation for non-integer arguments",
        "It fails to compile: format strings must be compile-time constants",
        "format_error — vformat accepts a runtime format string, so the invalid combination of {:d} with a string argument is detected only at runtime and reported by throwing std::format_error",
        "0 — the string is converted to an integer, which fails and yields zero"
      ],
      "answer": 2,
      "explain": "vformat is the escape hatch from std::format's compile-time checking: the format string is an ordinary runtime value and the arguments travel in a type-erased std::format_args bundle built by make_format_args. Validation therefore happens during the call, and a specifier that does not match the argument type — d applied to a string here — throws std::format_error, which the handler turns into the printed text."
    },
    {
      "type": "mcq",
      "tag": "runtime format strings",
      "question": "Your application loads translated message templates from resource files at runtime. Why can't they be passed straight to std::format, and what is the standard route?",
      "options": [
        "They can be: std::format accepts any std::string as its format string",
        "Cast the string to std::string_view first; that disables the compile-time check",
        "Runtime format strings require the third-party {fmt} library; the standard offers nothing",
        "std::format requires its format string to be a constant expression so it can be checked at compile time; runtime strings must go through std::vformat(fmt, std::make_format_args(args...)), with std::format_error handled at the call site"
      ],
      "answer": 3,
      "explain": "std::format's first parameter is a std::format_string, whose consteval constructor forces the string to be known — and validated — at compile time, which is impossible for text loaded from files. vformat plus make_format_args is the sanctioned runtime path (C++26 adds std::runtime_format as sugar for it). One caution: use the result of make_format_args immediately in the call; storing it dangles, since it holds references to the arguments."
    },
    {
      "type": "mcq",
      "tag": "formatter parse contract",
      "question": "You are writing a std::formatter<T> specialization. What is the contract of its parse(ctx) member?",
      "options": [
        "It receives the characters between the colon and the closing brace of the replacement field, must interpret (and typically store) those specifiers in the formatter object, and must return an iterator pointing at the terminating } of the field",
        "It receives the entire format string and returns the fully formatted text",
        "It returns a bool that tells the library whether format() needs to be called at all",
        "It writes the value to ctx.out() and returns the number of characters it produced"
      ],
      "answer": 0,
      "explain": "parse and format split the work: parse runs over the specifier characters (for \"{:>10}\" it sees \">10\") and records the options as data members, then format(value, ctx) uses those options to write characters through ctx.out(). Returning an iterator to the closing brace is how the library knows where your specifiers ended; report bad specifiers by throwing std::format_error. A convenient shortcut for string-like output is deriving your specialization from std::formatter<std::string_view> and reusing its parse."
    },
    {
      "type": "code",
      "tag": "format_to",
      "question": "What does this program print?",
      "code": "#include <format>\n#include <iostream>\n#include <iterator>\n#include <string>\n\nint main() {\n    std::string out;\n    std::format_to(std::back_inserter(out), \"{}-{}\", \"id\", 42);\n    std::cout << out << ' ' << out.size();\n}",
      "options": [
        "id-42 6 — format_to also appends a null terminator that counts toward size()",
        "id-42 5",
        "It fails to compile: format_to requires a pre-sized character buffer, not a back_inserter",
        "-42 3 — the string argument is skipped because out started empty"
      ],
      "answer": 1,
      "explain": "format_to writes the formatted characters through any output iterator instead of building a new string, so back_inserter appends \"id-42\" — five characters — directly onto out; no separate temporary string is created and no null terminator is added to the count. Related tools: formatted_size() lets you pre-reserve exactly the needed space, and format_to_n() caps the number of characters written."
    },
    {
      "type": "code",
      "tag": "to_chars overflow",
      "question": "What does this program print?",
      "code": "#include <charconv>\n#include <iostream>\n\nint main() {\n    char buf[3];\n    auto res = std::to_chars(buf, buf + 3, 123456);\n    std::cout << (res.ec == std::errc::value_too_large);\n}",
      "options": [
        "Undefined behavior — to_chars writes past the end of buf",
        "0 — to_chars writes the three digits that fit and reports success",
        "1 — to_chars detects that the buffer cannot hold the full value and returns errc::value_too_large without producing a usable result",
        "Nothing; to_chars throws std::length_error when the buffer is too small"
      ],
      "answer": 2,
      "explain": "to_chars never writes outside the [first, last) range you give it: when the value needs more room, it fails with errc::value_too_large, and in that case the buffer contents are unspecified — you must not use them. It also never throws and never allocates, which is the point of the charconv API. On success, res.ptr marks one-past-the-last character written, and there is no null terminator."
    },
    {
      "type": "mcq",
      "tag": "to_chars guarantees",
      "question": "Which statement about std::to_chars is correct?",
      "options": [
        "It appends a null terminator so the buffer can be passed directly to C APIs",
        "It honors the global locale's decimal separator for floating-point values",
        "It reports an overflowing value by throwing std::out_of_range",
        "For floating-point values it emits the shortest string that round-trips exactly back to the same value via from_chars — and it writes no null terminator, so the returned ptr is the only way to know where the text ends"
      ],
      "answer": 3,
      "explain": "The charconv functions were specified for fast, exact, reproducible conversion: no locale involvement, no exceptions, no allocation, and shortest-round-trip output for floating point, which neither printf nor to_string guarantees. Because nothing is null-terminated, the idiom is std::string(buf, res.ptr) or passing the length along explicitly. Error reporting happens solely through the ec member of the returned result."
    },
    {
      "type": "code",
      "tag": "from_chars plus sign",
      "question": "What does this program print?",
      "code": "#include <charconv>\n#include <iostream>\n\nint main() {\n    const char* s = \"+42\";\n    int value = 7;\n    auto res = std::from_chars(s, s + 3, value);\n    std::cout << value << ' ' << (res.ec == std::errc::invalid_argument);\n}",
      "options": [
        "7 1 — from_chars accepts an optional leading minus but never a plus sign, so parsing fails with errc::invalid_argument and value is left unmodified",
        "42 0 — the plus sign is consumed, just as stoi would",
        "0 1 — value is zeroed whenever parsing fails",
        "7 0 — the call succeeds but consumes zero characters"
      ],
      "answer": 0,
      "explain": "from_chars is stricter than the stoi/strtol family: it skips no whitespace and rejects a leading '+' (only '-' is allowed, and only for signed types), so \"+42\" matches no valid pattern at all. On failure ec is errc::invalid_argument and the output variable is guaranteed untouched, which is why 7 survives. If user input may legitimately carry a plus sign or padding, strip it before calling from_chars."
    },
    {
      "type": "code",
      "tag": "from_chars hex prefix",
      "question": "What does this program print?",
      "code": "#include <charconv>\n#include <iostream>\n\nint main() {\n    const char* s = \"0x2A\";\n    int value = -1;\n    auto res = std::from_chars(s, s + 4, value, 16);\n    std::cout << value << ' ' << (res.ptr - s);\n}",
      "options": [
        "42 4 — the 0x prefix is recognized because base 16 was requested",
        "0 1 — from_chars never accepts a 0x prefix; it parses the leading \"0\" as a complete hexadecimal number and stops at 'x', so value becomes 0 and res.ptr points just past the first character",
        "-1 0 — parsing fails outright and value keeps its previous contents",
        "0 4 — the whole token is consumed but evaluates to zero"
      ],
      "answer": 1,
      "explain": "Unlike strtol or stoi with base 16, from_chars expects bare digits: it reads the '0', hits the non-hex character 'x', and stops — a successful parse of the value 0 that consumed one character. The trap is that ec reports success, so code that ignores res.ptr silently gets 0 out of every \"0x...\" string. Skip the prefix yourself (or check res.ptr) when handling 0x-style input."
    },
    {
      "type": "code",
      "tag": "stoi base detection",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::cout << std::stoi(\"  0x2A\", nullptr, 0);\n}",
      "options": [
        "0 — with base 0 the leading zero selects octal, and parsing stops at the 'x'",
        "It throws std::invalid_argument because of the leading whitespace",
        "42 — stoi skips leading whitespace, and base 0 auto-detects the base from the prefix: 0x means hexadecimal, a bare leading 0 means octal, otherwise decimal",
        "It throws std::invalid_argument: 0 is not a valid base argument"
      ],
      "answer": 2,
      "explain": "stoi inherits strtol semantics: leading whitespace is skipped, an optional sign is accepted, and the special base 0 infers the base from the text, so \"0x2A\" parses as hexadecimal 42. Every one of those conveniences is absent from std::from_chars, which takes only explicit bases 2 through 36 and no prefixes. Knowing which behaviors belong to which API prevents subtle porting bugs between the two."
    },
    {
      "type": "mcq",
      "tag": "stod and locale",
      "question": "Your program runs with the global C locale set to German (de_DE), where the decimal separator is a comma. Which statement about parsing \"3,14\" is true?",
      "options": [
        "std::stod and std::from_chars both yield 3.14",
        "Both stop at the comma and yield 3.0",
        "std::from_chars follows the locale while std::stod does not",
        "std::stod goes through strtod, which is locale-sensitive, so under de_DE it can parse \"3,14\" as 3.14 — while std::from_chars is locale-independent, always expects '.', and parses only the leading 3"
      ],
      "answer": 3,
      "explain": "The sto* family delegates to the C strto* functions, whose numeric parsing honors the current C locale — behavior that changes under the user's regional settings. from_chars was specified to ignore locales entirely, always using '.' as the decimal point, which makes it the right choice for machine-readable data files and network protocols. Use locale-aware parsing only for text typed by end users."
    },
    {
      "type": "mcq",
      "tag": "named locales",
      "question": "What is the difference between std::locale(\"\") and std::locale::classic()?",
      "options": [
        "std::locale(\"\") constructs the user's preferred native locale from the program's environment settings, while classic() always returns the locale-independent \"C\" locale regardless of environment",
        "They are synonyms; both produce the \"C\" locale",
        "std::locale(\"\") is invalid — the locale name must be non-empty",
        "classic() returns whatever locale is currently imbued on std::cout"
      ],
      "answer": 0,
      "explain": "The empty name is special: it asks the runtime for the user's environment locale (from OS or environment settings), which is how you honor regional number, date, and currency conventions. classic() is the fixed \"C\" locale that every program starts with, giving reproducible machine-oriented formatting. Typical use is imbuing user-facing streams with locale(\"\") while keeping data files in the classic locale."
    },
    {
      "type": "mcq",
      "tag": "locale collation",
      "question": "How do you sort a vector<string> according to a locale's collation rules (for example, proper dictionary ordering of accented words)?",
      "options": [
        "std::sort with the default comparator is already locale-aware",
        "Pass a std::locale object as the comparison callable: std::sort(begin(words), end(words), std::locale(\"en_US.UTF-8\")) — locale provides an operator() that compares two strings using its collate facet",
        "Convert all the strings to lowercase first; collation only concerns letter case",
        "Use std::lexicographical_compare, which automatically consults the global locale"
      ],
      "answer": 1,
      "explain": "std::locale is itself a binary predicate over strings: its operator() delegates to the locale's collate facet, so a locale object can be dropped straight into sort as the comparator. The default string operator< compares raw character values and knows nothing about linguistic ordering, and lexicographical_compare is equally locale-blind. For finer control you can call use_facet<collate<char>>(loc).compare directly."
    },
    {
      "type": "mcq",
      "tag": "case-sensitive ordering",
      "question": "std::sort with the default comparator is applied to {\"apple\", \"Banana\", \"cherry\"}. What is the resulting order?",
      "options": [
        "apple, Banana, cherry — the default string comparison ignores case",
        "The order is unspecified: comparing mixed-case strings requires a locale",
        "Banana, apple, cherry — operator< compares raw character codes, and every uppercase ASCII letter (B is 66) sorts before every lowercase one (a is 97)",
        "apple, cherry, Banana — uppercase letters sort after all lowercase letters"
      ],
      "answer": 2,
      "explain": "Default string ordering is plain lexicographic comparison of char values, and in ASCII the entire uppercase block precedes the lowercase block, so \"Banana\" lands before \"apple\". The result is well-defined — just surprising to users expecting dictionary order. For human-facing ordering, compare through a locale's collation (or fold case explicitly) instead."
    },
    {
      "type": "mcq",
      "tag": "compare semantics",
      "question": "What does the standard guarantee about the int returned by a.compare(b) for std::string?",
      "options": [
        "It is exactly -1, 0, or +1",
        "It is the index of the first mismatching character, or -1 when the strings are equal",
        "It is the difference between the two lengths",
        "Only its sign is meaningful: negative when a orders before b, zero when equal, positive when after — code that tests result == -1 or result == 1 is relying on unspecified detail"
      ],
      "answer": 3,
      "explain": "compare follows the strcmp convention: the magnitude of the return value carries no meaning, only whether it is negative, zero, or positive, and implementations commonly return a character difference rather than a normalized ±1. Portable code writes result < 0, result == 0, or result > 0. In C++20 the three-way operator a <=> b offers the same information as a std::strong_ordering."
    },
    {
      "type": "mcq",
      "tag": "tolower sign trap",
      "question": "std::string s holds UTF-8 text, and on your platform plain char is signed. Why is calling std::tolower(s[i]) dangerous?",
      "options": [
        "Non-ASCII UTF-8 bytes come out as negative values through a signed char; std::tolower has undefined behavior unless its argument is representable as unsigned char or equals EOF, so the safe call is std::tolower(static_cast<unsigned char>(s[i]))",
        "tolower constructs a locale object on every call, which may throw",
        "tolower returns char, so its result cannot be stored back into the string",
        "Nothing — std::tolower is fully specified for every possible char value"
      ],
      "answer": 0,
      "explain": "The <cctype> functions take an int that must hold either EOF or a value in the unsigned char range; a byte like 0xC3 read through signed char becomes a negative number outside that range, making the call undefined behavior. The standard fix is casting through unsigned char before the call. Note also that byte-at-a-time case conversion is linguistically wrong for multi-byte UTF-8 sequences anyway — proper Unicode case mapping needs a library like ICU."
    },
    {
      "type": "code",
      "tag": "toupper return type",
      "question": "What does this program print?",
      "code": "#include <cctype>\n#include <iostream>\n\nint main() {\n    std::cout << std::toupper('a');\n}",
      "options": [
        "A",
        "65 — std::toupper returns int, and streaming an int prints its numeric value; printing the letter requires a cast such as static_cast<char>(std::toupper('a'))",
        "a — 'a' has no uppercase mapping in the default \"C\" locale",
        "97"
      ],
      "answer": 1,
      "explain": "toupper's return type is int (so the domain can include EOF), and operator<< dispatches on the static type, printing the character code 65 rather than the letter A. This bites hardest inside std::transform pipelines, where the int silently narrows back into the string, and in cout chains like this one. Cast the result back to char whenever you want a character."
    },
    {
      "type": "mcq",
      "tag": "wchar_t portability",
      "question": "Why is std::wstring problematic as a portable text representation?",
      "options": [
        "wstring cannot store characters outside the ASCII range",
        "wstring has been deprecated since C++17",
        "The size of wchar_t is implementation-defined: 16 bits on Windows (UTF-16 code units, so characters outside the BMP need surrogate pairs) but 32 bits on Linux and macOS (UTF-32) — the same wstring code has different semantics on each platform",
        "wchar_t is guaranteed to be 8 bits, making wstring identical to string"
      ],
      "answer": 2,
      "explain": "Because wchar_t's width varies, a wstring is a sequence of UTF-16 code units on Windows but UTF-32 code points on most Unix systems, so code that indexes or measures characters behaves differently across platforms. The practical guidance is to keep UTF-8 in std::string internally and convert at Windows API boundaries. When a fixed encoding matters, char16_t/u16string and char32_t/u32string have guaranteed unit sizes."
    },
    {
      "type": "mcq",
      "tag": "codecvt deprecation",
      "question": "You need to convert between a UTF-8 std::string and a UTF-16 std::u16string in standard C++20. What is the state of library support?",
      "options": [
        "std::wstring_convert with std::codecvt_utf8_utf16 is the recommended modern tool",
        "std::format performs encoding conversions via the {:u} specifier",
        "std::text_encoding in <text_encoding> converts between arbitrary encodings",
        "There is no good standard facility: std::wstring_convert and the codecvt_utf8* facets were deprecated in C++17 (and removed in C++26) with no replacement, so production code relies on platform APIs (such as MultiByteToWideChar) or libraries like ICU"
      ],
      "answer": 3,
      "explain": "The codecvt conversion utilities were deprecated because they were error-prone, hard to use securely, and silently mishandled invalid input; the committee removed them without shipping a successor. C++20 gives you the char8_t/u8string types to mark encodings but deliberately no transcoding functions. Until the standard grows one, use OS facilities or a dedicated Unicode library."
    },
    {
      "type": "code",
      "tag": "embedded nulls",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nusing namespace std::string_literals;\n\nint main() {\n    std::string a = \"ab\\0cd\";\n    auto b = \"ab\\0cd\"s;\n    std::cout << a.size() << ' ' << b.size();\n}",
      "options": [
        "2 5 — the const char* constructor measures the text with strlen semantics and stops at the embedded null, while the s literal operator uses the literal's compile-time size, keeping the null inside the string",
        "5 5",
        "2 2",
        "It fails to compile: string literals cannot contain \\0"
      ],
      "answer": 0,
      "explain": "A std::string is perfectly capable of holding embedded null characters — but the constructor taking only a const char* cannot know the array's length and stops at the first '\\0', so a gets just \"ab\". The \"s literal operator is defined with the pointer-plus-length constructor, so b keeps all five characters. The same truncation reappears on the way out whenever such a string is handed to a C API through c_str()."
    },
    {
      "type": "code",
      "tag": "sv literal constexpr",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string_view>\n\nusing namespace std::string_view_literals;\n\nint main() {\n    constexpr auto sv = \"interview\"sv;\n    static_assert(sv.ends_with(\"view\"));\n    std::cout << sv.size();\n}",
      "options": [
        "It fails to compile: string_view operations cannot appear in constant expressions",
        "9 — the sv literal produces a constexpr std::string_view, and its members, including C++20 ends_with, are constexpr, so the static_assert is evaluated entirely at compile time",
        "4 — the view is narrowed to the matched suffix",
        "It fails to compile: the sv literal suffix requires C++23"
      ],
      "answer": 1,
      "explain": "Because string_view never owns or allocates, essentially its whole interface is constexpr, and the sv literal (C++17) yields a constant view over the literal with the length baked in at compile time. ends_with arrived in C++20 and works in constant evaluation, so the assertion compiles away. This makes string_view the tool of choice for compile-time string processing where std::string is awkward."
    },
    {
      "type": "mcq",
      "tag": "CTAD deduction",
      "question": "After auto names = std::vector{\"John\", \"Sam\"}; what is the deduced type of names?",
      "options": [
        "std::vector<std::string>",
        "std::vector<std::string_view>",
        "std::vector<const char*> — class template argument deduction works from the literals' decayed type, so you get a vector of raw pointers; writing std::vector{\"John\"s, \"Sam\"s} deduces vector<std::string>",
        "The declaration does not compile: CTAD cannot deduce from string literals"
      ],
      "answer": 2,
      "explain": "String literals are arrays of const char that decay to const char*, so CTAD happily deduces vector<const char*> — pointers into the binary's literal storage, not string objects. The trap shows up later: element comparisons compare addresses, and no string operations are available. The \"s (or \"sv) literal suffixes are the concise fix when you actually want strings."
    },
    {
      "type": "code",
      "tag": "string plus string_view",
      "question": "What happens when you compile this program with -std=c++20?",
      "code": "#include <string>\n#include <string_view>\n\nint main() {\n    std::string s = \"a\";\n    std::string_view sv = \"b\";\n    auto r = s + sv;\n}",
      "options": [
        "It compiles; r is the std::string \"ab\"",
        "It compiles; r is a string_view over a temporary and immediately dangles",
        "It fails to compile because sv might not be null-terminated",
        "It fails to compile: through C++23 there is no operator+ taking a std::string and a std::string_view (one was only added for C++26); use s += sv, s.append(sv), or std::string(sv) instead"
      ],
      "answer": 3,
      "explain": "This is a notorious gap: operator+= and append gained string-view-friendly overloads, but operator+ did not, originally out of concern over ambiguities, so mixed concatenation with + simply fails to compile in C++20 and C++23. P2591, adopted for C++26, finally adds the missing operators. Until then, append to an existing string or materialize the view with std::string(sv) first."
    },
    {
      "type": "code",
      "tag": "views::split",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <ranges>\n#include <string_view>\n\nint main() {\n    std::string_view sv = \"a,,b,c\";\n    int count = 0;\n    for (auto part : std::views::split(sv, ','))\n        ++count;\n    std::cout << count;\n}",
      "options": [
        "4",
        "3 — adjacent delimiters are merged, so the empty token between them is skipped",
        "It fails to compile: the delimiter must itself be a range, such as \",\"sv",
        "1 — a single char cannot match, so the input is left as one token"
      ],
      "answer": 0,
      "explain": "views::split does not coalesce consecutive delimiters: the two commas in a row produce an empty piece between them, so the parts are \"a\", an empty range, \"b\", and \"c\" — four in total. A single element is a valid delimiter alongside a subrange pattern like \",\"sv. Code migrating from tokenizers such as strtok, which do skip runs of delimiters, must filter out the empty pieces explicitly."
    },
    {
      "type": "mcq",
      "tag": "split element type",
      "question": "When you iterate over std::views::split(sv, ' ') for a string_view sv, what is each element, and how do you obtain a string_view for it?",
      "options": [
        "Each element is already a std::string_view; no conversion is needed",
        "Each element is a subrange over the underlying characters, not a string_view; since it is contiguous you construct one explicitly — std::string_view{part.begin(), part.end()} with the C++20 iterator-pair constructor, or std::string_view{part} via the C++23 range constructor",
        "Each element is a std::string holding a copy of the token",
        "Each element is a pair of offsets (first, last) into the source view"
      ],
      "answer": 1,
      "explain": "split is lazy and copies nothing: each piece is a subrange whose iterators point back into the original characters, so the usual string_view conveniences (comparisons, find, printing) are not directly available on it. Wrapping the piece in a string_view is cheap and idiomatic, but the result still shares the source's lifetime. For input ranges that are not forward ranges there is the weaker views::lazy_split."
    },
    {
      "type": "code",
      "tag": "braced construction",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string a(3, 'x');\n    std::string b{3, 'x'};\n    std::cout << a.size() << ' ' << b.size();\n}",
      "options": [
        "3 3",
        "2 3",
        "3 2 — the parentheses select the (count, char) constructor, so a is \"xxx\", but braces prefer the initializer_list<char> constructor, so b holds exactly two characters: char(3) followed by 'x'",
        "It fails to compile: 3 cannot be narrowed to char inside a braced list"
      ],
      "answer": 2,
      "explain": "List-initialization gives an initializer_list constructor priority over every other constructor whenever the braced contents can form one, and {3, 'x'} can: the constant 3 converts to a char (an unprintable control character), joined by 'x'. The narrowing rule does not save you because 3 fits in char. This parentheses-versus-braces divergence mirrors the classic vector<int>(3, 5) versus vector<int>{3, 5} example and argues for parentheses when calling count-based constructors."
    },
    {
      "type": "code",
      "tag": "literal pointer arithmetic",
      "question": "What does this program print?",
      "code": "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World\" + 7;\n}",
      "options": [
        "Hello, World7",
        "It fails to compile: an int cannot be added to a string literal",
        "Hello, World followed by the number 7",
        "World — the literal decays to const char*, so + 7 is pointer arithmetic that skips the first seven characters and prints from there"
      ],
      "answer": 3,
      "explain": "No concatenation happens anywhere: the array \"Hello, World\" decays to a pointer and adding 7 advances it past \"Hello, \" to the 'W'. The code compiles cleanly and often ships, which is what makes accidental literal-plus-integer bugs nasty. When concatenation is intended, make one operand a std::string, use the \"s suffix, or use std::format."
    },
    {
      "type": "mcq",
      "tag": "literal storage duration",
      "question": "Is this function safe to call and use? const char* current() { return \"idle\"; }",
      "options": [
        "Yes — string literals have static storage duration, so the returned pointer remains valid for the entire program; contrast with returning c_str() of a local std::string, which dangles the moment the function returns",
        "No — the literal lives in current()'s stack frame and dies with it",
        "Only if the caller copies the text immediately into its own buffer",
        "It does not compile: a const char[5] cannot convert to const char*"
      ],
      "answer": 0,
      "explain": "String literals are objects with static storage duration, typically placed in a read-only data segment, so pointers to them never dangle. The array-to-pointer decay in the return statement is well-formed. The reason this question matters is its lookalike — returning str.c_str() for a local string — which produces an immediately dangling pointer; distinguishing the two cases is a standard interview probe."
    },
    {
      "type": "mcq",
      "tag": "swap invalidation",
      "question": "Which peculiarity distinguishes std::string::swap from std::vector::swap?",
      "options": [
        "string::swap runs in O(n) because it must copy the character data",
        "For std::string, swap may invalidate iterators, pointers, and references into both strings — characters held in the objects' internal SSO buffers genuinely move between objects — whereas vector::swap never invalidates references to elements",
        "string::swap can throw std::length_error when capacities differ",
        "There is no difference; both leave all iterators valid but referring to the other object"
      ],
      "answer": 1,
      "explain": "For most containers, swap just exchanges internal pointers, so references keep pointing at the same (now other-owned) elements. The small string optimization breaks that model: short strings live inside the string objects themselves, so their bytes physically move during a swap, and the standard therefore permits basic_string::swap to invalidate everything. The operation is still constant time — the special rule is purely about invalidation."
    },
    {
      "type": "code",
      "tag": "uniform erasure",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s = \"professional\";\n    auto n = std::erase(s, 'o');\n    std::cout << s << ' ' << n;\n}",
      "options": [
        "professional 0",
        "prfessinal 10",
        "prfessinal 2 — the C++20 free function std::erase removes every 'o' from the string in place and returns the number of characters it removed",
        "It fails to compile: std::erase applies to containers, not to std::string"
      ],
      "answer": 2,
      "explain": "C++20 uniform container erasure provides free std::erase and std::erase_if overloads for basic_string (and the other containers), replacing the two-step erase-remove idiom in a single call. Both occurrences of 'o' in \"professional\" disappear and the count 2 comes back as the return value. std::erase_if takes a predicate, handy for stripping whole character classes."
    },
    {
      "type": "code",
      "tag": "find_first_of",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s = \"professional\";\n    std::cout << s.find(\"ion\") << ' ' << s.find_first_of(\"ion\");\n}",
      "options": [
        "7 7",
        "2 2",
        "2 7",
        "7 2 — find searches for the whole substring \"ion\", first found at index 7, while find_first_of looks for the first occurrence of any single character from the set {i, o, n} — the 'o' at index 2"
      ],
      "answer": 3,
      "explain": "The two functions interpret their argument completely differently: find treats \"ion\" as a contiguous sequence to match, whereas find_first_of treats it as a set of candidate characters and stops at whichever appears first. Mixing them up compiles silently and produces plausible-looking indices, making it a classic code-review catch. The same set semantics extend to find_last_of, find_first_not_of, and find_last_not_of."
    },
    {
      "type": "mcq",
      "tag": "index at size()",
      "question": "For std::string s = \"abc\", which statement about the expression s[3] is correct in modern C++?",
      "options": [
        "It is valid: since C++11, operator[] explicitly permits the index equal to size() and returns a reference to a null character — though modifying that character is undefined; s.at(3), in contrast, would throw std::out_of_range",
        "It is undefined behavior, exactly like indexing one past the end of a std::vector",
        "It throws std::out_of_range, the same as at()",
        "It returns the final character 'c', because the index is clamped to the valid range"
      ],
      "answer": 0,
      "explain": "C++11 nailed down that strings store a null terminator contiguously with their data, and operator[] at exactly size() returns a reference to it — reading it is fine and yields '\\0'. Writing anything but a null there, or indexing beyond size(), is undefined behavior; at() is the bounds-checked, throwing alternative. This differs from vector, where operator[] at size() is flatly UB."
    },
    {
      "type": "code",
      "tag": "resize",
      "question": "What does this program print?",
      "code": "#include <iostream>\n#include <string>\n\nint main() {\n    std::string s = \"abc\";\n    s.resize(6, '!');\n    s.resize(2);\n    std::cout << s << ' ' << s.size();\n}",
      "options": [
        "abc!!! 6",
        "ab 2 — resize(6, '!') first grows the string to \"abc!!!\", then resize(2) truncates it to its first two characters",
        "ab!!!! 6",
        "It fails to compile: resize does not accept a fill character"
      ],
      "answer": 1,
      "explain": "resize actually changes size(): growing appends copies of the fill character (or '\\0' when none is given), and shrinking cuts the string down to its first n characters. This is the key contrast with reserve, which touches only capacity and never the contents. Note that shrinking does not release memory — capacity stays put until a shrink_to_fit request."
    }
  ]
};

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
    }
  ]
};

/* ===== C++ — Strings, Containers & Iterators =====
   Original question bank generated for LearnHub. Engine shape:
   { type: "mcq"|"code", tag, question, code?, options[], answer (0-based), explain }
   96 questions. Presented in random order by the quiz engine.
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp-containers"] = {
  title: "C++ — Strings, Containers & Iterators",
  subtitle: "Strings, vectors, iterators & raw pointers — invalidation traps and code output.",
  crumb: "C++",
  questions: [
    {
      "type": "code",
      "tag": "c_str lifetime",
      "question": "What happens when this program runs?",
      "code": "#include <string>\n#include <cstdio>\n\nconst char* make() {\n    std::string s = \"hello\";\n    return s.c_str();\n}\n\nint main() {\n    const char* p = make();\n    std::printf(\"%s\\n\", p);\n}",
      "options": [
        "Undefined behavior: p dangles after s is destroyed",
        "Always prints \"hello\" safely",
        "Compile error: cannot return c_str()",
        "Prints an empty string"
      ],
      "answer": 0,
      "explain": "c_str() points into the string's own buffer, which is destroyed when the local s goes out of scope at the end of make(). p is left dangling, so dereferencing it is undefined behavior. It may appear to print \"hello\" by luck, but that is not guaranteed."
    },
    {
      "type": "code",
      "tag": "find",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"hello\";\n    if (s.find(\"he\"))\n        std::cout << \"found\";\n    else\n        std::cout << \"not found\";\n}",
      "options": [
        "not found",
        "found",
        "Nothing; it throws",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "find returns the index of the match, and \"he\" is found at index 0. Since 0 is falsy, the if condition is false and it prints \"not found\". You must compare against std::string::npos, not treat the return value as a boolean."
    },
    {
      "type": "mcq",
      "tag": "npos",
      "question": "Which statement about std::string::npos is correct?",
      "options": [
        "It is the largest value of std::string::size_type, equal to static_cast<size_type>(-1)",
        "It is the integer constant -1",
        "It is 0, returned when nothing is found",
        "It is the string's size() at the time of the call"
      ],
      "answer": 0,
      "explain": "npos is a static member equal to the maximum value of the (unsigned) size_type, i.e. static_cast<size_type>(-1). Comparing a find result to a plain int -1 can misbehave due to signedness; always compare to std::string::npos itself."
    },
    {
      "type": "code",
      "tag": "c_str",
      "question": "What is the behavior of this program?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"hi\";\n    const char* p = s.c_str();\n    s += \" there, this is a long tail\";\n    std::cout << p;\n}",
      "options": [
        "Undefined behavior: appending may reallocate and invalidate p",
        "Always prints \"hi\"",
        "Prints the full new string",
        "Compile error"
      ],
      "answer": 0,
      "explain": "Any operation that can change the string's capacity (like +=) may reallocate the buffer, invalidating pointers previously returned by c_str(). Using p afterward is undefined behavior. You must re-fetch c_str() after modifying the string."
    },
    {
      "type": "code",
      "tag": "substr",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"hello\";\n    std::cout << s.substr(2);\n}",
      "options": [
        "llo",
        "he",
        "ello",
        "llo followed by garbage"
      ],
      "answer": 0,
      "explain": "substr(pos) returns the substring starting at index pos through the end. Starting at index 2 of \"hello\" yields \"llo\". The one-argument form uses npos as the default length, meaning 'to the end'."
    },
    {
      "type": "code",
      "tag": "substr",
      "question": "What happens here?",
      "code": "#include <string>\nint main() {\n    std::string s = \"hi\";\n    std::string t = s.substr(5);\n}",
      "options": [
        "Throws std::out_of_range",
        "Returns an empty string",
        "Undefined behavior",
        "Returns \"hi\""
      ],
      "answer": 0,
      "explain": "substr throws std::out_of_range when pos > size(). Here size() is 2 and pos is 5, so it throws. Note the boundary: substr(size()) is legal and returns an empty string; only pos strictly greater than size() throws."
    },
    {
      "type": "code",
      "tag": "substr",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"hi\";\n    std::cout << \"[\" << s.substr(2) << \"]\";\n}",
      "options": [
        "[]",
        "[hi]",
        "It throws std::out_of_range",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "pos == size() is valid for substr and returns an empty string, so this prints \"[]\". Only pos > size() throws. This edge case trips people who assume any index at or beyond the end is an error."
    },
    {
      "type": "code",
      "tag": "at()",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\n#include <stdexcept>\nint main() {\n    std::string s = \"hi\";\n    try { s.at(5); }\n    catch (const std::out_of_range&) { std::cout << \"caught\"; }\n}",
      "options": [
        "caught",
        "Nothing; it is undefined behavior",
        "Compile error",
        "Prints a garbage character"
      ],
      "answer": 0,
      "explain": "at() performs bounds checking and throws std::out_of_range for an invalid index, so the catch block runs and prints \"caught\". This is the key difference from operator[], which does no checking."
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "What is the behavior of accessing s[10] here?",
      "code": "#include <string>\nint main() {\n    std::string s = \"hi\";\n    char c = s[10];\n    (void)c;\n}",
      "options": [
        "Undefined behavior",
        "Throws std::out_of_range",
        "Returns '\\0' safely",
        "Compile error"
      ],
      "answer": 0,
      "explain": "operator[] does no bounds checking; accessing an index greater than size() is undefined behavior. Only at() throws. Note the single defined exception is index == size(), which returns the null terminator; index 10 here is well past that."
    },
    {
      "type": "code",
      "tag": "indexing",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"hi\";\n    std::cout << (s[s.size()] == '\\0');\n}",
      "options": [
        "1",
        "0",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 0,
      "explain": "Since C++11, s[size()] is defined and returns a reference to the null character, so reading it yields '\\0' and the comparison is 1. This is the one valid 'out of the visible range' index; writing anything other than '\\0' there is still undefined behavior."
    },
    {
      "type": "code",
      "tag": "char vs string",
      "question": "What happens with this line?",
      "code": "#include <string>\nint main() {\n    std::string s = \"foo\" + \"bar\";\n}",
      "options": [
        "Compile error: cannot add two const char* arrays",
        "Produces \"foobar\"",
        "Undefined behavior at runtime",
        "Produces \"foo\""
      ],
      "answer": 0,
      "explain": "String literals are arrays that decay to const char* pointers, and there is no operator+ for two pointers, so this fails to compile. At least one operand must be a std::string, e.g. std::string(\"foo\") + \"bar\"."
    },
    {
      "type": "code",
      "tag": "char vs string",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = 'x' + std::string(\"yz\");\n    std::cout << s;\n}",
      "options": [
        "xyz",
        "yzx",
        "Compile error",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "There is an overload operator+(char, const std::string&) that prepends the character, producing \"xyz\". Because one operand is a std::string, the char is handled as a character, not promoted to an int."
    },
    {
      "type": "code",
      "tag": "char vs string",
      "question": "What happens here?",
      "code": "#include <string>\nint main() {\n    std::string s = 'a';\n}",
      "options": [
        "Compile error: no constructor takes a single char",
        "Creates the string \"a\"",
        "Creates a string of length 97",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "std::string has no constructor accepting a single char, and char does not implicitly convert to std::string, so this is ill-formed (clang reports 'no viable conversion from char to std::string'). To build a one-character string use std::string(1, 'a')."
    },
    {
      "type": "code",
      "tag": "append",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"A\";\n    s += 66;\n    std::cout << s;\n}",
      "options": [
        "AB",
        "A66",
        "A",
        "B"
      ],
      "answer": 0,
      "explain": "operator+= has a char overload; the int 66 is converted to a char, which is 'B' in ASCII, so the result is \"AB\". It does NOT append the text \"66\" -- that is a very common mistake."
    },
    {
      "type": "code",
      "tag": "conversion",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::cout << std::to_string('A');\n}",
      "options": [
        "65",
        "A",
        "'A'",
        "Compile error"
      ],
      "answer": 0,
      "explain": "There is no std::to_string overload for char; the char 'A' is promoted to int (65) and to_string(int) runs, producing \"65\". To turn a char into a one-character string, use std::string(1, 'A') instead."
    },
    {
      "type": "code",
      "tag": "conversion",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::cout << std::to_string(3.5);\n}",
      "options": [
        "3.500000",
        "3.5",
        "3",
        "4"
      ],
      "answer": 0,
      "explain": "std::to_string for floating point behaves like printf with %f, using six digits after the decimal point by default, so it yields \"3.500000\". If you need controlled precision, use std::ostringstream with formatting manipulators instead."
    },
    {
      "type": "code",
      "tag": "conversion",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::cout << std::stoi(\"12px\");\n}",
      "options": [
        "12",
        "0",
        "Throws std::invalid_argument",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "stoi parses as many leading numeric characters as it can and stops at the first non-digit, so \"12px\" yields 12. It only throws std::invalid_argument when no conversion at all can be performed (no leading digits)."
    },
    {
      "type": "code",
      "tag": "conversion",
      "question": "What happens here?",
      "code": "#include <string>\nint main() {\n    int n = std::stoi(\"px12\");\n    (void)n;\n}",
      "options": [
        "Throws std::invalid_argument",
        "Returns 12",
        "Returns 0",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "stoi throws std::invalid_argument when the string has no leading digits to convert. Unlike the old atoi, which silently returns 0 in this case, stoi reports the failure via an exception."
    },
    {
      "type": "code",
      "tag": "conversion",
      "question": "What happens here?",
      "code": "#include <string>\nint main() {\n    int n = std::stoi(\"9999999999\");\n    (void)n;\n}",
      "options": [
        "Throws std::out_of_range",
        "Returns 9999999999",
        "Wraps around to a negative int",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "The value exceeds the range of a 32-bit int, and stoi throws std::out_of_range when the parsed number does not fit the target type. It does not silently wrap or truncate the way a raw cast would."
    },
    {
      "type": "code",
      "tag": "comparison",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string a = \"Z\", b = \"a\";\n    std::cout << (a < b);\n}",
      "options": [
        "1",
        "0",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 0,
      "explain": "String comparison is lexicographic by character value. 'Z' is 90 and 'a' is 97 in ASCII, so \"Z\" < \"a\" is true and prints 1. Ordering follows raw code-unit values, so all uppercase letters sort before all lowercase ones."
    },
    {
      "type": "code",
      "tag": "comparison",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"yes\";\n    if (s.compare(\"yes\"))\n        std::cout << \"differ\";\n    else\n        std::cout << \"same\";\n}",
      "options": [
        "same",
        "differ",
        "Compile error",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "compare returns 0 when the strings are equal, and 0 is falsy, so the else branch runs and prints \"same\". Treating compare()'s result as a boolean 'are they equal' is backwards; use == for an equality test."
    },
    {
      "type": "code",
      "tag": "char arithmetic",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"abc\";\n    std::cout << s[0] + 1;\n}",
      "options": [
        "98",
        "b",
        "a1",
        "99"
      ],
      "answer": 0,
      "explain": "s[0] is the char 'a'; in the expression s[0] + 1 it undergoes integer promotion to 97, and adding 1 gives the int 98, which is printed as a number. To get the next character you would cast back: char(s[0] + 1)."
    },
    {
      "type": "code",
      "tag": "embedded null",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"a\\0b\";\n    std::cout << s.size();\n}",
      "options": [
        "1",
        "3",
        "2",
        "4"
      ],
      "answer": 0,
      "explain": "Constructing a std::string from a const char* stops at the first null terminator, so only \"a\" is copied and size() is 1. To keep embedded nulls you must use the length-taking constructor: std::string(\"a\\0b\", 3)."
    },
    {
      "type": "code",
      "tag": "embedded null",
      "question": "What does this print?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"ab\";\n    s += '\\0';\n    s += \"cd\";\n    std::cout << s.size();\n}",
      "options": [
        "5",
        "4",
        "2",
        "3"
      ],
      "answer": 0,
      "explain": "Appending a single '\\0' char adds one element (size becomes 3), and += \"cd\" adds two more, giving 5. A std::string can hold embedded nulls; unlike a C string, its length is not determined by a terminator."
    },
    {
      "type": "code",
      "tag": "char vs string",
      "question": "What happens with this comparison?",
      "code": "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"apple\";\n    if (s[0] == \"a\")\n        std::cout << \"yes\";\n}",
      "options": [
        "Compile error: comparing char with const char*",
        "Prints \"yes\"",
        "Undefined behavior",
        "Prints nothing but compiles"
      ],
      "answer": 0,
      "explain": "s[0] is a char while \"a\" is a const char* (a pointer); there is no operator== between a char and a pointer, so this fails to compile ('comparison between pointer and integer'). The fix is to compare against the character literal 'a' (single quotes), not the string literal \"a\"."
    },
    {
      "type": "mcq",
      "tag": "Size vs Capacity",
      "question": "What is the difference between a std::vector's size() and capacity()?",
      "options": [
        "They are always equal after any operation",
        "size() is the number of constructed elements; capacity() is how many elements can be held before the next reallocation",
        "capacity() is the number of elements; size() is the number of bytes allocated",
        "size() can exceed capacity() after reserve()"
      ],
      "answer": 1,
      "explain": "size() counts the actual elements that exist (and are constructed); capacity() is the size of the currently allocated storage, so capacity() >= size() always. They are frequently unequal because vectors over-allocate to make push_back amortized O(1); size() can never exceed capacity()."
    },
    {
      "type": "code",
      "tag": "Reserve",
      "question": "What does this program print?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v;\n    v.reserve(100);\n    std::cout << v.size();\n}",
      "options": [
        "100",
        "0",
        "1",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "reserve() only allocates capacity; it never creates elements, so size() stays 0. A common mistake is to reserve(n) and then write v[i] for i<n — that is out-of-bounds UB because those elements don't exist yet. Use resize(n) to actually construct elements."
    },
    {
      "type": "code",
      "tag": "Invalidation",
      "question": "What is the behavior of this program?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    int& r = v[0];\n    v.push_back(4);\n    std::cout << r;\n}",
      "options": [
        "Prints 1",
        "Prints 4",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 2,
      "explain": "A freshly list-initialized vector allocates exactly enough storage, so on every mainstream implementation size (3) equals capacity; push_back then reallocates, moving elements to new storage and invalidating r, which now dangles — reading it is undefined behavior. It may happen to print 1, but that is luck, not correctness; reserve() ahead of time would have kept r valid."
    },
    {
      "type": "code",
      "tag": "Reserve",
      "question": "What does this program print?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    v.reserve(10);\n    int& r = v[0];\n    v.push_back(4);\n    std::cout << r;\n}",
      "options": [
        "1",
        "4",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 0,
      "explain": "Because capacity() is now at least 10, push_back does not reallocate; it constructs the new element in existing storage, so references and iterators to prior elements stay valid and r still names v[0] == 1. Reserving enough capacity up front is the standard fix for the dangling-reference trap."
    },
    {
      "type": "mcq",
      "tag": "Invalidation",
      "question": "After a push_back that triggers reallocation (size was equal to capacity), which iterators/references are invalidated?",
      "options": [
        "Only the end() iterator",
        "Only iterators, references remain valid",
        "All iterators and all references into the vector",
        "None; push_back never invalidates anything"
      ],
      "answer": 2,
      "explain": "When push_back grows the buffer, every element is relocated to new storage, so all iterators, pointers, and references into the vector are invalidated. When no reallocation occurs, only the past-the-end iterator is invalidated; the distinction hinges entirely on whether size() reached capacity()."
    },
    {
      "type": "code",
      "tag": "Emplace",
      "question": "Which statement is true about this code?",
      "code": "#include <vector>\nstruct Widget { explicit Widget(int) {} };\nint main() {\n    std::vector<Widget> v;\n    v.emplace_back(5);   // line A\n    v.push_back(5);      // line B\n}",
      "options": [
        "Both lines compile",
        "Line A compiles, line B fails to compile",
        "Line B compiles, line A fails to compile",
        "Neither compiles"
      ],
      "answer": 1,
      "explain": "emplace_back forwards its arguments to construct a Widget in place, so it can call the explicit constructor directly. push_back(5) needs an implicit int->Widget conversion to form the Widget argument, which is forbidden because the constructor is explicit, so line B fails to compile."
    },
    {
      "type": "code",
      "tag": "Bounds",
      "question": "What does this program print?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v(3);\n    try {\n        int x = v.at(5);\n        std::cout << x;\n    } catch (const std::out_of_range&) {\n        std::cout << \"caught\";\n    }\n}",
      "options": [
        "0",
        "caught",
        "Undefined behavior",
        "Prints nothing and crashes"
      ],
      "answer": 1,
      "explain": "at() performs bounds checking and throws std::out_of_range for an invalid index, so the catch block runs and prints \"caught\". This is the key contrast with operator[], which does no checking and would be undefined behavior for index 5."
    },
    {
      "type": "code",
      "tag": "Bounds",
      "question": "What is the behavior of this program?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v(3);\n    std::cout << v[5];\n}",
      "options": [
        "Prints 0",
        "Throws std::out_of_range",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 2,
      "explain": "operator[] does no bounds checking; indexing past size() is undefined behavior. It may appear to print garbage or 0, or crash, but nothing is guaranteed. Use at() when you want a checked access that throws instead."
    },
    {
      "type": "code",
      "tag": "Erase Loop",
      "question": "What is the behavior of this loop?",
      "code": "#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3, 4};\n    for (auto it = v.begin(); it != v.end(); ++it) {\n        if (*it % 2 == 0)\n            v.erase(it);\n    }\n}",
      "options": [
        "Correctly removes all even numbers",
        "Undefined behavior",
        "Removes only the first even number, then stops safely",
        "Compile error"
      ],
      "answer": 1,
      "explain": "erase invalidates the iterator it (and all iterators at or after the erased position), yet the loop then does ++it on that invalidated iterator — undefined behavior. The correct pattern is it = v.erase(it); else ++it;, or better, the erase-remove idiom."
    },
    {
      "type": "code",
      "tag": "Erase Idiom",
      "question": "What does v contain after this code?",
      "code": "#include <vector>\n#include <algorithm>\nint main() {\n    std::vector<int> v{5, 0, 3, 0, 7, 0};\n    v.erase(std::remove(v.begin(), v.end(), 0), v.end());\n    // inspect v\n}",
      "options": [
        "{5, 3, 7}",
        "{5, 0, 3, 0, 7, 0}",
        "{5, 3, 7, 0, 0, 0}",
        "{0, 0, 0}"
      ],
      "answer": 0,
      "explain": "std::remove shuffles the kept elements to the front and returns an iterator to the new logical end; the trailing slots are unspecified leftovers. The single erase then trims from that iterator to end(), leaving {5, 3, 7}. Forgetting the erase (calling remove alone) is a classic bug: it changes nothing about size()."
    },
    {
      "type": "mcq",
      "tag": "Erase",
      "question": "After v.erase(v.begin() + 2) on a vector, which iterators are invalidated?",
      "options": [
        "Only the erased iterator",
        "No iterators, since erase doesn't reallocate",
        "All iterators at or after the point of erasure",
        "All iterators in the entire vector"
      ],
      "answer": 2,
      "explain": "erase shifts every later element one slot toward the front, so all iterators and references from the erased position onward are invalidated (including end()). Iterators before the erase point remain valid because those elements don't move; erase never reallocates or grows the buffer."
    },
    {
      "type": "mcq",
      "tag": "Containers",
      "question": "You need efficient insertion and removal at BOTH the front and the back of a sequence, with index access. Which container is the best fit?",
      "options": [
        "std::vector",
        "std::deque",
        "std::list",
        "std::array"
      ],
      "answer": 1,
      "explain": "std::deque supports O(1) push_front and push_back plus O(1) random access via operator[]. std::vector has no push_front and would need O(n) shifting at the front; std::list gives O(1) end insertions but no random access (no operator[])."
    },
    {
      "type": "mcq",
      "tag": "Containers",
      "question": "A key property of std::list (and forward_list) that std::vector lacks is:",
      "options": [
        "Contiguous storage for cache-friendly traversal",
        "O(1) random access by index",
        "Iterators and references to elements stay valid across insertions and erasures of OTHER elements",
        "Lower per-element memory overhead"
      ],
      "answer": 2,
      "explain": "std::list stores nodes independently, so inserting or erasing one element never invalidates iterators/references to the others — a guarantee vector cannot make. Vector wins on contiguity, cache behavior, random access, and memory overhead, but loses this stability property."
    },
    {
      "type": "code",
      "tag": "Emplace",
      "question": "Does this compile under C++11/14?",
      "code": "#include <vector>\nint main() {\n    std::vector<int> v;\n    auto& r = v.emplace_back(42);\n    (void)r;\n}",
      "options": [
        "Yes, r refers to the new element",
        "No — emplace_back returns void in C++11/14",
        "Yes, but r is a dangling reference",
        "No — emplace_back takes no arguments"
      ],
      "answer": 1,
      "explain": "In C++11 and C++14, emplace_back returns void, so binding a reference to its result fails to compile. The reference-returning overload was only added in C++17. This is a real portability gotcha when moving code between standard versions."
    },
    {
      "type": "mcq",
      "tag": "Capacity",
      "question": "Which statement about v.clear() is correct?",
      "options": [
        "It sets both size() and capacity() to 0",
        "It sets size() to 0 but leaves capacity() unchanged",
        "It reallocates to a minimal buffer",
        "It invalidates nothing"
      ],
      "answer": 1,
      "explain": "clear() destroys all elements so size() becomes 0, but the standard does not require it to release memory, so capacity() typically stays the same (letting you refill without reallocating). To actually free memory you would follow with shrink_to_fit(), or swap with an empty vector."
    },
    {
      "type": "code",
      "tag": "vector<bool>",
      "question": "What does this program print?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<bool> v{true, false};\n    auto x = v[0];\n    v[0] = false;\n    std::cout << x;\n}",
      "options": [
        "1",
        "0",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 1,
      "explain": "vector<bool> is a bit-packed specialization whose operator[] returns a proxy object, not bool&. auto deduces that proxy (which still refers to the same bit), so after v[0] is set to false, x observes the updated bit and prints 0. Writing bool x = v[0] would instead capture the value 1 at copy time."
    },
    {
      "type": "mcq",
      "tag": "UB",
      "question": "Calling pop_back() on an empty vector is:",
      "options": [
        "A no-op",
        "Undefined behavior",
        "Throws std::out_of_range",
        "Returns the last removed element"
      ],
      "answer": 1,
      "explain": "pop_back has a precondition that the vector is non-empty; calling it on an empty vector is undefined behavior. It also returns void — it never yields the removed element — so a common misconception is that it hands back the value it erased."
    },
    {
      "type": "code",
      "tag": "Self-insert",
      "question": "What is the behavior of this program?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{7};\n    v.push_back(v[0]);\n    std::cout << v[1];\n}",
      "options": [
        "7 — it is well defined",
        "Undefined behavior because v[0] is invalidated during reallocation",
        "Some indeterminate value",
        "Compile error"
      ],
      "answer": 0,
      "explain": "Even though push_back may reallocate and invalidate v[0], the standard requires that inserting an element that aliases an existing element of the same vector works correctly. The implementation must read the value before freeing the old buffer, so v[1] == 7 is guaranteed."
    },
    {
      "type": "mcq",
      "tag": "Capacity Growth",
      "question": "After several push_back calls that grow a vector, what does the standard guarantee about the resulting capacity()?",
      "options": [
        "It exactly doubles each time",
        "It equals size()",
        "It is at least size(), but the exact value is implementation-defined",
        "It grows by exactly one each push_back"
      ],
      "answer": 2,
      "explain": "The standard only requires amortized O(1) push_back, which implies geometric growth, but the exact growth factor (commonly 1.5x or 2x) is implementation-defined. So capacity() >= size() is all you can portably rely on; never hard-code an expected capacity value."
    },
    {
      "type": "code",
      "tag": "Shrink",
      "question": "What is guaranteed about capacity() after this code?",
      "code": "#include <vector>\nint main() {\n    std::vector<int> v(1000);\n    v.resize(10);\n    v.shrink_to_fit();\n    // what about v.capacity()?\n}",
      "options": [
        "capacity() == 10 exactly",
        "capacity() == 1000",
        "capacity() >= 10, but shrinking is a non-binding request",
        "capacity() == 0"
      ],
      "answer": 2,
      "explain": "shrink_to_fit() is a non-binding request: an implementation is permitted to ignore it or shrink only partially, so all you know is capacity() >= size(). resize(10) reduces size but by itself does not reduce capacity, which is why the request is needed at all."
    },
    {
      "type": "code",
      "tag": "Invalidation",
      "question": "What is the behavior of this program?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{10, 20, 30};\n    int* p = v.data();\n    v.reserve(1000);\n    std::cout << *p;\n}",
      "options": [
        "Prints 10",
        "Undefined behavior",
        "Prints 1000",
        "Compile error"
      ],
      "answer": 1,
      "explain": "reserve(1000) exceeds the current capacity, so the vector reallocates and the pointer p returned by data() now points into freed memory — dereferencing it is undefined behavior. data() pointers are invalidated by exactly the same events (reallocation) as iterators and references."
    },
    {
      "type": "mcq",
      "tag": "Containers",
      "question": "Which is a correct statement comparing std::deque and std::vector regarding element storage?",
      "options": [
        "Both guarantee a single contiguous block of memory",
        "deque is contiguous but vector is not",
        "vector guarantees contiguous storage; deque does not",
        "Neither guarantees contiguous storage"
      ],
      "answer": 2,
      "explain": "std::vector guarantees its elements occupy one contiguous array (so &v[0] can be passed to C APIs). std::deque uses multiple fixed-size chunks, so it is not contiguous — you cannot treat a deque as a flat C array, which is a frequent porting mistake."
    },
    {
      "type": "code",
      "tag": "Insert",
      "question": "What does this program print?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v;\n    v.reserve(4);\n    v.push_back(1);\n    auto it = v.begin();\n    v.insert(v.begin(), 0);\n    std::cout << *it;\n}",
      "options": [
        "1",
        "0",
        "Undefined behavior",
        "Prints garbage but is defined"
      ],
      "answer": 2,
      "explain": "Even though reserve prevents reallocation, insert at the front shifts existing elements, so the standard invalidates all iterators at or after the insertion point — which includes it (pointing at the front). Dereferencing the invalidated it is undefined behavior, regardless of spare capacity."
    },
    {
      "type": "code",
      "tag": "Emplace",
      "question": "What does this program print?",
      "code": "#include <vector>\n#include <iostream>\nstruct P {\n    P(int a, int b) : s(a + b) {}\n    int s;\n};\nint main() {\n    std::vector<P> v;\n    v.emplace_back(3, 4);\n    std::cout << v.back().s;\n}",
      "options": [
        "7",
        "34",
        "Compile error — push_back needed",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "emplace_back forwards its arguments (3, 4) straight to P's two-argument constructor, constructing the element in place, so s == 7. push_back could not do this without you writing v.push_back(P(3,4)); explicitly, since push_back takes an already-formed P, not constructor arguments."
    },
    {
      "type": "mcq",
      "tag": "Categories",
      "question": "Which iterator category does std::list provide?",
      "options": [
        "RandomAccessIterator",
        "BidirectionalIterator",
        "ForwardIterator",
        "InputIterator"
      ],
      "answer": 1,
      "explain": "std::list is a doubly-linked list, so its iterators can move both forward (++) and backward (--) but cannot jump by an arbitrary offset in O(1); that is exactly BidirectionalIterator. RandomAccessIterator is wrong because there is no it+n or it[k] on a list — only std::vector, std::deque, std::array and std::string offer that."
    },
    {
      "type": "code",
      "tag": "Invalidation",
      "question": "What is the behavior of this program?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    auto it = v.begin();\n    v.push_back(4);\n    std::cout << *it;\n}",
      "options": [
        "Always prints 1",
        "Always prints 4",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 2,
      "explain": "push_back may trigger a reallocation when size would exceed capacity, and reallocation invalidates ALL iterators, pointers, and references into the vector; dereferencing the stale `it` is then undefined behavior. \"Prints 1\" is the trap — it only appears to work when no reallocation happens, but the standard makes no guarantee here, so the program is UB."
    },
    {
      "type": "code",
      "tag": "Erase",
      "question": "What happens when this runs?",
      "code": "#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3, 4};\n    for (auto it = v.begin(); it != v.end(); ++it)\n        if (*it % 2 == 0)\n            v.erase(it);\n}",
      "options": [
        "Removes all even numbers safely",
        "Undefined behavior",
        "Removes only the first even number",
        "Infinite loop"
      ],
      "answer": 1,
      "explain": "vector::erase invalidates the erased iterator and every iterator after it; the subsequent ++it (and the loop's != comparison) then operates on an invalidated iterator, which is undefined behavior. The correct idiom is `it = v.erase(it);` on removal and `++it` only otherwise, so you never advance a dead iterator."
    },
    {
      "type": "mcq",
      "tag": "Invalidation",
      "question": "After calling m.erase(it) on a std::map<K,V>, what remains valid?",
      "options": [
        "Nothing — all iterators are invalidated",
        "Only iterators before the erased element",
        "All iterators and references except those to the erased element",
        "All iterators, including one to the erased element"
      ],
      "answer": 2,
      "explain": "Node-based containers (map, set, multimap, multiset) invalidate only iterators and references to the element that was actually erased; every other element keeps its node, so its iterators/references stay valid. This contrasts sharply with vector, where erase invalidates everything from the erase point onward."
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "What is the behavior of this snippet?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{10, 20, 30};\n    std::cout << *v.end();\n}",
      "options": [
        "Prints 30",
        "Prints 0",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 2,
      "explain": "end() returns a past-the-end iterator that does NOT point to any element; dereferencing it is undefined behavior. \"Prints 30\" is the trap — 30 is *(v.end()-1); end() itself sits one position beyond the last element."
    },
    {
      "type": "code",
      "tag": "Arithmetic",
      "question": "Does this compile, and if so what does it do?",
      "code": "#include <list>\nint main() {\n    std::list<int> l{1, 2, 3};\n    auto it = l.begin();\n    it = it + 2;\n}",
      "options": [
        "Compiles; it points to 3",
        "Compiles; it points to past-the-end",
        "Does not compile",
        "Compiles but is undefined behavior"
      ],
      "answer": 2,
      "explain": "list iterators are bidirectional and do not provide operator+ (or +=, [], <), so `it + 2` fails to compile. To move a bidirectional iterator by an offset you must use std::advance(it, 2) or std::next(it, 2), which perform the jump in O(n) via repeated ++."
    },
    {
      "type": "mcq",
      "tag": "cbegin",
      "question": "What does calling v.cbegin() on a NON-const std::vector<int> v return?",
      "options": [
        "std::vector<int>::iterator",
        "std::vector<int>::const_iterator",
        "A const-qualified iterator object you cannot reassign",
        "It fails to compile on a non-const container"
      ],
      "answer": 1,
      "explain": "cbegin() always returns a const_iterator regardless of whether the container object is const, giving you read-only access to elements. Distractor 2 confuses constness of the pointed-to element with constness of the iterator itself — a const_iterator is a fully reassignable object that forbids modifying what it points at."
    },
    {
      "type": "mcq",
      "tag": "Advance",
      "question": "You have a std::list<int>::iterator it and want to move it forward by n. Which is correct?",
      "options": [
        "it += n;",
        "it = it + n;",
        "std::advance(it, n);",
        "it.advance(n);"
      ],
      "answer": 2,
      "explain": "std::advance works for any iterator category, dispatching to O(1) pointer arithmetic for random-access iterators and O(n) repeated ++ for bidirectional ones like list's. The += and + forms don't compile for list iterators, and iterators have no member function named advance."
    },
    {
      "type": "code",
      "tag": "Invalidation",
      "question": "What does this print?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v;\n    v.reserve(10);\n    v.push_back(1);\n    auto it = v.begin();\n    v.push_back(2);\n    std::cout << *it;\n}",
      "options": [
        "1",
        "2",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 0,
      "explain": "reserve(10) guarantees capacity of at least 10, so the two push_backs stay within capacity and cause no reallocation; `it` therefore remains valid and prints 1. Reserving ahead of a known count is the standard way to keep iterators/pointers stable across insertions at the end."
    },
    {
      "type": "mcq",
      "tag": "Deque",
      "question": "For a std::deque, what does push_front do to existing elements?",
      "options": [
        "Invalidates all iterators but leaves references and pointers to existing elements valid",
        "Invalidates all iterators, references, and pointers",
        "Invalidates nothing",
        "Invalidates only the iterator returned by begin()"
      ],
      "answer": 0,
      "explain": "A deque insertion at either end invalidates all iterators, but references and pointers to existing elements stay valid because those elements are not moved (deque uses a segmented block layout). This is a distinctive deque rule — vectors, by contrast, invalidate references and pointers too whenever they reallocate."
    },
    {
      "type": "mcq",
      "tag": "List",
      "question": "Which operation on a std::list invalidates iterators to elements OTHER than those directly operated on?",
      "options": [
        "erase(it)",
        "push_back(x)",
        "splice(...)",
        "None of these"
      ],
      "answer": 3,
      "explain": "In a list, erase invalidates only the erased element's iterator, push_back invalidates nothing, and splice keeps iterators valid (they simply refer into the target list afterward). No list operation invalidates iterators to unrelated elements — a key reason to prefer list when you must hold long-lived iterators."
    },
    {
      "type": "code",
      "tag": "Rehash",
      "question": "What is the behavior here?",
      "code": "#include <unordered_map>\n#include <iostream>\nint main() {\n    std::unordered_map<int,int> m;\n    for (int i = 0; i < 100; ++i) m[i] = i;\n    auto it = m.find(5);\n    m[1000] = 0;\n    std::cout << it->second;\n}",
      "options": [
        "Always prints 5",
        "Prints 1000",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 2,
      "explain": "Inserting into an unordered_map can trigger a rehash, and rehashing invalidates ALL iterators; using `it` afterward is therefore undefined behavior. Note the subtlety: rehashing does NOT invalidate references or pointers to the elements, so a saved `int&` would still be fine — but iterators are not."
    },
    {
      "type": "mcq",
      "tag": "Erase",
      "question": "Which loop correctly removes matching elements from a std::map during iteration (C++11)?",
      "options": [
        "for (auto it = m.begin(); it != m.end(); ++it) if (pred(*it)) m.erase(it);",
        "for (auto it = m.begin(); it != m.end();) { if (pred(*it)) it = m.erase(it); else ++it; }",
        "for (auto it = m.begin(); it != m.end(); ++it) if (pred(*it)) m.erase(it++);",
        "for (auto& p : m) if (pred(p)) m.erase(p.first);"
      ],
      "answer": 1,
      "explain": "Since C++11 map::erase returns an iterator to the element following the erased one, so `it = m.erase(it)` (advancing only in the else branch) is the clean, correct idiom. Option 1 advances an invalidated iterator (UB). Option 3 double-advances: erase(it++) already steps the iterator past the erased node, then the for-header's own ++it skips the following element (and steps past end() on the last erase — UB). Option 4 mutates the map while a range-for holds a cached end iterator, also UB."
    },
    {
      "type": "code",
      "tag": "ReverseIter",
      "question": "Which element does this erase from v?",
      "code": "#include <vector>\n#include <algorithm>\nint main() {\n    std::vector<int> v{1, 2, 3, 4, 5};\n    auto rit = std::find(v.rbegin(), v.rend(), 3);\n    v.erase(rit.base());\n}",
      "options": [
        "Erases 3",
        "Erases 4",
        "Erases 2",
        "Undefined behavior"
      ],
      "answer": 1,
      "explain": "A reverse_iterator and its base() are offset by one: if *rit == 3, then base() points to the element AFTER 3 in forward order, i.e. 4. So erase(rit.base()) removes 4, not 3. To erase the element a reverse iterator refers to you need erase(std::next(rit).base()) or erase((rit + 1).base())."
    },
    {
      "type": "mcq",
      "tag": "UB",
      "question": "Comparing two iterators obtained from two DIFFERENT container objects (e.g. it1 == it2 where it1 is from v1 and it2 is from v2) is:",
      "options": [
        "Well-defined and always false",
        "Well-defined and always true",
        "Undefined behavior",
        "A compile error"
      ],
      "answer": 2,
      "explain": "Iterators are only required to be comparable when they refer into the same container (same range); comparing iterators from different containers is undefined behavior, not a guaranteed-false result. The exception is value-initialized (singular) iterators of the same type, which C++14 defines as comparing equal to each other."
    },
    {
      "type": "code",
      "tag": "Arithmetic",
      "question": "What does this print?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{5, 6, 7, 8};\n    std::cout << (v.end() - v.begin());\n}",
      "options": [
        "4",
        "3",
        "0",
        "Compile error"
      ],
      "answer": 0,
      "explain": "vector provides random-access iterators, so subtracting two of them yields the distance between them as a ptrdiff_t — here end() - begin() equals the size, 4. The same expression would fail to compile for a list or forward_list, whose iterators do not support operator-."
    },
    {
      "type": "mcq",
      "tag": "Distance",
      "question": "Calling std::next(it, 5) where it is a std::forward_list<int>::iterator:",
      "options": [
        "Fails to compile — next needs a random-access iterator",
        "Works, but takes O(n) time via repeated increments",
        "Works in O(1)",
        "Is undefined behavior for forward iterators"
      ],
      "answer": 1,
      "explain": "std::next (like std::advance) accepts any input/forward iterator; for non-random-access iterators it simply applies ++ n times, so it works but costs O(n). The trap is assuming next requires random access — it does not; only the constant-time guarantee is lost."
    },
    {
      "type": "code",
      "tag": "Erase",
      "question": "What are the remaining elements of v after this loop?",
      "code": "#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3, 4, 5};\n    for (auto it = v.begin(); it != v.end();) {\n        if (*it % 2 == 0) it = v.erase(it);\n        else ++it;\n    }\n}",
      "options": [
        "{1, 3, 5}",
        "{2, 4}",
        "{1, 2, 3, 4, 5}",
        "Undefined behavior"
      ],
      "answer": 0,
      "explain": "This is the correct erase-during-iteration pattern: erase returns a valid iterator to the element after the removed one, which is reassigned to `it`, and `it` is advanced only when nothing is erased. Even elements 2 and 4 are removed, leaving {1, 3, 5} with no iterator invalidation bug."
    },
    {
      "type": "code",
      "tag": "RangeFor",
      "question": "What is the behavior of this loop?",
      "code": "#include <vector>\n#include <iostream>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    for (int x : v) {\n        if (x == 1) v.push_back(99);\n        std::cout << x;\n    }\n}",
      "options": [
        "Prints 123 then 99",
        "Prints 12399",
        "Undefined behavior",
        "Compile error"
      ],
      "answer": 2,
      "explain": "A range-based for evaluates end() once before the loop and holds that iterator; push_back may reallocate, invalidating both that cached end iterator and the current iterator, so continuing the loop is undefined behavior. Mutating a container's size while range-iterating over it is a classic trap."
    },
    {
      "type": "code",
      "tag": "Set",
      "question": "Does this compile?",
      "code": "#include <set>\nint main() {\n    std::set<int> s{1, 2, 3};\n    auto it = s.begin();\n    *it = 99;\n}",
      "options": [
        "Yes; s becomes {2, 3, 99}",
        "Yes; but the set's ordering is then corrupted (UB)",
        "No — it does not compile",
        "Yes; the assignment is silently ignored"
      ],
      "answer": 2,
      "explain": "For std::set the key IS the element and must stay immutable to preserve the tree invariant, so both iterator and const_iterator dereference to a const reference; `*it = 99` fails to compile. Distractor 2 describes what WOULD happen if the language let you do it, but the compiler stops you first."
    },
    {
      "type": "mcq",
      "tag": "Rehash",
      "question": "When a std::unordered_set rehashes after an insertion, what is invalidated?",
      "options": [
        "Iterators, references, and pointers to all elements",
        "Only iterators; references and pointers to elements stay valid",
        "Nothing",
        "Only the iterators to the newly inserted element"
      ],
      "answer": 1,
      "explain": "Rehashing rearranges elements among buckets, invalidating all iterators, but the elements themselves are not copied or moved, so references and pointers to them remain valid. This iterator-vs-reference distinction is the same subtlety that appears with unordered_map and is a frequent interview gotcha."
    },
    {
      "type": "code",
      "tag": "ProxyIter",
      "question": "Does this compile?",
      "code": "#include <vector>\nint main() {\n    std::vector<bool> v{true, false, true};\n    bool& r = v[0];\n}",
      "options": [
        "Yes; r aliases the first bit",
        "Yes; r is a copy",
        "No — it does not compile",
        "Yes, but r dangles immediately"
      ],
      "answer": 2,
      "explain": "std::vector<bool> is a space-optimized specialization whose operator[] (and iterator dereference) returns a proxy object of type std::vector<bool>::reference, not a real bool&; binding it to bool& fails to compile. You must use `auto r = v[0];` (a proxy) or `bool b = v[0];` (a copy) — a well-known reason vector<bool> breaks generic code."
    },
    {
      "type": "mcq",
      "tag": "Invalidation",
      "question": "For std::vector, inserting an element in the MIDDLE (no reallocation occurs) invalidates which iterators?",
      "options": [
        "None",
        "Only the returned iterator",
        "Iterators at and after the insertion point",
        "All iterators in the container"
      ],
      "answer": 2,
      "explain": "Even without reallocation, a middle insert shifts every element from the insertion point onward, so all iterators, pointers, and references at or after that position are invalidated; those strictly before it stay valid. If reallocation DOES occur, then everything is invalidated — but the question specifies no reallocation."
    },
    {
      "type": "code",
      "tag": "sizeof",
      "question": "On a typical 64-bit system, what does this print?",
      "code": "#include <cstdio>\nvoid show(int a[10]) {\n    std::printf(\"%zu\", sizeof(a));\n}\nint main() {\n    int arr[10];\n    show(arr);\n}",
      "options": [
        "40",
        "8",
        "10",
        "does not compile"
      ],
      "answer": 1,
      "explain": "An array parameter like int a[10] is silently adjusted to a pointer int*, so sizeof(a) is the size of a pointer (8 on a 64-bit target), not the array. The tempting '40' assumes the array survives the call, but the size in the brackets is ignored entirely."
    },
    {
      "type": "code",
      "tag": "sizeof",
      "question": "What is printed?",
      "code": "#include <cstdio>\nint main() {\n    int a[5] = {1,2,3};\n    std::printf(\"%zu\", sizeof(a)/sizeof(a[0]));\n}",
      "options": [
        "3",
        "5",
        "20",
        "4"
      ],
      "answer": 1,
      "explain": "sizeof(a) is the whole array (20 bytes) and sizeof(a[0]) is one int (4), so the ratio is the element count 5 regardless of how many initializers were given. '3' wrongly counts only the initialized elements; the trailing two are zero-initialized but still part of the array."
    },
    {
      "type": "mcq",
      "tag": "Decay",
      "question": "In which of these contexts does an array NOT decay to a pointer to its first element?",
      "options": [
        "Passing it to a function taking int*",
        "Applying sizeof to it",
        "Adding an integer to it (a + 1)",
        "Using it where an int* is expected in an assignment"
      ],
      "answer": 1,
      "explain": "sizeof, unary &, and binding to a reference-to-array are the main contexts where the array keeps its array type; sizeof reports the full array size. In all the other listed cases the array undergoes the standard array-to-pointer conversion first."
    },
    {
      "type": "code",
      "tag": "CStrings",
      "question": "What is the behavior of this program?",
      "code": "#include <cstring>\n#include <cstdio>\nint main() {\n    char c[3] = {'a','b','c'};\n    std::printf(\"%zu\", std::strlen(c));\n}",
      "options": [
        "prints 3",
        "prints 4",
        "undefined behavior",
        "prints 0"
      ],
      "answer": 2,
      "explain": "c holds exactly {'a','b','c'} with no '\\0', so strlen walks past the end of the array searching for a terminator — that is undefined behavior. 'prints 3' assumes strlen knows the array size, but strlen only stops at a null byte, which is absent here."
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "Which statement about this snippet is correct?",
      "code": "int a[4] = {10,20,30,40};\nint* p = a + 4;\nint  x = *p;",
      "options": [
        "Both a+4 and *p are well-defined",
        "a+4 is undefined behavior",
        "a+4 is fine but *p is undefined behavior",
        "x is guaranteed to be 40"
      ],
      "answer": 2,
      "explain": "Forming a pointer one past the last element (a+4) is explicitly allowed, but dereferencing that one-past-the-end pointer is undefined behavior. The trap is thinking a+4 itself is illegal — it is legal to compute and compare, just not to read through."
    },
    {
      "type": "code",
      "tag": "Indexing",
      "question": "What is printed?",
      "code": "#include <cstdio>\nint main() {\n    int a[] = {5,6,7,8};\n    std::printf(\"%d\", 2[a]);\n}",
      "options": [
        "does not compile",
        "6",
        "7",
        "undefined behavior"
      ],
      "answer": 2,
      "explain": "a[2] is defined as *(a+2), and since addition is commutative *(2+a) is identical, so 2[a] == a[2] == 7. This surprising legal syntax falls straight out of pointer arithmetic; it is not a compile error."
    },
    {
      "type": "code",
      "tag": "Decay",
      "question": "Does this compile, and if so what happens?",
      "code": "int main() {\n    int a[3] = {1,2,3};\n    a++;\n    return a[0];\n}",
      "options": [
        "compiles, returns 2",
        "compiles, undefined behavior",
        "does not compile",
        "compiles, returns 1"
      ],
      "answer": 2,
      "explain": "An array name is not a modifiable lvalue; the decayed pointer is a temporary rvalue, so a++ has nothing to assign back to and the program is ill-formed. Pointers can be incremented, but the array object itself cannot be reseated."
    },
    {
      "type": "code",
      "tag": "PtrToPtr",
      "question": "What does this print?",
      "code": "#include <cstdio>\nint main() {\n    int x = 42;\n    int*  p  = &x;\n    int** pp = &p;\n    **pp = 7;\n    std::printf(\"%d\", x);\n}",
      "options": [
        "42",
        "7",
        "address of x",
        "does not compile"
      ],
      "answer": 1,
      "explain": "pp points to p, *pp is p, and **pp is x, so assigning through **pp modifies x to 7. Readers who stop at one level of indirection expect 42, but the double dereference reaches all the way back to x."
    },
    {
      "type": "code",
      "tag": "Multidim",
      "question": "Does this compile?",
      "code": "int main() {\n    int a[2][3] = {};\n    int** p = a;\n    return **p;\n}",
      "options": [
        "yes, returns 0",
        "no, type mismatch",
        "yes, undefined behavior",
        "yes, returns garbage"
      ],
      "answer": 1,
      "explain": "A 2D array decays to a pointer to its first element, which is a whole row: type int(*)[3], not int**. int** and int(*)[3] are unrelated types, so the initialization is ill-formed. This is the classic reason you cannot treat a matrix as int**."
    },
    {
      "type": "code",
      "tag": "CStrings",
      "question": "What is printed?",
      "code": "#include <cstdio>\nint main() {\n    char s[] = \"abc\";\n    std::printf(\"%zu\", sizeof(s));\n}",
      "options": [
        "3",
        "4",
        "8",
        "5"
      ],
      "answer": 1,
      "explain": "The literal \"abc\" initializes a char array including the terminating '\\0', so s has 4 elements and sizeof is 4. '3' forgets the hidden null terminator that every string literal carries."
    },
    {
      "type": "code",
      "tag": "CStrings",
      "question": "What is printed?",
      "code": "#include <cstring>\n#include <cstdio>\nint main() {\n    char c[] = {'H','i','\\0','!','\\0'};\n    std::printf(\"%zu %zu\", sizeof(c), std::strlen(c));\n}",
      "options": [
        "5 4",
        "5 2",
        "2 2",
        "4 2"
      ],
      "answer": 1,
      "explain": "sizeof counts every element of the array (5), while strlen stops at the first '\\0' after 'H','i', giving length 2. The two numbers measure different things: storage vs logical string length."
    },
    {
      "type": "mcq",
      "tag": "Literals",
      "question": "In C++, what is the type of the expression \"hello\"?",
      "options": [
        "char[6]",
        "const char[6]",
        "const char*",
        "char[5]"
      ],
      "answer": 1,
      "explain": "A narrow string literal has type array of const char including the null terminator, so \"hello\" is const char[6]. It is an array (not a pointer) until it decays, and it is const, which is why writing through it is forbidden. (Note: in C the same literal has type char[6], but this is C++.)"
    },
    {
      "type": "code",
      "tag": "UB",
      "question": "What is the behavior?",
      "code": "int main() {\n    char* p = const_cast<char*>(\"cat\");\n    p[0] = 'b';\n    return 0;\n}",
      "options": [
        "well-defined, string becomes \"bat\"",
        "undefined behavior",
        "does not compile",
        "well-defined, no effect"
      ],
      "answer": 1,
      "explain": "A string literal denotes a const array with static storage; casting away const and writing to it is undefined behavior (literals may live in read-only memory). The const_cast makes it compile, but that only removes the diagnostic, not the underlying illegality."
    },
    {
      "type": "code",
      "tag": "PtrArith",
      "question": "What is printed?",
      "code": "#include <cstdio>\nint main() {\n    int a[] = {2,4,6,8,10};\n    int* p = &a[1];\n    int* q = &a[4];\n    std::printf(\"%td\", q - p);\n}",
      "options": [
        "3",
        "12",
        "6",
        "undefined behavior"
      ],
      "answer": 0,
      "explain": "Pointer subtraction yields the number of ELEMENTS between the pointers, not bytes, so q - p is 3. '12' is the byte distance, which is what you would get from casting to char* first."
    },
    {
      "type": "code",
      "tag": "AddrOf",
      "question": "What is printed on a system with 4-byte int?",
      "code": "#include <cstdio>\nint main() {\n    int a[5] = {0};\n    long d = (char*)(&a + 1) - (char*)a;\n    std::printf(\"%ld\", d);\n}",
      "options": [
        "4",
        "20",
        "5",
        "1"
      ],
      "answer": 1,
      "explain": "&a has type pointer-to-array (int(*)[5]), so &a + 1 advances by the whole array — 5*4 = 20 bytes. Contrast with a + 1, which would advance by a single int (4 bytes); the trap is confusing &a with a."
    },
    {
      "type": "code",
      "tag": "Dangling",
      "question": "What is wrong with foo?",
      "code": "int* foo() {\n    int local[3] = {1,2,3};\n    return local;\n}",
      "options": [
        "Nothing, it returns a valid pointer",
        "It returns a pointer to a destroyed array; using it is UB",
        "It does not compile",
        "It returns a copy of the array"
      ],
      "answer": 1,
      "explain": "local is destroyed when foo returns, so the decayed pointer dangles and dereferencing it in the caller is undefined behavior. Arrays are not reference-counted or copied on return — only the pointer value escapes, pointing at dead storage."
    },
    {
      "type": "code",
      "tag": "Init",
      "question": "What is printed?",
      "code": "#include <cstdio>\nint main() {\n    int a[5] = {1,2};\n    std::printf(\"%d %d\", a[2], a[4]);\n}",
      "options": [
        "garbage garbage",
        "0 0",
        "2 2",
        "undefined behavior"
      ],
      "answer": 1,
      "explain": "When an aggregate has fewer initializers than elements, the remaining elements are value-initialized (zero for int), so a[2] and a[4] are 0. This differs from leaving them uninitialized — the presence of any braced initializer list zero-fills the rest."
    },
    {
      "type": "code",
      "tag": "Init",
      "question": "What is printed?",
      "code": "#include <cstdio>\nint g[3];\nint main() {\n    int local[3];\n    std::printf(\"%d\", g[0]);\n    (void)local;\n}",
      "options": [
        "0",
        "garbage",
        "undefined behavior",
        "does not compile"
      ],
      "answer": 0,
      "explain": "g has static storage duration, so it is zero-initialized before main runs, making g[0] reliably 0. The block-scope local, by contrast, would hold indeterminate values — reading it is what causes trouble, not reading g."
    },
    {
      "type": "mcq",
      "tag": "Multidim",
      "question": "To pass a 2D array int m[4][6] to a function so indexing works, which parameter type is correct?",
      "options": [
        "int** m",
        "int* m[6]",
        "int m[][6]",
        "int m[4][]"
      ],
      "answer": 2,
      "explain": "The array decays to int(*)[6], which int m[][6] expresses (the leftmost bound may be omitted, the column count may not). int** is a different, incompatible type, and int m[4][] leaves out the required inner dimension so the compiler cannot compute row strides."
    },
    {
      "type": "code",
      "tag": "Decay",
      "question": "What is printed?",
      "code": "#include <cstdio>\nvoid f(int* p) { std::printf(\"%zu\\n\", sizeof(p)); }\nint main() {\n    int a[8];\n    std::printf(\"%zu\\n\", sizeof(a)/sizeof(a[0]));\n    f(a);\n}",
      "options": [
        "8 then 8 (64-bit)",
        "32 then 32",
        "8 then 32",
        "1 then 8"
      ],
      "answer": 0,
      "explain": "In main the array has not decayed, so sizeof(a)/sizeof(a[0]) is the element count 8; inside f the parameter is a pointer, so sizeof(p) is 8 bytes on a 64-bit target. The coincidence that both print 8 hides that they measure completely different things."
    },
    {
      "type": "code",
      "tag": "PtrArith",
      "question": "What is the behavior of accessing beyond the array here?",
      "code": "int main() {\n    int a[3] = {1,2,3};\n    int v = a[3];\n    return v;\n}",
      "options": [
        "returns 0",
        "returns 3",
        "undefined behavior",
        "does not compile"
      ],
      "answer": 2,
      "explain": "Valid indices for a[3] are 0..2; a[3] reads one past the end, which is undefined behavior. There is no bounds checking on raw arrays, so it may appear to 'work' and return garbage — but the standard imposes no defined value."
    },
    {
      "type": "code",
      "tag": "PtrToPtr",
      "question": "What is printed?",
      "code": "#include <cstdio>\nint main() {\n    const char* words[] = {\"red\",\"green\",\"blue\"};\n    const char** pp = words;\n    std::printf(\"%c\", (*(pp + 1))[2]);\n}",
      "options": [
        "e",
        "r",
        "g",
        "undefined behavior"
      ],
      "answer": 0,
      "explain": "pp+1 points at words[1] (\"green\"); dereferencing gives that const char*, and index [2] selects its third character 'e'. Each level of indirection peels one layer: from array-of-pointers, to one string pointer, to one character."
    },
    {
      "type": "code",
      "tag": "CStrings",
      "question": "What is printed?",
      "code": "#include <cstdio>\nint main() {\n    char s[10] = \"abc\";\n    std::printf(\"%zu\", sizeof(s));\n}",
      "options": [
        "3",
        "4",
        "10",
        "8"
      ],
      "answer": 2,
      "explain": "s is declared with 10 elements; initializing it from \"abc\" fills the first four (including '\\0') and zero-fills the rest, but sizeof reflects the declared size 10. sizeof measures the array object, not the string content inside it."
    },
    {
      "type": "mcq",
      "tag": "Comparison",
      "question": "Given int a[5]; and int* p = a;, which comparison is a common bug rather than well-defined?",
      "options": [
        "p == a",
        "p < a + 5",
        "p == &a[2]",
        "comparing p to a pointer from an unrelated array with <"
      ],
      "answer": 3,
      "explain": "Relational comparison (<, >) between pointers is only defined when both point into (or one past) the SAME array object; comparing pointers from unrelated arrays with < is unspecified/undefined. Equality against p, a+5, or &a[2] all stay within a's storage and are fine."
    }
  ]
};

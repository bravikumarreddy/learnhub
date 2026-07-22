/* ===== C++ question bank =====
   To add a question, copy a block and follow the same shape.
   - type: "mcq" (plain question) or "code" (shows a code snippet)
   - options: array of answer strings
   - answer: index (0-based) of the correct option
   - explain: shown after the user answers
*/
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES["cpp"] = {
  title: "C++ Quiz",
  subtitle: "Mixed multiple-choice & code output — with explanations",
  questions: [
    {
      type: "mcq",
      tag: "Basics",
      question: "Which header must you include to use std::cout and std::cin?",
      options: ["<stdio.h>", "<iostream>", "<string>", "<ostream>"],
      answer: 1,
      explain: "std::cout and std::cin live in <iostream>. <stdio.h> is the C-style header for printf/scanf, not the C++ streams."
    },
    {
      type: "code",
      tag: "Output",
      question: "What does this program print?",
      code: "#include <iostream>\nint main() {\n    int x = 5;\n    std::cout << x++ << \" \" << x;\n    return 0;\n}",
      options: ["5 5", "5 6", "6 6", "6 5"],
      answer: 1,
      explain: "x++ is post-increment: it uses the old value (5) first, then increments x to 6. So the second output is 6, giving \"5 6\"."
    },
    {
      type: "mcq",
      tag: "Memory",
      question: "What does the 'new' operator return when it allocates memory?",
      options: [
        "The size of the allocated block",
        "A pointer to the allocated memory",
        "A reference to the object",
        "Always nullptr on success"
      ],
      answer: 1,
      explain: "new allocates memory on the heap and returns a pointer to it. On failure it throws std::bad_alloc (it does not return nullptr unless you use the nothrow version)."
    },
    {
      type: "code",
      tag: "References",
      question: "What is printed?",
      code: "#include <iostream>\nvoid f(int& a) { a = a * 2; }\nint main() {\n    int n = 10;\n    f(n);\n    std::cout << n;\n}",
      options: ["10", "20", "0", "Compiler error"],
      answer: 1,
      explain: "The parameter is a reference (int&), so f operates on n itself, not a copy. n becomes 10 * 2 = 20."
    },
    {
      type: "mcq",
      tag: "STL",
      question: "Which STL container keeps its elements automatically sorted by key?",
      options: ["std::vector", "std::unordered_map", "std::map", "std::stack"],
      answer: 2,
      explain: "std::map stores key/value pairs sorted by key (typically a balanced BST). std::unordered_map uses a hash table and is NOT sorted; vector and stack are not key-based."
    },
    {
      type: "code",
      tag: "Arrays",
      question: "What does this print?",
      code: "#include <iostream>\nint main() {\n    int arr[] = {1, 2, 3, 4};\n    std::cout << arr[2] + arr[0];\n}",
      options: ["3", "4", "5", "6"],
      answer: 1,
      explain: "Indexing is 0-based: arr[2] is 3 and arr[0] is 1, so 3 + 1 = 4."
    },
    {
      type: "mcq",
      tag: "OOP",
      question: "What is a constructor in C++?",
      options: [
        "A function that destroys an object",
        "A special member function called automatically when an object is created",
        "A pointer to the class",
        "A function that must return void"
      ],
      answer: 1,
      explain: "A constructor is a special member function with the same name as the class, invoked automatically when an object is created. It has no return type at all (not even void)."
    },
    {
      type: "code",
      tag: "Pointers",
      question: "What is the output?",
      code: "#include <iostream>\nint main() {\n    int a = 42;\n    int* p = &a;\n    *p = 100;\n    std::cout << a;\n}",
      options: ["42", "100", "Address of a", "Compiler error"],
      answer: 1,
      explain: "p holds the address of a. Writing *p = 100 changes the value stored at that address, so a becomes 100."
    },
    {
      type: "mcq",
      tag: "Types",
      question: "What is the value of the boolean expression (5 > 3) && (2 == 2)?",
      options: ["false", "true", "1 and 0", "Undefined"],
      answer: 1,
      explain: "Both sides are true: 5 > 3 is true and 2 == 2 is true. true && true evaluates to true."
    },
    {
      type: "code",
      tag: "Loops",
      question: "How many times does 'Hi' print?",
      code: "#include <iostream>\nint main() {\n    for (int i = 0; i < 5; i++)\n        std::cout << \"Hi\";\n}",
      options: ["4 times", "5 times", "6 times", "Infinite loop"],
      answer: 1,
      explain: "The loop runs while i < 5, for i = 0,1,2,3,4 — that's exactly 5 iterations, so \"Hi\" prints 5 times."
    },
    {
      type: "mcq",
      tag: "Modern C++",
      question: "What does the 'auto' keyword do in modern C++ (C++11 and later)?",
      options: [
        "Makes a variable global",
        "Lets the compiler deduce the variable's type from its initializer",
        "Automatically frees memory",
        "Marks a variable as constant"
      ],
      answer: 1,
      explain: "Since C++11, auto tells the compiler to deduce the type from the initializer, e.g. auto x = 3.14; makes x a double. It's about type deduction, not memory or constness."
    },
    {
      type: "code",
      tag: "Strings",
      question: "What is printed?",
      code: "#include <iostream>\n#include <string>\nint main() {\n    std::string s = \"code\";\n    std::cout << s.length();\n}",
      options: ["3", "4", "5", "code"],
      answer: 1,
      explain: "\"code\" has four characters (c-o-d-e), so s.length() returns 4. length() does not count a terminating null for std::string."
    },
    {
      type: "mcq",
      tag: "Memory",
      question: "For every 'new' you call in C++, what should you eventually call to avoid a memory leak?",
      options: ["free", "delete", "remove", "clear"],
      answer: 1,
      explain: "Memory from new must be released with delete (and new[] with delete[]). free() pairs with C's malloc, not with new. Better yet, use smart pointers so cleanup is automatic."
    },
    {
      type: "code",
      tag: "Output",
      question: "What does this print?",
      code: "#include <iostream>\nint main() {\n    int a = 7, b = 2;\n    std::cout << a / b << \" \" << a % b;\n}",
      options: ["3.5 1", "3 1", "3 0", "4 1"],
      answer: 1,
      explain: "Both a and b are ints, so 7 / 2 does integer division = 3 (the fraction is truncated). 7 % 2 is the remainder = 1. Output: \"3 1\"."
    },
    {
      type: "mcq",
      tag: "Modern C++",
      question: "Which smart pointer represents exclusive (single) ownership of a resource?",
      options: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::auto_ptr"],
      answer: 1,
      explain: "std::unique_ptr models sole ownership and cannot be copied (only moved). shared_ptr allows shared ownership via reference counting; weak_ptr is a non-owning observer; auto_ptr is deprecated."
    }
  ]
};

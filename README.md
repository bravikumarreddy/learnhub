# LearnHub

A simple, extensible learning site. Pick a subject → choose a learning mode (Quiz, News, Latest News) → learn. Quizzes are live now; C++ is the first subject.

Everything is plain HTML/CSS/JS — no build step, no dependencies. Perfect for free hosting on **GitHub Pages**.

## Files

| File | What it is |
|------|-----------|
| `index.html` | Home page — pick a subject |
| `subject-cpp.html` | C++ hub — pick a learning mode |
| `quiz.html` | The quiz engine (reads `?subject=cpp`) |
| `quiz.js` | Quiz logic |
| `styles.css` | Shared styling |
| `data/cpp.js` | C++ question bank (edit this to add questions) |

## Publish it free on GitHub Pages

1. Create a new repository on GitHub, e.g. `learnhub` (keep it **public**).
2. In this folder, run:

   ```bash
   git init
   git add .
   git commit -m "LearnHub: C++ quizzes"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/learnhub.git
   git push -u origin main
   ```

3. On GitHub, open the repo → **Settings** → **Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set branch to **main** and folder to **/ (root)**, then **Save**.
6. Wait ~1 minute. Your site goes live at:

   ```
   https://<YOUR-USERNAME>.github.io/learnhub/
   ```

That's it — free hosting, updates whenever you push.

## Add a new question to C++

Open `data/cpp.js` and copy an existing block:

```js
{
  type: "mcq",              // "mcq" or "code"
  tag: "Basics",            // small label shown on the card
  question: "Your question here?",
  // code: "int main(){}",  // only for type: "code"
  options: ["A", "B", "C", "D"],
  answer: 1,                // 0-based index of the correct option
  explain: "Why this answer is correct."
}
```

## Add a whole new subject (e.g. Python)

1. Copy `data/cpp.js` → `data/python.js` and change `window.QUIZZES["cpp"]` to `window.QUIZZES["python"]`, then write Python questions.
2. In `quiz.html`, add `<script src="data/python.js"></script>` next to the cpp one.
3. Copy `subject-cpp.html` → `subject-python.html` and update the links/text.
4. In `index.html`, point the Python card at `subject-python.html` and give it the `ready` badge.
5. In `quiz.js`, add `python: "subject-python.html"` to the `hubLinks` object.

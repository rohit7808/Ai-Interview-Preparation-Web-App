const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Completely Local Offline Question Bank (Structured with Answers)
const questionBank = {
    "HR": {
        "Beginner": [
            { question: "Tell me about yourself.", answer: "A brief summary of your professional background, current role, and skills relevant to the job." },
            { question: "Why do you want to work for our company?", answer: "Highlight aspects of the company culture, mission, or specific projects that align with your goals." },
            { question: "Where do you see yourself in 5 years?", answer: "Focus on professional growth, taking on more responsibility, and continuing to develop expertise in your field." },
            { question: "What do you consider to be your greatest strength?", answer: "Choose a strength relevant to the job and provide a specific, brief example of how you've used it." }
        ],
        "Intermediate": [
            { question: "Can you describe a time when you disagreed with a coworker?", answer: "Explain the situation, focus on how you communicated professionally to resolve it, and the positive outcome." },
            { question: "How do you prioritize your time during a busy week?", answer: "Mention tools or methods you use (like to-do lists, Agile, Pomodoro) to ensure critical deadlines are met." },
            { question: "What is your greatest professional achievement so far?", answer: "Share a specific project or metric where you provided significant value or overcame a major hurdle." },
            { question: "Describe a situation where you had to adapt quickly to a change.", answer: "Detail a sudden shift (like a scope change) and how you remained calm and adjusted your workflow." }
        ],
        "Advanced": [
            { question: "Describe a time when you had to lead a difficult project.", answer: "Highlight your leadership skills, how you motivated the team, and how you navigated the obstacles." },
            { question: "How do you handle delivering negative feedback to a peer?", answer: "Discuss using a constructive, empathetic approach like the 'sandwich method' in private." },
            { question: "Tell me about a time you failed and what you learned.", answer: "Own the mistake, explain exactly what went wrong, and detail the steps you took to ensure it never happens again." },
            { question: "What are your salary expectations and how do you justify them?", answer: "Provide a realistic range based on market research and concisely summarize your experience level to back it up." }
        ]
    },
    "JavaScript": {
        "Beginner": [
            { question: "What are the differences between let, const, and var?", answer: "let and const are block-scoped, while var is function-scoped. const cannot be reassigned after declaration." },
            { question: "Explain the concept of null versus undefined.", answer: "undefined means a variable has been declared but not assigned. null is an explicit assignment value representing no value." },
            { question: "What is an array and how do you loop through it?", answer: "An array is an ordered list. Loop through it using a for loop, forEach(), or a for...of loop." },
            { question: "What is a callback function and why do we use it?", answer: "A callback is a function passed into another function to be executed later, often used for asynchronous operations." }
        ],
        "Intermediate": [
            { question: "What is closure in JavaScript? Explain with an example.", answer: "A closure is a function having access to its parent scope, even after the parent function has terminated." },
            { question: "Please explain the concept of hoisting.", answer: "Hoisting is JS's default behavior of moving variable and function declarations to the top of the current scope before code execution." },
            { question: "What is the difference between synchronous and asynchronous code?", answer: "Synchronous executes line by line. Asynchronous allows operations like fetching data to run in the background without blocking the main thread." },
            { question: "Explain the Event Loop in JavaScript.", answer: "The event loop monitors the call stack and callback queue, pushing asynchronous callbacks to the stack when it is empty." }
        ],
        "Advanced": [
            { question: "How does prototypical inheritance work in JavaScript?", answer: "Objects inherit properties and methods directly from other objects via their prototype chain, rather than from formal class blueprints." },
            { question: "Explain what Web Workers are and when you would use them.", answer: "Web Workers allow running scripts in background threads, so the user interface isn't blocked by heavy computations." },
            { question: "Describe the differences between macro-tasks and micro-tasks.", answer: "Micro-tasks (like Promises) have higher priority. Macro-tasks (like setTimeout) execute in the next event loop iteration." },
            { question: "How do you handle memory leaks in a large single-page app?", answer: "Clear timers and event listeners when components unmount, and avoid unwanted global variables that prevent garbage collection." }
        ]
    },
    "React": {
        "Beginner": [
            { question: "What is JSX in React?", answer: "JSX is a syntax extension that allows you to write HTML-like markup directly inside JavaScript React components." },
            { question: "How do you pass data from a parent to a child component?", answer: "You pass data directly from parent to child via 'props'." },
            { question: "What is the difference between state and props?", answer: "Props are read-only data passed down. State is local, mutable data managed internally by the component itself." },
            { question: "Why do we need the 'key' attribute when rendering lists?", answer: "Keys help React uniquely identify which items have changed, been added, or removed from lists to efficiently update the DOM." }
        ],
        "Intermediate": [
            { question: "Explain the useEffect hook and its dependency array.", answer: "useEffect allows performing side effects. The dependency array dictates exactly when the effect runs based on variable changes." },
            { question: "What is the Virtual DOM and how does React use it?", answer: "It is a lightweight JavaScript representation of the DOM. React diffs it with a snapshot to efficiently update only changed real DOM nodes." },
            { question: "How would you manage global state in a React application?", answer: "You can use the Context API for passing data, or robust state management libraries like Redux or Zustand." },
            { question: "What are React Portals and when should you use them?", answer: "Portals render children into a DOM node outside the DOM hierarchy of the parent component, which is perfect for Modals." }
        ],
        "Advanced": [
            { question: "Explain how React's reconciliation algorithm works.", answer: "Reconciliation is the algorithm React uses to diff the Virtual DOM from the previous state and determine minimal real DOM updates." },
            { question: "How do you prevent unnecessary re-renders in functional components?", answer: "Use React.memo for components, useMemo for expensive calculations, and useCallback to cache function definitions." },
            { question: "What is Server-Side Rendering (SSR) and how does it benefit React?", answer: "SSR renders React components to HTML on the server before sending to the client, greatly improving initial load times and SEO." },
            { question: "Explain how Suspense and lazy loading improve React performance.", answer: "Suspense lets your components 'wait' for heavy code-splitting chunks or data to load before rendering, reducing initial bundle size." }
        ]
    },
    "Web Development": {
        "Beginner": [
            { question: "What is the difference between HTML, CSS, and JavaScript?", answer: "HTML provides structure, CSS provides styling and layout, and JS provides interactivity and logic." },
            { question: "Explain the difference between block and inline elements.", answer: "Block elements start on a new line taking full width. Inline elements sit on the same line taking only necessary width." },
            { question: "What does a semantic HTML tag mean?", answer: "Semantic tags clearly describe their meaning (like <article>) to both the browser and developer, improving accessibility and SEO." },
            { question: "How do you link an external CSS file to an HTML document?", answer: "By placing a <link rel='stylesheet' href='styles.css'> tag directly inside the <head> of the document." }
        ],
        "Intermediate": [
            { question: "What is CORS and why is it important?", answer: "Cross-Origin Resource Sharing is a security feature that restricts browsers from making requests to a different domain." },
            { question: "Explain the CSS Box Model.", answer: "It dictates how elements are sized, fundamentally consisting of the content area, padding, borders, and margins." },
            { question: "How do you ensure a website is accessible?", answer: "Ensure semantic HTML, correct ARIA roles, adequate color contrast, and full keyboard navigability for screen readers." },
            { question: "What are REST APIs and how do they work?", answer: "REST is an architectural style for APIs that uses standard HTTP methods (GET, POST, PUT, DELETE) and endpoints tied to resources." }
        ],
        "Advanced": [
            { question: "Describe the critical rendering path for a web browser.", answer: "The sequence of steps the browser takes to download, parse, and convert HTML, CSS, and JS into visible pixels on the screen." },
            { question: "How would you optimize a slow-loading website?", answer: "Minify assets, compress images, use a CDN, lazy load off-screen content, and reduce heavy HTTP requests." },
            { question: "Explain the differences between LocalStorage, SessionStorage, and Cookies.", answer: "LocalStorage persists indefinitely. SessionStorage clears when the tab closes. Cookies are sent with HTTP requests and expire." },
            { question: "What is a Content Security Policy (CSP) and why implement it?", answer: "CSP is an HTTP header declaring approved sources of content that the browser may load, mitigating Cross-Site Scripting (XSS) attacks." }
        ]
    }
};

function normalizeTopic(topic) {
    if (topic && topic.toLowerCase().includes("hr")) return "HR";
    return topic;
}

// Route 1: Get Question
app.post('/get-question', (req, res) => {
    try {
        const { topic = 'Web Development', level = 'Beginner', previousQuestions = [] } = req.body;
        
        const normTopic = normalizeTopic(topic);
        
        let bank = [];
        if (questionBank[normTopic] && questionBank[normTopic][level]) {
            bank = questionBank[normTopic][level];
        } else {
            bank = [{ question: "Could you tell me about your background in web development?", answer: "A solid summary of related experience." }];
        }

        // Filter out duplicates using the array of previous question STRINGS sent by frontend
        let availableOptions = bank.filter(item => !previousQuestions.includes(item.question));
        
        // Random Selection
        if (availableOptions.length > 0) {
            const selectedItem = availableOptions[Math.floor(Math.random() * availableOptions.length)];
            res.json({ question: selectedItem.question, correctAnswer: selectedItem.answer });
        } else {
            res.json({ 
                question: `You've answered all my ${level} ${normTopic} questions! Tell me about life outside of work.`,
                correctAnswer: "A discussion about hobbies, interests, or volunteering."
            });
        }
    } catch (error) {
        console.error("Error in /get-question:", error.message);
        res.status(500).json({ error: error.message || "Failed to fetch local question" });
    }
});

// Route 2: Mocked Evaluate Answer
app.post('/evaluate-answer', (req, res) => {
    const { question, answer } = req.body;
    
    if (!question || !answer) {
        return res.status(400).json({ error: "Missing question or answer" });
    }

    try {
        const feedbackList = [
            "Score: 8/10. Great response! You covered the main concept well.",
            "Score: 7/10. Good explanation, but you could add a bit more technical depth next time.",
            "Score: 9/10. Excellent answer! You articulated the idea very clearly.",
            "Score: 8/10. Solid job explaining your approach. Keep it up!"
        ];
        
        const responseText = feedbackList[Math.floor(Math.random() * feedbackList.length)];
        res.json({ evaluation: responseText });
    } catch (error) {
        console.error("Error in /evaluate-answer:", error.message);
        res.status(500).json({ error: error.message || "Failed to evaluate answer locally" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running offline safely on http://localhost:${PORT}`);
});

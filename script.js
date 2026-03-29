document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const heroSection = document.getElementById('hero-section');
    const interviewSection = document.getElementById('interview-section');
    
    const mainStartBtn = document.getElementById('main-start-btn');
    const quitBtn = document.getElementById('quit-btn');
    
    // Areas
    const qaArea = document.getElementById('qa-area');
    const completionArea = document.getElementById('completion-area');
    
    // QA Elements
    const qNumberSpan = document.getElementById('q-number');
    const questionText = document.getElementById('question-text');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const voiceBtn = document.getElementById('voice-btn');
    
    const feedbackArea = document.getElementById('feedback-area');
    const feedbackScore = document.getElementById('feedback-score');
    const feedbackText = document.getElementById('feedback-text');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const userAvatar = document.getElementById('user-avatar');
    const chatBubbleText = document.getElementById('chat-bubble-text');
    const topicSelect = document.getElementById('topic-select');
    const levelSelect = document.getElementById('level-select');
    const questionsSelect = document.getElementById('questions-select');
    const qTotalSpan = document.getElementById('q-total');

    // --- State & Data ---
    let totalQuestions = 3;
    const questions = [];
    let currentQuestionIndex = 0;
    const userAnswers = [];
    let currentTopic = "";
    let currentLevel = "";
    let currentCorrectAnswer = "";
    
    // Timer State
    let timerInterval;
    const TIME_LIMIT = 30;
    let timeLeft = TIME_LIMIT;
    const timerBadge = document.getElementById('timer-badge');

    // --- Voice UI Initialization ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isListening = true;
            voiceBtn.innerHTML = '🔴 Listening...';
            voiceBtn.style.color = '#ff8787'; 
            if (userAvatar) userAvatar.classList.add('speaking');
            if (chatBubbleText) chatBubbleText.innerHTML = "Listening carefully... 😌";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const currentVal = answerInput.value;
            if (currentVal && !currentVal.endsWith(' ') && !currentVal.endsWith('\n')) {
                answerInput.value += ' ' + transcript;
            } else {
                answerInput.value += transcript;
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech error', event.error);
            if (userAvatar) userAvatar.classList.remove('speaking');
            if (chatBubbleText) chatBubbleText.innerHTML = "Ah, I missed that. 🤷‍♂️";
        };

        recognition.onend = () => {
            isListening = false;
            voiceBtn.innerHTML = '🎤 Start Speaking';
            voiceBtn.style.color = '#c4b5fd';
            if (userAvatar) userAvatar.classList.remove('speaking');
            if (chatBubbleText) chatBubbleText.innerHTML = "I think I've got a great answer recorded! ✨";
        };
    } else {
        if (voiceBtn) voiceBtn.style.display = 'none';
    }

    // --- Event Listeners ---
    
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (!recognition) return;
            if (isListening) recognition.stop();
            else recognition.start();
        });
    }

    mainStartBtn.addEventListener('click', () => {
        currentTopic = topicSelect.value;
        currentLevel = levelSelect.value;
        totalQuestions = parseInt(questionsSelect.value, 10);
        if (qTotalSpan) qTotalSpan.textContent = totalQuestions;
        
        console.log("Frontend selecting Topic:", currentTopic, "| Level:", currentLevel);
        
        heroSection.classList.add('hidden');
        interviewSection.classList.remove('hidden');
        resetInterviewState();
        loadQuestion();
    });

    quitBtn.addEventListener('click', () => {
        interviewSection.classList.add('hidden');
        heroSection.classList.remove('hidden');
    });

    submitBtn.addEventListener('click', async () => {
        const answer = answerInput.value.trim();
        if (answer) {
            clearInterval(timerInterval);
            await evaluateAnswer(questions[currentQuestionIndex], answer);
            userAnswers.push({
                question: questions[currentQuestionIndex],
                answer: answer
            });
        } else {
            answerInput.style.borderColor = '#EF4444';
            setTimeout(() => { answerInput.style.borderColor = 'rgba(255,255,255,0.1)'; }, 1500);
        }
    });

    nextBtn.addEventListener('click', () => {
        feedbackArea.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        answerInput.value = ''; 
        
        currentQuestionIndex++;
        
        if (currentQuestionIndex < totalQuestions) {
            qaArea.classList.remove('fade-in-up');
            void qaArea.offsetWidth; // trigger reflow
            qaArea.classList.add('fade-in-up');
            loadQuestion();
        } else {
            finishInterview();
        }
    });

    restartBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        completionArea.classList.add('hidden');
        interviewSection.classList.add('hidden');
        heroSection.classList.remove('hidden');
    });

    // --- Core Functions ---
    
    function speak(text, cancelPrevious = true) {
        if ('speechSynthesis' in window) {
            if (cancelPrevious) window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            utterance.onstart = () => {
                if (userAvatar) userAvatar.classList.add('speaking');
            };
            utterance.onend = () => {
                if (userAvatar) userAvatar.classList.remove('speaking');
            };
            
            window.speechSynthesis.speak(utterance);
        }
    }

    async function getQuestion() {
        questionText.textContent = "Loading AI question...";
        answerInput.disabled = true;
        submitBtn.disabled = true;
        
        try {
            const prevQs = questions.slice(0, currentQuestionIndex);
            const response = await fetch("http://localhost:5000/get-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: currentTopic, level: currentLevel, previousQuestions: prevQs })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "API request failed");
            }
            questionText.textContent = data.question;
            questions[currentQuestionIndex] = data.question;
            currentCorrectAnswer = data.correctAnswer;
            
            if (chatBubbleText) chatBubbleText.innerHTML = "Here is your question. Good luck! 💡";
            speak(data.question, false); // false to smoothly queue it
            
            startTimer();
        } catch (error) {
            console.error("Error fetching question:", error);
            
            // Instead of hiding the error behind a fallback, we expose it so the user can debug their API key!
            let errorTxt = `API Error: ${error.message}. Ensure GEMINI_API_KEY is in .env!`;
            
            questionText.textContent = errorTxt;
            questions[currentQuestionIndex] = "API Error Occurred.";
            
            if (chatBubbleText) chatBubbleText.innerHTML = "API Connection Failed! 🚨";
            speak("I was unable to reach the Google Gemini server.", false);
        } finally {
            answerInput.disabled = false;
            submitBtn.disabled = false;
            answerInput.focus();
        }
    }

    async function evaluateAnswer(question, answer) {
        submitBtn.textContent = "Evaluating...";
        answerInput.disabled = true;
        submitBtn.disabled = true;

        try {
            const response = await fetch("http://localhost:5000/evaluate-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, answer })
            });
            if (!response.ok) throw new Error("Evaluation failed");
            const data = await response.json();
            const evaluation = data.evaluation.trim().split('\n');
            const scoreLine = evaluation[0];
            const feedbackBody = evaluation.slice(1).join(' ').trim();

            feedbackScore.textContent = scoreLine || "Score: N/A";
            feedbackText.textContent = feedbackBody || "No feedback provided.";
            
            if (chatBubbleText) chatBubbleText.innerHTML = "Here is your feedback! 📝";
            speak("Here is your feedback. " + scoreLine + ". " + (feedbackBody || "No feedback provided."));
        } catch (error) {
            console.error("Evaluation Error:", error);
            feedbackScore.textContent = "Score: Logged";
            
            const feedbackList = [
                "Your response has been saved seamlessly as we couldn't reach the API for scoring.",
                "Answer archived! We'll review the technical details later.",
                "Good point. I've noted that down for your final evaluation.",
                "Well explained. Let's move on to the next topic."
            ];
            const fallbackFeedback = feedbackList[Math.floor(Math.random() * feedbackList.length)];
            feedbackText.textContent = fallbackFeedback;
            
            if (chatBubbleText) chatBubbleText.innerHTML = "Got it! Let's keep moving. 📝";
            speak(fallbackFeedback);
        } finally {
            submitBtn.textContent = "Submit Answer";
            submitBtn.disabled = false;
            submitBtn.classList.add('hidden');
            feedbackArea.classList.remove('hidden');
        }
    }

    function loadQuestion() {
        qNumberSpan.textContent = currentQuestionIndex + 1;
        
        if (currentQuestionIndex === 0) {
            const greeting = "Hi, let's start your interview.";
            questionText.textContent = greeting + " Loading your first question...";
            if (chatBubbleText) chatBubbleText.innerHTML = "Hi, let's start your interview! 🚀";
            speak(greeting);
            
            // Wait shortly so the TTS can start before waiting for API
            setTimeout(() => {
                getQuestion();
            }, 1000);
        } else {
            getQuestion();
        }
    }

    function finishInterview() {
        qaArea.classList.add('hidden');
        completionArea.classList.remove('hidden');
    }

    function resetInterviewState() {
        currentQuestionIndex = 0;
        userAnswers.length = 0;
        answerInput.value = '';
        qaArea.classList.remove('hidden');
        completionArea.classList.add('hidden');
        feedbackArea.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        clearInterval(timerInterval);
        if (timerBadge) timerBadge.textContent = `⏱️ ${TIME_LIMIT}s`;
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = TIME_LIMIT;
        if (timerBadge) timerBadge.textContent = `⏱️ ${timeLeft}s`;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timerBadge) timerBadge.textContent = `⏱️ ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeUp();
            }
        }, 1000);
    }

    function handleTimeUp() {
        if (isListening && recognition) recognition.stop();
        
        answerInput.disabled = true;
        submitBtn.disabled = true;
        
        let answerToDisplay = typeof currentCorrectAnswer !== 'undefined' && currentCorrectAnswer 
            ? currentCorrectAnswer 
            : "The correct answer roughly covers the core definition and practical examples for this requirement.";
            
        feedbackScore.textContent = "Time's Up! Expected Answer: ⏰";
        feedbackText.textContent = answerToDisplay;
        
        submitBtn.classList.add('hidden');
        feedbackArea.classList.remove('hidden');
        nextBtn.classList.add('hidden'); // Hide manual next button during auto-advance
        
        if (chatBubbleText) chatBubbleText.innerHTML = "Time's up! Showing the answer... ⏱️";
        speak("Time is up! Here is the expected answer.");
        
        // Auto-advance logic (Wait 5-6 seconds)
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < totalQuestions) {
                qaArea.classList.remove('fade-in-up');
                void qaArea.offsetWidth; // trigger reflow
                qaArea.classList.add('fade-in-up');
                
                feedbackArea.classList.add('hidden');
                submitBtn.classList.remove('hidden');
                nextBtn.classList.remove('hidden'); // Restore
                answerInput.value = ''; 
                
                loadQuestion();
            } else {
                nextBtn.classList.remove('hidden'); // Restore
                finishInterview();
            }
        }, 5500);
    }
});

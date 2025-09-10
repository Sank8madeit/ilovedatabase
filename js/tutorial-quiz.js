// Interactive quiz functionality for tutorial pages (fixed progress + normalized IDs)
class TutorialQuiz {
    constructor() {
        this.init();
    }

    init() {
        this.setupQuizzes();
        this.setupInteractiveElements();
    }

    /* -------------------------
       Quiz setup & handling
       ------------------------- */
    setupQuizzes() {
        const quizForms = document.querySelectorAll('.quiz-form');
        
        quizForms.forEach((form) => {
            const submitBtn = form.querySelector('.quiz-submit');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    this.handleQuizSubmission(form);
                });
            }
        });
    }

    handleQuizSubmission(form) {
        const feedbackContainer = form.querySelector('.quiz-feedback');
        const questions = form.querySelectorAll('.quiz-question');
        let correctCount = 0;
        let totalCount = 0;

        questions.forEach((q, idx) => {
            const name = `q${idx + 1}`;
            const selected = form.querySelector(`input[name="${name}"]:checked`);
            const correct = form.querySelector(`input[name="${name}"][data-correct="true"]`);

            totalCount++;

            if (!selected) return; // unanswered

            if (selected === correct) {
                correctCount++;
                selected.parentElement.style.backgroundColor = "#d1fae5"; // green
            } else {
                selected.parentElement.style.backgroundColor = "#fee2e2"; // red
                if (correct) {
                    correct.parentElement.style.backgroundColor = "#d1fae5"; // show correct
                }
            }
        });

        if (correctCount === totalCount) {
            this.showFeedback(feedbackContainer, `✅ Perfect! You got all ${correctCount}/${totalCount} correct.`, 'success');
        } else {
            this.showFeedback(feedbackContainer, `You got ${correctCount} out of ${totalCount} correct.`, 'error');
        }

        // Disable button after submission
        const submitBtn = form.querySelector('.quiz-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Answer Submitted';
        }

        // Disable all radios
        const radios = form.querySelectorAll('input[type="radio"]');
        radios.forEach(r => r.disabled = true);
    }

    showFeedback(container, message, type) {
        container.innerHTML = message;
        container.className = `quiz-feedback ${type}`;
        container.style.display = 'block';

        const styles = {
            success: { backgroundColor: '#d1fae5', color: '#065f46', borderLeft: '4px solid #10b981' },
            error: { backgroundColor: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #ef4444' },
            warning: { backgroundColor: '#fef3c7', color: '#92400e', borderLeft: '4px solid #f59e0b' }
        };
        Object.assign(container.style, styles[type]);
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* -------------------------
       Interactive UI (code examples / try-it)
       ------------------------- */
    setupInteractiveElements() {
        this.setupCodeExamples();
        this.setupTryItButtons();
        this.setupProgressTracking();
    }

    setupCodeExamples() {
        const codeExamples = document.querySelectorAll('.code-example');
        codeExamples.forEach(example => {
            const tryItBtn = example.querySelector('.try-it-btn');
            if (tryItBtn) {
                tryItBtn.addEventListener('click', () => {
                    this.openSQLEditor(example);
                });
            }
        });
    }

    openSQLEditor(codeExample) {
        const code = codeExample.querySelector('code').textContent;
        const modal = this.createSQLEditorModal(code);
        document.body.appendChild(modal);

        const editor = modal.querySelector('.sql-editor');
        editor.focus();
        editor.setSelectionRange(editor.value.length, editor.value.length);
    }

    createSQLEditorModal(initialCode) {
        const modal = document.createElement('div');
        modal.className = 'sql-editor-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="sql-editor-container" style="background: var(--bg-primary); border-radius: var(--radius-lg); width: 90%; max-width: 800px; max-height: 90%; overflow: hidden; box-shadow: var(--shadow-lg);">
                <div class="editor-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                    <h3 style="margin: 0; color: var(--text-primary);">Try SQL Query</h3>
                    <button class="close-editor" style="background:none; border:none; font-size:1.5rem; color:var(--text-secondary); cursor:pointer;">&times;</button>
                </div>
                <div class="editor-body" style="padding:1rem;">
                    <textarea class="sql-editor" style="width:100%; height:200px; font-family: var(--font-mono); font-size:0.875rem; padding:1rem; border:1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-code); color: var(--text-primary); resize: vertical;">${initialCode}</textarea>
                    <div class="editor-actions" style="display:flex; gap:1rem; margin-top:1rem; justify-content:flex-end;">
                        <button class="run-query" style="background: var(--primary-color); color: var(--text-inverse); border:none; padding:0.75rem 1.5rem; border-radius: var(--radius-md); cursor:pointer; font-weight:500;">Run Query</button>
                        <button class="reset-query" style="background: var(--bg-tertiary); color: var(--text-secondary); border:1px solid var(--border-color); padding:0.75rem 1.5rem; border-radius: var(--radius-md); cursor:pointer; font-weight:500;">Reset</button>
                    </div>
                    <div class="query-result" style="margin-top:1rem; padding:1rem; background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-color); display:none;">
                        <h4 style="margin:0 0 1rem 0; color: var(--text-primary);">Query Result:</h4>
                        <div class="result-content"></div>
                    </div>
                </div>
            </div>
        `;

        const closeBtn = modal.querySelector('.close-editor');
        const runBtn = modal.querySelector('.run-query');
        const resetBtn = modal.querySelector('.reset-query');
        const editor = modal.querySelector('.sql-editor');
        const resultContainer = modal.querySelector('.query-result');

        closeBtn.addEventListener('click', () => document.body.removeChild(modal));
        modal.addEventListener('click', e => { if (e.target === modal) document.body.removeChild(modal); });
        runBtn.addEventListener('click', () => this.simulateQueryExecution(editor.value, resultContainer));
        resetBtn.addEventListener('click', () => { editor.value = initialCode; resultContainer.style.display = 'none'; });

        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') {
                if (document.body.contains(modal)) document.body.removeChild(modal);
                document.removeEventListener('keydown', esc);
            }
        });

        return modal;
    }

    simulateQueryExecution(query, resultContainer) {
        const resultContent = resultContainer.querySelector('.result-content');
        resultContent.innerHTML = '<p style="color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Running query...</p>';
        resultContainer.style.display = 'block';

        setTimeout(() => {
            if (query.toLowerCase().includes('select')) {
                resultContent.innerHTML = `
                    <div class="table-container"><table style="width:100%; border-collapse:collapse;">
                        <thead><tr style="background: var(--bg-tertiary);">
                            <th style="padding:0.5rem; border:1px solid var(--border-color);">first_name</th>
                            <th style="padding:0.5rem; border:1px solid var(--border-color);">last_name</th>
                            <th style="padding:0.5rem; border:1px solid var(--border-color);">email</th>
                        </tr></thead>
                        <tbody>
                            <tr><td style="padding:0.5rem; border:1px solid var(--border-color);">John</td><td style="padding:0.5rem; border:1px solid var(--border-color);">Doe</td><td style="padding:0.5rem; border:1px solid var(--border-color);">john.doe@email.com</td></tr>
                            <tr><td style="padding:0.5rem; border:1px solid var(--border-color);">Sarah</td><td style="padding:0.5rem; border:1px solid var(--border-color);">Smith</td><td style="padding:0.5rem; border:1px solid var(--border-color);">sarah.smith@email.com</td></tr>
                        </tbody></table></div>
                        <p style="margin-top:0.5rem; color:var(--text-secondary); font-size:0.875rem;"><i class="fas fa-info-circle"></i> 2 rows returned in 0.001 seconds</p>
                `;
            } else {
                resultContent.innerHTML = `<p style="color:var(--text-secondary);"><i class="fas fa-exclamation-triangle"></i> Demo mode: only SELECT queries return results.</p>`;
            }
        }, 1000);
    }

    setupTryItButtons() {
        const tryItButtons = document.querySelectorAll('.try-it-btn');
        tryItButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const codeBlock = button.closest('.code-example');
                if (codeBlock) this.openSQLEditor(codeBlock);
            });
        });
    }

    /* -------------------------
       Progress tracking (fixed)
       ------------------------- */

    setupProgressTracking() {
        this.trackLessonProgress();
        // Ensure the UI reflects current localStorage on load
        this.updateSidebarProgress();
        this.updateProgressBar();
    }

    trackLessonProgress() {
        const lessonId = this.getCurrentLessonId();

        // mark as started (keeps previous behavior)
        this.markLessonStarted(lessonId);

        // scroll-based completion
        let maxScroll = 0;
        const trackScroll = () => {
            const scrollPercent = (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercent);
            if (maxScroll > 80) {
                this.markLessonCompleted(lessonId);
            }
        };
        // throttle the handler
        window.addEventListener('scroll', this.throttle(trackScroll, 1000));
    }

    /* Helper: canonicalize lesson id from a path or href */
    normalizeLessonIdFromUrl(urlString) {
        try {
            const url = new URL(urlString, window.location.origin);
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts.length === 0) return 'home';
            let last = parts[parts.length - 1];
            if (last === 'index.html' && parts.length > 1) return parts[parts.length - 2];
            if (last.endsWith('.html')) return last.replace('.html', '');
            return last;
        } catch (e) {
            // fallback lightweight normalization
            const trimmed = String(urlString).replace(/\/+$/, '');
            const parts = trimmed.split('/').filter(Boolean);
            let last = parts.pop() || trimmed;
            return last.replace('.html', '');
        }
    }

    getCurrentLessonId() {
        // Use the full location href to normalize consistently
        return this.normalizeLessonIdFromUrl(window.location.href) || 'introduction';
    }

    getCompletedLessons() {
        try {
            const raw = localStorage.getItem('completed_lessons') || '[]';
            const arr = JSON.parse(raw);
            // ensure unique and stable
            return Array.from(new Set(arr));
        } catch (e) {
            return [];
        }
    }

    markLessonStarted(lessonId) {
        try {
            const started = JSON.parse(localStorage.getItem('started_lessons') || '[]');
            if (!started.includes(lessonId)) {
                started.push(lessonId);
                localStorage.setItem('started_lessons', JSON.stringify(Array.from(new Set(started))));
            }
        } catch (e) {
            localStorage.setItem('started_lessons', JSON.stringify([lessonId]));
        }
    }

    markLessonCompleted(lessonId) {
        if (!lessonId) return;
        const completed = this.getCompletedLessons();
        if (!completed.includes(lessonId)) {
            completed.push(lessonId);
            localStorage.setItem('completed_lessons', JSON.stringify(Array.from(new Set(completed))));
            // update UI immediately
            this.updateSidebarProgress();
            this.updateProgressBar();
        }
    }

    updateSidebarProgress() {
        const completed = this.getCompletedLessons();
        const sidebarLinks = document.querySelectorAll('.sidebar-nav a, .nav-menu a');
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href') || link.href || '';
            const lessonId = this.normalizeLessonIdFromUrl(href);
            if (completed.includes(lessonId)) link.classList.add('completed');
            else link.classList.remove('completed');
        });
    }

    updateProgressBar() {
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        if (progressBar && progressText) {
            const completed = this.getCompletedLessons();
            const total = 12; // adjust if your course length changes
            const percent = Math.round((completed.length / total) * 100);
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `${completed.length} of ${total} lessons completed`;
        }
    }

    trackEvent(eventName, properties = {}) {
        console.log('Track Event:', eventName, properties);
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            if (!inThrottle) {
                func.apply(this, arguments);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    new TutorialQuiz();
});
window.TutorialQuiz = TutorialQuiz;

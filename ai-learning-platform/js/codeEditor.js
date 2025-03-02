function initCodeEditor() {
    const codeEditor = document.getElementById('code-editor');
    const runButton = document.getElementById('run-code');
    const checkButton = document.getElementById('check-code');
    const resetButton = document.getElementById('reset-code');
    const outputContainer = document.getElementById('code-output');
    
    if (!codeEditor || !outputContainer) return;
    
    if (runButton) {
        runButton.addEventListener('click', runCode);
    }
    
    if (checkButton) {
        checkButton.addEventListener('click', checkCode);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', resetCode);
    }
    
    codeEditor.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
        
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });
    
    if (typeof Prism !== 'undefined') {
        codeEditor.addEventListener('input', function() {
            const code = this.value;
            const highlighted = Prism.highlight(code, Prism.languages.javascript, 'javascript');
            codeEditor.innerHTML = highlighted; // Ensure highlighted code is displayed
        });
    }
}

function runCode() {
    const codeEditor = document.getElementById('code-editor');
    const outputContainer = document.getElementById('code-output');
    
    if (!codeEditor || !outputContainer) return;
    
    const code = codeEditor.value;
    outputContainer.innerHTML = '';
    
    try {
        const outputs = [];
        const virtualConsole = {
            log: function(...args) {
                outputs.push(args.map(arg => formatOutput(arg)).join(' '));
                console.log(...args);
            },
            error: function(...args) {
                outputs.push(`<span class="error">${args.map(arg => formatOutput(arg)).join(' ')}</span>`);
                console.error(...args);
            }
        };
        
        const executeCode = new Function('console', code);
        executeCode(virtualConsole);
        
        if (outputs.length > 0) {
            outputContainer.innerHTML = outputs.join('<br>');
        } else {
            outputContainer.innerHTML = '<span class="no-output">Code executed with no output.</span>';
        }
    } catch (error) {
        outputContainer.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    }
    
    const currentLesson = getCurrentLesson();
    if (currentLesson) {
        updateVisualization(currentLesson.id, codeEditor.value);
    }
}

function checkCode() {
    const codeEditor = document.getElementById('code-editor');
    const outputContainer = document.getElementById('code-output');
    
    if (!codeEditor || !outputContainer) return;
    
    const code = codeEditor.value;
    const currentLesson = getCurrentLesson();
    
    if (!currentLesson || !currentLesson.checkCode) {
        outputContainer.innerHTML = '<span class="error">Cannot check code for this lesson.</span>';
        return;
    }
    
    try {
        const passed = currentLesson.checkCode(code);
        
        if (passed) {
            outputContainer.innerHTML = '<span class="success">Great job! You\'ve completed this task correctly.</span>';
            completeLesson(currentLesson.id);
        } else {
            outputContainer.innerHTML = '<span class="error">Not quite right. Try again!</span>';
            if (currentLesson.hint) {
                outputContainer.innerHTML += `<br><span class="hint">Hint: ${currentLesson.hint}</span>`;
            }
        }
    } catch (error) {
        outputContainer.innerHTML = `<span class="error">Error checking code: ${error.message}</span>`;
    }
}

function resetCode() {
    const codeEditor = document.getElementById('code-editor');
    if (!codeEditor) return;
    
    const currentLesson = getCurrentLesson();
    
    if (currentLesson && currentLesson.boilerplateCode) {
        codeEditor.value = currentLesson.boilerplateCode;
    } else {
        codeEditor.value = '// Write your code here\n\n';
    }
    
    document.getElementById('code-output').innerHTML = '';
}

function formatOutput(value) {
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2);
        } catch (e) {
            return String(value);
        }
    }
    return String(value);
}

window.initCodeEditor = initCodeEditor;
window.runCode = runCode;
window.checkCode = checkCode;
window.resetCode = resetCode;

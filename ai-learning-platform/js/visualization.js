// Canvas and visualization context
let canvas = document.getElementById('visualization-canvas');
let ctx = canvas.getContext('2d');

// Current visualization state
let visualizationState = {
    type: null,
    data: null,
    animation: null,
    step: 0
};

// Available visualizations for different lesson types
const visualizations = {
    'decision-trees': setupDecisionTreeViz,
    'neural-networks': setupNeuralNetworkViz,
    'reinforcement': setupReinforcementLearningViz,
    // Add more visualizations as needed
};

/**
 * Prepare the visualization for a specific lesson
 * @param {string} lessonId - The ID of the lesson
 */
function prepareVisualization(lessonId) {
    const visualizationContainer = document.getElementById('visualization-container');
    
    if (!visualizationContainer) return;
    
    // Clear previous visualization
    visualizationContainer.innerHTML = '';
    
    // Check if we have a visualization for this lesson
    if (visualizations[lessonId]) {
        visualizationContainer.classList.remove('hidden');
        visualizations[lessonId](visualizationContainer);
    } else {
        visualizationContainer.classList.add('hidden');
    }
}

/**
 * Update visualization based on user code
 * @param {string} lessonId - The ID of the lesson
 * @param {string} code - The user's code
 */
function updateVisualization(lessonId, code) {
    // Only perform updates for lessons that have interactive visualizations
    switch (lessonId) {
        case 'decision-trees':
            updateDecisionTreeViz(code);
            break;
        case 'neural-networks':
            updateNeuralNetworkViz(code);
            break;
        case 'reinforcement':
            updateReinforcementLearningViz(code);
            break;
        default:
            // No visualization to update
            break;
    }
}

/**
 * Setup visualization for decision trees lesson
 * @param {HTMLElement} container - The container element for the visualization
 */
function setupDecisionTreeViz(container) {
    // Create canvas and controls for the decision tree visualization
    container.innerHTML = `
        <h3>Decision Tree Visualization</h3>
        <div class="viz-controls">
            <div class="input-group">
                <label for="feature1-input">Feature 1:</label>
                <input type="range" id="feature1-input" min="0" max="10" value="5" step="0.5">
                <span id="feature1-value">5</span>
            </div>
            <div class="input-group">
                <label for="feature2-input">Feature 2:</label>
                <input type="range" id="feature2-input" min="0" max="10" value="5" step="0.5">
                <span id="feature2-value">5</span>
            </div>
        </div>
        <div class="viz-output">
            <p>Classification: <span id="classification-result">C</span></p>
        </div>
        <div class="viz-canvas">
            <canvas id="decision-tree-canvas" width="400" height="300"></canvas>
        </div>
    `;
    
    // Add event listeners for input controls
    const feature1Input = document.getElementById('feature1-input');
    const feature2Input = document.getElementById('feature2-input');
    
    const updateFeatureDisplay = () => {
        document.getElementById('feature1-value').textContent = feature1Input.value;
        document.getElementById('feature2-value').textContent = feature2Input.value;
        
        // Try to run the classification with current values
        try {
            updateDecisionTreeViz();
        } catch (e) {
            // Ignore errors, user may not have implemented the function yet
        }
    };
    
    feature1Input.addEventListener('input', updateFeatureDisplay);
    feature2Input.addEventListener('input', updateFeatureDisplay);
    
    // Initial draw of the visualization
    drawDecisionTreeBackground();
}

/**
 * Draw the background grid for decision tree visualization
 */
function drawDecisionTreeBackground() {
    const canvas = document.getElementById('decision-tree-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Draw decision boundaries
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    
    // Horizontal line at y = 3
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - (3/10 * canvas.height));
    ctx.lineTo(canvas.width, canvas.height - (3/10 * canvas.height));
    ctx.stroke();
    
    // Vertical line at x = 5
    ctx.beginPath();
    ctx.moveTo(5/10 * canvas.width, 0);
    ctx.lineTo(5/10 * canvas.width, canvas.height);
    ctx.stroke();
    
    // Draw legend for regions
    ctx.font = '14px Arial';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('Region A', 7/10 * canvas.width, 2/10 * canvas.height);
    
    ctx.fillStyle = '#3498db';
    ctx.fillText('Region B', 2/10 * canvas.width, 8/10 * canvas.height);
    
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('Region C', 7/10 * canvas.width, 8/10 * canvas.height);
    ctx.fillText('Region C', 2/10 * canvas.width, 2/10 * canvas.height);
}

/**
 * Update the decision tree visualization based on user code
 */
function updateDecisionTreeViz(code) {
    const feature1Value = parseFloat(document.getElementById('feature1-input').value);
    const feature2Value = parseFloat(document.getElementById('feature2-input').value);
    const resultDisplay = document.getElementById('classification-result');
    
    // Try to get the classify function from user's code
    let classify;
    try {
        if (code) {
            // Extract the user's classify function
            const functionMatch = code.match(/function\s+classify\s*\([\s\w,]*\)\s*{[\s\S]*?}/);
            if (functionMatch) {
                eval('classify = ' + functionMatch[0]);
            }
        }
    } catch (e) {
        console.error("Error extracting classify function:", e);
    }
    
    // If we couldn't get the function, use a default implementation
    if (typeof classify !== 'function') {
        classify = function(f1, f2) {
            if (f1 > 5 && f2 < 3) return "A";
            if (f1 < 5 && f2 > 7) return "B";
            return "C";
        };
    }
    
    // Get the classification result
    try {
        const result = classify(feature1Value, feature2Value);
        resultDisplay.textContent = result;
        
        // Update the point on the visualization
        updatePointOnDecisionTree(feature1Value, feature2Value, result);
    } catch (e) {
        resultDisplay.textContent = "Error";
        console.error("Error classifying point:", e);
    }
}

/**
 * Update the point position on the decision tree visualization
 */
function updatePointOnDecisionTree(x, y, classification) {
    const canvas = document.getElementById('decision-tree-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Redraw the background
    drawDecisionTreeBackground();
    
    // Map input values to canvas coordinates
    const canvasX = (x / 10) * canvas.width;
    const canvasY = canvas.height - ((y / 10) * canvas.height);
    
    // Set point color based on classification
    let pointColor = '#2ecc71'; // Default green for C
    if (classification === 'A') {
        pointColor = '#e74c3c'; // Red for A
    } else if (classification === 'B') {
        pointColor = '#3498db'; // Blue for B
    }
    
    // Draw the point
    ctx.fillStyle = pointColor;
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a border to the point
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * Setup visualization for neural networks lesson
 * @param {HTMLElement} container - The container element for the visualization
 */
function setupNeuralNetworkViz(container) {
    container.innerHTML = `
        <h3>Neural Network Visualization</h3>
        <div class="viz-controls">
            <div class="input-group">
                <label for="nn-input1">Input 1 (x₁):</label>
                <input type="range" id="nn-input1" min="-5" max="5" value="1" step="0.1">
                <span id="nn-input1-value">1</span>
            </div>
            <div class="input-group">
                <label for="nn-input2">Input 2 (x₂):</label>
                <input type="range" id="nn-input2" min="-5" max="5" value="0.5" step="0.1">
                <span id="nn-input2-value">0.5</span>
            </div>
            <div class="input-group">
                <label for="nn-weight1">Weight 1 (w₁):</label>
                <input type="range" id="nn-weight1" min="-2" max="2" value="0.5" step="0.1">
                <span id="nn-weight1-value">0.5</span>
            </div>
            <div class="input-group">
                <label for="nn-weight2">Weight 2 (w₂):</label>
                <input type="range" id="nn-weight2" min="-2" max="2" value="0.5" step="0.1">
                <span id="nn-weight2-value">0.5</span>
            </div>
            <div class="input-group">
                <label for="nn-bias">Bias:</label>
                <input type="range" id="nn-bias" min="-2" max="2" value="0" step="0.1">
                <span id="nn-bias-value">0</span>
            </div>
        </div>
        <div class="viz-output">
            <p>Neuron Output: <span id="neuron-output">?</span></p>
        </div>
        <div class="viz-canvas">
            <canvas id="neural-network-canvas" width="400" height="300"></canvas>
        </div>
    `;
    
    // Add event listeners for all sliders
    const inputs = ['nn-input1', 'nn-input2', 'nn-weight1', 'nn-weight2', 'nn-bias'];
    inputs.forEach(inputId => {
        const slider = document.getElementById(inputId);
        slider.addEventListener('input', () => {
            document.getElementById(`${inputId}-value`).textContent = slider.value;
            updateNeuralNetworkViz();
        });
    });
    
    // Initial draw
    drawNeuralNetwork();
}

/**
 * Update the neural network visualization
 */
function updateNeuralNetworkViz(code) {
    // Get current values from sliders
    const x1 = parseFloat(document.getElementById('nn-input1').value);
    const x2 = parseFloat(document.getElementById('nn-input2').value);
    const w1 = parseFloat(document.getElementById('nn-weight1').value);
    const w2 = parseFloat(document.getElementById('nn-weight2').value);
    const bias = parseFloat(document.getElementById('nn-bias').value);
    
    // Try to get the neuron function from user's code
    let neuron;
    try {
        if (code) {
            // Extract the user's neuron function
            const functionMatch = code.match(/function\s+neuron\s*\([\s\w,]*\)\s*{[\s\S]*?}/);
            if (functionMatch) {
                eval('neuron = ' + functionMatch[0]);
            }
        }
    } catch (e) {
        console.error("Error extracting neuron function:", e);
    }
    
    // If we couldn't get the function, use a default implementation
    if (typeof neuron !== 'function') {
        neuron = function(x1, x2, w1, w2, bias) {
            const sum = x1 * w1 + x2 * w2 + bias;
            return 1 / (1 + Math.exp(-sum)); // Sigmoid activation
        };
    }
    
    // Calculate the output
    try {
        const output = neuron(x1, x2, w1, w2, bias);
        document.getElementById('neuron-output').textContent = output.toFixed(4);
        
        // Update the visualization
        drawNeuralNetwork(x1, x2, w1, w2, bias, output);
    } catch (e) {
        document.getElementById('neuron-output').textContent = "Error";
        console.error("Error calculating neuron output:", e);
    }
}

/**
 * Draw the neural network visualization
 */
function drawNeuralNetwork(x1, x2, w1, w2, bias, output) {
    const canvas = document.getElementById('neural-network-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Define coordinates
    const inputX = 50;
    const hiddenX = 200;
    const outputX = 350;
    const input1Y = 100;
    const input2Y = 200;
    const hiddenY = 150;
    const outputY = 150;
    
    // Draw nodes
    function drawNode(x, y, label, value = null) {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#f2f2f2';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
        
        if (value !== null) {
            ctx.font = '12px Arial';
            ctx.fillText(value, x, y + 30);
        }
    }
    
    // Draw connections
    function drawConnection(x1, y1, x2, y2, weight) {
        const color = weight >= 0 ? 
            `rgba(52, 152, 219, ${Math.min(Math.abs(weight), 1)})` : 
            `rgba(231, 76, 60, ${Math.min(Math.abs(weight), 1)})`;
        
        const lineWidth = Math.max(1, Math.abs(weight) * 3);
        
        ctx.beginPath();
        ctx.moveTo(x1 + 20, y1); // Starting from the right edge of the node
        ctx.lineTo(x2 - 20, y2); // Ending at the left edge of the node
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        
        // Draw weight value
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(weight.toFixed(1), midX, midY - 10);
    }
    
    // Draw input nodes
    drawNode(inputX, input1Y, "x₁", x1?.toFixed(1));
    drawNode(inputX, input2Y, "x₂", x2?.toFixed(1));
    
    // Draw hidden node (neuron)
    drawNode(hiddenX, hiddenY, "Σ");
    
    // Draw output node
    const outputColor = output >= 0.5 ? 
        `rgba(46, 204, 113, ${Math.max(0.3, output)})` : 
        `rgba(255, 255, 255, ${1 - Math.max(0.3, output)})`;
    
    ctx.beginPath();
    ctx.arc(outputX, outputY, 20, 0, Math.PI * 2);
    ctx.fillStyle = outputColor;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText("σ", outputX, outputY);
    
    if (output !== undefined) {
        ctx.font = '12px Arial';
        ctx.fillText(output.toFixed(2), outputX, outputY + 30);
    }
    
    // Draw connections
    if (w1 !== undefined && w2 !== undefined) {
        drawConnection(inputX, input1Y, hiddenX, hiddenY, w1);
        drawConnection(inputX, input2Y, hiddenX, hiddenY, w2);
    }
    drawConnection(hiddenX, hiddenY, outputX, outputY, 1); // Bias connection
}

/**
 * Prepares the visualization area for the current lesson
 * @param {Object} lessonData - The current lesson data
 */
function prepareVisualization(lessonData) {
    const visualizationContainer = document.getElementById('visualization-container');
    const visualizationCanvas = document.getElementById('visualization-canvas');
    const ctx = visualizationCanvas.getContext('2d');
    
    // Clear previous visualizations
    ctx.clearRect(0, 0, visualizationCanvas.width, visualizationCanvas.height);
    
    // Show visualization container if this lesson has visualization
    if (lessonData.hasVisualization) {
        visualizationContainer.classList.remove('hidden');
        
        // Setup visualization based on lesson type
        if (lessonData.visualizationType) {
            switch (lessonData.visualizationType) {
                case 'graph':
                    setupGraphVisualization(lessonData, ctx);
                    break;
                case 'chart':
                    setupChartVisualization(lessonData, ctx);
                    break;
                case 'network':
                    setupNetworkVisualization(lessonData, ctx);
                    break;
                default:
                    // Default visualization setup
                    setupDefaultVisualization(ctx);
            }
        }
    } else {
        visualizationContainer.classList.add('hidden');
    }
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Hide visualization container
function hideVisualization() {
    document.getElementById('visualization-container').classList.add('hidden');
}

// Intro lesson visualization
function setupIntroVisualization() {
    visualizationState.type = 'intro';
    visualizationState.data = {
        message: "Hello AI World!",
        position: { x: 50, y: 50 },
        color: 0
    };
    
    animateIntro();
}

// Animate intro visualization
function animateIntro() {
    clearCanvas();
    
    // Rainbow effect
    const hue = (visualizationState.data.color += 2) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.font = '30px Arial';
    ctx.fillText(visualizationState.data.message, visualizationState.data.position.x, visualizationState.data.position.y);
    
    // Bounce animation
    visualizationState.data.position.y += Math.sin(Date.now() / 200) * 2;
    
    // Continue animation
    visualizationState.animation = requestAnimationFrame(animateIntro);
}

// Decision tree visualization
function setupDecisionTreeVisualization() {
    visualizationState.type = 'decision-tree';
    visualizationState.data = {
        nodes: [
            { x: 300, y: 50, text: "feature1 > 5?", width: 100, height: 40 },
            { x: 200, y: 120, text: "feature2 > 7?", width: 100, height: 40 },
            { x: 400, y: 120, text: "feature2 < 3?", width: 100, height: 40 },
            { x: 150, y: 190, text: "Class C", width: 80, height: 40, class: 'C' },
            { x: 250, y: 190, text: "Class B", width: 80, height: 40, class: 'B' },
            { x: 350, y: 190, text: "Class C", width: 80, height: 40, class: 'C' },
            { x: 450, y: 190, text: "Class A", width: 80, height: 40, class: 'A' }
        ],
        edges: [
            { from: 0, to: 1, text: "No" },
            { from: 0, to: 2, text: "Yes" },
            { from: 1, to: 3, text: "No" },
            { from: 1, to: 4, text: "Yes" },
            { from: 2, to: 5, text: "No" },
            { from: 2, to: 6, text: "Yes" }
        ],
        highlightPath: null
    };
    
    drawDecisionTree();
}

// Draw decision tree
function drawDecisionTree() {
    clearCanvas();
    
    // Draw edges first
    visualizationState.data.edges.forEach(edge => {
        const fromNode = visualizationState.data.nodes[edge.from];
        const toNode = visualizationState.data.nodes[edge.to];
        
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        
        // Draw the edge
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y + fromNode.height/2);
        ctx.lineTo(toNode.x, toNode.y - toNode.height/2);
        ctx.stroke();
        
        // Draw the edge label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + fromNode.height/2 + toNode.y - toNode.height/2) / 2;
        ctx.fillText(edge.text, midX + 10, midY);
    });
    
    // Draw nodes
    visualizationState.data.nodes.forEach((node, index) => {
        // Different styling for class nodes
        if (node.class) {
            let color;
            switch(node.class) {
                case 'A': color = '#3498db'; break;
                case 'B': color = '#e74c3c'; break;
                case 'C': color = '#2ecc71'; break;
                default: color = '#95a5a6';
            }
            
            ctx.fillStyle = color;
            ctx.strokeStyle = '#333';
        } else {
            ctx.fillStyle = '#f1c40f';
            ctx.strokeStyle = '#d35400';
        }
        
        // Draw node
        ctx.lineWidth = 2;
        roundRect(ctx, node.x - node.width/2, node.y - node.height/2, node.width, node.height, 10, true, true);
        
        // Draw text
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.text, node.x, node.y);
    });
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// Neural network visualization
function setupNeuralNetworkVisualization() {
    visualizationState.type = 'neural-network';
    visualizationState.data = {
        inputs: [
            { x: 100, y: 150, value: 0.5 },
            { x: 100, y: 250, value: 0.8 }
        ],
        weights: [
            { from: 0, to: 0, value: 0.4 },
            { from: 1, to: 0, value: -0.5 }
        ],
        neuron: { x: 300, y: 200, bias: 0.2, output: 0 },
        signalProgress: 0
    };
    
    drawNeuralNetwork();
}

// Draw neural network
function drawNeuralNetwork() {
    clearCanvas();
    
    // Draw connections (weights)
    visualizationState.data.weights.forEach(weight => {
        const input = visualizationState.data.inputs[weight.from];
        const neuron = visualizationState.data.neuron;
        
        // Calculate color based on weight
        let color;
        if (weight.value > 0) {
            color = `rgba(52, 152, 219, ${Math.abs(weight.value)})`;  // Blue for positive
        } else {
            color = `rgba(231, 76, 60, ${Math.abs(weight.value)})`;   // Red for negative
        }
        
        // Line width based on weight strength
        const lineWidth = Math.abs(weight.value) * 5;
        
        // Draw connection
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(input.x, input.y);
        ctx.lineTo(neuron.x, neuron.y);
        ctx.stroke();
        
        // Draw weight value
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const midX = (input.x + neuron.x) / 2;
        const midY = (input.y + neuron.y) / 2;
        ctx.fillText(`w=${weight.value.toFixed(1)}`, midX, midY);
    });
    
    // Draw inputs
    visualizationState.data.inputs.forEach((input, index) => {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(input.x, input.y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${index+1}=${input.value.toFixed(1)}`, input.x, input.y);
    });
    
    // Draw neuron
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(visualizationState.data.neuron.x, visualizationState.data.neuron.y, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw neuron output
    const sigmoid = 1 / (1 + Math.exp(-(
        visualizationState.data.inputs[0].value * visualizationState.data.weights[0].value +
        visualizationState.data.inputs[1].value * visualizationState.data.weights[1].value +
        visualizationState.data.neuron.bias
    )));
    
    visualizationState.data.neuron.output = sigmoid;
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`σ=${sigmoid.toFixed(2)}`, visualizationState.data.neuron.x, visualizationState.data.neuron.y);
    
    // Draw bias
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`bias=${visualizationState.data.neuron.bias.toFixed(1)}`, 
                visualizationState.data.neuron.x, 
                visualizationState.data.neuron.y - 45);
    
    // Draw sigmoid activation function
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('σ(x) = 1 / (1 + e^-x)', 400, 100);
    
    // Draw activation curve
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
        const x = 400 + i * 1.5;
        const y = 150 - (1 / (1 + Math.exp(-(i/10 - 5)))) * 80;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

// Reinforcement learning visualization
function setupReinforcementVisualization() {
    visualizationState.type = 'reinforcement';
    visualizationState.data = {
        agent: { x: 2, y: 2, direction: 0 },
        grid: [
            ['W', 'W', 'W', 'W', 'W', 'W'],
            ['W', ' ', ' ', ' ', 'G', 'W'],
            ['W', ' ', 'W', ' ', ' ', 'W'],
            ['W', ' ', 'W', 'W', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', 'W'],
            ['W', 'W', 'W', 'W', 'W', 'W']
        ],
        cellSize: 60,
        qTable: {},
        learningRate: 0.1,
        discountFactor: 0.9,
        iteration: 0
    };
    
    // Initialize Q-table
    for (let y = 0; y < visualizationState.data.grid.length; y++) {
        for (let x = 0; x < visualizationState.data.grid[y].length; x++) {
            if (visualizationState.data.grid[y][x] !== 'W') {
                visualizationState.data.qTable[`${x},${y}`] = {
                    0: 0, // up
                    1: 0, // right
                    2: 0, // down
                    3: 0  // left
                };
            }
        }
    }
    
    drawRLEnvironment();
}

// Draw RL environment
function drawRLEnvironment() {
    clearCanvas();
    
    const { grid, cellSize, agent } = visualizationState.data;
    const offsetX = (canvas.width - grid[0].length * cellSize) / 2;
    const offsetY = 50;
    
    // Draw grid
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const cell = grid[y][x];
            const cellX = offsetX + x * cellSize;
            const cellY = offsetY + y * cellSize;
            
            // Draw cell background
            if (cell === 'W') {
                ctx.fillStyle = '#34495e';  // Wall
            } else if (cell === 'G') {
                ctx.fillStyle = '#2ecc71';  // Goal
            } else {
                ctx.fillStyle = '#ecf0f1';  // Empty
            }
            
            ctx.fillRect(cellX, cellY, cellSize, cellSize);
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 1;
            ctx.strokeRect(cellX, cellY, cellSize, cellSize);
            
            // Draw Q-values if available
            if (cell !== 'W') {
                const qValues = visualizationState.data.qTable[`${x},${y}`];
                if (qValues) {
                    drawQValues(cellX, cellY, cellSize, qValues);
                }
            }
        }
    }
    
    // Draw agent
    const agentX = offsetX + agent.x * cellSize + cellSize/2;
    const agentY = offsetY + agent.y * cellSize + cellSize/2;
    
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(agentX, agentY, cellSize/4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw agent direction
    const directionX = Math.cos(agent.direction * Math.PI/2);
    const directionY = Math.sin(agent.direction * Math.PI/2);
    
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(agentX, agentY);
    ctx.lineTo(agentX + directionX * cellSize/3, agentY + directionY * cellSize/3);
    ctx.stroke();
    
    // Draw iteration counter
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Iteration: ${visualizationState.data.iteration}`, 20, 30);
}

// Draw Q-values in a cell
function drawQValues(x, y, size, qValues) {
    // Arrow sizes
    const arrowSize = size / 5;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // Draw arrows for each direction
    drawArrow(centerX, centerY - arrowSize, 0, qValues[0]);  // Up
    drawArrow(centerX + arrowSize, centerY, 1, qValues[1]);  // Right
    drawArrow(centerX, centerY + arrowSize, 2, qValues[2]);  // Down
    drawArrow(centerX - arrowSize, centerY, 3, qValues[3]);  // Left
}

// Draw an arrow with color based on Q-value
function drawArrow(x, y, direction, qValue) {
    // Calculate color based on Q-value
    let color;
    if (qValue > 0) {
        // Green for positive Q-values
        const intensity = Math.min(Math.abs(qValue) * 0.5, 1);
        color = `rgba(46, 204, 113, ${intensity})`;
    } else {
        // Red for negative Q-values
        const intensity = Math.min(Math.abs(qValue) * 0.5, 1);
        color = `rgba(231, 76, 60, ${intensity})`;
    }
    
    ctx.fillStyle = color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Draw arrow based on direction
    ctx.beginPath();
    switch (direction) {
        case 0: // Up
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.lineTo(x + 5, y + 5);
            break;
        case 1: // Right
            ctx.moveTo(x + 5, y);
            ctx.lineTo(x - 5, y - 5);
            ctx.lineTo(x - 5, y + 5);
            break;
        case 2: // Down
            ctx.moveTo(x, y + 5);
            ctx.lineTo(x - 5, y - 5);
            ctx.lineTo(x + 5, y - 5);
            break;
        case 3: // Left
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 5, y - 5);
            ctx.lineTo(x + 5, y + 5);
            break;
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw Q-value text
    ctx.fillStyle = '#333';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(qValue.toFixed(1), x, y);
}

// Visualize results from code execution
function visualizeResults(code, lesson) {
    switch(lesson.id) {
        case 'intro':
            try {
                // Extract the function and call it
                const funcMatch = code.match(/function\s+greetAI\s*\(\s*\)\s*{([\s\S]*?)return([\s\S]*?)}/);
                if (funcMatch && funcMatch[2]) {
                    const message = eval(`(function() { ${code}; return greetAI(); })()`);
                    visualizationState.data.message = message;
                }
            } catch (e) {
                console.error("Visualization error:", e);
            }
            break;
            
        case 'decision-trees':
            try {
                // Create points to classify
                const points = [];
                for (let x = 0; x < 10; x++) {
                    for (let y = 0; y < 10; y++) {
                        points.push({ 
                            feature1: x, 
                            feature2: y, 
                            class: null 
                        });
                    }
                }
                
                // Use the user's classify function to classify all points
                const classifyFunc = eval(`(function() { ${code}; return classify; })()`);
                
                points.forEach(point => {
                    try {
                        point.class = classifyFunc(point.feature1, point.feature2);
                    } catch (e) {
                        point.class = 'error';
                    }
                });
                
                // Draw classification regions
                clearCanvas();
                const cellSize = canvas.width / 12;
                const offsetX = cellSize;
                const offsetY = cellSize;
                
                // Draw grid and classifications
                points.forEach(point => {
                    const x = offsetX + point.feature1 * cellSize;
                    const y = offsetY + point.feature2 * cellSize;
                    
                    let color;
                    switch(point.class) {
                        case 'A': color = '#3498db'; break;
                        case 'B': color = '#e74c3c'; break;
                        case 'C': color = '#2ecc71'; break;
                        default: color = '#95a5a6';
                    }
                    
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, cellSize, cellSize);
                });
                
                // Draw axes
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);
                ctx.lineTo(offsetX + 10 * cellSize, offsetY);
                ctx.moveTo(offsetX, offsetY);
                ctx.lineTo(offsetX, offsetY + 10 * cellSize);
                ctx.stroke();
                
                // Draw labels
                ctx.fillStyle = '#333';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('feature1', offsetX + 5 * cellSize, offsetY + 11 * cellSize);
                
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText('feature2', offsetX - 10, offsetY + 5 * cellSize);
                
                // Draw legend
                const legendX = offsetX + 11 * cellSize;
                const legendY = offsetY + 2 * cellSize;
                
                ctx.fillStyle = '#3498db';
                ctx.fillRect(legendX, legendY, cellSize/2, cellSize/2);
                ctx.fillStyle = '#333';
                ctx.textAlign = 'left';
                ctx.fillText('Class A', legendX + cellSize, legendY + cellSize/4);
                
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(legendX, legendY + cellSize, cellSize/2, cellSize/2);
                ctx.fillStyle = '#333';
                ctx.fillText('Class B', legendX + cellSize, legendY + cellSize + cellSize/4);
                
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(legendX, legendY + 2 * cellSize, cellSize/2, cellSize/2);
                ctx.fillStyle = '#333';
                ctx.fillText('Class C', legendX + cellSize, legendY + 2 * cellSize + cellSize/4);
            } catch (e) {
                console.error("Decision tree visualization error:", e);
            }
            break;
            
        case 'neural-networks':
            try {
                // Extract the neuron function
                const neuronFunc = eval(`(function() { ${code}; return neuron; })()`);
                
                // Test different input values
                const inputs = [];
                for (let x1 = 0; x1 <= 1; x1 += 0.2) {
                    for (let x2 = 0; x2 <= 1; x2 += 0.2) {
                        try {
                            const output = neuronFunc(x1, x2, 
                                visualizationState.data.weights[0].value, 
                                visualizationState.data.weights[1].value, 
                                visualizationState.data.neuron.bias);
                            inputs.push({ x1, x2, output });
                        } catch (e) {
                            inputs.push({ x1, x2, output: null });
                        }
                    }
                }
                
                // Draw heatmap of neuron outputs
                clearCanvas();
                const cellSize = 30;
                const offsetX = 100;
                const offsetY = 100;
                
                inputs.forEach(input => {
                    if (input.output === null) return;
                    
                    const x = offsetX + input.x1 * 5 * cellSize;
                    const y = offsetY + input.x2 * 5 * cellSize;
                    
                    // Color based on output (blue to red)
                    const intensity = Math.max(0, Math.min(255, Math.floor(input.output * 255)));
                    ctx.fillStyle = `rgb(${intensity}, ${100-intensity*0.4}, ${255-intensity})`;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    
                    // Draw output value
                    ctx.fillStyle = 'white';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(input.output.toFixed(2), x + cellSize/2, y + cellSize/2);
                });
                
                // Draw axes
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);
                ctx.lineTo(offsetX + 5 * cellSize, offsetY);
                ctx.moveTo(offsetX, offsetY);
                ctx.lineTo(offsetX, offsetY + 5 * cellSize);
                ctx.stroke();
                
                // Draw labels
                ctx.fillStyle = '#333';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('x1', offsetX + 2.5 * cellSize, offsetY - 20);
                
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText('x2', offsetX - 20, offsetY + 2.5 * cellSize);
                
                // Draw neuron again for reference
                drawNeuralNetwork();
            } catch (e) {
                console.error("Neural network visualization error:", e);
            }
            break;
            
        case 'reinforcement':
            try {
                // Extract the Q-learning update function
                const updateQFunc = eval(`(function() { ${code}; return updateQ; })()`);
                
                // Run a simulation with the function
                runQLearningSimulation(updateQFunc);
            } catch (e) {
                console.error("Reinforcement learning visualization error:", e);
            }
            break;
    }
}

// Run a QL-learning simulation
function runQLearningSimulation(updateQFunc) {
    const data = visualizationState.data;
    
    // Reset agent position if needed
    if (data.iteration % 10 === 0) {
        // Find random empty cell
        let emptyPositions = [];
        for (let y = 0; y < data.grid.length; y++) {
            for (let x = 0; x < data.grid[y].length; x++) {
                if (data.grid[y][x] === ' ') {
                    emptyPositions.push({ x, y });
                }
            }
        }
        
        const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        data.agent.x = randomPos.x;
        data.agent.y = randomPos.y;
    }
    
    // Get current state
    const state = `${data.agent.x},${data.agent.y}`;
    
    // Choose action (epsilon-greedy)
    let action;
    if (Math.random() < 0.2) {  // Exploration
        action = Math.floor(Math.random() * 4);
    } else {  // Exploitation
        const qValues = data.qTable[state];
        action = Object.keys(qValues).reduce((a, b) => qValues[a] > qValues[b] ? a : b);
    }
    
    // Get next state based on action
    const nextPos = { ...data.agent };
    switch(Number(action)) {
        case 0: nextPos.y--; break;  // Up
        case 1: nextPos.x++; break;  // Right
        case 2: nextPos.y++; break;  // Down
        case 3: nextPos.x--; break;  // Left
    }
    
    // Check if next position is valid
    let reward = -0.1;  // Default small penalty for each step
    let nextState = state;
    
    if (nextPos.y >= 0 && nextPos.y < data.grid.length &&
        nextPos.x >= 0 && nextPos.x < data.grid[nextPos.y].length) {
        
        const nextCell = data.grid[nextPos.y][nextPos.x];
        
        if (nextCell !== 'W') {  // Not a wall
            data.agent.x = nextPos.x;
            data.agent.y = nextPos.y;
            nextState = `${nextPos.x},${nextPos.y}`;
            
            if (nextCell === 'G') {  // Goal
                reward = 1;
            }
        } else {
            reward = -0.5;  // Penalty for hitting a wall
        }
    } else {
        reward = -0.5;  // Penalty for going off grid
    }
    
    // Find max future Q-value
    const nextQValues = data.qTable[nextState];
    const maxFutureQ = Math.max(...Object.values(nextQValues));
    
    // Update Q-value using user's function
    try {
        const currentQ = data.qTable[state][action];
        const newQ = updateQFunc(
            currentQ,
            reward,
            maxFutureQ,
            data.learningRate,
            data.discountFactor
        );
        
        // Update Q-table
        data.qTable[state][action] = newQ;
    } catch (e) {
        console.error("Error in Q-learning update:", e);
    }
    
    // Update direction
    data.agent.direction = Number(action);
    
    // Increment iteration
    data.iteration++;
    
    // Redraw environment
    drawRLEnvironment();
    
    // Continue simulation if agent hasn't reached the goal
    if (data.grid[data.agent.y][data.agent.x] !== 'G') {
        setTimeout(() => {
            runQLearningSimulation(updateQFunc);
        }, 200);
    }
}

/**
 * Update the visualization with results from code execution
 * @param {Object} result - Results from code execution
 */
function updateVisualizationWithResult(result) {
    if (!result) return;
    
    try {
        const currentLesson = getCurrentLesson();
        if (!currentLesson) return;
        
        // Pass results to appropriate visualization handler
        if (currentLesson.visualizationType) {
            switch (currentLesson.visualizationType) {
                case 'graph':
                    updateGraphVisualization(result, currentLesson);
                    break;
                case 'chart':
                    updateChartVisualization(result, currentLesson);
                    break;
                case 'network':
                    updateNetworkVisualization(result, currentLesson);
                    break;
                default:
                    // Default update
                    clearCanvas();
                    ctx.font = '20px Roboto';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.fillText('Result: ' + JSON.stringify(result), 400, 250);
            }
        }
    } catch (error) {
        console.error("Error updating visualization:", error);
    }
}

// Update specific visualizations based on type
function updateGraphVisualization(result, lesson) {
    // Implementation for updating graph visualization
    console.log("Updating graph visualization with:", result);
}

function updateChartVisualization(result, lesson) {
    // Implementation for updating chart visualization
    console.log("Updating chart visualization with:", result);
}

function updateNetworkVisualization(result, lesson) {
    // Implementation for updating network visualization
    console.log("Updating network visualization with:", result);
}

// Helper visualization setup functions
function setupDefaultVisualization(ctx) {
    // Default visualization setup code
    ctx.font = '20px Roboto';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('Visualization will appear here when you run your code', 400, 250);
}

function setupGraphVisualization(lessonData, ctx) {
    // Graph visualization setup code
    // This would be implemented based on the specific needs
}

function setupChartVisualization(lessonData, ctx) {
    // Chart visualization setup code
    // This would be implemented based on the specific needs
}

function setupNetworkVisualization(lessonData, ctx) {
    // Network visualization setup code
    // This would be implemented based on the specific needs
}
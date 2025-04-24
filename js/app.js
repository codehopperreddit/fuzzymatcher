 // Main application JavaScript code
 document.addEventListener('DOMContentLoaded', function() {
    // Custom string similarity function (replacing the missing stringSimilarity library)
    const stringSimilarityCompare = (string1, string2) => {
        if (string1 === string2) return 1.0;
        if (string1.length === 0 || string2.length === 0) return 0.0;
        
        // Levenshtein distance implementation
        const len1 = string1.length;
        const len2 = string2.length;
        
        let matrix = [];
        
        // Initialize matrix
        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 1; j <= len2; j++) {
            matrix[0][j] = j;
        }
        
        // Fill matrix
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = string1[i - 1] === string2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }
        
        // Convert distance to similarity score (0-1)
        const maxLen = Math.max(len1, len2);
        return 1 - (matrix[len1][len2] / maxLen);
    };

    // Application state
    const state = {
        itemsData: null,
        sourceData: null,
        resultsData: null,
        weights: {},
        preprocessing: {
            enabled: true,
            options: {
                toLowercase: true,
                removeSpecialChars: true,
                standardizePhones: true,
                standardizePostalCodes: true,
                trimWhitespace: true,
                removePunctuation: true
            }
        },
        matchChart: null,
        stopRequested: false
    };
    
    // Element references
    const elements = {
        // Control elements
        numMatches: document.getElementById('numMatches'),
        minMatchQuality: document.getElementById('minMatchQuality'),
        matchQualityRange: document.getElementById('matchQualityRange'),
        goodMatchThreshold: document.getElementById('goodMatchThreshold'),
        moderateMatchThreshold: document.getElementById('moderateMatchThreshold'),
        preprocessDataSwitch: document.getElementById('preprocessDataSwitch'),
        preprocessOptions: document.querySelectorAll('.preprocess-option'),
        runMatchingBtn: document.getElementById('runMatchingBtn'),
        resetAllBtn: document.getElementById('resetAllBtn'),
        
        // Items tab elements
        itemsFile: document.getElementById('itemsFile'),
        clearItemsBtn: document.getElementById('clearItemsBtn'),
        itemsWeightsContainer: document.getElementById('itemsWeightsContainer'),
        weightsInputs: document.getElementById('weightsInputs'),
        itemsDataContainer: document.getElementById('itemsDataContainer'),
        itemsTableHeader: document.getElementById('itemsTableHeader'),
        itemsTableBody: document.getElementById('itemsTableBody'),
        itemsTableInfo: document.getElementById('itemsTableInfo'),
        itemsPlaceholder: document.getElementById('itemsPlaceholder'),
        
        // Source tab elements
        sourceFile: document.getElementById('sourceFile'),
        clearSourceBtn: document.getElementById('clearSourceBtn'),
        sourceInstructions: document.getElementById('sourceInstructions'),
        sourceDataContainer: document.getElementById('sourceDataContainer'),
        sourceTableHeader: document.getElementById('sourceTableHeader'),
        sourceTableBody: document.getElementById('sourceTableBody'),
        sourceTableInfo: document.getElementById('sourceTableInfo'),
        sourcePlaceholder: document.getElementById('sourcePlaceholder'),
        
        // Results tab elements
        exportResultsBtn: document.getElementById('exportResultsBtn'),
        clearResultsBtn: document.getElementById('clearResultsBtn'),
        filterAll: document.getElementById('filterAll'),
        filterGood: document.getElementById('filterGood'),
        filterModerate: document.getElementById('filterModerate'),
        filterPoor: document.getElementById('filterPoor'),
        filterNoMatch: document.getElementById('filterNoMatch'),
        searchResults: document.getElementById('searchResults'),
        resultsDataContainer: document.getElementById('resultsDataContainer'),
        resultsTableHeader: document.getElementById('resultsTableHeader'),
        resultsTableBody: document.getElementById('resultsTableBody'),
        noFilterResults: document.getElementById('noFilterResults'),
        resultsPlaceholder: document.getElementById('resultsPlaceholder'),
        
        // Analysis tab elements
        statTotalRecords: document.getElementById('statTotalRecords'),
        statTotalMatches: document.getElementById('statTotalMatches'),
        statGoodMatches: document.getElementById('statGoodMatches'),
        statModerateMatches: document.getElementById('statModerateMatches'),
        statPoorMatches: document.getElementById('statPoorMatches'),
        statAvgScore: document.getElementById('statAvgScore'),
        statProcessTime: document.getElementById('statProcessTime'),
        chartMatchQuality: document.getElementById('chartMatchQuality'),
        noChartData: document.getElementById('noChartData'),
        thresholdGood: document.getElementById('thresholdGood'),
        thresholdModerate: document.getElementById('thresholdModerate'),
        thresholdMinimum: document.getElementById('thresholdMinimum'),
        thresholdMinimumNoMatch: document.getElementById('thresholdMinimumNoMatch'),
        
        // Status elements
        statusText: document.getElementById('statusText'),
        detailStatus: document.getElementById('detailStatus'),
        progressBar: document.getElementById('progressBar'),
        
        // Tab elements
        controlTab: document.getElementById('control-tab'),
        itemsTab: document.getElementById('items-tab'),
        sourceTab: document.getElementById('source-tab'),
        resultsTab: document.getElementById('results-tab'),
        analysisTab: document.getElementById('analysis-tab')
    };
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Setup chart
    setupChart();
    
    // Update threshold display values
    updateThresholdDisplays();
    
    // Set up file reader for Items
    elements.itemsFile.addEventListener('change', function(event) {
        if (event.target.files.length === 0) return;
        
        const file = event.target.files[0];
        handleFileLoad('items', file);
    });
    
    // Set up file reader for Source
    elements.sourceFile.addEventListener('change', function(event) {
        if (event.target.files.length === 0) return;
        
        const file = event.target.files[0];
        handleFileLoad('source', file);
    });
    
    // Initialize event listeners
    function initializeEventListeners() {
        // Control settings events
        elements.preprocessDataSwitch.addEventListener('change', function() {
            state.preprocessing.enabled = this.checked;
            elements.preprocessOptions.forEach(option => {
                option.disabled = !this.checked;
            });
        });
        
        elements.preprocessOptions.forEach(option => {
            option.addEventListener('change', function() {
                state.preprocessing.options[this.id] = this.checked;
            });
        });
        
        // Button events
        elements.runMatchingBtn.addEventListener('click', runMatching);
        elements.resetAllBtn.addEventListener('click', resetAll);
        elements.clearItemsBtn.addEventListener('click', () => clearData('items'));
        elements.clearSourceBtn.addEventListener('click', () => clearData('source'));
        elements.clearResultsBtn.addEventListener('click', () => clearData('results'));
        elements.exportResultsBtn.addEventListener('click', exportResults);
        
        // Filter events
        elements.filterAll.addEventListener('change', applyResultsFilter);
        elements.filterGood.addEventListener('change', applyResultsFilter);
        elements.filterModerate.addEventListener('change', applyResultsFilter);
        elements.filterPoor.addEventListener('change', applyResultsFilter);
        elements.filterNoMatch.addEventListener('change', applyResultsFilter);
        elements.searchResults.addEventListener('input', applyResultsFilter);
        
        // Threshold change events
        elements.minMatchQuality.addEventListener('change', updateThresholdDisplays);
        elements.goodMatchThreshold.addEventListener('change', updateThresholdDisplays);
        elements.moderateMatchThreshold.addEventListener('change', updateThresholdDisplays);
    }
    
    // Update threshold displays
    function updateThresholdDisplays() {
        elements.thresholdGood.textContent = elements.goodMatchThreshold.value;
        elements.thresholdModerate.textContent = elements.moderateMatchThreshold.value;
        elements.thresholdMinimum.textContent = elements.minMatchQuality.value;
        elements.thresholdMinimumNoMatch.textContent = elements.minMatchQuality.value;
    }
    
    // Setup chart
    function setupChart() {
        const ctx = elements.chartMatchQuality.getContext('2d');
        state.matchChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Number of Matches',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Matches'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Match Score Range (%)'
                        }
                    }
                }
            }
        });
    }
    
    // Handle file loading
    function handleFileLoad(target, file) {
        if (!file) return;
        
        updateStatus(`Loading ${file.name}...`, 20);
        
        const fileReader = new FileReader();
        
        fileReader.onload = function(event) {
            const fileData = event.target.result;
            
            try {
                // Determine file type by extension
                if (file.name.toLowerCase().endsWith('.csv')) {
                    // Parse CSV
                    Papa.parse(fileData, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        complete: function(results) {
                            const data = {
                                columns: results.meta.fields,
                                data: results.data
                            };
                            
                            if (state.preprocessing.enabled) {
                                data.data = preprocessDataArray(data.data);
                            }
                            
                            processLoadedData(target, data, file.name);
                        },
                        error: function(error) {
                            console.error('Error parsing CSV:', error);
                            updateStatus(`Error loading ${file.name}`);
                        }
                    });
                } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
                    // Parse Excel
                    const workbook = XLSX.read(fileData, { type: 'binary' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    if (jsonData.length > 0) {
                        const columns = Object.keys(jsonData[0]);
                        const data = {
                            columns: columns,
                            data: jsonData
                        };
                        
                        if (state.preprocessing.enabled) {
                            data.data = preprocessDataArray(data.data);
                        }
                        
                        processLoadedData(target, data, file.name);
                    } else {
                        updateStatus(`No data found in ${file.name}`);
                    }
                } else {
                    updateStatus('Unsupported file format. Please use CSV or Excel files.');
                }
            } catch (err) {
                console.error('Error processing file:', err);
                updateStatus(`Error processing ${file.name}: ${err.message}`);
            }
        };
        
        fileReader.onerror = function() {
            updateStatus(`Error reading ${file.name}`);
        };
        
        if (file.name.toLowerCase().endsWith('.csv')) {
            fileReader.readAsText(file);
        } else {
            fileReader.readAsBinaryString(file);
        }
    }
    
    // Process loaded data
    function processLoadedData(target, data, fileName) {
        if (target === 'items') {
            state.itemsData = data;
            updateItemsUI();
        } else {
            state.sourceData = data;
            updateSourceUI();
        }
        
        updateRunButtonState();
        updateStatus(`Loaded ${fileName} successfully with ${data.data.length} records`, 100);
    }
    
    // Update items UI
    function updateItemsUI() {
        if (!state.itemsData) {
            elements.itemsWeightsContainer.style.display = 'none';
            elements.itemsDataContainer.style.display = 'none';
            elements.itemsPlaceholder.style.display = 'block';
            elements.clearItemsBtn.disabled = true;
            return;
        }
        
        elements.itemsPlaceholder.style.display = 'none';
        elements.itemsWeightsContainer.style.display = 'block';
        elements.itemsDataContainer.style.display = 'block';
        elements.clearItemsBtn.disabled = false;
        
        // Generate weight inputs
        elements.weightsInputs.innerHTML = '';
        state.itemsData.columns.forEach(col => {
            // Create weight input for each column
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-3 mb-2';
            
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.textContent = col;
            label.className = 'form-label';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.value = state.weights[col] || '1';
            input.dataset.column = col;
            input.addEventListener('change', function() {
                state.weights[col] = this.value;
            });
            
            formGroup.appendChild(label);
            formGroup.appendChild(input);
            colDiv.appendChild(formGroup);
            elements.weightsInputs.appendChild(colDiv);
            
            // Initialize weights
            if (!state.weights[col]) {
                state.weights[col] = '1';
            }
        });
        
        // Update table headers
        elements.itemsTableHeader.innerHTML = '';
        state.itemsData.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            elements.itemsTableHeader.appendChild(th);
        });
        
        // Update table body with data rows (limit to 1000 for performance)
        elements.itemsTableBody.innerHTML = '';
        const displayData = state.itemsData.data.slice(0, 1000);
        
        displayData.forEach(row => {
            const tr = document.createElement('tr');
            
            state.itemsData.columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] !== null && row[col] !== undefined ? row[col] : '';
                tr.appendChild(td);
            });
            
            elements.itemsTableBody.appendChild(tr);
        });
        
        // Show info message if data was truncated
        if (state.itemsData.data.length > 1000) {
            elements.itemsTableInfo.classList.remove('d-none');
        } else {
            elements.itemsTableInfo.classList.add('d-none');
        }
    }
    
    // Update source UI
    function updateSourceUI() {
        if (!state.sourceData) {
            elements.sourceInstructions.style.display = 'none';
            elements.sourceDataContainer.style.display = 'none';
            elements.sourcePlaceholder.style.display = 'block';
            elements.clearSourceBtn.disabled = true;
            return;
        }
        
        elements.sourcePlaceholder.style.display = 'none';
        elements.sourceInstructions.style.display = 'block';
        elements.sourceDataContainer.style.display = 'block';
        elements.clearSourceBtn.disabled = false;
        
        // Update table headers
        elements.sourceTableHeader.innerHTML = '';
        state.sourceData.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            elements.sourceTableHeader.appendChild(th);
        });
        
        // Update table body with data rows (limit to 1000 for performance)
        elements.sourceTableBody.innerHTML = '';
        const displayData = state.sourceData.data.slice(0, 1000);
        
        displayData.forEach(row => {
            const tr = document.createElement('tr');
            
            state.sourceData.columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] !== null && row[col] !== undefined ? row[col] : '';
                tr.appendChild(td);
            });
            
            elements.sourceTableBody.appendChild(tr);
        });
        
        // Show info message if data was truncated
        if (state.sourceData.data.length > 1000) {
            elements.sourceTableInfo.classList.remove('d-none');
        } else {
            elements.sourceTableInfo.classList.add('d-none');
        }
    }
    
    // Update results UI
    function updateResultsUI() {
        if (!state.resultsData || state.resultsData.data.length === 0) {
            elements.resultsDataContainer.style.display = 'none';
            elements.noFilterResults.style.display = 'none';
            elements.resultsPlaceholder.style.display = 'block';
            elements.exportResultsBtn.disabled = true;
            elements.clearResultsBtn.disabled = true;
            return;
        }
        
        elements.resultsPlaceholder.style.display = 'none';
        elements.resultsDataContainer.style.display = 'block';
        elements.exportResultsBtn.disabled = false;
        elements.clearResultsBtn.disabled = false;
        
        // Update table headers
        elements.resultsTableHeader.innerHTML = '';
        state.resultsData.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            elements.resultsTableHeader.appendChild(th);
        });
        
        // Add actions column
        const thActions = document.createElement('th');
        thActions.textContent = 'Actions';
        elements.resultsTableHeader.appendChild(thActions);
        
        // Apply filter and update table
        applyResultsFilter();
    }
    
    // Apply filter to results
    function applyResultsFilter() {
        if (!state.resultsData || state.resultsData.data.length === 0) return;
        
        // Get filter values
        let filterType = 'All';
        if (elements.filterGood.checked) filterType = 'Good';
        else if (elements.filterModerate.checked) filterType = 'Moderate';
        else if (elements.filterPoor.checked) filterType = 'Poor';
        else if (elements.filterNoMatch.checked) filterType = 'Not a Match';
        
        const searchValue = elements.searchResults.value.toLowerCase();
        
        // Filter data
        let filteredData = [...state.resultsData.data];
        
        if (filterType !== 'All') {
            filteredData = filteredData.filter(row => row['Match Type'] === filterType);
        }
        
        if (searchValue) {
            filteredData = filteredData.filter(row => {
                return Object.values(row).some(value => 
                    value !== null && 
                    value !== undefined && 
                    value.toString().toLowerCase().includes(searchValue)
                );
            });
        }
        
        // Update table body with filtered data
        elements.resultsTableBody.innerHTML = '';
        
        if (filteredData.length === 0) {
            elements.resultsDataContainer.style.display = 'none';
            elements.noFilterResults.style.display = 'block';
            return;
        }
        
        elements.resultsDataContainer.style.display = 'block';
        elements.noFilterResults.style.display = 'none';
        
        filteredData.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            // Set row class based on match type
            if (row['Match Type'] === 'Good') {
                tr.classList.add('match-good');
            } else if (row['Match Type'] === 'Moderate') {
                tr.classList.add('match-moderate');
            } else if (row['Match Type'] === 'Poor') {
                tr.classList.add('match-poor');
            } else {
                tr.classList.add('match-none');
            }
            
            // Add data cells
            state.resultsData.columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] !== null && row[col] !== undefined ? row[col] : '';
                tr.appendChild(td);
            });
            
            // Add actions cell
            const tdActions = document.createElement('td');
            const markBtn = document.createElement('button');
            markBtn.className = 'btn btn-outline-secondary btn-sm';
            markBtn.textContent = row.Mark === '✓' ? 'Unmark' : 'Mark';
            markBtn.dataset.index = index;
            markBtn.addEventListener('click', function() {
                toggleMark(parseInt(this.dataset.index));
            });
            
            tdActions.appendChild(markBtn);
            tr.appendChild(tdActions);
            
            elements.resultsTableBody.appendChild(tr);
        });
    }
    
    // Toggle mark on a result row
    function toggleMark(index) {
        if (!state.resultsData || !state.resultsData.data[index]) return;
        
        state.resultsData.data[index].Mark = state.resultsData.data[index].Mark === '✓' ? '' : '✓';
        
        // Update UI
        applyResultsFilter();
    }
    
    // Update analysis UI
    function updateAnalysisUI() {
        if (!state.resultsData || state.resultsData.data.length === 0) {
            elements.noChartData.style.display = 'block';
            elements.chartMatchQuality.style.display = 'none';
            return;
        }
        
        elements.noChartData.style.display = 'none';
        elements.chartMatchQuality.style.display = 'block';
        
        // Update chart with match score distribution
        updateChart();
    }
    
    // Update chart with match score distribution
    function updateChart() {
        if (!state.resultsData || !state.resultsData.data.length === 0) return;
        
        // Get match scores
        const scores = state.resultsData.data.map(row => parseFloat(row['Match Score']));
        
        // Create histogram bins
        const bins = {};
        for (let i = Math.floor(parseInt(elements.minMatchQuality.value) / 5) * 5; i <= 100; i += 5) {
            bins[i] = 0;
        }
        
        // Count scores in each bin
        scores.forEach(score => {
            const bin = Math.floor(score / 5) * 5;
            if (bin in bins) {
                bins[bin]++;
            }
        });
        
        // Convert to chart data format
        const labels = Object.keys(bins).map(bin => `${bin}-${parseInt(bin) + 5}%`);
        const data = Object.values(bins);
        
        // Update chart
        state.matchChart.data.labels = labels;
        state.matchChart.data.datasets[0].data = data;
        state.matchChart.update();
    }
    
    // Update run button state
    function updateRunButtonState() {
        elements.runMatchingBtn.disabled = !state.itemsData || !state.sourceData;
    }
    
    // Update status display
    function updateStatus(message, progress = null) {
        elements.statusText.textContent = message;
        
        if (progress !== null) {
            elements.progressBar.style.width = `${progress}%`;
            elements.progressBar.textContent = `${Math.round(progress)}%`;
            elements.progressBar.setAttribute('aria-valuenow', progress);
        }
    }
    
    // Preprocess data based on settings
    function preprocessDataArray(dataArray) {
        if (!state.preprocessing.enabled) return dataArray;
        
        return dataArray.map(record => {
            const newRecord = { ...record };
            
            Object.keys(newRecord).forEach(key => {
                if (typeof newRecord[key] === 'string') {
                    let value = newRecord[key];
                    
                    // Apply preprocessing based on options
                    if (state.preprocessing.options.toLowercase) {
                        value = value.toLowerCase();
                    }
                    
                    if (state.preprocessing.options.removeSpecialChars) {
                        value = value.replace(/[^\w\s]/g, '');
                    }
                    
                    if (state.preprocessing.options.standardizePhones && 
                       (key.toLowerCase().includes('phone') || key.toLowerCase().includes('tel'))) {
                        value = value.replace(/\D/g, '');
                    }
                    
                    if (state.preprocessing.options.standardizePostalCodes && 
                       (key.toLowerCase().includes('zip') || key.toLowerCase().includes('postal') || key.toLowerCase().includes('code'))) {
                        value = value.replace(/[^a-zA-Z0-9]/g, '');
                    }
                    
                    if (state.preprocessing.options.trimWhitespace) {
                        value = value.trim();
                    }
                    
                    if (state.preprocessing.options.removePunctuation) {
                        value = value.replace(/[^\w\s]/g, '');
                    }
                    
                    newRecord[key] = value;
                }
            });
            
            return newRecord;
        });
    }
    
    // Calculate match score between two records
    function calculateMatchScore(itemRow, sourceRow, fieldWeights) {
        let totalWeight = 0;
        let weightedScore = 0;
        const mustMatchFields = [];
        
        // Identify must-match fields and calculate total weight
        Object.keys(fieldWeights).forEach(col => {
            const weight = fieldWeights[col];
            if (weight === 'M') {
                mustMatchFields.push(col);
            } else if (parseFloat(weight) > 0) {
                totalWeight += parseFloat(weight);
            }
        });
        
        // Check must-match fields first
        for (const col of mustMatchFields) {
            if (!(col in itemRow) || !(col in sourceRow)) continue;
            
            const itemVal = (itemRow[col] != null) ? String(itemRow[col]) : '';
            const sourceVal = (sourceRow[col] != null) ? String(sourceRow[col]) : '';
            
            if (!itemVal || !sourceVal) continue;
            
            // Use token sort ratio for better handling of word order differences
            const similarity = stringSimilarityCompare(itemVal.toLowerCase(), sourceVal.toLowerCase()) * 100;
            if (similarity < 90) { // Less than 90% match on a must-match field
                return 0;
            }
        }
        
        // If there's no total weight, return 0
        if (totalWeight === 0) return 0;
        
        // Calculate weighted score
        Object.keys(fieldWeights).forEach(col => {
            const weight = fieldWeights[col];
            if (weight === 'M' || parseFloat(weight) <= 0 || !(col in itemRow) || !(col in sourceRow)) return;
            
            const itemVal = (itemRow[col] != null) ? String(itemRow[col]) : '';
            const sourceVal = (sourceRow[col] != null) ? String(sourceRow[col]) : '';
            
            if (!itemVal || !sourceVal) return;
            
            let similarity;
            
            // Choose appropriate fuzzy matching algorithm based on field content
            if (itemVal.length > 100 || sourceVal.length > 100) {
                // For long text, use token sort ratio equivalent
                const words1 = itemVal.toLowerCase().split(/\s+/).sort().join(' ');
                const words2 = sourceVal.toLowerCase().split(/\s+/).sort().join(' ');
                similarity = stringSimilarityCompare(words1, words2) * 100;
            } else if (['addr', 'address', 'street'].some(word => col.toLowerCase().includes(word))) {
                // For addresses, use token set ratio to handle missing parts
                const words1 = new Set(itemVal.toLowerCase().split(/\s+/));
                const words2 = new Set(sourceVal.toLowerCase().split(/\s+/));
                const union = new Set([...words1, ...words2]);
                const intersection = new Set([...words1].filter(x => words2.has(x)));
                similarity = (intersection.size / union.size) * 100;
            } else if (['name', 'company', 'business'].some(word => col.toLowerCase().includes(word))) {
                // For names, use partial ratio to handle abbreviations
                const partial = stringSimilarityCompare(itemVal.toLowerCase(), sourceVal.toLowerCase()) * 100;
                const words1 = itemVal.toLowerCase().split(/\s+/).sort().join(' ');
                const words2 = sourceVal.toLowerCase().split(/\s+/).sort().join(' ');
                const token = stringSimilarityCompare(words1, words2) * 100;
                similarity = (partial + token) / 2; // Average of the two
            } else {
                // Default to ratio for exact matching
                similarity = stringSimilarityCompare(itemVal.toLowerCase(), sourceVal.toLowerCase()) * 100;
            }
            
            weightedScore += similarity * parseFloat(weight);
        });
        
        // Return normalized score
        return weightedScore / totalWeight;
    }
    
    // Determine match type based on score
    function determineMatchType(score) {
        const goodThreshold = parseInt(elements.goodMatchThreshold.value);
        const moderateThreshold = parseInt(elements.moderateMatchThreshold.value);
        const minThreshold = parseInt(elements.minMatchQuality.value);
        
        if (score >= goodThreshold) {
            return "Good";
        } else if (score >= moderateThreshold) {
            return "Moderate";
        } else if (score >= minThreshold) {
            return "Poor";
        } else {
            return "Not a Match";
        }
    }
    
    // Run the matching process
    async function runMatching() {
        if (!state.itemsData || !state.sourceData) {
            alert("Please load both Items and Source data first");
            return;
        }
        
        // Switch to results tab
        elements.resultsTab.click();
        
        // Get parameters
        const numMatches = parseInt(elements.numMatches.value);
        const minQuality = parseInt(elements.minMatchQuality.value);
        const qualityRange = parseInt(elements.matchQualityRange.value);
        
        // Reset status
        updateStatus("Matching in progress...", 0);
        elements.detailStatus.textContent = "";
        state.stopRequested = false;
        
        // Get field weights
        const fieldWeights = { ...state.weights };
        
        // Start timer
        const startTime = performance.now();
        
        // Initialize results array and statistics
        const results = [];
        const matchScores = [];
        let goodMatches = 0;
        let moderateMatches = 0;
        let poorMatches = 0;
        
        const itemCount = state.itemsData.data.length;
        
        // Get ID column (first column by default)
        const idCol = state.itemsData.columns[0];
        
        // Process each item
        for (let idx = 0; idx < state.itemsData.data.length; idx++) {
            if (state.stopRequested) {
                updateStatus("Matching stopped by user");
                return;
            }
            
            // Update progress
            const progressPct = (idx / itemCount) * 100;
            updateStatus(`Processing item ${idx+1} of ${itemCount}...`, progressPct);
            elements.detailStatus.textContent = `Item ID: ${state.itemsData.data[idx][idCol]}`;
            
            const itemRow = state.itemsData.data[idx];
            const itemMatches = [];
            
            // Calculate scores for all source records
            for (let srcIdx = 0; srcIdx < state.sourceData.data.length; srcIdx++) {
                if (state.stopRequested) {
                    updateStatus("Matching stopped by user");
                    return;
                }
                
                const sourceRow = state.sourceData.data[srcIdx];
                
                const score = calculateMatchScore(itemRow, sourceRow, fieldWeights);
                
                if (score >= minQuality) {
                    const matchType = determineMatchType(score);
                    itemMatches.push({
                        sourceIdx: srcIdx,
                        score,
                        matchType
                    });
                }
            }
            
            // Sort matches by score (descending)
            itemMatches.sort((a, b) => b.score - a.score);
            
            // Apply quality range filter
            let filteredMatches = itemMatches;
            if (itemMatches.length > 0) {
                const bestScore = itemMatches[0].score;
                filteredMatches = itemMatches.filter(m => (bestScore - m.score) <= qualityRange);
            }
            
            // Keep only top N matches
            filteredMatches = filteredMatches.slice(0, numMatches);
            
            // Add to results
            for (const match of filteredMatches) {
                const sourceRow = state.sourceData.data[match.sourceIdx];
                
                const result = {
                    'Category': match.matchType !== "Not a Match" ? "Match" : "No Match",
                    'ITM ID': itemRow[idCol],
                    'Source ID': sourceRow[idCol],
                    'Match Score': Math.round(match.score * 100) / 100,
                    'Match Type': match.matchType,
                    'Mark': "",
                };
                
                // Update stats
                matchScores.push(match.score);
                if (match.matchType === "Good") {
                    goodMatches++;
                } else if (match.matchType === "Moderate") {
                    moderateMatches++;
                } else if (match.matchType === "Poor") {
                    poorMatches++;
                }
                
                // Add item and source fields
                state.itemsData.columns.forEach(col => {
                    if (col in itemRow) {
                        result[`ITM ${col}`] = itemRow[col];
                    }
                });
                
                state.sourceData.columns.forEach(col => {
                    if (col in sourceRow) {
                        result[`SRC ${col}`] = sourceRow[col];
                    }
                });
                
                results.push(result);
            }
            
            // Give the UI a chance to update by yielding control back to the event loop
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        const endTime = performance.now();
        const processTime = (endTime - startTime) / 1000;
        
        // Prepare results data
        if (results.length > 0) {
            const columns = Object.keys(results[0]);
            state.resultsData = {
                columns,
                data: results
            };
        } else {
            state.resultsData = {
                columns: ["Category", "ITM ID", "Source ID", "Match Score", "Match Type", "Mark"],
                data: []
            };
        }
        
        // Calculate stats
        const avgScore = matchScores.length > 0 ? matchScores.reduce((a, b) => a + b, 0) / matchScores.length : 0;
        
        // Update statistics
        elements.statTotalRecords.textContent = itemCount;
        elements.statTotalMatches.textContent = results.length;
        elements.statGoodMatches.textContent = goodMatches;
        elements.statModerateMatches.textContent = moderateMatches;
        elements.statPoorMatches.textContent = poorMatches;
        elements.statAvgScore.textContent = avgScore.toFixed(2) + '%';
        elements.statProcessTime.textContent = processTime.toFixed(2) + ' sec';
        
        // Update UI
        updateResultsUI();
        updateAnalysisUI();
        
        // Update status
        updateStatus("Matching complete", 100);
        elements.detailStatus.textContent = `Processed ${itemCount} records, found ${results.length} matches`;
        
        // Switch to analysis tab
        elements.analysisTab.click();
    }
    
    // Clear data
    function clearData(target) {
        if (target === 'items') {
            state.itemsData = null;
            elements.itemsFile.value = '';
            updateItemsUI();
        } else if (target === 'source') {
            state.sourceData = null;
            elements.sourceFile.value = '';
            updateSourceUI();
        } else if (target === 'results') {
            state.resultsData = null;
            
            // Clear statistics
            elements.statTotalRecords.textContent = '0';
            elements.statTotalMatches.textContent = '0';
            elements.statGoodMatches.textContent = '0';
            elements.statModerateMatches.textContent = '0';
            elements.statPoorMatches.textContent = '0';
            elements.statAvgScore.textContent = '0.00%';
            elements.statProcessTime.textContent = '0.00 sec';
            
            // Clear chart
            state.matchChart.data.labels = [];
            state.matchChart.data.datasets[0].data = [];
            state.matchChart.update();
            
            updateResultsUI();
            updateAnalysisUI();
        }
        
        updateRunButtonState();
        updateStatus(`Cleared ${target} data`);
    }
    
    // Reset all data and settings
    function resetAll() {
        if (!confirm("Are you sure you want to reset all data and settings?")) {
            return;
        }
        
        // Clear all data
        clearData('items');
        clearData('source');
        clearData('results');
        
        // Reset settings to defaults
        elements.numMatches.value = '5';
        elements.minMatchQuality.value = '40';
        elements.matchQualityRange.value = '10';
        elements.goodMatchThreshold.value = '80';
        elements.moderateMatchThreshold.value = '60';
        elements.preprocessDataSwitch.checked = true;
        
        // Reset preprocessing options
        elements.preprocessOptions.forEach(option => {
            option.checked = true;
            option.disabled = false;
        });
        
        state.preprocessing = {
            enabled: true,
            options: {
                toLowercase: true,
                removeSpecialChars: true,
                standardizePhones: true,
                standardizePostalCodes: true,
                trimWhitespace: true,
                removePunctuation: true
            }
        };
        
        // Reset weights
        state.weights = {};
        
        // Update threshold displays
        updateThresholdDisplays();
        
        // Update status
        updateStatus("Reset complete", 0);
        elements.detailStatus.textContent = "";
    }
    
    // Export results to CSV
    function exportResults() {
        if (!state.resultsData || !state.resultsData.data || state.resultsData.data.length === 0) {
            alert("No results to export");
            return;
        }
        
        // Create CSV content with PapaParse
        const csvContent = Papa.unparse(state.resultsData.data);
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `fuzzy_matcher_results_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        updateStatus("Results exported to CSV");
    }
});
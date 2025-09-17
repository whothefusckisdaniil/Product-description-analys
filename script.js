const fileInput = document.getElementById('htmlFileInput');
const searchButton = document.getElementById('searchButton');
const exportButton = document.getElementById('exportButton');
const resultsPreview = document.getElementById('results-preview');
const fileInputLabel = document.querySelector('label[for="htmlFileInput"]');
const originalLabelText = fileInputLabel.textContent;

let foundItems = [];

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        searchButton.disabled = false;
        fileInputLabel.classList.add('secondary');
        fileInputLabel.textContent = fileInput.files[0].name;
    } else {
        searchButton.disabled = true;
        fileInputLabel.classList.remove('secondary');
        fileInputLabel.textContent = originalLabelText;
    }
});

searchButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Пожалуйста, сначала выберите файл.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        processFileContents(contents);
    };
    reader.readAsText(file);
});

exportButton.addEventListener('click', () => {
    if (foundItems.length === 0) {
        alert('Нет данных для экспорта.');
        return;
    }

    let csvContent = '';
    foundItems.forEach(item => {
        const line1 = `"${item.trackingNumber}"`;
        const line2 = `"Goods decription: ${item.fullDescription}"`;
        csvContent += `${line1}\n${line2}\n\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "filtered_goods.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});


function processFileContents(htmlContent) {
    const keywords = ['stic', 'stik', 'cig', 'tobacco', 'heat', 'heet', 'iqos', 'ikos', 'icos', 'hit', 'iluma', 'terea'];
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || "";

    const blockRegex = /(\d{3}-\d{8})[\s\S]*?Goods decription:\s*(.*?)(?:\n|$)/g;
    let match;
    
    foundItems = []; 

    while ((match = blockRegex.exec(text)) !== null) {
        const trackingNumber = match[1];
        const fullDescription = (match[2] || "").trim();
        const descriptionForSearch = fullDescription.toLowerCase(); 

        for (const keyword of keywords) {
            if (descriptionForSearch.includes(keyword)) {
                foundItems.push({
                    trackingNumber: trackingNumber,
                    fullDescription: fullDescription 
                });
                break; 
            }
        }
    }
    
    if (foundItems.length > 0) {
        let previewText = '';
        foundItems.forEach(item => {
            previewText += `${item.trackingNumber}\nGoods decription: ${item.fullDescription}\n\n`;
        });
        resultsPreview.textContent = previewText;
        exportButton.style.display = 'inline-block';
    } else {
        resultsPreview.textContent = 'Совпадений не найдено.';
        exportButton.style.display = 'none';
    }
}
const fileInput = document.getElementById('htmlFileInput');
const searchButton = document.getElementById('searchButton');
const exportButton = document.getElementById('exportButton');
const resultsPreview = document.getElementById('results-preview');
const fileInputLabel = document.querySelector('label[for="htmlFileInput"]');
const originalLabelText = fileInputLabel.textContent;

let foundItems = [];

fileInput.addEventListener('change', () => {
    const fileCount = fileInput.files.length;
    if (fileCount > 0) {
        searchButton.disabled = false;
        fileInputLabel.classList.add('secondary');
        fileInputLabel.textContent = `Выбрано файлов: ${fileCount}`;
    } else {
        searchButton.disabled = true;
        fileInputLabel.classList.remove('secondary');
        fileInputLabel.textContent = originalLabelText;
    }
});

searchButton.addEventListener('click', () => {
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Пожалуйста, сначала выберите файлы.');
        return;
    }

    const fileReadPromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    });

    Promise.all(fileReadPromises)
        .then(allContents => {
            foundItems = [];
            allContents.forEach(content => {
                const itemsFromFile = processFileContents(content);
                foundItems.push(...itemsFromFile);
            });
            displayResults();
        })
        .catch(error => {
            console.error("Ошибка при чтении файлов:", error);
            resultsPreview.textContent = "Произошла ошибка при чтении одного из файлов.";
        });
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
    const keywords = ['stic', 'stik', 'cig', 'tobacco', 'heat', 'heet', 'iqos', 'ikos', 'icos', 'hit', 'iluma', 'terea', 'stick', 'tobaco', 'tobaco', 'terra', 'nicotine', 'accessories'];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const blockRegex = /(\d{3}-\d{8})[\s\S]*?Goods decription:\s*(.*?)(?:\n|$)/g;
    let match;
    const items = [];

    while ((match = blockRegex.exec(text)) !== null) {
        const trackingNumber = match[1];
        const fullDescription = (match[2] || "").trim();
        const descriptionForSearch = fullDescription.toLowerCase();

        for (const keyword of keywords) {
            if (descriptionForSearch.includes(keyword)) {
                items.push({
                    trackingNumber: trackingNumber,
                    fullDescription: fullDescription
                });
                break;
            }
        }
    }
    return items;
}

function displayResults() {
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

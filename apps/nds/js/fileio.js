'use strict';

// ---------- File Utilities ----------

function SaveFile(file, content) {
	// Save <content> to <file> in user's Downloads folder.
    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = file;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    LogMsg(`Saved ${file}`);
} //SaveFile

async function pickFile() {
    //
    if (!window.showOpenFilePicker) {
        throw new Error("File picker not supported in this browser");
    }

    const [handle] = await window.showOpenFilePicker({
        types: [{
            description: 'Allowed files',
            accept: {
                'text/csv': ['.csv'],
                'text/plain': ['.txt']
            }
        }]
    });

    return handle.getFile();
}

async function pickFileDEL(accept = ['.csv', '.txt']) {
    // Modern browser API
    // uses <input type="file" id="filein">
    if (window.showOpenFilePicker) {
        const [handle] = await window.showOpenFilePicker({
            startIn: 'downloads',
            types: [{
                description: 'Allowed files',
                accept: {
                    'text/csv': ['.csv'],
                    'text/plain': ['.txt']
                }
            }]
        });
        return handle.getFile(); // returns a Promise<File>
    }
    // Fallback (input element)
    return new Promise((resolve, reject) => {
        const input = document.getElementById(idFileIn);

        if (!input) {
            reject(new Error("File input element not found"));
            return;
        }
        const onChange = (e) => {
            const file = e.target.files[0];
            input.value = "";
            input.removeEventListener('change', onChange);

            if (!file) {
                reject(new Error("No file selected"));
                return;
            }
            resolve(file);
        };
        input.addEventListener('change', onChange, { once: true });
        input.click();
    });
}

async function readTextFile(file) {
	// Read file contents safely.
    if (!file) throw new Error("No file selected");

    if (!file.name.match(/\.(csv|txt)$/i)) {
        throw new Error("Invalid file type. Please select CSV or TXT.");
    }
    return await file.text();
} //readTextFile
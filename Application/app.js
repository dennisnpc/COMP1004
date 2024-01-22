class File {
        name = null;
        contents = null;

        encryptor = new Encryptor();
        decryptor = new Decryptor();
        JSONHandler = new JSONHandler();

        open(HTMLId) {
            return new Promise((resolve, reject) => {
                const fileInput = document.getElementById(HTMLId);
                const file = fileInput.files[0];

                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }

                this.name = file.name;

                const reader = new FileReader();

                reader.onload = (event) => {
                    this.contents = event.target.result;
                    resolve(this.contents);
                };

                reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                    reject(error);
                };

                reader.readAsText(file);
            });
        }

        encryptFile() {
            this.contents = this.encryptor.encrypt(this.contents);
        }

        downloadKey() {
            this.JSONHandler.downloadKey(fileToEncrypt.encryptor.key);
        }

        async loadKey() {
            try {
                this.decryptor.key = await this.JSONHandler.readKey();
                console.log('Key loaded:', this.decryptor.key);
            } catch (error) {
                console.error('Error loading key:', error);
            }
        }

        decryptFile() {
            this.contents = this.decryptor.decrypt(this.contents);
        }

        downloadFile() {
            // Create a Blob containing the file content
            const blob = new Blob([this.contents], { type: 'text/plain' });

            // Create a link element
            const aTag = document.createElement('a');
            aTag.href = URL.createObjectURL(blob);

            // Set the file name
            let downloadName = this.name;
            if (downloadName.endsWith('.enc')) {
                downloadName = downloadName.replace('.enc', '');
            }
            else {
                downloadName += '.enc';
            }

            aTag.download = downloadName;

            // Append the anchor element to the body
            document.body.appendChild(aTag);

            // Programmatically trigger a click event on the anchor element
            aTag.click();

            // Remove the anchor element from the body
            document.body.removeChild(aTag);
        }
    }

class Encryptor {
        key = this.randomNumber();

        encrypt(data) {
            let cyphertext = '';

            // Check if a file was selected
            if (data != null) {

                const plaintext = data;

                // Encryption algorithm
                for (let i = 0; i < plaintext.length; i++) {
                    let shift = Number(this.key[(plaintext.length + i) % this.key.length]);
                    let currentCharCode = plaintext.charCodeAt(i);
                    currentCharCode = currentCharCode + shift;
                    cyphertext += String.fromCharCode(currentCharCode);
                }

                // Output results to console
                console.log('Encrypted:', cyphertext);
                console.log('Key:', this.key);

                return cyphertext;
            }

            // If no file selected
            else {
                console.log('No file selected');
            }
        }

        randomNumber() {
            let number = '';

            for (let i = 0; i < (Math.floor((Math.random() * 96) + 32)); i++) {
                let newDigit;
                do {
                    newDigit = (Math.floor((Math.random() * 9) + 1)).toString();
                } while (i > 0 && newDigit === number[i - 1]);

                number += newDigit;
            }

            return number;
        }
    }

class Decryptor {
        key = null;

        decrypt(data) {
            let plaintext = '';

            // Check if a file was selected
            if (data != null) {

                const cyphertext = data;

                // Decryption algorithm
                for (let i = 0; i < cyphertext.length; i++) {
                    let shift = Number(this.key[(cyphertext.length + i) % this.key.length]);
                    let currentCharCode = cyphertext.charCodeAt(i);
                    currentCharCode = currentCharCode - shift;
                    plaintext += String.fromCharCode(currentCharCode);
                }

                // Output results to console
                console.log('Decrypted:', plaintext);
                console.log('Key:', this.key);

                return plaintext;
            }

            // If no file selected
            else {
                console.log('No file selected');
            }
        }
    }

class JSONHandler {
        async readKey() {
            try {
                const json = new File();
                await json.open('decKey');

                const parsedJson = JSON.parse(json.contents);

                if (parsedJson && parsedJson.key) {
                    console.log('Key from JSON:', parsedJson.key);
                    return parsedJson.key;
                } else {
                    console.log('Invalid JSON format or key not found');
                }
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }

        downloadKey(key) {
            if (key != null) {
                let encFileMetadata = {
                    key: key
                };

                let jsonFile = JSON.stringify(encFileMetadata);

                // Create a Blob containing the file content
                const blob = new Blob([jsonFile], { type: 'application/json' });

                // Create a link element
                const aTag = document.createElement('a');
                aTag.href = URL.createObjectURL(blob);

                // Set the file name
                let downloadName = 'key.json';

                aTag.download = downloadName;

                // Append the anchor element to the body
                document.body.appendChild(aTag);

                // Programmatically trigger a click event on the anchor element
                aTag.click();

                // Remove the anchor element from the body
                document.body.removeChild(aTag);
            }

            // If no file has been encrypted
            else {
                console.log('No key has been generated');
            }
        }
    }


// File selectors
{
    // By click
    {
        document.getElementById('encGetFile').onclick = function () {
            document.getElementById('encFile').click();
        };
        document.getElementById('encFile').addEventListener('input', function () {
            if (this.files.length > 0) {
                document.getElementById('encGetFile').innerText = this.files[0].name;
            } else {
                document.getElementById('encGetFile').innerText = 'Drop or select .txt';
            }
        });

        document.getElementById('decGetFile').onclick = function () {
            document.getElementById('decFile').click();
        };
        document.getElementById('decFile').addEventListener('input', function () {
            if (this.files.length > 0) {
                document.getElementById('decGetFile').innerText = this.files[0].name;
            } else {
                document.getElementById('decGetFile').innerText = 'Drop or select .enc';
            }
        });

        document.getElementById('decGetKey').onclick = function () {
            document.getElementById('decKey').click();
        };
        document.getElementById('decKey').addEventListener('input', function () {
            if (this.files.length > 0) {
                document.getElementById('decGetKey').innerText = this.files[0].name;
            } else {
                document.getElementById('decGetKey').innerText = 'Drop or select .json';
            }
        });
    }


    // By drop
    {
        // For encryption
        {
            document.getElementById('encGetFile').addEventListener('dragover', function (event) {
                event.preventDefault();
                event.target.classList.add('drag-over');
            });

            document.getElementById('encGetFile').addEventListener('dragleave', function (event) {
                event.target.classList.remove('drag-over');
            });

            document.getElementById('encGetFile').addEventListener('drop', function (event) {
                event.preventDefault();
                event.target.classList.remove('drag-over');

                if (event.dataTransfer.files.length > 0) {
                    document.getElementById('encFile').files = event.dataTransfer.files;
                    handleEncFileChange(document.getElementById('encFile').files[0]);
                }
            });

            function handleEncFileChange(file) {
                if (file) {
                    console.log('Selected file:', file.name);

                    document.getElementById('encGetFile').innerText = file.name;
                }
            }
        }


        // For decryption
        {
            document.getElementById('decGetFile').addEventListener('dragover', function (event) {
                event.preventDefault();
                event.target.classList.add('drag-over');
            });

            document.getElementById('decGetFile').addEventListener('dragleave', function (event) {
                event.target.classList.remove('drag-over');
            });

            document.getElementById('decGetFile').addEventListener('drop', function (event) {
                event.preventDefault();
                event.target.classList.remove('drag-over');

                if (event.dataTransfer.files.length > 0) {
                    document.getElementById('decFile').files = event.dataTransfer.files;
                    handleDecFileChange(document.getElementById('decFile').files[0]);
                }
            });

            function handleDecFileChange(file) {
                if (file) {
                    console.log('Selected file:', file.name);

                    document.getElementById('decGetFile').innerText = file.name;
                }
            }


            document.getElementById('decGetKey').addEventListener('dragover', function (event) {
                event.preventDefault();
                event.target.classList.add('drag-over');
            });

            document.getElementById('decGetKey').addEventListener('dragleave', function (event) {
                event.target.classList.remove('drag-over');
            });

            document.getElementById('decGetKey').addEventListener('drop', function (event) {
                event.preventDefault();
                event.target.classList.remove('drag-over');

                if (event.dataTransfer.files.length > 0) {
                    document.getElementById('decKey').files = event.dataTransfer.files;
                    handleDecKeyChange(document.getElementById('decKey').files[0]);
                }
            });

            function handleDecKeyChange(file) {
                if (file) {
                    console.log('Selected file:', file.name);

                    document.getElementById('decGetKey').innerText = file.name;
                }
            }
        }
    }
}


// Buttons
{
    // To encrypt
    {
        // Show encrypt
        document.getElementById('encSelect').addEventListener('click', function () {
            hideAll();
            selectorsShow();
            encScreen1Show();
        });

        // Encrypt file
        document.getElementById('encProcess').addEventListener('click', async function () {
            processingShow();

            fileToEncrypt = new File();

            try {
                await fileToEncrypt.open('encFile')
                console.log(fileToEncrypt.contents);

                fileToEncrypt.encryptFile();

                console.log('File encrypted and downloaded successfully');
            } catch (error) {
                console.error('Error encrypting and downloading:', error);
            }

            hideAll();
            encScreen2Show();
            restartShow();
        });

        // Download encrypted file
        document.getElementById('encDownloadFile').addEventListener('click', function () {
            fileToEncrypt.downloadFile();
        });

        // Download key
        document.getElementById('encDownloadKey').addEventListener('click', function () {
            fileToEncrypt.downloadKey();
        });
    }


    // To decrypt
    {
        // Show decrypt
        document.getElementById('decSelect').addEventListener('click', function () {
            hideAll();
            selectorsShow();
            decScreen1Show();
        });

        // Decrypt file
        document.getElementById('decProcess').addEventListener('click', async function () {
            processingShow();

            fileToDecrypt = new File();

            try {
                await fileToDecrypt.open('decFile');
                console.log(fileToDecrypt.contents);

                await fileToDecrypt.loadKey();
                fileToDecrypt.decryptFile();
            }
            catch (error) {
                console.error('Error decrypting and downloading:', error);
            }

            hideAll();
            decScreen2Show();
            restartShow();
        });

        // Download decrypted file
        document.getElementById('decDownloadFile').addEventListener('click', function () {
            fileToDecrypt.downloadFile();
        });
    }


    // Restart
    document.getElementById('restart').addEventListener('click', function () {
        start();
    });
}


// Show/hide elements
{
    // Selectors
    {
        function selectorsHide() {
            document.getElementById('selectors').style.visibility = 'hidden';
        }
        function selectorsShow() {
            document.getElementById('selectors').style.visibility = 'visible';
        }
    }
   
    // Screens
    {
        // Encryption
        {
            function encScreen1Hide() {
                document.getElementById('encScreen1').style.display = 'none';
                document.getElementById('encProcess').style.display = 'none';
            }
            function encScreen1Show() {
                document.getElementById('encScreen1').style.display = 'grid';
                document.getElementById('encProcess').style.display = 'grid';
            }

            function encScreen2Hide() {
                document.getElementById('encScreen2').style.display = 'none';
            }
            function encScreen2Show() {
                document.getElementById('encScreen2').style.display = 'grid';
            }
        }


        // Decryption
        {
            function decScreen1Hide() {
                document.getElementById('decScreen1').style.display = 'none';
                document.getElementById('decProcess').style.display = 'none';
            }
            function decScreen1Show() {
                document.getElementById('decScreen1').style.display = 'grid';
                document.getElementById('decProcess').style.display = 'grid';
            }

            function decScreen2Hide() {
                document.getElementById('decScreen2').style.display = 'none';
            }
            function decScreen2Show() {
                document.getElementById('decScreen2').style.display = 'block';
            }
        }
    }
 
    function processingHide() {
        document.getElementById('processing-screen').style.display = 'none';
    }
    function processingShow() {
        document.getElementById('encProcess').style.display = 'none';
        document.getElementById('decProcess').style.display = 'none';
        document.getElementById('processing-screen').style.display = 'grid';
    }

    function restartHide() {
        document.getElementById('restart').style.display = 'none';
    }
    function restartShow() {
        document.getElementById('restart').style.display = 'grid';
    }

    function hideAll() {
        selectorsHide();
        encScreen1Hide();
        encScreen2Hide();
        decScreen1Hide();
        decScreen2Hide();
        processingHide()
        restartHide();
    }

    function start() {
        hideAll();
        selectorsShow();
        encScreen1Show();
    }
}


start();
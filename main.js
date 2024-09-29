const qrSizeInput = document.getElementById('qrSize');
const barcodeTypeSelect = document.getElementById('barcodeType');
const codeTypeSelect = document.getElementById('codeType');
const qrDataTypeSelect = document.getElementById('qrDataType');
const downloadButton = document.getElementById('downloadButton');
let generatedElement = null;

codeTypeSelect.addEventListener('change', function() {
  if (this.value === 'qr') {
    barcodeTypeSelect.style.display = 'none';
    qrSizeInput.style.display = 'block';
    qrDataTypeSelect.style.display = 'block';
  } else {
    barcodeTypeSelect.style.display = 'block';
    qrSizeInput.style.display = 'none';
    qrDataTypeSelect.style.display = 'none';
  }
});

function generateCode() {
  const inputData = document.getElementById('inputData').value;
  const codeType = codeTypeSelect.value;
  const qrDataType = qrDataTypeSelect.value;
  const output = document.getElementById('output');
  output.innerHTML = ""; // Clear the output area
  downloadButton.style.display = 'none'; // Hide the download button initially

  if (codeType === 'qr') {
    let qrText = inputData;

    if (qrDataType === 'url') {
      qrText = `${inputData}`;
    } else if (qrDataType === 'email') {
      qrText = `mailto:${inputData}`;
    } else if (qrDataType === 'phone') {
      qrText = `tel:${inputData}`;
    } else if (qrDataType === 'wifi') {
      // Format: WIFI:S:<SSID>;T:<WPA|WEP|blank>;P:<password>;;
      const wifiSSID = prompt('Enter Wi-Fi SSID:');
      const wifiPass = prompt('Enter Wi-Fi Password:');
      qrText = `WIFI:S:${wifiSSID};T:WPA;P:${wifiPass};;`;
    }

    // Set QR size
    let qrSize = parseInt(document.getElementById('qrSize').value) || 256;

    // Generate QR code
    const qrCodeContainer = document.createElement('div');
    new QRCode(qrCodeContainer, {
      text: qrText,
      width: qrSize,
      height: qrSize
    });
    output.appendChild(qrCodeContainer);

    // Convert the generated QR code into a canvas for download
    setTimeout(() => {
      const qrCanvas = qrCodeContainer.querySelector('canvas');
      if (qrCanvas) {
        generatedElement = qrCanvas;
        downloadButton.style.display = 'block'; // Show download button
      }
    }, 100);
  } else if (codeType === 'barcode') {
    const barcodeType = document.getElementById('barcodeType').value;

    // Generate Barcode
    let canvas = document.createElement('canvas');
    JsBarcode(canvas, inputData, {
      format: barcodeType,
      displayValue: true, // Show the value below the barcode
      width: 2,
      height: 100
    });
    output.appendChild(canvas);

    generatedElement = canvas;
    downloadButton.style.display = 'block'; // Show download button
  }
}

function downloadCode(format = 'png') {
  if (generatedElement) {
    // Ensure the chosen format is valid
    const validFormats = ['png', 'jpeg'];
    if (!validFormats.includes(format)) {
      alert('Invalid format selected! Please choose png or jpeg.');
      return;
    }

    // Prepare download link and image format
    const link = document.createElement('a');
    const fileName = `code_${codeTypeSelect.value}_${new Date().getTime()}.${format}`;
    link.download = fileName;

    // Convert the canvas to the selected format if it's a canvas element
    if (generatedElement.tagName === 'CANVAS') {
      try {
        // Create an off-screen canvas
        const originalCanvas = generatedElement;
        const borderWidth = 5; // 5px white border
        const newWidth = originalCanvas.width + borderWidth * 2;
        const newHeight = originalCanvas.height + borderWidth * 2;

        // Create a new canvas with extra space for the border
        const canvasWithBorder = document.createElement('canvas');
        const ctx = canvasWithBorder.getContext('2d');
        canvasWithBorder.width = newWidth;
        canvasWithBorder.height = newHeight;

        // Fill the new canvas with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);

        // Draw the original canvas onto the new one with a 5px offset for the border
        ctx.drawImage(originalCanvas, borderWidth, borderWidth);

        // Convert the new canvas with the border to the selected format
        link.href = canvasWithBorder.toDataURL(`image/${format}`);
        link.click(); // Trigger the download
      } catch (error) {
        console.error('Error during download:', error);
        alert('Failed to download the image. Please try again.');
      }
    } else {
      alert('Unable to download the generated code. Please try again!');
    }
  } else {
    alert('Please generate a code first!');
  }
}
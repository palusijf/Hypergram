let fileInput = document.getElementById("file-input");
let canvas = document.getElementById("draw_area");
let brightness = document.getElementById("brightness");
let contrast = document.getElementById("contrast");
let transparent = document.getElementById("transparent");
let originalPixels = null;

fileInput.addEventListener("change", uploadImage);
brightness.addEventListener("change", (e) => updateImage(e.target, contrast, transparent));
contrast.addEventListener("change", (e) => updateImage(brightness, e.target, transparent));
transparent.addEventListener("change", (e) => updateImage(brightness, contrast, e.target));

function updateImage(brightness, contrast, transparent) {
    const pixels = processImage(brightness, contrast, transparent);
    const imageData = getImageData();
    imageData.data.set(pixels);
    canvas.getContext("2d").putImageData(imageData, 0, 0);
}

function getImageData() {
    const ctx = canvas.getContext("2d");
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function uploadImage(event) {
    if (event.target.files) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function (e) {
            let image = new Image();
            image.src = String(e.target.result);
            image.onload = function (ev) {
                canvas.width = ev.target.width;
                canvas.height = ev.target.height;
                canvas.getContext("2d").drawImage(image, 0, 0);

                originalPixels = getImageData();
            };
        };
    }
}

function processImage(brightness, contrast, transparent) {
    const tempPixels = originalPixels.slice();
    const contrastFactor = 259 * (255 + contrast) / (255 * (259 - contrast));
    for (let i = 0; i < tempPixels.length; i += 4) {
        // ================================================================================ red =======
        tempPixels[i] = contrastFactor * (tempPixels[i] - 128) + 128 + brightness;
        // ================================================================================ green =====
        tempPixels[i + 1] = contrastFactor * (tempPixels[i + 1] - 128) + 128 + brightness;
        // ================================================================================ blue ======
        tempPixels[i + 2] = contrastFactor * (tempPixels[i + 2] - 128) + 128 + brightness;
        // ================================================================================ alpha =====
        tempPixels[i + 3] *= transparent;
    }
    return tempPixels;
}

function downloadImage() {
    let image = canvas.toDataURL();
    let tmpLink = document.createElement('a');
    tmpLink.download = 'result.png';
    tmpLink.href = image;

    document.body.appendChild(tmpLink);
    tmpLink.click();
    document.body.removeChild(tmpLink);
}

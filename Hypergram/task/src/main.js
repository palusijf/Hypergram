let ImageDrawer = (function () {

    let elements = {
        fileInput: null,
        canvas: null,
        brightnessSlider: null,
        contrastSlider: null,
        transparentSlider: null,
    }

    let originalPixels = null;

    function init() {
        elements = {
            fileInput: document.getElementById("file-input"),
            canvas: document.getElementById("draw_area"),
            brightnessSlider: document.getElementById("brightness"),
            contrastSlider: document.getElementById("contrast"),
            transparentSlider: document.getElementById("transparent"),
        };

        elements.fileInput.addEventListener("change", uploadImage);
        elements.brightnessSlider.addEventListener("change",
            (event) => modifyColorProprieties(event.target, elements.contrastSlider, elements.transparentSlider));
        elements.contrastSlider.addEventListener("change",
            (event) => modifyColorProprieties(elements.brightnessSlider, event.target, elements.transparentSlider));
        elements.transparentSlider.addEventListener("change",
            (event) => modifyColorProprieties(elements.brightnessSlider, elements.contrastSlider, event.target));
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
                    const width = ev.target.width;
                    const height = ev.target.height;
                    drawImage(image, width, height);

                    const imageData = getImageData();
                    setOriginalPixels(imageData.data)
                };
            };
        }
    }

    function drawImage(image, width, height) {
        elements.canvas.width = width;
        elements.canvas.height = height;

        const ctx = getCanvasContext2D();
        ctx.drawImage(image, 0, 0);
    }

    function getImageData() {
        const ctx = getCanvasContext2D();
        return ctx.getImageData(0, 0, elements.canvas.width, elements.canvas.height);
    }

    function getCanvasContext2D() {
        return elements.canvas.getContext("2d");
    }

    function setOriginalPixels(_originalPixels) {
        originalPixels = _originalPixels;
    }

    function getModifiedPixels(brightness, contrast, transparent) {
        const tempPixels = originalPixels.slice();
        const contrastFactor = getContrastFactor(contrast);
        for (let i = 0; i < tempPixels.length; i += 4) {
            // Red
            let newContrastValue = getNewContrast(tempPixels[i], contrastFactor);
            tempPixels[i] = getNewBrightness(newContrastValue, brightness);

            // Green
            newContrastValue = getNewContrast(tempPixels[i + 1], contrastFactor);
            tempPixels[i + 1] = getNewBrightness(newContrastValue, brightness);

            // Blue
            newContrastValue = getNewContrast(tempPixels[i + 2], contrastFactor);
            tempPixels[i + 2] = getNewBrightness(newContrastValue, brightness);

            // ALPHA
            tempPixels[i + 3] = getNewTransparent(tempPixels[i + 3], transparent);
        }
        return tempPixels;
    }

    function modifyColorProprieties(brightnessSlider, contrastSlider, transparentSlider) {
        const pixels = getModifiedPixels(brightnessSlider.valueAsNumber, contrastSlider.valueAsNumber, transparentSlider.valueAsNumber);
        redrawImage(pixels);
    }

    function redrawImage(pixels) {
        const imageData = getImageData();
        imageData.data.set(pixels);
        getCanvasContext2D().putImageData(imageData, 0, 0);
    }

    function getContrastFactor(contrast) {
        return 259 * (255 + contrast) / (255 * (259 - contrast));
    }

    function getNewTransparent(alpha, transparent) {
        return alpha * transparent;
    }

    function getNewContrast(colorChannel, contrastFactor) {
        return contrastFactor * (colorChannel - 128) + 128;
    }

    function getNewBrightness(colorChannel, brightness) {
        return colorChannel + brightness;
    }

    return {
        init: init,
    }
})();



ImageDrawer.init();
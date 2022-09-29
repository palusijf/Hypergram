let originalPixels;
const getCanvas = () => document.getElementById('canvas');
const getCtx = () => getCanvas().getContext('2d');

const drawImageOnload = image => (_) => {
    const canvas = getCanvas();
    const ctx = getCtx();
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
};

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (ev) => {
    if (ev.target.files) {
        const file = ev.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = (e) => {
            const image = new Image();
            image.src = String(e.target.result);
            image.onload = drawImageOnload(image);
        };
    }
});
let canvas = document.getElementById('canvas');
const file_input = document.getElementById("file-input");
canvas.width = 0;
canvas.height = 0;
const original_data = [];

file_input.addEventListener("change", (e) => {
    if (e.target.files) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            let image = new Image();
            image.src = e.target.result;
            image.onload = function (e) {
                canvas.width = image.width;
                canvas.height = image.height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < imageData.data.length; i++) {
                    original_data[i] = imageData.data[i];
                }
            };
        };
    }
});
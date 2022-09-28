const pixels = require('image-pixels')
const path = require('path');
const filePath = path.resolve(__dirname, '../test/testImage.png');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const {StageTest, correct, wrong} = require('hs-test-web');

class HypergramTest extends StageTest {

    page = this.getPage(pagePath)

    tests = [
        this.page.execute(() => {
            const canvas = document.getElementsByTagName("canvas");
            if (canvas.length !== 1) {
                return wrong("There is should be 1 canvas element in the page!")
            }

            const uploadButton = document.querySelector("input[type='file']#file-input");
            if (uploadButton === null) {
                return wrong("Can't find a file upload input field. It should have type 'file' and #file-input id.")
            }

            const brightnessSlider = document.querySelector("input[type='range']#brightness");
            if (brightnessSlider === null) {
                return wrong("Can't slider for brightness parameter. " +
                    "There is should be an 'input' tag with type 'range' and with #brigtness id!")
            }

            const contrastSlider = document.querySelector("input[type='range']#contrast");
            if (contrastSlider === null) {
                return wrong("Can't slider for contrast parameter. " +
                    "There is should be an 'input' tag with type 'range' and with #contrast id!")
            }

            const transparent = document.querySelector("input[type='range']#transparent");
            if (transparent === null) {
                return wrong("Can't slider for transparent parameter. " +
                    "There is should be an 'input' tag with type 'range' and with #transparent id!")
            }

            const saveButton = document.querySelector("button#save-button");
            if (saveButton === null) {
                return wrong("Can't find a button with #save-button id!")
            }

            return correct()
        }),
        this.node.execute(async () => {
            const uploadButton = await this.page.pageInstance.$("input[type='file']#file-input");
            await uploadButton.uploadFile(filePath);
            await uploadButton.evaluate(upload => upload.dispatchEvent(new Event('change', {bubbles: true})));
            await sleep(500)

            const userPixels = await this.page.evaluate(() => {
                const canvas = document.getElementsByTagName("canvas")[0];
                if (canvas.width !== 30 || canvas.height !== 30) {
                    return wrong("After uploading an image into canvas it has wrong size!")
                }
                const ctx = canvas.getContext("2d");
                return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            });

            const {data} = await pixels(filePath)

            if (data.length !== Object.keys(userPixels).length) {
                return wrong("Wrong number ox pixels on the canvas!")
            }

            for (let i = 0; i < data.length; i++) {
                if (data[i] !== userPixels[i]) {
                    return wrong("Looks like some of the pixels have wrong RGB value!")
                }
            }

            return correct()
        })
    ]
}

it('Test stage', async function () {
    try {
        this.timeout(30000)
    } catch (ignored) {
    }
    await new HypergramTest().runTests()
}, 30000)
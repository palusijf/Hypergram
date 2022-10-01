const pixels = require('image-pixels')
const path = require('path');
const rimraf = require('rimraf');
const fs = require("fs");

const {StageTest, correct, wrong} = require('hs-test-web');
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const workingDir = path.resolve(__dirname, '../src');
const pagePath = 'file://' + path.resolve(__dirname, workingDir + '/index.html');
const imageFolderPath = path.resolve(__dirname, '../test/images/');
const initImage = imageFolderPath + '/testImage.png'
const brightnessTestImage = imageFolderPath + '/testBrightness.png'
const contrastTestImage = imageFolderPath + '/testContrast.png'
const transparentTestImage = imageFolderPath + '/testTransparent.png'
const multipleFilterTestImage = imageFolderPath + '/testMultipleFilters.png'
const downloadedFilePath = workingDir + `${path.sep}downloads${path.sep}result.png`;

function comparePixels(userPixels, correctPixels, errorMessage) {
    if (correctPixels.length !== Object.keys(userPixels).length) {
        return wrong("Wrong number ox pixels on the canvas!")
    }

    for (let i = 0; i < correctPixels.length; i++) {
        if (correctPixels[i] !== userPixels[i]) {
            return wrong(errorMessage)
        }
    }
}

class HypergramTest extends StageTest {

    page = this.getPage(pagePath)

    tests = [
        this.node.execute(() => {
            rimraf.sync(workingDir + '/downloads');
            return correct()
        }),
        this.page.execute(() => {
            const canvas = document.getElementsByTagName("canvas");
            if (canvas.length !== 1) {
                return wrong("There is should be 1 canvas element in the page!")
            }
            this.getPixels = () => {
                const canvas = document.getElementsByTagName("canvas")[0];
                if (canvas.width !== 30 || canvas.height !== 30) {
                    return wrong("After uploading an image into canvas it has wrong size!")
                }
                const ctx = canvas.getContext("2d");
                return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            }
            return correct()
        }),
        this.page.execute(() => {
            this.brightnessSlider = document.getElementById("brightness")
            this.contrastSlider = document.getElementById("contrast")
            this.transparentSlider = document.getElementById("transparent")

            if (this.brightnessSlider === null) {
                return wrong("Can't find a brightness slider! There is should be an input tag with #brightness id.")
            }

            if (!this.brightnessSlider.hasAttribute("min") ||
                !this.brightnessSlider.hasAttribute("max") ||
                !this.brightnessSlider.hasAttribute("step")) {
                return wrong("Looks like your brightness slider doesn't have one of the following attributes:" +
                    " 'min', 'max' or 'step'")
            }

            if (this.contrastSlider === null) {
                return wrong("Can't find a contrast slider! There is should be an input tag with #contrast id.")
            }

            if (!this.contrastSlider.hasAttribute("min") ||
                !this.contrastSlider.hasAttribute("max") ||
                !this.contrastSlider.hasAttribute("step")) {
                return wrong("Looks like your brightness slider doesn't have one of the following attributes:" +
                    " 'min', 'max' or 'step'")
            }

            if (this.transparentSlider === null) {
                return wrong("Can't find a transparent slider! There is should be an input tag with #transparent id.")
            }

            if (!this.transparentSlider.hasAttribute("min") ||
                !this.transparentSlider.hasAttribute("max") ||
                !this.transparentSlider.hasAttribute("step")) {
                return wrong("Looks like your brightness slider doesn't have one of the following attributes:" +
                    " 'min', 'max' or 'step'")
            }

            return correct()
        }),
        this.page.execute(() => {

            const brightnessMinValue = parseInt(this.brightnessSlider.getAttribute("min"));
            const brightnessMaxValue = parseInt(this.brightnessSlider.getAttribute("max"));
            const brightnessStepValue = parseInt(this.brightnessSlider.getAttribute("step"));

            if (brightnessMinValue !== -255 || brightnessMaxValue !== 255 || brightnessStepValue !== 1) {
                return wrong("Brightness slider should have the following attribute values: " +
                    "min=-255, max=255, step=1")
            }

            const contrastMinValue = parseInt(this.contrastSlider.getAttribute("min"));
            const contrastMaxValue = parseInt(this.contrastSlider.getAttribute("max"));
            const contrastStepValue = parseInt(this.contrastSlider.getAttribute("step"));

            if (contrastMinValue !== -128 || contrastMaxValue !== 128 || contrastStepValue !== 1) {
                return wrong("Contrast slider should have the following attribute values: " +
                    "min=-128, max=128, step=1")
            }

            const transparentMinValue = parseInt(this.transparentSlider.getAttribute("min"));
            const transparentMaxValue = parseInt(this.transparentSlider.getAttribute("max"));
            const transparentStepValue = parseFloat(this.transparentSlider.getAttribute("step"));

            if (transparentMinValue !== 0 || transparentMaxValue !== 1 || transparentStepValue !== 0.1) {
                return wrong("Transparent slider should have the following attribute values: " +
                    "min=0, max=1, step=0.1")
            }

            const brightnessDefaultValue = parseInt(this.brightnessSlider.value)
            const contrastDefaultValue = parseInt(this.contrastSlider.value)
            const transparentDefaultValue = parseInt(this.transparentSlider.value)

            if (brightnessDefaultValue !== 0) {
                return wrong("The default value of the brightness slider should be equal to 0!")
            }

            if (contrastDefaultValue !== 0) {
                return wrong("The default value of the contrast slider should be equal to 0!")
            }

            if (transparentDefaultValue !== 1) {
                return wrong("The default value of the transparent slider should be equal to 1!")
            }

            return correct()
        }),
        this.node.execute(async () => {
            const uploadButton = await this.page.pageInstance.$("input[type='file']#file-input");
            await uploadButton.uploadFile(initImage);
            await uploadButton.evaluate(upload => upload.dispatchEvent(new Event('change', {bubbles: true})));
            await sleep(500)

            const userPixels = await this.page.evaluate(() => {
                return this.getPixels()
            });

            const {data} = await pixels(initImage)

            const compareResult = comparePixels(userPixels, data,
                "After downloading an image into canvas it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            return correct()
        }),
        this.node.execute(async () => {

            // testBrightness 87
            // testContrast 69
            // testTransparent 0.5

            let userPixels = await this.page.evaluate(() => {
                this.brightnessSlider.value = 87;
                this.brightnessSlider.dispatchEvent(new Event("change"))
                return this.getPixels()
            });

            let realPixels = await pixels(brightnessTestImage)

            let compareResult = comparePixels(userPixels, realPixels.data,
                "After increasing brightness of the image it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            userPixels = await this.page.evaluate(() => {
                this.brightnessSlider.value = 0;
                this.brightnessSlider.dispatchEvent(new Event("change"))
                return this.getPixels()
            });

            realPixels = await pixels(initImage)

            compareResult = comparePixels(userPixels, realPixels.data,
                "After decreasing brightness of the image to the default value it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            userPixels = await this.page.evaluate(() => {
                this.contrastSlider.value = 69;
                this.contrastSlider.dispatchEvent(new Event("change"))
                return this.getPixels()
            });

            realPixels = await pixels(contrastTestImage)

            compareResult = comparePixels(userPixels, realPixels.data,
                "After increasing contrast of the image it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            userPixels = await this.page.evaluate(() => {
                this.contrastSlider.value = 0;
                this.contrastSlider.dispatchEvent(new Event("change"))
                return this.getPixels()
            });

            realPixels = await pixels(initImage)

            compareResult = comparePixels(userPixels, realPixels.data,
                "After decreasing contrast of the image to the default value it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            userPixels = await this.page.evaluate(() => {
                this.transparentSlider.value = 0.5;
                this.transparentSlider.dispatchEvent(new Event("change"))
                return this.getPixels()
            });

            realPixels = await pixels(transparentTestImage)

            compareResult = comparePixels(userPixels, realPixels.data,
                "After decreasing transparent of the image it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            userPixels = await this.page.evaluate(() => {
                this.transparentSlider.value = 1;
                this.transparentSlider.dispatchEvent(new Event("change"))
                return this.getPixels()
            });

            realPixels = await pixels(initImage)

            compareResult = comparePixels(userPixels, realPixels.data,
                "After increasing transparent of the image to the default value it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            userPixels = await this.page.evaluate(() => {
                this.brightnessSlider.value = 92;
                this.brightnessSlider.dispatchEvent(new Event("change"))

                this.contrastSlider.value = 128;
                this.contrastSlider.dispatchEvent(new Event("change"))

                this.transparentSlider.value = 0.8;
                this.transparentSlider.dispatchEvent(new Event("change"))
                return this.getPixels()
            });

            realPixels = await pixels(multipleFilterTestImage)

            compareResult = comparePixels(userPixels, realPixels.data,
                "After applying multiple filters to the image it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            return correct()
        }),
        this.node.execute(async () => {

            await this.page.pageInstance._client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: workingDir + path.sep + "downloads"
            });

            const saveButton = await this.page.findBySelector("button#save-button")
            if (saveButton === null) {
                return wrong("Can't find a button with #save-button id!")
            }
            await saveButton.click()

            await sleep(1000)

            if (!fs.existsSync(downloadedFilePath)) {
                return wrong("Looks like you didn't download a PNG file named 'testMultipleFilters.png', " +
                    "after clicking on 'Save Image' button")
            }

            const downloadedPixels = await pixels(downloadedFilePath)
            const correctPixels = await pixels(multipleFilterTestImage)

            const compareResult = comparePixels(downloadedPixels.data, correctPixels.data,
                "After downloading an image from the page it has wrong pixel values!");
            if (compareResult) {
                return compareResult
            }

            rimraf.sync(workingDir + '/downloads');
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

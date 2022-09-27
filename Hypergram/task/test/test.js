const path = require('path');
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
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
                    "There is should be an 'input' tag with type 'range' and with #brightness id!")
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
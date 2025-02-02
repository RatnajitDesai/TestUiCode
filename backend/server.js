const { chromium } = require('playwright');
const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8085 });
let IS_WSS_CONNECTED = false;
const wssBaseline = new WebSocket.Server({port: 8080})
let IS_WSS_BASELINE_CONNECTED = false;

wssBaseline.on('connection', async (bws) => {
    let browser, context, page;
    try {
        console.log('Baseline WebSocket Client Connected');
    if(!IS_WSS_BASELINE_CONNECTED){
        // Launch Playwright browser    
        browser = await chromium.launch({ headless: false });
        context = await browser.newContext();
        page = await context.newPage();
        console.log("Browser Launched!!!!")
        bws.send(JSON.stringify({ status: 'Browser Launched' }));
        IS_WSS_BASELINE_CONNECTED = true;
    }

    bws.on('message', async (message) => {
        const data = JSON.parse(message);
        console.log(data)
        if (data.action === 'openPage') {
            await page.goto(data.url);
            const pageTitle = await page.title();
            bws.send(JSON.stringify({ status: 'Page Opened', title: pageTitle }));
        }

        if (data.action === 'takeScreenshot') {
            const screenshotPath = `screenshot_${data.data.imageType}.png`;
            await page.locator(data.data.cssLocator)
            await page.locator(data.data.cssLocator).screenshot({ path: screenshotPath });

            // Read the image as a Base64 string
            const imageBase64 = fs.readFileSync(screenshotPath, { encoding: 'base64' });
            bws.send(JSON.stringify({ status: 'Screenshot Taken', image: imageBase64 }));
        }

        if (data.action === 'extractContent') {
            const content = await page.evaluate(() => document.body.innerText);
            bws.send(JSON.stringify({ status: 'Content Extracted', content }));
        }
    });
    } catch (error) {
        console.log("Error > ", error)
    }
    
})

wss.on('connection', async (ws) => {
    console.log('Actual WebSocket Client Connected');
    let browser, context, page;
    try {
        if(!IS_WSS_CONNECTED){
            // Launch Playwright browser
            browser = await chromium.launch({ headless: false });
            context = await browser.newContext();
            page = await context.newPage();
            console.log("Browser Launched!!!!")
            ws.send(JSON.stringify({ status: 'Browser Launched' }));
            IS_WSS_CONNECTED = true;
        }
    
        ws.on('message', async (message) => {
            const data = JSON.parse(message);
    
            if (data.action === 'openPage') {
                // Launch Playwright browser
                ws.send(JSON.stringify({ status: 'Browser Launched' }));
                await page.goto(data.url);
                const pageTitle = await page.title();
                ws.send(JSON.stringify({ status: 'Page Opened', title: pageTitle }));
            }
    
            if (data.action === 'takeScreenshot') {
                const screenshotPath = `screenshot_${data.data.imageType}.png`;
                await page.locator(data.data.cssLocator)
                await page.locator(data.data.cssLocator).screenshot({ path: screenshotPath });
    
                // Read the image as a Base64 string
                const imageBase64 = fs.readFileSync(screenshotPath, { encoding: 'base64' });
                ws.send(JSON.stringify({ status: 'Screenshot Taken', image: imageBase64 }));
            }
    
            if (data.action === 'extractContent') {
                const content = await page.evaluate(() => document.body.innerText);
                ws.send(JSON.stringify({ status: 'Content Extracted', content }));
            }

            if(data.action === 'compare'){
                const { width, height } = PNG.sync.read(Buffer.from(data.images.baseImage, 'base64'));
                const diff = new PNG({ width, height });
                const diffPixels = Pixelmatch(PNG.sync.read(Buffer.from(data.images.baseImage, 'base64')).data,
                 PNG.sync.read(Buffer.from(data.images.actualImage, 'base64')).data, diff.data, width, height, { threshold: 0.1 });
                 ws.send(JSON.stringify({ status: 'Comparison Result', image: PNG.sync.write(diffPixels).toString('base64') }))
            }
        });
    
        ws.on('close', async () => {
            console.log('Client Disconnected, Closing Browser');
            await browser.close();
        });
        
    } catch (error) {
        console.log("Error > ", error)
    }
    
});

console.log('WebSocket Server Running on ws://localhost:8080');
console.log('WebSocket Server Running on ws://localhost:8085');


const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const downloadStatement = require('./downloadStatement.js');

async function app()
{
    var args = [
        '--start-maximized',
        '--disable-features=site-per-process',
        '--disable-blink-features=AutomationControlled', // makes webdriver fix work
    ];
    if (process.env.PPTR_NO_SANDBOX === "1") {
        args.push('--no-sandbox', '--disable-setuid-sandbox');
    }
    var headless = (typeof process.env.PPTR_HEADLESS === "undefined") || (process.env.PPTR_HEADLESS === "1");

    const browser = await puppeteer.launch({
        args: args,
        headless: headless,
        userDataDir: '/home/node/userdata' // allows us to persist cookies (Set browser as trusted)
    });

    const uuid = uuidv4();

    var report = {
        runid: uuid,
        start: Date.now(),
        end: null,
        error: null,
        errorTime: null,
        status: "started",
        filename: ""
    };

    const page = await browser.newPage();
    // Pass the Webdriver Test.
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    // set viewport and user agent (just in case for nice viewing)
    await page.setViewport({width: 1366, height: 768});
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    // go to homepage
    await page.goto((function rev(str) { return (str === '') ? '' : rev(str.substr(1)) + str.charAt(0) })("nigol/ku.oc.enilnoknabortem.lanosrep//:sptth"));
    await page.waitForTimeout(2000);

    await downloadStatement(page, uuid)
        .then(async (filename) => {
            report.end = Date.now();
            report.status = "success";
            report.filename = filename;
            await browser.close();
            console.log(JSON.stringify(report));
        })
        .catch(async (e) => {
            report.error = e.toString();
            report.errorTime = Date.now();
            report.status = "error";
            await page.screenshot({path: `screenshot/${uuid}-error.png`})
                .catch(() => {
                    report.status = "errorNoScreenshot";
                })
            await browser.close();

            console.log(JSON.stringify(report));
        })
}


app()
    .catch(function(e) {
        console.error(e);
        process.exit();
    })

return;
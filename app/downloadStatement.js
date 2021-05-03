const fs = require('fs');

async function downloadStatement(page, uuid) {
    const downloadPath = `/home/node/userdata/downloads/${uuid}`;

    // Username page
    await page.waitForSelector("input[name=username]");
    await page.type("input[name=username]", `${process.env.ORTEM_BANK_USERNAME}`, {delay: 75});
    await page.waitForTimeout(1000);
    await page.click("button[value=Continue]");

    // Password page
    await page.waitForSelector('.ib-password-container .ib-ibid-button button.mat-primary');
    const positions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.ib-seed-pos')).map((el) => {
            return Number.parseInt(el.innerText);
        })
    })

    const secretNumber = Array.from(process.env.ORTEM_BANK_SECRET_NUMBER);
    const password = Array.from(process.env.ORTEM_BANK_PASSWORD);

    const firstNumber = secretNumber[positions[0] - 1];
    const secondNumber = secretNumber[positions[1] - 1];
    const thirdNumber = secretNumber[positions[2] - 1];

    console.log(positions[0], positions[1], positions[2]);
    console.log(firstNumber, secondNumber, thirdNumber);
/*
    const firstLetter = password[positions[3] - 1];
    const secondLetter = password[positions[4] - 1];
    const thirdLetter = password[positions[5] - 1];
*/
    /*
    console.log(positions);

    console.log('1234567890abcdef');
    console.log(process.env.ORTEM_BANK_SECRET_NUMBER);
    console.log(process.env.ORTEM_BANK_PASSWORD);

    console.log([firstNumber, secondNumber, thirdNumber])
    console.log([firstLetter, secondLetter, thirdLetter])
    */

    await page.click('.btn.metro-cookiebar__btn')
    .catch(() => {
        // Do nothing if the cookie bar didn't come up
    })
    await page.type('[name=security0]', firstNumber, {delay: 0});
    await page.waitForTimeout(300);
    await page.type('[name=security1]', secondNumber, {delay: 0});
    await page.waitForTimeout(300);
    await page.type('[name=security2]', thirdNumber, {delay: 0});
    await page.waitForTimeout(300);/*
    await page.type("input[name=password0]", firstLetter, {delay: 0});
    await page.waitForTimeout(300);
    await page.type("input[name=password1]", secondLetter, {delay: 0});
    await page.waitForTimeout(300);
    await page.type("input[name=password2]", thirdLetter, {delay: 0});
    await page.waitForTimeout(300);*/

    await page.type("input[name=password0]", password, {delay: 70});
    await page.waitForTimeout(300);
    await page.evaluate(() => {
        document
            .querySelectorAll('.ib-ibid-button button.mat-primary')[0]
            .scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            })
    });
    await page.click('.ib-ibid-button button.mat-primary');

    // TODO.... 2fa
    /**
     * await page.waitForSelector('something 2fa')
     * .then((page) => {
     *     page.waitForTimeout(15 * 60 * 1000); // 15 mins to do 2fa thingy
     * })
     * .catch((page) => {
     *     // 2fa selector timed out so we're fine to just continue
     *     page.waitForSelector('not 2fa'); // unless we're not and it's an error
     * })
     */

    await page.waitForSelector('button[title="View my accounts"]');
    await page.click('button[title="View my accounts"]');

    await page.waitForSelector('.account-list-details a.link-header');
    await page.click('.account-list-details a.link-header');

    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    await page.waitForSelector('a[title="Download transactions in view"]');
    await page.evaluate(() => {
        document
            .querySelectorAll('a[title="Download transactions in view"]')[0]
            .scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            })
    });
    // Wait for scroll
    await page.waitForTimeout(700);
    await page.click('a[title="Download transactions in view"]');

    // Wait for download
    await page.waitForTimeout(7000);

    const dir = fs.readdirSync(downloadPath);
    if (dir.length !== 1) {
        throw new Error(dir.join(","));
    }
    return `${downloadPath}/${dir[0]}`;
}

module.exports = downloadStatement
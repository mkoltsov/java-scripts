const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
const TOKEN = process.env.TELEGRAM_TOKEN;
const Tgfancy = require("tgfancy");
const bot = new Tgfancy(TOKEN);
const fs = require('fs');
const name = process.env.position;
const js = process.env.selector;
const url = process.env.url;

function launchChrome(headless=true) {
  return chromeLauncher.launch({
    chromeFlags: [
      '--window-size=1920,1080',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-cache',
      headless ? '--headless' : ''
    ]
  });
}

launchChrome().then(chrome => {
  console.log(`Chrome debuggable on port: ${chrome.port}`);
  setTimeoutPromise(8000, 'foobar').then((value) => {
    chrome.kill();
  });
});

(async function() {

const chrome = await launchChrome();
const protocol = await CDP({port: chrome.port});

// Extract the DevTools protocol domains we need and enable them.
// See API docs: https://chromedevtools.github.io/devtools-protocol/
const {Page, Runtime} = protocol;
await Promise.all([Page.enable(), Runtime.enable()]);

Page.navigate({url: url});
// Wait for window.onload before doing stuff.
Page.loadEventFired(async () => {

  // Evaluate the JS expression in the page.
  const result = await Runtime.evaluate({expression: js});
  console.log(result);
  console.log(url);
  console.log(js);
//    const {data} = await Page.captureScreenshot();
//            fs.writeFileSync('scrot.png', Buffer.from(data, 'base64'));

  console.log('Text retrieved: ' + result.result.value);

 
  bot.sendMessage(859059312, `${name} price=${result.result.value}`);

  chrome.kill(); // Kill Chrome.
  protocol.close();

});

})();
const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
const TOKEN = process.env.TELEGRAM_TOKEN || '1153590222:AAEj_D-qcD0NeCreCOIjhh6OoVeusUD0zvI';
// const TelegramBot = require('node-telegram-bot-api');
// const bot = new TelegramBot(TOKEN, {polling: true});
const Tgfancy = require("tgfancy");
const bot = new Tgfancy(TOKEN, 
// {
    // all options to 'tgfancy' MUST be placed under the
    // 'tgfancy' key, as shown below
    // tgfancy: {
    //     option: "value",
    // },
// }
);
const name = "'Zeetex HP2000 VFM 215/55 R17 98 W XL'";
const js = `$("div a[title=${name}]").parent().parent().parent().parent().find('.details.right > .shopping > .buy > .price > span.price.size-3').text()`;
const url = 'https://www.oponeo.pl/wybierz-opony/s=1/letnie/r=1/215-55-r17';

// bot.setWebHook(`${url}/bot${TOKEN}`);

function launchChrome(headless=true) {
  return chromeLauncher.launch({
    // port: 9222, // Uncomment to force a specific port of your choice.
    chromeFlags: [
      '--window-size=412,732',
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
    // value === 'foobar' (passing values is optional)
    // This is executed after about 40 milliseconds.
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

  console.log('Text retrieved: ' + result.result.value);

  // bot.on('message', function onMessage(msg) {
  //   bot.sendMessage(msg.chat.id, result.result.value);
  //   console.log(msg.chat.id);
  // });
  bot.sendMessage(859059312, `${name} price=${result.result.value}`);

  chrome.kill(); // Kill Chrome.
  protocol.close();
  
});

})();
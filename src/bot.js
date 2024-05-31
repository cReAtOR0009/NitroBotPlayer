require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Client, GatewayIntentBits, Routes } = require("discord.js");

const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());

//create new client for discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// console.log("this is the DISCORD_BOT_TOKEN",process.env.DISCORD_BOT_TOKEN)

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    console.log("interaction is chat input command");
    console.log(interaction.options);
    let username = interaction.options.getString("username");
    let password = interaction.options.getString("password");
    let typingSpeed = interaction.options.getString("typing-speed");
    let playTimes = interaction.options.getString("play-times");
    console.log(username);
    console.log(password);
    // console.log(interaction.options.get("username").value);
    interaction.reply({
      content: `hello @${
        interaction.options.get("username").value
      } you've started a login process to Nitro`,
    });
    try {
      await startGame(username, password, typingSpeed, playTimes);
    } catch (error) {}
  }
}); 

let browser;

class BrowserManager {
  constructor() {
    this.browser = null;
  }

  async initializeBrowser() {
    this.browser = await puppeteer.launch({ headless: true });
    console.log("Browser initialized");
  }

  async createNewPage() {
    if (this.browser == null) {
      return await this.initializeBrowser();
    } else {
      return await this.browser.newPage();
    }
    // return await this.browser.newPage();
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
// let browserManager
let browserManager = new BrowserManager();

const initializeBrowserManager = async () => {
  try {
    await browserManager.createNewPage();
    return browserManager;
  } catch (error) {
    console.error("Error initializing browser manager:", error);
    // Retry initialization after a delay (optional)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return initializeBrowserManager(); // Call itself recursively
  }
};
const Startbrowser = initializeBrowserManager()

async function startGame(username, password, typingSpeed, playTimes) {
  let page;
  try {
    const formattedUsername = username;
    const formattedPassword = password; 
    const browserManager = await Startbrowser;  

    // Create a new page
    const page = await browserManager.createNewPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );
    //set up view port
    await page.setViewport({ width: 1080, height: 740 });

    await page.goto("https://www.nitrotype.com", { timeout: 120000 });

    const loginBtn = ".header-login";
    let headerLogin;

    try {
      headerLogin = await page.waitForSelector(loginBtn, { timeout: 30000 });
    } catch (error) {
      console.error("Header login button not found:", error);
    }

    if (headerLogin) {
      await page.click(loginBtn);
      await page.waitForSelector("#username", { timeout: 60000 });
      await page.waitForSelector("#password", { timeout: 60000 });

      await page.type("#username", username, { delay: 105 });
      await page.type("#password", password, { delay: 125 });
    }

    await page.waitForSelector(".btn--primary", { timeout: 60000 });
    await page.click(".btn--primary");

    const inner = await page.$eval(".btn--primary", (element) => element.textContent);
    console.log(inner);

    for (let index = 0; index < playTimes; index + 1) {
      try {
        // btn btn--light btn--fw modal-close
        const selector = "btn btn--primary btn--fw";
        const elementExists = await page.evaluate((sel) => {
          return document.querySelector(sel) !== null;
        }, selector);
        const modal = "modal-close";
        const checkForModal = await page.evaluate((sel) => {
            return document.querySelector(sel) !== null;
        }, modal);
        console.log(elementExists);

        if (elementExists) {
          console.log(elementExists);
          await page.click(selector);
        } else if(checkForModal) {
          await page.click(checkForModal);
        }  
        //  else if () {

        // }

        await page.waitForSelector(".g-b--2of12");
        await page.click(".g-b--2of12");
        console.log("starting race...");
        index++;
      } catch (error) {
        console.error("First selector not found or timed out.");

        try {
          // If the first selector is not found or times out, wait for the second selector as a fallback
          await page.waitForSelector(".animate--iconSlam", {
            timeout: 5000,
          });
          await page.click(".animate--iconSlam");
          console.log("starting race with button 2...");
          // Adjust the timeout as needed
        } catch (error) {
          console.log(error);
          console.error("Second selector not found or timed out.");
        }
      }
      await page.waitForSelector(".g-b--2of12");
        await page.click(".g-b--2of12");
      await page.waitForSelector(".dash-content", {
        timeout: 325000,
      });
      await page.waitForSelector(".racev3-ui", {
        timeout: 5000,
      });

      let innDash;
      let errorTimes = 0;
      const maxRetries = 30;

      async function processDashCopy(page, typingSpeed, playTimes, index, client) {
        // Use page.$eval to retrieve the inner HTML of an element with class "dash-copy"
        innDash = await page.$eval(".dash-copy", (element) => element.innerHTML);
      
        if (typeof innDash !== "undefined") {
          const dashNames = await page.$$eval(".dash-word", (elements) => {
            return elements.map((element) => element.textContent);
          });
      
          const trimmedArray = dashNames.map((word, index, array) => {
            const trimmedWord = word.trim();
            if (index === array.length - 1) {
              return trimmedWord + ".";
            } else {
              return trimmedWord;
            }
          });
      
          const wordsPerSecond = typingSpeed / 60; // Convert WPM to words per second
          const typingDelayMilliseconds = 1000 / wordsPerSecond; // Delay in milliseconds between typing each word
          console.log(trimmedArray);
      
          const element = await page.waitForSelector(".is-racing");
      
          for (const value of trimmedArray) {
            await page.type(".dash-copyContainer", value);
            await page.keyboard.type(" ");
            await page.waitForTimeout(typingDelayMilliseconds);
          } 
      
          index++;
          console.log(index);
          console.log(`${playTimes - index} times left for play`);
      
          let infoChannel = client.channels.cache.get(process.env.INFO_CHANEL);
          infoChannel.send(`you have ${playTimes - index} rounds left to play`);
      
          if (playTimes - index === 0) {
            console.log("rounds exhausted");
            infoChannel.send(
              `you have ${playTimes - index} rounds left to play, your  session just ended`
            );
            await page.close();
            return false; // Indicates no more rounds left
          }
        }
        return true; // Indicates that there are more rounds left
      }

      while (typeof innDash === "undefined") {
        try {
          const continuePlaying = await processDashCopy(page, typingSpeed, playTimes, index, client);
          if (!continuePlaying) break;
        } catch (error) {
          errorTimes++;
          if (errorTimes >= maxRetries) {
            let errorChannel = client.channels.cache.get(process.env.ERROR_CHANEL);
            errorChannel.send(`Error: ${error.message} + ${errorTimes}`);
            await page.close();
            throw new Error("taking unusual time to find .dash-copy element");
          }
          console.log(error);
          console.log(errorTimes);
          let errorChannel = client.channels.cache.get(process.env.ERROR_CHANEL);
          errorChannel.send(`Error: ${error.message} + ${errorTimes}`);
        }
        // Add a short delay between retries (e.g., 1 second)
        await page.waitForTimeout(700);
      }
    }
  } catch (error) {
    console.log(error);
    let errorChannel = client.channels.cache.get(process.env.ERROR_CHANEL);
    errorChannel.send(`${error.message};`);
    // await browser.close();
    //   return message.reply(`${message.author} ${error}`);
  }
}

// startGame("M12347", "M12347@", "150", "10");
 
client.login(process.env.DISCORD_BOT_TOKEN);

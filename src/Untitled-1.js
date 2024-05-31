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
    this.browser = await puppeteer.launch({ headless: false });
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

async function startGame(username, password, typingSpeed, playTimes) {

  try {
    const formattedUsername = username;
    const formattedPassword = password;

    const browserManager = await initializeBrowserManager();

    // Create a new page
    const page = await browserManager.createNewPage();
    //set browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    await page.setViewport({ width: 2080, height: 1024 });

    await page.goto("https://www.nitrotype.com", { timeout: 120000 });

    const loginBtn = ".header-login";

    await page.waitForSelector(loginBtn);
    await page.click(loginBtn);

    await page.waitForSelector("#username", { timeout: 60000 });
    await page.waitForSelector("#password", { timeout: 60000 });

    await page.type("#username", formattedUsername, { delay: 105 });
    await page.type("#password", formattedPassword, { delay: 125 });
    await page.waitForSelector(".btn--primary");
    await page.click(".btn--primary");

    const inner = await page.$eval(".btn--primary", (element) => {
      return element.textContent;
    });
    // console.log(inner);

    async function handlePlayTimes(page, typingSpeed, playTimes) {
      for (let index = 0; index < playTimes; index++) {
        try {
          const selector = "btn btn--primary btn--fw";
          const elementExists = await page.evaluate((sel) => {
            return document.querySelector(sel) !== null;
          }, selector);
    
          if (elementExists) {
            await page.click(selector);
          } else {
            // If element does not exist, wait for 10 seconds
            await page.waitForTimeout(10000);
          }
    
          await page.waitForSelector(".g-b--2of12");
          await page.click(".g-b--2of12");
          console.log("starting race...");
          index++;
        } catch (error) {
          console.error("First selector not found or timed out.");
    
          // If 1st selector is not found, check for the second selector
          if (error.message.includes(selector)) {
            console.log("Checking to use the second selector");
            try {
              // Wait for the second selector as a fallback
              await page.waitForSelector(".animate--iconSlam", { timeout: 5000 });
              await page.click(".animate--iconSlam");
              console.log("Starting race with button 2...");
              // Adjust the timeout as needed
            } catch (error) {
              console.error("Second selector not found or timed out.");
            }
          }
        }
    
        await page.waitForSelector(".dash-content", { timeout: 325000 });
        await page.waitForSelector(".racev3-ui", { timeout: 5000 });
    
        let innDash;
        let errorTimes = 0;
    
        while (typeof innDash === "undefined") {
          try {
            // Retrieve the inner HTML of an element with class "dash-copy"
            innDash = await page.$eval(".dash-copy", (element) => element.innerHTML);
    
            if (typeof innDash !== "undefined") {
              // Retrieve text content of elements with class "dash-word"
              const dashNames = await page.$$eval(".dash-word", (elements) => {
                return elements.map((element) => element.textContent);
              });
    
              // Trim whitespace from words and add punctuation to the last word
              const trimmedArray = dashNames.map((word, index, array) => {
                const trimmedWord = word.trim();
                return index === array.length - 1 ? trimmedWord + "." : trimmedWord;
              });
    
              // Calculate typing speed and delay between typing each word
              const wordsPerSecond = typingSpeed / 60;
              const typingDelayMilliseconds = 1000 / wordsPerSecond;
    
              // Output trimmed word array to console
              console.log(trimmedArray);
    
              // Wait for element with class "is-racing" to appear
              await page.waitForSelector(".is-racing");
    
              // Type each word with a delay between typings
              for (const value of trimmedArray) {
                if (trimmedArray.length - 1) await page.type(".dash-copyContainer", value);
                await page.keyboard.type(" ");
                await page.waitForTimeout(typingDelayMilliseconds);
              }
    
              // Output index and remaining play times to console
              console.log(index);
              console.log(`${playTimes - index} times left for play`);
    
              // Send message to info channel about remaining play times
              let infoChannel = client.channels.cache.get(process.env.INFO_CHANEL);
              infoChannel.send(`you have ${playTimes - index} rounds left to play`);
    
              // Close page if all play times are exhausted
              if (playTimes - index === 0) {
                console.log("Rounds exhausted");
                infoChannel.send(`You have ${playTimes - index} rounds left to play closing browser`);
                return await page.close();
              }
            }
          } catch (error) {
            // Catch errors and handle them
            errorTimes++;
            if (errorTimes === 30) {
              // Close page and throw error if unusual time is taken to find ".dash-copy" element
              await page.close();
              throw new Error("Taking unusual time to find .dash-copy element");
            }
            // Output error and error times to console
            console.error(error);
            console.log(errorTimes);
            // Send error message to error channel
            let errorChannel = client.channels.cache.get(process.env.ERROR_CHANEL);
            errorChannel.send(`Error: ${error.message} + ${errorTimes}`);
          }
    
          // Add a short delay between retries
          await page.waitForTimeout(700);
        }
      }
    }
    handlePlayTimes()
    
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

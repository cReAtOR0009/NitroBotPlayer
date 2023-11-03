require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Client, GatewayIntentBits, Routes } = require("discord.js");

const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());
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

async function initializeBrowser() {
  browser = await puppeteer.launch({ headless: true });
  console.log("Browser initialized");
}

// initialize the browser when the server starts
async function browserIsStart() {
  if (!browser) {
    await initializeBrowser();
  }
}
browserIsStart();

async function startGame(username, password, typingSpeed, playTimes) {
  try {
    const formattedUsername = username;
    const formattedPassword = password;

    // const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
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
    console.log(inner);

    for (let index = 0; index < playTimes; index + 1) {
      try {
        // btn btn--light btn--fw
        const selector = "btn btn--primary btn--fw";
        const elementExists = await page.evaluate((sel) => {
          return document.querySelector(sel) !== null;
        }, selector);
        console.log(elementExists);

        if (elementExists) {
          console.log(elementExists);
          await page.click(selector);
        } else {
        }

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

      await page.waitForSelector(".dash-content", {
        timeout: 325000,
      });
      await page.waitForSelector(".racev3-ui", {
        timeout: 5000,
      });
      let innDash;
      let errorTimes = 0;
      while (typeof innDash === "undefined") {
        try {
          // Use page.$eval to retrieve the inner HTML of an element with class "dash-copy"
          innDash = await page.$eval(
            ".dash-copy",
            (element) => element.innerHTML
          );

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

            element = await page.waitForSelector(".is-racing");
            // console.log(element);

            for (const value of trimmedArray) {
              if (trimmedArray.length - 1)
                await page.type(".dash-copyContainer", value);
              await page.keyboard.type(" ");
              await page.waitForTimeout(typingDelayMilliseconds);
            }
            // index++;
            console.log(index);
            console.log(`${playTimes - index} times left for play`);

            let infoChannel = client.channels.cache.get(process.env.INFO_CHANEL);
            infoChannel.send(`you have ${playTimes - index} rounds left to play`);

            if (playTimes - index == 0) {
              console.log("rounds exhausted");
              infoChannel.send(`you have ${playTimes- index} rounds left to play closing browser`);
              return await page.close();
            }
          }
        } catch (error) {
          errorTimes++;
          if (errorTimes == 22) {
            // let errorChannel = client.channels.cache.get(process.env.ERROR_CHANEL);
            // errorChannel.send(`Error: ${error.message} + ${errorTimes}`);
            await page.close();
            throw new Error ("taking unusual time to find .dash-copy element")
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

client.login(process.env.DISCORD_BOT_TOKEN);

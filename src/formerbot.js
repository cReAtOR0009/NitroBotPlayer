// async function main() {
//   const command = [
//     {
//       name: "future",
//       description: "kindly include your credentials",
//       options: [
//         {
//           name: "username",
//           description: "pls input your username",
//           type: 3,
//           required: true,
//         },
//         {
//             name: "password",
//             description: "pls input your password",
//             type: 3,
//             required: true,
//           },
//           {
//             name: "typing-speed",
//             description: "pls input desired typing speed",
//             type: 3,
//             required: true,
//           },
//           {
//             name: "play-times",
//             description: "how many rounds would you like to play",
//             type: 3,
//             required: true,
//           }
//       ],
//     },
//   ];
//   try {
//     console.log("started refreshing application guild command");
//     await rest.put(
//       Routes.applicationGuildCommands(
//         process.env.APPLICATION_ID,
//         process.env.GUILD_ID
//       ),
//       {
//         body: command,
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// }
// main();

// async () => {
//   try {
//     // message.reply(`${message.author} just initiated a login`);

//     await message.reply(`${message.author} login to Nitro initiated`);

//     const formattedUsername = username.substring(1);
//     const formattedPassword = password.substring(1);

//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//     await page.goto("https://www.nitrotype.com", { timeout: 120000 });
//     await page.setViewport({ width: 2080, height: 1024 });

//     const loginBtn = ".header-login";
//     const googleLoginBtn = ".btn--google";

//     await page.waitForSelector(loginBtn);
//     await page.click(loginBtn);

//     await page.waitForSelector("#username", { timeout: 60000 });
//     await page.waitForSelector("#password", { timeout: 60000 });

//     await page.type("#username", formattedUsername, { delay: 105 });
//     await page.type("#password", formattedPassword, { delay: 105 });
//     await page.waitForSelector(".btn--primary");
//     await page.click(".btn--primary");

//     const inner = await page.$eval(".btn--primary", (element) => {
//       return element.textContent;
//     });
//     console.log(inner);
//     let playTimes = 1000;

//     for (let index = 0; index < playTimes; index++) {
//       try {
//         // Wait for the first selector
//         // await page.waitForSelector('.g-b--2of12', { timeout: 5000 }); // Adjust the timeout as needed
//         await page.waitForSelector(".g-b--2of12");
//         await page.click(".g-b--2of12");
//         console.log("starting race...");
//       } catch (error) {
//         console.error("First selector not found or timed out.");

//         try {
//           // If the first selector is not found or times out, wait for the second selector as a fallback
//           await page.waitForSelector(".animate--iconSlam", {
//             timeout: 5000,
//           });
//           await page.click(".animate--iconSlam");
//           console.log("starting race with button 2...");
//           // Adjust the timeout as needed
//         } catch (error) {
//           console.error("Second selector not found or timed out.");
//         }
//       }

//       await page.waitForSelector(".dash-content");
//       await page.waitForSelector(".racev3-ui");
//       // const innerDash = await page.$eval(
//       //   ".dash-content",
//       //   (element) => element.innerHTML
//       // );
//       let innDash;

//       while (typeof innDash === "undefined") {
//         let errorTimes = 0;
//         try {
//           // Use page.$eval to retrieve the inner HTML of an element with class "dash-copy"
//           innDash = await page.$eval(
//             ".dash-copy",
//             (element) => element.innerHTML
//           );
 
//           if (typeof innDash !== "undefined") {
//             const dashNames = await page.$$eval(".dash-word", (elements) => {
//               return elements.map((element) => element.textContent);
//             }); 

//             const trimmedArray = dashNames.map((word, index, array) => {
//               const trimmedWord = word.trim();
//               if (index === array.length - 1) {
//                 return trimmedWord + ".";
//               } else {
//                 return trimmedWord;
//               }
//             });

//             await page.waitForTimeout(5000);
//             for (const value of trimmedArray) {
//               if (trimmedArray.length - 1)
//                 await page.type(".dash-copyContainer", value);
//               await page.keyboard.type(" ");
//               await page.waitForTimeout(500);
//             }
//             //   await page.waitForTimeout(5000);
//             innDash = await page.$eval(
//               ".dash-copy",
//               (element) => element.innerHTML
//             );
//             index++;
//           }
//         } catch (error) {
//           errorTimes++;
//           console.log(errorTimes);
//           console.error("An error occurred:", error.message);

//           if (errorTimes > 15) {
//             console.log("more than 15 errors");
//             try {
//               for (let index2 = 0; index2 < playTimes; index2++) {
//                 await page.waitForSelector(".aniamte--iconSlam");
//                 await page.click(".aniamte--iconSlam");
//                 console.log(
//                   "attempting to find aniamte--iconSlam button  after dash copy selctor not found error is graeter than 10 First selector not found or timed out."
//                 );

//                 const dashNames = await page.$$eval(
//                   ".dash-word",
//                   (elements) => {
//                     return elements.map((element) => element.textContent);
//                   }
//                 );

//                 const trimmedArray = dashNames.map((word, index, array) => {
//                   const trimmedWord = word.trim();
//                   if (index === array.length - 1) {
//                     return trimmedWord + ".";
//                   } else {
//                     return trimmedWord;
//                   }
//                 });

//                 await page.waitForTimeout(5000);
//                 for (const value of trimmedArray) {
//                   if (trimmedArray.length - 1)
//                     await page.type(".dash-copyContainer", value);
//                   await page.keyboard.type(" ");
//                   await page.waitForTimeout(500);
//                 }

//                 index2++;
//               }
//             } catch (error) {
//               console.error("error playing game at second round");
//             }
//           }
//         }

//         // Add a short delay between retries (e.g., 1 second)
//         await page.waitForTimeout(500);
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     // await browser.close();
//     return message.reply(`${message.author} ${error}`);
//   }
// };

// client.on("messageCreate", async (message) => {
//   const [CMD_NAME, ...credentialsArray] = message.content
//     .trim()
//     .substring(PREFIX.length)
//     .split(/\s+/);

// try {
//     // message.reply(`${message.author} just initiated a login`);

//       await message.reply(`${message.author} login to Nitro initiated`);

//       const formattedUsername = username.substring(1);
//       const formattedPassword = password.substring(1);

//       const browser = await puppeteer.launch({ headless: false });
//       const page = await browser.newPage();
//       await page.goto("https://www.nitrotype.com", { timeout: 120000 });
//       await page.setViewport({ width: 2080, height: 1024 });

//       const loginBtn = ".header-login";
//       const googleLoginBtn = ".btn--google";

//       await page.waitForSelector(loginBtn);
//       await page.click(loginBtn);

//       await page.waitForSelector("#username", { timeout: 60000 });
//       await page.waitForSelector("#password", { timeout: 60000 });

//       await page.type("#username", formattedUsername, { delay: 105 });
//       await page.type("#password", formattedPassword, { delay: 105 });
//       await page.waitForSelector(".btn--primary");
//       await page.click(".btn--primary");

//       const inner = await page.$eval(".btn--primary", (element) => {
//         return element.textContent;
//       });
//       console.log(inner);
//       let playTimes = 1000;

//       for (let index = 0; index < playTimes; index++) {
//         try {
//           // Wait for the first selector
//           // await page.waitForSelector('.g-b--2of12', { timeout: 5000 }); // Adjust the timeout as needed
//           await page.waitForSelector(".g-b--2of12");
//           await page.click(".g-b--2of12");
//           console.log("starting race...");
//         } catch (error) {
//           console.error("First selector not found or timed out.");

//           try {
//             // If the first selector is not found or times out, wait for the second selector as a fallback
//             await page.waitForSelector(".animate--iconSlam", {
//               timeout: 5000,
//             });
//             await page.click(".animate--iconSlam");
//             console.log("starting race with button 2...");
//             // Adjust the timeout as needed
//           } catch (error) {
//             console.error("Second selector not found or timed out.");
//           }
//         }

//         await page.waitForSelector(".dash-content");
//         await page.waitForSelector(".racev3-ui");
//         // const innerDash = await page.$eval(
//         //   ".dash-content",
//         //   (element) => element.innerHTML
//         // );
//         let innDash;

//         while (typeof innDash === "undefined") {
//           let errorTimes = 0;
//           try {
//             // Use page.$eval to retrieve the inner HTML of an element with class "dash-copy"
//             innDash = await page.$eval(
//               ".dash-copy",
//               (element) => element.innerHTML
//             );

//             if (typeof innDash !== "undefined") {
//               const dashNames = await page.$$eval(
//                 ".dash-word",
//                 (elements) => {
//                   return elements.map((element) => element.textContent);
//                 }
//               );

//               const trimmedArray = dashNames.map((word, index, array) => {
//                 const trimmedWord = word.trim();
//                 if (index === array.length - 1) {
//                   return trimmedWord + ".";
//                 } else {
//                   return trimmedWord;
//                 }
//               });

//               await page.waitForTimeout(5000);
//               for (const value of trimmedArray) {
//                 if (trimmedArray.length - 1)
//                   await page.type(".dash-copyContainer", value);
//                 await page.keyboard.type(" ");
//                 await page.waitForTimeout(500);
//               }
//               //   await page.waitForTimeout(5000);
//               innDash = await page.$eval(
//                 ".dash-copy",
//                 (element) => element.innerHTML
//               );
//               index++;
//             }
//           } catch (error) {
//             errorTimes++;
//             console.log(errorTimes);
//             console.error("An error occurred:", error.message);

//             if (errorTimes > 15) {
//               console.log("more than 15 errors");
//               try {
//                 for (let index2 = 0; index2 < playTimes; index2++) {
//                   await page.waitForSelector(".aniamte--iconSlam");
//                   await page.click(".aniamte--iconSlam");
//                   console.log(
//                     "attempting to find aniamte--iconSlam button  after dash copy selctor not found error is graeter than 10 First selector not found or timed out."
//                   );

//                   const dashNames = await page.$$eval(
//                     ".dash-word",
//                     (elements) => {
//                       return elements.map((element) => element.textContent);
//                     }
//                   );

//                   const trimmedArray = dashNames.map(
//                     (word, index, array) => {
//                       const trimmedWord = word.trim();
//                       if (index === array.length - 1) {
//                         return trimmedWord + ".";
//                       } else {
//                         return trimmedWord;
//                       }
//                     }
//                   );

//                   await page.waitForTimeout(5000);
//                   for (const value of trimmedArray) {
//                     if (trimmedArray.length - 1)
//                       await page.type(".dash-copyContainer", value);
//                     await page.keyboard.type(" ");
//                     await page.waitForTimeout(500);
//                   }

//                   index2++;
//                 }
//               } catch (error) {
//                 console.error("error playing game at second round");
//               }
//             }
//           }

//           // Add a short delay between retries (e.g., 1 second)
//           await page.waitForTimeout(500);
//         }
//       }

// } catch (error) {
//   console.log(error);
//   // await browser.close();
//   return message.reply(`${message.author} ${error}`);
// }

//   console.log(message.channel);
//   console.log(message.guild);
// });

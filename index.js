require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const EosApi = require('eosjs-api');

let isRam = true;
// Enough for at least one transaction
const mimimumRamRequired = 800;

// Main EOS
const rcpOptions = {
  httpEndpoint: 'https://eos.greymass.com:443', // default, null for cold-storage
  verbose: false, // API logging
  logger: {
    // Default logging functions
    log: console.log,
    error: console.error
  },
  fetchConfiguration: {},
};

const eosApi = EosApi(rcpOptions);

const checkRam = async (reportChannel) => {
  const yupAccountInfo = await eosApi.getAccount('yupyupyupyup');
  console.log(yupAccountInfo.ram_quota - yupAccountInfo.ram_usage);

  if ((yupAccountInfo.ram_quota - yupAccountInfo.ram_usage) < mimimumRamRequired) {
    if (isRam) {
      reportChannel.send('YUP RAM has exhausted, voting transactions will not work.');
    }
    isRam = false;
  } else {
    if (!isRam) {
      reportChannel.send('YUP now has RAM, voting transactions will work.');
    }
    isRam = true;
  }

}

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  // 45 sec check so I wont get banned by GrayMass and waste CPU on bot hosting account
  const ramChannel = bot.channels.find("name", "eos-ram-check")
  if (ramChannel) {
    const intervalObj = setInterval(() => {
      checkRam(ramChannel);
    }, 45000);
  }
});



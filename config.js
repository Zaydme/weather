require("dotenv").config();

module.exports = {
  translator: {
    engine: "yandex",
    key: process.env.YANDEX_API
  },

  yahooApi: {
    app_id: process.env.YAHOO_APP_ID,
    consumerKey: process.env.YAHOO_CONSUMER_KEY,
    consumerSecret: process.env.YAHOO_CONSUMER_SECRET
  }
};

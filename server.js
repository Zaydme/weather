const express = require("express");
const request = require("request-promise");
const qs = require("querystring");
const extend = require("jquery-extend");
const geoip = require('geoip-lite');
const CryptoJS = require("crypto-js");
const translate = require('translate')
const config = require('./config')
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
translate.engine = config.translator.engine;
translate.key = config.translator.key


/* ROUTES */
app.get("/", async function(req, res) {
    return res.redirect("/en");
});


app.get("/:lang", async function(req, res) {
  if (!req.params.lang || !["ar","fr","en","es"].includes(req.params.lang)) return res.redirect("/en")
  
  let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].trim();
  let geo = await geoip.lookup(ip);

  let data = await getWeather(`${geo.city},${geo.country}`,"c");
  console.log(JSON.stringify(data))
  let imageKeyword = data.current_observation.condition.text.split(' ').join(',') + ","+data.city+ ","+data.country

  /* forecasts 7 days */ 
  data.forecasts = data.forecasts.slice(0,6) //keep 7 days.
  await data.forecasts.forEach(async day=>{
    day.icon = weatherIcon(day.code);
    day.date = new Date(day.date*1000).toLocaleString('en-US', {
      weekday: 'long',
      day: 'numeric'
    })
    if(req.params.lang != "en"){
     day.text = await translate(day.text, req.params.lang);
     day.date = await translate(day.date, req.params.lang);

     }
  })
  console.log(data.forecasts)
  
  if(req.params.lang != "en"){
  data.location.city = await translate(data.location.city, req.params.lang);
  data.location.region = await translate(data.location.region, req.params.lang);
  data.location.country = await translate(data.location.country, req.params.lang);
  data.current_observation.condition.text = await translate(data.current_observation.condition.text, req.params.lang);
  }
  return res.render("index", {data: data ,img:imageKeyword,lang:req.params.lang});
});





const listener = app.listen(process.env.PORT, function() {
  console.log("listening on port " + listener.address().port);
});







/*   CONNECTION TO WEATHER API   */


var url = "https://weather-ydn-yql.media.yahoo.com/forecastrss";
var method = "GET";
var app_id = config.yahooApi.app_id;
var consumer_key = config.yahooApi.consumerKey;
var consumer_secret = config.yahooApi.consumerSecret;
var concat = "&";

async function getWeather(city,unit="c") {
  var query = { location: city,u:unit, format: "json" };
var oauth = {
  oauth_consumer_key: consumer_key,
  oauth_nonce: Math.random()
    .toString(36)
    .substring(2),
  oauth_signature_method: "HMAC-SHA1",
  oauth_timestamp: parseInt(new Date().getTime() / 1000).toString(),
  oauth_version: "1.0"
};
  var merged = {};
  extend(merged, query, oauth);
  // Note the sorting here is required
  var merged_arr = Object.keys(merged)
    .sort()
    .map(function(k) {
      return [k + "=" + encodeURIComponent(merged[k])];
    });
  var signature_base_str =
    method +
    concat +
    encodeURIComponent(url) +
    concat +
    encodeURIComponent(merged_arr.join(concat));

  var composite_key = encodeURIComponent(consumer_secret) + concat;
  var hash = CryptoJS.HmacSHA1(signature_base_str, composite_key);
  var signature = hash.toString(CryptoJS.enc.Base64);

  oauth["oauth_signature"] = signature;
  var auth_header =
    "OAuth " +
    Object.keys(oauth)
      .map(function(k) {
        return [k + '="' + oauth[k] + '"'];
      })
      .join(",");

  var data = [];
  let results;
  let uselessVariable = await request
    .get({
      url: url + "?" + qs.stringify(query),
      headers: {
        Authorization: auth_header,
        "X-Yahoo-App-Id": app_id
      },
      method: "GET"
    })
    .on("response", function(data) {})
    .on("data", function(chunk) {
      data.push(chunk);
    })
    .on("end", function() {
      var result = JSON.parse(data.join(""));
      results = result;
    });
  return results;
}


/* GETING THE GOOD ICON FOR THE WEATHER CONDITION*/
function weatherIcon(condCode){
  		let condIcon;

		switch ( condCode ) {
			case 0:
				condIcon = 'tornado';
				break;

			case 1:
				condIcon = 'tornado';
				break;

			case 2:
				condIcon = 'hurricane';
				break;

			case 3:
			case 4:
				condIcon = 'day-thunderstorm';
				break;

			case 5:
			case 6:
			case 7:
				condIcon = 'rain-mix';
				break;

			case 8:
			case 9:
				condIcon = 'showers';
				break;

			case 10:
			case 11:
			case 12:
				condIcon = 'rain';
				break;

			case 13:
			case 14:
			case 15:
			case 16:
				condIcon = 'snow';
				break;

			case 17:
			case 18:
				condIcon = 'hail';
				break;

			case 19:
				condIcon = 'dust';
				break;

			case 20:
			case 21:
				condIcon = 'fog';
				break;

			case 22:
				condIcon = 'smoke';
				break;

			case 23:
			case 24:
				condIcon = 'windy';
				break;

			case 25:
				condIcon = 'snowflake-cold';
				break;

			case 26:
				condIcon = 'cloudy';
				break;

			case 27:
			case 29:
				condIcon = 'night-cloudy';
				break;

			case 28:
			case 30:
				condIcon = 'day-cloudy';
				break;

			case 31:
				condIcon = 'night-clear';
				break;

			case 32:
				condIcon = 'day-sunny';
				break;

			case 33:
				condIcon = 'stars';
				break;

			case 34:
				condIcon = 'sunny';
				break;

			case 35:
				condIcon = 'rain-mix';
				break;

			case 36:
				condIcon = 'hot';
				break;

			case 37:
			case 38:
			case 39:
				condIcon = 'thunderstorm';
				break;

			case 40:
				condIcon = 'sprinkles';
				break;

			case 41:
			case 42:
				condIcon = 'snow';
				break;

			case 44:
				condIcon = 'day-cloudy';
				break;

			case 45:
				condIcon = 'thundershower';
				break;

			case 46:
				condIcon = 'snow';
				break;

			case 47:
				condIcon = 'storm-showers';
				break;

			case 3200:
				condIcon = 'thermometer-exterior';
				break;

			default:
				condIcon = 'thermometer-exterior';
		}

		condIcon = 'wi-' + condIcon;
  return condIcon
}

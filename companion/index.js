import { geolocation } from "geolocation";
import { settingsStorage } from "settings";
import * as messaging from "messaging";

function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
}

// Listen for the onopen event, get location and then get related articles
messaging.peerSocket.onopen = function() {
  geolocation.getCurrentPosition(getNearbyArticles, locationError, {
    timeout: 60 * 1000
  });
}

function getNearbyArticles(position) {
  /* Get Wikipedia articles close to the given position */

  // Parse language setting and construct URL
  var language = getLanguageFromSettings();

  // Get URL based on position and language
  var url = getURL(position, language);

  fetch(url)
      .then(function(response) {
          return response.json();
      })
      .then(function(response) {
          // Iterate over list to build list of articles with relevant fields
          // Only pick necessary fields in order to minimize the message size
          var index = 1;
          for (var key in response.query.pages) {
            var page = response.query.pages[key];
            var responseDict = {
              'index': index,
              'title': page['title'],
              'extract': page['extract']
            };
            if (messaging.peerSocket.readyState == messaging.peerSocket.OPEN) {
                messaging.peerSocket.send(responseDict);
                console.log("Send message");
            } else {
                console.error('PeerSocket not open');
            }

            index++;
          }
      })
      .catch(function(error){console.log(error);});

}

function getLanguageFromSettings() {

  const languageSetting = JSON.parse(settingsStorage.getItem("language"));

  // If no langauge is set put English as default, otherwise parse it from the settings
  var language = languageSetting == null ? 'en' : languageSetting["values"][0]["value"];

  return language;
}

function getURL(position, language) {

  var url = "https://" + language + ".wikipedia.org/w/api.php?";

  // API Documentation:
  // https://www.mediawiki.org/wiki/API:Main_page
  var params = {
      action: "query",
      redirects: "1",
      generator: "geosearch",
      prop: "extracts",
      ggscoord: position.coords.latitude  + "|" + position.coords.longitude,
      ggsradius: "1000",
      ggslimit: "5",
      format: "json",
      exintro: 1,
      // Only get 5 sentences, as the message size in companion->app is anyways limited
      exsentences: 5,
      explaintext: 1,
  };

  // Construct URL based on the base URL and parameters
  Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

  return url;

}


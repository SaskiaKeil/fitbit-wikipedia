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
          // If no articles are found return with the content for the first tab
          if ((response.hasOwnProperty("query") === false) || (response.query.hasOwnProperty("pages") === false)) {
            var responseDict = {
              'index': 1,
              'title': 'No data available.',
              'extract': 'Probably there are no other articles available in 5km distance of your location.'
            };
            messaging.peerSocket.send(responseDict);
          }

          // Iterate over list to build list of articles with relevant fields
          // Only pick necessary fields in order to minimize the message size
          var index = 1;
          for (var key in response.query.pages) {
            var page = response.query.pages[key];
            var responseDict = {
              'index': index,
              'title': page['title'],
              // In total our message can only have 1027 bytes, so we slice it down and leave some space for index and title
              // Reference: https://dev.fitbit.com/build/guides/communications/messaging/#maximum-message-size
              'extract': page['extract'].slice(0, 900)
            };
            if (messaging.peerSocket.readyState == messaging.peerSocket.OPEN) {
                messaging.peerSocket.send(responseDict);
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

  // If no language is set put English as default, otherwise parse it from the settings
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
      ggsradius: "5000",
      ggslimit: "10",
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


/*
 * Entry point for the watch app
 */
import document from "document";
import * as messaging from "messaging";


function initialize() {
    //Set default screen with some meesage and instruction ( something better than nothing)
  var index = 1;
  var article = document.getElementById("article_" + index);
  var extract = article.getElementsByClassName("extract")[0];
  var title = article.getElementsByClassName("title")[0];
  
  title.text = "Loading now .... ";
  extract.text = "Getting latest data for you ⌛ \n\nMake sure your Internet is On ✔ \nand \nLocation access is granted to fitbit app on phone ⚙.";
}
// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {

  // Find correct tab to put article in
  var index = evt.data.index;

  var article = document.getElementById("article_" + index);
  var extract = article.getElementsByClassName("extract")[0];
  var title = article.getElementsByClassName("title")[0];

  extract.text = evt.data.extract;
  title.text = evt.data.title;

}

// Error handling
messaging.peerSocket.onerror = function(err) {
  console.log(err);
}

// Listen for the onopen event and trigger the companion to wake up
messaging.peerSocket.onopen = function() {
  messaging.peerSocket.send("Hi!");
}

initialize();

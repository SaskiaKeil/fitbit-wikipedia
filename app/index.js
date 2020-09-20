/*
 * Entry point for the watch app
 */
import document from "document";
import * as messaging from "messaging";

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {

  // Find correct tab to put article on
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

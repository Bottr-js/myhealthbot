var apiai = require('apiai');
var app = apiai("6071df18bda34abc99a4664ceeadf889");

/*
This component allows the user to create a new food entry
by sending the bot a description of what they ate.
*/
function TextEntry() {
  return function(bot) {

    bot.on('message_received', function(message, session, next) {
      var request = app.textRequest(message.text);

      request.on('response', function(response) {
        session.send(response.result.fulfillment.speech)
        message.data = response.result
        next()
      });

      request.on('error', function(error) {
          console.log(error);
      });

      request.end()
    });

    bot.hears(function(message){
      return !message.data.actionIncomplete
    }, function(message, session) {
      bot.trigger('fetch_nutrition_for_food', message.data.parameters.product)
    })
  }
}

module.exports = TextEntry

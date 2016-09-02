var apiai = require('apiai');
var app = apiai("6071df18bda34abc99a4664ceeadf889");

/*
This component allows the user to create a new food entry
by sending the bot a description of what they ate.
*/
function TextEntry() {
  return function(bot) {

    bot.on('message_received', function(message, session, next) {

      var options = {
          sessionId: session.conversation
      }

      var request = app.textRequest(message.text, options);

      request.on('response', function(response) {
        session.send(response.result.fulfillment.speech)
        message.data = response.result

        if (!message.data.actionIncomplete) {
          bot.trigger('fetch_nutrition_for_food', message.data.parameters.product, session)
        }
      });

      request.on('error', function(error) {
        console.log(error);
        session.send('I seem to be having a few problems at the moment, sorry :(')
      });

      request.end()
    });
  }
}

module.exports = TextEntry

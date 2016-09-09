var request = require('request');

/*
This component allows the user to create a new food entry
by sending the bot an image.
*/
function ImageEntry() {
  return function(bot) {

    bot.on('message_received', function(message, session, next) {

      // don't handle this if it isn't an attachment
      if (!message.hasOwnProperty("attachments")) {
        next()
        return
      }

      var attachment = message.attachments[0]

      bot.download(attachment, function(url) {

        console.log("http://8444fe1b.ngrok.io/" + url)

        request.post('http://api.8bit.ai/tag',{
          form: {
            'url': "http://8444fe1b.ngrok.io/" + url,
            'modelkey': 'concept',
            'apikey': process.env.EIGHTBIT_AI_KEY
          }
        }, function (error, response, body) {

            var json = JSON.parse(body)
            var results = json.results

            if (results) {

              var bestResult = results[0]

              // Get bot to handle the name of the product
              session.send(bestResult.tag)
              bot.trigger('fetch_nutrition_for_food', { product: json.tag }, session)

            } else {
              session.send("It seems I'm having a bit of trouble figuring out what that is. Maybe you could enter it in manually?")
              console.error(JSON.stringify(json))
            }
          });
      });
    })
  }
}

module.exports = ImageEntry

var fs = require('fs');
var request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

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
      var url = attachment.payload.url

      var dir = 'public'
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      // Randomize image name
      download(url, 'public/google.png', function(){

        request.post('http://usekenko.co:3005/remote-identify',{form: {'image_url': 'http://8444fe1b.ngrok.io/google.png'}}, function (error, response, body) {

          var json = JSON.parse(body)

          if (json.status === "completed") {

            // Get bot to handle the name of the product
            session.send(json.name)
            bot.trigger('fetch_nutrition_for_food', json.name, session)

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

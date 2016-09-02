var fs = require('fs');
var request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function Attachment(message) {
  return message.hasOwnProperty("attachments")
}

/*
This component allows the user to create a new food entry
by sending the bot an image.
*/
function ImageEntry() {
  return function(bot) {

    bot.hears(Attachment, function(message, session){

      var attachment = message.attachments[0]
      var url = attachment.payload.url

      var dir = 'public'
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      // Randomize image name
      download(url, 'public/google.png', function(){

        request.post('http://usekenko.co:3005/remote-identify',{form: {'image_url': 'https://75b2db1e.ngrok.io/google.png'}}, function (error, response, body) {

          var json = JSON.parse(body)

          if (json.status === "completed") {
            bot.trigger('fetch_nutrition_for_food', json.name)
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

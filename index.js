var Pozi = require('pozi')
var TextEntry = require('./components/text-entry')
var ImageEntry = require('./components/image-entry')

var bot = new Pozi.Bot();

bot.use(new Pozi.FacebookMessengerClient())
bot.use(new TextEntry())
bot.use(new ImageEntry())

bot.listen();

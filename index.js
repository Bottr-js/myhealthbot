var Pozi = require('pozi')
var TextEntry = require('./components/text-entry')
var ImageEntry = require('./components/image-entry')

bot.use(new Pozi.FacebookMessengerClient())
bot.use(new TextEntry())
bot.use(new ImageEntry())

bot.listen();

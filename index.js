var Pozi = require('pozi')

bot.use(new Pozi.FacebookMessengerClient())
bot.use(new TextEntry())
bot.use(new ImageEntry())

bot.listen();

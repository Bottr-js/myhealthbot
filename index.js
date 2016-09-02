var Pozi = require('pozi')
var TextEntry = require('./components/text-entry')
var ImageEntry = require('./components/image-entry')
var FoodNutrition = require('./components/food-nutrition')

var bot = new Pozi.Bot()

bot.use(new Pozi.FacebookMessengerClient())
bot.use(new FoodNutrition())
bot.use(new ImageEntry())
bot.use(new TextEntry())

bot.listen();

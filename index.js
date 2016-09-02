var Pozi = require('pozi')
var bot = new Pozi.Bot();
var apiai = require('apiai');
const util = require('util')
bot.use(new Pozi.FacebookMessengerClient())
var app = apiai("6071df18bda34abc99a4664ceeadf889");

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
}, function(message, session){

  var request = require('request');
  var OAuth   = require('oauth-1.0a');

  var oauth = OAuth({
      consumer: {
          public: 'df8840ca2de5455997f6cd2a2d2153f9',
          secret: '7627e9db5f084af993118300901fad5e'
      },
      signature_method: 'HMAC-SHA1'
  });

  var request_data = {
      url: 'http://platform.fatsecret.com/rest/server.api',
      method: 'GET',
      data: {
          method: "foods.search",
          search_expression: message.data.parameters.product,
          format: "json",
          max_results: 3
      }
  };

    request({
      url: request_data.url,
      method: request_data.method,
      form: oauth.authorize(request_data)
    }, function(error, response, body) {
      var data = JSON.parse(body);
      if (data.error != undefined) {
        return ;
      }
      console.log(data.foods.food[0])
      getFoodFromId(data.foods.food[0].food_id, function (food) {
        var weight = anyQuantityToGram(message.data.parameters['unit-weight'])
        console.log(food)
        session.send("it contains: " + food.calories * weight / 100 + "kcal, "
                    + food.carbohydrate * weight / 100 + "g of carbohydrate, "
                    + food.sugar * weight / 100 + "g of sugar, "
                    + food.fat * weight / 100 + "g of fat, "
                    + food.saturated_fat * weight / 100 + "g of saturated fat, "
                    + food.protein * weight / 100 + "g of protein.")
      })
    });
})

function anyQuantityToGram(product) {
  var value = product.amount
  var baseUnit = product.unit
  var gramsValue

  console.log(product);
  if (baseUnit == "kg") {
    gramsValue = value * 1000;
  } else if (baseUnit == "g") {
    gramsValue = value;
  } else if (baseUnit == "lb") {
    gramsValue = value * 454
  }
  return gramsValue;
}

function getFoodFromId(foodId, next) {
  var request = require('request');
  var OAuth   = require('oauth-1.0a');

  var oauth = OAuth({
      consumer: {
          public: 'df8840ca2de5455997f6cd2a2d2153f9',
          secret: '7627e9db5f084af993118300901fad5e'
      },
      signature_method: 'HMAC-SHA1'
  });

  var request_data = {
      url: 'http://platform.fatsecret.com/rest/server.api',
      method: 'GET',
      data: {
          method: "food.get",
          food_id: foodId,
          format: "json",
      }
  };
  request({
    url: request_data.url,
    method: request_data.method,
    form: oauth.authorize(request_data)
  }, function(error, response, body) {
    var data = JSON.parse(body);
    for (var i = 0; i < data.food.servings.serving.length; ++i) {
      if (data.food.servings.serving[i].metric_serving_unit == "g" && data.food.servings.serving[i].metric_serving_amount == 100) {
        next(data.food.servings.serving[i]);
      }
    }
  });
}

bot.listen();

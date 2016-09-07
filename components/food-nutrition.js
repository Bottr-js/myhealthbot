function FoodNutrition() {
  return function(bot) {
    bot.on('fetch_nutrition_for_food', function(product, session) {
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
              search_expression: product.product,
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
          console.log(data)
          if (data.error != undefined) {
            return ;
          }
          if (data.foods.food == undefined) {
            session.send("food not found");
            return ;
          }
          getFoodFromId(data.foods.food[0].food_id, function (food) {
            if (food == null) {
              session.send("food not found");
              return ;
            }
            console.log(food)
            var weight = anyQuantityToGram(product['unit-weight'])
            // session.send(weight + "grams of " + data.foods.food[0].food_name + " contains: " + food.calories * weight / 100 + "kcal, "
            //             + food.carbohydrate * weight / 100 + "g of carbohydrate, "
            //             + food.sugar * weight / 100 + "g of sugar, "
            //             + food.fat * weight / 100 + "g of fat, "
            //             + food.saturated_fat * weight / 100 + "g of saturated fat, "
            //             + food.protein * weight / 100 + "g of protein.")

            session.send(data.foods.food[0].food_name + "\n"
                        + "---------------------------\n"
                        + "Typical values per " + weight + "grams\n\n"
                        + "Energy, kcal:\t\t" + food.calories * weight / 100 + "\n"
                        + "Fat, g:\t\t\t" + food.fat * weight / 100 + "\n"
                        + " saturates, g:\t\t" + food.saturated_fat * weight / 100 + "\n"
                        + "Carbohydrate, g:\t" + food.carbohydrate * weight / 100 + "\n"
                        + " sugars, g:\t\t" + food.sugar * weight / 100 + "\n"
                        + "Protein, g:\t\t" + food.protein * weight / 100 + "\n")
          })
        });
    })
  }
}

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
  } else {
    gramsValue = 100
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
    console.log(JSON.stringify(data))
    for (var i = 0; i < data.food.servings.serving.length; ++i) {
      if (data.food.servings.serving[i].metric_serving_unit == "g" && data.food.servings.serving[i].metric_serving_amount == 100) {
        next(data.food.servings.serving[i]);
        return ;
      }
    }
    next(null)
  });
}

module.exports = FoodNutrition

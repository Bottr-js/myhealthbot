function FoodNutrition() {
  return function(bot) {
    bot.on('fetch_nutrition_for_food', function(product, session) {
      var request = require('request');
      var OAuth   = require('oauth-1.0a');

      var oauth = OAuth({
          consumer: {
              public: process.env.FATSECRET_PUBLIC,
              secret: process.env.FATSECRET_PRIVATE
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
            session.send("I haven't been able to find this product");
            return ;
          }
          getFoodFromId(data.foods.food[0].food_id, function (food) {
            if (food == null) {
              session.send("I haven't been able to find informations about this product");
              return ;
            }
            console.log(food)
            var weight = anyQuantityToGram(product['unit-weight'])

            if (weight == -1) {
              weight = food.metric_serving_amount
            }

            if (food.metric_serving_amount == undefined) {
              session.send(data.foods.food[0].food_name + "\n"
                          + "---------------------------\n"
                          + "Typical values per " + food.serving_description + "\n\n"
                          + "Energy, kcal:\t\t" + food.calories + "\n"
                          + "Fat, g:\t\t\t" + food.fat + "\n"
                          + " saturates, g:\t\t" + food.saturated_fat + "\n"
                          + "Carbohydrate, g:\t" + food.carbohydrate + "\n"
                          + " sugars, g:\t\t" + food.sugar + "\n"
                          + "Protein, g:\t\t" + food.protein + "\n")
            } else {
              session.send(data.foods.food[0].food_name + "\n"
                          + "---------------------------\n"
                          + "Typical values per " + weight + "grams\n\n"
                          + "Energy, kcal:\t\t" + (food.calories * weight / food.metric_serving_amount).toFixed(1) + "\n"
                          + "Fat, g:\t\t\t" + (food.fat * weight / food.metric_serving_amount).toFixed(1) + "\n"
                          + " saturates, g:\t\t" + (food.saturated_fat * weight / food.metric_serving_amount).toFixed(1) + "\n"
                          + "Carbohydrate, g:\t" + (food.carbohydrate * weight / food.metric_serving_amount).toFixed(1) + "\n"
                          + " sugars, g:\t\t" + (food.sugar * weight / food.metric_serving_amount).toFixed(1) + "\n"
                          + "Protein, g:\t\t" + (food.protein * weight / food.metric_serving_amount).toFixed(1) + "\n")
            }
          })
        });
    })
  }
}

function anyQuantityToGram(product) {
  if (product == undefined)
    return -1;
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
          public: process.env.FATSECRET_PUBLIC,
          secret: process.env.FATSECRET_PRIVATE
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
    if (data.food.servings.serving != undefined && data.food.servings.serving.length == undefined) {
      next(data.food.servings.serving);
      return ;
    }
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

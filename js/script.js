
var appid = '&appid='

var urlCityGeocoding = "http://api.openweathermap.org/geo/1.0/direct?q="


var searchCities = $('input[name="searchCities"]');
var searchCity = $('#searchCity');

var cityOption;





function getCityLocation(cityName){

    var requestUrl = urlCityGeocoding + cityName + "&limit=10" + appid + owappkey;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log('City Location INFO\n----------');
            console.log(data);
            // console.log(data.length);



            



    });
}


searchCities.keyup(function () {
    event.stopPropagation();
    var textQuery = searchCities.val();

    if (textQuery.length > 2) {
        getCityLocation(textQuery);

                
    }


    console.log(textQuery);


    
});


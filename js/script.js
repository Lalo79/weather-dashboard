
var appid = '&appid='

var urlCityGeocoding = "http://api.openweathermap.org/geo/1.0/direct?q="

var searchForm = $("#searchForm");
var searchCity = $('input[name="inputCity"]');
var searchCountry = $('input[name="inputCountry"]');
var cityOptions = $("#cityOptions");

var cityName;

var temp;



function getCityLocation(cityName){

    var requestUrl = urlCityGeocoding + cityName + "&limit=10" + appid + config.owappkey;
    console.log(requestUrl);

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log('City Location INFO\n----------');
            console.log(data);
            
            var queryResults = data;
            

            for (let i = 0; i < queryResults.length; i++) {
                var tableRow = $('<tr>');
                tableRow.attr('data-lat',queryResults[i].lat)
                tableRow.attr('data-lon',queryResults[i].lon)                
                tableRow.append('<th scope="row">' + eval(i+1) + '</th>');
                tableRow.append('<td >' + queryResults[i].name + '</td>');
                tableRow.append('<td>' + queryResults[i].state + '</td>');
                var countryName = countryDB.filter(param => {return param.code == queryResults[i].country});
                countryName = countryName[0].label;
                tableRow.append('<td>' + countryName + '</td>');
                cityOptions.append(tableRow);
            }

            
    });
}



var submitSearch = function (event) {
    cityOptions.html("");
    event.preventDefault();
    
    var textQuery = searchCity.val();

    if (searchCountry.val()){
    var countryCode = countryDB.filter(param => { return param.label == searchCountry.val()})[0].code;};

    textQuery += ",," + countryCode;
    console.log(textQuery);
  
    getCityLocation(textQuery);

    
};


// Search City
searchForm.on('submit', submitSearch);


// Select  City Option
cityOptions.on('click', "tr" , function (event) {
    var latitude = $(event.target).parent().attr('data-lat');
    var longitude = $(event.target).parent().attr('data-lon');
    var cityName = $(event.target).parent().children().eq(1).text();
    var stateName = $(event.target).parent().children().eq(2).text();
    var countryName = $(event.target).parent().children().eq(3).text();
    
    // var countryName = countryDB.filter(param => {return param.code == $(event.target).parent().children().eq(3).text()});
    // countryName = countryName[0].label;
    
    coord = [latitude, longitude];
    info = [cityName, stateName, countryName];

    queryWeatherConditions(coord, info);

});


function queryWeatherConditions(coord, info) {

    var weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + coord[0] + '&lon=' + coord[1] + '&exclude=alerts&units=metric&appid=' + config.owappkey;

    fetch(weatherUrl)
        .then(function (response) {
            return response.json();
        }).then(function (weatherData) {
            console.log('XXXXX WEATHER INFO\n----------     --------     ----');
            console.log(weatherData);       

            // temp = weatherData;
            if (weatherData){
                document.getElementById("currentIcon").src = "http://openweathermap.org/img/wn/"+ weatherData.current.weather[0].icon +"@2x.png";
                
                var cityText = info[0];
                if (info[1]) {cityText += ", " + info[1]}

                $("#currentTitle").text(cityText)

                $('#currenTemp').text(weatherData.current.temp + '°C')



            
            };

            
            
    });



}






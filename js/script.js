
var appid = '&appid='
var apiKey;

var urlCityGeocoding = "http://api.openweathermap.org/geo/1.0/direct?q="

var submitApiKey = $('#submitApiKey');
var searchForm = $("#searchForm");
var searchCity = $('input[name="inputCity"]');
var searchCountry = $('input[name="inputCountry"]');
var cityOptions = $("#cityOptions");
var recentCityOptions = $('#recentSearches')

var cityName;
var apiKey;
var savedApiKey;

var temp;


window.onload = (event) => {
    recentCitylist = JSON.parse(localStorage.getItem("recentCitylist"));
    
    if (recentCitylist != null) { populateRecentCity(recentCitylist);}
    savedApiKey = localStorage.getItem("savedApiKey")
    if (savedApiKey!=null) {document.querySelector('.apiKey').hidden = true;}
};


function verifyApiKey () {
    apiKey = localStorage.getItem("savedApiKey")
    if (apiKey==null) {
        alert ('There is no API Key to retreive Weather Data')
        document.querySelector('.apiKey').hidden = false;
        return false;
    } else {
        return true;
    }   
}

function getCityLocation(cityName){

    var requestUrl = urlCityGeocoding + cityName + "&limit=10" + appid + apiKey;
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

                if (queryResults[i].state == undefined) {
                    stateText = '';} else {stateText = queryResults[i].state;}

                tableRow.attr('data-lat',queryResults[i].lat)
                tableRow.attr('data-lon',queryResults[i].lon)                
                tableRow.append('<th scope="row">' + eval(i+1) + '</th>');
                tableRow.append('<td >' + queryResults[i].name + '</td>');
                tableRow.append('<td>' + stateText + '</td>');
                
                var countryName = countryDB.filter(param => {return param.code == queryResults[i].country});
                countryName = countryName[0].label;
                tableRow.append('<td>' + countryName + '</td>');
                cityOptions.append(tableRow);
            }
    });
}


function submitApiKeyFunc(event) {
    event.preventDefault();
    apiKey = $('#inlineFormInput').val();

    if (apiKey != '') {
        apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=' + apiKey;

        fetch(apiUrl)
            .then(function(response){
                console.log(apiKey);
                if (response.ok) {
                    alert('AppiKey Saved Succesfyully');
                    document.querySelector('.apiKey').hidden = true;
                    localStorage.setItem('savedApiKey', apiKey);

                } else {
                    alert('Please Enter a Valid API Key')
                }
            })
    } else {
        alert ('Please Enster an API Key');
    }
}


var submitSearch = function (event) {
    
    if (verifyApiKey()){
    
        cityOptions.html("");
        event.preventDefault();
        
        var textQuery = searchCity.val();

        if (searchCity.val()) {
            if (searchCountry.val()){
            var countryText = searchCountry.val();
            countryText = searchCountry.val()[0].toUpperCase() + searchCountry.val().substring(1);

            var countryCode = countryDB.filter(param => { return param.label == countryText})[0].code;};

            textQuery += ",," + countryCode;
            console.log(textQuery);
        
            getCityLocation(textQuery);
        } else {
            alert ('Please Enter a City Name')
        }
  
    }

};

// Sumbit API Key

submitApiKey.on('submit', submitApiKeyFunc);

// Search City
searchForm.on('submit', submitSearch);



// Select City from City Query
cityOptions.on('click', "tr" , function (event) {

    if (verifyApiKey()) {
        
        var latitude = $(event.target).parent().attr('data-lat');
        var longitude = $(event.target).parent().attr('data-lon');
        var cityName = $(event.target).parent().children().eq(1).text();
        var stateName = $(event.target).parent().children().eq(2).text();
        var countryName = $(event.target).parent().children().eq(3).text();
        
        // var countryName = countryDB.filter(param => {return param.code == $(event.target).parent().children().eq(3).text()});
        // countryName = countryName[0].label;
        
        var coord = [latitude, longitude];
        var info = [cityName, stateName, countryName];

        queryWeatherConditions(coord, info);

        saveRecentCity(coord, info);

    }

});


var SelectionDetails;


// Select City from Recent Cities List
recentCityOptions.on('click', "div" , function (event) {

    if (verifyApiKey()) {

    recentCitylist = JSON.parse(localStorage.getItem("recentCitylist"));
    
    var listPosition = $(event.target).attr('data-listNumber');
    SelectionDetails = recentCitylist.filter(a => {return a.listNumber == listPosition})


    var latitude = SelectionDetails[0].latitudeSave;
    var longitude = SelectionDetails[0].longitudeSave;

    var cityName = SelectionDetails[0].cityNameSave;
    var stateName = SelectionDetails[0].stateNameSave;
    var countryName = SelectionDetails[0].countrySave;
    
    
    var coord = [latitude, longitude];
    var info = [cityName, stateName, countryName];

    queryWeatherConditions(coord, info);

    }
    
});



function queryWeatherConditions(coord, info) {

    document.querySelector('#displayControl').hidden = false;

    weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + coord[0] + '&lon=' + coord[1] + '&exclude=alerts&units=metric&appid=' + apiKey;
    $('#currentWeatherAlert').text('Current Weather Conditions - ' + moment().format('ddd, MMM Do YYYY'))

    fetch(weatherUrl)
    .then(function (response) {
        return response.json();
    }).then(function (weatherData) {
        console.log('XXXXX WEATHER INFO\n----------     --------     ----');
        console.log(weatherData);       

        if (weatherData){
            document.getElementById("currentIcon").src = "http://openweathermap.org/img/wn/"+ weatherData.current.weather[0].icon +"@2x.png";
            
            temp = info;

            var cityText = info[0];
            if (info[1] != 'undefined') {cityText += ", " + info[1]}

            $("#currentTitle").html(cityText + '<br><small>' + info[2] + '</small>');
            $('#currenTemp').text(weatherData.current.temp + '°C');
            $("#currentHumidity").text('Humidity: ' + weatherData.current.humidity + '%');
            $("#currentWind").text('Wind Speed: ' + weatherData.current.wind_speed + ' meter/sec');
            var levelUV = weatherData.current.uvi;
            $("#currentUV").text('UV Index: ' + levelUV);

            if (levelUV < 3) {
                $("#currentUV").css("background-color", 'rgb(158, 206, 86)');
            } else if ( levelUV < 6) {
                $("#currentUV").css("background-color", "orange");
            } else if ( levelUV < 8) {
                $("#currentUV").css("background-color", 'rgb(255, 94, 0)');
            } else if ( levelUV < 11) {
                $("#currentUV").css("background-color", "red");
            } else {
                $("#currentUV").css("background-color", "purple");
            }



            // Initialize 5 Day Forecast Div
            var thisDay = moment();
            var dateFormat = 'ddd, MMM Do YYYY'
            var dayCount = 1;

            $('#fiveDayFcstDiv').html('');


            for (let i = 0; i < 5; i++) {
                
                var dailyFcstDiv = $('<div>');
                dailyFcstDiv.addClass("card");

                var iconImg = "http://openweathermap.org/img/wn/"+ weatherData.daily[i].weather[0].icon +"@2x.png";
                dailyFcstDiv.append('<img src="' + iconImg + '" class="card-img-top" alt="">');

                dailyFcstDiv.append('<div class="card-body" id="card_0' + dayCount + '">');
                dailyFcstDiv.append('<div class="card-footer" id="footer_0' + dayCount + '">');

                $('#fiveDayFcstDiv').append(dailyFcstDiv);

                $('#card_0'+dayCount).append('<h5 class="card-title">' + thisDay.add(1,'day').format(dateFormat) + '</h5>');
                $('#card_0'+dayCount).append('<p class="card-text my-0 minTemp">Min Temp: ' + weatherData.daily[i].temp.min + '°C</p>');
                $('#card_0'+dayCount).append('<p class="card-text mt-0 maxTemp">Max Temp: ' + weatherData.daily[i].temp.max + '°C</p>');
                // $('#footer_0'+dayCount).append('<small class="text-muted">Last updated 3 mins ago</small>');
                $('#card_0'+dayCount).append('<p class="card-text mb-0 "><small>Humidity: ' + weatherData.daily[i].humidity + '%</small></p>');
                $('#card_0'+dayCount).append('<p class="card-text my-0 "><small>Wind Speed: ' + weatherData.daily[i].wind_speed + ' meter/sec</small></p>');

                dayCount++;                                                
            }

        
        };
        
    });

}



function saveRecentCity(coordinates, info) {

    var newLocation = {
        listNumber: 1,
        latitudeSave: coordinates[0],
        longitudeSave: coordinates[1],
        cityNameSave: info[0],
        stateNameSave: info[1],
        countrySave: info[2]
    }
    
    var recentCitylist = JSON.parse(localStorage.getItem("recentCitylist"));
    
    if (recentCitylist == null) {
        recentCitylist = []
        recentCitylist.push(newLocation);
    } else {

        // lastElementNumber = recentCitylist.map(element => element.listNumber).sort(function(a,b) {return(b-a)}).pop();
        // newLocation.listNumber = lastElementNumber - 1;
        newLocation.listNumber = moment().unix();


        // Filter prevents saviung a location more tha once
        recentCitylist = recentCitylist.filter(element=>{return element.latitudeSave != newLocation.latitudeSave && element.longitudeSave != newLocation.longitudeSave});  

        recentCitylist.push(newLocation); 
        recentCitylist = recentCitylist.sort(function(a, b){return b.listNumber - a.listNumber});

        // Limits Recent List City lenght to 8 elements
        if (recentCitylist.length > 10) { recentCitylist.pop(); }        
        
    }

    
    localStorage.setItem('recentCitylist', JSON.stringify(recentCitylist));
    populateRecentCity(recentCitylist);
}



function populateRecentCity(recentCitylist) {

    $('#recentSearches').html('');
    
    for (let i = 0; i < recentCitylist.length; i++) {
        
        if(recentCitylist[i].stateNameSave == '')
        {stateText = recentCitylist[i].cityNameSave;} else {stateText = recentCitylist[i].cityNameSave + ', ' + recentCitylist[i].stateNameSave;}

        temp = recentCitylist;

        var recentCity = $('<div class="shadow-sm p-1 mb-1 bg-light rounded border" data-listNumber="' + recentCitylist[i].listNumber + '">');
        recentCity.text(stateText + '. ' + recentCitylist[i].countrySave);
        $('#recentSearches').append(recentCity);
    }

}
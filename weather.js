const APIKEY = "a1c4fbe6a0a3ec3f47e55f916e0ddfe4";
var DateTime = luxon.DateTime;
var AddHistory = false;
var SHistory = [];

function Failed5Day(results) {
	console.log("Failed to retrieve 5 day");
}

function Retrieved5Day(results) {
	console.log(results);
	var uvi = results.current.uvi;
	$("#uvIndex").attr("class", "");
	if(uvi < 2){
		$("#uvIndex").addClass("uvIndex uvGreen");
	}else if(uvi < 8){
		$("#uvIndex").addClass("uvIndex uvYellow");
	}else{
		$("#uvIndex").addClass("uvIndex uvRed");
	}
	$("#uvIndex").text(uvi);

	for(var i=1; i<6; i++){
		$(`#day-${i}-Icon`).attr("class", "");
		var classes = getIconInsert(results.daily[i-1].weather[0].main);
		$(`#day-${i}-Icon`).addClass(classes);

		$(`#day-${i}-Temp`).html(`Temp: ${KtoF(results.daily[i-1].temp.day).toFixed(2)}&#176;F`);
		$(`#day-${i}-Humid`).html(`Humidity: ${results.daily[i-1].humidity}%`);
		

	}

}

function FailedCurrent(results) {
	console.log("Failed to find current");
	$("#txtCity").addClass("is-invalid");
	$("#searchGroup").effect("shake", {duration: 5000, distance: 20, times: 10});
}

function getIconInsert(type) {
	switch (type) {
		case "Clear":
			return `wi wi-day-sunny`;

		case "Clouds":
			return `wi wi-day-cloudy`

		case "Rain":
			return `wi wi-day-rain`

		default:
			return `wi wi-train`;
	}
}

function KtoF(K) {
	return (9 / 5) * (K - 273) + 32;
}

function MStoMPH(ms) {
	return ms * 2.236936;
}

function RetrievedCurrent(results) {
	console.log(results);
	$("#txtCity").removeClass("is-invalid");
	var lat = results.coord.lat;
	var lon = results.coord.lon;
	var url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${APIKEY}`;
	$.ajax(url).done(Retrieved5Day).fail(Failed5Day);
	var dt = DateTime.local();
	$("#cardHeader").html(`${results.name} (${dt.month}-${dt.day}-${dt.year}) <i class="${getIconInsert(results.weather[0].main)}"></i>`);
	$("#item-Temp").html(`Temperature: ${KtoF(results.main.temp).toFixed(2)} &#176;F`);
	$("#item-Humidty").html(`Humidty: ${results.main.humidity}%`);
	$("#item-Wind").html(`Wind Speed: ${MStoMPH(results.wind.speed).toFixed(2)} MPH`);

	if(AddHistory){
		addToHistory(results.name);
		AddHistory = false;	
	}

	localStorage.setItem("LastSearched", results.name);
}

function addToHistory(name){
	var listItem = $("<li></li>");
	listItem.addClass("btn btn-primary location-btn");
	listItem.text(name);
	listItem.click(PullfromHistory);
	$("#HistoryList").append(listItem);
	SHistory[SHistory.length] = name;
	saveHistory();
}


function SearchCity(ev) {
	ev.preventDefault();
	AddHistory = true;
	var city = $("#txtCity").val().trim();
	if (!(city === "")) {
		var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}`;
		$.ajax(url).done(RetrievedCurrent).fail(FailedCurrent);
	}

}

function PullfromHistory(ev){
	ev.preventDefault();
	AddHistory = false;
	var city = 	$(this).text();
	if (!(city === "")) {
		var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}`;
		$.ajax(url).done(RetrievedCurrent).fail(FailedCurrent);
	}
}

function saveHistory(){
	var histString = JSON.stringify(SHistory);
	localStorage.setItem("SearchHistory", histString);
}

function loadHistory(){
	var hist = localStorage.getItem("SearchHistory")
	if(hist == null){
		return;
	}
	SHistory = JSON.parse(hist);

	$("#HistoryList").empty();
	for(var i = 0; i < SHistory.length; i++){
		var listItem = $("<li></li>");
		listItem.addClass("btn btn-primary location-btn");
		listItem.text(SHistory[i]);
		listItem.click(PullfromHistory);
		$("#HistoryList").append(listItem);
	}
}

$(document).ready(function () {

	$("#btnSearch").click(SearchCity);

	for (var i = 1; i < 6; i++) {
		$(`#day-${i}-header`).text(DateTime.local().plus({ days: i }).toLocaleString());
	}

	var city = localStorage.getItem("LastSearched");
	if(city === null){
		city="Richmond";
	}

	var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}`;
	$.ajax(url).done(RetrievedCurrent).fail(FailedCurrent);

	loadHistory();

});
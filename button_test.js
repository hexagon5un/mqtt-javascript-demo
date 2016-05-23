/*
   Eclipse Paho MQTT-JS Utility
   by Elliot Williams for Hackaday article, 
*/

// Global variables
var client       = null;
var led_is_on    = null;
// These are configs	
var hostname       = "192.168.1.49";
var port           = "9001";
var clientId       = "mqtt_js_" + parseInt(Math.random() * 100000, 10);
var temp_topic     = "home/outdoors/temperature";
var humidity_topic = "home/outdoors/humidity";
var status_topic   = "home/outdoors/status";

// This is called after the webpage is completely loaded
// It is the main entry point into the JS code
function connect(){
	// Set up the client
	client = new Paho.MQTT.Client(hostname, Number(port), clientId);
	console.info('Connecting to Server: Hostname: ', hostname, '. Port: ', port, '. Client ID: ', clientId);

	// set callback handlers
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;

	// see client class docs for all the options
	var options = {
		onSuccess: onConnect, // after connected, subscribes
		onFailure: onFail     // useful for logging / debugging
	};
	// connect the client
	client.connect(options);
	console.info('Connecting...');
}


function onConnect(context) {
	console.log("Client Connected");
    // And subscribe to our topics	-- both with the same callback function
	options = {qos:0, onSuccess:function(context){ console.log("subscribed"); } }
	client.subscribe(temp_topic, options);
	client.subscribe(humidity_topic, options);
	client.subscribe(status_topic, options);
}

function onFail(context) {
	console.log("Failed to connect");
}

function onConnectionLost(responseObject) {
	if (responseObject.errorCode !== 0) {
		console.log("Connection Lost: " + responseObject.errorMessage);
		window.alert("Someone else took my websocket!\nRefresh to take it back.");
	}
}

// Here are the two main actions that drive the webpage:
//  handling incoming messages and the toggle button.

// Updates the webpage elements with new data, and 
//  tracks the display LED status as well, 
//  in case multiple clients are toggling it.
function onMessageArrived(message) {
	console.log(message.destinationName, message.payloadString);

	// Update element depending on which topic's data came in
	if (message.destinationName == temp_topic){ 
		var temperature_heading = document.getElementById("temp_display");
		temperature_heading.innerHTML = "Temperature: " + message.payloadString + " &deg;C";
	} else if (message.destinationName == humidity_topic) {
		var humidity_heading = document.getElementById("humidity_display");
		humidity_heading.innerHTML = "Humidity: " + message.payloadString + "%";
	} else if (message.destinationName == status_topic) {
		var status_heading = document.getElementById("led_status");
		status_heading.innerHTML = "LED Status: " + message.payloadString;
		// Accomodates one or two byte "on" commands.  Anything else is off.
		if (message.payloadString == "on" || message.payloadString == "o"){
			led_is_on = true;
		} else {
			led_is_on = false;
		}
	}
}

// Provides the button logic that toggles our display LED on and off
// Triggered by pressing the HTML button "status_button"
function led_toggle(){
	if (led_is_on){
		var payload = "off";
		led_is_on = false;
	} else {
		var payload = "on";
		led_is_on = true;
	}

	// Send messgae
	message = new Paho.MQTT.Message(payload);
	message.destinationName = status_topic;
	message.retained = true;
	client.send(message);
	console.info('sending: ', payload);
}


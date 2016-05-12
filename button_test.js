/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *    http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *    James Sutton - Initial Contribution
 *******************************************************************************/

/*
   Eclipse Paho MQTT-JS Utility
   Modified with a chainsaw by Elliot Williams for Hackaday article: 

   */

// Global variables
var client       = null;
var led_is_on    = null;
// These are configs	
var hostname     = "192.168.1.49";
var port         = "9001";
var clientId     = "mqtt_js_" + parseInt(Math.random() * 100000, 10);
var temp_topic   = "home/outdoors/temperature";
var status_topic = "home/outdoors/status";


function onConnect(context) {
	console.log("Client Connected");
	subscribe();
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

function onMessageArrived(message) {
	console.log(message.destinationName, message.payloadString);

	// Update webpage
	if (message.destinationName == temp_topic){ 
		var temperature_heading = document.getElementById("temp_display");
		temperature_heading.innerHTML = "Temperature: " + message.payloadString + " &deg;C";
	} else if (message.destinationName == status_topic) {
		var status_heading = document.getElementById("led_status");
		status_heading.innerHTML = "LED Status: " + message.payloadString;
		if (message.payloadString == "on" || message.payloadString == "o"){
			led_is_on = true;
		} else {
			led_is_on = false;
		}
	}
}

function led_toggle(){

	// Toggle logic
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


function subscribe(){
	options = {qos:0, onSuccess:function(context){ console.log("subscribed"); } }
	client.subscribe("home/outdoors/temperature", options);
	client.subscribe("home/outdoors/status", options);
}


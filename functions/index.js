// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Dialogflow fulfillment getting started guide:
// https://dialogflow.com/docs/how-tos/getting-started-fulfillment

'use strict';

const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://owaveservices.info')

const http = require('http');
const functions = require('firebase-functions');
const {dialogflow,Permission} = require('actions-on-google');

// Create an app instance
const app = dialogflow()


function callCheckNSaveApi(){
    return new Promise(function(resolve, reject){
        request('http://owaveservices.info:5003/defibrilatteurs/0.1234/50.1234/0/1', function (err, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (err) return reject(err);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body).data.available_balance);
            } catch(e) {
                reject(e);
            }
        });
    });
}


app.intent('request_permission', (conv) => {


	conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';
	return conv.ask(new Permission({
		context: 'to locate you',
		permissions: conv.data.requestedPermission,
	}));

});

// Intent in Dialogflow called `Goodbye`
app.intent('Demander_Aide_INTENT-Seul', (conv, params, permissionGranted) => {



		return conv.ask("J'ai votre position GPS. Est-ce que vous pouvez maintenant me dicter votre numéro de téléphone, s'il-vous plaît?"); //coordinates.latitude

		//return conv.ask("Merci. Est-ce que vous pouvez maintenant me dicter votre numéro de téléphone, s'il-vous plaît? oui? ou non?"); //coordinates.latitude

		/*if (permissionGranted) {
			const {requestedPermission} = conv.data;
			if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {

				const {coordinates} = conv.device.location;
				//const city=conv.device.location.city;
				//const formattedAddress=conv.device.location.formattedAddress;

				if (coordinates) {
					
					return conv.ask("Merci. Est-ce que vous pouvez maintenant me dicter votre numéro de téléphone, s'il-vous plaît? oui? ou non?"); //coordinates.latitude
					//return conv.close('You are at ${coordinates.longitude} ${coordinates.latitude}'); //coordinates.latitude
				} else {
					// Note: Currently, precise locaton only returns lat/lng coordinates on phones and lat/lng coordinates
					// and a geocoded address on voice-activated speakers.
					// Coarse location only works on voice-activated speakers.
					return conv.close('Vous êtes tout seul, ne vous inquiétez pas je vais prévenir les secours. Mais j\'ai besoin de vous géolocaliser, pouvez vous activer votre GPS s\'il-vous-plaît?');
				}

			}

		} else {
			return conv.close('Vous êtes tout seul, ne vous inquiétez pas je vais prévenir les secours. Mais j\'ai besoin de vous géolocaliser. Pouvez vous autoriser l\'utilisation du gps ? ');
		}*/

		//conv.close('Merci. En attendant les secours, quel est la nature de votre problème, c\'est un accident? ou une maladie?')
})


// Intent in Dialogflow called `Goodbye`
app.intent('yes-procedure', conv => {
		  conv.close('See you later!')
})

// Intent in Dialogflow called `Goodbye`
app.intent('GPS_INTENT - Tel', conv => {
		  conv.close('j\'ai récupéré votre numero de téléphone')
})

// Intent in Dialogflow called `Goodbye`
app.intent('contact_INTENT', (conv, params) => {

		console.log("conv")
		console.log(conv)
		console.log("params")
		console.log(params)

		var phone = params.telephone
		var name = params.name

		var message = "numero de tel : "+phone+"; nom: "+name
		client.publish('home/mathias', message)

		return conv.ask("J'ai votre position GPS, votre numero de tel est le suivant: "+phone+" et votre nom est: "+name+". En attendant les secours, quel est la nature de votre problème, c\'est un accident? ou une maladie?"); //coordinates.latitude

		//return conv.ask("Merci. Est-ce que vous pouvez maintenant me dicter votre numéro de téléphone, s'il-vous plaît? oui? ou non?"); //coordinates.latitude

		/*if (permissionGranted) {
			const {requestedPermission} = conv.data;
			if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {

				const {coordinates} = conv.device.location;
				//const city=conv.device.location.city;
				//const formattedAddress=conv.device.location.formattedAddress;

				if (coordinates) {
					
					return conv.ask("Merci. Est-ce que vous pouvez maintenant me dicter votre numéro de téléphone, s'il-vous plaît? oui? ou non?"); //coordinates.latitude
					//return conv.close('You are at ${coordinates.longitude} ${coordinates.latitude}'); //coordinates.latitude
				} else {
					// Note: Currently, precise locaton only returns lat/lng coordinates on phones and lat/lng coordinates
					// and a geocoded address on voice-activated speakers.
					// Coarse location only works on voice-activated speakers.
					return conv.close('Vous êtes tout seul, ne vous inquiétez pas je vais prévenir les secours. Mais j\'ai besoin de vous géolocaliser, pouvez vous activer votre GPS s\'il-vous-plaît?');
				}

			}

		} else {
			return conv.close('Vous êtes tout seul, ne vous inquiétez pas je vais prévenir les secours. Mais j\'ai besoin de vous géolocaliser. Pouvez vous autoriser l\'utilisation du gps ? ');
		}*/



		  conv.close('Merci. En attendant les secours, quel est la nature de votre problème, c\'est un accident? ou une maladie?')
})


const request = require("request");
app.intent("no-Seul-localiser", conv => {

	return new Promise(function(resolve, reject){
        request('http://owaveservices.info:5003/defibrilatteurs/0.1234/50.1234/0/1', function (err, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (err) return reject(err);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body).data.available_balance);
            } catch(e) {
                reject(e);
            }
        });
    }).then(function(val) {
    	return conv.close('votre localisation a été envoyé.');
	}).catch(function(err) {
    	return conv.close('votre localisation n\'a pas été envoyé.');
	});

 });


app.intent('user-info', (conv, params, permissionGranted) => {

	// make the request
	return new Promise(function(resolve, reject){
    request('http://owaveservices.info:5003/defibrilatteurs/0.1234/50.1234/0/1', function (err, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (err) return reject(err);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body).data.available_balance);
            } catch(e) {
                reject(e);
            }
        });
    }).then(function(val) {
    	return conv.close('vos informations ont été envoyé.');
	}).catch(function(err) {
    	return conv.close('vos informations n\'ont pas été envoyé.');
	});

	/*if (permissionGranted) {
		const {requestedPermission} = conv.data;
		if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {

			const {coordinates} = conv.device.location;
			//const city=conv.device.location.city;
			//const formattedAddress=conv.device.location.formattedAddress;

			if (coordinates) {
				return conv.close('You are at ${coordinates.longitude} ${coordinates.latitude}'); //coordinates.latitude
			} else {
				// Note: Currently, precise locaton only returns lat/lng coordinates on phones and lat/lng coordinates
				// and a geocoded address on voice-activated speakers.
				// Coarse location only works on voice-activated speakers.
				return conv.close('Sorry, I could not figure out where you are.');
			}

		}
	} else {
		return conv.close('Sorry, permission denied.');
	}*/
})

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);


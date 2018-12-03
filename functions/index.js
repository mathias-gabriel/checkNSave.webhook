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

const http = require('http');
const request = require("request");

const functions = require('firebase-functions');
const {
	dialogflow,
	Permission,
	SimpleResponse,
	BasicCard,
	Image,
	Suggestions,
	Button,
	actionsOnGoogle
} = require('actions-on-google');


// Create an app instance
const app = dialogflow()

app.intent('REQUEST_PERMISSION', (conv) => {
	
	conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';
	return conv.ask(new Permission({
		context: 'to locate you',
		permissions: conv.data.requestedPermission,
	}));

});


/******************************************************************************/

app.intent('DEMANDER_AIDE_VICTIME_INTENT', (conv, params, permissionGranted) => {

	const NomEntry = params.NomEntry; //NomEntry
	const TelEntry = params.TelEntry; //TelEntry

	if (permissionGranted) {
		
		const {requestedPermission} = conv.data;

		if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {
			console.log(conv.device.location.coordinates.latitude);
			var latitude = conv.device.location.coordinates.latitude;
			console.log(conv.device.location.coordinates.longitude);
			var longitude = conv.device.location.coordinates.longitude;

			//return conv.close('vos informations ont été envoyé.');

			return new Promise(function(resolve, reject){

				var url = 'http://owaveservices.info:5003/send_report_by_email';
				var requestData = {
					"report": "string"
				}

				request({
					url: url,
					method: "POST",
					json: requestData
				}, function (err, response, body) {
					// in addition to parsing the value, deal with possible errors
					if (err) return reject(err);
					try {
						// JSON.parse() can throw an exception if not valid JSON
						resolve(JSON.parse(body).data);
					} catch(e) {
						reject(e);
					}
				});
			}).then(function(val) {

				return conv.ask("En attendant les secours, quel est la nature de votre problème, c\'est un accident? ou une maladie?"); //coordinates.latitude

			}).catch(function(err) {
				console.log(err);
				return conv.ask('vos informations n\'ont pas été envoyé.');
			});


		}else{
			return conv.ask('je n\'ai pas pu récupéré votre position.');
		}

	} else {
		return conv.ask('Sorry, permission denied.');
	}


});

app.intent('CHECKLIST_INTENT', (conv, params) => {

	var SaignementEntry = params.SaignementEntry;
	var EtouffementEntry = params.EtouffementEntry;
	var ConscienteEntry = params.ConscienteEntry;
	var RespireEntry = params.RespireEntry;

	var message = "La victime nécessite de toute urgence une Réanimation Cardio Pulmonaire.Voulez-vous que je vous explique comment on fait une RCP? dites RCP";
	return conv.ask(message);

});

app.intent('DEMANDER_AIDE_TEMOIN_INTENT', (conv, params) => {

	const ModeEntry = params.ModeEntry;

	var message = "formateur";

	return conv.ask(message);

});

app.intent('FORMATION_INTENT', (conv, params) => {

	const TitreFormationEntry  = params.TitreFormationEntry ;

	var message = `OK je vais vous montrer quels sont les gestes à faire pour "${TitreFormationEntry}" dites "${TitreFormationEntry}"`;

	return conv.ask(message);

});

app.intent('RCP_INTENT', (conv, params, permissionGranted) => {

	const DefibrillateurEntry = params.DefibrillateurEntry; //DefibrillateurEntry
	const Titre_VideoEntry = params.Titre_VideoEntry; //Titre_VideoEntry

	if (permissionGranted) {

		const {requestedPermission} = conv.data;

		if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {
			console.log(conv.device.location.coordinates.latitude);
			const latitude = conv.device.location.coordinates.latitude;
			console.log(conv.device.location.coordinates.longitude);
			const longitude = conv.device.location.coordinates.longitude;

			return new Promise(function(resolve, reject){

				request('http://owaveservices.info:5003/defibrilatteurs/'+longitude+'/'+latitude+'/0/1', function (err, response, body) {
					// in addition to parsing the value, deal with possible errors
					if (err) return reject(err);
					try {
						// JSON.parse() can throw an exception if not valid JSON
						resolve(JSON.parse(body));
					} catch(e) {
						reject(e);
					}
				});
			}).then(function(val) {
				console.log(val);
				var distance = Math.floor( val[0].distance );
				var message = 'Nous avons trouvé un défibrillateur à '+distance+' mètres.';
				return conv.ask(message);

			}).catch(function(err) {
				console.log(err);
				return conv.ask('Nous n\'avons pas pu trouvé de défibrillateur.');
			});

		}else{
			return conv.ask('vos informations n\'ont pas été envoyé.');
		}

	} else {
		return conv.ask('Sorry, permission denied.');
	}

});


app.intent('RCP_VIDEO_INTENT', (conv, params) => {
	
	//var message = `Daccord j'ai mis "${Lien_videoEntry}" sur votre "${Type_deviceEntry}"`;

	//return conv.ask(message);

	if ( !conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT') ) {
		return conv.ask('Sorry, try this on a screen device or select the phone surface in the simulator.');
	}else{

		// Create a basic card
		return conv.ask(new BasicCard({
			formattedText: "test",
			subtitle: 'This is a subtitle',
			title: 'Title: this is a title',
			buttons: new Button({
				title: 'video',
				url: 'https://www.youtube.com/watch?v=4W5X-9BQjlU',
			}),
			image: new Image({
				url: 'http://www.leboupere.fr/medias/2016/02/defibrillateur-logo.png',
				alt: 'Image alternate text',
			})
		}));
	
	}

	

});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);


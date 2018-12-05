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
//  Auteurs  Mathias et Carlos  ver 0.5 le 05/12/18 

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

/******************AUTORISATION ACTIVATION GEOLOCALISATION SUR DEVICE************/
app.intent('REQUEST_PERMISSION', (conv) => {
	
	conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';
	return conv.ask(new Permission({
		context: 'to locate you',
		// localise moi
		permissions: conv.data.requestedPermission,
	}));

});


/********************DEMANDER_AIDE_VICTIME_INTENT*********************************/
app.intent('DEMANDER_AIDE_VICTIME_INTENT', (conv, params, permissionGranted) => {

	//const NomEntry = params.NomEntry; //NomEntry
	//const TelEntry = params.TelEntry; //TelEntry

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

/******************BILAN A ENVOYER PAR MAIL AUX URGENCES************/
app.intent('BILAN_INTENT', (conv, params) => {
	
// 	BILAN à écrire dans le Mail d'envoie au Urgences
// 	Objet: Bilan d'un accident au 7 rue Paul Vaillant Couturier, 92300 Levallois-Perret 08/12/18 16h00
//	Nom: Carlos Rodriguez
//	Tél: 0624102987
//	Nature du problème: Réanimation Cardio Pulmonaire (RCP) Accident cardiovasculaire dans un Hackathon 
//	Risques éventuels: Aucun risques éventuels, ni sur-accident 
//	Localisation précise de l'événement: 7 Rue Paul Vaillant Couturier, 92300 Levallois-Perret 
//	Nombre de personnes concernées= 1 victime
//	Etat de chaque victime= La victime est inconsciente et ne respire plus
//	Premières mesures prises= Alerter les urgences + RCP (avec défibrillateur)
//  http://owaveservices.info:5003/defibrilatteurs/48.8938615/2.2777903/0/1
//  http://owaveservices.info:5003/send_report_by_email/Carlos/0624102987/48.8938615/2.2777903
// http://crodriguez.free.fr/checknsave/ico/CheckList_66x66.png  
// http://crodriguez.free.fr/checknsave/ico/Bilan_66x66.png
// http://crodriguez.free.fr/checknsave/ico/ChatBot_66x66.png  
// http://crodriguez.free.fr/checknsave/ico/Aide_66x66.png  
    const NomEntry = params.NomEntry; //NomEntry
	const TelEntry = params.TelEntry; //TelEntry
	const LatEntry = params.LatEntry; //LatEntry 48.8938615
	const LngEntry = params.LngEntry; //LngEntry  2.2777903
	const AdresseEntry = params.AdresseEntry; //AdresseEntry 7 rue Paul Vaillant Couturier, 92300 Levallois-Perret
	const NatureProblemeEntry = params.NatureProblemeEntry; //NatureProblemeEntry
    const DateProblemEntry = params.DateProblemEntry;  //DateProblemEntry   08/12/18
	const TimeProblemEntry = params.TimeProblemEntry;  //TimeProblemEntry  16h00
	const RisqueEventuelEntry= 'Aucun risques éventuels, ni sur-accident';
    const NbrVictimeEntry='1';
	const EtatVictimeEntry='La victime est inconsciente et ne respire plus';
	const PremieresMesuresEntry='Alerter les urgences + RCP (avec défibrillateur)';

if ( !conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT') ) {
		return conv.ask('Sorry, try this on a screen device or select the phone surface in the simulator.');
	}else{

		// Create a basic card
		return conv.ask(new BasicCard({
			formattedText: "BILAN",
			subtitle: AdresseEntry,
			title: NatureProblemeEntry,
			buttons: new Button({
				title: 'Envoyer Bilan',
				url: '',
			}),
			image: new Image({
				url: 'http://crodriguez.free.fr/checknsave/ico/Bilan_66x66.png',
				alt: 'Image alternate text',
			})
		}));
	
	}
	return conv.ask('Un bilan a été transmis par mail aux urgences');

});


/******************GEOLOCALISATION DEFIBRILLATEUR LE PLUS PROCHE D'UNE VICTIME************/
app.intent('DEFIBRILLATEUR_INTENT', (conv, params, permissionGranted) => {

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
//http://owaveservices.info:5003/defibrilatteurs/48.8938615/2.2777903/0/1
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

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);


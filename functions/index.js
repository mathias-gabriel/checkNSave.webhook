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
//  Auteurs  Mathias, Adrien  et Carlos  ver 0.8 le 07/12/18  19h45 

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
/******************REQUEST_PERMISSION    AUTORISATION ACTIVATION GEOLOCALISATION SUR DEVICE************/
app.intent('REQUEST_PERMISSION', (conv) => {
	
	conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';
	return conv.ask(new Permission({
		context: 'pour vous localiser',
		// localise moi
		permissions: conv.data.requestedPermission,
	}));

});
/******************USER_INFO    Defibrillateur Géolocalisé  si  autorisation de l'utilisateur et Localisation=Activée************/
app.intent('USER_INFO', (conv, params, permissionGranted) => {

	if (permissionGranted) {

		const {requestedPermission} = conv.data;

		if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {
			console.log(conv.device.location.coordinates.latitude);
			const latitude = conv.device.location.coordinates.latitude;
			console.log(conv.device.location.coordinates.longitude);
			const longitude = conv.device.location.coordinates.longitude;

			return new Promise(function(resolve, reject){

				request('http://owaveservices.info:5003/defibrilatteurs/'+latitude+'/'+longitude+'/0/1', function (err, response, body) {
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
				var adresse = val[0].localisatio;
				//var name = val[0].name;
				var ville = val[0].ville;

var message = 'Nous avons trouvé un défibrillateur à '+distance+' mètres au '+adresse+' à '+ville+' et un bilan a été transmis aux urgences. Souhaitez vous des informations supplémentaires?';
 //Souhaitez vous que j\'affiche l\'itinéraire pour aller le chercher? Clicquez sur l\'icone localisation en bleu';            
			 conv.ask(message);   
if ( !conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT') ) {
	return conv.ask('Désolé mais veuillez utiliser un smartphone ou ChromeCastTV pour visualiser les informations');
	}else{
		// Create a basic card
		return conv.ask(new BasicCard({
			title: 'DEFIBRILLATEUR',
			subtitle: 'Distance et adresse',
			formattedText: message,
			button: new Button({
				title: 'Itinéraire',
				url: 'http://crodriguez.free.fr/checknsave/ico/Defibrillateur_66x66.png'
			}),
			image: new Image({
				url: 'crodriguez.free.fr/checknsave/ico/GPS_66x66.png',
				alt: 'Image alternate text' //Image alternate text
			})
		}));		
	}
	
			}).catch(function(err) {
				console.log(err);
				return conv.ask('Nous n\'avons pas pu trouvé de défibrillateur.');
			});

		}else{
			return conv.ask('vos informations n\'ont pas été envoyé.');
		}

	} else {
		return conv.ask('Désolé je n\'ai pas les autorisations nécessaires pour vous géolocaliser.Veuillez réactiver la localisation');
	}

});

/******************BILAN A ENVOYER PAR MAIL AUX URGENCES************/
app.intent('BILAN_INTENT', (conv, params) => {
	
// 	BILAN à écrire dans le Mail d'envoie au Urgences
// 	Objet: Bilan d'un accident au 7 rue Paul Vaillant Couturier, 92300 Levallois-Perret 08/12/18 16h00
//	Nom: Carlos Rodriguez
//	Tél: 0624102987
//	Nature du problème: Accident cardiovasculaire dans un Hackathon 
//	Risques éventuels: Aucun risques éventuels, ni sur-accident 
//	Localisation précise de l'événement: 7 Rue Paul Vaillant Couturier, 92300 Levallois-Perret 
//	Nombre de personnes concernées= 1 victime
//	Etat de chaque victime= La victime est inconsciente et ne respire plus
//	Premières mesures prises= Alerter les urgences + Réanimation Cardio Pulmonaire (RCP) (avec défibrillateur)
//  http://owaveservices.info:5003/defibrilatteurs/48.8938615/2.2777903/0/1
//  http://owaveservices.info:5003/send_report_by_email/Carlos/0624102987/48.8938615/2.2777903
// http://owaveservices.info:8080/images/CheckList_66x66.png  
// http://owaveservices.info:8080/images/Bilan_66x66.png
// http://owaveservices.info:8080/images/ChatBot_66x66.png  
// http://owaveservices.info:8080/images/Aide_66x66.png
//http://owaveservices.info:8080/images/Bilan_66x66.png
//http://owaveservices.info:8080/images/Aide_66x66.png
//http://owaveservices.info:8080/images/ChatBot_66x66.png
//http://owaveservices.info:5003/apidocs/#/default/get_defibrilatteurs__lat___lng___position___limit_
//http://owaveservices.info:5003/apidocs/#/default/post_send_report_by_email
  //http://owaveservices.info:5003/apidocs/48.8938615/2.2777903
    //const NomEntry = params.NomEntry; //NomEntry
	//const TelEntry = params.TelEntry; //TelEntry
	//const LatEntry = params.LatEntry; //LatEntry 48.8938615
	//const LngEntry = params.LngEntry; //LngEntry  2.2777903
	//const AdresseEntry = params.AdresseEntry; //AdresseEntry 7 rue Paul Vaillant Couturier, 92300 Levallois-Perret
	//const NatureProblemeEntry = params.NatureProblemeEntry; //NatureProblemeEntry
	//plus d'info RCP
	//Accident cardiovasculaire dans un Hackathon
	//envoyer le bilan
    //const DateProblemEntry = params.DateProblemEntry;  //DateProblemEntry   08/12/18
	//const TimeProblemEntry = params.TimeProblemEntry;  //TimeProblemEntry  16h00
	//const RisqueEventuelEntry= 'Aucun risques éventuels, ni sur-accident';
    //const NbrVictimeEntry='Une';
	//const EtatVictimeEntry='La victime est inconsciente et ne respire plus';
	//const PremieresMesuresEntry='Alerter les urgences et RCP avec défibrillateur';
//http://owaveservices.info:5003/address/48.8938615/2.2777903
const NatureProblemeEntry='Accident cardiovasculaire dans un Hackathon';
conv.ask(`${NatureProblemeEntry} au 7 Rue Paul Vaillant Couturier, 92300 Levallois-Perret . Un bilan a été transmis par mail aux urgences. Je vous remercie d\'avoir utiliser ce ChatBot.Les secours ne vont pas trop tarder à arriver`);


if ( !conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT') ) {
	return conv.ask('Désolé mais veuillez utiliser un smartphone ou ChromeCastTV pour visualiser les informations');
	}else{

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

			// Create a basic card
			return conv.ask(new BasicCard({
				title: 'BILAN',
				subtitle: 'Nature du problème',
				formattedText: NatureProblemeEntry,
				button: new Button({
					title: 'Envoyer Bilan',
					url: 'http://owaveservices.info:8080/images/Alerter_66x66.png'
				}),
				image: new Image({
					url: 'http://owaveservices.info:8080/images/Bilan_66x66.png',
					alt: 'Image alternate text', //Image alternate text
				})
			}));
			
		}).catch(function(err) {
			console.log(err);
			return conv.ask('vos informations n\'ont pas été envoyé.');
		});
	
	
		
	}
	//return conv.ask('Nous vous inquiettez pas, les secours ne vont pas trop tarder à arriver');
  //Très bien. Les secours arrivent très rapidement.
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);


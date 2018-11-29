/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ChecknSave Le ChatBot Assistant Secouriste et Formateur Auteur Carlos Rodriguez  ver0.6 le 29.11.2018
 */

'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
process.env.DEBUG = 'CHECKNSAVE:*'; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  //.region('europe-west1')	
  const agent = new WebhookClient({ request, response });

function DEMANDER_AIDE_VICTIME_FONCTION (agent) {
    // Get parameter from Dialogflow with the string to add to the database
    const NomEntry = agent.parameters.NomEntry; //NomEntry
	const TelEntry = agent.parameters.TelEntry; //TelEntry
	const GpsEntry = agent.parameters.GpsEntry; //GpsEntry
	//const NatureProblemeEntry = agent.parameters.NatureProblemeEntry; //NatureProblemeEntry
    const dialogflowAgentRef = db.collection('CHECKNSAVE').doc('Victime');
    return db.runTransaction(t => {
      t.set(dialogflowAgentRef, {NOM: NomEntry,Tél: TelEntry,GPS: GpsEntry}); 
      return Promise.resolve('Ecriture correctement effectuée');
    }).then(doc => {
     agent.add(`Merci et maintenant répondez par Oui ou par Non à mes questions`);
	 //agent.tell('checklist');
    }).catch(err => {
      console.log(`Erreur d'écriture en base: ${err}`);
      agent.add(`Erreur de mémorisation des données en base.`);
    });
  }

function CHECKLIST_FONCTION (agent) {
    // Get parameter from Dialogflow with the string to add to the database
    const SaignementEntry = agent.parameters.SaignementEntry;
    const EtouffementEntry = agent.parameters.EtouffementEntry;
	const ConscienteEntry = agent.parameters.ConscienteEntry;
	const RespireEntry = agent.parameters.RespireEntry;
    const dialogflowAgentRef = db.collection('CHECKNSAVE').doc('Checklist');
    return db.runTransaction(t => {
      t.set(dialogflowAgentRef, {Saigenement: SaignementEntry,Etouffement: EtouffementEntry,Consciente: ConscienteEntry, Respire: RespireEntry}); 
      return Promise.resolve('Ecriture correctement effectuée');
    }).then(doc => {
      //agent.add(`La checklist a bien été enregistrée.`);
	  // à faire fonction Matrice  4 Q/ OUI/NON -----> DiagProbable -----> TitreFormation
	  agent.add(`La victime nécessite de toute urgence une Réanimation Cardio Pulmonaire.Voulez-vous que je vous explique comment on fait une RCP? dites RCP`);
	  //agent.tell('RCP'); 
    }).catch(err => {
      console.log(`Erreur d'écriture en base: ${err}`);
      agent.add(`Erreur de mémorisation en base.`);
    });
  }
  
function DEMANDER_AIDE_TEMOIN_FONCTION (agent) {
    // Get parameter from Dialogflow with the string to add to the database
    const ModeEntry = agent.parameters.ModeEntry;
    const dialogflowAgentRef = db.collection('CHECKNSAVE').doc('Témoin');
    return db.runTransaction(t => {
      t.set(dialogflowAgentRef, {Mode: ModeEntry}); //Mode Assistant-secouriste Mode Formateur
      return Promise.resolve('Ecriture correctement effectuée');
    }).then(doc => {
      agent.add(`"${ModeEntry}"`);
	  //agent.tell('formateur');
    }).catch(err => {
      console.log(`Erreur d'écriture en base: ${err}`);
      agent.add(`Erreur de mémorisation du mode sélectionné en base.`); //"${databaseEntry}"
    });
  }

function FORMATION_FONCTION (agent) {
    // Get parameter from Dialogflow with the string to add to the database
    const TitreFormationEntry  = agent.parameters.TitreFormationEntry ; //TitreFormationEntry 
	//  Pour TitreFormationEntry   nous mettrons  ex  RCP_INTENT  + RCP_VIDEO_INTENT
    const dialogflowAgentRef = db.collection('CHECKNSAVE').doc('Formation');
    return db.runTransaction(t => {
      t.set(dialogflowAgentRef, {TitreFormation: TitreFormationEntry }); 
      return Promise.resolve('Ecriture correctement effectuée');
    }).then(doc => {
	  agent.add(`OK je vais vous montrer quels sont les gestes à faire pour "${TitreFormationEntry}" dites "${TitreFormationEntry}"`);
	  //agent.tell(`"${TitreFormationEntry}"`);
      //agent.tell('RCP');	  
    }).catch(err => {
      console.log(`Erreur d'écriture en base: ${err}`);
      agent.add(`Erreur de mémorisation en base.`);
    });
  }
  
function RCP_FONCTION (agent) {
    // Get parameter from Dialogflow with the string to add to the database
    const DefibrillateurEntry = agent.parameters.DefibrillateurEntry; //DefibrillateurEntry
	const Titre_VideoEntry = agent.parameters.Titre_VideoEntry; //Titre_VideoEntry
	//  Pour RCP_INTENT  on pose la question s'il souhaite avoir le défibrillateur le plus proche et si OUI ----> on lui dit + afficahege map + le témoin nous demande la vidéo RCP_VIDEO_INTENT
    const dialogflowAgentRef = db.collection('CHECKNSAVE').doc('Formation');
    return db.runTransaction(t => {
      t.set(dialogflowAgentRef, {Défibrillateur: DefibrillateurEntry,Titre: Titre_VideoEntry}); 
      return Promise.resolve('Ecriture correctement effectuée');
    }).then(doc => {
	  agent.add(`Nous avons trouvé un défibrillateur à 200 mètres. Dites "${Titre_VideoEntry}" si vous souhaitez visualiser une vidéo de formation`);  //ex  RCP vidéo
	  //agent.tell(`"${Titre_VideoEntry}"`);
	  //agent.tell('vidéo RCP');	  
    }).catch(err => {
      console.log(`Erreur d'écriture en base: ${err}`);
      agent.add(`Erreur de mémorisation en base.`);
    });
  }

function RCP_VIDEO_FONCTION (agent) {
    // Get parameter from Dialogflow with the string to add to the database
    const Lien_videoEntry = agent.parameters.Lien_videoEntry; //https://www.youtube.com/watch?v=4W5X-9BQjlU
	const Type_deviceEntry = agent.parameters.Type_deviceEntry; //  Chromecast ou Smarphone ?
	//  Pour le lien de la vidéo RCP_VIDEO_INTENT  il faudra mettre  Btn  arrêt/pause/de lecture vidéo  commander avec la voix
    const dialogflowAgentRef = db.collection('CHECKNSAVE').doc('Formation');
    return db.runTransaction(t => {
      t.set(dialogflowAgentRef, {Lien: Lien_videoEntry, Type: Type_deviceEntry}); 
      return Promise.resolve('Ecriture correctement effectuée');
    }).then(doc => {
	  //agent.add(`Daccord j'ai mis "${Titre_VideoEntry}" sur votre "${Type_deviceEntry}"`);
	  agent.add(`Daccord j'ai mis "${Lien_videoEntry}" sur votre "${Type_deviceEntry}"`);
	  //agent.tell(`Le lien est "${Lien_videoEntry}"`); 
    }).catch(err => {
      console.log(`Erreur d'écriture en base: ${err}`);
      agent.add(`Erreur de mémorisation en base.`);
    });
  }

  // Map from Dialogflow intent names to functions to be run when the intent is matched
  let intentMap = new Map();
  //intentMap.set('PROTEGER_INTENT', PROTEGER_FONCTION); //$Risque_eventuelEntry  Il y a t-il des risques éventuels? Oui? ou Non?
  intentMap.set('DEMANDER_AIDE_VICTIME_INTENT', DEMANDER_AIDE_VICTIME_FONCTION);
 //intentMap.set('GPS_INTENT', GPS_FONCTION); // GPS LatEntry LngEntry Lat=48.8938615,Lng=2.2777903
  intentMap.set('CHECKLIST_INTENT', CHECKLIST_FONCTION);
  //intentMap.set('NATURE_PROBLEME_INTENT', NATURE_PROBLEME_FONCTION);//La nature de votre problème est bien  $NatureProblemeEntry . Est-ce exacte Oui? ou Non?
  //BILAN_INTENT
  //intentMap.set('ALERTER_INTENT', ALERTER_FONCTION); // $BilanEntry oui non envoyé par SMS
  intentMap.set('DEMANDER_AIDE_TEMOIN_INTENT', DEMANDER_AIDE_TEMOIN_FONCTION);
  intentMap.set('FORMATION_INTENT', FORMATION_FONCTION); // TitreFormationEntry
   //SAIGNEMENT_VIDEO_INTENT
   //ETOUFFEMENT_VIDEO_INTENT
   //CONSCIENTE_VIDEO_INTENT
   //DEFIBRILLATEUR_VIDEO_INTENT
//RESPIRE_VIDEO_INTENT
//MALAISE_VIDEO_INTENT
//PLAIE_VIDEO_INTENT
//BRULURE_VIDEO_INTENT
//TRAUMATISME_VIDEO_INTENT   
  intentMap.set('RCP_INTENT', RCP_FONCTION); // DefibrillateurEntry Titre_VideoEntry  
  intentMap.set('RCP_VIDEO_INTENT', RCP_VIDEO_FONCTION); //Lien_videoEntry  Type_deviceEntry
  //intentMap.set('PLS_INTENT', PLS_FONCTION); // PLS_INTENT  FormationEntry
  //PLS_VIDEO_INTENT
  //REQUEST_PERMISSION @sys.date-period 
  //USER_INFO   erreur de traitement de la demande de localisation
 // intentMap.set('INCONNUE_INTENT', INCONNUE_INTENT_FONCTION); // Default Fallback Intent  INCONNUE_INTENT  action = input.unknown
  agent.handleRequest(intentMap);
});

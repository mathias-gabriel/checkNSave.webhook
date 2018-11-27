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
 * ChecknSave Le ChatBot Assistant Secouriste et Formateur Auteur Carlos Rodriguez  ver0.4
 */

'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');

process.env.DEBUG = 'BILAN:*'; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

function DEMANDER_AIDE_VICTIME_FONCTION (agent) {
    // Get parameter from Dialogflow with the string to add to the database
    const NomEntry = agent.parameters.NomEntry; //NomEntry
	const TelEntry = agent.parameters.TelEntry; //TelEntry
	const GpsEntry = agent.parameters.GpsEntry; //GpsEntry
    // Get the database collection 'dialogflow' and document 'agent' and store
    // the document  {entry: "<value of database entry>"} in the 'agent' document
    const dialogflowAgentRef = db.collection('BILAN').doc('Victime');
    return db.runTransaction(t => {
      t.set(dialogflowAgentRef, {NOM: NomEntry, Tél: TelEntry, GPS: GpsEntry}); 
      return Promise.resolve('Ecriture correctement effectuée');
    }).then(doc => {
      agent.add(`Votre NOM "${NomEntry}" et votre numéro de télephone "${TelEntry}" et votre GPS est activé "${GpsEntry}" ont bien été enregistrés.`);
    }).catch(err => {
      console.log(`Erreur d'écriture en base: ${err}`);
      agent.add(`Erreur de mémorisation de votre Nom en base.`);
    });
  }

function DEMANDER_AIDE_TEMOIN_FONCTION (agent) {
    // Get parameter from Dialogflow with the string to add to the database
    const ModeEntry = agent.parameters.ModeEntry;
    // Get the database collection 'dialogflow' and document 'agent' and store
    // the document  {entry: "<value of database entry>"} in the 'agent' document
    const dialogflowAgentRef = db.collection('BILAN').doc('Témoin');
    return db.runTransaction(t => {
      t.set(dialogflowAgentRef, {Mode: ModeEntry}); //databaseEntry @sys_any  $databaseEntry Mode Assistant-secouriste Mode Formateur
      return Promise.resolve('Ecriture correctement effectuée');
    }).then(doc => {
      agent.add(`Le mode choisi "${ModeEntry}" a bien été enregistré.`);
	  
    }).catch(err => {
      console.log(`Erreur d'écriture en base: ${err}`);
      agent.add(`Erreur de mémorisation du mode sélectionné en base.`); //"${databaseEntry}"
    });
  }

  
function readFromDb (agent) {
    // Get the database collection 'dialogflow' and document 'agent'
    const dialogflowAgentDoc = db.collection('BILAN').doc('Victime');

    // Get the value of 'entry' in the document and send it to the user
    return dialogflowAgentDoc.get()
      .then(doc => {
        if (!doc.exists) {
          agent.add('Désolé aucune donnée de trouvé!');
        } else {
          agent.add(doc.data().Mode);
        }
        return Promise.resolve('Lecture faite');
      }).catch(() => {
        agent.add('Erreur de lecture de la base de donnée.');
        agent.add('Vous pouvez ajouter un nouveau mot en disant, "Ecrit ta phrase dans la base"');
      });
  }
  // Map from Dialogflow intent names to functions to be run when the intent is matched
  let intentMap = new Map();
  //intentMap.set('DEMANDER_AIDE_INTENT', DEMANDER_AIDE_FONCTION);
  intentMap.set('DEMANDER_AIDE_VICTIME_INTENT', DEMANDER_AIDE_VICTIME_FONCTION);
  intentMap.set('DEMANDER_AIDE_TEMOIN_INTENT', DEMANDER_AIDE_TEMOIN_FONCTION);
  //intentMap.set('_INTENT', _FONCTION);
  agent.handleRequest(intentMap);
});

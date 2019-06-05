import personsID from "./data"
// import api from 'api/api';
// import * as idb from 'idb'
import store from '../index';
import * as dataActions from '../state/data/actions';

async function populateDB(api) {

   console.log("data",personsID)

   if (!('indexedDB' in window)) {
     console.error('This browser doesn\'t support IndexedDB');
     return;
   }

   var openRequest = indexedDB.open("blmp-db",2);
	openRequest.onupgradeneeded = function(e) {
		console.log("running onupgradeneeded");
		var thisDb = e.target.result;

		if(!thisDb.objectStoreNames.contains("objects")) {
			console.log("need to make the objectstore");
			let objectStore = thisDb.createObjectStore("objects");
			// objectStore.createIndex("title", "title", { unique: false });
		}

		if(!thisDb.objectStoreNames.contains("ontology")) {
			console.log("need to make the onoltogy objectstore");
			let objectStore = thisDb.createObjectStore("ontology");
			// objectStore.createIndex("title", "title", { unique: false });
		}
	}

	openRequest.onsuccess = async function(e) {
		var db = e.target.result;

		db.onerror = function(event) {
		   console.error("Database error: " + event.target.errorCode);
		};

		console.log("idb",db);

      let onto = await api.getOntology(true)

      var transaction = db.transaction(["ontology"], "readwrite");
      transaction.oncomplete = function(event) {
         console.log("Transaction ok");
      };

      transaction.onerror = function(event) {
		   console.error("Transaction error: " + transaction.error);
      };

      var ontoStore = transaction.objectStore("ontology");

      var objRequest = ontoStore.put(onto,"ontology/core");
      objRequest.onsuccess = function(event) {
        console.log("Added ",onto);
      };


      let i = 0
      for(let d of personsID) {
         let res = await api._getResourceData(d.res.value)
         console.log("res",res)

         var transaction = db.transaction(["objects"], "readwrite");
         transaction.oncomplete = function(event) {
            console.log("Transaction ok");
         };

         transaction.onerror = function(event) {
   		   console.error("Transaction error: " + transaction.error);
         };

         var objects = transaction.objectStore("objects");

         var objRequest = objects.put(res,d.res.value);
         objRequest.onsuccess = function(event) {
           console.log("Added",d.res.value);
         };

         i++;
         if(i > 100) break ;
      }

      alert("[experimental feature]\ntransfer complete");

      store.dispatch(dataActions.chosenHost("offline"));
      store.dispatch(dataActions.hostError("offline","offline endpoint"));

	}
}

export default populateDB ;


import personsID from "./data"
import api from 'api/api';
import * as idb from 'idb'

async function populateDB(api) {

   console.log("data",personsID)

   if (!('indexedDB' in window)) {
     console.error('This browser doesn\'t support IndexedDB');
     return;
   }

   var dbPromise = await idb.openDb('test-db', 1).then(upgradeDb => {
      console.log('making a new object store');
      if (!upgradeDb.objectStoreNames.contains('firstOS')) {
         upgradeDb.createObjectStore('firstOS');
      }
   });

   console.log("isok",dbPromise);

   /*   let i = 0
   for(let d of personsID) {
      let res = api._getResourceData(d.res.value)
      console.log("res",res)

      i++;
      if(i > 100) break ;
   }
   */


}

export default populateDB ;

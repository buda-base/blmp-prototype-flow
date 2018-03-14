// @flow
import store from 'index';
import Literal from 'lib/Literal';

let UNIQUE_ID = 0;
let ID = 0;

let LABEL_IRI = "http://www.w3.org/2000/01/rdf-schema#label";

export default class Individual {
    _id: ?string;
    _hasGeneratedId: boolean;
    _types: string[];
    _properties: {};
    _uniqueId: string;
    _namespaces: {};
    _label:string;
    _comment:RDFComment[];

    constructor(id: ?string, label:string = '',comm:RDFComment[] = []) {
        this._id = id;
        this._properties = {};
        this._types = [];
        this._uniqueId = 'INDIVIDUAL_' + UNIQUE_ID++;
        this._hasGeneratedId = false;
        this._label = label ;
        this._comment = comm ;
    }

    get uniqueId(): string {
        if (this._id) {
            return this._id;
        } else {
            return this._uniqueId;
        }
    }

    get id(): string {
        if (!this._id) {
            this._id = '_:b' + ID++;
            this._hasGeneratedId = true;
        }
        return this._id;
    }

    set id(newId: string) {
        if (newId.indexOf(":") === -1) {
            newId = ":" + newId;
        }
        this._id = newId;
    }

    get label(): ?string {
        const labels = this.getProperty(LABEL_IRI);
        let label;
        if (labels && labels.length > 0) {
            if (labels[0] instanceof Literal) {
                label = labels[0].value;
            }
        }
        return label;
    }

    get hasGeneratedId(): boolean {
        return this._hasGeneratedId;
    }

    get types(): string[] {
        return this._types;
    }

    set namespaces(namespaces: {}) {
        this._namespaces = namespaces;
    }

    get namespaces(): {} {
        return this._namespaces;
    }

    addType(type: string) {
        this._types.push(type);
    }

    getProperty(name: string): ?any[] {
        return this._properties[name];
    }

    addProperty(name: string, value: {}) {
        if (!this._properties[name]) {
            this._properties[name] = [];
        }
        if(value && value != {}) this._properties[name].push(value);

        // console.log("addI",name,value)
    }

   addDefaultProperties(c:RDFClass)
   {

         // console.log("id?",this._id)

      if (this._id === undefined) {
         // console.log("id set")
         this._id = '_:b' + ID++;
         this._hasGeneratedId = true;
      }

      // console.log("addProps",c,c?c._properties:'undef');

      if(c) {
         let sup = [].concat(c._superclasses)
         for(let s in c._superclasses) { sup = sup.concat(c._superclasses[s]._superclasses) ; }

         // console.log("sup",sup)

         let onto = store.getState().data.ontology
         let props = [].concat(Object.keys(c._properties))
         for(let s in sup){
            props = props.concat(Object.keys(sup[s]._properties))

            // + add annotation property that dont have domain eg prefLabel
            for(let a in onto._annotationProperties)
            {
               let anno = onto._annotationProperties[a]
               // console.log(onto._annotationProperties[a]._IRI)
               if(!anno._domains || anno._domains.length === 0)
               {
                  props.push(onto._annotationProperties[a]._IRI);
               }
            }
         }


         // console.log("props",props)

         for(let p in props){ this.addProperty(props[p]); }





      }
   }

    removeProperty(name: string, value: {}) {
        if (this._properties[name]) {
            this._properties[name] = this._properties[name].filter(val => val !== value);
        }
    }

    getProperties(type: ?string): {} {
        let props = {};
        if (type) {
            for (let prop in this._properties) {
                if (this._properties.hasOwnProperty(prop)) {
                    if (prop === type) {
                        props[prop] = this._properties[prop];
                    }
                }
            }
        } else {
            props = this._properties;
        }
        return props;
    }
}

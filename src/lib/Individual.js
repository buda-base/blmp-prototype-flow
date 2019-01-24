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
    _propTree: {};
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

   addDefaultProperties(c:RDFClass,addAnno:boolean=false)
   {

          console.log("id?",this._id,c)

      if (this._id === undefined) {
         // console.log("id set")
         this._id = '_:b' + ID++;
         this._hasGeneratedId = true;
      }

      //console.log("addProps",c,this._properties) //,c,c?c._properties:'undef');

      if(c) {

        this._propTree = { "/" : { "/class" : {}  , "/super" : {}, "/annotations" : {} } }


         let sup = [].concat(c._superclasses)
         let queue = sup.slice()


         console.log("queue",queue,sup)

         while( queue.length > 0 )
         {
           let head = queue[0]
           queue.shift()

           console.log("head",head._superclasses,sup)

           for(let s in head._superclasses) {
             queue = queue.concat(head._superclasses[s]._superclasses) ;
             sup = sup.concat(head._superclasses[s]._superclasses) ;
           }

           // console.log("queue",queue)
         }

         console.log("sup",sup)

         let onto = store.getState().data.ontology
         let props = []

         for(let p of Object.keys(c._properties)) {
           if(!p.match(/\/toberemoved\//)) {
               props.push(p)

               //console.log("p",p)

               this._propTree[p] = "/class"
             }
         }



         for(let s in sup){

            //console.log("sup",s)

            for(let p of Object.keys(sup[s]._properties)) {
               if(!p.match(/\/toberemoved\//)) {
                   props.push(p)

                   //console.log("q",p)

                   this._propTree[p] = "/super"

               }
            }
            // + add annotation property that dont have domain eg prefLabel

            // or not ? only at root level

            if(addAnno) for(let a in onto._annotationProperties)
            {
               let anno = onto._annotationProperties[a]
               // console.log(onto._annotationProperties[a]._IRI)
               if(!anno._domains || anno._domains.length === 0) {

                  if(!anno._IRI.match(/toberemoved/)) {

                     // // console.log("q",anno._IRI)

                     props.push(anno._IRI);

                    let p = anno._IRI

                     if(!p.match(/\/toberemoved\//)) {
                         props.push(p)

                         //console.log("r",p)

                         this._propTree[p] = "/annotations" ;
                      }
                  }
               }
            }
          }
          for(let p in props){

             //console.log("s",onto._properties[props[p]])

             this.addProperty(props[p]);

          }

          //console.log("propTree",this._propTree)
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

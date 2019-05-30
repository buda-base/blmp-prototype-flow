// @flow
import * as rdf from 'rdflib';
import { Namespace, NamedNode, BlankNode, Literal as LiteralNode } from 'rdflib';
import Ontology from './Ontology'
import Individual from './Individual'
import Literal from './Literal'

const RDF  = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const TYPE = RDF('type');

export default class Graph {
   _ontology: Ontology;
   _store: rdf.IndexedFormula;
   static _current : string ;
   static _individuAll : {} ;

   static create(data: string, baseIRI: string, mimeType: string, ontology: Ontology): Promise<Graph> {
      return new Promise((resolve, reject) => {
         new Graph(data, baseIRI, mimeType, ontology, (graph, error) => {
            if (error) {
               //                     console.log("error",error)
               reject(error);
            } else {
               //                     console.log("loaded")
               resolve(graph);
            }
         });
      });
   }

   static get current()
   {
      return this._current;
   }
   static set current(id : string)
   {
      this._current = id ;
      //        console.log("set",id,this.individuAll)
   }

   static get individuAll()
   {
      return this._individuAll;
   }
   static set individuAll(ids : {})
   {
      this._individuAll = ids ;
      //        console.log("set",id,this.individuAll)
   }

   constructor(data: string, baseIRI: string, mimeType: string, ontology: Ontology,
      onReady: (graph: Graph, error: string) => void) {
         this._ontology = ontology;
         this._store = rdf.graph();
         rdf.parse(data, this._store, baseIRI, mimeType, (error, store) => {
            if (!error) {
               this.init();
            }
            onReady(this, error);
         });

         this.setCurrent.bind(this);
         this.getIndividualWithId.bind(this);
      }

      init() {

      }

      /**
      * Returns individuals of any Class
      * @return {Individual[]}
      */
      listIndividuals(): Array<Individual> {
         return [];
      }

      getIndividualsWithType(type: string) {
         const node = rdf.sym(type);
         return this._store.statementsMatching(undefined, undefined, node);
      }

      getIndividualTypes(id: string): string[] {
         let types: string[] = [];
         try {
            const statements = this._store.statementsMatching(rdf.sym(id), TYPE, undefined);

            for (let statement of statements) {
               types.push(statement.object.value);
            }
         } catch(e) {}

         return types;
      }

      getIndividualWithId(id: string): Individual {

         // console.log("getIndiv",id,Graph.current,this._store);

         // let init = true ;

         let individual = new Individual(id);

         Graph.individuAll[id] = individual;

         // console.log("indiv",individual);

         this.getIndividualTypes(id).map(type => individual.addType(type));
         const node = rdf.sym(id);
         const statements = this._store.statementsMatching(node, undefined, undefined);
         for (let statement of statements) {

            // console.log("statement.predicate",statement.predicate,);

            const prop = statement.predicate;
            let value = statement.object.value;
            let individualRange;
            if (statement.object instanceof LiteralNode) {
               individualRange = statement.object.datatype.value;
            } else {
               const valueTypes = this.getIndividualTypes(value);
               const ranges = this._ontology.getRanges(prop);
               individualRange = ranges[0];

               if (ranges.length > 1) {
                  for (let range of ranges) {

                     if (this._ontology.isClass(range)) {

                        if (valueTypes.indexOf(range) !== -1) {
                           individualRange = range;
                           break;
                        }
                     } else if (statement.object.hasOwnProperty('datatype')) {
                        // a literal
                        if (statement.object.datatype.value === range) {
                           individualRange = range;
                           break;
                        }
                     }
                  }
               }
            }

            this._updateIndividual(individual, prop.value, individualRange, statement.object);
            // init = false ;
         }

         // console.log("indiv fin",individual);

         return individual;
      }

      _updateIndividual(individual: Individual, property: string, propertyRange: string, object: Node) {
         if (this._ontology.isClass(propertyRange) && object instanceof NamedNode) {

            if(object.value !== Graph.current && !Graph.individuAll[object.value]) {
               //                let value = Graph.individuAll[object.value]
               let value = this.getIndividualWithId(object.value);
               //                   console.log("recursive loop ?",individual.id,Graph.current,object.value)



               value.addType(propertyRange);
               individual.addProperty(property, value);
            }

         } else if (object instanceof BlankNode) {
            let blankIndividual = new Individual();
            let blankTypes = this._store.statementsMatching(object, TYPE, undefined);
            if (blankTypes.length > 0) {
               for (let blankType of blankTypes) {
                  blankIndividual.addType(blankType.object.value);
               }
            } else {
               blankIndividual.addType(propertyRange);
            }
            let blankProperties = this._store.statementsMatching(object, undefined, undefined);
            for (let blankStatement of blankProperties) {
               const blankProp = blankStatement.predicate.value;
               const blankObject = blankStatement.object;
               let blankPropType = propertyRange;
               if (blankObject.hasOwnProperty('datatype')) {
                  blankPropType = blankObject.datatype.value;
               }
               this._updateIndividual(blankIndividual, blankProp, blankPropType, blankObject);
            }
            individual.addProperty(property, blankIndividual);

            if (this._ontology.isClass(propertyRange)) {
               blankIndividual.addDefaultProperties(this._ontology._classes[propertyRange])
            }

         } else {
            let literal = new Literal(propertyRange, object.value, object.lang);
            individual.addProperty(property, literal);
         }
      }

      getAll() {
         return  this._store.statementsMatching(undefined, undefined, undefined);
      }

      get namespaces(): {} {
         return this._store.namespaces;
      }
   }

// @flow
import * as ui from '../state/ui/actions';
import store from 'index';
import React, {Component} from 'react';
import './LiteralView.css';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
// import DatePicker from 'material-ui/DatePicker';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Literal from '../lib/Literal';
import Collapse from 'material-ui/transitions/Collapse';
import List , {ListItem, ListItemText, ListSubheader, ListItemSecondaryAction, ListItemIcon} from 'material-ui/List';
import ExpandMore from 'material-ui-icons/ExpandMore';
import ExpandLess from 'material-ui-icons/ExpandLess';

const styles = {
    inlineSelect: {
        width: '105px',
        float: 'left'
    },
    valueField: {
        width: 'calc(100% - 105px)'
    }
};

const langs = {
    'bo': 'Tibetan',
    'bo-x-ewts': 'Tibetan (Wylie)',

    'en': 'English',
    "en-x-mixed":'English (mixed)',

    'fr': 'French',

    'pi': 'Pali',
    'pi-Sinh': 'Pali (Sinhalese)',
    'pi-Thai': 'Pali (Thai)',
    'pi-x-iast': 'Pali (IAST)',

    'sa':'Sanskrit',
    'sa-x-ndia':'Sanskrit (IAST without diacritics)',

    'zh': 'Chinese',
    'zh-Hans' : 'Chinese (simplified)',
    'zh-Hant' : 'Chinese (traditional)',
    'zh-Latn-pinyin' : 'Chinese (Pinyin)',
    'zh-x-wade':'Chinese (Wade-Giles)'
};

// some structure like that
const langTree = {
   'bo' : [ 'bo-x-ewts' ],
   'en' : [ 'en-x-mixed' ],
   'fr' : [ ],
   'pi' : [ 'pi-Sinh', 'pi-Thai', 'pi-x-iast' ],
   'sa' : [ 'sa-x-ndia' ],
   'zh' : [ 'zh-Hans', 'zh-Hant','zh-Latn-pinyin', 'zh-x-wade' ]
};


interface Props {
    literal: Literal,
    onChange?: (value: string, language: string) => void,
    isEditable: boolean,
    noPrefix:boolean
}

interface State {
   changed:boolean,
    language: string,
    value: string,
    collapseState: {},
}

export default class LiteralView extends Component<Props, State> {
    _languageControl: Component<any>;
    _valueControl: Component<any>;
    _id: {} = {};
    _literal: Literal;

    props: Props;
    state: State;

    constructor(props: Props) {
        super(props);

        let language = (props.literal.language !== undefined) ? props.literal.language : 'en';
        for(let l in langs) { if(l.toLowerCase() == language.toLowerCase()) { language = l ; } }
        this.props.literal.language = language ;

//         console.log("lang",language)

        this.state = {
           change:false,
            language: language,
            value: props.literal.value,
            collapseState: {}
        }
        this._literal = this.props.literal ;

        //console.log("LiteralView.state",this.state)
    }


    setCollapseState(id: string, open: boolean) {
        const collapseState = {
            ...this.state.collapseState,
            [id]: open
        };
        this.setState((prevState, props) => {
            return {
                ...prevState,
                collapseState
            }
        })
    }

    toggleCollapseState(id: string) {
        let open;
        if (this.state.collapseState[id] === undefined) {
            open = true;
        } else {
            open = !this.state.collapseState[id];
        }

        this.setCollapseState(id, open);
    }

    toggleExpandedState() {
        this.setState((prevState, props) => {
            return {
                ...prevState,
                isExpanded: !prevState.isExpanded
            }
        })
    }


   /*
   componentWillReceiveProps(newProps)
   {
        console.log("will receiveprops literalView",this.props.literal)
   }

   componentWillUpdate()
   {
        console.log("will update literalView",this.props.literal)
    }
   componentDidUpdate()
   {
        console.log("did update literalView",this.props.literal)
    }
    */

    valueChanged(event: {}) {

        let value = event.target.value;
        if (this.props.literal.isDate && (value instanceof String)) {
            value = new Date(value);
        }
        this.props.literal.value = value;
        this.setState((prevState, props) => {
            return {
                ...prevState,
                value
            }
        });
        this.setState({changed:true})
        //this.literalChanged();
    }

    languageChanged(event: {}) {
        let value = event.target.value;
        this.props.literal.language = value;
        this.setState((prevState, props) => {
            return {
                language: value
            }
        });
        //this.literalChanged();
         this.setState({changed:true})
    }

    literalChanged() {
        if (this.props.onChange && this.state.changed) {
           // store.dispatch(ui.savingData())
           this.setState({changed:false})
            const literal = this.props.literal;
            setTimeout((function(that,lit){ return function(){
               that.props.onChange(lit.value, lit.language) } } )(this,literal), 10);

            // this.props.onChange(literal.value, literal.language)
           // store.dispatch(ui.savedData())
        }
    }

    generateId(type: string) {
        if (!this._id[type]) {
            this._id[type] = type + Date.now();
        }
        return this._id[type];
    }

    render() {


        let value = this.props.literal.value;
        if (this.props.isEditable) {
            if (this.props.literal.isDate) {
                value = <TextField
                    type="datetime-local"
                    value={this.props.literal.value.replace(/:[.0-9]+Z$/,"")}
                    onBlur={this.literalChanged.bind(this)}
                    onChange={this.valueChanged.bind(this)}
                />
            } else {
                const valueFloatingLabel = (this.props.literal.hasLanguage && this.props.isEditable) ? " " : "";
                value = <TextField
                    // floatingLabelText={valueFloatingLabel}
                    // floatingLabelFixed={true}
                    value={this.props.literal.value}
                    ref={(textField) => this._valueControl = textField}
                    onBlur={this.literalChanged.bind(this)}
                    onChange={this.valueChanged.bind(this)}
                    { ... this.props.literal.hasLanguage && this.props.isEditable ?
                        {style: styles.valueField } : {}}
                    id={this.generateId('TextField')}
                />
            }
        }

/*
         let handleCollapse = (e,collapseId) => {
                  e.preventDefault();
               this.toggleCollapseState(collapseId);
                  return false;
         };

         let langItems = [ ];
        let list = ['zh'].concat(langTree['zh'])



        for (let lang in list) {
            langItems.push(
               <MenuItem

                  key={list[lang]}
                  value={list[lang]}
               >
                  {langs[list[lang]]}
               </MenuItem>
            );
        }


        langItems = [ <ListItem onClick={(e) => handleCollapse(e,'zh')}> { langs['zh'] } <ExpandMore/></ListItem>,<Collapse in={this.state.collapseState['zh']}> {langItems} </Collapse>,
               <ListItem onClick={(e) => handleCollapse(e,'pi')}> { langs['pi'] } <ExpandMore /></ListItem>,<Collapse in={this.state.collapseState['pi']}> {langItems} </Collapse>
      ];
         */



         let langItems = [ ];
        for (let lang in langs) {
            langItems.push(
               <MenuItem

                  key={lang}
                  value={lang}
               >
                  {langs[lang]}
               </MenuItem>
            );
        }

        const selectId = this.generateId(this.props.literal.uniqueId);

            //</Collapse>
        return (
            <div className="literalView">
                {this.props.literal.language && !this.props.isEditable && !this.props.noPrefix &&
                <strong>{langs[this.props.literal.language]}: </strong>
                }
                {this.props.literal.hasLanguage && this.props.isEditable &&
                /*
                <FormControl>
                    <InputLabel htmlFor={selectId}>language</InputLabel>
                     <Select
                        disabled={true}
                        value={ this.props.literal.language }
                        style={ styles.inlineSelect }
                        onInputChange={ function(e) { e.preventDefault(); console.log("youpi"); return false; } }
                     >
                        <List>{langItems}</List>
                     </Select>
                </FormControl>
                 */

                     <FormControl>
                        <InputLabel htmlFor={selectId}>language</InputLabel>
                           <Select
                              // floatingLabelText="lang"
                              // floatingLabelFixed={true}
                              // fullWidth={false}
                              style={styles.inlineSelect}
                              value={this.props.literal.language}
                              ref={(select) => this._languageControl = select}
                              onChange={this.languageChanged.bind(this)}
                              // id={selectId}
                              input={<Input id={selectId} />}
                              >
                              {langItems}
                           </Select>
                     </FormControl>
                  }
                {value}
            </div>
        );
    }
};

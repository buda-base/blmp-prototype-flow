// @flow
import React, {Component} from 'react';
import './LiteralView.css';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
// import DatePicker from 'material-ui/DatePicker';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Literal from '../lib/Literal';

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
    'pi-Sinh': 'Pali (Sinhalese)',
    'pi-Thai': 'Pali (Thai)',
    'pi-x-iast': 'Pali (IAST)',
    'sa-x-ndia':'Sanskrit (IAST without diacritics)',
    'zh': 'Chinese',
    'zh-Hans' : 'Chinese (simplified)',
    'zh-Hant' : 'Chinese (traditional)',
    'zh-Latn-pinyin' : 'Chinese (Pinyin)',
    'zh-x-wade':'Chinese (Wade-Giles)'
}; 

/* // some structure like that
const langTree = {
   'bo':
   {
      'bo': 'Tibetan',
      'bo-x-ewts': 'Tibetan (Wylie)'
   },
    'en': 'English',
    "en-x-mixed":'English (mixed)',
    'fr': 'French',
    'pi-Sinh': 'Pali (Sinhalese)',
    'pi-Thai': 'Pali (Thai)',
    'pi-x-iast': 'Pali (IAST)',
    'sa-x-ndia':'Sanskrit (IAST without diacritics)',
    'zh': 'Chinese',
    'zh-Hans' : 'Chinese (simplified)',
    'zh-Hant' : 'Chinese (traditional)',
    'zh-Latn-pinyin' : 'Chinese (Pinyin)',
    'zh-x-wade':'Chinese (Wade-Giles)'
};
*/

interface Props {
    literal: Literal,
    onChange?: (value: string, language: string) => void,
    isEditable: boolean,
    noPrefix:boolean
}

interface State {
    language: string,
    value: string
}

export default class LiteralView extends Component<Props, State> {
    _languageControl: Component<any>;
    _valueControl: Component<any>;
    _id: {} = {};

    props: Props;
    state: State;

    constructor(props: Props) {
        super(props);
        const language = (props.literal.language !== undefined) ? props.literal.language : 'en';
        this.state = {
            language: language,
            value: props.literal.value
        }
        //console.log("LiteralView.state",this.state)
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
        this.literalChanged();
    }

    languageChanged(event: {}) {
        let value = event.target.value;
        this.props.literal.language = value;
        this.setState((prevState, props) => {
            return {
                language: value
            }
        });
        this.literalChanged();
    }

    literalChanged() {
        if (this.props.onChange) {
            const literal = this.props.literal;
            this.props.onChange(literal.value, literal.language);
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
                    onChange={this.valueChanged.bind(this)}
                />
            } else {
                const valueFloatingLabel = (this.props.literal.hasLanguage && this.props.isEditable) ? " " : "";
                value = <TextField
                    // floatingLabelText={valueFloatingLabel}
                    // floatingLabelFixed={true}
                    value={this.props.literal.value}
                    ref={(textField) => this._valueControl = textField}
                    onChange={this.valueChanged.bind(this)}
                    { ... this.props.literal.hasLanguage && this.props.isEditable ? 
                        {style: styles.valueField } : {}}
                    id={this.generateId('TextField')}
                />
            }
        }
        let langItems = [];
        for (let lang in langs) {
            langItems.push(<MenuItem
                key={lang}
                value={lang}
            >
                {langs[lang]}
            </MenuItem>);
        }

        const selectId = this.generateId(this.props.literal.uniqueId);

        return (
            <div className="literalView">
                {this.props.literal.language && !this.props.isEditable && !this.props.noPrefix &&
                <strong>{langs[this.props.literal.language]}: </strong>
                }
                {this.props.literal.hasLanguage && this.props.isEditable &&
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

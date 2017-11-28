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
        width: '120px',
        float: 'left'
    },
    valueField: {
        width: 'calc(100% - 140px)'
    }
};

const langs = {
    'bo': 'Tibetan',
    'bo-x-ewts': 'Wylie',
    'en': 'English',
    'fr': 'French',
    'zh': 'Chinese'
};

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
    }

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
                    type="date"
                    value={this.state.value}
                    onChange={this.valueChanged.bind(this)}
                />
            } else {
                const valueFloatingLabel = (this.props.literal.hasLanguage && this.props.isEditable) ? " " : "";
                value = <TextField
                    // floatingLabelText={valueFloatingLabel}
                    // floatingLabelFixed={true}
                    value={this.state.value}
                    ref={(textField) => this._valueControl = textField}
                    onChange={this.valueChanged.bind(this)}
                    style={styles.valueField}
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
                    <InputLabel htmlFor={selectId}>lang</InputLabel>
                    <Select
                        // floatingLabelText="lang"
                        // floatingLabelFixed={true}
                        // fullWidth={false}
                        style={styles.inlineSelect}
                        value={this.state.language}
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

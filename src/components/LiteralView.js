// @flow
import React, {Component} from 'react';
import './LiteralView.css';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import DatePicker from 'material-ui/DatePicker';
import MenuItem from 'material-ui/MenuItem';
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

const langs = ['bo', 'bo-x-ewts', 'en', 'fr'];

interface Props {
    literal: Literal,
    onChange?: (value: string, language: string) => void
}

interface State {
    language: string,
    value: string
}

export default class LiteralView extends Component {
    _languageControl: Component<any>;
    _valueControl: Component<any>;
    _id: {} = {};

    props: Props;
    state: State;

    constructor(props: Props) {
        super(props);

        this.state = {
            language: props.literal.language,
            value: props.literal.value
        }
    }

    valueChanged(event: {}, value: string | Date) {
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

    languageChanged(event: {}, index: number, value: string) {
        this.props.literal.language = value;
        this.setState((prevState, props) => {
            return {
                language: value
            }
        });
        this.literalChanged(value);
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
                value = <DatePicker
                    value={this.state.value}
                    onChange={this.valueChanged.bind(this)}
                />
            } else {
                const valueFloatingLabel = (this.props.literal.hasLanguage && this.props.isEditable) ? " " : "";
                value = <TextField
                    floatingLabelText={valueFloatingLabel}
                    floatingLabelFixed={true}
                    defaultValue={this.state.value}
                    ref={(textField) => this._valueControl = textField}
                    onChange={this.valueChanged.bind(this)}
                    style={styles.valueField}
                    id={this.generateId('TextField')}
                />
            }
        }
        let langItems = [];
        for (let lang of langs) {
            langItems.push(<MenuItem key={lang} value={lang} primaryText={lang}/>);
        }

        return (
            <div className="literalView">
                {this.props.literal.language && !this.props.isEditable &&
                <strong>{this.props.literal.language}: </strong>
                }
                {this.props.literal.hasLanguage && this.props.isEditable &&
                <SelectField
                    floatingLabelText="lang"
                    floatingLabelFixed={true}
                    fullWidth={false}
                    style={styles.inlineSelect}
                    value={this.state.language}
                    ref={(select) => this._languageControl = select}
                    onChange={this.languageChanged.bind(this)}
                    id={this.generateId('SelectField')}
                >
                    {langItems}
                </SelectField>
                }
                {value}
            </div>
        );
    }
};
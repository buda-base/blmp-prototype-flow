// @flow
import React, {Component} from 'react';
import './LiteralView.css';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const styles = {
    inlineSelect: {
        width: 80,
        float: 'left'
    },
};

const langs = ['bo', 'en', 'fr'];

export default class LiteralView extends Component {
    _languageControl: Component<any>;
    _valueControl: Component<any>;

    constructor(props: {}) {
        super(props);

        this.state = {
            language: props.literal.language,
            value: props.literal.value
        }
    }

    valueChanged(event, value) {
        this.props.literal.value = value;
        this.setState((prevState, props) => {
            return {
                value
            }
        });
        this.literalChanged();
    }

    languageChanged(event, index, value) {
        this.props.literal.language = value;
        this.setState((prevState, props) => {
            return {
                language: value
            }
        });
        this.literalChanged();
    }

    render() {
        let value = this.props.literal.value;
        if (this.props.literal.isDate) {
            value = new Date(value);
        }
        if (this.props.isEditable) {
            value = <TextField
                floatingLabelText=" "
                floatingLabelFixed={true}
                defaultValue={this.state.value}
                ref={(textField) => this._valueControl = textField}
                onChange={this.valueChanged.bind(this)}
            />
        }
        let langItems = [];
        for (let lang of langs) {
            langItems.push(<MenuItem key={lang} value={lang} primaryText={lang}/>);
        }


        return (
            <div className={styles.literalView}>
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
                >
                    {langItems}
                </SelectField>
                }
                {value}
            </div>
        );
    }
};
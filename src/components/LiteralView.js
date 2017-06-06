import React, { Component } from 'react';
import styles from './LiteralView.css';

const LiteralView = props => {
    let value = props.literal.value;
    if (props.literal.type === 'http://www.w3.org/2001/XMLSchema#dateTime') {
        value = new Date(value);
    }
    return (
        <div className={styles.literalView}>
            {props.literal.language &&
                <strong>{props.literal.language}: </strong>
            }
            {value}
        </div>
    );
};

export default LiteralView;
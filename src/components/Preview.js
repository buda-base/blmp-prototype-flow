import React, { Component } from 'react';
import './Preview.css';

export default class Preview extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="graphPreview">
                <h3>Turtle Preview</h3>
                <div>
                {this.props.graphText}
                </div>
            </div>
        )
    }
}
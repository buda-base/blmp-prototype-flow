import React, { Component } from 'react';
import './Preview.css';
import hljs from 'highlight.js/lib/highlight';
import ttl from '../highlight_languages/ttl';
import 'highlight.js/styles/github-gist.css';

hljs.registerLanguage('ttl', ttl);

export default class Preview extends Component {
    _code: Component<any>;

    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        hljs.highlightBlock(this._code);
    }

    render() {
        return (
            <div className="graphPreview">
                <h3>Turtle Preview</h3>
                <pre>
                    <code className="turtle"
                        ref={(el => this._code = el).bind(this)}
                    >
                        {this.props.graphText}
                    </code>
                </pre>
            </div>
        )
    }
}
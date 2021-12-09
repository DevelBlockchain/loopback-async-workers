import React, { Fragment } from 'react';
import BywiseAPI from '../../../api/api';
import OverlayLoading from '../../common/overlay-loading';
import DialogModal from '../../common/dialog-modal';

import SeeContract from './see-contract';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-sql";

class CustomHighlightRules extends window.ace.acequire("ace/mode/text_highlight_rules").TextHighlightRules {

    constructor() {
        super();
        var keywords = (
            "return|nop|define|function|exec|end|mov|print|cast|equ|inv|gt|gte|le|lee|and|" +
            "or|add|sub|mul|div|exp|fixed|sqrt|abs|checkpoint|jump|jumpif|jumpnif|bywise|push|pop|set|has|" +
            "get|size|delete|require"
        );
        var builtinConstants = (
            "true|false|void"
        );
        var builtinFunctions = (
            "local|global|private|return|public|constant|payable|notpayable|input"
        );
        var dataTypes = (
            "number|string|boolean|binary|address|integer|array|map"
        );
        var keywordMapper = this.createKeywordMapper({
            "support.function": builtinFunctions,
            "keyword": keywords,
            "constant.language": builtinConstants,
            "storage.type": dataTypes
        }, "identifier", true);
        this.$rules = {
            start: [
                {
                    token: "comment",
                    regex: "#.*$"
                }, {
                    token: "string",
                    regex: '".*?"'
                }, {
                    token: "constant.numeric",
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                }, {
                    token: "constant.numeric",
                    regex: "0x[a-fA-F0-9]+"
                }, {
                    token: "constant.numeric",
                    regex: "BWS[0-9]+[MT][CU][0-9a-fA-F]{40}[0-9a-fA-F]{0,43}"
                }, {
                    token: keywordMapper,
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token: "comment",
                    regex: '\\@\\w+\\b'
                }, {
                    token: "storage.type",
                    regex: '\\@\\w+.*$'
                }, {
                    token: "text",
                    regex: "\\s+"
                }
            ]
        };
    }
}
class CustomSqlMode extends window.ace.acequire("ace/mode/sql").Mode {
    constructor() {
        super();
        this.HighlightRules = CustomHighlightRules;
    }
}
const sleep = async function sleep(ms) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
}

export default class Contracts extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            address: undefined,
        }
    }

    componentDidMount = () => {
        let address = this.props.match.params.address
        if(address) {
            this.setState({address});
        }
        console.log('address', address)
    }

    render() {
        return (
            <Fragment>
                <OverlayLoading show={this.state.loading} />
                <div className="container-fluid pt-5">
                    <div className="row">
                        <div className="col-sm-12">
                            <SeeContract address={this.state.address} />
                        </div>
                    </div>
                </div>
                <DialogModal ref={ref => this.dialog = ref} />
            </Fragment >
        );
    }
}
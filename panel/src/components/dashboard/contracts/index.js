import React, { Fragment } from 'react';
import BywiseAPI from '../../../api/api';
import OverlayLoading from '../../common/overlay-loading';
import DialogModal from '../../common/dialog-modal';
import ConfirmModal from '../../common/confirm-modal';
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
            "get|size"
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
            load: false,
            loadDep: false,
            modal: false,
            id: null,
            contract: {
                address: '',
                bytecode: '',
                nonce: 0,
            },
            success: false,
            successDep: false,
            text: "",
            logs: [],
            form: {
                account: '',
            }
        }
    }

    componentDidMount() {
        const customMode = new CustomSqlMode();
        this.refs.aceEditor.editor.getSession().setMode(customMode);
        let code = localStorage.getItem('code')
        if (code) {
            this.setState({
                text: code
            })
        }
        this.updateTable();
    }

    updateTable = async () => {
        await this.setState({ loading: true });

        let req = await BywiseAPI.get('/my-wallets');
        if (req.error) return;
        let wallets = req.data;
        let accounts = wallets.map(wallet => `${wallet.name} - ${wallet.address}`);
        let form = this.state.form;
        form.account = accounts[0];
        await this.setState({ loading: false, wallets, accounts, form });
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
    }

    toggleModal = () => {
        this.setState({ modal: !this.state.modal })
    }

    onChange = (newValue) => {
        this.setState({ text: newValue, success: false, successDep: false })
    }

    compile = async () => {
        await this.setState({ load: true });
        localStorage.setItem('code', this.state.text)
        await sleep(1000);
        let logs = [];
        let req = await BywiseAPI.post(`/compiler`, {
            value: this.state.text,
        });
        if (req.error) return;
        if (req.data.error) {
            logs.push(<span className="text-danger">{req.data.error}</span>)
        } else {
            let contract = req.data.contract;
            logs.push(<span className="text-success">Compilation success!</span>)
            logs.push(<span><strong>Contract Address:</strong> {contract.address}</span>)
            console.log(contract);
            let tx = {
                to: contract.address,
                amount: "0",
                type: 'contract',
                data: JSON.stringify(contract),
            };
            req = await BywiseAPI.post(`/users-transactions/simulate`, tx);
            console.log(req);
            if (req.error) {
                logs.push(<span className="text-danger">{req.error}</span>)
            } else {
                logs.push(<span><strong>Computational cost:</strong> {req.data.cost}</span>)
                logs.push(<span><strong>Data transaction size:</strong> {req.data.size}</span>)
                logs.push(<span><strong>Fee:</strong> {req.data.fee}</span>)
                if (req.data.logs) req.data.logs.forEach(log => {
                    logs.push(<span><strong>LOG:</strong> {log}</span>)
                })
                if (req.data.output) req.data.output.forEach(out => {
                    logs.push(<span><strong>OUTPUT:</strong> {out}</span>)
                })
            }
            this.setState({ error: '', success: true, contract: contract });
        }
        await this.setState({ load: false, logs });
    }

    deploy = async () => {
        await this.setState({ loadDep: true });
        await sleep(1000);
        let address = this.state.form.account.split(' - ')[1];
        let tx = {
            from: address,
            to: this.state.contract.address,
            amount: "0",
            type: 'contract',
            data: JSON.stringify(this.state.contract),
        };
        let req = await BywiseAPI.post(`/users-transactions`, tx);
        if (!req.error) {
            console.log(req.data);
            this.dialog.show('Transaction send!', <>
                <span>TxId: <a target="_blank" rel="noopener noreferrer" href={`${process.env.REACT_APP_EXPLORER_HOST}/tx/${req.data.hash}`} >{req.data.hash}</a></span>
            </>)
            this.setState({ successDep: true });
        }
        await this.setState({ loadDep: false });
    }

    render() {
        return (
            <Fragment>
                <OverlayLoading show={this.state.loading} />
                <div className="container-fluid pt-5">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Code your smartcontract</h5>
                                </div>
                                <div className="card-body">
                                    <AceEditor
                                        ref="aceEditor"
                                        mode="sql"
                                        theme="monokai"
                                        width="100%"
                                        showPrintMargin={true}
                                        showGutter={true}
                                        highlightActiveLine={true}
                                        onChange={this.onChange}
                                        name="UNIQUE_ID_OF_DIV"
                                        value={this.state.text}
                                        editorProps={{ $blockScrolling: true }}
                                    />
                                    <button className={this.state.success ? "btn btn-success mt-2" : "btn btn-primary mt-2"} disabled={this.state.load || this.state.success} onClick={this.compile}>{this.state.load ? 'Loading...' : (this.state.success ? 'Success' : 'Compile')}</button>
                                    <div>
                                        <label className="mt-2">Log:</label>
                                        <div className="box-log">
                                            {this.state.logs.map((item, i) => <div key={`log-${i}`}>{item}</div>)}
                                        </div>
                                    </div>
                                    {this.state.success && <>
                                        <div className="form-group mt-2">
                                            <label>Account</label>
                                            <select className="form-control digits"
                                                name="account"
                                                value={this.state.form.account}
                                                onChange={this.handleChange}>
                                                {this.state.accounts.map(account => <option key={account}>{account}</option>)}
                                            </select>
                                        </div>
                                        <button className={this.state.successDep ? "btn btn-success mt-2" : "btn btn-primary mt-2"} disabled={this.state.loadDep} onClick={this.deploy}>{this.state.loadDep ? 'Loading...' : (this.state.successDep ? 'Success' : 'Compile')}</button>
                                    </>}
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <SeeContract />
                        </div>
                    </div>
                </div>
                <ConfirmModal ref={ref => this.confirm = ref} />
                <DialogModal ref={ref => this.dialog = ref} />
            </Fragment >
        );
    }
}
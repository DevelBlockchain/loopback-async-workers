import React, { Component } from "react";

export default class SendCommand extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: false,
            inputs: [],
            form: {
                name: '',
                text: '',
            }
        };
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
    }

    addInput = (e) => {
        if (e.key === 'Enter') {
            const state = this.state;
            state.inputs.push(this.state.form.text);
            state.form.text = '';
            this.setState({ ...state });
        }
    }

    removeInput = (text) => {
        const state = this.state;
        state.inputs = state.inputs.filter(input => text !== input);
        this.setState({ ...state });
    }
    
    trySend = async () => {
        await this.setState({ load: true });
        const state = this.state;
        await this.props.trySend(JSON.stringify({
            name: state.form.name,
            input: state.inputs,
        }));
        await this.setState({ load: false });
    }

    render = () => {
        return (<>
            <div className="form-group">
                <label>Command</label>
                <select className="form-control digits"
                    name="name"
                    value={this.state.form.name}
                    onChange={this.handleChange}>
                    <option></option>
                    <option>setInfo</option>
                    <option>setBalance</option>
                    <option>setConfig</option>
                </select>
            </div>
            {this.state.inputs.map((input, i) => <p
                key={`input-${i}`}
                className="text-muted"
                style={{ cursor: 'pointer' }}
                onClick={() => this.removeInput(input)}
            >-&gt; {input}</p>)}
            <div className="form-group">
                <label>New Input</label>
                <input className="form-control"
                    type="text"
                    placeholder=""
                    name="text"
                    value={this.state.form.text}
                    onKeyDown={this.addInput}
                    onChange={this.handleChange} />
            </div>
            <button className="btn btn-primary" disabled={this.state.load} onClick={this.trySend}>{this.state.load ? 'Loading...' : 'Try Send'}</button>
        </>);
    }
}
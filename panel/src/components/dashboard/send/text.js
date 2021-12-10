import React, { Component } from "react";

export default class SendMensage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: false,
            form: {
                text: '',
            }
        }
    }

    handleChange = (event) => {
        let form = this.state.form
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
        form[event.target.name] = value
        this.setState({ form })
    }

    trySend = async () => {
        await this.setState({ load: true });
        await this.props.trySend({ text: this.state.form.text });
        await this.setState({ load: false });
    }

    render = () => {
        return (<>
            <div className="form-group">
                <label>Text</label>
                <input className="form-control"
                    type="text"
                    placeholder="Bywise it's awesome!"
                    name="text"
                    value={this.state.form.text}
                    onChange={this.handleChange} />
            </div>
            <button className="btn btn-primary" disabled={this.state.load} onClick={this.trySend}>{this.state.load ? 'Loading...' : 'Try Send'}</button>
        </>);
    }
}
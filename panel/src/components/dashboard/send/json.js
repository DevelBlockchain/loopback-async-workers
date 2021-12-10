import React, { Component } from "react";
import { toast } from 'react-toastify';

export default class SendJSON extends Component {

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
        let json = null;
        try {
            json = JSON.parse(this.state.form.text);
        } catch (err) {
            json = null;
            toast.error('invalid json');
        }
        if (json) {
            await this.props.trySend(json);
        }
        await this.setState({ load: false });
    }

    render = () => {
        return (<>
            <div className="form-group">
                <label>JSON</label>
                <textarea className="form-control"
                    type="text"
                    placeholder='{"text":"Your JSON data"}'
                    name="text"
                    value={this.state.form.text}
                    onChange={this.handleChange} />
            </div>
            <button className="btn btn-primary" disabled={this.state.load} onClick={this.trySend}>{this.state.load ? 'Loading...' : 'Try Send'}</button>
        </>);
    }
}
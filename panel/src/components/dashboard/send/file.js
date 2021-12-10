import React, { Component } from "react";

export default class SendFile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            load: false,
            file: null,
        }
        this._inputFile = React.createRef();
    }

    uploadWallet = (event) => {
        let file = event.target.files[0];
        let reader = new FileReader();
        console.log(file)
        reader.onload = (event) => {
            try {
                let base64File = event.target.result;
                this.setState({
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        encode: 'base64',
                        content: base64File,
                    }
                })
            } catch (e) {
                console.log(e);
                alert("Corrupted file");
            }
        };
        reader.readAsDataURL(file);
    }

    trySend = async () => {
        await this.setState({ load: true });
        await this.props.trySend(this.state.file);
        await this.setState({ load: false });
    }

    render = () => {
        return (<>
            <div className="form-group">
                <label>File</label>
                <input className="form-control"
                    ref={this._inputFile}
                    type="file"
                    onChange={this.uploadWallet} />
            </div>
            <button className="btn btn-primary" disabled={this.state.load} onClick={this.trySend}>{this.state.load ? 'Loading...' : 'Try Send'}</button>
        </>);
    }
}
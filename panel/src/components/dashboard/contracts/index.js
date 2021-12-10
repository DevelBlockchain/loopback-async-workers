import React, { Fragment } from 'react';
import BywiseAPI from '../../../api/api';
import OverlayLoading from '../../common/overlay-loading';
import DialogModal from '../../common/dialog-modal';
import SeeContract from './see-contract';
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
            load: true,
            address: undefined,
        }
    }

    componentDidMount = async () => {
        let address = this.props.match.params.address
        if (address) {
            await this.setState({ address, load: true });
            this.reloadContract();
        } else {
            await this.setState({ load: false });
        }
    }

    reloadContract = async () => {
        let req = await BywiseAPI.get(`/contracts/${this.state.address}/abi`, {}, false);
        if(req.error) {
            await sleep(5000);
            this.reloadContract();
        } else {
            this.setState({ load: false });
        }

    }

    render() {
        return (
            <Fragment>
                <OverlayLoading show={this.state.loading} />
                <div className="container-fluid pt-5">
                    <div className="row">
                        <div className="col-sm-12">
                            {this.state.load && <div className="card">
                                <div className="card-header border-none">
                                    <h5>Awaiting confirmation of contract on blockchain</h5>
                                </div>
                                <div className="card-body text-center mt-3 mb-5">
                                    <div className="loader">
                                        <div className="line bg-primary">
                                        </div>
                                        <div className="line bg-primary">
                                        </div>
                                        <div className="line bg-primary">
                                        </div>
                                        <div className="line bg-primary">
                                        </div>
                                    </div>
                                </div>
                            </div>}
                            {!this.state.load && <div>
                                <SeeContract address={this.state.address} />
                            </div>}
                        </div>
                    </div>
                </div>
                <DialogModal ref={ref => this.dialog = ref} />
            </Fragment >
        );
    }
}
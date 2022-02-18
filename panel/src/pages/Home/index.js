import React from 'react';
import { withRouter } from "react-router";
import logo from '../../assets/images/logo-dark.svg';
import './style.css'

class Home extends React.Component {

    render() {
        return (<>
            <div className="info">
                <h1>Bywise Node</h1>
                <p>Version 1.0.0</p>

                <h3>OpenAPI spec: <a href="/openapi.json">/openapi.json</a></h3>
                <h3>API Explorer: <a href={`${process.env.PUBLIC_URL}/explorer`}>/explorer</a></h3>
                <h3>Login: <a href="/panel/login">/panel/login</a></h3>
            </div>
            <div className="banner-container">
                <a href="https://develblockchain.com" target="_blank" rel="noopener noreferrer">
                    <span className="banner">Powered by</span>
                    <img src={logo} alt="Devel Blockchain logo" />
                </a>
            </div>
        </>);
    }
}

export default withRouter(Home);
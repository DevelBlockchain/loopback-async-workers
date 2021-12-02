import React from "react";

const Footer = props => {
    return (
    <footer className="footer">
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-6 footer-copyright">
                    <p className="mb-0">Copyright 2021 © All rights reserved.</p>
                </div>
                <div className="col-md-6">
                    <p className="pull-right mb-0">
                        <span>Hand crafted & made with</span>
                        <i className="fa fa-heart"></i>
                        <span>{` by Devel Blockchain`}</span>
                    </p>
                </div>
            </div>
        </div>
</footer>
)};

export default Footer;
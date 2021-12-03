import React from 'react';
import { withRouter } from "react-router";
import Particles from "react-tsparticles";
import logo from '../../assets/images/logo-dark.svg';
import './style.css'

class Home extends React.Component {

    render() {
        return (<>
            <Particles className="particles-js" options={{
                particles: {
                    number: {
                        value: 355,
                        density: {
                            enable: true,
                            value_area: 789.1476416322727
                        }
                    },
                    color: {
                        value: "#ffffff"
                    },
                    shape: {
                        type: "circle",
                        stroke: {
                            width: 0,
                            color: "#000000"
                        },
                        polygon: {
                            nb_sides: 5
                        },
                        image: {
                            src: "img/github.svg",
                            width: 100,
                            height: 100
                        }
                    },
                    opacity: {
                        value: 0.48927153781200905,
                        random: false,
                        anim: {
                            enable: true,
                            speed: 0.2,
                            opacity_min: 0,
                            sync: false
                        }
                    },
                    size: {
                        value: 2,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 2,
                            size_min: 0,
                            sync: false
                        }
                    },
                    line_linked: {
                        enable: false,
                        distance: 150,
                        color: "#ffffff",
                        opacity: 0.4,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 0.2,
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        bounce: false,
                        attract: {
                            enable: false,
                            rotateX: 600,
                            rotateY: 1200
                        }
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: {
                            enable: true,
                            mode: "bubble"
                        },
                        onclick: {
                            enable: true,
                            mode: "push"
                        },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 400,
                            line_linked: {
                                opacity: 1
                            }
                        },
                        bubble: {
                            distance: 83.91608391608392,
                            size: 1,
                            duration: 3,
                            opacity: 1,
                            speed: 3
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4
                        },
                        push: {
                            particles_nb: 4
                        },
                        remove: {
                            particles_nb: 2
                        }
                    }
                },
                retina_detect: true
            }} />
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
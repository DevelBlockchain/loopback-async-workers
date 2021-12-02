export default class Auth {
    static isLogged = () => {
        return localStorage.getItem('token') != null
    }

    static saveToken = (token) => {
        localStorage.setItem('token', JSON.stringify(token))
    }

    static getToken = () => {
        try {
            var token = localStorage.getItem('token')
            if (token) {
                return JSON.parse(token)
            }
        } catch (err) {
        }
        return '';
    }

    static logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('info-user');
        window.location.reload(false);
    }

    static saveUser = (user) => {
        localStorage.setItem('info-user', JSON.stringify(user))
    }

    static getUser = () => {
        try {
            var user = localStorage.getItem('info-user')
            if (user) {
                return JSON.parse(user)
            }
        } catch (err) {
        }
        return '';
    }
}
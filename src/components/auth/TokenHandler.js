import React, {Component} from 'react';


let check_jwt_timeout_id = null;

/**
Manager that cares for JWT acquisition and renewal
 */
export default class TokenHandler extends Component {

    componentDidMount() {
        this.props.tryRestoreSession();
    }

    componentDidUpdate(prevProps) {
        const {
            session, jwt, jwt_received, claims, getJwt,
            restoreUserSettings
        } = this.props;

        // session changed
        if (session !== prevProps.session) {

            if (session) {
                getJwt();
                restoreUserSettings();
            }
        }

        // new token arrived
        if (jwt && claims && jwt !== prevProps.jwt) {

            const now_date = new Date();
            const now = now_date.getTime() / 1000;
            const time_lag = claims.iat - jwt_received;
            const time_left = claims.exp - now - time_lag;
            const time_till_renewal = parseInt(Math.max(1, time_left - 6) + .5);
            this.checkJwtLater(time_till_renewal);
        }
    }

    checkJwtLater = (in_seconds) => {
        //console.log("CHECKING JWT IN ", in_seconds);
        if (check_jwt_timeout_id)
            clearTimeout(check_jwt_timeout_id);
        check_jwt_timeout_id = setTimeout(() => this.checkJwt(), in_seconds * 1000);
    };

    checkJwt = () => {
        const { claims, getJwt, jwt_received } = this.props;

        if (claims) {

            const now_date = new Date();
            const now = now_date.getTime() / 1000;
            const time_lag = claims.iat - jwt_received;
            const time_left = claims.exp - now - time_lag;
            //console.log("JWT TIME LAG", time_lag);
            //console.log("JWT TIME LEFT", time_left);

            if (time_left < 5.) {
                getJwt();
            }
            else {
                const time_till_renewal = parseInt(Math.max(1, time_left - 5));
                this.checkJwtLater(time_till_renewal);
            }
        }
    };

    render() {
        return null;
    }
}

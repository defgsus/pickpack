import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import querystring from 'querystring'

import { Alert, Button } from 'antd'


import Protected from "containers/auth/KProtected"
import RestError from "components/util/RestError"
import K3_ROUTES from "Routes"


class EbayOauthCallbackHandler extends Component {

    state = {
        error: null
    };

    componentDidMount() {
        this.dispatchAuthCode();
    }

    componentDidUpdate() {
        if (this.props.response.success)
            this.props.setPath(K3_ROUTES.ADMIN.SERVICE_CONFIG.EBAY);
    }

    dispatchAuthCode = () => {
        const queries = location.search
            ? querystring.parse(location.search.slice(1))
            : null;
        if (!queries || !queries.state || !queries.code)
            this.setState({"error": this.props.t("admin.config.ebay.noAuthCode")});
        else
            this.props.setAuthCode(queries);
    };

    render() {

        const { t, location, response, setPath } = this.props;
        const { error } = this.state;
        const queries = location.search
            ? querystring.parse(location.search.slice(1))
            : null;

        return (
            <div>
                <h2>Ebay Oauth Callback</h2>
                <RestError error={response.error}/>
                {error && <Alert message={error} type={"error"} showIcon/>}

                <Protected permission={"ebay.config.write"}>
                    <pre>
                        {queries && JSON.stringify(queries, null, 2)}
                    </pre>
                </Protected>

                <Button
                    type={"primary"}
                    onClick={()=>setPath(K3_ROUTES.ADMIN.SERVICE_CONFIG.EBAY)}
                >{t("admin.config.ebay.backToConfig")}</Button>

            </div>
        );
    };
}

export default withNamespaces()(EbayOauthCallbackHandler);
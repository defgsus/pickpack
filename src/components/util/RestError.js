import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { Alert } from 'antd'


class RestError extends Component {

    render() {
        const {
            error,
        } = this.props;

        if (!error)
            return null;

        let errorMsg = error.message;
        if (error.status)
            errorMsg = `(${error.status}) ${errorMsg}`;

        return (
            <Alert
                showIcon
                type={"error"}
                message={errorMsg}
                style={{
                    marginTop: "0.3rem",
                    marginBottom: "0.3rem",
                }}
            />
        );
    }
}

export default withNamespaces()(RestError)

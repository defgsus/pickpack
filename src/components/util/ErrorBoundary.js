import React, { Component } from 'react'

import { withNamespaces } from 'react-i18next'

import { Alert, Button } from 'antd'


class ErrorBoundary extends React.Component {

    state = {
        error: null,
        info: null,
    };

    componentDidCatch(error, info) {
        console.log(error, info);
        this.setState({error, info});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.location.pathname !== this.props.location.pathname)
            this.clearError();
    }

    clearError = () => {
        this.setState({error: null, info: null});
    };

    render() {
        const { error, info } = this.state;
        const { t, location } = this.props;

        if (!error)
            return this.props.children;

        return (
            <div
                style={{margin: ".75rem"}}
            >
                <Alert message={t("errors.exception")} description={`${error}`} type={"error"} showIcon/>

                <Button
                    type={"primary"}
                    onClick={this.clearError}
                    style={{marginTop: ".5rem"}}
                >
                    {t("errors.tryAgain")}
                </Button>

                <pre>
                    {info.componentStack}
                </pre>
            </div>
        );

    }
}

export default withNamespaces()(ErrorBoundary)

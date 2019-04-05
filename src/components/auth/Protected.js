import React, {Component} from 'react';
import { withNamespaces } from 'react-i18next'

import { Alert } from 'antd'


class Protected extends Component {

    render() {

        let {
            t, logged_in, granted_permissions,
            permission, permissions,
            verbose,
        } = this.props;

        if (!logged_in) {
            return !verbose ? null : (
                <Alert
                    type={"error"}
                    message={t("protected.no_access")}
                    showIcon
                />
            );
        }

        permissions = permissions ? permissions : [];
        if (permission)
            permissions.push(permission);

        let missing_permissions = [];
        if (permissions && permissions.length) {
            for (let i=0; i<permissions.length; ++i) {
                if (granted_permissions.indexOf(permissions[i]) < 0) {
                    missing_permissions.push(permissions[i]);
                }
            }
        }

        if (missing_permissions.length) {
            return verbose
                ? (
                    <Alert
                        type={"error"}
                        message={t("protected.missing_permissions")}
                        description={missing_permissions.join(", ")}
                        showIcon
                    />
                ) : null;
        }

        return (
            <>
                {this.props.children}
            </>
        );
    }
}


export default withNamespaces()(Protected);
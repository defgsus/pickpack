import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'
import { Alert, Button, Divider, Icon, Input, notification, Select } from 'antd'

import UserSettings from 'containers/auth/user_profile/KUserSettings'
import ChangePasswordForm from 'containers/auth/user_profile/KChangePasswordForm'


class UserProfile extends Component {
    render() {
        return (
            <div>
                <div className={"grid-x"}>
                    <div className="cell">

                        <UserSettings/>
                        
                        <div className={"grid-x align-center"}>
                            <div className="cell small-12 medium-6 large-4">
                                <ChangePasswordForm/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withNamespaces()(UserProfile)

import React, {Component} from 'react';

import Login from 'containers/auth/KLogin';
import PageLayout from './PageLayout';

import { Layout } from 'antd';

const { Header, Content, Sider } = Layout;

export default class AppRoot extends Component {

    render() {
        return (
            this.props.login.valid
                ?<PageLayout />
                :<Login />
        );
    }
}

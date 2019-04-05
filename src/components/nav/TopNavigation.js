import React, {Component} from 'react'

import {Avatar, Icon, Menu, Dropdown} from 'antd'
import {Col, Grid, Row} from 'react-flexbox-grid'

import { Link } from 'react-router-dom'
import { withNamespaces } from 'react-i18next'

import Konsum3000Logo from 'static/k3000-logo.svg'
import K3_ROUTES, { routes, getRootRoute } from 'Routes'

import './scss/TopNavigation.scss'

import "scss/visibility.scss"
import {matchesAnyPermission} from "../../Routes";


class TopNavigation extends Component {
    render() {
        const { t, login, location } = this.props;

        const menu_items = routes
            .filter(
                (e,i)=>(!e.hide)
            )
            .filter(item => (matchesAnyPermission(item, login.permissions)))
            .map((e, i) =>
                (
                    <Menu.Item key={e.path}>
                        <Icon type={e.icon}/><span className={"show-for-large"}>{ t(e.name) }</span>
                    </Menu.Item>
                )
        );

        const root_route = getRootRoute(routes, location.pathname);

        return (
            <div className="top-navigation">
            <Link to="/" className={"show-for-large"}>
                <Konsum3000Logo className={"k3000-logo"}/>
            </Link>
            <a
                className={"hide-for-large menu-trigger"}
                onClick={this.props.collapseSidebar}
            >
                <Icon type={"menu"} style={{color: "white"}}/>
            </a>
            <Menu
                mode="horizontal"
                theme="dark"
                style={{
                    lineHeight: '64px',
                    float: "right",
                }}
                selectedKeys={[
                    root_route ? root_route.path : "/"
                ]}
                onClick={
                    (item) => {
                        if (!item.key.startsWith("_"))
                            this.props.setPath(item.key);
                    }
                }
            >
              { menu_items }
                <Menu.SubMenu className="user-menu" title={<Avatar src={ login.claims.profile } />}>
                    <Menu.Item key={ K3_ROUTES.USER_PROFILE }>
                        <Icon type="user" />
                      {t("nav.profile")}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item>
                        <a
                            onClick={(e)=>{e.preventDefault(); this.props.logout()}}
                            rel="noopener noreferrer"
                        >
                            <Icon type="logout" />
                          {t("nav.sign_out")}
                        </a>
                    </Menu.Item>

                </Menu.SubMenu>

            </Menu>
            </div>
        )
    }
}

export default withNamespaces()(TopNavigation)
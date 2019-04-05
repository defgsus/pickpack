import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { Menu, Icon, Layout } from 'antd'

import {
    getParentRoutes,
    matchesAnyPermission,
    routes
} from 'Routes'
import "./scss/SideBar.scss"
import MediaQueries from 'utils/mediaqueries'
import { setPageTitle } from "utils/page_title"


class SideBar extends Component {

    componentDidUpdate() {
        const route = getParentRoutes(routes, this.props.location.pathname);
        if (route && route.length)
            setPageTitle(this.props.t(route[0].name));
        else
            setPageTitle(this.props.t("nav.notFound"));
    }

    render_children = (children) => {
        const { t, login } = this.props;

        return children
            .filter(item => (matchesAnyPermission(item, login.permissions)))
            .map((child, index) => (
                child.children
                    ? (
                        <Menu.SubMenu
                            key={`${child.path}-${index}`}
                            title={
                                child.icon
                                    ? ( <span>
                                            <Icon type={child.icon} />
                                            <span>{ t(child.name) }</span>
                                        </span>
                                    )
                                    : t(child.name)
                            }
                        >
                            {this.render_children(child.children)}
                        </Menu.SubMenu>
                    )
                    : (!child.hide &&
                        <Menu.Item
                            key={child.path}
                        >
                            {
                                child.icon
                                ? <Icon type={ child.icon } />
                                : null
                            }
                            {
                                child.new_tab
                                ? <a
                                        href={child.path}
                                        target={"_blank"}
                                        style={{display: "inline"}}
                                        onClick={e=>e.stopPropagation()}
                                    >{ t(child.name) }</a>
                                :<>{ t(child.name) }</>
                            }

                        </Menu.Item>
                    )
            )
        )
    };

    render() {
        const { setPath, location } = this.props

        const route_path = getParentRoutes(routes, location.pathname);

        if (!route_path || !route_path.length)
            return null;

        const root_route = route_path[route_path.length-1];
        if (!root_route.children)
            return null;

        const large_and_up = this.props.browser.viewport.width >= MediaQueries.large
        const collapse_sidebar = !large_and_up && this.props.collapsed

        return (
            <>
            <Layout.Sider
                collapsible
                trigger={null}
                breakpoint="l"
                collapsedWidth="0"
                className="main-nav-sidebar"
                collapsed={ collapse_sidebar }
            >
                <Menu
                    mode="inline"
                    selectedKeys={[
                        this.props.location.pathname
                    ]}
                    defaultOpenKeys={
                        route_path.map((r)=>(
                            r.path
                        ))
                    }
                    onClick={
                        (item) => {
                            console.log('link', item);

                            if (!item.new_tab) {
                                this.props.setPath(item.key)
                            } else {
                                window.open("https://www.youraddress.com","_blank")
                            }
                        }
                    }
                >
                    {this.render_children(root_route.children)}
                </Menu>
            </Layout.Sider>
                <div
                    className="sidebar-overlay"
                    style={
                        {
                            display: (collapse_sidebar)?"none":"block",
                        }
                    }
                    onClick={this.props.collapseSidebar}
                >
                </div>
            </>
        )
    }
}

export default withNamespaces()(SideBar)

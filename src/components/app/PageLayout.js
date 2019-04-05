import React, { Component } from 'react'

import { Layout } from 'antd'
import { RoutesComponent } from 'Routes'
import FooterContents from 'components/nav/Footer'
import TopNavigation from 'containers/nav/KTopNavigation'
import SideBar from 'containers/nav/KSideBar'
import ErrorBoundary from 'containers/util/KErrorBoundary'

import "./scss/page-layout.scss"

const { Header, Content, Footer } = Layout;



export default class PageLayout extends Component {

    render() {
        return (
            <Layout className={"app-wrapper"}>
                <Header
                    style={ {
                        padding: "0 1.5rem",
                    } }
                >
                    <TopNavigation></TopNavigation>
                </Header>
                <Layout>
                    <SideBar/>
                    <Layout>
                        <ErrorBoundary>
                            <Content
                                style={ {
                                    padding: "1.5rem",
                                    margin: 0,
                                    background: '#fff',
                                } }
                            >
                                <RoutesComponent/>
                            </Content>
                        </ErrorBoundary>
                    </Layout>
                </Layout>
                <Footer>
                    <FooterContents />
                </Footer>
            </Layout>
        )
    }
}

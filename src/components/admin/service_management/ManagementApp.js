import React, { Component } from 'react';
import { Tabs } from 'antd';

import Protected from "containers/auth/KProtected"
import HeartbeatMonitor from "containers/admin/service_management/KHeartbeatMonitor";
import ServiceMonitor from "containers/admin/service_management/KServiceMonitor";


export default class ManagementApp extends Component {

    render() {
        return (
            <Tabs>
                <Tabs.TabPane key={1} tab={"Rabbit-mq"}>
                    <ServiceMonitor/>
                </Tabs.TabPane>

                <Tabs.TabPane key={2} tab={"Heartbeats"}>
                    <HeartbeatMonitor/>
                </Tabs.TabPane>
            </Tabs>
        );
    }
}

import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { Tabs } from 'antd'

import Protected from "containers/auth/KProtected"
import JobRequestsTable from "containers/admin/jobs/KJobRequestsTable"
import JobHistoryTable from "containers/admin/jobs/KJobHistoryTable"
import CreateJob from "containers/admin/jobs/KCreateJob"


class ServiceJobs extends Component {

    render() {
        const { t } = this.props;

        return (
            <Protected permission={"service.jobs.read"} verbose>
                <Tabs>
                    <Tabs.TabPane key={1} tab={t("admin.jobs.serviceJobs")}>
                        <JobRequestsTable/>
                        <hr/>
                        <CreateJob/>
                    </Tabs.TabPane>

                    <Tabs.TabPane key={2} tab={t("admin.jobs.serviceJobsHistory")}>
                        <JobHistoryTable/>
                    </Tabs.TabPane>

                </Tabs>
            </Protected>
        );
    }

}


export default withNamespaces()(ServiceJobs)
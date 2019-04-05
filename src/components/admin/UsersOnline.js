import React, {Component} from 'react'
import { Table } from 'antd'
import { Button } from 'antd'
import { Avatar } from 'antd'

import Moment from 'utils/Moment'

import Protected from "../../containers/auth/KProtected"
import RestError from "../util/RestError";


let _request_timeout = null;


export default class UsersOnline extends Component {

    componentDidMount() {
        this.requestData();
    }

    componentWillUnmount() {
        if (_request_timeout)
            clearTimeout(_request_timeout);
    }

    requestData = () => {
        this.props.updateData();

        if (_request_timeout)
            clearTimeout(_request_timeout);
        _request_timeout = setTimeout(this.requestData, 10000);
    };

    render() {

        const {
            inProgress,
            data,
            error,
            updateData,
        } = this.props;

        return (
            <Protected permission={"admin.session.read"} verbose>

                <div style={{ marginBottom: "1rem" }}>
                    <Button
                        onClick={(e)=>{ e.preventDefault(); updateData(); }}
                        loading={inProgress}
                    >Update</Button>
                </div>

                <RestError error={error}/>

                {this.renderUserTable(data && data.users ? data.users : [])}

            </Protected>
        );
    }

    renderUserTable = (users) => {
        const dataSource = users.map(
            (session_row) => ({
                ...session_row,
                user_formatted: <><Avatar src={session_row.user.avatar_image_url}></Avatar> <span>{session_row.user.name}</span></>,
                last_access_formatted: this.formatLastAccess(session_row.last_access),
                expires_formatted: Moment(session_row.expire * 1000).format('LLL'),
                actions:
                    <Protected permission={"admin.session.revoke"}>
                        <a
                            disabled={ session_row.session === this.props.login.session }
                            onClick={
                                (e)=>{
                                    this.props.revokeSession(session_row.session);
                                }
                            }
                        >
                            revoke
                        </a>
                    </Protected>
            })
        )

        const columns = [{
            title: 'User',
            dataIndex: 'user_formatted',
            key: 'user',
            defaultSortOrder: 'ascend',
            sorter: (a, b) => (a.user.name.toLowerCase() < b.user.name.toLowerCase())?-1:1,
        }, {
            title: 'Last access',
            dataIndex: 'last_access_formatted',
            key: 'last_access',
            sorter: (a, b) => (b.last_access - a.last_access),
        }, {
            title: 'Session expiry',
            dataIndex: 'expires_formatted',
            sorter: (a, b) => (a.expire - b.expire),
            key: 'expire',
        }, {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
        }];

        return (
            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey={(record, i) => i}
            />
        )
    };

    formatLastAccess = (last_access) => {
        if (!last_access)
            return "-";
        let d = new Date();
        const seconds_passed = Math.max(parseInt(d.getTime() / 1000 - last_access), 0);
        if (seconds_passed < 60)
            return `${seconds_passed}s`;
        if (seconds_passed < 60*60)
            return `${parseInt(seconds_passed/60)}m ${seconds_passed % 60}s`;
        const h = parseInt(seconds_passed/60/60);
        const m = parseInt((seconds_passed/60) % 60);
        const s = seconds_passed % 60;
        return `${h}h ${m}m ${s}s`;
    };
}

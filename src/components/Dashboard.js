import React, { Component } from 'react';

import { DatePicker } from 'antd';
import Chart from 'react-apexcharts';

import { CI_COMMIT_REF_SLUG } from "../config";

import Protected from "containers/auth/KProtected"
import UsersOnline from "../containers/admin/KUsersOnline";
import {MomentExact} from "../utils/Moment";
import FormTest from "./form/FormTest";


export default class Dashboard extends Component {

    render() {
        const { setPath, location } = this.props;

        return (
            <Protected>
                <FormTest/>

                {/*this.renderChart()*/}
            </Protected>
        );
    }

    renderChart = () => {
        let data = [];
        for (let i=0; i<30; ++i)
            data.push({
                x: MomentExact(new Date(i*1000)),
                y: Math.sin(i/10.)
            });
        return <div
        >
            <Chart
                height={"300px"}
                options={{
                    chart: {
                        id: "latest_heartbeats",
                        type: "bar",
                        height: 100,
                        background: "#f9f9f9",
                    },
                    xaxis: {
                        categories: data.map((d)=>d.x)
                    }
                }}
                series={[
                    {
                        name: "Sinus",
                        data: data.map((d)=>d.y),
                    }
                ]}
            />
        </div>
    };

}


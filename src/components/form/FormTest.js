import React, { Component, Children } from 'react'

import { Form, Input, Select, Button, Checkbox, DatePicker, TimePicker, Switch } from 'antd'

import ConForm from "./ConForm"
import JsonTree from "components/data/JsonTree"
import Moment, { MomentExact } from "utils/Moment"
import { deepCompare, deepCopy } from "utils/objects"

require("scss/grid.scss");


const DEFAULT_VALUES = {
    pk: 23,
    id: "bob",
    cat: "Cat",
    stuff: "A considered beer.",
    time1: undefined,
    time2: Moment.fromServer("2012-12-21 00:00:00"),
    time3: Moment.fromServer("2012-12-21T00:00:00+05:00"),
};

export default class FormTest extends Component {
    state = {
        values: DEFAULT_VALUES,
        formItemStyle: "-",
        submittedData: null
    };

    handleFieldChange = (key, value) => {
        console.log("CHANGE", key, value);
        this.setState({
            values: {
                ...this.state.values,
                [key]: value
            }
        });
    };

    handleSubmit = (values) => {
        console.log("SUBMIT", values);
        this.setState({submittedData: values})
    };

    setRandom = () => {
        let values = deepCopy(DEFAULT_VALUES);
        values.id = `${parseInt(Math.random()*100)}`;
        values.stuff = `${Math.random()*1000}`;
        values.date = Moment(new Date());
        this.setState({values});
    };

    render() {

        const FIELDS = {
            "id": {
                label: "Unique ID",
                help: "Must be unique, dude!",
                rules: [
                    {required: true},
                    {pattern: /bob/, message: "Must include bob"},
                    {pattern: /[23]/, message: "Must include 2 or 3"},
                ],
            },
            "cat": {
                "label": "Category",
                "help": "Select from an extensive list",
                "extra": "Some extra text here!",
                rules: [
                    {validator(rule, value, callback) {
                        if (value === "Cat")
                            callback("One cat is not enough");
                        else
                            callback();
                    }}
                ]
            },
            "enable_stuff": {
                "label": "Enable stuff",
                "help": "Check to enable the stuff!",
            },
            "stuff": {
                "label": "Stuff",
                "help": "Any stuff you like",
            },
            "time1": {
                "label": "Datetime (undefined)",
                //"help": "Uses Moment.js for the value",
            },
            "time2": {
                "label": "Datetime from server (without Timezone)",
                //"help": "Uses Moment.js for the value",
            },
            "time3": {
                "label": "Datetime from server (with timezone)",
                //"help": "Uses Moment.js for the value",
            },
        };

        const { values, formItemStyle, submittedData } = this.state;

        const gridClasses = formItemStyle === "-"
            ? "large-4 medium-6 small-11"
            : "large-6 medium-8 small-11";

        return (
            <div className={"grid-x align-center"}>
                <div className={"cell " + gridClasses}>

                    {"style:"}&nbsp;
                    <Select
                        onChange={value => this.setState({formItemStyle: value})}
                        style={{
                            minWidth: "10rem"
                        }}
                    >
                        {["-", "inline"].map(v => (
                            <Select.Option value={v} key={v}>{v}</Select.Option>
                        ))}
                    </Select>

                    <hr/>

                    <ConForm
                        values={values}
                        fields={FIELDS}
                        itemStyle={formItemStyle !== "-" ? formItemStyle : null}
                        onFieldChange={this.handleFieldChange}
                        onSubmit={this.handleSubmit}
                    >
                        <ConForm.Field fieldId={"id"}>
                            <Input/>
                        </ConForm.Field>

                        <ConForm.Field
                            fieldId={"cat"}
                        >
                            <Select>
                                {["Cat", "More cat", "Extra cat"].map(v => (
                                    <Select.Option value={v} key={v}>{v}</Select.Option>
                                ))}
                            </Select>
                        </ConForm.Field>

                        <ConForm.Field fieldId={"enable_stuff"} valueName={"checked"}>
                            <Switch/>
                        </ConForm.Field>

                        <ConForm.Field fieldId={"stuff"} disabled={!values.enable_stuff}>
                            <Input.TextArea rows={4}/>
                        </ConForm.Field>

                        <ConForm.Field fieldId={"time1"}>
                            <DatePicker showTime />
                        </ConForm.Field>

                        <ConForm.Field fieldId={"time2"}>
                            <DatePicker showTime />
                        </ConForm.Field>

                        <ConForm.Field fieldId={"time3"}>
                            <DatePicker showTime />
                        </ConForm.Field>

                        <hr/>

                        <ConForm.IfValid>
                            <Button htmlType={"submit"} type={"primary"}>Save</Button>
                        </ConForm.IfValid>

                        <Button
                            onClick={()=>this.setState({values: DEFAULT_VALUES})}
                        >{"Reset"}</Button>

                        <Button
                            onClick={this.setRandom}
                        >{"Random"}</Button>

                    </ConForm>
                </div>

                {submittedData && (
                    <div className={"cell shrink"}>
                        <h3>Submitted:</h3>
                        <ul>
                            <li>time1: <b>{MomentExact(values.time1)} | {Moment.toServer(values.time1)}</b></li>
                            <li>time2: <b>{MomentExact(values.time2)} | {Moment.toServer(values.time2)}</b></li>
                            <li>time3: <b>{MomentExact(values.time3)} | {Moment.toServer(values.time3)}</b></li>
                        </ul>
                        <JsonTree data={submittedData}/>
                    </div>
                )}
            </div>
        );
    }
}

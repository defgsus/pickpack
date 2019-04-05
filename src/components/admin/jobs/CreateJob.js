import React, {Component} from 'react'

import { Trans, withNamespaces } from 'react-i18next'

import { Form, Input, Button, Menu, Dropdown,
    DatePicker, TimePicker } from 'antd'

import Protected from "containers/auth/KProtected"
import ConForm from "components/form/ConForm"
import RestError from "components/util/RestError"


const RE_TIME_FORMAT = /^[1-9][0-9]*\-[0-9][0-9]\-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]|[1-9][0-9]*[smhdw]?$/;
const RE_TIME_RANGE = /^[1-9][0-9]*[smhdw]?$/;


class CreateJob extends Component {

    handleSubmit = (values) => {
        this.props.createJob({
            ...values,
            force: true,
            message: JSON.parse(values.message),
        });
    };

    messageValidator = (rule, value, callback) => {
        if (value) {
            try {
                JSON.parse(value);
            }
            catch (e) {
                callback(`${e}`);
            }
        }
        callback();
    };

    validateDateStart = (rule, value, callback) => {
        const { t, form: { cron, date_start } } = this.props;
        if (cron && date_start)
            callback(t("admin.create_job.startDateCanNotBeMixed"));
        else
            callback();
    };

    validateRepeat = (rule, value, callback) => {
        const { t, form: { cron, repeat } } = this.props;
        if (cron && repeat)
            callback(t("admin.create_job.startDateCanNotBeMixed"));
        else
            callback();
    };

    validateCron = (rule, value, callback) => {
        const { t, form: { cron, date_start, repeat } } = this.props;
        if (cron && (date_start || repeat))
            callback(t("admin.create_job.cronCanNotBeMixed"));
        else
            callback();
    };

    getFieldsDef = () => {
        const { t } = this.props;
        return {
            "name": {
                label: t("admin.create_job.Name"),
                extra: t("admin.create_job.nameHelp"),
                rules: [{required: true}],
            },
            "cron": {
                label: t("admin.create_job.cron"),
                extra: (
                    <span>
                        {t("admin.create_job.cronHelp")} (<a href={"https://en.wikipedia.org/wiki/Cron#CRON_expression"} target={"_blank"}>Wikipedia</a>)
                    </span>
                ),
                rules: [
                    {validator: this.validateCron},
                ]
            },
            "date_start": {
                label: t("admin.create_job.startDate"),
                extra: (
                    <span>
                        {t("admin.create_job.startDateHelp")}<br/>
                        <b>{t("admin.create_job.absolute")}</b>: {t("admin.create_job.startDateHelpAbsolute")}<br/>
                        <b>{t("admin.create_job.relative")}</b>: {t("admin.create_job.startDateHelpRelative")}<br/>
                    </span>
                ),
                rules: [
                    {pattern: RE_TIME_FORMAT, message: t("admin.create_job.invalidTimeRange")},
                    {validator: this.validateDateStart},
                ],
            },
            "repeat": {
                label: t("admin.create_job.repeat"),
                extra: (
                    <span>
                        {t("admin.create_job.repeatHelp")}<br/>
                        {t("admin.create_job.startDateHelpRelative")}<br/>
                    </span>
                ),
                rules: [
                    {pattern: RE_TIME_RANGE, message: t("admin.create_job.invalidTimeRange")},
                    {validator: this.validateRepeat},
                ],
            },
            "message": {
                label: t("admin.create_job.message"),
                extra: t("admin.create_job.messageHelp"),
                rules: [{required: true}, {validator: this.messageValidator}],
            },
        }
    };

    render() {
        const {
            t,
            form,
            response,
            jobs,
            editJob,
        } = this.props;

        const jobExists = jobs && jobs.data && jobs.data.jobs
            && 0 <= jobs.data.jobs.findIndex(
                e => e.name === form.name
        );

        return (
            <Protected permission={"service.jobs.write"} verbose>
                <ConForm
                    values={form}
                    fields={this.getFieldsDef()}
                    onFieldChange={(key, value) => editJob({[key]: value})}
                    onSubmit={this.handleSubmit}
                >
                    <ConForm.Field
                        fieldId={"name"}
                    >
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field
                        fieldId={"cron"}
                    >
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field
                        fieldId={"date_start"}
                    >
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field
                        fieldId={"repeat"}
                    >
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field
                        fieldId={"message"}
                    >
                        <Input.TextArea
                            rows={6}
                            style={{fontFamily: "monospace"}}
                        />
                    </ConForm.Field>

                    <ConForm.IfValid>
                        <Button
                            type={"primary"}
                            htmlType={"submit"}
                        >
                            {jobExists
                                ? t("admin.create_job.updateJob")
                                : t("admin.create_job.createJob")
                            }
                        </Button>
                    </ConForm.IfValid>

                    <RestError error={response.error}/>

                </ConForm>
            </Protected>
        );
    }

}


export default withNamespaces()(CreateJob);

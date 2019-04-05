import React, {Component} from 'react'
import { Form, Input, Button, Menu, Dropdown } from 'antd'

import Protected from "containers/auth/KProtected"
import ConForm from "../form/ConForm";
import RestError from "components/util/RestError"
import { serviceMessageValidator } from "utils/validators"


export const MESSAGE_TEMPLATES = ((templates) => {
    let ret = {};
    for (const key in templates) {
        ret[key] = JSON.stringify(templates[key], null, 2);
    }
    return ret;
})({
    "default": {
        "object": {
            "state": "NEW"
        }
    },

    "error": {
        "error": {
            "state": "NEW",
            "message": "An exciting error message"
        }
    },

    "ServiceJobReq": {
        "ServiceJobReq": {
            "state": "NEW",
            "name": "job_name",
            "date_start": "1m",
            "repeat": "1m",
            "force": false,
            "message": {
                "triggered_object": {"state": "NEW"}
            }
        }
    },

    "GetEbayOrdersReq": {
        "GetEbayOrdersReq": {
            "state": "NEW",
            "count": 100
        },
    },
});



class SendMessageForm extends Component {

    getFieldsDef = () => {
        return {
            "message": {
                label: "JSON message",
                extra: "Input JSON data. Each root key is a service object. Each object must have a 'state'.",
                rules: [
                    {required: true},
                    {validator: serviceMessageValidator}
                ],
            }
        }
    };

    render() {

        const {
            edit,
            response,
            setMessageValues,
            sendMessage,
        } = this.props;

        const TemplateMenu = (
            <Menu
                onClick={(item) => {
                    setMessageValues({"message": MESSAGE_TEMPLATES[item.key]})
                }}
            >
                {Object.keys(MESSAGE_TEMPLATES).map((key) => (
                    <Menu.Item key={key}>{key}</Menu.Item>
                ))}
            </Menu>
        );

        return (
            <Protected permission={"service.message.send"} verbose>

                <Dropdown overlay={TemplateMenu}>
                    <Button>{"Templates"}</Button>
                </Dropdown>

                <hr/>

                <ConForm
                    values={edit}
                    fields={this.getFieldsDef()}
                    onFieldChange={(key, value) => setMessageValues({[key]: value})}
                    onSubmit={values => sendMessage(values.message)}
                >
                    <ConForm.Field
                        fieldId={"message"}
                    >
                        <Input.TextArea
                            rows={10}
                            style={{
                                fontFamily: "monospace"
                            }}
                        />
                    </ConForm.Field>

                    <ConForm.IfValid>
                        <Button
                            type={"primary"}
                            htmlType={"submit"}
                        >
                            Send service message
                        </Button>
                    </ConForm.IfValid>

                </ConForm>

                <RestError error={response.error}/>

            </Protected>
        );
    }

}


export default SendMessageForm;

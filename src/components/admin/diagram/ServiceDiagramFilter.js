import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { List, Checkbox } from 'antd'



class ServiceDiagramFilter extends Component {

    render() {

        const { t, description, disabledObjects, setObjectVisible } = this.props;

        const serviceObjects = description ? description.getServiceObjects() : [];
        const objectNames = Array.from(new Set(serviceObjects.map(o => o.object))).sort();

        return (
            <div>
                <List
                    dataSource={objectNames}
                    size={"small"}
                    renderItem={item => (
                        <List.Item>
                            <Checkbox
                                checked={!disabledObjects || !disabledObjects.has(item)}
                                onChange={(e) => {
                                    if (setObjectVisible)
                                        setObjectVisible(item, e.target.checked);
                                }}
                            >
                                <b>{item}</b>
                            </Checkbox>
                        </List.Item>
                    )}
                />
            </div>
        );
    }

}


export default withNamespaces()(ServiceDiagramFilter);

import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { Icon, Divider } from 'antd'



class ServiceView extends Component {

    render() {

        const { t, serviceName, description } = this.props;
        const service = description && description.services[serviceName];

        return (
            <div>
                <h3><Icon type={"deployment-unit"}/> {serviceName}</h3>

                {service && (<>
                    <Icon type={"arrow-right"}/> {service.in}

                    <ul>
                        {service.out.map((out, i) => (
                            <li key={i}>{out}</li>
                        ))}
                    </ul>

                </>)}
            </div>
        );
    }

}

export default withNamespaces()(ServiceView);

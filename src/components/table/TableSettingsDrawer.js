import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { Drawer, Radio, Button, message, Input, Form } from 'antd'
import MediaQueries from "utils/mediaqueries"
import SortableTable from 'components/table/SortableTable'
import LazyInput from "components/inputs/LazyInput";
import "./styles/SettingsDrawer.scss"


class TableSettingsDrawer extends Component {

    inputChangePresetTitle = (e) => this.props.changePresetTitle(e, this.props.activePreset, this.props.activePaneKey);
    radioGroupChangeTableSize = (e) => this.props.changeTableSize(e.target.value, this.props.activePreset, this.props.activePaneKey);

    render() {

        const { t, tableSize, activePreset } = this.props;

        return (
            <Drawer
                visible={this.props.settingsDrawerOpen}
                closable={true}
                onClose={this.props.onDrawerClose}
                maskClosable={true}
                width={(this.props.browser.viewport.width < MediaQueries.medium) ? '100vw' : MediaQueries.medium}
            >
                <Form className={"table-settings-drawer"}>
                    <h2>
                        {t('settings.settings')}
                    </h2>

                    <h3>
                        {t('table.preset_name')}
                    </h3>

                    <Form.Item>
                        <LazyInput
                            value={ activePreset.title }
                            onChange={ this.inputChangePresetTitle }
                        />
                    </Form.Item>

                    <h3>
                        {t('table.table_size')}
                    </h3>

                    <SortableTable
                        tableName={this.props.tableName}
                        headerCellTitles={ this.props.headerCellTitles }
                        renderSmall={ this.props.browser.viewport.width < MediaQueries.medium }
                        updatePresets={ this.props.updatePresets }
                        activePaneKey={ this.props.activePaneKey }
                        toggleColumnVisibility={ this.props.toggleColumnVisibility}
                        presets={ this.props.presets }
                        toggleColumnVisibilitySwitch={ this.props.toggleColumnVisibilitySwitch }
                        activeColumnTitles={ this.props.activeColumnTitles }
                    />
 
                </Form>
            </Drawer>
        )
    }
}

export default withNamespaces('app')(TableSettingsDrawer)
import React, { Component } from 'react'
import { Tabs } from 'antd'
import i18n from 'utils/i18n'
import { deepCopy } from 'utils/objects'

class PresetTabs extends Component {

    add = (targetKey, lastTabKey, presets, activePreset) => {
        const newActiveKey = lastTabKey + 1;
        const newActivePreset = deepCopy(activePreset)
        newActivePreset['key'] = newActiveKey
        newActivePreset['title'] = `${i18n.t('util.copyOf')}-${activePreset.title}`
        newActivePreset['locked'] = false
        this.props.onTabAdd(newActiveKey, newActivePreset)

        const newPresets = deepCopy(presets)
        newPresets[newActiveKey] = newActivePreset
        this.props.onSaveTableSettings(newPresets)
    }

    remove = (targetKey, presets) => {
        const newPresets = deepCopy(presets)
        delete newPresets[targetKey]
        this.props.onTabDelete(targetKey)
        this.props.onSaveTableSettings(newPresets)
    }

    render() {
        const TabPane = Tabs.TabPane;

        const { presets, activePaneKey, activePreset } = this.props


        const panes = activePreset ? Object.keys(presets).map(presetKey => (
            <TabPane
                tab={presets[presetKey].title}
                key={presets[presetKey].key}
                closable={(presets[presetKey].key !== 1) && !presets[presetKey].locked}
            >
            </TabPane>)
        ) : []
        const lastTabKey = activePreset ? parseInt(panes[panes.length -1]['key']) : false
        const onEdit = (targetKey, action) => {
            if (action === 'add') {
                this.props.onTabAdd();
            } else if (action === 'remove') {
                this.remove(targetKey, presets)
            }
        }

        return (
            <Tabs
                onChange={this.props.changeActivePane}
                activeKey={activePaneKey.toString()}
                type="editable-card"
                onEdit={onEdit}
            >
                { panes }
            </Tabs>
        )
    }
}

export default PresetTabs
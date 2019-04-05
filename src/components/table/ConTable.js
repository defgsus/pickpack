import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import {
    Table,
    Input,
    Icon,
} from 'antd'

import RestError from "components/util/RestError"
import TableControlPanel from 'components/table/TableControlPanel'
import SettingsDrawer from 'components/table/TableSettingsDrawer'
import PresetTabs from 'components/table/PresetTabs'
import ConSelect from 'components/table/util/ConSelect'
import ControlledDateRangePicker from 'components/table/util/ControlledDateRangePicker'
import ControlledIntegerRangePicker from 'components/table/util/ControlledIntegerRangePicker'
import ControlledDecimalRangeInput from "./util/ControlledDecimalRangeInput"
import LazyInput from "components/inputs/LazyInput"

import i18n from "utils/i18n"
import MediaQueries from "utils/mediaqueries"
import { deepCopy } from "utils/objects"
import { decimalToString } from "utils/decimal"
import { MomentExact } from "utils/Moment"

import { translateTableColumnTitle } from "./util/translate"

import "./styles/Tables.scss"
import 'antd/dist/antd.css'


class ConTable extends Component {

    state = {
        numberSelectedItems: 0,
    };

    componentDidMount() {
        if (!(this.props.response && this.props.response.dateOfResponse)) {
            this.props.getTableSettings(this.props.presets);
            //this.props.getTableDataFromState(this.props.activePaneKey);
        }
    }

    openDrawer = (locked) => {
        if (locked) {
            this.props.onTabAdd(this.props.activePaneKey, this.props.highestPaneKey);
            this.props.openDrawer()
        } else {
            this.props.openDrawer()
        }
    };

    /** Sets the field by which to order, stores settings, gets data.
     * @param order can be null, "fieldId" or "-fieldId"
     * @param columnType e.g "int", "string", "money"
     * @param mode, if "iterate": order must be "fieldId" and function cycles through all order-states of the field
     */
    setSortOrder = (order, columnType, mode) => {
        order = order || "";
        const {
            activePaneKey, presets
        } = this.props;

        if (columnType === 'money') {
            order += '.value'
        }
        const currentOrder = presets[activePaneKey].order;

        if (mode === "iterate") {
            if (currentOrder === order)
                order = "-" + order;
            else if (currentOrder === "-" + order)
                order = "";
        }

        // replace
        else {
            if (currentOrder === order)
                order = "";
        }

        let appliedPane = activePaneKey;
        if (this.props.locked) {
            appliedPane = this.props.highestPaneKey + 1;
            this.props.onTabAdd(this.props.activePaneKey, this.props.highestPaneKey);
        }

        this.props.setSortOrder(appliedPane, order);
        this.props.saveTableSettingsFromState();
        this.props.getTableDataFromState(appliedPane);
    };

    /** handle typed changes to filters.
     * when a field is cleared the table data is reloaded
     * - to catch cases where antd's clear-button just gives us an onChange event
     */
    onInputChange = (fieldId, value, comparisonColumnSuffix) => {
        const filterKey = this._getFilterKey(fieldId, comparisonColumnSuffix);

        if (this.props.filters[filterKey]
            && (value === '' || value === null)) {
                this.onFilterApply(fieldId, value, comparisonColumnSuffix);
        } else {
            this.onFilterType(fieldId, value, comparisonColumnSuffix);
        }

    };

    /** A change event from filter component, does update activeFilters but no data request.
     * Returns the paneKey where the filter is set */
    onFilterType = (fieldId, value, comparisonColumnSuffix) => {
        const filterKey = this._getFilterKey(fieldId, comparisonColumnSuffix);
        // console.log('onFilterType', filterKey, typeof value, value);

        let appliedPane = this.props.activePaneKey;
        if (this.props.locked) {
            // TODO: move tab-creation to reducer
            //   (although, it might be tricky to get the new activePaneKey within a component function)
            appliedPane = this.props.highestPaneKey + 1;
            this.props.onTabAdd(this.props.activePaneKey, this.props.highestPaneKey);
        }

        this.props.onFilterType(filterKey, appliedPane, value);

        return appliedPane;
    };

    /** Apply a filter (onEnter or likewise) and reload data
     **/
    onFilterApply = (fieldId, value, comparisonColumnSuffix) => {
        // console.log('onFilterApply', fieldId, typeof value, value);
        const appliedPane = this.onFilterType(fieldId, value, comparisonColumnSuffix);

        this.props.getTableDataFromState(appliedPane);
        this.props.saveTableSettingsFromState();
    };

    _getFilterKey = (fieldId, comparisonColumnSuffix) => {
        const type = this.props.columnDefinitions
            ? this.props.columnDefinitions[fieldId].type
            : "string";

        let filterKey = fieldId;

        if (type === "money") {
            filterKey = fieldId + '.value'
        }

        if (comparisonColumnSuffix) {
            filterKey = `${filterKey}${comparisonColumnSuffix}`
        }
        return filterKey;
    };

    translateTitle = (fieldId) => {
        return translateTableColumnTitle(this.props.t, this.props.tableName, fieldId);
    };

    /** Generates the ant.d Table.columns with custom renderers */
    activeColumns = () => {
        // TODO: result may be cached
        let columns = deepCopy(this.props.activeColumns);

        if (this.props.onDetailClick)
            columns.unshift({
                title: i18n.t('table.openDetailView'),
                dataIndex: 'detailViewOpenerColumn',
                key: 'detailViewOpenerColumn',
                render: this.renderDetailViewCol
            });

        if (this.props.cellRender)
            columns = columns.map(col => {
                let renderer = (this.props.cellRender && this.props.cellRender[col.dataIndex])
                    || this.getDefaultCellRenderer(col);
                if (renderer)
                    return {...col, render: renderer};
                return col;
            });
        return columns;
    };

    getDefaultCellRenderer = (column) => {
        const type = this.props.columnDefinitions && this.props.columnDefinitions[column.dataIndex]
            && this.props.columnDefinitions[column.dataIndex].type;
        switch (type) {
            case 'decimal': return (text, record) => (
                decimalToString(record[column.dataIndex].value)
            );

            case 'money': return (text, record) => (
                `${record[column.dataIndex].currency} ${decimalToString(record[column.dataIndex].value)}`
            );

            case 'datetime':
            case 'date': return (text, record) => (
                MomentExact(record[column.dataIndex])
            );

            default: return null;
        }
    };

    renderTableHeader = props => {

        const activeColumns = this.activeColumns();

        return (
            <thead {...props}>

                {/* title/sorter row */}
                <tr>
                    {this.props.dropdownButtonActions && <th/>}
                    {activeColumns.map(this.renderTitleHeaderField)}
                </tr>

                {/* filter row */}
                <tr>
                    {this.props.dropdownButtonActions && <th/>}
                    {activeColumns.map(this.renderFilterHeaderField)}
                </tr>

            </thead>
        )
    };

    renderTitleHeaderField = (column) => {
        const {
            order,
            columnDefinitions,
        } = this.props;

        const columnDefinition = columnDefinitions[column.dataIndex];
        const translatedTitle = this.translateTitle(column.dataIndex);

        const isOrderedDown = order.replace('.value', '') === `-${column.dataIndex}`;
        const isOrderedUp = order.replace('.value', '') === column.dataIndex;

        if (columnDefinition && columnDefinition['sortable']) {

            return (
                <th
                    className={"title sortable" + ((isOrderedUp || isOrderedDown) ? " sorted" : "")}
                    key={ column.dataIndex }
                    onClick={e => {
                        e.stopPropagation();
                        this.setSortOrder(column.dataIndex, columnDefinition.type, "iterate");
                    }}
                >
                    <div>
                        <span className={"title"}>{translatedTitle}</span>

                        <span className={"sorter"}>
                            <Icon
                                type="caret-down"
                                className={isOrderedDown ? "active" : null}
                                onClick={ (e) => {
                                    e.stopPropagation();
                                    this.setSortOrder( '-'+ column.dataIndex, columnDefinition.type);
                                }}
                            />
                            <Icon
                                type="caret-up"
                                className={isOrderedUp ? "active" : null}
                                onClick={ (e) => {
                                    e.stopPropagation();
                                    this.setSortOrder(column.dataIndex, columnDefinition.type);
                                }}
                            />
                        </span>
                    </div>
                </th>
            )
        }
        return (
            <th key={column.dataIndex} className={"title"}>
                {translatedTitle}
            </th>
        )
    };

    renderFilterHeaderField = (column) => {
        return (
            <th
                key={column.dataIndex}
            >
                {this.renderFilterField(column)}
            </th>
        );
    };

    renderFilterField = (column) => {
        const {
            filters,
            columnDefinitions,
            t,
        } = this.props;

        if (!columnDefinitions[column.dataIndex])
            return null;

        if (columnDefinitions[column.dataIndex].choices) {
            return (
                <ConSelect
                    onColumnFilter={(value) => this.onFilterApply(column.dataIndex, value)}
                    selectChildrenArray={columnDefinitions[column.dataIndex].choices}
                    value={ filters[column.dataIndex] }
                />
            )
        }

        switch (columnDefinitions[column.dataIndex]['type']) {
            case 'string':
                return (
                    <LazyInput
                        allowClear={ true }
                        value={filters[column.dataIndex]}
                        onChange={ (e) => this.onInputChange(column.dataIndex, e.target.value) }
                        onPressEnter={ (e) => this.onFilterApply(column.dataIndex, e.target.value) }
                        placeholder={t('input.type')}
                    />
                );

            case 'date':
            case 'datetime':
                return (
                    <ControlledDateRangePicker
                        filters={filters}
                        columnDataIndex={column.dataIndex}
                        onChange={ (value, comparisonColumnSuffix) =>
                            this.onInputChange(column.dataIndex, value, comparisonColumnSuffix)
                        }
                        onPressEnter={ (value, comparisonColumnSuffix) =>
                            this.onFilterApply(column.dataIndex, value, comparisonColumnSuffix)
                        }
                    />
                );
            case 'int':
                return (
                    <ControlledIntegerRangePicker
                        filters={filters}
                        filterKey={this._getFilterKey(column.dataIndex)}
                        onChange={(e, comparisonColumnSuffix) =>
                            this.onInputChange(column.dataIndex, e.target.value, comparisonColumnSuffix)
                        }
                        onPressEnter={(e, comparisonColumnSuffix) =>
                            this.onFilterApply(column.dataIndex, e.target.value, comparisonColumnSuffix)
                        }
                    />
                );

            case 'money':
                return (
                    <ControlledDecimalRangeInput
                        filters={filters}
                        filterKey={this._getFilterKey(column.dataIndex)}
                        onChange={(e, comparisonColumnSuffix) =>
                            this.onInputChange(column.dataIndex, e.target.value, comparisonColumnSuffix)
                        }
                        onPressEnter={(e, comparisonColumnSuffix) =>
                            this.onFilterApply(column.dataIndex, e.target.value, comparisonColumnSuffix)
                        }
                    />
                )
        }

        return null;
    };

    renderDetailViewCol = (text, record) => {
        return <Icon
                    type={"solution"}
                    style={{cursor: "pointer"}}
                    onClick={(e) => {
                        e.stopPropagation();
                        this.props.onDetailClick && this.props.onDetailClick(record);
                    }}
                />
    };

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => this.setState({numberSelectedItems: selectedRows.length})
    };

    tableControlPanelOpenDrawer = () => this.openDrawer(
        this.props.locked, this.props.activePreset, this.props.highestPaneKey + 1);

    settingsDrawerOnDrawerClose = () => this.props.onDrawerClose(this.props.presets);

    rowKey = (record, i) => {
        return typeof this.props.rowKey === "function"
            ? this.props.rowKey(record, i)
            : record[this.props.rowKey];
    };

    defaultRowKey = (record, i) => i;

    changeActivePane = (activeKey) => {
        this.props.changeActivePane(activeKey);

        if (!(this.props.response && this.props.response.dateOfResponse)) {
            const { filters, pageSize, order } = this.props.presets[activeKey];
            this.props.onGetTableData(activeKey, 1, pageSize, filters, order);
        }
    };

    onTabAdd = () => {
        this.props.onTabAdd(this.props.activePaneKey, this.props.highestPaneKey)
    };

    render() {
        const {
            tableName,
            dropdownButtonActions,
            sessionSettings,
            activePreset,
            filters,
            locked,
            tableSize,
            currentPage,
            pageSize,
            activePaneKey,
            presets,
            settings,
            order,
            activeColumnTitles,
            allColumnKeys,
            activeRows,
        } = this.props;

        const activeColumns = this.activeColumns();
        const response = this.props.response;

        const serverError = response && response.error;

        const components = {
            header: {
                wrapper: this.renderTableHeader,
            },
        };

        const controlPanel = (
            settings.showTableControlPanel &&
            <TableControlPanel
                tableName={tableName}
                numberOfItems={ this.props.settings.responses[activePaneKey].count }
                numberOfAllItems={ this.props.settings.responses[activePaneKey].countAll }
                dropdownButtonActions={dropdownButtonActions}
                numberSelectedItems={ this.state.numberSelectedItems }
                openDrawer={ this.tableControlPanelOpenDrawer }
                changeTableSize={ this.props.changeTableSize }
                browser={ this.props.browser }
                onGetTableData={ this.props.onGetTableData }
                filters={ filters }
                order={ order }
                activePreset={ activePreset }
                activePaneKey={ activePaneKey }
                currentPage={ currentPage ? currentPage : 1 }
                pageSize={ pageSize ? pageSize : 1 }
                locked={ locked }
                togglePresetLock={ this.props.togglePresetLock }
                presets={ presets }
                saveTableSettings={ this.props.onSaveTableSettings }
            />
        );

        return (
            <div className={ "k3-table" }>
                <h1 className={ 'page-title' }>{ this.props.tableTitle }</h1>

                <PresetTabs
                    tableName={ tableName }
                    presets={ presets }
                    activePaneKey={ activePaneKey }
                    activePreset={ activePreset }
                    onGetTableData={ this.props.onGetTableData }
                    changeActivePane={ this.changeActivePane }
                    onTabAdd={ this.onTabAdd }
                    onSaveTableSettings={ this.props.onSaveTableSettings }
                    onTabDelete={ this.props.onTabDelete }
                />

                { controlPanel }

                {serverError && <RestError error={serverError}/>}

                <Table
                    rowKey={ this.props.rowKey ? this.rowKey : this.defaultRowKey }
                    rowSelection={ dropdownButtonActions ? this.rowSelection : null }
                    bordered
                    dataSource={ activeRows }
                    loading={ this.props.settings.responses[activePaneKey].inProgress }
                    columns={ activeColumns }
                    pagination={ false }
                    components={ components }
                    scroll={ {x: (this.props.browser.viewport.width) * 0.70} }
                    rowClassName={(record, index) => index % 2 === 0 ? '' : 'stripedRow' }
                />

                <SettingsDrawer
                    tableName={tableName}
                    headerCellTitles={ allColumnKeys }
                    settingsDrawerOpen={ sessionSettings.drawerOpen }
                    onDrawerClose={ this.settingsDrawerOnDrawerClose }
                    browser={ this.props.browser }
                    tableSize={ tableSize }
                    updatePresets={ this.props.updatePresets }
                    activePreset={ activePreset }
                    activePaneKey={ activePaneKey }
                    toggleColumnVisibilitySwitch={ this.props.toggleColumnVisibility }
                    activeColumnTitles={ activeColumnTitles }
                    changePresetTitle={ this.props.changePresetTitle }
                />

                { controlPanel }

            </div>
        )
    }
}


export default withNamespaces()(ConTable)

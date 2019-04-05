import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import {
    Button,
    Dropdown,
    Icon,
    Menu,
    message,
    Pagination,
    Tooltip,
} from 'antd'

import MediaQueries from "../../utils/mediaqueries"
import {deepCopy} from "../../utils/objects"

import { translateTableColumnTitle } from "./util/translate"


class TableControlPanel extends Component {

    constructor(props) {
        super(props)
        this.state = {
            pageSizeOptions: ['25', '50', '100', '200'],
        }
    }

    onGetTableData = (activePaneKey, currentPage, pageSize, filters, order, presets) => {
        this.props.onGetTableData(activePaneKey, 1, pageSize, filters, order)

        if (presets) {
            const newPresets = deepCopy(presets)
            newPresets[activePaneKey].pageSize = pageSize
            this.props.saveTableSettings(newPresets)
        }
    }

    handleMenuClick = (e) => {
        message.info(`Perform ${ e.key } on ${ this.props.numberSelectedItems} items`)
    }

    handleButtonClick = (e) => {
        message.info(`Perform default action on ${ this.props.numberSelectedItems} items`)
    }

    openDrawer = () => this.props.openDrawer(this.props.locked)

    buttonOnGetTableData = () => this.props.onGetTableData(
        this.props.activePaneKey, this.props.currentPage, this.props.pageSize, this.props.filters, this.props.order)
    
    buttonTogglePresetLock = () => this.props.togglePresetLock(this.props.activePaneKey, this.props.locked, this.props.presets)

    paginationOnChange = (page, pageSize) => this.props.onGetTableData(
        this.props.activePaneKey, page, pageSize, this.props.filters, this.props.order)
    
    paginationOnShowSizeChange = (page, pageSize) => this.onGetTableData(
        this.props.activePaneKey, 1, pageSize, this.props.filters, this.props.order, this.props.presets)

    renderTotal = () => {
        if (this.props.numberOfItems === this.props.numberOfAllItems)
            return `${this.props.numberOfItems}`;
        const of = this.props.t("table.of");
        return `${this.props.numberOfItems} ${of} ${this.props.numberOfAllItems}`;
    };

    renderFiltersInUse = () => {
        const filtersInUse = this.props.activePreset && Object.keys(this.props.activePreset.filters);
        if (!filtersInUse || !filtersInUse.length)
            return null;

        const titles = filtersInUse.sort().map(filterKey => {
            const key = filterKey.split(":");

            let fieldName = translateTableColumnTitle(this.props.t, this.props.tableName, key[0]);
            if (fieldName === key[0] && key[0].endsWith(".value"))
                fieldName = translateTableColumnTitle(this.props.t, this.props.tableName, key[0].split(".value")[0]);

            let operator = "=";
            if (key.includes("lt"))
                operator = "<";
            else if (key.includes("lte"))
                operator = "<=";
            else if (key.includes("gt"))
                operator = ">";
            else if (key.includes("gte"))
                operator = ">=";
            if (key.includes("not"))
                operator = "!" + operator;

            return `${fieldName} ${operator} ${this.props.activePreset.filters[filterKey]}`;
        });
        return (
            <Tooltip title={
                <>
                    <b>{this.props.t("table.filtersInUse")}</b>
                    <ul>{titles.map(t => <li key={t}>{t}</li>)}</ul>
                </>
            }>
                <Icon type={"filter"} className={"filter-icon"}/>
            </Tooltip>
        );
    };

    render() {
        const { dropdownButtonActions, locked} = this.props

        const buttonMenuItems = dropdownButtonActions && dropdownButtonActions.map((actionObject) =>
            <Menu.Item key={actionObject.key}>
                <Icon type={actionObject.iconType}/>
                {actionObject.title}
            </Menu.Item>
        );

        const tableControlDropdownButtonMenu = dropdownButtonActions && (
            <Menu onClick={ this.handleMenuClick }>
                {buttonMenuItems}
            </Menu>
        );

        return (
            <div className={ 'table-control-panel grid-x grid-margin-x' }>
                {
                    <div className="cell">
                        <div className={ "grid-x align-right table-settings" }>
                            <div className={ "cell shrink" }>
                                <Button
                                    onClick={ this.buttonOnGetTableData }
                                    shape="circle"
                                    icon="reload"
                                />
                                <Button
                                    shape="circle"
                                    icon={locked ? "lock" : "unlock"}
                                    type={locked ? "primary" : null}
                                    onClick={ this.buttonTogglePresetLock }
                                />
                                <Button
                                    onClick={ this.openDrawer }
                                    shape="circle"
                                    icon="setting"
                                />
                            </div>
                        </div>
                    </div>
                }

                <div className="cell auto">
                    {dropdownButtonActions && (
                        <Dropdown.Button
                            type="primary"
                            onClick={ this.handleButtonClick }
                            overlay={ tableControlDropdownButtonMenu }
                        >
                            Default action
                        </Dropdown.Button>
                    )}
                </div>

                <div className={ "cell shrink align-flex-end" }>
                    <div style={{display: "flex"}}>
                        <div className={"ant-pagination-total-text"}>
                            {this.renderFiltersInUse()}
                        </div>
                        <div>
                            <Pagination
                                total={ this.props.numberOfItems }
                                showSizeChanger
                                simple={ this.props.browser.viewport.width < MediaQueries.medium }
                                onChange={ this.paginationOnChange }
                                onShowSizeChange={ this.paginationOnShowSizeChange }
                                current={ this.props.currentPage }
                                pageSize={ this.props.pageSize }
                                showTotal={ this.renderTotal }
                                pageSizeOptions={ this.state.pageSizeOptions }
                            />
                        </div>
                    </div>
                </div>


            </div>
        )
    }

}

export default withNamespaces()(TableControlPanel);
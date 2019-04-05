import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { Table, Icon, Switch } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import i18n from 'utils/i18n'

import {translateTableColumnTitle} from "./util/translate";


function dragDirection(
    dragIndex,
    hoverIndex,
    initialClientOffset,
    clientOffset,
    sourceClientOffset,
) {
    const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
    const hoverClientY = clientOffset.y - sourceClientOffset.y;
    if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
        return 'downward';
    }
    if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
        return 'upward';
    }
}

const sortableRowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(
            `selectedRowKeys: ${selectedRowKeys}`,
            'selectedRows: ', selectedRows
        );
    },
};


class BodyRow extends Component {
    render() {
        const {
            isOver,
            connectDragSource,
            connectDropTarget,
            moveRow,
            dragRow,
            clientOffset,
            sourceClientOffset,
            initialClientOffset,
            ...restProps
        } = this.props;
        const style = { ...restProps.style, cursor: 'move' };

        let className = restProps.className;
        if (isOver && initialClientOffset) {
            const direction = dragDirection(
                dragRow.index,
                restProps.index,
                initialClientOffset,
                clientOffset,
                sourceClientOffset
            );
            if (direction === 'downward') {
                className += ' drop-over-downward';
            }
            if (direction === 'upward') {
                className += ' drop-over-upward';
            }
        }

        return connectDragSource(
            connectDropTarget(
                <tr
                    {...restProps}
                    className={className}
                    style={style}
                />
            )
        );
    }
}

const rowSource = {
    beginDrag(props) {
        return {
            index: props.index,
        };
    },
};

const rowTarget = {
    drop(props, monitor) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Time to actually perform the action
        props.moveRow(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
    },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    sourceClientOffset: monitor.getSourceClientOffset(),
}))(
    DragSource('row', rowSource, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        dragRow: monitor.getItem(),
        clientOffset: monitor.getClientOffset(),
        initialClientOffset: monitor.getInitialClientOffset(),
    }))(BodyRow)
);


class DragSortingTable extends React.Component {

    components = {
        body: {
            row: DragableBodyRow,
        },
    }

    moveRow = (dragIndex, hoverIndex) => {

        const { activeColumnTitles, activePaneKey, headerCellTitles } = this.props;
        const dragRow = headerCellTitles[dragIndex].title;

        this.props.updatePresets(
            update(
                activeColumnTitles, {
                    $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
                }
            ),
            activePaneKey
        )
    }

    toggleColumnVisibility = (activePaneKey, record, checked) => {

        this.props.toggleColumnVisibilitySwitch(activePaneKey, record, checked)

    }
    
    renderDrag = () => (<Icon type={"drag"}/>)

    renderSwitch = (text, record) => (
        <Switch
            size="small"
            checked={this.props.activeColumnTitles.includes(record.key)}
            onChange={
                (checked) => this.toggleColumnVisibility(this.props.activePaneKey, record, checked)
            }
        />
    );

    renderSmall = (text, record) => (
        <div>
            <h3><Icon type={"drag"}/> {record.title}</h3>
            <h4>{i18n.t('table.visible_column')}: <Switch size="small" defaultChecked /> </h4>
        </div>
    );

    renderRowTitle = (text, record) => {
        return translateTableColumnTitle(this.props.t, this.props.tableName, record.title);
    };

    columns = [
        {
            dataIndex: "_",
            render: this.renderDrag
        },
        {
            title: i18n.t('settings.header_cell'),
            key: "title",
            dataIndex: "title",
            render: this.renderRowTitle,
        },
        {
            dataIndex: "__",
            title: i18n.t('table.visible_column'),
            render: this.renderSwitch
        },
    ];

    smallColumns = [
        {
            title: i18n.t('table.header_cell'),
            key: "title",
            dataIndex: "title",
            render: this.renderSmall
        },
    ];

    onRow = (record, index) => ({
        index,
        moveRow: this.moveRow,
    });

    render() {
        return (
            <Table
                columns={this.props.renderSmall ? this.smallColumns : this.columns}
                dataSource={this.props.headerCellTitles}
                components={this.components}
                onRow={this.onRow}
                pagination={false}
            />
        );
    }
}

export default withNamespaces()(
    DragDropContext(HTML5Backend)(
        DragSortingTable
    )
);
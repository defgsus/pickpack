

/**
 *
 * @param t i18next translator
 * @param tableName id of table
 * @param fieldId id of field
 * @returns {string}
 */
export const translateTableColumnTitle = (t, tableName, fieldId) => {

    if (fieldId === "detailViewOpenerColumn")
        return t("table.detailViewOpenerColumn");

    const tableNamePrefix = `TABLE.${tableName}.`;

    // fool parser, don't want to create extra translation keys
    const _t_ = t;
    const title = _t_(tableNamePrefix + fieldId);

    if (title.startsWith(tableNamePrefix))
        return title.slice(tableNamePrefix.length);
    return title;
};
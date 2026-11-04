const _ = require('lodash')
const filter = require('./filter')

module.exports = function (table, options, entitySetName, model) {
  let query

  options = _.extend({
    $orderBy: {},
    $select: {},
    $filter: {}
  }, options)

  if (options.$inlinecount) {
    query = table.select(table.star().count())
  } else {
    if (Object.getOwnPropertyNames(options.$select).length === 0 || (Object.getOwnPropertyNames(options.$select).length === 1 && options.$select._id)) {
      query = table.select(table.star())
    } else {
      const columns = getColumns(options.$select, entitySetName, model)

      for (const columnName of columns) {
        query = (query || table).select(table[columnName])
      }
    }
  }

  query = query.from(table)

  const entityTypeName = model.entitySets[entitySetName].entityType.replace(model.namespace + '.', '')
  const entityType = model.entityTypes[entityTypeName]

  query = filter(query, table, options.$filter, entityType)

  if (options.$inlinecount) {
    return query.toQuery()
  }

  for (const orderByKey in options.$sort) {
    const column = table[orderByKey]
    query = query.order(column[options.$sort[orderByKey] === -1 ? 'desc' : 'asc'])
  }

  if (options.$limit) {
    query = query.limit(options.$limit)
  }

  if (options.$skip) {
    query = query.offset(options.$skip)
  }

  return query.toQuery()
}

function getColumns (select, entitySetName, model) {
  const columnGroups = new Map()
  const entityTypeName = model.entitySets[entitySetName].entityType.replace(model.namespace + '.', '')
  const entityType = model.entityTypes[entityTypeName]

  const selectFields = Object.keys(select)

  for (const columnName in entityType) {
    const columnType = entityType[columnName]

    if (columnType.isPrimitive) {
      if (select[columnName] != null) {
        columnGroups.set(columnName, [columnName])
      }
      continue
    }

    const hasNestedMatchInSelectFields = selectFields.some((f) => f.startsWith(`${columnName}.`))

    if (select[columnName] === undefined && !hasNestedMatchInSelectFields) {
      continue
    }

    if (columnType.complexType) {
      let targetColumns

      if (select[columnName] !== undefined) {
        // if there is select for the root complex property then include all columns
        targetColumns = Object.keys(columnType.complexType)
      } else {
        // otherwise include only the columns that are specified in the select object
        targetColumns = selectFields.filter((f) => f.startsWith(`${columnName}.`)).map((f) => f.split('.')[1])
      }

      for (const complexColumnName of targetColumns) {
        if (!columnGroups.has(columnName)) {
          columnGroups.set(columnName, [])
        }

        columnGroups.get(columnName).push(columnName + '_' + complexColumnName)
      }

      continue
    }

    columnGroups.set(columnName, [columnName])
  }

  const topLevelSelectFields = getTopLevelFields(select)
  const allColumns = []

  for (const topField of topLevelSelectFields) {
    const columnNames = columnGroups.get(topField) ?? []

    if (columnNames.length > 0) {
      allColumns.push(...columnNames)
    }
  }

  return allColumns
}

function getTopLevelFields (select) {
  // $select keys can be dotted paths into a nested complex type (e.g. 'chrome.headerTemplate'),
  // we want to get a collection with only the top-level keys of fields as the result
  const topLevelFields = new Set()

  for (const key in select) {
    const topLevelKey = key.split('.')[0]
    topLevelFields.add(topLevelKey)
  }

  return topLevelFields
}

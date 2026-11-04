
function createIdCollectionManager () {
  const collection = new Map()

  return {
    has (key) {
      assertOk(key != null, 'key is required')
      return collection.has(key)
    },
    get (key) {
      assertOk(key != null, 'key is required')
      return collection.get(key)
    },
    set (key, managerSpec) {
      assertOk(key != null, 'key is required')
      assertOk(managerSpec != null, 'managerSpec is required')

      const manager = createIdManager(key, managerSpec)
      collection.set(key, manager)
      return manager
    },
    all () {
      return collection.entries()
    }
  }
}

function createIdManager (name, options = {}) {
  assertOk(name != null, 'name must be provided')

  const { fromItems, fromMaxId } = options

  assertOk(!(fromItems == null && fromMaxId == null), 'either fromItems or fromMaxId implementation must be provided')
  assertOk(!(fromItems != null && fromMaxId != null), 'only one implementation fromItems or fromMaxId can be provided')

  const prefix = options.prefix

  if (prefix == null) {
    throw new Error(`prefix for "${name}" not found`)
  }

  let maxNumId

  const getMaxFromItems = (_currentFromItems, initialMaxNumId) => {
    const { getIds, getNumberId } = _currentFromItems

    if (getIds == null || getNumberId == null) {
      throw new Error('fromItems implementation must provide getIds and getNumberId functions')
    }

    const ids = getIds()

    return ids.reduce((lastNumId, id) => {
      const numId = getNumberId(id)

      if (numId == null) {
        return lastNumId
      }

      if (numId > lastNumId) {
        return numId
      }

      return lastNumId
    }, initialMaxNumId)
  }

  if (fromItems != null) {
    maxNumId = getMaxFromItems(fromItems, 0)
  } else {
    maxNumId = fromMaxId
  }

  if (maxNumId == null) {
    throw new Error('Unable to get max num id')
  }

  const generateId = (numId) => `${prefix}${numId}`

  return {
    get last () {
      return { numId: maxNumId, id: generateId(maxNumId) }
    },
    updateFromItems (fromItems) {
      maxNumId = getMaxFromItems(fromItems, maxNumId)
    },
    generate () {
      maxNumId++
      return { numId: maxNumId, id: generateId(maxNumId) }
    }
  }
}

function assertOk (valid, message) {
  if (!valid) {
    throw new Error(message)
  }
}

module.exports.createIdCollectionManager = createIdCollectionManager

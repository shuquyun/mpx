import {
  normalizeMap,
  getByPath
} from '../helper/utils'
function mapFactory (type, store) {
  return function (depPath, maps) {
    if (typeof depPath !== 'string') {
      maps = depPath
      depPath = ''
    }
    maps = normalizeMap(maps)
    const result = {}
    for (let key in maps) {
      result[key] = function (payload) {
        const value = depPath ? `${depPath}.${maps[key]}` : maps[key]
        if (type === 'mutations') {
          return store.commit(value, payload)
        } else if (type === 'actions') {
          return store.dispatch(value, payload)
        } else {
          let getterVal = getByPath(store.getters, value, '', '__NOTFOUND__')
          if (getterVal === '__NOTFOUND__') {
            console.warn('【MPX ERROR】', new Error(`unknown getter named [${value}]`))
            getterVal = ''
          }
          return getterVal
        }
      }
    }
    return result
  }
}
export default function (store) {
  return {
    mapGetters: mapFactory('getters', store),
    mapMutations: mapFactory('mutations', store),
    mapActions: mapFactory('actions', store),
    mapState: (maps) => {
      maps = normalizeMap(maps)
      const result = {}
      Object.keys(maps).forEach(key => {
        const value = maps[key]
        result[key] = function () {
          if (typeof value === 'function') {
            return value.call(this, store.state, store.getters)
          } else if (typeof value === 'string') {
            return getByPath(store.state, value)
          }
        }
      })
      return result
    }
  }
}

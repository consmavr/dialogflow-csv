const dialogflowHelpers = require('../dialogflow-helpers')
const helpers = require('../helpers')

const createEntitiesDictionary = (csvData) => {
  return new Promise(async (resolve, reject) => {
    const dict = {}
    for (let entry of csvData) {
      let name, value, synonyms
      ;[name, value, ...synonyms] = [...entry]
      synonyms.push(value)

      synonyms = await synonyms.filter((el) => {
        return el !== ''
      })

      synonyms = synonyms.map((element) => {
        return element.replace('(', '[').replace(')', ']')
      })
      synonyms = sortArrayByLength(synonyms)
      if (dict[name] === undefined) {
        dict[name] = {}
      }

      if (dict[name][value] === undefined) {
        dict[name][value] = synonyms
      } else {
        dict[name][value].push(synonyms)
      }
    }
    resolve(dict)
  })
}

const sortArrayByLength = (array) => {
  return array.sort((a, b) => {
    return b.length - a.length
  })
}
const createEntities = async (inputFile, projectId) => {
  const csvData = await helpers.csvToArray(inputFile)
  const entitiesDictionary = await createEntitiesDictionary(csvData)
  const entities = Object.keys(entitiesDictionary)

  let counter = 0
  for (const entity of entities) {
    counter++
    const entityId = await dialogflowHelpers.createEntityType(
      projectId,
      entity,
      'KIND_MAP'
    )

    const values = Object.keys(entitiesDictionary[entity])

    await dialogflowHelpers.createEntity(
      entityId,
      values,
      entitiesDictionary[entity]
    )
    console.log('donezo')
    counter++
    if (counter > 59) {
      await helpers.sleep(60000)
      counter = 0
    }
  }
}

const deleteEntityTypes = (entityTypes, projectId) => {
  return new Promise(async (resolve, reject) => {
    await entityTypes.forEach((entityType) => {
      dialogflowHelpers.deleteEntityType(entityType, projectId)
    })
    resolve()
  })
}

module.exports.createEntities = createEntities
module.exports.createEntitiesDictionary = createEntitiesDictionary
module.exports.deleteEntityTypes = deleteEntityTypes

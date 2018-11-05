const intents = require('../intents')
const entities = require('../entities')
const helpers = require('../helpers')
const dialogflowHelpers = require('../dialogflow-helpers')

const listIntents = async (projectId) => {
  const listIntents = await dialogflowHelpers.listIntents(projectId)
  console.log(listIntents)
}

const listEntities = async (projectId) => {
  const listEntityTypes = await dialogflowHelpers.listEntityTypes(projectId)
  console.log(listEntityTypes)
}

const deleteIntents = (projectId) => {
  intents.deleteIntents(projectId)
}

const deleteEntities = async (projectId) => {
  const entityTypes = await dialogflowHelpers.listEntityTypes(projectId)
  await entities.deleteEntityTypes(entityTypes, projectId)
}

const createIntents = async (dataFile, entitiesFile, projectId) => {
  const entitiesData = await helpers.csvToArray(entitiesFile)
  const intentsData = await helpers.csvToArray(dataFile)
  const intentsDictionary = await intents.createIntentsDictionary(
    intentsData,
    1,
    0
  )
  const entitiesDictionary = await entities.createEntitiesDictionary(
    entitiesData
  )
  await intents.createIntents(intentsDictionary, entitiesDictionary, projectId)
}

const createEntities = async (entitiesFile, projectId) => {
  await entities.createEntities(entitiesFile, projectId)
}

const query = (query, projectId) => {
  dialogflowHelpers.query(query, projectId)
}

const testAgent = () => {
  /**
   * TODO
   */
}

module.exports.query = query
module.exports.listIntents = listIntents
module.exports.listEntities = listEntities
module.exports.deleteIntents = deleteIntents
module.exports.deleteEntities = deleteEntities
module.exports.createIntents = createIntents
module.exports.createEntities = createEntities

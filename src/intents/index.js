// import * as dialogflowHelpers from '../dialogflow-helpers'
const dialogflowHelpers = require('../dialogflow-helpers')
/**
 * Get list of all intents, then delete one by one
 * @param {string} projectId
 */
const deleteIntents = (projectId) => {
  return new Promise(async (resolve, reject) => {
    const listIntents = await dialogflowHelpers.listIntents(projectId)
    for (let intent of listIntents) {
      await dialogflowHelpers.deleteIntent(intent.name)
    }
  })
}

/**
 * Get intent data and create an object
 * Intents object form
 * {
 *    [intent]: [trainingPhrases]
 * }
 * @param {object} csvData
 * @param {number} intentIndex
 * @param {number} textIndex
 */
const createIntentsDictionary = (csvData, intentIndex, textIndex) => {
  return new Promise((resolve, reject) => {
    const dict = {}
    for (let entry of csvData) {
      if (dict[entry[intentIndex]] === undefined) {
        dict[entry[intentIndex]] = [entry[textIndex]]
      } else {
        dict[entry[intentIndex]].push(entry[textIndex])
      }
    }
    resolve(dict)
  })
}

/**
 * Filter out empty parts.
 */
const filterParts = (parts) => {
  return new Promise((resolve, reject) => {
    parts = parts.filter((el) => {
      if (typeof el === 'undefined') return false
      if (!el) return false
      if (el.entityType) return true
      if (el.length > 0) return true
      return false
    })
    resolve(parts)
  })
}

/**
 * Receive array of phrases(trainingPhrases) and entities and call splitToParts for each phrase
 * @param {Array<string>} phrases
 * @param {object} entitiesDictionary
 */
const createParts = (phrases, entitiesDictionary) => {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < phrases.length; i++) {
      phrases[i] = await splitToParts(phrases[i], entitiesDictionary)
    }
    resolve(phrases)
  })
}

/**
 * updateParts
 */
const updateParts = (parts, i, synonym, entity) => {
  return new Promise((resolve, reject) => {
    let first, last
    ;[first, last] = parts[i].toLowerCase().split(synonym.toLowerCase())
    parts = [
      ...parts.slice(0, i),
      first,
      {
        text: synonym,
        entityType: `@${entity}`,
        alias: entity
      },
      last,
      ...parts.slice(i + 1, parts.length)
    ]
    resolve(parts)
  })
}

/**
 * Receives the entities object and a string.
 * For each synonym in entities, check if that synonym exists in the string.
 * If yes, split string to start substring, matched substring, end substring.
 * Matched substring is replaced by an object that dialogflow will recognize as entity.
 *
 * Entities dictionary form
 * {
 *    [entity]:{
 *              [value]: [value, ...synonyms]
 *    }
 * }
 *
 * Example:
 * phrase = "mutual fund portfolio"
 * 1. parts = ["mutual fund portfolio"]
 * 2. parts = [{text: "mutual fund", entityType: "@product"}, "portfolio"]
 * 3. parts = [{text: "mutual fund", entityType: "@product"}, " ", {text: "portfolio", entityType: "@product"}]
 * 4. iterated over all synonyms of all entities, and done.
 * @param {String} phrase
 * @param {Object} entitiesDictionary
 */
const splitToParts = (phrase, entitiesDictionary) => {
  return new Promise(async (resolve, reject) => {
    /**
     * Initialize parts
     */
    let parts = [phrase]

    /**
     * Iterate over each entity from entitiesDictionary
     */
    const entities = Object.keys(entitiesDictionary)
    for (let entity of entities) {
      /**
       * Iterate over each value of each entity
       */
      const entityValues = Object.keys(entitiesDictionary[entity])
      for (let value of entityValues) {
        /**
         * Iterate over each synonym of each value
         */
        for (let synonym of entitiesDictionary[entity][value]) {
          /**
           * Iterate over every part or parts.
           * Initially there is only one part.
           * When a part is created(it has a entityType key) it will not be processed further.
           * The rest will be taken into account
           */
          for (let i = 0; i < parts.length; i++) {
            /**
             * If it's already an entity part skip
             */
            if (!parts[i].entityType) {
              /**
               * Skip if:
               * 1. index > -1 => Part doesn't contain synonym
               * 2. !/^[a-zA-Z]+/.test(parts[i].charAt(index - 1)) => The character before is a letter.
               *  this means it's substring of another word. Example if ING is an entity "going" will become "goING"
               *  where the "ING" substring will be marked as entity
               * 3. !/[a-zA-Z]+/.test(parts[i].charAt(index + synonym.length)) => The character after is a letter.
               * 4. Either the previous or the next character is a space.Maybe unnecessary.
               */
              let index = parts[i].toLowerCase().indexOf(synonym.toLowerCase())
              if (
                index > -1 &&
                !/^[a-zA-Z]+/.test(parts[i].charAt(index - 1)) &&
                !/[a-zA-Z]+/.test(parts[i].charAt(index + synonym.length)) &&
                (parts[i].charAt(index - 1) === ' ' ||
                  parts[i].charAt(index + synonym.length) === ' ')
              ) {
                /**
                 * Marks the substring that contains the entity as an entity that dialogflow understands
                 */
                parts = await updateParts(parts, i, synonym, entity)
                /**
                 * Removes empty arrays and stuff...
                 */
                parts = await filterParts(parts)
              }
            }
          }
        }
      }
    }
    resolve(parts)
  })
}

/**
 * createIntents
 * @param {*} intentsDictionary
 * @param {*} entitiesDictionary
 * @param {*} projectId
 */
const createIntents = (intentsDictionary, entitiesDictionary, projectId) => {
  return new Promise(async (resolve, reject) => {
    const intents = Object.keys(intentsDictionary)
    for (const intent of intents) {
      dialogflowHelpers.createIntent(
        projectId,
        intent,
        await createParts(intentsDictionary[intent], entitiesDictionary),
        [intent]
      )
    }
    resolve()
  })
}

module.exports.deleteIntents = deleteIntents
module.exports.createIntents = createIntents
module.exports.createIntentsDictionary = createIntentsDictionary
module.exports.splitToParts = splitToParts

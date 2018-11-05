const dialogflow = require('dialogflow')

const createEntityType = (projectId, displayName, kind) => {
  return new Promise((resolve, reject) => {
    // [START dialogflow_create_entity_type]
    // Imports the Dialogflow library
    // Instantiates clients
    const entityTypesClient = new dialogflow.EntityTypesClient()

    // The path to the agent the created entity type belongs to.
    const agentPath = entityTypesClient.projectAgentPath(projectId)

    const createEntityTypeRequest = {
      parent: agentPath,
      entityType: {
        displayName: displayName,
        kind: kind
      }
    }

    entityTypesClient
      .createEntityType(createEntityTypeRequest)
      .then((responses) => {
        resolve(responses[0].name)
      })
      .catch((err) => {
        console.error('Failed to create size entity type:', err)
      })
    // [END dialogflow_create_entity_type]
  })
}

const createEntity = (name, values, entitiesDictionary) => {
  return new Promise(async (resolve, reject) => {
    // Instantiates clients
    const entityTypesClient = new dialogflow.EntityTypesClient()

    // The path to the agent the created entity belongs to.
    const agentPath = name

    const entities = []
    await values.forEach((value) => {
      const entity = {
        value: value,
        synonyms: entitiesDictionary[value]
      }
      entities.push(entity)
    })

    const createEntitiesRequest = {
      parent: agentPath,
      entities: entities
    }

    entityTypesClient
      .batchCreateEntities(createEntitiesRequest)
      .then((responses) => {
        console.log(`created entity `)
        resolve()
      })
      .catch((err) => {
        reject(err)
      })
    // [END dialogflow_create_entity]
  })
}

const createIntent = (
  projectId,
  displayName,
  trainingPhrasesParts,
  messageTexts
) => {
  // Instantiates the Intent Client
  const intentsClient = new dialogflow.IntentsClient()

  // The path to identify the agent that owns the created intent.
  const agentPath = intentsClient.projectAgentPath(projectId)

  const trainingPhrases = []
  const entitiesList = []
  trainingPhrasesParts.forEach((trainingPhrasesPart) => {
    trainingPhrasesPart = trainingPhrasesPart.map((part) => {
      if (!part.entityType) {
        return { text: part }
      }
      if (!entitiesList.includes(part.entityType)) {
        entitiesList.push(part.entityType)
      }
      return part
    })
    const trainingPhrase = {
      type: 'EXAMPLE',
      parts: trainingPhrasesPart
    }

    trainingPhrases.push(trainingPhrase)
  })

  const messageText = {
    text: messageTexts
  }

  const message = {
    text: messageText
  }

  const parameters = []
  entitiesList.forEach((parameter) => {
    parameters.push({
      value: `$${parameter.replace('@', '')}`,
      displayName: parameter.replace('@', ''),
      entityTypeDisplayName: parameter
    })
  })

  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
    parameters: parameters
  }

  const createIntentRequest = {
    parent: agentPath,
    intent: intent
  }

  // Create the intent
  intentsClient
    .createIntent(createIntentRequest)
    .then((responses) => {
      console.log(`Intent ${responses[0].name} created`)
      responses[0].parameters.forEach((param) => {
        console.log(param.name)
      })
    })
    .catch((err) => {
      console.error('ERROR:', err)
    })
  // [END dialogflow_create_intent]
}

const listIntents = (projectId) => {
  return new Promise((resolve, reject) => {
    // Instantiates clients
    const intentsClient = new dialogflow.IntentsClient()

    // The path to identify the agent that owns the intents.
    const projectAgentPath = intentsClient.projectAgentPath(projectId)

    const request = {
      parent: projectAgentPath
    }

    // Send the request for listing intents.
    return intentsClient
      .listIntents(request)
      .then((responses) => {
        resolve(responses[0])
      })
      .catch((err) => {
        reject(err)
      })
  })

  // [END dialogflow_list_intents]
}

const listEntityTypes = (projectId) => {
  return new Promise((resolve, reject) => {
    // Instantiates clients
    const entityTypesClient = new dialogflow.EntityTypesClient()

    // The path to the agent the entity types belong to.
    const agentPath = entityTypesClient.projectAgentPath(projectId)

    const request = {
      parent: agentPath
    }

    // Call the client library to retrieve a list of all existing entity types.
    entityTypesClient
      .listEntityTypes(request)
      .then((responses) => {
        responses[0].forEach((entityType) => {
          console.log(`Entity type name: ${entityType.name}`)
          console.log(`Entity type display name: ${entityType.displayName}`)
          console.log(`Number of entities: ${entityType.entities.length}\n`)
        })
        resolve(responses[0])
      })
      .catch((err) => {
        reject(err)
      })
    // [END dialogflow_list_entity_types]
  })
}

const deleteEntityType = (entityType) => {
  return new Promise((resolve, reject) => {
    // Instantiates clients
    const entityTypesClient = new dialogflow.EntityTypesClient()

    const entityTypePath = entityType.name

    const request = {
      name: entityTypePath
    }

    // Call the client library to delete the entity type.
    entityTypesClient
      .deleteEntityType(request)
      .then(() => {
        console.log(`Entity type ${entityTypePath} deleted`)
        resolve()
      })
      .catch((err) => {
        console.error(`Failed to delete entity type ${entityTypePath}:`, err)
        reject(err)
      })
    // [END dialogflow_delete_entity]
  })
}

const deleteIntent = (name) => {
  return new Promise((resolve, reject) => {
    // Instantiates clients
    const intentsClient = new dialogflow.IntentsClient()
    const request = { name: name }

    // Send the request for deleting the intent.
    intentsClient
      .deleteIntent(request)
      .then(() => {
        console.log(`Intent ${name} deleted`)
        resolve()
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const query = (
  query,
  projectId,
  sessionId = 'session-unique-id12345',
  languageCode = 'en-US'
) => {
  const sessionClient = new dialogflow.SessionsClient()

  // Define session path
  const sessionPath = sessionClient.sessionPath(projectId, sessionId)

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode
      }
    }
  }

  // Send request and log result
  sessionClient
    .detectIntent(request)
    .then((responses) => {
      console.log('Detected intent')
      const result = responses[0].queryResult
      console.log(`  Query: ${result.queryText}`)
      console.log(`  Response: ${result.fulfillmentText}`)
      console.log(`${JSON.stringify(responses[0], null, 4)}`)
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`)
      } else {
        console.log(`  No intent matched.`)
      }
    })
    .catch((err) => {
      console.error('ERROR:', err)
    })
}
module.exports.query = query
module.exports.createEntityType = createEntityType
module.exports.deleteIntent = deleteIntent
module.exports.deleteEntityType = deleteEntityType
module.exports.listIntents = listIntents
module.exports.listEntityTypes = listEntityTypes
module.exports.createIntent = createIntent
module.exports.createEntity = createEntity

/**
 * Dependencies
 */
const tasks = require('./tasks')

const cli = require(`yargs`)
  .options({
    intentsFile: {
      alias: 'i',
      description: 'A CSV file containint the intent names and inputs',
      type: 'string'
    },
    entitiesFile: {
      alias: 'e',
      description: 'A CSV file containint the intent names and inputs',
      type: 'string'
    },
    query: {
      alias: 'q',
      description: 'A query to test agent',
      type: 'string'
    },
    projectId: {
      alias: 'p',
      default: process.env.projectId,
      description:
        'The Project ID to use. Defaults to the value of the ' +
        'GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string'
    },
    sessionId: {
      alias: 's',
      default: require('uuid/v1')(),
      type: 'string',
      requiresArg: true,
      description:
        'The identifier of the detect session. Defaults to a random UUID.'
    },
    languageCode: {
      alias: 'l',
      default: 'en-US',
      type: 'string',
      requiresArg: true,
      description: 'The language code of the query. Defaults to "en-US".'
    }
  })
  .command(`create-intents`, `Creates intents in dialogflow`, {}, (opts) => {
    console.log(opts)
    tasks.createIntents(opts.intentsFile, opts.entitiesFile, opts.projectId)
  })
  .command(`create-entities`, `Creates entities in dialogflow`, {}, (opts) => {
    tasks.createEntities(opts.entitiesFile, opts.projectId)
  })
  .command(`delete-intents`, `Deletes i entities in dialogflow`, {}, (opts) => {
    tasks.deleteIntents(opts.projectId)
  })
  .command(`delete-entities`, `Deletes entities in dialogflow`, {}, (opts) => {
    tasks.deleteEntities(opts.projectId)
  })
  .command(`list-intents`, `Lists intents  from dialogflow`, {}, (opts) => {
    tasks.listIntents(opts.projectId)
  })
  .command(`list-entities`, `Lists entities from dialogflow`, {}, (opts) => {
    tasks.listEntities(opts.projectId)
  })
  .command(`query`, `Make query`, {}, (opts) => {
    tasks.query(opts.query, opts.projectId)
  })
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/conversation/docs`
  )
  .help()
  .strict()

if (module === require.main) {
  cli.parse(process.argv.slice(2))
}

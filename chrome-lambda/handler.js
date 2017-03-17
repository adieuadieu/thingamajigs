'use strict'

require('./buffer-polyfill')

const childProcess = require('child_process')
const os = require('os')
const path = require('path')
const cdp = require('chrome-remote-interface')
const get = require('got')

const LOADING_TIMEOUT = 15000
const STARTUP_TIMEOUT = 5000
const URL_TO_LOAD = 'https://en.wikipedia.org/wiki/Mimir'

module.exports.run = (event, context, callback) => {
  const chrome = childProcess.spawn(
    path.resolve('./headless-chrome/headless_shell'),
    [
      '--disable-gpu',
      '--no-sandbox',
      '--homedir=/tmp',
      '--single-process',
      '--data-path=/tmp/data-path',
      '--disk-cache-dir=/tmp/cache-dir',
      '--remote-debugging-port=9222',
    ],
    {
      cwd: os.tmpdir(),
      shell: true,
    }
  )

  const waitUntilChromeIsReady = startTime =>
    new Promise(
      (resolve, reject) =>
        Date.now() - startTime < STARTUP_TIMEOUT
          ? get('http://localhost:9222/json')
              .then(resolve)
              .catch(() => {
                waitUntilChromeIsReady(startTime)
                  .then(resolve)
                  .catch(reject)
              })
          : reject()
    )

  waitUntilChromeIsReady(Date.now())
    .then(() =>
      cdp()
        .then((client) => {
          const url = URL_TO_LOAD
          const Network = client.Network
          const Page = client.Page
          const requestsMade = []
          let doneLoading = false

          const waitUntilPageIsLoaded = startTime =>
            new Promise(
              (resolve, reject) =>
                !doneLoading &&
                  Date.now() - startTime < LOADING_TIMEOUT
                  ? setTimeout(
                      () =>
                        waitUntilPageIsLoaded(startTime).then(
                          resolve
                        ),
                      100
                    )
                  : resolve()
            )

          Network.requestWillBeSent(params =>
            requestsMade.push(params))

          Page.loadEventFired(() => {
            doneLoading = true
          })

          Promise.all([Network.enable(), Page.enable()])
            .then(() => Page.navigate({ url }))
            .then(() => waitUntilPageIsLoaded(Date.now()))
            .then(() => {
              client.close()
              chrome.kill()

              callback(null, {
                url,
                requestsMade,
              })
            })
        })
        .catch((error) => {
          throw new Error(error)
        }))
    .catch((error) => {
      chrome.kill()

      callback(null, {
        message: 'There was an issue connecting to Chrome',
        error,
      })
    })
}

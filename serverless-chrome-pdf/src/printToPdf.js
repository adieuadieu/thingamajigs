import path from 'path'
import { spawn, exec } from 'child_process'
import Cdp from 'chrome-remote-interface'
import { sleep } from './utils'

const LOAD_TIMEOUT = 1000 * 60 // Give the page max 60 seconds to load
const CHROME_PATH = process.env.CHROME_PATH && path.resolve(process.env.CHROME_PATH)

export default (async function navigateToPageAndPrintToPDF (url) {
  let chromeProcess

  if (CHROME_PATH) {
    console.log('chrome headless bin path', CHROME_PATH)

    exec('ls && df -h && more /etc/fstab', (err, out, end) => {
      console.log('exec', err, out, end)
    })
    await sleep(1000)
    chromeProcess = await new Promise((resolve, reject) => {
      const child = spawn(
        CHROME_PATH,
        ['--headless', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9222'],
        { detached: true },
      ) // '--window-size=1280x1696'

      resolve()

      child.on('error', (error) => {
        console.log('Failed to start child process.', error)
        reject(error)
      })

      child.stdout.on('data', (data) => {
        console.log(`child stdout: ${data}`)
        resolve()
      })

      child.stderr.on('data', (data) => {
        console.log(`child stderr: ${data}`)
        resolve()
      })

      child.on('close', (code) => {
        if (code !== 0) {
          console.log(`child process exited with code ${code}`)
        }
      })

      // child.unref()
    })

    await sleep(2000) // wait for the headless chrome process to start up... laaaaame
  }

  let result
  let loaded = false

  const loading = async (startTime = Date.now()) => {
    console.log('loading...')
    if (!loaded && Date.now() - startTime < LOAD_TIMEOUT) {
      await sleep(100)
      await loading(startTime)
    }
  }
  console.log('here 1')
  const tab = await Cdp.New({ host: '127.0.0.1' })
  console.log('tab', tab)
  const client = await Cdp({ host: '127.0.0.1', tab /* , remote: true*/ })
  const { Network, Page } = client

  console.log('here 2')

  Cdp.Version((err, info) => {
    console.log('CDP version info', err, info)
  })

  /* client.on('event', (message) => {
    console.log('client event', message)
  })*/

  Network.requestWillBeSent((params) => {
    // console.log(params.request.url)
  })

  Page.loadEventFired(() => {
    loaded = true
  })

  console.log('here 3')

  // const idunno = await client.Target.createTarget({ url })
  // console.log('idduno', idunno)

  try {
    console.log('here 4')
    client.send('Network.enable', true, (error, response) =>
      console.log('send Network.enable', error, response))
    console.log('here 4.1')
    client.send('Page.enable', true, (error, response) =>
      console.log('send Page.enable', error, response))
    console.log('here 4.2')

    await Network.enable()
    console.log('here 4.5')
    await Page.enable()
    console.log('here 5')
    await Page.navigate({ url })
    console.log('here 6')
    await loading()
    console.log('here 7')
    const { data: screenshot } = await Page.captureScreenshot()

    result = new Buffer(screenshot, 'base64')
    // const { data: pdf } = await Page.printToPDF()
  } catch (error) {
    console.error(error)
  }

  // console.log('got this far with result', result)

  await client.close()
  if (chromeProcess) chromeProcess.kill()

  return result
});

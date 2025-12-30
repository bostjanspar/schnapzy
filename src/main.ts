import './style.css'
import { Application, Text, Container } from 'pixi.js'

const app = new Application()

async function init(): Promise<void> {
  await app.init({
    background: '#1a1a2e',
    resizeTo: window,
    antialias: true,
  })

  document.querySelector<HTMLDivElement>('#app')!.appendChild(app.canvas)

  const loadingContainer = new Container()
  loadingContainer.x = app.screen.width / 2
  loadingContainer.y = app.screen.height / 2
  app.stage.addChild(loadingContainer)

  const titleText = new Text({
    text: 'SCHNAPZY',
    style: {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center',
    },
  })
  titleText.anchor.set(0.5)
  loadingContainer.addChild(titleText)

  const loadingText = new Text({
    text: 'Loading game assets...',
    style: {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xaaaaaa,
      align: 'center',
    },
  })
  loadingText.anchor.set(0.5)
  loadingText.y = 60
  loadingContainer.addChild(loadingText)

  window.addEventListener('resize', (): void => {
    loadingContainer.x = app.screen.width / 2
    loadingContainer.y = app.screen.height / 2
  })
}

void init()

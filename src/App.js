import { Lightning, Utils } from '@lightningjs/sdk'
import { Row, Icon } from '@lightningjs/ui-components'

export default class App extends Lightning.Component {
  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        color: 0x0a0a0a0a,
        src: Utils.asset('images/logo_now.png'),
      },
      Text: {
        mount: 0.5,
        x: 500,
        y: 400,
        text: {
          text: 'Film title',
          fontFace: 'Regular',
          fontSize: 64,
          textColor: 0x44444444,
        },
      },
      Row: {
        type: Row,
        x: 10,
        y: 30,
        w: 160,
        itemSpacing: 10,
        scrollIndex: 3,
        items: Array.apply(null, { length: 12 }).map((_, i) => ({
          type: Icon,
          w: 150,
          h: 250,
          icon: 'static/images/film_luca.jpg',
        })),
      },
    }
  }

  _init() {}
}

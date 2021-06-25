import { Lightning, Utils } from '@lightningjs/sdk'
import { Row, Icon, Button } from '@lightningjs/ui-components'

export default class App extends Lightning.Component {
  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        color: 0x0a0a0a0a,
        src: Utils.asset('images/logo_now.png'),
      },
      TextTitle: {
        x: 740,
        y: 100,
        text: {
          text: 'Film title',
          fontFace: 'Segoe Print, Arial',
          fontSize: 64,
          textAlign: 'center',
          textColor: 0x44444444,
        },
      },
      TextDescription: {
        x: 405,
        y: 525,
        text: {
          text:
            'Film description film description Film description Film description Film description Film description Film description Film description Film description Film description Film description Film description Film description Film description Film description Film description Film description',
          fontFace: 'Segoe Print, Arial',
          fontSize: 36,
          wordWrapWidth: 1100,
          textAlign: 'center',
          textColor: 0xcccccccc,
        },
      },
      TextIndex: {
        x: 405,
        y: 470,
        w: 1100,
        text: {
          text: '99',
          fontFace: 'Segoe Print, Arial',
          fontSize: 36,
          wordWrapWidth: 1100,
          textAlign: 'center',
          textColor: 0xcccccccc,
        },
      },
      RowOfFilmImages: {
        type: Row,
        x: 10,
        y: 200,
        width: 1000,
        height: 250,
        itemSpacing: 10,
        scrollIndex: 1,
        items: Array.apply(null, { length: 16 }).map((_, i) => ({
          type: Icon,
          w: 150,
          h: 250,
          icon: `static/images/film_${i}.jpg`,
        })),
      },
    }
  }

  _getFocused() {
    return this.tag('RowOfFilmImages')
  }

  _init() {}
}

import { Lightning, Utils } from '@lightningjs/sdk'
import { Row, Icon, Button } from '@lightningjs/ui-components'

export default class App extends Lightning.Component {
  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        type: Icon,
        color: 0xffffffff,
        src: Utils.asset('images/background.png'),
      },
      BackgroundImage: {
        w: 1920,
        h: 1080,
        type: Icon,
        color: 0xaaaaaaaa,
        src: Utils.asset('images/logo_now.png'),
      },
      TextTitle: {
        x: 785,
        y: 90,
        text: {
          text: 'Logan',
          fontFace: 'Segoe Print, Arial',
          fontSize: 64,
          textAlign: 'center',
          textColor: 0xff00ffff,
        },
      },
      TextUpArrow: {
        x: 853,
        y: 430,
        text: {
          text: '^',
          fontFace: 'Segoe Print, Arial',
          fontSize: 120,
          fontWeight: 'bold',
          textAlign: 'center',
          textColor: 0x77777777,
        },
      },
      TextDescription: {
        x: 355,
        y: 530,
        text: {
          text:
            "In the near future, a weary Logan cares for an ailing Professor X in a hideout on the Mexican border. But Logan's attempts to hide from the world and his legacy are upended when a young mutant arrives, pursued by dark forces.",
          fontFace: 'Segoe Print, Arial',
          fontSize: 28,
          wordWrapWidth: 1100,
          lineHeight: 40,
          textAlign: 'center',
          textColor: 0xd4d4d4d4,
        },
      },
      RowOfFilmImages: {
        type: Row,
        x: 10,
        y: 200,
        width: 1000,
        height: 250,
        itemSpacing: 10,
        scrollIndex: 0,
        items: Array.apply(null, { length: 16 }).map((_, i) => ({
          type: Button,
          type: Icon,
          w: 150,
          h: 250,
          src: `static/images/film_${i}.jpg`,
        })),
      },
    }
  }

  _getFocused() {
    return this.tag('RowOfFilmImages')
  }

  _init() {}
}

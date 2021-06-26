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
      TextDescription: {
        x: 355,
        y: 490,
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
        h: 250,
        itemSpacing: 30,
        scrollIndex: 0,
        items: Array.apply(null, { length: 16 }).map((_, i) => ({
          type: Button,
          w: 150,
          h: 250,
          icon: {
            type: Icon,
            src: '',
            size: 250,
            color: 0xffffffff,
            spacing: 0,
          },
        })),
      },
    }
  }

  _renderLatestUpdate() {
    const row = this.tag('RowOfFilmImages')
    row.items.forEach((item, index) => {
      const icon = item.children[0]
      icon.src = `static/images/film_${index}.jpg`
      icon.h = 250
      icon.w = 150
    })
    row.selected['children'][0].alpha = 0.3
  }

  _getFocused() {
    this._renderLatestUpdate()
    return this.tag('RowOfFilmImages')
  }

  _init() {
    this.tag('RowOfFilmImages').selectedIndex = 0
    this._renderLatestUpdate()
  }
}

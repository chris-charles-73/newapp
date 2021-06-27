import { Lightning, Utils } from '@lightningjs/sdk'
import { Row, Icon, Button } from '@lightningjs/ui-components'
import { films } from '../static/films.json'

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
        x: 0,
        y: 90,
        w: 1920,
        text: {
          text: films[0].title,
          fontFace: 'Segoe Print, Arial',
          fontSize: 64,
          textAlign: 'center',
          textColor: 0xff00ffff,
        },
      },
      TextOverview: {
        x: 355,
        y: 490,
        text: {
          text: films[0].overview,
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
        items: Array.apply(null, { length: films.length }).map((_, i) => ({
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
      icon.src = films[index].poster_path
      icon.h = 250
      icon.w = 150
      icon.alpha = 1
    })
    row.selected['children'][0].alpha = 0.3
    this.tag('TextTitle').text.text = films[row.selectedIndex].title
    this.tag('TextOverview').text.text = films[row.selectedIndex].overview
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

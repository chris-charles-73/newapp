import { Lightning, Utils } from '@lightningjs/sdk'
import { Row, Icon, Button } from '@lightningjs/ui-components'
import { films } from '../static/films.json'

export default class App extends Lightning.Component {
  static _template() {
    return {
      Background: {
        w: 1920,
        h: 980,
        src: Utils.asset('images/background.png'),
      },
      BackgroundImage: {
        w: 1920,
        h: 980,
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
        x: 0,
        y: 490,
        w: 1920,
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
        x: 960 - 90,
        y: 200,
        h: 225,
        itemSpacing: 30,
        scrollIndex: 0,
        items: Array.apply(null, { length: films.length }).map((_, i) => ({
          type: Button,
          w: 150,
          h: 225,
          icon: {
            type: Icon,
            src: '',
            size: 225,
            color: 0xffffffff,
            spacing: 0,
          },
        })),
      },
    }
  }

  renderLatestUpdate() {
    const row = this.tag('RowOfFilmImages')
    const selectedIndex = row.selectedIndex
    this.resetFilmIconOpacities(row)
    this.setRowsXPosition(row, selectedIndex)
    this.updateTexts(selectedIndex)
  }

  updateTexts(selectedIndex) {
    const selectedFilm = films[selectedIndex]
    this.tag('TextTitle').text.text = selectedFilm.title
    this.tag('TextOverview').text.text = selectedFilm.overview
  }

  resetFilmIconOpacities(row) {
    row.items.forEach(item => (item.children[0].alpha = 0.4))
    row.selected['children'][0].alpha = 1
  }

  setRowsXPosition(row, selectedIndex) {
    const filmWidth = 180
    const halfOfFilmsLength = films.length / 2
    const filmsToOffset = halfOfFilmsLength - selectedIndex
    let xOfCentreFilm = 960 - 90
    let offsetAmount = 0
    if (filmsToOffset < 0) {
      offsetAmount = filmWidth * filmsToOffset * -1
    }
    row.x = xOfCentreFilm - offsetAmount
  }

  setUpFilmIconProperties() {
    const row = this.tag('RowOfFilmImages')
    row.items.forEach((item, index) => {
      const icon = item.children[0]
      icon.src = films[index].poster_path
      icon.h = 225
      icon.w = 150
    })
  }

  _getFocused() {
    this.renderLatestUpdate()
    return this.tag('RowOfFilmImages')
  }

  _init() {
    this.tag('RowOfFilmImages').selectedIndex = films.length / 2
    this.setUpFilmIconProperties()
    this.renderLatestUpdate()
  }
}

import { Lightning, Utils } from '@lightningjs/sdk'
import { Row, Icon, Button } from '@lightningjs/ui-components'
import { fallbackCachedFilms } from '../static/fallbackCachedFilms.json'

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
          text: '',
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
          text: '',
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
        items: Array.apply(null, { length: 20 }).map((_, i) => ({
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

  renderLatestUpdate = () => {
    const row = this.tag('RowOfFilmImages')
    const selectedIndex = row.selectedIndex
    this.resetFilmIconOpacities()
    this.setRowsXPosition(row, selectedIndex)
    this.updateTexts(selectedIndex)
  }

  updateTexts = (selectedIndex) => {
    const selectedFilm = this.films[selectedIndex]
    this.tag('TextTitle').text.text = selectedFilm.title
    this.tag('TextOverview').text.text = selectedFilm.overview
  }

  resetFilmIconOpacities = () => {
    const row = this.tag('RowOfFilmImages')
    row.items.forEach(item => (item.children[0].alpha = 0.4))
    row.selected['children'][0].alpha = 1
  }

  setRowsXPosition = (row, selectedIndex) => {
    const filmWidth = 180
    const halfOfFilmsLength = this.films.length / 2
    const filmsToOffset = halfOfFilmsLength - selectedIndex
    let xOfCentreFilm = 960 - 90
    let offsetAmount = 0
    if (filmsToOffset < 0) {
      offsetAmount = filmWidth * filmsToOffset * -1
    }
    row.x = xOfCentreFilm - offsetAmount
  }

  films = []

  setUpFilmIconProperties = () => {
    console.log('ok')
    const row = this.tag('RowOfFilmImages')
    row.items.forEach((item, index) => {
      const icon = item.children[0]
      icon.src = 'https://www.themoviedb.org/t/p/w220_and_h330_face/' + this.films[index].poster_path
      icon.h = 225
      icon.w = 150
    })
  }

  getFilmsFromAPI = (callback) => {
    fetch('https://api.themoviedb.org/3/discover/movie?api_key=5d32c1fee47f71010ced6f1e582cc0c3')
      .then(response => response.json())
      .then(data => callback(data))
      .catch((error) => {
        console.log('error whilst requesting films from API' + error)
        this.films = fallbackCachedFilms
      })
  }

  _getFocused = () => {
    if (this.films.length > 0) {
      this.renderLatestUpdate()
    }
    return this.tag('RowOfFilmImages')
  }

  _init = () => {
    this.getFilmsFromAPI((data) => {
      this.films = data.results
      this.tag('RowOfFilmImages').selectedIndex = this.films.length / 2
      this.setUpFilmIconProperties()
      this.resetFilmIconOpacities()
      this.renderLatestUpdate()
      this._getFocused()
    })
  }
}

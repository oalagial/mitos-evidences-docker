import modalReducer, {
  closeCharacterModal,
  openCharacterModal,
} from '../modal/modalSlice'

import { disneyCharacters } from '../../_tests_/utils/mockData'

const characterToShow = {
  _id: disneyCharacters.data[1]._id,
  name: disneyCharacters.data[1].name,
  imageUrl: disneyCharacters.data[1].imageUrl,
  tvShows: disneyCharacters.data[1].tvShows,
  videoGames: disneyCharacters.data[1].videoGames,
}

describe('modal reducer', () => {
  const initialState = {
    isCharacterModalOpen: false,
    shownCharacter: null,
  }

  it('should handle closeCharacterModal', () => {
    const actual = modalReducer(initialState, closeCharacterModal())
    expect(actual.isCharacterModalOpen).toEqual(false)
    expect(actual.shownCharacter).toEqual(null)
  })

  it('should handle openCharacterModal', () => {
    const actual = modalReducer(
      initialState,
      openCharacterModal({
        id: characterToShow._id,
        name: characterToShow.name,
        imageUrl: characterToShow.imageUrl,
        tvShows: characterToShow.tvShows,
        videoGames: characterToShow.videoGames,
      })
    )
    expect(actual.isCharacterModalOpen).toEqual(true)
    expect(actual.shownCharacter).toEqual({
      id: characterToShow._id,
      name: characterToShow.name,
      imageUrl: characterToShow.imageUrl,
      tvShows: characterToShow.tvShows,
      videoGames: characterToShow.videoGames,
    })
  })
})

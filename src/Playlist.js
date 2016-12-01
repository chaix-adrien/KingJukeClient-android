import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

import CurrentSong from './CurrentSong'
import PlaylistSong from './PlaylistSong'

const colors = require('../colors.json')

export default class Playlist extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.songRow = []
  }

  render() {
    let {playlist, currentSong, onPressCurrentSong, adminMode, serverURL, reload, tags} = this.props
    if (!currentSong)
      currentSong = {title: null}
    return (
      <View style={{flex: 1}}>
        <CurrentSong
        serverURL={serverURL}
        adminMode={adminMode}
        currentSong={currentSong}
        reload={reload}
        onPress={onPressCurrentSong}/>
        <ScrollView style={{flex: 1}}>
        {playlist.length ?
          playlist.map((song, id) =>
            <PlaylistSong
            key={id}
            id={id}
            song={song}
            serverURL={serverURL}
            adminMode={adminMode}
            reload={reload}
            />
          )
          : <Text style={styles.noSongText}>{currentSong.title ? "No song incoming, add yours !" : ""}</Text>
        }
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  noSongText: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: 'center',
    textAlignVertical: "center"
  },
  songContainer: {
    flex: 1,
    flexDirection: "row",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  songText: {
    flex: 1,
    color: colors.main,
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 10,
    textAlignVertical: "center",
  },
  songScore: {
    height: 30,
    width: 40,
    padding: 5,
    color: colors.main,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: 'center',
    margin: 2,
    textAlignVertical: "center",
    borderRadius: 5,
    borderWidth: 2,
  },
  tag: {
    fontWeight: 'bold',
    margin: 2,
    padding: 2,
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 2
  },
})

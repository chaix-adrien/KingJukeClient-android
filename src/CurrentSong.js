import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {IconButton} from './Button'

const endpoints = require('../endpoint.json')
const colors = require('../colors.json')

export default class CurrentSong extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  pauseCurrentSong = () => {
    console.log("pause")
  }

  nextSong = () => {
    console.log("next")
  }

  render() {
    let {currentSong, adminMode, onPress} = this.props
    if (currentSong === null)
      currentSong = {title: null}
    return (
      <TouchableOpacity
      style={[styles.currentSongContainer, {backgroundColor: currentSong.title ? colors.main : "grey"}]}
      onPress={onPress}
      >
        <Text style={styles.currentSongText}>{currentSong.title ? currentSong.title : "NO CURRENT SONG"}</Text>
        {adminMode && currentSong.title ?
          <View style={{alignItems: "center", margin: 5, justifyContent: "space-around"}}>
            <IconButton
            style={styles.adminNavButtons}
            name="play" color={colors.background}
            size={30}
            onPress={this.pauseCurrentSong}
            />
            <IconButton
            style={styles.adminNavButtons}
            name="forward"
            color={colors.background}
            size={30}
            onPress={this.nextSong}
            />
          </View>
          :null
        }
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  currentSongContainer: {
    height: 100,
    margin: 5,
    elevation: 10,
    borderWidth: 1,
    flexDirection: "row",
    borderColor: colors.background
  },
  currentSongText: {
    flex: 1,
    fontSize: 20,
    color: colors.background,
    fontWeight: "bold",
    textAlign: 'center',
    textAlignVertical: "center"
  },
})

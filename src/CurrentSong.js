import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {IconButton} from './Button'
import Keychain from 'react-native-keychain'
import base64 from 'base-64'

const endpoints = require('../endpoint.json')
const colors = require('../colors.json')
const AV_BAR_H = 5

export default class CurrentSong extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  pauseCurrentSong = () => {
    Keychain.getGenericPassword().then(credentials => {
      const {username, password} = credentials
      const {currentSong} = this.props
      const tmpCredentials = base64.encode(`${username}:${password}`)
      const header = new Headers()
      header.append("Authorization", "Basic " + tmpCredentials)
      fetch(this.props.serverURL + endpoints.admin + (currentSong.playing ? "pause" : "play"), {method: 'POST', headers : header})
      .then(e => this.props.reload())
    })
  }

  nextSong = () => {
    Keychain.getGenericPassword().then(credentials => {
      const {username, password} = credentials
      const tmpCredentials = base64.encode(`${username}:${password}`)
      const header = new Headers()
      header.append("Authorization", "Basic " + tmpCredentials)
      fetch(this.props.serverURL + endpoints.admin + "next", {method: 'POST', headers : header}).then(e => this.props.reload())
    })
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
        <View style={{height: AV_BAR_H, flexDirection: "row", backgroundColor: "grey"}}>
          <View style={{flex: currentSong.current_time / currentSong.length, backgroundColor: "red"}}/>
          <View style={{flex: 1 - (currentSong.current_time / currentSong.length)}}/>
        </View>
        <View style={{flex: 1, flexDirection: "row"}}>
          <Text style={styles.currentSongText}>{currentSong.title ? currentSong.title : "NO CURRENT SONG"}</Text>
          {adminMode && currentSong.title ?
            <View style={{flex: 0.2, alignItems: "center", margin: 5, justifyContent: "space-around"}}>
              <IconButton
              style={styles.adminNavButtons}
              name={currentSong.playing ? "pause" : "play"} color={colors.background}
              size={30}
              onPress={this.pauseCurrentSong}
              />
              <IconButton
              style={[styles.adminNavButtons, {left: 2}]}
              name="forward"
              color={colors.background}
              size={30}
              onPress={this.nextSong}
              />
            </View>
            : null
          }
        </View>
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

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  AsyncStorage,
  WebView,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Button from './Button'
import * as Animatable from 'react-native-animatable';

const {width, height} = Dimensions.get("window")
const colors = require('../colors.json')
const AUTOREFRESH_INTERVAL_SEC = 10
const PC_URL_ROOT = "https://www.youtube.com/watch?v="
const MOBILE_URL_ROOT = "https://m.youtube.com/watch?v="
const GOTOWEB_H = 54

export default class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentURL: "",
      playlist: [],
      currentSong: null,
      mode: "top",
    }
  }

  componentWillMount() {
    this.getPlaylist()
    this.getCurrentSong()
    this.autorefresh = setInterval(() => {
      this.getCurrentSong()
      this.getPlaylist()
    }, 1000 * AUTOREFRESH_INTERVAL_SEC)
  }

  componentWillUnmount() {
    clearInterval(this.autorefresh)
  }

  getCurrentSong = () => {
    const {serverURL} = this.props
    fetch(serverURL).then(r => r.json())
    .then(playlist => this.setState({currentSong: (playlist.length) ? playlist[0] : null}))
  }

  getPlaylist = () => {
    const {serverURL} = this.props
    fetch(serverURL).then(r => r.json())
    .then(playlist => this.setState({playlist: playlist.slice(1)}))
  }

  addThisSong = (url) => {
    if (url.split("https://m.youtube.com/watch?")[1])
      {
        const header = {
         method: "POST",
         body: PC_URL_ROOT + url.split(MOBILE_URL_ROOT)[1]
        }
        const {serverURL} = this.props
        fetch(serverURL, header)
        this.getPlaylist()
        this.getCurrentSong()
      }
  }

  swapToWebView = () => {
    if (this.webView)
      this.webView.transitionTo({flex: 5, height: null})
    if (this.playlistView)
      this.playlistView.transitionTo({flex: null, height: 110})
    if (this.goToWebButton)
      this.goToWebButton.transitionTo({top: height})
    this.setState({mode: "top"})
  }

  swapToPlaylist = () => {
    if (this.webView)
      this.webView.transitionTo({flex: null, height: 100})
    if (this.playlistView)
      this.playlistView.transitionTo({flex: 5})
    if (this.goToWebButton)
      this.goToWebButton.transitionTo({top: 100 - GOTOWEB_H})
    this.setState({mode: "bottom"})
  }

  displayCurrentSong = () => {
    const {currentSong} = this.state
    return (
      <TouchableOpacity style={{height: 100, backgroundColor: "#BBBBBB", margin: 5, elevation: 5}} onPress={() => this.swapToPlaylist()} >
        <Text style={{flex: 1, fontSize: 20, fontWeight: "bold", textAlign: 'center', textAlignVertical: "center"}}>{currentSong ? currentSong.name : "NO CURRENT SONG"}</Text>
      </TouchableOpacity>
    )
  }

  displaySong = (song, id) => {
    return (
      <View key={id} style={{margin: 5, borderWidth: 1, borderColor: colors.border, flex: 1, padding: 10}}>
        <Text style={{flex: 1, fontSize: 20, fontWeight: "bold", textAlignVertical: "center"}}>{song.name}</Text>
      </View>
    )
  }

  displayPlaylist = () => {
    return (
      <View style={{flex: 1}}>
        {this.displayCurrentSong()}
        <ScrollView style={{flex: 1}}>
          {this.state.playlist.length ?
            this.state.playlist.map((song, id) => this.displaySong(song, id))
            : <Text style={{flex: 1, fontSize: 20, fontWeight: "bold", textAlign: 'center', textAlignVertical: "center"}}>No song incoming, add yours !</Text>
          }
        </ScrollView>
        <Button text="Close this JukeBox" onPress={this.props.quitServer} />
      </View>
    )
  }

  displayGoToWebButton = () => {
    return (
      <Animatable.View ref={e => (this.goToWebButton = e)} style={styles.goToWebButton}>
        <TouchableOpacity style={styles.goToWebButtonToucheable}
        onPress={this.swapToWebView}
        >
          <Text style={{fontSize: 20}}>▼</Text>
        </TouchableOpacity>
      </Animatable.View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Animatable.View  ref={e => (this.webView = e)} style={{flex: 5}}>
          <WebView
          ref={e => (this.web = e)}
          source={{uri: 'https://youtube.com'}}
          style={{flex: 1, width: width, padding: 10, elevation: 10}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onNavigationStateChange={state => {
            if (this.state.mode === "bottom") {
              this.swapToWebView()
            }
            this.setState({currentURL: state.url})
          }}
          startInLoadingState={true}
          automaticallyAdjustContentInsets={false}
          />
          {this.state.currentURL.split("https://m.youtube.com/watch?")[1] && this.state.mode === "top" ?
            <Button style={{margin: 10}} text="Add this song" onPress={() => this.addThisSong(this.state.currentURL)} />
            : null
          }
        </Animatable.View>
        <Animatable.View  ref={e => (this.playlistView = e)} style={{flex: 1, width: width}}>
          {this.displayPlaylist()}
        </Animatable.View>
        {this.displayGoToWebButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  goToWebButton: {
    justifyContent: "center",
    alignItems: "center",
    position:'absolute',
    width: width,
    height: GOTOWEB_H,
    top: height,
    opacity: 0.8,
    backgroundColor:  colors.background,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50
  },
  goToWebButtonToucheable: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center"
  }
});

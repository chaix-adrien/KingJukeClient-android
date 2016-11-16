import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  WebView,
} from 'react-native';
import Button, {IconButton} from './Button'
import * as Animatable from 'react-native-animatable';
import Popover from 'react-native-popover';
import PubSub from 'pubsub-js'
import Keychain from 'react-native-keychain'

import Playlist from './Playlist'
import SubmitPopup from './SubmitPopup'
import AdminPopup from './AdminPopup'

const {width, height} = Dimensions.get("window")
const endpoints = require('../endpoint.json')
const colors = require('../colors.json')
const AUTOREFRESH_INTERVAL_SEC = 10
const PC_URL_ROOT = "https://www.youtube.com/watch?v="
const MOBILE_URL_ROOT = "https://m.youtube.com/watch?v="
const GOTOWEB_H = 54


const TMPtag = [
  {
    name: "electro",
    color: "#304FFE",
    textColor: "white",
  },
  {
    name: "raggae",
    color: "#C6FF00",
    textColor: "black",
  },
  {
    name: "rap",
    color: "#DD2C00",
    textColor: "white",
  },
  {
    name: "hip-hop",
    color: "#C51162",
    textColor: "white",
  },
  {
    name: "classique",
    color: "#BDBDBD",
    textColor: "black",
  },
  {
    name: "dub",
    color: "#CF1162",
    textColor: "white",
  },
  {
    name: "rock",
    color: "#00FD0D",
    textColor: "black",
  },
]


export default class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentURL: 'https://m.youtube.com/?',
      playlist: [],
      currentSong: null,
      mode: "top",
      showSubmitPopup: false,
      popupRectSubmit: null,
      showAdminPopup: false,
      popupRectAdmin: null,
      adminMode: false,
      isToolBarOpen: false,
    }
    this.popupRectAdmin = {x: 0, y: height / 1.5, width: width, height: 0}
  }

  componentWillMount() {
    this.reloadPlaylist()
    this.autorefresh = setInterval(() => {
      this.reloadPlaylist()
    }, 1000 * AUTOREFRESH_INTERVAL_SEC)
  }

  componentWillUnmount() {
    clearInterval(this.autorefresh)
  }


  reloadPlaylist = () => {
    const {serverURL} = this.props
    fetch(serverURL + endpoints.playlist).then(r => r.json())
    .then(playlist => {
      playlist.playlist.forEach(s => (s.tags = [])) // waiting for integration
      this.setState({playlist: playlist.playlist, currentSong: playlist.first_song})
    })
    .catch(e => console.log(e))
  }

  addTagToSubmit = (tags, url) => this.submitThisSong(url ? url : this.state.currentURL, tags)
  submitThisSong = (url, tags) => {
    if (url.split(MOBILE_URL_ROOT)[1] || url.split(PC_URL_ROOT)[1]) {
      this.setState({showSubmitPopup: false})
      if (url.split(MOBILE_URL_ROOT)[1]) {
        url = PC_URL_ROOT + url.split(MOBILE_URL_ROOT)[1]
      }
      const header = {
       method: "POST",
       body: url
      }
      const {serverURL} = this.props
      fetch(serverURL + endpoints.playlist, header)
      .then(e => {
        if (e.status === 201)
          this.reloadPlaylist()
        else
          Alert.alert("You can't submit this song:", e._bodyText)
      })
    } else {
      Alert.alert("You can't submit this song:", "Invalid URL.")
    }
  }

  OpenPopupAddSong = (link) => {
    this.addSongButton.measure((ox, oy, width, height, px, py) => {
      this.setState({showSubmitPopup: link, popupRectSubmit: {x: px, y: py, width: width, height: height}})
    })
  }

  swapToWebView = () => {
    if (this.webView)
      this.webView.transitionTo({flex: 5, height: null})
    if (this.playlistView)
      this.playlistView.transitionTo({flex: null, height: 110})
    if (this.goToWebButton)
      this.goToWebButton.transitionTo({top: height})
    if (this.state.isToolBarOpen)
      this.toggleToolBar()
    PubSub.publish('closePlaylistSongs', "-1")
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
 
  toggleToolBar = () => {
    if (!this.state.isToolBarOpen) {
        this.toolBar.transitionTo({top: height - 100 - 45 - 40})
    } else {
        this.toolBar.transitionTo({top: height - 100 - 45})
    }
    this.setState({isToolBarOpen: !this.state.isToolBarOpen})
  }

  switchAdminMode = (goTo) => {
    PubSub.publish('closePlaylistSongs', "-1")
    if (goTo === false) {
      Keychain.resetGenericPassword()
    }
    this.setState({showAdminPopup: false, adminMode: goTo})
  }

  goToThisSong = (url) => {
    if (url)
      this.setState({currentURL: url})
    this.swapToWebView()
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

  getWebView = () =>
  <WebView
  ref={e => (this.web = e)}
  source={{uri: this.state.currentURL}}
  style={{flex: 1, width: width, padding: 10, elevation: 10}}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  onNavigationStateChange={state => {
    if (this.state.mode === "bottom") {
      this.swapToWebView()
    }
    if (this.state.currentURL !== state.url)
      this.setState({currentURL: state.url})
  }}
  startInLoadingState={true}
  automaticallyAdjustContentInsets={false}
  />

  getPlaylist = () =>
  <Playlist
  serverURL={this.props.serverURL}
  currentSong={this.state.currentSong}
  playlist={this.state.playlist}
  adminMode={this.state.adminMode}
  goToThisSong={this.goToThisSong}
  reload={this.reloadPlaylist}
  onPressCurrentSong={() => {
    if (this.state.mode === "bottom")
      this.goToThisSong(this.state.currentSong.url)
    else this.swapToPlaylist()
  }}
  />

  getAddSongButton = () => {
    if (this.state.currentURL.split("https://m.youtube.com/watch?")[1] && this.state.mode === "top")
      return (
        <View ref={e => (this.addSongButton = e)} collapsable={false}>
          <Button style={{margin: 10}} text="Add this song" onPress={() => this.OpenPopupAddSong(this.state.currentURL)} />
        </View>
      )
    else
      return (
        <View ref={e => (this.addSongButton = e)} collapsable={false}>
          <Button style={{margin: 10}} text="Add song" onPress={() => this.OpenPopupAddSong("byLink")} />
        </View>
      )
  }

  getToolBar = () => {
   if (this.state.mode === "bottom") {
    return (
      <Animatable.View style={styles.toolBarContainer} ref={e => (this.toolBar = e)}>
        <TouchableOpacity style={styles.openToolBarButton} onPress={this.toggleToolBar}>
          <Text style={{textAlign: "center"}}>{this.state.isToolBarOpen ? "▼" : "▲"}</Text>
        </TouchableOpacity>
        <View style={styles.toolBarContainerIcons}>
          <IconButton name={this.state.adminMode ? "lock" : "key"} size={30} style={{margin: 5}} color={"grey"}
          onPress={() => {
            if (this.state.adminMode)
              this.setState({adminMode: false})
            else
              this.setState({showAdminPopup: true})
          }} />
          <IconButton name="power-off" size={30} style={{margin: 5}} color={"grey"} onPress={this.props.quitServer} />
        </View>
      </Animatable.View>
    )
   } 
  }

  getSubmitPopup = () =>
  <Popover
  isVisible={this.state.showSubmitPopup !== false}
  fromRect={this.state.popupRectSubmit}
  placement="top"
  onClose={() => this.setState({showSubmitPopup: false})}>
    <SubmitPopup tags={TMPtag} urlField={this.state.showSubmitPopup === "byLink"} submitSong={this.addTagToSubmit}/>
  </Popover>

  getAdminPopup = () => 
  <Popover
  isVisible={this.state.showAdminPopup}
  fromRect={this.popupRectAdmin}
  placement="top"
  onClose={() => this.setState({showAdminPopup: false})}>
    <AdminPopup apiURL={this.props.serverURL} goToAdminMode={this.switchAdminMode} toggleToolBar={this.toggleToolBar}/>
  </Popover>




  render() {
    return (
      <View style={styles.container}>
        <Animatable.View  ref={e => (this.webView = e)} style={{flex: 5}}>
          {this.getWebView()}
          {this.getAddSongButton()}
        </Animatable.View>
        <Animatable.View  ref={e => (this.playlistView = e)} style={{height: 110, width: width}}>
          {this.getPlaylist()}
          {this.getToolBar()}
        </Animatable.View>
        {this.getSubmitPopup()}
        {this.getAdminPopup()}
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
    opacity: 0.9,
    backgroundColor:  colors.background,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50
  },
  goToWebButtonToucheable: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center"
  },
  toolBarContainerIcons: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    flexDirection: "row",
    borderWidth: 1,
    justifyContent: "space-around",
    height: 40,
    width: width,
  },
  openToolBarButton: {
    height: 20,
    backgroundColor: colors.background,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    width: 50,
    top: 1,
  },
  toolBarContainer: {
    position: 'absolute',
    alignItems: "center",
    width: width,
    top: height - 100 - 45,
  }
});

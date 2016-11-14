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
import Button, {IconButton} from './Button'
import * as Animatable from 'react-native-animatable';
import Swipeout from 'react-native-swipeout'
import Icon from 'react-native-vector-icons/FontAwesome';
import ModalDropdown from 'react-native-modal-dropdown';
import Popover from 'react-native-popover';

import SubmitPopup from './SubmitPopup'
import AdminPopup from './AdminPopup'

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

const {width, height} = Dimensions.get("window")
const endpoints = require('../endpoint.json')
const colors = require('../colors.json')
const AUTOREFRESH_INTERVAL_SEC = 10
const PC_URL_ROOT = "https://www.youtube.com/watch?v="
const MOBILE_URL_ROOT = "https://m.youtube.com/watch?v="
const GOTOWEB_H = 54

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
    }
    this.popupRectAdmin = {x: 0, y: height / 1.5, width: width, height: 0}
    this.songRow = []
  }

  componentWillMount() {
    this.getPlaylist()
    this.autorefresh = setInterval(() => {
      this.getPlaylist()
    }, 1000 * AUTOREFRESH_INTERVAL_SEC)
  }

  componentWillUnmount() {
    clearInterval(this.autorefresh)
  }

  getPlaylist = () => {
    const {serverURL} = this.props
    fetch(serverURL + endpoints.playlist).then(r => r.json())
    .then(playlist => {
      playlist.playlist.forEach(s => {
          s.tags = [0, 1].map(e => Math.floor(Math.random() * (TMPtag.length - 1))).filter(e => Math.random() < 0.6)
      })
      this.setState({playlist: playlist.playlist, currentSong: playlist.first_song})
    })
    .catch(e => console.log(e))
  }

  OpenPopupAddSong = () => {
    this.addSongButton.measure((ox, oy, width, height, px, py) => {
      this.setState({showSubmitPopup: true, popupRectSubmit: {x: px, y: py, width: width, height: height}})
    })

  }

  addTagToSubmit = (tags) => this.submitThisSong(this.state.currentURL, tags)

  submitThisSong = (url, tags) => {
    this.setState({showSubmitPopup: false})
    if (url.split(MOBILE_URL_ROOT)[1]) {
      const header = {
       method: "POST",
       body: PC_URL_ROOT + url.split(MOBILE_URL_ROOT)[1]
      }
      const {serverURL} = this.props
      fetch(serverURL + endpoints.playlist, header)
      .then(e => {
        if (e.status === 201)
          this.getPlaylist()
        else
          Alert.alert("You can't submit this song:", e._bodyText)
      })
    }
  }

  swapToWebView = () => {
    if (this.webView)
      this.webView.transitionTo({flex: 5, height: null})
    if (this.playlistView)
      this.playlistView.transitionTo({flex: null, height: 110})
    if (this.goToWebButton)
      this.goToWebButton.transitionTo({top: height})
    if(this.songRow.length)
      this.songRow.forEach(row => row ? row._close() : null)
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

  goToThisSong = (url) => {
    if (url)
      this.setState({currentURL: url})
    this.swapToWebView()
  }

  switchAdminMode = (goTo) => {
    this.setState({showAdminPopup: false, adminMode: goTo})
  }

  pauseCurrentSong = () => {
    console.log("pause")
  }

  nextSong = () => {
    console.log("next")
  }

  removeThisSong = (song) => {
    console.log("remove the song " + song.title)
  }

  displayCurrentSong = () => {
    let {currentSong} = this.state
    if (!currentSong)
      currentSong = {title: null}
    return (
      <TouchableOpacity
      style={[styles.currentSongContainer, {backgroundColor: currentSong.title ? colors.main : "grey"}]}
      onPress={() => {
        if (this.state.mode === "bottom")
          this.goToThisSong(currentSong.url)
        else this.swapToPlaylist()
      }}
      >
        <Text style={styles.currentSongText}>{currentSong.title ? currentSong.title : "NO CURRENT SONG"}</Text>
        {this.state.adminMode && currentSong.title ?
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

  getScoreColor = (score) => {
    if (score > 0) return "#21BA45"
    else if (score < 0) return "#DB2828"
    return "#767676"
  }

  voteThisSong = (title, score) => {
    const header = {
     method: "POST",
   }
   const {serverURL} = this.props
   fetch(serverURL + endpoints.vote + (score > 0 ? "up/" : "down/") + title, header).then(e => this.getPlaylist())
  }

  displaySong = (song, id) => {
    const getComponent = (name, bgcolor) => {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bgcolor}}>
          <Icon name={name} color={colors.background} size={30} />
        </View>
      )
    }
    var swipeoutBtns = [
      {
        component: getComponent('link', "grey"),
        onPress: () => this.goToThisSong(song.url),
        backgroundColor: "grey",
      },
      {
        component: getComponent(song.has_voted !== -1 ? 'minus' : 'check', "#DB2828"),
        onPress: () => this.voteThisSong(song.title, -1),
        backgroundColor: "#DB2828",
      },
      {
        component: getComponent(song.has_voted !== 1 ? 'plus' : 'check', "#21BA45"),
        onPress: () => this.voteThisSong(song.title, 1),
        backgroundColor: "#21BA45",
      },
    ]
    if (this.state.adminMode)
      swipeoutBtns.push({
        component: getComponent('trash', "black"),
        onPress: () => this.removeThisSong(song),
        backgroundColor: "#21BA45",
      })
    return(
      <View
      style={{borderBottomWidth: 1, borderColor: "grey"}}
      key={id}
      >
        <Swipeout
        right={swipeoutBtns}
        autoClose={true}
        close={false}
        ref={e => this.songRow[id] = e}
        backgroundColor={colors.background}
        >
          <TouchableOpacity style={styles.songContainer} onPress={() => {
            this.songRow.forEach((row, i) => {
              if (id !== i) {
                row._close()
              }
            })
            this.songRow[id]._openRight()
          }}>
            <Text style={[styles.songScore, {borderColor: this.getScoreColor(song.score)}]}>{song.score}</Text>
              <Text style={styles.songText}>{song.title}</Text>
            <View>
              {song.tags.map((tag, id) =>
                <Text key={id}
                style={[styles.tag, {backgroundColor:TMPtag[tag].color, color: TMPtag[tag].textColor}]}
                >
                  {TMPtag[tag].name}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Swipeout>
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
            : <Text style={styles.noSongText}>No song incoming, add yours !</Text>
          }
        </ScrollView>
        <View style={{flexDirection: "row", justifyContent: "flex-end"}}>
          <IconButton name={this.state.adminMode ? "lock" : "key"} size={30} style={{margin: 10}} color={"grey"}
          onPress={() => {
            if (this.state.adminMode)
              this.setState({adminMode: false})
            else
              this.setState({showAdminPopup: true})
          }} />
          <IconButton name="power-off" size={30} style={{margin: 10}} color={"grey"} onPress={this.props.quitServer} />
        </View>
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
          {this.state.currentURL.split("https://m.youtube.com/watch?")[1] && this.state.mode === "top" ?
            <View ref={e => (this.addSongButton = e)} collapsable={false}>
              <Button style={{margin: 10}} text="Add this song" onPress={() => this.OpenPopupAddSong()} />
            </View>
            : null
          }
        </Animatable.View>
        <Animatable.View  ref={e => (this.playlistView = e)} style={{height: 110, width: width}}>
          {this.displayPlaylist()}
        </Animatable.View>
        <Popover
        isVisible={this.state.showSubmitPopup}
        fromRect={this.state.popupRectSubmit}
        placement="top"
        onClose={() => this.setState({showSubmitPopup: false})}>
          <SubmitPopup tags={TMPtag} submitSong={this.addTagToSubmit}/>
        </Popover>
        <Popover
        isVisible={this.state.showAdminPopup}
        fromRect={this.popupRectAdmin}
        placement="top"
        onClose={() => this.setState({showAdminPopup: false})}>
          <AdminPopup apiURL={this.props.serverURL} goToAdminMode={this.switchAdminMode}/>
        </Popover>
        {this.displayGoToWebButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tag: {
    fontWeight: 'bold',
    margin: 2,
    padding: 2,
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 2
  },
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
  noSongText: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: 'center',
    textAlignVertical: "center"
  },
  adminNavButtons: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height : 40,
    borderRadius: 2,
    borderColor: colors.background,
    borderWidth: 2,
    padding: 4
  },
});

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Swipeout from 'react-native-swipeout'
import Icon from 'react-native-vector-icons/Foundation';
import PubSub from 'pubsub-js'
import Keychain from 'react-native-keychain'
import base64 from 'base-64'

const endpoints = require('../endpoint.json')
const colors = require('../colors.json')

export default class PlaylistSong extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentWillMount() {
    PubSub.subscribe("closePlaylistSongs", (chan, songEmmiter) => {
      const {id} = this.props
      const emmiterID = parseInt(songEmmiter)
      if (emmiterID !== id)
        if (this.swipeout) {
          this.swipeout._close()
        }
    })
  }

  componentWillUnmount() {
    PubSub.unsubscribe("closePlaylistSongs")
  }

  voteThisSong = (title, score) => {
    const header = {
     method: "POST",
   }
   const {serverURL} = this.props
   fetch(serverURL + endpoints.vote + (score > 0 ? "up/" : "down/") + title, header).then(e => this.props.reload())
  }

  removeThisSong = (song) => {
    Keychain.getGenericPassword().then(credentials => {
      const {username, password} = credentials
      const tmpCredentials = base64.encode(`${username}:${password}`)
      const header = new Headers()
      header.append("Authorization", "Basic " + tmpCredentials)
      fetch(this.props.serverURL + endpoints.admin + "delete", {method: 'DELETE', body: song.title, headers : header})
      .then(e => this.props.reload())
    })
  }


  getScoreColor = (score) => {
    if (score > 0) return "#21BA45"
    else if (score < 0) return "#DB2828"
    return "#767676"
  }

  getSwipeOutComponents = (song) => {
    const getComponent = (name, bgcolor, id) => {
      return (
        <View style={[styles.buttonContainer, {backgroundColor: bgcolor}]}>
          <Icon style={styles.buttonIcon} name={name} color={colors.background} size={30} />
        </View>
        )
    }
    const swipeoutBtns = [
    {
      component: getComponent('link', "grey", 12),
      onPress: () => this.props.goToThisSong(song.url),
      backgroundColor: "grey",
    },
    {
      component: getComponent(song.has_voted !== -1 ? 'skull' : 'check', "#DB2828"),
      onPress: () => this.voteThisSong(song.title, -1),
      backgroundColor: "#DB2828",
    },
    {
      component: getComponent(song.has_voted !== 1 ? 'heart' : 'check', "#21BA45"),
      onPress: () => this.voteThisSong(song.title, 1),
      backgroundColor: "#21BA45",
    }]
    if (this.props.adminMode)
      swipeoutBtns.push({
        component: getComponent('trash', "black"),
        onPress: () => this.removeThisSong(song),
        backgroundColor: "#21BA45",
      })
    return swipeoutBtns
  }

  onPress = () => {
    const {id} = this.props
    PubSub.publish('closePlaylistSongs', id.toString())
    if (this.swipeout.state.openedRight)
      this.swipeout._close()
    else
      this.swipeout._openRight()
  }

  render() {
    const {adminMode, serverURL, song, id, tags} = this.props
    return(
      <View
      style={{borderBottomWidth: 1, borderColor: "black"}}
      >
        <Swipeout
        right={this.getSwipeOutComponents(song)}
        autoClose={true}
        close={false}
        ref={e => (this.swipeout = e)}
        backgroundColor={colors.background}
        >
          <TouchableOpacity style={styles.songContainer} onPress={this.onPress}>
          <Text style={[styles.songScore, {borderColor: this.getScoreColor(song.score)}]}>{song.score}</Text>
          <Text style={styles.songText}>{song.title}</Text>
          <View>
            {song.tags.map((tag, id) =>
              <Text key={id}
              style={[styles.tag, {backgroundColor:tag.color, color: "white"}]}
              >
                {tag.name}
              </Text>
            )}
          </View>
          </TouchableOpacity>
        </Swipeout>
      </View>
      )
  }
}

const styles = StyleSheet.create({
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
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: colors.border
  },
  buttonIcon: {
    textShadowColor: "black",
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 10
  },
})

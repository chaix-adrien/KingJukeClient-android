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
} from 'react-native';
import Button from './Button'
import * as Animatable from 'react-native-animatable';

const {width, height} = Dimensions.get("window")
const colors = require('../colors.json')

export default class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentURL: "",
    }
  }

  addThisSong = (url) => {
    if (url.split("https://m.youtube.com/watch?")[1])
      console.log("add", this.currentURL)
  }

  webViewChange = (url) => {
    this.webView.transitionTo({flex: 5, height: null})
    this.playlistView.transitionTo({flex: 1})
    if (url.split("https://m.youtube.com/watch?")[1])
      this.setState({currentURL: url})
  }

  swapToPlaylist = () => {
    this.webView.transitionTo({flex: null, height: 100})
    this.playlistView.transitionTo({flex: 5})
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
          onNavigationStateChange={state => this.webViewChange(state.url)}
          startInLoadingState={true}
          automaticallyAdjustContentInsets={false}
          />
          {this.state.currentURL.split("https://m.youtube.com/watch?")[1] ?
            <Button style={{margin: 10}} text="Add this song" onPress={() => this.addThisSong()} />
            : null
          }
        </Animatable.View>
        <Animatable.View  ref={e => (this.playlistView = e)} style={{flex: 1, width: width}}>
          <TouchableOpacity onPress={() => this.swapToPlaylist()} style={{flex: 1, margin: 5, backgroundColor: colors.backgroundColor, elevation: 5}}>
            <Text style={{flex: 1}}>Ode To the bong Lord</Text>

          </TouchableOpacity>
        </Animatable.View>
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
});

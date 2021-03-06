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
  AsyncStorage,
  Dimensions,
} from 'react-native';
import {Pulse} from 'react-native-loader';
import * as Animatable from 'react-native-animatable';
import Keychain from 'react-native-keychain'

import Button from './src/Button'
import IpSearcher from './src/IpSearcher';
import Dashboard from './src/Dashboard';
const colors = require('./colors.json')
const {width, height} = Dimensions.get("window")


export default class ytJukebox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      serverURL: "",
      loaded: false,
    }
  }

  stopLoading = () => {
    if (this.loader)
      this.loader.transitionTo({opacity: 0}, 500, 500)
    setTimeout(() => this.setState({loaded: true}), 500)
  }

  setServerURL = (url, callback) => {
    console.log("CONNECT TO: ", url)
    if (callback)
      this.setState({serverURL: url}, () => callback())
    else
      this.setState({serverURL: url})
    AsyncStorage.setItem('@ytjukebox:lastServerUrl', url)
    this.stopLoading()
  }

  quitServer = () => {
    Keychain.resetGenericPassword()
    AsyncStorage.removeItem('@ytjukebox:lastServerUrl')
    this.setState({serverURL: "", loaded: true})
  }

  displayLoading = () => {
    if (this.state.loaded) return null
    return (
      <Animatable.View ref={e => (this.loader = e)} style={styles.loadingContainer}>
        <Pulse size={width / 3} color={colors.main} />
        <Text style={styles.loadingText}>OPENING{"\n"}LAST{"\n"}JUKEBOX</Text>
        <Button onPress={() => {
          this.quitServer()
          this.stopLoading()
        }}
        text="Cancel"/>
      </Animatable.View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.serverURL ?
          <Dashboard serverURL={this.state.serverURL} quitServer={this.quitServer}/>
        : <IpSearcher setServerURL={this.setServerURL} stopLoading={this.stopLoading}/>
        }
        {this.displayLoading()}
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
  loadingContainer: {
    position: 'absolute',
    flex: 1,
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    top: -width / 3 - 30,
    left: 0,
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: colors.background,
    textAlign: 'center'}
});

AppRegistry.registerComponent('ytJukebox', () => ytJukebox);

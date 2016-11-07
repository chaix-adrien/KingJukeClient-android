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

  componentWillMount() {
    AsyncStorage.getItem('@ytjukebox:lastServerUrl', (err, rep) => {
      if (rep) {
        this.setState({serverURL: rep})
      }
      this.loader.transitionTo({opacity: 0}, 500, 500)
      setTimeout(() => this.setState({loaded: true}), 500)
    })
  }

  setServerURL = (url, callback) => {
    if (callback)
      this.setState({serverURL: url}, () => callback())
    else
      this.setState({serverURL: url})
    AsyncStorage.setItem('@ytjukebox:lastServerUrl', url)
  }

  displayLoading = () => {
    if (this.state.loaded) return null
    return (
      <Animatable.View ref={e => (this.loader = e)} style={styles.loadingContainer}>
        <Pulse size={width / 3} color={colors.main} />
        <Text style={styles.loadingText}>OPENING{"\n"}YOUR{"\n"}JUKEBOX</Text>
      </Animatable.View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.serverURL ?
          <Dashboard serverURL={this.state.serverURL} />
        : <IpSearcher setServerURL={this.setServerURL}/>
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

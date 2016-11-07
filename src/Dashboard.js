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
} from 'react-native';

const colors = require('../colors.json')

export default class Dashboard extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.props.serverURL}</Text>
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

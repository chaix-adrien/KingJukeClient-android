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
} from 'react-native';
import {Pulse} from 'react-native-loader';
import NetworkInfo from 'react-native-network-info';

import Button from './Button'
const colors = require('../colors.json')
const PORT = 6666

export default class IpSearcher extends Component {
  constructor(props) {
    super(props)
    this.state = {
      serverIP: "",
      scanning: false,
      inputIp: "",
    }
  }

  useThisServer = (url) => {
    this.setState({serverIP: url, scanning: false})
    console.log("GET SERVER AT IP", url)
  }

  checkThisIp = (ip) => {
    if (!ip) ip = 0
    const url = "http://" + ip + ':' + PORT
    return fetch(url).then(r => {
      if (r.status === 200) {
        this.props.setServerURL(url)
        return true
      }
      return false
    })
    .catch(e => null)
  }

  getServerIp = () => {
    this.setState({scanning: true}, () => {
      NetworkInfo.getIPAddress(ip => {
        const domaine = ip.split('.').slice(0, -1).join('.')
        console.log(domaine)
        for (let i = 0; i < 256; i++) {
          const ip = domaine + '.' + i
          this.checkThisIp(ip)
        }
      });
    })
  }

  displayScanNetwork = () => {
    if (this.state.scanning)
      return (
        <View style={styles.container}>
          <Pulse size={100} color={colors.main} />
          <Text style={{top: -110, left: 0, fontStyle: 'italic', color: colors.background}}>SCANNING</Text>
        </View>
      )
    else
      return (
        <View style={styles.container}>
          <Button onPress={() => this.getServerIp()} text="Search a JukeBox!"/>
        </View>
      )
  }

  tryThisIp = (ip) => {
    this.checkThisIp(this.state.inputIp).then(rep => {
      if (!rep) {
        Alert.alert("Sorry!", "the given IP is unreachable.")
      }
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.container, {flexDirection: "row"}]}>
          <TextInput
          value={this.state.inputIp}
          onChangeText={text => this.setState({inputIp: text})}
          placeholder="Enter IP manually"
          style={{width: 200, height: 50, fontSize: 17, textAlign: 'center'}}
          onSubmit={() => this.tryThisIp(this.state.inputIp)}
          />
          <Button style={{marginLeft: 10}} onPress={() => this.tryThisIp(this.state.inputIp)}
          text="Launch!"/>
        </View>
        <Text style={{fontSize: 25, fontStyle: 'italic'}}>- OR -</Text>
        {this.displayScanNetwork()}
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
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 1,
  }
});

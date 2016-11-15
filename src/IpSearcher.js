import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  AsyncStorage,
} from 'react-native';
import {Pulse} from 'react-native-loader';
import NetworkInfo from 'react-native-network-info';

import Button from './Button'
const endpoints = require('../endpoint.json')
const colors = require('../colors.json')

export default class IpSearcher extends Component {
  constructor(props) {
    super(props)
    this.state = {
      serverIP: "",
      scanning: 0,
      inputIp: "",
    }
  }


  componentWillMount() {
    AsyncStorage.getItem('@ytjukebox:lastServerUrl', (err, rep) => {
      if (rep) {
        this.checkThisIp(rep, this.fetch_timeout).then(res => {
          if (!res)
            this.props.stopLoading()
        })
        .catch(e => this.props.stopLoading())
      } else {
        this.props.stopLoading()
      }
    })
  }

  fetch_timeout = (url, header) => {
    const FETCH_TIMEOUT = 5000
    const out = new Promise((resolve, reject) => {
      if (FETCH_TIMEOUT) {
        var timeout = setTimeout(() => {
          reject(new Error('Request timed out'));
        }, FETCH_TIMEOUT);
      }
      return fetch(url, header)
      .then((response) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        if (response){
          resolve(response)
        }
        else reject(new Error('Response error'));
      })
      .catch(e => reject(new Error('Unable to reach this ip')))
    })
    return out
  }

  checkThisIp = (ip, fetch) => {
    if (!ip) ip = "0"
    let url = ""
    if (!ip.split("http://")[1])
      url = "http://" + ip + ':' + endpoints.PORT
    else
      url = ip
    return fetch(url + endpoints.ping).then(r => {
      if (r.status === 200 && r.ok && r._bodyText === "Jukebox") {
        this.props.setServerURL(url)
        return true
      }
      return false
    })
    .catch(e => {
      return false
    })
  }

  getServerIp = () => {
    this.setState({scanning: 1}, () => {
      NetworkInfo.getIPAddress(ip => {
        if (!ip) {
          this.setState({scanning: 0})
          Alert.alert("Wait", "Where is your internet conexion ?")
          return
        }
        const domaine = ip.split('.').slice(0, -1).join('.')
        const allChecks = []
        for (let i = 0; i < 256; i++) {
          const ip = domaine + '.' + i
          allChecks.push(this.checkThisIp(ip, fetch))
        }
        Promise.all(allChecks).then(values => {
          if (!values.some(value => value)) {
            this.setState({scanning: 0})
          }
        })
      });
    })
  }

  displayScanNetwork = () => {
    if (this.state.scanning === 1)
      return (
        <View style={styles.container}>
          <Pulse size={100} color={colors.main} />
          <Text style={styles.scanText}>SEARCHING{'\n'}YOUR{"\n"}JUKEBOX</Text>
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
    this.setState({scanning: 2}, () => {
      this.checkThisIp(this.state.inputIp, this.fetch_timeout).then(rep => {
        if (!rep) {
          Alert.alert("Sorry!", "the given IP is unreachable.")
          this.setState({scanning: 0})
        }
      })
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
          keyboardType='numeric'
          style={{width: 200, height: 50, fontSize: 17, textAlign: 'center'}}
          onSubmitEditing={() => this.tryThisIp(this.state.inputIp)}
          />
          {this.state.scanning === 2 ?
            <Pulse style={{marginLeft: 10}} size={45} color={colors.main} />
          :
            <Button style={{marginLeft: 10}} onPress={() => this.tryThisIp(this.state.inputIp)}
            text="Launch!"/>
          }
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
  },
  scanText: {
    textAlign: 'center',
    textAlignVertical: "center",
    top: -125,
    left: 0,
    fontStyle: 'italic',
    fontWeight: "bold",
    color: colors.background
  },
});

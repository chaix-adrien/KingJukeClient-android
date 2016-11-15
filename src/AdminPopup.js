/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
} from 'react-native';
import Button, {IconButton} from './Button'
import {Pulse} from 'react-native-loader';

const endpoints = require('../endpoint.json')
const colors = require('../colors.json')

export default class AdminPopup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      login: "",
      password: "",
      loading: false,
    }
  }

  tryThisCredentials = (usr, pass) => {
    this.setState({loading: true}, () => {
      const tmpCredentials = base64.encode(`${usr}:${pass}`)
      const header = new Headers()
      header.append("Authorization", "Basic " + tmpCredentials)
      header.append("method", "POST")
      fetch(this.props.apiURL + endpoints.admin + "log", {method: 'POST', headers : header})
      .then(e => {
        this.setState({loading: false}, () => {
          if (e.status !== 200)
            Alert.alert("Sorry", "Wrong credentials.")
          else
            this.props.goToAdminMode(true)
        })
      })
      .catch(e => {
        Alert.alert("Sorry", "Wrong credentials.")
        this.setState({loading: false})
      })
    })
  }

  render() {
    const {toSendTags} = this.state
    return (
      <View style={{padding: 10, alignItems: "center"}}>
        <Text style={styles.title}>Admin credentials</Text>
        <TextInput
        value={this.state.login}
        onChangeText={text => this.setState({login: text})}
        placeholder="login"
        style={styles.input}
        onSubmitEditing={() => this.passwordInput.focus()}
        />
        <TextInput
        ref={e => (this.passwordInput = e)}
        value={this.state.password}
        onChangeText={text => this.setState({password: text})}
        placeholder="password"
        style={styles.input}
        secureTextEntry={true}
        onSubmitEditing={() => this.tryThisCredentials(this.state.login, this.state.password)}
        />
        {this.state.loading ?
          <Pulse style={{marginLeft: 10}} size={30} color={colors.main} />
        :
          <Button text="Log-In" style={{marginTop: 10}} onPress={() => this.tryThisCredentials(this.state.login, this.state.password)} />
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    color: colors.main,
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    width: 200,
    height: 50,
    fontSize: 17,
    textAlign: 'left'
  },
})

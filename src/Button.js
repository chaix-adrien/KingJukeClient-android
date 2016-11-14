import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
const colors = require('../colors.json')
import Icon from 'react-native-vector-icons/FontAwesome';

export default class Button extends Component {
  render() {
    return (
      <TouchableOpacity
      style={[styles.button, this.props.style]}
      onPress={this.props.onPress}
      >
        <Text style={[{color: colors.textMain, fontSize: 17}, this.props.textStyle]}>{this.props.text}</Text>
      </TouchableOpacity>
    )
  }
}

export class IconButton extends Component {
  render() {
    return (
      <TouchableOpacity
      style={this.props.style}
      onPress={this.props.onPress}
      >
        <Icon name={this.props.name} size={this.props.size} color={this.props.color} />
      </TouchableOpacity>
    )
  }
}


const styles = StyleSheet.create({
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

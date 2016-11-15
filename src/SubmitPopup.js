import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from './Button'
import Icon from 'react-native-vector-icons/FontAwesome';
import ModalDropdown from 'react-native-modal-dropdown';

const colors = require('../colors.json')
const TAGMAX = 2

export default class SubmitPopup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toSendTags: Array.from({length: TAGMAX}, () => null)
    }
  }

  _onSelec = (id, sel, modalId) => {
    const newTags = this.state.toSendTags.slice(0)
    newTags[modalId] = parseInt(id) - 1
    if (newTags[modalId] === -1)
      {
        newTags[0] = null
        newTags[1] = null
      }
    this.setState({toSendTags: newTags})
    return true
  }

  _renderRow = (row, id) => {
    const tag = parseInt(id) - 1
    if (tag === -1) {
      return <Text style={[styles.tag, {color: "black", fontSize: 20}]}>None</Text>
    }
    return (
      <Text style={[styles.tag, {
        backgroundColor:this.props.tags[tag].color,
        color: this.props.tags[tag].textColor,
        fontSize: 20
      }]}>
        {row}
      </Text>
    )
  }

  _renderButton = (modalId) => {
    const {toSendTags} = this.state
    if (toSendTags[modalId] !== null) { return (
        <Text
        style={[styles.tag, {
          backgroundColor:this.props.tags[toSendTags[modalId]].color,
          color: this.props.tags[toSendTags[modalId]].textColor,
          fontSize: 20,
          margin: 5,
        }]}>
          {this.props.tags[toSendTags[modalId]].name}
        </Text>
      )
    } else { return (
      <View style={{flexDirection: "row", alignItems: "center", paddingLeft: 10}}>
        <Icon name="tag" size={20} color={colors.main} backgroundColor={colors.background} />
        <Text
          style={styles.selectText}
        >
          Select a tag
        </Text>
      </View>
    )}    
  }

  renderModal = (modalId) => {
    return (
        <ModalDropdown
        options={["none"].concat(this.props.tags).map(tag => tag.name)}
        dropdownStyle={{padding: 5, flex: 1}}
        onSelect={(i, sel) => this._onSelec(i, sel, modalId)}
        renderRow={this._renderRow}
        >
          {this._renderButton(modalId)}
        </ModalDropdown>
    )
  }

  render() {
    const {toSendTags} = this.state
    return (
      <View style={{padding: 10}}>
        <Text style={{fontSize: 25, color: colors.main, marginBottom: 5}}>Add some tags:</Text>
        {this.renderModal(0)}
        {toSendTags[0] !== null ?
          this.renderModal(1)
          : null
        }
        <Button style={{marginTop: 10}} text="Submit" onPress={() => this.props.submitSong(toSendTags)} />
      </View>
    )
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
  selectText: {
    paddingLeft: 5,
    color: colors.main,
    fontSize: 20,
    margin: 5,
    marginLeft: 10,
    fontStyle: 'italic'
  },
})

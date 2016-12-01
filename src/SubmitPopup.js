import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
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
      url: "",
      toSendTags: Array.from({length: TAGMAX}, () => null)
    }
  }

  _onSelec = (id, sel, modalId, tags) => {
    const newTags = this.state.toSendTags.slice(0)
    newTags[modalId] = sel
    if (parseInt(id) - 1 === -1) // if None was selected
      {
        newTags[0] = null
        newTags[1] = null
      }
    this.setState({toSendTags: newTags})
    return true
  }

  _getTag = (name) => {
    return this.props.tags.find(tag => tag.name === name)
  }

  _renderRow = (row, id) => {
    const tag = parseInt(id) - 1
    if (tag === -1) {
      return <Text style={[styles.tag, {color: "black", fontSize: 20}]}>None</Text>
    }
    return (
      <Text style={[styles.tag, {
        backgroundColor:this.props.tags[tag].color,
        color: "white",
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
          backgroundColor: this._getTag(toSendTags[modalId]).color,
          color: "white",
          fontSize: 20,
          margin: 5,
        }]}>
          {toSendTags[modalId]}
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

  renderModal = (modalId, tags) => {
    return (
        <ModalDropdown
        options={["none"].concat(tags).map(tag => tag.name)}
        dropdownStyle={{padding: 5, flex: 1}}
        onSelect={(i, sel) => this._onSelec(i, sel, modalId, tags)}
        renderRow={this._renderRow}
        >
          {this._renderButton(modalId)}
        </ModalDropdown>
    )
  }

  renderAllModal = () => {
    const {toSendTags} = this.state
    if (this.props.tags.length === 0) return null
    return (
      <View>
        <Text style={styles.titles}>Add some tags:</Text>
        {this.renderModal(0, this.props.tags)}
        {toSendTags[0] !== null ?
          this.renderModal(1, this.props.tags.filter((t, id) => t.name !== toSendTags[0]))
          : null
        }
      </View>
    )
  }

  getUrlField = () => {
    return (
      <View>
        <Text style={styles.titles}>Song url:</Text>
        <TextInput
        style={{fontSize: 10, height: 30, width: 200}}
        value={this.state.url}
        onChangeText={text => this.setState({url: text})}
        placeholder="https://www.youtube.com/..."
        />
      </View>
    )
  }

  render() {
    const {toSendTags} = this.state
    return (
      <View style={{padding: 10}}>
        {this.props.urlField ?
          this.getUrlField()
          : null
        }
        {this.renderAllModal()}
        <Button text="Submit" onPress={() => this.props.submitSong(toSendTags.filter(t => t), this.state.url)} />
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
  titles: {
    fontSize: 25,
    color: colors.main,
    marginBottom: 5
  },
})

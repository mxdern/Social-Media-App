import React, { Component, useState, useEffect } from "react";
import { Button, View, Text, StyleSheet, TextInput } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class Conversation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      chatMessage: "",
      chatMessages: props.route.params.item.messages,
      chatId: props.route.params.item.chatId,
      //lastMessage: props.route.params.item.messages;

      person: this.props.route.params.item.person[0],
    };
  }

  getUserInfo(email) {
    var data = {
      email: email,
    };

    var req = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      email: email,
    };

    fetch(
      `http://192.168.1.23:3000/user/mobile/email/${encodeURIComponent(
        data.email
      )}`,
      req
    )
      .then((response) => response.text())
      .then((result) => JSON.parse(result))
      .then((result) => {
        this.setState({ username: result.user.username });
      })
      .catch((error) => console.log("error", error));
  }

  getData = async () => {
    try {
      const value = await AsyncStorage.getItem("@logged_in_email");
      this.getUserInfo(value);

      if (value !== null) {
        // value previously stored
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  componentDidMount() {
    this.getData();
    this.props.navigation.setOptions({
      headerTitle: this.state.person,
    });
    this.socket = io("http://192.168.1.23:3000");
    /*this.socket.on("chat message", (msg) => {
      this.setState({ chatMessages: [...this.state.chatMessages, msg] });
    });*/
  }

  submitMessage() {
    //this.socket.emit("chat message", this.state.chatMessage);

    const messageObject = [
      this.state.chatId,
      this.state.username,
      this.state.chatMessage,
    ];

    var req = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageObject: messageObject,
      }),
    };

    fetch("http://192.168.1.23:3000/mobile/sendMessage", req)
      .then((response) => response.text())
      .then((result) => JSON.parse(result))
      .then((result) => {
        console.log(this.state.chatMessages);
        console.log(result);

        this.setState((prevState) => ({
          chatMessages: [...prevState.chatMessages, result],
        }));
      })

      .catch((error) => console.log("error", error));

    this.setState({ chatMessage: "" });
  }

  render() {
    const chatMessages = this.state.chatMessages.map((item) => (
      <View
        style={[
          item.sender == this.state.person ? styles.notMine : styles.mine,
        ]}
      >
        <Text
          style={
            item.sender == this.state.person
              ? styles.notMineText
              : styles.mineText
          }
          key={item.text}
        >
          {item.text}
        </Text>
      </View>
    ));

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView>{chatMessages}</ScrollView>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              marginBottom: 36,
            }}
          ></View>
          <View style={{ flexDirection: "row", margin: 15 }}>
            <TextInput
              placeholder="enter a message"
              style={styles.textInput}
              value={this.state.chatMessage}
              onChangeText={(chatMessage) => {
                this.setState({ chatMessage });
              }}
            />
            <Button
              style={{ flex: 1 }}
              title="Submit"
              onPress={() => this.submitMessage()}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    fontSize: 18,
    margin: 5,
    flex: 4,

    borderBottomColor: "lightgrey",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 26,
    margin: 10,
    fontWeight: "700",
    color: "#393939",
  },

  mine: {
    backgroundColor: "#00ce47",
    borderRadius: 10,
    margin: 5,
    padding: 10,
    alignSelf: "flex-end",
    maxWidth: 250,
  },

  notMine: {
    backgroundColor: "#ebebeb",
    borderRadius: 10,
    margin: 5,
    padding: 10,
    alignSelf: "flex-start",
    maxWidth: 250,
  },
  mineText: {
    fontSize: 20,
    color: "white",
  },
  notMineText: {
    fontSize: 20,
    color: "black",
  },
});

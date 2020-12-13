import React, { Component, useState, useEffect } from "react";
import {
  Button,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default class ChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      conversations: "",
      person: "",
      email: "",
    };
  }

  createConversation() {
    var req = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: this.state.email,
        username: this.state.person,
      }),
    };

    fetch("http://192.168.1.23:3000/mobile/addChat", req)
      .then((response) => response.text())
      .then((result) => JSON.parse(result))
      .then(() => {
        this.getData();
      })
      .catch((error) => console.log("error", error));

    this.setState({ person: "" });
  }

  getConversations(value) {
    var req = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: value,
      }),
    };

    fetch("http://192.168.1.23:3000/mobile/showMyChats", req)
      .then((response) => response.text())
      .then((result) => JSON.parse(result))
      .then((result) => {
        this.setState({ conversations: result.data });
      })
      .catch((error) => console.log("error", error));
  }

  getData = async () => {
    try {
      const value = await AsyncStorage.getItem("@logged_in_email");
      this.setState({ email: value });
      this.getConversations(value);

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
    this.focusSubscription = this.props.navigation.addListener("focus", () => {
      this.getData();
    });
  }

  render() {
    return (
      <View>
        <FlatList
          data={this.state.conversations}
          ListHeaderComponent={
            <View style={{ margin: 10 }}>
              <Text style={styles.title}>Start a new conversation</Text>
              <View
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  margin: 20,
                  flexDirection: "row",
                }}
              >
                <TextInput
                  placeholder="enter the username"
                  style={styles.textInput}
                  value={this.state.person}
                  onChangeText={(person) => this.setState({ person: person })}
                />

                <View
                  style={{
                    margin: 20,
                    alignItems: "center",
                    borderRadius: 15,
                    borderColor: "#B39E8D",
                    borderWidth: 3,
                    padding: 5,
                  }}
                >
                  <TouchableOpacity onPress={() => this.createConversation()}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#393939",
                      }}
                    >
                      SEND
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.title}>Current Conversations</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ marginHorizontal: 10 }}
              onPress={() =>
                this.props.navigation.navigate("Conversation", { item })
              }
            >
              <LinearGradient
                start={[0, 1]}
                end={[1, 0]}
                style={{
                  flexDirection: "row",
                  backgroundColor: "#f5a140",
                  margin: 15,
                  padding: 15,
                  borderRadius: 10,
                  width: 340,
                }}
                colors={["#fc4a1a", "#fd805e"]}
              >
                <Text style={{ fontSize: 23, color: "white" }}>
                  {item.person}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => JSON.stringify(item.person)}
          extraData={this.state}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  textInput: {
    fontSize: 18,
    margin: 5,
    width: 250,

    borderBottomColor: "lightgrey",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 26,
    margin: 10,
    fontWeight: "700",
    color: "#393939",
  },
});
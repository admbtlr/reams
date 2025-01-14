import "./wdyr";
import "react-native-gesture-handler";

import { Platform, Text, View } from "react-native";
import React from "react";
import { registerRootComponent } from "expo";
import Rizzle from "./components/Rizzle";

if (Platform.OS === "web") {

  const HelloWorld = () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hello world!</Text>
    </View>
  );

  registerRootComponent(Rizzle);
}

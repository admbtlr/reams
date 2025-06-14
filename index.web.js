import "./wdyr";
import "react-native-gesture-handler";

import { registerRootComponent } from "expo";
import Rizzle from "./components/Rizzle";

// contains some css to stop overscroll
import './global.css'

registerRootComponent(Rizzle);

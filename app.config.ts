import { ExpoConfig } from "expo/config"
import { withSentry } from "@sentry/react-native/expo"

const config: ExpoConfig = {
  name: "Reams",
  slug: "reams",
}

export default withSentry(config, {
  url: "https://sentry.io/",
  // Use SENTRY_AUTH_TOKEN env to authenticate with Sentry.
  project: "reams",
  organization: "adam-butler",
})
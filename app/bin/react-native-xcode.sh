#!/bin/bash
# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
# Bundle React Native app's code and image assets.
# This script is supposed to be invoked as part of Xcode build process
# and relies on environment variables (including PWD) set by Xcode

# Print commands before executing them (useful for troubleshooting)
set -x
DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH
MAIN_BUNDLE="main.jsbundle"
BUNDLE_FILE="$DEST/$MAIN_BUNDLE"
TMP_PATH="/tmp"
PLISTBUDDY='/usr/libexec/PlistBuddy'
PLIST=$TARGET_BUILD_DIR/$INFOPLIST_PATH

[ -z "$SKIP_BUNDLING" ] && SKIP_BUNDLING=$($PLISTBUDDY -c "Print :BundleSkipped" "${PLIST}")
[ -z "$CP_BUNDLING" ] && CP_BUNDLING=$($PLISTBUDDY -c "Print :BundleCopied" "${PLIST}")

# Enables iOS devices to get the IP address of the machine running Metro Bundler
if [[ "$CONFIGURATION" = *Debug* && ! "$PLATFORM_NAME" == *simulator ]]; then
  IP=$(ipconfig getifaddr en0)
  if [ -z "$IP" ]; then
    IP=$(ipconfig getifaddr en1)
  fi
  if [ -z "$IP" ]; then
    IP=$(ifconfig | grep 'inet ' | grep -v ' 127.' | grep -v ' 169.254.' |cut -d\   -f2  | awk 'NR==1{print $1}')
  fi

  echo "$IP" > "$DEST/ip.txt"
fi

if [[ "$SKIP_BUNDLING" ]]; then
  echo "SKIP_BUNDLING enabled; skipping."
  if [[ "$CP_BUNDLING" && $CP_BUNDLING == "true" ]]; then
    TMP_BUNDLE="$TMP_PATH/$MAIN_BUNDLE"
    echo "CP_BUNDLING enabled; copying $TMP_BUNDLE to $DEST/"
    if [ -f "$TMP_BUNDLE" ]; then
      cp "$TMP_PATH/$MAIN_BUNDLE"* "$DEST/"
    else
      echo "CP_BUNDLING $TMP_BUNDLE does not exist!"
    fi
  fi
  exit 0;
fi

[ -z "$IS_DEV" ] && IS_DEV=$($PLISTBUDDY -c "Print :BundleDev" "${PLIST}")
[ -z "$FORCE_BUNDLING" ] && FORCE_BUNDLING=$($PLISTBUDDY -c "Print :BundleForced" "${PLIST}")

if [ -z "$IS_DEV" ]; then
  case "$CONFIGURATION" in
    *Debug*)
      if [[ "$PLATFORM_NAME" == *simulator ]]; then
        if [[ "$FORCE_BUNDLING" ]]; then
          echo "FORCE_BUNDLING enabled; continuing to bundle."
        else
          echo "Skipping bundling in Debug for the Simulator (since the packager bundles for you). Use the FORCE_BUNDLING flag to change this behavior."
          exit 0;
        fi
      else
        echo "Bundling for physical device. Use the SKIP_BUNDLING flag to change this behavior."
      fi

      DEV=true
      ;;
    "")
      echo "$0 must be invoked by Xcode"
      exit 1
      ;;
    *)
      DEV=false
      ;;
  esac
else
  if [[ "$PLATFORM_NAME" == *simulator ]]; then
    if [[ "$FORCE_BUNDLING" && $FORCE_BUNDLING == "true" ]]; then
      echo "FORCE_BUNDLING enabled; continuing to bundle."
    else
      echo "Skipping bundling in Debug for the Simulator (since the packager bundles for you). Use the FORCE_BUNDLING flag to change this behavior."
      exit 0;
    fi
  else
    echo "Bundling for physical device. Use the SKIP_BUNDLING flag to change this behavior."
  fi
  DEV=$IS_DEV
fi

# Path to react-native folder inside node_modules
# REACT_NATIVE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Path to react-native folder from inside src/bin
REACT_NATIVE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../node_modules/react-native" && pwd)"
echo "REACT_NATIVE_DIR: $REACT_NATIVE_DIR"

# The project should be located next to where react-native is installed
# in node_modules.
PROJECT_ROOT=${PROJECT_ROOT:-"$REACT_NATIVE_DIR/../.."}

cd "$PROJECT_ROOT" || exit

# Define NVM_DIR and source the nvm.sh setup script
[ -z "$NVM_DIR" ] && export NVM_DIR="$HOME/.nvm"

# Define default ENTRY_FILENAME
[ -z "$ENTRY_FILENAME" ] && ENTRY_FILENAME=$($PLISTBUDDY -c "Print :BundleEntryFilename" "${PLIST}")
[ -z "$ENTRY_FILENAME" ] && ENTRY_FILENAME="index.js"
echo "ENTRY_FILENAME: $ENTRY_FILENAME"

js_file_type=.js
ios_file_type=.ios.js
ios_file_name="${ENTRY_FILENAME/$js_file_type/$ios_file_type}"

# Define entry file
if [[ -s $ios_file_name ]]; then
  ENTRY_FILE=${1:-$ios_file_name}
else
  ENTRY_FILE=${1:-$ENTRY_FILENAME}
fi

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  . "$HOME/.nvm/nvm.sh"
elif [[ -x "$(command -v brew)" && -s "$(brew --prefix nvm)/nvm.sh" ]]; then
  . "$(brew --prefix nvm)/nvm.sh"
fi

# Set up the nodenv node version manager if present
if [[ -x "$HOME/.nodenv/bin/nodenv" ]]; then
  eval "$("$HOME/.nodenv/bin/nodenv" init -)"
elif [[ -x "$(command -v brew)" && -x "$(brew --prefix nodenv)/bin/nodenv" ]]; then
  eval "$("$(brew --prefix nodenv)/bin/nodenv" init -)"
fi

# Set up the ndenv of anyenv if preset
if [[ ! -x node && -d ${HOME}/.anyenv/bin ]]; then
  export PATH=${HOME}/.anyenv/bin:${PATH}
  if [[ "$(anyenv envs | grep -c ndenv )" -eq 1 ]]; then
    eval "$(anyenv init -)"
  fi
fi

# check and assign NODE_BINARY env
# shellcheck source=/dev/null
source "$REACT_NATIVE_DIR/scripts/node-binary.sh"

[ -z "$NODE_ARGS" ] && export NODE_ARGS=""

[ -z "$CLI_PATH" ] && export CLI_PATH="$REACT_NATIVE_DIR/cli.js"

[ -z "$BUNDLE_COMMAND" ] && BUNDLE_COMMAND="bundle"

if [[ -z "$BUNDLE_CONFIG" ]]; then
  CONFIG_ARG=""
else
  CONFIG_ARG="--config $BUNDLE_CONFIG"
fi

"$NODE_BINARY" $NODE_ARGS "$CLI_PATH" $BUNDLE_COMMAND \
  $CONFIG_ARG \
  --entry-file "$ENTRY_FILE" \
  --platform ios \
  --dev $DEV \
  --reset-cache \
  --bundle-output "$BUNDLE_FILE" \
  --assets-dest "$DEST" \
  $EXTRA_PACKAGER_ARGS

if [[ $DEV != true && ! -f "$BUNDLE_FILE" ]]; then
  echo "error: File $BUNDLE_FILE does not exist. This must be a bug with" >&2
  echo "React Native, please report it here: https://github.com/facebook/react-native/issues"
  exit 2
else
  cp "$BUNDLE_FILE"* $TMP_PATH
  if [[ $DEV == "true" ]]; then
    if nc -w 5 -z localhost 8081 ; then
      if ! curl -s "http://localhost:8081/status" | grep -q "packager-status:running"; then
        echo "Port 8081 already in use, packager is either not running or not running correctly"
        exit 0
      fi
    else
      open "$REACT_NATIVE_DIR/scripts/launchPackager.command" || echo "Can't start packager automatically"
    fi
  fi
fi

/**
 * Expo config plugin that adds `ios/webview` to the iOS app bundle as a
 * folder reference (the equivalent of dragging the folder into Xcode with
 * "Create folder references"). This replaces the manual Xcode step and
 * survives `expo prebuild`.
 *
 * The article WebView loads these files relative to the app bundle
 * (e.g. `webview/css/output.css`, `webview/js/feed-item.js`) — see
 * components/Item/ItemBody.tsx. On Android the same files live in
 * `android/app/src/main/assets/webview` and are synced by the gulpfile,
 * which prebuild does not touch, so no Android handling is needed here.
 */
const { withXcodeProject } = require('@expo/config-plugins');

const withWebviewAssets = (config) => {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const objects = project.hash.project.objects;
    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    const mainGroupUuid = mainGroup.value || mainGroup;
    const targetUuid = project.getFirstTarget().uuid;

    // Idempotent: skip if the folder reference already exists.
    const alreadyAdded = Object.values(objects.PBXFileReference).some(
      (file) => file.lastKnownFileType === 'folder' && file.path === 'webview'
    );
    if (alreadyAdded) {
      return config;
    }

    const fileRefUuid = project.generateUuid();
    const buildFileUuid = project.generateUuid();

    // PBXFileReference with lastKnownFileType "folder" = blue folder
    // reference in Xcode; preserves the webview/ directory in the bundle.
    objects.PBXFileReference[fileRefUuid] = {
      isa: 'PBXFileReference',
      lastKnownFileType: 'folder',
      name: 'webview',
      path: 'webview',
      // The xcode writer does not quote values, so quote "<group>" manually
      // to keep the pbxproj a valid OpenStep plist.
      sourceTree: '"<group>"',
    };
    objects.PBXBuildFile[buildFileUuid] = {
      isa: 'PBXBuildFile',
      fileRef: fileRefUuid,
    };
    objects.PBXGroup[mainGroupUuid].children.push({
      value: fileRefUuid,
      comment: 'webview',
    });
    project
      .pbxResourcesBuildPhaseObj(targetUuid)
      .files.push({ value: buildFileUuid, comment: 'webview in Resources' });

    return config;
  });
};

module.exports = withWebviewAssets;

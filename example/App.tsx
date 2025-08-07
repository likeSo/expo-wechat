import React, { useState, useCallback } from "react";
import { useEvent } from "expo";
import ExpoWechat from "expo-wechat";
import {
  Button,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [textToShare, setTextToShare] = useState("");
  const [miniProgramId, setMiniProgramId] = useState("");
  const [miniProgramPath, setMiniProgramPath] = useState("");

  const [miniPrgramIdToLaunch, setMiniPrgramIdToLaunch] = useState("");

  const onAuthResult = useEvent(ExpoWechat, "onAuthResult");
  const wechatAppId = process.env.EXPO_PUBLIC_WECHAT_APP_ID;
  const universalLink = process.env.EXPO_PUBLIC_UNIVERSAL_LINK;
  const isParametersValid = Boolean(wechatAppId) && Boolean(universalLink);

  const initializeSDK = useCallback(async () => {
    if (!isParametersValid) {
      return;
    }
    const result = await ExpoWechat.registerApp(wechatAppId, universalLink);
    setInitialized(result);
  }, [wechatAppId, universalLink, isParametersValid]);

  const onWeChatLogin = useCallback(async () => {
    if (!initialized) {
      return;
    }
    const result = await ExpoWechat.sendAuthRequest("snsapi_userinfo", "123");
    console.log("Send auth request result:", result);
  }, [initialized]);

  const onShareText = useCallback(async () => {
    if (!initialized) {
      return;
    }
    if (!textToShare) {
      alert("请输入要分享的文字！");
      return;
    }
    const result = await ExpoWechat.shareText(textToShare, "timeline");
    console.log("Share to wechat timeline result:", result);
  }, [initialized, textToShare]);

  const onShareImage = useCallback(async () => {
    const shareImage = async (source: "camera" | "album") => {
      let image: ImagePicker.ImagePickerResult;
      if (source === "camera") {
        image = await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
        });
      } else {
        image = await ImagePicker.launchImageLibraryAsync({
          selectionLimit: 1,
          mediaTypes: "images",
        });
      }
      if (!image.canceled) {
        const result = await ExpoWechat.shareImage({
          base64OrImageUri: image.assets[0].uri,
          scene: "timeline",
        });
        console.log("Share to wechat timeline result:", result);
      }
    };

    if (!initialized) {
      return;
    }
    Alert.alert("选择图片来分享", "请选择要分享的图片", [
      {
        text: "相册选图",
        onPress: () => shareImage("album"),
      },
      {
        text: "相机拍照",
        onPress: () => shareImage("camera"),
      },
      {
        text: "取消",
        style: "cancel",
      },
    ]);
  }, []);

  const onShareVideo = useCallback(async () => {
    const shareImage = async (source: "camera" | "album") => {
      let video: ImagePicker.ImagePickerResult;
      if (source === "camera") {
        video = await ImagePicker.launchCameraAsync({
          mediaTypes: "videos",
        });
      } else {
        video = await ImagePicker.launchImageLibraryAsync({
          selectionLimit: 1,
          mediaTypes: "videos",
        });
      }
      if (!video.canceled) {
        const result = await ExpoWechat.shareVideo({
          videoUri: video.assets[0].uri,
          scene: "timeline",
          title: "测试视频分享",
          description: "这是一个测试视频分享",
        });
        console.log("Share to wechat timeline result:", result);
      }
    };

    if (!initialized) {
      return;
    }
    Alert.alert("选择图片来分享", "请选择要分享的图片", [
      {
        text: "相册选图",
        onPress: () => shareImage("album"),
      },
      {
        text: "相机拍照",
        onPress: () => shareImage("camera"),
      },
      {
        text: "取消",
        style: "cancel",
      },
    ]);
  }, []);

  const onShareWebpage = useCallback(async () => {
    if (!initialized) {
      return;
    }
    const result = await ExpoWechat.shareWebpage({
      url: "https://www.baidu.com",
      scene: "timeline",
    });
    console.log("Share to wechat timeline result:", result);
  }, []);

  const onShareMiniProgram = useCallback(async () => {
    if (!initialized) {
      return;
    }
    const result = await ExpoWechat.shareMiniProgram({
      id: miniProgramId,
      path: miniProgramPath,
      scene: "timeline",
      type: "release",
    });
    console.log("Share to wechat timeline result:", result);
  }, [miniProgramId, miniProgramPath]);

  const onLaunchMiniProgram = useCallback(() => {
    if (!initialized) {
      return;
    }
    const result = ExpoWechat.launchMiniProgram({
      id: miniPrgramIdToLaunch,
      type: "release",
    });
    console.log("Share to wechat timeline result:", result);
  }, [miniPrgramIdToLaunch]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <Group title="初始化微信SDK">
        <Text>微信App ID: {wechatAppId}</Text>
        <Text>通用链接: {universalLink}</Text>
        <Text>
          {isParametersValid
            ? "参数存在，请进行初始化。"
            : "参数不足，请在.env文件中配置微信应用ID和通用链接。"}
        </Text>
        {initialized && <Text>微信SDK已初始化成功，请体验以下功能！</Text>}
        {!initialized && (
          <Button title="初始化微信SDK" onPress={initializeSDK} />
        )}
      </Group>
      <Group title="微信登录">
        <Button title="点击登录" onPress={onWeChatLogin} />
        <Text>
          微信登陆结果：{"\n"}
          {JSON.stringify(onAuthResult, null, 2)}
        </Text>
      </Group>
      <Group title="分享文字">
        <TextInput
          placeholder="请输入要分享到微信的文字"
          value={textToShare}
          onChangeText={setTextToShare}
          multiline
          style={styles.textInput}
        />
        <Button title="点击分享" onPress={onShareText} />
      </Group>
      <Group title="分享图片">
        <Button title="点击选择图片并分享" onPress={onShareImage} />
      </Group>
      <Group title="分享视频">
        <Button title="点击选择视频并分享" onPress={onShareVideo} />
      </Group>
      <Group title="分享网页">
        <Button title="点击分享网页到微信" onPress={onShareWebpage} />
      </Group>
      <Group title="分享小程序">
        <TextInput
          placeholder="小程序ID"
          clearButtonMode="while-editing"
          keyboardType="numeric"
          value={miniProgramId}
          onChangeText={setMiniProgramId}
          style={styles.textInput}
        />
        <TextInput
          placeholder="小程序ID"
          clearButtonMode="while-editing"
          keyboardType="numeric"
          value={miniProgramPath}
          onChangeText={setMiniProgramPath}
          style={styles.textInput}
        />
        <Button title="点击分享网页到微信" onPress={onShareMiniProgram} />
      </Group>
      <Group title="启动小程序">
        <TextInput
          placeholder="小程序ID"
          clearButtonMode="while-editing"
          keyboardType="numeric"
          value={miniPrgramIdToLaunch}
          onChangeText={setMiniPrgramIdToLaunch}
          style={styles.textInput}
        />
        <Button title="启动小程序" onPress={onLaunchMiniProgram} />
      </Group>
    </ScrollView>
  );
}

type GroupProps = {
  title: string;
  children: React.ReactNode;
};

const Group: React.FC<GroupProps> = React.memo((props) => {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{props.title}</Text>
      {props.children}
    </View>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    paddingTop: 84,
  },

  group: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  textInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
    height: 40,
    alignSelf: "stretch",
  },
});

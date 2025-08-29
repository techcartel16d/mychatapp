import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video'; // 👈 add this for video support

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState('');

  useEffect(() => {
    setMessages([{
      _id: 1,
      text: 'Hello shivam 👋, send file/image/video here!',
      createdAt: new Date(),
      user: { _id: 2, name: 'Admin', avatar: 'https://placeimg.com/140/140/any' },
    }]);
  }, []);

  const onSend = useCallback((newMessages = []) => {
    setMessages(prev => GiftedChat.append(prev, newMessages));
    setChat('');
  }, []);

  const pickDocument = async () => {
    try {
      const [res] = await pick({ type: [types.allFiles] });
      const [local] = await keepLocalCopy({
        files: [{ uri: res.uri, fileName: res.name ?? 'file' }],
        destination: 'documentDirectory',
      });
      setMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random(),
        text: `📄 File: ${res.name}`,
        createdAt: new Date(),
        user: { _id: 1, name: 'You' },
        file: local.uri || res.uri,
      }]));
    } catch (err) {
      console.log('Picker canceled or error:', err);
    }
  };

  const pickMedia = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed' });
    if (result.assets && result.assets.length) {
      const file = result.assets[0];
      setMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random(),
        text: file.type.startsWith('video')
          ? `🎥 Video: ${file.fileName || 'Selected'}`
          : undefined,
        image: file.type.startsWith('image') ? file.uri : undefined,
        video: file.type.startsWith('video') ? file.uri : undefined,
        createdAt: new Date(),
        user: { _id: 1, name: 'You' },
      }]));
    }
  };

  const renderCustomActions = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity onPress={pickDocument} style={styles.actionBtn}>
        <Icon name="attach-file" size={24} color="#4a90e2" />
      </TouchableOpacity>
      <TouchableOpacity onPress={pickMedia} style={styles.actionBtn}>
        <Icon name="photo" size={24} color="#4a90e2" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GiftedChat
      messages={messages}
      text={chat}
      onInputTextChanged={setChat}
      onSend={onSend}
      user={{ _id: 1, name: 'You' }}
      renderActions={renderCustomActions}
      alwaysShowSend
      showUserAvatar
      renderAvatarOnTop={false}  // avatar ko bubble ke upar mat dikhao
      renderUsernameOnMessage={false} // 👈 naam bhi hide ho jayega

      /* ---- Custom Message Bubble ---- */
      renderBubble={props => {
        const { currentMessage } = props;
        const isFile = currentMessage?.text?.startsWith("📄 File:");
        const isVideo = currentMessage?.text?.startsWith("🎥 Video:");

        return (
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: isFile ? 'pink' : isVideo ? '#ffe0b2' : 'lightblue',
                padding: isFile || isVideo ? 4 : 8,
                borderRadius: 16,
                marginBottom: 5,
                marginRight: 4,
              },
              left: {
                backgroundColor: isFile ? 'yellow' : '#f0f0f0',
                padding: isFile ? 10 : 8,
                borderRadius: 16,
                marginBottom: 5,
              },
            }}
            textStyle={{
              right: { color: isFile || isVideo ? '#333' : '#fff', fontSize: 15, fontWeight: '500' },
              left: { color: '#333', fontSize: 15 },
            }}
            timeTextStyle={{
              right: { color: '#e0e0e0', fontSize: 11 },
              left: { color: '#666', fontSize: 11 },
            }}
          />
        );
      }}

      /* ---- Custom Video Message ---- */
      renderMessageVideo={({ currentMessage }) => (
        <View style={{ borderRadius: 12, overflow: 'hidden', margin: 5 }}>
          <Video
            source={{ uri: currentMessage.video }}
            style={{ width: 250, height: 160, borderRadius: 12 }}
            resizeMode="cover"
            controls
          />
        </View>
      )}

      /* ---- Input Toolbar ---- */
      renderInputToolbar={props => (
        <InputToolbar
          {...props}
          containerStyle={styles.inputToolbar}
          primaryStyle={{ alignItems: 'center' }}
        />
      )}

      /* ---- Send Button ---- */
      renderSend={props => (
        <Send {...props}>
          <View style={styles.sendBtn}>
            <Icon name="send" size={22} color="#fff" />
          </View>
        </Send>
      )}
    />
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  actionBtn: {
    marginRight: 10,
    backgroundColor: '#e6f0ff',
    padding: 6,
    borderRadius: 20,
  },
  inputToolbar: {
    borderTopWidth: 0,
    marginVertical: 4,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sendBtn: {
    marginRight: 10,
    marginBottom: 5,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    padding: 8,
  },
});

export default ChatScreen;

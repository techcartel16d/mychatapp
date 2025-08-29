import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from "../components/Header"
import {screenWidth} from "../utils/Context"
const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    setMessages([{
      _id: 1,
      text: 'Hello shivam 👋, send file/image/video here!',
      createdAt: new Date(),
      user: { _id: 2, name: 'Admin' },
    }]);
  }, []);

  const onSend = () => {
    if (!chat.trim()) return;
    const newMessage = {
      _id: Math.random(),
      text: chat,
      createdAt: new Date(),
      user: { _id: 1, name: 'You' },
    };
    setMessages(prev => [...prev, newMessage]);
    setChat('');
    scrollToEnd();
  };

  const scrollToEnd = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const pickDocument = async () => {
    try {
      const [res] = await pick({ type: [types.allFiles] });
      const [local] = await keepLocalCopy({
        files: [{ uri: res.uri, fileName: res.name ?? 'file' }],
        destination: 'documentDirectory',
      });
      setMessages(prev => [...prev, {
        _id: Math.random(),
        text: `📄 File: ${res.name}`,
        createdAt: new Date(),
        user: { _id: 1, name: 'You' },
        file: local.uri || res.uri,
      }]);
      scrollToEnd();
    } catch (err) {
      console.log('Picker canceled or error:', err);
    }
  };

  const pickMedia = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed' });
    if (result.assets && result.assets.length) {
      const file = result.assets[0];
      setMessages(prev => [...prev, {
        _id: Math.random(),
        text: file.type.startsWith('video')
          ? `🎥 Video: ${file.fileName || 'Selected'}`
          : undefined,
        image: file.type.startsWith('image') ? file.uri : undefined,
        video: file.type.startsWith('video') ? file.uri : undefined,
        createdAt: new Date(),
        user: { _id: 1, name: 'You' },
      }]);
      scrollToEnd();
    }
  };

  const renderMessage = ({ item }) => {
    const isFile = item.text?.startsWith("📄 File:");
    const isVideo = item.text?.startsWith("🎥 Video:");
    return (
      <View
        style={[
          styles.bubble,
          item.user._id === 1 ? styles.bubbleRight : styles.bubbleLeft,
          isFile ? { backgroundColor: item.user._id === 1 ? 'pink' : 'yellow' } : {},
          isVideo ? { backgroundColor: item.user._id === 1 ? '#ffe0b2' : '#f0f0f0' } : {},
        ]}
      >
        {item.text ? <Text style={{ color: item.user._id === 1 ? '#000' : '#333' }}>{item.text}</Text> : null}
        {item.image && (
          <TouchableOpacity onPress={() => { }}>
            <Video
              source={{ uri: item.image }}
              style={{ width: 250, height: 160, borderRadius: 12 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        {item.video && (
          <Video
            source={{ uri: item.video }}
            style={{ width: 250, height: 160, borderRadius: 12 }}
            resizeMode="cover"
            controls
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex:1}}>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={scrollToEnd}
        />

        {/* ---- Custom Input Toolbar ---- */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickDocument} style={styles.iconBtn}>
            <Icon name="attach-file" size={24} color="#4a90e2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickMedia} style={styles.iconBtn}>
            <Icon name="photo" size={24} color="#4a90e2" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={chat}
            onChangeText={setChat}
            placeholder="Type a message"
          />
          <TouchableOpacity onPress={onSend} style={styles.sendBtn}>
            <Icon name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: 8,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: '80%',
  },
  bubbleRight: {
    backgroundColor: 'lightblue',
    alignSelf: 'flex-end',
  },
  bubbleLeft: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  iconBtn: {
    marginHorizontal: 4,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#e6f0ff',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sendBtn: {
    marginHorizontal: 4,
    backgroundColor: '#4a90e2',
    padding: screenWidth * 1.5,
    borderRadius: 20,
  },
});

export default ChatScreen;

import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../firebase/config'; // Kita tidak mengimpor 'storage' lagi
import MessageBubble from '../components/MessageBubble';

export default function ChatScreen({ route }) {
  const { recipient } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const typingDocRef = doc(db, 'typingIndicators', recipient.uid);
    const unsubscribe = onSnapshot(typingDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsRecipientTyping(data.isTyping && data.typingTo === currentUser.uid);
      } else {
        setIsRecipientTyping(false);
      }
    });
    return () => unsubscribe();
  }, [recipient.uid]);

  const handleTextChange = async (text) => {
    setInputText(text);
    const typingDocRef = doc(db, 'typingIndicators', currentUser.uid);
    await setDoc(typingDocRef, {
      isTyping: text.length > 0,
      typingTo: recipient.uid
    }, { merge: true });
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    
    await setDoc(doc(db, 'typingIndicators', currentUser.uid), { isTyping: false }, { merge: true });

    await addDoc(collection(db, 'messages'), {
      type: 'text',
      text,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      timestamp: serverTimestamp(),
    });
  };

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return alert('Akses galeri ditolak!');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (result.canceled) return;

    setUploading(true);
    try {
      const mockImageUrls = [
        'https://picsum.photos/id/237/300/200',
        'https://picsum.photos/id/1025/300/200',
        'https://picsum.photos/id/1062/300/200' 
      ];
      const randomUrl = mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)];

      await addDoc(collection(db, 'messages'), {
        type: 'image',
        imageUrl: randomUrl, 
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      alert('Gagal mengirim gambar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isMyMessage={item.senderId === currentUser.uid} />
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {isRecipientTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{recipient.name} sedang mengetik...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={pickAndUploadImage} style={styles.imageBtn} disabled={uploading}>
          {uploading ? <ActivityIndicator size="small" color="#075E54" /> : <Text style={styles.imageBtnText}>📷</Text>}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={handleTextChange}
          placeholder="Ketik pesan..."
          onSubmitEditing={sendMessage}
        />
        
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5DDD5' },
  inputRow: { flexDirection: 'row', padding: 8, backgroundColor: '#FFF', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, fontSize: 16, maxHeight: 100, marginRight: 8 },
  sendBtn: { backgroundColor: '#075E54', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  sendText: { color: '#FFF', fontWeight: 'bold' },
  imageBtn: { paddingHorizontal: 10, marginRight: 4 },
  imageBtnText: { fontSize: 22 },
  typingContainer: { paddingHorizontal: 15, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.7)' },
  typingText: { fontSize: 12, fontStyle: 'italic', color: '#555' }
});
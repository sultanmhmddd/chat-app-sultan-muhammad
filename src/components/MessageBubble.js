import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function MessageBubble({ message, isMyMessage }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isMyMessage ? styles.myAlign : styles.otherAlign]}>
      <View style={[styles.bubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
        {!isMyMessage && <Text style={styles.senderName}>{message.senderName}</Text>}
        
        {message.type === 'image' ? (
          <Image source={{ uri: message.imageUrl }} style={styles.chatImage} />
        ) : (
          <Text style={styles.messageText}>{message.text}</Text>
        )}
        
        <Text style={[styles.timestamp, isMyMessage ? styles.myTime : styles.otherTime]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginVertical: 4, paddingHorizontal: 10 },
  myAlign: { alignItems: 'flex-end' },
  otherAlign: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 12 },
  myBubble: { backgroundColor: '#DCF8C6', borderTopRightRadius: 0 },
  otherBubble: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 0, borderWidth: 0.5, borderColor: '#E0E0E0' },
  senderName: { fontSize: 11, fontWeight: 'bold', color: '#075E54', marginBottom: 2 },
  messageText: { fontSize: 15, color: '#333' },
  chatImage: { width: 200, height: 150, borderRadius: 8, marginVertical: 4 },
  timestamp: { fontSize: 9, textAlign: 'right', marginTop: 4 },
  myTime: { color: '#555' },
  otherTime: { color: '#999' },
});
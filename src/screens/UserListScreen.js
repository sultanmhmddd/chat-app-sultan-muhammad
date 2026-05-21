import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';

export default function UserListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(collection(db, 'users'), where('uid', '!=', auth.currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => doc.data());
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      console.error("Error ambil data Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#075E54" /></View>;
  }

  return (
    <View style={styles.container}>
      {users.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Belum ada kontak lain terdaftar.</Text>
          <Text style={styles.subEmptyText}>Silakan daftarkan akun kedua via Register.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userCard} 
              onPress={() => navigation.navigate('Chat', { recipient: item })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name ? item.name[0].toUpperCase() : 'U'}</Text>
              </View>
              <Text style={styles.userName}>{item.name || item.email}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  userCard: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#075E54', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  userName: { fontSize: 16, fontWeight: '500' },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#555', textAlign: 'center' },
  subEmptyText: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 5 },
  logoutBtn: { backgroundColor: '#D32F2F', padding: 15, margin: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#FFF', fontWeight: 'bold' }
});